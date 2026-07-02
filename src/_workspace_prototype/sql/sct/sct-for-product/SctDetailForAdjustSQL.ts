export const SctDetailForAdjustSQL = {
  insert: async (dataItem: {
    SCT_DETAIL_FOR_ADJUST_ID: string
    SCT_ID: string
    TOTAL_INDIRECT_COST: number | null | ''
    CIT: number | null | ''
    VAT: number | null | ''
    GA: number | null | ''
    MARGIN: number | null | ''
    SELLING_EXPENSE: number | null | ''
    ADJUST_PRICE: number | null | ''
    REMARK_FOR_ADJUST_PRICE: string | null | ''
    CREATE_BY: string
    UPDATE_BY: string
    IS_FROM_SCT_COPY: 0 | 1
  }) => {
    let sql = `
              INSERT INTO dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST
                  (
                            SCT_DETAIL_FOR_ADJUST_ID
                          , SCT_ID
                          , TOTAL_INDIRECT_COST
                          , CIT
                          , VAT
                          , GA
                          , MARGIN
                          , SELLING_EXPENSE
                          , ADJUST_PRICE
                          , REMARK_FOR_ADJUST_PRICE
                          , CREATE_BY
                          , UPDATE_BY
                          , UPDATE_DATE
                          , INUSE
                          , IS_FROM_SCT_COPY
                  )
              VALUES
                  (
                            'dataItem.SCT_DETAIL_FOR_ADJUST_ID'
                          , 'dataItem.SCT_ID'
                          , dataItem.TOTAL_INDIRECT_COST
                          , dataItem.CIT
                          , dataItem.VAT
                          , dataItem.GA
                          , dataItem.MARGIN
                          , dataItem.SELLING_EXPENSE
                          , dataItem.ADJUST_PRICE
                          , dataItem.REMARK_FOR_ADJUST_PRICE
                          , 'dataItem.CREATE_BY'
                          , 'dataItem.UPDATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 1
                          , 'dataItem.IS_FROM_SCT_COPY'
                  );

              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.SCT_DETAIL_FOR_ADJUST_ID', dataItem['SCT_DETAIL_FOR_ADJUST_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.TOTAL_INDIRECT_COST', typeof dataItem?.['TOTAL_INDIRECT_COST'] === 'number' ? `'${dataItem['TOTAL_INDIRECT_COST']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CIT', typeof dataItem?.['CIT'] === 'number' ? `'${dataItem['CIT']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.VAT', typeof dataItem?.['VAT'] === 'number' ? `'${dataItem['VAT']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.GA', typeof dataItem?.['GA'] === 'number' ? `'${dataItem['GA']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.MARGIN', typeof dataItem?.['MARGIN'] === 'number' ? `'${dataItem['MARGIN']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.SELLING_EXPENSE', typeof dataItem?.['SELLING_EXPENSE'] === 'number' ? `'${dataItem['SELLING_EXPENSE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ADJUST_PRICE', typeof dataItem?.['ADJUST_PRICE'] === 'number' ? `'${dataItem['ADJUST_PRICE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.REMARK_FOR_ADJUST_PRICE', typeof dataItem?.['REMARK_FOR_ADJUST_PRICE'] === 'string' ? `'${dataItem['REMARK_FOR_ADJUST_PRICE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  getBySctId: async (dataItem: { SCT_ID: string }) => {
    let sql = `
                    SELECT
                              TOTAL_INDIRECT_COST
                            , CIT
                            , VAT
                            , GA
                            , MARGIN
                            , SELLING_EXPENSE
                            , ADJUST_PRICE
                            , REMARK_FOR_ADJUST_PRICE
                            , TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID
                            , CIT_SCT_RESOURCE_OPTION_ID
                            , VAT_SCT_RESOURCE_OPTION_ID
                            , GA_SCT_RESOURCE_OPTION_ID
                            , MARGIN_SCT_RESOURCE_OPTION_ID
                            , SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID
                            , ADJUST_PRICE_SCT_RESOURCE_OPTION_ID
                            , IS_FROM_SCT_COPY
                    FROM
                            dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST
                    WHERE
                                SCT_ID = 'dataItem.SCT_ID'
                            AND INUSE = 1
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getBySctIdAndIsFromSctCopy: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `
                    SELECT
                              TOTAL_INDIRECT_COST
                            , CIT
                            , VAT
                            , GA
                            , MARGIN
                            , SELLING_EXPENSE
                            , ADJUST_PRICE
                            , SCT_DETAIL_FOR_ADJUST_ID
                            , IS_FROM_SCT_COPY
                    FROM
                            dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST
                    WHERE
                                SCT_ID = 'dataItem.SCT_ID'
                            AND IS_FROM_SCT_COPY LIKE '%dataItem.IS_FROM_SCT_COPY%'
                            AND INUSE = 1
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  deleteBySctIdAndIsFromSctCopy: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `
                    UPDATE
                            dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST
                    SET
                          INUSE = 0
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                                SCT_ID = 'dataItem.SCT_ID'
                            AND IS_FROM_SCT_COPY LIKE '%dataItem.IS_FROM_SCT_COPY%'
                            AND INUSE = 1
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
}
