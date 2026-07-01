import { MySQLExecute } from '@businessData/dbExecute'
import { ResultSetHeader, RowDataPacket } from 'mysql2'
import sendEmail from '@src/config/sendEmail'
import { emailActionRequiredTemplate, emailGprCStepApprovalTemplate, emailGprCRequesterSetupTemplate, emailUserCheckerApproverGPRCTemplate } from '@src/config/mailTemplate'
import { GprCApprovalSQL } from '../../sql/_approval-GPRC/GprCApprovalSQL'
import { RequestRegisterPageSQL } from '../../sql/_request-register/RequestRegisterPageSQL'
import {
  GROUP_CODE,
  inferStepCode,
  mergeUniqueEmails,
  normalizeEmail,
  resolveRequestNumber,
  WORKFLOW_STEP_CODE,
} from '../_request-register/RegisterRequestWorkflowHelper'

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
  if (['PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER'].includes(stepCode)) return GROUP_CODE.PO_MGR
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

const isActionRequiredStep = (stepCode: string) => ['EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER', 'PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER'].includes(stepCode)

const GPR_C_STEP_DEFS = [
  { order: 1, code: 'REQUESTER_APPROVER', name: 'Requester Approver', source: 'REQUESTER_APPROVER' },
  { order: 2, code: 'EMR_CHECKER', name: 'EMR Checker', source: 'EMR_CHECKER' },
  { order: 3, code: 'EMR_APPROVER', name: 'EMR Approver', source: 'EMR_APPROVER' },
  { order: 4, code: 'QMS_CHECKER', name: 'QMS Checker', source: 'QMS_CHECKER' },
  { order: 5, code: 'QMS_APPROVER', name: 'QMS Approver', source: 'QMS_APPROVER' },
  { order: 6, code: 'PM_MANAGER_CHECKER', name: 'PM Manager Checker', source: GROUP_CODE.PO_MGR },
  { order: 7, code: 'PM_MANAGER_APPROVER', name: 'PM Manager Approver', source: GROUP_CODE.PO_MGR },
]

const response = (Status: boolean, Message: string, ResultOnDb: any, MethodOnDb: string, TotalCountOnDb = 1) => ({
  Status,
  Message,
  ResultOnDb,
  MethodOnDb,
  TotalCountOnDb: Status ? TotalCountOnDb : 0,
})

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
    empcode: normalizeValue(row.empcode),
    name: buildDisplayName(row) || normalizeValue(row.empName),
    email: normalizeEmail(row.empEmail),
    group_code: normalizeValue(row.group_code),
    group_name: normalizeValue(row.group_name),
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
      if (excludedEmp && normalizeValue(row.empcode) === excludedEmp) return ''
      const email = normalizeEmail(row.empEmail)
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
  const selectionId = await getSelectionId(requestId)
  const requesterEmpcode = normalizeValue(summary.Request_By_EmployeeCode || summary.REQUEST_BY_EMPLOYEECODE)
  const insertSql = GprCApprovalSQL.insertFlow({
    REQUEST_REGISTER_VENDOR_ID: requestId,
    REQUEST_VENDOR_SELECTIONS_ID: selectionId || '',
    FLOW_STATUS: 'requester_setup',
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

const resolveStepApprovers = async (requesterApprover: any) => {
  const requesterApproverProfile = await getMemberProfile(requesterApprover)
  const result = []

  for (const stepDef of GPR_C_STEP_DEFS) {
    const approver = stepDef.source === 'REQUESTER_APPROVER' ? requesterApproverProfile : await getAssigneeByGroup(stepDef.source)
    result.push({
      ...stepDef,
      approver,
    })
  }

  return result
}

const sendGprCEmail = async (payload: { templateName: string; toEmail: string; ccEmails?: string[]; subject: string; requestId: number; requestNumber: string; html: string }) => {
  const mailResult = await sendEmail(payload.html, payload.toEmail, payload.subject, payload.ccEmails || [], {
    templateName: payload.templateName,
    requestId: payload.requestId,
    requestNumber: payload.requestNumber,
    flow: 'GPR C',
  })
  if (!mailResult.success) {
    console.error('[GPR C MAIL][failed]', {
      templateName: payload.templateName,
      toEmail: payload.toEmail,
      ccCount: payload.ccEmails?.length || 0,
      subject: payload.subject,
      requestId: payload.requestId,
      requestNumber: payload.requestNumber,
      reason: mailResult.reason || 'sendEmail returned failed',
    })
    return
  }

  console.log('[GPR C MAIL][sent]', {
    templateName: payload.templateName,
    toEmail: payload.toEmail,
    ccCount: payload.ccEmails?.length || 0,
    subject: payload.subject,
    requestId: payload.requestId,
    requestNumber: payload.requestNumber,
  })
}

const buildBaseMailData = (summary: any, requestId: number, recipientName = 'Approver') => {
  const requestNumber = resolveRequestNumber(summary.request_number, requestId, summary.CREATE_DATE)
  return {
    requestNumber,
    recipientName,
    vendorName: summary.company_name || 'N/A',
    address: summary.address || 'N/A',
    contactPic: summary.contact_name || 'N/A',
    email: summary.vendor_email || summary.emailmain || 'N/A',
    tel: summary.tel_phone || 'N/A',
    supportProduct: summary.supportProduct_Process || 'N/A',
    purchaseFrequency: summary.purchase_frequency || 'N/A',
    systemLink: `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/approval-gpr-c`,
    picName: '',
    picTel: '',
  }
}

const notifyRequesterSetup = async (requestId: number, updateBy: string) => {
  const summary = await getRequestSummary(requestId)
  const requesterEmpcode = normalizeValue(summary.Request_By_EmployeeCode || summary.REQUEST_BY_EMPLOYEECODE)
  if (!requesterEmpcode) return
  const requester = await getRequesterProfile(requesterEmpcode)
  const mailData = buildBaseMailData(summary, requestId, requester.name)
  const poPicContext = await getPoPicMailContext(summary)
  const ccEmails = mergeUniqueEmails(poPicContext.allPoPicEmails).filter((email) => email !== requester.email)

  await sendGprCEmail({
    templateName: 'emailGprCRequesterSetupTemplate',
    toEmail: requester.email,
    ccEmails,
    subject: `[GPR C Setup] Please setup GPR C approver for ${mailData.requestNumber}`,
    requestId,
    requestNumber: mailData.requestNumber,
    html: emailGprCRequesterSetupTemplate({
      ...mailData,
      userName: requester.name,
      recipientName: requester.name,
      systemLink: `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-history`,
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
  const stepCode = normalizeValue(step.STEP_CODE || step.step_code)
  const requesterEmpcode = normalizeValue(summary.Request_By_EmployeeCode || summary.REQUEST_BY_EMPLOYEECODE)
  const requester = requesterEmpcode ? await getRequesterProfile(requesterEmpcode).catch(() => null) : null
  const poPicContext = await getPoPicMailContext(summary)
  const finalCcEmails = mergeUniqueEmails(poPicContext.allPoPicEmails, ...(stepCode === 'REQUESTER_APPROVER' ? [requester?.email ? [requester.email] : [], ccEmails] : [])).filter(
    (email) => email !== approverEmail
  )
  const templateName = stepCode === 'REQUESTER_APPROVER' ? 'emailUserCheckerApproverGPRCTemplate' : 'emailGprCStepApprovalTemplate'
  const emailHtml =
    stepCode === 'REQUESTER_APPROVER'
      ? emailUserCheckerApproverGPRCTemplate({
          ...mailData,
          userName: approverName,
          recipientName: approverName,
          picName: poPicContext.picName,
        })
      : emailGprCStepApprovalTemplate({
          ...mailData,
          picNextStepName: approverName,
          recipientName: approverName,
          picName: poPicContext.picName,
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
    templateName: 'emailActionRequiredTemplate',
    toEmail: picEmail,
    ccEmails: [],
    subject: `[GPR C Action Required] ${mailData.requestNumber} - ${step.STEP_NAME || step.step_name}`,
    requestId,
    requestNumber: mailData.requestNumber,
    html: emailActionRequiredTemplate({
      ...mailData,
      stageLabel: step.STEP_NAME || step.step_name,
      note: action.required_detail || action.REQUIRED_DETAIL || '',
      picName: 'GPR C Workflow',
    }),
  })
}

const markMainIssueGprCApproved = async (requestId: number, actionBy: string, remark: string) => {
  const stepsSql = await GprCApprovalSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: requestId })
  const steps = ((await MySQLExecute.search(stepsSql)) as RowDataPacket[]).map(normalizeMainApprovalStep)
  const currentStep = steps.find((step: any) => String(step.step_status || '').toLowerCase() === 'in_progress')
  if (!currentStep) return

  if (inferStepCode(currentStep) !== WORKFLOW_STEP_CODE.ISSUE_GPR_C) return

  const pendingSteps = steps
    .filter((step: any) => String(step.step_status || '').toLowerCase() === 'pending' && Number(step.step_order) > Number(currentStep.step_order))
    .sort((a: any, b: any) => Number(a.step_order || 0) - Number(b.step_order || 0))
  const nextStep =
    pendingSteps.find((step: any) => inferStepCode(step) === WORKFLOW_STEP_CODE.DOC_CHECK) ||
    pendingSteps.find((step: any) => inferStepCode(step) === WORKFLOW_STEP_CODE.AGREEMENT_REACHED) ||
    pendingSteps[0]

  const sqlList = [
    await GprCApprovalSQL.updateApprovalStep({
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      STEP_STATUS: 'approved',
      UPDATE_BY: actionBy || 'SYSTEM',
    }),
    await GprCApprovalSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: requestId,
      REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
      ACTION_BY: actionBy || 'SYSTEM',
      ACTION_TYPE: 'approved',
      REMARK: remark || 'GPR C sub-workflow approved',
    }),
  ]

  if (nextStep) {
    sqlList.push(
      await GprCApprovalSQL.updateApprovalStep({
        REQUEST_APPROVAL_STEP_ID: nextStep.step_id,
        STEP_STATUS: 'in_progress',
        UPDATE_BY: actionBy || 'SYSTEM',
      })
    )
    sqlList.push(
      await GprCApprovalSQL.updateStatus({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        REQUEST_STATUS: nextStep.DESCRIPTION || 'PO & SCM Check All Document',
        APPROVE_BY: actionBy || '',
        APPROVE_DATE: '',
        APPROVER_REMARK: remark || '',
        UPDATE_BY: actionBy || 'SYSTEM',
      })
    )
  } else {
    sqlList.push(
      await GprCApprovalSQL.markRequestCompleted({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        UPDATE_BY: actionBy || 'SYSTEM',
      })
    )
  }

  await MySQLExecute.executeList(sqlList)
}

const markMainIssueGprCRejected = async (requestId: number, actionBy: string, remark: string) => {
  const stepsSql = await GprCApprovalSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: requestId })
  const steps = ((await MySQLExecute.search(stepsSql)) as RowDataPacket[]).map(normalizeMainApprovalStep)
  const currentStep = steps.find((step: any) => String(step.step_status || '').toLowerCase() === 'in_progress')
  const contextSql = await GprCApprovalSQL.getRequestStatusContext({ REQUEST_REGISTER_VENDOR_ID: requestId })
  const contextRows = (await MySQLExecute.search(contextSql)) as RowDataPacket[]
  const vendorId = getValue(contextRows[0], 'vendor_id', 'VENDORS_ID')

  const sqlList = [
    await GprCApprovalSQL.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: requestId,
      REQUEST_STATUS: 'Rejected',
      APPROVE_BY: actionBy || '',
      APPROVE_DATE: 'NOW()',
      APPROVER_REMARK: remark || '',
      UPDATE_BY: actionBy || 'SYSTEM',
    }),
  ]

  if (vendorId) {
    sqlList.push(await GprCApprovalSQL.updateVendorFftStatus({ VENDORS_ID: vendorId, FFT_STATUS: 2 }))
  }

  if (currentStep) {
    sqlList.push(
      await GprCApprovalSQL.updateApprovalStep({
        REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
        STEP_STATUS: 'rejected',
        UPDATE_BY: actionBy || 'SYSTEM',
      })
    )
    sqlList.push(
      await GprCApprovalSQL.createApprovalLog({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        REQUEST_APPROVAL_STEP_ID: currentStep.step_id,
        ACTION_BY: actionBy || 'SYSTEM',
        ACTION_TYPE: 'rejected',
        REMARK: remark || 'GPR C sub-workflow rejected',
      })
    )
  }

  for (const step of steps.filter((item: any) => String(item.step_status || '').toLowerCase() === 'pending')) {
    sqlList.push(
      await GprCApprovalSQL.updateApprovalStep({
        REQUEST_APPROVAL_STEP_ID: step.step_id,
        STEP_STATUS: 'skipped',
        UPDATE_BY: actionBy || 'SYSTEM',
      })
    )
  }

  await MySQLExecute.executeList(sqlList)
}

export const GprCApprovalService = {
  createOrGetFlow: async (dataItem: any) => {
    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID)
      if (!requestId) throw new Error('Missing request_id')
      const existingFlow = await getFlowByRequest(requestId)
      const flow = existingFlow || (await ensureFlow(requestId, normalizeValue(dataItem.UPDATE_BY) || 'SYSTEM'))
      if (!existingFlow) {
        await notifyRequesterSetup(requestId, normalizeValue(dataItem.UPDATE_BY) || 'SYSTEM').catch(console.error)
      }
      const flowId = Number(getValue(flow, 'REQUEST_VENDOR_GPR_C_FLOWS_ID', 'gpr_c_flow_id'))
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
      if (!step) throw new Error('GPR C step not found')
      if (Number(step.REQUEST_REGISTER_VENDOR_ID || step.request_id) !== requestId) throw new Error('GPR C step does not belong to this request')
      if (normalizeValue(step.STEP_STATUS || step.step_status).toUpperCase() !== 'IN_PROGRESS') {
        throw new Error('Only in-progress GPR C step can be reassigned')
      }

      const expectedGroupCode = resolveManagedGroupForGprCStep(step.STEP_CODE || step.step_code)
      if (!expectedGroupCode) throw new Error('This GPR C step is not managed by assignees_to')

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
      const approverEmpcode = normalizeValue(gprCData.gpr_c_approver_empcode)
      if (!approverEmpcode) throw new Error('GPR C approver empcode is required')

      const stepApprovers = await resolveStepApprovers(approverEmpcode)
      const circularMembers = await buildCircularMembers(gprCData.gpr_c_circular_empcodes || [])
      const pcPicEmpcode = normalizeValue(gprCData.gpr_c_pc_pic_empcode)
      const pcPicProfile = pcPicEmpcode ? await getMemberProfile(pcPicEmpcode) : null
      const pcPicName = normalizeValue(pcPicProfile?.name || gprCData.gpr_c_pc_pic_name)
      const pcPicEmail = normalizeEmail(pcPicProfile?.email || gprCData.gpr_c_pc_pic_email)
      const ccEmails = mergeUniqueEmails(
        pcPicEmail ? [pcPicEmail] : [],
        circularMembers.map((item) => item.email)
      )

      const sqlList = [
        GprCApprovalSQL.updateFlowSetup({
          REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
          REQUEST_REGISTER_VENDOR_ID: requestId,
          REQUEST_VENDOR_SELECTIONS_ID: selectionId || '',
          FLOW_STATUS: 'in_progress',
          CURRENT_STEP_CODE: 'REQUESTER_APPROVER',
          REQUESTER_EMPCODE: requesterEmpcode,
          REQUESTER_SUBMITTED_AT: 'NOW()',
          GPR_C_APPROVER_EMPCODE: stepApprovers[0].approver.empcode,
          GPR_C_APPROVER_NAME: stepApprovers[0].approver.name,
          GPR_C_APPROVER_EMAIL: stepApprovers[0].approver.email,
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
          RequestRegisterPageSQL.deleteGprCircularMembers({
            REQUEST_VENDOR_SELECTIONS_ID: selectionId,
            UPDATE_BY: updateBy,
          })
        )

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
            STEP_STATUS: step.order === 1 ? 'in_progress' : 'pending',
            CREATE_BY: updateBy,
            UPDATE_BY: updateBy,
          })
        )
      }

      await MySQLExecute.executeList(sqlList)
      const updatedFlow = await getFlowByRequest(requestId)
      const steps = await getStepsByFlow(flowId)
      const firstStep = steps.find((step: any) => Number(step.STEP_ORDER || step.step_order) === 1)
      if (firstStep) await notifyStepApprover(requestId, firstStep, ccEmails).catch(console.error)

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
      const sqlList = [
        GprCApprovalSQL.updateStepAction({
          REQUEST_VENDOR_GPR_C_STEPS_ID: currentStep.REQUEST_VENDOR_GPR_C_STEPS_ID || currentStep.gpr_c_step_id,
          STEP_STATUS: 'approved',
          ACTION_BY: actionBy,
          ACTION_TYPE: actionType,
          ACTION_REMARK: remark,
          UPDATE_BY: actionBy,
        }),
      ]

      if (nextStep) {
        sqlList.push(
          GprCApprovalSQL.activateStep({
            REQUEST_VENDOR_GPR_C_STEPS_ID: nextStep.REQUEST_VENDOR_GPR_C_STEPS_ID || nextStep.gpr_c_step_id,
            UPDATE_BY: actionBy,
          })
        )
        sqlList.push(
          GprCApprovalSQL.updateFlowStatus({
            REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
            FLOW_STATUS: 'in_progress',
            CURRENT_STEP_CODE: nextStep.STEP_CODE || nextStep.step_code,
            UPDATE_BY: actionBy,
          })
        )
        await MySQLExecute.executeList(sqlList)
        await notifyStepApprover(requestId, nextStep).catch(console.error)
      } else {
        sqlList.push(
          GprCApprovalSQL.updateFlowStatus({
            REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
            FLOW_STATUS: 'approved',
            CURRENT_STEP_CODE: null as any,
            COMPLETED_AT: 'NOW()',
            UPDATE_BY: actionBy,
          })
        )
        await MySQLExecute.executeList(sqlList)
        await markMainIssueGprCApproved(requestId, actionBy, remark)
      }

      return response(true, 'GPR C step approved successfully', await getFlowByRequest(requestId), 'Approve GPR C Step')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to approve GPR C step', [], 'Approve GPR C Step Failed', 0)
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
      await MySQLExecute.executeList([
        GprCApprovalSQL.updateStepAction({
          REQUEST_VENDOR_GPR_C_STEPS_ID: currentStep.REQUEST_VENDOR_GPR_C_STEPS_ID || currentStep.gpr_c_step_id,
          STEP_STATUS: 'rejected',
          ACTION_BY: actionBy,
          ACTION_TYPE: 'REJECTED',
          ACTION_REMARK: remark,
          UPDATE_BY: actionBy,
        }),
        GprCApprovalSQL.skipPendingSteps({
          REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
          UPDATE_BY: actionBy,
        }),
        GprCApprovalSQL.updateFlowStatus({
          REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
          FLOW_STATUS: 'rejected',
          CURRENT_STEP_CODE: null as any,
          REJECTED_AT: 'NOW()',
          REJECTED_BY: actionBy,
          REJECTED_REMARK: remark,
          UPDATE_BY: actionBy,
        }),
      ])
      await markMainIssueGprCRejected(requestId, actionBy, remark)
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
        throw new Error('Action Required is available only for EMR/QMS/PM Manager GPR C steps')
      }
      if (normalizeValue(currentStep.APPROVER_EMPCODE || currentStep.approver_empcode) !== actionBy) {
        throw new Error(`Unauthorized: current GPR C step requires ${currentStep.APPROVER_EMPCODE || currentStep.approver_empcode}`)
      }

      const insertSql = GprCApprovalSQL.insertActionRequired({
        REQUEST_VENDOR_GPR_C_FLOWS_ID: flowId,
        REQUEST_VENDOR_GPR_C_STEPS_ID: currentStep.REQUEST_VENDOR_GPR_C_STEPS_ID || currentStep.gpr_c_step_id,
        REQUEST_REGISTER_VENDOR_ID: requestId,
        STAGE_CODE: currentStepCode,
        STAGE_NAME: currentStep.STEP_NAME || currentStep.step_name,
        PIC_NAME: normalizeValue(dataItem.PIC_NAME),
        PIC_EMAIL: picEmail,
        REQUIRED_DETAIL: normalizeValue(dataItem.REQUIRED_DETAIL || dataItem.REMARK),
        RESULT_STATUS: 'pending',
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
      await notifyActionRequired(requestId, currentStep, actionRecord).catch(console.error)

      await GprCApprovalService.approveStep({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        ACTION_BY: actionBy,
        ACTION_TYPE: 'ACTION_REQUIRED',
        ACTION_REMARK: `Action Required: ${actionRecord.REQUIRED_DETAIL || actionRecord.required_detail || ''}`,
      })

      return response(true, 'Action Required sent and GPR C flow continued', actionRecord, 'GPR C Action Required')
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
      const status = normalizeValue(dataItem.RESULT_STATUS || 'completed').toLowerCase()
      await MySQLExecute.execute(
        GprCApprovalSQL.updateActionRequiredResult({
          REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: actionRequiredId,
          RESULT_STATUS: status,
          RESULT_REMARK: normalizeValue(dataItem.RESULT_REMARK),
          RESULT_BY: updateBy,
          UPDATE_BY: updateBy,
        })
      )
      const sql = GprCApprovalSQL.getActionRequiredById({ REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: actionRequiredId })
      const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
      return response(true, 'Action Required result recorded', rows[0] || {}, 'Record GPR C Action Result')
    } catch (error: any) {
      return response(false, error?.message || 'Failed to record Action Required result', [], 'Record GPR C Action Result Failed', 0)
    }
  },

  notifyRequesterSetup,
}
