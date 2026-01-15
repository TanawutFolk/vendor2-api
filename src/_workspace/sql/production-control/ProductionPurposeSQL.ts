export const ProductionPurposeSQL = {
  getByLikeProductionPurposeNameAndInuse: async (dataItem: any) => {
    let sql = `
                        SELECT
                            PRODUCTION_PURPOSE_ID
                            , PRODUCTION_PURPOSE_NAME
                            , PRODUCTION_PURPOSE_ALPHABET
                        FROM
                            PRODUCTION_PURPOSE
                        WHERE
                            PRODUCTION_PURPOSE_NAME LIKE '%dataItem.PRODUCTION_PURPOSE_NAME%'
                            AND INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                            PRODUCTION_PURPOSE_NAME
                        `
    sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_NAME', dataItem['PRODUCTION_PURPOSE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
}
