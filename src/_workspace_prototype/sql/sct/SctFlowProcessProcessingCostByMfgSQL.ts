export const SctFlowProcessProcessingCostByMfgSQL = {
  insert: async (dataItem: any) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG
                            (
                                        SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID
                                    , SCT_ID
                                    , FLOW_PROCESS_ID
                                    , CLEAR_TIME
                                    , ESSENTIAL_TIME
                                    , PROCESS_STANDARD_TIME
                                    , NOTE
                                    , CREATE_BY
                                    , UPDATE_DATE
                                    , UPDATE_BY
                            )
                                  SELECT
                                      'dataItem.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID'
                                    , 'dataItem.SCT_ID'
                                    , 'dataItem.FLOW_PROCESS_ID'
                                    ,  dataItem.CLEAR_TIME
                                    ,  dataItem.ESSENTIAL_TIME
                                    ,  dataItem.PROCESS_STANDARD_TIME
                                    , 'dataItem.NOTE'
                                    , 'dataItem.CREATE_BY'
                                    , CURRENT_TIMESTAMP()
                                    , 'dataItem.CREATE_BY'
            )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID', dataItem['SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])

    sql = sql.replaceAll('dataItem.CLEAR_TIME', dataItem['CLEAR_TIME'] !== '' ? "'" + dataItem['CLEAR_TIME'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.ESSENTIAL_TIME', dataItem['ESSENTIAL_TIME'] !== '' ? "'" + dataItem['ESSENTIAL_TIME'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PROCESS_STANDARD_TIME', dataItem['PROCESS_STANDARD_TIME'] !== '' ? "'" + dataItem['PROCESS_STANDARD_TIME'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },

  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `      UPDATE
                                dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG
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
