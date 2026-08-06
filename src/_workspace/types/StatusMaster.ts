export const STATUS_MASTER_TYPE = {
  APPROVAL_STEP: 'APPROVAL_STEP',
  REQUEST_STATE: 'REQUEST_STATE',
  GPR_C_FLOW: 'GPR_C_FLOW',
  ACTION_RESULT: 'ACTION_RESULT',
  VENDOR: 'VENDOR',
} as const

export type StatusMasterType = keyof typeof STATUS_MASTER_TYPE

export interface StatusMasterSearchData {
  MASTER_TYPE?: StatusMasterType | ''
}

export const normalizeStatusMasterType = (value: unknown): StatusMasterType | '' => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

  if (!normalized) return ''
  if (normalized in STATUS_MASTER_TYPE) return normalized as StatusMasterType

  throw new Error('Unknown status master type: ' + String(value ?? ''))
}

export const APPROVAL_STEP_STATUS_CODE = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SKIPPED: 'SKIPPED',
} as const

export type ApprovalStepStatusCode = keyof typeof APPROVAL_STEP_STATUS_CODE

export const normalizeApprovalStepStatusCode = (value: unknown): ApprovalStepStatusCode => {
  const normalized = String(value ?? 'PENDING')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

  if (normalized in APPROVAL_STEP_STATUS_CODE) {
    return normalized as ApprovalStepStatusCode
  }

  throw new Error('Unknown approval step status: ' + String(value ?? ''))
}

export const REQUEST_STATE_CODE = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const

export type RequestStateCode = keyof typeof REQUEST_STATE_CODE

export const normalizeRequestStateCode = (value: unknown): RequestStateCode => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

  if (normalized in REQUEST_STATE_CODE) {
    return normalized as RequestStateCode
  }

  throw new Error('Unknown request state: ' + String(value ?? ''))
}

export const GPR_C_FLOW_STATUS_CODE = {
  DRAFT: 'DRAFT',
  REQUESTER_SETUP: 'REQUESTER_SETUP',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const ACTION_RESULT_STATUS_CODE = {
  PENDING: 'PENDING',
  INCOMPLETE: 'INCOMPLETE',
  COMPLETED: 'COMPLETED',
} as const

export type GprCFlowStatusCode = keyof typeof GPR_C_FLOW_STATUS_CODE
export type ActionResultStatusCode = keyof typeof ACTION_RESULT_STATUS_CODE

export const VENDOR_STATUS_CODE = {
  NOT_REGISTERED: 'NOT_REGISTERED',
  REGISTERED: 'REGISTERED',
  IN_PROGRESS: 'IN_PROGRESS',
  CANNOT_REGISTER: 'CANNOT_REGISTER',
} as const

export const normalizeVendorStatusCode = (value: unknown): string | null => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

  switch (normalized) {
    case '0':
    case VENDOR_STATUS_CODE.NOT_REGISTERED:
      return VENDOR_STATUS_CODE.NOT_REGISTERED
    case '1':
    case VENDOR_STATUS_CODE.REGISTERED:
      return VENDOR_STATUS_CODE.REGISTERED
    case VENDOR_STATUS_CODE.IN_PROGRESS:
      return VENDOR_STATUS_CODE.IN_PROGRESS
    case '2':
    case VENDOR_STATUS_CODE.CANNOT_REGISTER:
      return VENDOR_STATUS_CODE.CANNOT_REGISTER
    default:
      return null
  }
}
