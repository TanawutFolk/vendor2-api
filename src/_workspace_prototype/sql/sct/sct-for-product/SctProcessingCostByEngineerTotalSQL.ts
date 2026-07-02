export const SctProcessingCostByEngineerTotalSQL = {
  insert: async (dataItem: {
    SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID: string
    SCT_ID: string
    TOTAL_YIELD_RATE: number | '' | null
    TOTAL_GO_STRAIGHT_RATE: number | '' | null
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
    IS_FROM_SCT_COPY: 0 | 1
  }) => {
    let sql = `
              INSERT INTO dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_ENGINEER_TOTAL
                           (
                                  SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID
                                , SCT_ID
                                , TOTAL_YIELD_RATE
                                , TOTAL_GO_STRAIGHT_RATE
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                                , INUSE
                                , IS_FROM_SCT_COPY
                          )
                          VALUES
                          (
                                'dataItem.SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID'
                              , 'dataItem.SCT_ID'
                              ,  dataItem.TOTAL_YIELD_RATE
                              ,  dataItem.TOTAL_GO_STRAIGHT_RATE
                              , 'dataItem.CREATE_BY'
                              ,  CURRENT_TIMESTAMP()
                              , 'dataItem.UPDATE_BY'
                              , 'dataItem.INUSE'
                              , 'dataItem.IS_FROM_SCT_COPY'
                          )
                          `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID', dataItem['SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID'])

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.TOTAL_YIELD_RATE', typeof dataItem['TOTAL_YIELD_RATE'] === 'number' ? "'" + dataItem['TOTAL_YIELD_RATE'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.TOTAL_GO_STRAIGHT_RATE', typeof dataItem['TOTAL_GO_STRAIGHT_RATE'] === 'number' ? "'" + dataItem['TOTAL_GO_STRAIGHT_RATE'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `      UPDATE
                                  dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_ENGINEER_TOTAL
                            SET
                                    INUSE = '0'
                                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                                  , UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                      SCT_ID = 'dataItem.SCT_ID'
                                  AND INUSE = '1'
                                  AND IS_FROM_SCT_COPY = 'dataItem.IS_FROM_SCT_COPY'
                              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  getBySctIdAndIsFromSctCopy: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `     SELECT
                            SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID
                          , SCT_ID
                          , TOTAL_YIELD_RATE
                          , TOTAL_GO_STRAIGHT_RATE
                          , CREATE_BY
                          , CREATE_DATE
                          , UPDATE_BY
                          , UPDATE_DATE
                          , INUSE
                          , IS_FROM_SCT_COPY
                      FROM
                            dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_ENGINEER_TOTAL
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
