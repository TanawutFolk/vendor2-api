export interface RegisterRequestDataItem {
  [key: string]: any
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
  request_number_year?: string
  request_number_prefix?: string
  vendor_contact_ids?: Array<number | string>
  is_primary?: number | string
}

export const RequestRegisterPageSQL = {
  getVendorCreateContext: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       v.COMPANY_NAME
                                     , v.ADDRESS
                                     , v.VENDOR_REGION
                                     , v.EMAILMAIN
                                     , vc.CONTACT_NAME
                                     , vc.EMAIL
                                     , vc.TEL_PHONE
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       vendor_contacts vc ON vc.VENDOR_ID = v.VENDOR_ID
                                            AND vc.INUSE = 1
                                            AND COALESCE(vc.EMAIL, '') != ''
                            WHERE
                                       v.VENDOR_ID = dataItem.VENDOR_ID
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())

    return sql
  },

  getActiveAssigneesByGroupCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       EMPNAME
                                     , EMPCODE
                                     , EMPEMAIL
                            FROM
                                       assignees_to
                            WHERE
                                       GROUP_CODE = 'dataItem.GROUP_CODE'
                                       AND INUSE = 1
                            ORDER BY
                                       ASSIGNEES_ID ASC
        `

    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')

    return sql
  },

  getLastAssignedPicByVendorRegion: async (dataItem: RegisterRequestDataItem) => {
    const isOversea = String(dataItem['IS_OVERSEA'] || '').toLowerCase() === 'true' || Number(dataItem['IS_OVERSEA']) === 1

    const vendorRegionClause = isOversea ? `= 'Oversea'` : `!= 'Oversea' OR v.VENDOR_REGION IS NULL`

    let sql = `
                            SELECT
                                       rr.ASSIGN_TO
                            FROM
                                       request_register_vendor rr
                                            JOIN
                                       vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                            WHERE
                                       (v.VENDOR_REGION dataItem.VENDORREGIONCLAUSE)
                                       AND rr.ASSIGN_TO IS NOT NULL
                                       AND rr.ASSIGN_TO != ''
                            ORDER BY
                                       rr.REQUEST_ID DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.VENDORREGIONCLAUSE', vendorRegionClause)

    return sql
  },

  updateRequestNumber: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       REQUEST_NUMBER = 'dataItem.REQUEST_NUMBER'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_NUMBER', dataItem['REQUEST_NUMBER'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getNextRequestRunningNumber: async (dataItem: RegisterRequestDataItem) => {
    const year = String(dataItem['REQUEST_NUMBER_YEAR'] || '').replace(/[^0-9]/g, '').slice(-2)
    const prefix = String(dataItem['REQUEST_NUMBER_PREFIX'] || 'N')
      .trim()
      .toUpperCase() === 'R'
      ? 'R'
      : 'N'

    let sql = `
                            SELECT
                                       COALESCE(
                                         MAX(
                                           CAST(
                                             SUBSTRING_INDEX(REQUEST_NUMBER, '-dataItem.PREFIX', -1)
                                             AS UNSIGNED
                                           )
                                         ),
                                         0
                                       ) + 1 AS next_no
                            FROM
                                       request_register_vendor
                            WHERE
                                       REQUEST_NUMBER LIKE '%-dataItem.YEAR-dataItem.PREFIX%'
                                       AND REQUEST_NUMBER REGEXP '-dataItem.PREFIX[0-9]+$'
        `

    sql = sql.replaceAll('dataItem.YEAR', year)
    sql = sql.replaceAll('dataItem.PREFIX', prefix)

    return sql
  },

  getRequestStatusAndAssign: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       REQUEST_STATUS
                                     , ASSIGN_TO
                            FROM
                                       request_register_vendor
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
                                       AND INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  getPeerCcRowsByNormalizedGroup: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       EMPCODE
                                     , EMPEMAIL
                                     , GROUP_CODE
                                     , GROUP_NAME
                            FROM
                                       assignees_to
                            WHERE
                                       (
                                           UPPER(TRIM(COALESCE(GROUP_CODE, ''))) = 'dataItem.TARGET_GROUP'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = 'dataItem.TARGET_GROUP'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_CODE, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.TARGET_COMPACT'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.TARGET_COMPACT'
                                       )
                                       AND INUSE = 1
                            ORDER BY
                                       ASSIGNEES_ID ASC
        `

    sql = sql.replaceAll('dataItem.TARGET_GROUP', dataItem['TARGET_GROUP'] || '')
    sql = sql.replaceAll('dataItem.TARGET_COMPACT', dataItem['TARGET_COMPACT'] || '')

    return sql
  },

  getMemberByEmpCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       EMPNAME
                                     , EMPSURNAME
                                     , EMPEMAIL
                            FROM
                                       Person.MEMBER_FED
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getAssigneeByEmpCodeContact: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       EMPNAME
                                     , EMPEMAIL
                            FROM
                                       assignees_to
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getAssigneeEmailByEmpCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       EMPEMAIL
                            FROM
                                       assignees_to
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getNotificationVendorContextByRequestId: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       rr.REQUEST_NUMBER
                                     , rr.CREATE_DATE
                                     , rr.ASSIGN_TO
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.VENDOR_CONTACT_ID
                                     , rr.REQUEST_BY_EMPLOYEECODE
                                     , rr.VENDOR_CODE
                                     , rvs.GPR_C_APPROVER_NAME
                                     , rvs.GPR_C_APPROVER_EMAIL
                                     , rvs.GPR_C_PC_PIC_NAME
                                     , rvs.GPR_C_PC_PIC_EMAIL
                                     , rvs.GPR_C_CIRCULAR_JSON
                                     , rvs.ACTION_REQUIRED_JSON
                                     , v.COMPANY_NAME
                                     , v.ADDRESS
                                     , v.VENDOR_REGION
                                     , v.EMAILMAIN
                                     , v.EMAILMAIN AS vendor_main_email
                                     , v.FFT_VENDOR_CODE
                                     , vc.CONTACT_NAME
                                     , vc.EMAIL AS vendor_email
                                     , vc.TEL_PHONE
                                     , vc_sel.EMAIL AS selected_vendor_email
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_ID = rr.REQUEST_ID AND rvs.INUSE = 1
                                            LEFT JOIN
                                       vendor_contacts vc ON vc.VENDOR_ID = v.VENDOR_ID
                                            LEFT JOIN
                                       vendor_contacts vc_sel ON vc_sel.VENDOR_CONTACT_ID = rr.VENDOR_CONTACT_ID AND vc_sel.INUSE = 1
                            WHERE
                                       rr.REQUEST_ID = dataItem.REQUEST_ID
                            ORDER BY
                                       CASE
                                           WHEN COALESCE(vc_sel.EMAIL, '') != '' THEN 0
                                           WHEN COALESCE(v.EMAILMAIN, '') != '' THEN 1
                                           WHEN COALESCE(vc.EMAIL, '') != '' THEN 2
                                           ELSE 3
                                       END ASC
                                     , vc.VENDOR_CONTACT_ID ASC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  createRequest: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_register_vendor (
                                       VENDOR_ID
                                     , VENDOR_CONTACT_ID
                                     , REQUEST_BY_EMPLOYEECODE
                                     , SUPPORTPRODUCT_PROCESS
                                     , PURCHASE_FREQUENCY
                                     , REQUEST_STATUS
                                     , REQUESTER_REMARK
                                     , ASSIGN_TO
                                     , PIC_EMAIL
                                     , CREATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.VENDOR_ID
                                     ,  dataItem.VENDOR_CONTACT_ID
                                     , 'dataItem.REQUEST_BY_EMPLOYEECODE'
                                     , 'dataItem.SUPPORTPRODUCT_PROCESS'
                                     , 'dataItem.PURCHASE_FREQUENCY'
                                     , 'dataItem.REQUEST_STATUS'
                                     , 'dataItem.REQUESTER_REMARK'
                                     , 'dataItem.ASSIGN_TO'
                                     , 'dataItem.PIC_EMAIL'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CONTACT_ID', (dataItem['VENDOR_CONTACT_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_BY_EMPLOYEECODE', dataItem['REQUEST_BY_EMPLOYEECODE'] || '')
    sql = sql.replaceAll('dataItem.SUPPORTPRODUCT_PROCESS', dataItem['SUPPORTPRODUCT_PROCESS'] || '')
    sql = sql.replaceAll('dataItem.PURCHASE_FREQUENCY', dataItem['PURCHASE_FREQUENCY'] || '')
    sql = sql.replaceAll('dataItem.REQUEST_STATUS', dataItem['REQUEST_STATUS'] || 'Sent To PO & SCM(PIC)')
    sql = sql.replaceAll('dataItem.REQUESTER_REMARK', dataItem['REQUESTER_REMARK'] || '')
    sql = sql.replaceAll('dataItem.ASSIGN_TO', dataItem['ASSIGN_TO'] || '')
    sql = sql.replaceAll('dataItem.PIC_EMAIL', dataItem['PIC_EMAIL'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  checkExistingActiveRequestByVendorRequester: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       REQUEST_ID
                                     , REQUEST_NUMBER
                                     , REQUEST_STATUS
                            FROM
                                       request_register_vendor
                            WHERE
                                       VENDOR_ID = dataItem.VENDOR_ID
                                       AND REQUEST_BY_EMPLOYEECODE = 'dataItem.REQUEST_BY_EMPLOYEECODE'
                                       AND INUSE = 1
                                       AND COALESCE(REQUEST_STATUS, '') NOT IN ('Completed', 'Rejected')
                            ORDER BY
                                       REQUEST_ID DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_BY_EMPLOYEECODE', dataItem['REQUEST_BY_EMPLOYEECODE'] || '')

    return sql
  },

  createRequestVendorContact: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_register_vendor_contacts (
                                       REQUEST_ID
                                     , VENDOR_CONTACT_ID
                                     , IS_PRIMARY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     ,  dataItem.VENDOR_CONTACT_ID
                                     ,  dataItem.IS_PRIMARY
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CONTACT_ID', (dataItem['VENDOR_CONTACT_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.IS_PRIMARY', (dataItem['IS_PRIMARY'] || 0).toString())

    return sql
  },

  getRequestVendorContactsByRequestId: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       rrvc.VENDOR_CONTACT_ID
                                     , rrvc.IS_PRIMARY
                                     , vc.CONTACT_NAME
                                     , vc.EMAIL
                                     , vc.TEL_PHONE
                                     , vc.POSITION
                            FROM
                                       request_register_vendor_contacts rrvc
                                            JOIN
                                       vendor_contacts vc ON vc.VENDOR_CONTACT_ID = rrvc.VENDOR_CONTACT_ID
                            WHERE
                                       rrvc.REQUEST_ID = dataItem.REQUEST_ID
                                       AND rrvc.INUSE = 1
                                       AND vc.INUSE = 1
                            ORDER BY
                                       rrvc.IS_PRIMARY DESC
                                     , rrvc.VENDOR_CONTACT_ID ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  createDocument: async (dataItem: RegisterRequestDataItem) => {
    const requestId = Number(dataItem['REQUEST_ID'] || 0)
    if (!requestId || Number.isNaN(requestId)) {
      throw new Error(`Invalid REQUEST_ID for createDocument: ${String(dataItem['REQUEST_ID'])}`)
    }

    let sql = `
                            INSERT INTO request_register_document (
                                       REQUEST_ID
                                     , FILE_NAME
                                     , FILE_PATH
                                     , FILE_SIZE
                                     , FILE_TYPE
                                     , CREATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     , 'dataItem.FILE_NAME'
                                     , 'dataItem.FILE_PATH'
                                     ,  dataItem.FILE_SIZE
                                     , 'dataItem.FILE_TYPE'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', requestId.toString())
    sql = sql.replaceAll('dataItem.FILE_NAME', dataItem['FILE_NAME'] || '')
    sql = sql.replaceAll('dataItem.FILE_PATH', dataItem['FILE_PATH'] || '')
    sql = sql.replaceAll('dataItem.FILE_SIZE', (dataItem['FILE_SIZE'] || 0).toString())
    sql = sql.replaceAll('dataItem.FILE_TYPE', dataItem['FILE_TYPE'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  updateRequest: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       VENDOR_CONTACT_ID =  dataItem.VENDOR_CONTACT_ID
                                     , SUPPORTPRODUCT_PROCESS = 'dataItem.SUPPORTPRODUCT_PROCESS'
                                     , PURCHASE_FREQUENCY = 'dataItem.PURCHASE_FREQUENCY'
                                     , REQUESTER_REMARK = 'dataItem.REQUESTER_REMARK'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CONTACT_ID', (dataItem['VENDOR_CONTACT_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.SUPPORTPRODUCT_PROCESS', dataItem['SUPPORTPRODUCT_PROCESS'] || '')
    sql = sql.replaceAll('dataItem.PURCHASE_FREQUENCY', dataItem['PURCHASE_FREQUENCY'] || '')
    sql = sql.replaceAll('dataItem.REQUESTER_REMARK', dataItem['REQUESTER_REMARK'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getStatusOptions: async (dataItem?: any) => {
    let sql = `
                            SELECT
                                       STATUS_VALUE AS value
                                     , STATUS_LABEL AS label
                                     , STEP_CODE AS stepCode
                                     , ACTOR_TYPE AS actorType
                                     , DEFAULT_GROUP_CODE_LOCAL AS defaultGroupCodeLocal
                                     , DEFAULT_GROUP_CODE_OVERSEA AS defaultGroupCodeOversea
                                     , REQUIRES_VENDOR_REPLY AS requiresVendorReply
                                     , REQUIRES_VENDOR_CODE AS requiresVendorCode
                                     , CHIP_COLOR AS chipColor
                                     , ACCENT_COLOR AS accent
                                     , ICON AS icon
                                     , SORT_ORDER AS sortOrder
                            FROM
                                       m_request_status
                            WHERE
                                       IS_ACTIVE = 1
                            ORDER BY
                                       SORT_ORDER ASC
        `
    return sql
  },

  createApprovalStep: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_approval_step (
                                       REQUEST_ID
                                     , STEP_ORDER
                                     , APPROVER_ID
                                     , STEP_STATUS
                                     , DESCRIPTION
                                     , STEP_CODE
                                     , ACTOR_TYPE
                                     , GROUP_CODE
                                     , ASSIGNMENT_MODE
                                     , CREATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     ,  dataItem.STEP_ORDER
                                     , 'dataItem.APPROVER_ID'
                                     , 'dataItem.STEP_STATUS'
                                     , 'dataItem.DESCRIPTION'
                                     , 'dataItem.STEP_CODE'
                                     , 'dataItem.ACTOR_TYPE'
                                     , 'dataItem.GROUP_CODE'
                                     , 'dataItem.ASSIGNMENT_MODE'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_ORDER', (dataItem['STEP_ORDER'] || 0).toString())
    sql = sql.replaceAll('dataItem.APPROVER_ID', dataItem['APPROVER_ID'] || '')
    sql = sql.replaceAll('dataItem.STEP_STATUS', dataItem['STEP_STATUS'] || '')
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'] || '')
    sql = sql.replaceAll('dataItem.STEP_CODE', dataItem['STEP_CODE'] || '')
    sql = sql.replaceAll('dataItem.ACTOR_TYPE', dataItem['ACTOR_TYPE'] || '')
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')
    sql = sql.replaceAll('dataItem.ASSIGNMENT_MODE', dataItem['ASSIGNMENT_MODE'] || 'AUTO')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  getApprovalSteps: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT 
                                       ras.STEP_ID
                                     , ras.REQUEST_ID
                                     , ras.STEP_ORDER
                                     , ras.APPROVER_ID
                                     , ras.STEP_STATUS
                                     , ras.DESCRIPTION
                                     , ras.STEP_CODE
                                     , ras.ACTOR_TYPE
                                     , ras.GROUP_CODE
                                     , ras.ASSIGNMENT_MODE
                                     , ras.CREATE_BY
                                     , ras.CREATE_DATE
                                     , ras.UPDATE_BY
                                     , ras.UPDATE_DATE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS approver_name
                            FROM
                                       request_approval_step ras
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.EMPCODE = ras.APPROVER_ID
                            WHERE
                                       ras.REQUEST_ID = dataItem.REQUEST_ID
                                       AND ras.INUSE = 1
                            ORDER BY
                                       ras.STEP_ORDER ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  updateApprovalStep: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       STEP_STATUS = 'dataItem.STEP_STATUS'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       STEP_ID = dataItem.STEP_ID
        `

    sql = sql.replaceAll('dataItem.STEP_ID', (dataItem['STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_STATUS', dataItem['STEP_STATUS'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  createApprovalLog: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_approval_log (
                                       REQUEST_ID
                                     , STEP_ID
                                     , ACTION_BY
                                     , ACTION_TYPE
                                     , REMARK
                                     , ACTION_DATE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     ,  dataItem.STEP_ID
                                     , 'dataItem.ACTION_BY'
                                     , 'dataItem.ACTION_TYPE'
                                     , 'dataItem.REMARK'
                                     ,  NOW()
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_ID', dataItem['STEP_ID'] ? dataItem['STEP_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.ACTION_BY', dataItem['ACTION_BY'] || '')
    sql = sql.replaceAll('dataItem.ACTION_TYPE', dataItem['ACTION_TYPE'] || '')
    sql = sql.replaceAll('dataItem.REMARK', dataItem['REMARK'] || '')

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
                                       REQUEST_ID = 'dataItem.REQUEST_ID' AND INUSE = 1
                            ORDER BY
                                       SELECTION_ID DESC
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    return sql
  },

  getFinancials: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       YEAR
                                     , TOTAL_REVENUE
                                     , NET_PROFIT
                            FROM
                                       vendor_selection_financials
                            WHERE
                                       SELECTION_ID = dataItem.SELECTION_ID
                            ORDER BY
                                       YEAR ASC
        `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem['SELECTION_ID'] || 0).toString())
    return sql
  },

  getCriteria: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       CRITERIA_NO AS no
                                     , CRITERIA_VALUE AS criteria
                                     , REMARK
                                     , UPLOADED_FILE_PATH AS uploaded_file
                                     , UPLOADED_FILE_NAME AS uploaded_name
                            FROM
                                       vendor_selection_criteria
                            WHERE
                                       SELECTION_ID = dataItem.SELECTION_ID
                            ORDER BY
                                       CRITERIA_ID ASC
        `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem['SELECTION_ID'] || 0).toString())
    return sql
  },

  checkSelectionExists: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       SELECTION_ID
                            FROM
                                       request_vendor_selections 
                            WHERE
                                       REQUEST_ID = 'dataItem.REQUEST_ID'
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    return sql
  },

  getRequesterByRequestId: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       REQUEST_BY_EMPLOYEECODE
                            FROM
                                       request_register_vendor
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    return sql
  },

  insertSelection: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_vendor_selections (
                                       REQUEST_ID
                                     , BUSINESS_CATEGORY
                                     , START_YEAR
                                     , AUTHORIZED_CAPITAL
                                     , ESTABLISH_YEARS
                                     , NUMBER_OF_EMPLOYEES
                                     , MANUFACTURED_COUNTRY
                                     , VENDOR_ORIGINAL_COUNTRY
                                     , SANCTIONS_STATUS
                                     , CURRENCY
                                     , SUGGESTION
                                     , RESULT_STATUS
                                     , DOCUMENT_PATH
                                     , VENDOR_CODE_SELECTOR
                                     , GPR_C_APPROVER_NAME
                                     , GPR_C_APPROVER_EMAIL
                                     , GPR_C_PC_PIC_NAME
                                     , GPR_C_PC_PIC_EMAIL
                                     , GPR_C_CIRCULAR_JSON
                                     , ACTION_REQUIRED_JSON
                                     , COMPLETION_DATE
                                     , CREATE_BY
                                     , UPDATE_BY
                            ) VALUES (
                                       'dataItem.REQUEST_ID'
                                     , 'dataItem.BUSINESS_CATEGORY'
                                     , 'dataItem.START_YEAR'
                                     , 'dataItem.AUTHORIZED_CAPITAL'
                                     , 'dataItem.ESTABLISH'
                                     , 'dataItem.NUMBER_OF_EMPLOYEES'
                                     , 'dataItem.MANUFACTURED_COUNTRY'
                                     , 'dataItem.VENDOR_ORIGINAL_COUNTRY'
                                     , 'dataItem.SANCTIONS'
                                     , 'dataItem.CURRENCY'
                                     , 'dataItem.SUGGESTION'
                                     , 'dataItem.RESULT'
                                     , 'dataItem.PATH'
                                     , 'dataItem.VENDOR_CODE_SELECTOR'
                                     , 'dataItem.GPR_C_APPROVER_NAME'
                                     , 'dataItem.GPR_C_APPROVER_EMAIL'
                                     , 'dataItem.GPR_C_PC_PIC_NAME'
                                     , 'dataItem.GPR_C_PC_PIC_EMAIL'
                                     , 'dataItem.GPR_C_CIRCULAR_JSON'
                                     , 'dataItem.ACTION_REQUIRED_JSON'
                                     ,  dataItem.COMPLETION_DATE_NULL
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                            )
        `
    const d = dataItem
    // Escape quotes helper
    const esc = (str: any) => String(str || '').replace(/'/g, "\\'")

    sql = sql.replaceAll('dataItem.REQUEST_ID', esc(d['REQUEST_ID']))
    sql = sql.replaceAll('dataItem.BUSINESS_CATEGORY', esc(d['BUSINESS_CATEGORY']))
    sql = sql.replaceAll('dataItem.START_YEAR', esc(d['START_YEAR']))
    sql = sql.replaceAll('dataItem.AUTHORIZED_CAPITAL', esc(d['AUTHORIZED_CAPITAL']))
    sql = sql.replaceAll('dataItem.ESTABLISH', esc(d['ESTABLISH']))
    sql = sql.replaceAll('dataItem.NUMBER_OF_EMPLOYEES', esc(d['NUMBER_OF_EMPLOYEES']))
    sql = sql.replaceAll('dataItem.MANUFACTURED_COUNTRY', esc(d['MANUFACTURED_COUNTRY']))
    sql = sql.replaceAll('dataItem.VENDOR_ORIGINAL_COUNTRY', esc(d['VENDOR_ORIGINAL_COUNTRY']))
    sql = sql.replaceAll('dataItem.SANCTIONS', esc(d['SANCTIONS']))
    sql = sql.replaceAll('dataItem.CURRENCY', esc(d['CURRENCY'] || 'THB'))
    sql = sql.replaceAll('dataItem.SUGGESTION', esc(d['SUGGESTION']))
    sql = sql.replaceAll('dataItem.RESULT', esc(d['RESULT']))
    sql = sql.replaceAll('dataItem.PATH', esc(d['PATH']))
    sql = sql.replaceAll('dataItem.VENDOR_CODE_SELECTOR', esc(d['VENDOR_CODE_SELECTOR']))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_NAME', esc(d['GPR_C_APPROVER_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMAIL', esc(d['GPR_C_APPROVER_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_NAME', esc(d['GPR_C_PC_PIC_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_EMAIL', esc(d['GPR_C_PC_PIC_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_CIRCULAR_JSON', esc(d['GPR_C_CIRCULAR_JSON']))
    sql = sql.replaceAll('dataItem.ACTION_REQUIRED_JSON', esc(d['ACTION_REQUIRED_JSON']))

    if (d['COMPLETION_DATE']) {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', `'${esc(d['COMPLETION_DATE'])}'`)
    } else {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', 'NULL')
    }

    sql = sql.replaceAll('dataItem.CREATE_BY', esc(d['CREATE_BY'] || d['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(d['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  // 2B. Update selection,

  updateSelection: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_vendor_selections SET
                                       BUSINESS_CATEGORY = 'dataItem.BUSINESS_CATEGORY'
                                     , START_YEAR = 'dataItem.START_YEAR'
                                     , AUTHORIZED_CAPITAL = 'dataItem.AUTHORIZED_CAPITAL'
                                     , ESTABLISH_YEARS = 'dataItem.ESTABLISH'
                                     , NUMBER_OF_EMPLOYEES = 'dataItem.NUMBER_OF_EMPLOYEES'
                                     , MANUFACTURED_COUNTRY = 'dataItem.MANUFACTURED_COUNTRY'
                                     , VENDOR_ORIGINAL_COUNTRY = 'dataItem.VENDOR_ORIGINAL_COUNTRY'
                                     , SANCTIONS_STATUS = 'dataItem.SANCTIONS'
                                     , CURRENCY = 'dataItem.CURRENCY'
                                     , SUGGESTION = 'dataItem.SUGGESTION'
                                     , RESULT_STATUS = 'dataItem.RESULT'
                                     , DOCUMENT_PATH = 'dataItem.PATH'
                                     , VENDOR_CODE_SELECTOR = 'dataItem.VENDOR_CODE_SELECTOR'
                                     , GPR_C_APPROVER_NAME = 'dataItem.GPR_C_APPROVER_NAME'
                                     , GPR_C_APPROVER_EMAIL = 'dataItem.GPR_C_APPROVER_EMAIL'
                                     , GPR_C_PC_PIC_NAME = 'dataItem.GPR_C_PC_PIC_NAME'
                                     , GPR_C_PC_PIC_EMAIL = 'dataItem.GPR_C_PC_PIC_EMAIL'
                                     , GPR_C_CIRCULAR_JSON = 'dataItem.GPR_C_CIRCULAR_JSON'
                                     , ACTION_REQUIRED_JSON = 'dataItem.ACTION_REQUIRED_JSON'
                                     , COMPLETION_DATE = dataItem.COMPLETION_DATE_NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       SELECTION_ID = dataItem.SELECTION_ID
        `
    const d = dataItem
    const esc = (str: any) => String(str || '').replace(/'/g, "\\'")

    sql = sql.replaceAll('dataItem.SELECTION_ID', (d['SELECTION_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.BUSINESS_CATEGORY', esc(d['BUSINESS_CATEGORY']))
    sql = sql.replaceAll('dataItem.START_YEAR', esc(d['START_YEAR']))
    sql = sql.replaceAll('dataItem.AUTHORIZED_CAPITAL', esc(d['AUTHORIZED_CAPITAL']))
    sql = sql.replaceAll('dataItem.ESTABLISH', esc(d['ESTABLISH']))
    sql = sql.replaceAll('dataItem.NUMBER_OF_EMPLOYEES', esc(d['NUMBER_OF_EMPLOYEES']))
    sql = sql.replaceAll('dataItem.MANUFACTURED_COUNTRY', esc(d['MANUFACTURED_COUNTRY']))
    sql = sql.replaceAll('dataItem.VENDOR_ORIGINAL_COUNTRY', esc(d['VENDOR_ORIGINAL_COUNTRY']))
    sql = sql.replaceAll('dataItem.SANCTIONS', esc(d['SANCTIONS']))
    sql = sql.replaceAll('dataItem.CURRENCY', esc(d['CURRENCY'] || 'THB'))
    sql = sql.replaceAll('dataItem.SUGGESTION', esc(d['SUGGESTION']))
    sql = sql.replaceAll('dataItem.RESULT', esc(d['RESULT']))
    sql = sql.replaceAll('dataItem.PATH', esc(d['PATH']))
    sql = sql.replaceAll('dataItem.VENDOR_CODE_SELECTOR', esc(d['VENDOR_CODE_SELECTOR']))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_NAME', esc(d['GPR_C_APPROVER_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMAIL', esc(d['GPR_C_APPROVER_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_NAME', esc(d['GPR_C_PC_PIC_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_EMAIL', esc(d['GPR_C_PC_PIC_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_CIRCULAR_JSON', esc(d['GPR_C_CIRCULAR_JSON']))
    sql = sql.replaceAll('dataItem.ACTION_REQUIRED_JSON', esc(d['ACTION_REQUIRED_JSON']))

    if (d['COMPLETION_DATE']) {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', `'${esc(d['COMPLETION_DATE'])}'`)
    } else {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', 'NULL')
    }

    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(d['UPDATE_BY'] || 'SYSTEM'))
    return sql
  },

  updateSelectionGprCOnly: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_vendor_selections SET
                                       GPR_C_APPROVER_NAME = 'dataItem.GPR_C_APPROVER_NAME'
                                     , GPR_C_APPROVER_EMAIL = 'dataItem.GPR_C_APPROVER_EMAIL'
                                     , GPR_C_PC_PIC_NAME = 'dataItem.GPR_C_PC_PIC_NAME'
                                     , GPR_C_PC_PIC_EMAIL = 'dataItem.GPR_C_PC_PIC_EMAIL'
                                     , GPR_C_CIRCULAR_JSON = 'dataItem.GPR_C_CIRCULAR_JSON'
                                     , ACTION_REQUIRED_JSON = 'dataItem.ACTION_REQUIRED_JSON'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       SELECTION_ID = dataItem.SELECTION_ID
        `

    const d = dataItem
    const esc = (str: any) => String(str || '').replace(/'/g, "\\'")

    sql = sql.replaceAll('dataItem.SELECTION_ID', (d['SELECTION_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_NAME', esc(d['GPR_C_APPROVER_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMAIL', esc(d['GPR_C_APPROVER_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_NAME', esc(d['GPR_C_PC_PIC_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_EMAIL', esc(d['GPR_C_PC_PIC_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_CIRCULAR_JSON', esc(d['GPR_C_CIRCULAR_JSON']))
    sql = sql.replaceAll('dataItem.ACTION_REQUIRED_JSON', esc(d['ACTION_REQUIRED_JSON']))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(d['UPDATE_BY'] || 'SYSTEM'))

    return sql
  },

  deleteFinancials: (dataItem: RegisterRequestDataItem) => {
    let sql = `DELETE FROM vendor_selection_financials WHERE SELECTION_ID = dataItem.SELECTION_ID`
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    return sql
  },

  deleteCriteria: (dataItem: RegisterRequestDataItem) => {
    let sql = `DELETE FROM vendor_selection_criteria WHERE SELECTION_ID = dataItem.SELECTION_ID`
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    return sql
  },

  // 4. Insert Financial Data,

  insertFinancial: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO vendor_selection_financials (
                                       SELECTION_ID
                                     , YEAR
                                     , TOTAL_REVENUE
                                     , NET_PROFIT
                                     , CREATE_BY
                                     , UPDATE_BY
                            )
                            VALUES (
                                       dataItem.SELECTION_ID
                                     , 'dataItem.YEAR'
                                     , dataItem.TOTAL_REVENUE
                                     , dataItem.NET_PROFIT
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                            )
        `
    const esc = (str: any) => String(str || '').replace(/'/g, "\\'")
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    sql = sql.replaceAll('dataItem.YEAR', esc(dataItem.YEAR))

    // Ensure numeric or NULL
    const rev = parseFloat(dataItem.TOTAL_REVENUE as string)
    const pro = parseFloat(dataItem.NET_PROFIT as string)
    sql = sql.replaceAll('dataItem.TOTAL_REVENUE', isNaN(rev) ? 'NULL' : String(rev))
    sql = sql.replaceAll('dataItem.NET_PROFIT', isNaN(pro) ? 'NULL' : String(pro))
    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))

    return sql
  },

  insertCriteria: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO vendor_selection_criteria (
                                       SELECTION_ID
                                     , CRITERIA_NO
                                     , CRITERIA_VALUE
                                     , REMARK
                                     , UPLOADED_FILE_PATH
                                     , UPLOADED_FILE_NAME
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       dataItem.SELECTION_ID
                                     , 'dataItem.NO'
                                     , 'dataItem.CRITERIA'
                                     , 'dataItem.REMARK'
                                     , dataItem.PATH_NULL
                                     , dataItem.NAME_NULL
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            )
        `
    const esc = (str: any) => String(str || '').replace(/'/g, "\\'")
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    sql = sql.replaceAll('dataItem.NO', esc(dataItem.NO))
    sql = sql.replaceAll('dataItem.CRITERIA', esc(dataItem.CRITERIA))
    sql = sql.replaceAll('dataItem.REMARK', esc(dataItem.REMARK))

    if (dataItem.UPLOADED_FILE) {
      sql = sql.replaceAll('dataItem.PATH_NULL', `'${esc(dataItem.UPLOADED_FILE)}'`)
    } else {
      sql = sql.replaceAll('dataItem.PATH_NULL', 'NULL')
    }

    if (dataItem.UPLOADED_NAME) {
      sql = sql.replaceAll('dataItem.NAME_NULL', `'${esc(dataItem.UPLOADED_NAME)}'`)
    } else {
      sql = sql.replaceAll('dataItem.NAME_NULL', 'NULL')
    }

    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))

    return sql
  },
}
