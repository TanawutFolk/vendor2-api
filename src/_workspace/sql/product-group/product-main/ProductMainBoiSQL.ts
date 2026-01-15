export const ProductMainBoiSQL = {
  update: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_BOI
                       SET
                              NON_BOI = 'dataItem.NON_BOI'
                            , BOI_PROJECT_ID = dataItem.BOI_PROJECT_ID
                            , PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                     WHERE
                              PRODUCT_MAIN_BOI_ID = 'dataItem.PRODUCT_MAIN_BOI_ID'
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_BOI_ID', dataItem['PRODUCT_MAIN_BOI_ID'])
    sql = sql.replaceAll('dataItem.NON_BOI', dataItem['NON_BOI'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'] != '' ? "'" + dataItem['BOI_PROJECT_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('MainBoi', sql)
    return sql
  },
  updateByProductMainId: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_BOI
                       SET
                              IS_BOI = 'dataItem.IS_BOI'
                            , BOI_PROJECT_ID = dataItem.BOI_PROJECT_ID

                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                     WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
    `

    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'] != '' ? "'" + dataItem['BOI_PROJECT_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('MainBoi', sql)
    return sql
  },
  updateInuseByProductMainId: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_BOI
                       SET
                             INUSE = '0'

                     WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
    `

    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'] != '' ? "'" + dataItem['BOI_PROJECT_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('MainBoi', sql)
    return sql
  },
  delete: async (dataItem: any) => {
    let sql = ` UPDATE
                        PRODUCT_MAIN_BOI
                    SET
                          INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        PRODUCT_MAIN_BOI_ID = 'dataItem.PRODUCT_MAIN_BOI_ID'
                    `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_BOI_ID', dataItem['PRODUCT_MAIN_BOI_ID'])
    // console.log('mainBoi', sql)

    return sql
  },
  createByProductMainId_Variable: async (dataItem: any) => {
    let sql = `    INSERT INTO PRODUCT_MAIN_BOI
                  (
                        PRODUCT_MAIN_BOI_ID
                      , PRODUCT_MAIN_ID
                      , IS_BOI
                      , BOI_PROJECT_ID
                      , CREATE_BY
                      , UPDATE_DATE
                      , UPDATE_BY
                      , INUSE
                  )
                      SELECT
                           1 + coalesce((SELECT max(PRODUCT_MAIN_BOI_ID) FROM PRODUCT_MAIN_BOI), 0)
                          ,  @productMainId
                          ,  dataItem.IS_BOI
                          ,  dataItem.BOI_PROJECT_ID
                          , 'dataItem.CREATE_BY'
                          ,  CURRENT_TIMESTAMP()
                          , 'dataItem.UPDATE_BY'
                          , 'dataItem.INUSE'

                `
    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'] != '' ? "'" + dataItem['IS_BOI'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'] != '' ? "'" + dataItem['BOI_PROJECT_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log(sql)

    return sql
  },
  createProductMainBoiByProductMainId: async (dataItem: any) => {
    let sql = `    INSERT INTO PRODUCT_MAIN_BOI
                  (
                        PRODUCT_MAIN_BOI_ID
                      , PRODUCT_MAIN_ID
                      , IS_BOI
                      , BOI_PROJECT_ID
                      , CREATE_BY
                      , UPDATE_DATE
                      , UPDATE_BY
                      , INUSE
                  )
                      SELECT
                           1 + coalesce((SELECT max(PRODUCT_MAIN_BOI_ID) FROM PRODUCT_MAIN_BOI), 0)
                          ,  'dataItem.PRODUCT_MAIN_ID'
                          ,  dataItem.IS_BOI
                          ,  dataItem.BOI_PROJECT_ID
                          , 'dataItem.CREATE_BY'
                          ,  CURRENT_TIMESTAMP()
                          , 'dataItem.UPDATE_BY'
                          , 'dataItem.INUSE'

                `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'] != '' ? "'" + dataItem['IS_BOI'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'] != '' ? "'" + dataItem['BOI_PROJECT_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log(sql)

    return sql
  },
  deleteByProductMainId: async (dataItem: any) => {
    let sql = ` UPDATE
                        PRODUCT_MAIN_BOI
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
