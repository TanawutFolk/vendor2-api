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

export const normalizeText = (value: any) =>
  String(value || '')
    .trim()
    .toLowerCase()

const normalizeActionToken = (value: any) => normalizeText(String(value || '').replace(/[-\s]+/g, '_'))

export const resolveWorkflowAction = (dataItem: any) => {
  const token = normalizeActionToken(dataItem?.workflow_action || dataItem?.action_type || dataItem?.negotiation_action || '')

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
  if (step?.step_code) return String(step.step_code).trim().toUpperCase()

  const source = normalizeText(`${step?.DESCRIPTION || ''} ${step?.description || ''} ${step?.label || ''}`)

  if (source.includes('checker') || source.includes('check document') || source.includes('check all document')) {
    return 'DOC_CHECK'
  }
  if (source.includes('general manager') || source.includes('po gm')) {
    return 'PO_GM_APPROVAL'
  }
  if (source.includes('mgr') || source.includes('manager')) {
    return 'PO_MGR_APPROVAL'
  }
  if (source.includes('director') || source === 'md' || source.includes(' md ')) {
    return 'MD_APPROVAL'
  }
  if (source.includes('account')) {
    return 'ACCOUNT_REGISTERED'
  }
  if (source.includes('pic') || source.includes('sent to po')) {
    return 'PIC_REVIEW'
  }

  return ''
}

export const inferActorType = (step: any) => {
  if (step?.actor_type) return String(step.actor_type).trim().toUpperCase()

  const stepCode = inferStepCode(step)
  if (stepCode === 'PIC_REVIEW') return 'PIC'
  if (stepCode === 'ACCOUNT_REGISTERED') return 'ACCOUNT'
  if (['DOC_CHECK', 'MD_APPROVAL', 'PO_MGR_APPROVAL', 'PO_GM_APPROVAL'].includes(stepCode)) {
    return 'APPROVER'
  }

  return ''
}

export const resolveGroupCodeForStep = (step: any, isOversea: boolean) => {
  if (step?.group_code) return String(step.group_code).trim().toUpperCase()

  switch (inferStepCode(step)) {
    case 'PIC_REVIEW':
      return isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
    case 'DOC_CHECK':
      return GROUP_CODE.PO_CHECKER_MAIN
    case 'MD_APPROVAL':
      return GROUP_CODE.MD
    case 'PO_MGR_APPROVAL':
      return GROUP_CODE.PO_MGR
    case 'PO_GM_APPROVAL':
      return GROUP_CODE.PO_GM
    case 'ACCOUNT_REGISTERED':
      return isOversea ? GROUP_CODE.ACC_OVERSEA_MAIN : GROUP_CODE.ACC_LOCAL_MAIN
    default:
      return ''
  }
}

export const isPicStep = (step: any) => inferActorType(step) === 'PIC'

export const isAccountStep = (step: any) => inferActorType(step) === 'ACCOUNT'

export const requiresVendorReply = (step: any) => {
  if (step?.requiresVendorReply !== undefined && step?.requiresVendorReply !== null) {
    return Number(step.requiresVendorReply) === 1
  }

  return inferStepCode(step) === 'PIC_REVIEW'
}

export const requiresVendorCode = (step: any) => {
  if (step?.requiresVendorCode !== undefined && step?.requiresVendorCode !== null) {
    return Number(step.requiresVendorCode) === 1
  }

  return inferStepCode(step) === 'ACCOUNT_REGISTERED'
}

export const isRejectedStatus = (value: any) => normalizeText(value) === 'rejected'

export const formatRequestNumber = (requestId: number | string, baseDate?: string | Date) => {
  const date = baseDate ? new Date(baseDate) : new Date()
  const currentYear = date.getFullYear().toString().slice(-2)
  const paddedId = String(requestId || 0).padStart(3, '0')
  return `Register_Selection-${currentYear}-N${paddedId}`
}

export const normalizeRequestNumber = (requestNumberFromDb: any, requestId: number | string, baseDate?: string | Date) => {
  const fallback = formatRequestNumber(requestId, baseDate)

  if (typeof requestNumberFromDb !== 'string' || !requestNumberFromDb.trim()) {
    return fallback
  }

  const trimmed = requestNumberFromDb.trim()
  const modernMatch = trimmed.match(/^Register_Selection-(\d{2})-N(\d{3})$/i)
  if (modernMatch) {
    return `Register_Selection-${modernMatch[1]}-N${modernMatch[2]}`
  }

  const legacyMatch = trimmed.match(/^Register_Selection-(\d{2})-(\d+)$/i)
  if (legacyMatch) {
    const year = legacyMatch[1]
    const numericPart = legacyMatch[2].slice(-3).padStart(3, '0')
    return `Register_Selection-${year}-N${numericPart}`
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
