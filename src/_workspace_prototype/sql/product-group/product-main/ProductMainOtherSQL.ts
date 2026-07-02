export const ProductMainOtherSQL = {
  createByProductMainId_Variable: async (dataItem: any) => {
    let sql = `

                      INSERT INTO PRODUCT_MAIN_OTHER
                              (
                                    PRODUCT_MAIN_OTHER_ID
                                  , PRODUCT_MAIN_ID
                                  , LOC
                                  , POD
                                  , PD
                                  , CREATE_BY
                                  , UPDATE_DATE
                                  , UPDATE_BY
                                  , INUSE
                              )
                              SELECT
                                     1 + coalesce((SELECT max(PRODUCT_MAIN_OTHER_ID) FROM PRODUCT_MAIN_OTHER), 0)
                                  ,  @productMainId
                                  ,  dataItem.LOC
                                  ,  dataItem.POD
                                  ,  dataItem.PD
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 'dataItem.INUSE'

                `

    sql = sql.replaceAll('dataItem.LOC', dataItem['LOC'] == '' ? 'NULL' : "'" + dataItem['LOC'] + "'")
    sql = sql.replaceAll('dataItem.POD', dataItem['POD'] == '' ? 'NULL' : "'" + dataItem['POD'] + "'")
    sql = sql.replaceAll('dataItem.PD', dataItem['PD'] == '' ? 'NULL' : "'" + dataItem['PD'] + "'")

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  createProductMainOtherByProductMainId: async (dataItem: any) => {
    let sql = `

                      INSERT INTO PRODUCT_MAIN_OTHER
                              (
                                    PRODUCT_MAIN_OTHER_ID
                                  , PRODUCT_MAIN_ID
                                  , LOC
                                  , POD
                                  , PD
                                  , CREATE_BY
                                  , UPDATE_DATE
                                  , UPDATE_BY
                                  , INUSE
                              )
                              SELECT
                                     1 + coalesce((SELECT max(PRODUCT_MAIN_OTHER_ID) FROM PRODUCT_MAIN_OTHER), 0)
                                  , 'dataItem.PRODUCT_MAIN_ID'
                                  ,  dataItem.LOC
                                  ,  dataItem.POD
                                  ,  dataItem.PD
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 'dataItem.INUSE'

                `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.LOC', dataItem['LOC'] == '' ? 'NULL' : "'" + dataItem['LOC'] + "'")
    sql = sql.replaceAll('dataItem.POD', dataItem['POD'] == '' ? 'NULL' : "'" + dataItem['POD'] + "'")
    sql = sql.replaceAll('dataItem.PD', dataItem['PD'] == '' ? 'NULL' : "'" + dataItem['PD'] + "'")

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  updateByProductMainId: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_OTHER
                       SET

                              LOC = 'dataItem.LOC'
                            , POD = 'dataItem.POD'
                            , PD = 'dataItem.PD'

                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                     WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.LOC', dataItem['LOC'])
    sql = sql.replaceAll('dataItem.POD', dataItem['POD'])
    sql = sql.replaceAll('dataItem.PD', dataItem['PD'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  updateInuseByProductMainId: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_OTHER
                       SET
                              INUSE = '0'

                     WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.LOC', dataItem['LOC'])
    sql = sql.replaceAll('dataItem.POD', dataItem['POD'])
    sql = sql.replaceAll('dataItem.PD', dataItem['PD'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
