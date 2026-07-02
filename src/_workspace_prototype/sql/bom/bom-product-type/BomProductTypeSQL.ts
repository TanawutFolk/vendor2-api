export const BomProductTypeSQL = {
  upsertBomProductType: async (dataItem: any) => {
    let sql = `        INSERT INTO PRODUCT_TYPE_BOM
                          (
                                PRODUCT_TYPE_BOM_ID
                              , BOM_ID
                              , PRODUCT_TYPE_ID
                              , CREATE_BY
                              , UPDATE_DATE
                              , UPDATE_BY
                          )
                          SELECT
                                1 + coalesce((SELECT max(PRODUCT_TYPE_BOM_ID) FROM PRODUCT_TYPE_BOM), 0)
                              , 'dataItem.BOM_ID'
                              , 'dataItem.PRODUCT_TYPE_ID'
                              , 'dataItem.CREATE_BY'
                              ,  CURRENT_TIMESTAMP()
                              , 'dataItem.CREATE_BY'
                        ON DUPLICATE KEY UPDATE
                          UPDATE_DATE = CURRENT_TIMESTAMP()
                          , UPDATE_BY = 'dataItem.CREATE_BY'
                          , BOM_ID = 'dataItem.BOM_ID'
                        `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    return sql
  },
  deleteByProductTypeId: async (dataItem: any) => {
    let sql = `
        UPDATE
            PRODUCT_TYPE_BOM tb_1
          JOIN
            PRODUCT_TYPE_FLOW tb_2
          ON
            tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
        SET
              tb_1.INUSE = 0
            , tb_1.UPDATE_DATE = CURRENT_TIMESTAMP()
            , tb_1.UPDATE_BY = 'dataItem.CREATE_BY'
            , tb_2.INUSE = 0
            , tb_2.UPDATE_DATE = CURRENT_TIMESTAMP()
            , tb_2.UPDATE_BY = 'dataItem.CREATE_BY'
        WHERE
            tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
          `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
}
