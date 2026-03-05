import { MySQLExecute } from '@businessData/dbExecute'
import { RegisterRequestSQL } from '../../sql/_find-vendor/RegisterRequestSQL'
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

        return insertedId
    },

    // Get all registration requests
    getAllRequests: async (dataItem?: any) => {
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

    // Update status (approve / reject)
    updateStatus: async (dataItem: any) => {
        const sql = await RegisterRequestSQL.updateStatus(dataItem)
        await MySQLExecute.execute(sql)
        return true
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
        try {
            const contactsParsed = typeof contacts === 'string' ? JSON.parse(contacts) : (contacts || [])
            const first = contactsParsed.find((c: any) => c)
            if (first?.contact_name) contactName = first.contact_name
        } catch { /* ignore */ }

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

        // Send to vendor (emailmain), CC PIC
        await sendEmail(emailHtml, emailmain)
        if (PIC_Email && PIC_Email !== emailmain) {
            sendEmail(emailHtml, PIC_Email).catch(() => { })
        }

        return { sent_to: emailmain, cc: PIC_Email || null, requestNumber }
    }
}
