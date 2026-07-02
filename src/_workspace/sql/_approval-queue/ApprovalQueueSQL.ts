import { GprCSelectionSqlSnippets } from '../_request-register/GprCSelectionSqlSnippets'
import { RequestVendorContactSqlSnippets } from '../_request-register/RequestVendorContactSqlSnippets'
import { RequestApprovalSummarySqlSnippets } from '../_request-register/RequestApprovalSummarySqlSnippets'
import { RequestStatusSqlSnippets } from '../_request-register/RequestStatusSqlSnippets'

const escapeSqlLiteral = (value: unknown) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")

const normalizeQueueStepCode = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '')

const queueStepConditionSql = (queueStepCode: string, workflowStepAlias = 'wsm_my', requestStatusAlias = 'mrs_my') => {
  if (!queueStepCode) return ''

  if (queueStepCode === 'DOC_CHECK') {
    return [
      `(UPPER(IFNULL(${workflowStepAlias}.STEP_CODE, '')) = 'DOC_CHECK'`,
      `OR LOWER(IFNULL(${requestStatusAlias}.STATUS_VALUE, '')) LIKE '%checker%'`,
      `OR LOWER(IFNULL(${requestStatusAlias}.STATUS_VALUE, '')) LIKE '%check all document%')`,
    ].join(' ')
  }

  if (queueStepCode === 'ACCOUNT_REGISTERED') {
    return [
      `(UPPER(IFNULL(${workflowStepAlias}.STEP_CODE, '')) = 'ACCOUNT_REGISTERED'`,
      `OR LOWER(IFNULL(${requestStatusAlias}.STATUS_VALUE, '')) LIKE '%account%')`,
    ].join(' ')
  }

  if (queueStepCode === 'ISSUE_GPR_C') {
    return [
      `(UPPER(IFNULL(${workflowStepAlias}.STEP_CODE, '')) = 'ISSUE_GPR_C'`,
      `OR LOWER(IFNULL(${requestStatusAlias}.STATUS_VALUE, '')) LIKE '%issue gpr c%')`,
    ].join(' ')
  }

  return `UPPER(IFNULL(${workflowStepAlias}.STEP_CODE, '')) = '${queueStepCode}'`
}

const myApprovalStatusExpr = (dataItem: any) => {
  const approverEmpcode = escapeSqlLiteral(dataItem?.APPROVER_EMPCODE)
  if (!approverEmpcode) return 'NULL'

  const queueStepCode = normalizeQueueStepCode(dataItem?.QUEUE_STEP_CODE)
  const queueCondition = queueStepConditionSql(queueStepCode)
  const queueConditionSql = queueCondition ? `AND ${queueCondition}` : ''

  return `(
                                           SELECT ras_my.STEP_STATUS
                                           FROM request_approval_step ras_my
                                                INNER JOIN workflow_step_master wsm_my
                                                  ON wsm_my.WORKFLOW_STEP_MASTER_ID = ras_my.WORKFLOW_STEP_MASTER_ID
                                                INNER JOIN m_request_status mrs_my
                                                  ON mrs_my.M_REQUEST_STATUS_ID = wsm_my.M_REQUEST_STATUS_ID
                                           WHERE ras_my.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                                             AND ras_my.APPROVER_EMPCODE = '${approverEmpcode}'
                                             AND ras_my.STEP_STATUS IN ('in_progress', 'approved', 'rejected')
                                             AND ras_my.INUSE = 1
                                             ${queueConditionSql}
                                           ORDER BY CASE ras_my.STEP_STATUS
                                                      WHEN 'in_progress' THEN 1
                                                      WHEN 'rejected' THEN 2
                                                      WHEN 'approved' THEN 3
                                                      ELSE 4
                                                    END,
                                                    ras_my.STEP_ORDER ASC,
                                                    ras_my.REQUEST_APPROVAL_STEP_ID DESC
                                           LIMIT 1
                                       )`
}

export const ApprovalQueueSQL = {
  getAllRequests: async (dataItem: any) => {
    let countSql = `
                            SELECT
                                       COUNT(DISTINCT rr.REQUEST_REGISTER_VENDOR_ID) AS TOTAL_COUNT
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.MASTER_VENDOR_TYPES_ID = v.MASTER_VENDOR_TYPES_ID
                                            LEFT JOIN
                                       person.member_fed m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       rr.INUSE = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
        `

    let dataSql = `
                            SELECT
                                       rr.REQUEST_REGISTER_VENDOR_ID
                                     , rr.REQUEST_NUMBER
                                     , rr.VENDORS_ID
                                     , ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS
                                     , rr.REQUEST_STATE
                                     , rr.CURRENT_M_REQUEST_STATUS_ID
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , current_wsm.STEP_CODE AS CURRENT_STEP_CODE
                                     , current_ras.STEP_STATUS AS CURRENT_STEP_STATUS
                                     , current_ras.APPROVER_EMPCODE AS CURRENT_STEP_APPROVER_EMPCODE
                                     , ${myApprovalStatusExpr(dataItem)} AS MY_APPROVAL_STATUS
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , ${RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')} AS VENDOR_CONTACTS_ID
                                     , rr.REQUESTER_REMARK
                                     , rr.APPROVED_VENDOR_CODE AS VENDOR_CODE
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
                                     , v.COUNTRY
                                     , v.ADDRESS
                                     , v.TEL_CENTER
                                     , v.WEBSITE
                                     , v.EMAILMAIN
                                     , vt.NAME AS vendor_type_name

                                     -- Lightweight list-only values
                                     , (
                                           SELECT COUNT(*)
                                           FROM request_register_file rrf
                                           WHERE rrf.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                                             AND rrf.INUSE = 1
                                       ) AS DOCUMENTS_COUNT
                                     , CASE
                                           WHEN EXISTS (
                                               SELECT 1
                                               FROM request_vendor_gpr_c_flows f
                                               WHERE f.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                                                 AND f.INUSE = 1
                                                 AND COALESCE(f.GPR_C_APPROVER_NAME, '') <> ''
                                                 AND COALESCE(f.GPR_C_APPROVER_EMAIL, '') <> ''
                                                 AND COALESCE(f.PC_PIC_NAME, '') <> ''
                                                 AND COALESCE(f.PC_PIC_EMAIL, '') <> ''
                                           )
                                           AND EXISTS (
                                               SELECT 1
                                               FROM request_vendor_gpr_c_circular_members cm
                                               WHERE cm.REQUEST_VENDOR_SELECTIONS_ID = rvs.REQUEST_VENDOR_SELECTIONS_ID
                                                 AND cm.INUSE = 1
                                           )
                                           THEN 1
                                           ELSE 0
                                       END AS GPR_C_SETUP_COMPLETED

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rvs.INUSE = 1
                                            LEFT JOIN
                                       request_approval_step current_ras ON current_ras.REQUEST_APPROVAL_STEP_ID = rr.CURRENT_REQUEST_APPROVAL_STEP_ID AND current_ras.INUSE = 1
                                            LEFT JOIN
                                       workflow_step_master current_wsm ON current_wsm.WORKFLOW_STEP_MASTER_ID = current_ras.WORKFLOW_STEP_MASTER_ID
                                            LEFT JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.MASTER_VENDOR_TYPES_ID = v.MASTER_VENDOR_TYPES_ID
                                            LEFT JOIN
                                       person.member_fed m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       rr.INUSE = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
                            GROUP BY
                                       rr.REQUEST_REGISTER_VENDOR_ID
                            ORDER BY
                                       dataItem.ORDER
                            LIMIT
                                       dataItem.LIMIT OFFSET dataItem.OFFSET
        `
    countSql = countSql.replaceAll('dataItem.SQLWHERECOLUMNFILTER', dataItem['SQLWHERECOLUMNFILTER'] || '')
    countSql = countSql.replaceAll('dataItem.SQLWHERE', dataItem['SQLWHERE'] || '')

    dataSql = dataSql.replaceAll('dataItem.SQLWHERECOLUMNFILTER', dataItem['SQLWHERECOLUMNFILTER'] || '')
    dataSql = dataSql.replaceAll('dataItem.SQLWHERE', dataItem['SQLWHERE'] || '')
    dataSql = dataSql.replaceAll('dataItem.ORDER', dataItem['ORDER'] || 'rr.REQUEST_REGISTER_VENDOR_ID DESC')
    dataSql = dataSql.replaceAll('dataItem.LIMIT', (dataItem['LIMIT'] || 50).toString())
    dataSql = dataSql.replaceAll('dataItem.OFFSET', (dataItem['OFFSET'] || 0).toString())

    return [countSql, dataSql]
  },

  getStatusOptions: async (_dataItem?: any) => {
    const sql = `
                            SELECT
                                       wsm.WORKFLOW_STEP_MASTER_ID AS workflowStepId
                                     , mrs.M_REQUEST_STATUS_ID AS statusId
                                     , mrs.STATUS_VALUE AS value
                                     , mrs.STATUS_VALUE AS label
                                     , wsm.STEP_CODE AS stepCode
                                     , wsm.ACTOR_TYPE AS actorType
                                     , wsm.DEFAULT_GROUP_CODE_LOCAL AS defaultGroupCodeLocal
                                     , wsm.DEFAULT_GROUP_CODE_OVERSEA AS defaultGroupCodeOversea
                                     , wsm.REQUIRES_VENDOR_REPLY AS requiresVendorReply
                                     , wsm.REQUIRES_VENDOR_CODE AS requiresVendorCode
                                     , wsm.DEFAULT_STEP_ORDER AS sortOrder
                            FROM
                                       workflow_step_master wsm
                                            INNER JOIN
                                       m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                            WHERE
                                       wsm.WORKFLOW_DEFINITION_ID = (
                                           SELECT WORKFLOW_DEFINITION_ID
                                           FROM workflow_definition
                                           WHERE WORKFLOW_CODE = 'VENDOR_REGISTRATION'
                                             AND INUSE = 1
                                           ORDER BY VERSION_NO DESC
                                           LIMIT 1
                                       )
                                       AND wsm.INUSE = 1
                                       AND mrs.INUSE = 1
                            ORDER BY
                                       wsm.DEFAULT_STEP_ORDER ASC
        `
    return sql
  },

  getRequestStatusAndAssign: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS
                                     , ASSIGN_TO
                            FROM
                                       request_register_vendor rr
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rr.INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getApprovalSteps: async (dataItem: any) => {
    let sql = `
                            SELECT 
                                       ras.REQUEST_APPROVAL_STEP_ID
                                     , ras.REQUEST_REGISTER_VENDOR_ID
                                     , ras.WORKFLOW_STEP_MASTER_ID
                                     , wsm.M_REQUEST_STATUS_ID AS M_REQUEST_STATUS_ID
                                     , ras.STEP_ORDER
                                     , ras.APPROVER_EMPCODE
                                     , ras.STEP_STATUS
                                     , mrs.STATUS_VALUE AS DESCRIPTION
                                     , wsm.STEP_CODE
                                     , wsm.ACTOR_TYPE
                                     , ras.GROUP_CODE
                                     , ras.ASSIGNMENT_MODE
                                     , ras.CREATE_BY
                                     , ras.CREATE_DATE
                                     , ras.UPDATE_BY
                                     , ras.UPDATE_DATE
                                     , ras.INUSE
                                     , mrs.STATUS_VALUE AS master_status_value
                                     , mrs.STATUS_VALUE AS master_status_label
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS approver_name
                            FROM
                                       request_approval_step ras
                                            INNER JOIN
                                       workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                                                           INNER JOIN
                                                                      m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                            LEFT JOIN
                                       person.member_fed m ON m.EMPCODE = ras.APPROVER_EMPCODE
                            WHERE
                                       ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND ras.INUSE = 1
                            ORDER BY
                                       ras.STEP_ORDER ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  updateRequest: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       SUPPORTPRODUCT_PROCESS = 'dataItem.SUPPORTPRODUCT_PROCESS'
                                     , PURCHASE_FREQUENCY = 'dataItem.PURCHASE_FREQUENCY'
                                     , REQUESTER_REMARK = 'dataItem.REQUESTER_REMARK'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID;

                            UPDATE request_register_vendor_contacts
                            SET
                                       IS_PRIMARY = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND dataItem.VENDOR_CONTACTS_ID > 0
                                       AND INUSE = 1;

                            INSERT INTO request_register_vendor_contacts (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , VENDOR_CONTACTS_ID
                                     , IS_PRIMARY
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            SELECT
                                       dataItem.REQUEST_REGISTER_VENDOR_ID
                                     , dataItem.VENDOR_CONTACTS_ID
                                     , 1
                                     , 'Primary vendor contact'
                                     , 'dataItem.UPDATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            WHERE dataItem.VENDOR_CONTACTS_ID > 0
                            ON DUPLICATE KEY UPDATE
                                       IS_PRIMARY = 1
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                                     , INUSE = 1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CONTACTS_ID', (dataItem['VENDOR_CONTACTS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.SUPPORTPRODUCT_PROCESS', dataItem['SUPPORTPRODUCT_PROCESS'] || '')
    sql = sql.replaceAll('dataItem.PURCHASE_FREQUENCY', dataItem['PURCHASE_FREQUENCY'] || '')
    sql = sql.replaceAll('dataItem.REQUESTER_REMARK', dataItem['REQUESTER_REMARK'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  createApprovalLog: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_approval_log (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , REQUEST_APPROVAL_STEP_ID
                                     , ACTION_BY
                                     , ACTION_BY_NAME
                                     , ACTION_TYPE
                                     , DESCRIPTION
                                     , REJECT_REASON
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , CREATE_DATE
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_REGISTER_VENDOR_ID
                                     ,  dataItem.REQUEST_APPROVAL_STEP_ID
                                     , 'dataItem.ACTION_BY'
                                     , COALESCE(
                                           (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME)
                                            FROM person.member_fed pm
                                            WHERE pm.EMPCODE = 'dataItem.ACTION_BY'
                                            LIMIT 1),
                                           'dataItem.ACTION_BY'
                                       )
                                     , 'dataItem.ACTION_TYPE'
                                     , LEFT('dataItem.REMARK', 100)
                                     , CASE
                                           WHEN LOWER('dataItem.ACTION_TYPE') IN ('rejected', 'vendor_disagreed') THEN LEFT('dataItem.REJECT_REASON', 500)
                                           ELSE NULL
                                       END
                                     , 'dataItem.ACTION_BY'
                                     , 'dataItem.ACTION_BY'
                                     , NOW()
                                     , NOW()
                                     , 1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', dataItem['REQUEST_APPROVAL_STEP_ID'] ? dataItem['REQUEST_APPROVAL_STEP_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.ACTION_BY', dataItem['ACTION_BY'])
    sql = sql.replaceAll('dataItem.ACTION_TYPE', dataItem['ACTION_TYPE'])
    sql = sql.replaceAll('dataItem.REMARK', dataItem['REMARK'])
    sql = sql.replaceAll('dataItem.REJECT_REASON', dataItem['REJECT_REASON'] ?? '')

    return sql
  },

  getApprovalLogs: async (dataItem: any) => {
    let sql = `
                            SELECT 
                                       ral.REQUEST_APPROVAL_LOG_ID
                                     , ral.REQUEST_REGISTER_VENDOR_ID
                                     , ral.REQUEST_APPROVAL_STEP_ID
                                     , ral.ACTION_BY
                                     , ral.ACTION_TYPE
                                     , ral.DESCRIPTION
                                     , ral.REJECT_REASON
                                     , ral.CREATE_DATE
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
                                       person.member_fed m ON m.EMPCODE = ral.ACTION_BY
                            WHERE
                                       ral.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND ral.INUSE = 1
                            ORDER BY
                                       ral.CREATE_DATE ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getRequestStatusContext: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.VENDORS_ID
                                     , rr.ASSIGN_TO
                                     , rr.REQUEST_NUMBER
                                     , rr.CREATE_DATE
                                     , rvs.PROPOSED_VENDOR_CODE AS VENDOR_CODE_SELECTOR
                                     ${GprCSelectionSqlSnippets.gprCSelectionFields('rvs', 'rr')}
                                     , rvs.GPR_43_ACCEPTANCE_STATUS
                                     , v.VENDOR_REGION
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rvs.INUSE = 1
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                            ORDER BY
                                       rvs.REQUEST_VENDOR_SELECTIONS_ID DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getRequesterByRequestId: (dataItem: any) => {
    let sql = `
                            SELECT
                                       REQUEST_BY_EMPLOYEECODE
                            FROM
                                       request_register_vendor
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    return sql
  },

  getApproverByGroupCode: async (dataItem: any) => {
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
                                       ASSIGNEES_TO_ID ASC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')

    return sql
  },

  getActiveAssigneeByEmpCodeAndGroupCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       ASSIGNEES_TO_ID
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

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'])
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'])
    sql = sql.replaceAll('dataItem.GROUP_COMPACT', dataItem['GROUP_COMPACT'])

    return sql
  },

  getSelection: (dataItem: any) => {
    let sql = `
                            SELECT * FROM
                                       request_vendor_selections
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = 'dataItem.REQUEST_REGISTER_VENDOR_ID' AND INUSE = 1
                            ORDER BY
                                       REQUEST_VENDOR_SELECTIONS_ID DESC
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    return sql
  },

  getCriteria: (dataItem: any) => {
    let sql = `
                            SELECT
                                       CRITERIA_NO AS no
                                     , CRITERIA_VALUE AS criteria
                                     , DESCRIPTION AS remark
                                     , UPLOADED_FILE_PATH AS uploaded_file
                                     , UPLOADED_FILE_NAME AS uploaded_name
                            FROM
                                       vendor_selection_criteria
                            WHERE
                                       REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                            ORDER BY
                                       VENDOR_SELECTION_CRITERIA_ID ASC
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem['REQUEST_VENDOR_SELECTIONS_ID'] || 0).toString())
    return sql
  },

  updateStatus: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       CURRENT_M_REQUEST_STATUS_ID = COALESCE(${RequestStatusSqlSnippets.requestStatusIdByValueExpr("'dataItem.REQUEST_STATUS'")}, CURRENT_M_REQUEST_STATUS_ID)
                                     , REQUEST_STATE = CASE
                                           WHEN LOWER('dataItem.REQUEST_STATUS') = 'completed' THEN 'completed'
                                           WHEN LOWER('dataItem.REQUEST_STATUS') IN ('rejected', 'vendor disagreed') THEN 'rejected'
                                           WHEN LOWER('dataItem.REQUEST_STATUS') IN ('cancelled', 'canceled') THEN 'cancelled'
                                           ELSE REQUEST_STATE
                                       END
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_STATUS', dataItem['REQUEST_STATUS'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  updateRequestVendorCode: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       APPROVED_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  updateVendorFftVendorCode: async (dataItem: any) => {
    let sql = `
                            UPDATE vendors SET
                                       FFT_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                            WHERE
                                       VENDORS_ID = dataItem.VENDORS_ID
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')

    return sql
  },

  updateVendorFftStatus: async (dataItem: any) => {
    let sql = `
                            UPDATE vendors SET
                                       FFT_STATUS = dataItem.FFT_STATUS
                            WHERE
                                       VENDORS_ID = dataItem.VENDORS_ID
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.FFT_STATUS', (dataItem['FFT_STATUS'] || 0).toString())

    return sql
  },

  updateApprovalStep: async (dataItem: any) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       STEP_STATUS = LOWER('dataItem.STEP_STATUS')
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID;

                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step changed_step
                              ON changed_step.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND active_step.STEP_STATUS = 'in_progress'
                             AND active_step.INUSE = 1
                            LEFT JOIN workflow_step_master active_wsm
                              ON active_wsm.WORKFLOW_STEP_MASTER_ID = active_step.WORKFLOW_STEP_MASTER_ID
                            LEFT JOIN m_request_status active_status
                              ON active_status.M_REQUEST_STATUS_ID = active_wsm.M_REQUEST_STATUS_ID
                            LEFT JOIN m_request_status rejected_status
                              ON rejected_status.STATUS_VALUE = 'Rejected'
                              OR rejected_status.STATUS_VALUE = 'Rejected'
                            SET
                                       rr.REQUEST_STATE = CASE
                                           WHEN LOWER('dataItem.STEP_STATUS') = 'rejected' THEN 'rejected'
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN 'in_progress'
                                           ELSE rr.REQUEST_STATE
                                       END
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID = CASE
                                           WHEN LOWER('dataItem.STEP_STATUS') = 'rejected' THEN changed_step.REQUEST_APPROVAL_STEP_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN active_step.REQUEST_APPROVAL_STEP_ID
                                           ELSE rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                       END
                                     , rr.CURRENT_M_REQUEST_STATUS_ID = CASE
                                           WHEN LOWER('dataItem.STEP_STATUS') = 'rejected' THEN rejected_status.M_REQUEST_STATUS_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN active_wsm.M_REQUEST_STATUS_ID
                                           ELSE rr.CURRENT_M_REQUEST_STATUS_ID
                                       END
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = changed_step.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', (dataItem['REQUEST_APPROVAL_STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_STATUS', dataItem['STEP_STATUS'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  updateApprovalStepApprover: async (dataItem: any) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'
                                     , ASSIGNMENT_MODE = 'dataItem.ASSIGNMENT_MODE'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', (dataItem['REQUEST_APPROVAL_STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', dataItem['APPROVER_EMPCODE'] || '')
    sql = sql.replaceAll('dataItem.ASSIGNMENT_MODE', dataItem['ASSIGNMENT_MODE'] || 'MANUAL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  markRequestCompleted: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       REQUEST_STATE = 'completed'
                                     , CURRENT_M_REQUEST_STATUS_ID = (
                                           SELECT M_REQUEST_STATUS_ID FROM workflow_step_master
                                           WHERE STEP_CODE = 'ACCOUNT_REGISTERED'
                                             AND INUSE = 1
                                           LIMIT 1
                                       )
                                     , CURRENT_REQUEST_APPROVAL_STEP_ID = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getById: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.REQUEST_REGISTER_VENDOR_ID
                                                                         , rr.REQUEST_NUMBER
                                     , rr.VENDORS_ID
                                     , ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS
                                     , rr.REQUEST_STATE
                                     , rr.CURRENT_M_REQUEST_STATUS_ID
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.REQUESTER_REMARK
                                     , ${RequestApprovalSummarySqlSnippets.latestApprovalRemarkExpr('rr.REQUEST_REGISTER_VENDOR_ID')} AS APPROVER_REMARK
                                     , (${RequestApprovalSummarySqlSnippets.latestRejectReasonExpr('rr.REQUEST_REGISTER_VENDOR_ID')}) AS REJECT_REASON
                                     , ${RequestApprovalSummarySqlSnippets.latestApprovalDateExpr('rr.REQUEST_REGISTER_VENDOR_ID')} AS APPROVE_DATE
                                     , rr.APPROVED_VENDOR_CODE AS VENDOR_CODE
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , ${RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')} AS VENDOR_CONTACTS_ID
                                     , rr.REQUEST_BY_EMPLOYEECODE AS EMPLOYEE_CODE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS FULL_NAME
                                     , m.EMPDEPT AS EMPLOYEE_DEPT
                                     , rr.CREATE_DATE
                                     , rvs.PROPOSED_VENDOR_CODE
                                     ${GprCSelectionSqlSnippets.gprCSelectionFields('rvs', 'rr')}
                                     , rvs.GPR_43_ACCEPTANCE_STATUS

                                     -- Vendor Info
                                     , v.COMPANY_NAME
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , v.VENDOR_REGION
                                     , v.PROVINCE
                                     , v.POSTAL_CODE
                                     , v.COUNTRY
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
                                                                      vc.VENDORS_ID = v.VENDORS_ID AND vc.INUSE = 1
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
                                                                      master_product_groups mpg ON mpg.MASTER_PRODUCT_GROUPS_ID = vp.MASTER_PRODUCT_GROUPS_ID
                                                           WHERE
                                                                      vp.VENDORS_ID = v.VENDORS_ID AND vp.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS products

                                     -- Documents (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                  'document_id', rrf.REQUEST_REGISTER_FILE_ID,
                                                  'file_name', rrf.FILE_NAME,
                                                  'file_path', rrf.FILE_PATH,
                                                  'file_size', rrf.FILE_SIZE,
                                                  'file_type', rrf.FILE_TYPE
                                                )
                                                                      )
                                                           FROM
                                                                      request_register_file rrf
                                                           WHERE
                                                                      rrf.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rrf.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS documents

                                     -- Approval Steps (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'REQUEST_APPROVAL_STEP_ID', ras.REQUEST_APPROVAL_STEP_ID,
                                                                               'M_REQUEST_STATUS_ID', wsm.M_REQUEST_STATUS_ID,
                                                                               'STEP_ORDER', ras.STEP_ORDER,
                                                                               'APPROVER_EMPCODE', ras.APPROVER_EMPCODE,
                                                                               'approver_name', (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM person.member_fed pm WHERE pm.EMPCODE = ras.APPROVER_EMPCODE LIMIT 1),
                                                                               'STEP_STATUS', ras.STEP_STATUS,
                                                                               'DESCRIPTION', mrs.STATUS_VALUE,
                                                                               'STEP_CODE', wsm.STEP_CODE,
                                                                               'ACTOR_TYPE', wsm.ACTOR_TYPE,
                                                                               'GROUP_CODE', ras.GROUP_CODE,
                                                                               'ASSIGNMENT_MODE', ras.ASSIGNMENT_MODE,
                                                                               'master_status_value', mrs.STATUS_VALUE,
                                                                               'master_status_label', mrs.STATUS_VALUE,
                                                                               'CREATE_DATE', ras.CREATE_DATE,
                                                                               'UPDATE_BY', ras.UPDATE_BY,
                                                                               'UPDATE_DATE', ras.UPDATE_DATE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_step ras
                                                                           INNER JOIN
                                                                      workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                                                           INNER JOIN
                                                                      m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                                           WHERE
                                                                      ras.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND ras.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_steps

                                     -- Approval Logs (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'REQUEST_APPROVAL_LOG_ID', ral.REQUEST_APPROVAL_LOG_ID,
                                                                               'REQUEST_APPROVAL_STEP_ID', ral.REQUEST_APPROVAL_STEP_ID,
                                                                               'ACTION_BY', ral.ACTION_BY,
                                                                               'ACTION_BY_NAME', COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM person.member_fed pm WHERE pm.EMPCODE = ral.ACTION_BY LIMIT 1)),
                                                                               'ACTION_TYPE', ral.ACTION_TYPE,
                                                                               'DESCRIPTION', ral.DESCRIPTION,
                                                                               'REJECT_REASON', ral.REJECT_REASON,
                                                                               'CREATE_DATE', ral.CREATE_DATE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_log ral
                                                           WHERE
                                                                      ral.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
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
                                                                      vendor_selection_criteria vsc ON vsc.REQUEST_VENDOR_SELECTIONS_ID = rvs2.REQUEST_VENDOR_SELECTIONS_ID
                                                           WHERE
                                                                      rvs2.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rvs2.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS gpr_criteria

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rvs.INUSE = 1
                                            LEFT JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.MASTER_VENDOR_TYPES_ID = v.MASTER_VENDOR_TYPES_ID
                                            LEFT JOIN
                                       person.member_fed m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rr.INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getAssigneeByEmpCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       ASSIGNEES_TO_ID
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

  updateRequestPicAssignee: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       ASSIGN_TO = 'dataItem.ASSIGN_TO'
                                     , PIC_EMAIL = 'dataItem.PIC_EMAIL'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.ASSIGN_TO', dataItem['ASSIGN_TO'])
    sql = sql.replaceAll('dataItem.PIC_EMAIL', dataItem['PIC_EMAIL'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  insertAssignmentHistory: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_assignment_history (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , REQUEST_APPROVAL_STEP_ID
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
                                        dataItem.REQUEST_REGISTER_VENDOR_ID
                                     ,  dataItem.REQUEST_APPROVAL_STEP_ID
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

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', dataItem['REQUEST_APPROVAL_STEP_ID'] ? dataItem['REQUEST_APPROVAL_STEP_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.SCOPE', dataItem['SCOPE'])
    sql = sql.replaceAll('dataItem.STEP_CODE', dataItem['STEP_CODE'])
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'])
    sql = sql.replaceAll('dataItem.FROM_EMPCODE', dataItem['FROM_EMPCODE'])
    sql = sql.replaceAll('dataItem.TO_EMPCODE', dataItem['TO_EMPCODE'])
    sql = sql.replaceAll('dataItem.REASON', dataItem['REASON'])
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'] || dataItem['REASON'])
    sql = sql.replaceAll('dataItem.CHANGED_BY', dataItem['CHANGED_BY'] || dataItem['UPDATE_BY'] || 'SYSTEM')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || dataItem['CHANGED_BY'] || dataItem['UPDATE_BY'] || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || dataItem['CHANGED_BY'] || 'SYSTEM')
    sql = sql.replaceAll('dataItem.INUSE', '1')

    return sql
  },

  completeRegistration: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       APPROVED_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                                     , REQUEST_STATE = 'completed'
                                     , CURRENT_M_REQUEST_STATUS_ID = (
                                           SELECT M_REQUEST_STATUS_ID FROM workflow_step_master
                                           WHERE STEP_CODE = 'ACCOUNT_REGISTERED'
                                             AND INUSE = 1
                                           LIMIT 1
                                       )
                                     , CURRENT_REQUEST_APPROVAL_STEP_ID = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },
}

