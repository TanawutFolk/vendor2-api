import { STATUS_MASTER_TYPE } from '../../types/StatusMaster'
import { StatusMasterService } from './StatusMasterService'

export interface WorkflowStepIdentity {
  requestSubmitted: number
  picReview: number
  poPicInProgress: number
  vendorDisagreed: number
  issueGprB: number
  issueGprC: number
  docCheck: number | null
  poMgrApproval: number
  poGmApproval: number
  mdApproval: number
  accountRegistered: number
}

export interface WorkflowStepTypeIdentity {
  requestSubmitted: number
  picReview: number
  poPicInProgress: number
  vendorDisagreed: number
  issueGprB: number
  issueGprC: number
  docCheck: number
  poMgrApproval: number
  poGmApproval: number
  mdApproval: number
  accountRegistered: number
}

export interface ApprovalStepStatusIdentity {
  pending: number
  inProgress: number
  approved: number
  rejected: number
  skipped: number
}

export interface RequestStateIdentity {
  inProgress: number
  completed: number
  rejected: number
  cancelled: number
}

export interface RequestStatusIdentity {
  rejected: number
}

export interface VendorStatusIdentity {
  notRegistered: number
  registered: number
  inProgress: number
  cannotRegister: number
}

export interface GprCFlowStatusIdentity {
  draft: number
  requesterSetup: number
  inProgress: number
  recheckRequired: number
  approved: number
  rejected: number
}

export interface ActionResultStatusIdentity {
  pending: number
  incomplete: number
  completed: number
}

export interface WorkspaceStatusIdentity {
  workflowStep: WorkflowStepIdentity
  workflowStepType: WorkflowStepTypeIdentity
  approvalStep: ApprovalStepStatusIdentity
  requestState: RequestStateIdentity
  requestStatus: RequestStatusIdentity
  vendor: VendorStatusIdentity
  gprCFlow: GprCFlowStatusIdentity
  actionResult: ActionResultStatusIdentity
}

const CACHE_TTL_MS = 5 * 60 * 1000
const normalizeCode = (value: unknown) => String(value ?? '').trim().toUpperCase()

const createCachedLoader = <T>(loader: () => Promise<T>) => {
  let cachedValue: T | null = null
  let cacheExpiresAt = 0
  let pendingValue: Promise<T> | null = null

  return async () => {
    const now = Date.now()
    if (cachedValue !== null && now < cacheExpiresAt) return cachedValue
    if (pendingValue) return pendingValue

    pendingValue = loader()
      .then(value => {
        cachedValue = value
        cacheExpiresAt = Date.now() + CACHE_TTL_MS
        return value
      })
      .finally(() => {
        pendingValue = null
      })

    return pendingValue
  }
}

const requireMasterId = (
  rows: any[],
  masterType: string,
  statusCode: string,
  options: { allowZero?: boolean } = {}
) => {
  const row = rows.find(
    item => normalizeCode(item?.MASTER_TYPE) === masterType && normalizeCode(item?.STATUS_CODE) === statusCode
  )
  const id = Number(row?.STATUS_ID)
  const minimumId = options.allowZero ? 0 : 1

  if (!Number.isInteger(id) || id < minimumId) {
    throw new Error(`Missing active status master: ${masterType}.${statusCode}`)
  }

  return id
}

const loadStatusMasterRows = (masterType: keyof typeof STATUS_MASTER_TYPE) =>
  StatusMasterService.getStatusMasters({ MASTER_TYPE: masterType })

const workflowStepIdentityLoaders = new Map<number, () => Promise<WorkflowStepIdentity>>()

const createWorkflowStepIdentityLoader = (workflowDefinitionId?: number) => createCachedLoader<WorkflowStepIdentity>(async () => {
  const rows = await StatusMasterService.getActiveWorkflowStepMasters({
    WORKFLOW_DEFINITION_ID: workflowDefinitionId,
  })
  const requireWorkflowStepId = (stepCode: string) => {
    const row = rows.find(item => normalizeCode(item?.STEP_CODE) === stepCode)
    const id = Number(row?.WORKFLOW_STEP_MASTER_ID)

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Missing active workflow step master: ${stepCode}`)
    }

    return id
  }
  const optionalWorkflowStepId = (stepCode: string) => {
    const row = rows.find(item => normalizeCode(item?.STEP_CODE) === stepCode)
    const id = Number(row?.WORKFLOW_STEP_MASTER_ID)
    return Number.isInteger(id) && id > 0 ? id : null
  }

  return {
    requestSubmitted: requireWorkflowStepId('REQUEST_SUBMITTED'),
    picReview: requireWorkflowStepId('PIC_REVIEW'),
    poPicInProgress: requireWorkflowStepId('PO_PIC_IN_PROGRESS'),
    vendorDisagreed: requireWorkflowStepId('VENDOR_DISAGREED'),
    issueGprB: requireWorkflowStepId('ISSUE_GPR_B'),
    issueGprC: requireWorkflowStepId('ISSUE_GPR_C'),
    docCheck: optionalWorkflowStepId('DOC_CHECK'),
    poMgrApproval: requireWorkflowStepId('PO_MGR_APPROVAL'),
    poGmApproval: requireWorkflowStepId('PO_GM_APPROVAL'),
    mdApproval: requireWorkflowStepId('MD_APPROVAL'),
    accountRegistered: requireWorkflowStepId('ACCOUNT_REGISTERED'),
  }
})

export const getWorkflowStepIdentity = (workflowDefinitionId?: number) => {
  const cacheKey = Number(workflowDefinitionId) || 0
  let loader = workflowStepIdentityLoaders.get(cacheKey)
  if (!loader) {
    loader = createWorkflowStepIdentityLoader(cacheKey || undefined)
    workflowStepIdentityLoaders.set(cacheKey, loader)
  }
  return loader()
}

export const getWorkflowStepTypeIdentity = createCachedLoader<WorkflowStepTypeIdentity>(async () => {
  const rows = await StatusMasterService.getWorkflowStepTypes()
  const requireWorkflowStepTypeId = (stepCode: string) => {
    const row = rows.find(item => normalizeCode(item?.STEP_CODE) === stepCode)
    const id = Number(row?.WORKFLOW_STEP_TYPE_ID)
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Missing active workflow step type: ${stepCode}`)
    }
    return id
  }

  return {
    requestSubmitted: requireWorkflowStepTypeId('REQUEST_SUBMITTED'),
    picReview: requireWorkflowStepTypeId('PIC_REVIEW'),
    poPicInProgress: requireWorkflowStepTypeId('PO_PIC_IN_PROGRESS'),
    vendorDisagreed: requireWorkflowStepTypeId('VENDOR_DISAGREED'),
    issueGprB: requireWorkflowStepTypeId('ISSUE_GPR_B'),
    issueGprC: requireWorkflowStepTypeId('ISSUE_GPR_C'),
    docCheck: requireWorkflowStepTypeId('DOC_CHECK'),
    poMgrApproval: requireWorkflowStepTypeId('PO_MGR_APPROVAL'),
    poGmApproval: requireWorkflowStepTypeId('PO_GM_APPROVAL'),
    mdApproval: requireWorkflowStepTypeId('MD_APPROVAL'),
    accountRegistered: requireWorkflowStepTypeId('ACCOUNT_REGISTERED'),
  }
})

export const getApprovalStepStatusIdentity = createCachedLoader<ApprovalStepStatusIdentity>(async () => {
  const rows = await loadStatusMasterRows(STATUS_MASTER_TYPE.APPROVAL_STEP)
  const requireId = (statusCode: string) => requireMasterId(rows, STATUS_MASTER_TYPE.APPROVAL_STEP, statusCode)

  return {
    pending: requireId('PENDING'),
    inProgress: requireId('IN_PROGRESS'),
    approved: requireId('APPROVED'),
    rejected: requireId('REJECTED'),
    skipped: requireId('SKIPPED'),
  }
})

export const getRequestStateIdentity = createCachedLoader<RequestStateIdentity>(async () => {
  const rows = await loadStatusMasterRows(STATUS_MASTER_TYPE.REQUEST_STATE)
  const requireId = (statusCode: string) => requireMasterId(rows, STATUS_MASTER_TYPE.REQUEST_STATE, statusCode)

  return {
    inProgress: requireId('IN_PROGRESS'),
    completed: requireId('COMPLETED'),
    rejected: requireId('REJECTED'),
    cancelled: requireId('CANCELLED'),
  }
})

export const getRequestStatusIdentity = createCachedLoader<RequestStatusIdentity>(async () => {
  const rows = await StatusMasterService.getActiveRequestStatusMasters()
  const row = rows.find(item => normalizeCode(item?.STATUS_CODE) === 'REJECTED')
  const id = Number(row?.M_REQUEST_STATUS_ID)

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Missing active request status master: REJECTED')
  }

  return { rejected: id }
})

export const getVendorStatusIdentity = createCachedLoader<VendorStatusIdentity>(async () => {
  const rows = await loadStatusMasterRows(STATUS_MASTER_TYPE.VENDOR)
  const requireId = (statusCode: string) =>
    requireMasterId(rows, STATUS_MASTER_TYPE.VENDOR, statusCode, { allowZero: true })

  return {
    notRegistered: requireId('NOT_REGISTERED'),
    registered: requireId('REGISTERED'),
    inProgress: requireId('IN_PROGRESS'),
    cannotRegister: requireId('CANNOT_REGISTER'),
  }
})

export const getGprCFlowStatusIdentity = createCachedLoader<GprCFlowStatusIdentity>(async () => {
  const rows = await loadStatusMasterRows(STATUS_MASTER_TYPE.GPR_C_FLOW)
  const requireId = (statusCode: string) => requireMasterId(rows, STATUS_MASTER_TYPE.GPR_C_FLOW, statusCode)

  return {
    draft: requireId('DRAFT'),
    requesterSetup: requireId('REQUESTER_SETUP'),
    inProgress: requireId('IN_PROGRESS'),
    recheckRequired: requireId('RECHECK_REQUIRED'),
    approved: requireId('APPROVED'),
    rejected: requireId('REJECTED'),
  }
})

export const getActionResultStatusIdentity = createCachedLoader<ActionResultStatusIdentity>(async () => {
  const rows = await loadStatusMasterRows(STATUS_MASTER_TYPE.ACTION_RESULT)
  const requireId = (statusCode: string) => requireMasterId(rows, STATUS_MASTER_TYPE.ACTION_RESULT, statusCode)

  return {
    pending: requireId('PENDING'),
    incomplete: requireId('INCOMPLETE'),
    completed: requireId('COMPLETED'),
  }
})
