export const SctFlowProcessSequenceSQL = {
  insert: async (dataItem: any) => {
    let sql = `
          INSERT INTO dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_SEQUENCE
                          (
                                  SCT_ID
                                , FLOW_PROCESS_ID
                                , SCT_PROCESS_SEQUENCE_CODE
                                , OLD_SYSTEM_PROCESS_SEQUENCE_CODE
                                , OLD_SYSTEM_COLLECTION_POINT
                                , CREATE_BY
                                , UPDATE_BY
                                , UPDATE_DATE
                                , INUSE
                          )
                                SELECT
                                          'dataItem.SCT_ID'
                                        , 'dataItem.FLOW_PROCESS_ID'
                                        , 'dataItem.SCT_PROCESS_SEQUENCE_CODE'
                                        , 'dataItem.OLD_SYSTEM_PROCESS_SEQUENCE_CODE'
                                        , 'dataItem.OLD_SYSTEM_COLLECTION_POINT'
                                        , 'dataItem.CREATE_BY'
                                        , 'dataItem.UPDATE_BY'
                                        ,  CURRENT_TIMESTAMP()
                                        , 'dataItem.INUSE'
          )
                      `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.SCT_PROCESS_SEQUENCE_CODE', dataItem['SCT_PROCESS_SEQUENCE_CODE'])
    sql = sql.replaceAll('dataItem.OLD_SYSTEM_PROCESS_SEQUENCE_CODE', dataItem['OLD_SYSTEM_PROCESS_SEQUENCE_CODE'])
    sql = sql.replaceAll('dataItem.OLD_SYSTEM_COLLECTION_POINT', dataItem['OLD_SYSTEM_COLLECTION_POINT'])
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
