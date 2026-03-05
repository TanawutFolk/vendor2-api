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

    // ─── GET ALL (returns string[] for searchList) ─────────────────────────────────────────────
    getAllRequests: async (dataItem?: any): Promise<string[]> => {

        // Build WHERE conditions
        const innerConditions: string[] = ['rr.INUSE = 1']

        if (dataItem?.Request_By_EmployeeCode) {
            innerConditions.push(`rr.Request_By_EmployeeCode = '${dataItem.Request_By_EmployeeCode}'`)
        }

        if (dataItem?.assign_to) {
            innerConditions.push(`rr.assign_to = '${dataItem.assign_to}'`)
        }

        if (dataItem?.request_status) {
            innerConditions.push(`rr.request_status = '${dataItem.request_status}'`)
        }

        const whereClause = innerConditions.join(' AND ')

        const selectColumns = `
                    rr.request_id,
                    rr.vendor_id,
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
                    rr.CREATE_DATE,

                    -- Vendor Info
                    v.company_name,
                    v.fft_vendor_code,
                    v.fft_status,
                    v.vendor_region,
                    v.province,
                    v.postal_code,
                    v.address,
                    v.tel_center,
                    v.website,
                    v.emailmain,
                    vt.name AS vendor_type_name,

                    -- Contacts (as JSON array)
                    IFNULL(
                        JSON_ARRAYAGG(
                            CASE WHEN vc.vendor_contact_id IS NOT NULL THEN
                                JSON_OBJECT(
                                    'contact_name', vc.contact_name,
                                    'tel_phone',    vc.tel_phone,
                                    'email',        vc.email,
                                    'position',     vc.position
                                )
                            ELSE NULL END
                        ),
                        JSON_ARRAY()
                    ) AS contacts,

                    -- Products (as JSON array)
                    IFNULL(
                        JSON_ARRAYAGG(
                            CASE WHEN vp.vendor_product_id IS NOT NULL THEN
                                JSON_OBJECT(
                                    'product_group', mpg.group_name,
                                    'maker_name',    vp.maker_name,
                                    'product_name',  vp.product_name,
                                    'model_list',    vp.model_list
                                )
                            ELSE NULL END
                        ),
                        JSON_ARRAY()
                    ) AS products`

        const fromClause = `
                FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
                LEFT JOIN master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
                LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id AND vc.INUSE = 1
                LEFT JOIN vendor_products vp ON vp.vendor_id = v.vendor_id AND vp.INUSE = 1
                LEFT JOIN master_product_groups mpg ON mpg.product_group_id = vp.product_group_id
                LEFT JOIN Person.MEMBER_FED m ON m.empCode = rr.Request_By_EmployeeCode
                WHERE ${whereClause}`

        // Query 1: COUNT (must GROUP BY to avoid counting joined rows)
        const countSql = `
            SELECT COUNT(*) AS TOTAL_COUNT FROM (
                SELECT rr.request_id
                ${fromClause}
                GROUP BY rr.request_id
            ) AS counted
        `

        // Query 2: DATA with pagination
        const orderBy = (dataItem?.Order || 'rr.CREATE_DATE DESC').toString().trim()
        const start = (dataItem?.Start || '0').toString().trim()
        const limit = (dataItem?.Limit || '50').toString().trim()

        const dataSql = `
            SELECT ${selectColumns}
            ${fromClause}
            GROUP BY
                rr.request_id, rr.vendor_id, rr.request_status,
                rr.supportProduct_Process, rr.purchase_frequency, rr.File_Path,
                rr.assign_to, rr.PIC_Email, rr.requester_remark,
                rr.approve_by, rr.approve_date, rr.approver_remark,
                rr.Request_By_EmployeeCode, FULL_NAME, EMPLOYEE_DEPT, rr.CREATE_DATE,
                v.company_name, v.fft_vendor_code, v.fft_status, v.vendor_region,
                v.province, v.postal_code, v.address, v.tel_center, v.website, v.emailmain,
                vt.name
            ORDER BY ${orderBy}
            LIMIT ${start}, ${limit}
        `

        return [countSql, dataSql]
    },

    // ─── GET BY ID ──────────────────────────────────────────────────────────────────────────
    getById: async (dataItem: any) => {
        let sql = `
            SELECT
                rr.request_id,
                rr.vendor_id,
                rr.request_status,
                rr.supportProduct_Process,
                rr.purchase_frequency,
                rr.File_Path,
                rr.requester_remark,
                rr.approver_remark,
                rr.approve_by,
                rr.approve_date,
                rr.assign_to,
                rr.PIC_Email,
                rr.Request_By_EmployeeCode AS EMPLOYEE_CODE,
                CONCAT(m.empName, ' ', m.empSurname) AS FULL_NAME,
                m.empDept AS EMPLOYEE_DEPT,
                rr.CREATE_DATE,

                -- Vendor Info
                v.company_name,
                v.fft_vendor_code,
                v.fft_status,
                v.vendor_region,
                v.province,
                v.postal_code,
                v.address,
                v.tel_center,
                v.website,
                v.emailmain,
                vt.name AS vendor_type_name,

                -- Contacts (as JSON array)
                IFNULL(
                    JSON_ARRAYAGG(
                        CASE WHEN vc.vendor_contact_id IS NOT NULL THEN
                            JSON_OBJECT(
                                'contact_name', vc.contact_name,
                                'tel_phone',    vc.tel_phone,
                                'email',        vc.email,
                                'position',     vc.position
                            )
                        ELSE NULL END
                    ),
                    JSON_ARRAY()
                ) AS contacts,

                -- Products (as JSON array)
                IFNULL(
                    JSON_ARRAYAGG(
                        CASE WHEN vp.vendor_product_id IS NOT NULL THEN
                            JSON_OBJECT(
                                'product_group', mpg.group_name,
                                'maker_name',    vp.maker_name,
                                'product_name',  vp.product_name,
                                'model_list',    vp.model_list
                            )
                        ELSE NULL END
                    ),
                    JSON_ARRAY()
                ) AS products

            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
            LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id AND vc.INUSE = 1
            LEFT JOIN vendor_products vp ON vp.vendor_id = v.vendor_id AND vp.INUSE = 1
            LEFT JOIN master_product_groups mpg ON mpg.product_group_id = vp.product_group_id
            LEFT JOIN Person.MEMBER_FED m ON m.empCode = rr.Request_By_EmployeeCode
            WHERE rr.request_id = dataItem.request_id
              AND rr.INUSE = 1
            GROUP BY
                rr.request_id, rr.vendor_id, rr.request_status,
                rr.supportProduct_Process, rr.purchase_frequency, rr.File_Path,
                rr.requester_remark, rr.approver_remark, rr.approve_by, rr.approve_date,
                rr.assign_to, rr.PIC_Email, rr.Request_By_EmployeeCode, FULL_NAME, EMPLOYEE_DEPT,
                rr.CREATE_DATE, v.company_name, v.fft_vendor_code, v.fft_status, v.vendor_region,
                v.province, v.postal_code, v.address, v.tel_center, v.website, v.emailmain, vt.name
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
