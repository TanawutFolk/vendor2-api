import { MySQLExecute } from '@businessData/dbExecute'
import { ApprovalQueueSQL } from '../../sql/_approval-queue/ApprovalQueueSQL'
import { RowDataPacket } from 'mysql2'
import {
  GROUP_CODE,
  isVendorCodeComplete,
  isPicStep,
  normalizeText,
  requiresVendorCode,
  requiresVendorReply,
  resolveRequestNumber,
  WORKFLOW_ACTION,
} from '../_request-register/RegisterRequestWorkflowHelper'
import {
  sendMail_ToApprover_NextStep,
  sendMail_ToPic_RecheckByApprover,
  sendMail_ToPic_RecheckByPoMgr,
  sendMail_ToUser_ActionRequired,
  sendMail_ToRequester_GprCApproved,
  sendMail_ToRequester_RegistrationCompleted,
  sendMail_ToPic_RequestRejected,
  sendMail_ToRequester_RegistrationIncomplete,
  sendMail_NegotiationStageDispatch,
} from '../_request-register/RegisterRequestNotificationHelper'
import { SelectionFileService } from '../_request-register/SelectionFileService'
import { GprCApprovalService } from '../_approval-GPRC/GprCApprovalService'
import { isTaskManagerReassignable } from '../_task-manager/TaskManagerRules'
import { prepareApprovalQueueSearchData } from './ApprovalQueueSearchData'
import {
  getApprovalStepStatusIdentity,
  getRequestStateIdentity,
  getRequestStatusIdentity,
  getVendorStatusIdentity,
  getWorkflowStepIdentity,
  type WorkspaceStatusIdentity,
} from '../_status-master/StatusIdentityService'

type ApprovalQueueWorkflowIdentity = Pick<WorkspaceStatusIdentity, 'workflowStep' | 'approvalStep' | 'requestState' | 'requestStatus' | 'vendor'>

const getApprovalQueueWorkflowIdentity = async (): Promise<ApprovalQueueWorkflowIdentity> => {
  const [workflowStep, approvalStep, requestState, requestStatus, vendor] = await Promise.all([
    getWorkflowStepIdentity(),
    getApprovalStepStatusIdentity(),
    getRequestStateIdentity(),
    getRequestStatusIdentity(),
    getVendorStatusIdentity(),
  ])

  return { workflowStep, approvalStep, requestState, requestStatus, vendor }
}

type ApprovalStepStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped'

interface ApprovalStep extends RowDataPacket {
  [key: string]: any
  step_id: number
  workflow_step_id?: number
  status_id?: number
  approval_step_status_id: number
  step_order: number
  step_status: ApprovalStepStatus
  step_code?: string
  approver_id?: string
  DESCRIPTION?: string
}

interface UpdateStatusPayload {
  [key: string]: any
  request_id: number
  current_task_id?: number
  lock_version?: number
  action_code?: string
  workflow_transition_id?: number
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
  request_status?: string
  request_state_id: number
  request_state: string
  current_status_id?: number
  current_step_id?: number
  workflow_definition_id?: number
  lock_version: number
}

interface WorkflowTransition extends RowDataPacket {
  [key: string]: any
  transition_id: number
  action_code: string
  terminal_request_state_id?: number
  terminal_state: string
  terminal_is_terminal: boolean
  condition_key: string
  nextStep?: ApprovalStep
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
  statusIdentity: ApprovalQueueWorkflowIdentity
}

interface SelectionRecord extends RowDataPacket {
  [key: string]: any
  selection_id?: number
  action_required_json?: string
  gpr_43_acceptance_status?: string
}

interface CriteriaRow extends RowDataPacket {
  [key: string]: any
  NO?: string
  CRITERIA?: string
  REMARK?: string
  UPLOADED_FILE?: string
  UPLOADED_NAME?: string
}

const normalizeApprovalStep = (step: any): ApprovalStep =>
  ({
    ...step,
    step_id: Number(step?.step_id ?? step?.REQUEST_APPROVAL_STEP_ID ?? 0),
    workflow_step_id: Number(step?.workflow_step_id ?? step?.WORKFLOW_STEP_MASTER_ID ?? 0) || undefined,
    status_id: Number(step?.status_id ?? step?.M_REQUEST_STATUS_ID ?? 0) || undefined,
    approval_step_status_id: Number(step?.approval_step_status_id ?? step?.M_APPROVAL_STEP_STATUS_ID ?? 0),
    request_id: Number(step?.request_id ?? step?.REQUEST_REGISTER_VENDOR_ID ?? 0),
    step_order: Number(step?.step_order ?? step?.STEP_ORDER ?? 0),
    approver_id: String(step?.approver_id ?? step?.APPROVER_EMPCODE ?? ''),
    step_status: String(step?.step_status ?? step?.STEP_STATUS ?? '') as ApprovalStepStatus,
    DESCRIPTION: step?.DESCRIPTION ?? step?.description ?? '',
    step_code: String(step?.step_code ?? step?.STEP_CODE ?? ''),
    actor_type: String(step?.actor_type ?? step?.ACTOR_TYPE ?? ''),
    group_code: String(step?.group_code ?? step?.GROUP_CODE ?? ''),
    assignment_mode: String(step?.assignment_mode ?? step?.ASSIGNMENT_MODE ?? ''),
    requires_vendor_reply: Number(step?.requires_vendor_reply ?? step?.REQUIRES_VENDOR_REPLY ?? 0),
    requires_vendor_code: Number(step?.requires_vendor_code ?? step?.REQUIRES_VENDOR_CODE ?? 0),
  }) as ApprovalStep

const normalizeApprovalLog = (log: any) => ({
  ...log,
  log_id: Number(log?.log_id ?? log?.REQUEST_APPROVAL_LOG_ID ?? 0),
  request_id: Number(log?.request_id ?? log?.REQUEST_REGISTER_VENDOR_ID ?? 0),
  step_id: Number(log?.step_id ?? log?.REQUEST_APPROVAL_STEP_ID ?? 0),
  action_by: String(log?.action_by ?? log?.ACTION_BY ?? ''),
  action_type: String(log?.action_type ?? log?.ACTION_TYPE ?? ''),
  remark: log?.remark ?? log?.RECHECK_REASON ?? log?.recheck_reason ?? log?.REJECT_REASON ?? log?.reject_reason ?? log?.DESCRIPTION ?? log?.description ?? '',
  RECHECK_REASON: log?.RECHECK_REASON ?? log?.recheck_reason ?? null,
  action_date: log?.action_date ?? log?.CREATE_DATE ?? log?.create_date ?? null,
  DESCRIPTION: log?.DESCRIPTION ?? log?.description ?? log?.remark ?? '',
  CREATE_BY: String(log?.CREATE_BY ?? log?.create_by ?? log?.ACTION_BY ?? log?.action_by ?? 'SYSTEM'),
  UPDATE_BY: String(log?.UPDATE_BY ?? log?.update_by ?? log?.ACTION_BY ?? log?.action_by ?? 'SYSTEM'),
  CREATE_DATE: log?.CREATE_DATE ?? log?.create_date ?? log?.action_date ?? null,
  UPDATE_DATE: log?.UPDATE_DATE ?? log?.update_date ?? log?.CREATE_DATE ?? log?.create_date ?? null,
  INUSE: Number(log?.INUSE ?? log?.inuse ?? 1),
})

const normalizeRequestRecord = (request: any): RequestRecord =>
  ({
    ...request,
    vendor_id: Number(request?.vendor_id ?? request?.VENDORS_ID ?? 0) || undefined,
    assign_to: String(request?.assign_to ?? request?.ASSIGN_TO ?? ''),
    request_number: String(request?.request_number ?? request?.REQUEST_NUMBER ?? ''),
    CREATE_DATE: request?.CREATE_DATE ?? request?.create_date,
    vendor_code_selector: String(request?.vendor_code_selector ?? request?.VENDOR_CODE_SELECTOR ?? ''),
    vendor_region: String(request?.vendor_region ?? request?.VENDOR_REGION ?? ''),
    request_status: String(request?.request_status ?? request?.REQUEST_STATUS ?? ''),
    request_state_id: Number(request?.request_state_id ?? request?.M_REQUEST_STATE_ID ?? 0),
    request_state: String(request?.request_state ?? request?.REQUEST_STATE ?? '')
      .trim()
      .toLowerCase(),
    current_status_id: Number(request?.current_status_id ?? request?.CURRENT_M_REQUEST_STATUS_ID ?? 0) || undefined,
    current_step_id: Number(request?.current_step_id ?? request?.CURRENT_REQUEST_APPROVAL_STEP_ID ?? 0) || undefined,
    workflow_definition_id: Number(request?.workflow_definition_id ?? request?.WORKFLOW_DEFINITION_ID ?? 0) || undefined,
    lock_version: Number(request?.lock_version ?? request?.LOCK_VERSION ?? 0),
  }) as RequestRecord

const normalizeWorkflowTransition = (row: any, requestId: number): WorkflowTransition => {
  const nextTaskId = Number(row?.NEXT_REQUEST_APPROVAL_STEP_ID || 0)
  const nextStep = nextTaskId
    ? normalizeApprovalStep({
        REQUEST_APPROVAL_STEP_ID: nextTaskId,
        REQUEST_REGISTER_VENDOR_ID: requestId,
        WORKFLOW_STEP_MASTER_ID: row?.TO_WORKFLOW_STEP_MASTER_ID,
        M_REQUEST_STATUS_ID: row?.NEXT_M_REQUEST_STATUS_ID,
        M_APPROVAL_STEP_STATUS_ID: row?.NEXT_STEP_STATUS_ID,
        STEP_ORDER: row?.NEXT_STEP_ORDER,
        APPROVER_EMPCODE: row?.NEXT_APPROVER_EMPCODE,
        STEP_STATUS: row?.NEXT_STEP_STATUS,
        GROUP_CODE: row?.NEXT_GROUP_CODE,
        ASSIGNMENT_MODE: row?.NEXT_ASSIGNMENT_MODE,
        DESCRIPTION: row?.NEXT_STATUS_VALUE,
        STEP_CODE: row?.NEXT_STEP_CODE,
        ACTOR_TYPE: row?.NEXT_ACTOR_TYPE,
        DEFAULT_GROUP_CODE_LOCAL: row?.NEXT_DEFAULT_GROUP_CODE_LOCAL,
        DEFAULT_GROUP_CODE_OVERSEA: row?.NEXT_DEFAULT_GROUP_CODE_OVERSEA,
        REQUIRES_VENDOR_REPLY: row?.NEXT_REQUIRES_VENDOR_REPLY,
        REQUIRES_VENDOR_CODE: row?.NEXT_REQUIRES_VENDOR_CODE,
      })
    : undefined

  return {
    ...row,
    transition_id: Number(row?.WORKFLOW_TRANSITION_ID || 0),
    action_code: String(row?.ACTION_CODE || '')
      .trim()
      .toUpperCase(),
    terminal_request_state_id: Number(row?.TERMINAL_REQUEST_STATE_ID || 0) || undefined,
    terminal_state: String(row?.TERMINAL_STATE || '')
      .trim()
      .toLowerCase(),
    terminal_is_terminal: Number(row?.TERMINAL_IS_TERMINAL || 0) === 1,
    condition_key: String(row?.CONDITION_KEY || '')
      .trim()
      .toUpperCase(),
    nextStep,
  } as WorkflowTransition
}

const normalizeSelectionRecord = (selection: any): SelectionRecord | null => {
  if (!selection) return null

  return {
    ...selection,
    selection_id: Number(selection?.selection_id ?? selection?.REQUEST_VENDOR_SELECTIONS_ID ?? 0),
    action_required_json: selection?.action_required_json ?? selection?.ACTION_REQUIRED_JSON,
    gpr_43_acceptance_status: String(selection?.gpr_43_acceptance_status ?? selection?.GPR_43_ACCEPTANCE_STATUS ?? ''),
  } as SelectionRecord
}

type SqlStatement = string
type SqlList = SqlStatement[]
type PostCommitTask = () => Promise<void>
type ServicePayload = Record<string, any>
const RECHECK_TO_PIC_CONDITION = 'RECHECK_TO_PIC'
type ReassignPayload = ServicePayload & {
  request_id?: number | string
  scope?: string
  to_empcode?: string
  UPDATE_BY?: string
  changed_by?: string
  reason?: string
}
type UpdateStatusResponse = {
  Status: boolean
  Message: string
  ResultOnDb: unknown
  MethodOnDb: string
  TotalCountOnDb: number
}

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback)

const isExpectedUpdateStatusError = (error: unknown) => {
  if (!(error instanceof Error)) return false

  const message = error.message || ''
  return [
    'Approval blocked:',
    'Action Required blocked:',
    'Unauthorized:',
    'Approver not yet assigned',
    'GPR B can be sent',
    'Action Required is only available',
    'Requester must complete',
    'GPR C approver must',
    'Issue GPR C step is not configured',
    'GPR C approver is not configured',
  ].some((prefix) => message.startsWith(prefix))
}

enum StepType {
  PO_PIC_IN_PROGRESS = 'PO_PIC_IN_PROGRESS',
  ISSUE_GPR_B = 'ISSUE_GPR_B',
  ISSUE_GPR_C = 'ISSUE_GPR_C',
  VENDOR_DISAGREED = 'VENDOR_DISAGREED',
  DOCUMENT_CHECK = 'DOCUMENT_CHECK',
  ACCOUNT_REGISTERED = 'ACCOUNT_REGISTERED',
  OTHER = 'OTHER',
}

const normalizeStatusText = (value: unknown) => normalizeText(String(value || '').replace(/[_-]+/g, ' '))

const getStepType = (step: Partial<ApprovalStep> | undefined, identity: Pick<WorkspaceStatusIdentity, 'workflowStep'>): StepType => {
  const stepId = Number(step?.workflow_step_id || 0)
  if (stepId === identity.workflowStep.poPicInProgress) return StepType.PO_PIC_IN_PROGRESS
  if (stepId === identity.workflowStep.issueGprB) return StepType.ISSUE_GPR_B
  if (stepId === identity.workflowStep.issueGprC) return StepType.ISSUE_GPR_C
  if (stepId === identity.workflowStep.vendorDisagreed) return StepType.VENDOR_DISAGREED
  if (stepId === identity.workflowStep.docCheck) return StepType.DOCUMENT_CHECK
  if (stepId === identity.workflowStep.accountRegistered) return StepType.ACCOUNT_REGISTERED
  return StepType.OTHER
}

const isStepType = (step: ApprovalStep | undefined, identity: Pick<WorkspaceStatusIdentity, 'workflowStep'>, ...types: StepType[]) =>
  step ? types.includes(getStepType(step, identity)) : false
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

const NEED_FILE_CRITERIA = ['4.2', '4.4', '4.5']
const OPTIONAL_CRITERIA = new Set(['4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '4.12', '4.13'])
const OPTIONAL_REQUIRED_COUNT = 3

const normalizeGpr43AcceptanceStatus = (value: unknown) => {
  const normalized = normalizeText(String(value || '').replace(/[_-]+/g, ' '))
  if (['accept', 'accepted', 'agree', 'agreed'].includes(normalized)) return 'ACCEPT'
  if (['not accept', 'not accepted', 'disagree', 'disagreed', 'reject', 'rejected'].includes(normalized)) return 'NOT_ACCEPT'
  return normalized.toUpperCase()
}

export const evaluateGprCriteria = (criteriaRows: CriteriaRow[], selection?: SelectionRecord | null) => {
  const rows = Array.isArray(criteriaRows) ? criteriaRows : []
  const normalizedRows = rows.map((row) => ({
    no: String(row?.NO || '').trim(),
    remark: String(row?.REMARK || '').trim(),
    uploaded_file: String(row?.UPLOADED_FILE || '').trim(),
  }))
  const gpr43Status = normalizeGpr43AcceptanceStatus(selection?.gpr_43_acceptance_status) || normalizeGpr43AcceptanceStatus(normalizedRows.find((row) => row.no === '4.3')?.remark)

  const optionalRows = normalizedRows.filter((row) => OPTIONAL_CRITERIA.has(row.no))

  const gpr43Accepted = gpr43Status === 'ACCEPT'
  const hasFile = (criteriaNo: string) =>
    normalizedRows.some((row) => row.no === criteriaNo && !!row.uploaded_file)
  const hasLawDocument = hasFile('4.1') || hasFile('4.11')
  const needPassed = gpr43Accepted && hasLawDocument && NEED_FILE_CRITERIA.every(hasFile)

  const optionalUploaded = optionalRows.filter((row) => !!row.uploaded_file).length
  const optionalPassed = optionalUploaded >= OPTIONAL_REQUIRED_COUNT

  return {
    hasCriteria: normalizedRows.length > 0,
    gpr43Accepted,
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

const createSelectionFolderForVendorRequest = (context: WorkflowContext) => {
  const requestNumber = resolveRequestNumber(context.request.request_number, context.dataItem.REQUEST_REGISTER_VENDOR_ID, context.request.CREATE_DATE)
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
    const selectionSql = await ApprovalQueueSQL.getSelection({ REQUEST_REGISTER_VENDOR_ID: context.dataItem.REQUEST_REGISTER_VENDOR_ID })
    const selectionRes = (await MySQLExecute.search(selectionSql)) as SelectionRecord[]
    selectionCache = normalizeSelectionRecord(selectionRes[0])
    return selectionCache
  }

  const resolveStepApprover = async (step: ApprovalStep | undefined) => {
    if (!step) return ''
    if (isPicStep(step)) {
      const currentPic = String(context.request.assign_to || '').trim()
      const picStepGroupCode =
        String(step.group_code || '')
          .trim()
          .toUpperCase() || picGroupCode
      if (currentPic && (await isActiveAssigneeInGroup(currentPic, picStepGroupCode))) {
        return currentPic
      }
      return getApproverByGroup(picStepGroupCode)
    }
    if (getStepType(step, context.statusIdentity) === StepType.ISSUE_GPR_C) {
      const selection = await getSelectionRecord()
      return getGprCApproverEmpCodeFromSelection(selection) || context.requesterCode
    }

    const stepGroupCode = String(step.group_code || '')
      .trim()
      .toUpperCase()
    if (step.approver_id && stepGroupCode && (await isActiveAssigneeInGroup(String(step.approver_id), stepGroupCode))) {
      return String(step.approver_id)
    }
    if (step.approver_id && !stepGroupCode) {
      return String(step.approver_id)
    }

    if (stepGroupCode) return getApproverByGroup(stepGroupCode)

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
  const [stepsRes, checkRes, requesterRes, statusIdentity] = await Promise.all([
    (async () => {
      const sql = await ApprovalQueueSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID })
      return MySQLExecute.search(sql) as Promise<ApprovalStep[]>
    })(),
    (async () => {
      const sql = await ApprovalQueueSQL.getRequestStatusContext({ REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID })
      return MySQLExecute.search(sql) as Promise<RequestRecord[]>
    })(),
    (async () => {
      const sql = await ApprovalQueueSQL.getRequesterByRequestId({ REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID })
      return MySQLExecute.search(sql) as Promise<RowDataPacket[]>
    })(),
    getApprovalQueueWorkflowIdentity(),
  ])

  const steps = stepsRes.map(normalizeApprovalStep)
  const request = normalizeRequestRecord(checkRes[0] || {})

  const currentStep =
    steps.find((step) => step.step_id === request.current_step_id && step.approval_step_status_id === statusIdentity.approvalStep.inProgress) ||
    steps.find((step) => step.approval_step_status_id === statusIdentity.approvalStep.inProgress)

  return {
    dataItem,
    request,
    steps,
    currentStep,
    isOversea: String(request.vendor_region || '').toLowerCase() === 'oversea',
    vendor_id: request.vendor_id,
    requesterCode: String(requesterRes[0]?.Request_By_EmployeeCode || requesterRes[0]?.REQUEST_BY_EMPLOYEECODE || '').trim(),
    selectedVendorCode: String(request.vendor_code_selector || ''),
    statusIdentity,
  }
}

const resolveConfiguredTransition = async (context: WorkflowContext, workflowTransitionId: number): Promise<WorkflowTransition> => {
  const currentStep = context.currentStep
  if (!currentStep?.workflow_step_id) {
    throw new Error('Workflow configuration error: current task has no workflow step identity.')
  }

  const sql = await ApprovalQueueSQL.getWorkflowTransitions({
    REQUEST_REGISTER_VENDOR_ID: context.dataItem.REQUEST_REGISTER_VENDOR_ID,
    CURRENT_WORKFLOW_STEP_MASTER_ID: currentStep.workflow_step_id,
    WORKFLOW_TRANSITION_ID: workflowTransitionId,
    M_REQUEST_IN_PROGRESS_STATE_ID: context.statusIdentity.requestState.inProgress,
  })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  if (!rows.length) {
    throw new Error(`Workflow transition ${workflowTransitionId} is not allowed for the current step.`)
  }

  const transition = normalizeWorkflowTransition(rows[0], context.dataItem.REQUEST_REGISTER_VENDOR_ID)
  const supportedConditions = new Set(['', 'GPR_ACCEPTED', 'GPR_B_REQUIRED', RECHECK_TO_PIC_CONDITION])
  if (!supportedConditions.has(transition.condition_key)) {
    throw new Error(`Workflow condition ${transition.condition_key} is not supported by this API version.`)
  }
  if (transition.TO_WORKFLOW_STEP_MASTER_ID && !transition.nextStep) {
    throw new Error(`Workflow configuration error: target task ${transition.NEXT_STEP_CODE || transition.TO_WORKFLOW_STEP_MASTER_ID} was not created for this request.`)
  }
  const targetStatusId = transition.nextStep?.approval_step_status_id
  const isReopenTransition = transition.condition_key === RECHECK_TO_PIC_CONDITION
  const canActivateTarget =
    !transition.nextStep ||
    targetStatusId === context.statusIdentity.approvalStep.pending ||
    targetStatusId === context.statusIdentity.approvalStep.rejected ||
    targetStatusId === context.statusIdentity.approvalStep.skipped ||
    (isReopenTransition && targetStatusId !== context.statusIdentity.approvalStep.inProgress)

  if (!canActivateTarget) {
    throw new Error('Workflow state changed. Please refresh the request and try again.')
  }

  return transition
}

const validateWorkflowVersion = (context: WorkflowContext) => {
  const payloadTaskId = Number(context.dataItem.CURRENT_TASK_ID ?? context.dataItem.current_task_id ?? 0)
  const payloadLockVersion = Number(context.dataItem.LOCK_VERSION ?? context.dataItem.lock_version)

  if (!context.currentStep || !context.request.current_step_id) {
    throw new Error('Request has no active approval task.')
  }
  if (!payloadTaskId) {
    throw new Error('current_task_id is required. Please refresh the request and try again.')
  }
  if (!Number.isInteger(payloadLockVersion) || payloadLockVersion < 0) {
    throw new Error('lock_version is required. Please refresh the request and try again.')
  }
  if (payloadTaskId !== context.request.current_step_id || payloadTaskId !== context.currentStep.step_id) {
    throw new Error('Workflow state changed. Please refresh the request and try again.')
  }
  if (payloadLockVersion !== context.request.lock_version) {
    throw new Error('Workflow state changed. Please refresh the request and try again.')
  }
  if (context.request.request_state_id !== context.statusIdentity.requestState.inProgress) {
    throw new Error('This request is no longer in progress.')
  }
}

const executeWorkflowSql = async (context: WorkflowContext, sqlList: SqlList) => {
  const guardSql = await ApprovalQueueSQL.acquireWorkflowLock({
    REQUEST_REGISTER_VENDOR_ID: context.dataItem.REQUEST_REGISTER_VENDOR_ID,
    CURRENT_TASK_ID: context.currentStep?.step_id,
    LOCK_VERSION: context.request.lock_version,
    M_REQUEST_IN_PROGRESS_STATE_ID: context.statusIdentity.requestState.inProgress,
    UPDATE_BY: context.dataItem.UPDATE_BY || context.dataItem.APPROVE_BY || 'SYSTEM',
  })
  return MySQLExecute.executeGuardedList(guardSql, sqlList)
}

const buildApprovalStepUpdateSql = (context: WorkflowContext, dataItem: Record<string, unknown>) =>
  ApprovalQueueSQL.updateApprovalStep({
    ...dataItem,
    M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: context.statusIdentity.approvalStep.inProgress,
    M_APPROVAL_STEP_REJECTED_STATUS_ID: context.statusIdentity.approvalStep.rejected,
    M_REQUEST_REJECTED_STATE_ID: context.statusIdentity.requestState.rejected,
    M_REQUEST_IN_PROGRESS_STATE_ID: context.statusIdentity.requestState.inProgress,
    M_REQUEST_REJECTED_STATUS_ID: context.statusIdentity.requestStatus.rejected,
  })

const hasVendorRequestLog = async (context: WorkflowContext) => {
  if (!context.currentStep || !requiresVendorReply(context.currentStep)) return false

  const logsSql = await ApprovalQueueSQL.getApprovalLogs({ REQUEST_REGISTER_VENDOR_ID: context.dataItem.REQUEST_REGISTER_VENDOR_ID })
  const logs = ((await MySQLExecute.search(logsSql)) as RowDataPacket[]).map(normalizeApprovalLog)
  return logs.some((log) => String(log.step_id || '') === String(context.currentStep?.step_id || '') && log.action_type === 'vendor_requested')
}

const validateCurrentStep = async (context: WorkflowContext, resolver: WorkflowResolver, transition: WorkflowTransition, explicitAction: string) => {
  const { currentStep, dataItem, request, selectedVendorCode } = context
  if (!currentStep) return

  const actionBy = String(dataItem.APPROVE_BY || dataItem.UPDATE_BY || '')
  const isCurrentPicStep = isPicStep(currentStep)
  const requiresRoleApprover = ['APPROVER', 'ACCOUNT'].includes(
    String(currentStep.actor_type || '')
      .trim()
      .toUpperCase()
  )

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

  if (requiresVendorCode(currentStep) && explicitAction !== WORKFLOW_ACTION.REJECT) {
    const extractedVendorCode = String(selectedVendorCode || '').trim()
    if (!isVendorCodeComplete(extractedVendorCode, context.isOversea)) {
      throw new Error('Approval blocked: You must open the Selection Form and specify the "Vendor Code" before approving this step.')
    }
    dataItem.VENDOR_CODE_EXTRACTED = extractedVendorCode
  }

  const requiresGprDecision = isStepType(currentStep, context.statusIdentity, StepType.PO_PIC_IN_PROGRESS)
  if (requiresGprDecision && explicitAction !== WORKFLOW_ACTION.REJECT && explicitAction !== WORKFLOW_ACTION.ACTION_REQUIRED) {
    const attemptingDisagree = explicitAction === WORKFLOW_ACTION.DISAGREE
    const attemptingApprove = !attemptingDisagree

    const selection = await resolver.getSelectionRecord()
    if (!selection?.selection_id) {
      throw new Error('Approval blocked: Please fill the Selection Form before proceeding.')
    }

    if (attemptingApprove) {
      const criteriaSql = await ApprovalQueueSQL.getCriteria({ REQUEST_VENDOR_SELECTIONS_ID: selection.selection_id })
      const criteriaRes = (await MySQLExecute.search(criteriaSql)) as CriteriaRow[]
      const gprEval = evaluateGprCriteria(criteriaRes, selection)

      if (!gprEval.hasCriteria) {
        throw new Error('Approval blocked: Please fill the Selection Form before proceeding.')
      }
      if (!gprEval.passed) {
        throw new Error(
          'Approval blocked: Selection Form does not pass criteria ' +
            '(4.3 must be ACCEPT; 4.1 or its 4.11 substitute, 4.2, 4.4 and 4.5 need files; and optional criteria need at least 3 files).'
        )
      }
    } else if (transition.condition_key === 'GPR_B_REQUIRED' || transition.nextStep?.workflow_step_id === context.statusIdentity.workflowStep.issueGprB) {
      const gpr43Status = normalizeGpr43AcceptanceStatus(selection.gpr_43_acceptance_status)
      if (gpr43Status !== 'NOT_ACCEPT') {
        throw new Error('GPR B can be sent to vendor only when item 4.3 is NOT_ACCEPT.')
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
      throw new Error(`Action Required blocked: please configure PIC email for ${stageLabel} in the Selection Form.`)
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
      REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
      VENDOR_CODE: dataItem.VENDOR_CODE_EXTRACTED,
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  if (vendor_id) {
    sqlList.push(
      await ApprovalQueueSQL.updateVendorFftVendorCode({
        VENDORS_ID: vendor_id,
        VENDOR_CODE: dataItem.VENDOR_CODE_EXTRACTED,
      })
    )
  }
}

const handleRejection = async (context: WorkflowContext, transition: WorkflowTransition, sqlList: SqlList, postCommitTasks: PostCommitTask[]) => {
  const { dataItem, currentStep, steps, vendor_id } = context
  if (vendor_id) {
    sqlList.push(
      await ApprovalQueueSQL.updateVendorFftStatus({
        VENDORS_ID: vendor_id,
        M_VENDOR_STATUS_ID: context.statusIdentity.vendor.cannotRegister,
      })
    )
  }
  if (currentStep) {
    sqlList.push(
      await buildApprovalStepUpdateSql(context, {
        REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
        M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.rejected,
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
      })
    )
    sqlList.push(
      await ApprovalQueueSQL.createApprovalLog({
        REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
        REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
        ACTION_BY: dataItem.APPROVE_BY || dataItem.UPDATE_BY || 'SYSTEM',
        ACTION_TYPE: 'rejected',
        ACTION_CODE: transition.action_code,
        REMARK: '',
        REJECT_REASON: dataItem.APPROVER_REMARK || '',
      })
    )
  }
  const pendingSteps = steps.filter((step) => step.approval_step_status_id === context.statusIdentity.approvalStep.pending)
  for (const pendingStep of pendingSteps) {
    sqlList.push(
      await buildApprovalStepUpdateSql(context, {
        REQUEST_APPROVAL_STEP_ID: pendingStep.step_id,
        M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.skipped,
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
    )
  }
  postCommitTasks.push(async () => sendMail_ToPic_RequestRejected(dataItem, currentStep))
}

const handleRecheckToPic = async (context: WorkflowContext, resolver: WorkflowResolver, transition: WorkflowTransition, sqlList: SqlList, postCommitTasks: PostCommitTask[]) => {
  const { dataItem, currentStep, steps } = context
  const targetStep = transition.nextStep

  if (!currentStep || !targetStep) {
    throw new Error('Workflow configuration error: Re-check to PO PIC requires both source and target tasks.')
  }
  const sourceWorkflowStepId = Number(currentStep.workflow_step_id || 0)
  const allowedSourceStepIds = new Set([context.statusIdentity.workflowStep.docCheck, context.statusIdentity.workflowStep.poMgrApproval])
  if (!allowedSourceStepIds.has(sourceWorkflowStepId) || targetStep.workflow_step_id !== context.statusIdentity.workflowStep.poPicInProgress) {
    throw new Error('Workflow configuration error: RECHECK_TO_PIC must connect Document Check or PO Mgr Approval to PO PIC In Progress.')
  }

  const updateBy = dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM'
  sqlList.push(
    await buildApprovalStepUpdateSql(context, {
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.pending,
      UPDATE_BY: updateBy,
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      ACTION_BY: dataItem.APPROVE_BY || updateBy,
      ACTION_TYPE: transition.action_code.toLowerCase(),
      ACTION_CODE: transition.action_code,
      REMARK: '',
      RECHECK_REASON: dataItem.APPROVER_REMARK || '',
    })
  )

  // A re-check restarts the main workflow from PO PIC. Clear every later decision so the
  // selected GPR branch and all approvals can run again without reusing an approved task.
  const downstreamSteps = steps.filter((step) => step.step_id !== currentStep.step_id && step.step_id !== targetStep.step_id && step.step_order > targetStep.step_order)
  for (const downstreamStep of downstreamSteps) {
    sqlList.push(
      await buildApprovalStepUpdateSql(context, {
        REQUEST_APPROVAL_STEP_ID: downstreamStep.step_id,
        M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.pending,
        UPDATE_BY: updateBy,
      })
    )
  }

  const targetApprover = await resolver.resolveStepApprover(targetStep)
  if (targetApprover && targetApprover !== targetStep.approver_id) {
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStepApprover({
        REQUEST_APPROVAL_STEP_ID: targetStep.step_id,
        APPROVER_EMPCODE: targetApprover,
        ASSIGNMENT_MODE: 'AUTO',
        UPDATE_BY: updateBy,
      })
    )
  }
  sqlList.push(
    await buildApprovalStepUpdateSql(context, {
      REQUEST_APPROVAL_STEP_ID: targetStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.inProgress,
      UPDATE_BY: updateBy,
    })
  )

  const isPoMgrRecheck = sourceWorkflowStepId === context.statusIdentity.workflowStep.poMgrApproval
  postCommitTasks.push(async () => (isPoMgrRecheck ? sendMail_ToPic_RecheckByPoMgr(dataItem, currentStep) : sendMail_ToPic_RecheckByApprover(dataItem, currentStep)))
}

const handleVendorReplyRequest = async (
  context: WorkflowContext,
  resolver: WorkflowResolver,
  transition: WorkflowTransition,
  sqlList: SqlList,
  hasRequestLog: boolean
): Promise<UpdateStatusResponse | null> => {
  const { dataItem, currentStep } = context
  if (!currentStep) return null

  const isNegotiationBranchCurrentStep = isStepType(currentStep, context.statusIdentity, StepType.PO_PIC_IN_PROGRESS, StepType.ISSUE_GPR_B, StepType.ISSUE_GPR_C)
  if (!requiresVendorReply(currentStep) || hasRequestLog || isNegotiationBranchCurrentStep) return null

  sqlList.push(
    await buildApprovalStepUpdateSql(context, {
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.approved,
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      ACTION_BY: dataItem.APPROVE_BY || dataItem.UPDATE_BY || 'SYSTEM',
      ACTION_TYPE: 'vendor_requested',
      ACTION_CODE: transition.action_code,
      REMARK: 'Vendor document request email has been sent',
    })
  )

  const nextStep = transition.nextStep
  if (!nextStep) {
    throw new Error('Workflow configuration error: vendor request action has no target task.')
  }

  const nextStepApprover = await resolver.resolveStepApprover(nextStep)
  if (nextStepApprover && nextStepApprover !== nextStep.approver_id) {
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStepApprover({
        REQUEST_APPROVAL_STEP_ID: nextStep.step_id,
        APPROVER_EMPCODE: nextStepApprover,
        ASSIGNMENT_MODE: 'AUTO',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
    )
  }
  sqlList.push(
    await buildApprovalStepUpdateSql(context, {
      REQUEST_APPROVAL_STEP_ID: nextStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.inProgress,
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )

  createSelectionFolderForVendorRequest(context)

  const resultData = await executeWorkflowSql(context, sqlList)
  const mailResult = await sendMail_NegotiationStageDispatch(dataItem.REQUEST_REGISTER_VENDOR_ID)
  const mailMessage = mailResult?.sent
    ? 'Document sent to vendor. Waiting for vendor response before the next approval step.'
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
    getStepType(currentStep, context.statusIdentity) === StepType.ISSUE_GPR_C &&
    !!requesterCode &&
    String(currentStep.approver_id || '').trim() === requesterCode &&
    actionBy === requesterCode

  if (!isRequesterGprCPhase || disagreementRequested || actionRequiredRequested) return null

  const selection = await resolver.getSelectionRecord()
  const requesterHeadEmpCode = getGprCApproverEmpCodeFromSelection(selection)

  if (!requesterHeadEmpCode) {
    throw new Error('Requester must complete GPR C setup before submitting to requester head approval.')
  }
  if (requesterHeadEmpCode === requesterCode) {
    throw new Error('GPR C approver must be different from requester.')
  }

  sqlList.push(
    await ApprovalQueueSQL.updateApprovalStepApprover({
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      APPROVER_EMPCODE: requesterHeadEmpCode,
      ASSIGNMENT_MODE: 'AUTO',
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  sqlList.push(
    await buildApprovalStepUpdateSql(context, {
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.inProgress,
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      ACTION_BY: actionBy || 'SYSTEM',
      ACTION_TYPE: 'submitted_to_requester_head',
      REMARK: dataItem.APPROVER_REMARK || 'Requester submitted GPR C to requester head approval',
    })
  )

  const resultData = await executeWorkflowSql(context, sqlList)
  postCommitTasks.push(async () => {
    await sendMail_NegotiationStageDispatch(dataItem.REQUEST_REGISTER_VENDOR_ID, currentStep?.DESCRIPTION || 'Issue GPR C')
  })
  queuePostCommitTasks(postCommitTasks, dataItem.REQUEST_REGISTER_VENDOR_ID)

  return {
    Status: true,
    Message: 'GPR C submitted to requester head approval successfully',
    ResultOnDb: resultData,
    MethodOnDb: 'Update Status Success',
    TotalCountOnDb: sqlList.length,
  }
}

const handleNormalApproval = async (
  context: WorkflowContext,
  resolver: WorkflowResolver,
  transition: WorkflowTransition,
  sqlList: SqlList,
  postCommitTasks: PostCommitTask[],
  explicitAction: string
) => {
  const { dataItem, currentStep, vendor_id } = context
  if (!currentStep) return

  const actionRequiredRequested = explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED
  const disagreementRequested = explicitAction === WORKFLOW_ACTION.DISAGREE
  const approvalActionType = actionRequiredRequested ? 'action_required' : disagreementRequested ? 'vendor_disagreed' : explicitAction.toLowerCase()
  const approvalRemark = actionRequiredRequested ? buildActionRequiredRemark(dataItem) : dataItem.APPROVER_REMARK || ''

  sqlList.push(
    await buildApprovalStepUpdateSql(context, {
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.approved,
      UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
    })
  )
  sqlList.push(
    await ApprovalQueueSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      ACTION_BY: dataItem.APPROVE_BY || dataItem.UPDATE_BY || 'SYSTEM',
      ACTION_TYPE: approvalActionType,
      ACTION_CODE: explicitAction,
      REMARK: disagreementRequested ? '' : approvalRemark,
      REJECT_REASON: disagreementRequested ? approvalRemark : undefined,
    })
  )

  if (transition.terminal_is_terminal && transition.terminal_request_state_id === context.statusIdentity.requestState.rejected) {
    if (vendor_id) {
      sqlList.push(
        await ApprovalQueueSQL.updateVendorFftStatus({
          VENDORS_ID: vendor_id,
          M_VENDOR_STATUS_ID: context.statusIdentity.vendor.cannotRegister,
        })
      )
    }
    if (transition.nextStep) {
      sqlList.push(
        await buildApprovalStepUpdateSql(context, {
          REQUEST_APPROVAL_STEP_ID: transition.nextStep.step_id,
          M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.rejected,
          UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
        })
      )
    }
    sqlList.push(
      await ApprovalQueueSQL.skipPendingApprovalSteps({
        REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
        M_APPROVAL_STEP_SKIPPED_STATUS_ID: context.statusIdentity.approvalStep.skipped,
        M_APPROVAL_STEP_PENDING_STATUS_ID: context.statusIdentity.approvalStep.pending,
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
      })
    )
    postCommitTasks.push(async () => sendMail_ToRequester_RegistrationIncomplete(dataItem))
    return
  }

  if (transition.terminal_request_state_id) {
    if (!transition.terminal_is_terminal) {
      throw new Error(`Workflow state ${transition.terminal_state || transition.terminal_request_state_id} is not configured as terminal.`)
    }
    if (transition.terminal_request_state_id !== context.statusIdentity.requestState.completed) {
      throw new Error(`Workflow terminal request state ${transition.terminal_state || transition.terminal_request_state_id} is not supported by this API version.`)
    }
    if (vendor_id) {
      sqlList.push(
        await ApprovalQueueSQL.updateVendorFftStatus({
          VENDORS_ID: vendor_id,
          M_VENDOR_STATUS_ID: context.statusIdentity.vendor.registered,
        })
      )
    }
    sqlList.push(
      await ApprovalQueueSQL.skipPendingApprovalSteps({
        REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
        M_APPROVAL_STEP_SKIPPED_STATUS_ID: context.statusIdentity.approvalStep.skipped,
        M_APPROVAL_STEP_PENDING_STATUS_ID: context.statusIdentity.approvalStep.pending,
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
      })
    )
    sqlList.push(
      await ApprovalQueueSQL.markRequestCompleted({
        REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
        M_REQUEST_COMPLETED_STATE_ID: context.statusIdentity.requestState.completed,
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
      })
    )
    if (actionRequiredRequested) {
      postCommitTasks.push(async () => sendMail_ToUser_ActionRequired(dataItem, currentStep))
    }
    postCommitTasks.push(async () => sendMail_ToRequester_RegistrationCompleted(dataItem))
    return
  }

  const nextStep = transition.nextStep
  if (!nextStep) {
    throw new Error(`Workflow configuration error: action ${explicitAction} has neither a target task nor a terminal state.`)
  }

  const nextStepApprover = await resolver.resolveStepApprover(nextStep)
  if (getStepType(nextStep, context.statusIdentity) === StepType.ISSUE_GPR_C && !nextStepApprover) {
    throw new Error('GPR C approver is not configured. Please set GPR C Approver before sending GPR C.')
  }
  if (nextStepApprover && nextStepApprover !== nextStep.approver_id) {
    sqlList.push(
      await ApprovalQueueSQL.updateApprovalStepApprover({
        REQUEST_APPROVAL_STEP_ID: nextStep.step_id,
        APPROVER_EMPCODE: nextStepApprover,
        ASSIGNMENT_MODE: 'AUTO',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
    )
  }
  sqlList.push(
    await buildApprovalStepUpdateSql(context, {
      REQUEST_APPROVAL_STEP_ID: nextStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: context.statusIdentity.approvalStep.inProgress,
      UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
    })
  )

  if (getStepType(nextStep, context.statusIdentity) === StepType.ISSUE_GPR_B) {
    postCommitTasks.push(async () => {
      await sendMail_NegotiationStageDispatch(dataItem.REQUEST_REGISTER_VENDOR_ID, nextStep.DESCRIPTION)
    })
  } else if (getStepType(nextStep, context.statusIdentity) === StepType.ISSUE_GPR_C) {
    postCommitTasks.push(async () => {
      await GprCApprovalService.createOrGetFlow({
        REQUEST_REGISTER_VENDOR_ID: dataItem.REQUEST_REGISTER_VENDOR_ID,
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.APPROVE_BY || 'SYSTEM',
      })
    })
  } else {
    postCommitTasks.push(async () => sendMail_ToApprover_NextStep(dataItem, nextStep, nextStepApprover))
  }
  if (getStepType(currentStep, context.statusIdentity) === StepType.ISSUE_GPR_C && explicitAction === WORKFLOW_ACTION.APPROVE) {
    postCommitTasks.push(async () => sendMail_ToRequester_GprCApproved(dataItem))
  }
  if (actionRequiredRequested) {
    postCommitTasks.push(async () => sendMail_ToUser_ActionRequired(dataItem, currentStep))
  }
}
const runPostCommitTasks = async (tasks: PostCommitTask[], _requestId: number) => {
  const results = await Promise.allSettled(tasks.map((task) => task()))
  results.forEach((result, _index) => {
    if (result.status === 'rejected') {
      // console.error('[ApprovalQueueService.updateStatus] postCommitTask failed', {
      // taskIndex: index,
      // request_id: requestId,
      // error: result.reason instanceof Error ? result.reason.message : result.reason,
      // })
    }
  })
}

const queuePostCommitTasks = (tasks: PostCommitTask[], requestId: number) => {
  void runPostCommitTasks(tasks, requestId)
}

export const ApprovalQueueService = {
  getAllRequests: async (dataItem: ServicePayload, _sqlWhere: string = '') => {
    prepareApprovalQueueSearchData(dataItem)
    const sqlArray = await ApprovalQueueSQL.getAllRequests(dataItem)
    const result = (await MySQLExecute.searchList(sqlArray)) as RowDataPacket[][]

    return {
      totalCount: result[0]?.[0]?.TOTAL_COUNT || 0,
      data: result[1] || [],
    }
  },

  getById: async (dataItem: ServicePayload) => {
    const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID) || 0
    if (!requestId) throw new Error('Invalid request_id')

    const [workflowStep, approvalStep] = await Promise.all([getWorkflowStepIdentity(), getApprovalStepStatusIdentity()])
    const sql = await ApprovalQueueSQL.getById({
      REQUEST_REGISTER_VENDOR_ID: requestId,
      EDITABLE_WORKFLOW_STEP_MASTER_IDS: [workflowStep.poPicInProgress, workflowStep.docCheck],
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: approvalStep.inProgress,
    })
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
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Invalid request_id')

      const checkSql = await ApprovalQueueSQL.getRequestStatusAndAssign({ REQUEST_REGISTER_VENDOR_ID: requestId })
      const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
      const requestRaw = checkRes[0]
      if (!requestRaw) throw new Error('Request not found')
      const request = normalizeRequestRecord(requestRaw)

      const stepsSql = await ApprovalQueueSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: requestId })
      const [stepRows, approvalStep, requestState] = await Promise.all([
        MySQLExecute.search(stepsSql) as Promise<ApprovalStep[]>,
        getApprovalStepStatusIdentity(),
        getRequestStateIdentity(),
      ])
      const steps = stepRows.map(normalizeApprovalStep)
      const currentStep = steps.find((step) => step.step_id === request.current_step_id && step.approval_step_status_id === approvalStep.inProgress)

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
          REQUEST_REGISTER_VENDOR_ID: requestId,
          REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
          ACTION_BY: dataItem.UPDATE_BY || 'SYSTEM',
          ACTION_TYPE: 'edited',
          REMARK: 'PIC edited request details',
        })
      )

      const guardSql = await ApprovalQueueSQL.acquireWorkflowLock({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        CURRENT_TASK_ID: currentStep.step_id,
        LOCK_VERSION: request.lock_version,
        M_REQUEST_IN_PROGRESS_STATE_ID: requestState.inProgress,
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
      const resultData = await MySQLExecute.executeGuardedList(guardSql, sqlList)
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
      const workflowTransitionId = Number(dataItem.WORKFLOW_TRANSITION_ID ?? dataItem.workflow_transition_id ?? 0)
      if (!Number.isInteger(workflowTransitionId) || workflowTransitionId <= 0) {
        throw new Error('workflow_transition_id is required. Allowed IDs come from ALLOWED_ACTIONS on the request.')
      }

      const context = await loadWorkflowContext(dataItem)
      validateWorkflowVersion(context)
      const transition = await resolveConfiguredTransition(context, workflowTransitionId)
      const explicitAction = transition.action_code
      if (!explicitAction) throw new Error('Workflow transition has no configured action.')
      const actionRequiredRequested = explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED
      const disagreementRequested = explicitAction === WORKFLOW_ACTION.DISAGREE
      const resolver = createWorkflowResolver(context)
      const vendorRequestLogExists = await hasVendorRequestLog(context)
      const postCommitTasks: PostCommitTask[] = []
      const sqlList: SqlList = []

      await validateCurrentStep(context, resolver, transition, explicitAction)
      await addVendorCodeUpdates(context, sqlList)

      if (explicitAction === WORKFLOW_ACTION.REJECT) {
        if (transition.terminal_is_terminal && transition.terminal_request_state_id === context.statusIdentity.requestState.rejected) {
          await handleRejection(context, transition, sqlList, postCommitTasks)
        } else {
          throw new Error('Workflow configuration error: REJECT must end as rejected.')
        }
      } else if (explicitAction === WORKFLOW_ACTION.RECHECK) {
        if (transition.condition_key === RECHECK_TO_PIC_CONDITION) {
          await handleRecheckToPic(context, resolver, transition, sqlList, postCommitTasks)
        } else {
          throw new Error('Workflow configuration error: RECHECK must target PO PIC.')
        }
      } else if (context.currentStep) {
        const vendorReplyResponse = await handleVendorReplyRequest(context, resolver, transition, sqlList, vendorRequestLogExists)
        if (vendorReplyResponse) return vendorReplyResponse

        const gprCRequesterResponse = await handleGprCRequesterPhase(context, resolver, sqlList, postCommitTasks, disagreementRequested, actionRequiredRequested)
        if (gprCRequesterResponse) return gprCRequesterResponse

        await handleNormalApproval(context, resolver, transition, sqlList, postCommitTasks, explicitAction)
      }

      const resultData = await executeWorkflowSql(context, sqlList)
      queuePostCommitTasks(postCommitTasks, dataItem.REQUEST_REGISTER_VENDOR_ID)

      return {
        Status: true,
        Message: 'Status updated successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Update Status Success',
        TotalCountOnDb: sqlList.length,
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Update status failed')
      if (isExpectedUpdateStatusError(error)) {
        // console.warn('ApprovalQueueService.updateStatus blocked:', message)
      } else {
        // console.error('Error in ApprovalQueueService.updateStatus:', error)
      }

      return {
        Status: false,
        Message: message,
        ResultOnDb: [],
        MethodOnDb: 'Update Status Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  reassignAssignment: async (dataItem: ReassignPayload) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID) || 0
      const scope = String(dataItem.SCOPE || 'REQUEST_PIC')
        .trim()
        .toUpperCase()
      const toEmpCode = String(dataItem.TO_EMPCODE || '').trim()
      const updateBy = dataItem.UPDATE_BY || dataItem.CHANGED_BY || 'SYSTEM'
      const reason = String(dataItem.REASON || '').trim()

      if (!requestId) throw new Error('Missing request_id')
      if (scope !== 'REQUEST_PIC') throw new Error('Task Manager can only reassign PO PIC')
      if (!toEmpCode) throw new Error('Missing to_empcode')
      if (!reason) throw new Error('Reassignment reason is required')

      const [workflowStep, approvalStep, requestState] = await Promise.all([getWorkflowStepIdentity(), getApprovalStepStatusIdentity(), getRequestStateIdentity()])
      const requestSql = await ApprovalQueueSQL.getById({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        EDITABLE_WORKFLOW_STEP_MASTER_IDS: [workflowStep.poPicInProgress, workflowStep.docCheck],
        M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: approvalStep.inProgress,
      })
      const requestRes = (await MySQLExecute.search(requestSql)) as RowDataPacket[]
      const request = requestRes[0] ? normalizeRequestRecord(requestRes[0]) : null
      if (!request) throw new Error('Request not found')

      const stepsSql = await ApprovalQueueSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: requestId })
      const stepRows = (await MySQLExecute.search(stepsSql)) as ApprovalStep[]
      const steps = stepRows.map(normalizeApprovalStep)
      const currentStep = steps.find((step) => step.step_id === request.current_step_id && step.approval_step_status_id === approvalStep.inProgress)

      if (!isTaskManagerReassignable(request.request_state_id, requestState.inProgress, Boolean(currentStep))) {
        throw new Error('Only requests with an active workflow step can be reassigned')
      }
      if (toEmpCode === request.assign_to) throw new Error('The selected employee is already assigned to this request')

      const isOversea = normalizeText(request.vendor_region) === 'oversea'
      const picGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC

      const assigneeSql = await ApprovalQueueSQL.getActiveAssigneeByEmpCodeAndGroupCode({
        EMPCODE: toEmpCode,
        GROUP_CODE: picGroupCode,
        GROUP_COMPACT: picGroupCode.replace(/[^A-Z0-9]/g, ''),
      })
      const assigneeRes = (await MySQLExecute.search(assigneeSql)) as RowDataPacket[]
      const targetAssignee = assigneeRes[0] || null
      const targetActive = Number(targetAssignee?.inuse ?? targetAssignee?.INUSE ?? 0)
      if (!targetAssignee || targetActive !== 1) throw new Error(`Target assignee must belong to group ${picGroupCode}`)
      const targetEmpCode = String(targetAssignee.empcode ?? targetAssignee.EMPCODE ?? '').trim()
      const targetEmail = String(targetAssignee.empEmail ?? targetAssignee.EMPEMAIL ?? '').trim()
      if (!targetEmpCode) throw new Error('Target assignee employee code is missing')

      const sqlList = []
      sqlList.push(
        await ApprovalQueueSQL.updateRequestPicAssignee({
          REQUEST_REGISTER_VENDOR_ID: requestId,
          ASSIGN_TO: targetEmpCode,
          PIC_EMAIL: targetEmail,
          UPDATE_BY: updateBy,
        })
      )

      sqlList.push(
        await ApprovalQueueSQL.insertAssignmentHistory({
          REQUEST_REGISTER_VENDOR_ID: requestId,
          REQUEST_APPROVAL_STEP_ID: currentStep?.step_id,
          SCOPE: scope,
          STEP_CODE: currentStep?.step_code || 'REQUEST_PIC',
          GROUP_CODE: picGroupCode,
          FROM_EMPCODE: request.assign_to || '',
          TO_EMPCODE: targetEmpCode,
          REASON: reason,
          DESCRIPTION: 'PO PIC reassigned',
          CHANGED_BY: updateBy,
          CREATE_BY: updateBy,
          UPDATE_BY: updateBy,
        })
      )

      sqlList.push(
        await ApprovalQueueSQL.createApprovalLog({
          REQUEST_REGISTER_VENDOR_ID: requestId,
          REQUEST_APPROVAL_STEP_ID: currentStep?.step_id,
          ACTION_BY: updateBy,
          ACTION_TYPE: 'reassigned_pic',
          REMARK: reason,
        })
      )

      const guardSql = await ApprovalQueueSQL.acquireWorkflowLock({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        CURRENT_TASK_ID: currentStep?.step_id,
        LOCK_VERSION: request.lock_version,
        M_REQUEST_IN_PROGRESS_STATE_ID: requestState.inProgress,
        UPDATE_BY: updateBy,
      })
      const resultData = await MySQLExecute.executeGuardedList(guardSql, sqlList)
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
}
