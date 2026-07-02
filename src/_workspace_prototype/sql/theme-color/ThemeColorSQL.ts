export const ThemeColorSQL = {
  getThemeColor: async (dataItem: any) => {
    let sql = `      SELECT
                            COLOR_NAME
                          , COLOR_ID
                          , COLOR_HEX
                      FROM
                          COLOR
                      WHERE
                          COLOR_NAME LIKE '%dataItem.COLOR_NAME%'
                      LIMIT
                          150
                      `

    sql = sql.replaceAll('dataItem.COLOR_NAME', dataItem.COLOR_NAME)
    // console.log(sql)

    return sql
  },
  createThemeColor: async (dataItem: any) => {
    let sql = `
    INSERT INTO ITEM_THEME_COLOR
    (
              ITEM_ID
            , COLOR_ID
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
    )
    VALUES
    (
               @itemId
            , 'dataItem.COLOR_ID'
            , 'dataItem.CREATE_BY'
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'
            ) ;

                              `
    // !!! this value difference from original value
    sql = sql.replaceAll('dataItem.COLOR_ID', dataItem['COLOR_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log('createThemeColor', sql)

    return sql
  },
  createThemeColorByItemId: async (dataItem: any) => {
    let sql = `
    INSERT INTO ITEM_THEME_COLOR
    (
              ITEM_ID
            , COLOR_ID
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
    )
    VALUES
    (
               'dataItem.ITEM_ID'
            , 'dataItem.COLOR_ID'
            , 'dataItem.CREATE_BY'
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'
            ) ;

                              `
    // !!! this value difference from original value
    sql = sql.replaceAll('dataItem.COLOR_ID', dataItem['COLOR_ID'])

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log('createThemeColor', sql)

    return sql
  },
  upDateThemeColor: async (dataItem: any) => {
    let sql = `
                        UPDATE
                                ITEM_THEME_COLOR
                        SET

                                  COLOR_ID = 'dataItem.COLOR_ID'
                                , CREATE_BY = 'dataItem.CREATE_BY'
                                , UPDATE_DATE =  CURRENT_TIMESTAMP()
                                , UPDATE_BY = 'dataItem.CREATE_BY'
                        WHERE
                                ITEM_ID = 'dataItem.ITEM_ID'

                              `
    // !!! this value difference from original value
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.COLOR_ID', dataItem['COLOR_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log('createThemeColor', sql)

    return sql
  },
  deleteThemeColor: async (dataItem: any) => {
    let sql = `         UPDATE
                                ITEM_THEME_COLOR
                        SET
                                INUSE = '0'
                              , UPDATE_BY = 'dataItem.UPDATE_BY'
                              , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                              ITEM_ID = 'dataItem.ITEM_ID' ;
                      `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  create: async (dataItem: any) => {
    let sql = `
    INSERT INTO ITEM_THEME_COLOR
    (
              ITEM_ID
            , COLOR_ID
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
    )
    VALUES
    (
               @itemId
            , 'dataItem.COLOR_ID'
            , 'dataItem.CREATE_BY'
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'
            ) ;

                              `

    // !!! this value difference from original value
    sql = sql.replaceAll('dataItem.COLOR_ID', dataItem['COLOR_ID_FOR_ITEM_THEME'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  getAll: async () => {
    let sql = `      SELECT
                              COLOR_ID
                            , COLOR_NAME
                      FROM
                            COLOR
                      `
    return sql
  },
}
