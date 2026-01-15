export const ClearTimeSQL = {
  searchTotal: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `  SELECT COUNT(*) AS TOTAL_COUNT
                     FROM
                          PRODUCT_CATEGORY tb_1
                          INNER JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID AND tb_2.INUSE = 1
                          INNER JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                          INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_4.INUSE = 1
                          INNER JOIN dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                          INNER JOIN FLOW tb_7 ON tb_7.FLOW_ID = tb_5.FLOW_ID
                          WHERE tb_5.INUSE = 1

                dataItem.sqlWhere
                sqlWhereColumnFilter

        `
    // sql = sql.replaceAll('dataItem.TEST_DB', process.env.TEST_DB)
    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB!)
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    //console.log(sql)
    sqlList.push(sql)

    sql = `  SELECT  tb_1.PRODUCT_CATEGORY_ID
                    , tb_1.PRODUCT_CATEGORY_NAME
                    , tb_2.PRODUCT_MAIN_ID
                    , tb_2.PRODUCT_MAIN_NAME
                    , tb_3.PRODUCT_SUB_ID
                    , tb_3.PRODUCT_SUB_NAME
                    , tb_4.PRODUCT_TYPE_ID
                    , tb_4.PRODUCT_TYPE_NAME
                    , tb_4.PRODUCT_TYPE_CODE
                    , tb_4.PRODUCT_TYPE_CODE_FOR_SCT
                    , tb_5.BOM_ID
                    , tb_5.TOTAL_CLEAR_TIME_FOR_SCT
                    , tb_5.SCT_REASON_SETTING_ID
                    , tb_5.DESCRIPTION
                    , tb_5.FISCAL_YEAR
                    , tb_5.FLOW_ID
                    , tb_7.FLOW_NAME
                    , tb_7.FLOW_CODE
                    , tb_5.REVISION_NO
                    , tb_5.UPDATE_BY
                    , DATE_FORMAT(tb_5.UPDATE_DATE, '%d-%b-%Y %H:%i:%s' ) AS MODIFIED_DATE
                    , tb_5.INUSE
                    , tb_5.CLEAR_TIME_FOR_SCT_TOTAL_ID

                      FROM
                          PRODUCT_CATEGORY tb_1
                          INNER JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID AND tb_2.INUSE = 1
                          INNER JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                          INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_4.INUSE = 1
                          INNER JOIN dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                          INNER JOIN FLOW tb_7 ON tb_7.FLOW_ID = tb_5.FLOW_ID
                          WHERE tb_5.INUSE = 1

                        dataItem.sqlWhere
                        sqlWhereColumnFilter

                        ORDER BY
                            dataItem.Order
                        LIMIT
                            dataItem.Start
                        ,   dataItem.Limit


        `
    // sql = sql.replaceAll('dataItem.TEST_DB', process.env.TEST_DB)
    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB!)
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.Order', dataItem.Order)
    sql = sql.replaceAll('dataItem.Start', dataItem.Start)
    sql = sql.replaceAll('dataItem.Limit', dataItem.Limit)
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  getClearTimeExportDataByProductTypeId: async (dataItem: any, sqlWhere: any) => {
    // let sql = `
    //                             SELECT  tb_1.PRODUCT_CATEGORY_NAME
    //                             , tb_1.PRODUCT_CATEGORY_ID
    //                             , tb_2.PRODUCT_MAIN_NAME
    //                             , tb_2.PRODUCT_MAIN_ID
    //                             , tb_3.PRODUCT_SUB_NAME
    //                             , tb_3.PRODUCT_SUB_ID
    //                             , tb_4.PRODUCT_TYPE_CODE
    //                             , tb_4.PRODUCT_TYPE_NAME
    //                             , tb_4.PRODUCT_TYPE_ID
    //                             , tb_4.PRODUCT_TYPE_CODE_FOR_SCT
    //                             , tb_6.FLOW_ID
    //                             , tb_6.FLOW_CODE
    //                             , tb_6.FLOW_NAME
    //                             , tb_7.FLOW_PROCESS_ID
    //                             , tb_7.NO AS FLOW_PROCESS_NO
    //                             , tb_8.PROCESS_ID
    //                             , tb_8.PROCESS_CODE
    //                             , tb_8.PROCESS_NAME
    //                             , tb_9.CLEAR_TIME_FOR_SCT
    //                             , tb_9.REVISION_NO
    //                             , tb_9.DESCRIPTION

    //                             FROM PRODUCT_CATEGORY tb_1
    //                             JOIN PRODUCT_MAIN tb_2  ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID
    //                             JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
    //                             JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
    //                             JOIN PRODUCT_TYPE_FLOW tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_5.INUSE = 1
    //                             JOIN FLOW tb_6 ON tb_6.FLOW_ID = tb_5.FLOW_ID AND tb_6.INUSE = 1
    //                             JOIN FLOW_PROCESS tb_7 ON tb_7.FLOW_ID = tb_6.FLOW_ID AND tb_7.INUSE = 1
    //                             JOIN PROCESS tb_8 ON tb_8.PROCESS_ID = tb_7.PROCESS_ID
    //                             LEFT JOIN dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS tb_9 ON
    //                             tb_9.PROCESS_ID = tb_8.PROCESS_ID
    //                             AND tb_9.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
    //                             dataItem.sqlWhere
    //                             WHERE tb_4.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'

    //                             ORDER BY tb_7.NO ASC
    //                 `
    let sql = `
                              SELECT
                                    tb_Main.PRODUCT_CATEGORY_NAME,
                                    tb_Main.PRODUCT_CATEGORY_ID,
                                    tb_Main.PRODUCT_MAIN_NAME,
                                    tb_Main.PRODUCT_MAIN_ID,
                                    tb_Main.PRODUCT_SUB_NAME,
                                    tb_Main.PRODUCT_SUB_ID,
                                    tb_Main.PRODUCT_TYPE_CODE,
                                    tb_Main.PRODUCT_TYPE_NAME,
                                    tb_Main.PRODUCT_TYPE_ID,
                                    tb_Main.PRODUCT_TYPE_CODE_FOR_SCT,
                                    tb_Main.FLOW_ID,
                                    tb_Main.FLOW_CODE,
                                    tb_Main.FLOW_NAME,
                                    tb_Main.FLOW_PROCESS_ID,
                                    tb_Main.FLOW_PROCESS_NO,
                                    tb_Main.PROCESS_ID,
                                    tb_Main.PROCESS_CODE,
                                    tb_Main.PROCESS_NAME,
                                    tb_Main.CLEAR_TIME,
                                    tb_Main.REVISION_NO,
                                    tb_Main.DESCRIPTION,
                                    tb_Main.PROCESS_CAPACITY_SHEET_ID,
                                    tb_Main.PROCESS_CAPACITY_SHEET_NAME,
                                    tb_Main.APPROVED_DATE,
                                    tb_SCT_main_subquery.revision_no AS REVISION_NO_CLEAR_TIME_FOR_SCT,
                                    ROUND(CAST(tb_SCT_main_subquery.CLEAR_TIME_FOR_SCT AS DECIMAL(10,5)), 2) AS CLEAR_TIME_FOR_SCT,
                                    tb_SCT_main_subquery.FISCAL_YEAR
                                  FROM
                                    (
                                      SELECT
                                        tb_1.PRODUCT_CATEGORY_NAME,
                                        tb_1.PRODUCT_CATEGORY_ID,
                                        tb_2.PRODUCT_MAIN_NAME,
                                        tb_2.PRODUCT_MAIN_ID,
                                        tb_3.PRODUCT_SUB_NAME,
                                        tb_3.PRODUCT_SUB_ID,
                                        tb_4.PRODUCT_TYPE_CODE,
                                        tb_4.PRODUCT_TYPE_NAME,
                                        tb_4.PRODUCT_TYPE_ID,
                                        tb_4.PRODUCT_TYPE_CODE_FOR_SCT,
                                        tb_6.FLOW_ID,
                                        tb_6.FLOW_CODE,
                                        tb_6.FLOW_NAME,
                                        tb_7.FLOW_PROCESS_ID,
                                        tb_7.NO AS FLOW_PROCESS_NO,
                                        tb_8.PROCESS_ID,
                                        tb_8.PROCESS_CODE,
                                        tb_8.PROCESS_NAME,
                                        tb_9.CLEAR_TIME,
                                        tb_9.REVISION_NO,
                                        tb_9.DESCRIPTION,
                                        tb_pcs.PCS_ID AS PROCESS_CAPACITY_SHEET_ID,
                                        tb_pcs.PCS_NAME AS PROCESS_CAPACITY_SHEET_NAME,
                                        tb_pcs.UPDATE_DATE AS APPROVED_DATE
                                      FROM
                                        PRODUCT_CATEGORY tb_1
                                        JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID
                                        JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
                                        JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                                        JOIN PRODUCT_TYPE_FLOW tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                        AND tb_5.INUSE = 1
                                        JOIN FLOW tb_6 ON tb_6.FLOW_ID = tb_5.FLOW_ID
                                        AND tb_6.INUSE = 1
                                        JOIN FLOW_PROCESS tb_7 ON tb_7.FLOW_ID = tb_6.FLOW_ID
                                        AND tb_7.INUSE = 1
                                        JOIN mes.PROCESS tb_8 ON tb_8.PROCESS_ID = tb_7.PROCESS_ID
                                        LEFT JOIN dataItem.CYCLE_TIME_DB.CLEAR_TIME_PROCESS tb_9 ON tb_9.PROCESS_ID = tb_8.PROCESS_ID  AND tb_9.INUSE = 1
                                        AND tb_9.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                        dataItem.sqlWhere
                                        LEFT JOIN dataItem.CYCLE_TIME_DB.PCS tb_pcs ON tb_pcs.PCS_ID = tb_9.PCS_ID
                                      WHERE
                                        tb_4.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                    ) tb_Main
                                    LEFT JOIN (
                                      SELECT
                                        tb_SCT.CLEAR_TIME_FOR_SCT,
                                        tb_SCT.REVISION_NO,
                                        tb_SCT.FISCAL_YEAR,
                                        tb_SCT.PRODUCT_TYPE_ID,
                                        tb_SCT.PROCESS_ID
                                      FROM
                                        (
                                          SELECT
                                            CLEAR_TIME_FOR_SCT,
                                            REVISION_NO,
                                            FISCAL_YEAR,
                                            PRODUCT_TYPE_ID,
                                            PROCESS_ID
                                          FROM
                                            dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS
                                          WHERE
                                            PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                            AND FISCAL_YEAR = ( SELECT MAX( FISCAL_YEAR )
                                            FROM dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS WHERE PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID' )
                                            AND REVISION_NO = (
                                              SELECT
                                                MAX( REVISION_NO )
                                              FROM
                                                dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS
                                              WHERE
                                                PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                                AND FISCAL_YEAR = ( SELECT MAX( FISCAL_YEAR )
                                                FROM dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS WHERE PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID' )
                                            )
                                        ) AS tb_SCT
                                    ) AS tb_SCT_main_subquery ON tb_Main.PRODUCT_TYPE_ID = tb_SCT_main_subquery.PRODUCT_TYPE_ID
                                    AND tb_Main.PROCESS_ID = tb_SCT_main_subquery.PROCESS_ID
                                  ORDER BY
                                    tb_MAIN.FLOW_PROCESS_NO ASC
                    `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    // console.log(sql)

    return sql
  },
  GetLastClearTimeRevision: async (dataItem: any) => {
    let sql = `


                                SELECT  IFNULL( MAX(FISCAL_YEAR), 0) + 0 AS FISCAL_YEAR

                              , IFNULL( MAX(REVISION_NO), 0) + 0 AS REVISION_NO

                                FROM dataItem.CYCLE_TIME_DB.CLEAR_TIME_PROCESS tb_1

                                WHERE tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                AND tb_1.INUSE = 1

    `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem.PRODUCT_TYPE_ID)
    sql = sql.replaceAll('dataItem.INUSE', dataItem.INUSE)
    // console.log(sql)
    return sql
  },
  generateClearTimeRevisionNo: async (dataItem: any) => {
    let sql = `
            SET @ClearTimeRevisionNo = (
                    SELECT
                                    IFNULL(MAX(REVISION_NO), 0) + 1 AS REVISION_NO

                                    FROM
                                               dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS
                                    WHERE
                                                PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                            AND FISCAL_YEAR = 'dataItem.FISCAL_YEAR'

            ) ;
                    `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process?.env?.CYCLE_TIME_DB || '')
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    // console.log(sql)
    return sql
  },
  insertClearTime: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS
            (
                      CLEAR_TIME_FOR_SCT_PROCESS_ID
                    , FISCAL_YEAR
                    , REVISION_NO
                    , PRODUCT_TYPE_ID
                    , FLOW_ID
                    , FLOW_PROCESS_ID
                    , FLOW_PROCESS_NO
                    , PROCESS_ID
                    , CLEAR_TIME_FOR_SCT
                    , CLEAR_TIME_ADJUST
                    , CLEAR_TIME
                    , ADJUST
                    , IS_ADJUST
                    , SCT_REASON_SETTING_ID
                    , SCT_TAG_SETTING_ID
                    , NOTE
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
                    , PCS_ID
                    , PCS_APPROVED_DATE

            )
            VALUES
            (
                      'dataItem.CLEAR_TIME_FOR_SCT_PROCESS_ID'
                    , 'dataItem.FISCAL_YEAR'
                    , @clearTimeRevisionNo
                    , 'dataItem.PRODUCT_TYPE_ID'
                    , 'dataItem.FLOW_ID'
                    , 'dataItem.FLOW_PROCESS_ID'
                    , 'dataItem.FLOW_PROCESS_NO'
                    , 'dataItem.PROCESS_ID'
                    , 'dataItem.CLEAR_TIME_FOR_SCT'
                    , 'dataItem.CLEAR_TIME_ADJUST'
                    , 'dataItem.CLEAR_TIME'
                    , 'dataItem.ADJUST'
                    , 'dataItem.IS_ADJUST'
                    , 'dataItem.SCT_REASON_SETTING_ID'
                    , 'dataItem.SCT_TAG_SETTING_ID'
                    , 'dataItem.NOTE'
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
                    , dataItem.PCS_ID
                    , dataItem.PCS_APPROVED_DATE
            )
                        `
    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')
    sql = sql.replaceAll('dataItem.PCS_ID', dataItem['PROCESS_CAPACITY_SHEET_ID'] !== null ? "'" + dataItem['PROCESS_CAPACITY_SHEET_ID'] + "'" : 'NULL')
    sql = sql.replaceAll(
      'dataItem.PCS_APPROVED_DATE',
      dataItem['PROCESS_CAPACITY_SHEET_APPROVED_DATE'] !== null ? "'" + dataItem['PROCESS_CAPACITY_SHEET_APPROVED_DATE'] + "'" : 'NULL'
    )
    sql = sql.replaceAll('dataItem.CLEAR_TIME_FOR_SCT_PROCESS_ID', uuid)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_NO', dataItem['FLOW_PROCESS_NO'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.PROCESS_ID', dataItem['PROCESS_ID'])
    sql = sql.replaceAll('dataItem.CLEAR_TIME_FOR_SCT', dataItem['CLEAR_TIME_FOR_SCT'])
    sql = sql.replaceAll('dataItem.CLEAR_TIME_ADJUST', dataItem['CLEAR_TIME_ADJUST'])
    sql = sql.replaceAll('dataItem.CLEAR_TIME', dataItem['CLEAR_TIME'])
    sql = sql.replaceAll('dataItem.ADJUST', dataItem['ADJUST'] == null || dataItem['ADJUST'] == '' ? '0' : dataItem['ADJUST'])
    sql = sql.replaceAll('dataItem.IS_ADJUST', dataItem['IS_ADJUST'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log(sql)
    return sql
  },
  insertTotalClearTime: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL
            (
                      CLEAR_TIME_FOR_SCT_TOTAL_ID
                    , FISCAL_YEAR
                    , REVISION_NO
                    , PRODUCT_TYPE_ID
                    , FLOW_ID
                    , TOTAL_CLEAR_TIME_FOR_SCT
                    , SCT_REASON_SETTING_ID
                    , SCT_TAG_SETTING_ID
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
                    , PCS_ID
                    , PCS_APPROVED_DATE
            )
            VALUES
            (
                      'dataItem.CLEAR_TIME_FOR_SCT_TOTAL_ID'
                    , 'dataItem.FISCAL_YEAR'
                    , @clearTimeRevisionNo
                    , 'dataItem.PRODUCT_TYPE_ID'
                    , 'dataItem.FLOW_ID'
                    , 'dataItem.TOTAL_CLEAR_TIME_FOR_SCT'
                    , 'dataItem.SCT_REASON_SETTING_ID'
                    , 'dataItem.SCT_TAG_SETTING_ID'
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
                    , dataItem.PCS_ID
                    , dataItem.PCS_APPROVED_DATE
            )
                        `
    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')
    sql = sql.replaceAll('dataItem.PCS_ID', dataItem['PROCESS_CAPACITY_SHEET_ID'] !== null ? "'" + dataItem['PROCESS_CAPACITY_SHEET_ID'] + "'" : 'NULL')
    sql = sql.replaceAll(
      'dataItem.PCS_APPROVED_DATE',
      dataItem['PROCESS_CAPACITY_SHEET_APPROVED_DATE'] !== null ? "'" + dataItem['PROCESS_CAPACITY_SHEET_APPROVED_DATE'] + "'" : 'NULL'
    )
    sql = sql.replaceAll('dataItem.CLEAR_TIME_FOR_SCT_TOTAL_ID', uuid)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.TOTAL_CLEAR_TIME_FOR_SCT', dataItem['TOTAL_CLEAR_TIME_FOR_SCT'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'] ?? '')
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log(sql)
    return sql
  },
}
