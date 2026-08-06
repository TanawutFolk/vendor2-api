import { REQUEST_STATE_ID_SQL, RequestStateSqlSnippets } from '../_status-master/StatusMasterSQL'

// Shared request-status projection backed by the status master tables.
export const RequestStatusSqlSnippets = {
  requestStatusExpr: (requestAlias = 'rr') => {
    let sql = `CASE
                                           WHEN dataItem.REQUEST_ALIAS.M_REQUEST_STATE_ID = dataItem.REQUEST_COMPLETED_STATE_ID THEN 'Completed'
                                           WHEN dataItem.REQUEST_ALIAS.M_REQUEST_STATE_ID = dataItem.REQUEST_REJECTED_STATE_ID THEN 'Rejected'
                                           WHEN dataItem.REQUEST_ALIAS.M_REQUEST_STATE_ID = dataItem.REQUEST_CANCELLED_STATE_ID THEN 'Cancelled'
                                           ELSE COALESCE((
                                               SELECT mrs.STATUS_VALUE
                                               FROM m_request_status mrs
                                               WHERE mrs.M_REQUEST_STATUS_ID = dataItem.REQUEST_ALIAS.CURRENT_M_REQUEST_STATUS_ID
                                               LIMIT 1
                                           ), dataItem.REQUEST_STATE_SQL)
                                       END`
    sql = sql.replaceAll('dataItem.REQUEST_ALIAS', String(requestAlias))
    sql = sql.replaceAll('dataItem.REQUEST_COMPLETED_STATE_ID', String(REQUEST_STATE_ID_SQL.COMPLETED))
    sql = sql.replaceAll('dataItem.REQUEST_REJECTED_STATE_ID', String(REQUEST_STATE_ID_SQL.REJECTED))
    sql = sql.replaceAll('dataItem.REQUEST_CANCELLED_STATE_ID', String(REQUEST_STATE_ID_SQL.CANCELLED))
    sql = sql.replaceAll('dataItem.REQUEST_STATE_SQL', String(RequestStateSqlSnippets.requestStateCodeExpr(requestAlias)))
    return sql
  },
}
