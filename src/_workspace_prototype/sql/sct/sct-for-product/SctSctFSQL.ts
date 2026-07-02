export const SctSctFSQL = {
  insert: async (dataItem: { SCT_SCT_F_ID: string; SCT_ID: string; SCT_F_ID: string; CREATE_BY: string; UPDATE_BY: string; INUSE: 0 | 1 }) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_SCT_F
            (
                      SCT_SCT_F_ID
                    , SCT_ID
                    , SCT_F_ID
                    , CREATE_BY
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
            )
            VALUES
            (
                      'dataItem.SCT_SCT_F_ID'
                    , 'dataItem.SCT_ID'
                    , 'dataItem.SCT_F_ID'
                    , 'dataItem.CREATE_BY'
                    , 'dataItem.UPDATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.INUSE'
            )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_SCT_F_ID', dataItem['SCT_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())
    return sql
  },
}
