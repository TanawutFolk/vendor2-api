export const ItemManufacturingStandardPriceSQL = {
  create: async (dataItem: {
    ITEM_ID: number
    CREATE_BY: string
    ITEM_M_S_PRICE_ID: string
    ITEM_M_O_PRICE_ID: string
    EXCHANGE_RATE_ID: string
    IMPORT_FEE_ID: string
    ITEM_M_S_PRICE_VALUE: number
    FISCAL_YEAR: number
    PURCHASE_UNIT_RATIO: number
    PURCHASE_UNIT_ID: string
    USAGE_UNIT_RATIO: number
    USAGE_UNIT_ID: string
    SCT_PATTERN_ID: number
    ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: number
    IS_CURRENT: number
  }) => {
    let sql = `
                            SET @version =  (
                            SELECT
                                IFNULL(MAX(tb_1.VERSION), 0) + 1
                            FROM
                                ITEM_M_S_PRICE tb_1
                            JOIN
                                ITEM_M_O_PRICE tb_2
                            ON
                                tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
                            WHERE
                                    tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND   tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                                AND tb_2.ITEM_ID = 'dataItem.ITEM_ID'
                        );

                INSERT INTO ITEM_M_S_PRICE
                    (
                          ITEM_M_S_PRICE_ID
                        , ITEM_M_O_PRICE_ID
                        , EXCHANGE_RATE_ID
                        , IMPORT_FEE_ID
                        , ITEM_M_S_PRICE_VALUE
                        , CREATE_BY
                        , UPDATE_BY
                        , UPDATE_DATE
                        , INUSE
                        , FISCAL_YEAR
                        , SCT_PATTERN_ID
                        , VERSION
                        , PURCHASE_UNIT_RATIO
                        , PURCHASE_UNIT_ID
                        , USAGE_UNIT_RATIO
                        , USAGE_UNIT_ID
                        , ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID
                        , IS_CURRENT
                    )
                VALUES
                    (
                          'dataItem.ITEM_M_S_PRICE_ID'
                        , 'dataItem.ITEM_M_O_PRICE_ID'
                        , 'dataItem.EXCHANGE_RATE_ID'
                        , dataItem.IMPORT_FEE_ID
                        , 'dataItem.ITEM_M_S_PRICE_VALUE'
                        , 'dataItem.CREATE_BY'
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 1
                        , 'dataItem.FISCAL_YEAR'
                        , 'dataItem.SCT_PATTERN_ID'
                        , @version
                        , 'dataItem.PURCHASE_UNIT_RATIO'
                        , 'dataItem.PURCHASE_UNIT_ID'
                        , 'dataItem.USAGE_UNIT_RATIO'
                        , 'dataItem.USAGE_UNIT_ID'
                        , 'dataItem.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID'
                        , 'dataItem.IS_CURRENT'
                    );
                    `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'].toString())

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_ID', dataItem['ITEM_M_S_PRICE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_M_O_PRICE_ID', dataItem['ITEM_M_O_PRICE_ID'])
    sql = sql.replaceAll('dataItem.EXCHANGE_RATE_ID', dataItem['EXCHANGE_RATE_ID'])
    sql = sql.replaceAll('dataItem.IMPORT_FEE_ID', dataItem['IMPORT_FEE_ID'] == '' ? 'null' : dataItem['IMPORT_FEE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_VALUE', dataItem['ITEM_M_S_PRICE_VALUE'].toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())

    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_RATIO', dataItem['PURCHASE_UNIT_RATIO'].toString())
    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_ID', dataItem['PURCHASE_UNIT_ID'])
    sql = sql.replaceAll('dataItem.USAGE_UNIT_RATIO', dataItem['USAGE_UNIT_RATIO'].toString())
    sql = sql.replaceAll('dataItem.USAGE_UNIT_ID', dataItem['USAGE_UNIT_ID'])
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID', dataItem['ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID'].toString())
    sql = sql.replaceAll('dataItem.IS_CURRENT', dataItem['IS_CURRENT'].toString())
    return sql
  },
}
