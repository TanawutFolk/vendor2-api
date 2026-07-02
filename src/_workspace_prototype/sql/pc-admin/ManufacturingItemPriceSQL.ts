export const ManufacturingItemPriceSQL = {
  getAllOriginalPrice: async () => {
    let sql = `
                SELECT
                      ITEM_ID
                    , PURCHASE_PRICE
                    , ITEM_M_O_PRICE_ID
                    , PURCHASE_PRICE_CURRENCY_ID
                    , PURCHASE_PRICE_UNIT_ID
                FROM
                    ITEM_M_O_PRICE
                WHERE
                    INUSE = '1'
                `

    return sql
  },
  getAllStandardPrice: async () => {
    let sql = `
                SELECT
                      EXCHANGE_RATE_ID
                    , IMPORT_FEE_ID
                    , ITEM_M_O_PRICE_ID
                    , ITEM_M_S_PRICE_ID
                FROM
                    ITEM_M_S_PRICE
                WHERE
                    INUSE = '1'
                `

    return sql
  },
  checkFiscalYearAndSctPattern: async (dataItem: any) => {
    let sql = `  SELECT *

                  FROM

                  ITEM_M_S_PRICE tb_1
                  JOIN
                    ITEM_M_O_PRICE tb_2
                  ON
                    tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID AND tb_2.INUSE = 1
                  WHERE
                  tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                  AND tb_2.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                  AND tb_1.INUSE = 1


      `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])

    return sql
  },
  create: async (dataItem: any) => {
    let sql = `      INSERT INTO ITEM_GROUP
                      (
                            ITEM_GROUP_ID
                          , ITEM_GROUP_NAME
                          , CREATE_BY
                          , UPDATE_DATE
                          , UPDATE_BY
                      )
                          SELECT
                              1 + coalesce((SELECT max(ITEM_GROUP_ID) FROM ITEM_GROUP), 0)
                            , 'dataItem.ITEM_GROUP_NAME'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'


                         `

    sql = sql.replaceAll('dataItem.ITEM_GROUP_NAME', dataItem['ITEM_GROUP_NAME'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    //console.log(sql)
    return sql
  },
}
