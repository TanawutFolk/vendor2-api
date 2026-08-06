import { GprCSelectionSqlSnippets } from '../common/GprCSelectionSqlSnippets'
import { RequestVendorContactSqlSnippets } from '../common/RequestVendorContactSqlSnippets'
import { RequestStatusSqlSnippets } from '../common/RequestStatusSqlSnippets'
import { RequestStateSqlSnippets } from '../_status-master/StatusMasterSQL'
import { PersonSqlSnippets } from '../common/PersonSqlSnippets'
import { MesProductSqlSnippets } from '../common/MesProductSqlSnippets'
import { SelectionSheetAccessSqlSnippets } from '../common/SelectionSheetAccessSqlSnippets'
import { requireStatusId } from '../../utils/StatusId'

const escapeSqlText = (value: any) => String(value ?? '').replaceAll("'", "''")


export const RequestRegisterPageSQL = {
  acquireRequestCreateLock: (dataItem: any) => {
    let sql = `
      SELECT GET_LOCK('dataItem.LOCK_KEY', 10) AS lock_status
    `

    sql = sql.replaceAll('dataItem.LOCK_KEY', escapeSqlText(dataItem.LOCK_KEY))

    return sql
  },

  releaseRequestCreateLock: (dataItem: any) => {
    let sql = `
      DO RELEASE_LOCK('dataItem.LOCK_KEY')
    `

    sql = sql.replaceAll('dataItem.LOCK_KEY', escapeSqlText(dataItem.LOCK_KEY))

    return sql
  },

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
                                       agm.EMPNAME
                                     , agm.EMPCODE
                                     , agm.EMPEMAIL
                                     , agm.APPROVAL_GROUP_MEMBER_ID
                                     , ag.APPROVAL_GROUP_ID
                            FROM
                                       approval_group_member agm
                                            JOIN
                                       approval_group ag ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
                            WHERE
                                       ag.GROUP_CODE = 'dataItem.GROUP_CODE'
                                       AND ag.INUSE = 1
                                       AND agm.INUSE = 1
                            ORDER BY
                                       agm.IS_PRIMARY DESC
                                     , agm.PRIORITY_NO ASC
                                     , agm.APPROVAL_GROUP_MEMBER_ID ASC
        `

    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')

    return sql
  },

  getLastAssignedPicByVendorRegion: async (dataItem: any) => {
    const isOversea = String(dataItem['IS_OVERSEA'] || '').toLowerCase() === 'true' || Number(dataItem['IS_OVERSEA']) === 1

    const vendorRegionClause = isOversea ? '= \'Oversea\'' : '!= \'Oversea\' OR v.VENDOR_REGION IS NULL'

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
                                       ) + 1 AS NEXT_NO
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
                                       dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS
                                     , rr.M_REQUEST_STATE_ID
                                     , dataItem.REQUEST_STATE_SQL AS REQUEST_STATE
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
    sql = sql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    sql = sql.replaceAll('dataItem.REQUEST_STATE_SQL', String(RequestStateSqlSnippets.requestStateCodeExpr('rr')))

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getSelectionSheetEditAccess: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.CURRENT_M_REQUEST_STATUS_ID
                                     , dataItem.SELECTION_SHEET_EDITABLE_SQL AS IS_SELECTION_SHEET_EDITABLE
                            FROM
                                       request_register_vendor rr
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rr.INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll(
      'dataItem.SELECTION_SHEET_EDITABLE_SQL',
      String(SelectionSheetAccessSqlSnippets.editableExpr('rr', dataItem))
    )
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
                                       agm.EMPCODE
                                     , agm.EMPNAME
                                     , agm.EMPEMAIL
                                     , ag.GROUP_CODE
                                     , ag.GROUP_NAME
                                     , ag.APPROVAL_GROUP_ID
                                     , agm.APPROVAL_GROUP_MEMBER_ID
                            FROM
                                       approval_group_member agm
                                            JOIN
                                       approval_group ag ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
                            WHERE
                                       ag.GROUP_CODE = 'dataItem.TARGET_GROUP'
                                       AND ag.INUSE = 1
                                       AND agm.INUSE = 1
                            ORDER BY
                                       agm.IS_PRIMARY DESC
                                     , agm.PRIORITY_NO ASC
                                     , agm.APPROVAL_GROUP_MEMBER_ID ASC
        `

    sql = sql.replaceAll('dataItem.TARGET_GROUP', dataItem['TARGET_GROUP'] || '')
    return sql
  },

  getMemberByEmpCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       m.EMPNAME
                                     , m.EMPSURNAME
                                     , m.EMPEMAIL
                                     , TRIM(m.EMPSECTION) AS REQUESTER_SECTION
                                     , ec.EXT AS EMP_TEL
                            FROM
                                       dataItem.MEMBER_TABLE m
                            LEFT JOIN
                                       employee_contacts ec ON m.EMPCODE = ec.EMP_CODE AND ec.INUSE = 1
                            WHERE
                                       m.EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.MEMBER_TABLE', String(PersonSqlSnippets.memberTable()))

    sql = sql.replaceAll('dataItem.EMPCODE', escapeSqlText(dataItem['EMPCODE']))

    return sql
  },

  getAssigneeByEmpCodeContact: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       a.EMPNAME
                                     , a.EMPEMAIL
                                     , ec.EXT AS EMP_TEL
                            FROM
                                       approval_group_member a
                            LEFT JOIN
                                       employee_contacts ec ON a.EMPCODE = ec.EMP_CODE AND ec.INUSE = 1
                            WHERE
                                       a.EMPCODE = 'dataItem.EMPCODE'
                                       AND a.INUSE = 1
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
                                       approval_group_member
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                                       AND INUSE = 1
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
                                     , dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL AS VENDOR_CONTACTS_ID
                                     , rr.REQUEST_BY_EMPLOYEECODE
                                     , rr.APPROVED_VENDOR_CODE AS VENDOR_CODE
                                     dataItem.GPR_C_SELECTION_FIELDS_SQL
                                     , rvs.GPR_43_ACCEPTANCE_STATUS
                                     , v.COMPANY_NAME
                                     , v.ADDRESS
                                     , v.VENDOR_REGION
                                     , v.EMAILMAIN
                                     , v.EMAILMAIN AS VENDOR_MAIN_EMAIL
                                     , v.FFT_VENDOR_CODE
                                     , vc.CONTACT_NAME
                                     , vc.EMAIL AS VENDOR_EMAIL
                                     , vc.TEL_PHONE
                                     , vc_sel.EMAIL AS SELECTED_VENDOR_EMAIL
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rvs.INUSE = 1
                                            LEFT JOIN
                                       vendor_contacts vc ON vc.VENDORS_ID = v.VENDORS_ID
                                            LEFT JOIN
                                       vendor_contacts vc_sel ON vc_sel.VENDOR_CONTACTS_ID = dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL
                                           AND vc_sel.INUSE = 1
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
    sql = sql.replaceAll('dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL', String(RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')))
    sql = sql.replaceAll('dataItem.GPR_C_SELECTION_FIELDS_SQL', String(GprCSelectionSqlSnippets.gprCSelectionFields('rvs', 'rr')))

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  createRequest: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_register_vendor (
                                       VENDORS_ID
                                     , REQUEST_BY_EMPLOYEECODE
                                     , REQUESTER_SECTION
                                     , SUPPORTPRODUCT_PROCESS
                                     , PURCHASE_FREQUENCY
                                     , M_REQUEST_STATE_ID
                                     , WORKFLOW_DEFINITION_ID
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
                                     , 'dataItem.REQUESTER_SECTION'
                                     , 'dataItem.SUPPORTPRODUCT_PROCESS'
                                     , 'dataItem.PURCHASE_FREQUENCY'
                                     ,  dataItem.M_REQUEST_IN_PROGRESS_STATE_ID
                                     ,  dataItem.WORKFLOW_DEFINITION_ID
                                     ,  dataItem.CURRENT_M_REQUEST_STATUS_ID
                                     , 'dataItem.REQUESTER_REMARK'
                                     , 'dataItem.ASSIGN_TO'
                                     , 'dataItem.PIC_EMAIL'
                                     , LEFT('dataItem.REQUESTER_REMARK', 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `
    sql = sql.replaceAll(
      'dataItem.M_REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_IN_PROGRESS_STATE_ID'], 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_BY_EMPLOYEECODE', dataItem['REQUEST_BY_EMPLOYEECODE'] || '')
    sql = sql.replaceAll('dataItem.REQUESTER_SECTION', escapeSqlText(dataItem['REQUESTER_SECTION']))
    sql = sql.replaceAll('dataItem.SUPPORTPRODUCT_PROCESS', dataItem['SUPPORTPRODUCT_PROCESS'] || '')
    sql = sql.replaceAll('dataItem.PURCHASE_FREQUENCY', dataItem['PURCHASE_FREQUENCY'] || '')
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_ID', (dataItem['WORKFLOW_DEFINITION_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CURRENT_M_REQUEST_STATUS_ID', (dataItem['CURRENT_M_REQUEST_STATUS_ID'] || 0).toString())
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
                                     , dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS
                            FROM
                                       request_register_vendor rr
                            WHERE
                                       rr.VENDORS_ID = dataItem.VENDORS_ID
                                       AND rr.REQUEST_BY_EMPLOYEECODE = 'dataItem.REQUEST_BY_EMPLOYEECODE'
                                       AND rr.INUSE = 1
                                       AND rr.M_REQUEST_STATE_ID = dataItem.M_REQUEST_IN_PROGRESS_STATE_ID
                            ORDER BY
                                       rr.REQUEST_REGISTER_VENDOR_ID DESC
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    sql = sql.replaceAll(
      'dataItem.M_REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_IN_PROGRESS_STATE_ID'], 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_BY_EMPLOYEECODE', dataItem['REQUEST_BY_EMPLOYEECODE'] || '')

    return sql
  },

  getRequestsAheadCount: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       COUNT(*) AS REQUESTS_AHEAD
                            FROM
                                       request_register_vendor rr
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID < dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rr.INUSE = 1
                                       AND rr.M_REQUEST_STATE_ID = dataItem.M_REQUEST_IN_PROGRESS_STATE_ID
        `
    sql = sql.replaceAll(
      'dataItem.M_REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_IN_PROGRESS_STATE_ID'], 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

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
      throw new Error(
        'Invalid REQUEST_REGISTER_VENDOR_ID for createDocument: ' +
          String(dataItem['REQUEST_REGISTER_VENDOR_ID']),
      )
    }

    // MySQL string literals interpret backslash escape sequences (e.g. "\0" becomes a NUL byte),
    // so Windows/UNC file paths must have backslashes escaped before quote-escaping, or they get
    // silently mangled on INSERT.
    const escape = (value: any) => String(value ?? '').replaceAll('\\', '\\\\').replaceAll("'", "''")

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
    sql = sql.replaceAll('dataItem.FILE_NAME', escape(dataItem['FILE_NAME']))
    sql = sql.replaceAll('dataItem.FILE_PATH', escape(dataItem['FILE_PATH']))
    sql = sql.replaceAll('dataItem.FILE_SIZE', (dataItem['FILE_SIZE'] || 0).toString())
    sql = sql.replaceAll('dataItem.FILE_TYPE', escape(dataItem['FILE_TYPE']))
    sql = sql.replaceAll('dataItem.CREATE_BY', escape(dataItem['CREATE_BY']))

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
                                       wsm.WORKFLOW_STEP_MASTER_ID
                                     , mrs.M_REQUEST_STATUS_ID
                                     , mrs.STATUS_CODE
                                     , mrs.STATUS_VALUE AS value
                                     , COALESCE(mrs.STATUS_LABEL_EN, mrs.STATUS_VALUE) AS label
                                     , mrs.STATUS_LABEL_TH
                                     , wsm.WORKFLOW_DEFINITION_ID
                                     , wsm.STEP_CODE
                                     , wsm.ACTOR_TYPE
                                     , wsm.DEFAULT_APPROVAL_GROUP_ID_LOCAL
                                     , wsm.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                                     , COALESCE(local_group.GROUP_CODE, wsm.DEFAULT_GROUP_CODE_LOCAL) AS DEFAULT_GROUP_CODE_LOCAL
                                     , COALESCE(oversea_group.GROUP_CODE, wsm.DEFAULT_GROUP_CODE_OVERSEA) AS DEFAULT_GROUP_CODE_OVERSEA
                                     , wsm.REQUIRES_VENDOR_REPLY
                                     , wsm.REQUIRES_VENDOR_CODE
                                     , wsm.DEFAULT_STEP_ORDER
                            FROM
                                       workflow_step_master wsm
                                            INNER JOIN
                                       m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                            LEFT JOIN
                                       approval_group local_group ON local_group.APPROVAL_GROUP_ID = wsm.DEFAULT_APPROVAL_GROUP_ID_LOCAL
                                            LEFT JOIN
                                       approval_group oversea_group ON oversea_group.APPROVAL_GROUP_ID = wsm.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                            WHERE
                                       wsm.WORKFLOW_DEFINITION_ID = (
                                           SELECT WORKFLOW_DEFINITION_ID
                                           FROM workflow_definition
                                           WHERE WORKFLOW_CODE = 'VENDOR_REGISTRATION'
                                             AND DEFINITION_STATUS = 'PUBLISHED'
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

  getBusinessCategories: async (_dataItem?: any) => {
    return `
                            SELECT
                                       BUSINESS_CATEGORY_NAME AS value
                                     , BUSINESS_CATEGORY_NAME AS label
                                     , BUSINESS_CATEGORY_ID
                                     , DESCRIPTION
                            FROM
                                       info_business_category
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
    const stepStatusId = requireStatusId(dataItem['M_APPROVAL_STEP_STATUS_ID'], 'M_APPROVAL_STEP_STATUS_ID')
    const pendingStatusId = requireStatusId(dataItem['M_APPROVAL_STEP_PENDING_STATUS_ID'], 'M_APPROVAL_STEP_PENDING_STATUS_ID')
    const terminalStatusIds = (Array.isArray(dataItem['M_APPROVAL_STEP_TERMINAL_STATUS_IDS'])
      ? dataItem['M_APPROVAL_STEP_TERMINAL_STATUS_IDS']
      : [])
      .map((statusId: any) => Number(statusId))
      .filter((statusId: number) => Number.isInteger(statusId) && statusId > 0)
    if (terminalStatusIds.length === 0) {
      throw new Error('M_APPROVAL_STEP_TERMINAL_STATUS_IDS must contain positive integer IDs')
    }
    let sql = `
                            INSERT INTO request_approval_step (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , WORKFLOW_STEP_MASTER_ID
                                     , STEP_ORDER
                                     , APPROVER_EMPCODE
                                     , APPROVAL_GROUP_MEMBER_ID
                                     , M_APPROVAL_STEP_STATUS_ID
                                     , APPROVAL_GROUP_ID
                                     , ASSIGNMENT_MODE
                                     , ASSIGNED_DATE
                                     , COMPLETED_DATE
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            ) VALUES (
                                        dataItem.REQUEST_REGISTER_VENDOR_ID
                                     ,  dataItem.WORKFLOW_STEP_MASTER_ID
                                     ,  dataItem.STEP_ORDER
                                     , 'dataItem.APPROVER_EMPCODE'
                                     , (
                                           SELECT agm.APPROVAL_GROUP_MEMBER_ID
                                           FROM approval_group_member agm
                                           JOIN approval_group ag
                                             ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
                                           WHERE ag.GROUP_CODE = 'dataItem.GROUP_CODE'
                                             AND agm.EMPCODE = 'dataItem.APPROVER_EMPCODE'
                                             AND agm.INUSE = 1
                                           ORDER BY agm.IS_PRIMARY DESC, agm.PRIORITY_NO, agm.APPROVAL_GROUP_MEMBER_ID
                                           LIMIT 1
                                       )
                                     ,  dataItem.M_APPROVAL_STEP_STATUS_ID
                                     , (
                                           SELECT ag.APPROVAL_GROUP_ID
                                           FROM approval_group ag
                                           WHERE ag.GROUP_CODE = 'dataItem.GROUP_CODE'
                                             AND ag.INUSE = 1
                                           LIMIT 1
                                       )
                                     , 'dataItem.ASSIGNMENT_MODE'
                                     , CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID <> dataItem.APPROVAL_STEP_PENDING_STATUS_ID
                                             THEN NOW()
                                           ELSE NULL
                                       END
                                     , CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID IN (
                                               dataItem.TERMINAL_APPROVAL_STEP_STATUS_IDS_SQL
                                           ) THEN NOW()
                                           ELSE NULL
                                       END
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_PENDING_STATUS_ID', String(pendingStatusId))
    sql = sql.replaceAll(
      'dataItem.TERMINAL_APPROVAL_STEP_STATUS_IDS_SQL',
      terminalStatusIds.join(', ')
    )

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_MASTER_ID', (dataItem['WORKFLOW_STEP_MASTER_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_ORDER', (dataItem['STEP_ORDER'] || 0).toString())
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', dataItem['APPROVER_EMPCODE'] || '')
    sql = sql.replaceAll('dataItem.M_APPROVAL_STEP_STATUS_ID', stepStatusId.toString())
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

  syncRequestWorkflowState: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND active_step.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID
                             AND active_step.INUSE = 1
                            LEFT JOIN workflow_step_master active_wsm
                              ON active_wsm.WORKFLOW_STEP_MASTER_ID = active_step.WORKFLOW_STEP_MASTER_ID
                            LEFT JOIN m_request_status active_status
                              ON active_status.M_REQUEST_STATUS_ID = active_wsm.M_REQUEST_STATUS_ID
                            SET
                                       rr.CURRENT_REQUEST_APPROVAL_STEP_ID = active_step.REQUEST_APPROVAL_STEP_ID
                                     , rr.CURRENT_M_REQUEST_STATUS_ID = active_wsm.M_REQUEST_STATUS_ID
                                     , rr.M_REQUEST_STATE_ID = CASE
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NULL THEN rr.M_REQUEST_STATE_ID
                                           ELSE dataItem.REQUEST_IN_PROGRESS_STATE_ID
                                       END
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `
    sql = sql.replaceAll(
      'dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID',
      requireStatusId(dataItem['M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID'], 'M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID').toString()
    )
    sql = sql.replaceAll(
      'dataItem.REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_IN_PROGRESS_STATE_ID'], 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  updateApprovalStep: async (dataItem: any) => {
    const stepStatusId = requireStatusId(dataItem['M_APPROVAL_STEP_STATUS_ID'], 'M_APPROVAL_STEP_STATUS_ID')
    let sql = `
                            UPDATE request_approval_step SET
                                       M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_STATUS_ID
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID;

                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND active_step.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID
                             AND active_step.INUSE = 1
                            LEFT JOIN workflow_step_master active_wsm
                              ON active_wsm.WORKFLOW_STEP_MASTER_ID = active_step.WORKFLOW_STEP_MASTER_ID
                            LEFT JOIN m_request_status active_status
                              ON active_status.M_REQUEST_STATUS_ID = active_wsm.M_REQUEST_STATUS_ID
                            SET
                                       rr.CURRENT_REQUEST_APPROVAL_STEP_ID = COALESCE(active_step.REQUEST_APPROVAL_STEP_ID, rr.CURRENT_REQUEST_APPROVAL_STEP_ID)
                                     , rr.CURRENT_M_REQUEST_STATUS_ID = COALESCE(active_wsm.M_REQUEST_STATUS_ID, rr.CURRENT_M_REQUEST_STATUS_ID)
                                     , rr.M_REQUEST_STATE_ID = CASE
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NULL THEN rr.M_REQUEST_STATE_ID
                                           ELSE dataItem.REQUEST_IN_PROGRESS_STATE_ID
                                       END
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `
    sql = sql.replaceAll(
      'dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID',
      requireStatusId(dataItem['M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID'], 'M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID').toString()
    )
    sql = sql.replaceAll(
      'dataItem.REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_IN_PROGRESS_STATE_ID'], 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )

    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', (dataItem['REQUEST_APPROVAL_STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.M_APPROVAL_STEP_STATUS_ID', stepStatusId.toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  createApprovalLog: async (dataItem: any) => {
    let sql = `
                            INSERT INTO request_approval_log (
                                       REQUEST_REGISTER_VENDOR_ID
                                     , REQUEST_APPROVAL_STEP_ID
                                     , WORKFLOW_STEP_MASTER_ID
                                     , ACTION_BY
                                     , ACTION_BY_NAME
                                     , ACTION_TYPE
                                     , ACTION_CODE
                                     , STEP_CODE_SNAPSHOT
                                     , STATUS_LABEL_SNAPSHOT
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
                                     , (SELECT ras.WORKFLOW_STEP_MASTER_ID
                                        FROM request_approval_step ras
                                        WHERE ras.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                                          AND ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                        LIMIT 1)
                                     , 'dataItem.ACTION_BY'
                                     , COALESCE(
                                           (SELECT agm.EMPNAME
                                            FROM approval_group_member agm
                                            WHERE agm.EMPCODE = 'dataItem.ACTION_BY'
                                              AND agm.INUSE = 1
                                            ORDER BY agm.IS_PRIMARY DESC, agm.PRIORITY_NO ASC
                                            LIMIT 1),
                                           'dataItem.ACTION_BY'
                                       )
                                     , 'dataItem.ACTION_TYPE'
                                     , 'dataItem.ACTION_CODE'
                                     , (SELECT wsm.STEP_CODE
                                        FROM request_approval_step ras
                                        JOIN workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                        WHERE ras.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                                          AND ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                        LIMIT 1)
                                     , (SELECT COALESCE(mrs.STATUS_LABEL_EN, mrs.STATUS_VALUE)
                                        FROM request_approval_step ras
                                        JOIN workflow_step_master wsm ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                        JOIN m_request_status mrs ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                        WHERE ras.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                                          AND ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                        LIMIT 1)
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
    sql = sql.replaceAll('dataItem.ACTION_CODE', String(dataItem['ACTION_CODE'] || dataItem['ACTION_TYPE'] || '').trim().toUpperCase())
    sql = sql.replaceAll('dataItem.REMARK', dataItem['REMARK'] || '')
    sql = sql.replaceAll('dataItem.REJECT_REASON', dataItem['REJECT_REASON'] ?? dataItem['REMARK'] ?? '')

    return sql
  },

  updateCcEmails: async (_dataItem: any) => {
    return 'SELECT 1 AS noop'
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
                                       info_business_category bc ON bc.BUSINESS_CATEGORY_ID = rvs.BUSINESS_CATEGORY_ID AND bc.INUSE = 1
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
                                       vsc.VENDOR_SELECTION_CRITERIA_ID
                                     , vsc.CRITERIA_NO AS NO
                                     , vsc.CRITERIA_VALUE AS CRITERIA
                                     , vsc.DESCRIPTION AS REMARK
                                     , (
                                         SELECT vscf.FILE_PATH
                                         FROM vendor_selection_criteria_files vscf
                                         WHERE vscf.VENDOR_SELECTION_CRITERIA_ID = vsc.VENDOR_SELECTION_CRITERIA_ID
                                           AND vscf.INUSE = 1
                                         ORDER BY vscf.FILE_ORDER ASC
                                         LIMIT 1
                                       ) AS UPLOADED_FILE
                                     , (
                                         SELECT vscf.FILE_NAME
                                         FROM vendor_selection_criteria_files vscf
                                         WHERE vscf.VENDOR_SELECTION_CRITERIA_ID = vsc.VENDOR_SELECTION_CRITERIA_ID
                                           AND vscf.INUSE = 1
                                         ORDER BY vscf.FILE_ORDER ASC
                                         LIMIT 1
                                       ) AS UPLOADED_NAME
                                     , (
                                         SELECT COALESCE(
                                           JSON_ARRAYAGG(
                                             JSON_OBJECT(
                                               'CRITERIA_FILE_ID', vscf.VENDOR_SELECTION_CRITERIA_FILE_ID,
                                               'FILE_ORDER', vscf.FILE_ORDER,
                                               'FILE_PATH', vscf.FILE_PATH,
                                               'FILE_NAME', vscf.FILE_NAME,
                                               'FILE_SIZE', vscf.FILE_SIZE,
                                               'FILE_TYPE', vscf.FILE_TYPE
                                             )
                                           ),
                                           JSON_ARRAY()
                                         )
                                         FROM vendor_selection_criteria_files vscf
                                         WHERE vscf.VENDOR_SELECTION_CRITERIA_ID = vsc.VENDOR_SELECTION_CRITERIA_ID
                                           AND vscf.INUSE = 1
                                       ) AS FILES
                            FROM
                                       vendor_selection_criteria vsc
                            WHERE
                                       vsc.REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                       AND vsc.INUSE = 1
                            ORDER BY
                                       vsc.VENDOR_SELECTION_CRITERIA_ID ASC
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem['REQUEST_VENDOR_SELECTIONS_ID'] || 0).toString())
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
                                     , (SELECT BUSINESS_CATEGORY_ID FROM info_business_category
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
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', "'" + d['COMPLETION_DATE'] + "'")
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
                                           SELECT BUSINESS_CATEGORY_ID FROM info_business_category
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
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', "'" + d['COMPLETION_DATE'] + "'")
    } else {
      sql = sql.replaceAll('dataItem.COMPLETION_DATE_NULL', 'NULL')
    }

    sql = sql.replaceAll('dataItem.UPDATE_BY', d['UPDATE_BY'] || 'SYSTEM')
    return sql
  },

  updateAccountVendorCode: (dataItem: any) => {
    let sql = `
                            UPDATE
                                       request_vendor_selections rvs
                                            INNER JOIN
                                       request_register_vendor rr
                                         ON rr.REQUEST_REGISTER_VENDOR_ID = rvs.REQUEST_REGISTER_VENDOR_ID
                                            INNER JOIN
                                       request_approval_step ras
                                         ON ras.REQUEST_APPROVAL_STEP_ID = rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                        AND ras.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                                            INNER JOIN
                                       workflow_step_master wsm
                                         ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                            INNER JOIN
                                       m_approval_step_status task_status
                                         ON task_status.M_APPROVAL_STEP_STATUS_ID = ras.M_APPROVAL_STEP_STATUS_ID
                            SET
                                       rvs.PROPOSED_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                                     , rvs.COMPLETION_DATE = CURDATE()
                                     , rvs.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rvs.UPDATE_DATE = NOW()
                            WHERE
                                       rvs.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND rvs.INUSE = 1
                                       AND rr.INUSE = 1
                                       AND ras.INUSE = 1
                                       AND wsm.INUSE = 1
                                       AND task_status.INUSE = 1
                                        AND ras.WORKFLOW_STEP_MASTER_ID = dataItem.WORKFLOW_STEP_MASTER_ID
                                        AND ras.M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_STATUS_ID
                                       AND ras.APPROVER_EMPCODE = 'dataItem.UPDATE_BY'
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_STEP_MASTER_ID', (dataItem['WORKFLOW_STEP_MASTER_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.M_APPROVAL_STEP_STATUS_ID', (dataItem['M_APPROVAL_STEP_STATUS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

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

  getActiveProductMainById: (dataItem: any) => {
    let sql = `
                            SELECT
                                       pm.PRODUCT_MAIN_ID
                                     , CONCAT(
                                           TRIM(pm.PRODUCT_MAIN_NAME),
                                           ' (',
                                           TRIM(pm.PRODUCT_MAIN_ALPHABET),
                                           ')'
                                       ) AS PRODUCT_MAIN_NAME
                            FROM
                                       dataItem.PRODUCT_MAIN_TABLE pm
                            WHERE
                                       pm.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID
                                       AND pm.INUSE = 1
                            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_TABLE', MesProductSqlSnippets.productMainTable())
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', (Number(dataItem.PRODUCT_MAIN_ID) || 0).toString())
    return sql
  },

  getGprProductCheckers: (dataItem: any) => {
    let sql = `
                            SELECT
                                       pgc.ITEM_ORDER
                                     , pgc.PRODUCT_MAIN_ID
                                     , pgc.PRODUCT_MAIN_NAME
                                     , pgc.CHECKER_EMPCODE
                                     , pgc.CHECKER_NAME
                                     , pgc.CHECKER_EMAIL
                            FROM
                                       request_vendor_gpr_c_product_group_checkers pgc
                            WHERE
                                       pgc.REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                       AND pgc.INUSE = 1
                            ORDER BY
                                       pgc.ITEM_ORDER ASC
                                     , pgc.REQUEST_VENDOR_GPR_C_PRODUCT_GROUP_CHECKERS_ID ASC
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (Number(dataItem.REQUEST_VENDOR_SELECTIONS_ID) || 0).toString())
    return sql
  },

  deactivateGprProductCheckers: (dataItem: any) => {
    let sql = `
                            UPDATE request_vendor_gpr_c_product_group_checkers
                            SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
                              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (Number(dataItem.REQUEST_VENDOR_SELECTIONS_ID) || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem.UPDATE_BY || 'SYSTEM'))
    return sql
  },

  insertGprProductChecker: (dataItem: any) => {
    let sql = `
                            INSERT INTO request_vendor_gpr_c_product_group_checkers (
                                       REQUEST_VENDOR_SELECTIONS_ID
                                     , ITEM_ORDER
                                     , PRODUCT_MAIN_ID
                                     , PRODUCT_MAIN_NAME
                                     , CHECKER_EMPCODE
                                     , CHECKER_NAME
                                     , CHECKER_EMAIL
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                                     , DESCRIPTION
                            ) VALUES (
                                       dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                     , dataItem.ITEM_ORDER
                                     , dataItem.PRODUCT_MAIN_ID
                                     , 'dataItem.PRODUCT_MAIN_NAME'
                                     , 'dataItem.CHECKER_EMPCODE'
                                     , 'dataItem.CHECKER_NAME'
                                     , 'dataItem.CHECKER_EMAIL'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                                     , LEFT(CONCAT('dataItem.PRODUCT_MAIN_NAME', ': ', 'dataItem.CHECKER_EMPCODE'), 100)
                            )
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (Number(dataItem.REQUEST_VENDOR_SELECTIONS_ID) || 0).toString())
    sql = sql.replaceAll('dataItem.ITEM_ORDER', (Number(dataItem.ITEM_ORDER) || 0).toString())
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', (Number(dataItem.PRODUCT_MAIN_ID) || 0).toString())
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', escapeSqlText(dataItem.PRODUCT_MAIN_NAME))
    sql = sql.replaceAll('dataItem.CHECKER_EMPCODE', escapeSqlText(dataItem.CHECKER_EMPCODE))
    sql = sql.replaceAll('dataItem.CHECKER_NAME', escapeSqlText(dataItem.CHECKER_NAME))
    sql = sql.replaceAll('dataItem.CHECKER_EMAIL', escapeSqlText(dataItem.CHECKER_EMAIL))
    sql = sql.replaceAll('dataItem.CREATE_BY', escapeSqlText(dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))
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
                                     , PC_PIC_EMPCODE AS GPR_C_PC_PIC_EMPCODE
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
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       dataItem.REQUEST_VENDOR_SELECTIONS_ID
                                     , 'dataItem.NO'
                                     , 'dataItem.CRITERIA'
                                     , 'dataItem.REMARK'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     , 1
                            )
                            ON DUPLICATE KEY UPDATE
                                       CRITERIA_VALUE = VALUES(CRITERIA_VALUE)
                                     , DESCRIPTION = VALUES(DESCRIPTION)
                                     , UPDATE_BY = VALUES(UPDATE_BY)
                                     , UPDATE_DATE = NOW()
                                     , INUSE = 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_VENDOR_SELECTIONS_ID', (dataItem.REQUEST_VENDOR_SELECTIONS_ID || 0).toString())
    sql = sql.replaceAll('dataItem.NO', dataItem.NO)
    sql = sql.replaceAll('dataItem.CRITERIA', dataItem.CRITERIA)
    sql = sql.replaceAll('dataItem.REMARK', dataItem.REMARK)

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')

    return sql
  },

  // Repoint a request_register_file row to its final storage path (e.g. after moving the
  // uploaded file from uploads/documents into the request's 02.Request Documents folder).
  updateDocumentFilePath: (dataItem: any) => {
    // Backslashes must be escaped before quotes — MySQL string literals treat "\0" as a NUL
    // byte and silently drop other backslashes, which corrupts Windows/UNC file paths.
    const escape = (value: any) => String(value ?? '').replaceAll('\\', '\\\\').replaceAll("'", "''")

    let sql = `
                            UPDATE request_register_file
                            SET
                                       FILE_PATH = 'dataItem.FILE_PATH'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_FILE_ID = dataItem.REQUEST_REGISTER_FILE_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_FILE_ID', (dataItem.REQUEST_REGISTER_FILE_ID || 0).toString())
    sql = sql.replaceAll('dataItem.FILE_PATH', escape(dataItem.FILE_PATH))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escape(dataItem.UPDATE_BY || 'SYSTEM'))

    return sql
  },

  // Persist the single GPR B file reference (path + name) on the request's selection row.
  updateGprBFile: (dataItem: any) => {
    // Backslashes must be escaped before quotes — MySQL string literals treat "\0" as a NUL
    // byte and silently drop other backslashes, which corrupts Windows/UNC file paths.
    const escape = (value: any) => String(value ?? '').replaceAll('\\', '\\\\').replaceAll("'", "''")

    let sql = `
                            UPDATE request_vendor_selections
                            SET
                                       GPR_B_FILE_PATH = dataItem.PATH_NULL
                                     , GPR_B_FILE_NAME = dataItem.NAME_NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND INUSE = 1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem.REQUEST_REGISTER_VENDOR_ID || 0).toString())
    sql = sql.replaceAll(
      'dataItem.PATH_NULL',
      dataItem.GPR_B_FILE_PATH ? "'" + escape(dataItem.GPR_B_FILE_PATH) + "'" : 'NULL',
    )
    sql = sql.replaceAll(
      'dataItem.NAME_NULL',
      dataItem.GPR_B_FILE_NAME ? "'" + escape(dataItem.GPR_B_FILE_NAME) + "'" : 'NULL',
    )
    sql = sql.replaceAll('dataItem.UPDATE_BY', escape(dataItem.UPDATE_BY || 'SYSTEM'))

    return sql
  },
}

