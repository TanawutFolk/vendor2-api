import { GprCSelectionSqlSnippets } from './GprCSelectionSqlSnippets'
import { RequestVendorContactSqlSnippets } from './RequestVendorContactSqlSnippets'
import { RequestStatusSqlSnippets } from './RequestStatusSqlSnippets'


export const RequestRegisterPageSQL = {
  getVendorCreateContext: async (dataItem: any) => {
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
                                       vendor_contacts vc ON vc.VENDORS_ID = v.VENDORS_ID
                                            AND vc.INUSE = 1
                                            AND COALESCE(vc.EMAIL, '') != ''
                            WHERE
                                       v.VENDORS_ID = dataItem.VENDORS_ID
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())

    return sql
  },

  getActiveAssigneesByGroupCode: async (dataItem: any) => {
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
                                       ASSIGNEES_TO_ID ASC
        `

    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')

    return sql
  },

  getLastAssignedPicByVendorRegion: async (dataItem: any) => {
    const isOversea = String(dataItem['IS_OVERSEA'] || '').toLowerCase() === 'true' || Number(dataItem['IS_OVERSEA']) === 1

    const vendorRegionClause = isOversea ? `= 'Oversea'` : `!= 'Oversea' OR v.VENDOR_REGION IS NULL`

    let sql = `
                            SELECT
                                       rr.ASSIGN_TO
                            FROM
                                       request_register_vendor rr
                                            JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                            WHERE
                                       (v.VENDOR_REGION dataItem.VENDORREGIONCLAUSE)
                                       AND rr.ASSIGN_TO IS NOT NULL
                                       AND rr.ASSIGN_TO != ''
                            ORDER BY
                                       rr.REQUEST_REGISTER_VENDOR_ID DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.VENDORREGIONCLAUSE', vendorRegionClause)

    return sql
  },

  updateRequestNumber: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       REQUEST_NUMBER = 'dataItem.REQUEST_NUMBER'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_NUMBER', dataItem['REQUEST_NUMBER'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getNextRequestRunningNumber: async (dataItem: any) => {
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

  getRequestStatusAndAssign: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS
                                     , REQUEST_STATE
                                     , CURRENT_M_REQUEST_STATUS_ID
                                     , CURRENT_REQUEST_APPROVAL_STEP_ID
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

  getRequestVendorRegion: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       v.VENDOR_REGION
                            FROM
                                       request_register_vendor rr
                                            INNER JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rr.INUSE = 1
                            LIMIT 1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getPeerCcRowsByNormalizedGroup: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       EMPCODE AS empcode
                                     , EMPNAME AS empName
                                     , EMPEMAIL AS empEmail
                                     , GROUP_CODE AS group_code
                                     , GROUP_NAME AS group_name
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
                                       ASSIGNEES_TO_ID ASC
        `

    sql = sql.replaceAll('dataItem.TARGET_GROUP', dataItem['TARGET_GROUP'] || '')
    sql = sql.replaceAll('dataItem.TARGET_COMPACT', dataItem['TARGET_COMPACT'] || '')

    return sql
  },

  getMemberByEmpCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       m.EMPNAME
                                     , m.EMPSURNAME
                                     , m.EMPEMAIL
                                     , ec.EXT AS EMP_TEL
                            FROM
                                       person.member_fed m
                            LEFT JOIN
                                       employee_contacts ec ON m.EMPCODE = ec.EMP_CODE AND ec.INUSE = 1
                            WHERE
                                       m.EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getAssigneeByEmpCodeContact: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       a.EMPNAME
                                     , a.EMPEMAIL
                                     , ec.EXT AS EMP_TEL
                            FROM
                                       assignees_to a
                            LEFT JOIN
                                       employee_contacts ec ON a.EMPCODE = ec.EMP_CODE AND ec.INUSE = 1
                            WHERE
                                       a.EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getAssigneeEmailByEmpCode: async (dataItem: any) => {
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

  getNotificationVendorContextByRequestId: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.REQUEST_NUMBER
                                     , rr.CREATE_DATE
                                     , rr.ASSIGN_TO
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , ${RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')} AS VENDOR_CONTACTS_ID
                                     , rr.REQUEST_BY_EMPLOYEECODE
                                     , rr.APPROVED_VENDOR_CODE AS VENDOR_CODE
                                     ${GprCSelectionSqlSnippets.gprCSelectionFields('rvs', 'rr')}
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
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rvs.INUSE = 1
                                            LEFT JOIN
                                       vendor_contacts vc ON vc.VENDORS_ID = v.VENDORS_ID
                                            LEFT JOIN
                                       vendor_contacts vc_sel ON vc_sel.VENDOR_CONTACTS_ID = ${RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')} AND vc_sel.INUSE = 1
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                            ORDER BY
                                       CASE
                                           WHEN COALESCE(vc_sel.EMAIL, '') != '' THEN 0
                                           WHEN COALESCE(v.EMAILMAIN, '') != '' THEN 1
                                           WHEN COALESCE(vc.EMAIL, '') != '' THEN 2
                                           ELSE 3
                                       END ASC
                                     , vc.VENDOR_CONTACTS_ID ASC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  createRequest: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_register_vendor (
                                       VENDORS_ID
                                     , REQUEST_BY_EMPLOYEECODE
                                     , SUPPORTPRODUCT_PROCESS
                                     , PURCHASE_FREQUENCY
                                     , CURRENT_M_REQUEST_STATUS_ID
                                     , REQUESTER_REMARK
                                     , ASSIGN_TO
                                     , PIC_EMAIL
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.VENDORS_ID
                                     , 'dataItem.REQUEST_BY_EMPLOYEECODE'
                                     , 'dataItem.SUPPORTPRODUCT_PROCESS'
                                     , 'dataItem.PURCHASE_FREQUENCY'
                                     , COALESCE(${RequestStatusSqlSnippets.requestStatusIdByValueExpr("'dataItem.REQUEST_STATUS'")}, (
                                           SELECT wsm.M_REQUEST_STATUS_ID
                                           FROM workflow_step_master wsm
                                           WHERE wsm.STEP_CODE = 'REQUEST_SUBMITTED'
                                             AND wsm.INUSE = 1
                                           LIMIT 1
                                       ))
                                     , 'dataItem.REQUESTER_REMARK'
                                     , 'dataItem.ASSIGN_TO'
                                     , 'dataItem.PIC_EMAIL'
                                     , LEFT('dataItem.REQUESTER_REMARK', 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
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

  checkExistingActiveRequestByVendorRequester: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       REQUEST_REGISTER_VENDOR_ID
                                     , REQUEST_NUMBER
                                     , ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS
                            FROM
                                       request_register_vendor rr
                            WHERE
                                       rr.VENDORS_ID = dataItem.VENDORS_ID
                                       AND rr.REQUEST_BY_EMPLOYEECODE = 'dataItem.REQUEST_BY_EMPLOYEECODE'
                                       AND rr.INUSE = 1
                                       AND rr.REQUEST_STATE = 'in_progress'
                            ORDER BY
                                       rr.REQUEST_REGISTER_VENDOR_ID DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_BY_EMPLOYEECODE', dataItem['REQUEST_BY_EMPLOYEECODE'] || '')

    return sql
  },

  createRequestVendorContact: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_register_vendor_contacts (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , VENDOR_CONTACTS_ID
                                     , IS_PRIMARY
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_REGISTER_VENDOR_ID
                                     ,  dataItem.VENDOR_CONTACTS_ID
                                     ,  dataItem.IS_PRIMARY
                                     , 'Vendor contact for request'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CONTACTS_ID', (dataItem['VENDOR_CONTACTS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.IS_PRIMARY', (dataItem['IS_PRIMARY'] || 0).toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || dataItem['UPDATE_BY'] || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || dataItem['CREATE_BY'] || 'SYSTEM')

    return sql
  },

  getRequestVendorContactsByRequestId: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rrvc.VENDOR_CONTACTS_ID
                                     , rrvc.IS_PRIMARY
                                     , vc.CONTACT_NAME
                                     , vc.EMAIL
                                     , vc.TEL_PHONE
                                     , vc.POSITION
                            FROM
                                       request_register_vendor_contacts rrvc
                                            JOIN
                                       vendor_contacts vc ON vc.VENDOR_CONTACTS_ID = rrvc.VENDOR_CONTACTS_ID
                            WHERE
                                       rrvc.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rrvc.INUSE = 1
                                       AND vc.INUSE = 1
                            ORDER BY
                                       rrvc.IS_PRIMARY DESC
                                     , rrvc.VENDOR_CONTACTS_ID ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  createDocument: async (dataItem: any) => {
    const requestId = Number(dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0)
    if (!requestId || Number.isNaN(requestId)) {
      throw new Error(`Invalid REQUEST_REGISTER_VENDOR_ID for createDocument: ${String(dataItem['REQUEST_REGISTER_VENDOR_ID'])}`)
    }

    let sql = `
                            INSERT INTO request_register_file (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , FILE_NAME
                                     , FILE_PATH
                                     , FILE_SIZE
                                     , FILE_TYPE
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_REGISTER_VENDOR_ID
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

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', requestId.toString())
    sql = sql.replaceAll('dataItem.FILE_NAME', dataItem['FILE_NAME'])
    sql = sql.replaceAll('dataItem.FILE_PATH', dataItem['FILE_PATH'])
    sql = sql.replaceAll('dataItem.FILE_SIZE', (dataItem['FILE_SIZE'] || 0).toString())
    sql = sql.replaceAll('dataItem.FILE_TYPE', dataItem['FILE_TYPE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

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

  getStatusByStepCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       wsm.WORKFLOW_STEP_MASTER_ID
                                     , mrs.M_REQUEST_STATUS_ID
                                     , mrs.STATUS_VALUE
                                     , wsm.STEP_CODE
                                     , wsm.ACTOR_TYPE
                                     , wsm.DEFAULT_GROUP_CODE_LOCAL
                                     , wsm.DEFAULT_GROUP_CODE_OVERSEA
                                     , wsm.REQUIRES_VENDOR_REPLY
                                     , wsm.REQUIRES_VENDOR_CODE
                            FROM
                                       workflow_definition wd
                                            INNER JOIN
                                       workflow_step_master wsm ON wsm.WORKFLOW_DEFINITION_ID = wd.WORKFLOW_DEFINITION_ID
                                            INNER JOIN
                                       m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                            WHERE
                                       wd.WORKFLOW_CODE = 'VENDOR_REGISTRATION'
                                       AND wsm.STEP_CODE = 'dataItem.STEP_CODE'
                                       AND wd.INUSE = 1
                                       AND wsm.INUSE = 1
                                       AND mrs.INUSE = 1
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
                                     , INFO_CURRENCY_ID
                            FROM
                                       info_currency
                            ORDER BY
                                       CURRENCY_NAME ASC
        `
  },

  createApprovalStep: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_approval_step (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , WORKFLOW_STEP_MASTER_ID
                                     , STEP_ORDER
                                     , APPROVER_EMPCODE
                                     , STEP_STATUS
                                     , GROUP_CODE
                                     , ASSIGNMENT_MODE
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_REGISTER_VENDOR_ID
                                     ,  dataItem.WORKFLOW_STEP_MASTER_ID
                                     ,  dataItem.STEP_ORDER
                                     , 'dataItem.APPROVER_EMPCODE'
                                     , 'dataItem.STEP_STATUS'
                                     , 'dataItem.GROUP_CODE'
                                     , 'dataItem.ASSIGNMENT_MODE'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_MASTER_ID', (dataItem['WORKFLOW_STEP_MASTER_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_ORDER', (dataItem['STEP_ORDER'] || 0).toString())
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', dataItem['APPROVER_EMPCODE'] || '')
    sql = sql.replaceAll('dataItem.STEP_STATUS', dataItem['STEP_STATUS'] || '')
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')
    sql = sql.replaceAll('dataItem.ASSIGNMENT_MODE', dataItem['ASSIGNMENT_MODE'] || 'AUTO')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

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

  syncRequestWorkflowState: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND active_step.STEP_STATUS = 'in_progress'
                             AND active_step.INUSE = 1
                            LEFT JOIN workflow_step_master active_wsm
                              ON active_wsm.WORKFLOW_STEP_MASTER_ID = active_step.WORKFLOW_STEP_MASTER_ID
                            LEFT JOIN m_request_status active_status
                              ON active_status.M_REQUEST_STATUS_ID = active_wsm.M_REQUEST_STATUS_ID
                            SET
                                       rr.CURRENT_REQUEST_APPROVAL_STEP_ID = active_step.REQUEST_APPROVAL_STEP_ID
                                     , rr.CURRENT_M_REQUEST_STATUS_ID = active_wsm.M_REQUEST_STATUS_ID
                                     , rr.REQUEST_STATE = CASE
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NULL THEN rr.REQUEST_STATE
                                           ELSE 'in_progress'
                                       END
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

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
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND active_step.STEP_STATUS = 'in_progress'
                             AND active_step.INUSE = 1
                            LEFT JOIN workflow_step_master active_wsm
                              ON active_wsm.WORKFLOW_STEP_MASTER_ID = active_step.WORKFLOW_STEP_MASTER_ID
                            LEFT JOIN m_request_status active_status
                              ON active_status.M_REQUEST_STATUS_ID = active_wsm.M_REQUEST_STATUS_ID
                            SET
                                       rr.CURRENT_REQUEST_APPROVAL_STEP_ID = COALESCE(active_step.REQUEST_APPROVAL_STEP_ID, rr.CURRENT_REQUEST_APPROVAL_STEP_ID)
                                     , rr.CURRENT_M_REQUEST_STATUS_ID = COALESCE(active_wsm.M_REQUEST_STATUS_ID, rr.CURRENT_M_REQUEST_STATUS_ID)
                                     , rr.REQUEST_STATE = CASE
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NULL THEN rr.REQUEST_STATE
                                           ELSE 'in_progress'
                                       END
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', (dataItem['REQUEST_APPROVAL_STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_STATUS', dataItem['STEP_STATUS'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

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
    sql = sql.replaceAll('dataItem.ACTION_BY', dataItem['ACTION_BY'] || '')
    sql = sql.replaceAll('dataItem.ACTION_TYPE', dataItem['ACTION_TYPE'] || '')
    sql = sql.replaceAll('dataItem.REMARK', dataItem['REMARK'] || '')
    sql = sql.replaceAll('dataItem.REJECT_REASON', dataItem['REJECT_REASON'] ?? dataItem['REMARK'] ?? '')

    return sql
  },

  updateCcEmails: async (_dataItem: any) => {
    return `SELECT 1 AS noop`
  },

  getSelection: (dataItem: any) => {
    let sql = `
                            SELECT
                                       rvs.*
                                     , bc.BUSINESS_CATEGORY_NAME AS BUSINESS_CATEGORY
                                     , ic.CURRENCY_NAME AS CURRENCY
                                     , rvs.PROPOSED_VENDOR_CODE AS VENDOR_CODE_SELECTOR
                            FROM
                                       request_vendor_selections rvs
                                            LEFT JOIN
                                       business_category bc ON bc.BUSINESS_CATEGORY_ID = rvs.BUSINESS_CATEGORY_ID AND bc.INUSE = 1
                                            LEFT JOIN
                                       info_currency ic ON ic.INFO_CURRENCY_ID = rvs.INFO_CURRENCY_ID
                            WHERE
                                       rvs.REQUEST_REGISTER_VENDOR_ID = 'dataItem.REQUEST_REGISTER_VENDOR_ID' AND rvs.INUSE = 1
                            ORDER BY
                                       rvs.REQUEST_VENDOR_SELECTIONS_ID DESC
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    return sql
  },

  getFinancials: (dataItem: any) => {
    let sql = `
                            SELECT
                                       YEAR
                                     , TOTAL_REVENUE
                                     , NET_PROFIT
                            FROM
                                       vendor_selection_financials
                            WHERE
                                       REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                       AND INUSE = 1
                            ORDER BY
                                       YEAR ASC
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem['REQUEST_VENDOR_SELECTIONS_ID'] || 0).toString())
    return sql
  },

  getCriteria: (dataItem: any) => {
    let sql = `
                            SELECT
                                       CRITERIA_NO AS no
                                     , CRITERIA_VALUE AS criteria
                                     , DESCRIPTION AS remark
                                     , REJECT_REASON AS reject_reason
                                     , UPLOADED_FILE_PATH AS uploaded_file
                                     , UPLOADED_FILE_NAME AS uploaded_name
                            FROM
                                       vendor_selection_criteria
                            WHERE
                                       REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                       AND INUSE = 1
                            ORDER BY
                                       VENDOR_SELECTION_CRITERIA_ID ASC
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem['REQUEST_VENDOR_SELECTIONS_ID'] || 0).toString())
    return sql
  },

  getCriteriaFileForDelete: (dataItem: any) => {
    let sql = `
                            SELECT
                                       rvs.REQUEST_VENDOR_SELECTIONS_ID
                                     , vsc.CRITERIA_NO
                                     , vsc.UPLOADED_FILE_PATH
                                     , vsc.UPLOADED_FILE_NAME
                            FROM
                                       request_vendor_selections rvs
                            INNER JOIN
                                       vendor_selection_criteria vsc
                                    ON vsc.REQUEST_VENDOR_SELECTIONS_ID = rvs.REQUEST_VENDOR_SELECTIONS_ID
                                   AND vsc.INUSE = 1
                            WHERE
                                       rvs.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rvs.INUSE = 1
                                       AND vsc.CRITERIA_NO = 'dataItem.CRITERIA_NO'
                            ORDER BY
                                       rvs.REQUEST_VENDOR_SELECTIONS_ID DESC
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CRITERIA_NO', dataItem['CRITERIA_NO'] || '')
    return sql
  },

  clearCriteriaUploadedFile: (dataItem: any) => {
    let sql = `
                            UPDATE
                                       vendor_selection_criteria
                            SET
                                       UPLOADED_FILE_PATH = NULL
                                     , UPLOADED_FILE_NAME = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                       AND CRITERIA_NO = 'dataItem.CRITERIA_NO'
                                       AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem['REQUEST_VENDOR_SELECTIONS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CRITERIA_NO', dataItem['CRITERIA_NO'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')
    return sql
  },

  checkSelectionExists: (dataItem: any) => {
    let sql = `
                            SELECT
                                       REQUEST_VENDOR_SELECTIONS_ID
                            FROM
                                       request_vendor_selections 
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = 'dataItem.REQUEST_REGISTER_VENDOR_ID'
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

  insertSelection: (dataItem: any) => {
    let sql = `
                            INSERT INTO request_vendor_selections (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , BUSINESS_CATEGORY_ID
                                     , START_YEAR
                                     , AUTHORIZED_CAPITAL
                                     , ESTABLISH_YEARS
                                     , NUMBER_OF_EMPLOYEES
                                     , MANUFACTURED_COUNTRY
                                     , VENDOR_ORIGINAL_COUNTRY
                                     , SANCTIONS_STATUS
                                     , INFO_CURRENCY_ID
                                     , SUGGESTION
                                     , RESULT_STATUS
                                     , DOCUMENT_PATH
                                     , PROPOSED_VENDOR_CODE
                                     , GPR_43_ACCEPTANCE_STATUS
                                     , COMPLETION_DATE
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                       'dataItem.REQUEST_REGISTER_VENDOR_ID'
                                     , (SELECT BUSINESS_CATEGORY_ID FROM business_category
                                        WHERE BUSINESS_CATEGORY_NAME = 'dataItem.BUSINESS_CATEGORY' AND INUSE = 1 LIMIT 1)
                                     , 'dataItem.START_YEAR'
                                     , 'dataItem.AUTHORIZED_CAPITAL'
                                     , 'dataItem.ESTABLISH'
                                     , 'dataItem.NUMBER_OF_EMPLOYEES'
                                     , 'dataItem.MANUFACTURED_COUNTRY'
                                     , 'dataItem.VENDOR_ORIGINAL_COUNTRY'
                                     , 'dataItem.SANCTIONS'
                                     , (SELECT INFO_CURRENCY_ID FROM info_currency
                                        WHERE CURRENCY_NAME = 'dataItem.CURRENCY' LIMIT 1)
                                     , 'dataItem.SUGGESTION'
                                     , 'dataItem.RESULT'
                                     , 'dataItem.PATH'
                                     , NULLIF('dataItem.VENDOR_CODE_SELECTOR', '')
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

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', d['REQUEST_REGISTER_VENDOR_ID'])
    sql = sql.replaceAll('dataItem.BUSINESS_CATEGORY', d['BUSINESS_CATEGORY'])
    sql = sql.replaceAll('dataItem.START_YEAR', d['START_YEAR'])
    sql = sql.replaceAll('dataItem.AUTHORIZED_CAPITAL', d['AUTHORIZED_CAPITAL'])
    sql = sql.replaceAll('dataItem.ESTABLISH', d['ESTABLISH'])
    sql = sql.replaceAll('dataItem.NUMBER_OF_EMPLOYEES', d['NUMBER_OF_EMPLOYEES'])
    sql = sql.replaceAll('dataItem.MANUFACTURED_COUNTRY', d['MANUFACTURED_COUNTRY'])
    sql = sql.replaceAll('dataItem.VENDOR_ORIGINAL_COUNTRY', d['VENDOR_ORIGINAL_COUNTRY'])
    sql = sql.replaceAll('dataItem.SANCTIONS', d['SANCTIONS'])
    sql = sql.replaceAll('dataItem.CURRENCY', d['CURRENCY'] || 'THB')
    sql = sql.replaceAll('dataItem.SUGGESTION', d['SUGGESTION'])
    sql = sql.replaceAll('dataItem.RESULT', d['RESULT'])
    sql = sql.replaceAll('dataItem.PATH', d['PATH'])
    sql = sql.replaceAll('dataItem.VENDOR_CODE_SELECTOR', d['VENDOR_CODE_SELECTOR'])
    sql = sql.replaceAll('dataItem.GPR_43_ACCEPTANCE_STATUS', d['GPR_43_ACCEPTANCE_STATUS'])

    if (d['COMPLETION_DATE']) {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', `'${d['COMPLETION_DATE']}'`)
    } else {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', 'NULL')
    }

    sql = sql.replaceAll('dataItem.CREATE_BY', d['CREATE_BY'] || d['UPDATE_BY'] || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', d['UPDATE_BY'] || 'SYSTEM')
    return sql
  },

  // 2B. Update selection,

  updateSelection: (dataItem: any) => {
    let sql = `
                            UPDATE request_vendor_selections SET
                                       BUSINESS_CATEGORY_ID = (
                                           SELECT BUSINESS_CATEGORY_ID FROM business_category
                                           WHERE BUSINESS_CATEGORY_NAME = 'dataItem.BUSINESS_CATEGORY'
                                             AND INUSE = 1
                                           LIMIT 1
                                       )
                                     , START_YEAR = 'dataItem.START_YEAR'
                                     , AUTHORIZED_CAPITAL = 'dataItem.AUTHORIZED_CAPITAL'
                                     , ESTABLISH_YEARS = 'dataItem.ESTABLISH'
                                     , NUMBER_OF_EMPLOYEES = 'dataItem.NUMBER_OF_EMPLOYEES'
                                     , MANUFACTURED_COUNTRY = 'dataItem.MANUFACTURED_COUNTRY'
                                     , VENDOR_ORIGINAL_COUNTRY = 'dataItem.VENDOR_ORIGINAL_COUNTRY'
                                     , SANCTIONS_STATUS = 'dataItem.SANCTIONS'
                                     , INFO_CURRENCY_ID = (
                                           SELECT INFO_CURRENCY_ID FROM info_currency
                                           WHERE CURRENCY_NAME = 'dataItem.CURRENCY'
                                           LIMIT 1
                                       )
                                     , SUGGESTION = 'dataItem.SUGGESTION'
                                     , RESULT_STATUS = 'dataItem.RESULT'
                                     , DOCUMENT_PATH = 'dataItem.PATH'
                                     , PROPOSED_VENDOR_CODE = NULLIF('dataItem.VENDOR_CODE_SELECTOR', '')
                                     , GPR_43_ACCEPTANCE_STATUS = 'dataItem.GPR_43_ACCEPTANCE_STATUS'
                                     , COMPLETION_DATE = dataItem.COMPLETION_DATE_NULL
                                     , DESCRIPTION = LEFT('dataItem.SUGGESTION', 100)
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                       AND INUSE = 1
        `
    const d = dataItem

    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (d['REQUEST_VENDOR_SELECTIONS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.BUSINESS_CATEGORY', d['BUSINESS_CATEGORY'])
    sql = sql.replaceAll('dataItem.START_YEAR', d['START_YEAR'])
    sql = sql.replaceAll('dataItem.AUTHORIZED_CAPITAL', d['AUTHORIZED_CAPITAL'])
    sql = sql.replaceAll('dataItem.ESTABLISH', d['ESTABLISH'])
    sql = sql.replaceAll('dataItem.NUMBER_OF_EMPLOYEES', d['NUMBER_OF_EMPLOYEES'])
    sql = sql.replaceAll('dataItem.MANUFACTURED_COUNTRY', d['MANUFACTURED_COUNTRY'])
    sql = sql.replaceAll('dataItem.VENDOR_ORIGINAL_COUNTRY', d['VENDOR_ORIGINAL_COUNTRY'])
    sql = sql.replaceAll('dataItem.SANCTIONS', d['SANCTIONS'])
    sql = sql.replaceAll('dataItem.CURRENCY', d['CURRENCY'] || 'THB')
    sql = sql.replaceAll('dataItem.SUGGESTION', d['SUGGESTION'])
    sql = sql.replaceAll('dataItem.RESULT', d['RESULT'])
    sql = sql.replaceAll('dataItem.PATH', d['PATH'])
    sql = sql.replaceAll('dataItem.VENDOR_CODE_SELECTOR', d['VENDOR_CODE_SELECTOR'])
    sql = sql.replaceAll('dataItem.GPR_43_ACCEPTANCE_STATUS', d['GPR_43_ACCEPTANCE_STATUS'])

    if (d['COMPLETION_DATE']) {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', `'${d['COMPLETION_DATE']}'`)
    } else {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', 'NULL')
    }

    sql = sql.replaceAll('dataItem.UPDATE_BY', d['UPDATE_BY'] || 'SYSTEM')
    return sql
  },

  updateSelectionGprCOnly: (dataItem: any) => {
    let sql = `
                            UPDATE request_vendor_selections SET
                                       UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                       AND INUSE = 1
        `

    const d = dataItem

    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (d['REQUEST_VENDOR_SELECTIONS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', d['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  updateSelectionAccountSelector: (dataItem: any) => {
    let sql = `
                            UPDATE request_vendor_selections SET
                                       PROPOSED_VENDOR_CODE = NULLIF('dataItem.VENDOR_CODE_SELECTOR', '')
                                     , COMPLETION_DATE = dataItem.COMPLETION_DATE_NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                       AND INUSE = 1
        `

    const d = dataItem

    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (d['REQUEST_VENDOR_SELECTIONS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE_SELECTOR', d['VENDOR_CODE_SELECTOR'] || '')

    if (d['COMPLETION_DATE']) {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', `'${d['COMPLETION_DATE']}'`)
    } else {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', 'NULL')
    }

    sql = sql.replaceAll('dataItem.UPDATE_BY', d['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getGprCircularMembers: (dataItem: any) => {
    let sql = `
                            SELECT
                                       MEMBER_ORDER
                                     , EMPCODE
                                     , MEMBER_NAME
                                     , EMAIL
                            FROM
                                       request_vendor_gpr_c_circular_members
                            WHERE
                                       REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                            ORDER BY
                                       MEMBER_ORDER ASC
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    return sql
  },

  deleteGprCircularMembers: (dataItem: any) => {
    let sql = `
                            UPDATE request_vendor_gpr_c_circular_members
                            SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    return sql
  },

  insertGprCircularMember: (dataItem: any) => {
    let sql = `
                            INSERT INTO request_vendor_gpr_c_circular_members (
                                       REQUEST_VENDOR_SELECTIONS_ID
                                     , MEMBER_ORDER
                                     , EMPCODE
                                     , MEMBER_NAME
                                     , EMAIL
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                       dataItem.REQUEST_VENDOR_SELECTIONS_ID
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
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    sql = sql.replaceAll('dataItem.MEMBER_ORDER', (dataItem.MEMBER_ORDER || 0).toString())
    sql = sql.replaceAll('dataItem.EMPCODE', dataItem.EMPCODE)
    sql = sql.replaceAll('dataItem.MEMBER_NAME', dataItem.MEMBER_NAME)
    sql = sql.replaceAll('dataItem.EMAIL', dataItem.EMAIL)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')
    return sql
  },

  getGprActionSetup: (dataItem: any) => {
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
                                       REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                            ORDER BY
                                       FIELD(STAGE_CODE, 'engineer', 'emr', 'qms', 'pm_manager')
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    return sql
  },

  getGprFlowSetup: (dataItem: any) => {
    let sql = `
                            SELECT
                                       GPR_C_APPROVER_NAME
                                     , GPR_C_APPROVER_EMAIL
                                     , GPR_C_APPROVER_EMPCODE
                                     , PC_PIC_NAME AS GPR_C_PC_PIC_NAME
                                     , PC_PIC_EMAIL AS GPR_C_PC_PIC_EMAIL
                            FROM
                                       request_vendor_gpr_c_flows
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND INUSE = 1
                            ORDER BY
                                       REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem.REQUEST_REGISTER_VENDOR_ID || 0).toString())
    return sql
  },

  deleteGprActionSetup: (dataItem: any) => {
    let sql = `
                            UPDATE request_vendor_gpr_c_action_setup
                            SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    return sql
  },

  insertGprActionSetup: (dataItem: any) => {
    const resultUpdatedAt = dataItem.RESULT_UPDATED_AT || ''
    let sql = `
                            INSERT INTO request_vendor_gpr_c_action_setup (
                                       REQUEST_VENDOR_SELECTIONS_ID
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
                                       dataItem.REQUEST_VENDOR_SELECTIONS_ID
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
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    sql = sql.replaceAll('dataItem.STAGE_CODE', dataItem.STAGE_CODE || '')
    sql = sql.replaceAll('dataItem.PIC_NAME', dataItem.PIC_NAME || '')
    sql = sql.replaceAll('dataItem.PIC_EMAIL', dataItem.PIC_EMAIL || '')
    sql = sql.replaceAll('dataItem.RESULT_STATUS', dataItem.RESULT_STATUS || '')
    sql = sql.replaceAll('dataItem.RESULT_NOTE', dataItem.RESULT_NOTE || '')
    sql = sql.replaceAll('dataItem.RESULT_UPDATED_AT', resultUpdatedAt)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')
    return sql
  },

  deleteFinancials: (dataItem: any) => {
    let sql = `
      UPDATE vendor_selection_financials
      SET INUSE = 0, UPDATE_BY = 'dataItem.UPDATE_BY', UPDATE_DATE = NOW()
      WHERE REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID AND INUSE = 1
    `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    return sql
  },

  deleteCriteria: (dataItem: any) => {
    let sql = `
      UPDATE vendor_selection_criteria
      SET INUSE = 0, UPDATE_BY = 'dataItem.UPDATE_BY', UPDATE_DATE = NOW()
      WHERE REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID AND INUSE = 1
    `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    return sql
  },

  // 4. Insert Financial Data,

  insertFinancial: (dataItem: any) => {
    let sql = `
                            INSERT INTO vendor_selection_financials (
                                       REQUEST_VENDOR_SELECTIONS_ID
                                     , YEAR
                                     , TOTAL_REVENUE
                                     , NET_PROFIT
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       dataItem.REQUEST_VENDOR_SELECTIONS_ID
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
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    sql = sql.replaceAll('dataItem.YEAR', dataItem.YEAR)

    // Ensure numeric or NULL
    const rev = parseFloat(dataItem.TOTAL_REVENUE as string)
    const pro = parseFloat(dataItem.NET_PROFIT as string)
    sql = sql.replaceAll('dataItem.TOTAL_REVENUE', isNaN(rev) ? 'NULL' : String(rev))
    sql = sql.replaceAll('dataItem.NET_PROFIT', isNaN(pro) ? 'NULL' : String(pro))
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')

    return sql
  },

  insertCriteria: (dataItem: any) => {
    let sql = `
                            INSERT INTO vendor_selection_criteria (
                                       REQUEST_VENDOR_SELECTIONS_ID
                                     , CRITERIA_NO
                                     , CRITERIA_VALUE
                                     , UPLOADED_FILE_PATH
                                     , UPLOADED_FILE_NAME
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                     , 'dataItem.NO'
                                     , 'dataItem.CRITERIA'
                                     , dataItem.PATH_NULL
                                     , dataItem.NAME_NULL
                                     , 'dataItem.REMARK'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            )
                            ON DUPLICATE KEY UPDATE
                                       CRITERIA_VALUE = VALUES(CRITERIA_VALUE)
                                     , UPLOADED_FILE_PATH = VALUES(UPLOADED_FILE_PATH)
                                     , UPLOADED_FILE_NAME = VALUES(UPLOADED_FILE_NAME)
                                     , DESCRIPTION = VALUES(DESCRIPTION)
                                     , UPDATE_BY = VALUES(UPDATE_BY)
                                     , UPDATE_DATE = NOW()
                                     , INUSE = 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    sql = sql.replaceAll('dataItem.NO', dataItem.NO)
    sql = sql.replaceAll('dataItem.CRITERIA', dataItem.CRITERIA)
    sql = sql.replaceAll('dataItem.REMARK', dataItem.REMARK)

    if (dataItem.UPLOADED_FILE) {
      sql = sql.replaceAll('dataItem.PATH_NULL', `'${dataItem.UPLOADED_FILE}'`)
    } else {
      sql = sql.replaceAll('dataItem.PATH_NULL', 'NULL')
    }

    if (dataItem.UPLOADED_NAME) {
      sql = sql.replaceAll('dataItem.NAME_NULL', `'${dataItem.UPLOADED_NAME}'`)
    } else {
      sql = sql.replaceAll('dataItem.NAME_NULL', 'NULL')
    }

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')

    return sql
  },
}

