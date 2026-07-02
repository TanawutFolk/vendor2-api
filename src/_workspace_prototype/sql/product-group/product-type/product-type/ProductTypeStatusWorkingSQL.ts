export const ProductTypeStatusWorkingSQL = {
  createProductTypeStatusWorkingId: async () => {
    let sql = `  SET @createProductTypeStatusWorkingId =(1 + coalesce((SELECT max(PRODUCT_TYPE_PROGRESS_WORKING_ID)
              FROM PRODUCT_TYPE_PROGRESS_WORKING), 0)) ; `
    //console.log('createProductTypeStatusWorkingId', sql)
    return sql
  },
  createProductTypeStatusWorkingForNewType: async (dataItem: any) => {
    let sql = `
          INSERT INTO PRODUCT_TYPE_PROGRESS_WORKING
            (
                PRODUCT_TYPE_PROGRESS_WORKING_ID
              , PRODUCT_TYPE_ID
              , PRODUCT_TYPE_STATUS_WORKING_ID
              , CREATE_BY
              , UPDATE_DATE
              , UPDATE_BY
            )
              SELECT
                    @createProductTypeStatusWorkingId
                  , @productTypeId
                  , 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'
                  , 'dataItem.CREATE_BY'
                  , CURRENT_TIMESTAMP()
                  , 'dataItem.CREATE_BY'
            `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeStatusWorking', sql)
    return sql
  },
  createProductTypeStatusWorking: async (dataItem: any) => {
    let sql = `
          INSERT INTO PRODUCT_TYPE_PROGRESS_WORKING
            (
                PRODUCT_TYPE_PROGRESS_WORKING_ID
              , PRODUCT_TYPE_ID
              , PRODUCT_TYPE_STATUS_WORKING_ID
              , CREATE_BY
              , UPDATE_DATE
              , UPDATE_BY
            )
              SELECT
                    @createProductTypeStatusWorkingId
                  , 'dataItem.PRODUCT_TYPE_ID'
                  , 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'
                  , 'dataItem.CREATE_BY'
                  , CURRENT_TIMESTAMP()
                  , 'dataItem.CREATE_BY'
            `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeStatusWorking', sql)
    return sql
  },

  updateProductTypeStatusWorking: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_TYPE_PROGRESS_WORKING
                            SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                  , PRODUCT_TYPE_STATUS_WORKING_ID = 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'
                                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                                  , UPDATE_DATE = CURRENT_TIMESTAMP()
                          WHERE
                                  PRODUCT_TYPE_PROGRESS_WORKING_ID = 'dataItem.PRODUCT_TYPE_PROGRESS_WORKING_ID'
    `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_PROGRESS_WORKING_ID', dataItem['PRODUCT_TYPE_PROGRESS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductTypeStatusWorking', sql)
    return sql
  },

  getByLikeProductTypeStatusWorkingNameAndInuse: async (dataItem: any) => {
    let sql = `   SELECT
                            PRODUCT_TYPE_STATUS_WORKING_ID
                          , PRODUCT_TYPE_STATUS_WORKING_NAME
                      FROM
                            PRODUCT_TYPE_STATUS_WORKING
                      WHERE
                            PRODUCT_TYPE_STATUS_WORKING_NAME LIKE '%dataItem.PRODUCT_TYPE_STATUS_WORKING_NAME%'
                        AND INUSE LIKE '%dataItem.INUSE%'
                      ORDER BY
                        PRODUCT_TYPE_STATUS_WORKING_NAME ASC
                      `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_NAME', dataItem['PRODUCT_TYPE_STATUS_WORKING_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('getBy', sql)

    return sql
  },
}
