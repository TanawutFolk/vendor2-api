export const ProductMainEnvironmentCertificateSQL = {
  update: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE
                       SET
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                            , ENVIRONMENT_CERTIFICATE_ID = 'dataItem.ENVIRONMENT_CERTIFICATE_ID'
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                     WHERE
                              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID = 'dataItem.PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID'
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID', dataItem['PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.ENVIRONMENT_CERTIFICATE_ID', dataItem['ENVIRONMENT_CERTIFICATE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('MainBoi', sql)
    return sql
  },

  delete: async (dataItem: any) => {
    let sql = ` UPDATE
                        PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE
                    SET
                          INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                       PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID = 'dataItem.PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID'
                    `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID', dataItem['PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID'])

    return sql
  },

  createByProductMainId_Variable: async (dataItem: any) => {
    let sql = `    INSERT INTO PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE
                  (
                        PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID
                      , PRODUCT_MAIN_ID
                      , ENVIRONMENT_CERTIFICATE_ID
                      , IS_NEED
                      , CREATE_BY
                      , UPDATE_DATE
                      , UPDATE_BY
                  )
                      SELECT
                           1 + coalesce((SELECT max(PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE_ID) FROM PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE), 0)
                          ,  @productMainId
                          ,  dataItem.ENVIRONMENT_CERTIFICATE_ID
                          ,  dataItem.IS_NEED
                          , 'dataItem.CREATE_BY'
                          ,  CURRENT_TIMESTAMP()
                          , 'dataItem.UPDATE_BY'

                `
    sql = sql.replaceAll('dataItem.ENVIRONMENT_CERTIFICATE_ID', dataItem['ENVIRONMENT_CERTIFICATE_ID'])
    sql = sql.replaceAll('dataItem.IS_NEED', dataItem['IS_NEED'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['CREATE_BY'])

    return sql
  },
}
