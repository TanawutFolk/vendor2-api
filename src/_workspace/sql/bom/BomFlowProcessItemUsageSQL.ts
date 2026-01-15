export const BomFlowProcessItemUsageSQL = {
  getByProductTypeCodeAndProcessName: async (dataItem: { PRODUCT_TYPE_CODE: string; PROCESS_NAME: string }) => {
    let sql = `

                            SELECT
                                       tb_7.ITEM_ID
                                     , tb_5.NO
                                     , tb_7.ITEM_CODE_FOR_SUPPORT_MES
                                     , tb_7.ITEM_INTERNAL_SHORT_NAME
                                     , tb_7.ITEM_INTERNAL_FULL_NAME
                                     , tb_6.ITEM_CATEGORY_NAME
                                     , tb_3.BOM_CODE
                                     , tb_3.BOM_NAME
                                     , tb_8.FLOW_CODE
                                     , tb_8.FLOW_NAME
                            FROM
                                        PRODUCT_TYPE tb_1
                                                INNER JOIN
                                        PRODUCT_TYPE_BOM tb_2
                                                    ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                                AND tb_2.INUSE = '1'
                                                AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT = 'dataItem.PRODUCT_TYPE_CODE'
                                                INNER JOIN
                                        BOM tb_3
                                                    ON tb_2.BOM_ID = tb_3.BOM_ID
                                                INNER JOIN
                                        BOM_FLOW_PROCESS_ITEM_USAGE tb_4
                                                    ON tb_3.BOM_ID = tb_4.BOM_ID
                                                AND tb_4.INUSE = '1'
                                                INNER JOIN
                                        BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_5
                                                    ON tb_4.BOM_ID = tb_5.BOM_ID
                                                AND tb_4.FLOW_PROCESS_ID = tb_5.FLOW_PROCESS_ID
                                                AND tb_4.ITEM_ID  = tb_5.ITEM_ID
                                                AND tb_5.INUSE = '1'
                                                INNER JOIN
                                        ITEM_CATEGORY tb_6
                                                    ON tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID
                                                INNER JOIN
                                        ITEM_MANUFACTURING tb_7
                                                ON tb_4.ITEM_ID = tb_7.ITEM_ID
                                                INNER JOIN
                                        FLOW tb_8
                                                ON tb_3.FLOW_ID = tb_8.FLOW_ID
                                                INNER JOIN
                                        FLOW_PROCESS tb_9
                                                ON tb_8.FLOW_ID = tb_9.FLOW_ID
                                                AND tb_5.FLOW_PROCESS_ID = tb_9.FLOW_PROCESS_ID
                                                AND tb_9.INUSE = 1
                                                INNER JOIN
                                        PROCESS tb_10
                                                ON tb_9.PROCESS_ID = tb_10.PROCESS_ID
                                        WHERE
                                                tb_10.PROCESS_NAME = 'dataItem.PROCESS_NAME'

                                                       `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])

    return sql
  },
  getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId: async (dataItem: { BOM_ID: number; FISCAL_YEAR: number; SCT_PATTERN_ID: number; PRODUCT_TYPE_ID: number }) => {
    let sql = `
                   SELECT
                            ROW_NUMBER() OVER (ORDER BY  tb_3.NO , tb_8.ITEM_CODE_FOR_SUPPORT_MES) AS ITEM_NO
                          , tb_1.BOM_ID
                          , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                          , tb_1.BOM_NAME
                          , tb_1.BOM_CODE
                          , tb_3.FLOW_PROCESS_ID
                          , tb_3.PROCESS_ID
                          , tb_5.PROCESS_NAME
                          , tb_5.PROCESS_CODE
                          , tb_3.NO AS 'PROCESS_NO'
                          , tb_4.FLOW_ID
                          , tb_4.FLOW_NAME
                          , tb_4.FLOW_CODE
                          , tb_6.ITEM_ID
                          , tb_2.USAGE_QUANTITY

                          , tb_7.ITEM_CATEGORY_NAME as 'ITEM_CATEGORY_NAME_FROM_MASTER'
                          , tb_7.ITEM_CATEGORY_ID as 'ITEM_CATEGORY_ID_FROM_MASTER'
                          , tb_7.ITEM_CATEGORY_ALPHABET as 'ITEM_CATEGORY_ALPHABET_FROM_MASTER'
                          , tb_7.ITEM_CATEGORY_SHORT_NAME as 'ITEM_CATEGORY_SHORT_NAME_FROM_MASTER'

                          , tb_17.ITEM_CATEGORY_NAME as ITEM_CATEGORY_NAME_FROM_BOM
                          , tb_17.ITEM_CATEGORY_ID as ITEM_CATEGORY_ID_FROM_BOM
                          , tb_17.ITEM_CATEGORY_ALPHABET as ITEM_CATEGORY_ALPHABET_FROM_BOM
                          , tb_17.ITEM_CATEGORY_SHORT_NAME as ITEM_CATEGORY_SHORT_NAME_FROM_BOM

                          , tb_8.ITEM_CODE_FOR_SUPPORT_MES
                          , tb_8.ITEM_EXTERNAL_FULL_NAME
                          , tb_8.ITEM_EXTERNAL_SHORT_NAME

                          , tb_8.PURCHASE_UNIT_ID as PURCHASE_UNIT_ID_FROM_MASTER
                          , tb_8.USAGE_UNIT_ID as USAGE_UNIT_ID_FROM_MASTER
                          , tb_8.USAGE_UNIT_RATIO as USAGE_UNIT_RATIO_FROM_MASTER
                          , tb_8.PURCHASE_UNIT_RATIO as PURCHASE_UNIT_RATIO_FROM_MASTER

                          , tb_9.UNIT_OF_MEASUREMENT_NAME as USAGE_UNIT_NAME_FROM_MASTER
                          , tb_10.UNIT_OF_MEASUREMENT_NAME as PURCHASE_UNIT_NAME_FROM_MASTER
                          , tb_9.SYMBOL  as USAGE_UNIT_CODE_FROM_MASTER
                          , tb_10.SYMBOL as PURCHASE_UNIT_CODE_FROM_MASTER

                          , tb_13.ITEM_M_S_PRICE_ID
                          , tb_13.ITEM_M_S_PRICE_VALUE
                          , tb_12.PURCHASE_PRICE_CURRENCY_ID
                          , tb_12.PURCHASE_PRICE
                          , tb_12.PURCHASE_PRICE_UNIT_ID
                          , tb_16.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY_CODE

                          , tb_14.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
                          , tb_8.VERSION_NO AS ITEM_VERSION_NO
                          , tb_8.IS_CURRENT AS ITEM_IS_CURRENT
                  FROM
                        BOM tb_1
                                INNER JOIN
                        BOM_FLOW_PROCESS_ITEM_USAGE tb_2
                                ON tb_1.BOM_ID = tb_2.BOM_ID
                                AND tb_2.INUSE = 1
                                INNER JOIN
                        FLOW_PROCESS tb_3
                                ON tb_2.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID
                                INNER JOIN
                        FLOW tb_4
                                ON tb_3.FLOW_ID = tb_4.FLOW_ID
                                INNER JOIN
                        PROCESS tb_5
                                ON tb_3.PROCESS_ID = tb_5.PROCESS_ID
                                INNER JOIN
                        ITEM tb_6
                                    ON tb_2.ITEM_ID = tb_6.ITEM_ID
                                INNER JOIN
                        ITEM_CATEGORY tb_7
                                    ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
                                INNER JOIN
                        ITEM_MANUFACTURING tb_8
                                    ON tb_6.ITEM_ID = tb_8.ITEM_ID
                                INNER JOIN
                        UNIT_OF_MEASUREMENT tb_9
                                ON tb_8.USAGE_UNIT_ID = tb_9.UNIT_OF_MEASUREMENT_ID
                                INNER JOIN
                        UNIT_OF_MEASUREMENT tb_10
                                ON tb_8.PURCHASE_UNIT_ID = tb_10.UNIT_OF_MEASUREMENT_ID
                                INNER JOIN
                        BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_11
                                    ON tb_2.BOM_ID = tb_11.BOM_ID
                                AND tb_2.FLOW_PROCESS_ID = tb_11.FLOW_PROCESS_ID
                                AND tb_2.ITEM_ID = tb_11.ITEM_ID
                                AND tb_11.INUSE = 1
                                LEFT JOIN
                        item_m_o_price tb_12
                                ON tb_2.ITEM_ID = tb_12.ITEM_ID
                                AND tb_12.FISCAL_YEAR = dataItem.FISCAL_YEAR
                                AND tb_12.SCT_PATTERN_ID = dataItem.SCT_PATTERN_ID
                                AND tb_12.INUSE = 1
                                AND tb_12.IS_CURRENT = 1
                                LEFT JOIN
                        ITEM_M_S_PRICE tb_13
                                ON
                                tb_12.ITEM_M_O_PRICE_ID = tb_13.ITEM_M_O_PRICE_ID
                                AND tb_13.INUSE = 1
                                AND tb_13.IS_CURRENT = 1
                                AND tb_13.FISCAL_YEAR = dataItem.FISCAL_YEAR
                                AND tb_13.SCT_PATTERN_ID = dataItem.SCT_PATTERN_ID
                                LEFT JOIN
                        YIELD_ACCUMULATION_OF_ITEM_FOR_SCT tb_14
                                        ON tb_14.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                        AND tb_14.FISCAL_YEAR  = 'dataItem.FISCAL_YEAR'
                                        AND tb_14.IS_CURRENT = 1
                                        AND tb_12.ITEM_ID = tb_14.ITEM_ID
                                        AND tb_14.INUSE = 1
                                 LEFT JOIN
                        EXCHANGE_RATE tb_15
                                        ON tb_13.EXCHANGE_RATE_ID  = tb_15.EXCHANGE_RATE_ID
                                        LEFT JOIN
                        CURRENCY tb_16
                                        ON tb_15.CURRENCY_ID  = tb_16.CURRENCY_ID
                                LEFT JOIN
                        ITEM_CATEGORY tb_17
                                    ON tb_11.ITEM_CATEGORY_ID = tb_17.ITEM_CATEGORY_ID
                   WHERE
                        tb_1.BOM_ID  = 'dataItem.BOM_ID'
                   ORDER BY
                          tb_3.NO
                        , tb_8.ITEM_CODE_FOR_SUPPORT_MES`

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'].toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())

    return sql
  },
}
