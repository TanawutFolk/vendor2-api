export const BomSQL = {
  searchBomDetailsByBomId: async (dataItem: any) => {
    let sql = `
         SELECT
                            tb_9.PROCESS_ID
                          , tb_9.PROCESS_NAME
                          , tb_8.NO
                          , tb_10.ITEM_ID
                          , tb_12.ITEM_INTERNAL_CODE
                          , tb_12.ITEM_INTERNAL_FULL_NAME
                          , tb_12.ITEM_CODE_FOR_SUPPORT_MES
                          , tb_12.IMAGE_PATH
                          , tb_10.USAGE_QUANTITY
                          , tb_13.UNIT_OF_MEASUREMENT_NAME
                          , tb_16.PURCHASE_MODULE_ID
                          , tb_16.ITEM_CATEGORY_ID
                          , tb_16.ITEM_CATEGORY_NAME
                          , tb_16.ITEM_CATEGORY_ALPHABET
                          , tb_16.ITEM_CATEGORY_SHORT_NAME
                          , tb_1.BOM_ID
                          , tb_1.BOM_NAME
                          , tb_1.BOM_CODE
                          , tb_2.FLOW_NAME
                          , tb_2.FLOW_CODE
                  FROM
                          BOM tb_1
                                INNER JOIN
                          flow tb_2
                                ON  tb_1.BOM_ID = dataItem.BOM_ID AND tb_1.FLOW_ID = tb_2.FLOW_ID
                                INNER JOIN
                          FLOW_PROCESS tb_8
                                ON tb_2.FLOW_ID = tb_8.FLOW_ID
                                AND tb_8.INUSE = 1
                                INNER JOIN
                          PROCESS tb_9
                                ON tb_8.PROCESS_ID = tb_9.PROCESS_ID
                                LEFT JOIN (
        								  BOM_FLOW_PROCESS_ITEM_USAGE tb_10
        								        INNER JOIN ITEM tb_11  ON  tb_10.ITEM_ID = tb_11.ITEM_ID
        								        INNER JOIN   ITEM_MANUFACTURING tb_12
                                  		ON tb_11.ITEM_ID = tb_12.ITEM_ID
                                  		INNER JOIN
                                  		UNIT_OF_MEASUREMENT tb_13
                                  		ON tb_12.USAGE_UNIT_ID  = tb_13.UNIT_OF_MEASUREMENT_ID
                                  		INNER JOIN
                          				ITEM_CATEGORY tb_14
                                  		ON tb_11.ITEM_CATEGORY_ID = tb_14.ITEM_CATEGORY_ID
                                  		INNER JOIN
                                  		bom_flow_process_item_change_item_category tb_15
                                  		ON tb_10.BOM_ID = tb_15.BOM_ID AND tb_10.FLOW_PROCESS_ID = tb_15.FLOW_PROCESS_ID
                                          AND tb_10.ITEM_ID = tb_15.ITEM_ID AND tb_10.NO = tb_15.NO AND tb_15.INUSE = 1
                                  		INNER JOIN
                          				ITEM_CATEGORY tb_16
                                  		ON tb_16.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
    							  ) ON tb_1.BOM_ID = tb_10.BOM_ID AND tb_8.FLOW_PROCESS_ID = tb_10.FLOW_PROCESS_ID AND tb_10.INUSE = 1
                        ORDER BY
                            tb_8.NO
                          , tb_10.NO
             `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem.BOM_ID)

    return sql
  },
  searchBomDetailsBySctId: async (dataItem: any) => {
    let sql = `
         SELECT
                            tb_9.PROCESS_ID
                          , tb_9.PROCESS_NAME
                          , tb_8.NO
                          , tb_10.ITEM_ID
                          , tb_12.ITEM_INTERNAL_CODE
                          , tb_12.ITEM_INTERNAL_FULL_NAME
                          , tb_12.ITEM_CODE_FOR_SUPPORT_MES
                          , tb_12.IMAGE_PATH
                          , tb_10.USAGE_QUANTITY
                          , tb_13.UNIT_OF_MEASUREMENT_NAME
                          , tb_16.PURCHASE_MODULE_ID
                          , tb_16.ITEM_CATEGORY_ID
                          , tb_16.ITEM_CATEGORY_NAME
                          , tb_16.ITEM_CATEGORY_ALPHABET
                          , tb_16.ITEM_CATEGORY_SHORT_NAME
                          , tb_1.BOM_NAME
                          , tb_1.BOM_CODE
                          , tb_1.BOM_ID
                          , tb_2.FLOW_NAME
                          , tb_2.FLOW_CODE
                  FROM
                          dataItem.STANDARD_COST_DB.SCT tb_01
                              INNER JOIN
                          BOM tb_1
                                ON tb_01.BOM_ID = tb_1.BOM_ID AND tb_01.SCT_ID = dataItem.SCT_ID
                                INNER JOIN
                          flow tb_2
                                ON tb_1.FLOW_ID = tb_2.FLOW_ID
                                INNER JOIN
                          FLOW_PROCESS tb_8
                                ON tb_2.FLOW_ID = tb_8.FLOW_ID
                                AND tb_8.INUSE = 1
                                INNER JOIN
                          PROCESS tb_9
                                ON tb_8.PROCESS_ID = tb_9.PROCESS_ID
                                LEFT JOIN (
        								  BOM_FLOW_PROCESS_ITEM_USAGE tb_10
        								        INNER JOIN ITEM tb_11  ON  tb_10.ITEM_ID = tb_11.ITEM_ID
        								        INNER JOIN   ITEM_MANUFACTURING tb_12
                                  		ON tb_11.ITEM_ID = tb_12.ITEM_ID
                                  		INNER JOIN
                                  		UNIT_OF_MEASUREMENT tb_13
                                  		ON tb_12.USAGE_UNIT_ID  = tb_13.UNIT_OF_MEASUREMENT_ID
                                  		INNER JOIN
                          				ITEM_CATEGORY tb_14
                                  		ON tb_11.ITEM_CATEGORY_ID = tb_14.ITEM_CATEGORY_ID
                                  		INNER JOIN
                                  		bom_flow_process_item_change_item_category tb_15
                                  		ON tb_10.BOM_ID = tb_15.BOM_ID AND tb_10.FLOW_PROCESS_ID = tb_15.FLOW_PROCESS_ID
                                          AND tb_10.ITEM_ID = tb_15.ITEM_ID AND tb_10.NO = tb_15.NO AND tb_15.INUSE = 1
                                  		INNER JOIN
                          				ITEM_CATEGORY tb_16
                                  		ON tb_16.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
    							  ) ON tb_1.BOM_ID = tb_10.BOM_ID AND tb_8.FLOW_PROCESS_ID = tb_10.FLOW_PROCESS_ID AND tb_10.INUSE = 1
                        ORDER BY
                            tb_8.NO
                          , tb_10.NO
             `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID_SELECTION)

    return sql
  },
  getAll: async () => {
    let sql = `       SELECT
                          BOM_ID
                        , BOM_NAME
                        , BOM_CODE
                      FROM
                        BOM  ;
                    `
    return sql
  },
}
