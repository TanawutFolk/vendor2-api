import { MySQLExecute } from '@businessData/dbExecute'
import { ResultSetHeader, RowDataPacket } from 'mysql2'
import sendEmail from '@src/config/sendEmail'
import {
  email_ToUser_ActionRequired,
  email_ToUser_ActionResult,
  email_ToGprCApprover_NextStep,
  email_ToRequester_GprCSetup,
  email_ToGprCApprover_FirstStep,
  email_ToPic_RecheckByGprCApprover,
} from '@src/config/mailTemplate'
import { GprCApprovalSQL } from '../../sql/_approval-GPRC/GprCApprovalSQL'
import { RequestRegisterPageSQL } from '../../sql/_request-register/RequestRegisterPageSQL'
import { sendMail_ToApprover_NextStep, sendMail_ToPic_RequestRejected } from '../_request-register/RegisterRequestNotificationHelper'
import {
  getActionResultStatusIdentity,
  getApprovalStepStatusIdentity,
  getGprCFlowStatusIdentity,
  getRequestStateIdentity,
  getRequestStatusIdentity,
  getVendorStatusIdentity,
  getWorkflowStepIdentity,
} from '../_status-master/StatusIdentityService'
import { buildGprCBaseMailData as buildBaseMailData } from './GprCApprovalMailData'
import { GROUP_CODE, mergeUniqueEmails, normalizeEmail } from '../_request-register/RegisterRequestWorkflowHelper'

const getGprCMainWorkflowIdentity = async () => {
  const [workflowStep, approvalStep, requestState, requestStatus] = await Promise.all([
    getWorkflowStepIdentity(),
    getApprovalStepStatusIdentity(),
    getRequestStateIdentity(),
    getRequestStatusIdentity(),
  ])

  return { workflowStep, approvalStep, requestState, requestStatus }
}

const getGprCMainWorkflowRejectionIdentity = async () => {
  const [statusIdentity, vendor] = await Promise.all([getGprCMainWorkflowIdentity(), getVendorStatusIdentity()])

  return { ...statusIdentity, vendor }
}

const getGprCStepStatusIdentity = async () => {
  const [approvalStep, gprCFlow] = await Promise.all([getApprovalStepStatusIdentity(), getGprCFlowStatusIdentity()])

  return { approvalStep, gprCFlow }
}

const normalizeValue = (value: any) => String(value || '').trim()

const getValue = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null) return row[key]
  }
  return ''
}

const normalizeMainApprovalStep = (step: any) => ({
  ...step,
  step_id: Number(getValue(step, 'step_id', 'REQUEST_APPROVAL_STEP_ID') || 0),
  workflow_step_id: Number(getValue(step, 'workflow_step_id', 'WORKFLOW_STEP_MASTER_ID') || 0),
  approval_step_status_id: Number(getValue(step, 'approval_step_status_id', 'M_APPROVAL_STEP_STATUS_ID') || 0),
  step_order: Number(getValue(step, 'step_order', 'STEP_ORDER') || 0),
  step_status: normalizeValue(getValue(step, 'step_status', 'STEP_STATUS')),
  step_code: normalizeValue(getValue(step, 'step_code', 'STEP_CODE')),
  DESCRIPTION: normalizeValue(getValue(step, 'DESCRIPTION', 'description')),
})

const normalizeGroupToken = (value: string) =>
  normalizeValue(value)
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[().]+/g, '')

const compactGroupToken = (value: string) =>
  normalizeValue(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

const resolveManagedGroupForGprCStep = (stepCodeRaw: any) => {
  const stepCode = normalizeValue(stepCodeRaw).toUpperCase()
  if (['EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER'].includes(stepCode)) return stepCode
  if (stepCode === 'PM_MANAGER_APPROVER') return GROUP_CODE.PO_MGR
  return ''
}

const buildDisplayName = (row: any) => [normalizeValue(getValue(row, 'empName', 'EMPNAME')), normalizeValue(getValue(row, 'empSurname', 'EMPSURNAME'))].filter(Boolean).join(' ')

const mapMember = (empcode: string, row: any) => ({
  empcode: normalizeValue(empcode),
  name: buildDisplayName(row) || normalizeValue(getValue(row, 'empName', 'EMPNAME')),
  email: normalizeEmail(getValue(row, 'empEmail', 'EMPEMAIL')),
})

const getRequesterProfile = async (empcodeRaw: any) => {
  return getMemberProfile(empcodeRaw)
}

const isActionRequiredStep = (stepCode: string) =>
  ['PRODUCT_GROUP_CHECKER', 'REQUESTER_APPROVER', 'EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER', 'PM_MANAGER_APPROVER'].includes(stepCode)

const GPR_C_STEP_DEFS = [
  { order: 1, code: 'REQUESTER_APPROVER', name: 'Requester Approver', source: 'REQUESTER_APPROVER' },
  { order: 2, code: 'EMR_CHECKER', name: 'EMR Checker', source: 'EMR_CHECKER' },
  { order: 3, code: 'EMR_APPROVER', name: 'EMR Approver', source: 'EMR_APPROVER' },
  { order: 4, code: 'QMS_CHECKER', name: 'QMS Checker', source: 'QMS_CHECKER' },
  { order: 5, code: 'QMS_APPROVER', name: 'QMS Approver', source: 'QMS_APPROVER' },
  { order: 6, code: 'PM_MANAGER_APPROVER', name: 'PM Manager Approver', source: GROUP_CODE.PO_MGR },
]

const response = (Status: boolean, Message: string, ResultOnDb: any, MethodOnDb: string, TotalCountOnDb = 1) => ({
  Status,
  Message,
  ResultOnDb,
  MethodOnDb,
  TotalCountOnDb: Status ? TotalCountOnDb : 0,
})

type GprCPostCommitTask = () => Promise<unknown>

// Mirrors ApprovalQueueService's post-commit pattern: side-effects (emails) run only after the DB
// mutations have committed, failures are isolated with allSettled, and each failure is logged with
// context instead of being swallowed by an inline .catch(console.error).
const runGprCPostCommitTasks = async (tasks: GprCPostCommitTask[], _requestId: number) => {
  if (tasks.length === 0) return

  const results = await Promise.allSettled(tasks.map((task) => task()))
  results.forEach((result, _index) => {
    if (result.status === 'rejected') {
      // console.error('[GprCApprovalService] postCommitTask failed', {
      // taskIndex: index,
      // request_id: requestId,
      // error: result.reason instanceof Error ? result.reason.message : result.reason,
      // })
    }
  })
}

const getMemberProfile = async (empcodeRaw: any) => {
  const empcode = normalizeValue(empcodeRaw)
  if (!empcode) throw new Error('Missing employee code')

  const sql = await GprCApprovalSQL.getMemberByEmpCode({ EMPCODE: empcode })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  const row = rows[0]
  if (!row) throw new Error(`Employee code not found: ${empcode}`)

  const profile = mapMember(empcode, row)
  if (!profile.email) throw new Error(`Employee code has no email: ${empcode}`)
  return profile
}

const getAssigneeProfile = async (empcodeRaw: any) => {
  const empcode = normalizeValue(empcodeRaw)
  if (!empcode) throw new Error('Missing assignee code')

  const sql = await GprCApprovalSQL.getAssigneeByEmpCodeContact({ EMPCODE: empcode })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  const row = rows[0]
  if (!row) throw new Error(`Assignee code not found: ${empcode}`)

  const profile = mapMember(empcode, row)
  if (!profile.email) throw new Error(`Assignee code has no email: ${empcode}`)
  return profile
}

const getAssigneeByGroup = async (groupCode: string) => {
  const targetGroup = normalizeGroupToken(groupCode)
  const targetCompact = compactGroupToken(groupCode)
  const sql = await GprCApprovalSQL.getPeerCcRowsByNormalizedGroup({
    TARGET_GROUP: targetGroup,
    TARGET_COMPACT: targetCompact,
  })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  const row = rows[0]
  if (!row) throw new Error(`No active assignee found for group ${groupCode}`)

  return {
    empcode: normalizeValue(row.EMPCODE),
    name: buildDisplayName(row) || normalizeValue(row.EMPNAME),
    email: normalizeEmail(row.EMPEMAIL),
    group_code: normalizeValue(row.GROUP_CODE),
    group_name: normalizeValue(row.GROUP_NAME),
  }
}

const getGroupEmails = async (groupCode: string, excludeEmpCode?: string, excludeEmail?: string) => {
  const targetGroup = normalizeGroupToken(groupCode)
  const targetCompact = compactGroupToken(groupCode)
  if (!targetGroup) return []

  const sql = await GprCApprovalSQL.getPeerCcRowsByNormalizedGroup({
    TARGET_GROUP: targetGroup,
    TARGET_COMPACT: targetCompact,
  })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  const excludedEmp = normalizeValue(excludeEmpCode)
  const excludedEmail = normalizeEmail(excludeEmail)

  return mergeUniqueEmails(
    rows.map((row: any) => {
      if (excludedEmp && normalizeValue(row.EMPCODE) === excludedEmp) return ''
      const email = normalizeEmail(row.EMPEMAIL)
      if (excludedEmail && email === excludedEmail) return ''
      return email
    })
  )
}

const isOverseaRegion = (vendorRegion: any) => normalizeValue(vendorRegion).toLowerCase() === 'oversea'

const getPoPicMailContext = async (summary: any) => {
  const picEmpcode = normalizeValue(summary.assign_to || summary.ASSIGN_TO)
  const pic = picEmpcode ? await getAssigneeProfile(picEmpcode).catch(() => null) : null
  const picEmail = normalizeEmail(pic?.email)
  const groupCode = isOverseaRegion(summary.vendor_region || summary.VENDOR_REGION) ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
  const peerPicCc = await getGroupEmails(groupCode, picEmpcode, picEmail)

  return {
    picName: pic?.name || 'PO PIC',
    picEmail,
    peerPicCc,
    allPoPicEmails: mergeUniqueEmails(picEmail ? [picEmail] : [], peerPicCc),
  }
}

const getSelectionId = async (requestId: number) => {
  const sql = GprCApprovalSQL.getSelectionIdByRequest({ REQUEST_REGISTER_VENDOR_ID: requestId })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  return Number(rows[0]?.selection_id || rows[0]?.REQUEST_VENDOR_SELECTIONS_ID || 0) || null
}

const getRequestSummary = async (requestId: number) => {
  const sql = GprCApprovalSQL.getRequestSummary({ REQUEST_REGISTER_VENDOR_ID: requestId })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  return rows[0] || {}
}

const getFlowByRequest = async (requestId: number) => {
  const sql = GprCApprovalSQL.getFlowByRequestId({ REQUEST_REGISTER_VENDOR_ID: requestId })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  return rows[0] || null
}

const getStepsByFlow = async (flowId: number) => {
  const sql = GprCApprovalSQL.getStepsByFlow({ REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId })
  return (await MySQLExecute.search(sql)) as RowDataPacket[]
}

const getCurrentStep = async (flowId: number) => {
  const sql = GprCApprovalSQL.getCurrentStepByFlow({ REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  return rows[0] || null
}

const ensureFlow = async (requestId: number, updateBy: string) => {
  const existing = await getFlowByRequest(requestId)
  if (existing) return existing

  const summary = await getRequestSummary(requestId)
  const gprCFlow = await getGprCFlowStatusIdentity()
  const selectionId = await getSelectionId(requestId)
  const requesterEmpcode = normalizeValue(summary.Request_By_EmployeeCode || summary.REQUEST_BY_EMPLOYEECODE)
  const insertSql = GprCApprovalSQL.insertFlow({
    REQUEST_REGISTER_VENDOR_ID: requestId,
    REQUEST_VENDOR_SELECTIONS_ID: selectionId || '',
    M_GPR_C_FLOW_STATUS_ID: gprCFlow.requesterSetup,
    CURRENT_STEP_CODE: 'REQUESTER_SETUP',
    REQUESTER_EMPCODE: requesterEmpcode,
    CREATE_BY: updateBy,
    UPDATE_BY: updateBy,
  })
  const result = (await MySQLExecute.execute(insertSql)) as ResultSetHeader
  const flow = await getFlowByRequest(requestId)
  return flow || { REQUEST_VENDOR_GPR_C_FLOWS_ID: result.insertId, REQUEST_REGISTER_VENDOR_ID: requestId }
}

const buildCircularMembers = async (empcodesRaw: any[]) => {
  const empcodes = (Array.isArray(empcodesRaw) ? empcodesRaw : []).map(normalizeValue).filter(Boolean).slice(0, 6)

  const members = []
  for (const empcode of empcodes) {
    members.push(await getMemberProfile(empcode))
  }
  return members
}

const buildProductCheckers = async (rawItems: any[]) => {
  const items = Array.isArray(rawItems) ? rawItems : []
  if (items.length === 0) throw new Error('At least one Product Main or Section and Checker is required')

  const seenSelectorKeys = new Set<string>()
  const result = []

  for (const [index, rawItem] of items.entries()) {
    const productMainId = Number(rawItem?.product_main_id || rawItem?.PRODUCT_MAIN_ID || rawItem?.product_group_id || rawItem?.MASTER_PRODUCT_GROUPS_ID || 0)
    const sectionName = normalizeValue(rawItem?.section_name || rawItem?.SECTION_NAME)
    const checkerEmpcode = normalizeValue(rawItem?.checker_empcode || rawItem?.CHECKER_EMPCODE)
    if (Number(Boolean(productMainId)) + Number(Boolean(sectionName)) !== 1) {
      throw new Error(`Choose either Product Main or Section for Checker row ${index + 1}`)
    }
    if (!checkerEmpcode) throw new Error(`Checker employee code is required for row ${index + 1}`)

    const selectorKey = productMainId ? `PRODUCT:${productMainId}` : `SECTION:${sectionName.toUpperCase()}`
    if (seenSelectorKeys.has(selectorKey)) {
      throw new Error(productMainId ? 'Product Main cannot be selected more than once' : 'Section cannot be selected more than once')
    }
    seenSelectorKeys.add(selectorKey)

    let productMainName = ''
    let resolvedSectionName = ''
    if (productMainId) {
      const productRows = (await MySQLExecute.search(RequestRegisterPageSQL.getActiveProductMainById({ PRODUCT_MAIN_ID: productMainId }))) as RowDataPacket[]
      const product = productRows[0]
      if (!product) throw new Error(`Product Main not found or inactive for row ${index + 1}`)
      productMainName = normalizeValue(getValue(product, 'PRODUCT_MAIN_NAME', 'product_main_name'))
    } else {
      const sectionRows = (await MySQLExecute.search(RequestRegisterPageSQL.getSectionByName({ SECTION_NAME: sectionName }))) as RowDataPacket[]
      const section = sectionRows[0]
      if (!section) throw new Error(`Section not found for row ${index + 1}`)
      resolvedSectionName = normalizeValue(getValue(section, 'SECTION_NAME', 'section_name'))
    }

    const checker = await getMemberProfile(checkerEmpcode)
    result.push({
      product_main_id: productMainId || null,
      product_main_name: productMainName,
      section_name: resolvedSectionName,
      selector_name: productMainName || resolvedSectionName,
      checker,
    })
  }

  return result
}

const resolveStepApprovers = async (requesterApprover: any, productCheckers: any[]) => {
  const requesterApproverProfile = await getMemberProfile(requesterApprover)
  const result = productCheckers.map((item, index) => ({
    order: index + 1,
    code: 'PRODUCT_GROUP_CHECKER',
    name: `${item.selector_name} Checker`,
    source: 'PRODUCT_GROUP_CHECKER',
    approver: item.checker,
  }))
  const fixedStepOffset = result.length

  for (const stepDef of GPR_C_STEP_DEFS) {
    const approver = stepDef.source === 'REQUESTER_APPROVER' ? requesterApproverProfile : await getAssigneeByGroup(stepDef.source)
    result.push({
      ...stepDef,
      order: fixedStepOffset + stepDef.order,
      approver,
    })
  }

  return result
}

// Re-resolve a GPR C step's approver from its managed approval group at activation time,
// mirroring the main workflow's resolveStepApprover. Returns null for steps that are not
// group-managed (e.g. REQUESTER_APPROVER, whose approver is chosen by the requester at setup),
// so those keep their configured approver.
const resolveGprCStepApprover = async (step: any) => {
  const stepCode = normalizeValue(getValue(step, 'STEP_CODE', 'step_code'))
  const groupCode = resolveManagedGroupForGprCStep(stepCode)
  if (!groupCode) return null

  const assignee = await getAssigneeByGroup(groupCode)
  return assignee?.empcode ? assignee : null
}

const sendGprCEmail = async (payload: { templateName: string; toEmail: string; ccEmails?: string[]; subject: string; requestId: number; requestNumber: string; html: string }) => {
  const mailResult = await sendEmail(payload.html, payload.toEmail, payload.subject, payload.ccEmails || [], {
    templateName: payload.templateName,
    requestId: payload.requestId,
    requestNumber: payload.requestNumber,
    flow: 'GPR C',
  })
  if (!mailResult.success) {
    // console.error('[GPR C MAIL][failed]', {
    // templateName: payload.templateName,
    // toEmail: payload.toEmail,
    // ccCount: payload.ccEmails?.length || 0,
    // subject: payload.subject,
    // requestId: payload.requestId,
    // requestNumber: payload.requestNumber,
    // reason: mailResult.reason || 'sendEmail returned failed',
    // })
    return
  }

  // console.log('[GPR C MAIL][sent]', {
  // templateName: payload.templateName,
  // toEmail: payload.toEmail,
  // ccCount: payload.ccEmails?.length || 0,
  // subject: payload.subject,
  // requestId: payload.requestId,
  // requestNumber: payload.requestNumber,
  // })
}

const notifyRequesterSetup = async (requestId: number) => {
  const summary = await getRequestSummary(requestId)
  const requesterEmpcode = normalizeValue(summary.Request_By_EmployeeCode || summary.REQUEST_BY_EMPLOYEECODE)
  if (!requesterEmpcode) return
  const requester = await getRequesterProfile(requesterEmpcode)
  const mailData = buildBaseMailData(summary, requestId, requester.name)
  const poPicContext = await getPoPicMailContext(summary)
  const ccEmails = mergeUniqueEmails(poPicContext.allPoPicEmails).filter((email) => email !== requester.email)

  await sendGprCEmail({
    templateName: 'email_ToRequester_GprCSetup',
    toEmail: requester.email,
    ccEmails,
    subject: `[GPR C Setup] Please setup GPR C approver for ${mailData.requestNumber}`,
    requestId,
    requestNumber: mailData.requestNumber,
    html: email_ToRequester_GprCSetup({
      ...mailData,
      userName: requester.name,
      recipientName: requester.name,
      systemLink: `${process.env.VENDOR_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register-history`,
      picName: poPicContext.picName || 'Vendor Registration System',
    }),
  })
}

const notifyStepApprover = async (requestId: number, step: any, ccEmails: string[] = []) => {
  const summary = await getRequestSummary(requestId)
  const approverName = normalizeValue(step.APPROVER_NAME || step.approver_name) || 'Approver'
  const approverEmail = normalizeEmail(step.APPROVER_EMAIL || step.approver_email)
  if (!approverEmail) return
  const mailData = buildBaseMailData(summary, requestId, approverName)
  const isFirstStep = Number(step.STEP_ORDER || step.step_order) === 1
  const requesterEmpcode = normalizeValue(summary.Request_By_EmployeeCode || summary.REQUEST_BY_EMPLOYEECODE)
  const requester = requesterEmpcode ? await getRequesterProfile(requesterEmpcode).catch(() => null) : null
  const poPicContext = await getPoPicMailContext(summary)
  const finalCcEmails = mergeUniqueEmails(poPicContext.allPoPicEmails, ...(isFirstStep ? [requester?.email ? [requester.email] : [], ccEmails] : [])).filter(
    (email) => email !== approverEmail
  )
  const templateName = isFirstStep ? 'email_ToGprCApprover_FirstStep' : 'email_ToGprCApprover_NextStep'
  const emailHtml = isFirstStep
    ? email_ToGprCApprover_FirstStep({
        ...mailData,
        userName: approverName,
        recipientName: approverName,
        picName: requester?.name || poPicContext.picName,
      })
    : email_ToGprCApprover_NextStep({
        ...mailData,
        picNextStepName: approverName,
        recipientName: approverName,
        picName: requester?.name || poPicContext.picName,
      })

  await sendGprCEmail({
    templateName,
    toEmail: approverEmail,
    ccEmails: finalCcEmails,
    subject: `[GPR C Approval] ${mailData.requestNumber} - ${step.STEP_NAME || step.step_name}`,
    requestId,
    requestNumber: mailData.requestNumber,
    html: emailHtml,
  })
}

const notifyActionRequired = async (requestId: number, step: any, action: any) => {
  const summary = await getRequestSummary(requestId)
  const picEmail = normalizeEmail(action.pic_email || action.PIC_EMAIL)
  if (!picEmail) return
  const mailData = buildBaseMailData(summary, requestId, normalizeValue(action.pic_name || action.PIC_NAME) || 'PIC')

  await sendGprCEmail({
    templateName: 'email_ToUser_ActionRequired',
    toEmail: picEmail,
    ccEmails: [],
    subject: `[GPR C Action Required] ${mailData.requestNumber} - ${step.STEP_NAME || step.step_name}`,
    requestId,
    requestNumber: mailData.requestNumber,
    html: email_ToUser_ActionRequired({
      ...mailData,
      stageLabel: step.STEP_NAME || step.step_name,
      note: action.required_detail || action.REQUIRED_DETAIL || '',
      picName: 'GPR C Workflow',
    }),
  })
}

// Closes the "Email result" loop: once the assigned PIC records their Action Required result, notify
// the GPR C approver (the judge) who raised it.
const notifyActionResultRecorded = async (record: any) => {
  const requestId = Number(getValue(record, 'REQUEST_REGISTER_VENDOR_ID', 'request_register_vendor_id'))
  const stepId = Number(getValue(record, 'REQUEST_VENDOR_GPR_C_STEPS_ID', 'gpr_c_step_id'))
  if (!requestId || !stepId) return

  const stepRows = (await MySQLExecute.search(GprCApprovalSQL.getStepById({ REQUEST_VENDOR_GPR_C_STEPS_ID: stepId }))) as RowDataPacket[]
  const step = stepRows[0]
  const approverEmail = normalizeEmail(getValue(step, 'APPROVER_EMAIL', 'approver_email'))
  if (!approverEmail) return

  const approverName = normalizeValue(getValue(step, 'APPROVER_NAME', 'approver_name')) || 'Approver'
  const summary = await getRequestSummary(requestId)
  const mailData = buildBaseMailData(summary, requestId, approverName)
  const stageLabel = normalizeValue(getValue(record, 'STAGE_NAME', 'stage_name', 'STAGE_CODE', 'stage_code')) || 'Action Required'
  const resultStatus = normalizeValue(getValue(record, 'RESULT_STATUS', 'result_status'))
  const resultRemark = normalizeValue(getValue(record, 'RESULT_REMARK', 'result_remark'))
  const picName = normalizeValue(getValue(record, 'PIC_NAME', 'pic_name')) || 'GPR C Workflow'
  const note = [resultStatus ? `Status: ${resultStatus}` : '', resultRemark].filter(Boolean).join(' — ')

  await sendGprCEmail({
    templateName: 'email_ToUser_ActionResult',
    toEmail: approverEmail,
    ccEmails: [],
    subject: `[GPR C Action Result] ${mailData.requestNumber} - ${stageLabel}`,
    requestId,
    requestNumber: mailData.requestNumber,
    html: email_ToUser_ActionResult({
      ...mailData,
      recipientName: approverName,
      stageLabel,
      note,
      picName,
    }),
  })
}

const loadMainWorkflowTransition = async (
  requestId: number,
  currentStep: any,
  actionCode: 'APPROVE' | 'REJECT' | 'RECHECK',
  targetWorkflowStepMasterId: number | null,
  terminalRequestStateId: number | null,
  requestInProgressStateId: number
) => {
  const workflowStepId = Number(getValue(currentStep, 'workflow_step_id', 'WORKFLOW_STEP_MASTER_ID'))
  if (!workflowStepId) throw new Error('Main workflow step identity is missing')

  const sql = await GprCApprovalSQL.getMainWorkflowTransition({
    REQUEST_REGISTER_VENDOR_ID: requestId,
    CURRENT_WORKFLOW_STEP_MASTER_ID: workflowStepId,
    ACTION_CODE: actionCode,
    TARGET_WORKFLOW_STEP_MASTER_ID: targetWorkflowStepMasterId,
    TERMINAL_REQUEST_STATE_ID: terminalRequestStateId,
    M_REQUEST_IN_PROGRESS_STATE_ID: requestInProgressStateId,
  })
  const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
  const transition = rows[0]
  if (!transition) {
    throw new Error('The required transition is not configured for the Issue GPR C workflow step')
  }
  return transition
}

const notifyPoPicGprCRecheck = async (requestId: number, step: any, remark: string) => {
  const summary = await getRequestSummary(requestId)
  const poPicContext = await getPoPicMailContext(summary)
  if (!poPicContext.picEmail) return

  const approverEmail = normalizeEmail(getValue(step, 'APPROVER_EMAIL', 'approver_email'))
  const approverName = normalizeValue(getValue(step, 'APPROVER_NAME', 'approver_name')) || 'GPR C Approver'
  const stepName = normalizeValue(getValue(step, 'STEP_NAME', 'step_name')) || approverName
  const mailData = buildBaseMailData(summary, requestId, poPicContext.picName)
  const ccEmails = mergeUniqueEmails(poPicContext.peerPicCc, approverEmail ? [approverEmail] : []).filter((email) => email !== poPicContext.picEmail)

  await sendGprCEmail({
    templateName: 'email_ToPic_RecheckByGprCApprover',
    toEmail: poPicContext.picEmail,
    ccEmails,
    subject: `[GPR C Re-check] ${mailData.requestNumber} - ${stepName}`,
    requestId,
    requestNumber: mailData.requestNumber,
    html: email_ToPic_RecheckByGprCApprover({
      ...mailData,
      recipientName: poPicContext.picName,
      stageLabel: stepName,
      remarkEN: remark,
      remarkTH: remark,
      picName: approverName,
    }),
  })
}

const executeGuardedMainWorkflow = async (requestId: number, currentStep: any, context: any, actionBy: string, requestInProgressStateId: number, sqlList: string[]) => {
  const currentTaskId = Number(getValue(context, 'CURRENT_REQUEST_APPROVAL_STEP_ID', 'current_step_id'))
  const lockVersion = Number(getValue(context, 'LOCK_VERSION', 'lock_version'))
  if (!currentTaskId || currentTaskId !== Number(currentStep.step_id)) {
    throw new Error('Main workflow state changed. Please refresh and try again.')
  }
  const guardSql = await GprCApprovalSQL.acquireWorkflowLock({
    REQUEST_REGISTER_VENDOR_ID: requestId,
    CURRENT_TASK_ID: currentTaskId,
    LOCK_VERSION: lockVersion,
    M_REQUEST_IN_PROGRESS_STATE_ID: requestInProgressStateId,
    UPDATE_BY: actionBy || 'SYSTEM',
  })
  return MySQLExecute.executeGuardedList(guardSql, sqlList)
}

// Advances the pinned main workflow using its configured transition after the GPR C sub-flow ends.
const markMainIssueGprCApproved = async (requestId: number, actionBy: string, remark: string) => {
  const [stepsSql, contextSql, statusIdentity] = await Promise.all([
    GprCApprovalSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: requestId }),
    GprCApprovalSQL.getRequestStatusContext({ REQUEST_REGISTER_VENDOR_ID: requestId }),
    getGprCMainWorkflowIdentity(),
  ])
  const [stepRows, contextRows] = await Promise.all([MySQLExecute.search(stepsSql) as Promise<RowDataPacket[]>, MySQLExecute.search(contextSql) as Promise<RowDataPacket[]>])
  const steps = stepRows.map(normalizeMainApprovalStep)
  const context = contextRows[0]
  const currentTaskId = Number(getValue(context, 'CURRENT_REQUEST_APPROVAL_STEP_ID', 'current_step_id'))
  const currentStep = steps.find((step: any) => step.step_id === currentTaskId && step.approval_step_status_id === statusIdentity.approvalStep.inProgress)
  if (!currentStep || currentStep.workflow_step_id !== statusIdentity.workflowStep.issueGprC) return null

  const transition = await loadMainWorkflowTransition(requestId, currentStep, 'APPROVE', statusIdentity.workflowStep.docCheck, null, statusIdentity.requestState.inProgress)
  const nextStepId = Number(getValue(transition, 'NEXT_REQUEST_APPROVAL_STEP_ID'))
  if (!nextStepId) {
    throw new Error('Configured Issue GPR C approval transition has no runtime target task')
  }
  const nextStep = normalizeMainApprovalStep({
    REQUEST_APPROVAL_STEP_ID: nextStepId,
    WORKFLOW_STEP_MASTER_ID: getValue(transition, 'TO_WORKFLOW_STEP_MASTER_ID'),
    STEP_ORDER: getValue(transition, 'NEXT_STEP_ORDER'),
    APPROVER_EMPCODE: getValue(transition, 'NEXT_APPROVER_EMPCODE'),
    M_APPROVAL_STEP_STATUS_ID: getValue(transition, 'NEXT_STEP_STATUS_ID'),
    STEP_CODE: getValue(transition, 'NEXT_STEP_CODE'),
    ACTOR_TYPE: getValue(transition, 'NEXT_ACTOR_TYPE'),
    DESCRIPTION: getValue(transition, 'NEXT_STATUS_VALUE'),
  })
  if (nextStep.approval_step_status_id !== statusIdentity.approvalStep.pending) {
    throw new Error('Main workflow state changed. Please refresh and try again.')
  }

  const sqlList = [
    await GprCApprovalSQL.updateApprovalStep({
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.approved,
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: statusIdentity.approvalStep.inProgress,
      M_APPROVAL_STEP_REJECTED_STATUS_ID: statusIdentity.approvalStep.rejected,
      M_REQUEST_REJECTED_STATE_ID: statusIdentity.requestState.rejected,
      M_REQUEST_IN_PROGRESS_STATE_ID: statusIdentity.requestState.inProgress,
      M_REQUEST_REJECTED_STATUS_ID: statusIdentity.requestStatus.rejected,
      UPDATE_BY: actionBy || 'SYSTEM',
    }),
    await GprCApprovalSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: requestId,
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      ACTION_BY: actionBy || 'SYSTEM',
      ACTION_TYPE: String(getValue(transition, 'ACTION_CODE')).toLowerCase(),
      ACTION_CODE: getValue(transition, 'ACTION_CODE'),
      REMARK: remark || 'GPR C sub-workflow approved',
    }),
    await GprCApprovalSQL.updateApprovalStep({
      REQUEST_APPROVAL_STEP_ID: nextStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.inProgress,
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: statusIdentity.approvalStep.inProgress,
      M_APPROVAL_STEP_REJECTED_STATUS_ID: statusIdentity.approvalStep.rejected,
      M_REQUEST_REJECTED_STATE_ID: statusIdentity.requestState.rejected,
      M_REQUEST_IN_PROGRESS_STATE_ID: statusIdentity.requestState.inProgress,
      M_REQUEST_REJECTED_STATUS_ID: statusIdentity.requestStatus.rejected,
      UPDATE_BY: actionBy || 'SYSTEM',
    }),
  ]

  await executeGuardedMainWorkflow(requestId, currentStep, context, actionBy, statusIdentity.requestState.inProgress, sqlList)
  return nextStep
}

const markMainIssueGprCRejected = async (requestId: number, actionBy: string, remark: string) => {
  const [stepsSql, contextSql, statusIdentity] = await Promise.all([
    GprCApprovalSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: requestId }),
    GprCApprovalSQL.getRequestStatusContext({ REQUEST_REGISTER_VENDOR_ID: requestId }),
    getGprCMainWorkflowRejectionIdentity(),
  ])
  const [stepRows, contextRows] = await Promise.all([MySQLExecute.search(stepsSql) as Promise<RowDataPacket[]>, MySQLExecute.search(contextSql) as Promise<RowDataPacket[]>])
  const steps = stepRows.map(normalizeMainApprovalStep)
  const context = contextRows[0]
  const currentTaskId = Number(getValue(context, 'CURRENT_REQUEST_APPROVAL_STEP_ID', 'current_step_id'))
  const currentStep = steps.find((step: any) => step.step_id === currentTaskId && step.approval_step_status_id === statusIdentity.approvalStep.inProgress)
  if (!currentStep || currentStep.workflow_step_id !== statusIdentity.workflowStep.issueGprC) {
    throw new Error('Issue GPR C is no longer the active main workflow task')
  }
  const transition = await loadMainWorkflowTransition(requestId, currentStep, 'REJECT', null, statusIdentity.requestState.rejected, statusIdentity.requestState.inProgress)

  const sqlList = []
  const vendorId = getValue(context, 'vendor_id', 'VENDORS_ID')
  if (vendorId) {
    sqlList.push(
      await GprCApprovalSQL.updateVendorFftStatus({
        VENDORS_ID: vendorId,
        M_VENDOR_STATUS_ID: statusIdentity.vendor.cannotRegister,
      })
    )
  }
  sqlList.push(
    await GprCApprovalSQL.updateApprovalStep({
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.rejected,
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: statusIdentity.approvalStep.inProgress,
      M_APPROVAL_STEP_REJECTED_STATUS_ID: statusIdentity.approvalStep.rejected,
      M_REQUEST_REJECTED_STATE_ID: statusIdentity.requestState.rejected,
      M_REQUEST_IN_PROGRESS_STATE_ID: statusIdentity.requestState.inProgress,
      M_REQUEST_REJECTED_STATUS_ID: statusIdentity.requestStatus.rejected,
      UPDATE_BY: actionBy || 'SYSTEM',
    })
  )
  sqlList.push(
    await GprCApprovalSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: requestId,
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      ACTION_BY: actionBy || 'SYSTEM',
      ACTION_TYPE: 'rejected',
      ACTION_CODE: getValue(transition, 'ACTION_CODE'),
      REMARK: '',
      REJECT_REASON: remark || 'GPR C sub-workflow rejected',
    })
  )
  for (const step of steps.filter((item: any) => item.approval_step_status_id === statusIdentity.approvalStep.pending)) {
    sqlList.push(
      await GprCApprovalSQL.updateApprovalStep({
        REQUEST_APPROVAL_STEP_ID: step.step_id,
        M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.skipped,
        M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: statusIdentity.approvalStep.inProgress,
        M_APPROVAL_STEP_REJECTED_STATUS_ID: statusIdentity.approvalStep.rejected,
        M_REQUEST_REJECTED_STATE_ID: statusIdentity.requestState.rejected,
        M_REQUEST_IN_PROGRESS_STATE_ID: statusIdentity.requestState.inProgress,
        M_REQUEST_REJECTED_STATUS_ID: statusIdentity.requestStatus.rejected,
        UPDATE_BY: actionBy || 'SYSTEM',
      })
    )
  }

  await executeGuardedMainWorkflow(requestId, currentStep, context, actionBy, statusIdentity.requestState.inProgress, sqlList)
  return { ...currentStep, approver_id: getValue(currentStep, 'approver_id', 'APPROVER_EMPCODE') }
}

const markMainIssueGprCRecheckToPic = async (requestId: number, flowId: number, currentGprStep: any, actionBy: string, remark: string) => {
  const [stepsSql, contextSql, statusIdentity, gprCFlowStatus] = await Promise.all([
    GprCApprovalSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: requestId }),
    GprCApprovalSQL.getRequestStatusContext({ REQUEST_REGISTER_VENDOR_ID: requestId }),
    getGprCMainWorkflowIdentity(),
    getGprCFlowStatusIdentity(),
  ])
  const [stepRows, contextRows] = await Promise.all([MySQLExecute.search(stepsSql) as Promise<RowDataPacket[]>, MySQLExecute.search(contextSql) as Promise<RowDataPacket[]>])
  const steps = stepRows.map(normalizeMainApprovalStep)
  const context = contextRows[0]
  const currentTaskId = Number(getValue(context, 'CURRENT_REQUEST_APPROVAL_STEP_ID', 'current_step_id'))
  const currentMainStep = steps.find((step: any) => step.step_id === currentTaskId && step.approval_step_status_id === statusIdentity.approvalStep.inProgress)
  if (!currentMainStep || currentMainStep.workflow_step_id !== statusIdentity.workflowStep.issueGprC) {
    throw new Error('Issue GPR C is no longer the active main workflow task')
  }

  const transition = await loadMainWorkflowTransition(
    requestId,
    currentMainStep,
    'RECHECK',
    statusIdentity.workflowStep.poPicInProgress,
    null,
    statusIdentity.requestState.inProgress
  )
  if (normalizeValue(getValue(transition, 'ACTION_CODE')).toUpperCase() !== 'RECHECK' || normalizeValue(getValue(transition, 'CONDITION_KEY')).toUpperCase() !== 'RECHECK_TO_PIC') {
    throw new Error('Workflow configuration error: GPR C RECHECK must target PO PIC In Progress.')
  }

  const targetStep = normalizeMainApprovalStep({
    REQUEST_APPROVAL_STEP_ID: getValue(transition, 'NEXT_REQUEST_APPROVAL_STEP_ID'),
    WORKFLOW_STEP_MASTER_ID: getValue(transition, 'TO_WORKFLOW_STEP_MASTER_ID'),
    STEP_ORDER: getValue(transition, 'NEXT_STEP_ORDER'),
    APPROVER_EMPCODE: getValue(transition, 'NEXT_APPROVER_EMPCODE'),
    M_APPROVAL_STEP_STATUS_ID: getValue(transition, 'NEXT_STEP_STATUS_ID'),
    STEP_CODE: getValue(transition, 'NEXT_STEP_CODE'),
    ACTOR_TYPE: getValue(transition, 'NEXT_ACTOR_TYPE'),
    DESCRIPTION: getValue(transition, 'NEXT_STATUS_VALUE'),
  })
  if (
    !targetStep.step_id ||
    targetStep.workflow_step_id !== statusIdentity.workflowStep.poPicInProgress ||
    targetStep.approval_step_status_id === statusIdentity.approvalStep.inProgress
  ) {
    throw new Error('PO PIC task cannot be re-opened. Please refresh and try again.')
  }

  const currentGprStepId = Number(getValue(currentGprStep, 'REQUEST_VENDOR_GPR_C_STEPS_ID', 'gpr_c_step_id'))
  if (!currentGprStepId) throw new Error('Current GPR C step identity is missing')
  const issueGprBStep = steps.find((step) => step.workflow_step_id === statusIdentity.workflowStep.issueGprB)
  if (!issueGprBStep || issueGprBStep.approval_step_status_id === statusIdentity.approvalStep.inProgress) {
    throw new Error('Issue GPR B task cannot be prepared for re-check. Please refresh and try again.')
  }

  const sqlList = [
    GprCApprovalSQL.updateStepAction({
      REQUEST_VENDOR_GPR_C_STEPS_ID: currentGprStepId,
      M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.pending,
      ACTION_BY: actionBy,
      ACTION_TYPE: 'RECHECK',
      ACTION_REMARK: remark,
      UPDATE_BY: actionBy,
    }),
    GprCApprovalSQL.updateFlowStatus({
      REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
      M_GPR_C_FLOW_STATUS_ID: gprCFlowStatus.recheckRequired,
      FLOW_STATUS: 'recheck_required',
      CURRENT_STEP_CODE: getValue(currentGprStep, 'STEP_CODE', 'step_code'),
      COMPLETED_AT: null,
      REJECTED_AT: null,
      REJECTED_BY: '',
      REJECTED_REMARK: '',
      UPDATE_BY: actionBy,
    }),
    await GprCApprovalSQL.updateApprovalStep({
      REQUEST_APPROVAL_STEP_ID: issueGprBStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.pending,
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: statusIdentity.approvalStep.inProgress,
      M_APPROVAL_STEP_REJECTED_STATUS_ID: statusIdentity.approvalStep.rejected,
      M_REQUEST_REJECTED_STATE_ID: statusIdentity.requestState.rejected,
      M_REQUEST_IN_PROGRESS_STATE_ID: statusIdentity.requestState.inProgress,
      M_REQUEST_REJECTED_STATUS_ID: statusIdentity.requestStatus.rejected,
      UPDATE_BY: actionBy,
    }),
    await GprCApprovalSQL.updateApprovalStep({
      REQUEST_APPROVAL_STEP_ID: currentMainStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.pending,
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: statusIdentity.approvalStep.inProgress,
      M_APPROVAL_STEP_REJECTED_STATUS_ID: statusIdentity.approvalStep.rejected,
      M_REQUEST_REJECTED_STATE_ID: statusIdentity.requestState.rejected,
      M_REQUEST_IN_PROGRESS_STATE_ID: statusIdentity.requestState.inProgress,
      M_REQUEST_REJECTED_STATUS_ID: statusIdentity.requestStatus.rejected,
      UPDATE_BY: actionBy,
    }),
    await GprCApprovalSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: requestId,
      REQUEST_APPROVAL_STEP_ID: currentMainStep.step_id,
      ACTION_BY: actionBy,
      ACTION_TYPE: String(getValue(transition, 'ACTION_CODE')).toLowerCase(),
      ACTION_CODE: getValue(transition, 'ACTION_CODE'),
      REMARK: '',
      RECHECK_REASON: remark,
    }),
  ]

  const poPicEmpcode = normalizeValue(getValue(context, 'ASSIGN_TO', 'assign_to'))
  if (poPicEmpcode && poPicEmpcode !== targetStep.approver_id) {
    sqlList.push(
      await GprCApprovalSQL.updateMainApprovalStepApprover({
        REQUEST_APPROVAL_STEP_ID: targetStep.step_id,
        APPROVER_EMPCODE: poPicEmpcode,
        UPDATE_BY: actionBy,
      })
    )
    targetStep.approver_id = poPicEmpcode
  }

  sqlList.push(
    await GprCApprovalSQL.updateApprovalStep({
      REQUEST_APPROVAL_STEP_ID: targetStep.step_id,
      M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.inProgress,
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: statusIdentity.approvalStep.inProgress,
      M_APPROVAL_STEP_REJECTED_STATUS_ID: statusIdentity.approvalStep.rejected,
      M_REQUEST_REJECTED_STATE_ID: statusIdentity.requestState.rejected,
      M_REQUEST_IN_PROGRESS_STATE_ID: statusIdentity.requestState.inProgress,
      M_REQUEST_REJECTED_STATUS_ID: statusIdentity.requestStatus.rejected,
      UPDATE_BY: actionBy,
    })
  )

  await executeGuardedMainWorkflow(requestId, currentMainStep, context, actionBy, statusIdentity.requestState.inProgress, sqlList)
  return targetStep
}

const resumeGprCRecheckFlow = async (requestId: number, flow: any, updateBy: string) => {
  const [statusIdentity, mainStatusIdentity, contextSql, mainStepsSql] = await Promise.all([
    getGprCStepStatusIdentity(),
    getGprCMainWorkflowIdentity(),
    GprCApprovalSQL.getRequestStatusContext({ REQUEST_REGISTER_VENDOR_ID: requestId }),
    GprCApprovalSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: requestId }),
  ])
  if (Number(getValue(flow, 'M_GPR_C_FLOW_STATUS_ID', 'gpr_c_flow_status_id')) !== statusIdentity.gprCFlow.recheckRequired) {
    return false
  }

  const [contextRows, mainStepRows] = await Promise.all([
    MySQLExecute.search(contextSql) as Promise<RowDataPacket[]>,
    MySQLExecute.search(mainStepsSql) as Promise<RowDataPacket[]>,
  ])
  const context = contextRows[0]
  const currentTaskId = Number(getValue(context, 'CURRENT_REQUEST_APPROVAL_STEP_ID', 'current_step_id'))
  const currentMainStep = mainStepRows
    .map(normalizeMainApprovalStep)
    .find(
      (step: any) =>
        step.step_id === currentTaskId &&
        step.workflow_step_id === mainStatusIdentity.workflowStep.issueGprC &&
        step.approval_step_status_id === mainStatusIdentity.approvalStep.inProgress
    )
  if (!currentMainStep) return false

  const flowId = Number(getValue(flow, 'REQUEST_VENDOR_GPR_C_FLOWS_ID', 'gpr_c_flow_id'))
  const steps = await getStepsByFlow(flowId)
  const pausedStep = steps.find(
    (step: any) =>
      Number(getValue(step, 'M_APPROVAL_STEP_STATUS_ID', 'approval_step_status_id')) === statusIdentity.approvalStep.pending &&
      normalizeValue(getValue(step, 'ACTION_TYPE', 'action_type')).toUpperCase() === 'RECHECK'
  )
  if (!pausedStep) {
    throw new Error('Paused GPR C re-check step was not found')
  }

  const sqlList: string[] = []
  const resolvedApprover = await resolveGprCStepApprover(pausedStep).catch(() => null)
  const currentApprover = normalizeValue(getValue(pausedStep, 'APPROVER_EMPCODE', 'approver_empcode'))
  if (resolvedApprover?.empcode && resolvedApprover.empcode !== currentApprover) {
    sqlList.push(
      GprCApprovalSQL.updateStepApprover({
        REQUEST_VENDOR_GPR_C_STEPS_ID: getValue(pausedStep, 'REQUEST_VENDOR_GPR_C_STEPS_ID', 'gpr_c_step_id'),
        APPROVER_EMPCODE: resolvedApprover.empcode,
        APPROVER_NAME: resolvedApprover.name,
        APPROVER_EMAIL: resolvedApprover.email,
        UPDATE_BY: updateBy,
      })
    )
    pausedStep.APPROVER_EMPCODE = resolvedApprover.empcode
    pausedStep.APPROVER_NAME = resolvedApprover.name
    pausedStep.APPROVER_EMAIL = resolvedApprover.email
  }
  sqlList.push(
    GprCApprovalSQL.activateStep({
      REQUEST_VENDOR_GPR_C_STEPS_ID: getValue(pausedStep, 'REQUEST_VENDOR_GPR_C_STEPS_ID', 'gpr_c_step_id'),
      M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.inProgress,
      UPDATE_BY: updateBy,
    }),
    GprCApprovalSQL.updateFlowStatus({
      REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
      M_GPR_C_FLOW_STATUS_ID: statusIdentity.gprCFlow.inProgress,
      FLOW_STATUS: 'in_progress',
      CURRENT_STEP_CODE: getValue(pausedStep, 'STEP_CODE', 'step_code'),
      COMPLETED_AT: null,
      REJECTED_AT: null,
      REJECTED_BY: '',
      REJECTED_REMARK: '',
      UPDATE_BY: updateBy,
    })
  )
  await MySQLExecute.executeList(sqlList)
  await notifyStepApprover(requestId, pausedStep)
  return true
}

export const GprCApprovalService = {
  createOrGetFlow: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Missing request_id')
      const existingFlow = await getFlowByRequest(requestId)
      const updateBy = normalizeValue(dataItem.UPDATE_BY) || 'SYSTEM'
      let flow = existingFlow || (await ensureFlow(requestId, updateBy))
      if (!existingFlow) {
        await notifyRequesterSetup(requestId).catch(() => undefined /* console.error */)
      }
      const flowId = Number(getValue(flow, 'REQUEST_VENDOR_GPR_C_FLOWS_ID', 'gpr_c_flow_id'))
      if (existingFlow && (await resumeGprCRecheckFlow(requestId, existingFlow, updateBy))) {
        flow = (await getFlowByRequest(requestId)) || flow
      }
      const steps = flowId ? await getStepsByFlow(flowId) : []
      return response(true, 'GPR C flow ready', { flow, steps }, 'GPR C Flow')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to create GPR C flow', [], 'GPR C Flow Failed', 0)
    }
  },

  getFlow: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Missing request_id')
      const flow = await getFlowByRequest(requestId)
      if (!flow) return response(true, 'No GPR C flow found', { flow: null, steps: [], action_required: [] }, 'Get GPR C Flow', 0)
      const flowId = Number(getValue(flow, 'REQUEST_VENDOR_GPR_C_FLOWS_ID', 'gpr_c_flow_id'))
      const steps = await getStepsByFlow(flowId)
      return response(true, 'GPR C flow loaded', { flow, steps }, 'Get GPR C Flow')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to get GPR C flow', [], 'Get GPR C Flow Failed', 0)
    }
  },

  getQueue: async (dataItem: any) => {
    try {
      const approverEmpcode = normalizeValue(dataItem.APPROVER_EMPCODE || dataItem.APPROVER_EMPCODE)
      if (!approverEmpcode) throw new Error('Missing approver_empcode')
      const [countSql, dataSql] = GprCApprovalSQL.getQueueByApproverPaginated({
        ...dataItem,
        APPROVER_EMPCODE: approverEmpcode,
      })
      const totalCountRows = (await MySQLExecute.search(countSql)) as RowDataPacket[]
      const rows = (await MySQLExecute.search(dataSql)) as RowDataPacket[]
      const totalCount = Number(totalCountRows[0]?.TOTAL_COUNT || 0)
      return response(true, 'GPR C queue loaded', rows, 'Get GPR C Queue', totalCount)
    } catch (error: any) {
      return response(false, error?.message || 'Failed to get GPR C queue', [], 'Get GPR C Queue Failed', 0)
    }
  },

  getTaskManagerQueue: async () => {
    try {
      const sql = GprCApprovalSQL.getTaskManagerQueue()
      const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
      return response(true, 'GPR C task manager queue loaded', rows, 'Get GPR C Task Manager Queue', rows.length)
    } catch (error: any) {
      return response(false, error?.message || 'Failed to get GPR C task manager queue', [], 'Get GPR C Task Manager Queue Failed', 0)
    }
  },

  reassignStep: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      const stepId = Number(dataItem.REQUEST_VENDOR_GPR_C_STEPS_ID)
      const toEmpcode = normalizeValue(dataItem.TO_EMPCODE)
      const updateBy = normalizeValue(dataItem.UPDATE_BY || dataItem.CHANGED_BY) || 'SYSTEM'

      if (!requestId) throw new Error('Missing request_id')
      if (!stepId) throw new Error('Missing gpr_c_step_id')
      if (!toEmpcode) throw new Error('Missing to_empcode')

      const stepSql = GprCApprovalSQL.getStepById({ REQUEST_VENDOR_GPR_C_STEPS_ID: stepId })
      const stepRows = (await MySQLExecute.search(stepSql)) as RowDataPacket[]
      const step = stepRows[0]
      const approvalStep = await getApprovalStepStatusIdentity()
      if (!step) throw new Error('GPR C step not found')
      if (Number(step.REQUEST_REGISTER_VENDOR_ID || step.request_id) !== requestId) throw new Error('GPR C step does not belong to this request')
      if (Number(step.M_APPROVAL_STEP_STATUS_ID || 0) !== approvalStep.inProgress) {
        throw new Error('Only in-progress GPR C step can be reassigned')
      }

      const expectedGroupCode = resolveManagedGroupForGprCStep(step.STEP_CODE || step.step_code)
      if (!expectedGroupCode) throw new Error('This GPR C step is not managed by an approval group')

      const assigneeSql = await GprCApprovalSQL.getActiveAssigneeByEmpCodeAndGroupCode({
        EMPCODE: toEmpcode,
        GROUP_CODE: normalizeGroupToken(expectedGroupCode),
        GROUP_COMPACT: compactGroupToken(expectedGroupCode),
      })
      const assigneeRows = (await MySQLExecute.search(assigneeSql)) as RowDataPacket[]
      const targetAssignee = assigneeRows[0]
      if (!targetAssignee) throw new Error(`Target assignee must belong to group ${expectedGroupCode}`)

      await MySQLExecute.execute(
        GprCApprovalSQL.updateStepApprover({
          REQUEST_VENDOR_GPR_C_STEPS_ID: stepId,
          APPROVER_EMPCODE: targetAssignee.empcode,
          APPROVER_NAME: targetAssignee.empName,
          APPROVER_EMAIL: targetAssignee.empEmail,
          UPDATE_BY: updateBy,
        })
      )

      return response(true, 'GPR C step reassigned successfully', { gpr_c_step_id: stepId }, 'Reassign GPR C Step')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to reassign GPR C step', [], 'Reassign GPR C Step Failed', 0)
    }
  },

  getActionRequiredQueue: async (dataItem: any) => {
    try {
      const picEmail = normalizeEmail(dataItem.PIC_EMAIL)
      if (!picEmail) throw new Error('Missing pic_email')
      const [countSql, dataSql] = GprCApprovalSQL.getActionRequiredQueueByPicEmailPaginated({
        ...dataItem,
        PIC_EMAIL: picEmail,
      })
      const totalCountRows = (await MySQLExecute.search(countSql)) as RowDataPacket[]
      const rows = (await MySQLExecute.search(dataSql)) as RowDataPacket[]
      const totalCount = Number(totalCountRows[0]?.TOTAL_COUNT || 0)
      return response(true, 'GPR C Action Required queue loaded', rows, 'Get GPR C Action Required Queue', totalCount)
    } catch (error: any) {
      return response(false, error?.message || 'Failed to get GPR C Action Required queue', [], 'Get GPR C Action Required Queue Failed', 0)
    }
  },

  submitSetup: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Missing request_id')
      const updateBy = normalizeValue(dataItem.UPDATE_BY) || 'SYSTEM'
      const gprCData = typeof dataItem.GPR_C_DATA === 'string' ? JSON.parse(dataItem.GPR_C_DATA) : dataItem.GPR_C_DATA || {}

      const summary = await getRequestSummary(requestId)
      const requesterEmpcode = normalizeValue(summary.Request_By_EmployeeCode || summary.REQUEST_BY_EMPLOYEECODE)
      if (requesterEmpcode && updateBy !== requesterEmpcode) {
        throw new Error('Only requester can submit GPR C setup')
      }

      const flow = await ensureFlow(requestId, updateBy)
      const flowId = Number(getValue(flow, 'REQUEST_VENDOR_GPR_C_FLOWS_ID', 'gpr_c_flow_id'))
      const selectionId = await getSelectionId(requestId)
      if (!selectionId) throw new Error('GPR C selection sheet is required before setup')
      const approverEmpcode = normalizeValue(gprCData.gpr_c_approver_empcode)
      if (!approverEmpcode) throw new Error('GPR C approver empcode is required')

      const productCheckers = await buildProductCheckers(gprCData.gpr_c_product_checkers || gprCData.gpr_c_product_group_checkers)
      const stepApprovers = await resolveStepApprovers(approverEmpcode, productCheckers)
      const requesterApproverStep = stepApprovers.find((step: any) => step.code === 'REQUESTER_APPROVER')
      if (!requesterApproverStep) throw new Error('GPR C requester approver step could not be created')
      const circularMembers = await buildCircularMembers(gprCData.gpr_c_circular_empcodes || [])
      const pcPicEmpcode = normalizeValue(gprCData.gpr_c_pc_pic_empcode)
      if (!pcPicEmpcode) throw new Error('PC PIC employee code is required')
      const pcPicProfile = await getMemberProfile(pcPicEmpcode)
      const pcPicName = normalizeValue(pcPicProfile?.name || gprCData.gpr_c_pc_pic_name)
      const pcPicEmail = normalizeEmail(pcPicProfile?.email || gprCData.gpr_c_pc_pic_email)
      const ccEmails = mergeUniqueEmails(
        pcPicEmail ? [pcPicEmail] : [],
        circularMembers.map((item) => item.email)
      )
      const statusIdentity = await getGprCStepStatusIdentity()

      const sqlList = [
        GprCApprovalSQL.updateFlowSetup({
          REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
          REQUEST_REGISTER_VENDOR_ID: requestId,
          REQUEST_VENDOR_SELECTIONS_ID: selectionId || '',
          M_GPR_C_FLOW_STATUS_ID: statusIdentity.gprCFlow.inProgress,
          CURRENT_STEP_CODE: stepApprovers[0].code,
          REQUESTER_EMPCODE: requesterEmpcode,
          REQUESTER_SUBMITTED_AT: 'NOW()',
          GPR_C_APPROVER_EMPCODE: requesterApproverStep.approver.empcode,
          GPR_C_APPROVER_NAME: requesterApproverStep.approver.name,
          GPR_C_APPROVER_EMAIL: requesterApproverStep.approver.email,
          PC_PIC_EMPCODE: pcPicProfile.empcode,
          PC_PIC_NAME: pcPicName,
          PC_PIC_EMAIL: pcPicEmail,
          UPDATE_BY: updateBy,
        }),
        GprCApprovalSQL.deactivateStepsByFlow({
          REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
          UPDATE_BY: updateBy,
        }),
      ]

      if (selectionId) {
        sqlList.push(
          RequestRegisterPageSQL.deactivateGprProductCheckers({
            REQUEST_VENDOR_SELECTIONS_ID: selectionId,
            UPDATE_BY: updateBy,
          }),
          RequestRegisterPageSQL.deleteGprCircularMembers({
            REQUEST_VENDOR_SELECTIONS_ID: selectionId,
            UPDATE_BY: updateBy,
          })
        )

        productCheckers.forEach((item, index) => {
          sqlList.push(
            RequestRegisterPageSQL.insertGprProductChecker({
              REQUEST_VENDOR_SELECTIONS_ID: selectionId,
              ITEM_ORDER: index + 1,
              PRODUCT_MAIN_ID: item.product_main_id,
              PRODUCT_MAIN_NAME: item.product_main_name,
              SECTION_NAME: item.section_name,
              CHECKER_EMPCODE: item.checker.empcode,
              CHECKER_NAME: item.checker.name,
              CHECKER_EMAIL: item.checker.email,
              CREATE_BY: updateBy,
              UPDATE_BY: updateBy,
            })
          )
        })

        circularMembers.forEach((member, index) => {
          sqlList.push(
            RequestRegisterPageSQL.insertGprCircularMember({
              REQUEST_VENDOR_SELECTIONS_ID: selectionId,
              MEMBER_ORDER: index + 1,
              EMPCODE: member.empcode,
              MEMBER_NAME: member.name,
              EMAIL: member.email,
              CREATE_BY: updateBy,
              UPDATE_BY: updateBy,
            })
          )
        })
      }

      for (const step of stepApprovers) {
        sqlList.push(
          GprCApprovalSQL.insertStep({
            REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
            REQUEST_REGISTER_VENDOR_ID: requestId,
            STEP_ORDER: step.order,
            STEP_CODE: step.code,
            STEP_NAME: step.name,
            APPROVER_EMPCODE: step.approver.empcode,
            APPROVER_NAME: step.approver.name,
            APPROVER_EMAIL: step.approver.email,
            M_APPROVAL_STEP_STATUS_ID: step.order === 1 ? statusIdentity.approvalStep.inProgress : statusIdentity.approvalStep.pending,
            CREATE_BY: updateBy,
            UPDATE_BY: updateBy,
          })
        )
      }

      await MySQLExecute.executeList(sqlList)
      const updatedFlow = await getFlowByRequest(requestId)
      const steps = await getStepsByFlow(flowId)
      const firstStep = steps.find((step: any) => Number(step.STEP_ORDER || step.step_order) === 1)
      await runGprCPostCommitTasks(firstStep ? [() => notifyStepApprover(requestId, firstStep, ccEmails)] : [], requestId)

      return response(true, 'GPR C setup submitted successfully', { flow: updatedFlow, steps }, 'Submit GPR C Setup')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to submit GPR C setup', [], 'Submit GPR C Setup Failed', 0)
    }
  },

  approveStep: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Missing request_id')
      const actionBy = normalizeValue(dataItem.ACTION_BY || dataItem.UPDATE_BY)
      if (!actionBy) throw new Error('Missing action_by')

      const flow = await getFlowByRequest(requestId)
      if (!flow) throw new Error('GPR C flow not found')
      const flowId = Number(getValue(flow, 'REQUEST_VENDOR_GPR_C_FLOWS_ID', 'gpr_c_flow_id'))
      const currentStep = await getCurrentStep(flowId)
      if (!currentStep) throw new Error('No GPR C step in progress')
      if (normalizeValue(currentStep.APPROVER_EMPCODE || currentStep.approver_empcode) !== actionBy) {
        throw new Error(`Unauthorized: current GPR C step requires ${currentStep.APPROVER_EMPCODE || currentStep.approver_empcode}`)
      }

      const steps = await getStepsByFlow(flowId)
      const currentOrder = Number(currentStep.STEP_ORDER || currentStep.step_order)
      const nextStep = steps.find((step: any) => Number(step.STEP_ORDER || step.step_order) === currentOrder + 1)
      const remark = normalizeValue(dataItem.REMARK || dataItem.ACTION_REMARK)
      const actionType = normalizeValue(dataItem.ACTION_TYPE || 'APPROVED').toUpperCase()
      const statusIdentity = await getGprCStepStatusIdentity()
      const sqlList = [
        GprCApprovalSQL.updateStepAction({
          REQUEST_VENDOR_GPR_C_STEPS_ID: currentStep.REQUEST_VENDOR_GPR_C_STEPS_ID || currentStep.gpr_c_step_id,
          M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.approved,
          ACTION_BY: actionBy,
          ACTION_TYPE: actionType,
          ACTION_REMARK: remark,
          UPDATE_BY: actionBy,
        }),
      ]

      const postCommitTasks: GprCPostCommitTask[] = []

      if (nextStep) {
        // Re-resolve the next step's approver from its managed group (dynamic, like the main
        // workflow) so a change in approval_group_member takes effect instead of using the value that was
        // snapshotted onto the step at GPR C setup.
        const resolvedApprover = await resolveGprCStepApprover(nextStep).catch(() => null)
        const currentNextApprover = normalizeValue(getValue(nextStep, 'APPROVER_EMPCODE', 'approver_empcode'))
        if (resolvedApprover && resolvedApprover.empcode && resolvedApprover.empcode !== currentNextApprover) {
          sqlList.push(
            GprCApprovalSQL.updateStepApprover({
              REQUEST_VENDOR_GPR_C_STEPS_ID: nextStep.REQUEST_VENDOR_GPR_C_STEPS_ID || nextStep.gpr_c_step_id,
              APPROVER_EMPCODE: resolvedApprover.empcode,
              APPROVER_NAME: resolvedApprover.name,
              APPROVER_EMAIL: resolvedApprover.email,
              UPDATE_BY: actionBy,
            })
          )
          // Reflect the re-resolved approver in-memory so the notification targets the right person.
          nextStep.APPROVER_EMPCODE = resolvedApprover.empcode
          nextStep.APPROVER_NAME = resolvedApprover.name
          nextStep.APPROVER_EMAIL = resolvedApprover.email
        }
        sqlList.push(
          GprCApprovalSQL.activateStep({
            REQUEST_VENDOR_GPR_C_STEPS_ID: nextStep.REQUEST_VENDOR_GPR_C_STEPS_ID || nextStep.gpr_c_step_id,
            M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.inProgress,
            UPDATE_BY: actionBy,
          })
        )
        sqlList.push(
          GprCApprovalSQL.updateFlowStatus({
            REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
            M_GPR_C_FLOW_STATUS_ID: statusIdentity.gprCFlow.inProgress,
            CURRENT_STEP_CODE: nextStep.STEP_CODE || nextStep.step_code,
            UPDATE_BY: actionBy,
          })
        )
        await MySQLExecute.executeList(sqlList)
        // Notify the next GPR C approver.
        postCommitTasks.push(() => notifyStepApprover(requestId, nextStep))
      } else {
        sqlList.push(
          GprCApprovalSQL.updateFlowStatus({
            REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
            M_GPR_C_FLOW_STATUS_ID: statusIdentity.gprCFlow.approved,
            CURRENT_STEP_CODE: 'Finished',
            COMPLETED_AT: 'NOW()',
            UPDATE_BY: actionBy,
          })
        )
        await MySQLExecute.executeList(sqlList)
        // GPR C sub-flow finished: hand back to the main workflow and notify its next approver,
        // the same way the main workflow notifies on every advance.
        const mainNextStep = await markMainIssueGprCApproved(requestId, actionBy, remark)
        if (mainNextStep) {
          const mainNextApprover = normalizeValue(getValue(mainNextStep, 'approver_id', 'APPROVER_EMPCODE', 'approver_empcode'))
          postCommitTasks.push(() => sendMail_ToApprover_NextStep({ REQUEST_REGISTER_VENDOR_ID: requestId, UPDATE_BY: actionBy }, mainNextStep, mainNextApprover))
        }
      }

      await runGprCPostCommitTasks(postCommitTasks, requestId)

      return response(true, 'GPR C step approved successfully', await getFlowByRequest(requestId), 'Approve GPR C Step')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to approve GPR C step', [], 'Approve GPR C Step Failed', 0)
    }
  },

  recheckStep: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Missing request_id')
      const actionBy = normalizeValue(dataItem.ACTION_BY || dataItem.UPDATE_BY)
      if (!actionBy) throw new Error('Missing action_by')
      const remark = normalizeValue(dataItem.REMARK || dataItem.ACTION_REMARK)
      if (!remark) throw new Error('Re-check remark is required')

      const flow = await getFlowByRequest(requestId)
      if (!flow) throw new Error('GPR C flow not found')
      const flowId = Number(getValue(flow, 'REQUEST_VENDOR_GPR_C_FLOWS_ID', 'gpr_c_flow_id'))
      const currentStep = await getCurrentStep(flowId)
      if (!currentStep) throw new Error('No GPR C step in progress')
      const currentStepCode = normalizeValue(getValue(currentStep, 'STEP_CODE', 'step_code')).toUpperCase()
      if (currentStepCode !== 'REQUESTER_APPROVER') {
        throw new Error('Re-check with PO PIC is available only for Requester Approver')
      }
      if (normalizeValue(getValue(currentStep, 'APPROVER_EMPCODE', 'approver_empcode')) !== actionBy) {
        throw new Error(`Unauthorized: current GPR C step requires ${getValue(currentStep, 'APPROVER_EMPCODE', 'approver_empcode')}`)
      }

      await markMainIssueGprCRecheckToPic(requestId, flowId, currentStep, actionBy, remark)
      await runGprCPostCommitTasks([() => notifyPoPicGprCRecheck(requestId, currentStep, remark)], requestId)

      return response(true, 'GPR C sent to PO PIC for re-check successfully', await getFlowByRequest(requestId), 'Re-check GPR C Step')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to re-check GPR C step', [], 'Re-check GPR C Step Failed', 0)
    }
  },

  rejectStep: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Missing request_id')
      const actionBy = normalizeValue(dataItem.ACTION_BY || dataItem.UPDATE_BY)
      if (!actionBy) throw new Error('Missing action_by')
      const flow = await getFlowByRequest(requestId)
      if (!flow) throw new Error('GPR C flow not found')
      const flowId = Number(getValue(flow, 'REQUEST_VENDOR_GPR_C_FLOWS_ID', 'gpr_c_flow_id'))
      const currentStep = await getCurrentStep(flowId)
      if (!currentStep) throw new Error('No GPR C step in progress')
      if (normalizeValue(currentStep.APPROVER_EMPCODE || currentStep.approver_empcode) !== actionBy) {
        throw new Error(`Unauthorized: current GPR C step requires ${currentStep.APPROVER_EMPCODE || currentStep.approver_empcode}`)
      }
      const remark = normalizeValue(dataItem.REMARK || dataItem.ACTION_REMARK)
      const statusIdentity = await getGprCStepStatusIdentity()
      await MySQLExecute.executeList([
        GprCApprovalSQL.updateStepAction({
          REQUEST_VENDOR_GPR_C_STEPS_ID: currentStep.REQUEST_VENDOR_GPR_C_STEPS_ID || currentStep.gpr_c_step_id,
          M_APPROVAL_STEP_STATUS_ID: statusIdentity.approvalStep.rejected,
          ACTION_BY: actionBy,
          ACTION_TYPE: 'REJECTED',
          ACTION_REMARK: remark,
          UPDATE_BY: actionBy,
        }),
        GprCApprovalSQL.skipPendingSteps({
          REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
          M_APPROVAL_STEP_SKIPPED_STATUS_ID: statusIdentity.approvalStep.skipped,
          M_APPROVAL_STEP_PENDING_STATUS_ID: statusIdentity.approvalStep.pending,
          UPDATE_BY: actionBy,
        }),
        GprCApprovalSQL.updateFlowStatus({
          REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
          M_GPR_C_FLOW_STATUS_ID: statusIdentity.gprCFlow.rejected,
          CURRENT_STEP_CODE: 'Finished',
          REJECTED_AT: 'NOW()',
          REJECTED_BY: actionBy,
          REJECTED_REMARK: remark,
          UPDATE_BY: actionBy,
        }),
      ])
      const rejectedStep = await markMainIssueGprCRejected(requestId, actionBy, remark)
      await runGprCPostCommitTasks(
        [
          () =>
            sendMail_ToPic_RequestRejected(
              {
                REQUEST_REGISTER_VENDOR_ID: requestId,
                APPROVER_REMARK: remark || 'GPR C sub-workflow rejected',
                APPROVE_BY: actionBy,
                UPDATE_BY: actionBy,
              },
              rejectedStep
            ),
        ],
        requestId
      )
      return response(true, 'GPR C step rejected and request cancelled', await getFlowByRequest(requestId), 'Reject GPR C Step')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to reject GPR C step', [], 'Reject GPR C Step Failed', 0)
    }
  },

  actionRequired: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Missing request_id')
      const actionBy = normalizeValue(dataItem.ACTION_BY || dataItem.UPDATE_BY)
      if (!actionBy) throw new Error('Missing action_by')
      const picEmail = normalizeEmail(dataItem.PIC_EMAIL)
      if (!picEmail) throw new Error('PIC email is required')

      const flow = await getFlowByRequest(requestId)
      if (!flow) throw new Error('GPR C flow not found')
      const flowId = Number(getValue(flow, 'REQUEST_VENDOR_GPR_C_FLOWS_ID', 'gpr_c_flow_id'))
      const currentStep = await getCurrentStep(flowId)
      if (!currentStep) throw new Error('No GPR C step in progress')
      const currentStepCode = normalizeValue(currentStep.STEP_CODE || currentStep.step_code)
      if (!isActionRequiredStep(currentStepCode)) {
        throw new Error('Action Required is available only for GPR C approval steps (Requester Approver through PM Manager Approver)')
      }
      if (normalizeValue(currentStep.APPROVER_EMPCODE || currentStep.approver_empcode) !== actionBy) {
        throw new Error(`Unauthorized: current GPR C step requires ${currentStep.APPROVER_EMPCODE || currentStep.approver_empcode}`)
      }
      const actionResult = await getActionResultStatusIdentity()

      const insertSql = GprCApprovalSQL.insertActionRequired({
        REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
        REQUEST_VENDOR_GPR_C_STEPS_ID: currentStep.REQUEST_VENDOR_GPR_C_STEPS_ID || currentStep.gpr_c_step_id,
        REQUEST_REGISTER_VENDOR_ID: requestId,
        STAGE_CODE: currentStepCode,
        STAGE_NAME: currentStep.STEP_NAME || currentStep.step_name,
        PIC_NAME: normalizeValue(dataItem.PIC_NAME),
        PIC_EMAIL: picEmail,
        REQUIRED_DETAIL: normalizeValue(dataItem.REQUIRED_DETAIL || dataItem.REMARK),
        M_ACTION_RESULT_STATUS_ID: actionResult.pending,
        CREATE_BY: actionBy,
        UPDATE_BY: actionBy,
      })
      const insertResult = (await MySQLExecute.execute(insertSql)) as ResultSetHeader
      const savedActionRows = (await MySQLExecute.search(
        GprCApprovalSQL.getActionRequiredById({ REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: insertResult.insertId })
      )) as RowDataPacket[]
      const actionRecord = savedActionRows[0] || {
        action_required_id: insertResult.insertId,
        pic_name: normalizeValue(dataItem.PIC_NAME),
        pic_email: picEmail,
        required_detail: normalizeValue(dataItem.REQUIRED_DETAIL || dataItem.REMARK),
      }
      await runGprCPostCommitTasks([() => notifyActionRequired(requestId, currentStep, actionRecord)], requestId)

      return response(true, 'Action Required sent successfully. GPR C step is still pending approval.', actionRecord, 'GPR C Action Required')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to send Action Required', [], 'GPR C Action Required Failed', 0)
    }
  },

  recordActionResult: async (dataItem: any) => {
    try {
      const actionRequiredId = Number(dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID)
      if (!actionRequiredId) throw new Error('Missing action_required_id')
      const updateBy = normalizeValue(dataItem.RESULT_BY || dataItem.UPDATE_BY)
      if (!updateBy) throw new Error('Missing result_by')
      const actionResultStatusId = Number(dataItem.M_ACTION_RESULT_STATUS_ID)
      if (!Number.isInteger(actionResultStatusId) || actionResultStatusId <= 0) {
        throw new Error('Invalid action result status ID')
      }
      const updateResult = (await MySQLExecute.execute(
        GprCApprovalSQL.updateActionRequiredResult({
          REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: actionRequiredId,
          M_ACTION_RESULT_STATUS_ID: actionResultStatusId,
          RESULT_REMARK: normalizeValue(dataItem.RESULT_REMARK),
          RESULT_BY: updateBy,
          UPDATE_BY: updateBy,
        })
      )) as ResultSetHeader
      if (!updateResult.affectedRows) {
        throw new Error('Action result status ID was not found or is inactive')
      }
      const sql = GprCApprovalSQL.getActionRequiredById({ REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: actionRequiredId })
      const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
      const record = rows[0] || {}
      // Email the recorded result back to the GPR C approver who raised the Action Required.
      const notifyRequestId = Number(getValue(record, 'REQUEST_REGISTER_VENDOR_ID', 'request_register_vendor_id'))
      await runGprCPostCommitTasks([() => notifyActionResultRecorded(record)], notifyRequestId)
      return response(true, 'Action Required result recorded', record, 'Record GPR C Action Result')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to record Action Required result', [], 'Record GPR C Action Result Failed', 0)
    }
  },

  notifyRequesterSetup,
}
