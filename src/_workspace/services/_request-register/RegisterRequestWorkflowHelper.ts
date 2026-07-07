export const GROUP_CODE = {
  LOCAL_PO_PIC: 'LOCAL_PO_PIC',
  OVERSEA_PO_PIC: 'OVERSEA_PO_PIC',
  PO_CHECKER_MAIN: 'PO_CHECKER_MAIN',
  MD: 'MD',
  PO_MGR: 'PO_MGR',
  PO_GM: 'PO_GM',
  ACC_LOCAL_MAIN: 'ACC_LOCAL_MAIN',
  ACC_OVERSEA_MAIN: 'ACC_OVERSEA_MAIN',
  ACC_LOCAL_CC: 'ACC_LOCAL_CC',
  ACC_OVERSEA_CC: 'ACC_OVERSEA_CC',
} as const

export const WORKFLOW_ACTION = {
  APPROVE: 'APPROVE',
  DISAGREE: 'DISAGREE',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  REJECT: 'REJECT',
} as const

export const WORKFLOW_STEP_CODE = {
  REQUEST_SUBMITTED: 'REQUEST_SUBMITTED',
  PIC_REVIEW: 'PIC_REVIEW',
  PENDING_AGREEMENT: 'PENDING_AGREEMENT',
  DOC_CHECK: 'DOC_CHECK',
  PO_MGR_APPROVAL: 'PO_MGR_APPROVAL',
  PO_GM_APPROVAL: 'PO_GM_APPROVAL',
  MD_APPROVAL: 'MD_APPROVAL',
  ACCOUNT_REGISTERED: 'ACCOUNT_REGISTERED',
  REJECTED: 'REJECTED',
  VENDOR_DISAGREED: 'VENDOR_DISAGREED',
  ISSUE_GPR_B: 'ISSUE_GPR_B',
  ISSUE_GPR_C: 'ISSUE_GPR_C',
} as const

export const normalizeText = (value: any) =>
  String(value || '')
    .trim()
    .toLowerCase()

const LEGACY_STEP_CODE_BY_LABEL: Record<string, string> = {
  'sent to po & scm (pic)': WORKFLOW_STEP_CODE.REQUEST_SUBMITTED,
  'po & scm approved (pic)': WORKFLOW_STEP_CODE.PIC_REVIEW,
  'po & scm approve (pic)': WORKFLOW_STEP_CODE.PIC_REVIEW,
  'pending agreement to vendor': WORKFLOW_STEP_CODE.PENDING_AGREEMENT,
  'po & scm check all document': WORKFLOW_STEP_CODE.DOC_CHECK,
  'po mgr approve': WORKFLOW_STEP_CODE.PO_MGR_APPROVAL,
  'po gm approve': WORKFLOW_STEP_CODE.PO_GM_APPROVAL,
  'md approval': WORKFLOW_STEP_CODE.MD_APPROVAL,
  'account registered': WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED,
  rejected: WORKFLOW_STEP_CODE.REJECTED,
  'vendor disagreed': WORKFLOW_STEP_CODE.VENDOR_DISAGREED,
  'issue gpr b': WORKFLOW_STEP_CODE.ISSUE_GPR_B,
  'issue gpr c': WORKFLOW_STEP_CODE.ISSUE_GPR_C,
}

const PIC_STEP_CODES = new Set<string>([
  WORKFLOW_STEP_CODE.PIC_REVIEW,
  WORKFLOW_STEP_CODE.PENDING_AGREEMENT,
  WORKFLOW_STEP_CODE.VENDOR_DISAGREED,
  WORKFLOW_STEP_CODE.ISSUE_GPR_B,
])

const APPROVER_STEP_CODES = new Set<string>([
  WORKFLOW_STEP_CODE.DOC_CHECK,
  WORKFLOW_STEP_CODE.MD_APPROVAL,
  WORKFLOW_STEP_CODE.PO_MGR_APPROVAL,
  WORKFLOW_STEP_CODE.PO_GM_APPROVAL,
])

const normalizeActionToken = (value: any) => normalizeText(String(value || '').replace(/[-\s]+/g, '_'))

export const resolveWorkflowAction = (dataItem: any) => {
  const token = normalizeActionToken(
    dataItem?.workflow_action ||
      dataItem?.WORKFLOW_ACTION ||
      dataItem?.action_type ||
      dataItem?.ACTION_TYPE ||
      dataItem?.negotiation_action ||
      dataItem?.NEGOTIATION_ACTION ||
      ''
  )

  if (!token) return ''
  if (['approve', 'approved', 'agree', 'agreed', 'vendor_agreed', 'continue'].includes(token)) {
    return WORKFLOW_ACTION.APPROVE
  }
  if (['disagree', 'vendor_disagreed', 'not_approve', 'notapproved'].includes(token)) {
    return WORKFLOW_ACTION.DISAGREE
  }
  if (['action_required', 'need_action', 'escalate'].includes(token)) {
    return WORKFLOW_ACTION.ACTION_REQUIRED
  }
  if (['reject', 'rejected'].includes(token)) {
    return WORKFLOW_ACTION.REJECT
  }

  return ''
}

export const inferStepCode = (step: any) => {
  const configuredStepCode = String(step?.step_code || step?.STEP_CODE || '').trim().toUpperCase()
  const source = normalizeText(step?.DESCRIPTION || step?.description || step?.label || step?.value)

  // Compatibility for records created before the submitted and PIC-review
  // steps received distinct codes.
  if (
    configuredStepCode === WORKFLOW_STEP_CODE.PIC_REVIEW &&
    source === 'sent to po & scm (pic)'
  ) {
    return WORKFLOW_STEP_CODE.REQUEST_SUBMITTED
  }

  if (configuredStepCode) return configuredStepCode

  const legacyStepCode = LEGACY_STEP_CODE_BY_LABEL[source]
  if (legacyStepCode) return legacyStepCode

  return ''
}

export const inferActorType = (step: any) => {
  if (step?.actor_type || step?.ACTOR_TYPE) return String(step.actor_type || step.ACTOR_TYPE).trim().toUpperCase()

  const stepCode = inferStepCode(step)
  if (PIC_STEP_CODES.has(stepCode)) return 'PIC'
  if (stepCode === WORKFLOW_STEP_CODE.REQUEST_SUBMITTED) return 'REQUESTER'
  if (stepCode === WORKFLOW_STEP_CODE.ISSUE_GPR_C) return 'REQUESTER'
  if (stepCode === WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED) return 'ACCOUNT'
  if (APPROVER_STEP_CODES.has(stepCode)) return 'APPROVER'

  return ''
}

export const resolveGroupCodeForStep = (step: any, isOversea: boolean) => {
  if (step?.group_code || step?.GROUP_CODE) return String(step.group_code || step.GROUP_CODE).trim().toUpperCase()

  switch (inferStepCode(step)) {
    case WORKFLOW_STEP_CODE.PIC_REVIEW:
    case WORKFLOW_STEP_CODE.PENDING_AGREEMENT:
    case WORKFLOW_STEP_CODE.VENDOR_DISAGREED:
    case WORKFLOW_STEP_CODE.ISSUE_GPR_B:
      return isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
    case WORKFLOW_STEP_CODE.DOC_CHECK:
      return GROUP_CODE.PO_CHECKER_MAIN
    case WORKFLOW_STEP_CODE.MD_APPROVAL:
      return GROUP_CODE.MD
    case WORKFLOW_STEP_CODE.PO_MGR_APPROVAL:
      return GROUP_CODE.PO_MGR
    case WORKFLOW_STEP_CODE.PO_GM_APPROVAL:
      return GROUP_CODE.PO_GM
    case WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED:
      return isOversea ? GROUP_CODE.ACC_OVERSEA_MAIN : GROUP_CODE.ACC_LOCAL_MAIN
    default:
      return ''
  }
}

export const isPicStep = (step: any) => inferActorType(step) === 'PIC'

export const isAccountStep = (step: any) => inferActorType(step) === 'ACCOUNT'

export const requiresVendorReply = (step: any) => {
  const requiresVendorReplyValue = step?.REQUIRES_VENDOR_REPLY
  if (requiresVendorReplyValue !== undefined && requiresVendorReplyValue !== null) {
    return Number(requiresVendorReplyValue) === 1
  }

  return inferStepCode(step) === WORKFLOW_STEP_CODE.PIC_REVIEW
}

export const requiresVendorCode = (step: any) => {
  const requiresVendorCodeValue = step?.REQUIRES_VENDOR_CODE
  if (requiresVendorCodeValue !== undefined && requiresVendorCodeValue !== null) {
    return Number(requiresVendorCodeValue) === 1
  }

  return inferStepCode(step) === WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED
}

export const isRejectedStatus = (value: any) => normalizeText(value) === 'rejected'

export const formatRequestNumber = (requestId: number | string, baseDate?: string | Date, prefix: 'N' | 'R' = 'N') => {
  const date = baseDate ? new Date(baseDate) : new Date()
  const currentYear = date.getFullYear().toString().slice(-2)
  const paddedId = String(requestId || 0).padStart(3, '0')
  return `Selection-${currentYear}-${prefix}${paddedId}`
}

export const normalizeRequestNumber = (requestNumberFromDb: any, requestId: number | string, baseDate?: string | Date) => {
  const fallback = formatRequestNumber(requestId, baseDate)

  if (typeof requestNumberFromDb !== 'string' || !requestNumberFromDb.trim()) {
    return fallback
  }

  const trimmed = requestNumberFromDb.trim()
  const currentMatch = trimmed.match(/^(?:Register|Selection)-(\d{2})-([NR])(\d{3,})$/i)
  if (currentMatch) {
    return `Selection-${currentMatch[1]}-${currentMatch[2].toUpperCase()}${currentMatch[3].padStart(3, '0')}`
  }

  const modernMatch = trimmed.match(/^Register_Selection-(\d{2})-([NR])(\d{3})$/i)
  if (modernMatch) {
    return `Selection-${modernMatch[1]}-${modernMatch[2].toUpperCase()}${modernMatch[3]}`
  }

  const legacyMatch = trimmed.match(/^Register_Selection-(\d{2})-(\d+)$/i)
  if (legacyMatch) {
    const year = legacyMatch[1]
    const numericPart = legacyMatch[2].slice(-3).padStart(3, '0')
    return `Selection-${year}-N${numericPart}`
  }

  return fallback
}

export const resolveRequestNumber = (requestNumberFromDb: any, requestId: number | string, baseDate?: string | Date) => {
  return normalizeRequestNumber(requestNumberFromDb, requestId, baseDate)
}

const INVALID_EMAIL_TOKENS = new Set(['-', 'n/a', 'na', 'null', 'undefined'])
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const normalizeEmail = (value: any) => {
  const email = String(value || '')
    .trim()
    .toLowerCase()
  if (!email || INVALID_EMAIL_TOKENS.has(email)) return ''
  return email
}

export const isValidEmail = (value: any) => EMAIL_REGEX.test(normalizeEmail(value))

export const mergeUniqueEmails = (...sources: any[][]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const source of sources) {
    for (const raw of source || []) {
      const email = normalizeEmail(raw)
      if (!email || !isValidEmail(email) || seen.has(email)) continue
      seen.add(email)
      result.push(email)
    }
  }

  return result
}

export const parseCcEmails = (rawCc: any): string[] => {
  if (!rawCc) return []

  try {
    const parsed = typeof rawCc === 'string' ? JSON.parse(rawCc) : rawCc

    if (!Array.isArray(parsed)) return []

    return parsed
      .flatMap((entry: any) => {
        if (typeof entry === 'string') return entry.split(/[;,]+/)
        if (entry && typeof entry.email === 'string') return entry.email.split(/[;,]+/)
        return []
      })
      .map(normalizeEmail)
      .filter((email) => email && isValidEmail(email))
  } catch {
    return []
  }
}

export const excludeEmails = (emails: string[], blocked: any[]): string[] => {
  const blockedSet = new Set((blocked || []).map((item) => normalizeEmail(item)).filter(Boolean))

  return (emails || []).filter((email) => !blockedSet.has(normalizeEmail(email)))
}
