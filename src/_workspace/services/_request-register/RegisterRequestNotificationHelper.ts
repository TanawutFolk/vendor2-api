import { MySQLExecute } from '@businessData/dbExecute'
import { RequestRegisterPageSQL } from '../../sql/_request-register/RequestRegisterPageSQL'
import sendEmail, { type MailAttachment } from '@src/config/sendEmail'
import fs from 'fs'
import path from 'path'
import {
  emailActionRequiredTemplate,
  emailGprCStepApprovalTemplate,
  emailExternalSubmitGPRBTemplate,
  emailGprCRequesterSetupTemplate,
  emailCompleteTemplate,
  emailIncompleteTemplate,
  emailReject1Template,
  emailReject2Template,
  emailRequestRegisterVendorTemplate,
  emailToAccountPICTemplate,
  emailToCheckerPICTemplate,
  emailToMDTemplate,
  emailToPMGMTemplate,
  emailToPMMgrTemplate,
  emailVendorDocumentRequestTemplate,
  type MailTemplateData,
} from '@src/config/mailTemplate'
import { SelectionFileService } from './SelectionFileService'
import {
  excludeEmails,
  GROUP_CODE,
  inferStepCode,
  mergeUniqueEmails,
  normalizeEmail,
  normalizeText,
  resolveGroupCodeForStep,
  resolveRequestNumber,
} from './RegisterRequestWorkflowHelper'

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_ORIGIN = process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'

const DEFAULT_VENDOR_DOCUMENT_LOCAL_PATH =
  'C:\\c01_qms\\PM\\02_Record\\FM-PM-303 Selection Supplier\\00.DocumentSet\\01.New (Full)\\Local\\00.Sending'
const DEFAULT_VENDOR_DOCUMENT_OVERSEA_PATH =
  'C:\\c01_qms\\PM\\02_Record\\FM-PM-303 Selection Supplier\\00.DocumentSet\\01.New (Full)\\Oversea\\00.Sending'
const DEFAULT_VENDOR_DOCUMENT_FORM_B_PATH =
  'C:\\c01_qms\\PM\\02_Record\\FM-PM-303 Selection Supplier\\00.DocumentSet\\00.Purchase Form\\FORM B.xlsx'
const VENDOR_DOCUMENT_ATTACHMENT_EXTENSIONS = new Set(['.pdf', '.xlsx', '.xls', '.doc', '.docx'])

const getVendorDocumentLocalPath = () => process.env.VENDOR_DOCUMENT_LOCAL_PATH || DEFAULT_VENDOR_DOCUMENT_LOCAL_PATH
const getVendorDocumentOverseaPath = () => process.env.VENDOR_DOCUMENT_OVERSEA_PATH || DEFAULT_VENDOR_DOCUMENT_OVERSEA_PATH
const getVendorDocumentFormBPath = () => process.env.VENDOR_DOCUMENT_FORM_B_PATH || DEFAULT_VENDOR_DOCUMENT_FORM_B_PATH

const STAGE_KEY = {
  ENGINEER: 'engineer',
  EMR: 'emr',
  QMS: 'qms',
  PM_MANAGER: 'pm_manager',
} as const

type StageKey = (typeof STAGE_KEY)[keyof typeof STAGE_KEY]

// ─── Types ────────────────────────────────────────────────────────────────────

type EmployeeProfile = {
  empCode: string
  fullName: string
  email: string
}

const getValue = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key]
    if (value !== undefined && value !== null) return value
  }
  return ''
}

/** Shape of the row returned by getNotificationVendorContextByRequestId */
interface VendorContext {
  assign_to?: string
  vendor_region?: string
  vendor_email?: string
  vendor_main_email?: string
  emailmain?: string
  selected_vendor_email?: string
  company_name?: string
  address?: string
  contact_name?: string
  tel_phone?: string
  supportProduct_Process?: string
  purchase_frequency?: string
  request_number?: string
  CREATE_DATE?: string
  fft_vendor_code?: string
  vendor_code?: string
  action_required_json?: string
  gpr_c_pc_pic_email?: string
  gpr_c_circular_json?: string
  Request_By_EmployeeCode?: string
  REQUEST_BY_EMPLOYEECODE?: string
  request_by_employeecode?: string
  REQUEST_BY_EMAIL?: string
  request_by_email?: string
}

// ─── Caches ───────────────────────────────────────────────────────────────────

const employeeProfileCache = new Map<string, EmployeeProfile | null>()
const assigneeEmailCache = new Map<string, string>()
const assigneeProfileCache = new Map<string, EmployeeProfile | null>()

// ─── Employee helpers ─────────────────────────────────────────────────────────

const buildFullName = (row: any) =>
  [String(getValue(row, 'empName', 'EMPNAME') || '').trim(), String(getValue(row, 'empSurname', 'EMPSURNAME') || '').trim()]
    .filter(Boolean)
    .join(' ')

const resolveEmployeeProfile = async (empCodeRaw: unknown): Promise<EmployeeProfile | null> => {
  const empCode = String(empCodeRaw || '').trim()
  if (!empCode) return null
  if (employeeProfileCache.has(empCode)) return employeeProfileCache.get(empCode) ?? null

  const sql = await RequestRegisterPageSQL.getMemberByEmpCode({ EMPCODE: empCode })
  const rows = (await MySQLExecute.search(sql)) as any[]
  const row = rows[0]

  if (!row) {
    employeeProfileCache.set(empCode, null)
    return null
  }

  const profile: EmployeeProfile = {
    empCode,
    fullName: buildFullName(row),
    email: normalizeEmail(row?.empEmail || row?.EMPEMAIL),
  }
  employeeProfileCache.set(empCode, profile)
  return profile
}

const resolveAssignedEmail = async (empCodeRaw: unknown): Promise<string> => {
  const empCode = String(empCodeRaw || '').trim()
  if (!empCode) return ''
  if (assigneeEmailCache.has(empCode)) return assigneeEmailCache.get(empCode) ?? ''

  const sql = await RequestRegisterPageSQL.getAssigneeEmailByEmpCode({ EMPCODE: empCode })
  const rows = (await MySQLExecute.search(sql)) as any[]
  const email = normalizeEmail(rows[0]?.empEmail || rows[0]?.EMPEMAIL)
  assigneeEmailCache.set(empCode, email)
  return email
}

const resolveAssigneeProfile = async (empCodeRaw: unknown): Promise<EmployeeProfile | null> => {
  const empCode = String(empCodeRaw || '').trim()
  if (!empCode) return null
  if (assigneeProfileCache.has(empCode)) return assigneeProfileCache.get(empCode) ?? null

  const sql = await RequestRegisterPageSQL.getAssigneeByEmpCodeContact({ EMPCODE: empCode })
  const rows = (await MySQLExecute.search(sql)) as any[]
  const row = rows[0]

  if (!row) {
    assigneeProfileCache.set(empCode, null)
    return null
  }

  const profile: EmployeeProfile = {
    empCode,
    fullName: buildFullName(row) || String(row?.empName || row?.EMPNAME || '').trim(),
    email: normalizeEmail(row?.empEmail || row?.EMPEMAIL),
  }
  assigneeProfileCache.set(empCode, profile)
  return profile
}

// ─── Group / peer email helpers ───────────────────────────────────────────────

const getPeerCcEmailsByExactGroupCode = async (
  groupCode: string,
  excludeEmpCode?: string,
  excludeEmail?: string
): Promise<string[]> => {
  const safeGroupCode = String(groupCode || '').trim()
  if (!safeGroupCode) return []

  const excludeEmp = String(excludeEmpCode || '').trim()
  const sql = await RequestRegisterPageSQL.getActiveAssigneesByGroupCode({ GROUP_CODE: safeGroupCode })
  const rows = (await MySQLExecute.search(sql)) as any[]

  return mergeUniqueEmails(
    rows
      .map((row: any) => {
        if (excludeEmp && String(getValue(row, 'empcode', 'EMPCODE') || '').trim() === excludeEmp) return ''
        return normalizeEmail(getValue(row, 'empEmail', 'EMPEMAIL'))
      })
      .filter((email: string) => email && email !== normalizeEmail(excludeEmail))
  )
}

const inspectGroupRecipients = async (
  groupCode: string,
  excludeEmpCode?: string,
  excludeEmail?: string
) => {
  const safeGroupCode = String(groupCode || '').trim()
  if (!safeGroupCode) return []

  const excludeEmp = String(excludeEmpCode || '').trim()
  const normalizedExcludeEmail = normalizeEmail(excludeEmail)
  const sql = await RequestRegisterPageSQL.getActiveAssigneesByGroupCode({ GROUP_CODE: safeGroupCode })
  const rows = (await MySQLExecute.search(sql)) as any[]

  return rows.map((row: any) => {
    const rowEmpCode = String(getValue(row, 'empcode', 'EMPCODE') || '').trim()
    const normalizedEmail = normalizeEmail(String(getValue(row, 'empEmail', 'EMPEMAIL') || '').trim())
    const isPrimary = !!excludeEmp && rowEmpCode === excludeEmp
    const excludedByPrimaryEmail = !!normalizedExcludeEmail && normalizedEmail === normalizedExcludeEmail
    const valid = !!normalizedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)

    return {
      empCode: rowEmpCode,
      rawEmail: String(getValue(row, 'empEmail', 'EMPEMAIL') || '').trim(),
      normalizedEmail,
      isPrimary,
      excludedByPrimaryEmail,
      valid,
      includedAsCc: !isPrimary && !excludedByPrimaryEmail && valid,
    }
  })
}

export const getPeerCcEmailsByGroupCode = async (
  groupCode: string,
  excludeEmpCode?: string,
  excludeEmail?: string
): Promise<string[]> => {
  if (!groupCode) return []

  const targetGroup = String(groupCode)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
  if (!targetGroup) return []

  const targetCompact = targetGroup.replace(/[^A-Z0-9]/g, '')
  const excludeEmp = String(excludeEmpCode || '').trim()

  const sql = await RequestRegisterPageSQL.getPeerCcRowsByNormalizedGroup({
    TARGET_GROUP: targetGroup,
    TARGET_COMPACT: targetCompact,
  })
  const rows = (await MySQLExecute.search(sql)) as any[]

  return mergeUniqueEmails(
    rows
      .map((row: any) => {
        if (excludeEmp && String(getValue(row, 'empcode', 'EMPCODE') || '').trim() === excludeEmp) return ''
        return normalizeEmail(getValue(row, 'empEmail', 'EMPEMAIL'))
      })
      .filter((email: string) => email && email !== normalizeEmail(excludeEmail))
  )
}

const resolvePrimaryAssigneeByGroupCode = async (groupCode: string) => {
  const targetGroup = String(groupCode || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
  if (!targetGroup) return null

  const targetCompact = targetGroup.replace(/[^A-Z0-9]/g, '')
  const sql = await RequestRegisterPageSQL.getPeerCcRowsByNormalizedGroup({
    TARGET_GROUP: targetGroup,
    TARGET_COMPACT: targetCompact,
  })
  const rows = (await MySQLExecute.search(sql)) as any[]
  const row = rows.find((item: any) => normalizeEmail(getValue(item, 'empEmail', 'EMPEMAIL')))
  if (!row) return null

  return {
    empCode: String(getValue(row, 'empcode', 'EMPCODE') || '').trim(),
    fullName: buildFullName(row) || String(getValue(row, 'empName', 'EMPNAME', 'empcode', 'EMPCODE') || '').trim(),
    email: normalizeEmail(getValue(row, 'empEmail', 'EMPEMAIL')),
  }
}

// ─── Vendor context fetcher ───────────────────────────────────────────────────

const fetchVendorContext = async (requestId: number): Promise<VendorContext> => {
  const sql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({
    REQUEST_ID: requestId,
  })
  const rows = (await MySQLExecute.search(sql)) as VendorContext[]
  const row: any = rows[0] ?? {}

  return {
    ...row,
    assign_to: getValue(row, 'assign_to', 'ASSIGN_TO'),
    vendor_region: getValue(row, 'vendor_region', 'VENDOR_REGION'),
    vendor_email: getValue(row, 'vendor_email', 'VENDOR_EMAIL'),
    vendor_main_email: getValue(row, 'vendor_main_email', 'VENDOR_MAIN_EMAIL'),
    emailmain: getValue(row, 'emailmain', 'EMAILMAIN'),
    selected_vendor_email: getValue(row, 'selected_vendor_email', 'SELECTED_VENDOR_EMAIL'),
    company_name: getValue(row, 'company_name', 'COMPANY_NAME'),
    address: getValue(row, 'address', 'ADDRESS'),
    contact_name: getValue(row, 'contact_name', 'CONTACT_NAME'),
    tel_phone: getValue(row, 'tel_phone', 'TEL_PHONE'),
    supportProduct_Process: getValue(row, 'supportProduct_Process', 'SUPPORTPRODUCT_PROCESS'),
    purchase_frequency: getValue(row, 'purchase_frequency', 'PURCHASE_FREQUENCY'),
    request_number: getValue(row, 'request_number', 'REQUEST_NUMBER'),
    CREATE_DATE: getValue(row, 'CREATE_DATE', 'create_date'),
    fft_vendor_code: getValue(row, 'fft_vendor_code', 'FFT_VENDOR_CODE'),
    vendor_code: getValue(row, 'vendor_code', 'VENDOR_CODE'),
    action_required_json: getValue(row, 'action_required_json', 'ACTION_REQUIRED_JSON'),
    gpr_c_pc_pic_email: getValue(row, 'gpr_c_pc_pic_email', 'GPR_C_PC_PIC_EMAIL'),
    gpr_c_circular_json: getValue(row, 'gpr_c_circular_json', 'GPR_C_CIRCULAR_JSON'),
    Request_By_EmployeeCode: getValue(row, 'Request_By_EmployeeCode', 'REQUEST_BY_EMPLOYEECODE', 'request_by_employeecode'),
  }
}

const fetchVendorContactEmails = async (requestId: number): Promise<string[]> => {
  const sql = await RequestRegisterPageSQL.getRequestVendorContactsByRequestId({ REQUEST_ID: requestId })
  const rows = (await MySQLExecute.search(sql)) as any[]
  return rows.map((c) => getValue(c, 'email', 'EMAIL'))
}

// ─── PIC / region helpers ─────────────────────────────────────────────────────

const isOverseaRegion = (vendorRegion: any) => normalizeText(vendorRegion) === 'oversea'

const getPoPicAndSubPicCc = async (
  vendorRegion: any,
  assignedPicEmpCode: any,
  assignedPicEmail?: string
) => {
  const picEmail = normalizeEmail(assignedPicEmail) || (await resolveAssignedEmail(assignedPicEmpCode))
  const picGroupCode = isOverseaRegion(vendorRegion) ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
  const peerPicCc = await getPeerCcEmailsByGroupCode(picGroupCode, assignedPicEmpCode, picEmail)

  return {
    picEmail,
    peerPicCc,
    allPoPicEmails: mergeUniqueEmails(picEmail ? [picEmail] : [], peerPicCc),
    picGroupCode,
  }
}

const getPoCheckerMainEmails = () => getPeerCcEmailsByGroupCode(GROUP_CODE.PO_CHECKER_MAIN)
const getPoMgrEmails = () => getPeerCcEmailsByGroupCode(GROUP_CODE.PO_MGR)
const getAccountCcByRegion = (vendorRegion: any) =>
  getPeerCcEmailsByGroupCode(
    isOverseaRegion(vendorRegion) ? GROUP_CODE.ACC_OVERSEA_CC : GROUP_CODE.ACC_LOCAL_CC
  )

// ─── Requester profile helper ─────────────────────────────────────────────────

const resolveRequesterMailProfile = async (vd: VendorContext) => {
  const requesterEmpCode =
    String(vd.REQUEST_BY_EMPLOYEECODE || vd.Request_By_EmployeeCode || vd.request_by_employeecode || '').trim()
  const directRequesterEmail = normalizeEmail(vd.REQUEST_BY_EMAIL || vd.request_by_email)
  const profile = requesterEmpCode ? await resolveEmployeeProfile(requesterEmpCode) : null
  return {
    profile,
    email: directRequesterEmail || normalizeEmail(profile?.email),
    name: resolveDisplayName([profile?.fullName], 'Requester'),
  }
}

// ─── Vendor document attachments ──────────────────────────────────────────────

const buildVendorDocumentAttachments = (vendorRegion: any, isGprBStage = false): MailAttachment[] => {
  if (isGprBStage) {
    const formBPath = getVendorDocumentFormBPath()
    if (!fs.existsSync(formBPath)) {
      throw new Error(`GPR B agreement file not found: ${formBPath}`)
    }
    return [
      {
        filename: path.basename(formBPath),
        content: fs.readFileSync(formBPath),
      },
    ]
  }

  const basePath = isOverseaRegion(vendorRegion) ? getVendorDocumentOverseaPath() : getVendorDocumentLocalPath()
  if (!fs.existsSync(basePath)) {
    throw new Error(`Agreement document folder not found: ${basePath}`)
  }

  const attachments = fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(basePath, entry.name))
    .filter((filePath) => VENDOR_DOCUMENT_ATTACHMENT_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => ({
      filename: path.basename(filePath),
      content: fs.readFileSync(filePath),
    }))

  if (!attachments.length) {
    throw new Error(`No agreement document files found in: ${basePath}`)
  }

  return attachments
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const resolveDisplayName = (options: Array<unknown>, fallbackLabel: string) => {
  for (const option of options) {
    const value = String(option || '').trim()
    if (!value) continue
    if (/^[A-Z]\d{3,}$/i.test(value)) continue
    return value
  }
  return fallbackLabel
}

const resolveActionRequiredStage = (step: any): StageKey | '' => {
  const desc = normalizeText(step?.DESCRIPTION)
  if (desc.includes('engineer')) return STAGE_KEY.ENGINEER
  if (desc.includes('emr')) return STAGE_KEY.EMR
  if (desc.includes('qms')) return STAGE_KEY.QMS
  if (desc.includes('pm manager') || desc.includes('manager approval')) return STAGE_KEY.PM_MANAGER
  return ''
}

const parseStoredObject = (raw: any): Record<string, any> => {
  if (!raw) return {}
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const parseStoredCircularMembers = (raw: any) => {
  if (!raw) return []
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) =>
        typeof item === 'string'
          ? { empcode: '', email: normalizeEmail(item) }
          : { empcode: String(item?.empcode || '').trim(), email: normalizeEmail(item?.email) }
      )
      .filter((item) => item.empcode || item.email)
      .slice(0, 6)
  } catch {
    return []
  }
}

const resolveCircularAssignedEmails = async (raw: any): Promise<string[]> => {
  const members = parseStoredCircularMembers(raw)
  if (!members.length) return []

  const resolved = await Promise.all(
    members.map((member) => (member.empcode ? resolveAssignedEmail(member.empcode) : ''))
  )
  return mergeUniqueEmails(resolved)
}

const getGprCSetupMeta = (raw: any) => parseStoredObject(parseStoredObject(raw)?._meta)

const previewRecipientList = (emails: string[] = []) =>
  emails
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
    .slice(0, 10)

const systemLink = (page: 'request-register' | 'request-history') =>
  `${SYSTEM_ORIGIN}/en/${page}`

// ─── Email send & log ─────────────────────────────────────────────────────────

const logTemplateEvent = (
  phase: 'sent' | 'failed',
  payload: {
    templateName: string
    toEmail?: string
    ccEmails?: string[]
    subject?: string
    requestId?: number | string
    requestNumber?: string
    extra?: Record<string, any>
    error?: any
  }
) => {
  const logPayload = {
    templateName: payload.templateName,
    toEmail: normalizeEmail(payload.toEmail),
    ccEmails: previewRecipientList(payload.ccEmails || []),
    ccCount: payload.ccEmails?.length || 0,
    subject: payload.subject || '',
    requestId: payload.requestId ?? '',
    requestNumber: payload.requestNumber || '',
    ...(payload.extra || {}),
  }

  if (phase === 'failed') {
    console.error(`[MAIL TEMPLATE][${phase}]`, {
      ...logPayload,
      error: payload.error?.message || payload.error || 'unknown error',
    })
    return
  }

  console.log(`[MAIL TEMPLATE][${phase}]`, logPayload)
}

const sendTemplatedEmail = async (payload: {
  templateName: string
  emailHtml: string
  toEmail: string
  subject: string
  ccEmails?: string[]
  requestId?: number | string
  requestNumber?: string
  attachments?: MailAttachment[]
  extra?: Record<string, any>
}) => {
  const ccEmails = payload.ccEmails ?? []
  const attachments = payload.attachments ?? []
  const logBase = {
    templateName: payload.templateName,
    toEmail: payload.toEmail,
    ccEmails,
    subject: payload.subject,
    requestId: payload.requestId,
    requestNumber: payload.requestNumber,
    extra: { ...(payload.extra ?? {}), attachmentCount: attachments.length },
  }

  try {
    const mailResult = await sendEmail(
      payload.emailHtml,
      payload.toEmail,
      payload.subject,
      ccEmails,
      {
        templateName: payload.templateName,
        requestId: payload.requestId,
        requestNumber: payload.requestNumber,
        flow: String(payload.extra?.flow || ''),
      },
      attachments
    )

    if (!mailResult.success) {
      const error = mailResult.reason || 'sendEmail returned failed'
      logTemplateEvent('failed', { ...logBase, error })
      throw new Error(error)
    }

    logTemplateEvent('sent', logBase)
  } catch (error: any) {
    logTemplateEvent('failed', { ...logBase, error })
    throw error
  }
}

// ─── Step → email template selector ──────────────────────────────────────────

export const selectApprovalNotificationByStep = (
  step: any,
  baseEmailData: MailTemplateData,
  requestNumber: string
): { templateName: string; emailHtml: string; emailSubject: string } => {
  const stepCode = inferStepCode(step)
  const nextDesc = normalizeText(step?.DESCRIPTION)

  if (stepCode === 'PO_GM_APPROVAL' || nextDesc.includes('general manager')) {
    return {
      templateName: 'emailToPMGMTemplate',
      emailHtml: emailToPMGMTemplate({ ...baseEmailData, recipientName: baseEmailData.recipientName || 'PO GM' }),
      emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - PO GM Step`,
    }
  }

  if (stepCode === 'PO_MGR_APPROVAL' || nextDesc.includes('manager') || nextDesc.includes('mgr')) {
    return {
      templateName: 'emailToPMMgrTemplate',
      emailHtml: emailToPMMgrTemplate({ ...baseEmailData, recipientName: baseEmailData.recipientName || 'PO Mgr' }),
      emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - PO Mgr Step`,
    }
  }

  if (stepCode === 'MD_APPROVAL' || nextDesc.includes('md') || nextDesc.includes('director')) {
    return {
      templateName: 'emailToMDTemplate',
      emailHtml: emailToMDTemplate({ ...baseEmailData, recipientName: baseEmailData.recipientName || 'MD' }),
      emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - MD Approval`,
    }
  }

  if (stepCode === 'ACCOUNT_REGISTERED' || nextDesc.includes('account')) {
    return {
      templateName: 'emailToAccountPICTemplate',
      emailHtml: emailToAccountPICTemplate({ ...baseEmailData, recipientName: 'Account PIC' }),
      emailSubject: `[Request Action] Please process register vendor "${requestNumber}" - Account Step`,
    }
  }

  if (
    stepCode === 'DOC_CHECK' ||
    nextDesc.includes('checker') ||
    nextDesc.includes('check all document') ||
    nextDesc.includes('check document')
  ) {
    return {
      templateName: 'emailToCheckerPICTemplate',
      emailHtml: emailToCheckerPICTemplate({ ...baseEmailData, recipientName: 'PO Checker' }),
      emailSubject: `[Request Check] Please check register vendor "${requestNumber}" - Document Step`,
    }
  }

  // Fallback
  return {
    templateName: 'emailToPMMgrTemplate',
    emailHtml: emailToPMMgrTemplate({ ...baseEmailData, recipientName: 'Approver' }),
    emailSubject: `[Request Approval] Please process register vendor "${requestNumber}"`,
  }
}

// ─── Exported trigger functions ───────────────────────────────────────────────

export const triggerCreationEmail = async (
  dataItem: any,
  vendorData: any,
  nextAssignee: any,
  insertedId: number,
  persistedRequestNumber?: string,
  assigneeGroupCode?: string
) => {
  const requester = await resolveRequesterMailProfile(dataItem)
  const nextAssigneeProfile = await resolveAssigneeProfile(nextAssignee.empCode)
  const nextAssigneeEmail = await resolveAssignedEmail(nextAssignee.empCode)

  const requestNumber = resolveRequestNumber(persistedRequestNumber, insertedId)

  if (!nextAssigneeEmail) return

  const groupRecipientInspection = await inspectGroupRecipients(
    assigneeGroupCode || '',
    nextAssignee.empCode,
    nextAssigneeEmail
  )
  const peerCc = await getPeerCcEmailsByExactGroupCode(
    assigneeGroupCode || '',
    nextAssignee.empCode,
    nextAssigneeEmail
  )
  const ccEmails = mergeUniqueEmails(requester.email ? [requester.email] : [], peerCc).filter(
    (email) => email !== nextAssigneeEmail
  )

  const emailHtml = emailRequestRegisterVendorTemplate({
    requestNumber,
    recipientName: resolveDisplayName([nextAssigneeProfile?.fullName], 'PO PIC'),
    vendorName: vendorData.company_name || 'Error Connection',
    address: vendorData.address || 'Error Connection',
    contactPic: vendorData.contact_name || 'Error Connection',
    email: vendorData.email || 'Error Connection',
    tel: vendorData.tel_phone || 'Error Connection',
    supportProduct: dataItem.SUPPORTPRODUCT_PROCESS || 'Error Connection',
    purchaseFrequency: dataItem.PURCHASE_FREQUENCY || 'Error Connection',
    systemLink: systemLink('request-register'),
    userName: requester.name,
    userTel: '',
  })

  await sendTemplatedEmail({
    templateName: 'emailRequestRegisterVendorTemplate',
    emailHtml,
    toEmail: nextAssigneeEmail,
    subject: `[Request Check] Please request check register vendor follow as "${requestNumber}"`,
    ccEmails,
    requestId: insertedId,
    requestNumber,
    extra: {
      flow: 'triggerCreationEmail',
      assigneeEmpCode: nextAssignee.empCode || '',
      assigneeGroupCode: assigneeGroupCode || '',
      peerCc,
      requesterEmail: requester.email,
      finalCcEmails: ccEmails,
      groupRecipientInspection,
    },
  })
}

export const sendAgreementEmail = async (dataItem: any) => {
  let vd: VendorContext = {}
  let selectedContactEmails: string[] = []

  if (dataItem.REQUEST_ID) {
    vd = await fetchVendorContext(Number(dataItem.REQUEST_ID))
    selectedContactEmails = await fetchVendorContactEmails(Number(dataItem.REQUEST_ID))
  }

  const recipientEmails = mergeUniqueEmails(selectedContactEmails, [
    dataItem.EMAILMAIN,
    vd.selected_vendor_email,
    vd.vendor_email,
    vd.vendor_main_email,
    vd.emailmain,
  ])
  if (!recipientEmails.length) throw new Error('Vendor email is required')

  const recipientEmail = recipientEmails.join(';')
  let ccEmails: string[] = []

  if (dataItem.REQUEST_ID) {
    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)

    ccEmails = excludeEmails(mergeUniqueEmails(poPicContext.allPoPicEmails), [
      ...recipientEmails,
      vd.emailmain,
      vd.vendor_email,
      vd.vendor_main_email,
    ])

    dataItem.PIC_NAME =
      dataItem.PIC_NAME || resolveDisplayName([picProfile?.fullName], 'PO PIC')
  }

  const resolvedRequestNumber = String(dataItem.REQUEST_NUMBER || vd.request_number || '').trim()
  if (!resolvedRequestNumber) {
    throw new Error('Request number is required before sending Agreement to Vendor')
  }

  const attachments = buildVendorDocumentAttachments(
    vd.vendor_region || dataItem.VENDOR_REGION,
    false
  )

  SelectionFileService.createFolderStructure(resolvedRequestNumber)
  if (attachments.length > 0) {
    SelectionFileService.copyAttachmentsToSending(resolvedRequestNumber, attachments)
  }

  const emailHtml = emailVendorDocumentRequestTemplate({
    vendorEmail: recipientEmail,
    ccEmail: ccEmails.join('; '),
    topicRef: resolvedRequestNumber,
    isNewSupplier: !dataItem.FFT_VENDOR_CODE,
    picName: dataItem.PIC_NAME || 'PO PIC',
    picTel: dataItem.PIC_TEL || '',
  })

  await sendTemplatedEmail({
    templateName: 'emailVendorDocumentRequestTemplate',
    emailHtml,
    toEmail: recipientEmail,
    subject: dataItem.EMAIL_SUBJECT || `[Request Submit] Document for ${resolvedRequestNumber}`,
    ccEmails,
    requestId: dataItem.REQUEST_ID,
    requestNumber: resolvedRequestNumber,
    attachments,
    extra: { flow: 'sendAgreementEmail' },
  })

  return { sent_to: recipientEmail }
}

export const triggerVendorDocumentEmail = async (requestId: number, stageHint?: string) => {
  try {
    const vd = await fetchVendorContext(requestId)
    const selectedContactEmails = await fetchVendorContactEmails(requestId)

    const vendorEmails = mergeUniqueEmails(selectedContactEmails, [
      vd.selected_vendor_email,
      vd.vendor_email,
      vd.vendor_main_email,
      vd.emailmain,
    ])
    const vendorEmail = vendorEmails.join(';')
    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PO PIC')
    const picTel = ''

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const ccEmails = excludeEmails(mergeUniqueEmails(poPicContext.allPoPicEmails), [
      ...vendorEmails,
      vd.emailmain,
    ])

    const stageHintNorm = String(stageHint || '').trim().toLowerCase()
    const isGprBStage = stageHintNorm.includes('gpr b')
    const isGprCStage = stageHintNorm.includes('gpr c')

    // GPR C: send setup email to requester instead of vendor
    if (isGprCStage) {
      const requester = await resolveRequesterMailProfile(vd)
      if (!requester.email) return { sent: false, reason: 'missing requester email for GPR C setup' }

      const gprCCcEmails = excludeEmails(
        mergeUniqueEmails(poPicContext.allPoPicEmails).filter((email) => email !== requester.email),
        [...vendorEmails, vd.emailmain]
      )

      const emailHtml = emailGprCRequesterSetupTemplate({
        toEmail: requester.email,
        ccEmail: gprCCcEmails.join('; '),
        requestNumber,
        userName: requester.name,
        picName,
        picTel,
        vendorName: vd.company_name || 'N/A',
        address: vd.address || 'N/A',
        contactPic: vd.contact_name || 'N/A',
        email: vd.emailmain || 'N/A',
        tel: vd.tel_phone || 'N/A',
        supportProduct: vd.supportProduct_Process || 'N/A',
        purchaseFrequency: vd.purchase_frequency || 'N/A',
        systemLink: systemLink('request-history'),
      })

      await sendTemplatedEmail({
        templateName: 'emailGprCRequesterSetupTemplate',
        emailHtml,
        toEmail: requester.email,
        subject: `[GPR C Setup] Please setup GPR C approver for ${requestNumber}`,
        ccEmails: gprCCcEmails,
        requestId,
        requestNumber,
        extra: {
          flow: 'triggerVendorDocumentEmail',
          stageHint: stageHint || 'GPR C',
          requesterEmail: requester.email,
          requesterName: requester.name,
        },
      })

      return { sent: true, to: requester.email, ccCount: gprCCcEmails.length }
    }

    if (!vendorEmail) return { sent: false, reason: 'missing vendor email' }

    const attachments = buildVendorDocumentAttachments(vd.vendor_region, isGprBStage)
    SelectionFileService.createFolderStructure(requestNumber)
    if (attachments.length > 0) {
      SelectionFileService.copyAttachmentsToSending(requestNumber, attachments)
    }

    const emailHtml = isGprBStage
      ? emailExternalSubmitGPRBTemplate({
          vendorEmail,
          ccEmail: ccEmails.join('; '),
          requestNumber,
          picName,
          picTel,
        })
      : emailVendorDocumentRequestTemplate({
          vendorEmail,
          ccEmail: ccEmails.join('; '),
          topicRef: requestNumber,
          isNewSupplier: !vd.fft_vendor_code,
          picName,
          picTel,
        })

    await sendTemplatedEmail({
      templateName: isGprBStage ? 'emailExternalSubmitGPRBTemplate' : 'emailVendorDocumentRequestTemplate',
      emailHtml,
      toEmail: vendorEmail,
      subject: isGprBStage
        ? `[Request Submit] Please submit ${requestNumber} - General Purchase Specification Form B`
        : `[Request Submit] Document for ${requestNumber}`,
      ccEmails,
      requestId,
      requestNumber,
      attachments,
      extra: { flow: 'triggerVendorDocumentEmail', stageHint: stageHint || '' },
    })

    return { sent: true, to: vendorEmail, ccCount: ccEmails.length }
  } catch (err: any) {
    console.error('[triggerVendorDocumentEmail] Failed:', err?.message)
    return { sent: false, reason: err?.message || 'send failed' }
  }
}

export const triggerApprovalEmails = async (dataItem: any, nextStep: any, dynamicApprover: string) => {
  try {
    const requestId = dataItem.REQUEST_ID
    const vd = await fetchVendorContext(requestId)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PIC')
    const picTel = ''

    let targetApprover = dynamicApprover || nextStep?.approver_id || ''
    let approverEmail = ''
    let approverName = ''

    if (targetApprover) {
      const approverProfile = await resolveAssigneeProfile(targetApprover)
      approverEmail = await resolveAssignedEmail(targetApprover)
      approverName = resolveDisplayName([approverProfile?.fullName], '')
    }

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
    const requester = await resolveRequesterMailProfile(vd)

    const nextStepCode = inferStepCode(nextStep)
    const nextStepDesc = normalizeText(nextStep?.DESCRIPTION)
    const isDocumentCheckerStep =
      nextStepCode === 'DOC_CHECK' ||
      nextStepDesc.includes('checker') ||
      nextStepDesc.includes('check all document')
    const isPmMgrAndAbove = ['PO_MGR_APPROVAL', 'PO_GM_APPROVAL', 'MD_APPROVAL'].includes(nextStepCode)
    const isAccountStep = nextStepCode === 'ACCOUNT_REGISTERED'
    const isDefaultStep = !isDocumentCheckerStep && !isPmMgrAndAbove && !isAccountStep

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()
    const poMgrCc = await getPoMgrEmails()
    const accPicCc = await getAccountCcByRegion(vd.vendor_region)

    const nextGroupCode =
      isDocumentCheckerStep
        ? GROUP_CODE.PO_CHECKER_MAIN
        : nextStep?.group_code || resolveGroupCodeForStep(nextStep, isOverseaRegion(vd.vendor_region))

    if (!approverEmail && nextGroupCode) {
      const primaryAssignee = await resolvePrimaryAssigneeByGroupCode(nextGroupCode)
      if (primaryAssignee?.email) {
        targetApprover = primaryAssignee.empCode
        approverEmail = primaryAssignee.email
        approverName = primaryAssignee.fullName
      }
    }

    const peerApproverCc = await getPeerCcEmailsByGroupCode(nextGroupCode, targetApprover, approverEmail)

    // Build cc list per step type
    const ccSources: string[][] = isDocumentCheckerStep
      ? [requester.email ? [requester.email] : [], poPicContext.allPoPicEmails, poMgrCc]
      : isPmMgrAndAbove
      ? [checkerPicCc, requester.email ? [requester.email] : [], poPicContext.allPoPicEmails]
      : isAccountStep
      ? [accPicCc, checkerPicCc, requester.email ? [requester.email] : [], poPicContext.allPoPicEmails]
      : [poPicContext.allPoPicEmails, peerApproverCc] // isDefaultStep

    const ccEmails = excludeEmails(
      mergeUniqueEmails(...ccSources).filter((email) => email !== normalizeEmail(approverEmail)),
      [vd.vendor_email, vd.vendor_main_email]
    )

    if (!approverEmail) return

    const baseEmailData: MailTemplateData = {
      toEmail: approverEmail,
      ccEmail: ccEmails.join('; '),
      requestNumber,
      recipientName: resolveDisplayName([approverName], 'Approver'),
      vendorName: vd.company_name || 'N/A',
      address: vd.address || 'N/A',
      contactPic: vd.contact_name || 'N/A',
      email: vd.vendor_email || 'N/A',
      tel: vd.tel_phone || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      purchaseFrequency: vd.purchase_frequency || 'N/A',
      systemLink: systemLink('request-register'),
      picName,
      picTel,
    }

    const { templateName, emailHtml, emailSubject } = selectApprovalNotificationByStep(
      nextStep,
      baseEmailData,
      requestNumber
    )

    await sendTemplatedEmail({
      templateName,
      emailHtml,
      toEmail: approverEmail,
      subject: emailSubject,
      ccEmails,
      requestId,
      requestNumber,
      extra: {
        flow: 'triggerApprovalEmails',
        stepCode: inferStepCode(nextStep),
        approverEmpCode: targetApprover || '',
      },
    })
  } catch (err: any) {
    console.error('[triggerApprovalEmails] Failed:', err?.message)
  }
}

export const triggerActionRequiredEmail = async (dataItem: any, currentStep: any) => {
  try {
    const requestId = dataItem.REQUEST_ID
    const vd = await fetchVendorContext(requestId)

    const stageKey = resolveActionRequiredStage(currentStep)
    if (!stageKey) return

    const setup = parseStoredObject(vd.action_required_json)
    const stageConfig = setup?.[stageKey] || {}
    const recipientEmail = normalizeEmail(stageConfig?.pic_email)
    if (!recipientEmail) return

    const recipientName = String(stageConfig?.pic_name || 'PIC').trim()
    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PO PIC')
    const picTel = ''

    const ccEmails = excludeEmails(
      mergeUniqueEmails(picEmail ? [picEmail] : []).filter((email) => email !== recipientEmail),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const stageLabelMap: Record<StageKey, string> = {
      engineer: 'Engineer Judgement',
      emr: 'EMR Judgement',
      qms: 'QMS Judgement',
      pm_manager: 'PM Manager Approval',
    }
    const stageLabel = String(stageConfig?.stage_label || stageLabelMap[stageKey]).trim()

    const emailHtml = emailActionRequiredTemplate({
      stageLabel,
      recipientName,
      requestNumber,
      vendorName: vd.company_name || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      systemLink: systemLink('request-register'),
      note: String(dataItem?.approver_remark || '').trim(),
      picName,
      picTel,
    })

    await sendTemplatedEmail({
      templateName: 'emailActionRequiredTemplate',
      emailHtml,
      toEmail: recipientEmail,
      subject: `[Action Required] ${stageLabel} for ${requestNumber}`,
      ccEmails,
      requestId,
      requestNumber,
      extra: { flow: 'triggerActionRequiredEmail', stageKey, stageLabel },
    })
  } catch (err: any) {
    console.error('[triggerActionRequiredEmail] Failed:', err?.message)
  }
}

export const triggerAfterGprCApprovedEmail = async (dataItem: any) => {
  try {
    const requestId = Number(dataItem.REQUEST_ID) || 0
    if (!requestId) return

    const vd = await fetchVendorContext(requestId)
    const requester = await resolveRequesterMailProfile(vd)
    if (!requester.email) return

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PO PIC')
    const picTel = ''

    const gprCMeta = getGprCSetupMeta(vd.action_required_json)
    const gprCApproverEmail = await resolveAssignedEmail(
      String(gprCMeta?.gpr_c_approver_empcode || '').trim()
    )
    const gprCPcPicEmail = normalizeEmail(vd.gpr_c_pc_pic_email)
    const circularEmails = await resolveCircularAssignedEmails(vd.gpr_c_circular_json)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(
        picEmail ? [picEmail] : [],
        gprCApproverEmail ? [gprCApproverEmail] : [],
        gprCPcPicEmail ? [gprCPcPicEmail] : [],
        circularEmails
      ).filter((email) => email !== requester.email),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const emailHtml = emailGprCStepApprovalTemplate({
      toEmail: requester.email,
      ccEmail: ccEmails.join('; '),
      requestNumber,
      picNextStepName: requester.name,
      picName,
      picTel,
      vendorName: vd.company_name || 'N/A',
      address: vd.address || 'N/A',
      contactPic: vd.contact_name || 'N/A',
      email: vd.vendor_email || vd.emailmain || 'N/A',
      tel: vd.tel_phone || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      purchaseFrequency: vd.purchase_frequency || 'N/A',
      systemLink: systemLink('request-register'),
    })

    await sendTemplatedEmail({
      templateName: 'emailGprCStepApprovalTemplate',
      emailHtml,
      toEmail: requester.email,
      subject: `[Request Update] ${requestNumber} - General Purchase Specification Form C approved`,
      ccEmails,
      requestId,
      requestNumber,
      extra: { flow: 'triggerAfterGprCApprovedEmail' },
    })
  } catch (err: any) {
    console.error('[triggerAfterGprCApprovedEmail] Failed:', err?.message)
  }
}

export const triggerRejectionEmail = async (dataItem: any, currentStep: any) => {
  try {
    const requestId = dataItem.REQUEST_ID
    const vd = await fetchVendorContext(requestId)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PIC')
    const picTel = ''

    const approverEmail = await resolveAssignedEmail(currentStep?.approver_id)
    const requester = await resolveRequesterMailProfile(vd)
    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()

    const currentStepCode = inferStepCode(currentStep)
    const currentStepDesc = normalizeText(currentStep?.DESCRIPTION)
    const isCheckerReject =
      currentStepCode === 'DOC_CHECK' ||
      currentStepDesc.includes('checker') ||
      currentStepDesc.includes('check document') ||
      currentStepDesc.includes('check all document')

    const isPicReject = currentStepCode === 'PIC_REVIEW'

    const ccSources = isCheckerReject
      ? [checkerPicCc, requester.email ? [requester.email] : [], poPicContext.peerPicCc]
      : isPicReject
        ? [picEmail ? [picEmail] : []]
        : [poPicContext.peerPicCc, requester.email ? [requester.email] : [], approverEmail ? [approverEmail] : []]

    const primaryToEmail = isPicReject ? requester.email : picEmail
    const recipientName = isPicReject ? requester.name : picName

    if (!primaryToEmail) return

    const ccEmails = excludeEmails(
      mergeUniqueEmails(...ccSources).filter((email) => email !== normalizeEmail(primaryToEmail)),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const rejectTemplate = isCheckerReject ? emailReject2Template : emailReject1Template
    const rejectRemark = dataItem.APPROVER_REMARK || ''

    const emailHtml = rejectTemplate({
      toEmail: primaryToEmail,
      recipientName,
      ccEmailLine1: approverEmail,
      ccEmailLine2: ccEmails.filter((email) => email !== approverEmail).join('; '),
      requestNumber,
      remarkEN: rejectRemark,
      remarkTH: rejectRemark,
      vendorName: vd.company_name || 'N/A',
      address: vd.address || 'N/A',
      contactPic: vd.contact_name || 'N/A',
      email: vd.vendor_email || 'N/A',
      tel: vd.tel_phone || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      purchaseFrequency: vd.purchase_frequency || 'N/A',
      systemLink: systemLink('request-register'),
      picName,
      picTel,
    })

    await sendTemplatedEmail({
      templateName: isCheckerReject ? 'emailReject2Template' : 'emailReject1Template',
      emailHtml,
      toEmail: primaryToEmail,
      subject: isCheckerReject
        ? `[RECHECK] Register vendor "${requestNumber}" requires recheck`
        : `[REJECT] Register vendor "${requestNumber}" has been rejected`,
      ccEmails,
      requestId,
      requestNumber,
      extra: {
        flow: 'triggerRejectionEmail',
        approverEmpCode: currentStep?.approver_id || '',
        stepCode: currentStepCode,
      },
    })
  } catch (err: any) {
    console.error('[triggerRejectionEmail] Failed:', err?.message)
  }
}

export const triggerCompletionEmail = async (dataItem: any) => {
  try {
    const requestId = dataItem.REQUEST_ID
    const vd = await fetchVendorContext(requestId)

    const requester = await resolveRequesterMailProfile(vd)
    if (!requester.email) return

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PIC')
    const picTel = ''

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()
    const accPicCc = await getAccountCcByRegion(vd.vendor_region)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(accPicCc, checkerPicCc, poPicContext.allPoPicEmails).filter(
        (email) => email !== requester.email
      ),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const emailHtml = emailCompleteTemplate({
      toEmail: requester.email,
      ccEmail: ccEmails.join('; '),
      requestNumber,
      vendorName: vd.company_name || 'N/A',
      address: vd.address || 'N/A',
      contactPic: vd.contact_name || 'N/A',
      email: vd.vendor_email || 'N/A',
      tel: vd.tel_phone || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      purchaseFrequency: vd.purchase_frequency || 'N/A',
      systemLink: systemLink('request-register'),
      picName,
      picTel,
      vendorCode: dataItem.VENDOR_CODE || vd.vendor_code || 'Pending',
      userName: requester.name || 'Requester',
    })

    await sendTemplatedEmail({
      templateName: 'emailCompleteTemplate',
      emailHtml,
      toEmail: requester.email,
      subject: `[Complete] Register vendor "${requestNumber}" is now completed`,
      ccEmails,
      requestId,
      requestNumber,
      extra: { flow: 'triggerCompletionEmail', vendorCode: dataItem.VENDOR_CODE || vd.vendor_code || '' },
    })
  } catch (err: any) {
    console.error('[triggerCompletionEmail] Failed:', err?.message)
  }
}

export const triggerVendorDisagreeEmail = async (dataItem: any) => {
  try {
    const requestId = Number(dataItem.REQUEST_ID) || 0
    if (!requestId) return

    const vd = await fetchVendorContext(requestId)
    const requester = await resolveRequesterMailProfile(vd)
    if (!requester.email) return

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PO PIC')
    const picTel = ''

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()
    const accPicCc = await getAccountCcByRegion(vd.vendor_region)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(accPicCc, checkerPicCc, poPicContext.allPoPicEmails).filter(
        (email) => email !== requester.email
      ),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const safeRemark = String(dataItem.APPROVER_REMARK || '').trim()
    const reasons = ['Vendor disagreed after GPR negotiation rounds', ...(safeRemark ? [safeRemark] : [])]

    const emailHtml = emailIncompleteTemplate({
      toEmail: requester.email,
      ccEmail: ccEmails.join('; '),
      requestNumber,
      userName: requester.name,
      vendorName: vd.company_name || 'N/A',
      address: vd.address || 'N/A',
      contactPic: vd.contact_name || 'N/A',
      email: vd.vendor_email || vd.emailmain || 'N/A',
      tel: vd.tel_phone || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      purchaseFrequency: vd.purchase_frequency || 'N/A',
      systemLink: systemLink('request-register'),
      picName,
      picTel,
      reasons,
    })

    await sendTemplatedEmail({
      templateName: 'emailIncompleteTemplate',
      emailHtml,
      toEmail: requester.email,
      subject: `[Incomplete] Register vendor "${requestNumber}" ended as Vendor Disagreed`,
      ccEmails,
      requestId,
      requestNumber,
      extra: { flow: 'triggerVendorDisagreeEmail' },
    })
  } catch (err: any) {
    console.error('[triggerVendorDisagreeEmail] Failed:', err?.message)
  }
}
