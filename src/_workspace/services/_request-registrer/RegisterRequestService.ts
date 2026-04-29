import { MySQLExecute } from '@businessData/dbExecute'
import { RegisterRequestSQL } from '../../sql/_request-registrer/RegisterRequestSQL'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import {
    formatRequestNumber,
    GROUP_CODE,
    inferActorType,
    inferStepCode,
    isRejectedStatus,
    resolveGroupCodeForStep,
} from './RegisterRequestWorkflowHelper'
import {
    sendAgreementEmail as sendAgreementEmailHelper,
    triggerApprovalEmails as triggerApprovalEmailsHelper,
    triggerCompletionEmail as triggerCompletionEmailHelper,
    triggerCreationEmail as triggerCreationEmailHelper,
    triggerRejectionEmail as triggerRejectionEmailHelper,
    triggerVendorDocumentEmail as triggerVendorDocumentEmailHelper,
} from './RegisterRequestNotificationHelper'
import { RegisterRequestApprovalService } from './RegisterRequestApprovalService'
import { RegisterRequestGprService } from './RegisterRequestGprService'
import { RegisterRequestGprCFlowService } from './RegisterRequestGprCFlowService'

export const RegisterRequestService = {
    createRequest: async (dataItem: any) => {
        try {
            const vendorCheckSql = await RegisterRequestSQL.getVendorCreateContext({
                vendor_id: Number(dataItem.vendor_id) || 0,
            })
            const vendorRes = (await MySQLExecute.search(vendorCheckSql)) as RowDataPacket[]
            const vendorData = vendorRes[0] || {}
            const vendorRegion = vendorData.vendor_region || 'Local'
            const isOversea = String(vendorRegion).toLowerCase() === 'oversea'
            const assignmentGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC

            const fetchAssigneesSql = await RegisterRequestSQL.getActiveAssigneesByGroupCode({
                group_code: assignmentGroupCode,
            })
            const assigneesRes = (await MySQLExecute.search(fetchAssigneesSql)) as RowDataPacket[]
            const activeAssignees = assigneesRes.map(row => ({
                empName: row.empName || row.empcode || '',
                empCode: row.empcode || '',
                empEmail: row.empEmail || ''
            }))

            if (activeAssignees.length === 0) {
                activeAssignees.push({ empName: 'Admin', empCode: 'ADMIN', empEmail: 'admin@furukawaelectric.com' })
            }

                        const lastAssignSql = await RegisterRequestSQL.getLastAssignedPicByVendorRegion({
                                is_oversea: isOversea,
                        })
            const lastAssignRes = (await MySQLExecute.search(lastAssignSql)) as RowDataPacket[]
            const lastAssignTo = lastAssignRes[0]?.assign_to || ''
            const lastIdx = activeAssignees.findIndex((a: any) => a.empCode === lastAssignTo)
            const nextIndex = (lastIdx + 1) % activeAssignees.length
            const nextAssignee = activeAssignees[nextIndex]

            dataItem.assign_to = nextAssignee.empCode || ''
            dataItem.PIC_Email = nextAssignee.empEmail || ''

            const sqlCreate = await RegisterRequestSQL.createRequest(dataItem)
            const result = (await MySQLExecute.execute(sqlCreate)) as ResultSetHeader
            const insertedId = result.insertId

            if (!insertedId) throw new Error('Failed to insert registration request')

            const requestNumber = formatRequestNumber(insertedId)
            const setRequestNumberSql = await RegisterRequestSQL.updateRequestNumber({
                request_id: insertedId,
                request_number: requestNumber,
                UPDATE_BY: dataItem.CREATE_BY || 'SYSTEM',
            })
            await MySQLExecute.execute(setRequestNumberSql)

            const sqlList = []
            const statusSql = await RegisterRequestSQL.getStatusOptions()
            const statusRows = (await MySQLExecute.search(statusSql)) as RowDataPacket[]
            const workflowStatuses = statusRows.filter((s: any) => !isRejectedStatus(s.value))

            for (const [idx, ws] of workflowStatuses.entries()) {
                const stepOrder = idx + 1
                let initialStatus = 'pending'
                if (stepOrder === 1) initialStatus = 'completed'
                else if (stepOrder === 2) initialStatus = 'in_progress'

                const stepCode = inferStepCode({
                    step_code: ws.stepCode,
                    DESCRIPTION: ws.label
                })
                const actorType = inferActorType({
                    actor_type: ws.actorType,
                    step_code: stepCode,
                    DESCRIPTION: ws.label
                })
                const groupCode =
                    (isOversea ? ws.defaultGroupCodeOversea : ws.defaultGroupCodeLocal) ||
                    resolveGroupCodeForStep({ step_code: stepCode, actor_type: actorType }, isOversea)
                const isPicOwnedStep = actorType === 'PIC'

                sqlList.push(await RegisterRequestSQL.createApprovalStep({
                    request_id: insertedId,
                    step_order: stepOrder,
                    approver_id: stepOrder <= 2 || isPicOwnedStep ? nextAssignee.empCode : '',
                    step_status: initialStatus,
                    DESCRIPTION: ws.label,
                    step_code: stepCode,
                    actor_type: actorType,
                    group_code: groupCode,
                    assignment_mode: 'AUTO',
                    CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
                }))
            }

            await MySQLExecute.executeList(sqlList)

            const firstStepSql = await RegisterRequestSQL.getApprovalSteps({ request_id: insertedId })
            const firstStepRows = (await MySQLExecute.search(firstStepSql)) as RowDataPacket[]
            const firstStepId = firstStepRows[0]?.step_id || null

            const logSql = await RegisterRequestSQL.createApprovalLog({
                request_id: insertedId,
                step_id: firstStepId,
                action_by: dataItem.Request_By_EmployeeCode || 'SYSTEM',
                action_type: 'submitted',
                remark: 'Request submitted',
            })
            await MySQLExecute.execute(logSql)

            RegisterRequestService.triggerCreationEmail(
                dataItem,
                vendorData,
                nextAssignee,
                insertedId,
                requestNumber,
                assignmentGroupCode
            ).catch(console.error)

            return {
                Status: true,
                Message: 'Request created successfully',
                ResultOnDb: { insertedId },
                MethodOnDb: 'Create Request Success',
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            console.error('Error in RegisterRequestService.createRequest:', error)
            return {
                Status: false,
                Message: error?.message || 'Failed to create request',
                ResultOnDb: [],
                MethodOnDb: 'Create Request Failed',
                TotalCountOnDb: 0
            }
        }
    },

    triggerCreationEmail: async (
        dataItem: any,
        vendorData: any,
        nextAssignee: any,
        insertedId: number,
        persistedRequestNumber?: string,
        assigneeGroupCode?: string
    ) => {
        return triggerCreationEmailHelper(
            dataItem,
            vendorData,
            nextAssignee,
            insertedId,
            persistedRequestNumber,
            assigneeGroupCode
        )
    },

    createDocument: async (dataItem: any) => {
        try {
            const sql = await RegisterRequestSQL.createDocument(dataItem)
            const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
            return {
                Status: true,
                Message: 'Document uploaded successfully',
                ResultOnDb: { document_id: result.insertId },
                MethodOnDb: 'Create Document Success',
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Upload failed',
                ResultOnDb: [],
                MethodOnDb: 'Create Document Failed',
                TotalCountOnDb: 0
            }
        }
    },

    getAllRequests: async (dataItem: any, _sqlWhere: string = '') => {
        const sqlArray = await RegisterRequestSQL.getAllRequests(dataItem)
        const result = (await MySQLExecute.searchList(sqlArray)) as any[][]

        return {
            totalCount: result[0]?.[0]?.TOTAL_COUNT || 0,
            data: result[1] || []
        }
    },

    getById: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.getById(dataItem)
        const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return result[0] || null
    },

    getStatusOptions: async (dataItem: any = {}) => {
        const sql = await RegisterRequestSQL.getStatusOptions(dataItem)
        const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return result
    },

    sendAgreementEmail: async (dataItem: any) => {
        return sendAgreementEmailHelper(dataItem)
    },

    createApprovalStep: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.createApprovalStep(dataItem)
        const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
        return result.insertId
    },

    getApprovalSteps: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.getApprovalSteps(dataItem)
        return (await MySQLExecute.search(sql)) as RowDataPacket[]
    },

    updateApprovalStep: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.updateApprovalStep(dataItem)
        return await MySQLExecute.execute(sql)
    },

    createApprovalLog: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.createApprovalLog(dataItem)
        const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
        return result.insertId
    },

    getApprovalLogs: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.getApprovalLogs(dataItem)
        return (await MySQLExecute.search(sql)) as RowDataPacket[]
    },

    updateCcEmails: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.updateCcEmails(dataItem)
        return await MySQLExecute.execute(sql)
    },

    updateRequest: async (dataItem: any) => {
        return RegisterRequestApprovalService.updateRequest(dataItem)
    },

    updateStatus: async (dataItem: any) => {
        return RegisterRequestApprovalService.updateStatus(dataItem)
    },

    reassignAssignment: async (dataItem: any) => {
        return RegisterRequestApprovalService.reassignAssignment(dataItem)
    },

    triggerVendorDocumentEmail: async (requestId: number) => {
        return triggerVendorDocumentEmailHelper(requestId)
    },

    triggerApprovalEmails: async (dataItem: any, nextStep: any, dynamicApprover: string, _currentStep: any) => {
        return triggerApprovalEmailsHelper(dataItem, nextStep, dynamicApprover)
    },

    triggerRejectionEmail: async (dataItem: any, currentStep: any) => {
        return triggerRejectionEmailHelper(dataItem, currentStep)
    },

    triggerCompletionEmail: async (dataItem: any) => {
        return triggerCompletionEmailHelper(dataItem)
    },

    saveGprForm: async (dataItem: any) => {
        return RegisterRequestGprService.saveGprForm(dataItem)
    },

    resolveEmployeeProfile: async (dataItem: any) => {
        return RegisterRequestGprService.resolveEmployeeProfile(dataItem)
    },

    saveGprCNotification: async (dataItem: any) => {
        return RegisterRequestGprService.saveGprCNotification(dataItem)
    },

    gprCGetFlow: async (dataItem: any) => {
        return RegisterRequestGprCFlowService.getFlow(dataItem)
    },

    gprCSubmitSetup: async (dataItem: any) => {
        return RegisterRequestGprCFlowService.submitSetup(dataItem)
    },

    gprCApproveStep: async (dataItem: any) => {
        return RegisterRequestGprCFlowService.approveStep(dataItem)
    },

    gprCRejectStep: async (dataItem: any) => {
        return RegisterRequestGprCFlowService.rejectStep(dataItem)
    },

    gprCActionRequired: async (dataItem: any) => {
        return RegisterRequestGprCFlowService.actionRequired(dataItem)
    },

    gprCRecordActionResult: async (dataItem: any) => {
        return RegisterRequestGprCFlowService.recordActionResult(dataItem)
    },

    gprCQueue: async (dataItem: any) => {
        return RegisterRequestGprCFlowService.getQueue(dataItem)
    },

    gprCTaskManagerQueue: async () => {
        return RegisterRequestGprCFlowService.getTaskManagerQueue()
    },

    gprCActionRequiredQueue: async (dataItem: any) => {
        return RegisterRequestGprCFlowService.getActionRequiredQueue(dataItem)
    },

    getGprForm: async (dataItem: any) => {
        return RegisterRequestGprService.getGprForm(dataItem)
    },

    completeRegistration: async (dataItem: any) => {
        return RegisterRequestApprovalService.completeRegistration(dataItem)
    }
}
