export const SctTotalCostSQL = {
  insert: async (dataItem: {
    SCT_TOTAL_COST_ID: string
    SCT_ID: string
    DIRECT_UNIT_PROCESS_COST: number
    INDIRECT_RATE_OF_DIRECT_PROCESS_COST: number
    TOTAL_PROCESSING_TIME: number
    TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: number
    TOTAL_DIRECT_COST: number
    DIRECT_PROCESS_COST: number
    IMPORTED_FEE: number
    IMPORTED_COST: number
    TOTAL: number
    TOTAL_PRICE_OF_RAW_MATERIAL: number
    TOTAL_PRICE_OF_SUB_ASSY: number
    TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: number
    TOTAL_PRICE_OF_CONSUMABLE: number
    TOTAL_PRICE_OF_PACKING: number
    TOTAL_PRICE_OF_ALL_OF_ITEMS: number
    TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST: number
    RM_INCLUDE_IMPORTED_COST: number
    CONSUMABLE_PACKING: number
    MATERIALS_COST: number
    INDIRECT_COST_SALE_AVE: number
    SELLING_EXPENSE: number
    GA: number
    MARGIN: number

    ESTIMATE_PERIOD_START_DATE: string
    ESTIMATE_PERIOD_END_DATE: string

    TOTAL_YIELD_RATE: number
    TOTAL_CLEAR_TIME: number
    TOTAL_ESSENTIAL_TIME: number
    TOTAL_GO_STRAIGHT_RATE: number

    SELLING_PRICE_BY_FORMULA: number | ''
    ADJUST_PRICE: number
    REMARK_FOR_ADJUST_PRICE: string
    SELLING_PRICE: number | ''
    DESCRIPTION?: string

    CREATE_BY: string
    UPDATE_BY: string

    INUSE: number
    SELLING_EXPENSE_FOR_SELLING_PRICE: number
    GA_FOR_SELLING_PRICE: number
    MARGIN_FOR_SELLING_PRICE: number
    CIT_FOR_SELLING_PRICE: number
    CIT: number
    VAT: number
    VAT_FOR_SELLING_PRICE: number
    IS_ADJUST_IMPORTED_COST: number
    IMPORTED_COST_DEFAULT: number
    RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS: number
    ASSEMBLY_GROUP_FOR_SUPPORT_MES: string

    IS_FROM_SCT_COPY: number
  }) => {
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
                                , IMPORTED_COST
                                , IS_ADJUST_IMPORTED_COST
                                , IMPORTED_COST_DEFAULT
                                , TOTAL
                                , TOTAL_PRICE_OF_RAW_MATERIAL
                                , TOTAL_PRICE_OF_SUB_ASSY
                                , TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
                                , TOTAL_PRICE_OF_CONSUMABLE
                                , TOTAL_PRICE_OF_PACKING
                                , TOTAL_PRICE_OF_ALL_OF_ITEMS
                                , TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST
                                , RM_INCLUDE_IMPORTED_COST
                                , CONSUMABLE_PACKING
                                , MATERIALS_COST
                                , INDIRECT_COST_SALE_AVE
                                , SELLING_EXPENSE
                                , GA
                                , MARGIN
                                , SELLING_EXPENSE_FOR_SELLING_PRICE
                                , GA_FOR_SELLING_PRICE
                                , MARGIN_FOR_SELLING_PRICE
                                , ESTIMATE_PERIOD_START_DATE
                                , ESTIMATE_PERIOD_END_DATE
                                , TOTAL_YIELD_RATE
                                , TOTAL_CLEAR_TIME
                                , SELLING_PRICE_BY_FORMULA
                                , ADJUST_PRICE
                                , REMARK_FOR_ADJUST_PRICE
                                , SELLING_PRICE
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                                , INUSE
                                , VAT_FOR_SELLING_PRICE
                                , TOTAL_GO_STRAIGHT_RATE
                                , CIT_FOR_SELLING_PRICE
                                , RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS
                                , ASSEMBLY_GROUP_FOR_SUPPORT_MES
                                , CIT
                                , VAT
                                , TOTAL_ESSENTIAL_TIME
                                , IS_FROM_SCT_COPY
                                )
                                      VALUES
                                      (
                                                  'dataItem.SCT_TOTAL_COST_ID'
                                                , 'dataItem.SCT_ID'
                                                ,  dataItem.DIRECT_UNIT_PROCESS_COST
                                                ,  dataItem.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                                                , dataItem.TOTAL_PROCESSING_TIME
                                                , dataItem.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                                                , 'dataItem.TOTAL_DIRECT_COST'
                                                , 'dataItem.DIRECT_PROCESS_COST'
                                                ,  dataItem.IMPORTED_FEE
                                                , dataItem.IMPORTED_COST
                                                , dataItem.IS_ADJUST_IMPORTED_COST
                                                , dataItem.IMPORTED_COST_DEFAULT
                                                , 'dataItem.TOTAL'
                                                , 'dataItem.TOTAL_PRICE_OF_RAW_MATERIAL'
                                                , 'dataItem.TOTAL_PRICE_OF_SUB_ASSY'
                                                , 'dataItem.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'
                                                , 'dataItem.TOTAL_PRICE_OF_CONSUMABLE'
                                                , 'dataItem.TOTAL_PRICE_OF_PACKING'
                                                , 'dataItem.TOTAL_PRICE_OF_ALL_OF_ITEMS'
                                                , 'dataItem.TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST'
                                                , 'dataItem.RM_INCLUDE_IMPORTED_COST'
                                                , 'dataItem.CONSUMABLE_PACKING'
                                                , 'dataItem.MATERIALS_COST'
                                                ,  dataItem.INDIRECT_COST_SALE_AVE
                                                ,  dataItem.SELLING_EXPENSE
                                                ,  dataItem.GA
                                                ,  dataItem.MARGIN
                                                , dataItem.SELLING_EXPENSE_FOR_SELLING_PRICE
                                                , dataItem.GA_FOR_SELLING_PRICE
                                                , dataItem.MARGIN_FOR_SELLING_PRICE
                                                , dataItem.ESTIMATE_PERIOD_START_DATE
                                                , dataItem.ESTIMATE_PERIOD_END_DATE
                                                , 'dataItem.TOTAL_YIELD_RATE'
                                                , 'dataItem.TOTAL_CLEAR_TIME'
                                                , dataItem.SELLING_PRICE_BY_FORMULA
                                                ,  dataItem.ADJUST_PRICE
                                                ,  dataItem.REMARK_FOR_ADJUST_PRICE
                                                , dataItem.SELLING_PRICE
                                                , 'dataItem.CREATE_BY'
                                                ,  CURRENT_TIMESTAMP()
                                                , 'dataItem.UPDATE_BY'
                                                , 'dataItem.INUSE'
                                                , 'dataItem.VAT_FOR_SELLING_PRICE'
                                                , 'dataItem.TOTAL_GO_STRAIGHT_RATE'
                                                , 'dataItem.CIT_FOR_SELLING_PRICE'
                                                , 'dataItem.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS'
                                                , 'dataItem.ASSEMBLY_GROUP_FOR_SUPPORT_MES'
                                                , 'dataItem.CIT'
                                                , 'dataItem.VAT'
                                                , 'dataItem.TOTAL_ESSENTIAL_TIME'
                                                , 'dataItem.IS_FROM_SCT_COPY'
                )
                            `

    sql = sql.replaceAll('dataItem.TOTAL_ESSENTIAL_TIME', dataItem['TOTAL_ESSENTIAL_TIME'].toString())

    sql = sql.replaceAll('dataItem.ASSEMBLY_GROUP_FOR_SUPPORT_MES', dataItem['ASSEMBLY_GROUP_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS', dataItem['RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS'].toString())
    sql = sql.replaceAll('dataItem.TOTAL_GO_STRAIGHT_RATE', dataItem['TOTAL_GO_STRAIGHT_RATE'].toString())
    sql = sql.replaceAll('dataItem.CIT_FOR_SELLING_PRICE', dataItem['CIT_FOR_SELLING_PRICE'].toString())
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_TOTAL_COST_ID', dataItem['SCT_TOTAL_COST_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST', dataItem['TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST'].toString())
    sql = sql.replaceAll('dataItem.RM_INCLUDE_IMPORTED_COST', dataItem['RM_INCLUDE_IMPORTED_COST'].toString())
    sql = sql.replaceAll('dataItem.MATERIALS_COST', dataItem['MATERIALS_COST'].toString())
    sql = sql.replaceAll(
      'dataItem.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE',
      dataItem['TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE'].toString() !== '' ? "'" + dataItem['TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE'] + "'" : 'NULL'
    )

    sql = sql.replaceAll('dataItem.DIRECT_UNIT_PROCESS_COST', dataItem['DIRECT_UNIT_PROCESS_COST'].toString() != '' ? dataItem['DIRECT_UNIT_PROCESS_COST'].toString() : 'NULL')
    sql = sql.replaceAll(
      'dataItem.INDIRECT_RATE_OF_DIRECT_PROCESS_COST',
      dataItem['INDIRECT_RATE_OF_DIRECT_PROCESS_COST'].toString() != '' ? dataItem['INDIRECT_RATE_OF_DIRECT_PROCESS_COST'].toString() : 'NULL'
    )

    sql = sql.replaceAll('dataItem.TOTAL_DIRECT_COST', dataItem['TOTAL_DIRECT_COST'].toString())

    sql = sql.replaceAll('dataItem.IMPORTED_FEE', dataItem['IMPORTED_FEE'].toString() != '' ? dataItem['IMPORTED_FEE'].toString() : 'NULL')

    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_RAW_MATERIAL', dataItem['TOTAL_PRICE_OF_RAW_MATERIAL'].toString())
    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_SUB_ASSY', dataItem['TOTAL_PRICE_OF_SUB_ASSY'].toString())
    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS', dataItem['TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'].toString())
    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_CONSUMABLE', dataItem['TOTAL_PRICE_OF_CONSUMABLE'].toString())
    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_PACKING', dataItem['TOTAL_PRICE_OF_PACKING'].toString())

    sql = sql.replaceAll('dataItem.CONSUMABLE_PACKING', dataItem['CONSUMABLE_PACKING'].toString())

    sql = sql.replaceAll('dataItem.INDIRECT_COST_SALE_AVE', dataItem['INDIRECT_COST_SALE_AVE'].toString() != '' ? dataItem['INDIRECT_COST_SALE_AVE'].toString() : 'NULL')

    sql = sql.replaceAll('dataItem.SELLING_EXPENSE_FOR_SELLING_PRICE', dataItem['SELLING_EXPENSE_FOR_SELLING_PRICE'].toString())
    sql = sql.replaceAll('dataItem.GA_FOR_SELLING_PRICE', dataItem['GA_FOR_SELLING_PRICE'].toString())
    sql = sql.replaceAll('dataItem.MARGIN_FOR_SELLING_PRICE', dataItem['MARGIN_FOR_SELLING_PRICE'].toString())

    sql = sql.replaceAll('dataItem.SELLING_EXPENSE', dataItem['SELLING_EXPENSE'].toString() != '' ? dataItem['SELLING_EXPENSE'].toString() : 'NULL')

    sql = sql.replaceAll('dataItem.GA', dataItem['GA'].toString() != '' ? dataItem['GA'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.MARGIN', dataItem['MARGIN'].toString() != '' ? dataItem['MARGIN'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_START_DATE', dataItem['ESTIMATE_PERIOD_START_DATE'] != '' ? "'" + dataItem['ESTIMATE_PERIOD_START_DATE'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_END_DATE', dataItem['ESTIMATE_PERIOD_END_DATE'] != '' ? "'" + dataItem['ESTIMATE_PERIOD_END_DATE'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.TOTAL_YIELD_RATE', dataItem['TOTAL_YIELD_RATE'].toString())
    sql = sql.replaceAll('dataItem.TOTAL_CLEAR_TIME', dataItem['TOTAL_CLEAR_TIME'].toString())
    sql = sql.replaceAll('dataItem.SELLING_PRICE_BY_FORMULA', dataItem['SELLING_PRICE_BY_FORMULA'] != '' ? "'" + dataItem['SELLING_PRICE_BY_FORMULA'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.REMARK_FOR_ADJUST_PRICE', dataItem['REMARK_FOR_ADJUST_PRICE'] ? "'" + dataItem['REMARK_FOR_ADJUST_PRICE'].toString() + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.SELLING_PRICE', dataItem['SELLING_PRICE'] != '' ? "'" + dataItem['SELLING_PRICE'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.TOTAL_PRICE_OF_ALL_OF_ITEMS', dataItem['TOTAL_PRICE_OF_ALL_OF_ITEMS'].toString())

    sql = sql.replaceAll('dataItem.TOTAL_PROCESSING_TIME', dataItem['TOTAL_PROCESSING_TIME'].toString() !== '' ? "'" + dataItem['TOTAL_PROCESSING_TIME'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.DIRECT_PROCESS_COST', dataItem['DIRECT_PROCESS_COST'].toString())

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())

    sql = sql.replaceAll('dataItem.IMPORTED_COST_DEFAULT', dataItem['IMPORTED_COST_DEFAULT'].toString())

    sql = sql.replaceAll('dataItem.IMPORTED_COST', dataItem['IMPORTED_COST'].toString())
    sql = sql.replaceAll('dataItem.IS_ADJUST_IMPORTED_COST', dataItem['IS_ADJUST_IMPORTED_COST'].toString())
    sql = sql.replaceAll('dataItem.VAT_FOR_SELLING_PRICE', dataItem['VAT_FOR_SELLING_PRICE'].toString())

    sql = sql.replaceAll('dataItem.CIT', dataItem['CIT'].toString())
    sql = sql.replaceAll('dataItem.VAT', dataItem['VAT'].toString())

    sql = sql.replaceAll('dataItem.TOTAL', dataItem['TOTAL'].toString())
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())
    sql = sql.replaceAll('dataItem.ADJUST_PRICE', dataItem['ADJUST_PRICE'].toString() != '' ? dataItem['ADJUST_PRICE'].toString() : 'NULL')
    return sql
  },
  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
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
                          AND IS_FROM_SCT_COPY = 'dataItem.IS_FROM_SCT_COPY'
                                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  getBySctId: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `
                SELECT
                          tb_1.SCT_TOTAL_COST_ID
                        , tb_1.SCT_ID
                        , tb_1.DIRECT_UNIT_PROCESS_COST
                        , tb_1.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                        , tb_1.TOTAL_PROCESSING_TIME
                        , tb_1.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                        , tb_1.TOTAL_DIRECT_COST
                        , tb_1.DIRECT_PROCESS_COST
                        , tb_1.IMPORTED_FEE
                        , tb_1.IMPORTED_COST
                        , tb_1.TOTAL
                        , tb_1.TOTAL_PRICE_OF_RAW_MATERIAL
                        , tb_1.TOTAL_PRICE_OF_SUB_ASSY
                        , tb_1.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
                        , tb_1.TOTAL_PRICE_OF_CONSUMABLE
                        , tb_1.TOTAL_PRICE_OF_PACKING
                        , tb_1.TOTAL_PRICE_OF_ALL_OF_ITEMS
                        , tb_1.RM_INCLUDE_IMPORTED_COST
                        , tb_1.CONSUMABLE_PACKING
                        , tb_1.MATERIALS_COST
                        , tb_1.INDIRECT_COST_SALE_AVE
                        , tb_1.SELLING_EXPENSE
                        , tb_1.GA
                        , tb_1.MARGIN
                        , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%c-%d') AS ESTIMATE_PERIOD_START_DATE
                        , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%c-%d') AS ESTIMATE_PERIOD_END_DATE
                        , tb_1.TOTAL_YIELD_RATE
                        , tb_1.TOTAL_CLEAR_TIME
                        , tb_1.ADJUST_PRICE
                        , tb_1.REMARK_FOR_ADJUST_PRICE
                        , tb_1.NOTE
                        , tb_1.SELLING_EXPENSE_FOR_SELLING_PRICE
                        , tb_1.GA_FOR_SELLING_PRICE
                        , tb_1.MARGIN_FOR_SELLING_PRICE
                        , tb_1.IS_ADJUST_IMPORTED_COST
                        , tb_1.IMPORTED_COST_DEFAULT
                        , tb_1.TOTAL_GO_STRAIGHT_RATE
                        , tb_1.CIT_FOR_SELLING_PRICE
                        , tb_1.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS
                        , tb_1.ASSEMBLY_GROUP_FOR_SUPPORT_MES
                        , tb_1.VAT_FOR_SELLING_PRICE
                        , tb_1.CIT
                        , tb_1.VAT
                        , tb_1.TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST
                        , tb_1.TOTAL_ESSENTIAL_TIME
                        , tb_1.SELLING_PRICE_BY_FORMULA
                        , tb_1.SELLING_PRICE
                        , tb_1.DESCRIPTION
                        , tb_1.CREATE_BY
                        , tb_1.CREATE_DATE
                        , tb_1.UPDATE_BY
                        , tb_1.UPDATE_DATE
                        , tb_1.INUSE
                        , tb_1.IS_FROM_SCT_COPY
                FROM
                        dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_1
                WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'
                        AND tb_1.IS_FROM_SCT_COPY LIKE '%dataItem.IS_FROM_SCT_COPY%'
                        AND tb_1.INUSE = 1`

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', typeof dataItem['IS_FROM_SCT_COPY'] === 'undefined' ? '' : dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
}
