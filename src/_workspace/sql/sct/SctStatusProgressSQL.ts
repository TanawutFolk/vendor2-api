export const SctStatusProgressSQL = {
  getByLikeSctStatusProgressNameAndInuse: async (dataItem: any) => {
    let sql = `
                    SELECT
                                  SCT_STATUS_PROGRESS_ID
                                , SCT_STATUS_PROGRESS_NAME
                                , SCT_STATUS_PROGRESS_NO
                    FROM
                                dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS
                    WHERE
                                    SCT_STATUS_PROGRESS_NAME LIKE '%dataItem.SCT_STATUS_PROGRESS_NAME%'
                                AND INUSE LIKE '%dataItem.INUSE%'
                                ORDER BY SCT_STATUS_PROGRESS_NO
                                LIMIT 10
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_STATUS_PROGRESS_NAME', dataItem['SCT_STATUS_PROGRESS_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
