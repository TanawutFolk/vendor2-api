export interface RegisterRequestDataItem {
  request_id?: number | string
  request_number?: string
  vendor_id?: number | string
  vendor_contact_id?: number | string
  Request_By_EmployeeCode?: string
  supportProduct_Process?: string
  purchase_frequency?: string
  request_status?: string
  requester_remark?: string
  assign_to?: string
  PIC_Email?: string
  CREATE_BY?: string
  UPDATE_BY?: string
  file_name?: string
  file_path?: string
  file_size?: number | string
  file_type?: string
  sqlWhere?: string
  sqlWhereColumnFilter?: string
  Order?: string
  Limit?: number | string
  Offset?: number | string
  approve_by?: string
  approve_date?: string
  approver_remark?: string
  step_id?: number | string
  step_order?: number | string
  approver_id?: string
  step_status?: string
  DESCRIPTION?: string
  step_code?: string
  actor_type?: string
  group_code?: string
  assignment_mode?: string
  action_by?: string
  action_type?: string
  remark?: string
  vendor_code?: string
  selection_id?: number | string
  business_category?: string
  start_year?: string
  authorized_capital?: string
  establish?: string
  number_of_employees?: string
  manufactured_country?: string
  vendor_original_country?: string
  sanctions?: string
  currency?: string
  suggestion?: string
  result?: string
  path?: string
  vendor_code_selector?: string
  completion_date?: string
  gpr_c_approver_name?: string
  gpr_c_approver_email?: string
  gpr_c_pc_pic_name?: string
  gpr_c_pc_pic_email?: string
  gpr_c_circular_json?: string
  action_required_json?: string
  completion_date_null?: string
  year?: string
  total_revenue?: number | string
  net_profit?: number | string
  no?: string | number
  criteria?: string
  uploaded_file?: string
  uploaded_name?: string
  path_null?: string
  name_null?: string
  vendor_region?: string
  group_name?: string
  scope?: string
  from_empcode?: string
  to_empcode?: string
  changed_by?: string
  reason?: string
  fft_status?: number | string
  empcode?: string
  target_group?: string
  target_compact?: string
  group_compact?: string
  is_oversea?: boolean | number | string
}

export const RequestRegisterPageSQL = {
  getVendorCreateContext: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       v.company_name
                                     , v.address
                                     , v.vendor_region
                                     , v.emailmain
                                     , vc.contact_name
                                     , vc.email
                                     , vc.tel_phone
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       vendor_contacts vc ON vc.vendor_id = v.vendor_id
                            WHERE
                                       v.vendor_id = dataItem.vendor_id
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())

    return sql
  },

  getActiveAssigneesByGroupCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       empName
                                     , empcode
                                     , empEmail
                            FROM
                                       assignees_to
                            WHERE
                                       group_code = 'dataItem.group_code'
                                       AND INUSE = 1
                            ORDER BY
                                       Assignees_id ASC
        `

    sql = sql.replaceAll('dataItem.group_code', dataItem['group_code'] || '')

    return sql
  },

  getLastAssignedPicByVendorRegion: async (dataItem: RegisterRequestDataItem) => {
    const isOversea = String(dataItem['is_oversea'] || '').toLowerCase() === 'true' || Number(dataItem['is_oversea']) === 1

    const vendorRegionClause = isOversea ? `= 'Oversea'` : `!= 'Oversea' OR v.vendor_region IS NULL`

    let sql = `
                            SELECT
                                       rr.assign_to
                            FROM
                                       request_register_vendor rr
                                            JOIN
                                       vendors v ON v.vendor_id = rr.vendor_id
                            WHERE
                                       (v.vendor_region ${vendorRegionClause})
                                       AND rr.assign_to IS NOT NULL
                                       AND rr.assign_to != ''
                            ORDER BY
                                       rr.request_id DESC
                            LIMIT
                                       1
        `

    return sql
  },

  updateRequestNumber: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       request_number = 'dataItem.request_number'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       request_id = dataItem.request_id
        `

    sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.request_number', dataItem['request_number'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

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

  getPeerCcRowsByNormalizedGroup: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       empcode
                                     , empEmail
                                     , group_code
                                     , group_name
                            FROM
                                       assignees_to
                            WHERE
                                       (
                                           UPPER(TRIM(COALESCE(group_code, ''))) = 'dataItem.target_group'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = 'dataItem.target_group'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_code, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.target_compact'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.target_compact'
                                       )
                                       AND INUSE = 1
                            ORDER BY
                                       Assignees_id ASC
        `

    sql = sql.replaceAll('dataItem.target_group', dataItem['target_group'] || '')
    sql = sql.replaceAll('dataItem.target_compact', dataItem['target_compact'] || '')

    return sql
  },

  getMemberByEmpCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       empName
                                     , empSurname
                                     , empEmail
                            FROM
                                       Person.MEMBER_FED
                            WHERE
                                       empCode = 'dataItem.empcode'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.empcode', dataItem['empcode'] || '')

    return sql
  },

  getAssigneeByEmpCodeContact: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       empName
                                     , empEmail
                            FROM
                                       assignees_to
                            WHERE
                                       empcode = 'dataItem.empcode'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.empcode', dataItem['empcode'] || '')

    return sql
  },

  getAssigneeEmailByEmpCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       empEmail
                            FROM
                                       assignees_to
                            WHERE
                                       empcode = 'dataItem.empcode'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.empcode', dataItem['empcode'] || '')

    return sql
  },

  getNotificationVendorContextByRequestId: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       rr.request_number
                                     , rr.CREATE_DATE
                                     , rr.assign_to
                                     , rr.supportProduct_Process
                                     , rr.purchase_frequency
                                     , rr.vendor_contact_id
                                     , rr.Request_By_EmployeeCode
                                     , rr.vendor_code
                                     , rvs.gpr_c_approver_name
                                     , rvs.gpr_c_approver_email
                                     , rvs.gpr_c_pc_pic_name
                                     , rvs.gpr_c_pc_pic_email
                                     , rvs.gpr_c_circular_json
                                     , rvs.action_required_json
                                     , v.company_name
                                     , v.address
                                     , v.vendor_region
                                     , v.emailmain
                                     , v.emailmain AS vendor_main_email
                                     , v.fft_vendor_code
                                     , vc.contact_name
                                     , vc.email AS vendor_email
                                     , vc.tel_phone
                                     , vc_sel.email AS selected_vendor_email
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.vendor_id = rr.vendor_id
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.request_id = rr.request_id AND rvs.INUSE = 1
                                            LEFT JOIN
                                       vendor_contacts vc ON vc.vendor_id = v.vendor_id
                                            LEFT JOIN
                                       vendor_contacts vc_sel ON vc_sel.vendor_contact_id = rr.vendor_contact_id AND vc_sel.INUSE = 1
                            WHERE
                                       rr.request_id = dataItem.request_id
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())

    return sql
  },

  createRequest: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_register_vendor (
                                       vendor_id
                                     , vendor_contact_id
                                     , Request_By_EmployeeCode
                                     , supportProduct_Process
                                     , purchase_frequency
                                     , request_status
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
    sql = sql.replaceAll('dataItem.requester_remark', dataItem['requester_remark'] || '')
    sql = sql.replaceAll('dataItem.assign_to', dataItem['assign_to'] || '')
    sql = sql.replaceAll('dataItem.PIC_Email', dataItem['PIC_Email'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  createDocument: async (dataItem: RegisterRequestDataItem) => {
    const requestId = Number(dataItem['request_id'] || 0)
    if (!requestId || Number.isNaN(requestId)) {
      throw new Error(`Invalid request_id for createDocument: ${String(dataItem['request_id'])}`)
    }

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

    sql = sql.replaceAll('dataItem.request_id', requestId.toString())
    sql = sql.replaceAll('dataItem.file_name', dataItem['file_name'] || '')
    sql = sql.replaceAll('dataItem.file_path', dataItem['file_path'] || '')
    sql = sql.replaceAll('dataItem.file_size', (dataItem['file_size'] || 0).toString())
    sql = sql.replaceAll('dataItem.file_type', dataItem['file_type'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

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

  createApprovalStep: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_approval_step (
                                       request_id
                                     , step_order
                                     , approver_id
                                     , step_status
                                     , DESCRIPTION
                                     , step_code
                                     , actor_type
                                     , group_code
                                     , assignment_mode
                                     , CREATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.request_id
                                     ,  dataItem.step_order
                                     , 'dataItem.approver_id'
                                     , 'dataItem.step_status'
                                     , 'dataItem.DESCRIPTION'
                                     , 'dataItem.step_code'
                                     , 'dataItem.actor_type'
                                     , 'dataItem.group_code'
                                     , 'dataItem.assignment_mode'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.step_order', (dataItem['step_order'] || 0).toString())
    sql = sql.replaceAll('dataItem.approver_id', dataItem['approver_id'] || '')
    sql = sql.replaceAll('dataItem.step_status', dataItem['step_status'] || '')
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'] || '')
    sql = sql.replaceAll('dataItem.step_code', dataItem['step_code'] || '')
    sql = sql.replaceAll('dataItem.actor_type', dataItem['actor_type'] || '')
    sql = sql.replaceAll('dataItem.group_code', dataItem['group_code'] || '')
    sql = sql.replaceAll('dataItem.assignment_mode', dataItem['assignment_mode'] || 'AUTO')
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

  updateCcEmails: async (_dataItem: RegisterRequestDataItem) => {
    return `SELECT 1 AS noop`
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
                                     , gpr_c_approver_name
                                     , gpr_c_approver_email
                                     , gpr_c_pc_pic_name
                                     , gpr_c_pc_pic_email
                                     , gpr_c_circular_json
                                     , action_required_json
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
                                     , 'dataItem.gpr_c_approver_name'
                                     , 'dataItem.gpr_c_approver_email'
                                     , 'dataItem.gpr_c_pc_pic_name'
                                     , 'dataItem.gpr_c_pc_pic_email'
                                     , 'dataItem.gpr_c_circular_json'
                                     , 'dataItem.action_required_json'
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
    sql = sql.replaceAll('dataItem.gpr_c_approver_name', esc(d['gpr_c_approver_name']))
    sql = sql.replaceAll('dataItem.gpr_c_approver_email', esc(d['gpr_c_approver_email']))
    sql = sql.replaceAll('dataItem.gpr_c_pc_pic_name', esc(d['gpr_c_pc_pic_name']))
    sql = sql.replaceAll('dataItem.gpr_c_pc_pic_email', esc(d['gpr_c_pc_pic_email']))
    sql = sql.replaceAll('dataItem.gpr_c_circular_json', esc(d['gpr_c_circular_json']))
    sql = sql.replaceAll('dataItem.action_required_json', esc(d['action_required_json']))

    if (d.completion_date) {
      sql = sql.replaceAll('dataItem.completion_date_null', `'${esc(d.completion_date)}'`)
    } else {
      sql = sql.replaceAll('dataItem.completion_date_null', 'NULL')
    }

    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(d['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  // 2B. Update selection,

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
                                     , gpr_c_approver_name = 'dataItem.gpr_c_approver_name'
                                     , gpr_c_approver_email = 'dataItem.gpr_c_approver_email'
                                     , gpr_c_pc_pic_name = 'dataItem.gpr_c_pc_pic_name'
                                     , gpr_c_pc_pic_email = 'dataItem.gpr_c_pc_pic_email'
                                     , gpr_c_circular_json = 'dataItem.gpr_c_circular_json'
                                     , action_required_json = 'dataItem.action_required_json'
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
    sql = sql.replaceAll('dataItem.gpr_c_approver_name', esc(d['gpr_c_approver_name']))
    sql = sql.replaceAll('dataItem.gpr_c_approver_email', esc(d['gpr_c_approver_email']))
    sql = sql.replaceAll('dataItem.gpr_c_pc_pic_name', esc(d['gpr_c_pc_pic_name']))
    sql = sql.replaceAll('dataItem.gpr_c_pc_pic_email', esc(d['gpr_c_pc_pic_email']))
    sql = sql.replaceAll('dataItem.gpr_c_circular_json', esc(d['gpr_c_circular_json']))
    sql = sql.replaceAll('dataItem.action_required_json', esc(d['action_required_json']))

    if (d.completion_date) {
      sql = sql.replaceAll('dataItem.completion_date_null', `'${esc(d.completion_date)}'`)
    } else {
      sql = sql.replaceAll('dataItem.completion_date_null', 'NULL')
    }

    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(d['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  updateSelectionGprCOnly: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_vendor_selections SET
                                       gpr_c_approver_name = 'dataItem.gpr_c_approver_name'
                                     , gpr_c_approver_email = 'dataItem.gpr_c_approver_email'
                                     , gpr_c_pc_pic_name = 'dataItem.gpr_c_pc_pic_name'
                                     , gpr_c_pc_pic_email = 'dataItem.gpr_c_pc_pic_email'
                                     , gpr_c_circular_json = 'dataItem.gpr_c_circular_json'
                                     , action_required_json = 'dataItem.action_required_json'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       selection_id = dataItem.selection_id
        `

    const d = dataItem
    const esc = (str: any) => String(str || '').replace(/'/g, "\\'")

    sql = sql.replaceAll('dataItem.selection_id', (d['selection_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.gpr_c_approver_name', esc(d['gpr_c_approver_name']))
    sql = sql.replaceAll('dataItem.gpr_c_approver_email', esc(d['gpr_c_approver_email']))
    sql = sql.replaceAll('dataItem.gpr_c_pc_pic_name', esc(d['gpr_c_pc_pic_name']))
    sql = sql.replaceAll('dataItem.gpr_c_pc_pic_email', esc(d['gpr_c_pc_pic_email']))
    sql = sql.replaceAll('dataItem.gpr_c_circular_json', esc(d['gpr_c_circular_json']))
    sql = sql.replaceAll('dataItem.action_required_json', esc(d['action_required_json']))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(d['UPDATE_BY'] || 'SYSTEM'))

    return sql
  },

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

  // 4. Insert Financial Data,

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

  insertCriteria: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO vendor_selection_criteria (
                                       selection_id
                                     , criteria_no
                                     , criteria_value
                                     , remark
                                     , uploaded_file_path
                                     , uploaded_file_name
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       dataItem.selection_id
                                     , 'dataItem.no'
                                     , 'dataItem.criteria'
                                     , 'dataItem.remark'
                                     , dataItem.path_null
                                     , dataItem.name_null
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            )
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

    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))

    return sql
  },
}
