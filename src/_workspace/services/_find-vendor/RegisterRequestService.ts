import { MySQLExecute } from '@businessData/dbExecute'
import { RegisterRequestSQL } from '../../sql/_find-vendor/RegisterRequestSQL'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export const RegisterRequestService = {
    // Create a new registration request and return the inserted ID
    createRequest: async (dataItem: any) => {
        // 1. Fetch Vendor Region
        const regionSql = `SELECT vendor_region FROM vendors WHERE vendor_id = ${Number(dataItem.vendor_id) || 0} LIMIT 1`
        const regionRes = (await MySQLExecute.search(regionSql)) as RowDataPacket[]
        const vendorRegion = regionRes[0]?.vendor_region || 'Local'
        const isOversea = vendorRegion.toLowerCase() === 'oversea'
        const assignmentGroup = isOversea ? 'Oversea' : 'Local'

        // 2. Fetch Active Assignees from DB (must be seeded manually in assignees_to)
        const fetchAssigneesSql = `SELECT empcode, empEmail FROM assignees_to WHERE group_name = '${assignmentGroup}' AND INUSE = 1 ORDER BY Assignees_id ASC`
        const assigneesRes = (await MySQLExecute.search(fetchAssigneesSql)) as RowDataPacket[]

        const activeAssignees: { empCode: string; empEmail: string }[] = assigneesRes.map(row => ({
            empCode: row.empcode || '',
            empEmail: row.empEmail || ''
        }))

        // Fallback in case table is empty or all inactive
        if (activeAssignees.length === 0) {
            activeAssignees.push({ empCode: 'ADMIN', empEmail: 'admin@furukawaelectric.com' })
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
        return result.insertId
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
    }
}
