export const SctProgressWorkingSQL = {
  insert: async (dataItem: any) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING
                        (
                              SCT_ID
                            , SCT_PROGRESS_WORKING_NO
                            , SCT_STATUS_PROGRESS_ID
                            , SCT_STATUS_WORKING_ID
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                            , INUSE
                        )
                            SELECT
                                    'dataItem.SCT_ID'
                                  ,  1 + coalesce((SELECT max(SCT_PROGRESS_WORKING_NO) FROM SCT_PROGRESS_WORKING WHERE SCT_ID = 'dataItem.SCT_ID'), 0)
                                  , 'dataItem.SCT_STATUS_PROGRESS_ID'
                                  , 'dataItem.SCT_STATUS_WORKING_ID'
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 'dataItem.INUSE'
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_STATUS_PROGRESS_ID', dataItem['SCT_STATUS_PROGRESS_ID'])
    sql = sql.replaceAll('dataItem.SCT_STATUS_WORKING_ID', dataItem['SCT_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  deleteBySctId: async (dataItem: any) => {
    let sql = `      UPDATE
                            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING
                      SET
                              INUSE = '0'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                      WHERE
                                SCT_ID = 'dataItem.SCT_ID'
                            AND INUSE = '1'
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
