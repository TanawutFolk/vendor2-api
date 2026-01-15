export const ProductTypeAccountDepartmentCodeSQL = {
  // *** Function Insert
  create: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE
                    (
                          PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE_ID
                        , PRODUCT_TYPE_ID
                        , ACCOUNT_DEPARTMENT_CODE_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                        SELECT
                              1 + coalesce((SELECT max(PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE_ID) FROM PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE), 0)
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , 'dataItem.ACCOUNT_DEPARTMENT_CODE_ID'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
               `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },

  createByProductTypeIdVariable: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE
                    (
                          PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE_ID
                        , PRODUCT_TYPE_ID
                        , ACCOUNT_DEPARTMENT_CODE_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                        SELECT
                              1 + coalesce((SELECT max(PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE_ID) FROM PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE), 0)
                            ,  @productTypeId
                            , 'dataItem.ACCOUNT_DEPARTMENT_CODE_ID'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
               `

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },

  // *** Function update
  update: async (dataItem: any) => {
    let sql = `     UPDATE
                              PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE
                    SET
                              ACCOUNT_DEPARTMENT_CODE_ID = 'dataItem.ACCOUNT_DEPARTMENT_CODE_ID'
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                                PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                            AND INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  updateInuseByProductTypeId: async (dataItem: any) => {
    let sql = `     UPDATE
                              PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE
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
