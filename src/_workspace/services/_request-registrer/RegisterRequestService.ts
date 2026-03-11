import { MySQLExecute } from '@businessData/dbExecute'
import { RegisterRequestSQL } from '../../sql/_request-registrer/RegisterRequestSQL'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import sendEmail from '@src/config/sendEmail'
import { registerVendorTemplate, vendorAgreementTemplate } from '@src/config/mailTemplate'

export const RegisterRequestService = {
    // Create a new registration request and return the inserted ID
    createRequest: async (dataItem: any) => {
        // 1. Fetch Vendor details (including Region, address, contacts)
        const vendorSql = `
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
        const vendorRes = (await MySQLExecute.search(vendorSql)) as RowDataPacket[]
        const vendorData = vendorRes[0] || {}
        const vendorRegion = vendorData.vendor_region || 'Local'
        const isOversea = vendorRegion.toLowerCase() === 'oversea'
        const assignmentGroup = isOversea ? 'Oversea' : 'Local'

        // 2. Fetch Active Assignees from DB (must be seeded manually in assignees_to)
        const fetchAssigneesSql = `SELECT empName, empcode, empEmail FROM assignees_to WHERE group_name = '${assignmentGroup}' AND INUSE = 1 ORDER BY Assignees_id ASC`
        const assigneesRes = (await MySQLExecute.search(fetchAssigneesSql)) as RowDataPacket[]

        const activeAssignees: { empName: string; empCode: string; empEmail: string }[] = assigneesRes.map(row => ({
            empName: row.empName || row.empcode || '', // Fallback to empCode if empName is null
            empCode: row.empcode || '',
            empEmail: row.empEmail || ''
        }))

        // Fallback in case table is empty or all inactive
        if (activeAssignees.length === 0) {
            activeAssignees.push({ empName: 'Admin', empCode: 'ADMIN', empEmail: 'admin@furukawaelectric.com' })
        }

        // 3. Find the LAST assigned person for this specific region from request_register_vendor
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

        // 4. Calculate the NEXT person index (match on empCode)
        const lastIdx = activeAssignees.findIndex((a: any) => a.empCode === lastAssignTo) // -1 if not found
        const nextIndex = (lastIdx + 1) % activeAssignees.length
        const nextAssignee = activeAssignees[nextIndex]

        // 5. Inject both assign_to (empCode) and PIC_Email into dataItem and save
        dataItem.assign_to = nextAssignee.empCode || ''
        dataItem.PIC_Email = nextAssignee.empEmail || ''

        const sql = await RegisterRequestSQL.createRequest(dataItem)
        const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
        const insertedId = result.insertId

        // 6. Fetch Requester Info for Email
        const requesterSql = `SELECT empName, empSurname FROM Person.MEMBER_FED WHERE empCode = '${dataItem.Request_By_EmployeeCode || ''}' LIMIT 1`
        const requesterRes = (await MySQLExecute.search(requesterSql)) as RowDataPacket[]
        const requesterData = requesterRes[0] || {}
        const requesterFullName = requesterData.empName ? `${requesterData.empName} ${requesterData.empSurname || ''}`.trim() : (dataItem.Request_By_EmployeeCode || 'Unknown')

        // 7. Format Request Number (e.g. Register_Selection-26-0001)
        const currentYear = new Date().getFullYear().toString().slice(-2)
        const paddedId = String(insertedId).padStart(4, '0')
        const requestNumber = `Register_Selection-${currentYear}-${paddedId}`

        // 8. Generate System Link (From ENV or generic local fallback)
        const systemOrigin = process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'
        // Using common route format based on existing paths, update if frontend routing requires a different format
        const systemLink = `${systemOrigin}/workspace/request-register`

        // 9. Send Email to PIC using the new Template
        if (nextAssignee.empEmail) {
            const emailHtml = registerVendorTemplate({
                requestNumber: requestNumber,
                picName: nextAssignee.empName,
                vendorName: vendorData.company_name || 'N/A',
                address: vendorData.address || 'N/A',
                contactPic: vendorData.contact_name || 'N/A',
                email: vendorData.email || 'N/A',
                tel: vendorData.tel_phone || 'N/A',
                supportProduct: dataItem.supportProduct_Process || 'N/A',
                purchaseFrequency: dataItem.purchase_frequency || 'N/A',
                systemLink: systemLink,
                requesterName: requesterFullName,
                requesterTel: 'Tel. Ext in Directory' // Hardcoded or fetch from another field if available
            })

            // Run sendEmail asynchronously without blocking the API response
            sendEmail(emailHtml, nextAssignee.empEmail).catch((err: any) => {
                console.error('Failed to send register email to PIC:', err)
            })
        }

        // ── Auto-create approval steps from m_request_status ──
        const statusSql = RegisterRequestSQL.getStatusOptions()
        const statusRows = (await MySQLExecute.search(statusSql)) as RowDataPacket[]
        // Exclude 'Rejected' — it's not a step, it's an action that can happen at any point
        const workflowStatuses = statusRows.filter((s: any) => s.value !== 'Rejected')

        for (const [idx, ws] of workflowStatuses.entries()) {
            const stepOrder = idx + 1
            let initialStatus = 'pending'
            if (stepOrder === 1) initialStatus = 'completed' // "Sent To PO" starts completed
            else if (stepOrder === 2) initialStatus = 'in_progress' // Next step starts in-progress

            const stepSql = await RegisterRequestSQL.createApprovalStep({
                request_id: insertedId,
                step_order: stepOrder,
                approver_id: stepOrder <= 2 ? nextAssignee.empCode : '',
                step_status: initialStatus,
                DESCRIPTION: ws.label,
                CREATE_BY: dataItem.CREATE_BY || 'SYSTEM',
            })
            await MySQLExecute.execute(stepSql)
        }

        // ── Auto-create initial approval log (link to first step) ──
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

        return insertedId
    },

    // Insert a new document for a registration request
    createDocument: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.createDocument(dataItem)
        const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
        return result.insertId
    },

    // Get all registration requests
    getAllRequests: async (dataItem?: any, sqlWhere: string = '') => {
        // Check for Global Search
        const globalSearchFilter = dataItem?.SearchFilters?.find((item: any) => item.id === 'global_search')
        if (globalSearchFilter?.value) {
            // Reusing FindVendorSQL's global search logic or building a custom one here if needed
            // For now, passing down to SQL if we implement it, or we can handle request_register specific fields

            // Note: If you have a specific generateGlobalSearchSql in RegisterRequestSQL, call it instead.
            // Assuming we just pass down sqlWhere for column filters for now
        }

        // Returns string[] — use searchList to run each query separately
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

    // Get all active status options from m_request_status
    getStatusOptions: async () => {
        const sql = RegisterRequestSQL.getStatusOptions()
        const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return result
    },

    // Update status (approve / reject) + auto-update approval step & log
    updateStatus: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.updateStatus(dataItem)
        await MySQLExecute.execute(sql)

        const newStatus = dataItem.request_status || ''

        // ── Find all approval steps for this request (sorted by step_order) ──
        const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: dataItem.request_id })
        const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
        if (steps.length === 0) return true

        // ── Find the current in_progress step ──
        const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

        if (newStatus === 'Rejected') {
            // Reject: mark current step as rejected, skip all remaining pending steps
            if (currentStep) {
                const rejectSql = await RegisterRequestSQL.updateApprovalStep({
                    step_id: currentStep.step_id,
                    step_status: 'rejected',
                    UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                })
                await MySQLExecute.execute(rejectSql)

                const logSql = await RegisterRequestSQL.createApprovalLog({
                    request_id: dataItem.request_id,
                    step_id: currentStep.step_id,
                    action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
                    action_type: 'rejected',
                    remark: dataItem.approver_remark || '',
                })
                await MySQLExecute.execute(logSql)
            }

            // Skip all remaining pending steps
            const pendingSteps = steps.filter((s: any) => s.step_status === 'pending')
            for (const ps of pendingSteps) {
                const skipSql = await RegisterRequestSQL.updateApprovalStep({
                    step_id: ps.step_id,
                    step_status: 'skipped',
                    UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                })
                await MySQLExecute.execute(skipSql)
            }
        } else {
            // Approve/advance: mark current step as approved, activate next step
            if (currentStep) {
                const approveSql = await RegisterRequestSQL.updateApprovalStep({
                    step_id: currentStep.step_id,
                    step_status: 'approved',
                    UPDATE_BY: dataItem.UPDATE_BY || dataItem.approve_by || 'SYSTEM',
                })
                await MySQLExecute.execute(approveSql)

                const logSql = await RegisterRequestSQL.createApprovalLog({
                    request_id: dataItem.request_id,
                    step_id: currentStep.step_id,
                    action_by: dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM',
                    action_type: 'approved',
                    remark: dataItem.approver_remark || '',
                })
                await MySQLExecute.execute(logSql)

                // Activate next pending step
                const nextStep = steps.find((s: any) => s.step_order === currentStep.step_order + 1 && s.step_status === 'pending')
                if (nextStep) {

                    // --- Dynamic Approver Assignment ---
                    let dynamicApprover = ''
                    const descLower = (nextStep.DESCRIPTION || '').toLowerCase()

                    if (descLower.includes('manager')) {
                        const mgrSql = `SELECT empcode FROM assignees_to WHERE group_name = 'PO_Manager' AND INUSE = 1 LIMIT 1`
                        const mgrRes = (await MySQLExecute.search(mgrSql)) as RowDataPacket[]
                        if (mgrRes.length > 0) dynamicApprover = mgrRes[0].empcode
                    } else if (descLower.includes('md') || descLower.includes('director')) {
                        const mdSql = `SELECT empcode FROM assignees_to WHERE group_name = 'MD' AND INUSE = 1 LIMIT 1`
                        const mdRes = (await MySQLExecute.search(mdSql)) as RowDataPacket[]
                        if (mdRes.length > 0) dynamicApprover = mdRes[0].empcode
                    }

                    // Update approver_id if we found one
                    if (dynamicApprover) {
                        const assignSql = `UPDATE request_approval_step SET approver_id = '${dynamicApprover}' WHERE step_id = ${nextStep.step_id}`
                        await MySQLExecute.execute(assignSql)
                    }

                    const activateSql = await RegisterRequestSQL.updateApprovalStep({
                        step_id: nextStep.step_id,
                        step_status: 'in_progress',
                        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                    })
                    await MySQLExecute.execute(activateSql)
                }
            }
        }

        return true
    },

    // Create an approval step for a request
    createApprovalStep: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.createApprovalStep(dataItem)
        const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
        return result.insertId
    },

    // Get all approval steps for a request
    getApprovalSteps: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.getApprovalSteps(dataItem)
        const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return result
    },

    // Update an approval step status
    updateApprovalStep: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.updateApprovalStep(dataItem)
        await MySQLExecute.execute(sql)
        return true
    },

    // Create an approval log entry
    createApprovalLog: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.createApprovalLog(dataItem)
        const result = (await MySQLExecute.execute(sql)) as ResultSetHeader
        return result.insertId
    },

    // Get all approval logs for a request
    getApprovalLogs: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.getApprovalLogs(dataItem)
        const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return result
    },

    // Send agreement email to vendor (emailmain), CC PIC
    sendAgreementEmail: async (dataItem: any) => {
        const {
            request_id,
            vendor_id,
            emailmain,
            company_name,
            address,
            contacts,
            supportProduct_Process,
            purchase_frequency,
            assign_to,
            PIC_Email,
            vendor_contact_id,
            isReregister,
        } = dataItem

        if (!emailmain) {
            throw new Error('Vendor emailmain is missing — cannot send agreement email')
        }

        // Format request number
        const currentYear = new Date().getFullYear().toString().slice(-2)
        const paddedId = String(Number(request_id) || 0).padStart(4, '0')
        const requestNumber = `Register_Selection-${currentYear}-${isReregister ? 'R' : 'N'}${paddedId}`

        // Resolve PIC name from DB
        const picSql = `SELECT empName, empSurname FROM Person.MEMBER_FED WHERE empCode = '${assign_to || ''}' LIMIT 1`
        const picRes = (await MySQLExecute.search(picSql)) as RowDataPacket[]
        const picRow = picRes[0] || {}
        const picName = picRow.empName ? `${picRow.empName} ${picRow.empSurname || ''}`.trim() : (assign_to || 'PIC')

        // Parse first contact name from JSON field
        let contactName = '-'
        let targetEmail = emailmain

        try {
            const contactsParsed = typeof contacts === 'string' ? JSON.parse(contacts) : (contacts || [])

            // If we have a specific vendor_contact_id chosen, try to find that specific contact
            if (vendor_contact_id) {
                const specificContact = contactsParsed.find((c: any) => c && c.vendor_contact_id === Number(vendor_contact_id))
                if (specificContact) {
                    if (specificContact.contact_name) contactName = specificContact.contact_name
                    if (specificContact.email) targetEmail = specificContact.email
                }
            } else {
                // Fallback to first contact if none chosen
                const first = contactsParsed.find((c: any) => c)
                if (first?.contact_name) contactName = first.contact_name
            }
        } catch { /* ignore */ }

        if (!targetEmail) {
            throw new Error('Vendor target email is missing — cannot send agreement email')
        }

        const emailHtml = vendorAgreementTemplate({
            requestNumber,
            vendorName: company_name || 'N/A',
            vendorAddress: address || '-',
            contactName,
            picName,
            picEmail: PIC_Email || '',
            supportProduct: supportProduct_Process || '-',
            purchaseFrequency: purchase_frequency || '-',
            isReregister: !!isReregister,
        })

        // Send to targeted vendor email (fallback to emailmain), CC PIC
        await sendEmail(emailHtml, targetEmail)
        if (PIC_Email && PIC_Email !== targetEmail) {
            sendEmail(emailHtml, PIC_Email).catch(() => { })
        }

        return { sent_to: targetEmail, cc: PIC_Email || null, requestNumber }
    }
}
