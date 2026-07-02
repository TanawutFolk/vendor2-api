export const ProductMainLocSQL = {
  createByProductMainId_Variable: async (dataItem: any) => {
    let sql = `INSERT INTO PRODUCT_MAIN_LOC_DETAIL
                              (
                                    PRODUCT_MAIN_LOC_DETAIL_ID
                                  , PRODUCT_MAIN_ID
                                  , LOC_ID
                                  , CREATE_DATE
                                  , CREATE_BY
                                  , UPDATE_DATE
                                  , UPDATE_BY
                                  , INUSE
                              )
                              SELECT
                                     1 + coalesce((SELECT max(PRODUCT_MAIN_LOC_DETAIL_ID) FROM PRODUCT_MAIN_LOC_DETAIL), 0)
                                  ,  @productMainId
                                  ,  dataItem.LOC_ID
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 1`
    sql = sql.replaceAll('dataItem.LOC_ID', dataItem['LOC_ID'] == '' ? 'NULL' : "'" + dataItem['LOC_ID'] + "'")
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('sql', sql)
    return sql
  },

  updateLoc: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_LOC_DETAIL

                       SET    INUSE = 0
                  WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                              AND LOC_ID = 'dataItem.LOC_ID'
                              AND INUSE = 1
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.LOC_ID', dataItem['LOC_ID'])
    // console.log('sql', sql)

    return sql
  },

  updateLocDeleteAll: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN_LOC_DETAIL

                       SET    INUSE = 0
                  WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                              AND INUSE = 1
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.LOC_ID', dataItem['LOC_ID'])
    // console.log('sql', sql)

    return sql
  },

  updateByProductMainId_Variable: async (dataItem: any) => {
    let sql = `INSERT INTO PRODUCT_MAIN_LOC_DETAIL
                              (
                                    PRODUCT_MAIN_LOC_DETAIL_ID
                                  , PRODUCT_MAIN_ID
                                  , LOC_ID
                                  , CREATE_DATE
                                  , CREATE_BY
                                  , UPDATE_DATE
                                  , UPDATE_BY
                                  , INUSE
                              )
                              SELECT
                                     1 + coalesce((SELECT max(PRODUCT_MAIN_LOC_DETAIL_ID) FROM PRODUCT_MAIN_LOC_DETAIL), 0)
                                  ,  dataItem.PRODUCT_MAIN_ID
                                  ,  dataItem.LOC_ID
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 1`
    sql = sql.replaceAll('dataItem.LOC_ID', dataItem['LOC_ID'] == '' ? 'NULL' : "'" + dataItem['LOC_ID'] + "'")
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  createProductMainLocHeaderByProductMainId: async (dataItem: any) => {
    let sql = `INSERT INTO PRODUCT_MAIN_LOC_HEADER
                              (
                                  PRODUCT_MAIN_ID
                                  , TOTAL_COUNT_LOC
                                  , CREATE_DATE
                                  , CREATE_BY
                                  , UPDATE_DATE
                                  , UPDATE_BY
                                  , INUSE
                              )
                              SELECT
                                     @productMainId
                                  ,  dataItem.TOTAL_COUNT_LOC
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 1`
    sql = sql.replaceAll('dataItem.LOC_ID', dataItem['LOC_ID'] == '' ? 'NULL' : "'" + dataItem['LOC_ID'] + "'")
    sql = sql.replaceAll('dataItem.TOTAL_COUNT_LOC', dataItem['TOTAL_COUNT_LOC'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  createProductMainLocHeaderByProductMainIdAfterUpdate: async (dataItem: any) => {
    let sql = `INSERT INTO PRODUCT_MAIN_LOC_HEADER
                              (
                                  PRODUCT_MAIN_ID
                                  , TOTAL_COUNT_LOC
                                  , CREATE_DATE
                                  , CREATE_BY
                                  , UPDATE_DATE
                                  , UPDATE_BY
                                  , INUSE
                              )
                              SELECT
                                     dataItem.PRODUCT_MAIN_ID
                                  ,  dataItem.TOTAL_COUNT_LOC
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 1`
    sql = sql.replaceAll('dataItem.LOC_ID', dataItem['LOC_ID'] == '' ? 'NULL' : "'" + dataItem['LOC_ID'] + "'")
    sql = sql.replaceAll('dataItem.TOTAL_COUNT_LOC', dataItem['TOTAL_COUNT_LOC'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  updateProductMainLocHeaderByProductMainId: async (dataItem: any) => {
    let sql = `UPDATE PRODUCT_MAIN_LOC_HEADER
               SET INUSE = 0,
                   UPDATE_DATE = CURRENT_TIMESTAMP(),
                   UPDATE_BY = 'dataItem.UPDATE_BY'
               WHERE PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID
                       AND INUSE = 1
               `

    sql = sql.replaceAll('dataItem.TOTAL_COUNT_LOC', dataItem['TOTAL_COUNT_LOC'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
