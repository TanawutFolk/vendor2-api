export const ItemPurposeSQL = {
  getByLikeItemPurposeNameAndInuse: async (dataItem: any) => {
    let sql = `     SELECT
                          ITEM_PURPOSE_ID
                        , ITEM_PURPOSE_NAME
                        , ITEM_PURPOSE_ALPHABET
                    FROM
                        ITEM_PURPOSE
                    WHERE
                            ITEM_PURPOSE_NAME LIKE '%dataItem.ITEM_PURPOSE_NAME%'
                        AND INUSE LIKE '%dataItem.INUSE%'
                    LIMIT
                        50
                      ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_PURPOSE_NAME', dataItem['ITEM_PURPOSE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getAll: async () => {
    let sql = `      SELECT
                          ITEM_PURPOSE_ID
                        , ITEM_PURPOSE_NAME
                        , ITEM_PURPOSE_ALPHABET
                        , INUSE
                      FROM 
                        ITEM_PURPOSE  ;
                    `
    return sql
  },
}
