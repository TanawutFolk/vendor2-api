export const FlowProductTypeSQL = {
  searchFlowProductTypeByFlowId: async (dataItem: any) => {
    let sql = `
                            SELECT
                                tb_1.PRODUCT_TYPE_FLOW_ID
                                , tb_1.FLOW_ID
                                , tb_1.PRODUCT_TYPE_ID
                                , tb_2.PRODUCT_TYPE_CODE
                                , tb_2.PRODUCT_TYPE_NAME
                            FROM
                                PRODUCT_TYPE_FLOW tb_1
                            JOIN
                                PRODUCT_TYPE tb_2
                            ON
                                tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                            WHERE
                                tb_1.FLOW_ID = 'dataItem.FLOW_ID'
                                AND tb_1.INUSE = '1'
                              `

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    // console.log('sql', sql)

    return sql
  },
  createFlowProductTypeByCreatedProcess: async (dataItem: any) => {
    let sql = `
                            INSERT INTO PRODUCT_TYPE_FLOW
                            (
                                  PRODUCT_TYPE_FLOW_ID
                                , FLOW_ID
                                , PRODUCT_TYPE_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                            )
                            SELECT
                                  1 + coalesce((SELECT max(PRODUCT_TYPE_FLOW_ID) FROM PRODUCT_TYPE_FLOW), 0)
                                ,  'dataItem.FLOW_ID'
                                ,  'dataItem.PRODUCT_TYPE_ID'
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                              `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    return sql
  },
  insertByExistFlowId: async (dataItem: any) => {
    let sql = `        INSERT INTO PRODUCT_TYPE_FLOW
                          (
                                PRODUCT_TYPE_FLOW_ID
                              , FLOW_ID
                              , PRODUCT_TYPE_ID
                              , CREATE_BY
                              , UPDATE_DATE
                              , UPDATE_BY
                          )
                          SELECT
                                1 + coalesce((SELECT max(PRODUCT_TYPE_FLOW_ID) FROM PRODUCT_TYPE_FLOW), 0)
                              , 'dataItem.FLOW_ID'
                              , 'dataItem.PRODUCT_TYPE_ID'
                              , 'dataItem.CREATE_BY'
                              ,  CURRENT_TIMESTAMP()
                              , 'dataItem.CREATE_BY'
                        `

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  updateExistsProductTypeInuse: async (dataItem: any) => {
    let sql = `
                            UPDATE
                                PRODUCT_TYPE_FLOW tb_1
                              JOIN
                                PRODUCT_TYPE_BOM tb_2
                              ON
                                tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                            SET
                                  tb_1.INUSE = '0'
                                , tb_1.UPDATE_BY = 'dataItem.UPDATE_BY'
                                , tb_1.UPDATE_DATE = CURRENT_TIMESTAMP()
                                , tb_2.INUSE = '0'
                                , tb_2.UPDATE_BY = 'dataItem.UPDATE_BY'
                                , tb_2.UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                              `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  deleteFlowProductTypeByUpdatedFlowProcess: async (dataItem: any) => {
    let sql = `
              UPDATE
                  PRODUCT_TYPE_FLOW
              SET
                  INUSE = '0'
                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                  , UPDATE_DATE = CURRENT_TIMESTAMP()
              WHERE
                  FLOW_ID = 'dataItem.FLOW_ID'
                  AND INUSE = '1'
                              `

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    return sql
  },
  deleteFlowProductType: async (dataItem: any) => {
    let sql = `   UPDATE
                        PRODUCT_TYPE_FLOW
                    SET
                        INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        FLOW_ID = 'dataItem.FLOW_ID'
                      `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    return sql
  },
}
