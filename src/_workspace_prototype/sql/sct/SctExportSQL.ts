export const StandardCostExportSQL = {
  search: async (dataItem: any) => {
    let sql = `  SELECT tb_1.SCT_ID
                      , tb_2.PRODUCT_TYPE_CODE_FOR_SCT AS SCT_CODE_FOR_SUPPORT_MES
                      , tb_1.SCT_REVISION_CODE
                      , tb_2.PRODUCT_TYPE_NAME
                      , tb_2.PRODUCT_TYPE_CODE
                      , tb_3.SCT_ID_FOR_COMPARE
                      , tb_4.SCT_REVISION_CODE AS COMPARE_SCT_REVISION_CODE

                      FROM dataItem.STANDARD_COST_DB.SCT tb_1

                  INNER JOIN PRODUCT_TYPE tb_2
                  ON tb_2.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                  LEFT JOIN dataItem.STANDARD_COST_DB.SCT_COMPARE tb_3 ON tb_3.SCT_ID = tb_1.SCT_ID
                  AND tb_3.IS_DEFAULT_EXPORT_COMPARE = 1  AND tb_3.INUSE = 1
                  LEFT JOIN dataItem.STANDARD_COST_DB.SCT tb_4 ON tb_4.SCT_ID = tb_3.SCT_ID_FOR_COMPARE
                  WHERE tb_1.SCT_ID = 'dataItem.SCT_ID'

                   `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getSctData: async (dataItem: any) => {
    let sql = `
                                SELECT
                                    tb_4.ITEM_CATEGORY_ID
                                  , tb_5.ITEM_CATEGORY_NAME
                                  , tb_6.SCT_ID
                                  , tb_7.SCT_ID_FOR_COMPARE

                                FROM

                                        dataItem.STANDARD_COST_DB.SCT tb_1
                                 JOIN   dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_2 ON tb_2.SCT_ID = tb_1.SCT_ID
                                      AND tb_2.INUSE = 1
                                 JOIN bom_flow_process_item_usage tb_3 ON tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_3.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                      AND tb_3.INUSE = 1
                                 JOIN item tb_4 ON tb_4.ITEM_ID = tb_3.ITEM_ID AND tb_4.INUSE = 1
                                 JOIN item_category tb_5 ON tb_5.ITEM_CATEGORY_ID = tb_4.ITEM_CATEGORY_ID AND tb_5.INUSE = 1
                                 JOIN item_m_s_price_sct tb_6 ON tb_6.ITEM_M_S_PRICE_ID = tb_2.ITEM_M_S_PRICE_ID
                                 LEFT JOIN dataItem.STANDARD_COST_DB.SCT_COMPARE tb_7 ON tb_7.SCT_ID = tb_6.SCT_ID AND tb_7.INUSE = 1
                                 AND tb_7.IS_DEFAULT_EXPORT_COMPARE = 1
                                WHERE tb_2.SCT_ID = 'dataItem.SCT_ID'
                                AND tb_4.ITEM_CATEGORY_ID IN ( 2 , 3 )
                                AND tb_1.INUSE = 1

                                ORDER BY tb_2.SCT_ID DESC

    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    // console.log(sql)
    return sql
  },
  getSubByProductTypeId: async (dataItem: any) => {
    let sql = `
                  SELECT
                         tb_9.PRODUCT_TYPE_ID
                  FROM
                  product_type tb_1

                  JOIN product_type_item_category tb_2 ON tb_2.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID AND tb_2.INUSE = 1
                  JOIN item_category tb_3 ON tb_3.ITEM_CATEGORY_ID = tb_2.ITEM_CATEGORY_ID AND tb_3.INUSE = 1
                  JOIN product_type_bom tb_4 ON tb_4.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID  AND tb_4.INUSE = 1
                  JOIN bom tb_5 ON tb_5.BOM_ID = tb_4.BOM_ID
                  JOIN bom_flow_process_item_usage tb_6 ON tb_6.BOM_ID = tb_5.BOM_ID AND tb_6.INUSE = 1
                  JOIN item tb_7 ON tb_7.ITEM_ID = tb_6.ITEM_ID AND tb_7.INUSE = 1
                  JOIN item_product_detail tb_8 ON tb_8.ITEM_ID = tb_7.ITEM_ID
                  JOIN product_type tb_9 ON tb_9.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID AND tb_9.INUSE = 1

                  WHERE tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                  AND tb_7.ITEM_CATEGORY_ID IN (1, 2 ,3)

                  ORDER BY tb_1.PRODUCT_TYPE_CODE_FOR_SCT DESC
                   `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
}
