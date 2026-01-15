export const ProductTypeBomSQL = {
  updateProductTypeBom: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_TYPE_BOM
                            SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                  , BOM_ID = dataItem.BOM_ID
                                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                                  , UPDATE_DATE = CURRENT_TIMESTAMP()
                          WHERE
                                  PRODUCT_TYPE_BOM_ID = 'dataItem.PRODUCT_TYPE_BOM_ID'
    `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_BOM_ID', dataItem['PRODUCT_TYPE_BOM_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'] != '' ? "'" + dataItem['BOM_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductTypeBom', sql)
    return sql
  },

  createProductTypeBomId: async () => {
    let sql = `  SET @productTypeBomId =(1 + coalesce((SELECT max(PRODUCT_TYPE_BOM_ID)
          FROM PRODUCT_TYPE_BOM), 0)) ; `
    //     //console.log('CreateId', sql)
    return sql
  },
  createProductTypeBomForNewType: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_BOM
                      (
                          PRODUCT_TYPE_BOM_ID
                        , PRODUCT_TYPE_ID
                        , BOM_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeBomId
                            , @productTypeId
                            , dataItem.BOM_ID
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'] != '' ? "'" + dataItem['BOM_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeBomForNewType' + sql)
    return sql
  },
  createProductTypeBom: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_BOM
                      (
                          PRODUCT_TYPE_BOM_ID
                        , PRODUCT_TYPE_ID
                        , BOM_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeBomId
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , dataItem.BOM_ID
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'] != '' ? "'" + dataItem['BOM_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeBom' + sql)

    return sql
  },
  getBomByLikeProductTypeId: async (dataItem: any) => {
    let sql = `
              SELECT
                      tb_1.PRODUCT_TYPE_BOM_ID
                      , tb_1.PRODUCT_TYPE_ID
                      , tb_3.PRODUCT_TYPE_NAME
                      , tb_3.PRODUCT_TYPE_CODE
                      , tb_2.BOM_ID
                      , tb_2.BOM_NAME
                      , tb_2.BOM_CODE

              FROM
                      PRODUCT_TYPE_BOM tb_1

              INNER JOIN
                      BOM tb_2 ON tb_1.BOM_ID  = tb_2.BOM_ID
              INNER JOIN

                      PRODUCT_TYPE tb_3 ON tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
              WHERE
                      tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
              AND tb_2.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
                          AND tb_1.INUSE = 1

                            `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
}
