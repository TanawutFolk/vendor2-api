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
}

export const ApprovalQueueSQL = {
  getAllRequests: async (dataItem: RegisterRequestDataItem): Promise<string[]> => {
    let countSql = `
                            SELECT
                                       COUNT(DISTINCT rr.REQUEST_ID) AS TOTAL_COUNT
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.VENDOR_TYPE_ID = v.VENDOR_TYPE_ID
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       rr.INUSE = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
        `

    let dataSql = `
                            SELECT
                                       rr.REQUEST_ID
                                                                         , rr.REQUEST_NUMBER
                                     , rr.VENDOR_ID
                                     , rr.REQUEST_STATUS
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , rr.VENDOR_CONTACT_ID
                                     , rr.REQUESTER_REMARK
                                     , rr.APPROVE_BY
                                     , rr.APPROVE_DATE
                                     , rr.APPROVER_REMARK
                                     , rr.VENDOR_CODE
                                     , rvs.GPR_C_APPROVER_NAME
                                     , rvs.GPR_C_APPROVER_EMAIL
                                     , rvs.GPR_C_PC_PIC_NAME
                                     , rvs.GPR_C_PC_PIC_EMAIL
                                     , rvs.GPR_C_CIRCULAR_JSON
                                     , rvs.ACTION_REQUIRED_JSON
                                     , rvs.GPR_43_ACCEPTANCE_STATUS
                                     , rr.REQUEST_BY_EMPLOYEECODE AS EMPLOYEE_CODE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS FULL_NAME
                                     , m.EMPDEPT AS EMPLOYEE_DEPT
                                     , rr.CREATE_DATE

                                     -- Vendor Info
                                     , v.COMPANY_NAME
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , v.VENDOR_REGION
                                     , v.PROVINCE
                                     , v.POSTAL_CODE
                                     , v.ADDRESS
                                     , v.TEL_CENTER
                                     , v.WEBSITE
                                     , v.EMAILMAIN
                                     , vt.NAME AS vendor_type_name

                                     -- Contacts (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'contact_name', vc.CONTACT_NAME,
                                                                               'tel_phone',    vc.TEL_PHONE,
                                                                               'email',        vc.EMAIL,
                                                                               'position',     vc.POSITION
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_contacts vc
                                                           WHERE
                                                                      vc.VENDOR_ID = v.VENDOR_ID AND vc.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS contacts

                                     -- Products (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'product_group', mpg.GROUP_NAME,
                                                                               'maker_name',    vp.MAKER_NAME,
                                                                               'product_name',  vp.PRODUCT_NAME,
                                                                               'model_list',    vp.MODEL_LIST
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_products vp
                                                                           LEFT JOIN
                                                                      master_product_groups mpg ON mpg.PRODUCT_GROUP_ID = vp.PRODUCT_GROUP_ID
                                                           WHERE
                                                                      vp.VENDOR_ID = v.VENDOR_ID AND vp.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS products
                                     
                                     -- Documents (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                  'document_id', rrf.REQUEST_FILE_ID,
                                                  'file_name', rrf.FILE_NAME,
                                                  'file_path', rrf.FILE_PATH,
                                                  'file_size', rrf.FILE_SIZE,
                                                  'file_type', rrf.FILE_TYPE
                                                )
                                                                      )
                                                           FROM
                                                                      request_register_file rrf
                                                           WHERE
                                                                      rrf.REQUEST_ID = rr.REQUEST_ID AND rrf.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS documents

                                     -- Approval Steps (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'step_id', ras.STEP_ID,
                                                                               'step_order', ras.STEP_ORDER,
                                                                               'approver_id', ras.APPROVER_ID,
                                                                               'approver_name', (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM Person.MEMBER_FED pm WHERE pm.EMPCODE = ras.APPROVER_ID LIMIT 1),
                                                                               'step_status', ras.STEP_STATUS,
                                                                               'DESCRIPTION', ras.DESCRIPTION,
                                                                               'step_code', ras.STEP_CODE,
                                                                               'actor_type', ras.ACTOR_TYPE,
                                                                               'group_code', ras.GROUP_CODE,
                                                                               'assignment_mode', ras.ASSIGNMENT_MODE,
                                                                               'CREATE_DATE', ras.CREATE_DATE,
                                                                               'UPDATE_BY', ras.UPDATE_BY,
                                                                               'UPDATE_DATE', ras.UPDATE_DATE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_step ras
                                                           WHERE
                                                                      ras.REQUEST_ID = rr.REQUEST_ID AND ras.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_steps

                                     -- Approval Logs (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'log_id', ral.LOG_ID,
                                                                               'step_id', ral.STEP_ID,
                                                                               'action_by', ral.ACTION_BY,
                                                                               'action_type', ral.ACTION_TYPE,
                                                                               'remark', ral.REMARK,
                                                                               'action_date', ral.ACTION_DATE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_log ral
                                                           WHERE
                                                                      ral.REQUEST_ID = rr.REQUEST_ID
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_logs

                                     -- GPR Criteria (inline JSON for pass/fail evaluation)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'no', vsc.CRITERIA_NO,
                                                                               'criteria', vsc.CRITERIA_VALUE,
                                                                               'uploaded_file', vsc.UPLOADED_FILE_PATH,
                                                                               'uploaded_name', vsc.UPLOADED_FILE_NAME
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_vendor_selections rvs2
                                                                           JOIN
                                                                      vendor_selection_criteria vsc ON vsc.SELECTION_ID = rvs2.SELECTION_ID
                                                           WHERE
                                                                      rvs2.REQUEST_ID = rr.REQUEST_ID AND rvs2.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS gpr_criteria

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_ID = rr.REQUEST_ID AND rvs.INUSE = 1
                                            LEFT JOIN
                                       vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.VENDOR_TYPE_ID = v.VENDOR_TYPE_ID
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       rr.INUSE = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
                            GROUP BY
                                       rr.REQUEST_ID
                            ORDER BY
                                       dataItem.ORDER
                            LIMIT
                                       dataItem.LIMIT OFFSET dataItem.OFFSET
        `

    countSql = countSql.replaceAll('dataItem.SQLWHERECOLUMNFILTER', dataItem['SQLWHERECOLUMNFILTER'] || '')
    countSql = countSql.replaceAll('dataItem.SQLWHERE', dataItem['SQLWHERE'] || '')

    dataSql = dataSql.replaceAll('dataItem.SQLWHERECOLUMNFILTER', dataItem['SQLWHERECOLUMNFILTER'] || '')
    dataSql = dataSql.replaceAll('dataItem.SQLWHERE', dataItem['SQLWHERE'] || '')
    dataSql = dataSql.replaceAll('dataItem.ORDER', dataItem['ORDER'] || 'rr.REQUEST_ID DESC')
    dataSql = dataSql.replaceAll('dataItem.LIMIT', (dataItem['LIMIT'] || 10).toString())
    dataSql = dataSql.replaceAll('dataItem.OFFSET', (dataItem['OFFSET'] || 0).toString())

    return [countSql, dataSql]
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

  getApprovalLogs: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT 
                                       ral.LOG_ID
                                     , ral.REQUEST_ID
                                     , ral.STEP_ID
                                     , ral.ACTION_BY
                                     , ral.ACTION_TYPE
                                     , ral.REMARK
                                     , ral.ACTION_DATE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS action_by_name
                            FROM
                                       request_approval_log ral
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.EMPCODE = ral.ACTION_BY
                            WHERE
                                       ral.REQUEST_ID = dataItem.REQUEST_ID
                            ORDER BY
                                       ral.ACTION_DATE ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  getRequestStatusContext: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       rr.VENDOR_ID
                                     , rr.ASSIGN_TO
                                     , rr.REQUEST_NUMBER
                                     , rr.CREATE_DATE
                                     , rvs.VENDOR_CODE_SELECTOR
                                     , rvs.GPR_C_APPROVER_NAME
                                     , rvs.GPR_C_APPROVER_EMAIL
                                     , rvs.GPR_C_PC_PIC_NAME
                                     , rvs.GPR_C_PC_PIC_EMAIL
                                     , rvs.GPR_C_CIRCULAR_JSON
                                     , rvs.ACTION_REQUIRED_JSON
                                     , rvs.GPR_43_ACCEPTANCE_STATUS
                                     , v.VENDOR_REGION
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_ID = rr.REQUEST_ID AND rvs.INUSE = 1
                            WHERE
                                       rr.REQUEST_ID = dataItem.REQUEST_ID
                            ORDER BY
                                       rvs.SELECTION_ID DESC
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

  getApproverByGroupCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       EMPCODE
                                     , EMPNAME
                                     , EMPEMAIL
                            FROM
                                       assignees_to
                            WHERE
                                       GROUP_CODE = 'dataItem.GROUP_CODE'
                                       AND INUSE = 1
                            ORDER BY
                                       ASSIGNEES_ID ASC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')

    return sql
  },

  getActiveAssigneeByEmpCodeAndGroupCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       ASSIGNEES_ID
                                     , EMPCODE
                                     , EMPNAME
                                     , EMPEMAIL
                                     , GROUP_CODE
                                     , GROUP_NAME
                                     , INUSE
                            FROM
                                       assignees_to
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                                       AND (
                                           UPPER(TRIM(COALESCE(GROUP_CODE, ''))) = 'dataItem.GROUP_CODE'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = 'dataItem.GROUP_CODE'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_CODE, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.GROUP_COMPACT'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.GROUP_COMPACT'
                                       )
                                       AND INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')
    sql = sql.replaceAll('dataItem.GROUP_COMPACT', dataItem['GROUP_COMPACT'] || '')

    return sql
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

  updateStatus: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       REQUEST_STATUS = 'dataItem.REQUEST_STATUS'
                                     , APPROVE_BY = 'dataItem.APPROVE_BY'
                                     , APPROVE_DATE = dataItem.APPROVE_DATE
                                     , APPROVER_REMARK = 'dataItem.APPROVER_REMARK'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_STATUS', dataItem['REQUEST_STATUS'] || '')
    sql = sql.replaceAll('dataItem.APPROVE_BY', dataItem['APPROVE_BY'] || '')
    sql = sql.replaceAll('dataItem.APPROVE_DATE', dataItem['APPROVE_DATE'] === 'NOW()' ? 'NOW()' : 'APPROVE_DATE')
    sql = sql.replaceAll('dataItem.APPROVER_REMARK', dataItem['APPROVER_REMARK'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  updateRequestVendorCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       VENDOR_CODE = 'dataItem.VENDOR_CODE'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  updateVendorFftVendorCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE vendors SET
                                       FFT_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                            WHERE
                                       VENDOR_ID = dataItem.VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')

    return sql
  },

  updateVendorFftStatus: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE vendors SET
                                       FFT_STATUS = dataItem.FFT_STATUS
                            WHERE
                                       VENDOR_ID = dataItem.VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.FFT_STATUS', (dataItem['FFT_STATUS'] || 0).toString())

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

  updateApprovalStepApprover: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       APPROVER_ID = 'dataItem.APPROVER_ID'
                                     , ASSIGNMENT_MODE = 'dataItem.ASSIGNMENT_MODE'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       STEP_ID = dataItem.STEP_ID
        `

    sql = sql.replaceAll('dataItem.STEP_ID', (dataItem['STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.APPROVER_ID', dataItem['APPROVER_ID'] || '')
    sql = sql.replaceAll('dataItem.ASSIGNMENT_MODE', dataItem['ASSIGNMENT_MODE'] || 'MANUAL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  markRequestCompleted: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       REQUEST_STATUS = 'Completed'
                                     , APPROVE_DATE = NOW()
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getById: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       rr.REQUEST_ID
                                                                         , rr.REQUEST_NUMBER
                                     , rr.VENDOR_ID
                                     , rr.REQUEST_STATUS
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.REQUESTER_REMARK
                                     , rr.APPROVER_REMARK
                                     , rr.APPROVE_BY
                                     , rr.APPROVE_DATE
                                     , rr.VENDOR_CODE
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , rr.VENDOR_CONTACT_ID
                                     , rr.REQUEST_BY_EMPLOYEECODE AS EMPLOYEE_CODE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS FULL_NAME
                                     , m.EMPDEPT AS EMPLOYEE_DEPT
                                     , rr.CREATE_DATE
                                     , rvs.GPR_C_APPROVER_NAME
                                     , rvs.GPR_C_APPROVER_EMAIL
                                     , rvs.GPR_C_PC_PIC_NAME
                                     , rvs.GPR_C_PC_PIC_EMAIL
                                     , rvs.GPR_C_CIRCULAR_JSON
                                     , rvs.ACTION_REQUIRED_JSON
                                     , rvs.GPR_43_ACCEPTANCE_STATUS

                                     -- Vendor Info
                                     , v.COMPANY_NAME
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , v.VENDOR_REGION
                                     , v.PROVINCE
                                     , v.POSTAL_CODE
                                     , v.ADDRESS
                                     , v.TEL_CENTER
                                     , v.WEBSITE
                                     , v.EMAILMAIN
                                     , vt.NAME AS vendor_type_name

                                     -- Contacts (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'contact_name', vc.CONTACT_NAME,
                                                                               'tel_phone', vc.TEL_PHONE,
                                                                               'email', vc.EMAIL,
                                                                               'position', vc.POSITION
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_contacts vc
                                                           WHERE
                                                                      vc.VENDOR_ID = v.VENDOR_ID AND vc.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS contacts

                                     -- Products (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'product_group', mpg.GROUP_NAME,
                                                                               'maker_name', vp.MAKER_NAME,
                                                                               'product_name', vp.PRODUCT_NAME,
                                                                               'model_list', vp.MODEL_LIST
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_products vp
                                                                           LEFT JOIN
                                                                      master_product_groups mpg ON mpg.PRODUCT_GROUP_ID = vp.PRODUCT_GROUP_ID
                                                           WHERE
                                                                      vp.VENDOR_ID = v.VENDOR_ID AND vp.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS products

                                     -- Documents (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                  'document_id', rrf.REQUEST_FILE_ID,
                                                  'file_name', rrf.FILE_NAME,
                                                  'file_path', rrf.FILE_PATH,
                                                  'file_size', rrf.FILE_SIZE,
                                                  'file_type', rrf.FILE_TYPE
                                                )
                                                                      )
                                                           FROM
                                                                      request_register_file rrf
                                                           WHERE
                                                                      rrf.REQUEST_ID = rr.REQUEST_ID AND rrf.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS documents

                                     -- Approval Steps (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'step_id', ras.STEP_ID,
                                                                               'step_order', ras.STEP_ORDER,
                                                                               'approver_id', ras.APPROVER_ID,
                                                                               'approver_name', (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM Person.MEMBER_FED pm WHERE pm.EMPCODE = ras.APPROVER_ID LIMIT 1),
                                                                               'step_status', ras.STEP_STATUS,
                                                                               'DESCRIPTION', ras.DESCRIPTION,
                                                                               'step_code', ras.STEP_CODE,
                                                                               'actor_type', ras.ACTOR_TYPE,
                                                                               'group_code', ras.GROUP_CODE,
                                                                               'assignment_mode', ras.ASSIGNMENT_MODE,
                                                                               'CREATE_DATE', ras.CREATE_DATE,
                                                                               'UPDATE_BY', ras.UPDATE_BY,
                                                                               'UPDATE_DATE', ras.UPDATE_DATE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_step ras
                                                           WHERE
                                                                      ras.REQUEST_ID = rr.REQUEST_ID AND ras.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_steps

                                     -- Approval Logs (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'log_id', ral.LOG_ID,
                                                                               'step_id', ral.STEP_ID,
                                                                               'action_by', ral.ACTION_BY,
                                                                               'action_type', ral.ACTION_TYPE,
                                                                               'remark', ral.REMARK,
                                                                               'action_date', ral.ACTION_DATE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_log ral
                                                           WHERE
                                                                      ral.REQUEST_ID = rr.REQUEST_ID
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_logs

                                     -- GPR Criteria (inline JSON for pass/fail evaluation)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'no', vsc.CRITERIA_NO,
                                                                               'criteria', vsc.CRITERIA_VALUE,
                                                                               'uploaded_file', vsc.UPLOADED_FILE_PATH,
                                                                               'uploaded_name', vsc.UPLOADED_FILE_NAME
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_vendor_selections rvs2
                                                                           JOIN
                                                                      vendor_selection_criteria vsc ON vsc.SELECTION_ID = rvs2.SELECTION_ID
                                                           WHERE
                                                                      rvs2.REQUEST_ID = rr.REQUEST_ID AND rvs2.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS gpr_criteria

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_ID = rr.REQUEST_ID AND rvs.INUSE = 1
                                            LEFT JOIN
                                       vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.VENDOR_TYPE_ID = v.VENDOR_TYPE_ID
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       rr.REQUEST_ID = dataItem.REQUEST_ID
                                       AND rr.INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  getAssigneeByEmpCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       ASSIGNEES_ID
                                     , EMPCODE
                                     , EMPNAME
                                     , EMPEMAIL
                                     , GROUP_CODE
                                     , GROUP_NAME
                                     , INUSE
                            FROM
                                       assignees_to
                            WHERE
                                       EMPCODE = 'dataItem.TO_EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.TO_EMPCODE', dataItem['TO_EMPCODE'] || '')

    return sql
  },

  updateRequestPicAssignee: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       ASSIGN_TO = 'dataItem.ASSIGN_TO'
                                     , PIC_EMAIL = 'dataItem.PIC_EMAIL'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.ASSIGN_TO', dataItem['ASSIGN_TO'] || '')
    sql = sql.replaceAll('dataItem.PIC_EMAIL', dataItem['PIC_EMAIL'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  insertAssignmentHistory: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_assignment_history (
                                       REQUEST_ID
                                     , STEP_ID
                                     , SCOPE
                                     , STEP_CODE
                                     , GROUP_CODE
                                     , FROM_EMPCODE
                                     , TO_EMPCODE
                                     , REASON
                                     , DESCRIPTION
                                     , CHANGED_BY
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     ,  dataItem.STEP_ID
                                     , 'dataItem.SCOPE'
                                     , 'dataItem.STEP_CODE'
                                     , 'dataItem.GROUP_CODE'
                                     , 'dataItem.FROM_EMPCODE'
                                     , 'dataItem.TO_EMPCODE'
                                     , 'dataItem.REASON'
                                     , 'dataItem.DESCRIPTION'
                                     , 'dataItem.CHANGED_BY'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     ,  dataItem.INUSE
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_ID', dataItem['STEP_ID'] ? dataItem['STEP_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.SCOPE', dataItem['SCOPE'] || '')
    sql = sql.replaceAll('dataItem.STEP_CODE', dataItem['STEP_CODE'] || '')
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')
    sql = sql.replaceAll('dataItem.FROM_EMPCODE', dataItem['FROM_EMPCODE'] || '')
    sql = sql.replaceAll('dataItem.TO_EMPCODE', dataItem['TO_EMPCODE'] || '')
    sql = sql.replaceAll('dataItem.REASON', dataItem['REASON'] || '')
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'] || dataItem['REASON'] || '')
    sql = sql.replaceAll('dataItem.CHANGED_BY', dataItem['CHANGED_BY'] || dataItem['UPDATE_BY'] || 'SYSTEM')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || dataItem['CHANGED_BY'] || dataItem['UPDATE_BY'] || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || dataItem['CHANGED_BY'] || 'SYSTEM')
    sql = sql.replaceAll('dataItem.INUSE', '1')

    return sql
  },

  completeRegistration: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       VENDOR_CODE = 'dataItem.VENDOR_CODE'
                                     , REQUEST_STATUS = 'Completed'
                                     , APPROVE_BY = 'dataItem.UPDATE_BY'
                                     , APPROVE_DATE = NOW()
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },
}
