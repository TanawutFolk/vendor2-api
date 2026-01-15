export const FlowProcessSQL = {
  getByLikeFlowNameAndProductMainIdAndInuse: async (dataItem: any) => {
    let sql = `      SELECT
                            tb_1.FLOW_ID
                          , tb_1.FLOW_NAME
                          , tb_1.FLOW_CODE
                        FROM
                          FLOW tb_1
                              INNER JOIN
                          PRODUCT_MAIN tb_2
                              ON (tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID' ) = tb_2.PRODUCT_MAIN_ID
                        WHERE
                              tb_1.FLOW_NAME LIKE '%dataItem.FLOW_NAME%'
                          AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                          tb_1.FLOW_NAME ASC
                        LIMIT
                          50
              `

    sql = sql.replaceAll('dataItem.FLOW_NAME', dataItem['FLOW_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] ? dataItem['PRODUCT_MAIN_ID'] : '')
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] ? dataItem['INUSE'] : '')
    // console.log('getByLikeProductSubNameAndProductMainIdAndInuse', sql)
    return sql
  },

  createFlowProcessByCreatedProcess: async (dataItem: any) => {
    let sql = `
                            INSERT INTO FLOW_PROCESS
                            (
                                  FLOW_PROCESS_ID
                                , FLOW_ID
                                , NO
                                , PROCESS_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                            )
                            SELECT
                                  1 + coalesce((SELECT max(FLOW_PROCESS_ID) FROM FLOW_PROCESS), 0)
                                ,  @flowId
                                ,  1
                                , @processId
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                              `

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  searchProcessByFlowProcessId: async (dataItem: any) => {
    let sql = `
                SELECT
                    tb_1.NO
                  , tb_1.FLOW_PROCESS_ID
                  , tb_2.PROCESS_ID
                  , tb_2.PROCESS_NAME
                FROM
                  FLOW_PROCESS tb_1
                INNER JOIN
                  PROCESS tb_2
                ON
                  tb_1.PROCESS_ID = tb_2.PROCESS_ID
                WHERE
                  tb_1.FLOW_ID = 'dataItem.FLOW_ID'
                  AND tb_1.INUSE = 1
                ORDER BY
                  tb_1.NO
                              `

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    // console.log('searchProcessByFlowProcessId', sql)

    return sql
  },
  createFlowProcess: async (dataItem: any) => {
    let sql = `
    SET @flowProcessId=(1 + coalesce((SELECT max(FLOW_PROCESS_ID) FROM FLOW_PROCESS), 0));

                            INSERT INTO FLOW_PROCESS
                            (
                                  FLOW_PROCESS_ID
                                , FLOW_ID
                                , NO
                                , PROCESS_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                            )
                            SELECT
                                  @flowProcessId
                                ,  'dataItem.FLOW_ID'
                                , 'dataItem.NO'
                                , 'dataItem.PROCESS_ID'
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY';

    SELECT @flowProcessId AS FLOW_PROCESS_ID, 'dataItem.PROCESS_ID' AS PROCESS_ID
                              `

    sql = sql.replaceAll('dataItem.NO', dataItem['NO'])
    sql = sql.replaceAll('dataItem.PROCESS_ID', dataItem['PROCESS_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    return sql
  },

  updateFlowProcess: async (dataItem: any) => {
    let sql = `      UPDATE
                                FLOW_PROCESS
                            SET
                                FLOW_PROCESS_NAME = 'dataItem.FLOW_PROCESS_NAME'
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                            FLOW_PROCESS_ID = 'dataItem.FLOW_PROCESS_ID' ;
                      `

    sql = sql.replaceAll('dataItem.FLOW_PROCESS_NAME', dataItem['FLOW_PROCESS_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    return sql
  },

  deleteFlowProcess: async (dataItem: any) => {
    let sql = `   UPDATE
                        FLOW_PROCESS
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
  InsertByExistFlowId: async (dataItem: any) => {
    let sql = `           INSERT INTO FLOW_PROCESS
                          (
                                FLOW_PROCESS_ID
                              , FLOW_ID
                              , NO
                              , PROCESS_ID
                              , CREATE_BY
                              , UPDATE_DATE
                              , UPDATE_BY
                          )
                          SELECT
                                1 + coalesce((SELECT max(FLOW_PROCESS_ID) FROM FLOW_PROCESS), 0)
                              , 'dataItem.FLOW_ID'
                              , 'dataItem.NO'
                              , 'dataItem.PROCESS_ID'
                              , 'dataItem.CREATE_BY'
                              ,  CURRENT_TIMESTAMP()
                              , 'dataItem.CREATE_BY'
                        `

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.NO', dataItem['NO'])
    sql = sql.replaceAll('dataItem.PROCESS_ID', dataItem['PROCESS_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  deleteByFlowId: async (dataItem: any) => {
    let sql = `           UPDATE
                                FLOW_PROCESS
                            SET
                                INUSE = '0'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                FLOW_ID = 'dataItem.FLOW_ID'
                                AND INUSE = '1' ;
                                                `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    return sql
  },

  getFlowProcessDuplicate: async (dataItem: any, flowProcess: any) => {
    let sql = `     SELECT
                            tb_1.FLOW_PROCESS_ID,
                            tb_1.NO,
                            tb_1.PROCESS_ID,
                            tb_2.FLOW_ID
                          FROM
                            FLOW_PROCESS tb_1
                          INNER JOIN
                            FLOW tb_2 ON tb_1.FLOW_ID = tb_2.FLOW_ID
                          WHERE
                            tb_2.TOTAL_COUNT_PROCESS = dataItem.TOTAL_COUNT_PROCESS
                            AND tb_2.INUSE = 1
                            AND tb_1.INUSE = 1
                            AND tb_1.FLOW_ID IN (
                              SELECT
                                tb_2.FLOW_ID
                              FROM
                                FLOW_PROCESS tb_1
                              INNER JOIN
                                FLOW tb_2 ON tb_1.FLOW_ID = tb_2.FLOW_ID
                              WHERE
                                tb_2.TOTAL_COUNT_PROCESS = dataItem.TOTAL_COUNT_PROCESS
                                AND tb_2.INUSE = 1
                                AND tb_1.INUSE = 1
                                AND (
                                  dataItem.PROCESS_ID
                                )
                              GROUP BY
                                tb_2.FLOW_ID
                              HAVING
                                COUNT(*) = dataItem.TOTAL_COUNT_PROCESS
                            );
    `
    sql = sql.replaceAll('dataItem.PROCESS_ID', flowProcess)
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.TOTAL_COUNT_PROCESS', dataItem['TOTAL_COUNT_PROCESS'])

    return sql
  },
  getByFlowId: async (dataItem: { FLOW_ID: number }) => {
    let sql = `     SELECT
                            tb_1.FLOW_ID
                          , tb_2.PROCESS_ID
                          , tb_3.PROCESS_CODE
                          , tb_3.PROCESS_NAME
                          , tb_2.NO AS PROCESS_NO
                          , tb_2.FLOW_PROCESS_ID
                          , tb_1.FLOW_CODE
                          , tb_1.FLOW_NAME
                     FROM
                            FLOW tb_1
                                  INNER JOIN
                            FLOW_PROCESS tb_2
                                      ON tb_1.FLOW_ID = tb_2.FLOW_ID
                                  AND tb_2.INUSE = 1
                                  INNER JOIN
                            PROCESS tb_3
                                  ON tb_2.PROCESS_ID = tb_3.PROCESS_ID
                     WHERE
                            tb_1.FLOW_ID = 'dataItem.FLOW_ID'`

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'].toString())

    return sql
  },
}
