export interface RegisterRequestDataItem {
    request_id?: number | string;
    request_number?: string;
    vendor_id?: number | string;
    vendor_contact_id?: number | string;
    Request_By_EmployeeCode?: string;
    supportProduct_Process?: string;
    purchase_frequency?: string;
    request_status?: string;
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
    step_code?: string;
    actor_type?: string;
    group_code?: string;
    assignment_mode?: string;
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
    gpr_c_approver_name?: string;
    gpr_c_approver_email?: string;
    gpr_c_pc_pic_name?: string;
    gpr_c_pc_pic_email?: string;
    gpr_c_circular_json?: string;
    action_required_json?: string;
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
    vendor_region?: string;
    group_name?: string;
    scope?: string;
    from_empcode?: string;
    to_empcode?: string;
    changed_by?: string;
    reason?: string;
    fft_status?: number | string;
    empcode?: string;
    target_group?: string;
    target_compact?: string;
    group_compact?: string;
    is_oversea?: boolean | number | string;
}

export const ApprovalQueueSQL = {
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
                                                                         , rr.request_number
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
                                     , rvs.gpr_c_approver_name
                                     , rvs.gpr_c_approver_email
                                     , rvs.gpr_c_pc_pic_name
                                     , rvs.gpr_c_pc_pic_email
                                     , rvs.gpr_c_circular_json
                                     , rvs.action_required_json
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
                                                                               'approver_name', (SELECT CONCAT(pm.empName, ' ', pm.empSurname) FROM Person.MEMBER_FED pm WHERE pm.empCode = ras.approver_id LIMIT 1),
                                                                               'step_status', ras.step_status,
                                                                               'DESCRIPTION', ras.DESCRIPTION,
                                                                               'step_code', ras.step_code,
                                                                               'actor_type', ras.actor_type,
                                                                               'group_code', ras.group_code,
                                                                               'assignment_mode', ras.assignment_mode,
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

                                     -- GPR Criteria (inline JSON for pass/fail evaluation)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'no', vsc.criteria_no,
                                                                               'criteria', vsc.criteria_value,
                                                                               'uploaded_file', vsc.uploaded_file_path,
                                                                               'uploaded_name', vsc.uploaded_file_name
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_vendor_selections rvs2
                                                                           JOIN
                                                                      vendor_selection_criteria vsc ON vsc.selection_id = rvs2.selection_id
                                                           WHERE
                                                                      rvs2.request_id = rr.request_id AND rvs2.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS gpr_criteria

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.request_id = rr.request_id AND rvs.INUSE = 1
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

    getStatusOptions: async (dataItem?: any) => {
        let sql = `
                            SELECT
                                       status_value AS value
                                     , status_label AS label
                                     , step_code AS stepCode
                                     , actor_type AS actorType
                                     , default_group_code_local AS defaultGroupCodeLocal
                                     , default_group_code_oversea AS defaultGroupCodeOversea
                                     , requires_vendor_reply AS requiresVendorReply
                                     , requires_vendor_code AS requiresVendorCode
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


    getRequestStatusAndAssign: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       request_status
                                     , assign_to
                            FROM
                                       request_register_vendor
                            WHERE
                                       request_id = dataItem.request_id
                                       AND INUSE = 1
                            LIMIT
                                       1
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())

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
                                     , ras.step_code
                                     , ras.actor_type
                                     , ras.group_code
                                     , ras.assignment_mode
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


    getRequestStatusContext: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       rr.vendor_id
                                     , rr.assign_to
                                     , rvs.vendor_code_selector
                                     , rvs.gpr_c_approver_name
                                     , rvs.gpr_c_approver_email
                                     , rvs.gpr_c_pc_pic_name
                                     , rvs.gpr_c_pc_pic_email
                                     , rvs.gpr_c_circular_json
                                     , rvs.action_required_json
                                     , v.vendor_region
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.vendor_id = rr.vendor_id
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.request_id = rr.request_id AND rvs.INUSE = 1
                            WHERE
                                       rr.request_id = dataItem.request_id
                            ORDER BY
                                       rvs.selection_id DESC
                            LIMIT
                                       1
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())

        return sql
    },


    getRequesterByRequestId: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       Request_By_EmployeeCode
                            FROM
                                       request_register_vendor
                            WHERE
                                       request_id = dataItem.request_id
                            LIMIT
                                       1
        `
        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        return sql
    },


    getApproverByGroupCode: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       empcode
                                     , empName
                                     , empEmail
                            FROM
                                       assignees_to
                            WHERE
                                       group_code = 'dataItem.group_code'
                                       AND INUSE = 1
                            ORDER BY
                                       Assignees_id ASC
                            LIMIT
                                       1
        `

        sql = sql.replaceAll('dataItem.group_code', dataItem['group_code'] || '')

        return sql
    },


    getActiveAssigneeByEmpCodeAndGroupCode: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       Assignees_id
                                     , empcode
                                     , empName
                                     , empEmail
                                     , group_code
                                     , group_name
                                     , INUSE
                            FROM
                                       assignees_to
                            WHERE
                                       empcode = 'dataItem.empcode'
                                       AND (
                                           UPPER(TRIM(COALESCE(group_code, ''))) = 'dataItem.group_code'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = 'dataItem.group_code'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_code, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.group_compact'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.group_compact'
                                       )
                                       AND INUSE = 1
                            LIMIT
                                       1
        `

        sql = sql.replaceAll('dataItem.empcode', dataItem['empcode'] || '')
        sql = sql.replaceAll('dataItem.group_code', dataItem['group_code'] || '')
        sql = sql.replaceAll('dataItem.group_compact', dataItem['group_compact'] || '')

        return sql
    },

    getSelection: (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT * FROM
                                       request_vendor_selections
                            WHERE
                                       request_id = 'dataItem.request_id' AND INUSE = 1
                            ORDER BY
                                       selection_id DESC
                            LIMIT
                                       1
        `
        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
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


    updateRequestVendorCode: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_register_vendor SET
                                       vendor_code = 'dataItem.vendor_code'
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


    updateVendorFftVendorCode: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE vendors SET
                                       fft_vendor_code = 'dataItem.vendor_code'
                            WHERE
                                       vendor_id = dataItem.vendor_id
        `

        sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.vendor_code', dataItem['vendor_code'] || '')

        return sql
    },


    updateVendorFftStatus: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE vendors SET
                                       fft_status = dataItem.fft_status
                            WHERE
                                       vendor_id = dataItem.vendor_id
        `

        sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.fft_status', (dataItem['fft_status'] || 0).toString())

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


    updateApprovalStepApprover: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_approval_step SET
                                       approver_id = 'dataItem.approver_id'
                                     , assignment_mode = 'dataItem.assignment_mode'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       step_id = dataItem.step_id
        `

        sql = sql.replaceAll('dataItem.step_id', (dataItem['step_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.approver_id', dataItem['approver_id'] || '')
        sql = sql.replaceAll('dataItem.assignment_mode', dataItem['assignment_mode'] || 'MANUAL')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

        return sql
    },


    markRequestCompleted: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_register_vendor SET
                                       request_status = 'Completed'
                                     , approve_date = NOW()
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       request_id = dataItem.request_id
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

        return sql
    },

    getById: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       rr.request_id
                                                                         , rr.request_number
                                     , rr.vendor_id
                                     , rr.request_status
                                     , rr.supportProduct_Process
                                     , rr.purchase_frequency
                                     , rr.requester_remark
                                     , rr.approver_remark
                                     , rr.approve_by
                                     , rr.approve_date
                                     , rr.vendor_code
                                     , rr.assign_to
                                     , rr.PIC_Email
                                     , rr.vendor_contact_id
                                     , rr.Request_By_EmployeeCode AS EMPLOYEE_CODE
                                     , CONCAT(m.empName, ' ', m.empSurname) AS FULL_NAME
                                     , m.empDept AS EMPLOYEE_DEPT
                                     , rr.CREATE_DATE
                                     , rvs.gpr_c_approver_name
                                     , rvs.gpr_c_approver_email
                                     , rvs.gpr_c_pc_pic_name
                                     , rvs.gpr_c_pc_pic_email
                                     , rvs.gpr_c_circular_json
                                     , rvs.action_required_json

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
                                                                               'approver_name', (SELECT CONCAT(pm.empName, ' ', pm.empSurname) FROM Person.MEMBER_FED pm WHERE pm.empCode = ras.approver_id LIMIT 1),
                                                                               'step_status', ras.step_status,
                                                                               'DESCRIPTION', ras.DESCRIPTION,
                                                                               'step_code', ras.step_code,
                                                                               'actor_type', ras.actor_type,
                                                                               'group_code', ras.group_code,
                                                                               'assignment_mode', ras.assignment_mode,
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

                                     -- GPR Criteria (inline JSON for pass/fail evaluation)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'no', vsc.criteria_no,
                                                                               'criteria', vsc.criteria_value,
                                                                               'uploaded_file', vsc.uploaded_file_path,
                                                                               'uploaded_name', vsc.uploaded_file_name
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_vendor_selections rvs2
                                                                           JOIN
                                                                      vendor_selection_criteria vsc ON vsc.selection_id = rvs2.selection_id
                                                           WHERE
                                                                      rvs2.request_id = rr.request_id AND rvs2.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS gpr_criteria

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.request_id = rr.request_id AND rvs.INUSE = 1
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


    getAssigneeByEmpCode: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            SELECT
                                       Assignees_id
                                     , empcode
                                     , empName
                                     , empEmail
                                     , group_code
                                     , group_name
                                     , INUSE
                            FROM
                                       assignees_to
                            WHERE
                                       empcode = 'dataItem.to_empcode'
                            LIMIT
                                       1
        `

        sql = sql.replaceAll('dataItem.to_empcode', dataItem['to_empcode'] || '')

        return sql
    },


    updateRequestPicAssignee: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            UPDATE request_register_vendor SET
                                       assign_to = 'dataItem.assign_to'
                                     , PIC_Email = 'dataItem.PIC_Email'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       request_id = dataItem.request_id
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.assign_to', dataItem['assign_to'] || '')
        sql = sql.replaceAll('dataItem.PIC_Email', dataItem['PIC_Email'] || '')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

        return sql
    },


    insertAssignmentHistory: async (dataItem: RegisterRequestDataItem) => {
        let sql = `
                            INSERT INTO request_assignment_history (
                                       request_id
                                     , step_id
                                     , scope
                                     , step_code
                                     , group_code
                                     , from_empcode
                                     , to_empcode
                                     , reason
                                     , DESCRIPTION
                                     , changed_by
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.request_id
                                     ,  dataItem.step_id
                                     , 'dataItem.scope'
                                     , 'dataItem.step_code'
                                     , 'dataItem.group_code'
                                     , 'dataItem.from_empcode'
                                     , 'dataItem.to_empcode'
                                     , 'dataItem.reason'
                                     , 'dataItem.DESCRIPTION'
                                     , 'dataItem.changed_by'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     ,  dataItem.INUSE
                            )
        `

        sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
        sql = sql.replaceAll('dataItem.step_id', dataItem['step_id'] ? dataItem['step_id'].toString() : 'NULL')
        sql = sql.replaceAll('dataItem.scope', dataItem['scope'] || '')
        sql = sql.replaceAll('dataItem.step_code', dataItem['step_code'] || '')
        sql = sql.replaceAll('dataItem.group_code', dataItem['group_code'] || '')
        sql = sql.replaceAll('dataItem.from_empcode', dataItem['from_empcode'] || '')
        sql = sql.replaceAll('dataItem.to_empcode', dataItem['to_empcode'] || '')
        sql = sql.replaceAll('dataItem.reason', dataItem['reason'] || '')
        sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'] || dataItem['reason'] || '')
        sql = sql.replaceAll('dataItem.changed_by', dataItem['changed_by'] || dataItem['UPDATE_BY'] || 'SYSTEM')
        sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || dataItem['changed_by'] || dataItem['UPDATE_BY'] || 'SYSTEM')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || dataItem['changed_by'] || 'SYSTEM')
        sql = sql.replaceAll('dataItem.INUSE', '1')

        return sql
    },

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
    }
}
