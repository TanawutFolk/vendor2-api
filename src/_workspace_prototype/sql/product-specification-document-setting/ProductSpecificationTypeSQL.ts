export const ProductSpecificationTypeSQL = {
  getByLikeProductSpecificationTypeAndInuse: async (query: any) => {
    let sql = `   SELECT
                        PRODUCT_SPECIFICATION_TYPE_ID
                      , PRODUCT_SPECIFICATION_TYPE_NAME
                      , PRODUCT_SPECIFICATION_TYPE_ALPHABET
                    FROM
                      PRODUCT_SPECIFICATION_TYPE
                    WHERE
                          PRODUCT_SPECIFICATION_TYPE_NAME LIKE '%dataItem.PRODUCT_SPECIFICATION_TYPE_NAME%'
                      AND INUSE LIKE '%dataItem.INUSE%'
                    ORDER BY
                      PRODUCT_SPECIFICATION_TYPE_NAME ASC
                    LIMIT
                      50
                    `

    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_TYPE_NAME', query['PRODUCT_SPECIFICATION_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', query['INUSE'])
    //console.log('getByLikeProductSpecificationTypeAndInuse', sql)

    return sql
  },
}
