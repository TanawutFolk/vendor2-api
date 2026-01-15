export const MasterDataSystemSQL = {
  getItemCodeInBomOfProductOld: async (dataItem: any, sqlWhere: any) => {
    let sql = `
    SELECT
                          tb_1.ITEM_CODE_FOR_SUPPORT_MES
                        , COUNT(tb_1.PRODUCT_TYPE_ID) AS COUNT_EXIST_IN_PRODUCT_TYPE
                FROM
                        (
                                SELECT
                                          tb_5.ITEM_CODE_FOR_SUPPORT_MES
                                        , tb_1.PRODUCT_TYPE_ID
                                FROM
                                        (
                                                SELECT
                                                        tb_1.SCT_ID ,
                                                        tb_1.PRODUCT_TYPE_ID
                                                FROM
                                                        SCT tb_1
                                                WHERE
                                                        tb_1.SCT_ID
                                                                        IN (
                                                                                SELECT
                                                                                        MAX(tb_1.SCT_ID)
                                                                                FROM
                                                                                        SCT tb_1
                                                                                                INNER JOIN
                                                                                        SCT_REASON_CODE tb_2
                                                                                                ON tb_1.SCT_REASON_CODE_ID = tb_2.SCT_REASON_CODE_ID
                                                                                                INNER JOIN
                                                                                        sct_working_progress tb_3
                                                                                                ON tb_1.SCT_ID = tb_3.SCT_ID
                                                                                                INNER JOIN
                                                                                        product_type tb_4
                                                                                                ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                                                                                INNER JOIN
                                                                                        product_sub tb_5
                                                                                                ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
                                                                                                INNER JOIN
                                                                                        product_main tb_6
                                                                                                ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
                                                                                                INNER JOIN
                                                                                        product_category tb_7
                                                                                                ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
                                                                                WHERE
                                                                                        tb_1.INUSE = 1
                                                                                        AND tb_3.TOTAL_WORKING_PROGRESS_PERCENT = 100
                                                                                        AND tb_2.CAN_INPUT_TO_PRODUCTION_LINE = 1
                                                                                        AND tb_1.CREATE_DATE <= NOW()

                                                                                        sqlWhere

                                                                                GROUP BY
                                                                                        tb_1.PRODUCT_TYPE_ID
                                                                          )
                                        ) AS tb_1
                                                INNER JOIN
                                        sct_bom tb_2
                                                ON tb_1.SCT_ID = tb_2.SCT_ID
                                                INNER JOIN
                                        BOM tb_3
                                                ON tb_2.BOM_ID = tb_3.BOM_ID
                                                INNER JOIN
                                        BOM_FLOW_PROCESS_ITEM_USAGE tb_4
                                                    ON tb_3.BOM_ID = tb_4.BOM_ID
                                                AND tb_4.INUSE = 1
                                        INNER JOIN ITEM_MANUFACTURING tb_5
                                                    ON tb_4.ITEM_ID = tb_5.ITEM_ID
                                        INNER JOIN ITEM tb_6
                                                    ON tb_5.ITEM_ID = tb_6.ITEM_ID
                                                AND tb_6.ITEM_CATEGORY_ID = 4
                                        GROUP BY
                                                  tb_4.ITEM_ID
                                                , tb_1.PRODUCT_TYPE_ID
                        ) AS tb_1
                GROUP BY
                                tb_1.ITEM_CODE_FOR_SUPPORT_MES
                ORDER BY
                                tb_1.ITEM_CODE_FOR_SUPPORT_MES
        `

    sql = sql.replaceAll('sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
  getItemCodeInBomOfProduct: async (dataItem: any, sqlWhere: any) => {
    let sql = `
       SELECT
                          tb_1.ITEM_CODE_FOR_SUPPORT_MES
                        , COUNT(tb_1.PRODUCT_TYPE_ID) AS COUNT_EXIST_IN_PRODUCT_TYPE
                FROM
                        (
SELECT
                          tb_2.ITEM_ID
                        , tb_1.ITEM_MANUFACTURING_ID
                        , tb_1.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_3.BOM_NAME
                        , tb_3.BOM_CODE
                        , tb_3.BOM_ID
                        , tb_8.ITEM_CATEGORY_ID
                        , tb_9.PRODUCT_TYPE_ID
                        , tb_5.PRODUCT_SUB_ID
                        , tb_3.PRODUCT_MAIN_ID
                    FROM
                        ITEM_MANUFACTURING tb_1
                    INNER JOIN
                        bom_flow_process_item_usage tb_2
                    ON
                        tb_1.ITEM_ID = tb_2.ITEM_ID AND tb_1.INUSE = 1 AND tb_2.INUSE = 1
                    LEFT JOIN
                        BOM tb_3
                    ON
                        tb_2.BOM_ID = tb_3.BOM_ID AND tb_3.INUSE = 1
                    LEFT JOIN
                        PRODUCT_MAIN tb_4
                    ON
                        tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID AND tb_4.INUSE = 1
                    LEFT JOIN
                    	PRODUCT_SUB tb_5
                    on tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID AND tb_5.INUSE = 1
                    LEFT JOIN
                    	PRODUCT_TYPE tb_6
                    on tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID AND tb_6.INUSE = 1
                    LEFT JOIN
                    	product_type_bom tb_7
                    on tb_6.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID AND tb_7.INUSE = 1
                     LEFT JOIN
                    	ITEM tb_8
                    on tb_1.ITEM_ID = tb_8.ITEM_ID AND tb_8.INUSE = 1
                    left join
                    	PRODUCT_TYPE_BOM tb_9
                    on tb_3.BOM_ID  = tb_9.BOM_ID
                    WHERE
                            tb_1.INUSE = 1
                        sqlWhere
                    GROUP BY
                           tb_2.ITEM_ID
                         , tb_9.PRODUCT_TYPE_ID
                      ) AS tb_1
                GROUP BY
                                tb_1.ITEM_CODE_FOR_SUPPORT_MES
                ORDER BY
                                tb_1.ITEM_CODE_FOR_SUPPORT_MES



        `

    sql = sql.replaceAll('sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.ITEM_CODE', dataItem['ITEM_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },

  getItemCode: async (dataItem: any, sqlWhere: any) => {
    let sql = `
       SELECT
                tb_1.ITEM_CODE_FOR_SUPPORT_MES
                FROM
                (
                        SELECT
                        ITEM_CODE_FOR_SUPPORT_MES
                        FROM
                        ITEM_MANUFACTURING
                        WHERE
                        INUSE = 1
                        AND ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE'
                ) AS tb_1
                GROUP BY
                tb_1.ITEM_CODE_FOR_SUPPORT_MES
                ORDER BY
                tb_1.ITEM_CODE_FOR_SUPPORT_MES;



        `

    sql = sql.replaceAll('sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.ITEM_CODE', dataItem['ITEM_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
}
