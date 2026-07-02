export const ItemManufacturingOriginalPriceSQL = {
  create: async (dataItem: {
    CREATE_BY: string
    ITEM_M_O_PRICE_ID: string
    ITEM_ID: number
    PURCHASE_PRICE: number
    PURCHASE_PRICE_CURRENCY_ID: string
    PURCHASE_PRICE_UNIT_ID: string
    FISCAL_YEAR: number
    ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID: number
    IS_CURRENT: number
    SCT_PATTERN_ID: number
  }) => {
    let sql = `

        SET @itemMOPriceVersionNo =  (
                        SELECT
                            IFNULL(MAX(ITEM_M_O_PRICE_VERSION_NO), 0) + 1
                        FROM
                            ITEM_M_O_PRICE
                        WHERE
                            ITEM_ID = dataItem.ITEM_ID
                    );

                    INSERT INTO ITEM_M_O_PRICE
                        (
                              ITEM_M_O_PRICE_ID
                            , ITEM_ID
                            , FISCAL_YEAR
                            , SCT_PATTERN_ID
                            , PURCHASE_PRICE
                            , PURCHASE_PRICE_CURRENCY_ID
                            , PURCHASE_PRICE_UNIT_ID
                            , ITEM_M_O_PRICE_VERSION_NO
                            , DESCRIPTION
                            , CREATE_BY
                            , CREATE_DATE
                            , UPDATE_BY
                            , UPDATE_DATE
                            , INUSE
                            , ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID
                            , IS_CURRENT
                        )
                    VALUES
                        (
                              'dataItem.ITEM_M_O_ID'
                            , 'dataItem.ITEM_ID'
                            , 'dataItem.FISCAL_YEAR'
                            , 'dataItem.SCT_PATTERN_ID'
                            , 'dataItem.PURCHASE_PRICE'
                            , 'dataItem.PURCHASE_PRICE_CURRENCY_ID'
                            , 'dataItem.PURCHASE_PRICE_UNIT_ID'
                            , @itemMOPriceVersionNo
                            , ''
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 1
                            , 'dataItem.ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID'
                            , 'dataItem.IS_CURRENT'
                        );
                        `

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.ITEM_M_O_ID', dataItem['ITEM_M_O_PRICE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'].toString())

    sql = sql.replaceAll('dataItem.PURCHASE_PRICE_CURRENCY_ID', dataItem['PURCHASE_PRICE_CURRENCY_ID'])
    sql = sql.replaceAll('dataItem.PURCHASE_PRICE_UNIT_ID', dataItem['PURCHASE_PRICE_UNIT_ID'])

    sql = sql.replaceAll('dataItem.PURCHASE_PRICE', dataItem['PURCHASE_PRICE'].toString())

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID', dataItem['ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID'].toString())
    sql = sql.replaceAll('dataItem.IS_CURRENT', dataItem['IS_CURRENT'].toString())

    return sql
  },
}
