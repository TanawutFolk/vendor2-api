import { APPROVAL_STEP_STATUS_ID_SQL } from '../_status-master/StatusMasterSQL'

const escapeSqlText = (value: unknown) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")

const escapeSqlLiteral = (value: unknown) => String(value ?? '').replaceAll("'", "''")

export const ApprovalQueueSearchSQL = {
  requestStatusIdFilter: (dataItem: any) => {
    let sql = 'dataItem.REQUEST_ALIAS.CURRENT_M_REQUEST_STATUS_ID IN (dataItem.STATUS_IDS)'
    sql = sql.replaceAll('dataItem.REQUEST_ALIAS', dataItem.REQUEST_ALIAS || 'rr')
    sql = sql.replaceAll('dataItem.STATUS_IDS', dataItem.STATUS_IDS || '')
    return sql
  },

  queueStepCondition: (dataItem: any) => {
    const workflowStepTypeId = Number(dataItem.QUEUE_WORKFLOW_STEP_TYPE_ID)
    if (Number.isInteger(workflowStepTypeId) && workflowStepTypeId > 0) {
      let sql = 'wsm.WORKFLOW_STEP_TYPE_ID = dataItem.QUEUE_WORKFLOW_STEP_TYPE_ID'
      sql = sql.replaceAll('dataItem.QUEUE_WORKFLOW_STEP_TYPE_ID', String(workflowStepTypeId))
      return sql
    }

    const workflowStepMasterId = Number(dataItem.QUEUE_WORKFLOW_STEP_MASTER_ID)
    if (!Number.isInteger(workflowStepMasterId) || workflowStepMasterId <= 0) return ''

    let sql = 'ras.WORKFLOW_STEP_MASTER_ID = dataItem.QUEUE_WORKFLOW_STEP_MASTER_ID'
    sql = sql.replaceAll('dataItem.QUEUE_WORKFLOW_STEP_MASTER_ID', String(workflowStepMasterId))
    return sql
  },

  approvalActorFilter: (dataItem: any) => {
    let sql = `
      EXISTS (
        SELECT 1
        FROM request_approval_step ras
        INNER JOIN workflow_step_master wsm
          ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
        INNER JOIN m_request_status mrs
          ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
        WHERE ras.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
          AND ras.APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'
          AND ras.M_APPROVAL_STEP_STATUS_ID IN (
            dataItem.IN_PROGRESS_STATUS_ID,
            dataItem.APPROVED_STATUS_ID,
            dataItem.REJECTED_STATUS_ID
          )
          dataItem.QUEUE_STEP_CONDITION
          AND ras.INUSE = 1
      )
    `

    sql = sql.replaceAll(
      'dataItem.APPROVER_EMPCODE',
      escapeSqlText(dataItem.APPROVER_EMPCODE),
    )
    sql = sql.replaceAll(
      'dataItem.IN_PROGRESS_STATUS_ID',
      APPROVAL_STEP_STATUS_ID_SQL.IN_PROGRESS,
    )
    sql = sql.replaceAll('dataItem.APPROVED_STATUS_ID', APPROVAL_STEP_STATUS_ID_SQL.APPROVED)
    sql = sql.replaceAll('dataItem.REJECTED_STATUS_ID', APPROVAL_STEP_STATUS_ID_SQL.REJECTED)
    sql = sql.replaceAll(
      'dataItem.QUEUE_STEP_CONDITION',
      dataItem.QUEUE_STEP_CONDITION ? 'AND ' + dataItem.QUEUE_STEP_CONDITION : '',
    )
    return sql
  },

  assignedPicFilter: (dataItem: any) => {
    let sql = "rr.ASSIGN_TO = 'dataItem.ASSIGN_TO'"
    sql = sql.replaceAll('dataItem.ASSIGN_TO', escapeSqlText(dataItem.ASSIGN_TO))
    return sql
  },

  requesterFilter: (dataItem: any) => {
    let sql = "rr.REQUEST_BY_EMPLOYEECODE = 'dataItem.REQUEST_BY_EMPLOYEECODE'"
    sql = sql.replaceAll(
      'dataItem.REQUEST_BY_EMPLOYEECODE',
      escapeSqlText(dataItem.REQUEST_BY_EMPLOYEECODE),
    )
    return sql
  },

  requesterSectionFilter: (dataItem: any) => {
    let sql = "rr.REQUESTER_SECTION = 'dataItem.REQUESTER_SECTION'"
    sql = sql.replaceAll(
      'dataItem.REQUESTER_SECTION',
      escapeSqlLiteral(dataItem.REQUESTER_SECTION),
    )
    return sql
  },

  requestYearFilter: (dataItem: any) => {
    let sql = `
      rr.CREATE_DATE >= 'dataItem.REQUEST_YEAR_FROM-01-01 00:00:00'
      AND rr.CREATE_DATE < 'dataItem.REQUEST_YEAR_TO-01-01 00:00:00'
    `
    sql = sql.replaceAll('dataItem.REQUEST_YEAR_FROM', String(dataItem.REQUEST_YEAR_FROM))
    sql = sql.replaceAll('dataItem.REQUEST_YEAR_TO', String(dataItem.REQUEST_YEAR_TO))
    return sql
  },
}
