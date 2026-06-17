export const requestStatusExpr = (requestAlias = 'rr') => `CASE
                                           WHEN LOWER(COALESCE(${requestAlias}.REQUEST_STATE, '')) = 'completed' THEN 'Completed'
                                           WHEN LOWER(COALESCE(${requestAlias}.REQUEST_STATE, '')) = 'rejected' THEN 'Rejected'
                                           WHEN LOWER(COALESCE(${requestAlias}.REQUEST_STATE, '')) IN ('cancelled', 'canceled') THEN 'Cancelled'
                                           ELSE COALESCE((
                                               SELECT mrs.STATUS_VALUE
                                               FROM m_request_status mrs
                                               WHERE mrs.STATUS_ID = ${requestAlias}.CURRENT_STATUS_ID
                                               LIMIT 1
                                           ), ${requestAlias}.REQUEST_STATE, '')
                                       END`

export const requestStatusIdByValueExpr = (statusSqlValue: string) => `(
                                           SELECT mrs.STATUS_ID
                                           FROM m_request_status mrs
                                           WHERE mrs.STATUS_VALUE = ${statusSqlValue}
                                              OR mrs.STATUS_LABEL = ${statusSqlValue}
                                              OR mrs.STEP_CODE = ${statusSqlValue}
                                              OR (
                                                   LOWER(${statusSqlValue}) = 'completed'
                                                   AND mrs.STEP_CODE = 'ACCOUNT_REGISTERED'
                                              )
                                           ORDER BY mrs.SORT_ORDER ASC, mrs.STATUS_ID ASC
                                           LIMIT 1
                                       )`
