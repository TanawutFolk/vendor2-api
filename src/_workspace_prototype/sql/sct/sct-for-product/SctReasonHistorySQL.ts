export const SctReasonHistorySQL = {
  insert: async (dataItem: { SCT_REASON_HISTORY_ID: string; SCT_ID: string; SCT_REASON_SETTING_ID: number; CREATE_BY: string; UPDATE_BY: string; INUSE: number }) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY
        (
                  SCT_REASON_HISTORY_ID
                , SCT_ID
                , SCT_REASON_SETTING_ID
                , CREATE_BY
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.SCT_REASON_HISTORY_ID'
                , 'dataItem.SCT_ID'
                , 'dataItem.SCT_REASON_SETTING_ID'
                , 'dataItem.CREATE_BY'
                , 'dataItem.UPDATE_BY'
                ,  CURRENT_TIMESTAMP()
                , 'dataItem.INUSE'
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_REASON_HISTORY_ID', dataItem['SCT_REASON_HISTORY_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())

    return sql
  },

  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string }) => {
    let sql = `

                  UPDATE
                          dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY
                  SET
                            INUSE = '0'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                              SCT_ID = 'dataItem.SCT_ID'
                          AND INUSE = 1

                 sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')             `

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
