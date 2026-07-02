export const YieldRateSQL = {
  search: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `  SELECT COUNT(*) AS TOTAL_COUNT

	             FROM
                PRODUCT_CATEGORY tb_1
                INNER JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID AND tb_2.INUSE = 1
                INNER JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_4.INUSE = 1
                INNER JOIN YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                INNER JOIN PROCESS tb_7 ON tb_7.PROCESS_ID = tb_5.PROCESS_ID
                INNER JOIN FLOW tb_8 ON tb_8.FLOW_ID = tb_5.FLOW_ID
                INNER JOIN PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_10 ON tb_10.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_10.INUSE = 1
                INNER JOIN CUSTOMER_INVOICE_TO tb_11 ON tb_11.CUSTOMER_INVOICE_TO_ID = tb_10.CUSTOMER_INVOICE_TO_ID AND tb_11.INUSE = 1
                LEFT JOIN PRODUCT_TYPE_ITEM_CATEGORY tb_12 ON tb_12.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_12.INUSE = 1
                INNER JOIN ITEM_CATEGORY tb_13 ON tb_13.ITEM_CATEGORY_ID = tb_12.ITEM_CATEGORY_ID AND tb_13.INUSE = 1

                WHERE tb_5.INUSE = 1
                dataItem.sqlWhere
                sqlWhereColumnFilter

        `
    // sql = sql.replaceAll('dataItem.TEST_DB', process.env.TEST_DB)
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'])
    //console.log(sql)
    sqlList.push(sql)

    sql = `         SELECT
                      tb_1.PRODUCT_CATEGORY_ID
                    , tb_1.PRODUCT_CATEGORY_NAME
                    , tb_2.PRODUCT_MAIN_ID
                    , tb_2.PRODUCT_MAIN_NAME
                    , tb_3.PRODUCT_SUB_ID
                    , tb_3.PRODUCT_SUB_NAME
                    , tb_4.PRODUCT_TYPE_ID
                    , tb_4.PRODUCT_TYPE_NAME
                    , tb_4.PRODUCT_TYPE_CODE
                    , tb_4.PRODUCT_TYPE_CODE_FOR_SCT
                    , tb_5.BOM_ID
                    , tb_5.YIELD_RATE_FOR_SCT
                    , tb_5.YIELD_ACCUMULATION_FOR_SCT
                    , tb_5.GO_STRAIGHT_RATE_FOR_SCT
                    , tb_5.SCT_TAG_SETTING_ID
                    , tb_5.COLLECTION_POINT_FOR_SCT
                    , tb_5.SCT_REASON_SETTING_ID
                    , tb_5.DESCRIPTION
                    , tb_5.FISCAL_YEAR
                    , tb_5.FLOW_ID
                    , tb_8.FLOW_NAME
                    , tb_8.FLOW_CODE
                    , tb_7.PROCESS_NAME
                    , tb_5.FLOW_PROCESS_ID
                    , tb_5.FLOW_PROCESS_NO
                    , tb_5.REVISION_NO
                    , tb_5.UPDATE_BY
                    , DATE_FORMAT(tb_5.UPDATE_DATE, '%d-%b-%Y %H:%i:%s' ) AS MODIFIED_DATE
                    , tb_5.INUSE
                    , tb_10.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID
                    , tb_10.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_NAME
                    , tb_13.ITEM_CATEGORY_ID
                    , tb_13.ITEM_CATEGORY_NAME

                  FROM

                    PRODUCT_CATEGORY tb_1
                    INNER JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID AND tb_2.INUSE = 1
                    INNER JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                    INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_4.INUSE = 1
                    INNER JOIN YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                    INNER JOIN PROCESS tb_7 ON tb_7.PROCESS_ID = tb_5.PROCESS_ID
                    INNER JOIN FLOW tb_8 ON tb_8.FLOW_ID = tb_5.FLOW_ID
                    INNER JOIN PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_10 ON tb_10.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_10.INUSE = 1
                    INNER JOIN CUSTOMER_INVOICE_TO tb_11 ON tb_11.CUSTOMER_INVOICE_TO_ID = tb_10.CUSTOMER_INVOICE_TO_ID AND tb_11.INUSE = 1
                    LEFT JOIN PRODUCT_TYPE_ITEM_CATEGORY tb_12 ON tb_12.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_12.INUSE = 1
                    INNER JOIN ITEM_CATEGORY tb_13 ON tb_13.ITEM_CATEGORY_ID = tb_12.ITEM_CATEGORY_ID AND tb_13.INUSE = 1

                    WHERE tb_5.INUSE = 1
                        dataItem.sqlWhere
                        sqlWhereColumnFilter

                        ORDER BY
                            dataItem.Order
                        LIMIT
                            dataItem.Start
                        ,   dataItem.Limit


        `
    //  sql = sql.replaceAll('dataItem.TEST_DB', process.env.TEST_DB)
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.Order', dataItem.Order)
    sql = sql.replaceAll('dataItem.Start', dataItem.Start)
    sql = sql.replaceAll('dataItem.Limit', dataItem.Limit)
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  searchTotal: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `  SELECT COUNT(*) AS TOTAL_COUNT
                     FROM
                          PRODUCT_CATEGORY tb_1
                          INNER JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID AND tb_2.INUSE = 1
                          INNER JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                          INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_4.INUSE = 1
                          INNER JOIN YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                          INNER JOIN FLOW tb_7 ON tb_7.FLOW_ID = tb_5.FLOW_ID
                          WHERE tb_5.INUSE = 1

                dataItem.sqlWhere
                sqlWhereColumnFilter

        `
    // sql = sql.replaceAll('dataItem.TEST_DB', process.env.TEST_DB)
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    //console.log(sql)
    sqlList.push(sql)

    sql = `  SELECT  tb_1.PRODUCT_CATEGORY_ID
                    , tb_1.PRODUCT_CATEGORY_NAME
                    , tb_2.PRODUCT_MAIN_ID
                    , tb_2.PRODUCT_MAIN_NAME
                    , tb_3.PRODUCT_SUB_ID
                    , tb_3.PRODUCT_SUB_NAME
                    , tb_4.PRODUCT_TYPE_ID
                    , tb_4.PRODUCT_TYPE_NAME
                    , tb_4.PRODUCT_TYPE_CODE
                    , tb_4.PRODUCT_TYPE_CODE_FOR_SCT
                    , tb_5.BOM_ID
                    , tb_5.TOTAL_YIELD_RATE_FOR_SCT
                    , tb_5.TOTAL_GO_STRAIGHT_RATE_FOR_SCT
                    , tb_5.SCT_REASON_SETTING_ID
                    , tb_5.DESCRIPTION
                    , tb_5.FISCAL_YEAR
                    , tb_5.FLOW_ID
                    , tb_7.FLOW_NAME
                    , tb_7.FLOW_CODE
                    , tb_5.REVISION_NO
                    , tb_5.UPDATE_BY
                    , DATE_FORMAT(tb_5.UPDATE_DATE, '%d-%b-%Y %H:%i:%s' ) AS MODIFIED_DATE
                    , tb_5.INUSE

                      FROM
                          PRODUCT_CATEGORY tb_1
                          INNER JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID AND tb_2.INUSE = 1
                          INNER JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                          INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_4.INUSE = 1
                          INNER JOIN YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                          INNER JOIN FLOW tb_7 ON tb_7.FLOW_ID = tb_5.FLOW_ID
                          WHERE tb_5.INUSE = 1

                        dataItem.sqlWhere
                        sqlWhereColumnFilter

                        ORDER BY
                            dataItem.Order
                        LIMIT
                            dataItem.Start
                        ,   dataItem.Limit


        `
    // sql = sql.replaceAll('dataItem.TEST_DB', process.env.TEST_DB)
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.Order', dataItem.Order)
    sql = sql.replaceAll('dataItem.Start', dataItem.Start)
    sql = sql.replaceAll('dataItem.Limit', dataItem.Limit)
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    //console.log(sql)
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
}
