export const FlowSQL = {
  // getByLikeFlowNameAndProductMainIdAndInuse: async (dataItem : any) => {
  //   let sql = `      SELECT
  //                           tb_1.FLOW_ID
  //                         , tb_1.FLOW_NAME
  //                         , tb_1.FLOW_CODE
  //                       FROM
  //                         FLOW tb_1
  //                             INNER JOIN
  //                         PRODUCT_MAIN tb_2
  //                             ON (tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID' ) = tb_2.PRODUCT_MAIN_ID
  //                       WHERE
  //                             tb_1.FLOW_NAME LIKE '%dataItem.FLOW_NAME%'
  //                         AND tb_1.INUSE LIKE '%dataItem.INUSE%'
  //                       ORDER BY
  //                         tb_1.PRODUCT_SUB_NAME ASC
  //                       LIMIT
  //                         50
  //             `

  //   sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] ? dataItem['PRODUCT_MAIN_ID'] : '')
  //   sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] ? dataItem['INUSE'] : '')
  //   console.log('getByLikeProductSubNameAndProductMainIdAndInuse', sql)
  //   return sql
  // },

  getByLikeFlowNameAndInuse: async (dataItem: any) => {
    let sql = `   SELECT
                            FLOW_ID
                          , FLOW_NAME
                          , FLOW_CODE
                      FROM
                            FLOW
                      WHERE
                            FLOW_NAME LIKE '%dataItem.FLOW_NAME%'
                        AND INUSE LIKE '%dataItem.INUSE%'
                      ORDER BY
                        FLOW_NAME ASC
                      LIMIT
                        50
                      `

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('getBy', sql)
    return sql
  },
  checkFlowName: async (dataItem: any) => {
    let sql = `   SELECT
                          COUNT(*) AS TOTAL_COUNT
                      FROM
                            FLOW
                      WHERE
                            FLOW_NAME = 'dataItem.FLOW_NAME'
                        AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                        AND INUSE = 1
                        ${dataItem['FLOW_ID'] ? " AND FLOW_ID != 'dataItem.FLOW_ID'" : ''}
                      `

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'] || dataItem['PROCESS_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

    return sql
  },

  createFlowByCreatedProcess: async (dataItem: any) => {
    let sql = `
      INSERT INTO FLOW
      (
            FLOW_ID
          , FLOW_NAME
          , FLOW_CODE
          , FLOW_TYPE_ID
          , PRODUCT_MAIN_ID
          , TOTAL_COUNT_PROCESS
          , CREATE_BY
          , UPDATE_DATE
          , UPDATE_BY
      )
              SELECT
                      @flowId
                   , 'dataItem.FLOW_NAME'
                   , CONCAT('F','N','-','dataItem.PRODUCT_MAIN_ALPHABET','-', LPAD((SELECT COUNT(*) FROM FLOW WHERE PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID') + 1, 4, 0))
                   , 1
                   , 'dataItem.PRODUCT_MAIN_ID'
                   , 1
                   , 'dataItem.CREATE_BY'
                   , CURRENT_TIMESTAMP()
                   , 'dataItem.CREATE_BY'
              FROM
                   DUAL
              WHERE NOT EXISTS (
                   SELECT
                         1
                   FROM
                         FLOW
                   WHERE
                             PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                         AND FLOW_NAME = 'dataItem.FLOW_NAME'
                         AND INUSE = 1
               );

                              `

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['PROCESS_NAME'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  CreateFlowId: async () => {
    let sql = ' SET @flowId=(1 + coalesce((SELECT max(FLOW_ID) FROM FLOW), 0)) ;'

    return sql
  },
  // checkFlowProcessExist: async (dataItems: { NO: number; PROCESS_ID: number }[]) => {
  //   const list = Array.isArray(dataItems) ? dataItems : [dataItems]
  //   if (!list.length) return []

  //   const totalCount = list.length
  //   const placeholders = list.map(() => '(?, ?)').join(', ')
  //   const values = list.flatMap((item) => [item.NO, item.PROCESS_ID])

  //   const sql: string = `
  //   SELECT
  //     tb_1.FLOW_ID,
  //     tb_2.FLOW_NAME
  //   FROM
  //     FLOW_PROCESS tb_1
  //   JOIN
  //     FLOW tb_2 ON tb_1.FLOW_ID = tb_2.FLOW_ID
  //   WHERE
  //     tb_1.INUSE = 1
  //     AND tb_2.TOTAL_COUNT_PROCESS = ?
  //     AND (tb_1.NO, tb_1.PROCESS_ID) IN (${placeholders})
  // `

  //   const params: any = [totalCount, ...values]
  //   const resultData = await MySQLExecute.execute(sql, params)
  //   return resultData
  // },

  //! ของฟลุ้ค -----------------------------------------------------
  checkFlowProcessExist: async (dataItem: any) => {
    // let sql = `
    //           SELECT
    //             FLOW_ID
    //           FROM
    //             FLOW_PROCESS
    //           WHERE
    //                 NO = 'dataItem.NO'
    //             AND PROCESS_ID = 'dataItem.PROCESS_ID'
    //             AND INUSE = 1
    //             AND FLOW_ID NOT IN (
    //               SELECT
    //                 FLOW_ID
    //               FROM
    //                 BOM_TEMPORARY tb_1
    //               JOIN
    //                 BOM tb_2
    //               ON
    //                 tb_1.BOM_ID = tb_2.BOM_ID
    //             )
    //           `

    let sql = `
                SELECT
                  tb_1.FLOW_ID
                FROM
                  FLOW_PROCESS tb_1
                JOIN
                  FLOW tb_2
                ON
                  tb_1.FLOW_ID = tb_2.FLOW_ID
                WHERE
                      tb_1.NO = 'dataItem.NO'
                  AND tb_1.PROCESS_ID = 'dataItem.PROCESS_ID'
                  AND tb_1.INUSE = 1
                  AND tb_2.TOTAL_COUNT_PROCESS = 'dataItem.length'

                `

    sql = sql.replaceAll('dataItem.NO', dataItem['NO'])
    sql = sql.replaceAll('dataItem.PROCESS_ID', dataItem['PROCESS_ID'])
    sql = sql.replaceAll('dataItem.length', dataItem['length'])
    // console.log(sql)

    return sql
  },
  getFlow: async (dataItem: any) => {
    let sql = `      SELECT
                            FLOW_ID
                          , FLOW_NAME
                          , FLOW_CODE
                          , INUSE
                        FROM
                          FLOW
                        WHERE
                          FLOW_ID = 'dataItem.FLOW_ID'
                    `

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

    return sql
  },
  // searchFlow: async (dataItem: any) => {
  //   let sqlList: any = []

  //   let sql = `    SELECT
  //                             COUNT(*) AS TOTAL_COUNT
  //                     FROM
  //                           (
  //                   SELECT
  //                           dataItem.selectInuseForSearch
  //                   FROM
  //                           dataItem.sqlJoin
  //                           dataItem.sqlWhere
  //                           dataItem.sqlHaving

  //                   )  AS TB_COUNT
  //                     `

  //   sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
  //   sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

  //   sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
  //   sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
  //   sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])

  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

  //   sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
  //   sql = sql.replaceAll('dataItem.FLOW_CODE', dataItem['FLOW_CODE'])

  //   sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //   sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

  //   sqlList.push(sql)

  //   sql = `
  //                 SELECT
  //                                 tb_1.FLOW_ID
  //                               , tb_1.FLOW_CODE
  //                               , tb_1.FLOW_NAME
  //                               , tb_1.FLOW_TYPE_ID
  //                               , tb_1.TOTAL_COUNT_PROCESS
  //                               , tb_1.UPDATE_BY
  //                               , tb_1.PRODUCT_MAIN_ID
  //                               , tb_2.PRODUCT_MAIN_NAME
  //                               , tb_2.PRODUCT_MAIN_ALPHABET
  //                               , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
  //                               , IF (EXISTS(SELECT FLOW_ID from BOM WHERE FLOW_ID =tb_1.FLOW_ID AND INUSE = 1 LIMIT 1) = 1 , 2 , tb_1.INUSE) AS inuseForSearch
  //                               , tb_1.INUSE AS INUSE_RAW_DATA
  //                               , (
  //                                 IF(
  //                                   EXISTS(
  //                                     SELECT
  //                                       FLOW_ID
  //                                     FROM
  //                                       BOM tb_101
  //                                     JOIN
  //                                       BOM_TEMPORARY tb_102
  //                                     ON
  //                                       tb_101.BOM_ID = tb_102.BOM_ID
  //                                     WHERE
  //                                       tb_101.FLOW_ID = tb_1.FLOW_ID
  //                                   )
  //                                   , 1
  //                                   , 0
  //                                 )
  //                               ) AS IS_DRAFT
  //                   FROM
  //                                dataItem.sqlJoin
  //                         dataItem.sqlWhere
  //                         dataItem.sqlHaving

  //                   ORDER BY
  //                               dataItem.Order
  //                   LIMIT
  //                                 dataItem.Start
  //                               , dataItem.Limit
  //           `

  //   sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
  //   sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
  //   sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
  //   sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])

  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

  //   sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
  //   sql = sql.replaceAll('dataItem.FLOW_CODE', dataItem['FLOW_CODE'])
  //   sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //   sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //   sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
  //   sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
  //   sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
  //   sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
  //   sqlList.push(sql)

  //   sqlList = sqlList.join(';')

  //   return sqlList
  // },
  searchFlow: async (dataItem: any, sqlWhere: any, sqlJoin: any, sqlSelect: any) => {
    let sqlList: any = []

    let sql = `    SELECT
                              COUNT(*) AS TOTAL_COUNT
                      FROM
                              FLOW tb_1
                                        INNER JOIN
                              PRODUCT_MAIN tb_2
                                        ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
                                        INNER JOIN
                              PRODUCT_CATEGORY tb_3
                                        ON tb_2.PRODUCT_CATEGORY_ID = tb_3.PRODUCT_CATEGORY_ID
                              dataItem.sqlJoin
                      WHERE
                                  tb_1.FLOW_NAME LIKE '%dataItem.FLOW_NAME%'
                              AND tb_1.FLOW_CODE LIKE '%dataItem.FLOW_CODE%'

                              dataItem.sqlWhere
                              sqlWhereColumnFilter
                      `

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.sqlJoin', sqlJoin)

    sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.FLOW_CODE', dataItem['FLOW_CODE'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
                  SELECT
                                  tb_1.FLOW_ID
                                , tb_1.FLOW_CODE
                                , tb_1.FLOW_NAME
                                , tb_1.FLOW_TYPE_ID
                                , tb_1.TOTAL_COUNT_PROCESS
                                , tb_1.UPDATE_BY
                                , tb_1.PRODUCT_MAIN_ID
                                , tb_2.PRODUCT_MAIN_NAME
                                , tb_2.PRODUCT_MAIN_ALPHABET
                                , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                , IF (EXISTS(SELECT FLOW_ID from BOM WHERE FLOW_ID =tb_1.FLOW_ID AND INUSE = 1 LIMIT 1) = 1 , 2 , tb_1.INUSE) AS inuseForSearch
                                , tb_1.INUSE AS INUSE_RAW_DATA
                                , (
                                  IF(
                                    EXISTS(
                                      SELECT
                                        FLOW_ID
                                      FROM
                                        BOM tb_101
                                      JOIN
                                        BOM_TEMPORARY tb_102
                                      ON
                                        tb_101.BOM_ID = tb_102.BOM_ID
                                      WHERE
                                        tb_101.FLOW_ID = tb_1.FLOW_ID
                                    )
                                    , 1
                                    , 0
                                  )
                                ) AS IS_DRAFT
                                dataItem.sqlSelect
                    FROM
                                FLOW tb_1
                                    INNER JOIN
                                PRODUCT_MAIN tb_2
                                    ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
                                    INNER JOIN
                                PRODUCT_CATEGORY tb_3
                                    ON tb_2.PRODUCT_CATEGORY_ID = tb_3.PRODUCT_CATEGORY_ID
                                dataItem.sqlJoin
                    WHERE
                                    tb_1.FLOW_NAME LIKE '%dataItem.FLOW_NAME%'
                                AND tb_1.FLOW_CODE LIKE '%dataItem.FLOW_CODE%'

                                dataItem.sqlWhere
                                sqlWhereColumnFilter

                    ORDER BY
                                dataItem.Order
                    LIMIT
                                  dataItem.Start
                                , dataItem.Limit
            `

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.sqlJoin', sqlJoin)
    sql = sql.replaceAll('dataItem.sqlSelect', sqlSelect)

    sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.FLOW_CODE', dataItem['FLOW_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)
    // console.log(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  createFlow: async (dataItem: any) => {
    let sql = `
      INSERT INTO FLOW
      (
            FLOW_ID
          , FLOW_NAME
          , FLOW_CODE
          , FLOW_TYPE_ID
          , PRODUCT_MAIN_ID
          , TOTAL_COUNT_PROCESS
          , CREATE_BY
          , UPDATE_DATE
          , UPDATE_BY
      )
          SELECT
                  @flowId
               , 'dataItem.FLOW_NAME'
               , CONCAT('F', 'N','dataItem.FLOW_ALPHABET','-',
               'dataItem.PRODUCT_MAIN_ALPHABET','-', LPAD((SELECT COUNT(*) FROM FLOW WHERE PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID') + 1, 4, 0))
               , 1
               , 'dataItem.PRODUCT_MAIN_ID'
               , 'dataItem.TOTAL_COUNT_PROCESS'
               , 'dataItem.CREATE_BY'
               , CURRENT_TIMESTAMP()
               , 'dataItem.CREATE_BY'
          FROM
               DUAL
          WHERE NOT EXISTS (
               SELECT
                     1
               FROM
                     FLOW
               WHERE
                         PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                     AND FLOW_NAME = 'dataItem.FLOW_NAME'
                     AND INUSE = 1
          );

      SELECT @flowId AS FLOW_ID;`

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])

    sql = sql.replaceAll('dataItem.FLOW_ALPHABET', dataItem['FLOW_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])
    sql = sql.replaceAll('dataItem.FLOW_TYPE_ID', dataItem['FLOW_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.TOTAL_COUNT_PROCESS', dataItem['TOTAL_COUNT_PROCESS'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  updateFlow: async (dataItem: any) => {
    let sql = `    UPDATE
                          FLOW
                      SET
                            FLOW_NAME = 'dataItem.FLOW_NAME'
                          , TOTAL_COUNT_PROCESS = 'dataItem.TOTAL_COUNT_PROCESS'
                          , INUSE = 'dataItem.INUSE'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                      WHERE
                          FLOW_ID = 'dataItem.FLOW_ID' ;
                      `

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.TOTAL_COUNT_PROCESS', dataItem['TOTAL_COUNT_PROCESS'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    return sql
  },

  updateFlowNameByFlowId: async (dataItem: any) => {
    let sql = `    UPDATE
                          FLOW
                      SET
                            FLOW_NAME = 'dataItem.FLOW_NAME'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                      WHERE
                          FLOW_ID = 'dataItem.FLOW_ID' ;
                      `

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    return sql
  },
  deleteFlow: async (dataItem: any) => {
    let sql = `     UPDATE
                            FLOW
                        SET
                              INUSE = '0'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                            FLOW_ID = 'dataItem.FLOW_ID'
                      `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

    return sql
  },
  getByLikeFlowName: async (dataItem: any) => {
    let sql = `            SELECT
                                      FLOW_ID
                                    , FLOW_NAME
                                  FROM
                                    FLOW
                                  WHERE
                                    FLOW_NAME LIKE '%dataItem.FLOW_NAME%'
                                  ORDER BY
                                    FLOW_NAME ASC
                                  LIMIT
                                    50
                                                `

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])

    return sql
  },
  getFlowNameDuplicate: async (dataItem: any) => {
    let sql = `            SELECT
                                      FLOW_ID
                                    , FLOW_NAME
                                  FROM
                                    FLOW
                                  WHERE
                                    FLOW_NAME = 'dataItem.FLOW_NAME'
                                    AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                    AND INUSE = 1


                                                `

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  searchByProductMainId: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        FLOW tb_1
                    WHERE
                        tb_1.FLOW_NAME LIKE '%dataItem.FLOW_NAME%'
                    AND tb_1.FLOW_CODE LIKE '%dataItem.FLOW_CODE%'
                    AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                    AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID' `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.FLOW_CODE', dataItem['FLOW_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = `
                        SELECT
                        tb_1.FLOW_ID
                      , tb_1.FLOW_CODE
                      , tb_1.FLOW_NAME
                      , tb_1.TOTAL_COUNT_PROCESS
                      , tb_1.UPDATE_BY
                      , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS MODIFIED_DATE
                      , tb_1.INUSE
                    FROM
                      FLOW tb_1
                    WHERE
                          tb_1.FLOW_NAME LIKE '%dataItem.FLOW_NAME%'
                      AND tb_1.FLOW_CODE LIKE '%dataItem.FLOW_CODE%'
                      AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                      AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                    ORDER BY
                      dataItem.Order
                    LIMIT
                        dataItem.Start
                      , dataItem.Limit
            `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.FLOW_CODE', dataItem['FLOW_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  getByLikeFlowCodeAndInuseAndStandardCostActive: async (dataItem: any) => {
    let sql = `
      SELECT
            tb_5.FLOW_ID,
            tb_5.FLOW_NAME,
            tb_5.FLOW_CODE

      FROM
                SCT tb_1
      INNER JOIN
                SCT_WORKING_PROGRESS tb_2 ON tb_1.SCT_ID = tb_2.SCT_ID
      INNER JOIN
                SCT_BOM tb_3 ON tb_1.SCT_ID = tb_3.SCT_ID
      INNER JOIN
                BOM tb_4 ON tb_3.BOM_ID = tb_4.BOM_ID
      INNER JOIN
                FLOW tb_5 ON tb_4.FLOW_ID = tb_5.FLOW_ID
      INNER JOIN
                PRODUCT_TYPE tb_6 ON tb_6.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID

      WHERE
       tb_1.SCT_ID IN (
            SELECT
                  tb_1.SCT_ID
            FROM
                  SCT tb_1
            INNER JOIN SCT_REASON_CODE tb_2 ON tb_1.SCT_REASON_CODE_ID = tb_2.SCT_REASON_CODE_ID
            INNER JOIN sct_working_progress tb_3 ON tb_1.SCT_ID = tb_3.SCT_ID
            INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
      WHERE
      tb_1.INUSE = 1
      AND tb_3.TOTAL_WORKING_PROGRESS_PERCENT = 100
      AND tb_2.CAN_INPUT_TO_PRODUCTION_LINE = 1
      AND NOW() BETWEEN tb_1.EFFECTIVE_DATE
      AND tb_1.EXPIRATION_DATE
      AND tb_1.CREATE_DATE <= NOW()
      )

      AND tb_2.TOTAL_WORKING_PROGRESS_PERCENT = 100
      AND tb_5.FLOW_CODE LIKE '%dataItem.FLOW_CODE%'
      GROUP BY tb_5.FLOW_ID, tb_5.FLOW_CODE , tb_5.FLOW_NAME
      ORDER BY tb_5.FLOW_CODE ASC
            `

    sql = sql.replaceAll('dataItem.FLOW_CODE', dataItem['FLOW_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeFlowNameAndInuseAndStandardCostActive: async (dataItem: any) => {
    let sql = `
      SELECT
            tb_5.FLOW_ID,
            tb_5.FLOW_NAME,
            tb_5.FLOW_CODE

      FROM
                SCT tb_1
      INNER JOIN
                SCT_WORKING_PROGRESS tb_2 ON tb_1.SCT_ID = tb_2.SCT_ID
      INNER JOIN
                SCT_BOM tb_3 ON tb_1.SCT_ID = tb_3.SCT_ID
      INNER JOIN
                BOM tb_4 ON tb_3.BOM_ID = tb_4.BOM_ID
      INNER JOIN
                FLOW tb_5 ON tb_4.FLOW_ID = tb_5.FLOW_ID
      INNER JOIN
                PRODUCT_TYPE tb_6 ON tb_6.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID

      WHERE
       tb_1.SCT_ID IN (
            SELECT
                  tb_1.SCT_ID
            FROM
                  SCT tb_1
            INNER JOIN SCT_REASON_CODE tb_2 ON tb_1.SCT_REASON_CODE_ID = tb_2.SCT_REASON_CODE_ID
            INNER JOIN sct_working_progress tb_3 ON tb_1.SCT_ID = tb_3.SCT_ID
            INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
      WHERE
      tb_1.INUSE = 1
      AND tb_3.TOTAL_WORKING_PROGRESS_PERCENT = 100
      AND tb_2.CAN_INPUT_TO_PRODUCTION_LINE = 1
      AND NOW() BETWEEN tb_1.EFFECTIVE_DATE
      AND tb_1.EXPIRATION_DATE
      AND tb_1.CREATE_DATE <= NOW()
      )

      AND tb_2.TOTAL_WORKING_PROGRESS_PERCENT = 100
      AND tb_5.FLOW_NAME LIKE '%dataItem.FLOW_NAME%'
      GROUP BY tb_5.FLOW_ID, tb_5.FLOW_CODE , tb_5.FLOW_NAME
      ORDER BY tb_5.FLOW_NAME ASC
            `

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getProcessByLikeFlowIdAndInuse: async (dataItem: any) => {
    let sql = `
                  SELECT  tb_1.SCT_ID
                        ,	tb_4.BOM_ID
                        , tb_5.FLOW_ID
                        , tb_5.FLOW_CODE
                        , tb_5.FLOW_NAME
                        , tb_6.FLOW_PROCESS_ID
                        , tb_6.NO AS PROCESS_NO
                        , tb_7.PROCESS_ID
                        , tb_7.PROCESS_CODE
                        , tb_7.PROCESS_NAME
                        , tb_8.PRODUCT_TYPE_ID

                    FROM
                        SCT tb_1
                    INNER JOIN
                        SCT_WORKING_PROGRESS tb_2 ON tb_1.SCT_ID = tb_2.SCT_ID
                    INNER JOIN
                        SCT_BOM tb_3 ON tb_1.SCT_ID = tb_3.SCT_ID
                    INNER JOIN
                        BOM tb_4 ON tb_3.BOM_ID = tb_4.BOM_ID
                    INNER JOIN
                        FLOW tb_5 ON tb_4.FLOW_ID = tb_5.FLOW_ID
                    INNER JOIN
                        FLOW_PROCESS tb_6 ON tb_6.FLOW_ID = tb_5.FLOW_ID  AND tb_6.INUSE = 1
                    INNER JOIN
                        PROCESS tb_7 ON tb_7.PROCESS_ID = tb_6.PROCESS_ID
                    INNER JOIN
                        PRODUCT_TYPE tb_8 ON tb_8.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID

                    WHERE
                    tb_1.SCT_ID IN (
                        SELECT
                          tb_1.SCT_ID
                    FROM
                        SCT tb_1
                          INNER JOIN SCT_REASON_CODE tb_2 ON tb_1.SCT_REASON_CODE_ID = tb_2.SCT_REASON_CODE_ID
                          INNER JOIN sct_working_progress tb_3 ON tb_1.SCT_ID = tb_3.SCT_ID
                          WHERE
                          tb_1.INUSE = 1
                          AND tb_3.TOTAL_WORKING_PROGRESS_PERCENT = 100
                          AND tb_2.CAN_INPUT_TO_PRODUCTION_LINE = 1
                          AND NOW() BETWEEN tb_1.EFFECTIVE_DATE
                          AND tb_1.EXPIRATION_DATE
                          AND tb_1.CREATE_DATE <= NOW())
                          AND tb_2.TOTAL_WORKING_PROGRESS_PERCENT = 100
                          AND tb_5.FLOW_ID = 'dataItem.FLOW_ID'
                          GROUP BY tb_7.PROCESS_CODE , tb_7.PROCESS_NAME
                          ORDER BY tb_6.NO ASC
                      `

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeFlowCodeAndInuse: async (dataItem: any) => {
    let sql = `   SELECT
                            FLOW_ID
                          , FLOW_NAME
                          , FLOW_CODE
                      FROM
                            FLOW
                      WHERE
                            FLOW_CODE LIKE '%dataItem.FLOW_CODE%'
                        AND INUSE LIKE '%dataItem.INUSE%'
                      ORDER BY
                        FLOW_CODE ASC
                      LIMIT
                        50
                      `

    sql = sql.replaceAll('dataItem.FLOW_CODE', dataItem['FLOW_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
