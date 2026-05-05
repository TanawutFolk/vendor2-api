import { MySQLExecute } from '@businessData/dbExecute'
import { ApprovalQueueSQL } from '../../sql/_approval-queue/ApprovalQueueSQL'
import { RowDataPacket } from 'mysql2'
import {
  GROUP_CODE,
  inferActorType,
  inferStepCode,
  isPicStep,
  isRejectedStatus,
  normalizeText,
  requiresVendorCode,
  requiresVendorReply,
  resolveWorkflowAction,
  resolveGroupCodeForStep,
  WORKFLOW_ACTION,
} from '../_request-register/RegisterRequestWorkflowHelper'
import {
  triggerApprovalEmails,
  triggerActionRequiredEmail,
  triggerAfterGprCApprovedEmail,
  triggerCompletionEmail,
  triggerRejectionEmail,
  triggerVendorDisagreeEmail,
  triggerVendorDocumentEmail,
} from '../_request-register/RegisterRequestNotificationHelper'
import { GprCApprovalService } from '../_approval-GPRC/GprCApprovalService'

type ApprovalStepStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped' | 'completed'

interface ApprovalStep extends RowDataPacket {
  step_id: number
  step_order: number
  step_status: ApprovalStepStatus
  step_code?: string
  approver_id?: string
  DESCRIPTION?: string
}

interface UpdateStatusPayload {
  request_id: number
  request_status?: string
  approve_by?: string
  UPDATE_BY?: string
  approver_remark?: string
  workflow_action?: string
  action_type?: string
  negotiation_action?: string
  vendor_code_extracted?: string
  action_required_stage?: string
  action_required_owner?: string
  action_required_owner_email?: string
  [key: string]: unknown
}

interface RequestRecord extends RowDataPacket {
  vendor_id?: number
  assign_to?: string
  vendor_code_selector?: string
  vendor_region?: string
}

interface WorkflowContext {
  dataItem: UpdateStatusPayload
  request: RequestRecord
  steps: ApprovalStep[]
  currentStep: ApprovalStep | undefined
  isOversea: boolean
  vendor_id?: number
  requesterCode: string
  selectedVendorCode: string
}

interface SelectionRecord extends RowDataPacket {
  selection_id?: number
  action_required_json?: string
}

interface CriteriaRow extends RowDataPacket {
  no?: string
  criteria_no?: string
  uploaded_file?: string
  uploaded_file_path?: string
}

type SqlStatement = Awaited<ReturnType<typeof ApprovalQueueSQL.updateStatus>>
type SqlList = SqlStatement[]
type PostCommitTask = () => Promise<void>
type ServicePayload = Record<string, unknown>
type ReassignPayload = ServicePayload & {
  request_id?: number | string
  scope?: string
  to_empcode?: string
  UPDATE_BY?: string
  changed_by?: string
  reason?: string
}
type CompleteRegistrationPayload = ServicePayload & {
  request_id?: number | string
  vendor_code?: string
  UPDATE_BY?: string
}
type UpdateStatusResponse = {
  Status: boolean
  Message: string
  ResultOnDb: unknown
  MethodOnDb: string
  TotalCountOnDb: number
}

interface NegotiationBranchOptions {
  context: WorkflowContext
  sqlList: SqlList
  postCommitTasks: PostCommitTask[]
  pendingAfterCurrent: ApprovalStep[]
  pendingNonBranchAnywhere: ApprovalStep[]
  nextStep: ApprovalStep | undefined
  disagreementRequested: boolean
  actionRequiredRequested: boolean
}

enum StepType {
  PENDING_AGREEMENT = 'PENDING_AGREEMENT',
  AGREEMENT_REACHED = 'AGREEMENT_REACHED',
  ISSUE_GPR_B = 'ISSUE_GPR_B',
  ISSUE_GPR_C = 'ISSUE_GPR_C',
  VENDOR_DISAGREED = 'VENDOR_DISAGREED',
  DOCUMENT_CHECK = 'DOCUMENT_CHECK',
  OTHER = 'OTHER',
}

const DISAGREE_NEXT: Partial<Record<StepType, StepType[]>> = {
  [StepType.PENDING_AGREEMENT]: [StepType.ISSUE_GPR_B, StepType.ISSUE_GPR_C, StepType.VENDOR_DISAGREED],
  [StepType.AGREEMENT_REACHED]: [StepType.ISSUE_GPR_B, StepType.ISSUE_GPR_C, StepType.VENDOR_DISAGREED],
  [StepType.ISSUE_GPR_B]: [StepType.ISSUE_GPR_C, StepType.VENDOR_DISAGREED],
  [StepType.ISSUE_GPR_C]: [StepType.VENDOR_DISAGREED],
}

const normalizeStatusText = (value: unknown) => normalizeText(String(value || '').replace(/[_-]+/g, ' '))

const getStepType = (step?: Partial<ApprovalStep>): StepType => {
  const desc = normalizeStatusText(step?.DESCRIPTION)
  const stepCode = String(step?.step_code || '')
    .trim()
    .toUpperCase()

  if (desc.includes('pending agreement')) return StepType.PENDING_AGREEMENT
  if (desc.includes('agreement reached')) return StepType.AGREEMENT_REACHED
  if (desc.includes('issue gpr b')) return StepType.ISSUE_GPR_B
  if (desc.includes('issue gpr c')) return StepType.ISSUE_GPR_C
  if (desc.includes('vendor disagre')) return StepType.VENDOR_DISAGREED
  if (stepCode === 'DOC_CHECK' || desc.includes('check all document') || desc.includes('checker')) return StepType.DOCUMENT_CHECK

  return StepType.OTHER
}

const isStepType = (step: ApprovalStep | undefined, ...types: StepType[]) => (step ? types.includes(getStepType(step)) : false)
const isDisagreedBranchStep = (step: ApprovalStep) => isStepType(step, StepType.ISSUE_GPR_B, StepType.ISSUE_GPR_C, StepType.VENDOR_DISAGREED)
const isVendorDisagreeStatus = (status: unknown) => normalizeStatusText(status).includes('vendor disagre')
const isIssueGprBStatus = (status: unknown) => normalizeStatusText(status).includes('gpr b')
const isIssueGprCStatus = (status: unknown) => normalizeStatusText(status).includes('gpr c')
const resolveActionRequiredStage = (step: ApprovalStep) => {
  const desc = normalizeStatusText(step?.DESCRIPTION)
  if (desc.includes('engineer')) return 'engineer'
  if (desc.includes('emr')) return 'emr'
  if (desc.includes('qms')) return 'qms'
  if (desc.includes('pm manager') || desc.includes('manager approval')) return 'pm_manager'
  return ''
}
const parseStoredObject = (raw: unknown): Record<string, unknown> => {
  if (!raw) return {}
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const getGprCApproverEmpCodeFromSelection = (selection: SelectionRecord | null) => {
  const actionRequiredSetup = parseStoredObject(selection?.action_required_json)
  const meta = parseStoredObject(actionRequiredSetup?._meta)
  return String(meta?.gpr_c_approver_empcode || '').trim()
}

const NEED_CRITERIA = new Set(['4.1', '4.2', '4.3', '4.4', '4.5'])
const OPTIONAL_CRITERIA = new Set(['4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '4.12', '4.13'])

const evaluateGprCriteria = (criteriaRows: CriteriaRow[]) => {
  const rows = Array.isArray(criteriaRows) ? criteriaRows : []
  const normalizedRows = rows.map((row) => ({
    no: String(row?.no || row?.criteria_no || '').trim(),
    uploaded_file: String(row?.uploaded_file || row?.uploaded_file_path || '').trim(),
  }))

  const needRows = normalizedRows.filter((row) => NEED_CRITERIA.has(row.no))
  const optionalRows = normalizedRows.filter((row) => OPTIONAL_CRITERIA.has(row.no))

  const needPassed = NEED_CRITERIA.size > 0 && needRows.length === NEED_CRITERIA.size && needRows.every((row) => !!row.uploaded_file)

  const optionalUploaded = optionalRows.filter((row) => !!row.uploaded_file).length
  const optionalPassed = optionalUploaded >= 4

  return {
    hasCriteria: normalizedRows.length > 0,
    needPassed,
    optionalPassed,
    passed: needPassed && optionalPassed,
  }
}

const buildActionRequiredRemark = (dataItem: UpdateStatusPayload) => {
  const owner = String(dataItem?.action_required_owner || dataItem?.action_required_owner_empcode || '').trim()
  const ownerEmail = String(dataItem?.action_required_owner_email || '').trim()
  const dueDate = String(dataItem?.action_required_due_date || dataItem?.due_date || '').trim()
  const note = String(dataItem?.action_required_note || dataItem?.approver_remark || '').trim()
  const actor = String(dataItem?.approve_by || dataItem?.UPDATE_BY || 'SYSTEM').trim()

  const metadata = {
    type: 'action_required',
    owner,
    owner_email: ownerEmail,
    due_date: dueDate,
    note,
    stage: String(dataItem?.action_required_stage || '').trim(),
    actor,
    captured_at: new Date().toISOString(),
  }

  return `Action Required | ${JSON.stringify(metadata)}`
}

const getPendingAfterCurrent = (steps: ApprovalStep[], currentStep: ApprovalStep) =>
  steps.filter((step) => step.step_status === 'pending' && step.step_order > currentStep.step_order).sort((a, b) => Number(a.step_order || 0) - Number(b.step_order || 0))

const getPendingNonBranchAnywhere = (steps: ApprovalStep[], currentStep: ApprovalStep) =>
  steps
    .filter((step) => step.step_status === 'pending' && !isDisagreedBranchStep(step) && step.step_id !== currentStep.step_id)
    .sort((a, b) => Number(a.step_order || 0) - Number(b.step_order || 0))

const findFirstByTypes = (steps: ApprovalStep[], types: StepType[]) => steps.find((step) => types.includes(getStepType(step)))

const createWorkflowResolver = (context: WorkflowContext) => {
  const approverByGroupCache = new Map<string, string>()
  let selectionCache: SelectionRecord | null | undefined
  const picGroupCode = context.isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC

  const getApproverByGroup = async (groupCode: string) => {
    const safeGroupCode = String(groupCode || '')
      .trim()
      .toUpperCase()
    if (!safeGroupCode) return ''
    if (approverByGroupCache.has(safeGroupCode)) {
      return approverByGroupCache.get(safeGroupCode) || ''
    }

    const approverSql = await ApprovalQueueSQL.getApproverByGroupCode({ group_code: safeGroupCode })
    const approverRes = (await MySQLExecute.search(approverSql)) as RowDataPacket[]
    const approver = String(approverRes[0]?.empcode || '')
    approverByGroupCache.set(safeGroupCode, approver)
    return approver
  }

  const isActiveAssigneeInGroup = async (empCode: string, groupCode: string) => {
    const safeEmpCode = String(empCode || '').trim()
    const safeGroupCode = String(groupCode || '')
      .trim()
      .toUpperCase()
    if (!safeEmpCode || !safeGroupCode) return false

    const assigneeSql = await ApprovalQueueSQL.getActiveAssigneeByEmpCodeAndGroupCode({
      empcode: safeEmpCode,
      group_code: safeGroupCode,
    })
    const assigneeRes = (await MySQLExecute.search(assigneeSql)) as RowDataPacket[]
    return assigneeRes.length > 0
  }

  const getSelectionRecord = async () => {
    if (selectionCache !== undefined) return selectionCache
    const selectionSql = await ApprovalQueueSQL.getSelection({ request_id: context.dataItem.request_id })
    const selectionRes = (await MySQLExecute.search(selectionSql)) as SelectionRecord[]
    selectionCache = selectionRes[0] || null
    return selectionCache
  }

  const resolveStepApprover = async (step: ApprovalStep | undefined) => {
    if (!step) return ''
    if (isPicStep(step)) {
      const currentPic = String(context.request.assign_to || '').trim()
      const picStepGroupCode = resolveGroupCodeForStep(step, context.isOversea) || picGroupCode
      if (currentPic && (await isActiveAssigneeInGroup(currentPic, picStepGroupCode))) {
        return currentPic
      }
      return getApproverByGroup(picStepGroupCode)
    }
    if (getStepType(step) === StepType.ISSUE_GPR_C) {
      const selection = await getSelectionRecord()
      return getGprCApproverEmpCodeFromSelection(selection) || context.requesterCode
    }

    const stepGroupCode = resolveGroupCodeForStep(step, context.isOversea)
    if (step.approver_id && stepGroupCode && (await isActiveAssigneeInGroup(String(step.approver_id), stepGroupCode))) {
      return String(step.approver_id)
    }
    if (step.approver_id && !stepGroupCode) {
      return String(step.approver_id)
    }

    const stepCode = inferStepCode(step)
    const desc = (step.DESCRIPTION || '').toLowerCase()
    if (stepCode === 'DOC_CHECK' || desc.includes('checker') || desc.includes('check all document')) {
      return getApproverByGroup(GROUP_CODE.PO_CHECKER_MAIN)
    }
    if (stepGroupCode || desc.includes('gm') || desc.includes('general manager')) {
      return getApproverByGroup(stepGroupCode || GROUP_CODE.PO_GM)
    }
    if (desc.includes('mgr') || desc.includes('manager')) return getApproverByGroup(GROUP_CODE.PO_MGR)
    if (desc.includes('md') || desc.includes('director')) return getApproverByGroup(GROUP_CODE.MD)
    if (desc.includes('account')) {
      return getApproverByGroup(context.isOversea ? GROUP_CODE.ACC_OVERSEA_MAIN : GROUP_CODE.ACC_LOCAL_MAIN)
    }
    return ''
  }

  return {
    getApproverByGroup,
    isActiveAssigneeInGroup,
    getSelectionRecord,
    resolveStepApprover,
  }
}

type WorkflowResolver = ReturnType<typeof createWorkflowResolver>

const loadWorkflowContext = async (dataItem: UpdateStatusPayload): Promise<WorkflowContext> => {
  const [stepsRes, checkRes, requesterRes] = await Promise.all([
    (async () => {
      const sql = await ApprovalQueueSQL.getApprovalSteps({ request_id: dataItem.request_id })
      return MySQLExecute.search(sql) as Promise<ApprovalStep[]>
    })(),
    (async () => {
      const sql = await ApprovalQueueSQL.getRequestStatusContext({ request_id: dataItem.request_id })
      return MySQLExecute.search(sql) as Promise<RequestRecord[]>
    })(),
    (async () => {
      const sql = await ApprovalQueueSQL.getRequesterByRequestId({ request_id: dataItem.request_id })
      return MySQLExecute.search(sql) as Promise<RowDataPacket[]>
    })(),
  ])

  const request = checkRes[0] || ({} as RequestRecord)
  const currentStep = stepsRes.find((step) => step.step_status === 'in_progress')

  return {
    dataItem,
    request,
    steps: stepsRes,
    currentStep,
    isOversea: String(request.vendor_region || '').toLowerCase() === 'oversea',
    vendor_id: request.vendor_id,
    requesterCode: String(requesterRes[0]?.Request_By_EmployeeCode || '').trim(),
    selectedVendorCode: String(request.vendor_code_selector || ''),
  }
}

const hasVendorRequestLog = async (context: WorkflowContext) => {
  if (!context.currentStep || !requiresVendorReply(context.currentStep)) return false

  const logsSql = await ApprovalQueueSQL.getApprovalLogs({ request_id: context.dataItem.request_id })
  const logs = (await MySQLExecute.search(logsSql)) as RowDataPacket[]
  return logs.some((log) => String(log.step_id || '') === String(context.currentStep?.step_id || '') && log.action_type === 'vendor_requested')
}

const validateCurrentStep = async (context: WorkflowContext, resolver: WorkflowResolver, newStatus: string, explicitAction: string, isExplicitReject: boolean) => {
  const { currentStep, dataItem, request, selectedVendorCode } = context
  if (!currentStep) return

  const actionBy = String(dataItem.approve_by || dataItem.UPDATE_BY || '')
  const isCurrentPicStep = isPicStep(currentStep)
  const requiresRoleApprover = ['APPROVER', 'ACCOUNT'].includes(inferActorType(currentStep))

  if (currentStep.approver_id) {
    const isDesignatedApprover = currentStep.approver_id === actionBy
    const isAssignedPic = isCurrentPicStep && request.assign_to && request.assign_to === actionBy

    if (actionBy && !isDesignatedApprover && !isAssignedPic) {
      throw new Error(`Unauthorized: step "${currentStep.DESCRIPTION}" requires approver [${currentStep.approver_id}]`)
    }
  } else if (requiresRoleApprover) {
    throw new Error(`Approver not yet assigned for step "${currentStep.DESCRIPTION}". Please contact admin.`)
  } else if (actionBy && request.assign_to && request.assign_to !== actionBy) {
    throw new Error(`Unauthorized: only the assigned PIC [${request.assign_to}] can action this step`)
  }

  if (requiresVendorCode(currentStep) && !isRejectedStatus(newStatus) && !isExplicitReject) {
    const extractedVendorCode = String(selectedVendorCode || '').trim()
    if (!extractedVendorCode.trim()) {
      throw new Error('Approval blocked: You must open the GPR Form and specify the "Vendor Code" before approving this step.')
    }
    dataItem.vendor_code_extracted = extractedVendorCode
  }

  const requiresGprDecision = isStepType(currentStep, StepType.PENDING_AGREEMENT, StepType.AGREEMENT_REACHED)
  if (requiresGprDecision && !isExplicitReject && explicitAction !== WORKFLOW_ACTION.ACTION_REQUIRED) {
    const attemptingDisagree = explicitAction === WORKFLOW_ACTION.DISAGREE || isVendorDisagreeStatus(newStatus) || isIssueGprBStatus(newStatus) || isIssueGprCStatus(newStatus)
    const attemptingApprove = !attemptingDisagree

    const selection = await resolver.getSelectionRecord()
    if (!selection?.selection_id) {
      throw new Error('Approval blocked: Please fill GPR form before proceeding.')
    }

    if (attemptingApprove) {
      const criteriaSql = await ApprovalQueueSQL.getCriteria({ selection_id: selection.selection_id })
      const criteriaRes = (await MySQLExecute.search(criteriaSql)) as CriteriaRow[]
      const gprEval = evaluateGprCriteria(criteriaRes)

      if (!gprEval.hasCriteria) {
        throw new Error('Approval blocked: Please fill GPR form before proceeding.')
      }
      if (!gprEval.passed) {
        throw new Error('Approval blocked: GPR form does not pass criteria (4.1-4.5 need all files and 4.6-4.13 need at least 4 files).')
      }
    }
  }

  if (explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED) {
    const stageKey = resolveActionRequiredStage(currentStep)
    if (!stageKey) {
      throw new Error('Action Required is only available for Engineer / EMR / QMS / PM Manager stages.')
    }

    const selection = await resolver.getSelectionRecord()
    const actionRequiredSetup = parseStoredObject(selection?.action_required_json)
    const stageConfig = parseStoredObject(actionRequiredSetup?.[stageKey])
    const ownerName = String(stageConfig?.pic_name || '').trim()
    const ownerEmail = String(stageConfig?.pic_email || '').trim()
    const stageLabel = String(stageConfig?.stage_label || stageKey).trim()

    if (!ownerEmail) {
      throw new Error(`Action Required blocked: please configure PIC email for ${stageLabel} in the GPR form.`)
    }

    dataItem.action_required_stage = stageKey
    dataItem.action_required_owner = ownerName || ownerEmail
    dataItem.action_required_owner_email = ownerEmail
  }
}

const addVendorCodeUpdates = async (context: WorkflowContext, sqlList: SqlList) => {
  const { dataItem, vendor_id } = context
  if (!dataItem.vendor_code_extracted) return

  sqlList.push(
    await ApprovalQueueSQL.updateRequestVendorCode({
      request_id: dataItem.request_id,
      vendor_code: dataItem.vendor_code_extracted,
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
    })
  )
  if (vendor_id) {
    sqlList.push(
      await ApprovalQueueSQL.updateVendorFftVendorCode({
        vendor_id,
        vendor_code: dataItem.vendor_code_extracted,
      })
    )
  }
}

const handleRejection = async (context: WorkflowContext, sqlList: SqlList, postCommitTasks: PostCommitTask[]) => {
  const { dataItem, currentStep, steps, vendor_id } = context
  if (vendor_id) {
    sqlList.push(await ApprovalQueueSQL.updateVendorFftStatus({ vendor_id, fft_status: 2 }))
  }
  if (currentStep) {
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        step_id: currentStep.step_id,
        step_status: 'rejected',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
      })
    )
    sqlList.push(
      await ApprovalQueueSQL.createApprovalLog({
        request_id: dataItem.request_id,
        step_id: currentStep.step_id,
        action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
        action_type: 'rejected',
        remark: dataItem.approver_remark || '',
      })
    )
  }
  const pendingSteps = steps.filter((step) => step.step_status === 'pending')
  for (const pendingStep of pendingSteps) {
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        step_id: pendingStep.step_id,
        step_status: 'skipped',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
    )
  }
  postCommitTasks.push(async () => triggerRejectionEmail(dataItem, currentStep))
}

const handleVendorReplyRequest = async (context: WorkflowContext, resolver: WorkflowResolver, sqlList: SqlList, hasRequestLog: boolean): Promise<UpdateStatusResponse | null> => {
  const { dataItem, currentStep, steps } = context
  if (!currentStep) return null

  const isNegotiationBranchCurrentStep = isStepType(currentStep, StepType.PENDING_AGREEMENT, StepType.AGREEMENT_REACHED, StepType.ISSUE_GPR_B, StepType.ISSUE_GPR_C)
  if (!requiresVendorReply(currentStep) || hasRequestLog || isNegotiationBranchCurrentStep) return null

  sqlList.push(
    await ApprovalQueueSQL.updateApprovalStep({
      step_id: currentStep.step_id,
      step_status: 'approved',
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      request_id: dataItem.request_id,
      step_id: currentStep.step_id,
      action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
      action_type: 'vendor_requested',
      remark: 'Vendor document request email has been sent',
    })
  )

  const pendingAfterCurrent = getPendingAfterCurrent(steps, currentStep)
  const pendingAgreementStep = findFirstByTypes(pendingAfterCurrent, [StepType.PENDING_AGREEMENT])
  const agreementReachedStep = findFirstByTypes(pendingAfterCurrent, [StepType.AGREEMENT_REACHED]) || pendingAfterCurrent.find((step) => isStepType(step, StepType.DOCUMENT_CHECK))

  if (pendingAgreementStep) {
    const pendingAgreementApprover = await resolver.resolveStepApprover(pendingAgreementStep)
    if (pendingAgreementApprover && pendingAgreementApprover !== pendingAgreementStep.approver_id) {
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStepApprover({
          step_id: pendingAgreementStep.step_id,
          approver_id: pendingAgreementApprover,
          assignment_mode: 'AUTO',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
    }
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        step_id: pendingAgreementStep.step_id,
        step_status: 'completed',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
      })
    )
    sqlList.push(
      await ApprovalQueueSQL.createApprovalLog({
        request_id: dataItem.request_id,
        step_id: pendingAgreementStep.step_id,
        action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
        action_type: 'approved',
        remark: 'Pending Agreement auto-completed after sending vendor email',
      })
    )
  }

  if (agreementReachedStep) {
    const agreementReachedApprover = await resolver.resolveStepApprover(agreementReachedStep)
    if (agreementReachedApprover && agreementReachedApprover !== agreementReachedStep.approver_id) {
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStepApprover({
          step_id: agreementReachedStep.step_id,
          approver_id: agreementReachedApprover,
          assignment_mode: 'AUTO',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
    }
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        step_id: agreementReachedStep.step_id,
        step_status: 'in_progress',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
      })
    )
  }

  const resultData = await MySQLExecute.executeList(sqlList)
  const mailResult = await triggerVendorDocumentEmail(dataItem.request_id)
  const mailMessage = mailResult?.sent
    ? 'Vendor notification sent. Waiting vendor response before next approval step.'
    : `Request updated but vendor email failed: ${mailResult?.reason || 'unknown error'}`

  return {
    Status: true,
    Message: mailMessage,
    ResultOnDb: resultData,
    MethodOnDb: 'Update Status Success',
    TotalCountOnDb: sqlList.length,
  }
}

const handleGprCRequesterPhase = async (
  context: WorkflowContext,
  resolver: WorkflowResolver,
  sqlList: SqlList,
  postCommitTasks: PostCommitTask[],
  disagreementRequested: boolean,
  actionRequiredRequested: boolean
): Promise<UpdateStatusResponse | null> => {
  const { dataItem, currentStep, requesterCode } = context
  if (!currentStep) return null

  const actionBy = String(dataItem.approve_by || dataItem.UPDATE_BY || '').trim()
  const isRequesterGprCPhase =
    getStepType(currentStep) === StepType.ISSUE_GPR_C && !!requesterCode && String(currentStep.approver_id || '').trim() === requesterCode && actionBy === requesterCode

  if (!isRequesterGprCPhase || disagreementRequested || actionRequiredRequested) return null

  const selection = await resolver.getSelectionRecord()
  const requesterHeadEmpCode = getGprCApproverEmpCodeFromSelection(selection)

  if (!requesterHeadEmpCode) {
    throw new Error('Requester must complete GPR C setup before submitting to requester head approval.')
  }
  if (requesterHeadEmpCode === requesterCode) {
    throw new Error('GPR C approver must be different from requester.')
  }

  dataItem.request_status = currentStep.DESCRIPTION || 'Issue GPR C'
  sqlList.push(
    await ApprovalQueueSQL.updateApprovalStepApprover({
      step_id: currentStep.step_id,
      approver_id: requesterHeadEmpCode,
      assignment_mode: 'AUTO',
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.updateApprovalStep({
      step_id: currentStep.step_id,
      step_status: 'in_progress',
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      request_id: dataItem.request_id,
      step_id: currentStep.step_id,
      action_by: actionBy || 'SYSTEM',
      action_type: 'submitted_to_requester_head',
      remark: dataItem.approver_remark || 'Requester submitted GPR C to requester head approval',
    })
  )

  const resultData = await MySQLExecute.executeList(sqlList)
  postCommitTasks.push(async () => {
    await triggerVendorDocumentEmail(dataItem.request_id, currentStep?.DESCRIPTION || 'Issue GPR C')
  })
  queuePostCommitTasks(postCommitTasks, dataItem.request_id)

  return {
    Status: true,
    Message: 'GPR C submitted to requester head approval successfully',
    ResultOnDb: resultData,
    MethodOnDb: 'Update Status Success',
    TotalCountOnDb: sqlList.length,
  }
}

const handleNegotiationBranch = async ({
  context,
  sqlList,
  postCommitTasks,
  pendingAfterCurrent,
  pendingNonBranchAnywhere,
  nextStep,
  disagreementRequested,
  actionRequiredRequested,
}: NegotiationBranchOptions) => {
  const { dataItem, currentStep, steps, vendor_id } = context
  let resolvedNextStep = nextStep
  let closeAsVendorDisagreed = false
  if (!currentStep) return { nextStep: resolvedNextStep, closeAsVendorDisagreed }

  const currentStepType = getStepType(currentStep)
  const agreementReachedStepAny = steps
    .filter((step) => step.step_id !== currentStep.step_id && getStepType(step) === StepType.AGREEMENT_REACHED)
    .sort((a, b) => Number(a.step_order || 0) - Number(b.step_order || 0))[0]

  if (currentStepType === StepType.ISSUE_GPR_B && !actionRequiredRequested) {
    resolvedNextStep =
      findFirstByTypes(pendingAfterCurrent, [StepType.ISSUE_GPR_C]) ||
      findFirstByTypes(pendingNonBranchAnywhere, [StepType.ISSUE_GPR_C])

    return { nextStep: resolvedNextStep, closeAsVendorDisagreed }
  }

  if (isStepType(currentStep, StepType.PENDING_AGREEMENT, StepType.AGREEMENT_REACHED) && !disagreementRequested) {
    const branchSteps = pendingAfterCurrent.filter((step) => isDisagreedBranchStep(step))
    for (const branchStep of branchSteps) {
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStep({
          step_id: branchStep.step_id,
          step_status: 'skipped',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
    }
    resolvedNextStep =
      findFirstByTypes(pendingAfterCurrent, [StepType.AGREEMENT_REACHED]) ||
      findFirstByTypes(pendingNonBranchAnywhere, [StepType.AGREEMENT_REACHED]) ||
      pendingAfterCurrent.find((step) => isStepType(step, StepType.DOCUMENT_CHECK)) ||
      pendingNonBranchAnywhere.find((step) => isStepType(step, StepType.DOCUMENT_CHECK)) ||
      pendingAfterCurrent.find((step) => !isDisagreedBranchStep(step)) ||
      pendingNonBranchAnywhere[0]
  } else if (DISAGREE_NEXT[currentStepType] || currentStepType === StepType.AGREEMENT_REACHED) {
    if (!disagreementRequested || actionRequiredRequested) {
      if (currentStepType === StepType.ISSUE_GPR_C && !actionRequiredRequested) {
        resolvedNextStep = agreementReachedStepAny
      }
      const branchSteps = pendingAfterCurrent.filter((step) => isDisagreedBranchStep(step))
      for (const branchStep of branchSteps) {
        sqlList.push(
          await ApprovalQueueSQL.updateApprovalStep({
            step_id: branchStep.step_id,
            step_status: 'skipped',
            UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
          })
        )
      }
      resolvedNextStep =
        resolvedNextStep ||
        findFirstByTypes(pendingAfterCurrent, [StepType.AGREEMENT_REACHED]) ||
        findFirstByTypes(pendingNonBranchAnywhere, [StepType.AGREEMENT_REACHED]) ||
        pendingAfterCurrent.find((step) => isStepType(step, StepType.DOCUMENT_CHECK)) ||
        pendingNonBranchAnywhere.find((step) => isStepType(step, StepType.DOCUMENT_CHECK)) ||
        pendingAfterCurrent.find((step) => !isDisagreedBranchStep(step)) ||
        pendingNonBranchAnywhere[0]
    } else {
      resolvedNextStep = findFirstByTypes(pendingAfterCurrent, DISAGREE_NEXT[currentStepType] || [])
    }

    if (disagreementRequested && resolvedNextStep && getStepType(resolvedNextStep) === StepType.VENDOR_DISAGREED) {
      closeAsVendorDisagreed = true

      if (vendor_id) {
        sqlList.push(await ApprovalQueueSQL.updateVendorFftStatus({ vendor_id, fft_status: 2 }))
      }
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStep({
          step_id: resolvedNextStep.step_id,
          step_status: 'rejected',
          UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
        })
      )
      sqlList.push(
        await ApprovalQueueSQL.createApprovalLog({
          request_id: dataItem.request_id,
          step_id: resolvedNextStep.step_id,
          action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
          action_type: 'rejected',
          remark: dataItem.approver_remark || 'Vendor disagreed after GPR negotiation',
        })
      )

      const trailingSteps = pendingAfterCurrent.filter((step) => step.step_id !== resolvedNextStep?.step_id)
      for (const trailingStep of trailingSteps) {
        sqlList.push(
          await ApprovalQueueSQL.updateApprovalStep({
            step_id: trailingStep.step_id,
            step_status: 'skipped',
            UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
          })
        )
      }

      postCommitTasks.push(async () => triggerVendorDisagreeEmail(dataItem))
      resolvedNextStep = undefined
    }
  }

  return { nextStep: resolvedNextStep, closeAsVendorDisagreed }
}

const handleNormalApproval = async (
  context: WorkflowContext,
  resolver: WorkflowResolver,
  sqlList: SqlList,
  postCommitTasks: PostCommitTask[],
  explicitAction: string,
  disagreementRequested: boolean,
  actionRequiredRequested: boolean
) => {
  const { dataItem, currentStep, steps } = context
  if (!currentStep) return

  const approvalActionType = explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED ? 'action_required' : explicitAction === WORKFLOW_ACTION.DISAGREE ? 'vendor_disagreed' : 'approved'
  const approvalRemark = explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED ? buildActionRequiredRemark(dataItem) : dataItem.approver_remark || ''
  const currentStepStatus =
    getStepType(currentStep) === StepType.PENDING_AGREEMENT && !disagreementRequested
      ? 'completed'
      : getStepType(currentStep) === StepType.AGREEMENT_REACHED && disagreementRequested
        ? 'pending'
        : 'approved'

  sqlList.push(
    await ApprovalQueueSQL.updateApprovalStep({
      step_id: currentStep.step_id,
      step_status: currentStepStatus,
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      request_id: dataItem.request_id,
      step_id: currentStep.step_id,
      action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
      action_type: approvalActionType,
      remark: approvalRemark,
    })
  )

  const pendingAfterCurrent = getPendingAfterCurrent(steps, currentStep)
  const pendingNonBranchAnywhere = getPendingNonBranchAnywhere(steps, currentStep)
  let nextStep: ApprovalStep | undefined = pendingAfterCurrent[0]
  const negotiation = await handleNegotiationBranch({
    context,
    sqlList,
    postCommitTasks,
    pendingAfterCurrent,
    pendingNonBranchAnywhere,
    nextStep,
    disagreementRequested,
    actionRequiredRequested,
  })
  nextStep = negotiation.nextStep
  const closeAsVendorDisagreed = negotiation.closeAsVendorDisagreed

  if (getStepType(currentStep) === StepType.ISSUE_GPR_B && !nextStep) {
    throw new Error('Issue GPR C step is not configured. Please configure the workflow before continuing from GPR B.')
  }

  if (requiresVendorCode(currentStep)) {
    nextStep = undefined
    const remainingSteps = steps.filter((step) => step.step_status === 'pending' && step.step_order > currentStep.step_order)
    for (const remainingStep of remainingSteps) {
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStep({
          step_id: remainingStep.step_id,
          step_status: 'skipped',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
    }
  }

  if (nextStep) {
    if (getStepType(currentStep) === StepType.ISSUE_GPR_C && !disagreementRequested && !actionRequiredRequested && getStepType(nextStep) === StepType.AGREEMENT_REACHED) {
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStep({
          step_id: nextStep.step_id,
          step_status: 'pending',
          UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
        })
      )
    }
    const nextStepApprover = await resolver.resolveStepApprover(nextStep)
    if (getStepType(nextStep) === StepType.ISSUE_GPR_C && !nextStepApprover) {
      throw new Error('GPR C approver is not configured. Please set GPR C Approver before sending GPR C.')
    }
    if (nextStepApprover && nextStepApprover !== nextStep.approver_id) {
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStepApprover({
          step_id: nextStep.step_id,
          approver_id: nextStepApprover,
          assignment_mode: 'AUTO',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
    }
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        step_id: nextStep.step_id,
        step_status: 'in_progress',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
    )
    if (getStepType(nextStep) === StepType.ISSUE_GPR_B) {
      postCommitTasks.push(async () => {
        await triggerVendorDocumentEmail(dataItem.request_id, nextStep?.DESCRIPTION)
      })
    } else if (getStepType(nextStep) === StepType.ISSUE_GPR_C) {
      postCommitTasks.push(async () => {
        await GprCApprovalService.createOrGetFlow({
          request_id: dataItem.request_id,
          UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
        })
      })
    } else {
      postCommitTasks.push(async () => triggerApprovalEmails(dataItem, nextStep, nextStepApprover))
    }
    if (getStepType(currentStep) === StepType.ISSUE_GPR_C && !disagreementRequested && !actionRequiredRequested) {
      postCommitTasks.push(async () => triggerAfterGprCApprovedEmail(dataItem))
    }
    if (actionRequiredRequested) {
      postCommitTasks.push(async () => triggerActionRequiredEmail(dataItem, currentStep))
    }
  } else if (!closeAsVendorDisagreed) {
    sqlList.push(
      await ApprovalQueueSQL.markRequestCompleted({
        request_id: dataItem.request_id,
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
      })
    )
    if (actionRequiredRequested) {
      postCommitTasks.push(async () => triggerActionRequiredEmail(dataItem, currentStep))
    }
    postCommitTasks.push(async () => triggerCompletionEmail(dataItem))
  }
}

const runPostCommitTasks = async (tasks: PostCommitTask[], requestId: number) => {
  const results = await Promise.allSettled(tasks.map((task) => task()))
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error('[ApprovalQueueService.updateStatus] postCommitTask failed', {
        taskIndex: index,
        request_id: requestId,
        error: result.reason instanceof Error ? result.reason.message : result.reason,
      })
    }
  })
}

const queuePostCommitTasks = (tasks: PostCommitTask[], requestId: number) => {
  void runPostCommitTasks(tasks, requestId)
}

export const ApprovalQueueService = {
  getAllRequests: async (dataItem: ServicePayload, _sqlWhere: string = '') => {
    const sqlArray = await ApprovalQueueSQL.getAllRequests(dataItem)
    const result = (await MySQLExecute.searchList(sqlArray)) as RowDataPacket[][]

    return {
      totalCount: result[0]?.[0]?.TOTAL_COUNT || 0,
      data: result[1] || [],
    }
  },

  getById: async (dataItem: ServicePayload) => {
    const requestId = Number(dataItem.request_id) || 0
    if (!requestId) throw new Error('Invalid request_id')

    const sql = await ApprovalQueueSQL.getById({ request_id: requestId })
    const result = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return result[0] || null
  },

  getStatusOptions: async (dataItem: ServicePayload = {}) => {
    const sql = await ApprovalQueueSQL.getStatusOptions(dataItem)
    const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return result
  },

  updateRequest: async (dataItem: UpdateStatusPayload) => {
    try {
      const requestId = Number(dataItem.request_id)
      if (!requestId) throw new Error('Invalid request_id')

      const checkSql = await ApprovalQueueSQL.getRequestStatusAndAssign({ request_id: requestId })
      const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
      const request = checkRes[0]
      if (!request) throw new Error('Request not found')

      const stepsSql = await ApprovalQueueSQL.getApprovalSteps({ request_id: requestId })
      const steps = (await MySQLExecute.search(stepsSql)) as ApprovalStep[]
      const currentStep = steps.find((step) => step.step_status === 'in_progress')

      if (!currentStep || !isPicStep(currentStep)) {
        throw new Error('Request can only be edited when it is in the PIC checking step')
      }

      if (dataItem.UPDATE_BY && request.assign_to && request.assign_to !== dataItem.UPDATE_BY) {
        throw new Error('Unauthorized assigned PIC only')
      }

      const sqlList = []
      sqlList.push(await ApprovalQueueSQL.updateRequest(dataItem))
      sqlList.push(
        await ApprovalQueueSQL.createApprovalLog({
          request_id: requestId,
          step_id: currentStep.step_id,
          action_by: dataItem.UPDATE_BY || 'SYSTEM',
          action_type: 'edited',
          remark: 'PIC edited request details',
        })
      )

      const resultData = await MySQLExecute.executeList(sqlList)
      return {
        Status: true,
        Message: 'Request updated successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Update Request Success',
        TotalCountOnDb: 1,
      }
    } catch (error: unknown) {
      return {
        Status: false,
        Message: error instanceof Error ? error.message : 'Update failed',
        ResultOnDb: [],
        MethodOnDb: 'Update Request Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  updateStatus: async (dataItem: UpdateStatusPayload) => {
    try {
      const newStatus = String(dataItem.request_status || '')
      const explicitAction = resolveWorkflowAction(dataItem)
      const isExplicitReject = explicitAction === WORKFLOW_ACTION.REJECT
      const actionRequiredRequested = explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED
      const disagreementRequested = explicitAction === WORKFLOW_ACTION.DISAGREE || isVendorDisagreeStatus(newStatus) || isIssueGprBStatus(newStatus) || isIssueGprCStatus(newStatus)
      const context = await loadWorkflowContext(dataItem)
      const resolver = createWorkflowResolver(context)
      const vendorRequestLogExists = await hasVendorRequestLog(context)
      const postCommitTasks: PostCommitTask[] = []
      const sqlList: SqlList = [await ApprovalQueueSQL.updateStatus(dataItem)]

      await validateCurrentStep(context, resolver, newStatus, explicitAction, isExplicitReject)
      await addVendorCodeUpdates(context, sqlList)

      if (context.steps.length > 0) {
        if (isRejectedStatus(newStatus) || isExplicitReject) {
          await handleRejection(context, sqlList, postCommitTasks)
        } else if (context.currentStep) {
          const vendorReplyResponse = await handleVendorReplyRequest(context, resolver, sqlList, vendorRequestLogExists)
          if (vendorReplyResponse) return vendorReplyResponse

          const gprCRequesterResponse = await handleGprCRequesterPhase(context, resolver, sqlList, postCommitTasks, disagreementRequested, actionRequiredRequested)
          if (gprCRequesterResponse) return gprCRequesterResponse

          await handleNormalApproval(context, resolver, sqlList, postCommitTasks, explicitAction, disagreementRequested, actionRequiredRequested)
        }
      }

      const resultData = await MySQLExecute.executeList(sqlList)
      queuePostCommitTasks(postCommitTasks, dataItem.request_id)

      return {
        Status: true,
        Message: 'Status updated successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Update Status Success',
        TotalCountOnDb: sqlList.length,
      }
    } catch (error: unknown) {
      console.error('Error in ApprovalQueueService.updateStatus:', error)
      return {
        Status: false,
        Message: error instanceof Error ? error.message : 'Update status failed',
        ResultOnDb: [],
        MethodOnDb: 'Update Status Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  reassignAssignment: async (dataItem: ReassignPayload) => {
    try {
      const requestId = Number(dataItem.request_id) || 0
      const scope = String(dataItem.scope || '')
        .trim()
        .toUpperCase()
      const toEmpCode = String(dataItem.to_empcode || '').trim()
      const updateBy = dataItem.UPDATE_BY || dataItem.changed_by || 'SYSTEM'
      const reason = dataItem.reason || ''

      if (!requestId) throw new Error('Missing request_id')
      if (!['REQUEST_PIC', 'CURRENT_STEP', 'GPR_C_STEP'].includes(scope)) throw new Error('Invalid reassign scope')
      if (!toEmpCode) throw new Error('Missing to_empcode')

      if (scope === 'GPR_C_STEP') {
        return GprCApprovalService.reassignStep(dataItem)
      }

      const requestSql = await ApprovalQueueSQL.getById({ request_id: requestId })
      const requestRes = (await MySQLExecute.search(requestSql)) as RowDataPacket[]
      const request = requestRes[0] || null
      if (!request) throw new Error('Request not found')

      const stepsSql = await ApprovalQueueSQL.getApprovalSteps({ request_id: requestId })
      const steps = (await MySQLExecute.search(stepsSql)) as ApprovalStep[]
      const currentStep = steps.find((step) => step.step_status === 'in_progress')
      if (!currentStep) throw new Error('No in-progress step found for this request')

      const isOversea = normalizeText(request.vendor_region) === 'oversea'
      const picGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
      const currentStepGroupCode = resolveGroupCodeForStep(currentStep, isOversea)
      const expectedGroupCode = scope === 'REQUEST_PIC' ? picGroupCode : currentStepGroupCode

      const assigneeSql = expectedGroupCode
        ? await ApprovalQueueSQL.getActiveAssigneeByEmpCodeAndGroupCode({
            empcode: toEmpCode,
            group_code: expectedGroupCode,
            group_compact: expectedGroupCode.replace(/[^A-Z0-9]/g, ''),
          })
        : await ApprovalQueueSQL.getAssigneeByEmpCode({ to_empcode: toEmpCode })
      const assigneeRes = (await MySQLExecute.search(assigneeSql)) as RowDataPacket[]
      const targetAssignee = assigneeRes[0] || null
      if (!targetAssignee || Number(targetAssignee.INUSE) !== 1) throw new Error(`Target assignee must belong to group ${expectedGroupCode || 'active assignees'}`)

      const sqlList = []
      let fromEmpcode = currentStep.approver_id || ''
      let targetStepId: number | undefined = currentStep.step_id
      let stepCode = inferStepCode(currentStep)
      let groupCode = currentStepGroupCode
      let actionType = 'reassigned_step'

      if (scope === 'REQUEST_PIC') {
        fromEmpcode = request.assign_to || currentStep.approver_id || ''
        targetStepId = isPicStep(currentStep) ? currentStep.step_id : undefined
        stepCode = 'PIC_REVIEW'
        groupCode = picGroupCode
        actionType = 'reassigned_pic'

        sqlList.push(
          await ApprovalQueueSQL.updateRequestPicAssignee({
            request_id: requestId,
            assign_to: targetAssignee.empcode,
            PIC_Email: targetAssignee.empEmail || '',
            UPDATE_BY: updateBy,
          })
        )

        if (isPicStep(currentStep)) {
          sqlList.push(
            await ApprovalQueueSQL.updateApprovalStepApprover({
              step_id: currentStep.step_id,
              approver_id: targetAssignee.empcode,
              assignment_mode: 'MANUAL',
              UPDATE_BY: updateBy,
            })
          )
        }
      } else {
        sqlList.push(
          await ApprovalQueueSQL.updateApprovalStepApprover({
            step_id: currentStep.step_id,
            approver_id: targetAssignee.empcode,
            assignment_mode: 'MANUAL',
            UPDATE_BY: updateBy,
          })
        )

        if (isPicStep(currentStep)) {
          sqlList.push(
            await ApprovalQueueSQL.updateRequestPicAssignee({
              request_id: requestId,
              assign_to: targetAssignee.empcode,
              PIC_Email: targetAssignee.empEmail || '',
              UPDATE_BY: updateBy,
            })
          )
        }
      }

      sqlList.push(
        await ApprovalQueueSQL.insertAssignmentHistory({
          request_id: requestId,
          step_id: targetStepId,
          scope,
          step_code: stepCode,
          group_code: groupCode,
          from_empcode: fromEmpcode,
          to_empcode: targetAssignee.empcode,
          reason,
          DESCRIPTION: scope === 'REQUEST_PIC' ? 'PIC reassigned' : 'Current approval step reassigned',
          changed_by: updateBy,
          CREATE_BY: updateBy,
          UPDATE_BY: updateBy,
        })
      )

      sqlList.push(
        await ApprovalQueueSQL.createApprovalLog({
          request_id: requestId,
          step_id: currentStep.step_id,
          action_by: updateBy,
          action_type: actionType,
          remark: reason || `Reassigned to ${targetAssignee.empcode}`,
        })
      )

      const resultData = await MySQLExecute.executeList(sqlList)
      return {
        Status: true,
        Message: 'Assignment updated successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Reassign Request Success',
        TotalCountOnDb: sqlList.length,
      }
    } catch (error: unknown) {
      return {
        Status: false,
        Message: error instanceof Error ? error.message : 'Reassign failed',
        ResultOnDb: [],
        MethodOnDb: 'Reassign Request Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  completeRegistration: async (dataItem: CompleteRegistrationPayload) => {
    try {
      const stepsSql = await ApprovalQueueSQL.getApprovalSteps(dataItem)
      const steps = (await MySQLExecute.search(stepsSql)) as ApprovalStep[]
      const currentStep = steps.find((step) => step.step_status === 'in_progress')

      const sqlList = []
      if (currentStep) {
        sqlList.push(
          await ApprovalQueueSQL.updateApprovalStep({
            step_id: currentStep.step_id,
            step_status: 'approved',
            UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
          })
        )
        sqlList.push(
          await ApprovalQueueSQL.createApprovalLog({
            request_id: dataItem.request_id,
            step_id: currentStep.step_id,
            action_by: dataItem.UPDATE_BY || 'SYSTEM',
            action_type: 'approved',
            remark: dataItem.vendor_code ? `Vendor Code: ${dataItem.vendor_code}` : 'Registration completed',
          })
        )
      }

      sqlList.push(await ApprovalQueueSQL.completeRegistration(dataItem))
      const resultData = await MySQLExecute.executeList(sqlList)

      try {
        await triggerCompletionEmail(dataItem)
      } catch (mailErr: unknown) {
        console.error('[completeRegistration] Completion email failed:', mailErr instanceof Error ? mailErr.message : mailErr)
      }

      return {
        Status: true,
        Message: 'Registration completed successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Complete Registration',
        TotalCountOnDb: 1,
      }
    } catch (error: unknown) {
      return {
        Status: false,
        Message: error instanceof Error ? error.message : 'Completion failed',
        ResultOnDb: [],
        MethodOnDb: 'Complete Registration Failed',
        TotalCountOnDb: 0,
      }
    }
  },
}
