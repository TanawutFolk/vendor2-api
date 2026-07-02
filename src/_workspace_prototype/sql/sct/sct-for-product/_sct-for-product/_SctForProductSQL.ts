export const _SctForProductSQL = {
  getSctBomItemItemPriceByBomIdAndFiscalYear_MasterDataLatest: async (dataItem: { BOM_ID: number; FISCAL_YEAR: number; PRODUCT_TYPE_ID: number; SCT_PATTERN_ID: number }) => {
    //     let sql = `
    //                         SELECT
    //                                   tb_1.BOM_ID
    //                                 , tb_3.PURCHASE_PRICE
    //                                 , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
    //                                 , tb_2.USAGE_QUANTITY
    //                                 , tb_4.ITEM_M_S_PRICE_VALUE
    //                                 , tb_3.PURCHASE_PRICE_CURRENCY_ID
    //                                 , tb_6.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY
    //                                 , tb_3.PURCHASE_PRICE_UNIT_ID
    //                                 , tb_7.SYMBOL AS PURCHASE_UNIT
    //                                 , tb_4.ITEM_M_S_PRICE_ID
    //                                 , tb_8.ITEM_ID
    //                                 , tb_10.IMPORT_FEE_RATE
    //                                 , tb_11.yield_accumulation_of_item_for_sct
    //                                 , tb_2.FLOW_PROCESS_ID
    //                                 , tb_1.FLOW_ID
    //                                 , tb_12.PROCESS_ID
    //                                 , tb_9.ITEM_CATEGORY_ID AS ITEM_CATEGORY_ID_FROM_BOM
    //                                 , tb_13.PRODUCT_TYPE_ID AS PRODUCT_TYPE_ID_FROM_ITEM
    //                                 , tb_14.ITEM_CODE_FOR_SUPPORT_MES
    //                         FROM
    //                                 BOM tb_1
    //                                         INNER JOIN
    //                                 BOM_FLOW_PROCESS_ITEM_USAGE tb_2
    //                                             ON tb_1.BOM_ID = tb_2.BOM_ID
    //                                         AND tb_1.BOM_ID = 'dataItem.BOM_ID'
    //                                         AND tb_2.INUSE = 1
    //                                         LEFT JOIN
    //                                 item_m_o_price tb_3
    //                                             ON tb_2.ITEM_ID = tb_3.ITEM_ID
    //                                         AND tb_3.INUSE = 1
    //                                         AND tb_3.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
    //                                         LEFT JOIN
    //                                 item_m_s_price tb_4
    //                                         ON tb_3.ITEM_M_O_PRICE_ID = tb_4.ITEM_M_O_PRICE_ID
    //                                         AND tb_4.inuse = 1
    //                                         LEFT JOIN
    //                                 (
    //                                         SELECT
    //                                                 tbs_1.ITEM_ID , MAX(tbs_2.ITEM_M_S_PRICE_VERSION_NO) AS max_revision
    //                                         FROM
    //                                                 item_m_o_price tbs_1
    //                                                         INNER join
    //                                                 item_m_s_price tbs_2
    //                                                         ON tbs_1.item_m_o_price_id = tbs_2.item_m_o_price_id
    //                                                         AND tbs_1.inuse = 1
    //                                                         AND tbs_2.inuse = 1
    //                                                         AND tbs_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
    //                                         GROUP BY tbs_1.ITEM_ID
    //                                 ) tb_5
    //                                             ON tb_3.ITEM_ID = tb_5.ITEM_ID
    //                                         AND tb_4.ITEM_M_S_PRICE_VERSION_NO = tb_5.max_revision
    //                                         LEFT JOIN
    //                                 CURRENCY tb_6
    //                                         ON tb_3.PURCHASE_PRICE_CURRENCY_ID = tb_6.CURRENCY_ID
    //                                         LEFT JOIN
    //                                 UNIT_OF_MEASUREMENT tb_7
    //                                         ON tb_3.PURCHASE_PRICE_UNIT_ID = tb_7.UNIT_OF_MEASUREMENT_ID
    //                                         LEFT JOIN
    //                                 ITEM tb_8
    //                                         ON tb_2.ITEM_ID = tb_8.ITEM_ID
    //                                         LEFT JOIN
    //                                 BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_9
    //                                             ON tb_2.ITEM_ID = tb_9.ITEM_ID
    //                                         AND tb_9.INUSE = 1
    //                                         AND tb_1.BOM_ID = tb_9.BOM_ID
    //                                         AND tb_2.FLOW_PROCESS_ID = tb_9.FLOW_PROCESS_ID
    //                                         AND tb_2.NO = tb_9.NO
    //                                         LEFT JOIN
    //                                 IMPORT_FEE tb_10
    //                                         ON tb_4.IMPORT_FEE_ID = tb_10.IMPORT_FEE_ID
    //                                         LEFT JOIN
    //                                 yield_accumulation_of_item_for_sct tb_11
    //                                             ON tb_2.ITEM_ID = tb_11.ITEM_ID
    //                                         AND tb_11.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
    //                                         AND tb_11.INUSE = 1
    //                                         LEFT JOIN
    //                                 FLOW_PROCESS tb_12
    //                                         ON tb_2.FLOW_PROCESS_ID = tb_12.FLOW_PROCESS_ID
    //                                         LEFT JOIN
    //                                 ITEM_PRODUCT_DETAIL tb_13
    //                                         ON tb_8.ITEM_ID = tb_13.ITEM_ID
    //                                         AND tb_13.INUSE = 1
    //                                         LEFT JOIN
    //                                 ITEM_MANUFACTURING tb_14
    //                                         ON tb_8.ITEM_ID = tb_14.ITEM_ID

    //                                         `

    let sql = `
   SELECT
                                  tb_1.BOM_ID
                                , tb_3.PURCHASE_PRICE
                                , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                , tb_2.USAGE_QUANTITY
                                , tb_4.ITEM_M_S_PRICE_VALUE
                                , tb_3.PURCHASE_PRICE_CURRENCY_ID
                                , tb_6.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY
                                , tb_3.PURCHASE_PRICE_UNIT_ID
                                , tb_7.SYMBOL AS PURCHASE_UNIT
                                , tb_4.ITEM_M_S_PRICE_ID
                                , tb_8.ITEM_ID
                                , tb_10.IMPORT_FEE_RATE
                                , tb_11.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
                                , tb_2.FLOW_PROCESS_ID
                                , tb_1.FLOW_ID
                                , tb_12.PROCESS_ID
                                , tb_9.ITEM_CATEGORY_ID AS ITEM_CATEGORY_ID_FROM_BOM
                                , tb_13.PRODUCT_TYPE_ID AS PRODUCT_TYPE_ID_FROM_ITEM
                                , tb_14.ITEM_CODE_FOR_SUPPORT_MES
                                , tb_11.REVISION_NO AS YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_REVISION_NO
                                , tb_14.IS_CURRENT AS ITEM_IS_CURRENT
                        FROM
                                BOM tb_1
                                        INNER JOIN
                                BOM_FLOW_PROCESS_ITEM_USAGE tb_2
                                            ON tb_1.BOM_ID = tb_2.BOM_ID
                                        AND tb_1.BOM_ID = 'dataItem.BOM_ID'
                                        AND tb_2.INUSE = 1
                                        LEFT JOIN
                               item_m_o_price tb_3
                                          ON tb_2.ITEM_ID  = tb_3.ITEM_ID
                                          AND tb_3.INUSE = 1
                                          AND tb_3.IS_CURRENT = 1
                                          AND tb_3.FISCAL_YEAR  = 'dataItem.FISCAL_YEAR'
                                          AND tb_3.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                                       LEFT JOIN
                               item_m_s_price tb_4
                                       ON tb_3.ITEM_M_O_PRICE_ID = tb_4.ITEM_M_O_PRICE_ID
                                       AND tb_4.inuse = 1
                                       AND tb_4.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                       AND tb_4.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                                       AND tb_4.IS_CURRENT = 1
                                       LEFT JOIN
                               exchange_rate tb_5
                                                ON tb_4.EXCHANGE_RATE_ID = tb_5.EXCHANGE_RATE_ID
                                                LEFT JOIN
                                CURRENCY tb_6
                                        ON tb_5.CURRENCY_ID = tb_6.CURRENCY_ID
                                        LEFT JOIN
                                UNIT_OF_MEASUREMENT tb_7
                                        ON tb_4.PURCHASE_UNIT_ID  = tb_7.UNIT_OF_MEASUREMENT_ID
                                        LEFT JOIN
                                ITEM tb_8
                                        ON tb_2.ITEM_ID = tb_8.ITEM_ID
                                        LEFT JOIN
                                BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_9
                                            ON tb_2.ITEM_ID = tb_9.ITEM_ID
                                        AND tb_9.INUSE = 1
                                        AND tb_1.BOM_ID = tb_9.BOM_ID
                                        AND tb_2.FLOW_PROCESS_ID = tb_9.FLOW_PROCESS_ID
                                        AND tb_2.NO = tb_9.NO
                                        LEFT JOIN
                                IMPORT_FEE tb_10
                                        ON tb_4.IMPORT_FEE_ID = tb_10.IMPORT_FEE_ID
                                        LEFT JOIN
                                yield_accumulation_of_item_for_sct tb_11
                                            ON tb_2.ITEM_ID = tb_11.ITEM_ID
                                        AND tb_11.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                        AND tb_11.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                        AND tb_11.INUSE = 1
                                        LEFT JOIN
                                FLOW_PROCESS tb_12
                                        ON tb_2.FLOW_PROCESS_ID = tb_12.FLOW_PROCESS_ID
                                        LEFT JOIN
                                ITEM_PRODUCT_DETAIL tb_13
                                        ON tb_8.ITEM_ID = tb_13.ITEM_ID
                                        AND tb_13.INUSE = 1
                                        LEFT JOIN
                                ITEM_MANUFACTURING tb_14
                                        ON tb_8.ITEM_ID = tb_14.ITEM_ID
                        `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())

    return sql
  },
  getLastSellingBySctId: async (dataItem: { SCT_ID: string }) => {
    let sql = `
                              SELECT
                                                                      tb_3_1.ITEM_M_S_PRICE_ID
                                                                    , tb_3_1.ITEM_M_S_PRICE_VALUE
                                                                    , tb_4_1.SCT_ID
                                                                    , tb_3_1.VERSION
                                                                    , tb_3_1.CREATE_DATE
                                                    FROM
                                                                    item_m_s_price tb_3_1
                                                                            INNER JOIN
                                                                    item_m_s_price_sct  tb_4_1
                                                                            ON tb_3_1.ITEM_M_S_PRICE_ID = tb_4_1.ITEM_M_S_PRICE_ID
                                                                            AND tb_4_1.inuse = 1
                                                                            AND tb_3_1.INUSE = 1
                                            WHERE tb_4_1.SCT_ID = 'dataItem.SCT_ID'
                                          `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  getSctBomFlowProcessPriceAdjustBySct: async (dataItem: { SCT_ID: string }) => {
    let sql = `
                    SELECT
                              tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                            , tb_1.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE
                            , tb_1.MATERIAL_SCT_ID
                            , tb_2.SCT_STATUS_PROGRESS_ID
                    FROM
                            dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST tb_1
                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_2
                    ON
                            tb_1.MATERIAL_SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                    WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'
                                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
}
