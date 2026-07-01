export const RequestApprovalSummarySqlSnippets = {
  latestApprovalLogValueExpr: (requestIdSql: any, columnSql: any) => `
                                           SELECT ${columnSql}
                                           FROM request_approval_log ral
                                           WHERE ral.REQUEST_REGISTER_VENDOR_ID = ${requestIdSql}
                                             AND ral.INUSE = 1
                                           ORDER BY ral.CREATE_DATE DESC, ral.REQUEST_APPROVAL_LOG_ID DESC
                                           LIMIT 1
                                       `,

  latestApprovalDateExpr: (requestIdSql: any) =>
    `(${RequestApprovalSummarySqlSnippets.latestApprovalLogValueExpr(requestIdSql, 'ral.CREATE_DATE')})`,

  latestApprovalRemarkExpr: (requestIdSql: any) =>
    `(${RequestApprovalSummarySqlSnippets.latestApprovalLogValueExpr(requestIdSql, 'ral.DESCRIPTION')})`,

  latestRejectReasonExpr: (requestIdSql: any) => `
                                           SELECT COALESCE(NULLIF(ral.REJECT_REASON, ''), ral.DESCRIPTION)
                                           FROM request_approval_log ral
                                           WHERE ral.REQUEST_REGISTER_VENDOR_ID = ${requestIdSql}
                                             AND ral.INUSE = 1
                                             AND LOWER(ral.ACTION_TYPE) IN ('rejected', 'vendor_disagreed')
                                           ORDER BY ral.CREATE_DATE DESC, ral.REQUEST_APPROVAL_LOG_ID DESC
                                           LIMIT 1
                                       `,
}
