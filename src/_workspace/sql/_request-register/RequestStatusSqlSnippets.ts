export const RequestStatusSqlSnippets = {
  requestStatusExpr: (requestAlias = 'rr') => `CASE
                                           WHEN LOWER(COALESCE(${requestAlias}.REQUEST_STATE, '')) = 'completed' THEN 'Completed'
                                           WHEN LOWER(COALESCE(${requestAlias}.REQUEST_STATE, '')) = 'rejected' THEN 'Rejected'
                                           WHEN LOWER(COALESCE(${requestAlias}.REQUEST_STATE, '')) IN ('cancelled', 'canceled') THEN 'Cancelled'
                                           ELSE COALESCE((
                                               SELECT mrs.STATUS_VALUE
                                               FROM m_request_status mrs
                                               WHERE mrs.M_REQUEST_STATUS_ID = ${requestAlias}.CURRENT_M_REQUEST_STATUS_ID
                                               LIMIT 1
                                           ), ${requestAlias}.REQUEST_STATE, '')
                                       END`,

  requestStatusIdByValueExpr: (statusSqlValue: any) => `(
                                           SELECT mrs.M_REQUEST_STATUS_ID
                                           FROM m_request_status mrs
                                                LEFT JOIN workflow_step_master wsm
                                                  ON wsm.M_REQUEST_STATUS_ID = mrs.M_REQUEST_STATUS_ID
                                                 AND wsm.INUSE = 1
                                           WHERE mrs.STATUS_VALUE = ${statusSqlValue}
                                              OR wsm.STEP_CODE = ${statusSqlValue}
                                              OR (
                                                   LOWER(${statusSqlValue}) = 'completed'
                                                   AND wsm.STEP_CODE = 'ACCOUNT_REGISTERED'
                                              )
                                           ORDER BY COALESCE(wsm.DEFAULT_STEP_ORDER, 9999) ASC, mrs.M_REQUEST_STATUS_ID ASC
                                           LIMIT 1
                                       )`,
}
