export const StandardCostSQL = {
  getByLikeSctPatternName: async (dataItem: any) => {
    let sql = `
            SELECT
                    SCT_PATTERN_ID
                  , SCT_PATTERN_NAME
            FROM
                  SCT_PATTERN
            WHERE
                  SCT_PATTERN_NAME LIKE '%dataItem.SCT_PATTERN_NAME%'
                `

    sql = sql.replaceAll('dataItem.SCT_PATTERN_NAME', dataItem['SCT_PATTERN_NAME'])

    return sql
  },
  getByLikeSctTagSettingNameAndInuse: async (dataItem: any) => {
    let sql = `
            SELECT
                    SCT_TAG_SETTING_ID
                  , SCT_TAG_SETTING_NAME
            FROM
                  dataItem.STANDARD_COST_DB.SCT_TAG_SETTING
            WHERE
                      SCT_TAG_SETTING_NAME LIKE '%dataItem.SCT_TAG_SETTING_NAME%'
                  AND INUSE = dataItem.INUSE`

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_NAME', dataItem['SCT_TAG_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeSctReasonSettingNameAndInuse: async (dataItem: any) => {
    let sql = `
            SELECT
                    SCT_REASON_SETTING_ID
                  , SCT_REASON_SETTING_NAME
            FROM
                  dataItem.STANDARD_COST_DB.SCT_REASON_SETTING
            WHERE
                      SCT_REASON_SETTING_NAME LIKE '%dataItem.SCT_REASON_SETTING_NAME%'
                  AND INUSE = dataItem.INUSE
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_NAME', dataItem['SCT_REASON_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  searchSctCodeForSelection: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `
                  SELECT
                          COUNT(*) AS TOTAL_COUNT
                  FROM
                          dataItem.STANDARD_COST_DB.SCT tb_1
                              JOIN
                          PRODUCT_TYPE tb_5
                              ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                              JOIN
                          PRODUCT_SUB tb_6
                              ON tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID
                              JOIN
                          PRODUCT_MAIN tb_7
                              ON tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID
                              JOIN
                          PRODUCT_CATEGORY tb_8
                              ON tb_7.PRODUCT_CATEGORY_ID = tb_8.PRODUCT_CATEGORY_ID
                              JOIN
                          dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_9
                              ON tb_1.SCT_ID = tb_9.SCT_ID
                              AND tb_9.INUSE = 1
                              JOIN
                          dataItem.STANDARD_COST_DB.SCT_PATTERN tb_10
                                ON tb_1.SCT_PATTERN_ID = tb_10.SCT_PATTERN_ID
                                JOIN
                          BOM tb_11
                                ON tb_1.BOM_ID = tb_11.BOM_ID
                                JOIN
                          dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_12
                                ON tb_9.SCT_STATUS_PROGRESS_ID = tb_12.SCT_STATUS_PROGRESS_ID
                                JOIN
                          FLOW tb_13
                                ON tb_11.FLOW_ID = tb_13.FLOW_ID
                  WHERE

                          dataItem.sqlWhere

                          sqlWhereColumnFilter
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    sqlList.push(sql)

    sql = `
                  SELECT
                          tb_1.SCT_ID
                        , tb_1.SCT_REVISION_CODE
                        , tb_1.FISCAL_YEAR
                        , tb_1.BOM_ID
                        , tb_5.PRODUCT_TYPE_ID
                        , tb_5.PRODUCT_TYPE_CODE
                        , tb_5.PRODUCT_TYPE_CODE_FOR_SCT
                        , tb_5.PRODUCT_TYPE_NAME
                        , tb_6.PRODUCT_SUB_ID
                        , tb_6.PRODUCT_SUB_NAME
                        , tb_7.PRODUCT_MAIN_ID
                        , tb_7.PRODUCT_MAIN_NAME
                        , tb_8.PRODUCT_CATEGORY_ID
                        , tb_8.PRODUCT_CATEGORY_NAME
                        , tb_10.SCT_PATTERN_ID
                        , tb_10.SCT_PATTERN_NAME
                        , tb_11.BOM_NAME
                        , tb_11.BOM_CODE
                        , tb_12.SCT_STATUS_PROGRESS_ID
                        , tb_12.SCT_STATUS_PROGRESS_NAME
                        , tb_13.FLOW_ID
                        , tb_13.FLOW_NAME
                        , tb_13.FLOW_CODE
                        , tb_13.TOTAL_COUNT_PROCESS
                  FROM
                          dataItem.STANDARD_COST_DB.SCT tb_1
                              JOIN
                          PRODUCT_TYPE tb_5
                              ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                              JOIN
                          PRODUCT_SUB tb_6
                              ON tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID
                              JOIN
                          PRODUCT_MAIN tb_7
                              ON tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID
                              JOIN
                          PRODUCT_CATEGORY tb_8
                              ON tb_7.PRODUCT_CATEGORY_ID = tb_8.PRODUCT_CATEGORY_ID
                              JOIN
                          dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_9
                              ON tb_1.SCT_ID = tb_9.SCT_ID
                              AND tb_9.INUSE = 1
                              JOIN
                          dataItem.STANDARD_COST_DB.SCT_PATTERN tb_10
                                ON tb_1.SCT_PATTERN_ID = tb_10.SCT_PATTERN_ID
                                JOIN
                          BOM tb_11
                                ON tb_1.BOM_ID = tb_11.BOM_ID
                                JOIN
                          dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_12
                                ON tb_9.SCT_STATUS_PROGRESS_ID = tb_12.SCT_STATUS_PROGRESS_ID
                                JOIN
                          FLOW tb_13
                                ON tb_11.FLOW_ID = tb_13.FLOW_ID
                  WHERE

                          dataItem.sqlWhere

                          sqlWhereColumnFilter

                  ORDER BY
                          dataItem.Order
                  LIMIT
                          dataItem.Start
                        , dataItem.Limit
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },

  // ! "Pajjaphon" please review this function
  searchSctCodeForSelection_: async (dataItem: any, sqlWhere: string) => {
    let sqlList: any = []

    let sql = `
                    SELECT
                            COUNT(*) AS TOTAL_COUNT
                    FROM
                            dataItem.STANDARD_COST_DB.SCT_F tb_1
                                JOIN
                            dataItem.STANDARD_COST_DB.SCT_SCT_F tb_2
                                ON tb_1.SCT_F_ID = tb_2.SCT_F_ID
                                JOIN
                            dataItem.STANDARD_COST_DB.SCT tb_3
                                ON tb_2.SCT_ID = tb_3.SCT_ID
                                JOIN
                            dataItem.STANDARD_COST_DB.SCT_F_S tb_4
                                ON tb_1.SCT_F_ID = tb_4.SCT_F_ID
                                JOIN
                            PRODUCT_TYPE tb_5
                                ON tb_4.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                JOIN
                            PRODUCT_SUB tb_6
                                ON tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID
                                JOIN
                            PRODUCT_MAIN tb_7
                                ON tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID
                                JOIN
                            PRODUCT_CATEGORY tb_8
                                ON tb_7.PRODUCT_CATEGORY_ID = tb_8.PRODUCT_CATEGORY_ID
                                JOIN
                            dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING tb_9
                                ON tb_1.SCT_F_ID = tb_9.SCT_F_ID
                    WHERE
                                tb_1.INUSE = 1
                            AND tb_9.SCT_F_STATUS_WORKING_ID = 1
                            AND tb_9.SCT_F_STATUS_PROGRESS_ID = 7

                            dataItem.sqlWhere

                            sqlWhereColumnFilter
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    sqlList.push(sql)

    sql = `
                    SELECT
                            tb_3.SCT_ID
                          , tb_3.SCT_REVISION_CODE
                          , tb_4.BOM_ID
                          , tb_1.SCT_F_ID
                    FROM
                            dataItem.STANDARD_COST_DB.SCT_F tb_1
                                JOIN
                            dataItem.STANDARD_COST_DB.SCT_SCT_F tb_2
                                ON tb_1.SCT_F_ID = tb_2.SCT_F_ID
                                JOIN
                            dataItem.STANDARD_COST_DB.SCT tb_3
                                ON tb_2.SCT_ID = tb_3.SCT_ID
                                JOIN
                            dataItem.STANDARD_COST_DB.SCT_F_S tb_4
                                ON tb_1.SCT_F_ID = tb_4.SCT_F_ID
                                JOIN
                            PRODUCT_TYPE tb_5
                                ON tb_4.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                JOIN
                            PRODUCT_SUB tb_6
                                ON tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID
                                JOIN
                            PRODUCT_MAIN tb_7
                                ON tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID
                                JOIN
                            PRODUCT_CATEGORY tb_8
                                ON tb_7.PRODUCT_CATEGORY_ID = tb_8.PRODUCT_CATEGORY_ID
                                JOIN
                            dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING tb_9
                                ON tb_1.SCT_F_ID = tb_9.SCT_F_ID
                    WHERE
                                tb_1.INUSE = 1
                            AND tb_9.SCT_F_STATUS_WORKING_ID = 1
                            AND tb_9.SCT_F_STATUS_PROGRESS_ID = 7

                            dataItem.sqlWhere

                            sqlWhereColumnFilter

                    ORDER BY
                            dataItem.Order
                    LIMIT
                            dataItem.Start
                          , dataItem.Limit
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)
    sqlList = sqlList.join(';')

    //console.log('sqlList', sqlList)

    return sqlList
  },
  searchProductSubBySctNo: async (dataItem: any) => {
    let sql = `
            SELECT
                    tb_1.SCT_ID
                  , tb_1.SCT_CODE_FOR_SUPPORT_MES
                  , tb_4.PRODUCT_SUB_ID
                  , tb_4.PRODUCT_SUB_NAME
                  , tb_4.PRODUCT_SUB_CODE
                  , tb_4.PRODUCT_SUB_ALPHABET
            FROM
                  dataItem.STANDARD_COST_DB.SCT tb_1
            JOIN
                  dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_2
            ON
                  (tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.SCT_STATUS_PROGRESS_ID = 7)
            JOIN
                  PRODUCT_TYPE tb_3
            ON
                  tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
            JOIN
                  PRODUCT_SUB tb_4
            ON
                  tb_3.PRODUCT_SUB_ID = tb_4.PRODUCT_SUB_ID
            WHERE
                  tb_1.SCT_CODE_FOR_SUPPORT_MES = 'dataItem.sctNo'
                `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.sctNo', dataItem)

    return sql
  },
  searchMaterialPackingAndRawMatBySctNo: async (dataItem: any) => {
    let sql = `
            SELECT
                    tb_1.SCT_ID
                  , tb_1.SCT_CODE_FOR_SUPPORT_MES
                  , tb_2.BOM_ID
                  , tb_3.ITEM_ID
                  , tb_6.ITEM_CATEGORY_NAME
                  , tb_6.ITEM_CATEGORY_ALPHABET
                  , tb_4.ITEM_CODE_FOR_SUPPORT_MES
            FROM
                  dataItem.STANDARD_COST_DB.SCT tb_1
            JOIN
                  dataItem.STANDARD_COST_DB.SCT_BOM tb_2
            ON
                  (tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1)
            JOIN
                  BOM_FLOW_PROCESS_ITEM_USAGE tb_3
            ON
                  (tb_2.BOM_ID = tb_3.BOM_ID AND tb_3.INUSE = 1)
            JOIN
                  ITEM_MANUFACTURING tb_4
            ON
                  tb_3.ITEM_ID = tb_4.ITEM_ID
            JOIN
                  ITEM tb_5
            ON
                  tb_4.ITEM_ID = tb_5.ITEM_ID
            JOIN
                  ITEM_CATEGORY tb_6
            ON
                  tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID
            JOIN
                  dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_7
            ON
                  (tb_1.SCT_ID = tb_7.SCT_ID AND tb_7.SCT_STATUS_PROGRESS_ID = 7)
            WHERE
                      tb_1.SCT_CODE_FOR_SUPPORT_MES = 'dataItem.sctNo'
                  AND tb_5.ITEM_CATEGORY_ID IN (4, 6)
                `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.sctNo', dataItem)

    return sql
  },
  getSctByLikeProductTypeIdAndMesTag: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
            , tb_3.SCT_STATUS_PROGRESS_ID
            , tb_4.SCT_STATUS_PROGRESS_NAME
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
        JOIN
            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_2
                ON
            tb_1.SCT_ID = tb_2.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_3
                ON
            tb_1.SCT_ID = tb_3.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_4
                ON
            tb_3.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
        WHERE
                tb_2.SCT_TAG_SETTING_ID = 3
            AND tb_1.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
        ORDER BY
            tb_1.UPDATE_DATE DESC
        LIMIT
            1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  getSctByLikeProductTypeIdAndBudgetTag: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
            , tb_3.SCT_STATUS_PROGRESS_ID
            , tb_4.SCT_STATUS_PROGRESS_NAME
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
        JOIN
            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_2
                ON
            tb_1.SCT_ID = tb_2.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_3
                ON
            tb_1.SCT_ID = tb_3.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_4
                ON
            tb_3.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
        WHERE
                tb_2.SCT_TAG_SETTING_ID = 1
            AND tb_1.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
        ORDER BY
            tb_1.UPDATE_DATE DESC
        LIMIT
            1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  getSctByLikeProductTypeIdAndPriceTag: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
            , tb_3.SCT_STATUS_PROGRESS_ID
            , tb_4.SCT_STATUS_PROGRESS_NAME
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
        JOIN
            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_2
                ON
            tb_1.SCT_ID = tb_2.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_3
                ON
            tb_1.SCT_ID = tb_3.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_4
                ON
            tb_3.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
        WHERE
                tb_2.SCT_TAG_SETTING_ID = 2
            AND tb_1.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
        ORDER BY
            tb_1.UPDATE_DATE DESC
        LIMIT
            1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  getSctByLikeProductTypeIdAndLatestRevision: async (dataItem: any) => {
    // let sql = `
    //     SELECT
    //           SCT_ID
    //         , SCT_REVISION_CODE
    //     FROM
    //         dataItem.STANDARD_COST_DB.SCT
    //     WHERE
    //         CAST
    //             (
    //                 RIGHT(SCT_REVISION_CODE, 2) AS UNSIGNED) = (
    //                     SELECT
    //                         MAX(CAST(RIGHT(SCT_REVISION_CODE, 2) AS UNSIGNED))
    //                     FROM
    //                         dataItem.STANDARD_COST_DB.SCT
    //             )
    //         AND PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
    // `

    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
        JOIN
            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_2
                ON
            tb_1.SCT_ID = tb_2.SCT_ID
        WHERE
                tb_1.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
            AND tb_2.SCT_STATUS_PROGRESS_ID >= 7
            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
        ORDER BY
            tb_1.CREATE_DATE DESC
        LIMIT
            1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  searchSctCodeForSelectionMaterialPrice: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `
            SELECT
                COUNT(*) AS TOTAL_COUNT
            FROM
                ITEM_PRODUCT_DETAIL tb_1
            JOIN
                dataItem.STANDARD_COST_DB.SCT tb_4
            ON
                tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_4.INUSE = 1
            JOIN
                dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_5
            ON
                tb_5.SCT_ID = tb_4.SCT_ID AND tb_5.INUSE = 1
            JOIN
                dataItem.STANDARD_COST_DB.SCT_PATTERN tb_6
            ON
                tb_4.SCT_PATTERN_ID = tb_6.SCT_PATTERN_ID
            JOIN
                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_7
            ON
                tb_4.SCT_ID = tb_7.SCT_ID AND tb_7.INUSE = 1
            JOIN
                dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_9
            ON
                tb_5.SCT_STATUS_PROGRESS_ID = tb_9.SCT_STATUS_PROGRESS_ID AND tb_9.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_10
            ON
                tb_4.SCT_ID = tb_10.SCT_ID AND tb_10.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_11
            ON
                tb_10.SCT_REASON_SETTING_ID = tb_11.SCT_REASON_SETTING_ID AND tb_11.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_12
            ON
                tb_4.SCT_ID = tb_12.SCT_ID AND tb_12.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_13
            ON
                tb_12.SCT_TAG_SETTING_ID = tb_13.SCT_TAG_SETTING_ID AND tb_13.INUSE = 1
            LEFT JOIN
                PRODUCT_TYPE tb_14
            ON
                tb_4.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID AND tb_14.INUSE = 1
            LEFT JOIN
                PRODUCT_SUB tb_15
            ON
                tb_14.PRODUCT_SUB_ID = tb_15.PRODUCT_SUB_ID AND tb_15.INUSE = 1
            LEFT JOIN
                PRODUCT_MAIN tb_16
            ON
                tb_15.PRODUCT_MAIN_ID = tb_16.PRODUCT_MAIN_ID AND tb_16.INUSE = 1
            LEFT JOIN
                PRODUCT_CATEGORY tb_17
            ON
                tb_16.PRODUCT_CATEGORY_ID = tb_17.PRODUCT_CATEGORY_ID AND tb_17.INUSE = 1
            LEFT JOIN
                PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_18
            ON
                tb_14.PRODUCT_TYPE_ID = tb_18.PRODUCT_TYPE_ID AND tb_18.INUSE = 1
            LEFT JOIN
                PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_19
            ON
                tb_18.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_19.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID AND tb_19.INUSE = 1
            LEFT JOIN
                PRODUCT_SPECIFICATION_TYPE tb_20
            ON
                tb_19.PRODUCT_SPECIFICATION_TYPE_ID = tb_20.PRODUCT_SPECIFICATION_TYPE_ID AND tb_20.INUSE = 1
            LEFT JOIN
                BOM tb_21
            ON
                tb_4.BOM_ID = tb_21.BOM_ID AND tb_21.INUSE = 1
            LEFT JOIN
                FLOW tb_22
            ON
                tb_21.FLOW_ID = tb_22.FLOW_ID AND tb_22.INUSE = 1
            LEFT JOIN
                PRODUCT_TYPE_ITEM_CATEGORY tb_23
            ON
                tb_4.PRODUCT_TYPE_ID = tb_23.PRODUCT_TYPE_ID AND tb_23.INUSE = 1
            LEFT JOIN
                ITEM_CATEGORY tb_24
            ON
                tb_23.ITEM_CATEGORY_ID = tb_24.ITEM_CATEGORY_ID AND tb_24.INUSE = 1
            LEFT JOIN
                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_25
            ON
                tb_4.PRODUCT_TYPE_ID = tb_25.PRODUCT_TYPE_ID AND tb_25.INUSE = 1
            LEFT JOIN
                CUSTOMER_INVOICE_TO tb_26
            ON
                tb_25.CUSTOMER_INVOICE_TO_ID = tb_26.CUSTOMER_INVOICE_TO_ID AND tb_26.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_27
            ON
                tb_4.SCT_ID = tb_27.SCT_ID AND tb_27.INUSE = 1

            WHERE
                    tb_1.ITEM_ID = 'dataItem.ITEM_ID'
                AND tb_5.SCT_STATUS_PROGRESS_ID > 3
                AND tb_4.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                AND tb_4.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'


                sqlWhereColumnFilter
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])

    sqlList.push(sql)

    sql = `
            SELECT
                  tb_4.SCT_REVISION_CODE
                ,  tb_4.SCT_ID
                , tb_7.SELLING_PRICE
                , tb_4.FISCAL_YEAR
                , tb_6.SCT_PATTERN_NAME
                , tb_5.SCT_STATUS_PROGRESS_ID
                , tb_26.CUSTOMER_INVOICE_TO_ID
                , tb_26.CUSTOMER_INVOICE_TO_NAME
                , tb_26.CUSTOMER_INVOICE_TO_ALPHABET
                , tb_11.SCT_REASON_SETTING_ID
                , tb_11.SCT_REASON_SETTING_NAME
                , tb_13.SCT_TAG_SETTING_ID
                , tb_13.SCT_TAG_SETTING_NAME
                , DATE_FORMAT(tb_4.ESTIMATE_PERIOD_START_DATE, '%d-%b-%Y') AS ESTIMATE_PERIOD_START_DATE
                , DATE_FORMAT(tb_4.ESTIMATE_PERIOD_END_DATE, '%d-%b-%Y') AS ESTIMATE_PERIOD_END_DATE
                , tb_14.PRODUCT_TYPE_NAME
                , tb_15.PRODUCT_SUB_NAME
                , tb_16.PRODUCT_MAIN_NAME
                , tb_17.PRODUCT_CATEGORY_NAME
                , tb_24.ITEM_CATEGORY_NAME
                , tb_24.ITEM_CATEGORY_ID
                , tb_21.BOM_CODE
                , tb_21.BOM_NAME
                , tb_22.FLOW_CODE
                , tb_22.FLOW_NAME
                , tb_7.ASSEMBLY_GROUP_FOR_SUPPORT_MES
                , tb_4.NOTE
                , tb_4.DESCRIPTION
                , tb_4.UPDATE_BY
                , DATE_FORMAT(tb_4.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
            FROM
                ITEM_PRODUCT_DETAIL tb_1
            JOIN
                dataItem.STANDARD_COST_DB.SCT tb_4
            ON
                tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_4.INUSE = 1
            JOIN
                dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_5
            ON
                tb_5.SCT_ID = tb_4.SCT_ID AND tb_5.INUSE = 1
            JOIN
                dataItem.STANDARD_COST_DB.SCT_PATTERN tb_6
            ON
                tb_4.SCT_PATTERN_ID = tb_6.SCT_PATTERN_ID
            JOIN
                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_7
            ON
                tb_4.SCT_ID = tb_7.SCT_ID AND tb_7.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_9
            ON
                tb_5.SCT_STATUS_PROGRESS_ID = tb_9.SCT_STATUS_PROGRESS_ID AND tb_9.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_10
            ON
                tb_4.SCT_ID = tb_10.SCT_ID AND tb_10.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_11
            ON
                tb_10.SCT_REASON_SETTING_ID = tb_11.SCT_REASON_SETTING_ID AND tb_11.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_12
            ON
                tb_4.SCT_ID = tb_12.SCT_ID AND tb_12.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_13
            ON
                tb_12.SCT_TAG_SETTING_ID = tb_13.SCT_TAG_SETTING_ID AND tb_13.INUSE = 1
            LEFT JOIN
                PRODUCT_TYPE tb_14
            ON
                tb_4.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID AND tb_14.INUSE = 1
            LEFT JOIN
                PRODUCT_SUB tb_15
            ON
                tb_14.PRODUCT_SUB_ID = tb_15.PRODUCT_SUB_ID AND tb_15.INUSE = 1
            LEFT JOIN
                PRODUCT_MAIN tb_16
            ON
                tb_15.PRODUCT_MAIN_ID = tb_16.PRODUCT_MAIN_ID AND tb_16.INUSE = 1
            LEFT JOIN
                PRODUCT_CATEGORY tb_17
            ON
                tb_16.PRODUCT_CATEGORY_ID = tb_17.PRODUCT_CATEGORY_ID AND tb_17.INUSE = 1
            LEFT JOIN
                PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_18
            ON
                tb_14.PRODUCT_TYPE_ID = tb_18.PRODUCT_TYPE_ID AND tb_18.INUSE = 1
            LEFT JOIN
                PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_19
            ON
                tb_18.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_19.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID AND tb_19.INUSE = 1
            LEFT JOIN
                PRODUCT_SPECIFICATION_TYPE tb_20
            ON
                tb_19.PRODUCT_SPECIFICATION_TYPE_ID = tb_20.PRODUCT_SPECIFICATION_TYPE_ID AND tb_20.INUSE = 1
            LEFT JOIN
                BOM tb_21
            ON
                tb_4.BOM_ID = tb_21.BOM_ID AND tb_21.INUSE = 1
            LEFT JOIN
                FLOW tb_22
            ON
                tb_21.FLOW_ID = tb_22.FLOW_ID AND tb_22.INUSE = 1
            LEFT JOIN
                PRODUCT_TYPE_ITEM_CATEGORY tb_23
            ON
                tb_4.PRODUCT_TYPE_ID = tb_23.PRODUCT_TYPE_ID AND tb_23.INUSE = 1
            LEFT JOIN
                ITEM_CATEGORY tb_24
            ON
                tb_23.ITEM_CATEGORY_ID = tb_24.ITEM_CATEGORY_ID AND tb_24.INUSE = 1
            LEFT JOIN
                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_25
            ON
                tb_4.PRODUCT_TYPE_ID = tb_25.PRODUCT_TYPE_ID AND tb_25.INUSE = 1
            LEFT JOIN
                CUSTOMER_INVOICE_TO tb_26
            ON
                tb_25.CUSTOMER_INVOICE_TO_ID = tb_26.CUSTOMER_INVOICE_TO_ID AND tb_26.INUSE = 1
            LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_27
            ON
                tb_4.SCT_ID = tb_27.SCT_ID AND tb_27.INUSE = 1
            WHERE
                    tb_1.ITEM_ID = 'dataItem.ITEM_ID'
                AND tb_5.SCT_STATUS_PROGRESS_ID > 3
                AND tb_4.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                AND tb_4.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'


                sqlWhereColumnFilter
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  get: async (dataItem: {
    SCT_REVISION_CODE: string
    FISCAL_YEAR: number
    SCT_PATTERN_ID: number
    BOM_ID: number
    PRODUCT_TYPE_ID: number
    PRODUCT_CATEGORY_ID: number
    PRODUCT_MAIN_ID: number
    PRODUCT_SUB_ID: number
    sqlWhere: string
    Order: string
    Start: number
    Limit: number
  }) => {
    let sql = `
                  SELECT
                          tb_1.SCT_ID
                        , tb_1.SCT_REVISION_CODE
                        , tb_1.FISCAL_YEAR
                        , tb_1.BOM_ID
                        , tb_5.PRODUCT_TYPE_ID
                        , tb_5.PRODUCT_TYPE_CODE
                        , tb_5.PRODUCT_TYPE_CODE_FOR_SCT
                        , tb_5.PRODUCT_TYPE_NAME
                        , tb_6.PRODUCT_SUB_ID
                        , tb_6.PRODUCT_SUB_NAME
                        , tb_7.PRODUCT_MAIN_ID
                        , tb_7.PRODUCT_MAIN_NAME
                        , tb_8.PRODUCT_CATEGORY_ID
                        , tb_8.PRODUCT_CATEGORY_NAME
                        , tb_10.SCT_PATTERN_ID
                        , tb_10.SCT_PATTERN_NAME
                        , tb_11.BOM_NAME
                        , tb_11.BOM_CODE
                        , tb_12.SCT_STATUS_PROGRESS_ID
                        , tb_12.SCT_STATUS_PROGRESS_NAME
                        , tb_13.FLOW_ID
                        , tb_13.FLOW_NAME
                        , tb_13.FLOW_CODE
                        , tb_13.TOTAL_COUNT_PROCESS
                  FROM
                          dataItem.STANDARD_COST_DB.SCT tb_1
                              JOIN
                          PRODUCT_TYPE tb_5
                              ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                              JOIN
                          PRODUCT_SUB tb_6
                              ON tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID
                              JOIN
                          PRODUCT_MAIN tb_7
                              ON tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID
                              JOIN
                          PRODUCT_CATEGORY tb_8
                              ON tb_7.PRODUCT_CATEGORY_ID = tb_8.PRODUCT_CATEGORY_ID
                              JOIN
                          dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_9
                              ON tb_1.SCT_ID = tb_9.SCT_ID
                              AND tb_9.INUSE = 1
                              JOIN
                          dataItem.STANDARD_COST_DB.SCT_PATTERN tb_10
                                ON tb_1.SCT_PATTERN_ID = tb_10.SCT_PATTERN_ID
                                JOIN
                          BOM tb_11
                                ON tb_1.BOM_ID = tb_11.BOM_ID
                                JOIN
                          dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_12
                                ON tb_9.SCT_STATUS_PROGRESS_ID = tb_12.SCT_STATUS_PROGRESS_ID
                                JOIN
                          FLOW tb_13
                                ON tb_11.FLOW_ID = tb_13.FLOW_ID
                  WHERE

                          dataItem.sqlWhere

                  ORDER BY
                          dataItem.Order
                  LIMIT
                          dataItem.Start
                        , dataItem.Limit
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)

    sql = sql.replaceAll('dataItem.SCT_REVISION_CODE', dataItem['SCT_REVISION_CODE'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'].toString())

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'].toString())
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'].toString())
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'].toString())

    return sql
  },
}
