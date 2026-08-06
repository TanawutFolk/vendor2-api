// Shared by pages that display the latest request approval result.
export const RequestApprovalSummarySqlSnippets = {
  latestApprovalLogValueExpr: (requestIdSql: any, columnSql: any) => {
    let sql = `
                                           SELECT dataItem.APPROVAL_LOG_COLUMN_SQL
                                           FROM request_approval_log ral
                                           WHERE ral.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_ID_SQL
                                             AND ral.INUSE = 1
                                           ORDER BY ral.CREATE_DATE DESC, ral.REQUEST_APPROVAL_LOG_ID DESC
                                           LIMIT 1
                                       `
    sql = sql.replaceAll('dataItem.APPROVAL_LOG_COLUMN_SQL', String(columnSql))
    sql = sql.replaceAll('dataItem.REQUEST_ID_SQL', String(requestIdSql))
    return sql
  },

  latestApprovalDateExpr: (requestIdSql: any) =>
    {
    let sql = '(dataItem.LATEST_APPROVAL_DATE_SQL)'
    sql = sql.replaceAll('dataItem.LATEST_APPROVAL_DATE_SQL', String(RequestApprovalSummarySqlSnippets.latestApprovalLogValueExpr(requestIdSql, 'ral.CREATE_DATE')))
    return sql
  },

  latestApprovalRemarkExpr: (requestIdSql: any) =>
    {
    let sql = '(dataItem.LATEST_APPROVAL_REMARK_SQL)'
    sql = sql.replaceAll('dataItem.LATEST_APPROVAL_REMARK_SQL', String(RequestApprovalSummarySqlSnippets.latestApprovalLogValueExpr(requestIdSql, 'ral.DESCRIPTION')))
    return sql
  },

  latestRejectReasonExpr: (requestIdSql: any) => {
    let sql = `
                                           SELECT COALESCE(NULLIF(ral.REJECT_REASON, ''), ral.DESCRIPTION)
                                           FROM request_approval_log ral
                                           WHERE ral.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_ID_SQL
                                             AND ral.INUSE = 1
                                             AND LOWER(ral.ACTION_TYPE) IN ('rejected', 'vendor_disagreed')
                                           ORDER BY ral.CREATE_DATE DESC, ral.REQUEST_APPROVAL_LOG_ID DESC
                                           LIMIT 1
                                       `
    sql = sql.replaceAll('dataItem.REQUEST_ID_SQL', String(requestIdSql))
    return sql
  },
}
