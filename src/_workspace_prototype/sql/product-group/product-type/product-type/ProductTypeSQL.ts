export const ProductTypeSQL = {
  getProductTypeByProductMainId: async (dataItem: any) => {
    let sql = `
                                      SELECT
                                             tb_10.BOM_ID
                                            , tb_6.ITEM_CATEGORY_NAME
                                            , tb_5.ITEM_CATEGORY_ID
                                            , tb_4.PRODUCT_CATEGORY_ID
                                            , tb_4.PRODUCT_CATEGORY_NAME
                                            , tb_3.PRODUCT_MAIN_ID
                                            , tb_3.PRODUCT_MAIN_NAME
                                            , tb_2.PRODUCT_SUB_ID
                                            , tb_2.PRODUCT_SUB_NAME
                                            , tb_1.PRODUCT_TYPE_ID
                                            , tb_1.PRODUCT_TYPE_NAME
                                            , tb_1.PRODUCT_TYPE_CODE
                                            , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                                        FROM
                                             PRODUCT_TYPE tb_1
                                        LEFT JOIN
                                              PRODUCT_SUB tb_2
                                           ON tb_1.PRODUCT_SUB_ID  = tb_2.PRODUCT_SUB_ID and tb_2.INUSE =1
                                          LEFT JOIN
                                              PRODUCT_MAIN tb_3
                                           ON tb_2.PRODUCT_MAIN_ID  = tb_3.PRODUCT_MAIN_ID and tb_3.INUSE =1
                                          LEFT JOIN
                                              PRODUCT_CATEGORY tb_4
                                           ON tb_3.PRODUCT_CATEGORY_ID  = tb_4.PRODUCT_CATEGORY_ID and tb_4.INUSE =1
                                            LEFT JOIN
                                              PRODUCT_TYPE_ITEM_CATEGORY tb_5
                                           ON tb_1.PRODUCT_TYPE_ID  = tb_5.PRODUCT_TYPE_ID and tb_5.INUSE =1
                                            LEFT JOIN
                                               ITEM_CATEGORY tb_6
                                           ON tb_5.ITEM_CATEGORY_ID  = tb_6.ITEM_CATEGORY_ID and tb_6.INUSE =1
                                            LEFT JOIN
                                               PRODUCT_SPECIFICATION_DOCUMENT_SETTING  tb_7
                                           ON tb_3.PRODUCT_MAIN_ID  = tb_7.PRODUCT_MAIN_ID and tb_7.INUSE =1
                                           LEFT JOIN
                                               PRODUCT_SPECIFICATION_TYPE tb_8
                                           ON tb_7.PRODUCT_SPECIFICATION_TYPE_ID  = tb_8. PRODUCT_SPECIFICATION_TYPE_ID and tb_8.INUSE =1
                                           LEFT JOIN
                                               PRODUCT_TYPE_PROGRESS_WORKING tb_9
                                           ON tb_1.PRODUCT_TYPE_ID  = tb_9.PRODUCT_TYPE_ID and tb_9.INUSE =1
                                           LEFT JOIN
                                               PRODUCT_TYPE_BOM tb_10
                                           ON tb_1.PRODUCT_TYPE_ID  = tb_10.PRODUCT_TYPE_ID and tb_10.INUSE = 1

                                        WHERE
                                           tb_9.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
                                          AND tb_3.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                          AND tb_1.INUSE = 1

                                          ORDER BY  tb_1.PRODUCT_TYPE_CODE_FOR_SCT


                 `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    //console.log(sql)
    return sql
  },

  getByProductGroup: async (dataItem: any, sqlWhere: any) => {
    let sql = `
                                      SELECT
                                                 tb_4.PRODUCT_CATEGORY_ID
                                                , tb_4.PRODUCT_CATEGORY_NAME
                                                , tb_4.PRODUCT_CATEGORY_ALPHABET
                                                , tb_3.PRODUCT_MAIN_ID
                                                , tb_3.PRODUCT_MAIN_NAME
                                                , tb_3.PRODUCT_MAIN_ALPHABET
                                                , tb_2.PRODUCT_SUB_ID
                                                , tb_2.PRODUCT_SUB_NAME
                                                , tb_2.PRODUCT_SUB_ALPHABET
                                                , tb_1.PRODUCT_TYPE_ID
                                                , tb_1.PRODUCT_TYPE_NAME
                                                , tb_1.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                                                , tb_8.PRODUCT_SPECIFICATION_TYPE_ID
                                                , tb_8.PRODUCT_SPECIFICATION_TYPE_NAME
                                                , tb_8.PRODUCT_SPECIFICATION_TYPE_ALPHABET
                                                , tb_1.INUSE
                                                , tb_13.P2_NEED
                                                , tb_14.MONTH_NO AS P2_START_MONTH_NO
                                                , tb_15.MONTH_NO AS P3_START_MONTH_NO
                                        FROM
                                                PRODUCT_TYPE tb_1
                                                        INNER JOIN
                                                PRODUCT_SUB tb_2
                                                        ON tb_1.PRODUCT_SUB_ID  = tb_2.PRODUCT_SUB_ID and tb_2.INUSE =1
                                                        INNER JOIN
                                                PRODUCT_MAIN tb_3
                                                        ON tb_2.PRODUCT_MAIN_ID  = tb_3.PRODUCT_MAIN_ID and tb_3.INUSE =1
                                                        INNER JOIN
                                                PRODUCT_CATEGORY tb_4
                                                        ON tb_3.PRODUCT_CATEGORY_ID  = tb_4.PRODUCT_CATEGORY_ID and tb_4.INUSE = 1
					                INNER JOIN
                                                PRODUCT_TYPE_PROGRESS_WORKING tb_5
					                ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                                        AND tb_5.INUSE = 1
                                        		INNER JOIN
                                                PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_6
                                                        ON  tb_6.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                        INNER JOIN
                                                PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_7
                                                        ON tb_7.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_6.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                                        INNER JOIN
                                                PRODUCT_SPECIFICATION_TYPE tb_8
                                                        ON tb_8.PRODUCT_SPECIFICATION_TYPE_ID = tb_7.PRODUCT_SPECIFICATION_TYPE_ID
                                                        INNER JOIN
                                                PRODUCT_TYPE_BOM tb_9
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                                        AND tb_9.INUSE = 1
                                                        INNER JOIN
                                                BOM tb_10
                                                        ON tb_10.BOM_ID = tb_9.BOM_ID
                                                        AND tb_10.INUSE = 1
                                                        JOIN
                                                PRODUCT_TYPE_ITEM_CATEGORY tb_11
                                                        ON
                                                        tb_1.PRODUCT_TYPE_ID = tb_11.PRODUCT_TYPE_ID and tb_11.INUSE =1
                                                        JOIN
                                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_12
                                                        ON
                                                        tb_1.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID and tb_12.INUSE =1
                                                        LEFT JOIN
                                                FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO tb_13
                                                        ON
                                                        tb_12.CUSTOMER_INVOICE_TO_ID = tb_13.CUSTOMER_INVOICE_TO_ID
                                                        LEFT JOIN
                                                MONTH tb_14
                                                        ON
                                                        tb_13.P2_START_MONTH_OF_FISCAL_YEAR_ID = tb_14.MONTH_ID
                                                        LEFT JOIN
                                                MONTH tb_15
                                                        ON
                                                        tb_13.P3_START_MONTH_OF_FISCAL_YEAR_ID = tb_15.MONTH_ID
                                        WHERE
                                                    tb_5.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
                                                AND tb_1.INUSE = 1

                                                sqlWhere

                                    `

    sql = sql.replaceAll('sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    // console.log(sql)
    return sql
  },
  getAll: async () => {
    let sql = `      SELECT
                            PRODUCT_TYPE_ID
                          , PRODUCT_SUB_ID
                          , PRODUCT_TYPE_NAME
                          , PRODUCT_TYPE_CODE
                      FROM
                          PRODUCT_TYPE   ;
                  `

    return sql
  },
}
