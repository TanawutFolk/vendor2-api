export const ProductTypeProgressWorkingSQL = {
  createByProductTypeId_Variable: async (dataItem: any) => {
    let sql = `
                        INSERT INTO PRODUCT_TYPE_PROGRESS_WORKING
                        (
                              PRODUCT_TYPE_ID
                            , PRODUCT_TYPE_PROGRESS_WORKING_NO
                            , PRODUCT_TYPE_STATUS_PROGRESS_ID
                            , PRODUCT_TYPE_STATUS_WORKING_ID
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                            , INUSE
                        )
                            SELECT
                                    @productTypeId
                                  ,  1 + coalesce((SELECT max(PRODUCT_TYPE_PROGRESS_WORKING_NO) FROM PRODUCT_TYPE_PROGRESS_WORKING WHERE PRODUCT_TYPE_ID = @productTypeId), 0)
                                  , 'dataItem.PRODUCT_TYPE_STATUS_PROGRESS_ID'
                                  , 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.CREATE_BY'
                                  , 'dataItem.INUSE'
                        `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_PROGRESS_ID', dataItem['PRODUCT_TYPE_STATUS_PROGRESS_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  updateInuseByProductTypeId: async (dataItem: any) => {
    let sql = `     UPDATE
                              PRODUCT_TYPE_PROGRESS_WORKING
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
  create: async (dataItem: any) => {
    let sql = `
                        INSERT INTO PRODUCT_TYPE_PROGRESS_WORKING
                        (
                              PRODUCT_TYPE_ID
                            , PRODUCT_TYPE_PROGRESS_WORKING_NO
                            , PRODUCT_TYPE_STATUS_PROGRESS_ID
                            , PRODUCT_TYPE_STATUS_WORKING_ID
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                            , INUSE
                        )
                            SELECT
                                    'dataItem.PRODUCT_TYPE_ID'
                                  ,  1 + coalesce((SELECT max(PRODUCT_TYPE_PROGRESS_WORKING_NO)
                                  FROM PRODUCT_TYPE_PROGRESS_WORKING WHERE PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'), 0)
                                  , 'dataItem.PRODUCT_TYPE_STATUS_PROGRESS_ID'
                                  , 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.CREATE_BY'
                                  , 'dataItem.INUSE'
                        `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_PROGRESS_ID', dataItem['PRODUCT_TYPE_STATUS_PROGRESS_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
}
