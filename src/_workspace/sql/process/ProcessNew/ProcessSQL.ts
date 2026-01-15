export const ProcessSQL = {
  getProcess: async (dataItem: any) => {
    let sql = `     SELECT
                        PROCESS_ID,
                    , PROCESS_NAME
                    , PROCESS_CODE
                    , INUSE
                    FROM
                    PROCESS
                    WHERE
                    PROCESS_ID = 'dataItem.PROCESS_ID'
                    `

    sql = sql.replaceAll('dataItem.PROCESS_ID', dataItem['PROCESS_ID'])

    return sql
  },
  searchProcess: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `     SELECT
                            COUNT(*) AS TOTAL_COUNT
                    FROM
                           (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT `

    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])
    sql = sql.replaceAll('dataItem.PROCESS_CODE', dataItem['PROCESS_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
                    SELECT
                                tb_1.PROCESS_ID
                              , tb_1.PROCESS_CODE
                              , tb_1.PROCESS_NAME
                              , tb_1.PRODUCT_MAIN_ID
                              , tb_2.PRODUCT_MAIN_NAME
                              , tb_1.UPDATE_BY
                              , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE

                              , tb_1.INUSE AS INUSE_RAW_DATA
                              , (
                                IF (tb_1.INUSE = 0, 0, IF(
                                  EXISTS
                                        (
                                          SELECT
                                              tbs_1.PROCESS_ID
                                          FROM
                                              FLOW_PROCESS tbs_1
                                          INNER JOIN
                                              FLOW tbs_2
                                          ON
                                              tbs_1.FLOW_ID = tbs_2.FLOW_ID AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1 AND tbs_1.PROCESS_ID = tb_1.PROCESS_ID
                                        ) = TRUE
                                  , 2
                                  , IF(
                                    EXISTS (
                                      SELECT
                                          PROCESS_ID
                                      FROM
                                          FLOW_PROCESS
                                      WHERE
                                          PROCESS_ID = tb_1.PROCESS_ID
                                    ) = TRUE
                                  , 3
                                  , 1
                                  )
                                ))
                              ) AS inuseForSearch
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
    sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])
    sql = sql.replaceAll('dataItem.PROCESS_CODE', dataItem['PROCESS_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  createProcessId: async () => {
    let sql = ' SET @processId=(1 + coalesce((SELECT max(PROCESS_ID) FROM PROCESS), 0)) ; '
    return sql
  },
  // createProcess: async (dataItem:any) => {
  //   let sql = `
  //                   INSERT INTO PROCESS
  //                   (
  //                         PROCESS_ID
  //                       , PROCESS_NAME
  //                       , PRODUCT_MAIN_ID
  //                       , PROCESS_CODE
  //                       , CREATE_BY
  //                       , UPDATE_DATE
  //                       , UPDATE_BY
  //                   )
  //                       SELECT
  //                               @processId
  //                             , 'dataItem.PROCESS_NAME'
  //                             , 'dataItem.PRODUCT_MAIN_ID'
  //                             ,  CONCAT('PCS-dataItem.PRODUCT_MAIN_ALPHABET-', LPAD((COUNT(*) + 1), 4, 0))
  //                             , 'dataItem.CREATE_BY'
  //                             , CURRENT_TIMESTAMP()
  //                             , 'dataItem.CREATE_BY'
  //                       FROM
  //                             PROCESS
  //                       WHERE
  //                             PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
  //             `

  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

  //   sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])
  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])
  //   sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
  //   return sql
  // },
  createProcess: async (dataItem: any) => {
    let sql = `
                INSERT INTO PROCESS
                    (
                          PROCESS_ID
                        , PROCESS_NAME
                        , PRODUCT_MAIN_ID
                        , PROCESS_CODE
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                        , INUSE
                    )
                SELECT
                      @processId
                    , 'dataItem.PROCESS_NAME'
                    , 'dataItem.PRODUCT_MAIN_ID'
                    , CONCAT('PCS-dataItem.PRODUCT_MAIN_ALPHABET-', LPAD((SELECT COUNT(*) FROM PROCESS WHERE PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID') + 1, 4, '0'))
                    , 'S00717'
                    , CURRENT_TIMESTAMP()
                    , 'S00717'
                    , 1
                FROM
                    DUAL
                WHERE NOT EXISTS (
                    SELECT
                          1
                    FROM
                          PROCESS
                    WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                          AND PROCESS_NAME = 'dataItem.PROCESS_NAME'
                          AND INUSE = 1
                );


              `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  updateProcess: async (dataItem: any) => {
    let sql = `    UPDATE
                        PROCESS
                    SET
                        PROCESS_NAME = 'dataItem.PROCESS_NAME'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        PROCESS_ID = 'dataItem.PROCESS_ID'
                      `

    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PROCESS_ID', dataItem['PROCESS_ID'])

    return sql
  },
  deleteProcess: async (dataItem: any) => {
    let sql = `      UPDATE
                            PROCESS
                        SET
                            INUSE = '0'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                            PROCESS_ID = 'dataItem.PROCESS_ID'
                      `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PROCESS_ID', dataItem['PROCESS_ID'])

    return sql
  },
  getByLikeProcessName: async (dataItem: any) => {
    let sql = `           SELECT
                                PROCESS_ID
                            , PROCESS_NAME
                            FROM
                            PROCESS
                            WHERE
                                PROCESS_NAME LIKE '%dataItem.PROCESS_NAME%'
                            AND INUSE LIKE '%dataItem.INUSE%'
                            ORDER BY
                            PROCESS_NAME ASC
                            LIMIT
                                dataItem.Start
                            , dataItem.Limit
                                                `

    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    return sql
  },
  getByLikeProcessNameAndProductMainIdAndInuse: async (dataItem: any) => {
    let sql = `           SELECT
                                    PROCESS_ID
                                  , PROCESS_NAME
                            FROM
                                  PROCESS
                            WHERE
                                      PROCESS_NAME LIKE '%dataItem.PROCESS_NAME%'
                                  AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                  AND INUSE LIKE '%dataItem.INUSE%'

                                                `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  checkProcessNameInProductMain: async (dataItem: any) => {
    let sql = `   SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                          PROCESS
                    WHERE
                              PROCESS_NAME = 'dataItem.PROCESS_NAME'
                          AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                          AND INUSE = 1
                    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])

    return sql
  },
  checkLengthProcessNameInProductMain: async (dataItem: any) => {
    let sql = `   SELECT
                        PROCESS_NAME
                        ,PROCESS_ID
                    FROM
                          PROCESS
                    WHERE
                              PROCESS_NAME = 'dataItem.PROCESS_NAME'
                          AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                          AND INUSE = 1
                    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])

    return sql
  },

  getByLikeProcessNameAndInuse: async (dataItem: any) => {
    let sql = `             SELECT
                                        PROCESS_ID
                                      , PROCESS_NAME
                            FROM
                                      PROCESS
                            WHERE
                                          PROCESS_NAME LIKE '%dataItem.PROCESS_NAME%'
                                      AND INUSE LIKE '%dataItem.INUSE%'
                            ORDER BY
                                      PROCESS_NAME ASC
                            LIMIT
                                        0
                                      , 50
                                                `

    sql = sql.replaceAll('dataItem.PROCESS_NAME', dataItem['PROCESS_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
}
