export const ProductTypeFlowSQL = {
  updateProductTypeFlow: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_TYPE_FLOW
                            SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                  , FLOW_ID = dataItem.FLOW_ID
                                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                                  , UPDATE_DATE = CURRENT_TIMESTAMP()
                          WHERE
                                  PRODUCT_TYPE_FLOW_ID = 'dataItem.PRODUCT_TYPE_FLOW_ID'
    `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_FLOW_ID', dataItem['PRODUCT_TYPE_FLOW_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'] != '' ? "'" + dataItem['FLOW_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductTypeFlow', sql)
    return sql
  },

  createProductTypeFlowId: async () => {
    let sql = `  SET @productTypeFlowId =(1 + coalesce((SELECT max(PRODUCT_TYPE_FLOW_ID)
          FROM PRODUCT_TYPE_FLOW), 0)) ; `
    //console.log('createProductTypeFlowId', sql)
    return sql
  },
  createProductTypeFlowForNewType: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_FLOW
                      (
                          PRODUCT_TYPE_FLOW_ID
                        , PRODUCT_TYPE_ID
                        , FLOW_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeFlowId
                            , @productTypeId
                            , dataItem.FLOW_ID
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'] != '' ? "'" + dataItem['FLOW_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeFlowForNewType' + sql)
    return sql
  },
  createProductTypeFlow: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_FLOW
                      (
                          PRODUCT_TYPE_FLOW_ID
                        , PRODUCT_TYPE_ID
                        , FLOW_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeFlowId
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , dataItem.FLOW_ID
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'] != '' ? "'" + dataItem['FLOW_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeFlow' + sql)
    return sql
  },
  updateInuseByProductTypeId: async (dataItem: any) => {
    let sql = `     UPDATE
                              PRODUCT_TYPE_FLOW
                    SET
                              INUSE = 0
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                                PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                            AND INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  create: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_FLOW
                    (
                          PRODUCT_TYPE_FLOW_ID
                        , PRODUCT_TYPE_ID
                        , FLOW_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                        SELECT
                              1 + coalesce((SELECT max(PRODUCT_TYPE_FLOW_ID) FROM PRODUCT_TYPE_FLOW), 0)
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , 'dataItem.FLOW_ID'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
               `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
}
