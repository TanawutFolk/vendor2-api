import { RequestStatusSqlSnippets } from '../_request-register/RequestStatusSqlSnippets'


export const TaskManagerSQL = {
  searchAllTask: async (dataItem: any) => {
    const terminalStatusSql = "'completed', 'rejected', 'cancelled', 'canceled'"
    const innerQuery = `
            (
                SELECT
                    rr.REQUEST_REGISTER_VENDOR_ID,
                    rr.REQUEST_NUMBER,
                    v.COMPANY_NAME,
                    ${RequestStatusSqlSnippets.requestStatusExpr('rr')} AS REQUEST_STATUS,
                    rr.REQUEST_STATE,
                    v.VENDOR_REGION,
                    rr.CREATE_DATE,
                    'Request PO PIC' AS WORKFLOW_TYPE,
                    wsm.M_REQUEST_STATUS_ID AS CURRENT_STATUS_ID,
                    IFNULL(mrs.STATUS_VALUE, IFNULL(wsm.STEP_CODE, '-')) AS CURRENT_STEP_NAME,
                    UPPER(IFNULL(wsm.STEP_CODE, '')) AS CURRENT_STEP_CODE,
                    CASE
                        WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                        ELSE 'LOCAL_PO_PIC'
                    END AS CURRENT_GROUP_CODE,
                    CASE
                        WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                        ELSE 'LOCAL_PO_PIC'
                    END AS CURRENT_GROUP_NAME,
                    IFNULL(rr.ASSIGN_TO, '-') AS CURRENT_OWNER_EMPCODE,
                    'REQUEST_PIC' AS ASSIGNMENT_SCOPE,
                    CASE WHEN a_pic.ASSIGNEES_TO_ID IS NOT NULL THEN 1 ELSE 0 END AS CURRENT_OWNER_ACTIVE,
                    CASE
                        WHEN ras.REQUEST_APPROVAL_STEP_ID IS NOT NULL
                          AND LOWER(TRIM(IFNULL(rr.REQUEST_STATE, ''))) NOT IN (${terminalStatusSql})
                        THEN 1
                        ELSE 0
                    END AS REASSIGN_ENABLED,
                    CASE
                        WHEN a_pic.ASSIGNEES_TO_ID IS NOT NULL THEN 'Healthy'
                        ELSE 'Needs Reassign'
                    END AS ASSIGNMENT_HEALTH,
                    NULL AS GPR_C_FLOW_ID,
                    NULL AS GPR_C_STEP_ID
                FROM request_register_vendor rr
                    LEFT JOIN request_approval_step ras
                        ON ras.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                        AND ras.STEP_STATUS = 'in_progress'
                        AND ras.INUSE = 1
                        AND ras.REQUEST_APPROVAL_STEP_ID = (
                            SELECT ras_current.REQUEST_APPROVAL_STEP_ID
                            FROM request_approval_step ras_current
                            WHERE ras_current.REQUEST_REGISTER_VENDOR_ID = rr.REQUEST_REGISTER_VENDOR_ID
                              AND ras_current.STEP_STATUS = 'in_progress'
                              AND ras_current.INUSE = 1
                            ORDER BY ras_current.STEP_ORDER ASC, ras_current.REQUEST_APPROVAL_STEP_ID ASC
                            LIMIT 1
                        )
                    LEFT JOIN workflow_step_master wsm
                        ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
                    LEFT JOIN m_request_status mrs
                        ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
                    LEFT JOIN vendors v
                        ON v.VENDORS_ID = rr.VENDORS_ID
                    LEFT JOIN assignees_to a_pic
                        ON a_pic.ASSIGNEES_TO_ID = (
                            SELECT MIN(a_pic_match.ASSIGNEES_TO_ID)
                            FROM assignees_to a_pic_match
                            WHERE a_pic_match.INUSE = 1
                              AND a_pic_match.EMPCODE = rr.ASSIGN_TO
                              AND (
                                  UPPER(TRIM(COALESCE(a_pic_match.GROUP_CODE, ''))) = CASE
                                      WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                                      ELSE 'LOCAL_PO_PIC'
                                  END
                                  OR UPPER(TRIM(COALESCE(a_pic_match.GROUP_NAME, ''))) = CASE
                                      WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                                      ELSE 'LOCAL_PO_PIC'
                                  END
                              )
                        )
                WHERE rr.INUSE = 1
            ) t
        `

    let countSql = `
            SELECT COUNT(*) AS TOTAL_COUNT
            FROM dataItem.INNERQUERY
            dataItem.WHERECLAUSE
        `

    let dataSql = `
            SELECT t.*
            FROM dataItem.INNERQUERY
            dataItem.WHERECLAUSE
            ORDER BY dataItem.ORDER
            LIMIT dataItem.LIMIT OFFSET dataItem.OFFSET
        `

    countSql = countSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    countSql = countSql.replaceAll('dataItem.WHERECLAUSE', dataItem.SQLWHERE || '')
    dataSql = dataSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    dataSql = dataSql.replaceAll('dataItem.WHERECLAUSE', dataItem.SQLWHERE || '')
    dataSql = dataSql.replaceAll('dataItem.ORDER', dataItem.ORDER || 't.REQUEST_REGISTER_VENDOR_ID DESC')
    dataSql = dataSql.replaceAll('dataItem.LIMIT', (dataItem.LIMIT || 50).toString())
    dataSql = dataSql.replaceAll('dataItem.OFFSET', (dataItem.OFFSET || 0).toString())

    return [countSql, dataSql]
  },
}


