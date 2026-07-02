export const FlowTypeSQL = {
  // *** Function Get
  getFlowType: async (dataItem: any) => {
    let sql = `     SELECT
                        FLOW_TYPE_ID
                    , FLOW_TYPE_NAME
                    , FLOW_TYPE_ALPHABET
                    , INUSE
                    FROM
                    FLOW_TYPE
                    WHERE
                    FLOW_TYPE_ID = 'dataItem.FLOW_TYPE_ID'
                    `

    sql = sql.replaceAll('dataItem.FLOW_TYPE_ID', dataItem['FLOW_TYPE_ID'])

    return sql
  },

  // *** Function Search
  searchFlowType: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                       (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT`
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.FLOW_TYPE_NAME', dataItem['FLOW_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.FLOW_TYPE_ALPHABET', dataItem['FLOW_TYPE_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
                    SELECT
                    tb_1.FLOW_TYPE_ID
                , tb_1.FLOW_TYPE_NAME
                , tb_1.FLOW_TYPE_ALPHABET
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
    sql = sql.replaceAll('dataItem.FLOW_TYPE_NAME', dataItem['FLOW_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.FLOW_TYPE_ALPHABET', dataItem['FLOW_TYPE_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  createFlowType: async (dataItem: any) => {
    let sql = `
                    INSERT INTO FLOW_TYPE
                    (
                          FLOW_TYPE_ID
                        , FLOW_TYPE_NAME
                        , FLOW_TYPE_ALPHABET
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                        SELECT
                            1 + coalesce((SELECT max(FLOW_TYPE_ID) FROM FLOW_TYPE), 0)
                          , 'dataItem.FLOW_TYPE_NAME'
                          , 'dataItem.FLOW_TYPE_ALPHABET'
                          , 'dataItem.CREATE_BY'
                          ,  CURRENT_TIMESTAMP()
                          , 'dataItem.CREATE_BY'
                        FROM
                          DUAL
                        WHERE NOT EXISTS (
                          SELECT
                                1
                          FROM
                                FLOW_TYPE
                          WHERE
                                (
                                        FLOW_TYPE_NAME = 'dataItem.FLOW_TYPE_NAME'
                                    OR FLOW_TYPE_ALPHABET = 'dataItem.FLOW_TYPE_ALPHABET'
                                )
                                AND INUSE = 1
                        )


                              `

    sql = sql.replaceAll('dataItem.FLOW_TYPE_NAME', dataItem['FLOW_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.FLOW_TYPE_ALPHABET', dataItem['FLOW_TYPE_ALPHABET'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  updateFlowType: async (dataItem: any) => {
    let sql = `    UPDATE
                        FLOW_TYPE
                    SET
                        FLOW_TYPE_NAME = 'dataItem.FLOW_TYPE_NAME'
                        , FLOW_TYPE_ALPHABET = 'dataItem.FLOW_TYPE_ALPHABET'
                        , INUSE = 'dataItem.INUSE'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        FLOW_TYPE_ID = 'dataItem.FLOW_TYPE_ID'
                      `

    sql = sql.replaceAll('dataItem.FLOW_TYPE_ID', dataItem['FLOW_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FLOW_TYPE_NAME', dataItem['FLOW_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.FLOW_TYPE_ALPHABET', dataItem['FLOW_TYPE_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    return sql
  },
  deleteFlowType: async (dataItem: any) => {
    let sql = `    UPDATE
                        FLOW_TYPE
                    SET
                        INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        FLOW_TYPE_ID = 'dataItem.FLOW_TYPE_ID'
                      `

    sql = sql.replaceAll('dataItem.FLOW_TYPE_ID', dataItem['FLOW_TYPE_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getByLikeFlowTypeName: async (dataItem: any) => {
    let sql = `          SELECT
                            FLOW_TYPE_ID
                        , FLOW_TYPE_NAME
                        FROM
                        FLOW_TYPE
                        WHERE
                            FLOW_TYPE_NAME LIKE '%dataItem.FLOW_TYPE_NAME%'
                        AND INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                        FLOW_TYPE_NAME
                        LIMIT
                        50
                                                `

    sql = sql.replaceAll('dataItem.FLOW_TYPE_NAME', dataItem['FLOW_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },

  getByLikeFlowTypeNameCheckDuplicate: async (dataItem: any) => {
    let sql = `          SELECT
                            FLOW_TYPE_ID
                        , FLOW_TYPE_NAME
                        FROM
                        FLOW_TYPE
                        WHERE
                            FLOW_TYPE_NAME LIKE '%dataItem.FLOW_TYPE_NAME%'
                        AND INUSE = 1

                                                `

    sql = sql.replaceAll('dataItem.FLOW_TYPE_NAME', dataItem['FLOW_TYPE_NAME'])
    return sql
  },
  getByLikeFlowTypeAlphabetCheckDuplicate: async (dataItem: any) => {
    let sql = `          SELECT
                            FLOW_TYPE_ID
                        , FLOW_TYPE_ALPHABET
                        FROM
                        FLOW_TYPE
                        WHERE
                            FLOW_TYPE_ALPHABET LIKE '%dataItem.FLOW_TYPE_ALPHABET%'
                        AND INUSE = 1

                                                `

    sql = sql.replaceAll('dataItem.FLOW_TYPE_ALPHABET', dataItem['FLOW_TYPE_ALPHABET'])
    return sql
  },
}
