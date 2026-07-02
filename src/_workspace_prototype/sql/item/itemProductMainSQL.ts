// ** SQLFactory

// *** Declare Function SQL

export const ItemProductMainSQL = {
  // *** Function Insert
  createItemProductMain: async (dataItem: any) => {
    let sql = `
                            INSERT INTO ITEM_PRODUCT_MAIN
                            (
                                ITEM_ID
                                , PRODUCT_MAIN_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                            )
                            VALUES
                            (
                                'dataItem.ITEM_ID'
                                , 'dataItem.PRODUCT_MAIN_ID'
                                , 'dataItem.CREATE_BY'
                                ,  CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                            )  ;

                                `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },

  // *** Function Delete
  deleteItemProductMain: async (dataItem: any) => {
    let sql = `    DELETE FROM
                            ITEM_PRODUCT_MAIN
                        WHERE
                                PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                            AND ITEM_ID = 'dataItem.ITEM_ID'
                        `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },

  InsertByItemIdGenKey: async (dataItem: any) => {
    let sql = `            INSERT INTO ITEM_PRODUCT_MAIN
                            (
                                ITEM_ID
                                , PRODUCT_MAIN_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                            )
                            VALUES
                            (
                                @itemId
                                , 'dataItem.PRODUCT_MAIN_ID'
                                , 'dataItem.CREATE_BY'
                                ,  CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                            )                 ;
                                                  `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },

  DeleteByOldProductMainId: async (dataItem: any) => {
    let sql = `            DELETE FROM
                                    ITEM_PRODUCT_MAIN
                                WHERE
                                        PRODUCT_MAIN_ID = 'dataItem.OLD_PRODUCT_MAIN_ID'
                                    AND ITEM_ID = 'dataItem.ITEM_ID' ;
                                                  `

    sql = sql.replaceAll('dataItem.OLD_PRODUCT_MAIN_ID', dataItem['OLD_PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    return sql
  },
}
