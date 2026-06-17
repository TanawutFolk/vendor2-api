import type { AuditFields } from '../../types/AuditFields'
import { gprCSelectionFields } from '../_request-register/GprCSelectionSqlSnippets'
import { primaryVendorContactIdExpr } from '../_request-register/RequestVendorContactSqlSnippets'
import { requestStatusExpr, requestStatusIdByValueExpr } from '../_request-register/RequestStatusSqlSnippets'

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

const escapeSqlString = (value: unknown) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")

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
                                     , ${requestStatusExpr('rr')} AS REQUEST_STATUS
                                     , rr.REQUEST_STATE
                                     , rr.CURRENT_STATUS_ID
                                     , rr.CURRENT_STEP_ID
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , ${primaryVendorContactIdExpr('rr')} AS VENDOR_CONTACT_ID
                                     , rr.REQUESTER_REMARK
                                     , rr.APPROVE_BY
                                     , rr.APPROVE_DATE
                                     , rr.APPROVER_REMARK
                                     , rr.APPROVED_VENDOR_CODE AS VENDOR_CODE
                                     ${gprCSelectionFields('rvs', 'rr')}
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
                                                                               'status_id', ras.STATUS_ID,
                                                                               'step_order', ras.STEP_ORDER,
                                                                               'approver_id', ras.APPROVER_ID,
                                                                               'approver_name', (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM Person.MEMBER_FED pm WHERE pm.EMPCODE = ras.APPROVER_ID LIMIT 1),
                                                                               'step_status', ras.STEP_STATUS,
                                                                               'DESCRIPTION', ras.DESCRIPTION,
                                                                               'step_code', ras.STEP_CODE,
                                                                               'actor_type', ras.ACTOR_TYPE,
                                                                               'group_code', ras.GROUP_CODE,
                                                                               'assignment_mode', ras.ASSIGNMENT_MODE,
                                                                               'master_status_value', mrs.STATUS_VALUE,
                                                                               'master_status_label', mrs.STATUS_LABEL,
                                                                               'CREATE_DATE', ras.CREATE_DATE,
                                                                               'UPDATE_BY', ras.UPDATE_BY,
                                                                               'UPDATE_DATE', ras.UPDATE_DATE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_step ras
                                                                           INNER JOIN
                                                                      m_request_status mrs ON mrs.STATUS_ID = ras.STATUS_ID
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
                                                                               'action_by_name', COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM Person.MEMBER_FED pm WHERE pm.EMPCODE = ral.ACTION_BY LIMIT 1)),
                                                                               'action_type', ral.ACTION_TYPE,
                                                                               'remark', ral.REMARK,
                                                                               'action_date', ral.ACTION_DATE,
                                                                               'DESCRIPTION', ral.DESCRIPTION,
                                                                               'CREATE_BY', ral.CREATE_BY,
                                                                               'UPDATE_BY', ral.UPDATE_BY,
                                                                               'CREATE_DATE', ral.CREATE_DATE,
                                                                               'UPDATE_DATE', ral.UPDATE_DATE,
                                                                               'INUSE', ral.INUSE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_log ral
                                                           WHERE
                                                                      ral.REQUEST_ID = rr.REQUEST_ID
                                                                      AND ral.INUSE = 1
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

  getRequestStatusAndAssign: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       ${requestStatusExpr('rr')} AS REQUEST_STATUS
                                     , ASSIGN_TO
                            FROM
                                       request_register_vendor rr
                            WHERE
                                       rr.REQUEST_ID = dataItem.REQUEST_ID
                                       AND rr.INUSE = 1
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

  updateRequest: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       SUPPORTPRODUCT_PROCESS = 'dataItem.SUPPORTPRODUCT_PROCESS'
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
    sql = sql.replaceAll('dataItem.ACTION_BY', escapeSqlString(dataItem['ACTION_BY']))
    sql = sql.replaceAll('dataItem.ACTION_TYPE', escapeSqlString(dataItem['ACTION_TYPE']))
    sql = sql.replaceAll('dataItem.REMARK', escapeSqlString(dataItem['REMARK']))

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
                                     , ral.DESCRIPTION
                                     , ral.CREATE_BY
                                     , ral.UPDATE_BY
                                     , ral.CREATE_DATE
                                     , ral.UPDATE_DATE
                                     , ral.INUSE
                                     , COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), CONCAT(m.EMPNAME, ' ', m.EMPSURNAME)) AS action_by_name
                            FROM
                                       request_approval_log ral
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.EMPCODE = ral.ACTION_BY
                            WHERE
                                       ral.REQUEST_ID = dataItem.REQUEST_ID
                                       AND ral.INUSE = 1
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
                                     , rvs.PROPOSED_VENDOR_CODE AS VENDOR_CODE_SELECTOR
                                     ${gprCSelectionFields('rvs', 'rr')}
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

    sql = sql.replaceAll('dataItem.EMPCODE', escapeSqlString(dataItem['EMPCODE']))
    sql = sql.replaceAll('dataItem.GROUP_CODE', escapeSqlString(dataItem['GROUP_CODE']))
    sql = sql.replaceAll('dataItem.GROUP_COMPACT', escapeSqlString(dataItem['GROUP_COMPACT']))

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
                                       CURRENT_STATUS_ID = COALESCE(${requestStatusIdByValueExpr("'dataItem.REQUEST_STATUS'")}, CURRENT_STATUS_ID)
                                     , REQUEST_STATE = CASE
                                           WHEN LOWER('dataItem.REQUEST_STATUS') = 'completed' THEN 'completed'
                                           WHEN LOWER('dataItem.REQUEST_STATUS') IN ('rejected', 'vendor disagreed') THEN 'rejected'
                                           WHEN LOWER('dataItem.REQUEST_STATUS') IN ('cancelled', 'canceled') THEN 'cancelled'
                                           ELSE REQUEST_STATE
                                       END
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
                                       APPROVED_VENDOR_CODE = 'dataItem.VENDOR_CODE'
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
                                       STEP_STATUS = LOWER('dataItem.STEP_STATUS')
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       STEP_ID = dataItem.STEP_ID;

                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step changed_step
                              ON changed_step.STEP_ID = dataItem.STEP_ID
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_ID = rr.REQUEST_ID
                             AND active_step.STEP_STATUS = 'in_progress'
                             AND active_step.INUSE = 1
                            LEFT JOIN m_request_status active_status
                              ON active_status.STATUS_ID = active_step.STATUS_ID
                            LEFT JOIN m_request_status rejected_status
                              ON rejected_status.STEP_CODE = 'REJECTED'
                            SET
                                       rr.REQUEST_STATE = CASE
                                           WHEN LOWER('dataItem.STEP_STATUS') = 'rejected' THEN 'rejected'
                                           WHEN active_step.STEP_ID IS NOT NULL THEN 'in_progress'
                                           ELSE rr.REQUEST_STATE
                                       END
                                     , rr.CURRENT_STEP_ID = CASE
                                           WHEN LOWER('dataItem.STEP_STATUS') = 'rejected' THEN changed_step.STEP_ID
                                           WHEN active_step.STEP_ID IS NOT NULL THEN active_step.STEP_ID
                                           ELSE rr.CURRENT_STEP_ID
                                       END
                                     , rr.CURRENT_STATUS_ID = CASE
                                           WHEN LOWER('dataItem.STEP_STATUS') = 'rejected' THEN rejected_status.STATUS_ID
                                           WHEN active_step.STEP_ID IS NOT NULL THEN active_step.STATUS_ID
                                           ELSE rr.CURRENT_STATUS_ID
                                       END
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_ID = changed_step.REQUEST_ID
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
                                       REQUEST_STATE = 'completed'
                                     , CURRENT_STATUS_ID = (
                                           SELECT STATUS_ID FROM m_request_status
                                           WHERE STEP_CODE = 'ACCOUNT_REGISTERED'
                                           LIMIT 1
                                       )
                                     , CURRENT_STEP_ID = NULL
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
                                     , ${requestStatusExpr('rr')} AS REQUEST_STATUS
                                     , rr.REQUEST_STATE
                                     , rr.CURRENT_STATUS_ID
                                     , rr.CURRENT_STEP_ID
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.REQUESTER_REMARK
                                     , rr.APPROVER_REMARK
                                     , rr.APPROVE_BY
                                     , rr.APPROVE_DATE
                                     , rr.APPROVED_VENDOR_CODE AS VENDOR_CODE
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , ${primaryVendorContactIdExpr('rr')} AS VENDOR_CONTACT_ID
                                     , rr.REQUEST_BY_EMPLOYEECODE AS EMPLOYEE_CODE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS FULL_NAME
                                     , m.EMPDEPT AS EMPLOYEE_DEPT
                                     , rr.CREATE_DATE
                                     ${gprCSelectionFields('rvs', 'rr')}
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
                                                                               'status_id', ras.STATUS_ID,
                                                                               'step_order', ras.STEP_ORDER,
                                                                               'approver_id', ras.APPROVER_ID,
                                                                               'approver_name', (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM Person.MEMBER_FED pm WHERE pm.EMPCODE = ras.APPROVER_ID LIMIT 1),
                                                                               'step_status', ras.STEP_STATUS,
                                                                               'DESCRIPTION', ras.DESCRIPTION,
                                                                               'step_code', ras.STEP_CODE,
                                                                               'actor_type', ras.ACTOR_TYPE,
                                                                               'group_code', ras.GROUP_CODE,
                                                                               'assignment_mode', ras.ASSIGNMENT_MODE,
                                                                               'master_status_value', mrs.STATUS_VALUE,
                                                                               'master_status_label', mrs.STATUS_LABEL,
                                                                               'CREATE_DATE', ras.CREATE_DATE,
                                                                               'UPDATE_BY', ras.UPDATE_BY,
                                                                               'UPDATE_DATE', ras.UPDATE_DATE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_step ras
                                                                           INNER JOIN
                                                                      m_request_status mrs ON mrs.STATUS_ID = ras.STATUS_ID
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
                                                                               'action_by_name', COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM Person.MEMBER_FED pm WHERE pm.EMPCODE = ral.ACTION_BY LIMIT 1)),
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
    sql = sql.replaceAll('dataItem.ASSIGN_TO', escapeSqlString(dataItem['ASSIGN_TO']))
    sql = sql.replaceAll('dataItem.PIC_EMAIL', escapeSqlString(dataItem['PIC_EMAIL']))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem['UPDATE_BY'] || 'SYSTEM'))

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
                                     , LEFT('dataItem.DESCRIPTION', 100)
                                     , 'dataItem.CHANGED_BY'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     ,  dataItem.INUSE
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_ID', dataItem['STEP_ID'] ? dataItem['STEP_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.SCOPE', escapeSqlString(dataItem['SCOPE']))
    sql = sql.replaceAll('dataItem.STEP_CODE', escapeSqlString(dataItem['STEP_CODE']))
    sql = sql.replaceAll('dataItem.GROUP_CODE', escapeSqlString(dataItem['GROUP_CODE']))
    sql = sql.replaceAll('dataItem.FROM_EMPCODE', escapeSqlString(dataItem['FROM_EMPCODE']))
    sql = sql.replaceAll('dataItem.TO_EMPCODE', escapeSqlString(dataItem['TO_EMPCODE']))
    sql = sql.replaceAll('dataItem.REASON', escapeSqlString(dataItem['REASON']))
    sql = sql.replaceAll('dataItem.DESCRIPTION', escapeSqlString(dataItem['DESCRIPTION'] || dataItem['REASON']))
    sql = sql.replaceAll('dataItem.CHANGED_BY', escapeSqlString(dataItem['CHANGED_BY'] || dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.CREATE_BY', escapeSqlString(dataItem['CREATE_BY'] || dataItem['CHANGED_BY'] || dataItem['UPDATE_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlString(dataItem['UPDATE_BY'] || dataItem['CHANGED_BY'] || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.INUSE', '1')

    return sql
  },

  completeRegistration: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       APPROVED_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                                     , REQUEST_STATE = 'completed'
                                     , CURRENT_STATUS_ID = (
                                           SELECT STATUS_ID FROM m_request_status
                                           WHERE STEP_CODE = 'ACCOUNT_REGISTERED'
                                           LIMIT 1
                                       )
                                     , CURRENT_STEP_ID = NULL
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
