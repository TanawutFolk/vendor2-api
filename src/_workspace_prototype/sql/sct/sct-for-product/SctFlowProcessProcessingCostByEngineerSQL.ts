export const SctFlowProcessProcessingCostByEngineerSQL = {
  insert: async (dataItem: {
    SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID: string
    SCT_ID: string
    FLOW_PROCESS_ID: string
    YIELD_RATE: number | '' | null
    YIELD_ACCUMULATION: number | '' | null
    GO_STRAIGHT_RATE: number | '' | null
    NOTE: string
    CREATE_BY: string
    UPDATE_BY: string
    IS_FROM_SCT_COPY: number
  }) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER
                            (
                                              SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID
                                            , SCT_ID
                                            , FLOW_PROCESS_ID
                                            , YIELD_RATE
                                            , YIELD_ACCUMULATION
                                            , GO_STRAIGHT_RATE
                                            , NOTE
                                            , CREATE_BY
                                            , UPDATE_DATE
                                            , UPDATE_BY
                                            , INUSE
                                            , IS_FROM_SCT_COPY
                            )
                            VALUES
                            (
                                              'dataItem.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID'
                                            , 'dataItem.SCT_ID'
                                            , 'dataItem.FLOW_PROCESS_ID'
                                            , dataItem.YIELD_RATE
                                            , dataItem.YIELD_ACCUMULATION
                                            , dataItem.GO_STRAIGHT_RATE
                                            , 'dataItem.NOTE'
                                            , 'dataItem.CREATE_BY'
                                            , CURRENT_TIMESTAMP()
                                            , 'dataItem.UPDATE_BY'
                                            , 1
                                            , 'dataItem.IS_FROM_SCT_COPY'
                            )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID', dataItem['SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.YIELD_RATE', typeof dataItem['YIELD_RATE'] === 'number' ? dataItem['YIELD_RATE'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION', typeof dataItem['YIELD_ACCUMULATION'] === 'number' ? dataItem['YIELD_ACCUMULATION'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.GO_STRAIGHT_RATE', typeof dataItem['GO_STRAIGHT_RATE'] === 'number' ? dataItem['GO_STRAIGHT_RATE'].toString() : 'NULL')

    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `      UPDATE
                                dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER
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
  getBySctId: async (dataItem: any) => {
    let sql = `
                    SELECT
                              SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID
                            , SCT_ID
                            , FLOW_PROCESS_ID
                            , YIELD_RATE
                            , YIELD_ACCUMULATION
                            , GO_STRAIGHT_RATE
                            , NOTE
                            , CREATE_DATE
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                            , INUSE
                            , IS_FROM_SCT_COPY
                    FROM
                              dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER
                    WHERE
                              SCT_ID = 'dataItem.SCT_ID'
                          AND INUSE = '1'
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getBySctIdAndIsFromSctCopy: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `
                    SELECT
                              SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID
                            , SCT_ID
                            , FLOW_PROCESS_ID
                            , YIELD_RATE
                            , YIELD_ACCUMULATION
                            , GO_STRAIGHT_RATE
                            , NOTE
                            , CREATE_DATE
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                            , INUSE
                            , IS_FROM_SCT_COPY
                    FROM
                              dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER
                    WHERE
                              SCT_ID = 'dataItem.SCT_ID'
                          AND IS_FROM_SCT_COPY LIKE '%dataItem.IS_FROM_SCT_COPY%'
                          AND INUSE = '1'
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
}
