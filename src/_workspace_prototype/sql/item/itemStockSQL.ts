// ** SQLFactory

// *** Declare Function SQL

export const ItemStockSQL = {
  // *** Function Get
  getItemStock: async (dataItem: any) => {
    let sql = `
                    `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    return sql
  },

  // *** Function Insert
  createItemStockByItemIdVariable: async (dataItem: any) => {
    let sql = `
    INSERT INTO ITEM_STOCK
    (
              ITEM_STOCK_ID
            , ITEM_ID
            , MOQ
            , LEAD_TIME
            , SAFETY_STOCK
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
    )
    SELECT
              1 + coalesce((SELECT max(ITEM_STOCK_ID) FROM ITEM_STOCK), 0)
            ,  @itemId
            , dataItem.MOQ
            , dataItem.LEAD_TIME
            , dataItem.SAFETY_STOCK
            , 'dataItem.CREATE_BY'
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'

            `

    sql = sql.replaceAll('dataItem.MOQ', dataItem['MOQ'] != '' ? dataItem['MOQ'] : 'NULL')
    sql = sql.replaceAll('dataItem.LEAD_TIME', dataItem['LEAD_TIME'] != '' ? dataItem['LEAD_TIME'] : 'NULL')
    sql = sql.replaceAll('dataItem.SAFETY_STOCK', dataItem['SAFETY_STOCK'] != '' ? dataItem['SAFETY_STOCK'] : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },

  // *** Function Insert
  createItemStock: async (dataItem: any) => {
    let sql = `
    INSERT INTO ITEM_STOCK
    (
              ITEM_STOCK_ID
            , ITEM_ID
            , MOQ
            , LEAD_TIME
            , SAFETY_STOCK
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
    )
    SELECT
              1 + coalesce((SELECT max(ITEM_STOCK_ID) FROM ITEM_STOCK), 0)
            , 'dataItem.ITEM_ID'
            , dataItem.MOQ
            , dataItem.LEAD_TIME
            , dataItem.SAFETY_STOCK
            , 'dataItem.CREATE_BY'
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.UPDATE_BY'

            `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    sql = sql.replaceAll('dataItem.MOQ', dataItem['MOQ'] != '' ? dataItem['MOQ'] : 'NULL')
    sql = sql.replaceAll('dataItem.LEAD_TIME', dataItem['LEAD_TIME'] != '' ? dataItem['LEAD_TIME'] : 'NULL')
    sql = sql.replaceAll('dataItem.SAFETY_STOCK', dataItem['SAFETY_STOCK'] != '' ? dataItem['SAFETY_STOCK'] : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  // *** Function update
  updateItemStock: async (dataItem: any) => {
    let sql = `    UPDATE
                        ITEM_STOCK
                   SET
                              WIDTH = dataItem.MOQ
                            , HEIGHT = dataItem.LEAD_TIME
                            , DEPTH = dataItem.SAFETY_STOCK
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                            ITEM_ID = 'dataItem.ITEM_ID'
                      `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    sql = sql.replaceAll('dataItem.MOQ', dataItem['MOQ'] != '' ? dataItem['MOQ'] : 'NULL')
    sql = sql.replaceAll('dataItem.LEAD_TIME', dataItem['LEAD_TIME'] != '' ? dataItem['LEAD_TIME'] : 'NULL')
    sql = sql.replaceAll('dataItem.SAFETY_STOCK', dataItem['SAFETY_STOCK'] != '' ? dataItem['SAFETY_STOCK'] : 'NULL')

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  // *** Function Delete
  deleteItemStock: async (dataItem: any) => {
    let sql = `         UPDATE
                                ITEM_STOCK
                        SET
                                INUSE = '0'
                              , UPDATE_BY = 'dataItem.UPDATE_BY'
                              , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                  ITEM_ID = 'dataItem.ITEM_ID'
                              AND INUSE = '1'
                      `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
