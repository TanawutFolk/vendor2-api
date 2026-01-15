export const SctReasonHistorySQL = {
  insert: async (dataItem: any) => {
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
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.SCT_REASON_HISTORY_ID', dataItem['SCT_REASON_HISTORY_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
