export const StandardPriceSQL = {
  getStandardPriceDetail: async (dataItem: any) => {
    let sql = `
                SELECT
                      tb_1.ITEM_ID
                    , tb_1.ITEM_CODE_FOR_SUPPORT_MES
                    , tb_1.ITEM_INTERNAL_SHORT_NAME
                    , tb_2.VENDOR_NAME
                    , tb_3.ITEM_IMPORT_TYPE_NAME
                    , tb_6.EXCHANGE_RATE_VALUE
                    , tb_7.IMPORT_FEE_RATE
                    , tb_8.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY_SYMBOL
                    , tb_4.PURCHASE_PRICE
                    , tb_5.ITEM_M_S_PRICE_VALUE
                    , tb_5.FISCAL_YEAR
                    , tb_5.VERSION
                FROM
                    ITEM_MANUFACTURING tb_1
                JOIN
                    VENDOR tb_2
                ON
                    tb_1.VENDOR_ID = tb_2.VENDOR_ID
                JOIN
                    ITEM_IMPORT_TYPE tb_3
                ON
                    tb_2.ITEM_IMPORT_TYPE_ID = tb_3.ITEM_IMPORT_TYPE_ID
                JOIN
                    ITEM_M_O_PRICE tb_4
                ON
                    tb_1.ITEM_ID = tb_4.ITEM_ID AND tb_4.INUSE = '1'
                JOIN
                    ITEM_M_S_PRICE tb_5
                ON
                    tb_4.ITEM_M_O_PRICE_ID = tb_5.ITEM_M_O_PRICE_ID AND tb_5.INUSE = '1'
                JOIN
                    EXCHANGE_RATE tb_6
                ON
                    tb_5.EXCHANGE_RATE_ID = tb_6.EXCHANGE_RATE_ID
                JOIN
                    IMPORT_FEE tb_7
                ON
                    tb_5.IMPORT_FEE_ID = tb_7.IMPORT_FEE_ID
                JOIN
                    CURRENCY tb_8
                ON
                    tb_4.PURCHASE_PRICE_CURRENCY_ID = tb_8.CURRENCY_ID
                WHERE
                        tb_1.INUSE = '1'
                    AND tb_1.ITEM_ID = dataItem.ITEM_ID
                `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },
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
  getStandardPriceByItemId: async (dataItem: any, fiscalYear: any) => {
    let sql = `
                SELECT
                    ITEM_M_S_PRICE_ID
                FROM
                    ITEM_M_O_PRICE tb_1
                JOIN
                    ITEM_M_S_PRICE tb_2
                ON
                    tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID AND tb_1.INUSE = '1' AND tb_2.INUSE = '1'
                WHERE
                        tb_1.ITEM_ID IN (${dataItem.join(',')})
                    AND tb_2.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', fiscalYear)

    return sql
  },
  getItemMSPriceByProductTypeIdAndSctLatest: async (dataItem: any) => {
    let sql = `
                SELECT
                      tb_4.ITEM_M_S_PRICE_ID
                    , tb_6.ITEM_ID
                FROM
                    dataItem.STANDARD_COST_DB.SCT_F_S tb_1
                JOIN
                    dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING tb_2
                ON
                    tb_1.SCT_F_ID = tb_2.SCT_F_ID
                JOIN
                    dataItem.STANDARD_COST_DB.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_3
                ON
                    tb_1.SCT_F_ID = tb_3.SCT_F_ID AND tb_3.INUSE = 1
                JOIN
                    dataItem.STANDARD_COST_DB.SCT_F_MATERIAL_PRICE tb_4
                ON
                    tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_4.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                JOIN
                    dataItem.STANDARD_COST_DB.ITEM_M_S_PRICE tb_5
                ON
                    tb_4.ITEM_M_S_PRICE_ID = tb_5.ITEM_M_S_PRICE_ID
                JOIN
                    dataItem.STANDARD_COST_DB.ITEM_M_O_PRICE tb_6
                ON
                    tb_5.ITEM_M_O_PRICE_ID = tb_6.ITEM_M_O_PRICE_ID
                WHERE
                        tb_1.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
                    AND tb_2.SCT_F_STATUS_WORKING_ID = 1
                    AND tb_2.SCT_F_STATUS_PROGRESS_ID = 7
                    AND tb_3.SCT_F_COMPONENT_TYPE_ID = 2
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE'].PRODUCT_TYPE_ID)

    return sql
  },
  getItemMSPriceBySctFId: async (dataItem: any) => {
    let sql = `
                SELECT
                      tb_2.ITEM_M_S_PRICE_ID
                    , tb_4.ITEM_ID
                FROM
                    SCR_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_1
                ON
                    tb_1.SCT_F_ID = tb_1.SCT_F_ID AND tb_1.INUSE = 1
                JOIN
                    SCT_F_MATERIAL_PRICE tb_2
                ON
                    tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_2.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                JOIN
                    ITEM_M_S_PRICE tb_3
                ON
                    tb_2.ITEM_M_S_PRICE_ID = tb_3.ITEM_M_S_PRICE_ID
                JOIN
                    ITEM_M_O_PRICE tb_4
                ON
                    tb_4.ITEM_M_O_PRICE_ID = tb_4.ITEM_M_O_PRICE_ID
                WHERE
                        tb_1.SCT_F_ID = dataItem.SCT_F_ID
                    AND tb_1.SCT_F_COMPONENT_TYPE_ID = 2
                `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['MATERIAL_PRICE'].SCT_F_ID)

    return sql
  },
  search: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `     SELECT
                                COUNT(*) AS TOTAL_COUNT
                    FROM
                                 ITEM_M_S_PRICE tb_1
                                            JOIN
                                 ITEM_M_O_PRICE tb_2
                                            ON
                                            tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
                                            JOIN
                                 ITEM_MANUFACTURING tb_3
                                            ON
                                            tb_2.ITEM_ID = tb_3.ITEM_ID
                                            JOIN
                                 EXCHANGE_RATE tb_4
                                            ON
                                            tb_1.EXCHANGE_RATE_ID = tb_4.EXCHANGE_RATE_ID
                                            JOIN
                                 CURRENCY tb_6
                                            ON
                                            tb_2.PURCHASE_PRICE_CURRENCY_ID = tb_6.CURRENCY_ID
                                            LEFT JOIN
                                 IMPORT_FEE tb_5
                                            ON
                                            tb_1.IMPORT_FEE_ID = tb_5.IMPORT_FEE_ID
                                            LEFT JOIN
                                 ITEM tb_7
                                            ON tb_3.ITEM_ID = tb_7.ITEM_ID
                                            LEFT JOIN
                                 vendor tb_8
                                            ON tb_3.VENDOR_ID = tb_8.VENDOR_ID
                                            LEFT JOIN
                                 item_import_type tb_9
                                            ON tb_8.ITEM_IMPORT_TYPE_ID = tb_9.ITEM_IMPORT_TYPE_ID
                                            INNER JOIN
                                 UNIT_OF_MEASUREMENT tb_10
                                            ON
                                            tb_1.PURCHASE_UNIT_ID = tb_10.UNIT_OF_MEASUREMENT_ID
                                            INNER JOIN
                                 UNIT_OF_MEASUREMENT tb_11
                                            ON
                                            tb_1.USAGE_UNIT_ID = tb_11.UNIT_OF_MEASUREMENT_ID
                                            LEFT JOIN
                                 ITEM_M_S_PRICE_CREATE_FROM_SETTING tb_13
                                            ON tb_1.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID = tb_13.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID
                    WHERE

                                tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'
                            AND  tb_7.ITEM_CATEGORY_ID NOT IN (1, 2, 3)

                    dataItem.sqlWhere

                    sqlWhereColumnFilter

                    `

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = ` SELECT
                                   tb_3.ITEM_CODE_FOR_SUPPORT_MES
                                 , tb_3.ITEM_INTERNAL_SHORT_NAME
                                 , tb_3.ITEM_INTERNAL_FULL_NAME
                                 , tb_3.VERSION_NO AS ITEM_VERSION_NO
                                 , tb_3.IS_CURRENT AS ITEM_IS_CURRENT
                                 , tb_1.NOTE
                                 , tb_1.ITEM_M_S_PRICE_ID
                                 , tb_2.ITEM_ID
                                 , tb_2.PURCHASE_PRICE
                                 , tb_4.EXCHANGE_RATE_VALUE
                                 , tb_5.IMPORT_FEE_RATE
                                 -- , CAST(tb_1.ITEM_M_S_PRICE_VALUE AS DECIMAL(16,2)) AS ITEM_M_S_PRICE_VALUE
                                 , tb_1.ITEM_M_S_PRICE_VALUE
                                 , tb_1.UPDATE_BY
                                 , tb_1.FISCAL_YEAR
                                 , tb_1.VERSION
                                 , tb_1.IS_CURRENT
                                 , DATE_FORMAT(tb_1.UPDATE_DATE, '%Y-%m-%d %H:%i:%s') AS UPDATE_DATE
                                 , tb_6.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY_SYMBOL
                                 , tb_1.PURCHASE_UNIT_RATIO
                                 , tb_1.USAGE_UNIT_RATIO
                                 , tb_8.VENDOR_ALPHABET
                                 , tb_8.VENDOR_NAME
                                 , tb_9.ITEM_IMPORT_TYPE_NAME
                                 , tb_10.UNIT_OF_MEASUREMENT_NAME AS PURCHASE_UNIT_NAME
                                 , tb_11.UNIT_OF_MEASUREMENT_NAME AS USAGE_UNIT_NAME
                                 , tb_12.SCT_PATTERN_ID
                                 , tb_12.SCT_PATTERN_NAME
                                 , tb_13.ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME
                                 , tb_10.SYMBOL AS PURCHASE_UNIT_CODE
                                 , tb_11.SYMBOL AS USAGE_UNIT_CODE
                                 , tb_1.INUSE
           FROM
                                 ITEM_M_S_PRICE tb_1
                                            JOIN
                                 ITEM_M_O_PRICE tb_2
                                            ON
                                            tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
                                            JOIN
                                 ITEM_MANUFACTURING tb_3
                                            ON
                                            tb_2.ITEM_ID = tb_3.ITEM_ID
                                            JOIN
                                 EXCHANGE_RATE tb_4
                                            ON
                                            tb_1.EXCHANGE_RATE_ID = tb_4.EXCHANGE_RATE_ID
                                            JOIN
                                 CURRENCY tb_6
                                            ON
                                            tb_2.PURCHASE_PRICE_CURRENCY_ID = tb_6.CURRENCY_ID
                                            LEFT JOIN
                                 IMPORT_FEE tb_5
                                            ON
                                            tb_1.IMPORT_FEE_ID = tb_5.IMPORT_FEE_ID
                                            LEFT JOIN
                                 ITEM tb_7
                                            ON tb_3.ITEM_ID = tb_7.ITEM_ID
                                            LEFT JOIN
                                 vendor tb_8
                                            ON tb_3.VENDOR_ID = tb_8.VENDOR_ID
                                            LEFT JOIN
                                 item_import_type tb_9
                                            ON tb_8.ITEM_IMPORT_TYPE_ID = tb_9.ITEM_IMPORT_TYPE_ID
                                            LEFT JOIN
                                 UNIT_OF_MEASUREMENT tb_10
                                            ON
                                            tb_1.PURCHASE_UNIT_ID = tb_10.UNIT_OF_MEASUREMENT_ID
                                            LEFT JOIN
                                 UNIT_OF_MEASUREMENT tb_11
                                            ON
                                            tb_1.USAGE_UNIT_ID = tb_11.UNIT_OF_MEASUREMENT_ID
                                            LEFT JOIN
                                 dataItem.STANDARD_COST_DB.SCT_PATTERN tb_12
                                            ON tb_1.SCT_PATTERN_ID = tb_12.SCT_PATTERN_ID
                                            LEFT JOIN
                                 ITEM_M_S_PRICE_CREATE_FROM_SETTING tb_13
                                            ON tb_1.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID = tb_13.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID
                WHERE

                     tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'

                    AND  tb_7.ITEM_CATEGORY_ID NOT IN (1, 2, 3)

                    dataItem.sqlWhere
                    sqlWhereColumnFilter
                ORDER BY
                    dataItem.Order
                LIMIT
                      dataItem.Start
                    , dataItem.Limit
            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])
    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')
    // console.log(sql)

    return sqlList
  },

  searchAll: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `     SELECT
                                COUNT(*) AS TOTAL_COUNT
                    FROM
                                 ITEM_M_S_PRICE tb_1
                                            JOIN
                                 ITEM_M_O_PRICE tb_2
                                            ON
                                            tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
                                            JOIN
                                 ITEM_MANUFACTURING tb_3
                                            ON
                                            tb_2.ITEM_ID = tb_3.ITEM_ID
                                            JOIN
                                 EXCHANGE_RATE tb_4
                                            ON
                                            tb_1.EXCHANGE_RATE_ID = tb_4.EXCHANGE_RATE_ID
                                            JOIN
                                 CURRENCY tb_6
                                            ON
                                            tb_2.PURCHASE_PRICE_CURRENCY_ID = tb_6.CURRENCY_ID
                                            LEFT JOIN
                                 IMPORT_FEE tb_5
                                            ON
                                            tb_1.IMPORT_FEE_ID = tb_5.IMPORT_FEE_ID
                                            LEFT JOIN
                                 ITEM tb_7
                                            ON tb_3.ITEM_ID = tb_7.ITEM_ID
                                            LEFT JOIN
                                 vendor tb_8
                                            ON tb_3.VENDOR_ID = tb_8.VENDOR_ID
                                            LEFT JOIN
                                 item_import_type tb_9
                                            ON tb_8.ITEM_IMPORT_TYPE_ID = tb_9.ITEM_IMPORT_TYPE_ID
                                            INNER JOIN
                                 UNIT_OF_MEASUREMENT tb_10
                                            ON
                                            tb_1.PURCHASE_UNIT_ID = tb_10.UNIT_OF_MEASUREMENT_ID
                                            INNER JOIN
                                 UNIT_OF_MEASUREMENT tb_11
                                            ON
                                            tb_1.USAGE_UNIT_ID = tb_11.UNIT_OF_MEASUREMENT_ID
                                            LEFT JOIN
                                 ITEM_M_S_PRICE_CREATE_FROM_SETTING tb_13
                                            ON tb_1.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID = tb_13.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID
                    WHERE

                                tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'
                            AND  tb_7.ITEM_CATEGORY_ID NOT IN (1, 2, 3)

                    dataItem.sqlWhere
                    sqlWhereColumnFilter

                    `

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])

    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])

    sqlList.push(sql)

    sql = ` SELECT
                                   tb_3.ITEM_CODE_FOR_SUPPORT_MES
                                 , tb_3.ITEM_INTERNAL_SHORT_NAME
                                 , tb_3.ITEM_INTERNAL_FULL_NAME
                                 , tb_3.VERSION_NO AS ITEM_VERSION_NO
                                 , tb_3.IS_CURRENT AS ITEM_IS_CURRENT
                                 , tb_1.NOTE
                                 , tb_1.ITEM_M_S_PRICE_ID
                                 , tb_2.ITEM_ID
                                 , tb_2.PURCHASE_PRICE
                                 , tb_4.EXCHANGE_RATE_VALUE
                                 , tb_5.IMPORT_FEE_RATE
                                 -- , CAST(tb_1.ITEM_M_S_PRICE_VALUE AS DECIMAL(16,2)) AS ITEM_M_S_PRICE_VALUE
                                 , tb_1.ITEM_M_S_PRICE_VALUE
                                 , tb_1.UPDATE_BY
                                 , tb_1.FISCAL_YEAR
                                 , tb_1.VERSION
                                 , tb_1.IS_CURRENT
                                 , DATE_FORMAT(tb_1.UPDATE_DATE, '%Y-%m-%d %H:%i:%s') AS UPDATE_DATE
                                 , tb_6.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY_SYMBOL
                                 , tb_1.PURCHASE_UNIT_RATIO
                                 , tb_1.USAGE_UNIT_RATIO
                                 , tb_8.VENDOR_ALPHABET
                                 , tb_8.VENDOR_NAME
                                 , tb_9.ITEM_IMPORT_TYPE_NAME
                                 , tb_10.UNIT_OF_MEASUREMENT_NAME AS PURCHASE_UNIT_NAME
                                 , tb_11.UNIT_OF_MEASUREMENT_NAME AS USAGE_UNIT_NAME
                                 , tb_12.SCT_PATTERN_NAME
                                 , tb_13.ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME
                                 , tb_10.SYMBOL AS PURCHASE_UNIT_CODE
                                 , tb_11.SYMBOL AS USAGE_UNIT_CODE
                                 , tb_1.INUSE
           FROM
                                 ITEM_M_S_PRICE tb_1
                                            JOIN
                                 ITEM_M_O_PRICE tb_2
                                            ON
                                            tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
                                            JOIN
                                 ITEM_MANUFACTURING tb_3
                                            ON
                                            tb_2.ITEM_ID = tb_3.ITEM_ID
                                            JOIN
                                 EXCHANGE_RATE tb_4
                                            ON
                                            tb_1.EXCHANGE_RATE_ID = tb_4.EXCHANGE_RATE_ID
                                            JOIN
                                 CURRENCY tb_6
                                            ON
                                            tb_2.PURCHASE_PRICE_CURRENCY_ID = tb_6.CURRENCY_ID
                                            LEFT JOIN
                                 IMPORT_FEE tb_5
                                            ON
                                            tb_1.IMPORT_FEE_ID = tb_5.IMPORT_FEE_ID
                                            LEFT JOIN
                                 ITEM tb_7
                                            ON tb_3.ITEM_ID = tb_7.ITEM_ID
                                            LEFT JOIN
                                 vendor tb_8
                                            ON tb_3.VENDOR_ID = tb_8.VENDOR_ID
                                            LEFT JOIN
                                 item_import_type tb_9
                                            ON tb_8.ITEM_IMPORT_TYPE_ID = tb_9.ITEM_IMPORT_TYPE_ID
                                            LEFT JOIN
                                 UNIT_OF_MEASUREMENT tb_10
                                            ON
                                            tb_1.PURCHASE_UNIT_ID = tb_10.UNIT_OF_MEASUREMENT_ID
                                            LEFT JOIN
                                 UNIT_OF_MEASUREMENT tb_11
                                            ON
                                            tb_1.USAGE_UNIT_ID = tb_11.UNIT_OF_MEASUREMENT_ID
                                            LEFT JOIN
                                 dataItem.STANDARD_COST_DB.SCT_PATTERN tb_12
                                            ON tb_1.SCT_PATTERN_ID = tb_12.SCT_PATTERN_ID
                                            LEFT JOIN
                                 ITEM_M_S_PRICE_CREATE_FROM_SETTING tb_13
                                            ON tb_1.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID = tb_13.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID
                WHERE

                     tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'

                    AND  tb_7.ITEM_CATEGORY_ID NOT IN (1, 2, 3)
                    dataItem.sqlWhere
                    sqlWhereColumnFilter
                ORDER BY
                    dataItem.Order

            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')
    // console.log(sql)

    return sqlList
  },
  createNewItemMOPrice: async (dataItem: {
    ITEM_M_O_PRICE_ID: string
    ITEM_ID: string
    FISCAL_YEAR: number
    PURCHASE_PRICE: number
    PURCHASE_PRICE_CURRENCY_ID: number
    PURCHASE_PRICE_UNIT_ID: number
    CREATE_BY: string
    SCT_PATTERN_ID: number
    ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID: number
  }) => {
    let sql = `
                INSERT INTO ITEM_M_O_PRICE
                    (
                          ITEM_M_O_PRICE_ID
                        , ITEM_ID
                        , FISCAL_YEAR
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
                        , SCT_PATTERN_ID
                        , IS_CURRENT
                        , ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID
                    )
                VALUES
                    (
                          'dataItem.ITEM_M_O_PRICE_ID'
                        , 'dataItem.ITEM_ID'
                        , 'dataItem.FISCAL_YEAR'
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
                        , 'dataItem.SCT_PATTERN_ID'
                        , 1
                        , 'dataItem.ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID'
                    );
                    `

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.ITEM_M_O_PRICE_ID', dataItem['ITEM_M_O_PRICE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    sql = sql.replaceAll('dataItem.PURCHASE_PRICE_CURRENCY_ID', dataItem['PURCHASE_PRICE_CURRENCY_ID'].toString())
    sql = sql.replaceAll('dataItem.PURCHASE_PRICE_UNIT_ID', dataItem['PURCHASE_PRICE_UNIT_ID'].toString())
    sql = sql.replaceAll('dataItem.PURCHASE_PRICE', dataItem['PURCHASE_PRICE'].toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())

    sql = sql.replaceAll('dataItem.ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID', dataItem['ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID'].toString())

    return sql
  },
  createNewItemMStandardPrice: async (dataItem: {
    ITEM_M_S_PRICE_ID: string
    ITEM_M_O_PRICE_ID: string
    EXCHANGE_RATE_ID: number
    IMPORT_FEE_ID: number
    ITEM_M_S_PRICE_VALUE: number
    CREATE_BY: string
    FISCAL_YEAR: number
    ITEM_ID: number
    SCT_PATTERN_ID: number
    ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: number
  }) => {
    let sql = `
                INSERT INTO ITEM_M_S_PRICE
                    (
                          ITEM_M_S_PRICE_ID
                        , ITEM_M_O_PRICE_ID
                        , EXCHANGE_RATE_ID
                        , IMPORT_FEE_ID
                        , ITEM_M_S_PRICE_VALUE
                        , DESCRIPTION
                        , CREATE_BY
                        , CREATE_DATE
                        , UPDATE_BY
                        , UPDATE_DATE
                        , INUSE
                        , FISCAL_YEAR
                        , VERSION
                        , PURCHASE_UNIT_RATIO
                        , PURCHASE_UNIT_ID
                        , USAGE_UNIT_RATIO
                        , USAGE_UNIT_ID
                        , SCT_PATTERN_ID
                        , IS_CURRENT
                        , ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID
                    )
                SELECT
                      'dataItem.ITEM_M_S_PRICE_ID'
                    , 'dataItem.ITEM_M_O_PRICE_ID'
                    , 'dataItem.EXCHANGE_RATE_ID'
                    , 'dataItem.IMPORT_FEE_ID'
                    , 'dataItem.ITEM_M_S_PRICE_VALUE'
                    , ''
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
                    , 'dataItem.FISCAL_YEAR'
                    , @version
                    , tb_1.PURCHASE_UNIT_RATIO
                    , tb_1.PURCHASE_UNIT_ID
                    , tb_1.USAGE_UNIT_RATIO
                    , tb_1.USAGE_UNIT_ID
                    , 'dataItem.SCT_PATTERN_ID'
                    , 1
                    , 'dataItem.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID'
                FROM
                    ITEM_MANUFACTURING tb_1
                WHERE
                    tb_1.ITEM_ID = 'dataItem.ITEM_ID'
                    `

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_ID', dataItem['ITEM_M_S_PRICE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_M_O_PRICE_ID', dataItem['ITEM_M_O_PRICE_ID'])
    sql = sql.replaceAll('dataItem.EXCHANGE_RATE_ID', dataItem['EXCHANGE_RATE_ID'].toString())
    sql = sql.replaceAll("'dataItem.IMPORT_FEE_ID'", dataItem?.['IMPORT_FEE_ID'] ? `'${dataItem['IMPORT_FEE_ID']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_VALUE', dataItem['ITEM_M_S_PRICE_VALUE'].toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())

    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID', dataItem['ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID'].toString())

    return sql
  },
  createVersion: async (dataItem: { FISCAL_YEAR: number; SCT_PATTERN_ID: number; ITEM_CODE_FOR_SUPPORT_MES: string }) => {
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
                            JOIN
                                item_manufacturing tb_3
                                ON tb_2.ITEM_ID = tb_3.ITEM_ID
                            WHERE
                                    tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND tb_3.ITEM_CODE_FOR_SUPPORT_MES  = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
                                AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                        )
`

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())

    return sql
  },
  deleteOldDataByItemId: async (dataItem: any) => {
    let sql = `     UPDATE
                            ITEM_M_O_PRICE tb_1
                        LEFT JOIN
                            ITEM_M_S_PRICE tb_2
                        ON
                            tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
                    SET
                          tb_1.INUSE = '0'
                        , tb_2.INUSE = '0'
                    WHERE
                        tb_1.ITEM_ID = 'dataItem.ITEM_ID'
`

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },
  createItemMOPriceVersion: async (dataItem: { ITEM_CODE_FOR_SUPPORT_MES: string; FISCAL_YEAR: number; SCT_PATTERN_ID: number }) => {
    let sql = `
    SET @itemMOPriceVersionNo =  (
                        SELECT
                                IFNULL(MAX(ITEM_M_O_PRICE_VERSION_NO), 0) + 1
                        FROM
                                ITEM_M_O_PRICE tb_1
                                    INNER JOIN
                                ITEM_MANUFACTURING tb_2
                                    ON tb_1.ITEM_ID = tb_2.ITEM_ID
                        WHERE
                                    tb_2.ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
                                AND FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                    )
`

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())

    return sql
  },
  createExcelVersion: async (dataItem: any) => {
    let sql = `
    SET @excelVersionNo =  (
                        SELECT
                            IFNULL(MAX(ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_VERSION_NO), 0) + 1
                        FROM
                            ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY
                        WHERE
                                ITEM_M_ID = dataItem.ITEM_ID
                            AND ITEM_M_O_PRICE_IMPORT_TYPE_ID = 1
                    )
`

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },
  deleteOldExcelVersionByItemId: async (dataItem: any) => {
    let sql = `     UPDATE
                        ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY
                    SET
                        INUSE = '0'
                    WHERE
                            ITEM_M_ID = 'dataItem.ITEM_ID'
            `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },
  createManualVersion: async (dataItem: any) => {
    let sql = `
    SET @manualVersionNo =  (
                        SELECT
                            IFNULL(MAX(ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_VERSION_NO), 0) + 1
                        FROM
                        ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY
                        WHERE
                                ITEM_M_ID = dataItem.ITEM_ID
                            AND ITEM_M_O_PRICE_IMPORT_TYPE_ID = 2
                    )
`

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },
  deleteOldManualVersionByItemId: async (dataItem: any) => {
    let sql = `     UPDATE
                        ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY
                    SET
                        INUSE = '0'
                    WHERE
                            ITEM_M_ID = 'dataItem.ITEM_ID'
            `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },
  createItemMStandardPriceVersion: async (dataItem: any) => {
    let sql = `
    SET @itemMStandardPriceVersionNo =  (
                        SELECT
                            IFNULL(MAX(tb_1.VERSION), 0) + 1
                        FROM
                            ITEM_M_S_PRICE tb_1
                        JOIN
                            ITEM_M_O_PRICE tb_2
                        ON
                            tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
                        WHERE
                                tb_2.ITEM_ID = dataItem.ITEM_ID
                            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    )
`

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  insertExcelVersion: async (dataItem: any) => {
    let sql = `
            INSERT INTO ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY
                (
                      ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID
                    , ITEM_M_ID
                    , ITEM_M_O_PRICE_IMPORT_TYPE_ID
                    , ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_VERSION_NO
                    , DESCRIPTION
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
                )
            VALUES
                (
                          'dataItem.ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID'
                        , 'dataItem.ITEM_ID'
                        , 1
                        , @excelVersionNo
                        , ''
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 1
                )
            `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID', dataItem['ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertManualVersion: async (dataItem: any) => {
    let sql = `
            INSERT INTO ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY
                (
                      ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID
                    , ITEM_M_ID
                    , ITEM_M_O_PRICE_IMPORT_TYPE_ID
                    , ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_VERSION_NO
                    , DESCRIPTION
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
                )
            VALUES
                (
                          'dataItem.ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID'
                        , 'dataItem.ITEM_ID'
                        , 2
                        , @manualVersionNo
                        , ''
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 1
                )
            `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID', dataItem['ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  getOriginalPriceDetailByItemId: async (dataItem: any) => {
    let sql = `
                SELECT
                      PURCHASE_PRICE
                    , PURCHASE_PRICE_CURRENCY_ID
                FROM
                    ITEM_M_O_PRICE
                WHERE
                        INUSE = '1'
                    AND ITEM_ID = dataItem.ITEM_ID
                    AND ITEM_M_O_PRICE_VERSION_NO = (
                        SELECT
                            MAX(ITEM_M_O_PRICE_VERSION_NO)
                        FROM
                            ITEM_M_O_PRICE
                        WHERE
                                ITEM_ID = dataItem.ITEM_ID
                            AND INUSE = '1'
                    )
                `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },
  searchDataUnlimit: async (dataItem: any) => {
    let sqlList: any = []

    let sql = ` SELECT
                    COUNT(*) AS TOTAL_COUNT
                 FROM (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT
                    `

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['M_CODE_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = ` SELECT
                      tb_3.ITEM_CODE_FOR_SUPPORT_MES
                    , tb_3.ITEM_INTERNAL_SHORT_NAME
                    , tb_3.ITEM_INTERNAL_FULL_NAME
                    , tb_1.ITEM_M_S_PRICE_ID
                    , tb_2.ITEM_ID
                    , tb_2.PURCHASE_PRICE
                    , tb_4.EXCHANGE_RATE_VALUE
                    , tb_5.IMPORT_FEE_RATE
                    , CAST(tb_1.ITEM_M_S_PRICE_VALUE AS DECIMAL(16,2)) AS ITEM_M_S_PRICE_VALUE
                    , tb_1.UPDATE_BY
                    , tb_1.FISCAL_YEAR
                    , tb_1.VERSION
                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%Y-%m-%d %H:%i:%s') AS UPDATE_DATE
                    , tb_6.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY_SYMBOL
                    , tb_3.PURCHASE_UNIT_RATIO
                    , tb_3.USAGE_UNIT_RATIO
                    , tb_8.VENDOR_ALPHABET
                    , tb_8.VENDOR_NAME
                    , tb_9.ITEM_IMPORT_TYPE_NAME
                    , tb_10.UNIT_OF_MEASUREMENT_NAME AS PURCHASE_UNIT_NAME
                    , tb_11.UNIT_OF_MEASUREMENT_NAME AS USAGE_UNIT_NAME
                FROM

                  dataItem.sqlJoin


                        dataItem.sqlWhere
                        dataItem.sqlHaving

                ORDER BY
                    dataItem.Order

            `
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['M_CODE_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  searchLatestItemMOPrice: async (dataItem: any) => {
    let sql = `
                    WITH MaxVersions AS (
                                        SELECT
                                            ITEM_ID,
                                            MAX(ITEM_M_O_PRICE_VERSION_NO) AS MAX_VERSION_NO
                                        FROM
                                            ITEM_M_O_PRICE
                                        WHERE
                                            FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                            AND INUSE = '1'
                                        GROUP BY
                                            ITEM_ID
                                    )
                                    SELECT
                                        p.ITEM_M_O_PRICE_ID,
                                        p.ITEM_ID,
                                        p.PURCHASE_PRICE,
                                        p.PURCHASE_PRICE_CURRENCY_ID,
                                        p.PURCHASE_PRICE_UNIT_ID,
                                        p.FISCAL_YEAR,
                                        p.ITEM_M_O_PRICE_VERSION_NO,
                                        p.SCT_PATTERN_ID
                                    FROM
                                        ITEM_M_O_PRICE p
                                    JOIN
                                        MaxVersions mv
                                        ON p.ITEM_ID = mv.ITEM_ID
                                        AND p.ITEM_M_O_PRICE_VERSION_NO = mv.MAX_VERSION_NO
                                    WHERE
                                        p.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                        AND p.INUSE = '1'
                           `
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  getItemPriceByFiscalYearAndSctPattern: async (dataItem: any) => {
    let sql = `
            SELECT
                COUNT(*) AS TOTAL_COUNT
            FROM
                ITEM_M_O_PRICE
            WHERE
                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                AND SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])

    return sql
  },
  ItemMOPrice_updateIsCurrentByFiscalYearAndItemCode: async (dataItem: { FISCAL_YEAR: number; ITEM_CODE_FOR_SUPPORT_MES: string; SCT_PATTERN_ID: number }) => {
    let sql = `
                        UPDATE
                                        ITEM_M_O_PRICE tb_1
                                            INNER JOIN
                                        ITEM_MANUFACTURING tb_2
                                            ON tb_1.ITEM_ID = tb_2.ITEM_ID
                        SET
                                    tb_1.IS_CURRENT = 0
                        WHERE
                                    tb_1.FISCAL_YEAR = dataItem.FISCAL_YEAR
                                        AND tb_1.SCT_PATTERN_ID = dataItem.SCT_PATTERN_ID
                                        AND tb_2.ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
                                        AND tb_1.IS_CURRENT = 1 `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())

    return sql
  },
  ItemMSPrice_updateIsCurrentByFiscalYearAndItemCode: async (dataItem: { FISCAL_YEAR: number; ITEM_CODE_FOR_SUPPORT_MES: string; SCT_PATTERN_ID: number }) => {
    let sql = `

                        UPDATE
                                    ITEM_M_S_PRICE tb_3
                                        INNER JOIN
                                    ITEM_M_O_PRICE tb_1
                                        ON tb_3.ITEM_M_O_PRICE_ID = tb_1.ITEM_M_O_PRICE_ID
                                        INNER JOIN
                                    ITEM_MANUFACTURING tb_2
                                        ON tb_1.ITEM_ID = tb_2.ITEM_ID
                        SET
                                    tb_3.IS_CURRENT = 0
                        WHERE
                                        tb_3.FISCAL_YEAR = dataItem.FISCAL_YEAR
                                    AND tb_3.SCT_PATTERN_ID = dataItem.SCT_PATTERN_ID
                                    AND tb_2.ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
                                    AND tb_3.IS_CURRENT = 1
                        `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())

    return sql
  },
  searchAllLatestItemMSPriceByFiscalYear: async (dataItem: { FISCAL_YEAR: number }) => {
    let sql = `
           SELECT
                  tb_1.ITEM_M_S_PRICE_ID
                , tb_1.ITEM_M_O_PRICE_ID
                , tb_1.EXCHANGE_RATE_ID
                , tb_1.IMPORT_FEE_ID
                , tb_1.ITEM_M_S_PRICE_VALUE
                , tb_1.ITEM_M_S_PRICE_VERSION_NO
                , tb_1.FISCAL_YEAR
                , tb_1.VERSION
                , tb_1.PURCHASE_UNIT_RATIO
                , tb_1.PURCHASE_UNIT_ID
                , tb_1.USAGE_UNIT_RATIO
                , tb_1.USAGE_UNIT_ID
                , tb_1.SCT_PATTERN_ID
                , tb_1.IS_CURRENT
                , tb_1.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID
                , tb_2.CURRENCY_ID
                , tb_4.ITEM_CODE_FOR_SUPPORT_MES
                , tb_3.PURCHASE_PRICE
                , tb_4.ITEM_ID
                , tb_5.ITEM_IMPORT_TYPE_ID
            FROM
                ITEM_M_S_PRICE tb_1
                    INNER JOIN
                EXCHANGE_RATE tb_2
                    ON tb_1.EXCHANGE_RATE_ID = tb_2.EXCHANGE_RATE_ID
                    INNER JOIN
                ITEM_M_O_PRICE tb_3
                    ON tb_1.ITEM_M_O_PRICE_ID = tb_3.ITEM_M_O_PRICE_ID
                    INNER JOIN
                ITEM_MANUFACTURING tb_4
                    ON tb_3.ITEM_ID = tb_4.ITEM_ID
                    INNER JOIN
                VENDOR tb_5
                    ON tb_4.VENDOR_ID = tb_5.VENDOR_ID
            WHERE
                    tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                AND tb_1.IS_CURRENT = 1
                AND tb_1.INUSE = 1
            `
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())

    return sql
  },
  createNewItemMStandardPriceByExchangeRateIdBySetVariableNewExchangeRateId: async (dataItem: {
    ITEM_M_S_PRICE_ID: string
    ITEM_M_O_PRICE_ID: string
    IMPORT_FEE_ID: number
    ITEM_M_S_PRICE_VALUE: number
    CREATE_BY: string
    FISCAL_YEAR: number
    ITEM_ID: number
    SCT_PATTERN_ID: number
    ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: number
    CURRENCY_ID: number
    PURCHASE_UNIT_RATIO: number
    PURCHASE_UNIT_ID: number
    USAGE_UNIT_RATIO: number
    USAGE_UNIT_ID: number
  }) => {
    let sql = `
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
                        , VERSION
                        , PURCHASE_UNIT_RATIO
                        , PURCHASE_UNIT_ID
                        , USAGE_UNIT_RATIO
                        , USAGE_UNIT_ID
                        , SCT_PATTERN_ID
                        , IS_CURRENT
                        , ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID
                    )
                VALUES
                    (
                      'dataItem.ITEM_M_S_PRICE_ID'
                    , 'dataItem.ITEM_M_O_PRICE_ID'
                    ,  @new_exchange_rate_id_for_dataItem.CURRENCY_ID
                    , dataItem.IMPORT_FEE_ID
                    , 'dataItem.ITEM_M_S_PRICE_VALUE'
                    , 'dataItem.CREATE_BY'
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
                    , 'dataItem.FISCAL_YEAR'
                    , @version
                    , dataItem.PURCHASE_UNIT_RATIO
                    , dataItem.PURCHASE_UNIT_ID
                    , dataItem.USAGE_UNIT_RATIO
                    , dataItem.USAGE_UNIT_ID
                    , 'dataItem.SCT_PATTERN_ID'
                    , 1
                    , 'dataItem.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID'
                )
                    `
    sql = sql.replaceAll('dataItem.CURRENCY_ID', dataItem['CURRENCY_ID'].toString())

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_ID', dataItem['ITEM_M_S_PRICE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_M_O_PRICE_ID', dataItem['ITEM_M_O_PRICE_ID'])
    sql = sql.replaceAll('dataItem.IMPORT_FEE_ID', dataItem?.['IMPORT_FEE_ID'] ? `'${dataItem['IMPORT_FEE_ID']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_VALUE', dataItem['ITEM_M_S_PRICE_VALUE'].toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())

    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_RATIO', dataItem['PURCHASE_UNIT_RATIO'].toString())
    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_ID', dataItem['PURCHASE_UNIT_ID'].toString())
    sql = sql.replaceAll('dataItem.USAGE_UNIT_RATIO', dataItem['USAGE_UNIT_RATIO'].toString())
    sql = sql.replaceAll('dataItem.USAGE_UNIT_ID', dataItem['USAGE_UNIT_ID'].toString())

    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID', dataItem['ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID'].toString())

    return sql
  },
  createNewItemMStandardPriceByExchangeRateIdBySetVariableNewImportFeeId: async (dataItem: {
    ITEM_M_S_PRICE_ID: string
    ITEM_M_O_PRICE_ID: string
    IMPORT_FEE_ID: number
    ITEM_M_S_PRICE_VALUE: number
    CREATE_BY: string
    FISCAL_YEAR: number
    ITEM_ID: number
    SCT_PATTERN_ID: number
    ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: number
    EXCHANGE_RATE_ID: number
    PURCHASE_UNIT_RATIO: number
    PURCHASE_UNIT_ID: number
    USAGE_UNIT_RATIO: number
    USAGE_UNIT_ID: number
  }) => {
    let sql = `
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
                        , VERSION
                        , PURCHASE_UNIT_RATIO
                        , PURCHASE_UNIT_ID
                        , USAGE_UNIT_RATIO
                        , USAGE_UNIT_ID
                        , SCT_PATTERN_ID
                        , IS_CURRENT
                        , ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID
                    )
                VALUES
                    (
                      'dataItem.ITEM_M_S_PRICE_ID'
                    , 'dataItem.ITEM_M_O_PRICE_ID'
                    , dataItem.EXCHANGE_RATE_ID
                    ,  @new_import_fee_id
                    , 'dataItem.ITEM_M_S_PRICE_VALUE'
                    , 'dataItem.CREATE_BY'
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
                    , 'dataItem.FISCAL_YEAR'
                    , @version
                    , dataItem.PURCHASE_UNIT_RATIO
                    , dataItem.PURCHASE_UNIT_ID
                    , dataItem.USAGE_UNIT_RATIO
                    , dataItem.USAGE_UNIT_ID
                    , 'dataItem.SCT_PATTERN_ID'
                    , 1
                    , 'dataItem.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID'
                )
                    `
    sql = sql.replaceAll('dataItem.EXCHANGE_RATE_ID', dataItem['EXCHANGE_RATE_ID'].toString())

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_ID', dataItem['ITEM_M_S_PRICE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_M_O_PRICE_ID', dataItem['ITEM_M_O_PRICE_ID'])
    sql = sql.replaceAll('dataItem.IMPORT_FEE_ID', dataItem?.['IMPORT_FEE_ID'] ? `'${dataItem['IMPORT_FEE_ID']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_VALUE', dataItem['ITEM_M_S_PRICE_VALUE'].toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())

    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_RATIO', dataItem['PURCHASE_UNIT_RATIO'].toString())
    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_ID', dataItem['PURCHASE_UNIT_ID'].toString())
    sql = sql.replaceAll('dataItem.USAGE_UNIT_RATIO', dataItem['USAGE_UNIT_RATIO'].toString())
    sql = sql.replaceAll('dataItem.USAGE_UNIT_ID', dataItem['USAGE_UNIT_ID'].toString())

    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID', dataItem['ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID'].toString())

    return sql
  },
  delete: async (dataItem: any) => {
    let sql = `    UPDATE
                        ITEM_M_S_PRICE
                    SET
                          INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        ITEM_M_S_PRICE_ID = 'dataItem.ITEM_M_S_PRICE_ID'
                      `
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_ID', dataItem['ITEM_M_S_PRICE_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    return sql
  },
}
