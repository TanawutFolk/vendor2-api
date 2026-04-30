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

export const AccRegisterSQL = {

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
    }
}
