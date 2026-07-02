export const SctPatternSQL = {
  getByLikePatternNameAndInuse: async (dataItem: any) => {
    let sql = `
                    SELECT
                                  SCT_PATTERN_ID
                                , SCT_PATTERN_NAME
                    FROM
                                dataItem.STANDARD_COST_DB.SCT_PATTERN
                    WHERE
                                    SCT_PATTERN_NAME LIKE '%dataItem.SCT_PATTERN_NAME%'
                                AND INUSE LIKE '%dataItem.INUSE%'
                                ORDER BY SCT_PATTERN_NAME
                                LIMIT 10
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_PATTERN_NAME', dataItem['SCT_PATTERN_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
