export const MakerSQL = {
  getMaker: async (dataItem: any) => {
    let sql = `       SELECT
                          MAKER_ID
                        , MAKER_NAME
                        , INUSE
                      FROM
                          MAKER
                          WHERE
                          MAKER_ID = 'dataItem.MAKER_ID'
                    `

    sql = sql.replaceAll('dataItem.MAKER_ID', dataItem['MAKER_ID'])

    return sql
  },
  getAll: async () => {
    let sql = `       SELECT
                          MAKER_ID
                        , MAKER_NAME
                        , INUSE
                      FROM
                          MAKER ;
                    `

    return sql
  },
  searchMaker: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `    SELECT
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
    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
                    SELECT
                  tb_1.MAKER_ID
                , tb_1.MAKER_NAME
                , tb_1.UPDATE_BY
                , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                , tb_1.INUSE inuseForSearch
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
    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  createMaker: async (dataItem: any) => {
    let sql = `
                    INSERT INTO MAKER
                    (
                          MAKER_ID
                        , MAKER_NAME
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                    SELECT
                           1 + coalesce((SELECT max(MAKER_ID) FROM MAKER), 0)
                        , 'dataItem.MAKER_NAME'
                        , 'dataItem.CREATE_BY'
                        ,  CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'
                    FROM
                        DUAL
                    WHERE NOT EXISTS (
                      SELECT
                            1
                      FROM
                            MAKER
                      WHERE
                               MAKER_NAME = 'dataItem.MAKER_NAME'
                           AND INUSE = 1
                    )

               `

    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  updateMaker: async (dataItem: any) => {
    let sql = `    UPDATE
                        MAKER
                    SET
                        MAKER_NAME = 'dataItem.MAKER_NAME'
                        , INUSE = 'dataItem.INUSE'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        MAKER_ID = 'dataItem.MAKER_ID'
                      `

    sql = sql.replaceAll('dataItem.MAKER_ID', dataItem['MAKER_ID'])
    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    return sql
  },
  deleteMaker: async (dataItem: any) => {
    let sql = `    UPDATE
                        MAKER
                    SET
                        INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        MAKER_ID = 'dataItem.MAKER_ID'
                      `

    sql = sql.replaceAll('dataItem.MAKER_ID', dataItem['MAKER_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getByLikeMakerNameAndInuse: async (dataItem: any) => {
    let sql = `            SELECT
                                MAKER_ID
                            , MAKER_NAME
                            FROM
                            MAKER
                            WHERE
                                MAKER_NAME LIKE '%dataItem.MAKER_NAME%'
                            AND INUSE LIKE '%dataItem.INUSE%'
                            ORDER BY
                            MAKER_NAME
                            LIMIT
                            50
                                                `

    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  getMakerNameAndInuse: async (dataItem: any) => {
    let sql = `            SELECT
                                MAKER_ID
                            , MAKER_NAME
                            FROM
                            MAKER
                            WHERE
                                MAKER_NAME = 'dataItem.MAKER_NAME'
                            AND INUSE = 1

                                                `

    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
}
