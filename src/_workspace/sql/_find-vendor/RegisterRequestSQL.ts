export const RegisterRequestSQL = {

    // ─── CREATE ──────────────────────────────────────────────────────────────
    createRequest: async (dataItem: any) => {
        let sql = `
            INSERT INTO request_register_vendor (
                vendor_id,
                Request_By_EmployeeCode,
                supportProduct_Process,
                purchase_frequency,
                File_Path,
                request_status,
                requester_remark,
                assign_to,
                PIC_Email,
                CREATE_BY,
                INUSE
            ) VALUES (
                dataItem.vendor_id,
                'dataItem.Request_By_EmployeeCode',
                'dataItem.supportProduct_Process',
                'dataItem.purchase_frequency',
                'dataItem.File_Path',
                'Pending',
                'dataItem.requester_remark',
                'dataItem.assign_to',
                'dataItem.PIC_Email',
                'dataItem.CREATE_BY',
                1
            )
        `

        sql = sql.replaceAll('dataItem.vendor_id', String(Number(dataItem['vendor_id']) || 0))
        sql = sql.replaceAll('dataItem.Request_By_EmployeeCode', dataItem['Request_By_EmployeeCode'] || '')
        sql = sql.replaceAll('dataItem.supportProduct_Process', dataItem['supportProduct_Process'] || '')
        sql = sql.replaceAll('dataItem.purchase_frequency', dataItem['purchase_frequency'] || '')
        sql = sql.replaceAll('dataItem.File_Path', dataItem['File_Path'] || '')
        sql = sql.replaceAll('dataItem.requester_remark', dataItem['requester_remark'] || '')
        sql = sql.replaceAll('dataItem.assign_to', dataItem['assign_to'] || '')
        sql = sql.replaceAll('dataItem.PIC_Email', dataItem['PIC_Email'] || '')
        sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

        return sql
    },

    // ─── GET ALL (returns string[] for searchList) ────────────────────────────
    getAllRequests: async (dataItem?: any): Promise<string[]> => {

        // Build WHERE conditions
        const innerConditions: string[] = ['rr.INUSE = 1']

        if (dataItem?.Request_By_EmployeeCode) {
            innerConditions.push(`rr.Request_By_EmployeeCode = '${dataItem.Request_By_EmployeeCode}'`)
        }

        const whereClause = innerConditions.join(' AND ')

        const selectColumns = `
                    rr.request_id,
                    rr.vendor_id,
                    v.company_name,
                    rr.request_status,
                    rr.supportProduct_Process,
                    rr.purchase_frequency,
                    rr.File_Path,
                    rr.assign_to,
                    rr.PIC_Email,
                    rr.requester_remark,
                    rr.approve_by,
                    rr.approve_date,
                    rr.approver_remark,
                    rr.Request_By_EmployeeCode AS EMPLOYEE_CODE,
                    CONCAT(m.empName, ' ', m.empSurname) AS FULL_NAME,
                    m.empDept AS EMPLOYEE_DEPT,
                    rr.CREATE_DATE`

        const fromClause = `
                FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
                LEFT JOIN Person.MEMBER_FED m
                    ON m.empCode = rr.Request_By_EmployeeCode
                WHERE ${whereClause}`

        // Query 1: COUNT
        const countSql = `
            SELECT COUNT(*) AS TOTAL_COUNT
            ${fromClause}
        `

        // Query 2: DATA with pagination
        const orderBy = (dataItem?.Order || 'rr.CREATE_DATE DESC').toString().trim()
        const start = (dataItem?.Start || '0').toString().trim()
        const limit = (dataItem?.Limit || '50').toString().trim()

        const dataSql = `
            SELECT ${selectColumns}
            ${fromClause}
            ORDER BY ${orderBy}
            LIMIT ${start}, ${limit}
        `

        return [countSql, dataSql]
    },

    // ─── GET BY ID ────────────────────────────────────────────────────────────
    getById: async (dataItem: any) => {
        let sql = `
            SELECT
                rr.request_id,
                rr.vendor_id,
                v.company_name,
                v.vendor_region,
                rr.request_status,
                rr.supportProduct_Process,
                rr.purchase_frequency,
                rr.File_Path,
                rr.requester_remark,
                rr.approver_remark,
                rr.approve_by,
                rr.approve_date,
                rr.assign_to,
                rr.Request_By_EmployeeCode AS EMPLOYEE_CODE,
                CONCAT(m.empName, ' ', m.empSurname) AS FULL_NAME,
                m.empDept AS EMPLOYEE_DEPT,
                rr.CREATE_BY,
                rr.UPDATE_BY,
                rr.CREATE_DATE,
                rr.UPDATE_DATE
            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN Person.MEMBER_FED m
                ON m.empCode = rr.Request_By_EmployeeCode
            WHERE rr.request_id = dataItem.request_id
              AND rr.INUSE = 1
            LIMIT 1
        `

        sql = sql.replaceAll('dataItem.request_id', String(Number(dataItem['request_id']) || 0))

        return sql
    },

    // ─── UPDATE STATUS ────────────────────────────────────────────────────────
    updateStatus: async (dataItem: any) => {
        let sql = `
            UPDATE request_register_vendor SET
                request_status  = 'dataItem.request_status',
                approve_by      = 'dataItem.approve_by',
                approve_date    = 'dataItem.approve_date',
                approver_remark = 'dataItem.approver_remark',
                UPDATE_BY       = 'dataItem.UPDATE_BY',
                UPDATE_DATE     = NOW()
            WHERE request_id = dataItem.request_id
        `

        sql = sql.replaceAll('dataItem.request_id', String(Number(dataItem['request_id']) || 0))
        sql = sql.replaceAll('dataItem.request_status', dataItem['request_status'] || '')
        sql = sql.replaceAll('dataItem.approve_by', dataItem['approve_by'] || '')
        sql = sql.replaceAll('dataItem.approve_date', dataItem['approve_date']
            ? new Date(dataItem['approve_date']).toISOString().slice(0, 19).replace('T', ' ')
            : '')
        sql = sql.replaceAll('dataItem.approver_remark', dataItem['approver_remark'] || '')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

        return sql
    }
}
