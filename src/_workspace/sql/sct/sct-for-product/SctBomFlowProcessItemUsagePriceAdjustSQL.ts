export const SctBomFlowProcessItemUsagePriceAdjustSQL = {
  insert: async (dataItem: {
    SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID: string
    BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
    SCT_ID: string
    SCT_ID_SELECTION: string
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: 0 | 1
    IS_FROM_SCT_COPY: number
  }) => {
    let sql = `
                INSERT INTO dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST
                                (
                                            SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID
                                          , BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                          , SCT_ID
                                          , SCT_ID_SELECTION
                                          , CREATE_BY
                                          , UPDATE_DATE
                                          , UPDATE_BY
                                          , INUSE
                                          , IS_FROM_SCT_COPY                                )
                                VALUES
                                (
                                            'dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID'
                                          , 'dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID'
                                          , 'dataItem.SCT_ID'
                                          , 'dataItem.SCT_ID_SELECTION'
                                          , 'dataItem.CREATE_BY'
                                          ,  CURRENT_TIMESTAMP()
                                          , 'dataItem.UPDATE_BY'
                                          , 'dataItem.INUSE'
                                          , 'dataItem.IS_FROM_SCT_COPY'
                                )
                            `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID', dataItem['SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID'])
    sql = sql.replaceAll('dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID', dataItem['BOM_FLOW_PROCESS_ITEM_USAGE_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID_SELECTION', dataItem['SCT_ID_SELECTION'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  getBySctId: async (dataItem: { SCT_ID: string }) => {
    let sql = `
                SELECT
                          SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID
                        , BOM_FLOW_PROCESS_ITEM_USAGE_ID
                        , SCT_ID
                        , SCT_ID_SELECTION
                        , IS_FROM_SCT_COPY
                FROM
                          dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST
                WHERE
                          SCT_ID = 'dataItem.SCT_ID'
              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
}
