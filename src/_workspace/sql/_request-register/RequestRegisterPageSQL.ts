import type { AuditFields } from '../../types/AuditFields'

export interface RegisterRequestDataItem extends Partial<AuditFields> {
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
  workflow_step_id?: number | string
  status_id?: number | string
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
  gpr_c_approver_empcode?: string
  gpr_c_pc_pic_name?: string
  gpr_c_pc_pic_email?: string
  gpr_c_pc_pic_empcode?: string
  gpr_c_circular_json?: string
  action_required_json?: string
  gpr_43_acceptance_status?: string
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

const escapeSqlString = (value: unknown) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")

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
                                       (
                                           REQUEST_NUMBER LIKE 'Selection-dataItem.YEAR-dataItem.PREFIX%'
                                           OR REQUEST_NUMBER LIKE 'Register-dataItem.YEAR-dataItem.PREFIX%'
                                           OR REQUEST_NUMBER LIKE 'Register_Selection-dataItem.YEAR-dataItem.PREFIX%'
                                       )
                                       AND (
                                           REQUEST_NUMBER REGEXP '^Selection-dataItem.YEAR-dataItem.PREFIX[0-9]+$'
                                           OR REQUEST_NUMBER REGEXP '^Register-dataItem.YEAR-dataItem.PREFIX[0-9]+$'
                                           OR REQUEST_NUMBER REGEXP '^Register_Selection-dataItem.YEAR-dataItem.PREFIX[0-9]+$'
                                       )
        `

    sql = sql.replaceAll('dataItem.YEAR', year)
    sql = sql.replaceAll('dataItem.PREFIX', prefix)

    return sql
  },

  getRequestStatusAndAssign: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       REQUEST_STATUS
                                     , REQUEST_STATE
                                     , CURRENT_STATUS_ID
                                     , CURRENT_STEP_ID
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

  getRequestVendorRegion: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       v.VENDOR_REGION
                            FROM
                                       request_register_vendor rr
                                            INNER JOIN
                                       vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                            WHERE
                                       rr.REQUEST_ID = dataItem.REQUEST_ID
                                       AND rr.INUSE = 1
                            LIMIT 1
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
                                     , COALESCE(rr.APPROVED_VENDOR_CODE, rr.VENDOR_CODE) AS VENDOR_CODE
                                     , rvs.GPR_C_APPROVER_NAME
                                     , rvs.GPR_C_APPROVER_EMAIL
                                     , rvs.GPR_C_PC_PIC_NAME
                                     , rvs.GPR_C_PC_PIC_EMAIL
                                     , rvs.GPR_C_CIRCULAR_JSON
                                     , rvs.ACTION_REQUIRED_JSON
                                     , rvs.GPR_43_ACCEPTANCE_STATUS
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
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
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
                                     , LEFT('dataItem.REQUESTER_REMARK', 100)
                                     , 'dataItem.CREATE_BY'
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
                                       AND REQUEST_STATE = 'in_progress'
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
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     ,  dataItem.VENDOR_CONTACT_ID
                                     ,  dataItem.IS_PRIMARY
                                     , 'Vendor contact for request'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CONTACT_ID', (dataItem['VENDOR_CONTACT_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.IS_PRIMARY', (dataItem['IS_PRIMARY'] || 0).toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', escapeSqlString(dataItem['CREATE_BY'] || dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem['UPDATE_BY'] || dataItem['CREATE_BY'] || 'SYSTEM'))

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
                            INSERT INTO request_register_file (
                                       REQUEST_ID
                                     , FILE_NAME
                                     , FILE_PATH
                                     , FILE_SIZE
                                     , FILE_TYPE
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     , 'dataItem.FILE_NAME'
                                     , 'dataItem.FILE_PATH'
                                     ,  dataItem.FILE_SIZE
                                     , 'dataItem.FILE_TYPE'
                                     , LEFT('dataItem.FILE_NAME', 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    const esc = (str: any) => String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")

    sql = sql.replaceAll('dataItem.REQUEST_ID', requestId.toString())
    sql = sql.replaceAll('dataItem.FILE_NAME', esc(dataItem['FILE_NAME']))
    sql = sql.replaceAll('dataItem.FILE_PATH', esc(dataItem['FILE_PATH']))
    sql = sql.replaceAll('dataItem.FILE_SIZE', (dataItem['FILE_SIZE'] || 0).toString())
    sql = sql.replaceAll('dataItem.FILE_TYPE', esc(dataItem['FILE_TYPE']))
    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem['CREATE_BY']))

    return sql
  },

  updateRequest: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       VENDOR_CONTACT_ID = CASE
                                           WHEN dataItem.VENDOR_CONTACT_ID > 0 THEN dataItem.VENDOR_CONTACT_ID
                                           ELSE VENDOR_CONTACT_ID
                                       END
                                     , SUPPORTPRODUCT_PROCESS = 'dataItem.SUPPORTPRODUCT_PROCESS'
                                     , PURCHASE_FREQUENCY = 'dataItem.PURCHASE_FREQUENCY'
                                     , REQUESTER_REMARK = 'dataItem.REQUESTER_REMARK'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID;

                            UPDATE request_register_vendor_contacts
                            SET
                                       IS_PRIMARY = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
                                       AND dataItem.VENDOR_CONTACT_ID > 0
                                       AND INUSE = 1;

                            INSERT INTO request_register_vendor_contacts (
                                       REQUEST_ID
                                     , VENDOR_CONTACT_ID
                                     , IS_PRIMARY
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            SELECT
                                       dataItem.REQUEST_ID
                                     , dataItem.VENDOR_CONTACT_ID
                                     , 1
                                     , 'Primary vendor contact'
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            WHERE dataItem.VENDOR_CONTACT_ID > 0
                            ON DUPLICATE KEY UPDATE
                                       IS_PRIMARY = 1
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                                     , INUSE = 1
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CONTACT_ID', (dataItem['VENDOR_CONTACT_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.SUPPORTPRODUCT_PROCESS', dataItem['SUPPORTPRODUCT_PROCESS'] || '')
    sql = sql.replaceAll('dataItem.PURCHASE_FREQUENCY', dataItem['PURCHASE_FREQUENCY'] || '')
    sql = sql.replaceAll('dataItem.REQUESTER_REMARK', dataItem['REQUESTER_REMARK'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getStatusOptions: async (_dataItem?: any) => {
    const sql = `
                            SELECT
                                       wsm.WORKFLOW_STEP_ID AS workflowStepId
                                     , mrs.STATUS_ID AS statusId
                                     , mrs.STATUS_VALUE AS value
                                     , mrs.STATUS_LABEL AS label
                                     , COALESCE(wsm.STEP_CODE, mrs.STEP_CODE) AS stepCode
                                     , COALESCE(wsm.ACTOR_TYPE, mrs.ACTOR_TYPE) AS actorType
                                     , COALESCE(wsm.DEFAULT_GROUP_CODE_LOCAL, mrs.DEFAULT_GROUP_CODE_LOCAL) AS defaultGroupCodeLocal
                                     , COALESCE(wsm.DEFAULT_GROUP_CODE_OVERSEA, mrs.DEFAULT_GROUP_CODE_OVERSEA) AS defaultGroupCodeOversea
                                     , COALESCE(wsm.REQUIRES_VENDOR_REPLY, mrs.REQUIRES_VENDOR_REPLY) AS requiresVendorReply
                                     , COALESCE(wsm.REQUIRES_VENDOR_CODE, mrs.REQUIRES_VENDOR_CODE) AS requiresVendorCode
                                     , mrs.CHIP_COLOR AS chipColor
                                     , mrs.ACCENT_COLOR AS accent
                                     , mrs.ICON AS icon
                                     , COALESCE(wsm.DEFAULT_STEP_ORDER, mrs.SORT_ORDER) AS sortOrder
                            FROM
                                       m_request_status mrs
                                            LEFT JOIN
                                       workflow_step_master wsm
                                         ON wsm.STATUS_ID = mrs.STATUS_ID
                                        AND wsm.WORKFLOW_ID = (
                                            SELECT WORKFLOW_ID
                                            FROM workflow_definition
                                            WHERE WORKFLOW_CODE = 'VENDOR_REGISTRATION'
                                              AND IS_ACTIVE = 1
                                            ORDER BY VERSION_NO DESC
                                            LIMIT 1
                                        )
                            WHERE
                                       mrs.IS_ACTIVE = 1
                                       AND (wsm.WORKFLOW_STEP_ID IS NULL OR wsm.IS_ACTIVE = 1)
                            ORDER BY
                                       COALESCE(wsm.DEFAULT_STEP_ORDER, mrs.SORT_ORDER) ASC
        `
    return sql
  },

  getStatusByStepCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       wsm.WORKFLOW_STEP_ID
                                     , mrs.STATUS_ID
                                     , mrs.STATUS_VALUE
                                     , mrs.STATUS_LABEL
                                     , wsm.STEP_CODE
                                     , wsm.ACTOR_TYPE
                                     , wsm.DEFAULT_GROUP_CODE_LOCAL
                                     , wsm.DEFAULT_GROUP_CODE_OVERSEA
                                     , wsm.REQUIRES_VENDOR_REPLY
                                     , wsm.REQUIRES_VENDOR_CODE
                            FROM
                                       workflow_definition wd
                                            INNER JOIN
                                       workflow_step_master wsm ON wsm.WORKFLOW_ID = wd.WORKFLOW_ID
                                            INNER JOIN
                                       m_request_status mrs ON mrs.STATUS_ID = wsm.STATUS_ID
                            WHERE
                                       wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
                                       AND wsm.STEP_CODE = 'dataItem.STEP_CODE'
                                       AND wd.IS_ACTIVE = 1
                                       AND wsm.IS_ACTIVE = 1
                                       AND mrs.IS_ACTIVE = 1
                            ORDER BY
                                       wd.VERSION_NO DESC
                            LIMIT 1
        `

    sql = sql.replaceAll('dataItem.STEP_CODE', dataItem['STEP_CODE'] || '')

    return sql
  },

  getBusinessCategories: async (_dataItem?: any) => {
    return `
                            SELECT
                                       BUSINESS_CATEGORY_NAME AS value
                                     , BUSINESS_CATEGORY_NAME AS label
                                     , BUSINESS_CATEGORY_ID
                                     , DESCRIPTION
                            FROM
                                       business_category
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       BUSINESS_CATEGORY_NAME ASC
        `
  },

  getCurrencies: async (_dataItem?: any) => {
    return `
                            SELECT
                                       CURRENCY_NAME AS value
                                     , CURRENCY_NAME AS label
                                     , CURRENCY_ID
                            FROM
                                       info_currency
                            ORDER BY
                                       CURRENCY_NAME ASC
        `
  },

  createApprovalStep: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_approval_step (
                                       REQUEST_ID
                                     , WORKFLOW_STEP_ID
                                     , STATUS_ID
                                     , STEP_ORDER
                                     , APPROVER_ID
                                     , STEP_STATUS
                                     , DESCRIPTION
                                     , STEP_CODE
                                     , ACTOR_TYPE
                                     , GROUP_CODE
                                     , ASSIGNMENT_MODE
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     ,  dataItem.WORKFLOW_STEP_ID
                                     ,  dataItem.STATUS_ID
                                     ,  dataItem.STEP_ORDER
                                     , 'dataItem.APPROVER_ID'
                                     , 'dataItem.STEP_STATUS'
                                     , 'dataItem.DESCRIPTION'
                                     , 'dataItem.STEP_CODE'
                                     , 'dataItem.ACTOR_TYPE'
                                     , 'dataItem.GROUP_CODE'
                                     , 'dataItem.ASSIGNMENT_MODE'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_ID', (dataItem['WORKFLOW_STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STATUS_ID', (dataItem['STATUS_ID'] || 0).toString())
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
                                     , ras.WORKFLOW_STEP_ID
                                     , ras.STATUS_ID
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
                                     , ras.INUSE
                                     , mrs.STATUS_VALUE AS master_status_value
                                     , mrs.STATUS_LABEL AS master_status_label
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS approver_name
                            FROM
                                       request_approval_step ras
                                            INNER JOIN
                                       m_request_status mrs ON mrs.STATUS_ID = ras.STATUS_ID
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

  syncRequestWorkflowState: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_ID = rr.REQUEST_ID
                             AND active_step.STEP_STATUS = 'in_progress'
                             AND active_step.INUSE = 1
                            LEFT JOIN m_request_status active_status
                              ON active_status.STATUS_ID = active_step.STATUS_ID
                            SET
                                       rr.CURRENT_STEP_ID = active_step.STEP_ID
                                     , rr.CURRENT_STATUS_ID = active_step.STATUS_ID
                                     , rr.REQUEST_STATE = CASE
                                           WHEN active_step.STEP_ID IS NULL THEN rr.REQUEST_STATE
                                           ELSE 'in_progress'
                                       END
                                     , rr.REQUEST_STATUS = COALESCE(
                                           active_status.STATUS_VALUE,
                                           rr.REQUEST_STATUS
                                       )
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem['UPDATE_BY'] || 'SYSTEM'))

    return sql
  },

  updateApprovalStep: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       STEP_STATUS = LOWER('dataItem.STEP_STATUS')
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       STEP_ID = dataItem.STEP_ID;

                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_ID = rr.REQUEST_ID
                             AND active_step.STEP_STATUS = 'in_progress'
                             AND active_step.INUSE = 1
                            LEFT JOIN m_request_status active_status
                              ON active_status.STATUS_ID = active_step.STATUS_ID
                            SET
                                       rr.CURRENT_STEP_ID = COALESCE(active_step.STEP_ID, rr.CURRENT_STEP_ID)
                                     , rr.CURRENT_STATUS_ID = COALESCE(active_step.STATUS_ID, rr.CURRENT_STATUS_ID)
                                     , rr.REQUEST_STATE = CASE
                                           WHEN active_step.STEP_ID IS NULL THEN rr.REQUEST_STATE
                                           ELSE 'in_progress'
                                       END
                                     , rr.REQUEST_STATUS = COALESCE(active_status.STATUS_VALUE, rr.REQUEST_STATUS)
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.STEP_ID', (dataItem['STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
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
                                     , ACTION_BY_NAME
                                     , ACTION_TYPE
                                     , REMARK
                                     , ACTION_DATE
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , CREATE_DATE
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     ,  dataItem.STEP_ID
                                     , 'dataItem.ACTION_BY'
                                     , COALESCE(
                                           (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME)
                                            FROM Person.MEMBER_FED pm
                                            WHERE pm.EMPCODE = 'dataItem.ACTION_BY'
                                            LIMIT 1),
                                           'dataItem.ACTION_BY'
                                       )
                                     , 'dataItem.ACTION_TYPE'
                                     , 'dataItem.REMARK'
                                     ,  NOW()
                                     , LEFT('dataItem.REMARK', 100)
                                     , 'dataItem.ACTION_BY'
                                     , 'dataItem.ACTION_BY'
                                     , NOW()
                                     , NOW()
                                     , 1
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
                                       AND INUSE = 1
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
                                       AND INUSE = 1
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
                                     , BUSINESS_CATEGORY_ID
                                     , BUSINESS_CATEGORY
                                     , START_YEAR
                                     , AUTHORIZED_CAPITAL
                                     , ESTABLISH_YEARS
                                     , NUMBER_OF_EMPLOYEES
                                     , MANUFACTURED_COUNTRY
                                     , VENDOR_ORIGINAL_COUNTRY
                                     , SANCTIONS_STATUS
                                     , CURRENCY_ID
                                     , CURRENCY
                                     , SUGGESTION
                                     , RESULT_STATUS
                                     , DOCUMENT_PATH
                                     , PROPOSED_VENDOR_CODE
                                     , VENDOR_CODE_SELECTOR
                                     , GPR_C_APPROVER_NAME
                                     , GPR_C_APPROVER_EMAIL
                                     , GPR_C_APPROVER_EMPCODE
                                     , GPR_C_PC_PIC_NAME
                                     , GPR_C_PC_PIC_EMAIL
                                     , GPR_C_PC_PIC_EMPCODE
                                     , GPR_C_CIRCULAR_JSON
                                     , ACTION_REQUIRED_JSON
                                     , GPR_43_ACCEPTANCE_STATUS
                                     , COMPLETION_DATE
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                       'dataItem.REQUEST_ID'
                                     , (SELECT BUSINESS_CATEGORY_ID FROM business_category
                                        WHERE BUSINESS_CATEGORY_NAME = 'dataItem.BUSINESS_CATEGORY' AND INUSE = 1 LIMIT 1)
                                     , 'dataItem.BUSINESS_CATEGORY'
                                     , 'dataItem.START_YEAR'
                                     , 'dataItem.AUTHORIZED_CAPITAL'
                                     , 'dataItem.ESTABLISH'
                                     , 'dataItem.NUMBER_OF_EMPLOYEES'
                                     , 'dataItem.MANUFACTURED_COUNTRY'
                                     , 'dataItem.VENDOR_ORIGINAL_COUNTRY'
                                     , 'dataItem.SANCTIONS'
                                     , (SELECT CURRENCY_ID FROM info_currency
                                        WHERE CURRENCY_NAME = 'dataItem.CURRENCY' LIMIT 1)
                                     , 'dataItem.CURRENCY'
                                     , 'dataItem.SUGGESTION'
                                     , 'dataItem.RESULT'
                                     , 'dataItem.PATH'
                                     , NULLIF('dataItem.VENDOR_CODE_SELECTOR', '')
                                     , 'dataItem.VENDOR_CODE_SELECTOR'
                                     , 'dataItem.GPR_C_APPROVER_NAME'
                                     , 'dataItem.GPR_C_APPROVER_EMAIL'
                                     , 'dataItem.GPR_C_APPROVER_EMPCODE'
                                     , 'dataItem.GPR_C_PC_PIC_NAME'
                                     , 'dataItem.GPR_C_PC_PIC_EMAIL'
                                     , 'dataItem.GPR_C_PC_PIC_EMPCODE'
                                     , 'dataItem.GPR_C_CIRCULAR_JSON'
                                     , 'dataItem.ACTION_REQUIRED_JSON'
                                     , 'dataItem.GPR_43_ACCEPTANCE_STATUS'
                                     ,  dataItem.COMPLETION_DATE_NULL
                                     , LEFT('dataItem.SUGGESTION', 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
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
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMPCODE', esc(d['GPR_C_APPROVER_EMPCODE']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_NAME', esc(d['GPR_C_PC_PIC_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_EMAIL', esc(d['GPR_C_PC_PIC_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_EMPCODE', esc(d['GPR_C_PC_PIC_EMPCODE']))
    sql = sql.replaceAll('dataItem.GPR_C_CIRCULAR_JSON', esc(d['GPR_C_CIRCULAR_JSON']))
    sql = sql.replaceAll('dataItem.ACTION_REQUIRED_JSON', esc(d['ACTION_REQUIRED_JSON']))
    sql = sql.replaceAll('dataItem.GPR_43_ACCEPTANCE_STATUS', esc(d['GPR_43_ACCEPTANCE_STATUS']))

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
                                       BUSINESS_CATEGORY_ID = (
                                           SELECT BUSINESS_CATEGORY_ID FROM business_category
                                           WHERE BUSINESS_CATEGORY_NAME = 'dataItem.BUSINESS_CATEGORY'
                                             AND INUSE = 1
                                           LIMIT 1
                                       )
                                     , BUSINESS_CATEGORY = 'dataItem.BUSINESS_CATEGORY'
                                     , START_YEAR = 'dataItem.START_YEAR'
                                     , AUTHORIZED_CAPITAL = 'dataItem.AUTHORIZED_CAPITAL'
                                     , ESTABLISH_YEARS = 'dataItem.ESTABLISH'
                                     , NUMBER_OF_EMPLOYEES = 'dataItem.NUMBER_OF_EMPLOYEES'
                                     , MANUFACTURED_COUNTRY = 'dataItem.MANUFACTURED_COUNTRY'
                                     , VENDOR_ORIGINAL_COUNTRY = 'dataItem.VENDOR_ORIGINAL_COUNTRY'
                                     , SANCTIONS_STATUS = 'dataItem.SANCTIONS'
                                     , CURRENCY_ID = (
                                           SELECT CURRENCY_ID FROM info_currency
                                           WHERE CURRENCY_NAME = 'dataItem.CURRENCY'
                                           LIMIT 1
                                       )
                                     , CURRENCY = 'dataItem.CURRENCY'
                                     , SUGGESTION = 'dataItem.SUGGESTION'
                                     , RESULT_STATUS = 'dataItem.RESULT'
                                     , DOCUMENT_PATH = 'dataItem.PATH'
                                     , PROPOSED_VENDOR_CODE = NULLIF('dataItem.VENDOR_CODE_SELECTOR', '')
                                     , VENDOR_CODE_SELECTOR = 'dataItem.VENDOR_CODE_SELECTOR'
                                     , GPR_C_APPROVER_NAME = 'dataItem.GPR_C_APPROVER_NAME'
                                     , GPR_C_APPROVER_EMAIL = 'dataItem.GPR_C_APPROVER_EMAIL'
                                     , GPR_C_APPROVER_EMPCODE = 'dataItem.GPR_C_APPROVER_EMPCODE'
                                     , GPR_C_PC_PIC_NAME = 'dataItem.GPR_C_PC_PIC_NAME'
                                     , GPR_C_PC_PIC_EMAIL = 'dataItem.GPR_C_PC_PIC_EMAIL'
                                     , GPR_C_PC_PIC_EMPCODE = 'dataItem.GPR_C_PC_PIC_EMPCODE'
                                     , GPR_C_CIRCULAR_JSON = 'dataItem.GPR_C_CIRCULAR_JSON'
                                     , ACTION_REQUIRED_JSON = 'dataItem.ACTION_REQUIRED_JSON'
                                     , GPR_43_ACCEPTANCE_STATUS = 'dataItem.GPR_43_ACCEPTANCE_STATUS'
                                     , COMPLETION_DATE = dataItem.COMPLETION_DATE_NULL
                                     , DESCRIPTION = LEFT('dataItem.SUGGESTION', 100)
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       SELECTION_ID = dataItem.SELECTION_ID
                                       AND INUSE = 1
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
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMPCODE', esc(d['GPR_C_APPROVER_EMPCODE']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_NAME', esc(d['GPR_C_PC_PIC_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_EMAIL', esc(d['GPR_C_PC_PIC_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_EMPCODE', esc(d['GPR_C_PC_PIC_EMPCODE']))
    sql = sql.replaceAll('dataItem.GPR_C_CIRCULAR_JSON', esc(d['GPR_C_CIRCULAR_JSON']))
    sql = sql.replaceAll('dataItem.ACTION_REQUIRED_JSON', esc(d['ACTION_REQUIRED_JSON']))
    sql = sql.replaceAll('dataItem.GPR_43_ACCEPTANCE_STATUS', esc(d['GPR_43_ACCEPTANCE_STATUS']))

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
                                     , GPR_C_APPROVER_EMPCODE = 'dataItem.GPR_C_APPROVER_EMPCODE'
                                     , GPR_C_PC_PIC_NAME = 'dataItem.GPR_C_PC_PIC_NAME'
                                     , GPR_C_PC_PIC_EMAIL = 'dataItem.GPR_C_PC_PIC_EMAIL'
                                     , GPR_C_PC_PIC_EMPCODE = 'dataItem.GPR_C_PC_PIC_EMPCODE'
                                     , GPR_C_CIRCULAR_JSON = 'dataItem.GPR_C_CIRCULAR_JSON'
                                     , ACTION_REQUIRED_JSON = 'dataItem.ACTION_REQUIRED_JSON'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       SELECTION_ID = dataItem.SELECTION_ID
                                       AND INUSE = 1
        `

    const d = dataItem
    const esc = (str: any) => String(str || '').replace(/'/g, "\\'")

    sql = sql.replaceAll('dataItem.SELECTION_ID', (d['SELECTION_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_NAME', esc(d['GPR_C_APPROVER_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMAIL', esc(d['GPR_C_APPROVER_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMPCODE', esc(d['GPR_C_APPROVER_EMPCODE']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_NAME', esc(d['GPR_C_PC_PIC_NAME']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_EMAIL', esc(d['GPR_C_PC_PIC_EMAIL']))
    sql = sql.replaceAll('dataItem.GPR_C_PC_PIC_EMPCODE', esc(d['GPR_C_PC_PIC_EMPCODE']))
    sql = sql.replaceAll('dataItem.GPR_C_CIRCULAR_JSON', esc(d['GPR_C_CIRCULAR_JSON']))
    sql = sql.replaceAll('dataItem.ACTION_REQUIRED_JSON', esc(d['ACTION_REQUIRED_JSON']))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(d['UPDATE_BY'] || 'SYSTEM'))

    return sql
  },

  getGprCircularMembers: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       MEMBER_ORDER
                                     , EMPCODE
                                     , MEMBER_NAME
                                     , EMAIL
                            FROM
                                       request_vendor_gpr_c_circular_members
                            WHERE
                                       SELECTION_ID = dataItem.SELECTION_ID
                            ORDER BY
                                       MEMBER_ORDER ASC
        `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    return sql
  },

  deleteGprCircularMembers: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_vendor_gpr_c_circular_members
                            SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE SELECTION_ID = dataItem.SELECTION_ID
                              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem.UPDATE_BY || 'SYSTEM'))
    return sql
  },

  insertGprCircularMember: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_vendor_gpr_c_circular_members (
                                       SELECTION_ID
                                     , MEMBER_ORDER
                                     , EMPCODE
                                     , MEMBER_NAME
                                     , EMAIL
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                       dataItem.SELECTION_ID
                                     , dataItem.MEMBER_ORDER
                                     , NULLIF('dataItem.EMPCODE', '')
                                     , NULLIF('dataItem.MEMBER_NAME', '')
                                     , 'dataItem.EMAIL'
                                     , LEFT(COALESCE(NULLIF('dataItem.MEMBER_NAME', ''), 'dataItem.EMAIL'), 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            )
                            ON DUPLICATE KEY UPDATE
                                       EMPCODE = VALUES(EMPCODE)
                                     , MEMBER_NAME = VALUES(MEMBER_NAME)
                                     , EMAIL = VALUES(EMAIL)
                                     , DESCRIPTION = VALUES(DESCRIPTION)
                                     , UPDATE_BY = VALUES(UPDATE_BY)
                                     , UPDATE_DATE = NOW()
                                     , INUSE = 1
        `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    sql = sql.replaceAll('dataItem.MEMBER_ORDER', (dataItem.MEMBER_ORDER || 0).toString())
    sql = sql.replaceAll('dataItem.EMPCODE', escapeSqlString(dataItem.EMPCODE))
    sql = sql.replaceAll('dataItem.MEMBER_NAME', escapeSqlString(dataItem.MEMBER_NAME))
    sql = sql.replaceAll('dataItem.EMAIL', escapeSqlString(dataItem.EMAIL))
    sql = sql.replaceAll('dataItem.CREATE_BY', escapeSqlString(dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))
    return sql
  },

  getGprActionSetup: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       STAGE_CODE
                                     , PIC_NAME
                                     , PIC_EMAIL
                                     , RESULT_STATUS
                                     , RESULT_NOTE
                                     , RESULT_UPDATED_AT
                            FROM
                                       request_vendor_gpr_c_action_setup
                            WHERE
                                       SELECTION_ID = dataItem.SELECTION_ID
                            ORDER BY
                                       FIELD(STAGE_CODE, 'engineer', 'emr', 'qms', 'pm_manager')
        `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    return sql
  },

  deleteGprActionSetup: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_vendor_gpr_c_action_setup
                            SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE SELECTION_ID = dataItem.SELECTION_ID
                              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem.UPDATE_BY || 'SYSTEM'))
    return sql
  },

  insertGprActionSetup: (dataItem: RegisterRequestDataItem) => {
    const resultUpdatedAt = escapeSqlString(dataItem.RESULT_UPDATED_AT)
    let sql = `
                            INSERT INTO request_vendor_gpr_c_action_setup (
                                       SELECTION_ID
                                     , STAGE_CODE
                                     , PIC_NAME
                                     , PIC_EMAIL
                                     , RESULT_STATUS
                                     , RESULT_NOTE
                                     , RESULT_UPDATED_AT
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                       dataItem.SELECTION_ID
                                     , 'dataItem.STAGE_CODE'
                                     , NULLIF('dataItem.PIC_NAME', '')
                                     , NULLIF('dataItem.PIC_EMAIL', '')
                                     , NULLIF(LOWER('dataItem.RESULT_STATUS'), '')
                                     , NULLIF('dataItem.RESULT_NOTE', '')
                                     , CASE
                                           WHEN 'dataItem.RESULT_UPDATED_AT' = '' THEN NULL
                                           ELSE STR_TO_DATE(
                                               LEFT(REPLACE('dataItem.RESULT_UPDATED_AT', 'T', ' '), 19),
                                               '%Y-%m-%d %H:%i:%s'
                                           )
                                       END
                                     , LEFT(CONCAT('dataItem.STAGE_CODE', ': ', 'dataItem.RESULT_NOTE'), 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            )
                            ON DUPLICATE KEY UPDATE
                                       PIC_NAME = VALUES(PIC_NAME)
                                     , PIC_EMAIL = VALUES(PIC_EMAIL)
                                     , RESULT_STATUS = VALUES(RESULT_STATUS)
                                     , RESULT_NOTE = VALUES(RESULT_NOTE)
                                     , RESULT_UPDATED_AT = VALUES(RESULT_UPDATED_AT)
                                     , DESCRIPTION = VALUES(DESCRIPTION)
                                     , UPDATE_BY = VALUES(UPDATE_BY)
                                     , UPDATE_DATE = NOW()
                                     , INUSE = 1
        `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    sql = sql.replaceAll('dataItem.STAGE_CODE', escapeSqlString(dataItem.STAGE_CODE))
    sql = sql.replaceAll('dataItem.PIC_NAME', escapeSqlString(dataItem.PIC_NAME))
    sql = sql.replaceAll('dataItem.PIC_EMAIL', escapeSqlString(dataItem.PIC_EMAIL))
    sql = sql.replaceAll('dataItem.RESULT_STATUS', escapeSqlString(dataItem.RESULT_STATUS))
    sql = sql.replaceAll('dataItem.RESULT_NOTE', escapeSqlString(dataItem.RESULT_NOTE))
    sql = sql.replaceAll('dataItem.RESULT_UPDATED_AT', resultUpdatedAt)
    sql = sql.replaceAll('dataItem.CREATE_BY', escapeSqlString(dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))
    return sql
  },

  deleteFinancials: (dataItem: RegisterRequestDataItem) => {
    let sql = `
      UPDATE vendor_selection_financials
      SET INUSE = 0, UPDATE_BY = 'dataItem.UPDATE_BY', UPDATE_DATE = NOW()
      WHERE SELECTION_ID = dataItem.SELECTION_ID AND INUSE = 1
    `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem.UPDATE_BY || 'SYSTEM'))
    return sql
  },

  deleteCriteria: (dataItem: RegisterRequestDataItem) => {
    let sql = `
      UPDATE vendor_selection_criteria
      SET INUSE = 0, UPDATE_BY = 'dataItem.UPDATE_BY', UPDATE_DATE = NOW()
      WHERE SELECTION_ID = dataItem.SELECTION_ID AND INUSE = 1
    `
    sql = sql.replaceAll('dataItem.SELECTION_ID', (dataItem.SELECTION_ID || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem.UPDATE_BY || 'SYSTEM'))
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
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       dataItem.SELECTION_ID
                                     , 'dataItem.YEAR'
                                     , dataItem.TOTAL_REVENUE
                                     , dataItem.NET_PROFIT
                                     , LEFT(CONCAT('Financial year ', 'dataItem.YEAR'), 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            )
                            ON DUPLICATE KEY UPDATE
                                       TOTAL_REVENUE = VALUES(TOTAL_REVENUE)
                                     , NET_PROFIT = VALUES(NET_PROFIT)
                                     , DESCRIPTION = VALUES(DESCRIPTION)
                                     , UPDATE_BY = VALUES(UPDATE_BY)
                                     , UPDATE_DATE = NOW()
                                     , INUSE = 1
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
                                     , DESCRIPTION
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
                                     , LEFT(COALESCE(NULLIF('dataItem.REMARK', ''), 'dataItem.CRITERIA'), 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            )
                            ON DUPLICATE KEY UPDATE
                                       CRITERIA_VALUE = VALUES(CRITERIA_VALUE)
                                     , REMARK = VALUES(REMARK)
                                     , UPLOADED_FILE_PATH = VALUES(UPLOADED_FILE_PATH)
                                     , UPLOADED_FILE_NAME = VALUES(UPLOADED_FILE_NAME)
                                     , DESCRIPTION = VALUES(DESCRIPTION)
                                     , UPDATE_BY = VALUES(UPDATE_BY)
                                     , UPDATE_DATE = NOW()
                                     , INUSE = 1
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
