export const SctCreateFromHistorySQL = {
  insert: (dataItem: {
    SCT_ID: string
    SCT_CREATE_FROM_SETTING_ID: number
    CREATE_FROM_SCT_ID: string | ''
    CREATE_FROM_SCT_FISCAL_YEAR: number | ''
    CREATE_FROM_SCT_PATTERN_ID: number | ''
    CREATE_FROM_SCT_STATUS_PROGRESS_ID: number | ''
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: 0 | 1
  }) => {
    let sql = `
                    INSERT INTO
                                  dataItem.STANDARD_COST_DB.SCT_CREATE_FROM_HISTORY
                            (
                                  SCT_ID
                                , SCT_CREATE_FROM_SETTING_ID
                                , CREATE_FROM_SCT_ID
                                , CREATE_FROM_SCT_FISCAL_YEAR
                                , CREATE_FROM_SCT_PATTERN_ID
                                , CREATE_FROM_SCT_STATUS_PROGRESS_ID
                                , CREATE_BY
                                , UPDATE_BY
                                , UPDATE_DATE
                                , INUSE
                            )
                     VALUES
                            (
                                  'dataItem.SCT_ID'
                                , 'dataItem.SCT_CREATE_FROM_SETTING_ID'
                                , dataItem.CREATE_FROM_SCT_ID
                                , dataItem.CREATE_FROM_SCT_FISCAL_YEAR
                                , dataItem.CREATE_FROM_SCT_PATTERN_ID
                                , dataItem.CREATE_FROM_SCT_STATUS_PROGRESS_ID
                                , 'dataItem.CREATE_BY'
                                , 'dataItem.UPDATE_BY'
                                ,  CURRENT_TIMESTAMP()
                                , 'dataItem.INUSE'
                            )
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)
    sql = sql.replaceAll('dataItem.SCT_CREATE_FROM_SETTING_ID', dataItem.SCT_CREATE_FROM_SETTING_ID.toString())
    sql = sql.replaceAll('dataItem.CREATE_FROM_SCT_ID', dataItem.CREATE_FROM_SCT_ID ? `'${dataItem.CREATE_FROM_SCT_ID}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_FROM_SCT_FISCAL_YEAR', dataItem.CREATE_FROM_SCT_FISCAL_YEAR ? dataItem.CREATE_FROM_SCT_FISCAL_YEAR.toString() : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_FROM_SCT_PATTERN_ID', dataItem.CREATE_FROM_SCT_PATTERN_ID ? dataItem.CREATE_FROM_SCT_PATTERN_ID.toString() : 'NULL')
    sql = sql.replaceAll(
      'dataItem.CREATE_FROM_SCT_STATUS_PROGRESS_ID',
      dataItem.CREATE_FROM_SCT_STATUS_PROGRESS_ID ? dataItem.CREATE_FROM_SCT_STATUS_PROGRESS_ID.toString() : 'NULL'
    )

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY)

    sql = sql.replaceAll('dataItem.INUSE', dataItem.INUSE.toString())

    return sql
  },
}
