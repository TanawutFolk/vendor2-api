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
    resolveWorkflowAction,
    resolveGroupCodeForStep,
    WORKFLOW_ACTION,
} from './RegisterRequestWorkflowHelper'
import {
    triggerApprovalEmails,
    triggerActionRequiredEmail,
    triggerAfterGprCApprovedEmail,
    triggerCompletionEmail,
    triggerRejectionEmail,
    triggerVendorDisagreeEmail,
    triggerVendorDocumentEmail,
} from './RegisterRequestNotificationHelper'
import { RegisterRequestGprCFlowService } from './RegisterRequestGprCFlowService'

const normalizeStatusText = (value: any) => normalizeText(String(value || '').replace(/[_-]+/g, ' '))
const isPendingAgreementStep = (step: any) => normalizeStatusText(step?.DESCRIPTION).includes('pending agreement')
const isAgreementReachedStep = (step: any) => normalizeStatusText(step?.DESCRIPTION).includes('agreement reached')
const isIssueGprBStep = (step: any) => normalizeStatusText(step?.DESCRIPTION).includes('issue gpr b')
const isIssueGprCStep = (step: any) => normalizeStatusText(step?.DESCRIPTION).includes('issue gpr c')
const isVendorDisagreedStep = (step: any) => normalizeStatusText(step?.DESCRIPTION).includes('vendor disagre')
const isDocumentCheckStep = (step: any) => {
    const desc = normalizeStatusText(step?.DESCRIPTION)
    const stepCode = String(step?.step_code || '').trim().toUpperCase()
    return stepCode === 'DOC_CHECK' || desc.includes('check all document') || desc.includes('checker')
}
const isDisagreedBranchStep = (step: any) => isIssueGprBStep(step) || isIssueGprCStep(step) || isVendorDisagreedStep(step)
const isVendorDisagreeStatus = (status: any) => normalizeStatusText(status).includes('vendor disagre')
const isIssueGprBStatus = (status: any) => normalizeStatusText(status).includes('gpr b')
const isIssueGprCStatus = (status: any) => normalizeStatusText(status).includes('gpr c')
const resolveActionRequiredStage = (step: any) => {
    const desc = normalizeStatusText(step?.DESCRIPTION)
    if (desc.includes('engineer')) return 'engineer'
    if (desc.includes('emr')) return 'emr'
    if (desc.includes('qms')) return 'qms'
    if (desc.includes('pm manager') || desc.includes('manager approval')) return 'pm_manager'
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

const getGprCApproverEmpCodeFromSelection = (selection: any) => {
    const actionRequiredSetup = parseStoredObject(selection?.action_required_json)
    const meta = parseStoredObject(actionRequiredSetup?._meta)
    return String(meta?.gpr_c_approver_empcode || '').trim()
}

const NEED_CRITERIA = new Set(['4.1', '4.2', '4.3', '4.4', '4.5'])
const OPTIONAL_CRITERIA = new Set(['4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '4.12', '4.13'])

const evaluateGprCriteria = (criteriaRows: any[]) => {
    const rows = Array.isArray(criteriaRows) ? criteriaRows : []
    const normalizedRows = rows.map((row: any) => ({
        no: String(row?.no || row?.criteria_no || '').trim(),
        uploaded_file: String(row?.uploaded_file || row?.uploaded_file_path || '').trim(),
    }))

    const needRows = normalizedRows.filter(row => NEED_CRITERIA.has(row.no))
    const optionalRows = normalizedRows.filter(row => OPTIONAL_CRITERIA.has(row.no))

    const needPassed = NEED_CRITERIA.size > 0
        && needRows.length === NEED_CRITERIA.size
        && needRows.every(row => !!row.uploaded_file)

    const optionalUploaded = optionalRows.filter(row => !!row.uploaded_file).length
    const optionalPassed = optionalUploaded >= 4

    return {
        hasCriteria: normalizedRows.length > 0,
        needPassed,
        optionalPassed,
        passed: needPassed && optionalPassed,
    }
}

const buildActionRequiredRemark = (dataItem: any) => {
    const owner = String(
        dataItem?.action_required_owner
        || dataItem?.action_required_owner_empcode
        || ''
    ).trim()
    const ownerEmail = String(
        dataItem?.action_required_owner_email
        || ''
    ).trim()
    const dueDate = String(
        dataItem?.action_required_due_date
        || dataItem?.due_date
        || ''
    ).trim()
    const note = String(
        dataItem?.action_required_note
        || dataItem?.approver_remark
        || ''
    ).trim()
    const actor = String(dataItem?.approve_by || dataItem?.UPDATE_BY || 'SYSTEM').trim()

    const metadata = {
        type: 'action_required',
        owner,
        owner_email: ownerEmail,
        due_date: dueDate,
        note,
        stage: String(dataItem?.action_required_stage || '').trim(),
        actor,
        captured_at: new Date().toISOString(),
    }

    return `Action Required | ${JSON.stringify(metadata)}`
}

export const RegisterRequestApprovalService = {
    updateRequest: async (dataItem: any) => {
        try {
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Invalid request_id')

            const checkSql = await RegisterRequestSQL.getRequestStatusAndAssign({ request_id: requestId })
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
            const explicitAction = resolveWorkflowAction(dataItem)
            const isExplicitReject = explicitAction === WORKFLOW_ACTION.REJECT
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
            const picGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
            const requesterSql = await RegisterRequestSQL.getRequesterByRequestId({ request_id: dataItem.request_id })
            const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
            const requesterCode = String(requesterRes[0]?.Request_By_EmployeeCode || '').trim()
            let selectionCache: any | null | undefined

            const getApproverByGroup = async (groupCode: string) => {
                if (!groupCode) return ''
                const approverSql = await RegisterRequestSQL.getApproverByGroupCode({ group_code: groupCode })
                const approverRes = (await MySQLExecute.search(approverSql)) as any[]
                return approverRes[0]?.empcode || ''
            }

            const isActiveAssigneeInGroup = async (empCode: string, groupCode: string) => {
                const safeEmpCode = String(empCode || '').trim()
                const safeGroupCode = String(groupCode || '').trim().toUpperCase()
                if (!safeEmpCode || !safeGroupCode) return false

                const assigneeSql = await RegisterRequestSQL.getActiveAssigneeByEmpCodeAndGroupCode({
                    empcode: safeEmpCode,
                    group_code: safeGroupCode,
                })
                const assigneeRes = (await MySQLExecute.search(assigneeSql)) as any[]
                return assigneeRes.length > 0
            }

            const getSelectionRecord = async () => {
                if (selectionCache !== undefined) return selectionCache
                const selectionSql = await RegisterRequestSQL.getSelection({ request_id: dataItem.request_id })
                const selectionRes = (await MySQLExecute.search(selectionSql)) as any[]
                selectionCache = selectionRes[0] || null
                return selectionCache
            }

            const resolveStepApprover = async (step: any) => {
                if (!step) return ''
                if (isPicStep(step)) {
                    const currentPic = String(assign_to || '').trim()
                    const picStepGroupCode = resolveGroupCodeForStep(step, isOversea) || picGroupCode
                    if (currentPic && await isActiveAssigneeInGroup(currentPic, picStepGroupCode)) {
                        return currentPic
                    }
                    return await getApproverByGroup(picStepGroupCode)
                }
                if (isIssueGprCStep(step)) {
                    const selection = await getSelectionRecord()
                    return getGprCApproverEmpCodeFromSelection(selection) || requesterCode
                }

                const stepGroupCode = resolveGroupCodeForStep(step, isOversea)
                if (step.approver_id && stepGroupCode && await isActiveAssigneeInGroup(String(step.approver_id), stepGroupCode)) {
                    return String(step.approver_id)
                }
                if (step.approver_id && !stepGroupCode) {
                    return String(step.approver_id)
                }
                const stepCode = inferStepCode(step)
                const desc = (step.DESCRIPTION || '').toLowerCase()

                // Always route document-check step to Checker Main regardless of misconfigured group_code.
                if (stepCode === 'DOC_CHECK' || desc.includes('checker') || desc.includes('check all document')) {
                    return await getApproverByGroup(GROUP_CODE.PO_CHECKER_MAIN)
                }

                if (stepGroupCode || desc.includes('gm') || desc.includes('general manager')) {
                    return await getApproverByGroup(stepGroupCode || GROUP_CODE.PO_GM)
                }
                if (desc.includes('mgr') || desc.includes('manager')) return await getApproverByGroup(GROUP_CODE.PO_MGR)
                if (desc.includes('md') || desc.includes('director')) return await getApproverByGroup(GROUP_CODE.MD)
                if (desc.includes('account')) {
                    return await getApproverByGroup(isOversea ? GROUP_CODE.ACC_OVERSEA_MAIN : GROUP_CODE.ACC_LOCAL_MAIN)
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

                if (requiresVendorCode(currentStep) && !isRejectedStatus(newStatus) && !isExplicitReject) {
                    const extractedVendorCode = String(selectedVendorCode || '').trim()
                    if (!extractedVendorCode.trim()) {
                        throw new Error('Approval blocked: You must open the GPR Form and specify the "Vendor Code" before approving this step.')
                    }
                    dataItem.vendor_code_extracted = extractedVendorCode
                }

                const requiresGprDecision = isPendingAgreementStep(currentStep) || isAgreementReachedStep(currentStep)
                if (requiresGprDecision && !isExplicitReject && explicitAction !== WORKFLOW_ACTION.ACTION_REQUIRED) {
                    const attemptingDisagree =
                        explicitAction === WORKFLOW_ACTION.DISAGREE
                        || isVendorDisagreeStatus(newStatus)
                        || isIssueGprBStatus(newStatus)
                        || isIssueGprCStatus(newStatus)
                    const attemptingApprove = !attemptingDisagree

                    const selection = await getSelectionRecord()
                    if (!selection?.selection_id) {
                        throw new Error('Approval blocked: Please fill GPR form before proceeding.')
                    }

                    // GPR criteria 4.1-4.13 are used only for the initial GPR A approval path.
                    // Once the flow moves into the disagreement escalation branch (GPR B / GPR C),
                    // we should not block the user based on those criteria.
                    if (attemptingApprove) {
                        const criteriaSql = await RegisterRequestSQL.getCriteria({ selection_id: selection.selection_id })
                        const criteriaRes = (await MySQLExecute.search(criteriaSql)) as any[]
                        const gprEval = evaluateGprCriteria(criteriaRes)

                        if (!gprEval.hasCriteria) {
                            throw new Error('Approval blocked: Please fill GPR form before proceeding.')
                        }

                        if (!gprEval.passed) {
                            throw new Error('Approval blocked: GPR form does not pass criteria (4.1-4.5 need all files and 4.6-4.13 need at least 4 files).')
                        }
                    }
                }

                if (explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED) {
                    const stageKey = resolveActionRequiredStage(currentStep)
                    if (!stageKey) {
                        throw new Error('Action Required is only available for Engineer / EMR / QMS / PM Manager stages.')
                    }

                    const selectionSql = await RegisterRequestSQL.getSelection({ request_id: dataItem.request_id })
                    const selectionRes = (await MySQLExecute.search(selectionSql)) as any[]
                    const selection = selectionRes[0]
                    const actionRequiredSetup = parseStoredObject(selection?.action_required_json)
                    const stageConfig = actionRequiredSetup?.[stageKey] || {}
                    const ownerName = String(stageConfig?.pic_name || '').trim()
                    const ownerEmail = String(stageConfig?.pic_email || '').trim()
                    const stageLabel = String(stageConfig?.stage_label || stageKey).trim()

                    if (!ownerEmail) {
                        throw new Error(`Action Required blocked: please configure PIC email for ${stageLabel} in the GPR form.`)
                    }

                    dataItem.action_required_stage = stageKey
                    dataItem.action_required_owner = ownerName || ownerEmail
                    dataItem.action_required_owner_email = ownerEmail
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
                if (isRejectedStatus(newStatus) || isExplicitReject) {
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
                    const isNegotiationBranchCurrentStep =
                        isPendingAgreementStep(currentStep)
                        || isAgreementReachedStep(currentStep)
                        || isIssueGprBStep(currentStep)
                        || isIssueGprCStep(currentStep)

                    if (requiresVendorReply(currentStep) && !hasVendorRequestLog && !isNegotiationBranchCurrentStep) {
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

                        const pendingAfterCurrent = steps
                            .filter((s: any) => s.step_status === 'pending' && s.step_order > currentStep.step_order)
                            .sort((a: any, b: any) => Number(a.step_order || 0) - Number(b.step_order || 0))

                        const pendingAgreementStep = pendingAfterCurrent.find((s: any) => isPendingAgreementStep(s))
                        const agreementReachedStep =
                            pendingAfterCurrent.find((s: any) => isAgreementReachedStep(s))
                            || pendingAfterCurrent.find((s: any) => isDocumentCheckStep(s))

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
                                step_status: 'completed',
                                UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                            }))

                            sqlList.push(await RegisterRequestSQL.createApprovalLog({
                                request_id: dataItem.request_id,
                                step_id: pendingAgreementStep.step_id,
                                action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
                                action_type: 'approved',
                                remark: 'Pending Agreement auto-completed after sending vendor email',
                            }))
                        }

                        if (agreementReachedStep) {
                            const agreementReachedApprover = await resolveStepApprover(agreementReachedStep)
                            if (agreementReachedApprover && agreementReachedApprover !== agreementReachedStep.approver_id) {
                                sqlList.push(await RegisterRequestSQL.updateApprovalStepApprover({
                                    step_id: agreementReachedStep.step_id,
                                    approver_id: agreementReachedApprover,
                                    assignment_mode: 'AUTO',
                                    UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                                }))
                            }
                            sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                step_id: agreementReachedStep.step_id,
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

                    const actionRequiredRequested = explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED
                    const disagreementRequested =
                        explicitAction === WORKFLOW_ACTION.DISAGREE ||
                        isVendorDisagreeStatus(newStatus) ||
                        isIssueGprBStatus(newStatus) ||
                        isIssueGprCStatus(newStatus)
                    const actionBy = String(dataItem.approve_by || dataItem.UPDATE_BY || '').trim()
                    const isRequesterGprCPhase =
                        isIssueGprCStep(currentStep)
                        && !!requesterCode
                        && String(currentStep.approver_id || '').trim() === requesterCode
                        && actionBy === requesterCode

                    if (isRequesterGprCPhase && !disagreementRequested && !actionRequiredRequested) {
                        const selection = await getSelectionRecord()
                        const requesterHeadEmpCode = getGprCApproverEmpCodeFromSelection(selection)

                        if (!requesterHeadEmpCode) {
                            throw new Error('Requester must complete GPR C setup before submitting to requester head approval.')
                        }

                        if (requesterHeadEmpCode === requesterCode) {
                            throw new Error('GPR C approver must be different from requester.')
                        }

                        dataItem.request_status = currentStep.DESCRIPTION || 'Issue GPR C'

                        sqlList.push(await RegisterRequestSQL.updateApprovalStepApprover({
                            step_id: currentStep.step_id,
                            approver_id: requesterHeadEmpCode,
                            assignment_mode: 'AUTO',
                            UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                        }))
                        sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                            step_id: currentStep.step_id,
                            step_status: 'in_progress',
                            UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                        }))
                        sqlList.push(await RegisterRequestSQL.createApprovalLog({
                            request_id: dataItem.request_id,
                            step_id: currentStep.step_id,
                            action_by: actionBy || 'SYSTEM',
                            action_type: 'submitted_to_requester_head',
                            remark: dataItem.approver_remark || 'Requester submitted GPR C to requester head approval',
                        }))

                        const resultData = await MySQLExecute.executeList(sqlList)
                        postCommitTasks.push(async () => {
                            await triggerVendorDocumentEmail(dataItem.request_id, currentStep?.DESCRIPTION || 'Issue GPR C')
                        })
                        for (const task of postCommitTasks) task().catch(console.error)

                        return {
                            Status: true,
                            Message: 'GPR C submitted to requester head approval successfully',
                            ResultOnDb: resultData,
                            MethodOnDb: 'Update Status Success',
                            TotalCountOnDb: sqlList.length
                        }
                    }

                    const approvalActionType =
                        explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED
                            ? 'action_required'
                            : explicitAction === WORKFLOW_ACTION.DISAGREE
                                ? 'vendor_disagreed'
                                : 'approved'
                    const approvalRemark =
                        explicitAction === WORKFLOW_ACTION.ACTION_REQUIRED
                            ? buildActionRequiredRemark(dataItem)
                            : (dataItem.approver_remark || '')

                    const currentStepStatus =
                        isPendingAgreementStep(currentStep) && !disagreementRequested
                            ? 'completed'
                            : isAgreementReachedStep(currentStep) && disagreementRequested
                                ? 'pending'
                                : 'approved'

                    sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                        step_id: currentStep.step_id,
                        step_status: currentStepStatus,
                        UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                    }))
                    sqlList.push(await RegisterRequestSQL.createApprovalLog({
                        request_id: dataItem.request_id,
                        step_id: currentStep.step_id,
                        action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
                        action_type: approvalActionType,
                        remark: approvalRemark,
                    }))

                    const pendingAfterCurrent = steps
                        .filter((s: any) => s.step_status === 'pending' && s.step_order > currentStep.step_order)
                        .sort((a: any, b: any) => Number(a.step_order || 0) - Number(b.step_order || 0))
                    const pendingNonBranchAnywhere = steps
                        .filter((s: any) => s.step_status === 'pending' && !isDisagreedBranchStep(s) && s.step_id !== currentStep.step_id)
                        .sort((a: any, b: any) => Number(a.step_order || 0) - Number(b.step_order || 0))

                    let nextStep: any | undefined = pendingAfterCurrent[0]
                    let closeAsVendorDisagreed = false
                    const agreementReachedStepAny =
                        steps
                            .filter((s: any) => s.step_id !== currentStep.step_id && isAgreementReachedStep(s))
                            .sort((a: any, b: any) => Number(a.step_order || 0) - Number(b.step_order || 0))[0]

                    if ((isPendingAgreementStep(currentStep) || isAgreementReachedStep(currentStep)) && !disagreementRequested) {
                        // Agreement reached: skip GPR B/C/Disagreed branch and continue to normal approval chain.
                        const branchSteps = pendingAfterCurrent.filter((s: any) => isDisagreedBranchStep(s))
                        for (const branchStep of branchSteps) {
                            sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                step_id: branchStep.step_id,
                                step_status: 'skipped',
                                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                            }))
                        }
                        nextStep =
                            pendingAfterCurrent.find((s: any) => isAgreementReachedStep(s))
                            || pendingNonBranchAnywhere.find((s: any) => isAgreementReachedStep(s))
                            || pendingAfterCurrent.find((s: any) => isDocumentCheckStep(s))
                            || pendingNonBranchAnywhere.find((s: any) => isDocumentCheckStep(s))
                            || pendingAfterCurrent.find((s: any) => !isDisagreedBranchStep(s))
                            || pendingNonBranchAnywhere[0]
                    } else if (isPendingAgreementStep(currentStep) || isAgreementReachedStep(currentStep) || isIssueGprBStep(currentStep) || isIssueGprCStep(currentStep)) {
                        // In negotiation branch: explicit disagreement moves B -> C -> Disagreed.
                        // ACTION_REQUIRED is treated as additional flow and must continue main flow.
                        // Otherwise (vendor agreed) continue to normal approval chain.
                        if (!disagreementRequested || actionRequiredRequested) {
                            if (isIssueGprCStep(currentStep) && !actionRequiredRequested) {
                                nextStep = agreementReachedStepAny
                            }
                            const branchSteps = pendingAfterCurrent.filter((s: any) => isDisagreedBranchStep(s))
                            for (const branchStep of branchSteps) {
                                sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                    step_id: branchStep.step_id,
                                    step_status: 'skipped',
                                    UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                                }))
                            }
                            nextStep =
                                nextStep
                                || pendingAfterCurrent.find((s: any) => isAgreementReachedStep(s))
                                || pendingNonBranchAnywhere.find((s: any) => isAgreementReachedStep(s))
                                || pendingAfterCurrent.find((s: any) => isDocumentCheckStep(s))
                                || pendingNonBranchAnywhere.find((s: any) => isDocumentCheckStep(s))
                                || pendingAfterCurrent.find((s: any) => !isDisagreedBranchStep(s))
                                || pendingNonBranchAnywhere[0]
                        } else {
                            if (isPendingAgreementStep(currentStep) || isAgreementReachedStep(currentStep)) {
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
                        if (isIssueGprCStep(currentStep) && !disagreementRequested && !actionRequiredRequested && isAgreementReachedStep(nextStep)) {
                            sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                                step_id: nextStep.step_id,
                                step_status: 'pending',
                                UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                            }))
                        }
                        const nextStepApprover = await resolveStepApprover(nextStep)
                        if (isIssueGprCStep(nextStep) && !nextStepApprover) {
                            throw new Error('GPR C approver is not configured. Please set GPR C Approver before sending GPR C.')
                        }
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
                        if (isIssueGprBStep(nextStep)) {
                            postCommitTasks.push(async () => {
                                await triggerVendorDocumentEmail(dataItem.request_id, nextStep?.DESCRIPTION)
                            })
                        } else if (isIssueGprCStep(nextStep)) {
                            postCommitTasks.push(async () => {
                                await RegisterRequestGprCFlowService.createOrGetFlow({
                                    request_id: dataItem.request_id,
                                    UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                                })
                            })
                        } else {
                            postCommitTasks.push(async () => triggerApprovalEmails(dataItem, nextStep, nextStepApprover))
                        }
                        if (isIssueGprCStep(currentStep) && !disagreementRequested && !actionRequiredRequested) {
                            postCommitTasks.push(async () => triggerAfterGprCApprovedEmail(dataItem))
                        }
                        if (actionRequiredRequested) {
                            postCommitTasks.push(async () => triggerActionRequiredEmail(dataItem, currentStep))
                        }
                    } else if (!closeAsVendorDisagreed) {
                        sqlList.push(await RegisterRequestSQL.markRequestCompleted({
                            request_id: dataItem.request_id,
                            UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                        }))
                        if (actionRequiredRequested) {
                            postCommitTasks.push(async () => triggerActionRequiredEmail(dataItem, currentStep))
                        }
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

            try {
                await triggerCompletionEmail(dataItem)
            } catch (mailErr: any) {
                console.error('[completeRegistration] Completion email failed:', mailErr?.message)
            }

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
