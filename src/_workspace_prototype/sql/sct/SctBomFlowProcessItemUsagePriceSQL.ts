export const SctBomFlowProcessItemUsagePriceSQL = {
  insert: async (dataItem: any) => {
    let sql = `
                INSERT INTO dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE
                                (
                                                  SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID
                                                , SCT_ID
                                                , BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                                , ITEM_PRICE_ID
                                                , PRICE
                                                , YIELD_ACCUMULATION
                                                , AMOUNT
                                                , IS_ADJUST_YIELD_ACCUMULATION
                                                , YIELD_ACCUMULATION_DEFAULT
                                                , CREATE_BY
                                                , UPDATE_DATE
                                                , UPDATE_BY
                                                , INUSE
                                )
                                      SELECT
                                                  'dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID'
                                                ,  dataItem.SCT_ID
                                                ,  dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                                ,  dataItem.ITEM_PRICE_ID
                                                , dataItem.PRICE
                                                , dataItem.YIELD_ACCUMULATION
                                                , dataItem.AMOUNT
                                                , dataItem.IS_ADJUST_YIELD_ACCUMULATION
                                                , dataItem.YIELD_ACCUMULATION_DEFAULT
                                                , 'dataItem.CREATE_BY'
                                                ,  CURRENT_TIMESTAMP()
                                                , 'dataItem.UPDATE_BY'
                                                , 'dataItem.INUSE'
                )
                            `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID', dataItem['SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID', dataItem['BOM_FLOW_PROCESS_ITEM_USAGE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_PRICE_ID', dataItem['ITEM_PRICE_ID'] !== '' ? "'" + dataItem['ITEM_PRICE_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PRICE', dataItem['PRICE'] !== '' ? "'" + dataItem['PRICE'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.IS_ADJUST_YIELD_ACCUMULATION', dataItem['IS_ADJUST_YIELD_ACCUMULATION'] !== '' ? "'" + dataItem['IS_ADJUST_YIELD_ACCUMULATION'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION_DEFAULT', dataItem['YIELD_ACCUMULATION_DEFAULT'] !== '' ? "'" + dataItem['YIELD_ACCUMULATION_DEFAULT'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION', dataItem['YIELD_ACCUMULATION'] !== '' ? "'" + dataItem['YIELD_ACCUMULATION'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.AMOUNT', dataItem['AMOUNT'] !== '' ? "'" + dataItem['AMOUNT'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `
                  UPDATE
                          dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE
                  SET
                            INUSE = '0'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                              SCT_ID = 'dataItem.SCT_ID'
                          AND INUSE = 1
                          AND IS_FROM_SCT_COPY = 'dataItem.IS_FROM_SCT_COPY'
                                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
}
