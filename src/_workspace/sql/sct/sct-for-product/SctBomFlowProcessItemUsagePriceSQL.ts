export const SctBomFlowProcessItemUsagePriceSQL = {
  insert: async (dataItem: {
    SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID: string
    SCT_ID: string
    BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
    ITEM_M_S_PRICE_ID: string | null
    PRICE: number | null | ''
    YIELD_ACCUMULATION: number | null | ''
    AMOUNT: number | null | ''
    IS_ADJUST_YIELD_ACCUMULATION: number | null
    YIELD_ACCUMULATION_DEFAULT: number | null | ''
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
    IS_FROM_SCT_COPY: 0 | 1
    ADJUST_YIELD_ACCUMULATION_VERSION_NO: number | null
  }) => {
    let sql = `
                INSERT INTO dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE
                                (
                                            SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID
                                          , SCT_ID
                                          , BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                          , ITEM_M_S_PRICE_ID
                                          , PRICE
                                          , YIELD_ACCUMULATION
                                          , AMOUNT
                                          , IS_ADJUST_YIELD_ACCUMULATION
                                          , YIELD_ACCUMULATION_DEFAULT
                                          , CREATE_BY
                                          , UPDATE_DATE
                                          , UPDATE_BY
                                          , INUSE
                                          , IS_FROM_SCT_COPY
                                          , ADJUST_YIELD_ACCUMULATION_VERSION_NO
                                )
                                VALUES
                                (
                                            'dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID'
                                          , 'dataItem.SCT_ID'
                                          , 'dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID'
                                          ,  dataItem.ITEM_M_S_PRICE_ID
                                          ,  dataItem.PRICE
                                          ,  dataItem.YIELD_ACCUMULATION
                                          ,  dataItem.AMOUNT
                                          ,  dataItem.IS_ADJUST_YIELD_ACCUMULATION
                                          ,  dataItem.YIELD_ACCUMULATION_DEFAULT
                                          , 'dataItem.CREATE_BY'
                                          ,  CURRENT_TIMESTAMP()
                                          , 'dataItem.UPDATE_BY'
                                          , 'dataItem.INUSE'
                                          , 'dataItem.IS_FROM_SCT_COPY'
                                          , dataItem.ADJUST_YIELD_ACCUMULATION_VERSION_NO
                                )
                            `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID', dataItem['SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'].toString())

    sql = sql.replaceAll('dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID', dataItem['BOM_FLOW_PROCESS_ITEM_USAGE_ID'].toString())
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_ID', dataItem['ITEM_M_S_PRICE_ID'] ? "'" + dataItem['ITEM_M_S_PRICE_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PRICE', typeof dataItem['PRICE'] === 'number' ? "'" + dataItem['PRICE'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.IS_ADJUST_YIELD_ACCUMULATION', dataItem['IS_ADJUST_YIELD_ACCUMULATION'] ? "'" + dataItem['IS_ADJUST_YIELD_ACCUMULATION'] + "'" : 'NULL')
    sql = sql.replaceAll(
      'dataItem.YIELD_ACCUMULATION_DEFAULT',
      typeof dataItem['YIELD_ACCUMULATION_DEFAULT'] === 'number' ? "'" + dataItem['YIELD_ACCUMULATION_DEFAULT'] + "'" : 'NULL'
    )

    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION', typeof dataItem['YIELD_ACCUMULATION'] === 'number' ? "'" + dataItem['YIELD_ACCUMULATION'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.AMOUNT', typeof dataItem['AMOUNT'] === 'number' ? "'" + dataItem['AMOUNT'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())

    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())
    sql = sql.replaceAll(
      'dataItem.ADJUST_YIELD_ACCUMULATION_VERSION_NO',
      dataItem['ADJUST_YIELD_ACCUMULATION_VERSION_NO'] ? "'" + dataItem['ADJUST_YIELD_ACCUMULATION_VERSION_NO'] + "'" : 'NULL'
    )

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
  getItemPriceAdjustment: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                        , tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                        , tb_1.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE
                FROM
                        dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST tb_1
                WHERE
                        tb_1.SCT_ID = 'dataItem.SCT_ID'
                        AND tb_1.INUSE = 1

                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getBySctId: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `

                SELECT
                          tb_1.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID
                        , tb_1.SCT_ID
                        , tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                        , tb_1.ITEM_M_S_PRICE_ID
                        , tb_1.PRICE
                        , tb_1.YIELD_ACCUMULATION
                        , tb_1.AMOUNT
                        , tb_1.IS_ADJUST_YIELD_ACCUMULATION
                        , tb_1.YIELD_ACCUMULATION_DEFAULT
                        , tb_1.CREATE_BY
                        , tb_1.CREATE_DATE
                        , tb_1.UPDATE_BY
                        , tb_1.UPDATE_DATE
                        , tb_1.INUSE
                        , tb_1.IS_FROM_SCT_COPY
                        , tb_1.ADJUST_YIELD_ACCUMULATION_VERSION_NO
                        , tb_2.SCT_ID_SELECTION
                        , tb_3.PURCHASE_UNIT_ID
                        , tb_4.UNIT_OF_MEASUREMENT_NAME AS PURCHASE_UNIT_NAME
                        , tb_3.USAGE_UNIT_ID
                        , tb_5.UNIT_OF_MEASUREMENT_NAME AS USAGE_UNIT_NAME
                        , tb_6.PURCHASE_PRICE
                        , tb_3.PURCHASE_UNIT_RATIO
                        , tb_7.EXCHANGE_RATE_VALUE
                        , tb_3.USAGE_UNIT_RATIO
                        , tb_3.FISCAL_YEAR
                        , tb_3.SCT_PATTERN_ID
                        , tb_3.ITEM_M_S_PRICE_VALUE
                        , tb_3.VERSION AS ITEM_M_S_PRICE_VERSION
                        , tb_8.CURRENCY_NAME  AS PURCHASE_PRICE_CURRENCY_NAME
                        , tb_8.CURRENCY_SYMBOL  AS PURCHASE_PRICE_CURRENCY_CODE
                FROM
                        dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_1
                              INNER JOIN
                        ITEM_M_S_PRICE tb_3
                              ON tb_1.ITEM_M_S_PRICE_ID = tb_3.ITEM_M_S_PRICE_ID
                              INNER JOIN
                        UNIT_OF_MEASUREMENT tb_4
                              ON tb_3.PURCHASE_UNIT_ID = tb_4.UNIT_OF_MEASUREMENT_ID
                              INNER JOIN
                        UNIT_OF_MEASUREMENT tb_5
                              ON tb_3.USAGE_UNIT_ID = tb_5.UNIT_OF_MEASUREMENT_ID
                             INNER JOIN
                        ITEM_M_O_PRICE tb_6
                             ON tb_3.ITEM_M_O_PRICE_ID = tb_6.ITEM_M_O_PRICE_ID
                             INNER JOIN
                        EXCHANGE_RATE tb_7
                             ON tb_3.EXCHANGE_RATE_ID = tb_7.EXCHANGE_RATE_ID
                             INNER JOIN
                        CURRENCY tb_8
                             ON tb_7.CURRENCY_ID = tb_8.CURRENCY_ID
                             LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST tb_2
                              ON tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                              AND tb_2.INUSE = 1
                WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'
                        AND tb_1.INUSE = 1
                        AND tb_1.IS_FROM_SCT_COPY LIKE '%dataItem.IS_FROM_SCT_COPY%'
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', typeof dataItem['IS_FROM_SCT_COPY'] === 'undefined' ? '' : dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
}
