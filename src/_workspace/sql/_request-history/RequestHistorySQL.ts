import { GprCSelectionSqlSnippets } from '../common/GprCSelectionSqlSnippets'
import { RequestVendorContactSqlSnippets } from '../common/RequestVendorContactSqlSnippets'
import { RequestApprovalSummarySqlSnippets } from '../common/RequestApprovalSummarySqlSnippets'
import { RequestStatusSqlSnippets } from '../common/RequestStatusSqlSnippets'
import { PersonSqlSnippets } from '../common/PersonSqlSnippets'
import { MesProductSqlSnippets } from '../common/MesProductSqlSnippets'
import { RequestStateSqlSnippets } from '../_status-master/StatusMasterSQL'

export const RequestHistorySQL = {
  getById: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.REQUEST_REGISTER_VENDOR_ID
                                                                         , rr.REQUEST_NUMBER
                                     , rr.VENDORS_ID
                                     , dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS
                                     , rr.M_REQUEST_STATE_ID
                                     , dataItem.REQUEST_STATE_SQL AS REQUEST_STATE
                                     , rr.CURRENT_M_REQUEST_STATUS_ID
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.REQUESTER_REMARK
                                     , dataItem.LATEST_APPROVAL_REMARK_SQL AS APPROVER_REMARK
                                     , (dataItem.LATEST_REJECT_REASON_SQL) AS REJECT_REASON
                                     , dataItem.LATEST_APPROVAL_DATE_SQL AS APPROVE_DATE
                                     , rr.APPROVED_VENDOR_CODE AS VENDOR_CODE
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL AS VENDOR_CONTACTS_ID
                                     , rr.REQUEST_BY_EMPLOYEECODE AS EMPLOYEE_CODE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS FULL_NAME
                                     , m.EMPDEPT AS EMPLOYEE_DEPT
                                     , rr.REQUESTER_SECTION
                                     , rr.CREATE_DATE
                                     , YEAR(rr.CREATE_DATE) AS REQUEST_YEAR
                                     dataItem.GPR_C_SELECTION_FIELDS_SQL
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
                                     , vt.BUSINESS_CATEGORY_NAME AS VENDOR_TYPE_NAME

                                     -- Contacts (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'CONTACT_NAME', vc.CONTACT_NAME,
                                                                               'TEL_PHONE', vc.TEL_PHONE,
                                                                               'EMAIL', vc.EMAIL,
                                                                               'POSITION', vc.POSITION
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_contacts vc
                                                           WHERE
                                                                      vc.VENDORS_ID = v.VENDORS_ID AND vc.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS CONTACTS

                                     -- Products (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'PRODUCT_GROUP', mpg.GROUP_NAME,
                                                                               'MAKER_NAME', vp.MAKER_NAME,
                                                                               'PRODUCT_NAME', vp.PRODUCT_NAME,
                                                                               'MODEL_LIST', vp.MODEL_LIST
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
                                       ) AS PRODUCTS

                                     -- Documents (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                  'DOCUMENT_ID', rrf.REQUEST_REGISTER_FILE_ID,
                                                  'FILE_NAME', rrf.FILE_NAME,
                                                  'FILE_PATH', rrf.FILE_PATH,
                                                  'FILE_SIZE', rrf.FILE_SIZE,
                                                  'FILE_TYPE', rrf.FILE_TYPE
                                                )
                                                                      )
                                                           FROM
                                                                      request_register_file rrf
                                                           WHERE
                                                                      rrf.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rrf.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS DOCUMENTS

                                     -- Approval Steps (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'REQUEST_APPROVAL_STEP_ID', ras.REQUEST_APPROVAL_STEP_ID,
                                                                               'WORKFLOW_STEP_MASTER_ID', ras.WORKFLOW_STEP_MASTER_ID,
                                                                               'M_REQUEST_STATUS_ID', wsm.M_REQUEST_STATUS_ID,
                                                                                'STEP_ORDER', ras.STEP_ORDER,
                                                                                'APPROVER_EMPCODE', ras.APPROVER_EMPCODE,
                                                                                'APPROVAL_GROUP_MEMBER_ID', ras.APPROVAL_GROUP_MEMBER_ID,
                                                                               'APPROVER_NAME', COALESCE(
                                                                                 (SELECT agm.EMPNAME
                                                                                  FROM approval_group_member agm
                                                                                  WHERE agm.APPROVAL_GROUP_MEMBER_ID = ras.APPROVAL_GROUP_MEMBER_ID
                                                                                  LIMIT 1),
                                                                                 ras.APPROVER_EMPCODE
                                                                               ),
                                                                                'M_APPROVAL_STEP_STATUS_ID', ras.M_APPROVAL_STEP_STATUS_ID,
                                                                                'STEP_STATUS', LOWER(task_status.STATUS_CODE),
                                                                               'DESCRIPTION', mrs.STATUS_VALUE,
                                                                               'STEP_CODE', wsm.STEP_CODE,
                                                                               'ACTOR_TYPE', wsm.ACTOR_TYPE,
                                                                                'APPROVAL_GROUP_ID', ras.APPROVAL_GROUP_ID,
                                                                                'GROUP_CODE', task_group.GROUP_CODE,
                                                                               'ASSIGNMENT_MODE', ras.ASSIGNMENT_MODE,
                                                                               'MASTER_STATUS_VALUE', mrs.STATUS_VALUE,
                                                                               'MASTER_STATUS_LABEL', mrs.STATUS_VALUE,
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
                                                                            INNER JOIN
                                                                       m_approval_step_status task_status
                                                                         ON task_status.M_APPROVAL_STEP_STATUS_ID = ras.M_APPROVAL_STEP_STATUS_ID
                                                                            LEFT JOIN
                                                                       approval_group task_group
                                                                         ON task_group.APPROVAL_GROUP_ID = ras.APPROVAL_GROUP_ID
                                                           WHERE
                                                                      ras.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND ras.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS APPROVAL_STEPS

                                     -- Approval Logs (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'REQUEST_APPROVAL_LOG_ID', ral.REQUEST_APPROVAL_LOG_ID,
                                                                               'REQUEST_APPROVAL_STEP_ID', ral.REQUEST_APPROVAL_STEP_ID,
                                                                               'ACTION_BY', ral.ACTION_BY,
                                                                               'ACTION_BY_NAME', COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), ral.ACTION_BY),
                                                                               'ACTION_TYPE', ral.ACTION_TYPE,
                                                                               'DESCRIPTION', ral.DESCRIPTION,
                                                                               'REJECT_REASON', ral.REJECT_REASON,
                                                                               'RECHECK_REASON', ral.RECHECK_REASON,
                                                                               'CREATE_DATE', ral.CREATE_DATE,
                                                                               'CREATE_BY', ral.CREATE_BY,
                                                                               'UPDATE_BY', ral.UPDATE_BY,
                                                                               'UPDATE_DATE', ral.UPDATE_DATE,
                                                                               'INUSE', ral.INUSE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_log ral
                                                           WHERE
                                                                      ral.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                                                                      AND ral.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS APPROVAL_LOGS

                                     -- GPR Criteria (inline JSON for pass/fail evaluation)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'NO', vsc.CRITERIA_NO,
                                                                               'CRITERIA', vsc.CRITERIA_VALUE,
                                                                               'UPLOADED_FILE', (
                                                                                   SELECT vscf.FILE_PATH
                                                                                   FROM vendor_selection_criteria_files vscf
                                                                                   WHERE vscf.VENDOR_SELECTION_CRITERIA_ID = vsc.VENDOR_SELECTION_CRITERIA_ID
                                                                                     AND vscf.INUSE = 1
                                                                                   ORDER BY vscf.FILE_ORDER ASC
                                                                                   LIMIT 1
                                                                               ),
                                                                               'UPLOADED_NAME', (
                                                                                   SELECT vscf.FILE_NAME
                                                                                   FROM vendor_selection_criteria_files vscf
                                                                                   WHERE vscf.VENDOR_SELECTION_CRITERIA_ID = vsc.VENDOR_SELECTION_CRITERIA_ID
                                                                                     AND vscf.INUSE = 1
                                                                                   ORDER BY vscf.FILE_ORDER ASC
                                                                                   LIMIT 1
                                                                               ),
                                                                               'FILES', (
                                                                                   SELECT COALESCE(
                                                                                       JSON_ARRAYAGG(JSON_OBJECT(
                                                                                           'CRITERIA_FILE_ID', vscf.VENDOR_SELECTION_CRITERIA_FILE_ID,
                                                                                           'FILE_ORDER', vscf.FILE_ORDER,
                                                                                           'FILE_PATH', vscf.FILE_PATH,
                                                                                           'FILE_NAME', vscf.FILE_NAME,
                                                                                           'FILE_SIZE', vscf.FILE_SIZE,
                                                                                           'FILE_TYPE', vscf.FILE_TYPE
                                                                                       )),
                                                                                       JSON_ARRAY()
                                                                                   )
                                                                                   FROM vendor_selection_criteria_files vscf
                                                                                   WHERE vscf.VENDOR_SELECTION_CRITERIA_ID = vsc.VENDOR_SELECTION_CRITERIA_ID
                                                                                     AND vscf.INUSE = 1
                                                                               )
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_vendor_selections rvs2
                                                                           JOIN
                                                                      vendor_selection_criteria vsc ON vsc.REQUEST_VENDOR_SELECTIONS_ID = rvs2.REQUEST_VENDOR_SELECTIONS_ID
                                                           WHERE
                                                                      rvs2.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                                                                      AND rvs2.INUSE = 1
                                                                      AND vsc.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS GPR_CRITERIA

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rvs.INUSE = 1
                                            LEFT JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       info_business_category vt ON vt.BUSINESS_CATEGORY_ID = v.BUSINESS_CATEGORY_ID
                                            LEFT JOIN
                                       dataItem.MEMBER_TABLE m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rr.INUSE = 1
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    sql = sql.replaceAll('dataItem.REQUEST_STATE_SQL', String(RequestStateSqlSnippets.requestStateCodeExpr('rr')))
    sql = sql.replaceAll('dataItem.LATEST_APPROVAL_REMARK_SQL', String(RequestApprovalSummarySqlSnippets.latestApprovalRemarkExpr('rr.REQUEST_REGISTER_VENDOR_ID')))
    sql = sql.replaceAll('dataItem.LATEST_REJECT_REASON_SQL', String(RequestApprovalSummarySqlSnippets.latestRejectReasonExpr('rr.REQUEST_REGISTER_VENDOR_ID')))
    sql = sql.replaceAll('dataItem.LATEST_APPROVAL_DATE_SQL', String(RequestApprovalSummarySqlSnippets.latestApprovalDateExpr('rr.REQUEST_REGISTER_VENDOR_ID')))
    sql = sql.replaceAll('dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL', String(RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')))
    sql = sql.replaceAll('dataItem.GPR_C_SELECTION_FIELDS_SQL', String(GprCSelectionSqlSnippets.gprCSelectionFields('rvs', 'rr')))
    sql = sql.replaceAll('dataItem.MEMBER_TABLE', String(PersonSqlSnippets.memberTable()))

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
                                     , ras.APPROVAL_GROUP_MEMBER_ID
                                     , ras.M_APPROVAL_STEP_STATUS_ID
                                     , LOWER(task_status.STATUS_CODE) AS STEP_STATUS
                                     , mrs.STATUS_VALUE AS DESCRIPTION
                                     , wsm.STEP_CODE
                                     , wsm.ACTOR_TYPE
                                     , ras.APPROVAL_GROUP_ID
                                     , task_group.GROUP_CODE
                                     , task_group.GROUP_NAME
                                     , ras.ASSIGNMENT_MODE
                                     , ras.CREATE_BY
                                     , ras.CREATE_DATE
                                     , ras.UPDATE_BY
                                     , ras.UPDATE_DATE
                                     , ras.INUSE
                                     , mrs.STATUS_VALUE AS MASTER_STATUS_VALUE
                                     , mrs.STATUS_VALUE AS MASTER_STATUS_LABEL
                                     , COALESCE(task_member.EMPNAME, ras.APPROVER_EMPCODE) AS APPROVER_NAME
                            FROM
                                       request_approval_step ras
                                            INNER JOIN
                                       workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                                                           INNER JOIN
                                                                       m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                            INNER JOIN
                                       m_approval_step_status task_status
                                         ON task_status.M_APPROVAL_STEP_STATUS_ID = ras.M_APPROVAL_STEP_STATUS_ID
                                            LEFT JOIN
                                       approval_group task_group
                                         ON task_group.APPROVAL_GROUP_ID = ras.APPROVAL_GROUP_ID
                                            LEFT JOIN
                                       approval_group_member task_member
                                         ON task_member.APPROVAL_GROUP_MEMBER_ID = ras.APPROVAL_GROUP_MEMBER_ID
                            WHERE
                                       ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND ras.INUSE = 1
                            ORDER BY
                                       ras.STEP_ORDER ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

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
                                     , ral.RECHECK_REASON
                                     , ral.CREATE_DATE
                                     , ral.DESCRIPTION
                                     , ral.CREATE_BY
                                     , ral.UPDATE_BY
                                     , ral.CREATE_DATE
                                     , ral.UPDATE_DATE
                                     , ral.INUSE
                                     , COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), ral.ACTION_BY) AS ACTION_BY_NAME
                            FROM
                                       request_approval_log ral
                            WHERE
                                       ral.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND ral.INUSE = 1
                            ORDER BY
                                       ral.CREATE_DATE ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getGprCProducts: (dataItem: any) => {
    let sql = `
                            SELECT
                                       pm.PRODUCT_MAIN_ID
                                     , pm.PRODUCT_MAIN_NAME
                                     , pm.PRODUCT_MAIN_ALPHABET
                            FROM
                                       dataItem.PRODUCT_MAIN_TABLE pm
                            WHERE
                                       pm.INUSE = 1
                                       AND (
                                              'dataItem.SEARCH_TEXT' = ''
                                              OR pm.PRODUCT_MAIN_NAME LIKE '%dataItem.SEARCH_TEXT%'
                                              OR pm.PRODUCT_MAIN_ALPHABET LIKE '%dataItem.SEARCH_TEXT%'
                                              OR CONCAT(
                                                    TRIM(pm.PRODUCT_MAIN_NAME),
                                                    ' (',
                                                    TRIM(pm.PRODUCT_MAIN_ALPHABET),
                                                    ')'
                                                 ) LIKE '%dataItem.SEARCH_TEXT%'
                                       )
                            ORDER BY
                                       pm.PRODUCT_MAIN_NAME ASC
                                     , pm.PRODUCT_MAIN_ALPHABET ASC
                            LIMIT 100
        `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_TABLE', MesProductSqlSnippets.productMainTable())
    sql = sql.replaceAll(
      'dataItem.SEARCH_TEXT',
      String(dataItem.SEARCH_TEXT || '')
        .trim()
        .replaceAll("'", "''")
    )
    return sql
  },

  getGprCSections: (dataItem: any) => {
    let sql = `
                            SELECT DISTINCT
                                       TRIM(section_master.SECT_NAME) AS SECT_NAME
                            FROM
                                       dataItem.SECTION_TABLE section_master
                            WHERE
                                       NULLIF(TRIM(section_master.SECT_NAME), '') IS NOT NULL
                                       AND (
                                              'dataItem.SEARCH_TEXT' = ''
                                              OR section_master.SECT_NAME LIKE '%dataItem.SEARCH_TEXT%'
                                       )
                            ORDER BY
                                       SECT_NAME ASC
                            LIMIT 200
        `
    sql = sql.replaceAll('dataItem.SECTION_TABLE', PersonSqlSnippets.sectionTable())
    sql = sql.replaceAll(
      'dataItem.SEARCH_TEXT',
      String(dataItem.SEARCH_TEXT || '')
        .trim()
        .replaceAll("'", "''")
    )
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
}
