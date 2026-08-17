import { GprCSelectionSqlSnippets } from '../common/GprCSelectionSqlSnippets'
import { RequestVendorContactSqlSnippets } from '../common/RequestVendorContactSqlSnippets'
import { RequestApprovalSummarySqlSnippets } from '../common/RequestApprovalSummarySqlSnippets'
import { RequestStatusSqlSnippets } from '../common/RequestStatusSqlSnippets'
import { APPROVAL_STEP_STATUS_ID_SQL, ApprovalMasterSqlSnippets } from '../_status-master/StatusMasterSQL'
import { RequestStateSqlSnippets } from '../_status-master/StatusMasterSQL'
import { PersonSqlSnippets } from '../common/PersonSqlSnippets'
import { SelectionSheetAccessSqlSnippets } from '../common/SelectionSheetAccessSqlSnippets'
import { requireStatusId, requireVendorStatusId } from '../../utils/StatusId'

const escapeSqlLiteral = (value: unknown) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")

const toPositiveInteger = (value: unknown): number | null => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const allowedActionsExpr = (requestAlias = 'rr') => {
  let sql = `IFNULL(
                                       (
                                           SELECT JSON_ARRAYAGG(
                                               JSON_OBJECT(
                                                   'WORKFLOW_TRANSITION_ID', wt.WORKFLOW_TRANSITION_ID,
                                                   'ACTION_CODE', wt.ACTION_CODE,
                                                   'TO_WORKFLOW_STEP_MASTER_ID', wt.TO_WORKFLOW_STEP_MASTER_ID,
                                                   'NEXT_STEP_CODE', next_wsm.STEP_CODE,
                                                   'NEXT_STATUS_ID', next_wsm.M_REQUEST_STATUS_ID,
                                                   'NEXT_STATUS_CODE', next_status.STATUS_CODE,
                                                   'NEXT_STATUS_LABEL', COALESCE(next_status.STATUS_LABEL_EN, next_status.STATUS_VALUE),
                                                    'TERMINAL_REQUEST_STATE_ID', wt.M_REQUEST_STATE_ID,
                                                    'TERMINAL_STATE', dataItem.TERMINAL_REQUEST_STATE_CODE_SQL,
                                                    'TERMINAL_IS_TERMINAL', dataItem.TERMINAL_REQUEST_STATE_FLAG_SQL,
                                                   'CONDITION_KEY', wt.CONDITION_KEY
                                               )
                                           )
                                           FROM workflow_transition wt
                                           LEFT JOIN workflow_step_master next_wsm
                                             ON next_wsm.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
                                           LEFT JOIN m_request_status next_status
                                             ON next_status.M_REQUEST_STATUS_ID = next_wsm.M_REQUEST_STATUS_ID
                                           WHERE wt.WORKFLOW_DEFINITION_ID = dataItem.REQUEST_ALIAS.WORKFLOW_DEFINITION_ID
                                             AND wt.FROM_WORKFLOW_STEP_MASTER_ID = (
                                                 SELECT active_task.WORKFLOW_STEP_MASTER_ID
                                                 FROM request_approval_step active_task
                                                 WHERE active_task.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_ALIAS.CURRENT_REQUEST_APPROVAL_STEP_ID
                                                   AND active_task.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_ALIAS.REQUEST_REGISTER_VENDOR_ID
                                                 LIMIT 1
                                             )
                                             AND wt.INUSE = 1
                                       ),
                                       JSON_ARRAY()
                                   )`
  sql = sql.replaceAll('dataItem.TERMINAL_REQUEST_STATE_CODE_SQL', String(RequestStateSqlSnippets.requestStateCodeByIdExpr('wt.M_REQUEST_STATE_ID')))
  sql = sql.replaceAll('dataItem.TERMINAL_REQUEST_STATE_FLAG_SQL', String(RequestStateSqlSnippets.requestStateIsTerminalByIdExpr('wt.M_REQUEST_STATE_ID')))
  sql = sql.replaceAll('dataItem.REQUEST_ALIAS', String(requestAlias))
  return sql
}

const queueStepConditionSql = (queueWorkflowStepMasterId: unknown, workflowStepAlias = 'wsm_my') => {
  const workflowStepMasterId = toPositiveInteger(queueWorkflowStepMasterId)
  if (!workflowStepMasterId) return ''

  let sql = 'dataItem.WORKFLOW_STEP_ALIAS.WORKFLOW_STEP_MASTER_ID = dataItem.QUEUE_WORKFLOW_STEP_MASTER_ID'
  sql = sql.replaceAll('dataItem.WORKFLOW_STEP_ALIAS', String(workflowStepAlias))
  sql = sql.replaceAll('dataItem.QUEUE_WORKFLOW_STEP_MASTER_ID', String(workflowStepMasterId))
  return sql
}

const myApprovalStatusExpr = (dataItem: any, returnStatusId = false) => {
  const approverEmpcode = escapeSqlLiteral(dataItem?.APPROVER_EMPCODE)
  if (!approverEmpcode) return 'NULL'

  const queueCondition = queueStepConditionSql(dataItem?.QUEUE_WORKFLOW_STEP_MASTER_ID)
  let queueConditionSql = queueCondition ? 'AND dataItem.QUEUE_CONDITION' : ''
  queueConditionSql = queueConditionSql.replaceAll('dataItem.QUEUE_CONDITION', queueCondition)

  let sql = `(
                                           SELECT dataItem.MY_APPROVAL_STATUS_VALUE
                                           FROM request_approval_step ras_my
                                                INNER JOIN workflow_step_master wsm_my
                                                  ON wsm_my.WORKFLOW_STEP_MASTER_ID = ras_my.WORKFLOW_STEP_MASTER_ID
                                                INNER JOIN m_request_status mrs_my
                                                  ON mrs_my.M_REQUEST_STATUS_ID = wsm_my.M_REQUEST_STATUS_ID
                                                INNER JOIN m_approval_step_status task_status_my
                                                  ON task_status_my.M_APPROVAL_STEP_STATUS_ID = ras_my.M_APPROVAL_STEP_STATUS_ID
                                           WHERE ras_my.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                                             AND ras_my.APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'
                                             AND ras_my.M_APPROVAL_STEP_STATUS_ID IN (
                                                 dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID,
                                                 dataItem.APPROVAL_STEP_APPROVED_STATUS_ID,
                                                 dataItem.APPROVAL_STEP_REJECTED_STATUS_ID
                                             )
                                             AND ras_my.INUSE = 1
                                             dataItem.QUEUE_CONDITION_SQL
                                           ORDER BY CASE ras_my.M_APPROVAL_STEP_STATUS_ID
                                                      WHEN dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID THEN 1
                                                      WHEN dataItem.APPROVAL_STEP_REJECTED_STATUS_ID THEN 2
                                                      WHEN dataItem.APPROVAL_STEP_APPROVED_STATUS_ID THEN 3
                                                      ELSE 4
                                                    END,
                                                    ras_my.STEP_ORDER ASC,
                                                    ras_my.REQUEST_APPROVAL_STEP_ID DESC
                                           LIMIT 1
                                       )`
  sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', String(approverEmpcode))
  sql = sql.replaceAll(
    'dataItem.MY_APPROVAL_STATUS_VALUE',
    returnStatusId ? 'ras_my.M_APPROVAL_STEP_STATUS_ID' : 'LOWER(task_status_my.STATUS_CODE)'
  )
  sql = sql.replaceAll('dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.IN_PROGRESS))
  sql = sql.replaceAll('dataItem.APPROVAL_STEP_APPROVED_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.APPROVED))
  sql = sql.replaceAll('dataItem.APPROVAL_STEP_REJECTED_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.REJECTED))
  sql = sql.replaceAll('dataItem.QUEUE_CONDITION_SQL', String(queueConditionSql))
  return sql
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
                                       info_business_category vt ON vt.BUSINESS_CATEGORY_ID = v.BUSINESS_CATEGORY_ID
                                            LEFT JOIN
                                       dataItem.MEMBER_TABLE m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       rr.INUSE = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
        `
    countSql = countSql.replaceAll('dataItem.MEMBER_TABLE', String(PersonSqlSnippets.memberTable()))

    let dataSql = `
                            SELECT
                                       rr.REQUEST_REGISTER_VENDOR_ID
                                     , rr.REQUEST_NUMBER
                                     , rr.VENDORS_ID
                                     , dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS
                                     , rr.M_REQUEST_STATE_ID
                                     , dataItem.REQUEST_STATE_SQL AS REQUEST_STATE
                                     , rr.CURRENT_M_REQUEST_STATUS_ID
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , rr.WORKFLOW_DEFINITION_ID
                                     , rr.LOCK_VERSION
                                     , current_ras.WORKFLOW_STEP_MASTER_ID AS CURRENT_WORKFLOW_STEP_MASTER_ID
                                     , current_wsm.STEP_CODE AS CURRENT_STEP_CODE
                                     , LOWER(current_task_status.STATUS_CODE) AS CURRENT_STEP_STATUS
                                     , current_ras.M_APPROVAL_STEP_STATUS_ID AS CURRENT_STEP_STATUS_ID
                                     , current_ras.APPROVER_EMPCODE AS CURRENT_STEP_APPROVER_EMPCODE
                                     , dataItem.MY_APPROVAL_STATUS_SQL AS MY_APPROVAL_STATUS
                                     , dataItem.MY_APPROVAL_STATUS_ID_SQL AS MY_APPROVAL_STATUS_ID
                                     , dataItem.ALLOWED_ACTIONS_SQL AS ALLOWED_ACTIONS
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL AS VENDOR_CONTACTS_ID
                                     , rr.REQUESTER_REMARK
                                     , rr.APPROVED_VENDOR_CODE AS VENDOR_CODE
                                     , rr.REQUEST_BY_EMPLOYEECODE AS EMPLOYEE_CODE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS FULL_NAME
                                     , m.EMPDEPT AS EMPLOYEE_DEPT
                                     , rr.REQUESTER_SECTION
                                     , rr.CREATE_DATE
                                     , YEAR(rr.CREATE_DATE) AS REQUEST_YEAR

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
                                                 AND COALESCE(f.GPR_C_APPROVER_EMPCODE, '') <> ''
                                                 AND COALESCE(f.GPR_C_APPROVER_NAME, '') <> ''
                                                 AND COALESCE(f.GPR_C_APPROVER_EMAIL, '') <> ''
                                                 AND COALESCE(f.PC_PIC_EMPCODE, '') <> ''
                                                 AND COALESCE(f.PC_PIC_NAME, '') <> ''
                                                 AND COALESCE(f.PC_PIC_EMAIL, '') <> ''
                                           )
                                           AND EXISTS (
                                               SELECT 1
                                               FROM request_vendor_gpr_c_product_group_checkers pgc
                                               WHERE pgc.REQUEST_VENDOR_SELECTIONS_ID = rvs.REQUEST_VENDOR_SELECTIONS_ID
                                                 AND pgc.INUSE = 1
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
                                       m_approval_step_status current_task_status
                                         ON current_task_status.M_APPROVAL_STEP_STATUS_ID = current_ras.M_APPROVAL_STEP_STATUS_ID
                                            LEFT JOIN
                                       workflow_step_master current_wsm ON current_wsm.WORKFLOW_STEP_MASTER_ID = current_ras.WORKFLOW_STEP_MASTER_ID
                                            LEFT JOIN
                                       vendors v ON v.VENDORS_ID = rr.VENDORS_ID
                                            LEFT JOIN
                                       info_business_category vt ON vt.BUSINESS_CATEGORY_ID = v.BUSINESS_CATEGORY_ID
                                            LEFT JOIN
                                       dataItem.MEMBER_TABLE m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
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
    dataSql = dataSql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    dataSql = dataSql.replaceAll('dataItem.REQUEST_STATE_SQL', String(RequestStateSqlSnippets.requestStateCodeExpr('rr')))
    dataSql = dataSql.replaceAll('dataItem.MY_APPROVAL_STATUS_SQL', String(myApprovalStatusExpr(dataItem)))
    dataSql = dataSql.replaceAll('dataItem.MY_APPROVAL_STATUS_ID_SQL', String(myApprovalStatusExpr(dataItem, true)))
    dataSql = dataSql.replaceAll('dataItem.ALLOWED_ACTIONS_SQL', String(allowedActionsExpr('rr')))
    dataSql = dataSql.replaceAll('dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL', String(RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')))
    dataSql = dataSql.replaceAll('dataItem.MEMBER_TABLE', String(PersonSqlSnippets.memberTable()))
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

  getRequestStatusAndAssign: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS
                                     , ASSIGN_TO
                                     , rr.M_REQUEST_STATE_ID
                                     , dataItem.REQUEST_STATE_SQL AS REQUEST_STATE
                                     , CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , LOCK_VERSION
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
                                     , wsm.REQUIRES_VENDOR_REPLY
                                     , wsm.REQUIRES_VENDOR_CODE
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

  getWorkflowTransitions: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       wt.WORKFLOW_TRANSITION_ID
                                     , wt.WORKFLOW_DEFINITION_ID
                                     , wt.FROM_WORKFLOW_STEP_MASTER_ID
                                     , wt.ACTION_CODE
                                     , wt.TO_WORKFLOW_STEP_MASTER_ID
                                     , wt.M_REQUEST_STATE_ID AS TERMINAL_REQUEST_STATE_ID
                                     , dataItem.TERMINAL_REQUEST_STATE_CODE_SQL AS TERMINAL_STATE
                                     , dataItem.TERMINAL_REQUEST_STATE_FLAG_SQL AS TERMINAL_IS_TERMINAL
                                     , wt.CONDITION_KEY
                                     , wt.PRIORITY_NO
                                     , target_task.REQUEST_APPROVAL_STEP_ID AS NEXT_REQUEST_APPROVAL_STEP_ID
                                     , target_task.STEP_ORDER AS NEXT_STEP_ORDER
                                     , target_task.APPROVER_EMPCODE AS NEXT_APPROVER_EMPCODE
                                     , target_task.APPROVAL_GROUP_MEMBER_ID AS NEXT_APPROVAL_GROUP_MEMBER_ID
                                     , target_task.M_APPROVAL_STEP_STATUS_ID AS NEXT_STEP_STATUS_ID
                                     , LOWER(target_task_status.STATUS_CODE) AS NEXT_STEP_STATUS
                                     , target_task.APPROVAL_GROUP_ID AS NEXT_APPROVAL_GROUP_ID
                                     , target_task_group.GROUP_CODE AS NEXT_GROUP_CODE
                                     , target_task.ASSIGNMENT_MODE AS NEXT_ASSIGNMENT_MODE
                                     , target_wsm.M_REQUEST_STATUS_ID AS NEXT_M_REQUEST_STATUS_ID
                                     , target_wsm.STEP_CODE AS NEXT_STEP_CODE
                                     , target_wsm.ACTOR_TYPE AS NEXT_ACTOR_TYPE
                                     , target_wsm.DEFAULT_APPROVAL_GROUP_ID_LOCAL AS NEXT_DEFAULT_APPROVAL_GROUP_ID_LOCAL
                                     , target_wsm.DEFAULT_APPROVAL_GROUP_ID_OVERSEA AS NEXT_DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                                     , COALESCE(local_group.GROUP_CODE, target_wsm.DEFAULT_GROUP_CODE_LOCAL) AS NEXT_DEFAULT_GROUP_CODE_LOCAL
                                     , COALESCE(oversea_group.GROUP_CODE, target_wsm.DEFAULT_GROUP_CODE_OVERSEA) AS NEXT_DEFAULT_GROUP_CODE_OVERSEA
                                     , target_wsm.REQUIRES_VENDOR_REPLY AS NEXT_REQUIRES_VENDOR_REPLY
                                     , target_wsm.REQUIRES_VENDOR_CODE AS NEXT_REQUIRES_VENDOR_CODE
                                     , target_status.STATUS_VALUE AS NEXT_STATUS_VALUE
                            FROM request_register_vendor rr
                            INNER JOIN workflow_transition wt
                             ON wt.WORKFLOW_DEFINITION_ID = rr.WORKFLOW_DEFINITION_ID
                             AND wt.FROM_WORKFLOW_STEP_MASTER_ID = dataItem.CURRENT_WORKFLOW_STEP_MASTER_ID
                             AND wt.WORKFLOW_TRANSITION_ID = dataItem.WORKFLOW_TRANSITION_ID
                             AND wt.INUSE = 1
                            LEFT JOIN workflow_step_master target_wsm
                              ON target_wsm.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
                            LEFT JOIN m_request_status target_status
                              ON target_status.M_REQUEST_STATUS_ID = target_wsm.M_REQUEST_STATUS_ID
                            LEFT JOIN request_approval_step target_task
                              ON target_task.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND target_task.WORKFLOW_STEP_MASTER_ID = wt.TO_WORKFLOW_STEP_MASTER_ID
                             AND target_task.INUSE = 1
                            LEFT JOIN m_approval_step_status target_task_status
                              ON target_task_status.M_APPROVAL_STEP_STATUS_ID = target_task.M_APPROVAL_STEP_STATUS_ID
                            LEFT JOIN approval_group target_task_group
                              ON target_task_group.APPROVAL_GROUP_ID = target_task.APPROVAL_GROUP_ID
                            LEFT JOIN approval_group local_group
                              ON local_group.APPROVAL_GROUP_ID = target_wsm.DEFAULT_APPROVAL_GROUP_ID_LOCAL
                            LEFT JOIN approval_group oversea_group
                              ON oversea_group.APPROVAL_GROUP_ID = target_wsm.DEFAULT_APPROVAL_GROUP_ID_OVERSEA
                            WHERE rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                              AND rr.M_REQUEST_STATE_ID = dataItem.REQUEST_IN_PROGRESS_STATE_ID
                              AND rr.INUSE = 1
                            ORDER BY wt.PRIORITY_NO ASC, wt.WORKFLOW_TRANSITION_ID ASC
        `
    sql = sql.replaceAll('dataItem.TERMINAL_REQUEST_STATE_CODE_SQL', String(RequestStateSqlSnippets.requestStateCodeByIdExpr('wt.M_REQUEST_STATE_ID')))
    sql = sql.replaceAll('dataItem.TERMINAL_REQUEST_STATE_FLAG_SQL', String(RequestStateSqlSnippets.requestStateIsTerminalByIdExpr('wt.M_REQUEST_STATE_ID')))
    sql = sql.replaceAll(
      'dataItem.REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_IN_PROGRESS_STATE_ID'], 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CURRENT_WORKFLOW_STEP_MASTER_ID', (dataItem['CURRENT_WORKFLOW_STEP_MASTER_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.WORKFLOW_TRANSITION_ID', (toPositiveInteger(dataItem['WORKFLOW_TRANSITION_ID']) || 0).toString())

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
                                     , WORKFLOW_STEP_MASTER_ID
                                     , ACTION_BY
                                     , ACTION_BY_NAME
                                     , ACTION_TYPE
                                     , ACTION_CODE
                                     , STEP_CODE_SNAPSHOT
                                     , STATUS_LABEL_SNAPSHOT
                                     , DESCRIPTION
                                     , REJECT_REASON
                                     , RECHECK_REASON
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
                                        JOIN workflow_step_master wsm
                                          ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                        WHERE ras.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                                          AND ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                        LIMIT 1)
                                     , (SELECT COALESCE(mrs.STATUS_LABEL_EN, mrs.STATUS_VALUE)
                                        FROM request_approval_step ras
                                        JOIN workflow_step_master wsm
                                          ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                                        JOIN m_request_status mrs
                                          ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                                        WHERE ras.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                                          AND ras.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                        LIMIT 1)
                                     , LEFT('dataItem.REMARK', 100)
                                     , CASE
                                           WHEN LOWER('dataItem.ACTION_TYPE') IN (
                                               'rejected',
                                               'vendor_disagreed'
                                           ) THEN LEFT('dataItem.REJECT_REASON', 500)
                                           ELSE NULL
                                       END
                                     , CASE
                                           WHEN UPPER('dataItem.ACTION_CODE') = 'RECHECK' THEN LEFT('dataItem.RECHECK_REASON', 500)
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
    sql = sql.replaceAll(
      'dataItem.ACTION_CODE',
      String(dataItem['ACTION_CODE'] || dataItem['ACTION_TYPE'] || '')
        .trim()
        .toUpperCase()
    )
    sql = sql.replaceAll('dataItem.REMARK', dataItem['REMARK'])
    // Reject and re-check reasons are intentionally stored in separate dedicated columns.
    sql = sql.replaceAll('dataItem.REJECT_REASON', dataItem['REJECT_REASON'] ?? dataItem['REMARK'] ?? '')
    sql = sql.replaceAll('dataItem.RECHECK_REASON', dataItem['RECHECK_REASON'] ?? '')

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

  getRequestStatusContext: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.VENDORS_ID
                                     , rr.ASSIGN_TO
                                     , rr.REQUEST_NUMBER
                                     , rr.CREATE_DATE
                                     , rr.M_REQUEST_STATE_ID
                                     , dataItem.REQUEST_STATE_SQL AS REQUEST_STATE
                                     , rr.WORKFLOW_DEFINITION_ID
                                     , rr.CURRENT_M_REQUEST_STATUS_ID
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , rr.LOCK_VERSION
                                     , rvs.PROPOSED_VENDOR_CODE AS VENDOR_CODE_SELECTOR
                                     dataItem.GPR_C_SELECTION_FIELDS_SQL
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
    sql = sql.replaceAll('dataItem.REQUEST_STATE_SQL', String(RequestStateSqlSnippets.requestStateCodeExpr('rr')))
    sql = sql.replaceAll('dataItem.GPR_C_SELECTION_FIELDS_SQL', String(GprCSelectionSqlSnippets.gprCSelectionFields('rvs', 'rr')))

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
                                       agm.EMPCODE
                                     , agm.EMPNAME
                                     , agm.EMPEMAIL
                                     , ag.APPROVAL_GROUP_ID
                                     , agm.APPROVAL_GROUP_MEMBER_ID
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
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')

    return sql
  },

  getActiveAssigneeByEmpCodeAndGroupCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       agm.APPROVAL_GROUP_MEMBER_ID AS ASSIGNEES_TO_ID
                                     , agm.APPROVAL_GROUP_MEMBER_ID
                                     , ag.APPROVAL_GROUP_ID
                                     , agm.EMPCODE
                                     , agm.EMPNAME
                                     , agm.EMPEMAIL
                                     , ag.GROUP_CODE
                                     , ag.GROUP_NAME
                                     , agm.INUSE
                            FROM
                                       approval_group_member agm
                                            JOIN
                                       approval_group ag ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
                            WHERE
                                       agm.EMPCODE = 'dataItem.EMPCODE'
                                       AND ag.GROUP_CODE = 'dataItem.GROUP_CODE'
                                       AND ag.INUSE = 1
                                       AND agm.INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'])
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'])
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
                                       vsc.CRITERIA_NO AS NO
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
    const vendorStatusId = requireVendorStatusId(dataItem['M_VENDOR_STATUS_ID'], 'M_VENDOR_STATUS_ID')
    let sql = `
                            UPDATE vendors SET
                                       FFT_STATUS = dataItem.FFT_STATUS_ID
                            WHERE
                                       VENDORS_ID = dataItem.VENDORS_ID
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.FFT_STATUS_ID', vendorStatusId.toString())

    return sql
  },

  updateApprovalStep: async (dataItem: any) => {
    const stepStatusId = requireStatusId(dataItem['M_APPROVAL_STEP_STATUS_ID'], 'M_APPROVAL_STEP_STATUS_ID')
    const inProgressStatusId = requireStatusId(
      dataItem['M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID'],
      'M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID'
    )
    const rejectedApprovalStatusId = requireStatusId(
      dataItem['M_APPROVAL_STEP_REJECTED_STATUS_ID'],
      'M_APPROVAL_STEP_REJECTED_STATUS_ID'
    )
    const rejectedRequestStateId = requireStatusId(
      dataItem['M_REQUEST_REJECTED_STATE_ID'],
      'M_REQUEST_REJECTED_STATE_ID'
    )
    const inProgressRequestStateId = requireStatusId(
      dataItem['M_REQUEST_IN_PROGRESS_STATE_ID'],
      'M_REQUEST_IN_PROGRESS_STATE_ID'
    )
    const rejectedRequestStatusId = requireStatusId(
      dataItem['M_REQUEST_REJECTED_STATUS_ID'],
      'M_REQUEST_REJECTED_STATUS_ID'
    )
    let sql = `
                            UPDATE request_approval_step SET
                                       M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_STATUS_ID
                                     , ASSIGNED_DATE = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID
                                             THEN COALESCE(ASSIGNED_DATE, NOW())
                                           ELSE ASSIGNED_DATE
                                       END
                                     , COMPLETED_DATE = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID IN (
                                               dataItem.TERMINAL_APPROVAL_STEP_STATUS_IDS_SQL
                                           ) THEN COALESCE(COMPLETED_DATE, NOW())
                                           ELSE NULL
                                       END
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID;

                            UPDATE request_register_vendor rr
                            LEFT JOIN request_approval_step changed_step
                              ON changed_step.REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
                            LEFT JOIN request_approval_step active_step
                              ON active_step.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                             AND active_step.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID
                             AND active_step.INUSE = 1
                            LEFT JOIN workflow_step_master active_wsm
                              ON active_wsm.WORKFLOW_STEP_MASTER_ID = active_step.WORKFLOW_STEP_MASTER_ID
                            SET
                                       rr.M_REQUEST_STATE_ID = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_REJECTED_STATUS_ID THEN dataItem.REQUEST_REJECTED_STATE_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN dataItem.REQUEST_IN_PROGRESS_STATE_ID
                                           ELSE rr.M_REQUEST_STATE_ID
                                       END
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_REJECTED_STATUS_ID
                                             THEN changed_step.REQUEST_APPROVAL_STEP_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN active_step.REQUEST_APPROVAL_STEP_ID
                                           ELSE rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                       END
                                     , rr.CURRENT_M_REQUEST_STATUS_ID = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_REJECTED_STATUS_ID
                                             THEN dataItem.REQUEST_REJECTED_STATUS_ID
                                           WHEN active_step.REQUEST_APPROVAL_STEP_ID IS NOT NULL THEN active_wsm.M_REQUEST_STATUS_ID
                                           ELSE rr.CURRENT_M_REQUEST_STATUS_ID
                                       END
                                     , rr.UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , rr.UPDATE_DATE = NOW()
                            WHERE
                                       rr.REQUEST_REGISTER_VENDOR_ID = changed_step.REQUEST_REGISTER_VENDOR_ID
        `
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID', inProgressStatusId.toString())
    sql = sql.replaceAll('dataItem.TERMINAL_APPROVAL_STEP_STATUS_IDS_SQL', String(ApprovalMasterSqlSnippets.terminalStepStatusIdsExpr()))
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_REJECTED_STATUS_ID', rejectedApprovalStatusId.toString())
    sql = sql.replaceAll('dataItem.REQUEST_REJECTED_STATE_ID', rejectedRequestStateId.toString())
    sql = sql.replaceAll('dataItem.REQUEST_IN_PROGRESS_STATE_ID', inProgressRequestStateId.toString())
    sql = sql.replaceAll('dataItem.REQUEST_REJECTED_STATUS_ID', rejectedRequestStatusId.toString())

    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', (dataItem['REQUEST_APPROVAL_STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.M_APPROVAL_STEP_STATUS_ID', stepStatusId.toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  updateApprovalStepApprover: async (dataItem: any) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'
                                     , APPROVAL_GROUP_MEMBER_ID = (
                                           SELECT agm.APPROVAL_GROUP_MEMBER_ID
                                           FROM approval_group_member agm
                                           WHERE agm.APPROVAL_GROUP_ID = request_approval_step.APPROVAL_GROUP_ID
                                             AND agm.EMPCODE = 'dataItem.APPROVER_EMPCODE'
                                             AND agm.INUSE = 1
                                           ORDER BY agm.IS_PRIMARY DESC, agm.PRIORITY_NO, agm.APPROVAL_GROUP_MEMBER_ID
                                           LIMIT 1
                                       )
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
                                       M_REQUEST_STATE_ID = dataItem.REQUEST_COMPLETED_STATE_ID
                                     , CURRENT_REQUEST_APPROVAL_STEP_ID = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `
    sql = sql.replaceAll(
      'dataItem.REQUEST_COMPLETED_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_COMPLETED_STATE_ID'], 'M_REQUEST_COMPLETED_STATE_ID').toString()
    )

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  skipPendingApprovalSteps: async (dataItem: any) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_SKIPPED_STATUS_ID
                                     , COMPLETED_DATE = COALESCE(COMPLETED_DATE, NOW())
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                              AND M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_PENDING_STATUS_ID
                              AND INUSE = 1
        `
    sql = sql.replaceAll(
      'dataItem.APPROVAL_STEP_SKIPPED_STATUS_ID',
      requireStatusId(dataItem['M_APPROVAL_STEP_SKIPPED_STATUS_ID'], 'M_APPROVAL_STEP_SKIPPED_STATUS_ID').toString()
    )
    sql = sql.replaceAll(
      'dataItem.APPROVAL_STEP_PENDING_STATUS_ID',
      requireStatusId(dataItem['M_APPROVAL_STEP_PENDING_STATUS_ID'], 'M_APPROVAL_STEP_PENDING_STATUS_ID').toString()
    )

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')
    return sql
  },

  acquireWorkflowLock: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor
                            SET LOCK_VERSION = LOCK_VERSION + 1,
                                UPDATE_BY = 'dataItem.UPDATE_BY',
                                UPDATE_DATE = NOW()
                            WHERE REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                              AND CURRENT_REQUEST_APPROVAL_STEP_ID = dataItem.CURRENT_TASK_ID
                              AND LOCK_VERSION = dataItem.LOCK_VERSION
                              AND M_REQUEST_STATE_ID = dataItem.REQUEST_IN_PROGRESS_STATE_ID
                              AND INUSE = 1
        `
    sql = sql.replaceAll(
      'dataItem.REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_IN_PROGRESS_STATE_ID'], 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CURRENT_TASK_ID', (dataItem['CURRENT_TASK_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.LOCK_VERSION', Number(dataItem['LOCK_VERSION'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')
    return sql
  },

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
                                     , dataItem.SELECTION_SHEET_EDITABLE_SQL AS IS_SELECTION_SHEET_EDITABLE
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , rr.WORKFLOW_DEFINITION_ID
                                     , rr.LOCK_VERSION
                                     , current_ras.WORKFLOW_STEP_MASTER_ID AS CURRENT_WORKFLOW_STEP_MASTER_ID
                                     , current_wsm.STEP_CODE AS CURRENT_STEP_CODE
                                     , current_status.STATUS_CODE AS CURRENT_STATUS_CODE
                                     , dataItem.ALLOWED_ACTIONS_SQL AS ALLOWED_ACTIONS
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
                                     , rvs.PROPOSED_VENDOR_CODE
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
                                                                               'CREATE_DATE', ral.CREATE_DATE
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
                                                                      rvs2.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID AND rvs2.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS GPR_CRITERIA

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       request_approval_step current_ras ON current_ras.REQUEST_APPROVAL_STEP_ID = rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                            LEFT JOIN
                                       workflow_step_master current_wsm ON current_wsm.WORKFLOW_STEP_MASTER_ID = current_ras.WORKFLOW_STEP_MASTER_ID
                                            LEFT JOIN
                                       m_request_status current_status ON current_status.M_REQUEST_STATUS_ID = rr.CURRENT_M_REQUEST_STATUS_ID
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
    sql = sql.replaceAll('dataItem.ALLOWED_ACTIONS_SQL', String(allowedActionsExpr('rr')))
    sql = sql.replaceAll('dataItem.LATEST_APPROVAL_REMARK_SQL', String(RequestApprovalSummarySqlSnippets.latestApprovalRemarkExpr('rr.REQUEST_REGISTER_VENDOR_ID')))
    sql = sql.replaceAll('dataItem.LATEST_REJECT_REASON_SQL', String(RequestApprovalSummarySqlSnippets.latestRejectReasonExpr('rr.REQUEST_REGISTER_VENDOR_ID')))
    sql = sql.replaceAll('dataItem.LATEST_APPROVAL_DATE_SQL', String(RequestApprovalSummarySqlSnippets.latestApprovalDateExpr('rr.REQUEST_REGISTER_VENDOR_ID')))
    sql = sql.replaceAll(
      'dataItem.SELECTION_SHEET_EDITABLE_SQL',
      String(SelectionSheetAccessSqlSnippets.editableExpr('rr', dataItem))
    )
    sql = sql.replaceAll('dataItem.PRIMARY_VENDOR_CONTACT_ID_SQL', String(RequestVendorContactSqlSnippets.primaryVendorContactIdExpr('rr')))
    sql = sql.replaceAll('dataItem.GPR_C_SELECTION_FIELDS_SQL', String(GprCSelectionSqlSnippets.gprCSelectionFields('rvs', 'rr')))
    sql = sql.replaceAll('dataItem.MEMBER_TABLE', String(PersonSqlSnippets.memberTable()))

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getAssigneeByEmpCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       agm.APPROVAL_GROUP_MEMBER_ID AS ASSIGNEES_TO_ID
                                     , agm.APPROVAL_GROUP_MEMBER_ID
                                     , ag.APPROVAL_GROUP_ID
                                     , agm.EMPCODE
                                     , agm.EMPNAME
                                     , agm.EMPEMAIL
                                     , ag.GROUP_CODE
                                     , ag.GROUP_NAME
                                     , agm.INUSE
                            FROM
                                       approval_group_member agm
                                            JOIN
                                       approval_group ag ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
                            WHERE
                                       agm.EMPCODE = 'dataItem.TO_EMPCODE'
                                       AND agm.INUSE = 1
                             ORDER BY
                                       agm.IS_PRIMARY DESC
                                     , agm.PRIORITY_NO ASC
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
}
