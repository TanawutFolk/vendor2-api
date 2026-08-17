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
  RECHECK: 'RECHECK',
} as const

export const WORKFLOW_STEP_CODE = {
  REQUEST_SUBMITTED: 'REQUEST_SUBMITTED',
  PIC_REVIEW: 'PIC_REVIEW',
  PO_PIC_IN_PROGRESS: 'PO_PIC_IN_PROGRESS',
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

export const VENDOR_CODE_PREFIX = {
  LOCAL: '20030',
  OVERSEA: '20031',
} as const

export const getVendorCodePrefix = (isOversea: boolean) => (isOversea ? VENDOR_CODE_PREFIX.OVERSEA : VENDOR_CODE_PREFIX.LOCAL)

export const isVendorCodeComplete = (vendorCode: any, isOversea: boolean) => {
  const normalizedVendorCode = String(vendorCode || '')
    .trim()
    .toUpperCase()
  const expectedPrefix = getVendorCodePrefix(isOversea)

  return normalizedVendorCode.startsWith(expectedPrefix) && normalizedVendorCode.length > expectedPrefix.length && /^[A-Z0-9]+$/.test(normalizedVendorCode)
}

export const normalizeText = (value: any) =>
  String(value || '')
    .trim()
    .toLowerCase()

const normalizeActionToken = (value: any) => normalizeText(String(value || '').replace(/[-\s]+/g, '_'))

export const resolveWorkflowAction = (dataItem: any) => {
  const token = normalizeActionToken(
    dataItem?.action_code ||
      dataItem?.ACTION_CODE ||
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
  if (['recheck', 're_check', 'recheck_to_pic'].includes(token)) {
    return WORKFLOW_ACTION.RECHECK
  }

  return ''
}

export const inferStepCode = (step: any) => {
  return String(step?.step_code || step?.STEP_CODE || '')
    .trim()
    .toUpperCase()
}

export const inferActorType = (step: any) =>
  String(step?.actor_type || step?.ACTOR_TYPE || '')
    .trim()
    .toUpperCase()

export const resolveGroupCodeForStep = (step: any, _isOversea: boolean) =>
  String(step?.group_code || step?.GROUP_CODE || '')
    .trim()
    .toUpperCase()

export const isPicStep = (step: any) => inferActorType(step) === 'PIC'

export const requiresVendorReply = (step: any) => {
  return Number(step?.requires_vendor_reply ?? step?.REQUIRES_VENDOR_REPLY ?? 0) === 1
}

export const requiresVendorCode = (step: any) => {
  return Number(step?.requires_vendor_code ?? step?.REQUIRES_VENDOR_CODE ?? 0) === 1
}

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
