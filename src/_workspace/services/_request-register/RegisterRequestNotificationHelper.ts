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
import {
  excludeEmails,
  GROUP_CODE,
  inferStepCode,
  mergeUniqueEmails,
  normalizeEmail,
  normalizeText,
  parseCcEmails,
  resolveGroupCodeForStep,
  resolveRequestNumber,
} from './RegisterRequestWorkflowHelper'

type EmployeeProfile = {
  empCode: string
  fullName: string
  email: string
}

const employeeProfileCache = new Map<string, EmployeeProfile | null>()
const assigneeEmailCache = new Map<string, string>()
const assigneeProfileCache = new Map<string, EmployeeProfile | null>()

const VENDOR_DOCUMENT_LOCAL_PATH = process.env.VENDOR_DOCUMENT_LOCAL_PATH || 'C:\\VendorTest\\01.New (Full)\\Local\\00.Sending'
const VENDOR_DOCUMENT_OVERSEA_PATH = process.env.VENDOR_DOCUMENT_OVERSEA_PATH || 'C:\\VendorTest\\01.New (Full)\\Oversea\\00.Sending'
const VENDOR_DOCUMENT_FORM_B_PATH = process.env.VENDOR_DOCUMENT_FORM_B_PATH || 'C:\\VendorTest\\00.Purchase Form\\FORM B.xlsx'
const VENDOR_DOCUMENT_ATTACHMENT_EXTENSIONS = new Set(['.pdf', '.xlsx', '.xls', '.doc', '.docx'])

const buildFullName = (row: any) => [String(row?.empName || '').trim(), String(row?.empSurname || '').trim()].filter(Boolean).join(' ')

const resolveEmployeeProfile = async (empCodeRaw: unknown): Promise<EmployeeProfile | null> => {
  const empCode = String(empCodeRaw || '').trim()
  if (!empCode) return null

  if (employeeProfileCache.has(empCode)) {
    return employeeProfileCache.get(empCode) || null
  }

  const sql = await RequestRegisterPageSQL.getMemberByEmpCode({ empcode: empCode })
  const rows = (await MySQLExecute.search(sql)) as any[]
  const row = rows[0]

  if (!row) {
    employeeProfileCache.set(empCode, null)
    return null
  }

  const profile: EmployeeProfile = {
    empCode,
    fullName: buildFullName(row),
    email: normalizeEmail(row?.empEmail),
  }

  employeeProfileCache.set(empCode, profile)
  return profile
}

const resolveAssignedEmail = async (empCodeRaw: unknown) => {
  const empCode = String(empCodeRaw || '').trim()
  if (!empCode) return ''

  if (assigneeEmailCache.has(empCode)) {
    return assigneeEmailCache.get(empCode) || ''
  }

  const sql = await RequestRegisterPageSQL.getAssigneeEmailByEmpCode({ empcode: empCode })
  const rows = (await MySQLExecute.search(sql)) as any[]
  const email = normalizeEmail(rows[0]?.empEmail)
  assigneeEmailCache.set(empCode, email)
  return email
}

const resolveAssigneeProfile = async (empCodeRaw: unknown): Promise<EmployeeProfile | null> => {
  const empCode = String(empCodeRaw || '').trim()
  if (!empCode) return null

  if (assigneeProfileCache.has(empCode)) {
    return assigneeProfileCache.get(empCode) || null
  }

  const sql = await RequestRegisterPageSQL.getAssigneeByEmpCodeContact({ empcode: empCode })
  const rows = (await MySQLExecute.search(sql)) as any[]
  const row = rows[0]

  if (!row) {
    assigneeProfileCache.set(empCode, null)
    return null
  }

  const profile: EmployeeProfile = {
    empCode,
    fullName: buildFullName(row) || String(row?.empName || '').trim(),
    email: normalizeEmail(row?.empEmail),
  }

  assigneeProfileCache.set(empCode, profile)
  return profile
}

const getPeerCcEmailsByExactGroupCode = async (groupCode: string, excludeEmpCode?: string, excludeEmail?: string): Promise<string[]> => {
  const safeGroupCode = String(groupCode || '').trim()
  if (!safeGroupCode) return []

  const excludeEmp = String(excludeEmpCode || '').trim()
  const rowsSql = await RequestRegisterPageSQL.getActiveAssigneesByGroupCode({ group_code: safeGroupCode })
  const rows = (await MySQLExecute.search(rowsSql)) as any[]

  return mergeUniqueEmails(
    rows
      .map((row: any) => {
        const rowEmpCode = String(row?.empcode || '').trim()
        if (excludeEmp && rowEmpCode === excludeEmp) return ''
        return normalizeEmail(row?.empEmail)
      })
      .filter((email: string) => email && email !== normalizeEmail(excludeEmail))
  )
}

const inspectGroupRecipients = async (groupCode: string, excludeEmpCode?: string, excludeEmail?: string) => {
  const safeGroupCode = String(groupCode || '').trim()
  if (!safeGroupCode) return []

  const excludeEmp = String(excludeEmpCode || '').trim()
  const normalizedExcludeEmail = normalizeEmail(excludeEmail)
  const rowsSql = await RequestRegisterPageSQL.getActiveAssigneesByGroupCode({ group_code: safeGroupCode })
  const rows = (await MySQLExecute.search(rowsSql)) as any[]

  return rows.map((row: any) => {
    const empCode = String(row?.empcode || '').trim()
    const rawEmail = String(row?.empEmail || '').trim()
    const normalizedEmail = normalizeEmail(rawEmail)
    const isPrimary = !!excludeEmp && empCode === excludeEmp
    const excludedByPrimaryEmail = !!normalizedExcludeEmail && normalizedEmail === normalizedExcludeEmail
    const valid = !!normalizedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)

    return {
      empCode,
      rawEmail,
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

  const targetGroup = String(groupCode || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
  if (!targetGroup) return []

  const targetCompact = targetGroup.replace(/[^A-Z0-9]/g, '')
  const excludeEmp = String(excludeEmpCode || '').trim()

  const rowsSql = await RequestRegisterPageSQL.getPeerCcRowsByNormalizedGroup({
    target_group: targetGroup,
    target_compact: targetCompact,
  })
  const rows = (await MySQLExecute.search(rowsSql)) as any[]

  const peerEmails = mergeUniqueEmails(
    rows
      .map((row: any) => {
        const rowEmpCode = String(row?.empcode || '').trim()
        if (excludeEmp && rowEmpCode === excludeEmp) return ''
        return normalizeEmail(row?.empEmail)
      })
      .filter((email: string) => email && email !== normalizeEmail(excludeEmail))
  )

  return peerEmails
}

const resolvePrimaryAssigneeByGroupCode = async (groupCode: string) => {
  const targetGroup = String(groupCode || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
  if (!targetGroup) return null

  const targetCompact = targetGroup.replace(/[^A-Z0-9]/g, '')
  const rowsSql = await RequestRegisterPageSQL.getPeerCcRowsByNormalizedGroup({
    target_group: targetGroup,
    target_compact: targetCompact,
  })
  const rows = (await MySQLExecute.search(rowsSql)) as any[]
  const row = rows.find((item: any) => normalizeEmail(item?.empEmail))
  if (!row) return null

  return {
    empCode: String(row?.empcode || '').trim(),
    fullName: buildFullName(row) || String(row?.empName || row?.empcode || '').trim(),
    email: normalizeEmail(row?.empEmail),
  }
}

const parseStoredCircularMembers = (raw: any) => {
  if (!raw) return []

  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => {
        if (typeof item === 'string') {
          return { empcode: '', email: normalizeEmail(item) }
        }

        return {
          empcode: String(item?.empcode || '').trim(),
          email: normalizeEmail(item?.email),
        }
      })
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
    members.map(async (member) => {
      if (!member.empcode) return ''
      return resolveAssignedEmail(member.empcode)
    })
  )

  return mergeUniqueEmails(resolved)
}

const getGprCSetupMeta = (raw: any) => {
  const setup = parseStoredObject(raw)
  return parseStoredObject(setup?._meta)
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

const resolveDisplayName = (options: Array<unknown>, fallbackLabel: string) => {
  for (const option of options) {
    const value = String(option || '').trim()
    if (!value) continue
    if (/^[A-Z]\d{3,}$/i.test(value)) continue
    return value
  }

  return fallbackLabel
}

const resolveActionRequiredStage = (step: any) => {
  const desc = normalizeText(step?.DESCRIPTION)
  if (desc.includes('engineer')) return 'engineer'
  if (desc.includes('emr')) return 'emr'
  if (desc.includes('qms')) return 'qms'
  if (desc.includes('pm manager') || desc.includes('manager approval')) return 'pm_manager'
  return ''
}

const previewRecipientList = (emails: string[] = []) =>
  emails
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
    .slice(0, 10)

const MOCK_REQUESTER_EMAIL = 'tanawut.patrawan@furukawaelectric.com'

const resolveRequesterEmailForMail = (_profile?: EmployeeProfile | null) => {
  return normalizeEmail(MOCK_REQUESTER_EMAIL)
}

const isOverseaRegion = (vendorRegion: any) => normalizeText(vendorRegion) === 'oversea'

const buildVendorDocumentAttachments = (vendorRegion: any, isGprBStage = false): MailAttachment[] => {
  if (isGprBStage) {
    return fs.existsSync(VENDOR_DOCUMENT_FORM_B_PATH)
      ? [{
          filename: path.basename(VENDOR_DOCUMENT_FORM_B_PATH),
          content: fs.readFileSync(VENDOR_DOCUMENT_FORM_B_PATH),
        }]
      : []
  }

  const basePath = isOverseaRegion(vendorRegion) ? VENDOR_DOCUMENT_OVERSEA_PATH : VENDOR_DOCUMENT_LOCAL_PATH
  if (!fs.existsSync(basePath)) return []

  return fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(basePath, entry.name))
    .filter((filePath) => VENDOR_DOCUMENT_ATTACHMENT_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => ({
      filename: path.basename(filePath),
      content: fs.readFileSync(filePath),
    }))
}

const resolveRequesterMailProfile = async (requestContext: any) => {
  const requesterProfile = await resolveEmployeeProfile(
    requestContext?.Request_By_EmployeeCode || requestContext?.REQUEST_BY_EMPLOYEECODE || requestContext?.request_by_employeecode
  )
  return {
    profile: requesterProfile,
    email: resolveRequesterEmailForMail(requesterProfile),
    name: resolveDisplayName([requesterProfile?.fullName], 'Requester'),
  }
}

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

const getPoCheckerMainEmails = async () => getPeerCcEmailsByGroupCode(GROUP_CODE.PO_CHECKER_MAIN)

const getPoMgrEmails = async () => getPeerCcEmailsByGroupCode(GROUP_CODE.PO_MGR)

const getAccountCcByRegion = async (vendorRegion: any) => getPeerCcEmailsByGroupCode(isOverseaRegion(vendorRegion) ? GROUP_CODE.ACC_OVERSEA_CC : GROUP_CODE.ACC_LOCAL_CC)

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
  const ccEmails = payload.ccEmails || []
  const attachments = payload.attachments || []

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
      logTemplateEvent('failed', {
        templateName: payload.templateName,
        toEmail: payload.toEmail,
        ccEmails,
        subject: payload.subject,
        requestId: payload.requestId,
        requestNumber: payload.requestNumber,
        extra: { ...(payload.extra || {}), attachmentCount: attachments.length },
        error: mailResult.reason || 'sendEmail returned failed',
      })
      return
    }

    logTemplateEvent('sent', {
      templateName: payload.templateName,
      toEmail: payload.toEmail,
      ccEmails,
      subject: payload.subject,
      requestId: payload.requestId,
      requestNumber: payload.requestNumber,
      extra: { ...(payload.extra || {}), attachmentCount: attachments.length },
    })
  } catch (error: any) {
    logTemplateEvent('failed', {
      templateName: payload.templateName,
      toEmail: payload.toEmail,
      ccEmails,
      subject: payload.subject,
      requestId: payload.requestId,
      requestNumber: payload.requestNumber,
      extra: { ...(payload.extra || {}), attachmentCount: attachments.length },
      error,
    })
    throw error
  }
}

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

  if (stepCode === 'DOC_CHECK' || nextDesc.includes('checker') || nextDesc.includes('check all document') || nextDesc.includes('check document')) {
    return {
      templateName: 'emailToCheckerPICTemplate',
      emailHtml: emailToCheckerPICTemplate({ ...baseEmailData, recipientName: 'PO Checker' }),
      emailSubject: `[Request Check] Please check register vendor "${requestNumber}" - Document Step`,
    }
  }

  return {
    templateName: 'emailToPMMgrTemplate',
    emailHtml: emailToPMMgrTemplate({ ...baseEmailData, recipientName: 'Approver' }),
    emailSubject: `[Request Approval] Please process register vendor "${requestNumber}"`,
  }
}

export const triggerCreationEmail = async (dataItem: any, vendorData: any, nextAssignee: any, insertedId: number, persistedRequestNumber?: string, assigneeGroupCode?: string) => {
  //ทำไม ไม่เอาจาก getUserdata ไม่รู้นึกยุ โฟค 18/04/2026
  const requester = await resolveRequesterMailProfile(dataItem)
  const nextAssigneeProfile = await resolveAssigneeProfile(nextAssignee.empCode)
  const nextAssigneeEmail = await resolveAssignedEmail(nextAssignee.empCode)

  const requestNumber = resolveRequestNumber(persistedRequestNumber, insertedId)
  const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

  if (nextAssigneeEmail) {
    const groupRecipientInspection = await inspectGroupRecipients(assigneeGroupCode || '', nextAssignee.empCode, nextAssigneeEmail)
    const peerCc = await getPeerCcEmailsByExactGroupCode(assigneeGroupCode || '', nextAssignee.empCode, nextAssigneeEmail)
    const ccEmails = excludeEmails(
      mergeUniqueEmails(requester.email ? [requester.email] : [], peerCc).filter((email) => email !== nextAssigneeEmail),
      []
    )

    const emailHtml = emailRequestRegisterVendorTemplate({
      requestNumber,
      recipientName: resolveDisplayName([nextAssigneeProfile?.fullName], 'PO PIC'),
      vendorName: vendorData.company_name || 'Error Connection',
      address: vendorData.address || 'Error Connection',
      contactPic: vendorData.contact_name || 'Error Connection',
      email: vendorData.email || 'Error Connection',
      tel: vendorData.tel_phone || 'Error Connection',
      supportProduct: dataItem.supportProduct_Process || 'Error Connection',
      purchaseFrequency: dataItem.purchase_frequency || 'Error Connection',
      systemLink,
      userName: requester.name,
      userTel: '',
    })
    const emailSubject = `[Request Check] Please request check register vendor follow as "${requestNumber}"`
    await sendTemplatedEmail({
      templateName: 'emailRequestRegisterVendorTemplate',
      emailHtml,
      toEmail: nextAssigneeEmail,
      subject: emailSubject,
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
}

export const sendAgreementEmail = async (dataItem: any) => {
  let contextVendor: any = {}
  if (dataItem.request_id) {
    const vendorSql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({ request_id: Number(dataItem.request_id) || 0 })
    const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
    contextVendor = vendorRes[0] || {}
  }

  const recipientEmail = String(dataItem.emailmain || contextVendor.selected_vendor_email || contextVendor.emailmain || '').trim()
  if (!recipientEmail) {
    throw new Error('Vendor emailmain is required')
  }

  let ccEmails: string[] = []
  if (dataItem.request_id) {
    const picProfile = await resolveAssigneeProfile(contextVendor.assign_to)
    const picEmail = await resolveAssignedEmail(contextVendor.assign_to)
    const poPicContext = await getPoPicAndSubPicCc(contextVendor.vendor_region, contextVendor.assign_to, picEmail)
    ccEmails = excludeEmails(mergeUniqueEmails(poPicContext.allPoPicEmails), [recipientEmail, contextVendor.emailmain, contextVendor.vendor_email, contextVendor.vendor_main_email])

    dataItem.pic_name = dataItem.pic_name || resolveDisplayName([picProfile?.fullName], 'PO PIC')
  }

  const emailHtml = emailVendorDocumentRequestTemplate({
    vendorEmail: recipientEmail,
    ccEmail: ccEmails.join('; '),
    topicRef: dataItem.request_number || '-',
    isNewSupplier: !dataItem.fft_vendor_code,
    picName: dataItem.pic_name || 'PO PIC',
    picTel: dataItem.pic_tel || '',
  })

  await sendTemplatedEmail({
    templateName: 'emailVendorDocumentRequestTemplate',
    emailHtml,
    toEmail: recipientEmail,
    subject: dataItem.email_subject || `[Request Submit] Document for ${dataItem.request_number || 'vendor registration'}`,
    ccEmails,
    requestId: dataItem.request_id,
    requestNumber: dataItem.request_number,
    attachments: buildVendorDocumentAttachments(contextVendor.vendor_region || dataItem.vendor_region, false),
    extra: { flow: 'sendAgreementEmail' },
  })

  return { sent_to: recipientEmail }
}

export const triggerVendorDocumentEmail = async (requestId: number, stageHint?: string) => {
  try {
    const vendorSql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({ request_id: Number(requestId) || 0 })
    const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
    const vd = vendorRes[0] || {}

    const vendorEmail = (vd.selected_vendor_email || vd.emailmain || '').trim()

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PO PIC')
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picTel = ''

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(poPicContext.allPoPicEmails).filter((email) => email !== normalizeEmail(vendorEmail)),
      [vendorEmail, vd.emailmain]
    )

    const stageHintRaw = String(stageHint || '')
      .trim()
      .toLowerCase()
    const isGprBStage = stageHintRaw.includes('gpr b')
    const isGprCStage = stageHintRaw.includes('gpr c')

    if (isGprCStage) {
      const requester = await resolveRequesterMailProfile(vd)
      if (!requester.email) {
        return { sent: false, reason: 'missing requester email for GPR C setup' }
      }

      const gprCCcEmails = excludeEmails(
        mergeUniqueEmails(poPicContext.allPoPicEmails).filter((email) => email !== requester.email),
        [vendorEmail, vd.emailmain]
      )

      const gprCApprovalHtml = emailGprCRequesterSetupTemplate({
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
        systemLink: `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-history`,
      })

      await sendTemplatedEmail({
        templateName: 'emailGprCRequesterSetupTemplate',
        emailHtml: gprCApprovalHtml,
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

      return {
        sent: true,
        to: requester.email,
        ccCount: gprCCcEmails.length,
      }
    }

    if (!vendorEmail) {
      return { sent: false, reason: 'missing vendor email' }
    }

    let emailHtml = emailVendorDocumentRequestTemplate({
      vendorEmail,
      ccEmail: ccEmails.join('; '),
      topicRef: requestNumber,
      isNewSupplier: !vd.fft_vendor_code,
      picName,
      picTel,
    })
    let emailSubject = `[Request Submit] Document for ${requestNumber}`

    if (isGprBStage) {
      emailHtml = emailExternalSubmitGPRBTemplate({
        vendorEmail,
        ccEmail: ccEmails.join('; '),
        requestNumber,
        picName,
        picTel,
      })
      emailSubject = `[Request Submit] Please submit ${requestNumber} - General Purchase Specification Form B`
    }

    await sendTemplatedEmail({
      templateName: isGprBStage ? 'emailExternalSubmitGPRBTemplate' : 'emailVendorDocumentRequestTemplate',
      emailHtml,
      toEmail: vendorEmail,
      subject: emailSubject,
      ccEmails,
      requestId,
      requestNumber,
      attachments: buildVendorDocumentAttachments(vd.vendor_region, isGprBStage),
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
    const requestId = dataItem.request_id
    const vendorSql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
    const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
    const vd = vendorRes[0] || {}

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PIC')
    const picEmail = await resolveAssignedEmail(vd.assign_to)
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
    const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`
    const requester = await resolveRequesterMailProfile(vd)

    const isOversea = isOverseaRegion(vd.vendor_region)
    const nextStepCode = inferStepCode(nextStep)
    const nextStepDesc = normalizeText(nextStep?.DESCRIPTION)
    const isDocumentCheckerStep = nextStepCode === 'DOC_CHECK' || nextStepDesc.includes('checker') || nextStepDesc.includes('check all document')

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()
    const poMgrCc = await getPoMgrEmails()
    const accPicCc = await getAccountCcByRegion(vd.vendor_region)

    const isPmMgrAndAbove = ['PO_MGR_APPROVAL', 'PO_GM_APPROVAL', 'MD_APPROVAL'].includes(nextStepCode)
    const isAccountStep = nextStepCode === 'ACCOUNT_REGISTERED'

    const nextGroupCode = isDocumentCheckerStep ? GROUP_CODE.PO_CHECKER_MAIN : nextStep?.group_code || resolveGroupCodeForStep(nextStep, isOversea)
    if (!approverEmail && nextGroupCode) {
      const primaryAssignee = await resolvePrimaryAssigneeByGroupCode(nextGroupCode)
      if (primaryAssignee?.email) {
        targetApprover = primaryAssignee.empCode
        approverEmail = primaryAssignee.email
        approverName = primaryAssignee.fullName
      }
    }
    const peerApproverCc = await getPeerCcEmailsByGroupCode(nextGroupCode, targetApprover, approverEmail)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(
        ...(isDocumentCheckerStep ? [requester.email ? [requester.email] : [], poPicContext.allPoPicEmails, poMgrCc] : []),
        ...(isPmMgrAndAbove ? [checkerPicCc, requester.email ? [requester.email] : [], poPicContext.allPoPicEmails] : []),
        ...(isAccountStep ? [accPicCc, checkerPicCc, requester.email ? [requester.email] : [], poPicContext.allPoPicEmails] : []),
        ...(!isDocumentCheckerStep && !isPmMgrAndAbove && !isAccountStep ? [poPicContext.allPoPicEmails, peerApproverCc] : [])
      ).filter((email) => email !== normalizeEmail(approverEmail)),
      [vd.vendor_email, vd.vendor_main_email]
    )

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
      systemLink,
      picName,
      picTel,
    }

    if (!approverEmail) return

    const { templateName, emailHtml, emailSubject } = selectApprovalNotificationByStep(nextStep, baseEmailData, requestNumber)
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
    const requestId = dataItem.request_id
    const vendorSql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
    const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
    const vd = vendorRes[0] || {}

    const stageKey = resolveActionRequiredStage(currentStep)
    if (!stageKey) return

    const setup = parseStoredObject(vd.action_required_json)
    const stageConfig = setup?.[stageKey] || {}
    const recipientEmail = normalizeEmail(stageConfig?.pic_email)
    if (!recipientEmail) return

    const recipientName = String(stageConfig?.pic_name || 'PIC').trim()
    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
    const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PO PIC')
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picTel = ''

    const ccEmails = excludeEmails(
      mergeUniqueEmails(picEmail ? [picEmail] : []).filter((email) => email !== recipientEmail),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const stageLabel = String(
      stageConfig?.stage_label ||
        (stageKey === 'engineer' ? 'Engineer Judgement' : stageKey === 'emr' ? 'EMR Judgement' : stageKey === 'qms' ? 'QMS Judgement' : 'PM Manager Approval')
    ).trim()

    const emailHtml = emailActionRequiredTemplate({
      stageLabel,
      recipientName,
      requestNumber,
      vendorName: vd.company_name || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      systemLink,
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
    const requestId = Number(dataItem.request_id) || 0
    if (!requestId) return

    const vendorSql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
    const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
    const vd = vendorRes[0] || {}

    const requesterProfile = await resolveEmployeeProfile(vd.Request_By_EmployeeCode)
    const requesterEmail = resolveRequesterEmailForMail(requesterProfile)
    const requesterName = resolveDisplayName([requesterProfile?.fullName], 'Requester')

    if (!requesterEmail) return

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
    const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PO PIC')
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picTel = ''

    const gprCMeta = getGprCSetupMeta(vd.action_required_json)
    const gprCApproverEmpCode = String(gprCMeta?.gpr_c_approver_empcode || '').trim()
    const gprCApproverEmail = await resolveAssignedEmail(gprCApproverEmpCode)
    const gprCPcPicEmail = normalizeEmail(vd.gpr_c_pc_pic_email)
    const circularEmails = await resolveCircularAssignedEmails(vd.gpr_c_circular_json)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(picEmail ? [picEmail] : [], gprCApproverEmail ? [gprCApproverEmail] : [], gprCPcPicEmail ? [gprCPcPicEmail] : [], circularEmails).filter(
        (email) => email !== requesterEmail
      ),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const emailHtml = emailGprCStepApprovalTemplate({
      toEmail: requesterEmail,
      ccEmail: ccEmails.join('; '),
      requestNumber,
      picNextStepName: requesterName,
      picName,
      picTel,
      vendorName: vd.company_name || 'N/A',
      address: vd.address || 'N/A',
      contactPic: vd.contact_name || 'N/A',
      email: vd.vendor_email || vd.emailmain || 'N/A',
      tel: vd.tel_phone || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      purchaseFrequency: vd.purchase_frequency || 'N/A',
      systemLink,
    })

    await sendTemplatedEmail({
      templateName: 'emailGprCStepApprovalTemplate',
      emailHtml,
      toEmail: requesterEmail,
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
    const requestId = dataItem.request_id
    const vendorSql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
    const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
    const vd = vendorRes[0] || {}

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PIC')
    const picTel = ''

    const approverEmail = await resolveAssignedEmail(currentStep?.approver_id)
    const requester = await resolveRequesterMailProfile(vd)

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
    const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()

    if (!picEmail) return

    const rejectRemark = dataItem.approver_remark || ''
    const currentStepCode = inferStepCode(currentStep)
    const currentStepDesc = normalizeText(currentStep?.DESCRIPTION)
    const isCheckerReject =
      currentStepCode === 'DOC_CHECK' || currentStepDesc.includes('checker') || currentStepDesc.includes('check document') || currentStepDesc.includes('check all document')
    const rejectCcSources = isCheckerReject
      ? [checkerPicCc, requester.email ? [requester.email] : [], poPicContext.peerPicCc]
      : [poPicContext.peerPicCc, requester.email ? [requester.email] : [], approverEmail ? [approverEmail] : []]
    const ccEmails = excludeEmails(
      mergeUniqueEmails(...rejectCcSources).filter((email) => email !== normalizeEmail(picEmail)),
      [vd.vendor_email, vd.vendor_main_email]
    )
    const rejectTemplateName = isCheckerReject ? 'emailReject2Template' : 'emailReject1Template'
    const rejectTemplate = isCheckerReject ? emailReject2Template : emailReject1Template
    const emailHtml = rejectTemplate({
      toEmail: picEmail,
      recipientName: picName,
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
      systemLink,
      picName,
      picTel,
    })

    await sendTemplatedEmail({
      templateName: rejectTemplateName,
      emailHtml,
      toEmail: picEmail,
      subject: isCheckerReject ? `[RECHECK] Register vendor "${requestNumber}" requires recheck` : `[REJECT] Register vendor "${requestNumber}" has been rejected`,
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
    const requestId = dataItem.request_id
    const vendorSql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
    const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
    const vd = vendorRes[0] || {}

    const requester = await resolveRequesterMailProfile(vd)

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PIC')
    const picEmail = await resolveAssignedEmail(vd.assign_to)
    const picTel = ''

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
    const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()
    const accPicCc = await getAccountCcByRegion(vd.vendor_region)

    const finalCcEmails = excludeEmails(
      mergeUniqueEmails(accPicCc, checkerPicCc, poPicContext.allPoPicEmails).filter((email) => email !== requester.email),
      [vd.vendor_email, vd.vendor_main_email]
    )
    if (!requester.email) return

    const completionData: MailTemplateData = {
      toEmail: requester.email,
      ccEmail: finalCcEmails.join('; '),
      requestNumber,
      vendorName: vd.company_name || 'N/A',
      address: vd.address || 'N/A',
      contactPic: vd.contact_name || 'N/A',
      email: vd.vendor_email || 'N/A',
      tel: vd.tel_phone || 'N/A',
      supportProduct: vd.supportProduct_Process || 'N/A',
      purchaseFrequency: vd.purchase_frequency || 'N/A',
      systemLink,
      picName,
      picTel,
      vendorCode: dataItem.vendor_code || vd.vendor_code || 'Pending',
      userName: requester.name || 'Requester',
    }

    const emailHtml = emailCompleteTemplate(completionData)
    await sendTemplatedEmail({
      templateName: 'emailCompleteTemplate',
      emailHtml,
      toEmail: requester.email,
      subject: `[Complete] Register vendor "${requestNumber}" is now completed`,
      ccEmails: finalCcEmails,
      requestId,
      requestNumber,
      extra: { flow: 'triggerCompletionEmail', vendorCode: dataItem.vendor_code || vd.vendor_code || '' },
    })
  } catch (err: any) {
    console.error('[triggerCompletionEmail] Failed:', err?.message)
  }
}

export const triggerVendorDisagreeEmail = async (dataItem: any) => {
  try {
    const requestId = Number(dataItem.request_id) || 0
    if (!requestId) return

    const vendorSql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
    const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
    const vd = vendorRes[0] || {}

    const requester = await resolveRequesterMailProfile(vd)
    if (!requester.email) return

    const picEmail = await resolveAssignedEmail(vd.assign_to)

    const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
    const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

    const poPicContext = await getPoPicAndSubPicCc(vd.vendor_region, vd.assign_to, picEmail)
    const checkerPicCc = await getPoCheckerMainEmails()
    const accPicCc = await getAccountCcByRegion(vd.vendor_region)

    const ccEmails = excludeEmails(
      mergeUniqueEmails(accPicCc, checkerPicCc, poPicContext.allPoPicEmails).filter((email) => email !== requester.email),
      [vd.vendor_email, vd.vendor_main_email]
    )

    const safeRemark = String(dataItem.approver_remark || '').trim()
    const reasons = ['Vendor disagreed after GPR negotiation rounds', ...(safeRemark ? [safeRemark] : [])]

    const picProfile = await resolveAssigneeProfile(vd.assign_to)
    const picName = resolveDisplayName([picProfile?.fullName], 'PO PIC')
    const picTel = ''

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
      systemLink,
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
