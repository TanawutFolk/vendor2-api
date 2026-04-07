import { MySQLExecute } from '@businessData/dbExecute'
import { RegisterRequestSQL } from '../../sql/_request-registrer/RegisterRequestSQL'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import sendEmail from '@src/config/sendEmail'
import { registerVendorTemplate, vendorAgreementTemplate, accountNotificationTemplate, completionEmailTemplate } from '@src/config/mailTemplate'

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

        // 9. Send Email to PIC (Checker) using the internal step template
        if (nextAssignee.empEmail) {
            const emailHtml = registerVendorTemplate({
                requestNumber: requestNumber,
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
            // Run sendEmail asynchronously without blocking the API response
            sendEmail(emailHtml, nextAssignee.empEmail, emailSubject).catch((err: any) => {
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

    // Update request data (PIC แก้ไขข้อมูลคำขอ — เฉพาะตอนยังอยู่ step ของ PIC เท่านั้น)
    updateRequest: async (dataItem: any) => {
        const requestId = Number(dataItem.request_id)
        if (!requestId) throw new Error('Invalid request_id')

        // 1. ตรวจสอบ request status — ต้องอยู่ใน step แรกของ PIC เท่านั้น
        const checkSql = `SELECT request_status, assign_to FROM request_register_vendor WHERE request_id = ${requestId} AND INUSE = 1 LIMIT 1`
        const checkRes = (await MySQLExecute.search(checkSql)) as RowDataPacket[]
        const request = checkRes[0]

        if (!request) throw new Error('Request not found')

        // 2. ตรวจสอบว่า step ปัจจุบันคือ PIC step (step_order 2 = "PO & SCM(PIC) Approved" ที่ in_progress)
        const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: requestId })
        const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
        const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

        if (!currentStep || currentStep.step_order !== 2) {
            throw new Error('Request can only be edited when it is in the PIC checking step')
        }

        // 3. Authorization: ตรวจว่า user เป็น PIC (assign_to) ที่ถูก assign จริง
        const editBy = dataItem.UPDATE_BY || ''
        if (editBy && request.assign_to && request.assign_to !== editBy) {
            throw new Error(`Unauthorized: You (${editBy}) are not the assigned PIC (${request.assign_to}) for this request`)
        }

        // 4. Update ข้อมูล
        const sql = await RegisterRequestSQL.updateRequest(dataItem)
        await MySQLExecute.execute(sql)

        // 5. Log action
        const logSql = await RegisterRequestSQL.createApprovalLog({
            request_id: requestId,
            step_id: currentStep.step_id,
            action_by: editBy || 'SYSTEM',
            action_type: 'edited',
            remark: 'PIC edited request details',
        })
        await MySQLExecute.execute(logSql)

        return true
    },

    // Update status (approve / reject) + auto-update approval step & log
    updateStatus: async (dataItem: any) => {
        const newStatus = dataItem.request_status || ''

        // ── Find all approval steps for this request (sorted by step_order) ──
        const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: dataItem.request_id })
        const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]

        // ── Find the current in_progress step ──
        const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

        // ── Authorization: ตรวจสอบว่า user ที่ approve/reject เป็น approver ที่ถูก assign จริง ──
        if (currentStep && currentStep.approver_id) {
            const actionBy = dataItem.approve_by || dataItem.UPDATE_BY || ''
            if (actionBy && currentStep.approver_id !== actionBy) {
                throw new Error(`Unauthorized: You (${actionBy}) are not the assigned approver (${currentStep.approver_id}) for this step`)
            }
        }

        // ── Update request_register_vendor status (only after auth check passes) ──
        const sql = await RegisterRequestSQL.updateStatus(dataItem)
        await MySQLExecute.execute(sql)

        if (steps.length === 0) return true

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

                    if (descLower.includes('manager') || descLower.includes('mgr')) {
                        const mgrSql = `SELECT empcode FROM assignees_to WHERE group_name = 'PO_Manager' AND INUSE = 1 LIMIT 1`
                        const mgrRes = (await MySQLExecute.search(mgrSql)) as RowDataPacket[]
                        if (mgrRes.length > 0) dynamicApprover = mgrRes[0].empcode
                    } else if (descLower.includes('md') || descLower.includes('director')) {
                        const mdSql = `SELECT empcode FROM assignees_to WHERE group_name = 'MD' AND INUSE = 1 LIMIT 1`
                        const mdRes = (await MySQLExecute.search(mdSql)) as RowDataPacket[]
                        if (mdRes.length > 0) dynamicApprover = mdRes[0].empcode
                    } else if (descLower.includes('account')) {
                        const acctSql = `SELECT empcode FROM assignees_to WHERE group_name = 'Account' AND INUSE = 1 LIMIT 1`
                        const acctRes = (await MySQLExecute.search(acctSql)) as RowDataPacket[]
                        if (acctRes.length > 0) dynamicApprover = acctRes[0].empcode
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

                    // ── Auto-email triggers based on which step was just activated ──
                    const nextDescLower = (nextStep.DESCRIPTION || '').toLowerCase()

                    // MD approved → send notification to Account PIC (Main = TO, CC = CC group)
                    if (nextDescLower.includes('account')) {
                        const acctInfoSql = `
                            SELECT v.company_name, v.address, v.vendor_region,
                                   vc.contact_name, vc.email AS contact_email, vc.tel_phone AS contact_tel,
                                   rr.supportProduct_Process, rr.purchase_frequency, rr.assign_to
                            FROM request_register_vendor rr
                            JOIN vendors v ON v.vendor_id = rr.vendor_id
                            LEFT JOIN vendor_contacts vc ON vc.vendor_contact_id = rr.vendor_contact_id AND vc.INUSE = 1
                            WHERE rr.request_id = ${Number(dataItem.request_id)}
                            LIMIT 1
                        `
                        const acctInfoRes = (await MySQLExecute.search(acctInfoSql)) as RowDataPacket[]
                        const acctRow = acctInfoRes[0]
                        if (acctRow) {
                            const isOversea = (acctRow.vendor_region || '').toLowerCase() === 'oversea'
                            const mainGroup = isOversea ? 'Acc_Oversea_Main' : 'Acc_Local_Main'
                            const ccGroup   = isOversea ? 'Acc_Oversea_CC'   : 'Acc_Local_CC'

                            const acctMainSql = `SELECT empName, empEmail FROM assignees_to WHERE group_name = '${mainGroup}' AND INUSE = 1 LIMIT 1`
                            const acctCCSql   = `SELECT empEmail FROM assignees_to WHERE group_name = '${ccGroup}' AND INUSE = 1`
                            const [acctMainRes, acctCCRes] = await Promise.all([
                                MySQLExecute.search(acctMainSql) as Promise<RowDataPacket[]>,
                                MySQLExecute.search(acctCCSql)   as Promise<RowDataPacket[]>,
                            ])
                            const acctMain = (acctMainRes as RowDataPacket[])[0]
                            const acctCCEmails = (acctCCRes as RowDataPacket[]).map((r: any) => r.empEmail).filter(Boolean)

                            if (acctMain?.empEmail) {
                                const currentYear = new Date().getFullYear().toString().slice(-2)
                                const paddedId = String(Number(dataItem.request_id) || 0).padStart(4, '0')
                                const requestNumber = `Register_Selection-${currentYear}-N${paddedId}`
                                const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/workspace/request-register`
                                const picSql = `SELECT empName FROM assignees_to WHERE empcode = '${acctRow.assign_to}' AND INUSE = 1 LIMIT 1`
                                const picRes = (await MySQLExecute.search(picSql)) as RowDataPacket[]
                                const picName = picRes[0]?.empName || acctRow.assign_to || 'PO PIC'
                                const emailHtml = accountNotificationTemplate({
                                    requestNumber,
                                    accountName: acctMain.empName,
                                    vendorName: acctRow.company_name || 'N/A',
                                    address: acctRow.address || '-',
                                    contactPic: acctRow.contact_name || '-',
                                    email: acctRow.contact_email || '-',
                                    tel: acctRow.contact_tel || '-',
                                    supportProduct: acctRow.supportProduct_Process || '-',
                                    purchaseFrequency: acctRow.purchase_frequency || '-',
                                    systemLink,
                                    picName,
                                })
                                const emailSubject = `[Request Appraval] Please approve register vendor follow as "${requestNumber}"`
                                // Send TO main, CC to all CC members
                                sendEmail(emailHtml, acctMain.empEmail, emailSubject, acctCCEmails).catch((err: any) => {
                                    console.error('[Auto-Email] Failed to send Account notification:', err)
                                })
                            }
                        }
                    } else if (dynamicApprover) {
                        // ── General step email for Mgr / GM / MD ──
                        const stepInfoSql = `
                            SELECT v.company_name, v.address,
                                   vc.contact_name, vc.email AS contact_email, vc.tel_phone AS contact_tel,
                                   rr.supportProduct_Process, rr.purchase_frequency, rr.assign_to
                            FROM request_register_vendor rr
                            JOIN vendors v ON v.vendor_id = rr.vendor_id
                            LEFT JOIN vendor_contacts vc ON vc.vendor_contact_id = rr.vendor_contact_id
                            WHERE rr.request_id = ${Number(dataItem.request_id)}
                            LIMIT 1
                        `
                        const stepInfoRes = (await MySQLExecute.search(stepInfoSql)) as RowDataPacket[]
                        const si = stepInfoRes[0]
                        if (si) {
                            const nextPicSql = `SELECT empName, empEmail FROM assignees_to WHERE empcode = '${dynamicApprover}' AND INUSE = 1 LIMIT 1`
                            const nextPicRes = (await MySQLExecute.search(nextPicSql)) as RowDataPacket[]
                            const nextPic = nextPicRes[0]
                            if (nextPic?.empEmail) {
                                const currentYear = new Date().getFullYear().toString().slice(-2)
                                const paddedId = String(Number(dataItem.request_id) || 0).padStart(4, '0')
                                const requestNumber = `Register_Selection-${currentYear}-N${paddedId}`
                                const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/workspace/request-register`
                                const picSql = `SELECT empName FROM assignees_to WHERE empcode = '${si.assign_to}' AND INUSE = 1 LIMIT 1`
                                const picRes = (await MySQLExecute.search(picSql)) as RowDataPacket[]
                                const picName = picRes[0]?.empName || si.assign_to || 'PO PIC'
                                const emailHtml = registerVendorTemplate({
                                    requestNumber,
                                    recipientName: nextPic.empName || '',
                                    stepAction: 'approve',
                                    vendorName: si.company_name || 'N/A',
                                    address: si.address || '-',
                                    contactPic: si.contact_name || '-',
                                    email: si.contact_email || '-',
                                    tel: si.contact_tel || '-',
                                    supportProduct: si.supportProduct_Process || '-',
                                    purchaseFrequency: si.purchase_frequency || '-',
                                    systemLink,
                                    picName,
                                })
                                const emailSubject = `[Request Appraval] Please approve register vendor follow as "${requestNumber}"`
                                sendEmail(emailHtml, nextPic.empEmail, emailSubject).catch((err: any) => {
                                    console.error(`[Auto-Email] Failed to send step notification to ${nextPic.empEmail}:`, err)
                                })
                            }
                        }
                    }

                    // ── Step 2 approved (PO & SCM approved) → auto-send agreement email to Vendor ──
                    // "PO & SCM approved" is step_order 2 in m_request_status
                    const currentDescLower = (currentStep.DESCRIPTION || '').toLowerCase()
                    if (currentDescLower.includes('po & scm approved') || currentStep.step_order === 2) {
                        // Fetch full vendor + request data including the specific chosen contact's email
                        const vendorEmailSql = `
                            SELECT
                                v.vendor_id,
                                v.company_name,
                                v.address,
                                v.emailmain,
                                v.vendor_region,
                                rr.supportProduct_Process,
                                rr.purchase_frequency,
                                rr.assign_to,
                                rr.PIC_Email,
                                rr.vendor_contact_id,
                                vc.email   AS contact_email,
                                vc.contact_name AS contact_name_chosen
                            FROM request_register_vendor rr
                            JOIN vendors v ON v.vendor_id = rr.vendor_id
                            LEFT JOIN vendor_contacts vc
                                ON vc.vendor_contact_id = rr.vendor_contact_id AND vc.INUSE = 1
                            WHERE rr.request_id = ${Number(dataItem.request_id)}
                            LIMIT 1
                        `
                        const vendorEmailRes = (await MySQLExecute.search(vendorEmailSql)) as RowDataPacket[]
                        const ved = vendorEmailRes[0]

                        // ส่งได้ถ้ามีอย่างน้อย 1 email: contact ที่เลือก หรือ emailmain
                        const primaryEmail = ved?.contact_email || ved?.emailmain
                        if (ved && primaryEmail) {
                            // Fetch all contacts as JSON (เพื่อให้ sendAgreementEmail resolve ชื่อ contact ได้)
                            const contactsSql = `
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'vendor_contact_id', vc.vendor_contact_id,
                                        'contact_name',      vc.contact_name,
                                        'email',             vc.email
                                    )
                                ) AS contacts
                                FROM vendor_contacts vc
                                WHERE vc.vendor_id = ${Number(ved.vendor_id)} AND vc.INUSE = 1
                            `
                            const contactsRes = (await MySQLExecute.search(contactsSql)) as RowDataPacket[]
                            const contacts = contactsRes[0]?.contacts || '[]'

                            RegisterRequestService.sendAgreementEmail({
                                request_id: dataItem.request_id,
                                vendor_id: ved.vendor_id,
                                // ใช้ contact_email เป็นหลัก ถ้าไม่มีค่อย fallback emailmain
                                emailmain: primaryEmail,
                                company_name: ved.company_name,
                                address: ved.address,
                                contacts,
                                supportProduct_Process: ved.supportProduct_Process,
                                purchase_frequency: ved.purchase_frequency,
                                assign_to: ved.assign_to,
                                PIC_Email: ved.PIC_Email,
                                vendor_contact_id: ved.vendor_contact_id,
                                isReregister: false,
                            }).catch((err: any) => {
                                console.error('[Auto-Email] Failed to send agreement email after PIC approve:', err)
                            })
                        } else {
                            console.warn(`[Auto-Email] Skipped — no email found for request_id=${dataItem.request_id} (no contact email and no emailmain)`)
                        }
                    }

                } else {
                    // ── ไม่มี next step → ปิด request เป็น Completed (fallback) ──
                    // Primary path: Account step uses completeRegistration endpoint
                    // This branch handles edge case when updateStatus is called on the last step
                    const completeSql = `
                        UPDATE request_register_vendor SET
                            request_status = 'Completed',
                            approve_by     = '${(dataItem.approve_by || dataItem.UPDATE_BY || 'SYSTEM').replace(/'/g, "''")}',
                            approve_date   = NOW(),
                            UPDATE_BY      = '${(dataItem.UPDATE_BY || 'SYSTEM').replace(/'/g, "''")}',
                            UPDATE_DATE    = NOW()
                        WHERE request_id = ${Number(dataItem.request_id)}
                    `
                    await MySQLExecute.execute(completeSql)
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
        const vendorSubject = isReregister
            ? `Document for ${requestNumber} - For re-register supplier`
            : `Document for ${requestNumber} - For register new supplier`
        await sendEmail(emailHtml, targetEmail, vendorSubject)
        if (PIC_Email && PIC_Email !== targetEmail) {
            sendEmail(emailHtml, PIC_Email, vendorSubject).catch(() => { })
        }

        return { sent_to: targetEmail, cc: PIC_Email || null, requestNumber }
    },

    // Update CC emails list for a request (saved as JSON array)
    updateCcEmails: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.updateCcEmails(dataItem)
        await MySQLExecute.execute(sql)
        return true
    },

    // Save GPR form (Supplier / Outsourcing Selection Sheet)
    saveGprForm: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.saveGprForm(dataItem)
        await MySQLExecute.execute(sql)
        return true
    },

    // Get GPR form data for a request
    getGprForm: async (request_id: number) => {
        const sql = RegisterRequestSQL.getGprForm({ request_id: String(request_id) })
        const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]
        if (!rows[0]) return null
        const raw = rows[0].gpr_data
        if (!raw) return null
        try { return typeof raw === 'string' ? JSON.parse(raw) : raw }
        catch { return null }
    },

    // Account PIC: fill vendor code + complete registration → send final email
    completeRegistration: async (dataItem: any) => {
        // 1. Get approval steps
        const stepsSql = await RegisterRequestSQL.getApprovalSteps({ request_id: dataItem.request_id })
        const steps = (await MySQLExecute.search(stepsSql)) as RowDataPacket[]
        const currentStep = steps.find((s: any) => s.step_status === 'in_progress')

        // 2. Mark Account step as approved + log it
        if (currentStep) {
            const approveSql = await RegisterRequestSQL.updateApprovalStep({
                step_id: currentStep.step_id,
                step_status: 'approved',
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })
            await MySQLExecute.execute(approveSql)

            const logSql = await RegisterRequestSQL.createApprovalLog({
                request_id: dataItem.request_id,
                step_id: currentStep.step_id,
                action_by: dataItem.UPDATE_BY || 'SYSTEM',
                action_type: 'approved',
                remark: dataItem.vendor_code ? `Vendor Code: ${dataItem.vendor_code}` : 'Registration completed',
            })
            await MySQLExecute.execute(logSql)
        }

        // 3. Set vendor_code + close request as Completed
        const completeSql = await RegisterRequestSQL.completeRegistration(dataItem)
        await MySQLExecute.execute(completeSql)

        // 4. Send final completion email to Requester + PIC + all CCs
        const fetchSql = `
            SELECT
                rr.Request_By_EmployeeCode,
                rr.cc_emails,
                rr.assign_to,
                v.company_name,
                v.address,
                vc.contact_name AS contactPic,
                vc.email AS contact_email,
                vc.tel_phone AS contact_tel,
                rr.supportProduct_Process,
                rr.purchase_frequency,
                CONCAT(m.empName, ' ', m.empSurname) AS requester_name,
                m.empEmail AS requester_email
            FROM request_register_vendor rr
            JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN vendor_contacts vc ON vc.vendor_contact_id = rr.vendor_contact_id
            LEFT JOIN Person.MEMBER_FED m ON m.empCode = rr.Request_By_EmployeeCode
            WHERE rr.request_id = ${Number(dataItem.request_id)}
            LIMIT 1
        `
        const fetchRes = (await MySQLExecute.search(fetchSql)) as RowDataPacket[]
        const row = fetchRes[0]

        if (row) {
            const currentYear = new Date().getFullYear().toString().slice(-2)
            const paddedId = String(Number(dataItem.request_id) || 0).padStart(4, '0')
            const requestNumber = `Register_Selection-${currentYear}-N${paddedId}`
            const systemLink = process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'

            let ccEmails: string[] = []
            try {
                const parsed = typeof row.cc_emails === 'string' ? JSON.parse(row.cc_emails) : (row.cc_emails || [])
                ccEmails = Array.isArray(parsed) ? parsed.filter(Boolean) : []
            } catch { ccEmails = [] }

            // Look up PIC name for signature
            const picSql = `SELECT empName FROM assignees_to WHERE empcode = '${row.assign_to}' AND INUSE = 1 LIMIT 1`
            const picRes = (await MySQLExecute.search(picSql)) as RowDataPacket[]
            const picName = picRes[0]?.empName || row.assign_to || 'PO PIC'

            const emailHtml = completionEmailTemplate({
                requestNumber,
                requesterName: row.requester_name || row.Request_By_EmployeeCode || 'Requester',
                vendorName: row.company_name || 'N/A',
                address: row.address || '-',
                contactPic: row.contactPic || '-',
                email: row.contact_email || '-',
                tel: row.contact_tel || '-',
                supportProduct: row.supportProduct_Process || '-',
                purchaseFrequency: row.purchase_frequency || '-',
                vendorCode: dataItem.vendor_code || 'N/A',
                ccList: ccEmails,
                systemLink,
                picName,
            })

            const emailSubject = `[Complete] Register vendor follow as "${requestNumber}"`
            const sentTo = new Set<string>()

            const trySend = (email: string) => {
                if (email && !sentTo.has(email)) {
                    sentTo.add(email)
                    sendEmail(emailHtml, email, emailSubject).catch((err: any) => {
                        console.error(`[Completion Email] Failed to send to ${email}:`, err)
                    })
                }
            }

            if (row.requester_email) trySend(row.requester_email)
            for (const cc of ccEmails) trySend(cc)
        }

        return true
    }
}
