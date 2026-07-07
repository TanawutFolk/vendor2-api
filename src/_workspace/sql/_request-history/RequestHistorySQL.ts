import { GprCSelectionSqlSnippets } from '../_request-register/GprCSelectionSqlSnippets'
import { RequestVendorContactSqlSnippets } from '../_request-register/RequestVendorContactSqlSnippets'
import { RequestApprovalSummarySqlSnippets } from '../_request-register/RequestApprovalSummarySqlSnippets'
import { RequestStatusSqlSnippets } from '../_request-register/RequestStatusSqlSnippets'


export const RequestHistorySQL = {
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
                                                                               'M_REQUEST_STATUS_ID', wsm.M_REQUEST_STATUS_ID,
                                                                               'STEP_ORDER', ras.STEP_ORDER,
                                                                               'APPROVER_EMPCODE', ras.APPROVER_EMPCODE,
                                                                               'APPROVER_NAME', (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM person.member_fed pm WHERE pm.EMPCODE = ras.APPROVER_EMPCODE LIMIT 1),
                                                                               'STEP_STATUS', ras.STEP_STATUS,
                                                                               'DESCRIPTION', mrs.STATUS_VALUE,
                                                                               'STEP_CODE', wsm.STEP_CODE,
                                                                               'ACTOR_TYPE', wsm.ACTOR_TYPE,
                                                                               'GROUP_CODE', ras.GROUP_CODE,
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
                                                                               'ACTION_BY_NAME', COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM person.member_fed pm WHERE pm.EMPCODE = ral.ACTION_BY LIMIT 1)),
                                                                               'ACTION_TYPE', ral.ACTION_TYPE,
                                                                               'DESCRIPTION', ral.DESCRIPTION,
                                                                               'REJECT_REASON', ral.REJECT_REASON,
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
                                                                               'UPLOADED_FILE', vsc.UPLOADED_FILE_PATH,
                                                                               'UPLOADED_NAME', vsc.UPLOADED_FILE_NAME
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
                                     , mrs.STATUS_VALUE AS MASTER_STATUS_VALUE
                                     , mrs.STATUS_VALUE AS MASTER_STATUS_LABEL
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS APPROVER_NAME
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
                                     , COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), CONCAT(m.EMPNAME, ' ', m.EMPSURNAME)) AS ACTION_BY_NAME
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

