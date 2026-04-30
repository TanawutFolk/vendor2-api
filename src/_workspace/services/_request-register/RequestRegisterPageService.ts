import { MySQLExecute } from '@businessData/dbExecute'
import { RequestRegisterPageSQL } from '../../sql/_request-register/RequestRegisterPageSQL'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import {
    formatRequestNumber,
    GROUP_CODE,
    inferActorType,
    inferStepCode,
    isPicStep,
    isRejectedStatus,
    resolveGroupCodeForStep,
} from './RegisterRequestWorkflowHelper'
import {
    sendAgreementEmail as sendAgreementEmailHelper,
    triggerCreationEmail as triggerCreationEmailHelper,
} from './RegisterRequestNotificationHelper'
import { RequestRegisterGprService } from './RequestRegisterGprService'
import { GprCApprovalService } from '../_approval-GPRC/GprCApprovalService'

export const RequestRegisterPageService = {
    createRequest: async (dataItem: any) => {
        try {
            const vendorCheckSql = await RequestRegisterPageSQL.getVendorCreateContext({
                vendor_id: Number(dataItem.vendor_id) || 0,
            })
            const vendorRes = (await MySQLExecute.search(vendorCheckSql)) as RowDataPacket[]
            const vendorData = vendorRes[0] || {}
            const vendorRegion = vendorData.vendor_region || 'Local'
            const isOversea = String(vendorRegion).toLowerCase() === 'oversea'
            const assignmentGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC

            const fetchAssigneesSql = await RequestRegisterPageSQL.getActiveAssigneesByGroupCode({
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

                        const lastAssignSql = await RequestRegisterPageSQL.getLastAssignedPicByVendorRegion({
                                is_oversea: isOversea,
                        })
            const lastAssignRes = (await MySQLExecute.search(lastAssignSql)) as RowDataPacket[]
            const lastAssignTo = lastAssignRes[0]?.assign_to || ''
            const lastIdx = activeAssignees.findIndex((a: any) => a.empCode === lastAssignTo)
            const nextIndex = (lastIdx + 1) % activeAssignees.length
            const nextAssignee = activeAssignees[nextIndex]

            dataItem.assign_to = nextAssignee.empCode || ''
            dataItem.PIC_Email = nextAssignee.empEmail || ''

            const sqlCreate = await RequestRegisterPageSQL.createRequest(dataItem)
            const result = (await MySQLExecute.execute(sqlCreate)) as ResultSetHeader
            const insertedId = result.insertId

            if (!insertedId) throw new Error('Failed to insert registration request')

            const requestNumber = formatRequestNumber(insertedId)
            const setRequestNumberSql = await RequestRegisterPageSQL.updateRequestNumber({
                request_id: insertedId,
                request_number: requestNumber,
                UPDATE_BY: dataItem.CREATE_BY || 'SYSTEM',
            })
            await MySQLExecute.execute(setRequestNumberSql)

            const sqlList = []
            const statusSql = await RequestRegisterPageSQL.getStatusOptions()
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

                sqlList.push(await RequestRegisterPageSQL.createApprovalStep({
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

            const firstStepSql = await RequestRegisterPageSQL.getApprovalSteps({ request_id: insertedId })
            const firstStepRows = (await MySQLExecute.search(firstStepSql)) as RowDataPacket[]
            const firstStepId = firstStepRows[0]?.step_id || null

            const logSql = await RequestRegisterPageSQL.createApprovalLog({
                request_id: insertedId,
                step_id: firstStepId,
                action_by: dataItem.Request_By_EmployeeCode || 'SYSTEM',
                action_type: 'submitted',
                remark: 'Request submitted',
            })
            await MySQLExecute.execute(logSql)

            RequestRegisterPageService.triggerCreationEmail(
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
            console.error('Error in RequestRegisterPageService.createRequest:', error)
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
            const sql = await RequestRegisterPageSQL.createDocument(dataItem)
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

    sendAgreementEmail: async (dataItem: any) => {
        return sendAgreementEmailHelper(dataItem)
    },

    createApprovalStep: async (dataItem: any) => {
        const sql = await RequestRegisterPageSQL.createApprovalStep(dataItem)
        const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
        return result.insertId
    },

    updateApprovalStep: async (dataItem: any) => {
        const sql = await RequestRegisterPageSQL.updateApprovalStep(dataItem)
        return await MySQLExecute.execute(sql)
    },

    createApprovalLog: async (dataItem: any) => {
        const sql = await RequestRegisterPageSQL.createApprovalLog(dataItem)
        const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
        return result.insertId
    },

    updateCcEmails: async (dataItem: any) => {
        const sql = await RequestRegisterPageSQL.updateCcEmails(dataItem)
        return await MySQLExecute.execute(sql)
    },

    updateRequest: async (dataItem: any) => {
        try {
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Invalid request_id')

            const checkSql = await RequestRegisterPageSQL.getRequestStatusAndAssign({ request_id: requestId })
            const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
            const request = checkRes[0]
            if (!request) throw new Error('Request not found')

            const stepsSql = await RequestRegisterPageSQL.getApprovalSteps({ request_id: requestId })
            const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
            const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

            if (!currentStep || !isPicStep(currentStep)) {
                throw new Error('Request can only be edited when it is in the PIC checking step')
            }

            if (dataItem.UPDATE_BY && request.assign_to && request.assign_to !== dataItem.UPDATE_BY) {
                throw new Error('Unauthorized assigned PIC only')
            }

            const sqlList = []
            sqlList.push(await RequestRegisterPageSQL.updateRequest(dataItem))
            sqlList.push(await RequestRegisterPageSQL.createApprovalLog({
                request_id: requestId,
                step_id: currentStep.step_id,
                action_by: dataItem.UPDATE_BY || 'SYSTEM',
                action_type: 'edited',
                remark: 'PIC edited request details',
            }))

            const resultData = await MySQLExecute.executeList(sqlList)
            return {
                Status: true,
                Message: 'Request updated successfully',
                ResultOnDb: resultData,
                MethodOnDb: 'Update Request Success',
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Update failed',
                ResultOnDb: [],
                MethodOnDb: 'Update Request Failed',
                TotalCountOnDb: 0
            }
        }
    },

    saveGprForm: async (dataItem: any) => {
        return RequestRegisterGprService.saveGprForm(dataItem)
    },

    saveGprCNotification: async (dataItem: any) => {
        return RequestRegisterGprService.saveGprCNotification(dataItem)
    },

    gprCGetFlow: async (dataItem: any) => {
        return GprCApprovalService.getFlow(dataItem)
    },

    gprCSubmitSetup: async (dataItem: any) => {
        return GprCApprovalService.submitSetup(dataItem)
    }
}
