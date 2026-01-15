export const ProductMainAccountDepartmentCodeSQL = {
  update: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE
                       SET
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                            , ACCOUNT_DEPARTMENT_CODE_ID = 'dataItem.ACCOUNT_DEPARTMENT_CODE_ID'
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                     WHERE
                              PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID = 'dataItem.PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID'
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID', dataItem['PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  updateByProductMainId: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE
                       SET
                              ACCOUNT_DEPARTMENT_CODE_ID = 'dataItem.ACCOUNT_DEPARTMENT_CODE_ID'
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                     WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  updateInuseByProductMainId: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE
                       SET
                            INUSE = '0'
                     WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  delete: async (dataItem: any) => {
    let sql = ` UPDATE
                        PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE
                    SET
                          INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID = 'dataItem.PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID'
                    `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID', dataItem['PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID'])

    return sql
  },
  createByProductMainId_Variable: async (dataItem: any) => {
    let sql = `

                      INSERT INTO PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE
                              (
                                    PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID
                                  , PRODUCT_MAIN_ID
                                  , ACCOUNT_DEPARTMENT_CODE_ID
                                  , CREATE_BY
                                  , UPDATE_DATE
                                  , UPDATE_BY
                                  , INUSE
                              )
                              SELECT
                                     1 + coalesce((SELECT max(PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID) FROM PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE), 0)
                                  ,  @productMainId
                                  ,  dataItem.ACCOUNT_DEPARTMENT_CODE_ID
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 'dataItem.INUSE'

                `

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  createByProductMainId_VariableByProductMainId: async (dataItem: any) => {
    let sql = `

                      INSERT INTO PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE
                              (
                                    PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID
                                  , PRODUCT_MAIN_ID
                                  , ACCOUNT_DEPARTMENT_CODE_ID
                                  , CREATE_BY
                                  , UPDATE_DATE
                                  , UPDATE_BY
                                  , INUSE
                              )
                              SELECT
                                     1 + coalesce((SELECT max(PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID) FROM PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE), 0)
                                  ,  'dataItem.PRODUCT_MAIN_ID'
                                  ,  dataItem.ACCOUNT_DEPARTMENT_CODE_ID
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 'dataItem.INUSE'

                `

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  deleteByProductMainId: async (dataItem: any) => {
    let sql = ` UPDATE
                        PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE
                    SET
                          INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                        AND INUSE = '1'
                    `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
}
