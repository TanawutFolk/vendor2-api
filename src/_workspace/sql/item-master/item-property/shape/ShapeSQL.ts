export const ShapeSQL = {
  getItemPropertyShape: async (dataItem: any) => {
    let sql = `     SELECT
                        ITEM_PROPERTY_SHAPE_ID
                    , ITEM_PROPERTY_SHAPE_NAME
                    , INUSE
                    FROM
                    ITEM_PROPERTY_SHAPE
                    WHERE
                    ITEM_PROPERTY_SHAPE_ID = 'dataItem.ITEM_PROPERTY_SHAPE_ID' ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_ID', dataItem['ITEM_PROPERTY_SHAPE_ID'])

    return sql
  },
  getAll: async () => {
    let sql = `     SELECT
                        ITEM_PROPERTY_SHAPE_ID
                      , ITEM_PROPERTY_SHAPE_NAME
                      , INUSE
                    FROM
                      ITEM_PROPERTY_SHAPE   ;
                    `
    return sql
  },
  searchItemPropertyShape: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `   SELECT
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
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_NAME', dataItem['ITEM_PROPERTY_SHAPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
                SELECT
              tb_1.ITEM_PROPERTY_SHAPE_ID
            , tb_1.ITEM_PROPERTY_SHAPE_NAME
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
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_NAME', dataItem['ITEM_PROPERTY_SHAPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  createItemPropertyShape: async (dataItem: any) => {
    let sql = `
                        INSERT INTO ITEM_PROPERTY_SHAPE
                        (
                              ITEM_PROPERTY_SHAPE_ID
                            , ITEM_PROPERTY_SHAPE_NAME
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                        )
                        SELECT
                               1 + coalesce((SELECT max(ITEM_PROPERTY_SHAPE_ID) FROM ITEM_PROPERTY_SHAPE), 0)
                            , 'dataItem.ITEM_PROPERTY_SHAPE_NAME'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                        FROM
                            DUAL
                        WHERE NOT EXISTS (
                          SELECT
                              1
                          FROM
                              ITEM_PROPERTY_SHAPE
                          WHERE
                                  ITEM_PROPERTY_SHAPE_NAME = 'dataItem.ITEM_PROPERTY_SHAPE_NAME'
                              AND INUSE = 1
                        )

              `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_NAME', dataItem['ITEM_PROPERTY_SHAPE_NAME'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  updateItemPropertyShape: async (dataItem: any) => {
    let sql = `     UPDATE
                        ITEM_PROPERTY_SHAPE
                    SET
                          ITEM_PROPERTY_SHAPE_NAME = 'dataItem.ITEM_PROPERTY_SHAPE_NAME'
                        , INUSE = 'dataItem.INUSE'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        ITEM_PROPERTY_SHAPE_ID = 'dataItem.ITEM_PROPERTY_SHAPE_ID'
                      `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_ID', dataItem['ITEM_PROPERTY_SHAPE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_NAME', dataItem['ITEM_PROPERTY_SHAPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteItemPropertyShape: async (dataItem: any) => {
    let sql = `    UPDATE
                        ITEM_PROPERTY_SHAPE
                    SET
                        INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        ITEM_PROPERTY_SHAPE_ID = 'dataItem.ITEM_PROPERTY_SHAPE_ID'
                      `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_ID', dataItem['ITEM_PROPERTY_SHAPE_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getByLikeItemPropertyShapeName: async (dataItem: any) => {
    let sql = `           SELECT
                                ITEM_PROPERTY_SHAPE_ID
                              , ITEM_PROPERTY_SHAPE_NAME
                          FROM
                                ITEM_PROPERTY_SHAPE
                          WHERE
                                ITEM_PROPERTY_SHAPE_NAME LIKE '%dataItem.ITEM_PROPERTY_SHAPE_NAME%'
                                AND INUSE LIKE '%dataItem.INUSE%'
                                ORDER BY
                                ITEM_PROPERTY_SHAPE_NAME
                                LIMIT
                                50 ;
                                                `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_NAME', dataItem['ITEM_PROPERTY_SHAPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getItemPropertyShapeName: async (dataItem: any) => {
    let sql = `           SELECT
                                ITEM_PROPERTY_SHAPE_ID
                              , ITEM_PROPERTY_SHAPE_NAME
                          FROM
                                ITEM_PROPERTY_SHAPE
                          WHERE
                                ITEM_PROPERTY_SHAPE_NAME = 'dataItem.ITEM_PROPERTY_SHAPE_NAME'
                                AND INUSE =1

                                ;
                                                `

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_NAME', dataItem['ITEM_PROPERTY_SHAPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
