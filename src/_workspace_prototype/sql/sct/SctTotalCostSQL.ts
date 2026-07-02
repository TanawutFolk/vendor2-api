export const SctBomFlowProcessItemUsagePriceSQL = {
  insert: async (dataItem: any) => {
    let sql = `
                INSERT INTO dataItem.STANDARD_COST_DB.SCT_TOTAL_COST
                                (
                          SCT_TOTAL_COST_ID
                        , SCT_ID
                        , DIRECT_UNIT_PROCESS_COST
                        , INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                        , TOTAL_PROCESSING_TIME
                        , TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                        , TOTAL_DIRECT_COST
                        , DIRECT_PROCESS_COST
                        , IMPORTED_FEE
                        , IS_ADJUST_IMPORTED_COST
                        , IMPORTED_COST_DEFAULT
                        , TOTAL
                        , TOTAL_PRICE_OF_RAW_MATERIAL
                        , TOTAL_PRICE_OF_SUB_ASSY
                        , TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
                        , TOTAL_PRICE_OF_CONSUMABLE
                        , TOTAL_PRICE_OF_PACKING
                        , TOTAL_PRICE_OF_ALL_OF_ITEMS
                        , CONSUMABLE_PACKING
                        , INDIRECT_COST_SALE_AVE
                        , SELLING_EXPENSE
                        , GA
                        , MARGIN
                        , SELLING_EXPENSE_FOR_SELLING_PRICE
                        , GA_FOR_SELLING_PRICE
                        , MARGIN_FOR_SELLING_PRICE
                        , EFFECTIVE_DATE
                        , TOTAL_YIELD_RATE
                        , TOTAL_CLEAR_TIME
                        , SELLING_PRICE_BY_FORMULA
                        , ADJUST_PRICE
                        , REMARK_FOR_ADJUST_PRICE
                        , SELLING_PRICE
                        , NOTE
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                                                , INUSE
                                )
                                      SELECT
                                                  'dataItem.SCT_TOTAL_COST_ID'
                                                , 'dataItem.SCT_ID'
                                                ,  dataItem.DIRECT_UNIT_PROCESS_COST
                                                ,  dataItem.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                                                , dataItem.TOTAL_PROCESSING_TIME
                                                , dataItem.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                                                , 'dataItem.TOTAL_DIRECT_COST'
                                                , 'dataItem.DIRECT_PROCESS_COST'
                                                ,  dataItem.IMPORTED_FEE
                                                , dataItem.IS_ADJUST_IMPORTED_COST
                                                , dataItem.IMPORTED_COST_DEFAULT
                                                , 'dataItem.TOTAL'
                                                , 'dataItem.TOTAL_PRICE_OF_RAW_MATERIAL'
                                                , 'dataItem.TOTAL_PRICE_OF_SUB_ASSY'
                                                , 'dataItem.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'
                                                , 'dataItem.TOTAL_PRICE_OF_CONSUMABLE'
                                                , 'dataItem.TOTAL_PRICE_OF_PACKING'
                                                , 'dataItem.TOTAL_PRICE_OF_ALL_OF_ITEMS'
                                                , 'dataItem.CONSUMABLE_PACKING'
                                                ,  dataItem.INDIRECT_COST_SALE_AVE
                                                ,  dataItem.SELLING_EXPENSE
                                                ,  dataItem.GA
                                                ,  dataItem.MARGIN
                                                , dataItem.SELLING_EXPENSE_FOR_SELLING_PRICE
                                                , dataItem.GA_FOR_SELLING_PRICE
                                                , dataItem.MARGIN_FOR_SELLING_PRICE
                                                , 'dataItem.EFFECTIVE_DATE'
                                                , dataItem.TOTAL_YIELD
                                                , dataItem.TOTAL_CLEAR_TIME
                                                , 'dataItem.SELLING_PRICE_BY_FORMULA'
                                                ,  dataItem.ADJUST_PRICE
                                                ,  dataItem.REMARK_FOR_ADJUST_PRICE
                                                , 'dataItem.SELLING_PRICE'
                                                ,  dataItem.NOTE
                                                , 'dataItem.CREATE_BY'
                                                ,  CURRENT_TIMESTAMP()
                                                , 'dataItem.UPDATE_BY'
                                                , 'dataItem.INUSE'
                )
                            `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_TOTAL_COST_ID', dataItem['SCT_TOTAL_COST_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll(
      'dataItem.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE',
      dataItem['TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE'] !== '' ? "'" + dataItem['TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE'] + "'" : 'NULL'
    )

    sql = sql.replaceAll('dataItem.DIRECT_UNIT_PROCESS_COST', dataItem['DIRECT_UNIT_PROCESS_COST'] != '' ? dataItem['DIRECT_UNIT_PROCESS_COST'] : 'NULL')
    sql = sql.replaceAll(
      'dataItem.INDIRECT_RATE_OF_DIRECT_PROCESS_COST',
      dataItem['INDIRECT_RATE_OF_DIRECT_PROCESS_COST'] != '' ? dataItem['INDIRECT_RATE_OF_DIRECT_PROCESS_COST'] : 'NULL'
    )

    sql = sql.replaceAll('dataItem.TOTAL_DIRECT_COST', dataItem['TOTAL_DIRECT_COST'])

    sql = sql.replaceAll('dataItem.IMPORTED_FEE', dataItem['IMPORTED_FEE'] != '' ? dataItem['IMPORTED_FEE'] : 'NULL')

    sql = sql.replaceAll('dataItem.IS_ADJUST_IMPORTED_COST', dataItem['IS_ADJUST_IMPORTED_COST'])
    sql = sql.replaceAll('dataItem.IMPORTED_COST_DEFAULT', dataItem['IMPORTED_COST_DEFAULT'] != '' ? dataItem['IMPORTED_COST_DEFAULT'] : 'NULL')

    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_RAW_MATERIAL', dataItem['TOTAL_PRICE_OF_RAW_MATERIAL'])
    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_SUB_ASSY', dataItem['TOTAL_PRICE_OF_SUB_ASSY'])
    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS', dataItem['TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'])
    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_CONSUMABLE', dataItem['TOTAL_PRICE_OF_CONSUMABLE'])
    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_PACKING', dataItem['TOTAL_PRICE_OF_PACKING'])

    sql = sql.replaceAll('dataItem.CONSUMABLE_PACKING', dataItem['CONSUMABLE_PACKING'])
    sql = sql.replaceAll('dataItem.INDIRECT_COST_SALE_AVE', dataItem['INDIRECT_COST_SALE_AVE'] != '' ? dataItem['INDIRECT_COST_SALE_AVE'] : 'NULL')

    sql = sql.replaceAll('dataItem.SELLING_EXPENSE_FOR_SELLING_PRICE', dataItem['SELLING_EXPENSE_FOR_SELLING_PRICE'])
    sql = sql.replaceAll('dataItem.GA_FOR_SELLING_PRICE', dataItem['GA_FOR_SELLING_PRICE'])
    sql = sql.replaceAll('dataItem.MARGIN_FOR_SELLING_PRICE', dataItem['MARGIN_FOR_SELLING_PRICE'])

    sql = sql.replaceAll('dataItem.SELLING_EXPENSE', dataItem['SELLING_EXPENSE'] != '' ? dataItem['SELLING_EXPENSE'] : 'NULL')

    sql = sql.replaceAll('dataItem.GA', dataItem['GA'] != '' ? dataItem['GA'] : 'NULL')
    sql = sql.replaceAll('dataItem.MARGIN', dataItem['MARGIN'] != '' ? dataItem['MARGIN'] : 'NULL')
    sql = sql.replaceAll('dataItem.EFFECTIVE_DATE', dataItem['EFFECTIVE_DATE'])
    sql = sql.replaceAll('dataItem.TOTAL_YIELD', dataItem['TOTAL_YIELD'] != '' ? dataItem['TOTAL_YIELD'] : 'NULL')
    sql = sql.replaceAll('dataItem.TOTAL_CLEAR_TIME', dataItem['TOTAL_CLEAR_TIME'] != '' ? dataItem['TOTAL_CLEAR_TIME'] : 'NULL')
    sql = sql.replaceAll('dataItem.SELLING_PRICE_BY_FORMULA', dataItem['SELLING_PRICE_BY_FORMULA'])
    sql = sql.replaceAll('dataItem.ADJUST_PRICE', dataItem['ADJUST_PRICE'] != '' ? dataItem['ADJUST_PRICE'] : 'NULL')
    sql = sql.replaceAll('dataItem.REMARK_FOR_ADJUST_PRICE', dataItem['REMARK_FOR_ADJUST_PRICE'] != '' ? "'" + dataItem['REMARK_FOR_ADJUST_PRICE'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.SELLING_PRICE', dataItem['SELLING_PRICE'])
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] != '' ? "'" + dataItem['NOTE'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_ALL_OF_ITEMS', dataItem['TOTAL_PRICE_OF_ALL_OF_ITEMS'])

    sql = sql.replaceAll('dataItem.TOTAL_PROCESSING_TIME', dataItem['TOTAL_PROCESSING_TIME'] !== '' ? "'" + dataItem['TOTAL_PROCESSING_TIME'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.DIRECT_PROCESS_COST', dataItem['DIRECT_PROCESS_COST'])

    sql = sql.replaceAll('dataItem.TOTAL', dataItem['TOTAL'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  deleteBySctId: async (dataItem: any) => {
    let sql = `
                  UPDATE
                          dataItem.STANDARD_COST_DB.SCT_TOTAL_COST
                  SET
                            INUSE = '0'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                              SCT_ID = 'dataItem.SCT_ID'
                          AND INUSE = 1
                                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
