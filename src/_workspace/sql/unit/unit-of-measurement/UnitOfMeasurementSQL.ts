export const UnitOfMeasurementSQL = {
  getUnit: async (dataItem: any) => {
    let sql = `      SELECT  PRODUCT_SUB_ID,
                          , PRODUCT_CATEGORY_ID
                          , PRODUCT_SUB_NAME
                          , PRODUCT_SUB_CODE
                          , PRODUCT_SUB_ALPHABET
                          , INUSE
                          FROM
                          PRODUCT_SUB
                          WHERE
                          PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'
                `

    sql = sql.replaceAll('dataItem.UNIT_OF_MEASUREMENT_ID', dataItem['UNIT_OF_MEASUREMENT_ID'])

    return sql
  },
  getAll: async () => {
    let sql = `       SELECT
                            UNIT_OF_MEASUREMENT_ID
                          , UNIT_OF_MEASUREMENT_NAME
                          , SYMBOL

                      FROM
                          UNIT_OF_MEASUREMENT  ;
                `

    return sql
  },
  searchUnit: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `
                SELECT COUNT(*) AS TOTAL_COUNT
                    FROM(
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
    sql = sql.replaceAll('dataItem.UNIT_OF_MEASUREMENT_NAME', dataItem['UNIT_OF_MEASUREMENT_NAME'])
    sql = sql.replaceAll('dataItem.SYMBOL', dataItem['SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
                                      SELECT
                                        tb_1.UNIT_OF_MEASUREMENT_ID
                                      , tb_1.UNIT_OF_MEASUREMENT_NAME
                                      , tb_1.SYMBOL
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
    sql = sql.replaceAll('dataItem.UNIT_OF_MEASUREMENT_NAME', dataItem['UNIT_OF_MEASUREMENT_NAME'])
    sql = sql.replaceAll('dataItem.SYMBOL', dataItem['SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  createUnit: async (dataItem: any) => {
    let sql = `
                        INSERT INTO UNIT_OF_MEASUREMENT
                        (
                              UNIT_OF_MEASUREMENT_ID
                            , UNIT_OF_MEASUREMENT_NAME
                            , SYMBOL
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                        )
                        SELECT
                                  1 + coalesce((SELECT max(UNIT_OF_MEASUREMENT_ID) FROM UNIT_OF_MEASUREMENT), 0)
                                , 'dataItem.UNIT_OF_MEASUREMENT_NAME'
                                , 'dataItem.SYMBOL'
                                , 'dataItem.CREATE_BY'
                                ,  CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                        FROM
                            DUAL
                        WHERE NOT EXISTS (
                          SELECT
                              1
                          FROM
                              UNIT_OF_MEASUREMENT
                          WHERE
                              (
                                     UNIT_OF_MEASUREMENT_NAME = 'dataItem.UNIT_OF_MEASUREMENT_NAME'
                                  OR SYMBOL = 'dataItem.SYMBOL'
                              )
                              AND INUSE = 1
                        )


                          `

    sql = sql.replaceAll('dataItem.UNIT_OF_MEASUREMENT_NAME', dataItem['UNIT_OF_MEASUREMENT_NAME'])
    sql = sql.replaceAll('dataItem.SYMBOL', dataItem['SYMBOL'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  updateUnit: async (dataItem: any) => {
    let sql = `    UPDATE
                        UNIT_OF_MEASUREMENT
                    SET
                        UNIT_OF_MEASUREMENT_NAME = 'dataItem.UNIT_OF_MEASUREMENT_NAME'
                        , SYMBOL = 'dataItem.SYMBOL'
                        , INUSE = 'dataItem.INUSE'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        UNIT_OF_MEASUREMENT_ID = 'dataItem.UNIT_OF_MEASUREMENT_ID'
                  `

    sql = sql.replaceAll('dataItem.UNIT_OF_MEASUREMENT_ID', dataItem['UNIT_OF_MEASUREMENT_ID'])
    sql = sql.replaceAll('dataItem.UNIT_OF_MEASUREMENT_NAME', dataItem['UNIT_OF_MEASUREMENT_NAME'])
    sql = sql.replaceAll('dataItem.SYMBOL', dataItem['SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteUnit: async (dataItem: any) => {
    let sql = `   UPDATE
                        UNIT_OF_MEASUREMENT
                    SET
                        INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        UNIT_OF_MEASUREMENT_ID = 'dataItem.UNIT_OF_MEASUREMENT_ID'
                  `

    sql = sql.replaceAll('dataItem.UNIT_OF_MEASUREMENT_ID', dataItem['UNIT_OF_MEASUREMENT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getByLikeUnitOfMeasurementName: async (dataItem: any) => {
    let sql = `          SELECT
                                UNIT_OF_MEASUREMENT_ID
                            , UNIT_OF_MEASUREMENT_NAME
                            FROM
                            UNIT_OF_MEASUREMENT
                            WHERE
                                UNIT_OF_MEASUREMENT_NAME LIKE '%dataItem.UNIT_OF_MEASUREMENT_NAME%'
                            AND INUSE LIKE '%dataItem.INUSE%'
                            ORDER BY
                            UNIT_OF_MEASUREMENT_NAME
                            LIMIT
                            50
                                            `

    sql = sql.replaceAll('dataItem.UNIT_OF_MEASUREMENT_NAME', dataItem['UNIT_OF_MEASUREMENT_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  getByLikeSymbol: async (dataItem: any) => {
    let sql = `     SELECT
                        UNIT_OF_MEASUREMENT_ID
                    , SYMBOL
                    FROM
                    UNIT_OF_MEASUREMENT
                    WHERE
                        SYMBOL LIKE '%dataItem.SYMBOL%'
                    AND INUSE LIKE '%dataItem.INUSE%'
                    ORDER BY
                    SYMBOL
                    LIMIT
                    50
                `

    sql = sql.replaceAll('dataItem.SYMBOL', dataItem['SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getUnitOfMeasurementNameByUnitOfMeasurementName: async (dataItem: any) => {
    let sql = `          SELECT
                                UNIT_OF_MEASUREMENT_ID
                            , UNIT_OF_MEASUREMENT_NAME
                            FROM
                            UNIT_OF_MEASUREMENT
                            WHERE
                                UNIT_OF_MEASUREMENT_NAME = 'dataItem.UNIT_OF_MEASUREMENT_NAME'
                            AND INUSE = 1

                                            `

    sql = sql.replaceAll('dataItem.UNIT_OF_MEASUREMENT_NAME', dataItem['UNIT_OF_MEASUREMENT_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  getSymbolBySymbol: async (dataItem: any) => {
    let sql = `     SELECT
                        UNIT_OF_MEASUREMENT_ID
                    , SYMBOL
                    FROM
                    UNIT_OF_MEASUREMENT
                    WHERE
                        SYMBOL = 'dataItem.SYMBOL'
                    AND INUSE = 1

                `

    sql = sql.replaceAll('dataItem.SYMBOL', dataItem['SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
