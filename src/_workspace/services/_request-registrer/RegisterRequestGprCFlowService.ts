import { MySQLExecute } from '@businessData/dbExecute'
import { ResultSetHeader, RowDataPacket } from 'mysql2'
import sendEmail from '@src/config/sendEmail'
import {
    emailActionRequiredTemplate,
    emailToPMMgrTemplate,
} from '@src/config/mailTemplate'
import { RegisterRequestSQL } from '../../sql/_request-registrer/RegisterRequestSQL'
import { RegisterRequestGprCFlowSQL } from '../../sql/_request-registrer/RegisterRequestGprCFlowSQL'
import {
    GROUP_CODE,
    mergeUniqueEmails,
    normalizeEmail,
    resolveRequestNumber,
} from './RegisterRequestWorkflowHelper'

const normalizeValue = (value: any) => String(value || '').trim()

const getValue = (row: any, ...keys: string[]) => {
    for (const key of keys) {
        if (row && row[key] !== undefined && row[key] !== null) return row[key]
    }
    return ''
}

const parseJsonArray = (raw: any): any[] => {
    if (!raw) return []
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const normalizeGroupToken = (value: string) =>
    normalizeValue(value)
        .toUpperCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[().]+/g, '')

const compactGroupToken = (value: string) =>
    normalizeValue(value)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')

const buildDisplayName = (row: any) =>
    [normalizeValue(row?.empName), normalizeValue(row?.empSurname)]
        .filter(Boolean)
        .join(' ')

const mapMember = (empcode: string, row: any) => ({
    empcode: normalizeValue(empcode),
    name: buildDisplayName(row) || normalizeValue(row?.empName) || normalizeValue(empcode),
    email: normalizeEmail(row?.empEmail),
})

const isActionRequiredStep = (stepCode: string) =>
    ['EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER', 'PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER'].includes(stepCode)

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

const getEmployeeProfile = async (empcodeRaw: any) => {
    const empcode = normalizeValue(empcodeRaw)
    if (!empcode) throw new Error('Missing employee code')

    const sql = await RegisterRequestSQL.getMemberByEmpCode({ empcode })
    const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
    const row = rows[0]
    if (!row) throw new Error(`Employee code not found: ${empcode}`)

    const profile = mapMember(empcode, row)
    if (!profile.email) throw new Error(`Employee code has no email: ${empcode}`)
    return profile
}

const getAssigneeByGroup = async (groupCode: string) => {
    const targetGroup = normalizeGroupToken(groupCode)
    const targetCompact = compactGroupToken(groupCode)
    const sql = await RegisterRequestSQL.getPeerCcRowsByNormalizedGroup({
        target_group: targetGroup,
        target_compact: targetCompact,
    })
    const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
    const row = rows[0]
    if (!row) throw new Error(`No active assignee found for group ${groupCode}`)

    return {
        empcode: normalizeValue(row.empcode),
        name: normalizeValue(row.empName) || normalizeValue(row.empcode),
        email: normalizeEmail(row.empEmail),
        group_code: normalizeValue(row.group_code),
        group_name: normalizeValue(row.group_name),
    }
}

const getSelectionId = async (requestId: number) => {
    const sql = RegisterRequestGprCFlowSQL.getSelectionIdByRequest({ request_id: requestId })
    const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return Number(rows[0]?.selection_id || rows[0]?.SELECTION_ID || 0) || null
}

const getRequestSummary = async (requestId: number) => {
    const sql = RegisterRequestGprCFlowSQL.getRequestSummary({ request_id: requestId })
    const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return rows[0] || {}
}

const getFlowByRequest = async (requestId: number) => {
    const sql = RegisterRequestGprCFlowSQL.getFlowByRequestId({ request_id: requestId })
    const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return rows[0] || null
}

const getStepsByFlow = async (flowId: number) => {
    const sql = RegisterRequestGprCFlowSQL.getStepsByFlow({ gpr_c_flow_id: flowId })
    return (await MySQLExecute.search(sql)) as RowDataPacket[]
}

const getCurrentStep = async (flowId: number) => {
    const sql = RegisterRequestGprCFlowSQL.getCurrentStepByFlow({ gpr_c_flow_id: flowId })
    const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return rows[0] || null
}

const ensureFlow = async (requestId: number, updateBy: string) => {
    const existing = await getFlowByRequest(requestId)
    if (existing) return existing

    const summary = await getRequestSummary(requestId)
    const selectionId = await getSelectionId(requestId)
    const requesterEmpcode = normalizeValue(summary.Request_By_EmployeeCode || summary.REQUEST_BY_EMPLOYEECODE)
    const insertSql = RegisterRequestGprCFlowSQL.insertFlow({
        request_id: requestId,
        selection_id: selectionId || '',
        flow_status: 'REQUESTER_SETUP',
        current_step_code: 'REQUESTER_SETUP',
        requester_empcode: requesterEmpcode,
        CREATE_BY: updateBy,
        UPDATE_BY: updateBy,
    })
    const result = (await MySQLExecute.execute(insertSql)) as ResultSetHeader
    const flow = await getFlowByRequest(requestId)
    return flow || { GPR_C_FLOW_ID: result.insertId, REQUEST_ID: requestId }
}

const buildCircularMembers = async (empcodesRaw: any[]) => {
    const empcodes = (Array.isArray(empcodesRaw) ? empcodesRaw : [])
        .map(normalizeValue)
        .filter(Boolean)
        .slice(0, 6)

    const members = []
    for (const empcode of empcodes) {
        members.push(await getEmployeeProfile(empcode))
    }
    return members
}

const resolveStepApprovers = async (requesterApprover: any) => {
    const requesterApproverProfile = await getEmployeeProfile(requesterApprover)
    const result = []

    for (const stepDef of GPR_C_STEP_DEFS) {
        const approver = stepDef.source === 'REQUESTER_APPROVER'
            ? requesterApproverProfile
            : await getAssigneeByGroup(stepDef.source)
        result.push({
            ...stepDef,
            approver,
        })
    }

    return result
}

const sendGprCEmail = async (payload: {
    templateName: string
    toEmail: string
    ccEmails?: string[]
    subject: string
    requestId: number
    requestNumber: string
    html: string
}) => {
    await sendEmail(payload.html, payload.toEmail, payload.subject, payload.ccEmails || [])
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
    const requester = await getEmployeeProfile(requesterEmpcode)
    const mailData = buildBaseMailData(summary, requestId, requester.name)

    await sendGprCEmail({
        templateName: 'emailToPMMgrTemplate',
        toEmail: requester.email,
        ccEmails: [],
        subject: `[GPR C Setup] Please setup GPR C approver for ${mailData.requestNumber}`,
        requestId,
        requestNumber: mailData.requestNumber,
        html: emailToPMMgrTemplate({
            ...mailData,
            recipientName: requester.name,
            systemLink: `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-history`,
            picName: updateBy,
        }),
    })
}

const notifyStepApprover = async (requestId: number, step: any, ccEmails: string[] = []) => {
    const summary = await getRequestSummary(requestId)
    const approverName = normalizeValue(step.APPROVER_NAME || step.approver_name) || 'Approver'
    const approverEmail = normalizeEmail(step.APPROVER_EMAIL || step.approver_email)
    if (!approverEmail) return
    const mailData = buildBaseMailData(summary, requestId, approverName)

    await sendGprCEmail({
        templateName: 'emailToPMMgrTemplate',
        toEmail: approverEmail,
        ccEmails,
        subject: `[GPR C Approval] ${mailData.requestNumber} - ${step.STEP_NAME || step.step_name}`,
        requestId,
        requestNumber: mailData.requestNumber,
        html: emailToPMMgrTemplate({
            ...mailData,
            recipientName: approverName,
            picName: 'GPR C Workflow',
        }),
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
    const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: requestId })
    const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
    const currentStep = steps.find((step: any) => String(step.step_status || '').toLowerCase() === 'in_progress')
    if (!currentStep) return

    const currentDesc = normalizeValue(currentStep.DESCRIPTION).toLowerCase()
    if (!currentDesc.includes('issue gpr c')) return

    const pendingSteps = steps
        .filter((step: any) => String(step.step_status || '').toLowerCase() === 'pending' && Number(step.step_order) > Number(currentStep.step_order))
        .sort((a: any, b: any) => Number(a.step_order || 0) - Number(b.step_order || 0))
    const nextStep =
        pendingSteps.find((step: any) => normalizeValue(step.DESCRIPTION).toLowerCase().includes('agreement reached'))
        || pendingSteps.find((step: any) => normalizeValue(step.DESCRIPTION).toLowerCase().includes('checker'))
        || pendingSteps[0]

    const sqlList = [
        await RegisterRequestSQL.updateApprovalStep({
            step_id: currentStep.step_id,
            step_status: 'approved',
            UPDATE_BY: actionBy || 'SYSTEM',
        }),
        await RegisterRequestSQL.createApprovalLog({
            request_id: requestId,
            step_id: currentStep.step_id,
            action_by: actionBy || 'SYSTEM',
            action_type: 'approved',
            remark: remark || 'GPR C sub-workflow approved',
        }),
    ]

    if (nextStep) {
        sqlList.push(await RegisterRequestSQL.updateApprovalStep({
            step_id: nextStep.step_id,
            step_status: 'in_progress',
            UPDATE_BY: actionBy || 'SYSTEM',
        }))
        sqlList.push(await RegisterRequestSQL.updateStatus({
            request_id: requestId,
            request_status: nextStep.DESCRIPTION || 'Agreement Reached',
            approve_by: actionBy || '',
            approve_date: '',
            approver_remark: remark || '',
            UPDATE_BY: actionBy || 'SYSTEM',
        }))
    } else {
        sqlList.push(await RegisterRequestSQL.markRequestCompleted({
            request_id: requestId,
            UPDATE_BY: actionBy || 'SYSTEM',
        }))
    }

    await MySQLExecute.executeList(sqlList)
}

const markMainIssueGprCRejected = async (requestId: number, actionBy: string, remark: string) => {
    const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: requestId })
    const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
    const currentStep = steps.find((step: any) => String(step.step_status || '').toLowerCase() === 'in_progress')
    const contextSql = await RegisterRequestSQL.getRequestStatusContext({ request_id: requestId })
    const contextRows = (await MySQLExecute.search(contextSql)) as RowDataPacket[]
    const vendorId = contextRows[0]?.vendor_id

    const sqlList = [
        await RegisterRequestSQL.updateStatus({
            request_id: requestId,
            request_status: 'Rejected',
            approve_by: actionBy || '',
            approve_date: 'NOW()',
            approver_remark: remark || '',
            UPDATE_BY: actionBy || 'SYSTEM',
        }),
    ]

    if (vendorId) {
        sqlList.push(await RegisterRequestSQL.updateVendorFftStatus({ vendor_id: vendorId, fft_status: 2 }))
    }

    if (currentStep) {
        sqlList.push(await RegisterRequestSQL.updateApprovalStep({
            step_id: currentStep.step_id,
            step_status: 'rejected',
            UPDATE_BY: actionBy || 'SYSTEM',
        }))
        sqlList.push(await RegisterRequestSQL.createApprovalLog({
            request_id: requestId,
            step_id: currentStep.step_id,
            action_by: actionBy || 'SYSTEM',
            action_type: 'rejected',
            remark: remark || 'GPR C sub-workflow rejected',
        }))
    }

    for (const step of steps.filter((item: any) => String(item.step_status || '').toLowerCase() === 'pending')) {
        sqlList.push(await RegisterRequestSQL.updateApprovalStep({
            step_id: step.step_id,
            step_status: 'skipped',
            UPDATE_BY: actionBy || 'SYSTEM',
        }))
    }

    await MySQLExecute.executeList(sqlList)
}

export const RegisterRequestGprCFlowService = {
    createOrGetFlow: async (dataItem: any) => {
        try {
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Missing request_id')
            const existingFlow = await getFlowByRequest(requestId)
            const flow = existingFlow || await ensureFlow(requestId, normalizeValue(dataItem.UPDATE_BY) || 'SYSTEM')
            if (!existingFlow) {
                await notifyRequesterSetup(requestId, normalizeValue(dataItem.UPDATE_BY) || 'SYSTEM').catch(console.error)
            }
            const flowId = Number(getValue(flow, 'GPR_C_FLOW_ID', 'gpr_c_flow_id'))
            const steps = flowId ? await getStepsByFlow(flowId) : []
            return response(true, 'GPR C flow ready', { flow, steps }, 'GPR C Flow')
        } catch (error: any) {
            return response(false, error?.message || 'Failed to create GPR C flow', [], 'GPR C Flow Failed', 0)
        }
    },

    getFlow: async (dataItem: any) => {
        try {
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Missing request_id')
            const flow = await getFlowByRequest(requestId)
            if (!flow) return response(true, 'No GPR C flow found', { flow: null, steps: [], action_required: [] }, 'Get GPR C Flow', 0)
            const flowId = Number(getValue(flow, 'GPR_C_FLOW_ID', 'gpr_c_flow_id'))
            const steps = await getStepsByFlow(flowId)
            return response(true, 'GPR C flow loaded', { flow, steps }, 'Get GPR C Flow')
        } catch (error: any) {
            return response(false, error?.message || 'Failed to get GPR C flow', [], 'Get GPR C Flow Failed', 0)
        }
    },

    getQueue: async (dataItem: any) => {
        try {
            const approverEmpcode = normalizeValue(dataItem.approver_empcode || dataItem.approver_id)
            if (!approverEmpcode) throw new Error('Missing approver_empcode')
            const sql = RegisterRequestGprCFlowSQL.getQueueByApprover({ approver_empcode: approverEmpcode })
            const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
            return response(true, 'GPR C queue loaded', rows, 'Get GPR C Queue', rows.length)
        } catch (error: any) {
            return response(false, error?.message || 'Failed to get GPR C queue', [], 'Get GPR C Queue Failed', 0)
        }
    },

    getActionRequiredQueue: async (dataItem: any) => {
        try {
            const picEmail = normalizeEmail(dataItem.pic_email)
            if (!picEmail) throw new Error('Missing pic_email')
            const sql = RegisterRequestGprCFlowSQL.getActionRequiredQueueByPicEmail({ pic_email: picEmail })
            const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
            return response(true, 'GPR C Action Required queue loaded', rows, 'Get GPR C Action Required Queue', rows.length)
        } catch (error: any) {
            return response(false, error?.message || 'Failed to get GPR C Action Required queue', [], 'Get GPR C Action Required Queue Failed', 0)
        }
    },

    submitSetup: async (dataItem: any) => {
        try {
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Missing request_id')
            const updateBy = normalizeValue(dataItem.UPDATE_BY) || 'SYSTEM'
            const gprCData = typeof dataItem.gpr_c_data === 'string' ? JSON.parse(dataItem.gpr_c_data) : (dataItem.gpr_c_data || {})

            const summary = await getRequestSummary(requestId)
            const requesterEmpcode = normalizeValue(summary.Request_By_EmployeeCode || summary.REQUEST_BY_EMPLOYEECODE)
            if (requesterEmpcode && updateBy !== requesterEmpcode) {
                throw new Error('Only requester can submit GPR C setup')
            }

            const flow = await ensureFlow(requestId, updateBy)
            const flowId = Number(getValue(flow, 'GPR_C_FLOW_ID', 'gpr_c_flow_id'))
            const selectionId = await getSelectionId(requestId)
            const approverEmpcode = normalizeValue(gprCData.gpr_c_approver_empcode)
            if (!approverEmpcode) throw new Error('GPR C approver empcode is required')

            const stepApprovers = await resolveStepApprovers(approverEmpcode)
            const circularMembers = await buildCircularMembers(gprCData.gpr_c_circular_empcodes || [])
            const pcPicName = normalizeValue(gprCData.gpr_c_pc_pic_name)
            const pcPicEmail = normalizeEmail(gprCData.gpr_c_pc_pic_email)
            const ccEmails = mergeUniqueEmails(
                pcPicEmail ? [pcPicEmail] : [],
                circularMembers.map(item => item.email)
            )

            const sqlList = [
                RegisterRequestGprCFlowSQL.updateFlowSetup({
                    gpr_c_flow_id: flowId,
                    request_id: requestId,
                    selection_id: selectionId || '',
                    flow_status: 'IN_PROGRESS',
                    current_step_code: 'REQUESTER_APPROVER',
                    requester_empcode: requesterEmpcode,
                    requester_submitted_at: 'NOW()',
                    gpr_c_approver_empcode: stepApprovers[0].approver.empcode,
                    gpr_c_approver_name: stepApprovers[0].approver.name,
                    gpr_c_approver_email: stepApprovers[0].approver.email,
                    pc_pic_name: pcPicName,
                    pc_pic_email: pcPicEmail,
                    circular_json: JSON.stringify(circularMembers),
                    UPDATE_BY: updateBy,
                }),
                RegisterRequestGprCFlowSQL.deactivateStepsByFlow({
                    gpr_c_flow_id: flowId,
                    UPDATE_BY: updateBy,
                }),
            ]

            for (const step of stepApprovers) {
                sqlList.push(RegisterRequestGprCFlowSQL.insertStep({
                    gpr_c_flow_id: flowId,
                    request_id: requestId,
                    step_order: step.order,
                    step_code: step.code,
                    step_name: step.name,
                    approver_empcode: step.approver.empcode,
                    approver_name: step.approver.name,
                    approver_email: step.approver.email,
                    step_status: step.order === 1 ? 'IN_PROGRESS' : 'PENDING',
                    CREATE_BY: updateBy,
                    UPDATE_BY: updateBy,
                }))
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
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Missing request_id')
            const actionBy = normalizeValue(dataItem.action_by || dataItem.UPDATE_BY)
            if (!actionBy) throw new Error('Missing action_by')

            const flow = await getFlowByRequest(requestId)
            if (!flow) throw new Error('GPR C flow not found')
            const flowId = Number(getValue(flow, 'GPR_C_FLOW_ID', 'gpr_c_flow_id'))
            const currentStep = await getCurrentStep(flowId)
            if (!currentStep) throw new Error('No GPR C step in progress')
            if (normalizeValue(currentStep.APPROVER_EMPCODE || currentStep.approver_empcode) !== actionBy) {
                throw new Error(`Unauthorized: current GPR C step requires ${currentStep.APPROVER_EMPCODE || currentStep.approver_empcode}`)
            }

            const steps = await getStepsByFlow(flowId)
            const currentOrder = Number(currentStep.STEP_ORDER || currentStep.step_order)
            const nextStep = steps.find((step: any) => Number(step.STEP_ORDER || step.step_order) === currentOrder + 1)
            const remark = normalizeValue(dataItem.remark || dataItem.action_remark)
            const actionType = normalizeValue(dataItem.action_type || 'APPROVED').toUpperCase()
            const sqlList = [
                RegisterRequestGprCFlowSQL.updateStepAction({
                    gpr_c_step_id: currentStep.GPR_C_STEP_ID || currentStep.gpr_c_step_id,
                    step_status: 'APPROVED',
                    action_by: actionBy,
                    action_type: actionType,
                    action_remark: remark,
                    UPDATE_BY: actionBy,
                }),
            ]

            if (nextStep) {
                sqlList.push(RegisterRequestGprCFlowSQL.activateStep({
                    gpr_c_step_id: nextStep.GPR_C_STEP_ID || nextStep.gpr_c_step_id,
                    UPDATE_BY: actionBy,
                }))
                sqlList.push(RegisterRequestGprCFlowSQL.updateFlowStatus({
                    gpr_c_flow_id: flowId,
                    flow_status: 'IN_PROGRESS',
                    current_step_code: nextStep.STEP_CODE || nextStep.step_code,
                    UPDATE_BY: actionBy,
                }))
                await MySQLExecute.executeList(sqlList)
                await notifyStepApprover(requestId, nextStep, parseJsonArray(flow.CIRCULAR_JSON || flow.circular_json).map(item => item.email)).catch(console.error)
            } else {
                sqlList.push(RegisterRequestGprCFlowSQL.updateFlowStatus({
                    gpr_c_flow_id: flowId,
                    flow_status: 'APPROVED',
                    current_step_code: null as any,
                    completed_at: 'NOW()',
                    UPDATE_BY: actionBy,
                }))
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
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Missing request_id')
            const actionBy = normalizeValue(dataItem.action_by || dataItem.UPDATE_BY)
            if (!actionBy) throw new Error('Missing action_by')
            const flow = await getFlowByRequest(requestId)
            if (!flow) throw new Error('GPR C flow not found')
            const flowId = Number(getValue(flow, 'GPR_C_FLOW_ID', 'gpr_c_flow_id'))
            const currentStep = await getCurrentStep(flowId)
            if (!currentStep) throw new Error('No GPR C step in progress')
            if (normalizeValue(currentStep.APPROVER_EMPCODE || currentStep.approver_empcode) !== actionBy) {
                throw new Error(`Unauthorized: current GPR C step requires ${currentStep.APPROVER_EMPCODE || currentStep.approver_empcode}`)
            }
            const remark = normalizeValue(dataItem.remark || dataItem.action_remark)
            await MySQLExecute.executeList([
                RegisterRequestGprCFlowSQL.updateStepAction({
                    gpr_c_step_id: currentStep.GPR_C_STEP_ID || currentStep.gpr_c_step_id,
                    step_status: 'REJECTED',
                    action_by: actionBy,
                    action_type: 'REJECTED',
                    action_remark: remark,
                    UPDATE_BY: actionBy,
                }),
                RegisterRequestGprCFlowSQL.skipPendingSteps({
                    gpr_c_flow_id: flowId,
                    UPDATE_BY: actionBy,
                }),
                RegisterRequestGprCFlowSQL.updateFlowStatus({
                    gpr_c_flow_id: flowId,
                    flow_status: 'REJECTED',
                    current_step_code: null as any,
                    rejected_at: 'NOW()',
                    rejected_by: actionBy,
                    rejected_remark: remark,
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
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Missing request_id')
            const actionBy = normalizeValue(dataItem.action_by || dataItem.UPDATE_BY)
            if (!actionBy) throw new Error('Missing action_by')
            const picEmail = normalizeEmail(dataItem.pic_email)
            if (!picEmail) throw new Error('PIC email is required')

            const flow = await getFlowByRequest(requestId)
            if (!flow) throw new Error('GPR C flow not found')
            const flowId = Number(getValue(flow, 'GPR_C_FLOW_ID', 'gpr_c_flow_id'))
            const currentStep = await getCurrentStep(flowId)
            if (!currentStep) throw new Error('No GPR C step in progress')
            const currentStepCode = normalizeValue(currentStep.STEP_CODE || currentStep.step_code)
            if (!isActionRequiredStep(currentStepCode)) {
                throw new Error('Action Required is available only for EMR/QMS/PM Manager GPR C steps')
            }
            if (normalizeValue(currentStep.APPROVER_EMPCODE || currentStep.approver_empcode) !== actionBy) {
                throw new Error(`Unauthorized: current GPR C step requires ${currentStep.APPROVER_EMPCODE || currentStep.approver_empcode}`)
            }

            const insertSql = RegisterRequestGprCFlowSQL.insertActionRequired({
                gpr_c_flow_id: flowId,
                gpr_c_step_id: currentStep.GPR_C_STEP_ID || currentStep.gpr_c_step_id,
                request_id: requestId,
                stage_code: currentStepCode,
                stage_name: currentStep.STEP_NAME || currentStep.step_name,
                pic_name: normalizeValue(dataItem.pic_name),
                pic_email: picEmail,
                required_detail: normalizeValue(dataItem.required_detail || dataItem.remark),
                result_status: 'PENDING',
                CREATE_BY: actionBy,
                UPDATE_BY: actionBy,
            })
            const insertResult = (await MySQLExecute.execute(insertSql)) as ResultSetHeader
            const actionRecord = {
                action_required_id: insertResult.insertId,
                pic_name: normalizeValue(dataItem.pic_name),
                pic_email: picEmail,
                required_detail: normalizeValue(dataItem.required_detail || dataItem.remark),
            }
            await notifyActionRequired(requestId, currentStep, actionRecord).catch(console.error)

            await RegisterRequestGprCFlowService.approveStep({
                request_id: requestId,
                action_by: actionBy,
                action_type: 'ACTION_REQUIRED',
                action_remark: `Action Required: ${actionRecord.required_detail}`,
            })

            return response(true, 'Action Required sent and GPR C flow continued', actionRecord, 'GPR C Action Required')
        } catch (error: any) {
            return response(false, error?.message || 'Failed to send Action Required', [], 'GPR C Action Required Failed', 0)
        }
    },

    recordActionResult: async (dataItem: any) => {
        try {
            const actionRequiredId = Number(dataItem.action_required_id)
            if (!actionRequiredId) throw new Error('Missing action_required_id')
            const updateBy = normalizeValue(dataItem.result_by || dataItem.UPDATE_BY)
            if (!updateBy) throw new Error('Missing result_by')
            const status = normalizeValue(dataItem.result_status || 'COMPLETED').toUpperCase()
            await MySQLExecute.execute(RegisterRequestGprCFlowSQL.updateActionRequiredResult({
                action_required_id: actionRequiredId,
                result_status: status,
                result_remark: normalizeValue(dataItem.result_remark),
                result_by: updateBy,
                UPDATE_BY: updateBy,
            }))
            const sql = RegisterRequestGprCFlowSQL.getActionRequiredById({ action_required_id: actionRequiredId })
            const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
            return response(true, 'Action Required result recorded', rows[0] || {}, 'Record GPR C Action Result')
        } catch (error: any) {
            return response(false, error?.message || 'Failed to record Action Required result', [], 'Record GPR C Action Result Failed', 0)
        }
    },

    notifyRequesterSetup,
}
