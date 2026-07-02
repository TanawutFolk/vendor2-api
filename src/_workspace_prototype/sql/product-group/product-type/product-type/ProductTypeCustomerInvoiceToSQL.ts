export const ProductTypeCustomerInvoiceTo = {
  updateProductTypeCustomerInvoiceTo: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_TYPE_CUSTOMER_INVOICE_TO
                            SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                  , CUSTOMER_INVOICE_TO_ID = dataItem.CUSTOMER_INVOICE_TO_ID
                                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                                  , UPDATE_DATE = CURRENT_TIMESTAMP()
                          WHERE
                                  PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID = 'dataItem.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID'
    `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID', dataItem['PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'] != '' ? "'" + dataItem['CUSTOMER_INVOICE_TO_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductTypeCustomerInvoiceTo', sql)
    return sql
  },

  createProductTypeCustomerInvoiceToId: async () => {
    let sql = `  SET @productTypeCustomerInvoiceToId =(1 + coalesce((SELECT max(PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID)
          FROM PRODUCT_TYPE_CUSTOMER_INVOICE_TO), 0)) ; `
    //     //console.log('CreateId', sql)
    return sql
  },
  createProductTypeCustomerInvoiceToForNewType: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_CUSTOMER_INVOICE_TO
                      (
                          PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID
                        , PRODUCT_TYPE_ID
                        , CUSTOMER_INVOICE_TO_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeCustomerInvoiceToId
                            , @productTypeId
                            , dataItem.CUSTOMER_INVOICE_TO_ID
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `

    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'] != '' ? "'" + dataItem['CUSTOMER_INVOICE_TO_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeCustomerInvoiceToForNewType' + sql)
    return sql
  },
  createProductTypeCustomerInvoiceTo: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_CUSTOMER_INVOICE_TO
                      (
                          PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID
                        , PRODUCT_TYPE_ID
                        , CUSTOMER_INVOICE_TO_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                             1 + coalesce((SELECT max(PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID) FROM PRODUCT_TYPE_CUSTOMER_INVOICE_TO), 0)
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , dataItem.CUSTOMER_INVOICE_TO_ID
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'] != '' ? "'" + dataItem['CUSTOMER_INVOICE_TO_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeCustomerInvoiceTo' + sql)
    return sql
  },
  updateInuseByProductTypeId: async (dataItem: any) => {
    let sql = `     UPDATE
                              PRODUCT_TYPE_CUSTOMER_INVOICE_TO
                    SET
                              INUSE = 0
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                                PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                            AND INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
