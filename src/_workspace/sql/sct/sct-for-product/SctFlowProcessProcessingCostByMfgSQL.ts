export const SctFlowProcessProcessingCostByMfgSQL = {
  insert: async (dataItem: {
    SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID: string
    SCT_ID: string
    FLOW_PROCESS_ID: string
    CLEAR_TIME: number | '' | null
    ESSENTIAL_TIME: number | '' | null
    PROCESS_STANDARD_TIME: number | '' | null
    NOTE: string
    CREATE_BY: string
    UPDATE_BY: string
    IS_FROM_SCT_COPY: number
  }) => {
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
                                    , IS_FROM_SCT_COPY
                                    , INUSE
                            )
                                  VALUES
                                  (
                                      'dataItem.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID'
                                    , 'dataItem.SCT_ID'
                                    , 'dataItem.FLOW_PROCESS_ID'
                                    ,  dataItem.CLEAR_TIME
                                    ,  dataItem.ESSENTIAL_TIME
                                    ,  dataItem.PROCESS_STANDARD_TIME
                                    , 'dataItem.NOTE'
                                    , 'dataItem.CREATE_BY'
                                    ,  CURRENT_TIMESTAMP()
                                    , 'dataItem.CREATE_BY'
                                    , 'dataItem.IS_FROM_SCT_COPY'
                                    , 1
                  )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID', dataItem['SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])

    sql = sql.replaceAll('dataItem.CLEAR_TIME', typeof dataItem['CLEAR_TIME'] === 'number' ? dataItem['CLEAR_TIME'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.ESSENTIAL_TIME', typeof dataItem['ESSENTIAL_TIME'] === 'number' ? dataItem['ESSENTIAL_TIME'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.PROCESS_STANDARD_TIME', typeof dataItem['PROCESS_STANDARD_TIME'] === 'number' ? dataItem['PROCESS_STANDARD_TIME'].toString() : 'NULL')

    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

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
  getBySctId: async (dataItem: any) => {
    let sql = `      SELECT
                                SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID
                              , SCT_ID
                              , FLOW_PROCESS_ID
                              , CLEAR_TIME
                              , ESSENTIAL_TIME
                              , PROCESS_STANDARD_TIME
                              , NOTE
                              , CREATE_BY
                              , CREATE_DATE
                              , UPDATE_BY
                              , UPDATE_DATE
                              , INUSE
                              , IS_FROM_SCT_COPY
                          FROM
                                dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG
                          WHERE
                                SCT_ID = 'dataItem.SCT_ID'
                          `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getBySctIdAndIsFromSctCopy: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `      SELECT
                                SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID
                              , SCT_ID
                              , FLOW_PROCESS_ID
                              , CLEAR_TIME
                              , ESSENTIAL_TIME
                              , PROCESS_STANDARD_TIME
                              , NOTE
                              , CREATE_BY
                              , CREATE_DATE
                              , UPDATE_BY
                              , UPDATE_DATE
                              , INUSE
                              , IS_FROM_SCT_COPY
                          FROM
                                dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG
                          WHERE
                                SCT_ID = 'dataItem.SCT_ID'
                            AND IS_FROM_SCT_COPY LIKE '%dataItem.IS_FROM_SCT_COPY%'
                          `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
}
