export interface RegisterRequestDataItem {
    request_id?: number | string;
    vendor_id?: number | string;
    vendor_contact_id?: number | string;
    Request_By_EmployeeCode?: string;
    supportProduct_Process?: string;
    purchase_frequency?: string;
    request_status?: string;
    cc_emails?: any;
    requester_remark?: string;
    assign_to?: string;
    PIC_Email?: string;
    CREATE_BY?: string;
    UPDATE_BY?: string;
    file_name?: string;
    file_path?: string;
    file_size?: number | string;
    file_type?: string;
    sqlWhere?: string;
    sqlWhereColumnFilter?: string;
    Order?: string;
    Limit?: number | string;
    Offset?: number | string;
    approve_by?: string;
    approve_date?: string;
    approver_remark?: string;
    step_id?: number | string;
    step_order?: number | string;
    approver_id?: string;
    step_status?: string;
    DESCRIPTION?: string;
    action_by?: string;
    action_type?: string;
    remark?: string;
    vendor_code?: string;
    selection_id?: number | string;
    business_category?: string;
    start_year?: string;
    authorized_capital?: string;
    establish?: string;
    number_of_employees?: string;
    manufactured_country?: string;
    vendor_original_country?: string;
    sanctions?: string;
    currency?: string;
    suggestion?: string;
    result?: string;
    path?: string;
    vendor_code_selector?: string;
    completion_date?: string;
    completion_date_null?: string;
    year?: string;
    total_revenue?: number | string;
    net_profit?: number | string;
    no?: string | number;
    criteria?: string;
    uploaded_file?: string;
    uploaded_name?: string;
    path_null?: string;
    name_null?: string;
}

export const RegisterRequestSQL = {

    // ─── CREATE ──────────────────────────────────────────────────────────────
    createRequest: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            INSERT INTO request_register_vendor (
                                       vendor_id
                                     , vendor_contact_id
                                     , Request_By_EmployeeCode
                                     , supportProduct_Process
                                     , purchase_frequency
                                     , request_status
                                     , cc_emails
                                     , requester_remark
                                     , assign_to
                                     , PIC_Email
                                     , CREATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.vendor_id
                                     ,  dataItem.vendor_contact_id
                                     , 'dataItem.Request_By_EmployeeCode'
                                     , 'dataItem.supportProduct_Process'
                                     , 'dataItem.purchase_frequency'
                                     , 'Sent To PO & SCM(PIC)'
                                     , 'dataItem.cc_emails'
                                     , 'dataItem.requester_remark'
                                     , 'dataItem.assign_to'
                                     , 'dataItem.PIC_Email'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

        sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.vendor_contact_id', (dataItem['vendor_contact_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.Request_By_EmployeeCode', dataItem['Request_By_EmployeeCode'] || '')
        sql = sql.replaceAll('dataItem.supportProduct_Process', dataItem['supportProduct_Process'] || '')
        sql = sql.replaceAll('dataItem.purchase_frequency', dataItem['purchase_frequency'] || '')
        sql = sql.replaceAll('dataItem.cc_emails', dataItem['cc_emails'] || '')
        sql = sql.replaceAll('dataItem.requester_remark', dataItem['requester_remark'] || '')
        sql = sql.replaceAll('dataItem.assign_to', dataItem['assign_to'] || '')
        sql = sql.replaceAll('dataItem.PIC_Email', dataItem['PIC_Email'] || '')
        sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

        return sql
    },

    createDocument: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            INSERT INTO request_register_document (
                                       request_id
                                     , file_name
                                     , file_path
                                     , file_size
                                     , file_type
                                     , CREATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.request_id
                                     , 'dataItem.file_name'
                                     , 'dataItem.file_path'
                                     ,  dataItem.file_size
                                     , 'dataItem.file_type'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.file_name', dataItem['file_name'] || '')
        sql = sql.replaceAll('dataItem.file_path', dataItem['file_path'] || '')
        sql = sql.replaceAll('dataItem.file_size', (dataItem['file_size'] || 0).toString())
        sql = sql.replaceAll('dataItem.file_type', dataItem['file_type'] || '')
        sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

        return sql
    },

    // ─── GET ALL ─────────────────────────────────────────────────────────────
    getAllRequests: async (dataItem: RegisterRequestDataItem): Promise<string[]> => {
        let countSql = `
                            SELECT
                                       COUNT(DISTINCT rr.request_id) AS TOTAL_COUNT
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.vendor_id = rr.vendor_id
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.empCode = rr.Request_By_EmployeeCode
                            WHERE
                                       rr.INUSE = 1
                                       dataItem.sqlWhere
                                       dataItem.sqlWhereColumnFilter
        `

        let dataSql = `
                            SELECT
                                       rr.request_id
                                     , rr.vendor_id
                                     , rr.request_status
                                     , rr.supportProduct_Process
                                     , rr.purchase_frequency
                                     , rr.assign_to
                                     , rr.PIC_Email
                                     , rr.vendor_contact_id
                                     , rr.requester_remark
                                     , rr.approve_by
                                     , rr.approve_date
                                     , rr.approver_remark
                                     , rr.vendor_code
                                     , rr.cc_emails
                                     , rr.Request_By_EmployeeCode AS EMPLOYEE_CODE
                                     , CONCAT(m.empName, ' ', m.empSurname) AS FULL_NAME
                                     , m.empDept AS EMPLOYEE_DEPT
                                     , rr.CREATE_DATE

                                     -- Vendor Info
                                     , v.company_name
                                     , v.fft_vendor_code
                                     , v.fft_status
                                     , v.vendor_region
                                     , v.province
                                     , v.postal_code
                                     , v.address
                                     , v.tel_center
                                     , v.website
                                     , v.emailmain
                                     , vt.name AS vendor_type_name

                                     -- Contacts (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'contact_name', vc.contact_name,
                                                                               'tel_phone',    vc.tel_phone,
                                                                               'email',        vc.email,
                                                                               'position',     vc.position
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_contacts vc
                                                           WHERE
                                                                      vc.vendor_id = v.vendor_id AND vc.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS contacts

                                     -- Products (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'product_group', mpg.group_name,
                                                                               'maker_name',    vp.maker_name,
                                                                               'product_name',  vp.product_name,
                                                                               'model_list',    vp.model_list
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_products vp
                                                                           LEFT JOIN
                                                                      master_product_groups mpg ON mpg.product_group_id = vp.product_group_id
                                                           WHERE
                                                                      vp.vendor_id = v.vendor_id AND vp.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS products
                                     
                                     -- Documents (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'document_id', rrd.document_id,
                                                                               'file_name', rrd.file_name,
                                                                               'file_path', rrd.file_path,
                                                                               'file_size', rrd.file_size,
                                                                               'file_type', rrd.file_type
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_register_document rrd
                                                           WHERE
                                                                      rrd.request_id = rr.request_id AND rrd.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS documents

                                     -- Approval Steps (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
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
                                                                      )
                                                           FROM
                                                                      request_approval_step ras
                                                           WHERE
                                                                      ras.request_id = rr.request_id AND ras.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_steps

                                     -- Approval Logs (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'log_id', ral.log_id,
                                                                               'step_id', ral.step_id,
                                                                               'action_by', ral.action_by,
                                                                               'action_type', ral.action_type,
                                                                               'remark', ral.remark,
                                                                               'action_date', ral.action_date
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_log ral
                                                           WHERE
                                                                      ral.request_id = rr.request_id
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_logs

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.vendor_id = rr.vendor_id
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.empCode = rr.Request_By_EmployeeCode
                            WHERE
                                       rr.INUSE = 1
                                       dataItem.sqlWhere
                                       dataItem.sqlWhereColumnFilter
                            GROUP BY
                                       rr.request_id
                            ORDER BY
                                       dataItem.Order
                            LIMIT
                                       dataItem.Limit OFFSET dataItem.Offset
        `

        countSql = countSql.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
        countSql = countSql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'] || '')

        dataSql = dataSql.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
        dataSql = dataSql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'] || '')
        dataSql = dataSql.replaceAll('dataItem.Order', dataItem['Order'] || 'rr.request_id DESC')
        dataSql = dataSql.replaceAll('dataItem.Limit', (dataItem['Limit'] || 10).toString())
        dataSql = dataSql.replaceAll('dataItem.Offset', (dataItem['Offset'] || 0).toString())

        return [countSql, dataSql]
    },

    // ─── GET BY ID ───────────────────────────────────────────────────────────
    getById: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       rr.request_id
                                     , rr.vendor_id
                                     , rr.request_status
                                     , rr.supportProduct_Process
                                     , rr.purchase_frequency
                                     , rr.requester_remark
                                     , rr.approver_remark
                                     , rr.approve_by
                                     , rr.approve_date
                                     , rr.vendor_code
                                     , rr.cc_emails
                                     , rr.assign_to
                                     , rr.PIC_Email
                                     , rr.vendor_contact_id
                                     , rr.Request_By_EmployeeCode AS EMPLOYEE_CODE
                                     , CONCAT(m.empName, ' ', m.empSurname) AS FULL_NAME
                                     , m.empDept AS EMPLOYEE_DEPT
                                     , rr.CREATE_DATE

                                     -- Vendor Info
                                     , v.company_name
                                     , v.fft_vendor_code
                                     , v.fft_status
                                     , v.vendor_region
                                     , v.province
                                     , v.postal_code
                                     , v.address
                                     , v.tel_center
                                     , v.website
                                     , v.emailmain
                                     , vt.name AS vendor_type_name

                                     -- Contacts (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'contact_name', vc.contact_name,
                                                                               'tel_phone', vc.tel_phone,
                                                                               'email', vc.email,
                                                                               'position', vc.position
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_contacts vc
                                                           WHERE
                                                                      vc.vendor_id = v.vendor_id AND vc.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS contacts

                                     -- Products (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'product_group', mpg.group_name,
                                                                               'maker_name', vp.maker_name,
                                                                               'product_name', vp.product_name,
                                                                               'model_list', vp.model_list
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_products vp
                                                                           LEFT JOIN
                                                                      master_product_groups mpg ON mpg.product_group_id = vp.product_group_id
                                                           WHERE
                                                                      vp.vendor_id = v.vendor_id AND vp.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS products

                                     -- Documents (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'document_id', rrd.document_id,
                                                                               'file_name', rrd.file_name,
                                                                               'file_path', rrd.file_path,
                                                                               'file_size', rrd.file_size,
                                                                               'file_type', rrd.file_type
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_register_document rrd
                                                           WHERE
                                                                      rrd.request_id = rr.request_id AND rrd.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS documents

                                     -- Approval Steps (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
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
                                                                      )
                                                           FROM
                                                                      request_approval_step ras
                                                           WHERE
                                                                      ras.request_id = rr.request_id AND ras.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_steps

                                     -- Approval Logs (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'log_id', ral.log_id,
                                                                               'step_id', ral.step_id,
                                                                               'action_by', ral.action_by,
                                                                               'action_type', ral.action_type,
                                                                               'remark', ral.remark,
                                                                               'action_date', ral.action_date
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_log ral
                                                           WHERE
                                                                      ral.request_id = rr.request_id
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_logs

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.vendor_id = rr.vendor_id
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.vendor_type_id = v.vendor_type_id
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.empCode = rr.Request_By_EmployeeCode
                            WHERE
                                       rr.request_id = dataItem.request_id
                                       AND rr.INUSE = 1
                            LIMIT
                                       1
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())

        return sql
    },

    // ─── UPDATE REQUEST (PIC แก้ไขข้อมูลคำขอ) ─────────────────────────────────
    updateRequest: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_register_vendor SET
                                       vendor_contact_id =  dataItem.vendor_contact_id
                                     , supportProduct_Process = 'dataItem.supportProduct_Process'
                                     , purchase_frequency = 'dataItem.purchase_frequency'
                                     , requester_remark = 'dataItem.requester_remark'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       request_id = dataItem.request_id
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.vendor_contact_id', (dataItem['vendor_contact_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.supportProduct_Process', dataItem['supportProduct_Process'] || '')
        sql = sql.replaceAll('dataItem.purchase_frequency', dataItem['purchase_frequency'] || '')
        sql = sql.replaceAll('dataItem.requester_remark', dataItem['requester_remark'] || '')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

        return sql
    },

    // ─── UPDATE STATUS ────────────────────────────────────────────────────────
    updateStatus: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_register_vendor SET
                                       request_status = 'dataItem.request_status'
                                     , approve_by = 'dataItem.approve_by'
                                     , approve_date = 'dataItem.approve_date'
                                     , approver_remark = 'dataItem.approver_remark'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       request_id = dataItem.request_id
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.request_status', dataItem['request_status'] || '')
        sql = sql.replaceAll('dataItem.approve_by', dataItem['approve_by'] || '')
        sql = sql.replaceAll("'dataItem.approve_date'", dataItem['approve_date'] === 'NOW()' ? 'NOW()' : 'approve_date')
        sql = sql.replaceAll('dataItem.approver_remark', dataItem['approver_remark'] || '')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

        return sql
    },

    // ─── GET STATUS OPTIONS ──────────────────────────────────────────────────
    getStatusOptions: async (dataItem?: any) => {
        let sql = `
                            SELECT
                                       status_value AS value
                                     , status_label AS label
                                     , chip_color AS chipColor
                                     , accent_color AS accent
                                     , icon AS icon
                                     , sort_order AS sortOrder
                            FROM
                                       m_request_status
                            WHERE
                                       is_active = 1
                            ORDER BY
                                       sort_order ASC
        `
        return sql
    },

    // ─── APPROVAL STEPS ─────────────────────────────────────────────────────
    createApprovalStep: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            INSERT INTO request_approval_step (
                                       request_id
                                     , step_order
                                     , approver_id
                                     , step_status
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.request_id
                                     ,  dataItem.step_order
                                     , 'dataItem.approver_id'
                                     , 'dataItem.step_status'
                                     , 'dataItem.DESCRIPTION'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.step_order', (dataItem['step_order'] || 0).toString())
        sql = sql.replaceAll('dataItem.approver_id', dataItem['approver_id'] || '')
        sql = sql.replaceAll('dataItem.step_status', dataItem['step_status'] || '')
        sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'] || '')
        sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

        return sql
    },

    getApprovalSteps: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT 
                                       ras.step_id
                                     , ras.request_id
                                     , ras.step_order
                                     , ras.approver_id
                                     , ras.step_status
                                     , ras.DESCRIPTION
                                     , ras.CREATE_BY
                                     , ras.CREATE_DATE
                                     , ras.UPDATE_BY
                                     , ras.UPDATE_DATE
                                     , CONCAT(m.empName, ' ', m.empSurname) AS approver_name
                            FROM
                                       request_approval_step ras
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.empCode = ras.approver_id
                            WHERE
                                       ras.request_id = dataItem.request_id
                                       AND ras.INUSE = 1
                            ORDER BY
                                       ras.step_order ASC
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())

        return sql
    },

    updateApprovalStep: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_approval_step SET
                                       step_status = 'dataItem.step_status'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       step_id = dataItem.step_id
        `

        sql = sql.replaceAll('dataItem.step_id', (dataItem['step_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.step_status', dataItem['step_status'] || '')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

        return sql
    },

    // ─── APPROVAL LOGS ───────────────────────────────────────────────────────
    createApprovalLog: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            INSERT INTO request_approval_log (
                                       request_id
                                     , step_id
                                     , action_by
                                     , action_type
                                     , remark
                                     , action_date
                            ) VALUES (
                                        dataItem.request_id
                                     ,  dataItem.step_id
                                     , 'dataItem.action_by'
                                     , 'dataItem.action_type'
                                     , 'dataItem.remark'
                                     ,  NOW()
                            )
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.step_id', dataItem['step_id'] ? dataItem['step_id'].toString() : 'NULL')
        sql = sql.replaceAll('dataItem.action_by', dataItem['action_by'] || '')
        sql = sql.replaceAll('dataItem.action_type', dataItem['action_type'] || '')
        sql = sql.replaceAll('dataItem.remark', dataItem['remark'] || '')

        return sql
    },

    getApprovalLogs: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT 
                                       ral.log_id
                                     , ral.request_id
                                     , ral.step_id
                                     , ral.action_by
                                     , ral.action_type
                                     , ral.remark
                                     , ral.action_date
                                     , CONCAT(m.empName, ' ', m.empSurname) AS action_by_name
                            FROM
                                       request_approval_log ral
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.empCode = ral.action_by
                            WHERE
                                       ral.request_id = dataItem.request_id
                            ORDER BY
                                       ral.action_date ASC
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())

        return sql
    },

    // ─── UPDATE CC EMAILS ────────────────────────────────────────────────────
    updateCcEmails: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_register_vendor SET
                                       cc_emails = 'dataItem.cc_emails'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       request_id = dataItem.request_id
        `

        const ccArr = Array.isArray(dataItem['cc_emails']) ? dataItem['cc_emails'] : []
        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.cc_emails', JSON.stringify(ccArr))
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

        return sql
    },

    // ─── COMPLETE REGISTRATION (Account fills vendor code) ───────────────────
    completeRegistration: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_register_vendor SET
                                       vendor_code = 'dataItem.vendor_code'
                                     , request_status = 'Completed'
                                     , approve_by = 'dataItem.UPDATE_BY'
                                     , approve_date = NOW()
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       request_id = dataItem.request_id
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.vendor_code', dataItem['vendor_code'] || '')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

        return sql
    },

    // ─── GET SELECTION DATA ──────────────────────────────────────────────────
    getSelection: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT * FROM
                                       request_vendor_selections
                            WHERE
                                       request_id = 'dataItem.request_id' AND INUSE = 1
                            LIMIT
                                       1
        `
        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        return sql
    },

    getFinancials: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       year
                                     , total_revenue
                                     , net_profit 
                            FROM
                                       vendor_selection_financials
                            WHERE
                                       selection_id = dataItem.selection_id
                            ORDER BY
                                       year ASC
        `
        sql = sql.replaceAll('dataItem.selection_id', (dataItem['selection_id'] || 0).toString())
        return sql
    },

    getCriteria: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       criteria_no AS no
                                     , criteria_value AS criteria
                                     , remark
                                     , uploaded_file_path AS uploaded_file
                                     , uploaded_file_name AS uploaded_name
                            FROM
                                       vendor_selection_criteria
                            WHERE
                                       selection_id = dataItem.selection_id
                            ORDER BY
                                       criteria_id ASC
        `
        sql = sql.replaceAll('dataItem.selection_id', (dataItem['selection_id'] || 0).toString())
        return sql
    },

    // ─── SAVE GPR FORM A (Vendor Selection) ──────────────────────────────────
    
    // 1. Check if selection exists
    checkSelectionExists: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       selection_id
                            FROM
                                       request_vendor_selections 
                            WHERE
                                       request_id = 'dataItem.request_id'
                            LIMIT
                                       1
        `
        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        return sql
    },

    // 2A. Insert selection
    insertSelection: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            INSERT INTO request_vendor_selections (
                                       request_id
                                     , business_category
                                     , start_year
                                     , authorized_capital
                                     , establish_years
                                     , number_of_employees
                                     , manufactured_country
                                     , vendor_original_country
                                     , sanctions_status
                                     , currency
                                     , suggestion
                                     , result_status
                                     , document_path
                                     , vendor_code_selector
                                     , completion_date
                                     , CREATE_BY
                                     , UPDATE_BY
                            ) VALUES (
                                       'dataItem.request_id'
                                     , 'dataItem.business_category'
                                     , 'dataItem.start_year'
                                     , 'dataItem.authorized_capital'
                                     , 'dataItem.establish'
                                     , 'dataItem.number_of_employees'
                                     , 'dataItem.manufactured_country'
                                     , 'dataItem.vendor_original_country'
                                     , 'dataItem.sanctions'
                                     , 'dataItem.currency'
                                     , 'dataItem.suggestion'
                                     , 'dataItem.result'
                                     , 'dataItem.path'
                                     , 'dataItem.vendor_code_selector'
                                     ,  dataItem.completion_date_null
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                            )
        `
        const d = dataItem
        // Escape quotes helper
        const esc = (str: any) => String(str || '').replace(/'/g, "\\'")

        sql = sql.replaceAll('dataItem.request_id', esc(d['request_id']))
        sql = sql.replaceAll('dataItem.business_category', esc(d['business_category']))
        sql = sql.replaceAll('dataItem.start_year', esc(d['start_year']))
        sql = sql.replaceAll('dataItem.authorized_capital', esc(d['authorized_capital']))
        sql = sql.replaceAll('dataItem.establish', esc(d['establish']))
        sql = sql.replaceAll('dataItem.number_of_employees', esc(d['number_of_employees']))
        sql = sql.replaceAll('dataItem.manufactured_country', esc(d['manufactured_country']))
        sql = sql.replaceAll('dataItem.vendor_original_country', esc(d['vendor_original_country']))
        sql = sql.replaceAll('dataItem.sanctions', esc(d['sanctions']))
        sql = sql.replaceAll('dataItem.currency', esc(d['currency'] || 'THB'))
        sql = sql.replaceAll('dataItem.suggestion', esc(d['suggestion']))
        sql = sql.replaceAll('dataItem.result', esc(d['result']))
        sql = sql.replaceAll('dataItem.path', esc(d['path']))
        sql = sql.replaceAll('dataItem.vendor_code_selector', esc(d['vendor_code_selector']))
        
        if (d.completion_date) {
            sql = sql.replaceAll('dataItem.completion_date_null', `'${esc(d.completion_date)}'`)
        } else {
            sql = sql.replaceAll('dataItem.completion_date_null', 'NULL')
        }
        
        sql = sql.replaceAll('dataItem.UPDATE_BY', esc(d['UPDATE_BY'] || 'SYSTEM'))
        return sql
    },

    // 2B. Update selection
    updateSelection: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_vendor_selections SET
                                       business_category = 'dataItem.business_category'
                                     , start_year = 'dataItem.start_year'
                                     , authorized_capital = 'dataItem.authorized_capital'
                                     , establish_years = 'dataItem.establish'
                                     , number_of_employees = 'dataItem.number_of_employees'
                                     , manufactured_country = 'dataItem.manufactured_country'
                                     , vendor_original_country = 'dataItem.vendor_original_country'
                                     , sanctions_status = 'dataItem.sanctions'
                                     , currency = 'dataItem.currency'
                                     , suggestion = 'dataItem.suggestion'
                                     , result_status = 'dataItem.result'
                                     , document_path = 'dataItem.path'
                                     , vendor_code_selector = 'dataItem.vendor_code_selector'
                                     , completion_date = dataItem.completion_date_null
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       selection_id = dataItem.selection_id
        `
        const d = dataItem
        const esc = (str: any) => String(str || '').replace(/'/g, "\\'")

        sql = sql.replaceAll('dataItem.selection_id', (d['selection_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.business_category', esc(d['business_category']))
        sql = sql.replaceAll('dataItem.start_year', esc(d['start_year']))
        sql = sql.replaceAll('dataItem.authorized_capital', esc(d['authorized_capital']))
        sql = sql.replaceAll('dataItem.establish', esc(d['establish']))
        sql = sql.replaceAll('dataItem.number_of_employees', esc(d['number_of_employees']))
        sql = sql.replaceAll('dataItem.manufactured_country', esc(d['manufactured_country']))
        sql = sql.replaceAll('dataItem.vendor_original_country', esc(d['vendor_original_country']))
        sql = sql.replaceAll('dataItem.sanctions', esc(d['sanctions']))
        sql = sql.replaceAll('dataItem.currency', esc(d['currency'] || 'THB'))
        sql = sql.replaceAll('dataItem.suggestion', esc(d['suggestion']))
        sql = sql.replaceAll('dataItem.result', esc(d['result']))
        sql = sql.replaceAll('dataItem.path', esc(d['path']))
        sql = sql.replaceAll('dataItem.vendor_code_selector', esc(d['vendor_code_selector']))

        if (d.completion_date) {
            sql = sql.replaceAll('dataItem.completion_date_null', `'${esc(d.completion_date)}'`)
        } else {
            sql = sql.replaceAll('dataItem.completion_date_null', 'NULL')
        }

        sql = sql.replaceAll('dataItem.UPDATE_BY', esc(d['UPDATE_BY'] || 'SYSTEM'))
        return sql
    },

    // 3. Clear existing list data
    deleteFinancials: (dataItem: RegisterRequestDataItem) => {
        let sql = `DELETE FROM vendor_selection_financials WHERE selection_id = dataItem.selection_id`
        sql = sql.replaceAll('dataItem.selection_id', (dataItem.selection_id || 0).toString())
        return sql
    },

    deleteCriteria: (dataItem: RegisterRequestDataItem) => {
        let sql = `DELETE FROM vendor_selection_criteria WHERE selection_id = dataItem.selection_id`
        sql = sql.replaceAll('dataItem.selection_id', (dataItem.selection_id || 0).toString())
        return sql
    },

    // 4. Insert Financial Data
    insertFinancial: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            INSERT INTO vendor_selection_financials (selection_id, year, total_revenue, net_profit)
                            VALUES (dataItem.selection_id, 'dataItem.year', dataItem.total_revenue, dataItem.net_profit)
        `
        const esc = (str: any) => String(str || '').replace(/'/g, "\\'")
        sql = sql.replaceAll('dataItem.selection_id', (dataItem.selection_id || 0).toString())
        sql = sql.replaceAll('dataItem.year', esc(dataItem.year))
        
        // Ensure numeric or NULL
        const rev = parseFloat(dataItem.total_revenue as string)
        const pro = parseFloat(dataItem.net_profit as string)
        sql = sql.replaceAll('dataItem.total_revenue', isNaN(rev) ? 'NULL' : String(rev))
        sql = sql.replaceAll('dataItem.net_profit', isNaN(pro) ? 'NULL' : String(pro))
        
        return sql
    },

    // 5. Insert Criteria Data
    insertCriteria: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            INSERT INTO vendor_selection_criteria (selection_id, criteria_no, criteria_value, remark, uploaded_file_path, uploaded_file_name)
                            VALUES (dataItem.selection_id, 'dataItem.no', 'dataItem.criteria', 'dataItem.remark', dataItem.path_null, dataItem.name_null)
        `
        const esc = (str: any) => String(str || '').replace(/'/g, "\\'")
        sql = sql.replaceAll('dataItem.selection_id', (dataItem.selection_id || 0).toString())
        sql = sql.replaceAll('dataItem.no', esc(dataItem.no))
        sql = sql.replaceAll('dataItem.criteria', esc(dataItem.criteria))
        sql = sql.replaceAll('dataItem.remark', esc(dataItem.remark))

        if (dataItem.uploaded_file) {
            sql = sql.replaceAll('dataItem.path_null', `'${esc(dataItem.uploaded_file)}'`)
        } else {
            sql = sql.replaceAll('dataItem.path_null', 'NULL')
        }

        if (dataItem.uploaded_name) {
            sql = sql.replaceAll('dataItem.name_null', `'${esc(dataItem.uploaded_name)}'`)
        } else {
            sql = sql.replaceAll('dataItem.name_null', 'NULL')
        }

        return sql
    }
}
