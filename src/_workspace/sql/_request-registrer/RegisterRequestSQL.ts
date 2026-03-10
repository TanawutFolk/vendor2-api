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
                'Sent To PO & SCM(PIC)',
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
        console.log(dataItem,'dataItem in getAllRequests')
        let countSql = `
            SELECT COUNT(DISTINCT rr.request_id) AS TOTAL_COUNT
            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
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
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'contact_name', vc.contact_name,
                            'tel_phone',    vc.tel_phone,
                            'email',        vc.email,
                            'position',     vc.position
                        )
                    ) FROM vendor_contacts vc WHERE vc.vendor_id = v.vendor_id AND vc.INUSE = 1),
                    JSON_ARRAY()
                ) AS contacts,

                -- Products (as JSON array)
                IFNULL(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'product_group', mpg.group_name,
                            'maker_name',    vp.maker_name,
                            'product_name',  vp.product_name,
                            'model_list',    vp.model_list
                        )
                    ) FROM vendor_products vp
                    LEFT JOIN master_product_groups mpg ON mpg.product_group_id = vp.product_group_id
                    WHERE vp.vendor_id = v.vendor_id AND vp.INUSE = 1),
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
                ) AS documents,

                -- Approval Steps (as JSON array)
                IFNULL(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'step_id', ras.step_id,
                            'step_order', ras.step_order,
                            'approver_id', ras.approver_id,
                            'step_status', ras.step_status,
                            'DESCRIPTION', ras.DESCRIPTION,
                            'CREATE_DATE', ras.CREATE_DATE,
                            'UPDATE_BY', ras.UPDATE_BY,
                            'UPDATE_DATE', ras.UPDATE_DATE
                        )
                    ) FROM request_approval_step ras WHERE ras.request_id = rr.request_id AND ras.INUSE = 1),
                    JSON_ARRAY()
                ) AS approval_steps,

                -- Approval Logs (as JSON array)
                IFNULL(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'log_id', ral.log_id,
                            'step_id', ral.step_id,
                            'action_by', ral.action_by,
                            'action_type', ral.action_type,
                            'remark', ral.remark,
                            'action_date', ral.action_date
                        )
                    ) FROM request_approval_log ral WHERE ral.request_id = rr.request_id),
                    JSON_ARRAY()
                ) AS approval_logs

            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
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
        console.log(dataSql)
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
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'contact_name', vc.contact_name,
                            'tel_phone', vc.tel_phone,
                            'email', vc.email,
                            'position', vc.position
                        )
                    ) FROM vendor_contacts vc WHERE vc.vendor_id = v.vendor_id AND vc.INUSE = 1),
                    JSON_ARRAY()
                ) AS contacts,

                -- Products (as JSON array)
                IFNULL(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'product_group', mpg.group_name,
                            'maker_name', vp.maker_name,
                            'product_name', vp.product_name,
                            'model_list', vp.model_list
                        )
                    ) FROM vendor_products vp
                    LEFT JOIN master_product_groups mpg ON mpg.product_group_id = vp.product_group_id
                    WHERE vp.vendor_id = v.vendor_id AND vp.INUSE = 1),
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
                ) AS documents,

                -- Approval Steps (as JSON array)
                IFNULL(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'step_id', ras.step_id,
                            'step_order', ras.step_order,
                            'approver_id', ras.approver_id,
                            'step_status', ras.step_status,
                            'DESCRIPTION', ras.DESCRIPTION,
                            'CREATE_DATE', ras.CREATE_DATE,
                            'UPDATE_BY', ras.UPDATE_BY,
                            'UPDATE_DATE', ras.UPDATE_DATE
                        )
                    ) FROM request_approval_step ras WHERE ras.request_id = rr.request_id AND ras.INUSE = 1),
                    JSON_ARRAY()
                ) AS approval_steps,

                -- Approval Logs (as JSON array)
                IFNULL(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'log_id', ral.log_id,
                            'step_id', ral.step_id,
                            'action_by', ral.action_by,
                            'action_type', ral.action_type,
                            'remark', ral.remark,
                            'action_date', ral.action_date
                        )
                    ) FROM request_approval_log ral WHERE ral.request_id = rr.request_id),
                    JSON_ARRAY()
                ) AS approval_logs

            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
            LEFT JOIN Person.MEMBER_FED m ON m.empCode = rr.Request_By_EmployeeCode
            WHERE rr.request_id = dataItem.request_id
              AND rr.INUSE = 1
            LIMIT 1
        `

        sql = sql.replaceAll('dataItem.request_id', dataItem['request_id'])

        return sql
    },

    // ─── UPDATE STATUS ────────────────────────────────────────────────────────
    updateStatus: async (dataItem: any) => {
        const approveBy = dataItem['approve_by'] ? `'${dataItem['approve_by']}'` : 'NULL'
        const approveDate = dataItem['approve_date'] ? `'${dataItem['approve_date']}'` : 'NULL'
        const approverRemark = dataItem['approver_remark'] ? `'${dataItem['approver_remark']}'` : 'NULL'

        let sql = `
            UPDATE request_register_vendor SET
                request_status = 'dataItem.request_status',
                approve_by = ${approveBy},
                approve_date = ${approveDate},
                approver_remark = ${approverRemark},
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE request_id = dataItem.request_id
        `

        sql = sql.replaceAll('dataItem.request_id', dataItem['request_id'])
        sql = sql.replaceAll('dataItem.request_status', dataItem['request_status'])
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

        return sql
    },

    // ─── GET STATUS OPTIONS ──────────────────────────────────────────────────
    getStatusOptions: () => `
        SELECT
            status_value  AS value,
            status_label  AS label,
            chip_color    AS chipColor,
            accent_color  AS accent,
            sort_order    AS sortOrder
        FROM m_request_status
        WHERE is_active = 1
        ORDER BY sort_order ASC
    `,

    // ─── APPROVAL STEPS ─────────────────────────────────────────────────────
    createApprovalStep: async (dataItem: any) => {
        let sql = `
            INSERT INTO request_approval_step (
                request_id,
                step_order,
                approver_id,
                step_status,
                DESCRIPTION,
                CREATE_BY,
                INUSE
            ) VALUES (
                dataItem.request_id,
                dataItem.step_order,
                'dataItem.approver_id',
                'dataItem.step_status',
                'dataItem.DESCRIPTION',
                'dataItem.CREATE_BY',
                1
            )
        `

        sql = sql.replaceAll('dataItem.request_id', dataItem['request_id'])
        sql = sql.replaceAll('dataItem.step_order', dataItem['step_order'])
        sql = sql.replaceAll('dataItem.approver_id', dataItem['approver_id'])
        sql = sql.replaceAll('dataItem.step_status', dataItem['step_status'])
        sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'])
        sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

        return sql
    },

    getApprovalSteps: async (dataItem: any) => {
        let sql = `
            SELECT 
                ras.step_id,
                ras.request_id,
                ras.step_order,
                ras.approver_id,
                ras.step_status,
                ras.DESCRIPTION,
                ras.CREATE_BY,
                ras.CREATE_DATE,
                ras.UPDATE_BY,
                ras.UPDATE_DATE,
                CONCAT(m.empName, ' ', m.empSurname) AS approver_name
            FROM request_approval_step ras
            LEFT JOIN Person.MEMBER_FED m ON m.empCode = ras.approver_id
            WHERE ras.request_id = dataItem.request_id
              AND ras.INUSE = 1
            ORDER BY ras.step_order ASC
        `

        sql = sql.replaceAll('dataItem.request_id', dataItem['request_id'])

        return sql
    },

    updateApprovalStep: async (dataItem: any) => {
        let sql = `
            UPDATE request_approval_step SET
                step_status = 'dataItem.step_status',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE step_id = dataItem.step_id
        `

        sql = sql.replaceAll('dataItem.step_id', dataItem['step_id'])
        sql = sql.replaceAll('dataItem.step_status', dataItem['step_status'])
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

        return sql
    },

    // ─── APPROVAL LOGS ──────────────────────────────────────────────────────
    createApprovalLog: async (dataItem: any) => {
        const stepId = dataItem['step_id'] ? dataItem['step_id'] : 'NULL'

        let sql = `
            INSERT INTO request_approval_log (
                request_id,
                step_id,
                action_by,
                action_type,
                remark,
                action_date
            ) VALUES (
                dataItem.request_id,
                ${stepId},
                'dataItem.action_by',
                'dataItem.action_type',
                'dataItem.remark',
                NOW()
            )
        `

        sql = sql.replaceAll('dataItem.request_id', dataItem['request_id'])
        sql = sql.replaceAll('dataItem.action_by', dataItem['action_by'])
        sql = sql.replaceAll('dataItem.action_type', dataItem['action_type'])
        sql = sql.replaceAll('dataItem.remark', dataItem['remark'])

        return sql
    },

    getApprovalLogs: async (dataItem: any) => {
        let sql = `
            SELECT 
                ral.log_id,
                ral.request_id,
                ral.step_id,
                ral.action_by,
                ral.action_type,
                ral.remark,
                ral.action_date,
                CONCAT(m.empName, ' ', m.empSurname) AS action_by_name
            FROM request_approval_log ral
            LEFT JOIN Person.MEMBER_FED m ON m.empCode = ral.action_by
            WHERE ral.request_id = dataItem.request_id
            ORDER BY ral.action_date ASC
        `

        sql = sql.replaceAll('dataItem.request_id', dataItem['request_id'])

        return sql
    }
}
