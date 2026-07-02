export const FlowHistorySQL = {
  createFlowHistory: async (dataItem: any) => {
    let sql = `
                    INSERT INTO FLOW_HISTORY
                    (
                          FLOW_HISTORY_ID
                        , FLOW_ID
                        , FLOW_NAME
                        , FLOW_CODE
                        , FLOW_TYPE_ID
                        , PRODUCT_MAIN_ID
                        , TOTAL_COUNT_PROCESS
                        , HISTORY_NO
                        , CREATE_BY
                        , CREATE_DATE
                        , UPDATE_BY
                        , UPDATE_DATE
                    )
                        SELECT
                                1 + coalesce((SELECT max(FLOW_HISTORY_ID) FROM FLOW_HISTORY), 0)
                              , 'dataItem.FLOW_ID'
                              , FLOW_NAME
                              , FLOW_CODE
                              , FLOW_TYPE_ID
                              , PRODUCT_MAIN_ID
                              , TOTAL_COUNT_PROCESS
                              , 1 + coalesce((SELECT max(HISTORY_NO) FROM FLOW_HISTORY WHERE FLOW_ID = 'dataItem.FLOW_ID'), 0)
                              , CREATE_BY
                              , CREATE_DATE
                              , UPDATE_BY
                              , UPDATE_DATE
                       FROM
                              FLOW
                       WHERE
                              FLOW_ID = 'dataItem.FLOW_ID'

                `

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

    return sql
  },
  updateFlowHistory: async (dataItem: any) => {
    let sql = `    UPDATE
                        FLOW_HISTORY
                    SET
                          INUSE = '0'
                    WHERE
                            FLOW_ID = 'dataItem.FLOW_ID'
                        AND INUSE = 1
`

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
