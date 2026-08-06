import { MySQLExecute } from '@businessData/dbExecute'
import { RequestRegisterPageSQL } from '../../sql/_request-register/RequestRegisterPageSQL'
import sendEmail, { type MailAttachment } from '@src/config/sendEmail'
import fs from 'fs'
import path from 'path'
import {
  email_ToUser_ActionRequired,
  email_ToGprCApprover_NextStep,
  email_ToSupplier_RequestFormB,
  email_ToRequester_GprCSetup,
  email_ToRequester_RegistrationCompleted,
  email_ToRequester_RegistrationIncomplete,
  email_ToPic_RejectedByApprover,
  email_ToPic_RejectedByChecker,
  email_ToPic_RequestRegisterVendor,
  email_ToAccount_RegisterRequired,
  email_ToChecker_CheckRequired,
  email_ToChecker_ReturnedByPoMgr,
  email_ToMd_ApproveRequired,
  email_ToPoGm_ApproveRequired,
  email_ToPoManager_ApproveRequired,
  email_ToSupplier_RequestFormA,
  type MailTemplateData,
} from '@src/config/mailTemplate'
import { SelectionFileService } from './SelectionFileService'
import { buildPoMgrReturnTestMailRoute, PO_MGR_RETURN_TEST_EMP_CODE } from './PoMgrReturnNotificationRoute'
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
import {
  getWorkflowStepIdentity,
  type WorkflowStepIdentity,
} from '../_status-master/StatusIdentityService'

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_ORIGIN = process.env.VENDOR_SYSTEM_ORIGIN || 'http://localhost:5173'

// POSIX paths: the c01_qms share is mounted at /mnt/c01_qms on the host. See SelectionFileService.
const DEFAULT_VENDOR_DOCUMENT_BASE = '/mnt/c01_qms/PM/02_Record/FM-PM-303 Selection Supplier/FM-PM-303 Selection Supplier Test/00.DocumentSet'
const DEFAULT_VENDOR_DOCUMENT_LOCAL_PATH = `${DEFAULT_VENDOR_DOCUMENT_BASE}/01.New (Full)/Local/00.Sending`
const DEFAULT_VENDOR_DOCUMENT_OVERSEA_PATH = `${DEFAULT_VENDOR_DOCUMENT_BASE}/01.New (Full)/Oversea/00.Sending`
const DEFAULT_VENDOR_DOCUMENT_FORM_B_PATH = `${DEFAULT_VENDOR_DOCUMENT_BASE}/00.Purchase Form/FORM B.xlsx`
const VENDOR_DOCUMENT_ATTACHMENT_EXTENSIONS = new Set(['.pdf', '.xlsx', '.xls', '.doc', '.docx'])

const getVendorDocumentLocalPath = () => process.env.VENDOR_DOCUMENT_LOCAL_PATH || DEFAULT_VENDOR_DOCUMENT_LOCAL_PATH
const getVendorDocumentOverseaPath = () => process.env.VENDOR_DOCUMENT_OVERSEA_PATH || DEFAULT_VENDOR_DOCUMENT_OVERSEA_PATH
const getVendorDocumentFormBPath = () => process.env.VENDOR_DOCUMENT_FORM_B_PATH || DEFAULT_VENDOR_DOCUMENT_FORM_B_PATH

const logVendorDocumentFolder = (message: string, detail?: unknown) => {
  if (detail === undefined) {
    console.log(`[VendorDocumentFolder] ${message}`)
    return
  }

  console.log(`[VendorDocumentFolder] ${message}:`, detail)
}

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
  tel: string
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
  [String(getValue(row, 'empName', 'EMPNAME') || '').trim(), String(getValue(row, 'empSurname', 'EMPSURNAME') || '').trim()].filter(Boolean).join(' ')

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
    tel: String(row?.EMP_TEL || row?.emp_tel || '').trim(),
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
  const memberProfile = await resolveEmployeeProfile(empCode).catch(() => null)
  const email = normalizeEmail(rows[0]?.empEmail || rows[0]?.EMPEMAIL) || memberProfile?.email || ''
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
  const memberProfile = await resolveEmployeeProfile(empCode).catch(() => null)

  if (!row) {
    assigneeProfileCache.set(empCode, memberProfile)
    return memberProfile
  }

  const profile: EmployeeProfile = {
    empCode,
    fullName: buildFullName(row) || String(row?.empName || row?.EMPNAME || '').trim() || memberProfile?.fullName || '',
    email: normalizeEmail(row?.empEmail || row?.EMPEMAIL) || memberProfile?.email || '',
    tel: String(row?.EMP_TEL || row?.emp_tel || '').trim() || memberProfile?.tel || '',
  }
  assigneeProfileCache.set(empCode, profile)
  return profile
}

// ─── Group / peer email helpers ───────────────────────────────────────────────

const getPeerCcEmailsByExactGroupCode = async (groupCode: string, excludeEmpCode?: string, excludeEmail?: string): Promise<string[]> => {
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

const inspectGroupRecipients = async (groupCode: string, excludeEmpCode?: string, excludeEmail?: string) => {
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

export const getPeerCcEmailsByGroupCode = async (groupCode: string, excludeEmpCode?: string, excludeEmail?: string): Promise<string[]> => {
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
    REQUEST_REGISTER_VENDOR_ID: requestId,
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
  const sql = await RequestRegisterPageSQL.getRequestVendorContactsByRequestId({ REQUEST_REGISTER_VENDOR_ID: requestId })
  const rows = (await MySQLExecute.search(sql)) as any[]
  return rows.map((c) => getValue(c, 'email', 'EMAIL'))
}

// ─── PIC / region helpers ─────────────────────────────────────────────────────

const isOverseaRegion = (vendorRegion: any) => normalizeText(vendorRegion) === 'oversea'

const getPoPicAndSubPicCc = async (vendorRegion: any, assignedPicEmpCode: any, assignedPicEmail?: string) => {
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
const getAccountCcByRegion = (vendorRegion: any) => getPeerCcEmailsByGroupCode(isOverseaRegion(vendorRegion) ? GROUP_CODE.ACC_OVERSEA_CC : GROUP_CODE.ACC_LOCAL_CC)
// The actual ACCPIC group (who processes account registration), distinct from the ACC_*_CC notify-only group above.
const getAccountPicByRegion = (vendorRegion: any) => getPeerCcEmailsByGroupCode(isOverseaRegion(vendorRegion) ? GROUP_CODE.ACC_OVERSEA_MAIN : GROUP_CODE.ACC_LOCAL_MAIN)

// ─── Requester profile helper ─────────────────────────────────────────────────

const resolveRequesterMailProfile = async (vd: VendorContext) => {
  const requesterEmpCode = String(vd.REQUEST_BY_EMPLOYEECODE || vd.Request_By_EmployeeCode || vd.request_by_employeecode || '').trim()
  const directRequesterEmail = normalizeEmail(vd.REQUEST_BY_EMAIL || vd.request_by_email)
  const profile = requesterEmpCode ? await resolveEmployeeProfile(requesterEmpCode) : null
  return {
    profile,
    empCode: requesterEmpCode,
    email: directRequesterEmail || normalizeEmail(profile?.email),
    name: resolveDisplayName([profile?.fullName], 'Requester'),
    tel: profile?.tel || '',
  }
}

// ─── Vendor document attachments ──────────────────────────────────────────────

const buildVendorDocumentAttachments = (vendorRegion: any, isGprBStage = false): MailAttachment[] => {
  if (isGprBStage) {
    const formBPath = getVendorDocumentFormBPath()
    const formBFolder = path.dirname(formBPath)
    logVendorDocumentFolder('Checking GPR B form folder', formBFolder)
    if (!fs.existsSync(formBFolder)) {
      logVendorDocumentFolder('GPR B form folder not found', formBFolder)
    } else {
      logVendorDocumentFolder('GPR B form folder found', formBFolder)
    }
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
  logVendorDocumentFolder('Checking agreement document folder', { vendorRegion, basePath })
  if (!fs.existsSync(basePath)) {
    logVendorDocumentFolder('Agreement document folder not found', basePath)
    throw new Error(`Agreement document folder not found: ${basePath}`)
  }
  logVendorDocumentFolder('Agreement document folder found', basePath)

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

const isEmployeeCodeLike = (value: unknown) => /^[A-Z]\d{3,}$/i.test(String(value || '').trim())

const isEmailLike = (value: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

const isRoleFallbackName = (value: unknown) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  return ['pic', 'po pic', 'po checker', 'account pic', 'approver', 'requester'].includes(normalized)
}

const isNonPersonDisplayName = (value: unknown) => isRoleFallbackName(value) || isEmployeeCodeLike(value) || isEmailLike(value)

const resolveDisplayName = (options: Array<unknown>, fallbackLabel: string) => {
  for (const option of options) {
    const value = String(option || '').trim()
    if (!value || isNonPersonDisplayName(value)) continue
    return value
  }
  return fallbackLabel
}

const resolveMailRecipientName = (options: Array<unknown>, fallbackLabel = 'Recipient') => {
  for (const option of options) {
    const value = String(option || '').trim()
    if (!value || isNonPersonDisplayName(value)) continue
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
        typeof item === 'string' ? { empcode: '', email: normalizeEmail(item) } : { empcode: String(item?.empcode || '').trim(), email: normalizeEmail(item?.email) }
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

  const resolved = await Promise.all(members.map((member) => (member.empcode ? resolveAssignedEmail(member.empcode) : '')))
  return mergeUniqueEmails(resolved)
}

const getGprCSetupMeta = (raw: any) => parseStoredObject(parseStoredObject(raw)?._meta)

const previewRecipientList = (emails: string[] = []) =>
  emails
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
    .slice(0, 10)

const systemLink = (page: 'request-register' | 'request-register-history') => `${SYSTEM_ORIGIN}/en/${page}`

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
  requestNumber: string,
  workflowStepIds: WorkflowStepIdentity
): { templateName: string; emailHtml: string; emailSubject: string } => {
  const workflowStepMasterId = Number(getValue(step, 'workflow_step_id', 'WORKFLOW_STEP_MASTER_ID') || 0)

  if (workflowStepMasterId === workflowStepIds.poGmApproval) {
    return {
      templateName: 'email_ToPoGm_ApproveRequired',
      emailHtml: email_ToPoGm_ApproveRequired({ ...baseEmailData, recipientName: baseEmailData.recipientName || 'PO GM' }),
      emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - PO GM Step`,
    }
  }

  if (workflowStepMasterId === workflowStepIds.poMgrApproval) {
    return {
      templateName: 'email_ToPoManager_ApproveRequired',
      emailHtml: email_ToPoManager_ApproveRequired({ ...baseEmailData, recipientName: baseEmailData.recipientName || 'PO Mgr' }),
      emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - PO Mgr Step`,
    }
  }

  if (workflowStepMasterId === workflowStepIds.mdApproval) {
    return {
      templateName: 'email_ToMd_ApproveRequired',
      emailHtml: email_ToMd_ApproveRequired({ ...baseEmailData, recipientName: baseEmailData.recipientName || 'MD' }),
      emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - MD Approval`,
    }
  }

  if (workflowStepMasterId === workflowStepIds.accountRegistered) {
    return {
      templateName: 'email_ToAccount_RegisterRequired',
      emailHtml: email_ToAccount_RegisterRequired({
        ...baseEmailData,
        recipientName: resolveMailRecipientName([baseEmailData.recipientName], 'Account PIC'),
      }),
      emailSubject: `[Request Action] Please process register vendor "${requestNumber}" - Account Step`,
    }
  }

  if (workflowStepMasterId === workflowStepIds.docCheck) {
    return {
      templateName: 'email_ToChecker_CheckRequired',
      emailHtml: email_ToChecker_CheckRequired({
        ...baseEmailData,
        recipientName: resolveMailRecipientName([baseEmailData.recipientName], 'PO Checker'),
      }),
      emailSubject: `[Request Check] Please check register vendor "${requestNumber}" - Document Step`,
    }
  }

  // Fallback
  return {
    templateName: 'email_ToPoManager_ApproveRequired',
    emailHtml: email_ToPoManager_ApproveRequired({ ...baseEmailData, recipientName: 'Approver' }),
    emailSubject: `[Request Approval] Please process register vendor "${requestNumber}"`,
  }
}

// ─── Exported trigger functions ───────────────────────────────────────────────

export const sendMail_ToPic_NewRequest = async (
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

  const groupRecipientInspection = await inspectGroupRecipients(assigneeGroupCode || '', nextAssignee.empCode, nextAssigneeEmail)
  const peerCc = await getPeerCcEmailsByExactGroupCode(assigneeGroupCode || '', nextAssignee.empCode, nextAssigneeEmail)
  const ccEmails = mergeUniqueEmails(requester.email ? [requester.email] : [], peerCc).filter((email) => email !== nextAssigneeEmail)

  const emailHtml = email_ToPic_RequestRegisterVendor({
    requestNumber,
    recipientName: resolveMailRecipientName([nextAssigneeProfile?.fullName, nextAssignee.empCode, nextAssigneeEmail], 'Recipient'),
    vendorName: vendorData.company_name || 'Error Connection',
    address: vendorData.address || 'Error Connection',
    contactPic: vendorData.contact_name || 'Error Connection',
    email: vendorData.email || 'Error Connection',
    tel: vendorData.tel_phone || 'Error Connection',
    supportProduct: dataItem.SUPPORTPRODUCT_PROCESS || 'Error Connection',
    purchaseFrequency: dataItem.PURCHASE_FREQUENCY || 'Error Connection',
    systemLink: systemLink('request-register'),
    userName: requester.name,
    userTel: requester.tel,
  })

  await sendTemplatedEmail({
    templateName: 'email_ToPic_RequestRegisterVendor',
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

export const sendMail_ToSupplier_RequestFormA = async (dataItem: any) => {
  let vd: VendorContext = {}
  let selectedContactEmails: string[] = []

  if (dataItem.REQUEST_REGISTER_VENDOR_ID) {
    vd = await fetchVendorContext(Number(dataItem.REQUEST_REGISTER_VENDOR_ID))
    selectedContactEmails = await fetchVendorContactEmails(Number(dataItem.REQUEST_REGISTER_VENDOR_ID))
  }

  const recipientEmails = mergeUniqueEmails(selectedContactEmails, [dataItem.EMAILMAIN, vd.selected_vendor_email, vd.vendor_email, vd.vendor_main_email, vd.emailmain])
  if (!recipientEmails.length) throw new Error('Vendor email is required')

  const recipientEmail = recipientEmails.join(';')
  let ccEmails: string[] = []

  if (dataItem.REQUEST_REGISTER_VENDOR_ID) {
    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)

    ccEmails = excludeEmails(mergeUniqueEmails(poPicContext.allPoPicEmails), [...recipientEmails, vd.emailmain, vd.vendor_email, vd.vendor_main_email])

    dataItem.PIC_NAME = dataItem.PIC_NAME || resolveMailRecipientName([picProfile?.fullName, vd.assign_to, picEmail], 'Vendor Registration System')
  }

  const resolvedRequestNumber = String(dataItem.REQUEST_NUMBER || vd.request_number || '').trim()
  if (!resolvedRequestNumber) {
    throw new Error('Request number is required before sending Agreement to Vendor')
  }

  // Create the folder structure before reading the template attachments: a missing template
  // folder must not stop the request's own folders from being provisioned.
  SelectionFileService.createFolderStructure(resolvedRequestNumber)

  const attachments = buildVendorDocumentAttachments(vd.vendor_region || dataItem.VENDOR_REGION, false)

  if (attachments.length > 0) {
    SelectionFileService.copyAttachmentsToSending(resolvedRequestNumber, attachments)
  }

  const emailHtml = email_ToSupplier_RequestFormA({
    vendorEmail: recipientEmail,
    ccEmail: ccEmails.join('; '),
    topicRef: resolvedRequestNumber,
    isNewSupplier: !dataItem.FFT_VENDOR_CODE,
    picName: resolveMailRecipientName([dataItem.PIC_NAME, vd.assign_to], 'Vendor Registration System'),
    picTel: dataItem.PIC_TEL || '',
  })

  await sendTemplatedEmail({
    templateName: 'email_ToSupplier_RequestFormA',
    emailHtml,
    toEmail: recipientEmail,
    subject: dataItem.EMAIL_SUBJECT || `[Request Submit] Document for ${resolvedRequestNumber}`,
    ccEmails,
    requestId: dataItem.REQUEST_REGISTER_VENDOR_ID,
    requestNumber: resolvedRequestNumber,
    attachments,
    extra: { flow: 'sendAgreementEmail' },
  })

  return { sent_to: recipientEmail }
}

export const sendMail_NegotiationStageDispatch = async (requestId: number, stageHint?: string) => {
  try {
    const vd = await fetchVendorContext(requestId)
    const selectedContactEmails = await fetchVendorContactEmails(requestId)

    const vendorEmails = mergeUniqueEmails(selectedContactEmails, [vd.selected_vendor_email, vd.vendor_email, vd.vendor_main_email, vd.emailmain])
    const vendorEmail = vendorEmails.join(';')
    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveMailRecipientName([picProfile?.fullName, vd.assign_to, picEmail], 'Vendor Registration System')
    const picTel = picProfile?.tel || ''

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const ccEmails = excludeEmails(mergeUniqueEmails(poPicContext.allPoPicEmails), [...vendorEmails, vd.emailmain])

    const stageHintNorm = String(stageHint || '')
      .trim()
      .toLowerCase()
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

      const emailHtml = email_ToRequester_GprCSetup({
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
        systemLink: systemLink('request-register-history'),
      })

      await sendTemplatedEmail({
        templateName: 'email_ToRequester_GprCSetup',
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

    SelectionFileService.createFolderStructure(requestNumber)

    const attachments = buildVendorDocumentAttachments(vd.vendor_region, isGprBStage)
    if (attachments.length > 0) {
      SelectionFileService.copyAttachmentsToSending(requestNumber, attachments)
    }

    const emailHtml = isGprBStage
      ? email_ToSupplier_RequestFormB({
          vendorEmail,
          ccEmail: ccEmails.join('; '),
          requestNumber,
          picName,
          picTel,
        })
      : email_ToSupplier_RequestFormA({
          vendorEmail,
          ccEmail: ccEmails.join('; '),
          topicRef: requestNumber,
          isNewSupplier: !vd.fft_vendor_code,
          picName,
          picTel,
        })

    await sendTemplatedEmail({
      templateName: isGprBStage ? 'email_ToSupplier_RequestFormB' : 'email_ToSupplier_RequestFormA',
      emailHtml,
      toEmail: vendorEmail,
      subject: isGprBStage
        ? `[Request Submit] Please Submit register vendor follow as "${requestNumber}" - General Purchase Specification Form B`
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

export const sendMail_ToApprover_NextStep = async (dataItem: any, nextStep: any, dynamicApprover: string) => {
  try {
    const requestId = dataItem.REQUEST_REGISTER_VENDOR_ID
    const vd = await fetchVendorContext(requestId)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveMailRecipientName([picProfile?.fullName, vd.assign_to, picEmail], 'Vendor Registration System')
    const picTel = picProfile?.tel || ''

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

    const workflowStep = await getWorkflowStepIdentity()
    const nextWorkflowStepMasterId = Number(getValue(nextStep, 'workflow_step_id', 'WORKFLOW_STEP_MASTER_ID') || 0)
    const isDocumentCheckerStep = nextWorkflowStepMasterId === workflowStep.docCheck
    const isPmMgrAndAbove = [
      workflowStep.poMgrApproval,
      workflowStep.poGmApproval,
      workflowStep.mdApproval,
    ].includes(nextWorkflowStepMasterId)
    const isAccountStep = nextWorkflowStepMasterId === workflowStep.accountRegistered

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()
    const poMgrCc = await getPoMgrEmails()
    const accPicCc = await getAccountCcByRegion(vd.vendor_region)

    const nextGroupCode = isDocumentCheckerStep ? GROUP_CODE.PO_CHECKER_MAIN : nextStep?.group_code || resolveGroupCodeForStep(nextStep, isOverseaRegion(vd.vendor_region))

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
      recipientName: resolveMailRecipientName([approverName, targetApprover, approverEmail], 'Recipient'),
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
      requestNumber,
      workflowStep
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

export const sendMail_ToDocumentChecker_ReturnedByPoMgr = async (dataItem: any) => {
  try {
    const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID || 0)
    const testRecipient = await resolveEmployeeProfile(PO_MGR_RETURN_TEST_EMP_CODE)
    const testEmail = normalizeEmail(testRecipient?.email)
    const mailRoute = buildPoMgrReturnTestMailRoute(testEmail)

    // Temporary safe test routing: both business roles resolve only to S00823.
    // Do not fall back to the real checker/PIC groups, otherwise a test Return could leak externally.
    if (!mailRoute.toEmail) {
      console.error('[poMgrReturnToDocumentCheck] Email skipped: S00823 has no valid email address.')
      return
    }

    const vd = await fetchVendorContext(requestId)
    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
    const recipientName = resolveMailRecipientName([testRecipient?.fullName, PO_MGR_RETURN_TEST_EMP_CODE], 'PO CHECKER')
    const emailData: MailTemplateData = {
      toEmail: mailRoute.toEmail,
      ccEmail: mailRoute.ccEmails.join('; '),
      requestNumber,
      recipientName,
      vendorName: vd.company_name || 'N/A',
      address: vd.address || 'N/A',
      contactPic: vd.contact_name || 'N/A',
      email: vd.vendor_email || 'N/A',
      tel: vd.tel_phone || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      purchaseFrequency: vd.purchase_frequency || 'N/A',
      systemLink: systemLink('request-register'),
      remarkEN: dataItem.APPROVER_REMARK || '',
      remarkTH: dataItem.APPROVER_REMARK || '',
    }

    await sendTemplatedEmail({
      templateName: 'email_ToChecker_ReturnedByPoMgr',
      emailHtml: email_ToChecker_ReturnedByPoMgr(emailData),
      toEmail: mailRoute.toEmail,
      subject: `[Return for Recheck] PO Mgr returned vendor request "${requestNumber}" - Document Check`,
      ccEmails: mailRoute.ccEmails,
      requestId,
      requestNumber,
      extra: {
        flow: 'poMgrReturnToDocumentCheck',
        toRole: 'PO & SCM Check All Document',
        ccRole: 'PO PIC',
        testToEmpCode: mailRoute.toEmpCode,
        testCcEmpCode: mailRoute.ccEmpCodes.join(';'),
      },
    })
  } catch (err: any) {
    console.error('[poMgrReturnToDocumentCheck] Failed:', err?.message)
  }
}

export const sendMail_ToUser_ActionRequired = async (dataItem: any, currentStep: any) => {
  try {
    const requestId = dataItem.REQUEST_REGISTER_VENDOR_ID
    const vd = await fetchVendorContext(requestId)

    const stageKey = resolveActionRequiredStage(currentStep)
    if (!stageKey) return

    const setup = parseStoredObject(vd.action_required_json)
    const stageConfig = setup?.[stageKey] || {}
    const recipientEmail = normalizeEmail(stageConfig?.pic_email)
    if (!recipientEmail) return

    const recipientName = resolveMailRecipientName([stageConfig?.pic_name, stageConfig?.pic_empcode], 'Recipient')
    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveMailRecipientName([picProfile?.fullName, vd.assign_to, picEmail], 'Vendor Registration System')
    const picTel = picProfile?.tel || ''

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

    const emailHtml = email_ToUser_ActionRequired({
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
      templateName: 'email_ToUser_ActionRequired',
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

export const sendMail_ToRequester_GprCApproved = async (dataItem: any) => {
  try {
    const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID) || 0
    if (!requestId) return

    const vd = await fetchVendorContext(requestId)
    const requester = await resolveRequesterMailProfile(vd)
    if (!requester.email) return

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveMailRecipientName([picProfile?.fullName, vd.assign_to, picEmail], 'Vendor Registration System')
    const picTel = picProfile?.tel || ''

    const gprCMeta = getGprCSetupMeta(vd.action_required_json)
    const gprCApproverEmail = await resolveAssignedEmail(String(gprCMeta?.gpr_c_approver_empcode || '').trim())
    const gprCPcPicEmail = normalizeEmail(vd.gpr_c_pc_pic_email)
    const circularEmails = await resolveCircularAssignedEmails(vd.gpr_c_circular_json)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(picEmail ? [picEmail] : [], gprCApproverEmail ? [gprCApproverEmail] : [], gprCPcPicEmail ? [gprCPcPicEmail] : [], circularEmails).filter(
        (email) => email !== requester.email
      ),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const emailHtml = email_ToGprCApprover_NextStep({
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
      templateName: 'email_ToGprCApprover_NextStep',
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

export const sendMail_ToPic_RequestRejected = async (dataItem: any, currentStep: any) => {
  try {
    const requestId = dataItem.REQUEST_REGISTER_VENDOR_ID
    const vd = await fetchVendorContext(requestId)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveMailRecipientName([picProfile?.fullName, vd.assign_to, picEmail], 'Vendor Registration System')
    const picTel = picProfile?.tel || ''

    const approverEmail = await resolveAssignedEmail(currentStep?.approver_id)
    const requester = await resolveRequesterMailProfile(vd)
    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()

    const workflowStep = await getWorkflowStepIdentity()
    const currentWorkflowStepMasterId = Number(
      getValue(currentStep, 'workflow_step_id', 'WORKFLOW_STEP_MASTER_ID') || 0
    )
    const isCheckerReject = currentWorkflowStepMasterId === workflowStep.docCheck

    const isPicReject = currentWorkflowStepMasterId === workflowStep.picReview

    const ccSources = isCheckerReject
      ? [checkerPicCc, requester.email ? [requester.email] : [], poPicContext.peerPicCc]
      : isPicReject
        ? [picEmail ? [picEmail] : []]
        : [poPicContext.peerPicCc, requester.email ? [requester.email] : [], approverEmail ? [approverEmail] : []]

    const primaryToEmail = isPicReject ? requester.email : picEmail
    const recipientName = isPicReject
      ? resolveMailRecipientName([requester.name, requester.empCode, requester.email], 'Requester')
      : resolveMailRecipientName([picName, vd.assign_to, picEmail], 'PIC')

    if (!primaryToEmail) return

    const ccEmails = excludeEmails(
      mergeUniqueEmails(...ccSources).filter((email) => email !== normalizeEmail(primaryToEmail)),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const rejectTemplate = isCheckerReject ? email_ToPic_RejectedByChecker : email_ToPic_RejectedByApprover
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
      templateName: isCheckerReject ? 'email_ToPic_RejectedByChecker' : 'email_ToPic_RejectedByApprover',
      emailHtml,
      toEmail: primaryToEmail,
      subject: isCheckerReject
        ? `[RECHECK] Register vendor "${requestNumber}" requires recheck`
        : `[REJECT] Please recheck register vendor follow as "${requestNumber}" - General Purchase Specification Form B`,
      ccEmails,
      requestId,
      requestNumber,
      extra: {
        flow: 'triggerRejectionEmail',
        approverEmpCode: currentStep?.approver_id || '',
        stepCode: inferStepCode(currentStep),
      },
    })
  } catch (err: any) {
    console.error('[triggerRejectionEmail] Failed:', err?.message)
  }
}

export const sendMail_ToRequester_RegistrationCompleted = async (dataItem: any) => {
  try {
    const requestId = dataItem.REQUEST_REGISTER_VENDOR_ID
    const vd = await fetchVendorContext(requestId)

    const requester = await resolveRequesterMailProfile(vd)
    if (!requester.email) return

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveMailRecipientName([picProfile?.fullName, vd.assign_to, picEmail], 'Vendor Registration System')
    const picTel = picProfile?.tel || ''

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()
    const accPicMain = await getAccountPicByRegion(vd.vendor_region)
    const accPicCc = await getAccountCcByRegion(vd.vendor_region)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(accPicMain, accPicCc, checkerPicCc, poPicContext.allPoPicEmails).filter((email) => email !== requester.email),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const emailHtml = email_ToRequester_RegistrationCompleted({
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
      userName: resolveMailRecipientName([requester.name, requester.empCode, requester.email], 'Requester'),
    })

    await sendTemplatedEmail({
      templateName: 'email_ToRequester_RegistrationCompleted',
      emailHtml,
      toEmail: requester.email,
      subject: `[Complete] Register vendor "${requestNumber}" has been completed.`,
      ccEmails,
      requestId,
      requestNumber,
      extra: { flow: 'triggerCompletionEmail', vendorCode: dataItem.VENDOR_CODE || vd.vendor_code || '' },
    })
  } catch (err: any) {
    console.error('[triggerCompletionEmail] Failed:', err?.message)
  }
}

export const sendMail_ToRequester_RegistrationIncomplete = async (dataItem: any) => {
  try {
    const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID) || 0
    if (!requestId) return

    const vd = await fetchVendorContext(requestId)
    const requester = await resolveRequesterMailProfile(vd)
    if (!requester.email) return

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveMailRecipientName([picProfile?.fullName, vd.assign_to, picEmail], 'Vendor Registration System')
    const picTel = picProfile?.tel || ''

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()
    const accPicMain = await getAccountPicByRegion(vd.vendor_region)
    const accPicCc = await getAccountCcByRegion(vd.vendor_region)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(accPicMain, accPicCc, checkerPicCc, poPicContext.allPoPicEmails).filter((email) => email !== requester.email),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const safeRemark = String(dataItem.APPROVER_REMARK || '').trim()
    const reasons = ['Vendor disagreed after GPR negotiation rounds', ...(safeRemark ? [safeRemark] : [])]

    const emailHtml = email_ToRequester_RegistrationIncomplete({
      toEmail: requester.email,
      ccEmail: ccEmails.join('; '),
      requestNumber,
      userName: resolveMailRecipientName([requester.name, requester.empCode, requester.email], 'Requester'),
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
      templateName: 'email_ToRequester_RegistrationIncomplete',
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
