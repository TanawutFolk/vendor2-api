export const SctFlowProcessSequenceSQL = {
  insert: async (dataItem: {
    SCT_ID: string
    FLOW_PROCESS_ID: string
    SCT_PROCESS_SEQUENCE_CODE: string
    OLD_SYSTEM_PROCESS_SEQUENCE_CODE: string
    OLD_SYSTEM_COLLECTION_POINT: number
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
    SCT_FLOW_PROCESS_SEQUENCE_ID: string
    IS_FROM_SCT_COPY: number
  }) => {
    let sql = `
          INSERT INTO dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_SEQUENCE
                          (
                                  SCT_FLOW_PROCESS_SEQUENCE_ID
                                , SCT_ID
                                , FLOW_PROCESS_ID
                                , SCT_PROCESS_SEQUENCE_CODE
                                , OLD_SYSTEM_PROCESS_SEQUENCE_CODE
                                , OLD_SYSTEM_COLLECTION_POINT
                                , CREATE_BY
                                , UPDATE_BY
                                , UPDATE_DATE
                                , INUSE
                                , IS_FROM_SCT_COPY
                          )
                                VALUES
                          (
                                          'dataItem.SCT_FLOW_PROCESS_SEQUENCE_ID'
                                        , 'dataItem.SCT_ID'
                                        , 'dataItem.FLOW_PROCESS_ID'
                                        , 'dataItem.SCT_PROCESS_SEQUENCE_CODE'
                                        , 'dataItem.OLD_SYSTEM_PROCESS_SEQUENCE_CODE'
                                        , 'dataItem.OLD_SYSTEM_COLLECTION_POINT'
                                        , 'dataItem.CREATE_BY'
                                        , 'dataItem.UPDATE_BY'
                                        ,  CURRENT_TIMESTAMP()
                                        , 'dataItem.INUSE'
                                        , 'dataItem.IS_FROM_SCT_COPY'
                          )
                      `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_FLOW_PROCESS_SEQUENCE_ID', dataItem['SCT_FLOW_PROCESS_SEQUENCE_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.SCT_PROCESS_SEQUENCE_CODE', dataItem['SCT_PROCESS_SEQUENCE_CODE'])
    sql = sql.replaceAll('dataItem.OLD_SYSTEM_PROCESS_SEQUENCE_CODE', dataItem['OLD_SYSTEM_PROCESS_SEQUENCE_CODE'])
    sql = sql.replaceAll('dataItem.OLD_SYSTEM_COLLECTION_POINT', dataItem['OLD_SYSTEM_COLLECTION_POINT'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

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
  getBySctIdAndIsFromSctCopy: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `     SELECT
                              SCT_FLOW_PROCESS_SEQUENCE_ID
                            , SCT_ID
                            , FLOW_PROCESS_ID
                            , SCT_PROCESS_SEQUENCE_CODE
                            , OLD_SYSTEM_PROCESS_SEQUENCE_CODE
                            , OLD_SYSTEM_COLLECTION_POINT
                            , CREATE_BY
                            , CREATE_DATE
                            , UPDATE_BY
                            , UPDATE_DATE
                            , INUSE
                            , IS_FROM_SCT_COPY
                        FROM
                              dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_SEQUENCE
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
