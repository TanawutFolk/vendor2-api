export const SctCompareSQL = {
  insert: async (dataItem: any) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.SCT_COMPARE
        (
                  SCT_COMPARE_ID
                , SCT_COMPARE_NO
                , SCT_ID
                , SCT_ID_FOR_COMPARE
                , CREATE_BY
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.SCT_COMPARE_ID'
                , 'dataItem.SCT_COMPARE_NO'
                , 'dataItem.SCT_ID'
                , 'dataItem.SCT_ID_FOR_COMPARE'
                , 'dataItem.CREATE_BY'
                , 'dataItem.UPDATE_BY'
                ,  CURRENT_TIMESTAMP()
                , 'dataItem.INUSE'
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_COMPARE_ID', dataItem['SCT_COMPARE_ID'])
    sql = sql.replaceAll('dataItem.SCT_COMPARE_NO', dataItem['SCT_COMPARE_NO'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID_FOR_COMPARE', dataItem['SCT_ID_FOR_COMPARE'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  deleteBySctId: async (dataItem: any) => {
    let sql = `

                  UPDATE
                          dataItem.STANDARD_COST_DB.SCT_COMPARE
                  SET
                            INUSE = '0'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                              SCT_ID = 'dataItem.SCT_ID'
                          AND INUSE = 1

                          `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
