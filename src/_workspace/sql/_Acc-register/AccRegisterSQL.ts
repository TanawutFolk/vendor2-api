import {
  ApprovalMasterSqlSnippets,
} from '../_status-master/StatusMasterSQL'
import { RequestStateSqlSnippets } from '../_status-master/StatusMasterSQL'
import { requireStatusId, requireVendorStatusId } from '../../utils/StatusId'

export const AccRegisterSQL = {
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

  getSelectionVendorCode: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       PROPOSED_VENDOR_CODE AS VENDOR_CODE
                            FROM
                                       request_vendor_selections
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                                       AND INUSE = 1
                            ORDER BY
                                       REQUEST_VENDOR_SELECTIONS_ID DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())

    return sql
  },

  getWorkflowContext: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       rr.REQUEST_REGISTER_VENDOR_ID
                                     , rr.VENDORS_ID
                                     , rr.M_REQUEST_STATE_ID
                                     , dataItem.REQUEST_STATE_SQL AS REQUEST_STATE
                                     , rr.WORKFLOW_DEFINITION_ID
                                     , rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                                     , rr.LOCK_VERSION
                                     , ras.WORKFLOW_STEP_MASTER_ID
                                     , ras.M_APPROVAL_STEP_STATUS_ID
                                     , LOWER(task_status.STATUS_CODE) AS STEP_STATUS
                                     , wsm.STEP_CODE
                            FROM request_register_vendor rr
                            LEFT JOIN request_approval_step ras
                              ON ras.REQUEST_APPROVAL_STEP_ID = rr.CURRENT_REQUEST_APPROVAL_STEP_ID
                             AND ras.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                            LEFT JOIN workflow_step_master wsm
                              ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                            LEFT JOIN m_approval_step_status task_status
                              ON task_status.M_APPROVAL_STEP_STATUS_ID = ras.M_APPROVAL_STEP_STATUS_ID
                            WHERE rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                              AND rr.INUSE = 1
                            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_STATE_SQL', String(RequestStateSqlSnippets.requestStateCodeExpr('rr')))
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    return sql
  },

  getWorkflowTransition: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       wt.WORKFLOW_TRANSITION_ID
                                     , wt.ACTION_CODE
                                     , wt.TO_WORKFLOW_STEP_MASTER_ID
                                     , wt.M_REQUEST_STATE_ID AS TERMINAL_REQUEST_STATE_ID
                                     , dataItem.TERMINAL_REQUEST_STATE_CODE_SQL AS TERMINAL_STATE
                                     , dataItem.TERMINAL_REQUEST_STATE_FLAG_SQL AS TERMINAL_IS_TERMINAL
                            FROM request_register_vendor rr
                            INNER JOIN workflow_transition wt
                              ON wt.WORKFLOW_DEFINITION_ID = rr.WORKFLOW_DEFINITION_ID
                             AND wt.FROM_WORKFLOW_STEP_MASTER_ID = dataItem.CURRENT_WORKFLOW_STEP_MASTER_ID
                             AND wt.TO_WORKFLOW_STEP_MASTER_ID IS NULL
                             AND wt.M_REQUEST_STATE_ID = dataItem.TERMINAL_REQUEST_STATE_ID
                             AND wt.INUSE = 1
                            WHERE rr.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
                            ORDER BY wt.PRIORITY_NO, wt.WORKFLOW_TRANSITION_ID
                            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.TERMINAL_REQUEST_STATE_CODE_SQL', String(RequestStateSqlSnippets.requestStateCodeByIdExpr('wt.M_REQUEST_STATE_ID')))
    sql = sql.replaceAll('dataItem.TERMINAL_REQUEST_STATE_FLAG_SQL', String(RequestStateSqlSnippets.requestStateIsTerminalByIdExpr('wt.M_REQUEST_STATE_ID')))
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CURRENT_WORKFLOW_STEP_MASTER_ID', (dataItem['CURRENT_WORKFLOW_STEP_MASTER_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.TERMINAL_REQUEST_STATE_ID', (dataItem['TERMINAL_REQUEST_STATE_ID'] || 0).toString())
    return sql
  },
  updateApprovalStep: async (dataItem: any) => {
    const stepStatusId = requireStatusId(dataItem['M_APPROVAL_STEP_STATUS_ID'], 'M_APPROVAL_STEP_STATUS_ID')
    let sql = `
                            UPDATE request_approval_step SET
                                       M_APPROVAL_STEP_STATUS_ID = dataItem.M_APPROVAL_STEP_STATUS_ID
                                     , COMPLETED_DATE = CASE
                                           WHEN dataItem.M_APPROVAL_STEP_STATUS_ID IN (
                                               dataItem.TERMINAL_APPROVAL_STEP_STATUS_IDS_SQL
                                           ) THEN COALESCE(COMPLETED_DATE, NOW())
                                           ELSE COMPLETED_DATE
                                       END
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_APPROVAL_STEP_ID = dataItem.REQUEST_APPROVAL_STEP_ID
        `
    sql = sql.replaceAll('dataItem.TERMINAL_APPROVAL_STEP_STATUS_IDS_SQL', String(ApprovalMasterSqlSnippets.terminalStepStatusIdsExpr()))

    sql = sql.replaceAll('dataItem.REQUEST_APPROVAL_STEP_ID', (dataItem['REQUEST_APPROVAL_STEP_ID'] || 0).toString())
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

  completeRegistration: async (dataItem: any) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       APPROVED_VENDOR_CODE = 'dataItem.VENDOR_CODE'
                                     , M_REQUEST_STATE_ID = dataItem.M_REQUEST_COMPLETED_STATE_ID
                                     , CURRENT_REQUEST_APPROVAL_STEP_ID = NULL
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        `
    sql = sql.replaceAll(
      'dataItem.M_REQUEST_COMPLETED_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_COMPLETED_STATE_ID'], 'M_REQUEST_COMPLETED_STATE_ID').toString()
    )

    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_CODE', dataItem['VENDOR_CODE'] || '')
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
                              AND M_REQUEST_STATE_ID = dataItem.M_REQUEST_IN_PROGRESS_STATE_ID
                              AND INUSE = 1
        `
    sql = sql.replaceAll(
      'dataItem.M_REQUEST_IN_PROGRESS_STATE_ID',
      requireStatusId(dataItem['M_REQUEST_IN_PROGRESS_STATE_ID'], 'M_REQUEST_IN_PROGRESS_STATE_ID').toString()
    )
    sql = sql.replaceAll('dataItem.REQUEST_REGISTER_VENDOR_ID', (dataItem['REQUEST_REGISTER_VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CURRENT_TASK_ID', (dataItem['CURRENT_TASK_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.LOCK_VERSION', Number(dataItem['LOCK_VERSION'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')
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

}
