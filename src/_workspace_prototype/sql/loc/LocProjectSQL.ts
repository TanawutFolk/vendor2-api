export const locProjectSQL = {
  getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType: async (dataItem: any) => {
    let sql = `
                SELECT
                        tb_1.LOC_ID
                       ,tb_1.LOC_CODE
                       ,tb_1.LOC_NAME
                       ,tb_1.LOC_TYPE_ID
                FROM
                        loc tb_1
                        LEFT JOIN loc_type tb_2
                        ON tb_2.LOC_TYPE_ID = tb_1.LOC_TYPE_ID
                WHERE
                        tb_1.LOC_CODE LIKE '%dataItem.LOC_CODE%'
                    AND tb_1.INUSE = 1
                    AND (tb_1.LOC_TYPE_ID = 2 OR tb_1.LOC_TYPE_ID IS NULL)
                ORDER BY
                        tb_1.LOC_CODE
                LIMIT 50
    `
    sql = sql.replaceAll('dataItem.LOC_CODE', dataItem.LOC_CODE)

    return sql
  },
}
