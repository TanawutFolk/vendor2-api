export const BomHistorySQL = {
  createBomHistory: async (dataItem: any) => {
    let sql = `
                    INSERT INTO BOM_HISTORY
                    (
                          BOM_HISTORY_ID
                        , BOM_ID
                        , BOM_NAME
                        , BOM_CODE
                        , PRODUCT_MAIN_ID
                        , PRODUCTION_PURPOSE_ID
                        , FLOW_ID
                        , REVISION
                        , HISTORY_NO
                        , CREATE_BY
                        , CREATE_DATE
                        , UPDATE_BY
                        , UPDATE_DATE
                    )
                        SELECT
                                  1 + coalesce((SELECT max(BOM_HISTORY_ID) FROM BOM_HISTORY), 0)
                                , 'dataItem.BOM_ID'
                                ,  BOM_NAME
                                ,  BOM_CODE
                                ,  PRODUCT_MAIN_ID
                                ,  PRODUCTION_PURPOSE_ID
                                ,  FLOW_ID
                                ,  REVISION
                                ,  1 + coalesce((SELECT max(HISTORY_NO) FROM BOM_HISTORY WHERE BOM_ID = 'dataItem.BOM_ID'), 0)
                                ,  CREATE_BY
                                ,  CREATE_DATE
                                ,  UPDATE_BY
                                ,  UPDATE_DATE
                        FROM
                                BOM
                        WHERE
                                BOM_ID = 'dataItem.BOM_ID'
                `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },

  // *** Function update
  updateBomHistory: async (dataItem: any) => {
    let sql = `     UPDATE
                                BOM_HISTORY
                        SET
                                  INUSE = '0'
                        WHERE
                                  BOM_ID = 'dataItem.BOM_ID'
                              AND INUSE = 1
                        `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    return sql
  },
}
