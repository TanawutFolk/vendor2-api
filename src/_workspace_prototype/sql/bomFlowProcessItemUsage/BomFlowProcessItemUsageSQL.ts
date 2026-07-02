export const BomFlowProcessItemUsageSQL = {
  createBomFlowProcessItemUsage: async (dataItem: any) => {
    let sql = `
                        INSERT INTO BOM_FLOW_PROCESS_ITEM_USAGE
                        (
                              BOM_FLOW_PROCESS_ITEM_USAGE_ID
                            , BOM_ID
                            , FLOW_PROCESS_ID
                            , NO
                            , ITEM_ID
                            , USAGE_QUANTITY
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                        )
                        SELECT
                               1 + coalesce((SELECT max(BOM_FLOW_PROCESS_ITEM_USAGE_ID) FROM BOM_FLOW_PROCESS_ITEM_USAGE), 0)
                            ,  @bomId
                            , 'dataItem.FLOW_PROCESS_ID'
                            , 'dataItem.NO'
                            , 'dataItem.ITEM_ID'
                            , 'dataItem.USAGE_QUANTITY'
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'


                              `

    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.NO', dataItem['NO'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.USAGE_QUANTITY', dataItem['USAGE_QUANTITY'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  InsertItemCategoryByExistBomId: async (dataItem: any) => {
    let sql = `           INSERT INTO BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY
                            (
                                  BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY_ID
                                , BOM_ID
                                , NO
                                , FLOW_PROCESS_ID
                                , ITEM_ID
                                , ITEM_CATEGORY_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                            )
                            SELECT
                                  1 + coalesce((SELECT max(BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY_ID) FROM BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY), 0)
                                ,  @bomId
                                , 'dataItem.NO'
                                , 'dataItem.FLOW_PROCESS_ID'
                                , 'dataItem.ITEM_ID'
                                , 'dataItem.ITEM_CATEGORY_ID'
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'

                                                `

    sql = sql.replaceAll('dataItem.NO', dataItem['NO'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  updateBomFlowProcessItemUsage: async (dataItem: any, bomId: any) => {
    let sql = `
                        INSERT INTO BOM_FLOW_PROCESS_ITEM_USAGE
                        (
                              BOM_FLOW_PROCESS_ITEM_USAGE_ID
                            , BOM_ID
                            , FLOW_PROCESS_ID
                            , NO
                            , ITEM_ID
                            , USAGE_QUANTITY
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                        )
                        SELECT
                               1 + coalesce((SELECT max(BOM_FLOW_PROCESS_ITEM_USAGE_ID) FROM BOM_FLOW_PROCESS_ITEM_USAGE), 0)
                            , 'dataItem.BOM_ID'
                            , 'dataItem.FLOW_PROCESS_ID'
                            , 'dataItem.NO'
                            , 'dataItem.ITEM_ID'
                            , 'dataItem.USAGE_QUANTITY'
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'


                              `

    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', bomId)
    sql = sql.replaceAll('dataItem.NO', dataItem['NO'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.USAGE_QUANTITY', dataItem['USAGE_QUANTITY'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  updateItemCategoryByExistBomId: async (dataItem: any, bomId: any) => {
    let sql = `           INSERT INTO BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY
                            (
                                  BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY_ID
                                , BOM_ID
                                , NO
                                , FLOW_PROCESS_ID
                                , ITEM_ID
                                , ITEM_CATEGORY_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                            )
                            SELECT
                                  1 + coalesce((SELECT max(BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY_ID) FROM BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY), 0)
                                , 'dataItem.BOM_ID'
                                , 'dataItem.NO'
                                , 'dataItem.FLOW_PROCESS_ID'
                                , 'dataItem.ITEM_ID'
                                , 'dataItem.ITEM_CATEGORY_ID'
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'

                                                `

    sql = sql.replaceAll('dataItem.NO', dataItem['NO'])
    sql = sql.replaceAll('dataItem.BOM_ID', bomId)
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  deleteBomFlowProcessItemUsage: async (dataItem: any) => {
    let sql = `
              UPDATE
                  BOM_FLOW_PROCESS_ITEM_USAGE
              SET
                  INUSE = 0
              WHERE
                  BOM_ID = 'dataItem.BOM_ID'
                              `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
  deleteItemCategoryByExistBomId: async (dataItem: any) => {
    let sql = `
              UPDATE
                  BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY
              SET
                  INUSE = 0
              WHERE
                  BOM_ID = 'dataItem.BOM_ID'
                              `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
}
