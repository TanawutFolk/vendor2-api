import { MySQLExecute } from '@businessData/dbExecute'
import { RegisterRequestSQL } from '../../sql/_request-registrer/RegisterRequestSQL'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import sendEmail from '@src/config/sendEmail'
import {
    emailRequestRegisterVendorTemplate,
    emailToPMMgrTemplate,
    emailToPMGMTemplate,
    emailToMDTemplate,
    emailToAccountPICTemplate,
    emailReject1Template,
    emailCompleteTemplate,
    type ApprovalEmailData,
    type EmailCompleteData
} from '@src/config/mailTemplate'

export const RegisterRequestService = {
    // Create a new registration request
    createRequest: async (dataItem: any) => {
        try {
            // 1. Fetch Vendor details
            const vendorCheckSql = `
                SELECT 
                    v.company_name, 
                    v.address,
                    v.vendor_region,
                    vc.contact_name,
                    vc.email,
                    vc.tel_phone
                FROM vendors v
                LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id
                WHERE v.vendor_id = ${Number(dataItem.vendor_id) || 0} 
                LIMIT 1
            `
            const vendorRes = (await MySQLExecute.search(vendorCheckSql)) as RowDataPacket[]
            const vendorData = vendorRes[0] || {}
            const vendorRegion = vendorData.vendor_region || 'Local'
            const isOversea = vendorRegion.toLowerCase() === 'oversea'
            const assignmentGroup = isOversea ? 'OVERSEA PO PIC' : 'LOCAL PO PIC'

            // 2. Fetch Active Assignees
            const fetchAssigneesSql = `SELECT empName, empcode, empEmail FROM assignees_to WHERE group_name = '${assignmentGroup}' AND INUSE = 1 ORDER BY Assignees_id ASC`
            const assigneesRes = (await MySQLExecute.search(fetchAssigneesSql)) as RowDataPacket[]
            const activeAssignees = assigneesRes.map(row => ({
                empName: row.empName || row.empcode || '',
                empCode: row.empcode || '',
                empEmail: row.empEmail || ''
            }))

            if (activeAssignees.length === 0) {
                activeAssignees.push({ empName: 'Admin', empCode: 'ADMIN', empEmail: 'admin@furukawaelectric.com' })
            }

            // 3. Round-robin logic
            const lastAssignSql = `
                SELECT rr.assign_to 
                FROM request_register_vendor rr
                JOIN vendors v ON v.vendor_id = rr.vendor_id
                WHERE (v.vendor_region ${isOversea ? "= 'Oversea'" : "!= 'Oversea' OR v.vendor_region IS NULL"})
                  AND rr.assign_to IS NOT NULL 
                  AND rr.assign_to != ''
                ORDER BY rr.request_id DESC 
                LIMIT 1
            `
            const lastAssignRes = (await MySQLExecute.search(lastAssignSql)) as RowDataPacket[]
            const lastAssignTo = lastAssignRes[0]?.assign_to || ''
            const lastIdx = activeAssignees.findIndex((a: any) => a.empCode === lastAssignTo)
            const nextIndex = (lastIdx + 1) % activeAssignees.length
            const nextAssignee = activeAssignees[nextIndex]

            dataItem.assign_to = nextAssignee.empCode || ''
            dataItem.PIC_Email = nextAssignee.empEmail || ''

            // 4. Create main request
            const sqlCreate = await RegisterRequestSQL.createRequest(dataItem)
            const result = (await MySQLExecute.execute(sqlCreate)) as ResultSetHeader
            const insertedId = result.insertId

            if (!insertedId) throw new Error('Failed to insert registration request')

            // 5. Setup workflow and initial log
            const sqlList = []

            // Workflow steps
            const statusSql = await RegisterRequestSQL.getStatusOptions()
            const statusRows = (await MySQLExecute.search(statusSql)) as RowDataPacket[]
            const workflowStatuses = statusRows.filter((s: any) => s.value !== 'Rejected')

            for (const [idx, ws] of workflowStatuses.entries()) {
                const stepOrder = idx + 1
                let initialStatus = 'pending'
                if (stepOrder === 1) initialStatus = 'completed'
                else if (stepOrder === 2) initialStatus = 'in_progress'

                sqlList.push(await RegisterRequestSQL.createApprovalStep({
                    request_id: insertedId,
                    step_order: stepOrder,
                    approver_id: stepOrder <= 2 ? nextAssignee.empCode : '',
                    step_status: initialStatus,
                    DESCRIPTION: ws.label,
                    CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
                }))
            }

            // Execute steps first to get the first step ID
            await MySQLExecute.executeList(sqlList)

            // Initial log
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

            // 6. Email Trigger (Async)
            RegisterRequestService.triggerCreationEmail(dataItem, vendorData, nextAssignee, insertedId).catch(console.error)

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

    // Helper for email triggering to keep createRequest clean
    triggerCreationEmail: async (dataItem: any, vendorData: any, nextAssignee: any, insertedId: number) => {
        const requesterSql = `SELECT empName, empSurname FROM Person.MEMBER_FED WHERE empCode = '${dataItem.Request_By_EmployeeCode || ''}' LIMIT 1`
        const requesterRes = (await MySQLExecute.search(requesterSql)) as RowDataPacket[]
        const requesterData = requesterRes[0] || {}
        const requesterFullName = requesterData.empName ? `${requesterData.empName} ${requesterData.empSurname || ''}`.trim() : (dataItem.Request_By_EmployeeCode || 'Unknown')

        const currentYear = new Date().getFullYear().toString().slice(-2)
        const paddedId = String(insertedId).padStart(4, '0')
        const requestNumber = `Register_Selection-${currentYear}-${paddedId}`
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/workspace/request-register`

        if (nextAssignee.empEmail) {
            const emailHtml = emailRequestRegisterVendorTemplate({
                requestNumber,
                recipientName: nextAssignee.empName,
                stepAction: 'check',
                vendorName: vendorData.company_name || 'N/A',
                address: vendorData.address || 'N/A',
                contactPic: vendorData.contact_name || 'N/A',
                email: vendorData.email || 'N/A',
                tel: vendorData.tel_phone || 'N/A',
                supportProduct: dataItem.supportProduct_Process || 'N/A',
                purchaseFrequency: dataItem.purchase_frequency || 'N/A',
                systemLink: systemLink,
                picName: requesterFullName,
            })
            const emailSubject = `[Request Check] Please request check register vendor follow as "${requestNumber}"`
            await sendEmail(emailHtml, nextAssignee.empEmail, emailSubject)
        }
    },

    // Insert a new document
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

    // Get all registration requests
    getAllRequests: async (dataItem: any) => {
        const sqlArray = await RegisterRequestSQL.getAllRequests(dataItem)
        const result = (await MySQLExecute.searchList(sqlArray)) as any[][]

        return {
            totalCount: result[0]?.[0]?.TOTAL_COUNT || 0,
            data: result[1] || []
        }
    },

    // Get a specific request by ID
    getById: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.getById(dataItem)
        const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return result[0] || null
    },

    // Get status options
    getStatusOptions: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.getStatusOptions(dataItem)
        const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return result
    },

    // Update request data
    updateRequest: async (dataItem: any) => {
        try {
            const requestId = Number(dataItem.request_id)
            if (!requestId) throw new Error('Invalid request_id')

            // Authorization & Status Checks
            const checkSql = `SELECT request_status, assign_to FROM request_register_vendor WHERE request_id = ${requestId} AND INUSE = 1 LIMIT 1`
            const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
            const request = checkRes[0]
            if (!request) throw new Error('Request not found')

            const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: requestId })
            const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
            const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

            if (!currentStep || currentStep.step_order !== 2) {
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

    // Update status (approve / reject)
    updateStatus: async (dataItem: any) => {
        try {
            const newStatus = dataItem.request_status || ''
            const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: dataItem.request_id })
            const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
            const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

            // We need vendor_id + vendor_region for updating vendor status and account group lookup
            const checkSql = `
                SELECT rr.vendor_id, rr.assign_to, rr.gpr_data, v.vendor_region
                FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
                WHERE rr.request_id = ${dataItem.request_id} LIMIT 1
            `
            const checkRes = (await MySQLExecute.search(checkSql)) as any[]
            const vendor_id = checkRes[0]?.vendor_id
            const assign_to = checkRes[0]?.assign_to
            const rawGprData = checkRes[0]?.gpr_data
            const isOversea = (checkRes[0]?.vendor_region || '').toLowerCase() === 'oversea'

            // ── Auth Check ───────────────────────────────────────────────────
            if (currentStep) {
                const actionBy = dataItem.approve_by || dataItem.UPDATE_BY || ''
                const currentDesc = (currentStep.DESCRIPTION || '').toLowerCase()

                // Is this a PIC-handled step? (description contains 'pic')
                const isPicStep = currentDesc.includes('pic')

                // Is this a management role step requiring a specific approver?
                const requiresRoleApprover =
                    currentDesc.includes('mgr') || currentDesc.includes('manager') ||
                    currentDesc.includes('gm') || currentDesc.includes('general manager') ||
                    currentDesc.includes('md') || currentDesc.includes('director') ||
                    currentDesc.includes('account') ||
                    currentDesc.includes('checker')

                if (currentStep.approver_id) {
                    const isDesignatedApprover = currentStep.approver_id === actionBy
                    // PIC steps: also allow the assigned PIC (assign_to) to action
                    const isAssignedPic = isPicStep && assign_to && assign_to === actionBy

                    if (actionBy && !isDesignatedApprover && !isAssignedPic) {
                        throw new Error(`Unauthorized: step "${currentStep.DESCRIPTION}" requires approver [${currentStep.approver_id}]`)
                    }
                } else if (requiresRoleApprover) {
                    // Role step with no approver assigned yet — block everyone
                    throw new Error(`Approver not yet assigned for step "${currentStep.DESCRIPTION}". Please contact admin.`)
                } else {
                    // PIC step with no explicit approver — only assign_to may act
                    if (actionBy && assign_to && assign_to !== actionBy) {
                        throw new Error(`Unauthorized: only the assigned PIC [${assign_to}] can action this step`)
                    }
                }

                // ── Account Registered Vendor Code Check ──
                if (currentDesc.includes('account registered') && newStatus !== 'Rejected') {
                    let extractedVendorCode = ''
                    if (rawGprData) {
                        try {
                            const parsedGpr = typeof rawGprData === 'string' ? JSON.parse(rawGprData) : rawGprData
                            extractedVendorCode = parsedGpr?.vendor_code_selector || ''
                        } catch (e) {
                            console.error('Failed to parse gpr_data', e)
                        }
                    }
                    if (!extractedVendorCode.trim()) {
                        throw new Error('Approval blocked: You must open the GPR Form and specify the "Vendor Code" before approving this step.')
                    }
                    dataItem.vendor_code_extracted = extractedVendorCode
                }
            }

            const sqlList = []
            sqlList.push(await RegisterRequestSQL.updateStatus(dataItem))

            if (dataItem.vendor_code_extracted) {
                sqlList.push(`UPDATE request_register_vendor SET vendor_code = '${dataItem.vendor_code_extracted}' WHERE request_id = ${dataItem.request_id}`)
                if (vendor_id) {
                    sqlList.push(`UPDATE vendors SET fft_vendor_code = '${dataItem.vendor_code_extracted}' WHERE vendor_id = ${vendor_id}`)
                }
            }

            if (steps.length > 0) {
                if (newStatus === 'Rejected') {
                    if (vendor_id) {
                        sqlList.push(`UPDATE vendors SET fft_status = 2 WHERE vendor_id = ${vendor_id}`)
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
                    // Rejection email — notify PIC that request was rejected
                    RegisterRequestService.triggerRejectionEmail(dataItem, currentStep).catch(console.error)
                } else if (currentStep) {
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

                    // Activate Next Step Logic
                    let nextStep = steps.find((s: any) => s.step_order === currentStep.step_order + 1 && s.step_status === 'pending')

                    // 🔥 Force terminate flow if the step we just approved is "Account Registered"
                    const isAccountRegistered = (currentStep.DESCRIPTION || '').toLowerCase().includes('account registered')
                    if (isAccountRegistered) {
                        nextStep = undefined // Force block the next step
                        // Mark any lingering steps as skipped
                        const remainingSteps = steps.filter((s: any) => s.step_status === 'pending' && s.step_order > currentStep.step_order)
                        for (const rs of remainingSteps) {
                            sqlList.push(`UPDATE request_approval_step SET step_status = 'skipped', UPDATE_BY = '${dataItem.UPDATE_BY || 'SYSTEM'}' WHERE step_id = ${rs.step_id}`)
                        }
                    }

                    if (nextStep) {
                        // ── Dynamic Approver Lookup (group names must match assignees_to.group_name exactly) ──
                        let dynamicApprover = ''
                        const desc = (nextStep.DESCRIPTION || '').toLowerCase()

                        if (desc.includes('gm') || desc.includes('general manager')) {
                            // PO GM — check BEFORE 'mgr' to avoid false-match on "PO GM Approve"
                            const gmRes = await MySQLExecute.search("SELECT empcode FROM assignees_to WHERE group_name = 'PO GM' AND INUSE = 1 LIMIT 1") as any[]
                            if (gmRes.length > 0) dynamicApprover = gmRes[0].empcode

                        } else if (desc.includes('mgr') || desc.includes('manager')) {
                            // PO Mgr — note: DB group_name = 'PO_MGR'
                            const mgrRes = await MySQLExecute.search("SELECT empcode FROM assignees_to WHERE group_name = 'PO_MGR' AND INUSE = 1 LIMIT 1") as any[]
                            if (mgrRes.length > 0) dynamicApprover = mgrRes[0].empcode

                        } else if (desc.includes('md') || desc.includes('director')) {
                            const mdRes = await MySQLExecute.search("SELECT empcode FROM assignees_to WHERE group_name = 'MD' AND INUSE = 1 LIMIT 1") as any[]
                            if (mdRes.length > 0) dynamicApprover = mdRes[0].empcode

                        } else if (desc.includes('account')) {
                            // Account group differs by vendor region
                            const acctGroup = isOversea ? 'Acc_Oversea_Main' : 'Acc_Local_Main'
                            const acctRes = await MySQLExecute.search(`SELECT empcode FROM assignees_to WHERE group_name = '${acctGroup}' AND INUSE = 1 LIMIT 1`) as any[]
                            if (acctRes.length > 0) dynamicApprover = acctRes[0].empcode

                        } else if (desc.includes('checker') || desc.includes('check all document')) {
                            // PO Checker step
                            const checkerRes = await MySQLExecute.search("SELECT empcode FROM assignees_to WHERE group_name = 'PO CHECKER (Main)' AND INUSE = 1 LIMIT 1") as any[]
                            if (checkerRes.length > 0) dynamicApprover = checkerRes[0].empcode
                        }
                        // Steps with no role keyword (e.g., PIC steps) → no dynamicApprover → assign_to remains responsible

                        if (dynamicApprover) {
                            sqlList.push(`UPDATE request_approval_step SET approver_id = '${dynamicApprover}' WHERE step_id = ${nextStep.step_id}`)
                        }

                        sqlList.push(await RegisterRequestSQL.updateApprovalStep({
                            step_id: nextStep.step_id,
                            step_status: 'in_progress',
                            UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                        }))

                        // Trigger Email Notifications (Async)
                        RegisterRequestService.triggerApprovalEmails(dataItem, nextStep, dynamicApprover, currentStep).catch(console.error)
                    } else {
                        // No more steps — close the request and notify requester
                        sqlList.push(`UPDATE request_register_vendor SET request_status = 'Completed', approve_date = NOW() WHERE request_id = ${dataItem.request_id}`)
                        // Completion email — notify requester that registration is done
                        RegisterRequestService.triggerCompletionEmail(dataItem).catch(console.error)
                    }
                }
            }

            const resultData = await MySQLExecute.executeList(sqlList)
            return {
                Status: true,
                Message: 'Status updated successfully',
                ResultOnDb: resultData,
                MethodOnDb: 'Update Status Success',
                TotalCountOnDb: sqlList.length
            }
        } catch (error: any) {
            console.error('Error in RegisterRequestService.updateStatus:', error)
            return {
                Status: false,
                Message: error?.message || 'Update status failed',
                ResultOnDb: [],
                MethodOnDb: 'Update Status Failed',
                TotalCountOnDb: 0
            }
        }
    },

    // Helper for approval notifications — fires async after DB commit
    triggerApprovalEmails: async (dataItem: any, nextStep: any, dynamicApprover: string, currentStep: any) => {
        try {
            const requestId = dataItem.request_id

            // ── Fetch vendor + request + requester data ────────────────────
            const vendorSql = `
                SELECT v.company_name, v.address,
                       vc.contact_name, vc.email AS vendor_email, vc.tel_phone,
                       rr.assign_to, rr.supportProduct_Process, rr.purchase_frequency, rr.cc_emails,
                       rr.Request_By_EmployeeCode
                FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
                LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id
                WHERE rr.request_id = ${requestId} LIMIT 1
            `
            const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
            const vd = vendorRes[0] || {}

            // PIC email (primary sender / signer)
            const picSql = `SELECT empName, empSurname, empEmail FROM assignees_to WHERE empcode = '${vd.assign_to || ''}' LIMIT 1`
            const picRes = (await MySQLExecute.search(picSql)) as any[]
            const picRow = picRes[0] || {}
            const picName = picRow.empName ? `${picRow.empName} ${picRow.empSurname || ''}`.trim() : (vd.assign_to || 'PIC')
            const picEmail = picRow.empEmail || ''
            const picTel = ''

            // Approver email from assignees_to or fallback to DB step / PIC
            const targetApprover = dynamicApprover || nextStep?.approver_id || vd.assign_to || ''
            let approverEmail = ''
            if (targetApprover) {
                const approverEmailSql = `SELECT empEmail FROM assignees_to WHERE empcode = '${targetApprover}' LIMIT 1`
                const approverEmailRes = (await MySQLExecute.search(approverEmailSql)) as any[]
                approverEmail = approverEmailRes[0]?.empEmail || ''
            }

            // Request number
            const currentYear = new Date().getFullYear().toString().slice(-2)
            const paddedId = String(requestId).padStart(4, '0')
            const requestNumber = `Register_Selection-${currentYear}-${paddedId}`
            const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

            // CC list: pic + cc_emails
            const ccEmails: string[] = []
            if (picEmail) ccEmails.push(picEmail)
            if (vd.cc_emails) {
                try {
                    const ccParsed = typeof vd.cc_emails === 'string' ? JSON.parse(vd.cc_emails) : vd.cc_emails
                    if (Array.isArray(ccParsed)) {
                        ccParsed.forEach((c: any) => { if (c?.email) ccEmails.push(c.email) })
                    }
                } catch { /* ignore */ }
            }

            const baseEmailData: ApprovalEmailData = {
                toEmail: approverEmail,
                ccEmail: ccEmails.join('; '),
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
            }

            // ── Choose template based on next step DESCRIPTION ─────────────
            if (!approverEmail) return  // no email = skip silently

            const nextDesc = (nextStep?.DESCRIPTION || '').toLowerCase()
            let emailHtml: string
            let emailSubject: string

            if (nextDesc.includes('gm') || nextDesc.includes('general manager')) {
                emailHtml = emailToPMGMTemplate(baseEmailData)
                emailSubject = `[Request Approval] Please approve register vendor "${requestNumber}" - PO GM Step`
            } else if (nextDesc.includes('manager') || nextDesc.includes('mgr')) {
                emailHtml = emailToPMMgrTemplate(baseEmailData)
                emailSubject = `[Request Approval] Please approve register vendor "${requestNumber}" - PO Mgr Step`
            } else if (nextDesc.includes('md') || nextDesc.includes('director')) {
                emailHtml = emailToMDTemplate(baseEmailData)
                emailSubject = `[Request Approval] Please approve register vendor "${requestNumber}" - MD Approval`
            } else if (nextDesc.includes('account')) {
                emailHtml = emailToAccountPICTemplate({ ...baseEmailData, recipientName: 'Account PIC' })
                emailSubject = `[Request Action] Please process register vendor "${requestNumber}" - Account Step`
            } else if (nextDesc.includes('checker') || nextDesc.includes('check all document')) {
                emailHtml = emailToPMMgrTemplate({ ...baseEmailData, toEmail: approverEmail, recipientName: 'Document Checker' })
                emailSubject = `[Request Action] Please check document for register vendor "${requestNumber}"`
            } else {
                // Generic fallback — send to PIC (step 2 PIC check etc.)
                emailHtml = emailToPMMgrTemplate({ ...baseEmailData, toEmail: approverEmail })
                emailSubject = `[Request Approval] Please process register vendor "${requestNumber}"`
            }

            await sendEmail(emailHtml, approverEmail, emailSubject, ccEmails)
        } catch (err: any) {
            console.error('[triggerApprovalEmails] Failed:', err?.message)
        }
    },

    // Helper for rejection email — fires async after DB commit
    triggerRejectionEmail: async (dataItem: any, currentStep: any) => {
        try {
            const requestId = dataItem.request_id

            const vendorSql = `
                SELECT v.company_name, v.address,
                       vc.contact_name, vc.email AS vendor_email, vc.tel_phone,
                       rr.assign_to, rr.supportProduct_Process, rr.purchase_frequency, rr.cc_emails,
                       rr.Request_By_EmployeeCode
                FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
                LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id
                WHERE rr.request_id = ${requestId} LIMIT 1
            `
            const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
            const vd = vendorRes[0] || {}

            // PIC email
            const picEmailSql = `SELECT empName, empSurname, empEmail FROM assignees_to WHERE empcode = '${vd.assign_to || ''}' LIMIT 1`
            const picRes = (await MySQLExecute.search(picEmailSql)) as any[]
            const picRow = picRes[0] || {}
            const picEmail = picRow.empEmail || ''
            const picName = picRow.empName ? `${picRow.empName} ${picRow.empSurname || ''}`.trim() : (vd.assign_to || 'PIC')
            const picTel = ''

            // Approver who rejected
            const approverEmailSql = `SELECT empEmail FROM assignees_to WHERE empcode = '${currentStep?.approver_id || ''}' LIMIT 1`
            const approverRes = (await MySQLExecute.search(approverEmailSql)) as any[]
            const approverEmail = approverRes[0]?.empEmail || ''

            const currentYear = new Date().getFullYear().toString().slice(-2)
            const paddedId = String(requestId).padStart(4, '0')
            const requestNumber = `Register_Selection-${currentYear}-${paddedId}`
            const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

            const ccEmails: string[] = []
            if (approverEmail) ccEmails.push(approverEmail)
            if (vd.cc_emails) {
                try {
                    const ccParsed = typeof vd.cc_emails === 'string' ? JSON.parse(vd.cc_emails) : vd.cc_emails
                    if (Array.isArray(ccParsed)) {
                        ccParsed.forEach((c: any) => { if (c?.email) ccEmails.push(c.email) })
                    }
                } catch { /* ignore */ }
            }

            if (!picEmail) return

            const rejectRemark = dataItem.approver_remark || ''
            const emailHtml = emailReject1Template({
                toEmail: picEmail,
                ccEmailLine1: approverEmail,
                ccEmailLine2: ccEmails.filter(e => e !== approverEmail).join('; '),
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

            await sendEmail(
                emailHtml,
                picEmail,
                `[REJECT] Register vendor "${requestNumber}" has been rejected`,
                ccEmails
            )
        } catch (err: any) {
            console.error('[triggerRejectionEmail] Failed:', err?.message)
        }
    },

    // Helper for completion email
    triggerCompletionEmail: async (dataItem: any) => {
        try {
            const requestId = dataItem.request_id

            const vendorSql = `
                SELECT v.company_name, v.address,
                       vc.contact_name, vc.email AS vendor_email, vc.tel_phone,
                       rr.assign_to, rr.supportProduct_Process, rr.purchase_frequency, rr.cc_emails,
                       rr.Request_By_EmployeeCode, rr.vendor_code
                FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
                LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id
                WHERE rr.request_id = ${requestId} LIMIT 1
            `
            const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
            const vd = vendorRes[0] || {}

            // Requester
            const requesterSql = `SELECT empName, empSurname, empEmail FROM Person.MEMBER_FED WHERE empCode = '${vd.Request_By_EmployeeCode || ''}' LIMIT 1`
            const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
            const req = requesterRes[0] || {}
            const requesterName = req.empName ? `${req.empName} ${req.empSurname || ''}`.trim() : vd.Request_By_EmployeeCode
            const requesterEmail = req.empEmail || ''

            const picEmailSql = `SELECT empName, empSurname, empEmail FROM assignees_to WHERE empcode = '${vd.assign_to || ''}' LIMIT 1`
            const picRes = (await MySQLExecute.search(picEmailSql)) as any[]
            const picRow = picRes[0] || {}
            const picName = picRow.empName ? `${picRow.empName} ${picRow.empSurname || ''}`.trim() : (vd.assign_to || 'PIC')
            const picEmail = picRow.empEmail || ''
            const picTel = ''

            const currentYear = new Date().getFullYear().toString().slice(-2)
            const paddedId = String(requestId).padStart(4, '0')
            const requestNumber = `Register_Selection-${currentYear}-${paddedId}`
            const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

            const ccEmails: string[] = []
            if (picEmail) ccEmails.push(picEmail)

            if (!requesterEmail) return

            const completionData: EmailCompleteData = {
                toEmail: requesterEmail,
                ccEmail: ccEmails.join('; '),
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
                userName: requesterName || 'Requester',
            }

            const emailHtml = emailCompleteTemplate(completionData)
            await sendEmail(
                emailHtml,
                requesterEmail,
                `[Complete] Register vendor "${requestNumber}" is now completed`,
                ccEmails
            )
        } catch (err: any) {
            console.error('[triggerCompletionEmail] Failed:', err?.message)
        }
    },

    // Save GPR form
    saveGprForm: async (dataItem: any) => {
        try {
            const reqId = dataItem.request_id
            if (!reqId) throw new Error('Missing request_id')

            const formData = typeof dataItem.gpr_data === 'string' ? JSON.parse(dataItem.gpr_data) : (dataItem.gpr_data || {})
            formData.request_id = reqId
            formData.UPDATE_BY = dataItem.UPDATE_BY || 'SYSTEM'

            const sqlList = []

            // 1. Check for selection main table
            const checkSql = await RegisterRequestSQL.checkSelectionExists(formData)
            const checkRes = (await MySQLExecute.search(checkSql)) as any[]
            let selection_id = checkRes[0]?.selection_id

            if (selection_id) {
                formData.selection_id = selection_id
                sqlList.push(await RegisterRequestSQL.updateSelection(formData))
            } else {
                const insertSql = await RegisterRequestSQL.insertSelection(formData)
                const res = (await MySQLExecute.execute(insertSql)) as any
                selection_id = res.insertId
                formData.selection_id = selection_id
            }

            if (!selection_id) throw new Error('Failed to create/identify GPR selection record')

            // 2. Clear sub-tables
            sqlList.push(await RegisterRequestSQL.deleteFinancials({ selection_id }))
            sqlList.push(await RegisterRequestSQL.deleteCriteria({ selection_id }))

            // 3. Prepare Batch Inserts
            if (formData.sales_profit) {
                for (const sp of formData.sales_profit) {
                    sp.selection_id = selection_id
                    sqlList.push(await RegisterRequestSQL.insertFinancial(sp))
                }
            }
            if (formData.criteria) {
                for (const cr of formData.criteria) {
                    cr.selection_id = selection_id
                    sqlList.push(await RegisterRequestSQL.insertCriteria(cr))
                }
            }

            const resultData = await MySQLExecute.executeList(sqlList)
            return {
                Status: true,
                Message: 'GPR Form saved successfully',
                ResultOnDb: resultData,
                MethodOnDb: 'Save GPR Form',
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Save failed',
                ResultOnDb: [],
                MethodOnDb: 'Save GPR Form Failed',
                TotalCountOnDb: 0
            }
        }
    },

    // Get GPR form
    getGprForm: async (dataItem: any) => {
        const selectionSql = await RegisterRequestSQL.getSelection(dataItem)
        const selRes = (await MySQLExecute.search(selectionSql)) as any[]
        if (!selRes[0]) return null

        const selection_id = selRes[0].selection_id
        const finSql = await RegisterRequestSQL.getFinancials({ selection_id })
        const critSql = await RegisterRequestSQL.getCriteria({ selection_id })

        const [finRes, critRes] = await Promise.all([
            MySQLExecute.search(finSql) as Promise<any[]>,
            MySQLExecute.search(critSql) as Promise<any[]>
        ])

        return {
            ...selRes[0],
            sales_profit: finRes,
            criteria: critRes
        }
    },

    // Final completion
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
