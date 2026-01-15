export const ColorSQL = {
  getItemPropertyColor: async (dataItem: any) => {
    let sql = `       SELECT
                            ITEM_PROPERTY_COLOR_ID
                        , ITEM_PROPERTY_COLOR_NAME
                        , INUSE
                        FROM
                        ITEM_PROPERTY_COLOR
                        WHERE
                        ITEM_PROPERTY_COLOR_ID = 'dataItem.ITEM_PROPERTY_COLOR_ID'
                    `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_ID', dataItem['ITEM_PROPERTY_COLOR_ID'])

    return sql
  },
  getAll: async () => {
    let sql = `       SELECT
                          ITEM_PROPERTY_COLOR_ID
                        , ITEM_PROPERTY_COLOR_NAME
                        , INUSE
                      FROM
                          ITEM_PROPERTY_COLOR ;
                    `
    return sql
  },
  searchItemPropertyColor: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `  SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM (
                        SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT
                        `
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_NAME', dataItem['ITEM_PROPERTY_COLOR_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
            SELECT
          tb_1.ITEM_PROPERTY_COLOR_ID
        , tb_1.ITEM_PROPERTY_COLOR_NAME
        , tb_1.UPDATE_BY
        , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
        , tb_1.INUSE as inuseForSearch
              FROM
                  dataItem.sqlJoin
                  dataItem.sqlWhere
                  dataItem.sqlHaving
        ORDER BY
        dataItem.Order
        LIMIT
            dataItem.Start
        , dataItem.Limit
            `
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_NAME', dataItem['PRODUCTION_PURPOSE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_ALPHABET', dataItem['PRODUCTION_PURPOSE_ALPHABET'])
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_NAME', dataItem['ITEM_PROPERTY_COLOR_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  createItemPropertyColor: async (dataItem: any) => {
    let sql = `
                        INSERT INTO ITEM_PROPERTY_COLOR
                        (
                              ITEM_PROPERTY_COLOR_ID
                            , ITEM_PROPERTY_COLOR_NAME
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                        )
                        SELECT
                               1 + coalesce((SELECT max(ITEM_PROPERTY_COLOR_ID) FROM ITEM_PROPERTY_COLOR), 0)
                            , 'dataItem.ITEM_PROPERTY_COLOR_NAME'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                        FROM
                            DUAL
                        WHERE NOT EXISTS (
                          SELECT
                              1
                          FROM
                              ITEM_PROPERTY_COLOR
                          WHERE
                                  ITEM_PROPERTY_COLOR_NAME = 'dataItem.ITEM_PROPERTY_COLOR_NAME'
                              AND INUSE = '1'
                        )


                              `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_NAME', dataItem['ITEM_PROPERTY_COLOR_NAME'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  updateItemPropertyColor: async (dataItem: any) => {
    let sql = `     UPDATE
                        ITEM_PROPERTY_COLOR
                    SET
                        ITEM_PROPERTY_COLOR_NAME = 'dataItem.ITEM_PROPERTY_COLOR_NAME'
                        , INUSE = 'dataItem.INUSE'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        ITEM_PROPERTY_COLOR_ID = 'dataItem.ITEM_PROPERTY_COLOR_ID'
                      `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_ID', dataItem['ITEM_PROPERTY_COLOR_ID'])
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_NAME', dataItem['ITEM_PROPERTY_COLOR_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    return sql
  },
  deleteItemPropertyColor: async (dataItem: any) => {
    let sql = `     UPDATE
                            ITEM_PROPERTY_COLOR
                        SET
                            INUSE = '0'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                            ITEM_PROPERTY_COLOR_ID = 'dataItem.ITEM_PROPERTY_COLOR_ID'
                      `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_ID', dataItem['ITEM_PROPERTY_COLOR_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getByLikeItemPropertyColorName: async (dataItem: any) => {
    let sql = `            SELECT
                                ITEM_PROPERTY_COLOR_ID
                            , ITEM_PROPERTY_COLOR_NAME
                            FROM
                            ITEM_PROPERTY_COLOR
                            WHERE
                                ITEM_PROPERTY_COLOR_NAME LIKE '%dataItem.ITEM_PROPERTY_COLOR_NAME%'
                            AND INUSE LIKE '%dataItem.INUSE%'
                            ORDER BY
                            ITEM_PROPERTY_COLOR_NAME
                            LIMIT
                            50
                                                `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_NAME', dataItem['ITEM_PROPERTY_COLOR_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  getItemPropertyColorName: async (dataItem: any) => {
    let sql = `            SELECT
                                ITEM_PROPERTY_COLOR_ID
                            , ITEM_PROPERTY_COLOR_NAME
                            FROM
                            ITEM_PROPERTY_COLOR
                            WHERE
                                ITEM_PROPERTY_COLOR_NAME = 'dataItem.ITEM_PROPERTY_COLOR_NAME'
                            AND INUSE =1

                                                `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_NAME', dataItem['ITEM_PROPERTY_COLOR_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
}
