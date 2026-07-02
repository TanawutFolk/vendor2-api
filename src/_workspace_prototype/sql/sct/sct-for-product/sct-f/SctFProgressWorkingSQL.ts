export const SctFProgressWorkingSQL = {
  insert: async (dataItem: {
    SCT_F_PROGRESS_WORKING_ID: string
    SCT_F_ID: string
    SCT_F_STATUS_PROGRESS_ID: number
    SCT_F_STATUS_WORKING_ID: number
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: 0 | 1
  }) => {
    let sql = `
        SET @sctFProgressWorkingNo = (1 + coalesce((SELECT max(SCT_F_PROGRESS_WORKING_NO)
        FROM dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING
         WHERE SCT_F_ID = 'dataItem.SCT_F_ID'), 0));

        INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING
        (
                  SCT_F_PROGRESS_WORKING_ID
                , SCT_F_ID
                , SCT_F_PROGRESS_WORKING_NO
                , SCT_F_STATUS_PROGRESS_ID
                , SCT_F_STATUS_WORKING_ID
                , CREATE_BY
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.SCT_F_PROGRESS_WORKING_ID'
                , 'dataItem.SCT_F_ID'
                ,  @sctFProgressWorkingNo
                , 'dataItem.SCT_F_STATUS_PROGRESS_ID'
                , 'dataItem.SCT_F_STATUS_WORKING_ID'
                , 'dataItem.CREATE_BY'
                , 'dataItem.UPDATE_BY'
                , CURRENT_TIMESTAMP()
                , 'dataItem.INUSE'
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_PROGRESS_WORKING_ID', dataItem['SCT_F_PROGRESS_WORKING_ID'])

    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_STATUS_PROGRESS_ID', dataItem['SCT_F_STATUS_PROGRESS_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_F_STATUS_WORKING_ID', dataItem['SCT_F_STATUS_WORKING_ID'].toString())

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())

    return sql
  },
}
