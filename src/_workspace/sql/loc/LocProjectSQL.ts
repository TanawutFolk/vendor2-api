export const locProjectSQL = {
  getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType: async (dataItem: any) => {
    let sql = `
                SELECT 
                        LOC_ID
                       ,LOC_CODE
                       ,LOC_NAME
                FROM
                        loc
                WHERE
                        LOC_CODE LIKE '%dataItem.LOC_CODE%'
                    AND INUSE = 1
                    AND LOC_TYPE_ID = 2
                ORDER BY
                        LOC_CODE
                LIMIT 50           
    `
    sql = sql.replaceAll('dataItem.LOC_CODE', dataItem.LOC_CODE)
    return sql
  },
}
