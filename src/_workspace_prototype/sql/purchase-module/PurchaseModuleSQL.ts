export const PurchaseModuleSQL = {
  getByLikePurchaseModuleNameAndInuse: async (dataItem: any) => {
    let sql = `
                        SELECT
                            PURCHASE_MODULE_ID
                            , PURCHASE_MODULE_NAME
                        FROM
                            PURCHASE_MODULE
                        WHERE
                                PURCHASE_MODULE_NAME LIKE '%dataItem.PURCHASE_MODULE_NAME%'
                            AND INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                            PURCHASE_MODULE_NAME
                        LIMIT
                            50 ;
                                                `

    sql = sql.replaceAll('dataItem.PURCHASE_MODULE_NAME', dataItem['PURCHASE_MODULE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
}
