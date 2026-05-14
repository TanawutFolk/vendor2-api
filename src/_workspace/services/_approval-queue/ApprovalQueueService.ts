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
  resolveRequestNumber,
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
import { SelectionFileService } from '../_request-register/SelectionFileService'
import { GprCApprovalService } from '../_approval-GPRC/GprCApprovalService'

type ApprovalStepStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped' | 'completed'

interface ApprovalStep extends RowDataPacket {
  [key: string]: any
  step_id: number
  step_order: number
  step_status: ApprovalStepStatus
  step_code?: string
  approver_id?: string
  DESCRIPTION?: string
}

interface UpdateStatusPayload {
  [key: string]: any
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
}

interface RequestRecord extends RowDataPacket {
  [key: string]: any
  vendor_id?: number
  assign_to?: string
  request_number?: string
  CREATE_DATE?: string | Date
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
  [key: string]: any
  selection_id?: number
  action_required_json?: string
}

interface CriteriaRow extends RowDataPacket {
  [key: string]: any
  no?: string
  criteria_no?: string
  uploaded_file?: string
  uploaded_file_path?: string
}

const normalizeApprovalStep = (step: any): ApprovalStep => ({
  ...step,
  step_id: Number(step?.step_id ?? step?.STEP_ID ?? 0),
  request_id: Number(step?.request_id ?? step?.REQUEST_ID ?? 0),
  step_order: Number(step?.step_order ?? step?.STEP_ORDER ?? 0),
  approver_id: String(step?.approver_id ?? step?.APPROVER_ID ?? ''),
  step_status: String(step?.step_status ?? step?.STEP_STATUS ?? '') as ApprovalStepStatus,
  DESCRIPTION: step?.DESCRIPTION ?? step?.description ?? '',
  step_code: String(step?.step_code ?? step?.STEP_CODE ?? ''),
  actor_type: String(step?.actor_type ?? step?.ACTOR_TYPE ?? ''),
  group_code: String(step?.group_code ?? step?.GROUP_CODE ?? ''),
  assignment_mode: String(step?.assignment_mode ?? step?.ASSIGNMENT_MODE ?? ''),
}) as ApprovalStep

const normalizeApprovalLog = (log: any) => ({
  ...log,
  log_id: Number(log?.log_id ?? log?.LOG_ID ?? 0),
  request_id: Number(log?.request_id ?? log?.REQUEST_ID ?? 0),
  step_id: Number(log?.step_id ?? log?.STEP_ID ?? 0),
  action_by: String(log?.action_by ?? log?.ACTION_BY ?? ''),
  action_type: String(log?.action_type ?? log?.ACTION_TYPE ?? ''),
  remark: log?.remark ?? log?.REMARK ?? '',
  action_date: log?.action_date ?? log?.ACTION_DATE ?? null,
})

const normalizeRequestRecord = (request: any): RequestRecord => ({
  ...request,
  vendor_id: Number(request?.vendor_id ?? request?.VENDOR_ID ?? 0) || undefined,
  assign_to: String(request?.assign_to ?? request?.ASSIGN_TO ?? ''),
  request_number: String(request?.request_number ?? request?.REQUEST_NUMBER ?? ''),
  CREATE_DATE: request?.CREATE_DATE ?? request?.create_date,
  vendor_code_selector: String(request?.vendor_code_selector ?? request?.VENDOR_CODE_SELECTOR ?? ''),
  vendor_region: String(request?.vendor_region ?? request?.VENDOR_REGION ?? ''),
}) as RequestRecord

const normalizeSelectionRecord = (selection: any): SelectionRecord | null => {
  if (!selection) return null

  return {
    ...selection,
    selection_id: Number(selection?.selection_id ?? selection?.SELECTION_ID ?? 0),
    action_required_json: selection?.action_required_json ?? selection?.ACTION_REQUIRED_JSON,
  } as SelectionRecord
}

type SqlStatement = Awaited<ReturnType<typeof ApprovalQueueSQL.updateStatus>>
type SqlList = SqlStatement[]
type PostCommitTask = () => Promise<void>
type ServicePayload = Record<string, any>
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

const createSelectionFolderForVendorRequest = (context: WorkflowContext) => {
  const requestNumber = resolveRequestNumber(context.request.request_number, context.dataItem.REQUEST_ID, context.request.CREATE_DATE)
  return SelectionFileService.createFolderStructure(requestNumber)
}

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

    const approverSql = await ApprovalQueueSQL.getApproverByGroupCode({ GROUP_CODE: safeGroupCode })
    const approverRes = (await MySQLExecute.search(approverSql)) as RowDataPacket[]
    const approver = String(approverRes[0]?.empcode || approverRes[0]?.EMPCODE || '')
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
      EMPCODE: safeEmpCode,
      GROUP_CODE: safeGroupCode,
    })
    const assigneeRes = (await MySQLExecute.search(assigneeSql)) as RowDataPacket[]
    return assigneeRes.length > 0
  }

  const getSelectionRecord = async () => {
    if (selectionCache !== undefined) return selectionCache
    const selectionSql = await ApprovalQueueSQL.getSelection({ REQUEST_ID: context.dataItem.REQUEST_ID })
    const selectionRes = (await MySQLExecute.search(selectionSql)) as SelectionRecord[]
    selectionCache = normalizeSelectionRecord(selectionRes[0])
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
      const sql = await ApprovalQueueSQL.getApprovalSteps({ REQUEST_ID: dataItem.REQUEST_ID })
      return MySQLExecute.search(sql) as Promise<ApprovalStep[]>
    })(),
    (async () => {
      const sql = await ApprovalQueueSQL.getRequestStatusContext({ REQUEST_ID: dataItem.REQUEST_ID })
      return MySQLExecute.search(sql) as Promise<RequestRecord[]>
    })(),
    (async () => {
      const sql = await ApprovalQueueSQL.getRequesterByRequestId({ REQUEST_ID: dataItem.REQUEST_ID })
      return MySQLExecute.search(sql) as Promise<RowDataPacket[]>
    })(),
  ])

  const steps = stepsRes.map(normalizeApprovalStep)
  const request = normalizeRequestRecord(checkRes[0] || {})

  return {
    dataItem,
    request,
    steps,
    currentStep: stepsRes.find((step) => String(step.STEP_STATUS || step.step_status || '').toLowerCase() === 'in_progress'),
    isOversea: String(request.vendor_region || '').toLowerCase() === 'oversea',
    vendor_id: request.vendor_id,
    requesterCode: String(requesterRes[0]?.Request_By_EmployeeCode || requesterRes[0]?.REQUEST_BY_EMPLOYEECODE || '').trim(),
    selectedVendorCode: String(request.vendor_code_selector || ''),
  }
}

const hasVendorRequestLog = async (context: WorkflowContext) => {
  if (!context.currentStep || !requiresVendorReply(context.currentStep)) return false

  const logsSql = await ApprovalQueueSQL.getApprovalLogs({ REQUEST_ID: context.dataItem.REQUEST_ID })
  const logs = ((await MySQLExecute.search(logsSql)) as RowDataPacket[]).map(normalizeApprovalLog)
  return logs.some((log) => String(log.step_id || '') === String(context.currentStep?.step_id || '') && log.action_type === 'vendor_requested')
}

const validateCurrentStep = async (context: WorkflowContext, resolver: WorkflowResolver, newStatus: string, explicitAction: string, isExplicitReject: boolean) => {
  const { currentStep, dataItem, request, selectedVendorCode } = context
  if (!currentStep) return

  const actionBy = String(dataItem.APPROVE_BY || dataItem.UPDATE_BY || '')
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
    dataItem.VENDOR_CODE_EXTRACTED = extractedVendorCode
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
      const criteriaSql = await ApprovalQueueSQL.getCriteria({ SELECTION_ID: selection.selection_id })
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

    dataItem.ACTION_REQUIRED_STAGE = stageKey
    dataItem.ACTION_REQUIRED_OWNER = ownerName || ownerEmail
    dataItem.ACTION_REQUIRED_OWNER_EMAIL = ownerEmail
  }
}

const addVendorCodeUpdates = async (context: WorkflowContext, sqlList: SqlList) => {
  const { dataItem, vendor_id } = context
  if (!dataItem.VENDOR_CODE_EXTRACTED) return

  sqlList.push(
    await ApprovalQueueSQL.updateRequestVendorCode({
      REQUEST_ID: dataItem.REQUEST_ID,
      VENDOR_CODE: dataItem.VENDOR_CODE_EXTRACTED,
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  if (vendor_id) {
    sqlList.push(
      await ApprovalQueueSQL.updateVendorFftVendorCode({
        VENDOR_ID: vendor_id,
        VENDOR_CODE: dataItem.VENDOR_CODE_EXTRACTED,
      })
    )
  }
}

const handleRejection = async (context: WorkflowContext, sqlList: SqlList, postCommitTasks: PostCommitTask[]) => {
  const { dataItem, currentStep, steps, vendor_id } = context
  if (vendor_id) {
    sqlList.push(await ApprovalQueueSQL.updateVendorFftStatus({ VENDOR_ID: vendor_id, FFT_STATUS: 2 }))
  }
  if (currentStep) {
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        STEP_ID: currentStep.step_id,
        STEP_STATUS: 'rejected',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
      })
    )
    sqlList.push(
      await ApprovalQueueSQL.createApprovalLog({
        REQUEST_ID: dataItem.REQUEST_ID,
        STEP_ID: currentStep.step_id,
        ACTION_BY: dataItem.APPROVE_BY || dataItem.UPDATE_BY || 'SYSTEM',
        ACTION_TYPE: 'rejected',
        REMARK: dataItem.APPROVER_REMARK || '',
      })
    )
  }
  const pendingSteps = steps.filter((step) => step.step_status === 'pending')
  for (const pendingStep of pendingSteps) {
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        STEP_ID: pendingStep.step_id,
        STEP_STATUS: 'skipped',
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
      STEP_ID: currentStep.step_id,
      STEP_STATUS: 'approved',
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      REQUEST_ID: dataItem.REQUEST_ID,
      STEP_ID: currentStep.step_id,
      ACTION_BY: dataItem.APPROVE_BY || dataItem.UPDATE_BY || 'SYSTEM',
      ACTION_TYPE: 'vendor_requested',
      REMARK: 'Vendor document request email has been sent',
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
          STEP_ID: pendingAgreementStep.step_id,
          APPROVER_ID: pendingAgreementApprover,
          ASSIGNMENT_MODE: 'AUTO',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
    }
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        STEP_ID: pendingAgreementStep.step_id,
        STEP_STATUS: 'in_progress',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
      })
    )
  } else if (agreementReachedStep) {
    const agreementReachedApprover = await resolver.resolveStepApprover(agreementReachedStep)
    if (agreementReachedApprover && agreementReachedApprover !== agreementReachedStep.approver_id) {
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStepApprover({
          STEP_ID: agreementReachedStep.step_id,
          APPROVER_ID: agreementReachedApprover,
          ASSIGNMENT_MODE: 'AUTO',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
    }
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        STEP_ID: agreementReachedStep.step_id,
        STEP_STATUS: 'in_progress',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
      })
    )
  }

  createSelectionFolderForVendorRequest(context)

  const resultData = await MySQLExecute.executeList(sqlList)
  const mailResult = await triggerVendorDocumentEmail(dataItem.REQUEST_ID)
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

  const actionBy = String(dataItem.APPROVE_BY || dataItem.UPDATE_BY || '').trim()
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

  dataItem.REQUEST_STATUS = currentStep.DESCRIPTION || 'Issue GPR C'
  sqlList.push(
    await ApprovalQueueSQL.updateApprovalStepApprover({
      STEP_ID: currentStep.step_id,
      APPROVER_ID: requesterHeadEmpCode,
      ASSIGNMENT_MODE: 'AUTO',
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.updateApprovalStep({
      STEP_ID: currentStep.step_id,
      STEP_STATUS: 'in_progress',
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      REQUEST_ID: dataItem.REQUEST_ID,
      STEP_ID: currentStep.step_id,
      ACTION_BY: actionBy || 'SYSTEM',
      ACTION_TYPE: 'submitted_to_requester_head',
      REMARK: dataItem.APPROVER_REMARK || 'Requester submitted GPR C to requester head approval',
    })
  )

  const resultData = await MySQLExecute.executeList(sqlList)
  postCommitTasks.push(async () => {
    await triggerVendorDocumentEmail(dataItem.REQUEST_ID, currentStep?.DESCRIPTION || 'Issue GPR C')
  })
  queuePostCommitTasks(postCommitTasks, dataItem.REQUEST_ID)

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
          STEP_ID: branchStep.step_id,
          STEP_STATUS: 'skipped',
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
            STEP_ID: branchStep.step_id,
            STEP_STATUS: 'skipped',
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
        sqlList.push(await ApprovalQueueSQL.updateVendorFftStatus({ VENDOR_ID: vendor_id, FFT_STATUS: 2 }))
      }
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStep({
          STEP_ID: resolvedNextStep.step_id,
          STEP_STATUS: 'rejected',
          UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
        })
      )
      sqlList.push(
        await ApprovalQueueSQL.createApprovalLog({
          REQUEST_ID: dataItem.REQUEST_ID,
          STEP_ID: resolvedNextStep.step_id,
          ACTION_BY: dataItem.APPROVE_BY || dataItem.UPDATE_BY || 'SYSTEM',
          ACTION_TYPE: 'rejected',
          REMARK: dataItem.APPROVER_REMARK || 'Vendor disagreed after GPR negotiation',
        })
      )

      const trailingSteps = pendingAfterCurrent.filter((step) => step.step_id !== resolvedNextStep?.step_id)
      for (const trailingStep of trailingSteps) {
        sqlList.push(
          await ApprovalQueueSQL.updateApprovalStep({
            STEP_ID: trailingStep.step_id,
            STEP_STATUS: 'skipped',
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
  const approvalRemark = explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED ? buildActionRequiredRemark(dataItem) : dataItem.APPROVER_REMARK || ''
  const currentStepStatus =
    getStepType(currentStep) === StepType.PENDING_AGREEMENT && !disagreementRequested
      ? 'completed'
      : getStepType(currentStep) === StepType.AGREEMENT_REACHED && disagreementRequested
        ? 'pending'
        : 'approved'

  sqlList.push(
    await ApprovalQueueSQL.updateApprovalStep({
      STEP_ID: currentStep.step_id,
      STEP_STATUS: currentStepStatus,
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      REQUEST_ID: dataItem.REQUEST_ID,
      STEP_ID: currentStep.step_id,
      ACTION_BY: dataItem.APPROVE_BY || dataItem.UPDATE_BY || 'SYSTEM',
      ACTION_TYPE: approvalActionType,
      REMARK: approvalRemark,
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
          STEP_ID: remainingStep.step_id,
          STEP_STATUS: 'skipped',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
    }
  }

  if (nextStep) {
    if (getStepType(currentStep) === StepType.ISSUE_GPR_C && !disagreementRequested && !actionRequiredRequested && getStepType(nextStep) === StepType.AGREEMENT_REACHED) {
      sqlList.push(
        await ApprovalQueueSQL.updateApprovalStep({
          STEP_ID: nextStep.step_id,
          STEP_STATUS: 'pending',
          UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
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
          STEP_ID: nextStep.step_id,
          APPROVER_ID: nextStepApprover,
          ASSIGNMENT_MODE: 'AUTO',
          UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
        })
      )
    }
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStep({
        STEP_ID: nextStep.step_id,
        STEP_STATUS: 'in_progress',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
    )
    if (getStepType(nextStep) === StepType.ISSUE_GPR_B) {
      postCommitTasks.push(async () => {
        await triggerVendorDocumentEmail(dataItem.REQUEST_ID, nextStep?.DESCRIPTION)
      })
    } else if (getStepType(nextStep) === StepType.ISSUE_GPR_C) {
      postCommitTasks.push(async () => {
        await GprCApprovalService.createOrGetFlow({
          REQUEST_ID: dataItem.REQUEST_ID,
          UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
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
        REQUEST_ID: dataItem.REQUEST_ID,
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
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
    const requestId = Number(dataItem.REQUEST_ID) || 0
    if (!requestId) throw new Error('Invalid request_id')

    const sql = await ApprovalQueueSQL.getById({ REQUEST_ID: requestId })
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
      const requestId = Number(dataItem.REQUEST_ID)
      if (!requestId) throw new Error('Invalid request_id')

      const checkSql = await ApprovalQueueSQL.getRequestStatusAndAssign({ REQUEST_ID: requestId })
      const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
      const requestRaw = checkRes[0]
      if (!requestRaw) throw new Error('Request not found')
      const request = normalizeRequestRecord(requestRaw)

      const stepsSql = await ApprovalQueueSQL.getApprovalSteps({ REQUEST_ID: requestId })
      const steps = ((await MySQLExecute.search(stepsSql)) as ApprovalStep[]).map(normalizeApprovalStep)
      const currentStep = steps.find((step) => String(step.STEP_STATUS || step.step_status || '').toLowerCase() === 'in_progress')

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
          REQUEST_ID: requestId,
          STEP_ID: currentStep.step_id,
          ACTION_BY: dataItem.UPDATE_BY || 'SYSTEM',
          ACTION_TYPE: 'edited',
          REMARK: 'PIC edited request details',
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
      const newStatus = String(dataItem.REQUEST_STATUS || '')
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
      queuePostCommitTasks(postCommitTasks, dataItem.REQUEST_ID)

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
      const requestId = Number(dataItem.REQUEST_ID) || 0
      const scope = String(dataItem.SCOPE || 'REQUEST_PIC')
        .trim()
        .toUpperCase()
      const toEmpCode = String(dataItem.TO_EMPCODE || '').trim()
      const updateBy = dataItem.UPDATE_BY || dataItem.CHANGED_BY || 'SYSTEM'
      const reason = dataItem.REASON || ''

      if (!requestId) throw new Error('Missing request_id')
      if (scope !== 'REQUEST_PIC') throw new Error('Task Manager can only reassign PO PIC')
      if (!toEmpCode) throw new Error('Missing to_empcode')

      const requestSql = await ApprovalQueueSQL.getById({ REQUEST_ID: requestId })
      const requestRes = (await MySQLExecute.search(requestSql)) as RowDataPacket[]
      const request = requestRes[0] ? normalizeRequestRecord(requestRes[0]) : null
      if (!request) throw new Error('Request not found')

      const stepsSql = await ApprovalQueueSQL.getApprovalSteps({ REQUEST_ID: requestId })
      const steps = ((await MySQLExecute.search(stepsSql)) as ApprovalStep[]).map(normalizeApprovalStep)
      const currentStep = steps.find((step) => String(step.STEP_STATUS || step.step_status || '').toLowerCase() === 'in_progress')

      const isOversea = normalizeText(request.vendor_region) === 'oversea'
      const picGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC

      const assigneeSql = await ApprovalQueueSQL.getActiveAssigneeByEmpCodeAndGroupCode({
        EMPCODE: toEmpCode,
        GROUP_CODE: picGroupCode,
        GROUP_COMPACT: picGroupCode.replace(/[^A-Z0-9]/g, ''),
      })
      const assigneeRes = (await MySQLExecute.search(assigneeSql)) as RowDataPacket[]
      const targetAssignee = assigneeRes[0] || null
      if (!targetAssignee || Number(targetAssignee.INUSE) !== 1) throw new Error(`Target assignee must belong to group ${picGroupCode}`)

      const sqlList = []
      sqlList.push(
        await ApprovalQueueSQL.updateRequestPicAssignee({
          REQUEST_ID: requestId,
          ASSIGN_TO: targetAssignee.empcode,
          PIC_EMAIL: targetAssignee.empEmail || '',
          UPDATE_BY: updateBy,
        })
      )

      sqlList.push(
        await ApprovalQueueSQL.insertAssignmentHistory({
          REQUEST_ID: requestId,
          STEP_ID: currentStep?.step_id,
          SCOPE: scope,
          STEP_CODE: 'PIC_REVIEW',
          GROUP_CODE: picGroupCode,
          FROM_EMPCODE: request.assign_to || '',
          TO_EMPCODE: targetAssignee.empcode,
          REASON: reason,
          DESCRIPTION: 'PO PIC reassigned',
          CHANGED_BY: updateBy,
          CREATE_BY: updateBy,
          UPDATE_BY: updateBy,
        })
      )

      sqlList.push(
        await ApprovalQueueSQL.createApprovalLog({
          REQUEST_ID: requestId,
          STEP_ID: currentStep?.step_id,
          ACTION_BY: updateBy,
          ACTION_TYPE: 'reassigned_pic',
          REMARK: reason || `Reassigned to ${targetAssignee.empcode}`,
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
      const steps = ((await MySQLExecute.search(stepsSql)) as ApprovalStep[]).map(normalizeApprovalStep)
      const currentStep = steps.find((step) => String(step.STEP_STATUS || step.step_status || '').toLowerCase() === 'in_progress')

      const sqlList = []
      if (currentStep) {
        sqlList.push(
          await ApprovalQueueSQL.updateApprovalStep({
            STEP_ID: currentStep.step_id,
            STEP_STATUS: 'approved',
            UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
          })
        )
        sqlList.push(
          await ApprovalQueueSQL.createApprovalLog({
            REQUEST_ID: dataItem.REQUEST_ID,
            STEP_ID: currentStep.step_id,
            ACTION_BY: dataItem.UPDATE_BY || 'SYSTEM',
            ACTION_TYPE: 'approved',
            REMARK: dataItem.VENDOR_CODE ? `Vendor Code: ${dataItem.VENDOR_CODE}` : 'Registration completed',
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
