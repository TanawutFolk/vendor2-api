export const SctFlowProcessProcessingCostByEngineerSQL = {
  insert: async (dataItem: any) => {
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
                            )
                                  SELECT
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
                                            , 'dataItem.INUSE'
            )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID', dataItem['SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.YIELD_RATE', dataItem['YIELD_RATE'] ? "'" + dataItem['YIELD_RATE'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION', dataItem['YIELD_ACCUMULATION'] ? "'" + dataItem['YIELD_ACCUMULATION'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.GO_STRAIGHT_RATE', dataItem['GO_STRAIGHT_RATE'] ? "'" + dataItem['GO_STRAIGHT_RATE'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `      UPDATE
                                dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_SEQUENCE
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
}
