export const RegisterRequestSQL = {

    // ─── CREATE ──────────────────────────────────────────────────────────────
    createRequest: async (dataItem: any) => {
        let sql = `
            INSERT INTO request_register_vendor (
                vendor_id,
                vendor_contact_id,
                Request_By_EmployeeCode,
                supportProduct_Process,
                purchase_frequency,
                request_status,
                requester_remark,
                assign_to,
                PIC_Email,
                CREATE_BY,
                INUSE
            ) VALUES (
                dataItem.vendor_id,
                dataItem.vendor_contact_id,
                'dataItem.Request_By_EmployeeCode',
                'dataItem.supportProduct_Process',
                'dataItem.purchase_frequency',
                'Pending',
                'dataItem.requester_remark',
                'dataItem.assign_to',
                'dataItem.PIC_Email',
                'dataItem.CREATE_BY',
                1
            )
        `

        sql = sql.replaceAll('dataItem.vendor_id', dataItem['vendor_id'])
        sql = sql.replaceAll('dataItem.vendor_contact_id', dataItem['vendor_contact_id'])
        sql = sql.replaceAll('dataItem.Request_By_EmployeeCode', dataItem['Request_By_EmployeeCode'])
        sql = sql.replaceAll('dataItem.supportProduct_Process', dataItem['supportProduct_Process'])
        sql = sql.replaceAll('dataItem.purchase_frequency', dataItem['purchase_frequency'])
        sql = sql.replaceAll('dataItem.requester_remark', dataItem['requester_remark'])
        sql = sql.replaceAll('dataItem.assign_to', dataItem['assign_to'])
        sql = sql.replaceAll('dataItem.PIC_Email', dataItem['PIC_Email'])
        sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

        return sql
    },

    createDocument: async (dataItem: any) => {
        let sql = `
            INSERT INTO request_register_document (
                request_id,
                file_name,
                file_path,
                file_size,
                file_type,
                CREATE_BY,
                INUSE
            ) VALUES (
                dataItem.request_id,
                'dataItem.file_name',
                'dataItem.file_path',
                dataItem.file_size,
                'dataItem.file_type',
                'dataItem.CREATE_BY',
                1
            )
        `

        sql = sql.replaceAll('dataItem.request_id', dataItem['request_id'])
        sql = sql.replaceAll('dataItem.file_name', dataItem['file_name'])
        sql = sql.replaceAll('dataItem.file_path', dataItem['file_path'])
        sql = sql.replaceAll('dataItem.file_size', dataItem['file_size'])
        sql = sql.replaceAll('dataItem.file_type', dataItem['file_type'])
        sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

        return sql
    },

    // ─── GET ALL (returns string[] for searchList) ─────────────────────────────────────────────
    getAllRequests: async (dataItem?: any): Promise<string[]> => {

        let countSql = `
            SELECT COUNT(DISTINCT rr.request_id) AS TOTAL_COUNT
            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
            LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id AND vc.INUSE = 1
            LEFT JOIN vendor_products vp ON vp.vendor_id = v.vendor_id AND vp.INUSE = 1
            LEFT JOIN master_product_groups mpg ON mpg.product_group_id = vp.product_group_id
            LEFT JOIN Person.MEMBER_FED m ON m.empCode = rr.Request_By_EmployeeCode
            WHERE rr.INUSE = 1
            dataItem.sqlWhere
            dataItem.sqlWhereColumnFilter
        `

        let dataSql = `
            SELECT
                rr.request_id,
                rr.vendor_id,
                rr.request_status,
                rr.supportProduct_Process,
                rr.purchase_frequency,
                rr.assign_to,
                rr.PIC_Email,
                rr.vendor_contact_id,
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
                ) AS products,
                
                -- Documents (as JSON array)
                IFNULL(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'document_id', rrd.document_id,
                            'file_name', rrd.file_name,
                            'file_path', rrd.file_path,
                            'file_size', rrd.file_size,
                            'file_type', rrd.file_type
                        )
                    ) FROM request_register_document rrd WHERE rrd.request_id = rr.request_id AND rrd.INUSE = 1),
                    JSON_ARRAY()
                ) AS documents
            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
            LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id AND vc.INUSE = 1
            LEFT JOIN vendor_products vp ON vp.vendor_id = v.vendor_id AND vp.INUSE = 1
            LEFT JOIN master_product_groups mpg ON mpg.product_group_id = vp.product_group_id
            LEFT JOIN Person.MEMBER_FED m ON m.empCode = rr.Request_By_EmployeeCode
            WHERE rr.INUSE = 1
            dataItem.sqlWhere
            dataItem.sqlWhereColumnFilter
            GROUP BY rr.request_id
            ORDER BY dataItem.Order
            LIMIT dataItem.Limit OFFSET dataItem.Offset
        `

        countSql = countSql.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
        countSql = countSql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'] || '')

        dataSql = dataSql.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
        dataSql = dataSql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'] || '')
        dataSql = dataSql.replaceAll('dataItem.Order', dataItem['Order'])
        dataSql = dataSql.replaceAll('dataItem.Limit', dataItem['Limit'])
        dataSql = dataSql.replaceAll('dataItem.Offset', dataItem['Offset'])

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
                rr.requester_remark,
                rr.approver_remark,
                rr.approve_by,
                rr.approve_date,
                rr.assign_to,
                rr.PIC_Email,
                rr.vendor_contact_id,
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
                                'tel_phone', vc.tel_phone,
                                'email', vc.email,
                                'position', vc.position
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
                                'maker_name', vp.maker_name,
                                'product_name', vp.product_name,
                                'model_list', vp.model_list
                            )
                        ELSE NULL END
                    ),
                    JSON_ARRAY()
                ) AS products,

                -- Documents (as JSON array)
                IFNULL(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'document_id', rrd.document_id,
                            'file_name', rrd.file_name,
                            'file_path', rrd.file_path,
                            'file_size', rrd.file_size,
                            'file_type', rrd.file_type
                        )
                    ) FROM request_register_document rrd WHERE rrd.request_id = rr.request_id AND rrd.INUSE = 1),
                    JSON_ARRAY()
                ) AS documents

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
                rr.supportProduct_Process, rr.purchase_frequency,
                rr.requester_remark, rr.approver_remark, rr.approve_by, rr.approve_date,
                rr.assign_to, rr.PIC_Email, rr.vendor_contact_id, rr.Request_By_EmployeeCode, FULL_NAME, EMPLOYEE_DEPT,
                rr.CREATE_DATE, v.company_name, v.fft_vendor_code, v.fft_status, v.vendor_region,
                v.province, v.postal_code, v.address, v.tel_center, v.website, v.emailmain, vt.name
            LIMIT 1
        `

        sql = sql.replaceAll('dataItem.request_id', dataItem['request_id'])

        return sql
    },

    // ─── UPDATE STATUS ────────────────────────────────────────────────────────
    updateStatus: async (dataItem: any) => {
        let sql = `
            UPDATE request_register_vendor SET
                request_status = 'dataItem.request_status',
                approve_by = 'dataItem.approve_by',
                approve_date = 'dataItem.approve_date',
                approver_remark = 'dataItem.approver_remark',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE request_id = dataItem.request_id
        `

        sql = sql.replaceAll('dataItem.request_id', dataItem['request_id'])
        sql = sql.replaceAll('dataItem.request_status', dataItem['request_status'])
        sql = sql.replaceAll('dataItem.approve_by', dataItem['approve_by'])
        sql = sql.replaceAll('dataItem.approve_date', dataItem['approve_date'])
        sql = sql.replaceAll('dataItem.approver_remark', dataItem['approver_remark'])
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

        return sql
    }
}
