import { MySQLExecute } from '@businessData/dbExecute'
import { RegisterRequestSQL } from '../../sql/_request-registrer/RegisterRequestSQL'
import { RowDataPacket } from 'mysql2'
import {
    GROUP_CODE,
    inferActorType,
    inferStepCode,
    isPicStep,
    isRejectedStatus,
    normalizeText,
    requiresVendorCode,
    requiresVendorReply,
    resolveGroupCodeForStep,
} from './RegisterRequestWorkflowHelper'
import {
    triggerApprovalEmails,
    triggerCompletionEmail,
    triggerRejectionEmail,
    triggerVendorDisagreeEmail,
    triggerVendorDocumentEmail,
} from './RegisterRequestNotificationHelper'

const normalizeStatusText = (value: any) => normalizeText(String(value || '').replace(/[_-]+/g, ' '))
const isPendingAgreementStep = (step: any) => normalizeStatusText(step?.DESCRIPTION).includes('pending agreement')
const isIssueGprBStep = (step: any) => normalizeStatusText(step?.DESCRIPTION).includes('issue gpr b')
const isIssueGprCStep = (step: any) => normalizeStatusText(step?.DESCRIPTION).includes('issue gpr c')
const isVendorDisagreedStep = (step: any) => normalizeStatusText(step?.DESCRIPTION).includes('vendor disagre')
const isDisagreedBranchStep = (step: any) => isIssueGprBStep(step) || isIssueGprCStep(step) || isVendorDisagreedStep(step)
const isVendorDisagreeStatus = (status: any) => normalizeStatusText(status).includes('vendor disagre')
const isIssueGprBStatus = (status: any) => normalizeStatusText(status).includes('gpr b')
const isIssueGprCStatus = (status: any) => normalizeStatusText(status).includes('gpr c')

export const RegisterRequestApprovalService = {
    updateRequest: async (dataItem: any) => {
        try {
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Invalid request_id')

            const checkSql = `SELECT request_status, assign_to FROM request_register_vendor WHERE request_id = ${requestId} AND INUSE = 1 LIMIT 1`
            const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
            const request = checkRes[0]
            if (!request) throw new Error('Request not found')

            const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: requestId })
            const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
            const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

            if (!currentStep || !isPicStep(currentStep)) {
                throw new Error('Request can only be edited when it is in the PIC checking step')
            }

            if (dataItem.UPDATE_BY && request.assign_to && request.assign_to !== dataItem.UPDATE_BY) {
                throw new Error('Unauthorized assigned PIC only')
            }

            const sqlList = []
            sqlList.push(await RegisterRequestSQL.updateRequest(dataItem))
            sqlList.push(await RegisterRequestSQL.createApprovalLog({
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

    updateStatus: async (dataItem: any) => {
        try {
            const newStatus = dataItem.request_status || ''
            const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: dataItem.request_id })
            const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
            const currentStep = steps.find((s: any) => s.step_status === 'in_progress')
            const postCommitTasks: Array<() => Promise<void>> = []

            let hasVendorRequestLog = false
            if (currentStep && requiresVendorReply(currentStep)) {
                const logsSql = await RegisterRequestSQL.getApprovalLogs({ request_id: dataItem.request_id })
                const logs = (await MySQLExecute.search(logsSql)) as any[]
                hasVendorRequestLog = logs.some((l: any) =>
                    String(l.step_id || '') === String(currentStep?.step_id || '') && l.action_type === 'vendor_requested'
                )
            }

            const checkSql = await RegisterRequestSQL.getRequestStatusContext({ request_id: dataItem.request_id })
            const checkRes = (await MySQLExecute.search(checkSql)) as any[]
            const vendor_id = checkRes[0]?.vendor_id
            const assign_to = checkRes[0]?.assign_to
            const selectedVendorCode = checkRes[0]?.vendor_code_selector || ''
            const isOversea = (checkRes[0]?.vendor_region || '').toLowerCase() === 'oversea'

            const getApproverByGroup = async (groupCode: string) => {
                if (!groupCode) return ''
                const approverSql = await RegisterRequestSQL.getApproverByGroupCode({ group_code: groupCode })
                const approverRes = (await MySQLExecute.search(approverSql)) as any[]
                return approverRes[0]?.empcode || ''
            }

            const resolveStepApprover = async (step: any) => {
                if (!step) return ''
                if (step.approver_id) return String(step.approver_id)
                if (isPicStep(step)) return String(assign_to || '')

                const stepGroupCode = resolveGroupCodeForStep(step, isOversea)
                const desc = (step.DESCRIPTION || '').toLowerCase()

                if (stepGroupCode || desc.includes('gm') || desc.includes('general manager')) {
                    return await getApproverByGroup(stepGroupCode || GROUP_CODE.PO_GM)
                }
                if (desc.includes('mgr') || desc.includes('manager')) return await getApproverByGroup(GROUP_CODE.PO_MGR)
                if (desc.includes('md') || desc.includes('director')) return await getApproverByGroup(GROUP_CODE.MD)
                if (desc.includes('account')) {
                    return await getApproverByGroup(isOversea ? GROUP_CODE.ACC_OVERSEA_MAIN : GROUP_CODE.ACC_LOCAL_MAIN)
                }
                if (desc.includes('checker') || desc.includes('check all document')) {
                    return await getApproverByGroup(GROUP_CODE.PO_CHECKER_MAIN)
                }
                return ''
            }

            if (currentStep) {
                const actionBy = dataItem.approve_by || dataItem.UPDATE_BY || ''
                const isCurrentPicStep = isPicStep(currentStep)
                const requiresRoleApprover = ['APPROVER', 'ACCOUNT'].includes(inferActorType(currentStep))

                if (currentStep.approver_id) {
                    const isDesignatedApprover = currentStep.approver_id === actionBy
                    const isAssignedPic = isCurrentPicStep && assign_to && assign_to === actionBy

                    if (actionBy && !isDesignatedApprover && !isAssignedPic) {
                        throw new Error(`Unauthorized: step "${currentStep.DESCRIPTION}" requires approver [${currentStep.approver_id}]`)
                    }
                } else if (requiresRoleApprover) {
                    throw new Error(`Approver not yet assigned for step "${currentStep.DESCRIPTION}". Please contact admin.`)
                } else if (actionBy && assign_to && assign_to !== actionBy) {
                    throw new Error(`Unauthorized: only the assigned PIC [${assign_to}] can action this step`)
                }

                if (requiresVendorCode(currentStep) && !isRejectedStatus(newStatus)) {
                    const extractedVendorCode = String(selectedVendorCode || '').trim()
                    if (!extractedVendorCode.trim()) {
                        throw new Error('Approval blocked: You must open the GPR Form and specify the "Vendor Code" before approving this step.')
                    }
                    dataItem.vendor_code_extracted = extractedVendorCode
                }
            }

            const sqlList = []
            sqlList.push(await RegisterRequestSQL.updateStatus(dataItem))

            if (dataItem.vendor_code_extracted) {
                sqlList.push(await RegisterRequestSQL.updateRequestVendorCode({
                    request_id: dataItem.request_id,
                    vendor_code: dataItem.vendor_code_extracted,
                    UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                }))
                if (vendor_id) {
                    sqlList.push(await RegisterRequestSQL.updateVendorFftVendorCode({
                        vendor_id,
                        vendor_code: dataItem.vendor_code_extracted,
                    }))
                }
            }

            if (steps.length > 0) {
                if (isRejectedStatus(newStatus)) {
                    if (vendor_id) {
                        sqlList.push(await RegisterRequestSQL.updateVendorFftStatus({ vendor_id, fft_status: 2 }))
                    }
                    if (currentStep) {
                        sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                            step_id: currentStep.step_id,
                            step_status: 'rejected',
                            UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                        }))
                        sqlList.push(await RegisterRequestSQL.createApprovalLog({
                            request_id: dataItem.request_id,
                            step_id: currentStep.step_id,
                            action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
                            action_type: 'rejected',
                            remark: dataItem.approver_remark || '',
                        }))
                    }
                    const pendingSteps = steps.filter((s: any) => s.step_status === 'pending')
                    for (const ps of pendingSteps) {
                        sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                            step_id: ps.step_id,
                            step_status: 'skipped',
                            UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                        }))
                    }
                    postCommitTasks.push(async () => triggerRejectionEmail(dataItem, currentStep))
                } else if (currentStep) {
                    if (requiresVendorReply(currentStep) && !hasVendorRequestLog) {
                        sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                            step_id: currentStep.step_id,
                            step_status: 'approved',
                            UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                        }))
                        sqlList.push(await RegisterRequestSQL.createApprovalLog({
                            request_id: dataItem.request_id,
                            step_id: currentStep.step_id,
                            action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
                            action_type: 'vendor_requested',
                            remark: 'Vendor document request email has been sent',
                        }))

                        const pendingAgreementStep = steps.find((s: any) => s.step_status === 'pending' && s.step_order > currentStep.step_order)
                        if (pendingAgreementStep) {
                            const pendingAgreementApprover = await resolveStepApprover(pendingAgreementStep)
                            if (pendingAgreementApprover && pendingAgreementApprover !== pendingAgreementStep.approver_id) {
                                sqlList.push(await RegisterRequestSQL.updateApprovalStepApprover({
                                    step_id: pendingAgreementStep.step_id,
                                    approver_id: pendingAgreementApprover,
                                    assignment_mode: 'AUTO',
                                    UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                                }))
                            }
                            sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                step_id: pendingAgreementStep.step_id,
                                step_status: 'in_progress',
                                UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                            }))
                        }

                        const resultData = await MySQLExecute.executeList(sqlList)
                        const mailResult = await triggerVendorDocumentEmail(dataItem.request_id)
                        const mailMessage = mailResult?.sent
                            ? 'Vendor notification sent. Waiting vendor response before next approval step.'
                            : `Request updated but vendor email failed: ${mailResult?.reason || 'unknown error'}`

                        return {
                            Status: true,
                            Message: mailMessage,
                            ResultOnDb: resultData,
                            MethodOnDb: 'Update Status Success',
                            TotalCountOnDb: sqlList.length
                        }
                    }

                    sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                        step_id: currentStep.step_id,
                        step_status: 'approved',
                        UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                    }))
                    sqlList.push(await RegisterRequestSQL.createApprovalLog({
                        request_id: dataItem.request_id,
                        step_id: currentStep.step_id,
                        action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
                        action_type: 'approved',
                        remark: dataItem.approver_remark || '',
                    }))

                    const pendingAfterCurrent = steps
                        .filter((s: any) => s.step_status === 'pending' && s.step_order > currentStep.step_order)
                        .sort((a: any, b: any) => Number(a.step_order || 0) - Number(b.step_order || 0))

                    const disagreementRequested =
                        isVendorDisagreeStatus(newStatus) ||
                        isIssueGprBStatus(newStatus) ||
                        isIssueGprCStatus(newStatus)

                    let nextStep: any | undefined = pendingAfterCurrent[0]
                    let closeAsVendorDisagreed = false

                    if (isPendingAgreementStep(currentStep) && !disagreementRequested) {
                        // Agreement reached: skip GPR B/C/Disagreed branch and continue to normal approval chain.
                        const branchSteps = pendingAfterCurrent.filter((s: any) => isDisagreedBranchStep(s))
                        for (const branchStep of branchSteps) {
                            sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                step_id: branchStep.step_id,
                                step_status: 'skipped',
                                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                            }))
                        }
                        nextStep = pendingAfterCurrent.find((s: any) => !isDisagreedBranchStep(s))
                    } else if (isPendingAgreementStep(currentStep) || isIssueGprBStep(currentStep) || isIssueGprCStep(currentStep)) {
                        // In negotiation branch: explicit disagreement moves B -> C -> Disagreed.
                        // Otherwise (vendor agreed) continue to normal approval chain.
                        if (!disagreementRequested) {
                            const branchSteps = pendingAfterCurrent.filter((s: any) => isDisagreedBranchStep(s))
                            for (const branchStep of branchSteps) {
                                sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                    step_id: branchStep.step_id,
                                    step_status: 'skipped',
                                    UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                                }))
                            }
                            nextStep = pendingAfterCurrent.find((s: any) => !isDisagreedBranchStep(s))
                        } else {
                            if (isPendingAgreementStep(currentStep)) {
                                nextStep = pendingAfterCurrent.find((s: any) => isIssueGprBStep(s))
                                    || pendingAfterCurrent.find((s: any) => isIssueGprCStep(s))
                                    || pendingAfterCurrent.find((s: any) => isVendorDisagreedStep(s))
                            } else if (isIssueGprBStep(currentStep)) {
                                nextStep = pendingAfterCurrent.find((s: any) => isIssueGprCStep(s))
                                    || pendingAfterCurrent.find((s: any) => isVendorDisagreedStep(s))
                            } else if (isIssueGprCStep(currentStep)) {
                                nextStep = pendingAfterCurrent.find((s: any) => isVendorDisagreedStep(s))
                            }
                        }

                        if (disagreementRequested && nextStep && isVendorDisagreedStep(nextStep)) {
                            closeAsVendorDisagreed = true

                            if (vendor_id) {
                                sqlList.push(await RegisterRequestSQL.updateVendorFftStatus({ vendor_id, fft_status: 2 }))
                            }

                            sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                step_id: nextStep.step_id,
                                step_status: 'rejected',
                                UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                            }))
                            sqlList.push(await RegisterRequestSQL.createApprovalLog({
                                request_id: dataItem.request_id,
                                step_id: nextStep.step_id,
                                action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
                                action_type: 'rejected',
                                remark: dataItem.approver_remark || 'Vendor disagreed after GPR negotiation',
                            }))

                            const trailingSteps = pendingAfterCurrent.filter((s: any) => s.step_id !== nextStep.step_id)
                            for (const ts of trailingSteps) {
                                sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                    step_id: ts.step_id,
                                    step_status: 'skipped',
                                    UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                                }))
                            }

                            postCommitTasks.push(async () => triggerVendorDisagreeEmail(dataItem))
                            nextStep = undefined
                        }
                    }

                    if (requiresVendorCode(currentStep)) {
                        nextStep = undefined
                        const remainingSteps = steps.filter((s: any) => s.step_status === 'pending' && s.step_order > currentStep.step_order)
                        for (const rs of remainingSteps) {
                            sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                step_id: rs.step_id,
                                step_status: 'skipped',
                                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                            }))
                        }
                    }

                    if (nextStep) {
                        const nextStepApprover = await resolveStepApprover(nextStep)
                        if (nextStepApprover && nextStepApprover !== nextStep.approver_id) {
                            sqlList.push(await RegisterRequestSQL.updateApprovalStepApprover({
                                step_id: nextStep.step_id,
                                approver_id: nextStepApprover,
                                assignment_mode: 'AUTO',
                                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                            }))
                        }
                        sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                            step_id: nextStep.step_id,
                            step_status: 'in_progress',
                            UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                        }))
                        if (isIssueGprBStep(nextStep) || isIssueGprCStep(nextStep)) {
                            postCommitTasks.push(async () => {
                                await triggerVendorDocumentEmail(dataItem.request_id, nextStep?.DESCRIPTION)
                            })
                        } else {
                            postCommitTasks.push(async () => triggerApprovalEmails(dataItem, nextStep, nextStepApprover))
                        }
                    } else if (!closeAsVendorDisagreed) {
                        sqlList.push(await RegisterRequestSQL.markRequestCompleted({
                            request_id: dataItem.request_id,
                            UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                        }))
                        postCommitTasks.push(async () => triggerCompletionEmail(dataItem))
                    }
                }
            }

            const resultData = await MySQLExecute.executeList(sqlList)
            for (const task of postCommitTasks) task().catch(console.error)

            return {
                Status: true,
                Message: 'Status updated successfully',
                ResultOnDb: resultData,
                MethodOnDb: 'Update Status Success',
                TotalCountOnDb: sqlList.length
            }
        } catch (error: any) {
            console.error('Error in RegisterRequestApprovalService.updateStatus:', error)
            return {
                Status: false,
                Message: error?.message || 'Update status failed',
                ResultOnDb: [],
                MethodOnDb: 'Update Status Failed',
                TotalCountOnDb: 0
            }
        }
    },

    reassignAssignment: async (dataItem: any) => {
        try {
            const requestId = Number(dataItem.request_id) || 0
            const scope = String(dataItem.scope || '').trim().toUpperCase()
            const toEmpCode = String(dataItem.to_empcode || '').trim()
            const updateBy = dataItem.UPDATE_BY || dataItem.changed_by || 'SYSTEM'
            const reason = dataItem.reason || ''

            if (!requestId) throw new Error('Missing request_id')
            if (!['REQUEST_PIC', 'CURRENT_STEP'].includes(scope)) throw new Error('Invalid reassign scope')
            if (!toEmpCode) throw new Error('Missing to_empcode')

            const requestSql = await RegisterRequestSQL.getById({ request_id: requestId })
            const requestRes = (await MySQLExecute.search(requestSql)) as RowDataPacket[]
            const request = requestRes[0] || null
            if (!request) throw new Error('Request not found')

            const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: requestId })
            const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
            const currentStep = steps.find((step: any) => step.step_status === 'in_progress')
            if (!currentStep) throw new Error('No in-progress step found for this request')

            const assigneeSql = await RegisterRequestSQL.getAssigneeByEmpCode({ to_empcode: toEmpCode })
            const assigneeRes = (await MySQLExecute.search(assigneeSql)) as RowDataPacket[]
            const targetAssignee = assigneeRes[0] || null
            if (!targetAssignee || Number(targetAssignee.INUSE) !== 1) throw new Error('Target assignee is not active')

            const isOversea = normalizeText(request.vendor_region) === 'oversea'
            const picGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
            const currentStepGroupCode = resolveGroupCodeForStep(currentStep, isOversea)
            const expectedGroupCode = scope === 'REQUEST_PIC' ? picGroupCode : currentStepGroupCode

            if (expectedGroupCode && targetAssignee.group_code && String(targetAssignee.group_code).trim().toUpperCase() !== expectedGroupCode) {
                throw new Error(`Target assignee must belong to group ${expectedGroupCode}`)
            }

            const sqlList = []
            let fromEmpcode = currentStep.approver_id || ''
            let targetStepId: number | undefined = currentStep.step_id
            let stepCode = inferStepCode(currentStep)
            let groupCode = currentStepGroupCode
            let actionType = 'reassigned_step'

            if (scope === 'REQUEST_PIC') {
                fromEmpcode = request.assign_to || currentStep.approver_id || ''
                targetStepId = isPicStep(currentStep) ? currentStep.step_id : undefined
                stepCode = 'PIC_REVIEW'
                groupCode = picGroupCode
                actionType = 'reassigned_pic'

                sqlList.push(await RegisterRequestSQL.updateRequestPicAssignee({
                    request_id: requestId,
                    assign_to: targetAssignee.empcode,
                    PIC_Email: targetAssignee.empEmail || '',
                    UPDATE_BY: updateBy,
                }))

                if (isPicStep(currentStep)) {
                    sqlList.push(await RegisterRequestSQL.updateApprovalStepApprover({
                        step_id: currentStep.step_id,
                        approver_id: targetAssignee.empcode,
                        assignment_mode: 'MANUAL',
                        UPDATE_BY: updateBy,
                    }))
                }
            } else {
                sqlList.push(await RegisterRequestSQL.updateApprovalStepApprover({
                    step_id: currentStep.step_id,
                    approver_id: targetAssignee.empcode,
                    assignment_mode: 'MANUAL',
                    UPDATE_BY: updateBy,
                }))

                if (isPicStep(currentStep)) {
                    sqlList.push(await RegisterRequestSQL.updateRequestPicAssignee({
                        request_id: requestId,
                        assign_to: targetAssignee.empcode,
                        PIC_Email: targetAssignee.empEmail || '',
                        UPDATE_BY: updateBy,
                    }))
                }
            }

            sqlList.push(await RegisterRequestSQL.insertAssignmentHistory({
                request_id: requestId,
                step_id: targetStepId,
                scope,
                step_code: stepCode,
                group_code: groupCode,
                from_empcode: fromEmpcode,
                to_empcode: targetAssignee.empcode,
                reason,
                DESCRIPTION: scope === 'REQUEST_PIC' ? 'PIC reassigned' : 'Current approval step reassigned',
                changed_by: updateBy,
                CREATE_BY: updateBy,
                UPDATE_BY: updateBy,
            }))

            sqlList.push(await RegisterRequestSQL.createApprovalLog({
                request_id: requestId,
                step_id: currentStep.step_id,
                action_by: updateBy,
                action_type: actionType,
                remark: reason || `Reassigned to ${targetAssignee.empcode}`,
            }))

            const resultData = await MySQLExecute.executeList(sqlList)
            return {
                Status: true,
                Message: 'Assignment updated successfully',
                ResultOnDb: resultData,
                MethodOnDb: 'Reassign Request Success',
                TotalCountOnDb: sqlList.length
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Reassign failed',
                ResultOnDb: [],
                MethodOnDb: 'Reassign Request Failed',
                TotalCountOnDb: 0
            }
        }
    },

    completeRegistration: async (dataItem: any) => {
        try {
            const stepsSql = await RegisterRequestSQL.getApprovalSteps(dataItem)
            const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
            const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

            const sqlList = []
            if (currentStep) {
                sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                    step_id: currentStep.step_id,
                    step_status: 'approved',
                    UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                }))
                sqlList.push(await RegisterRequestSQL.createApprovalLog({
                    request_id: dataItem.request_id,
                    step_id: currentStep.step_id,
                    action_by: dataItem.UPDATE_BY || 'SYSTEM',
                    action_type: 'approved',
                    remark: dataItem.vendor_code ? `Vendor Code: ${dataItem.vendor_code}` : 'Registration completed',
                }))
            }

            sqlList.push(await RegisterRequestSQL.completeRegistration(dataItem))
            const resultData = await MySQLExecute.executeList(sqlList)

            return {
                Status: true,
                Message: 'Registration completed successfully',
                ResultOnDb: resultData,
                MethodOnDb: 'Complete Registration',
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Completion failed',
                ResultOnDb: [],
                MethodOnDb: 'Complete Registration Failed',
                TotalCountOnDb: 0
            }
        }
    }
}
