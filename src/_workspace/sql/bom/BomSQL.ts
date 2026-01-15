export const BomSQL = {
  getByBomNameAndProductMainIdAndInuse: async (dataItem: any) => {
    let sql = `      SELECT
                            tb_1.BOM_ID
                          , tb_1.BOM_NAME
                          , tb_1.BOM_CODE
                          , tb_1.FLOW_ID
                        FROM
                          BOM tb_1
                              INNER JOIN
                          PRODUCT_MAIN tb_2
                              ON (tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID' ) = tb_2.PRODUCT_MAIN_ID
                        WHERE
                              tb_1.BOM_NAME LIKE '%dataItem.BOM_NAME%'
                          AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                          tb_1.BOM_NAME ASC
                        LIMIT
                          50
              `

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] ? dataItem['PRODUCT_MAIN_ID'] : '')
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] ? dataItem['INUSE'] : '')

    return sql
  },
  getByBomCodeAndProductMainIdAndInuse: async (dataItem: any) => {
    let sql = `      SELECT
                            tb_1.BOM_ID
                          , tb_1.BOM_NAME
                          , tb_1.BOM_CODE
                          , tb_1.FLOW_ID
                        FROM
                          BOM tb_1
                              INNER JOIN
                          PRODUCT_MAIN tb_2
                              ON (tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID' ) = tb_2.PRODUCT_MAIN_ID
                        WHERE
                              tb_1.BOM_CODE LIKE '%dataItem.BOM_CODE%'
                          AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                          tb_1.BOM_NAME ASC
                        LIMIT
                          50
              `

    sql = sql.replaceAll('dataItem.BOM_CODE', dataItem['BOM_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] ? dataItem['PRODUCT_MAIN_ID'] : '')
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] ? dataItem['INUSE'] : '')

    return sql
  },

  getByLikeBomNameAndInuse: async (dataItem: any) => {
    let sql = `   SELECT
                              BOM_ID
                            , FLOW_ID
                            , BOM_NAME
                            , BOM_CODE
                        FROM
                              BOM
                        WHERE
                              BOM_NAME LIKE '%dataItem.BOM_NAME%'
                          AND INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                          BOM_NAME ASC
                        LIMIT
                          50
                        `

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('getBy', sql)
    return sql
  },

  getByLikeBomCodeAndProductMainIdAndInuse: async (dataItem: any) => {
    let sql = `             SELECT
                                      tb_1.BOM_ID
                                    , tb_1.BOM_NAME
                                    , tb_1.BOM_CODE
                                    , tb_1.FLOW_ID
                            FROM
                                    BOM tb_1
                            WHERE
                                        tb_1.BOM_CODE LIKE '%dataItem.BOM_CODE%'
                                    AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                    AND tb_1.INUSE = 1
                            ORDER BY
                                    tb_1.BOM_CODE ASC
                            LIMIT
                                    50`

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.BOM_CODE', dataItem['BOM_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  // search: async (dataItem: any) => {
  //   let sqlList: any = []

  //   let sql = `   SELECT
  //                       COUNT(*) AS TOTAL_COUNT
  //                   FROM
  //                        (
  //                   SELECT
  //                           dataItem.selectInuseForSearch
  //                   FROM
  //                           dataItem.sqlJoin
  //                           dataItem.sqlWhere
  //                           dataItem.sqlHaving

  //                   )  AS TB_COUNT
  //                       `

  //   sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
  //   sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

  //   sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
  //   sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
  //   sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

  //   sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])

  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

  //   sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])

  //   sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
  //   sql = sql.replaceAll('dataItem.BOM_CODE', dataItem['BOM_CODE'])

  //   sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

  //   sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_ID', dataItem['PRODUCTION_PURPOSE_ID'])
  //   sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //   sqlList.push(sql)

  //   sql = `
  //                   SELECT
  //                                 tb_1.BOM_ID
  //                               , tb_1.BOM_CODE
  //                               , tb_1.BOM_NAME
  //                               , tb_1.REVISION
  //                               , tb_1.PRODUCTION_PURPOSE_ID
  //                               , tb_2.PRODUCTION_PURPOSE_NAME
  //                               , tb_2.PRODUCTION_PURPOSE_ALPHABET
  //                               , tb_1.FLOW_ID
  //                               , tb_3.FLOW_CODE
  //                               , tb_3.FLOW_NAME
  //                               , tb_3.TOTAL_COUNT_PROCESS
  //                               , tb_4.PRODUCT_MAIN_ID
  //                               , tb_4.PRODUCT_MAIN_NAME
  //                               , tb_4.PRODUCT_MAIN_ALPHABET
  //                               , tb_5.PRODUCT_CATEGORY_ID
  //                               , tb_5.PRODUCT_CATEGORY_NAME
  //                               , tb_1.UPDATE_BY
  //                               , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
  //                               , (IF (tb_1.INUSE = 0 ,0 ,IF(
  //                                   EXISTS
  //                                           (
  //                                               SELECT
  //                                                   tbs_1.BOM_ID
  //                                               FROM
  //                                                   SCT_BOM tbs_1
  //                                                           INNER JOIN
  //                                                   SCT tbs_2 ON tbs_1.SCT_ID = tbs_2.SCT_ID
  //                                                   AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1
  //                                                   AND tbs_1.BOM_ID = tb_1.BOM_ID) = TRUE
  //                                           , 2
  //                                           ,   IF(
  //                                                       EXISTS
  //                                                       (
  //                                                               SELECT
  //                                                                   BOM_ID
  //                                                               FROM
  //                                                                   SCT_BOM
  //                                                               WHERE
  //                                                                   BOM_ID = tb_1.BOM_ID
  //                                                       ) = TRUE
  //                                           , 3
  //                                           , 1
  //                                           )))) AS inuseForSearch
  //                               , tb_1.INUSE AS INUSE_RAW_DATA
  //                               , (
  //                                   IF(
  //                                       EXISTS
  //                                               (
  //                                                   SELECT
  //                                                       BOM_ID
  //                                                   FROM
  //                                                       BOM_TEMPORARY
  //                                                   WHERE
  //                                                       BOM_ID = tb_1.BOM_ID
  //                                                       AND INUSE = 1
  //                                               ) = TRUE
  //                                   , 1
  //                                   , 0
  //                                   )
  //                               ) AS IS_DRAFT
  //                   FROM
  //                               dataItem.sqlJoin
  //                         dataItem.sqlWhere
  //                         dataItem.sqlHaving

  //                   ORDER BY
  //                               dataItem.Order
  //                   LIMIT
  //                                 dataItem.Start
  //                               , dataItem.Limit
  //             `

  //   sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
  //   sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
  //   sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
  //   sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
  //   sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])
  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
  //   sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])

  //   sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
  //   sql = sql.replaceAll('dataItem.BOM_CODE', dataItem['BOM_CODE'])

  //   sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

  //   sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_ID', dataItem['PRODUCTION_PURPOSE_ID'])

  //   sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //   sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
  //   sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
  //   sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
  //   sqlList.push(sql)

  //   sqlList = sqlList.join(';')

  //   return sqlList
  // },

  //! searchBackUpFluke -----------------------------------------------

  search: async (dataItem: any, sqlWhere: string, sqlJoin: string, sqlSelect: string) => {
    let sqlList: any = []

    let sql = `   SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        BOM tb_1
                            INNER JOIN
                        PRODUCTION_PURPOSE tb_2
                            ON tb_1.PRODUCTION_PURPOSE_ID = tb_2.PRODUCTION_PURPOSE_ID
                            INNER JOIN
                        FLOW tb_3
                            ON tb_1.FLOW_ID = tb_3.FLOW_ID
                            INNER JOIN
                        PRODUCT_MAIN tb_4
                            ON tb_1.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                            INNER JOIN
                        PRODUCT_CATEGORY tb_5
                            ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                        dataItem.sqlJoin
                    WHERE
                            tb_1.BOM_NAME LIKE '%dataItem.BOM_NAME%'
                        AND tb_1.BOM_CODE LIKE '%dataItem.BOM_CODE%'

                        dataItem.sqlWhere
                        sqlWhereColumnFilter
                        `

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.sqlJoin', sqlJoin)
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.BOM_CODE', dataItem['BOM_CODE'])

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

    sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_ID', dataItem['PRODUCTION_PURPOSE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sqlList.push(sql)

    sql = `
                    SELECT
                                  tb_1.BOM_ID
                                , tb_1.BOM_CODE
                                , tb_1.BOM_NAME
                                , tb_1.REVISION
                                , tb_1.PRODUCTION_PURPOSE_ID
                                , tb_2.PRODUCTION_PURPOSE_NAME
                                , tb_2.PRODUCTION_PURPOSE_ALPHABET
                                , tb_1.FLOW_ID
                                , tb_3.FLOW_CODE
                                , tb_3.FLOW_NAME
                                , tb_3.TOTAL_COUNT_PROCESS
                                , tb_4.PRODUCT_MAIN_ID
                                , tb_4.PRODUCT_MAIN_NAME
                                , tb_4.PRODUCT_MAIN_ALPHABET
                                , tb_5.PRODUCT_CATEGORY_ID
                                , tb_5.PRODUCT_CATEGORY_NAME
                                , tb_1.UPDATE_BY
                                , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                , (IF (tb_1.INUSE = 0 ,0 ,IF(
                                    EXISTS
                                            (
                                                SELECT
                                                    tbs_1.BOM_ID
                                                FROM
                                                    SCT_BOM tbs_1
                                                            INNER JOIN
                                                    SCT tbs_2 ON tbs_1.SCT_ID = tbs_2.SCT_ID
                                                    AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1
                                                    AND tbs_1.BOM_ID = tb_1.BOM_ID) = TRUE
                                            , 2
                                            ,   IF(
                                                        EXISTS
                                                        (
                                                                SELECT
                                                                    BOM_ID
                                                                FROM
                                                                    SCT_BOM
                                                                WHERE
                                                                    BOM_ID = tb_1.BOM_ID
                                                        ) = TRUE
                                            , 3
                                            , 1
                                            )))) AS INUSE
                                , tb_1.INUSE AS INUSE_RAW_DATA
                                , (
                                    IF(
                                        EXISTS
                                                (
                                                    SELECT
                                                        BOM_ID
                                                    FROM
                                                        BOM_TEMPORARY
                                                    WHERE
                                                        BOM_ID = tb_1.BOM_ID
                                                        AND INUSE = 1
                                                ) = TRUE
                                    , 1
                                    , 0
                                    )
                                ) AS IS_DRAFT
                                dataItem.sqlSelect
                    FROM
                                BOM tb_1
                                    INNER JOIN
                                PRODUCTION_PURPOSE tb_2
                                    ON tb_1.PRODUCTION_PURPOSE_ID = tb_2.PRODUCTION_PURPOSE_ID
                                    INNER JOIN
                                FLOW tb_3
                                    ON tb_1.FLOW_ID = tb_3.FLOW_ID
                                    INNER JOIN
                                PRODUCT_MAIN tb_4
                                    ON tb_1.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                                    INNER JOIN
                                PRODUCT_CATEGORY tb_5
                                    ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                                dataItem.sqlJoin
                                WHERE
                                    tb_1.BOM_NAME LIKE '%dataItem.BOM_NAME%'
                                AND tb_1.BOM_CODE LIKE '%dataItem.BOM_CODE%'

                                dataItem.sqlWhere
                                sqlWhereColumnFilter

                    ORDER BY
                                dataItem.Order
                    LIMIT
                                  dataItem.Start
                                , dataItem.Limit
              `

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.sqlSelect', sqlSelect)
    sql = sql.replaceAll('dataItem.sqlJoin', sqlJoin)
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.InuseRawData', dataItem['InuseRawData'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.BOM_CODE', dataItem['BOM_CODE'])

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

    sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_ID', dataItem['PRODUCTION_PURPOSE_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')
    // console.log(sql)

    return sqlList
  },
  searchBomDetailsByBomId_: async (dataItem: any) => {
    let sql = `
         SELECT
                           tb_9.PROCESS_ID
                          , tb_9.PROCESS_NAME
                          , tb_8.NO
                          , tb_10.ITEM_ID
                          , tb_12.ITEM_INTERNAL_CODE
                          , tb_12.ITEM_INTERNAL_FULL_NAME
                          , tb_12.ITEM_CODE_FOR_SUPPORT_MES
                          , tb_12.IMAGE_PATH
                          , tb_10.USAGE_QUANTITY
                          , tb_13.UNIT_OF_MEASUREMENT_NAME
                          , tb_16.PURCHASE_MODULE_ID
                          , tb_16.ITEM_CATEGORY_ID
                          , tb_16.ITEM_CATEGORY_NAME
                          , tb_16.ITEM_CATEGORY_ALPHABET
                          , tb_16.ITEM_CATEGORY_SHORT_NAME
                          , tb_17.PRODUCT_MAIN_ID
                          , tb_17.PRODUCT_MAIN_NAME
                          , tb_17.PRODUCT_MAIN_ALPHABET
                ,   tb_1.BOM_NAME
                , tb_1.BOM_CODE
                , tb_2.FLOW_NAME
                , tb_2.FLOW_CODE
                  FROM
                             BOM tb_1
                                  INNER JOIN flow tb_2
                                  ON  tb_1.BOM_ID = dataItem.BOM_ID AND tb_1.FLOW_ID = tb_2.FLOW_ID
                                  INNER JOIN
                                  FLOW_PROCESS tb_8
                                  ON tb_2.FLOW_ID = tb_8.FLOW_ID
                                  AND tb_8.INUSE = 1
                                  INNER JOIN
                                  PROCESS tb_9
                                  ON tb_8.PROCESS_ID = tb_9.PROCESS_ID
                                  LEFT JOIN (
        								BOM_FLOW_PROCESS_ITEM_USAGE tb_10
        								INNER JOIN ITEM tb_11  ON  tb_10.ITEM_ID = tb_11.ITEM_ID
        								INNER JOIN   ITEM_MANUFACTURING tb_12
                                  		ON tb_11.ITEM_ID = tb_12.ITEM_ID
                                  		INNER JOIN
                                  		UNIT_OF_MEASUREMENT tb_13
                                  		ON tb_12.USAGE_UNIT_ID  = tb_13.UNIT_OF_MEASUREMENT_ID
                                  		INNER JOIN
                          				ITEM_CATEGORY tb_14
                                  		ON tb_11.ITEM_CATEGORY_ID = tb_14.ITEM_CATEGORY_ID
                                  		INNER JOIN
                                  		bom_flow_process_item_change_item_category tb_15
                                  		ON tb_10.BOM_ID = tb_15.BOM_ID
                                      AND tb_10.FLOW_PROCESS_ID = tb_15.FLOW_PROCESS_ID
                                      AND tb_10.ITEM_ID = tb_15.ITEM_ID AND tb_10.NO = tb_15.NO AND tb_15.INUSE = 1
                                  		INNER JOIN
                          				ITEM_CATEGORY tb_16
                                  		ON tb_16.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
    							  ) ON tb_1.BOM_ID = tb_10.BOM_ID AND tb_8.FLOW_PROCESS_ID = tb_10.FLOW_PROCESS_ID AND tb_10.INUSE = 1
                                      INNER JOIN
                                    PRODUCT_MAIN tb_17
                                    ON tb_1.PRODUCT_MAIN_ID = tb_17.PRODUCT_MAIN_ID
                        ORDER BY
                            tb_8.NO
                          , tb_10.NO
             `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem.BOM_ID)
    // console.log(sql)

    return sql
  },
  searchBomDetailsByBomIdAndProductTypeId: async (dataItem: any) => {
    let sql = `
         SELECT
                            tb_9.PROCESS_ID
                          , tb_9.PROCESS_NAME
                          , tb_8.NO
                          , tb_10.ITEM_ID
                          , tb_12.ITEM_INTERNAL_CODE
                          , tb_12.ITEM_INTERNAL_FULL_NAME
                          , tb_12.ITEM_CODE_FOR_SUPPORT_MES
                          , tb_12.IMAGE_PATH
                          , tb_10.USAGE_QUANTITY
                          , tb_13.UNIT_OF_MEASUREMENT_NAME
                          , tb_16.PURCHASE_MODULE_ID
                          , tb_16.ITEM_CATEGORY_ID
                          , tb_16.ITEM_CATEGORY_NAME
                          , tb_16.ITEM_CATEGORY_ALPHABET
                          , tb_16.ITEM_CATEGORY_SHORT_NAME
                          , tb_6.PRODUCT_MAIN_NAME
                          , tb_6.PRODUCT_MAIN_ID
                          , tb_6.PRODUCT_MAIN_ALPHABET
                          , tb_1.BOM_NAME
                          , tb_1.BOM_CODE
                          , tb_2.FLOW_NAME
                          , tb_2.FLOW_CODE
                          , tb_4.PRODUCT_TYPE_ID
                          , tb_4.PRODUCT_TYPE_NAME
                          , tb_4.PRODUCT_TYPE_CODE
                          , tb_7.PRODUCT_CATEGORY_NAME
                          , tb_7.PRODUCT_CATEGORY_ID
                  FROM
                             BOM tb_1
                                  INNER JOIN flow tb_2
                                  ON  tb_1.BOM_ID = dataItem.BOM_ID AND tb_1.FLOW_ID = tb_2.FLOW_ID
                                  INNER JOIN
                                  product_type_bom tb_3
                                  ON tb_3.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID and  tb_1.BOM_ID = tb_3.BOM_ID and tb_3.INUSE = 1
                                  INNER JOIN product_type tb_4
                                  ON tb_3.PRODUCT_TYPE_ID  = tb_4.PRODUCT_TYPE_ID
                                  INNER JOIN product_sub tb_5
                                  ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
                                  INNER JOIN product_main tb_6
                                  ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
                                  INNER JOIN product_category tb_7
                                  ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
                                  INNER JOIN
                                  FLOW_PROCESS tb_8
                                  ON tb_2.FLOW_ID = tb_8.FLOW_ID
                                  AND tb_8.INUSE = 1
                                  INNER JOIN
                                  PROCESS tb_9
                                  ON tb_8.PROCESS_ID = tb_9.PROCESS_ID
                                  LEFT JOIN (
        								BOM_FLOW_PROCESS_ITEM_USAGE tb_10
        								INNER JOIN ITEM tb_11  ON  tb_10.ITEM_ID = tb_11.ITEM_ID
        								INNER JOIN   ITEM_MANUFACTURING tb_12
                                  		ON tb_11.ITEM_ID = tb_12.ITEM_ID
                                  		INNER JOIN
                                  		UNIT_OF_MEASUREMENT tb_13
                                  		ON tb_12.USAGE_UNIT_ID  = tb_13.UNIT_OF_MEASUREMENT_ID
                                  		INNER JOIN
                          				ITEM_CATEGORY tb_14
                                  		ON tb_11.ITEM_CATEGORY_ID = tb_14.ITEM_CATEGORY_ID
                                  		INNER JOIN
                                  		bom_flow_process_item_change_item_category tb_15
                                  		ON tb_10.BOM_ID = tb_15.BOM_ID
                                      AND tb_10.FLOW_PROCESS_ID = tb_15.FLOW_PROCESS_ID
                                      AND tb_10.ITEM_ID = tb_15.ITEM_ID
                                      AND tb_10.NO = tb_15.NO
                                      AND tb_15.INUSE = 1
                                  		INNER JOIN
                          				ITEM_CATEGORY tb_16
                                  		ON tb_16.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
    							  ) ON tb_1.BOM_ID = tb_10.BOM_ID AND tb_8.FLOW_PROCESS_ID = tb_10.FLOW_PROCESS_ID AND tb_10.INUSE = 1
                        ORDER BY
                            tb_8.NO
                          , tb_10.NO
             `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem.BOM_ID)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem.PRODUCT_TYPE_ID)

    return sql
  },
  searchBomDetailsByBomId: async (dataItem: any) => {
    let sql = `
            SELECT
          dataAll.*
        , ic.ITEM_CATEGORY_NAME
        FROM (
            SELECT
                  tb_4.PROCESS_ID
                , tb_4.PROCESS_NAME
                , tb_2.NO
                , tb_5.ITEM_ID
                , tb_14.ITEM_CATEGORY_NAME
                , tb_13.ITEM_CATEGORY_ID
                , IFNULL(tb_14.ITEM_CATEGORY_ALPHABET, tb_6.ITEM_CATEGORY_ALPHABET) AS ITEM_CATEGORY_ALPHABET
                , IFNULL(tb_14.ITEM_CATEGORY_SHORT_NAME, tb_6.ITEM_CATEGORY_SHORT_NAME) AS ITEM_CATEGORY_SHORT_NAME
                , tb_7.ITEM_CODE_FOR_SUPPORT_MES
                , tb_7.ITEM_INTERNAL_FULL_NAME
                , tb_8.UNIT_OF_MEASUREMENT_NAME
                , tb_3.USAGE_QUANTITY
                , tb_9.PRODUCT_MAIN_NAME
                , tb_9.PRODUCT_MAIN_ID
                , tb_9.PRODUCT_MAIN_ALPHABET
                , tb_1.BOM_NAME
                , tb_1.BOM_CODE
                , tb_10.FLOW_NAME
                , tb_10.FLOW_CODE
                , tb_12.PRODUCT_TYPE_ID
                , tb_12.PRODUCT_TYPE_NAME
                , tb_12.PRODUCT_TYPE_CODE
                , tb_15.PRODUCT_CATEGORY_NAME
                , tb_15.PRODUCT_CATEGORY_ID
            FROM
                BOM tb_1
            LEFT JOIN
                FLOW_PROCESS tb_2
              ON
                (tb_1.FLOW_ID = tb_2.FLOW_ID AND tb_2.INUSE = 1)
            LEFT JOIN
                BOM_FLOW_PROCESS_ITEM_USAGE tb_3
              ON
                (tb_2.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID AND tb_3.INUSE = 1 AND tb_3.BOM_ID = 'dataItem.BOM_ID')
            LEFT JOIN
                PROCESS tb_4
              ON
                tb_2.PROCESS_ID = tb_4.PROCESS_ID
            LEFT JOIN
                ITEM tb_5
              ON
                tb_3.ITEM_ID = tb_5.ITEM_ID
            LEFT JOIN
                ITEM_CATEGORY tb_6
              ON
                tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID
            LEFT JOIN
                ITEM_MANUFACTURING tb_7
              ON
                tb_5.ITEM_ID = tb_7.ITEM_ID
            LEFT JOIN
                UNIT_OF_MEASUREMENT tb_8
              ON
                tb_7.USAGE_UNIT_ID = tb_8.UNIT_OF_MEASUREMENT_ID
            JOIN
                PRODUCT_MAIN tb_9
              ON
                tb_1.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID
            JOIN
                FLOW tb_10
              ON
                tb_1.FLOW_ID = tb_10.FLOW_ID
            LEFT JOIN
                PRODUCT_TYPE_BOM tb_11
              ON
                tb_1.BOM_ID = tb_11.BOM_ID AND tb_11.INUSE = 1
            LEFT JOIN
                PRODUCT_TYPE tb_12
              ON
                tb_11.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID
            LEFT JOIN
                BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_13
              ON
                    (tb_3.BOM_ID = tb_13.BOM_ID AND tb_13.INUSE = 1 and tb_3.INUSE=1 and tb_3.NO = tb_13.NO )
            LEFT JOIN
                ITEM_CATEGORY tb_14
              ON
                tb_13.ITEM_CATEGORY_ID = tb_14.ITEM_CATEGORY_ID
            JOIN
                PRODUCT_CATEGORY tb_15
              ON
                tb_9.PRODUCT_CATEGORY_ID = tb_15.PRODUCT_CATEGORY_ID
            WHERE
                tb_1.BOM_ID = dataItem.BOM_ID

            ORDER BY
                tb_2.NO, tb_3.NO
                                  ) dataAll
                  LEFT JOIN ITEM_CATEGORY ic ON dataAll.ITEM_CATEGORY_ID = ic.ITEM_CATEGORY_ID
             `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem.BOM_ID)
    // console.log(sql)
    //  , IFNULL(tb_14.ITEM_CATEGORY_NAME, tb_6.ITEM_CATEGORY_NAME) AS ITEM_CATEGORY_NAME
    //           , IFNULL(tb_14.ITEM_CATEGORY_ID, tb_6.ITEM_CATEGORY_ID) AS ITEM_CATEGORY_ID
    // LEFT JOIN
    //         BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_13
    //       ON
    //         (tb_3.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_13.BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY_ID AND tb_13.INUSE = 1)
    return sql
  },
  //   searchBomDetailsByBomId: async (dataItem: any) => {
  //   let sql = `
  //           SELECT
  //                 tb_4.PROCESS_ID
  //               , tb_4.PROCESS_NAME
  //               , tb_2.NO
  //               , tb_5.ITEM_ID
  //               , tb_14.ITEM_CATEGORY_NAME
  //               , tb_13.ITEM_CATEGORY_ID
  //               , IFNULL(tb_14.ITEM_CATEGORY_ALPHABET, tb_6.ITEM_CATEGORY_ALPHABET) AS ITEM_CATEGORY_ALPHABET
  //               , IFNULL(tb_14.ITEM_CATEGORY_SHORT_NAME, tb_6.ITEM_CATEGORY_SHORT_NAME) AS ITEM_CATEGORY_SHORT_NAME
  //               , tb_7.ITEM_CODE_FOR_SUPPORT_MES
  //               , tb_7.ITEM_INTERNAL_FULL_NAME
  //               , tb_8.UNIT_OF_MEASUREMENT_NAME
  //               , tb_3.USAGE_QUANTITY
  //               , tb_9.PRODUCT_MAIN_NAME
  //               , tb_9.PRODUCT_MAIN_ID
  //               , tb_9.PRODUCT_MAIN_ALPHABET
  //               , tb_1.BOM_NAME
  //               , tb_1.BOM_CODE
  //               , tb_10.FLOW_NAME
  //               , tb_10.FLOW_CODE
  //               , tb_12.PRODUCT_TYPE_ID
  //               , tb_12.PRODUCT_TYPE_NAME
  //               , tb_12.PRODUCT_TYPE_CODE
  //               , tb_15.PRODUCT_CATEGORY_NAME
  //               , tb_15.PRODUCT_CATEGORY_ID
  //           FROM
  //               BOM tb_1
  //           LEFT JOIN
  //               FLOW_PROCESS tb_2
  //             ON
  //               (tb_1.FLOW_ID = tb_2.FLOW_ID AND tb_2.INUSE = 1)
  //           LEFT JOIN
  //               BOM_FLOW_PROCESS_ITEM_USAGE tb_3
  //             ON
  //               (tb_2.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID AND tb_3.INUSE = 1 AND tb_3.BOM_ID = 'dataItem.BOM_ID')
  //           LEFT JOIN
  //               PROCESS tb_4
  //             ON
  //               tb_2.PROCESS_ID = tb_4.PROCESS_ID
  //           LEFT JOIN
  //               ITEM tb_5
  //             ON
  //               tb_3.ITEM_ID = tb_5.ITEM_ID
  //           LEFT JOIN
  //               ITEM_CATEGORY tb_6
  //             ON
  //               tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID
  //           LEFT JOIN
  //               ITEM_MANUFACTURING tb_7
  //             ON
  //               tb_5.ITEM_ID = tb_7.ITEM_ID
  //           LEFT JOIN
  //               UNIT_OF_MEASUREMENT tb_8
  //             ON
  //               tb_7.USAGE_UNIT_ID = tb_8.UNIT_OF_MEASUREMENT_ID
  //           JOIN
  //               PRODUCT_MAIN tb_9
  //             ON
  //               tb_1.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID
  //           JOIN
  //               FLOW tb_10
  //             ON
  //               tb_1.FLOW_ID = tb_10.FLOW_ID
  //           LEFT JOIN
  //               PRODUCT_TYPE_BOM tb_11
  //             ON
  //               tb_1.BOM_ID = tb_11.BOM_ID AND tb_11.INUSE = 1
  //           LEFT JOIN
  //               PRODUCT_TYPE tb_12
  //             ON
  //               tb_11.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID
  //           LEFT JOIN
  //               BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_13
  //             ON
  //                   (tb_3.BOM_ID = tb_13.BOM_ID AND tb_13.INUSE = 1 and tb_3.INUSE=1 and tb_3.NO = tb_13.NO )
  //           LEFT JOIN
  //               ITEM_CATEGORY tb_14
  //             ON
  //               tb_13.ITEM_CATEGORY_ID = tb_14.ITEM_CATEGORY_ID
  //           JOIN
  //               PRODUCT_CATEGORY tb_15
  //             ON
  //               tb_9.PRODUCT_CATEGORY_ID = tb_15.PRODUCT_CATEGORY_ID
  //           WHERE
  //               tb_1.BOM_ID = dataItem.BOM_ID

  //           ORDER BY
  //               tb_2.NO, tb_3.NO
  //            `

  //   sql = sql.replaceAll('dataItem.BOM_ID', dataItem.BOM_ID)
  //   // console.log(sql)
  //   //  , IFNULL(tb_14.ITEM_CATEGORY_NAME, tb_6.ITEM_CATEGORY_NAME) AS ITEM_CATEGORY_NAME
  //   //           , IFNULL(tb_14.ITEM_CATEGORY_ID, tb_6.ITEM_CATEGORY_ID) AS ITEM_CATEGORY_ID
  //   // LEFT JOIN
  //   //         BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_13
  //   //       ON
  //   //         (tb_3.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_13.BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY_ID AND tb_13.INUSE = 1)
  //   return sql
  // },
  createBomId: async () => {
    let sql = `
             SET @bomId=(1 + coalesce((SELECT max(BOM_ID) FROM BOM), 0));
             `

    return sql
  },
  createBom: async (dataItem: any) => {
    let sql = `
              INSERT INTO BOM
                (
                    BOM_ID
                    , BOM_NAME
                    , BOM_CODE
                    , PRODUCT_MAIN_ID
                    , PRODUCTION_PURPOSE_ID
                    , FLOW_ID
                    , REVISION
                    , CREATE_BY
                    , UPDATE_DATE
                    , UPDATE_BY
                )
            SELECT
                        @bomId
                    , 'dataItem.BOM_NAME'
                    ,  CONCAT(
                               'B'
                              ,'dataItem.PRODUCTION_PURPOSE_ALPHABET'
                              ,'-'
                              ,'dataItem.PRODUCT_MAIN_ALPHABET'
                              ,'-'
                              , LPAD((COUNT(BOM_ID) + 1), 5, 0)
                            )
                    , 'dataItem.PRODUCT_MAIN_ID'
                    , 'dataItem.PRODUCTION_PURPOSE_ID'
                    , 'dataItem.FLOW_ID'
                    ,  LPAD(COUNT(1) + 1, 2, 0) AS REVISION
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
            FROM
                    BOM
            WHERE
                    PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                    AND PRODUCTION_PURPOSE_ID = 'dataItem.PRODUCTION_PURPOSE_ID' ;
             `

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    // sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_ID', dataItem['PRODUCTION_PURPOSE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_ID', '1')
    // sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_ALPHABET', dataItem['PRODUCTION_PURPOSE_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCTION_PURPOSE_ALPHABET', 'M')
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  updateBom: async (dataItem: any) => {
    let sql = `
              UPDATE
                    BOM
                SET
                      BOM_NAME = 'dataItem.BOM_NAME'
                    , FLOW_ID = 'dataItem.FLOW_ID'
                    , UPDATE_BY = 'dataItem.UPDATE_BY'
                    , UPDATE_DATE = CURRENT_TIMESTAMP()
                WHERE
                    BOM_ID = 'dataItem.BOM_ID'
             `

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  updateUpdateByAndUpdateDateByBomId: async (dataItem: any) => {
    let sql = `
              UPDATE
                    BOM
                SET
                      UPDATE_BY = 'dataItem.CREATE_BY'
                    , UPDATE_DATE = CURRENT_TIMESTAMP()
                WHERE
                    BOM_ID = 'dataItem.BOM_ID'
             `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  checkBomName: async (dataItem: any) => {
    let sql = `   SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                          BOM
                    WHERE
                          BOM_NAME = 'dataItem.BOM_NAME'
                      AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                      AND INUSE = 1
                      ${dataItem['BOM_ID'] ? " AND BOM_ID != 'dataItem.BOM_ID'" : ''}
                    `

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
  createBomTemporary: async (dataItem: any) => {
    let sql = `
              INSERT INTO BOM_TEMPORARY
                (
                      BOM_ID
                    , CREATE_BY
                    , UPDATE_DATE
                    , UPDATE_BY
                )
                SELECT
                        @bomId
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
             `

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  upsertBomTemporary: async (dataItem: any) => {
    let sql = `
                INSERT INTO BOM_TEMPORARY
                    (
                        BOM_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                    SELECT
                          'dataItem.BOM_ID'
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'
                    ON DUPLICATE KEY UPDATE
                        UPDATE_DATE = CURRENT_TIMESTAMP()
                        , UPDATE_BY = 'dataItem.CREATE_BY'
             `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  deleteBomTemporary: async (dataItem: any) => {
    let sql = `
                DELETE FROM
                    BOM_TEMPORARY
                WHERE
                    BOM_ID = 'dataItem.BOM_ID'
             `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
  deleteBom: async (dataItem: any) => {
    let sql = `
              UPDATE
                  BOM
              SET
                  INUSE = 0
              WHERE
                  BOM_ID = 'dataItem.BOM_ID'
                              `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
  getBomDetailByBomId: async (dataItem: any) => {
    let sql = `
             SELECT
                              tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                            , tb_1.BOM_ID
                            , tb_9.PROCESS_NAME
                            , tb_1.NO
                            , tb_2.ITEM_ID
                            , tb_3.ITEM_INTERNAL_CODE
                            , tb_3.ITEM_INTERNAL_FULL_NAME
                            , tb_3.ITEM_CODE_FOR_SUPPORT_MES
                            , tb_3.IMAGE_PATH
                            , tb_1.USAGE_QUANTITY
                            , tb_3.USAGE_UNIT_ID  AS USAGE_UNIT_ID
                            , tb_4.SYMBOL AS USAGE_UNIT_SYMBOL
                            , tb_2.ITEM_CATEGORY_ID
                            , tb_5.ITEM_CATEGORY_NAME
                            , tb_5.PURCHASE_MODULE_ID
                            , tb_3.USAGE_UNIT_ID  AS ITEM_PRICE_USAGE_UNIT_ID
                            , tb_6.UNIT_OF_MEASUREMENT_NAME  AS ITEM_PRICE_USAGE_UNIT_NAME
                            , tb_6.SYMBOL  AS ITEM_PRICE_USAGE_UNIT_SYMBOL
                            , tb_7.NO AS FLOW_PROCESS_NO
                            , tb_11.ITEM_CATEGORY_ID AS ITEM_CATEGORY_ID_FOR_BOM
                            , tb_11.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_NAME_FOR_BOM

                    FROM
                            BOM_FLOW_PROCESS_ITEM_USAGE tb_1
                                    INNER JOIN
                            ITEM tb_2
                                    ON tb_1.ITEM_ID = tb_2.ITEM_ID
                                    AND tb_1.INUSE = 1
                                    INNER JOIN
                            ITEM_MANUFACTURING tb_3
                                    ON tb_1.ITEM_ID = tb_3.ITEM_ID
                                    INNER JOIN
                            UNIT_OF_MEASUREMENT tb_4
                                    ON tb_3.USAGE_UNIT_ID = tb_4.UNIT_OF_MEASUREMENT_ID
                                    INNER JOIN
                            ITEM_CATEGORY tb_5
                                    ON tb_2.ITEM_CATEGORY_ID = tb_5.ITEM_CATEGORY_ID
                                    LEFT JOIN
                            UNIT_OF_MEASUREMENT tb_6
                                    ON tb_3.USAGE_UNIT_ID = tb_6.UNIT_OF_MEASUREMENT_ID
                                    LEFT JOIN
                            FLOW_PROCESS tb_7
                                    ON tb_1.FLOW_PROCESS_ID = tb_7.FLOW_PROCESS_ID
                                    INNER JOIN
                            BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_8
                                    ON  tb_1.BOM_ID = tb_8.BOM_ID
                                        AND tb_7.FLOW_PROCESS_ID = tb_8.FLOW_PROCESS_ID
                                        AND tb_2.ITEM_ID = tb_8.ITEM_ID
                                        AND tb_8.INUSE = '1'
                                    INNER JOIN
                            ITEM_CATEGORY tb_11
                                    ON tb_11.ITEM_CATEGORY_ID = tb_8.ITEM_CATEGORY_ID

                            INNER JOIN PROCESS tb_9 ON tb_9.PROCESS_ID = tb_7.PROCESS_ID
                    WHERE
                                tb_1.BOM_ID ='dataItem.BOM_ID'
                    ORDER BY
                            tb_1.NO`

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
  getBomByLikeProductTypeIdAndCondition: async (dataItem: any, sqlJoin: string) => {
    let sql = `
             SELECT
                      tb_1.PRODUCT_TYPE_ID
                    , tb_1.PRODUCT_TYPE_NAME
                    , tb_1.PRODUCT_TYPE_CODE
                    , tb_4.BOM_ID
                    , tb_4.BOM_CODE
                    , tb_4.BOM_NAME
                    , tb_1.INUSE

						FROM
							      PRODUCT_TYPE tb_1
						INNER JOIN
                    PRODUCT_TYPE_PROGRESS_WORKING tb_2

						    ON
                tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID

                dataItem.sqlJoin


					WHERE
            tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
						AND tb_2.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
						AND tb_1.INUSE = 1

          `
    sql = sql.replaceAll('dataItem.sqlJoin', sqlJoin)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    // console.log(sql)
    return sql
  },
  getItemCodeForSupportMes: async (dataItem: any) => {
    let sql = `SELECT tb_4.ITEM_CODE_FOR_SUPPORT_MES
                      ,tb_1.PRODUCT_MAIN_ID
                      ,tb_1.PRODUCT_MAIN_NAME
                      ,tb_2.BOM_ID
                      ,tb_3.ITEM_ID
                        FROM PRODUCT_MAIN tb_1
                        LEFT JOIN BOM tb_2
                            ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_2.INUSE = 1
                        LEFT JOIN BOM_FLOW_PROCESS_ITEM_USAGE tb_3
                            ON tb_2.BOM_ID = tb_3.BOM_ID AND tb_3.INUSE = 1
                        LEFT JOIN ITEM_MANUFACTURING tb_4
                            ON tb_3.ITEM_ID = tb_4.ITEM_ID AND tb_4.INUSE = 1
                        WHERE tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                        GROUP BY tb_4.ITEM_CODE_FOR_SUPPORT_MES
                        `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },

  getBOMDuplicate: async (dataItem: any, materialBOM: any, count: any) => {
    let sql = `
          SELECT
                tb_1.BOM_ID,
                COUNT(DISTINCT CONCAT(tb_3.PROCESS_ID, '-', tb_2.ITEM_ID, '-', tb_2.USAGE_QUANTITY)) AS match_count
            FROM
                BOM tb_1
                INNER JOIN BOM_FLOW_PROCESS_ITEM_USAGE tb_2 ON tb_1.BOM_ID = tb_2.BOM_ID AND tb_2.INUSE = 1
                INNER JOIN FLOW_PROCESS tb_3 ON tb_2.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID AND tb_3.INUSE = 1
            WHERE
                (
                  dataItem.MATERIAL_BOM
                )
                AND tb_1.INUSE = 1
                AND tb_1.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID
            GROUP BY tb_1.BOM_ID
            HAVING
                COUNT(DISTINCT CONCAT(tb_3.PROCESS_ID, '-', tb_2.ITEM_ID, '-', tb_2.USAGE_QUANTITY)) = dataItem.count
                AND MAX(tb_2.NO) = dataItem.count
                AND COUNT(DISTINCT tb_2.NO) = dataItem.count

                ;
        `

    sql = sql.replaceAll('dataItem.MATERIAL_BOM', materialBOM)
    sql = sql.replaceAll('dataItem.count', count)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    // console.log(sql)

    return sql
  },
  getAll: async () => {
    let sql = `       SELECT
                          BOM_ID
                        , BOM_NAME
                        , BOM_CODE
                      FROM
                        BOM  ;

                    `
    return sql
  },
  // getBOMDuplicate: async (dataItem: any, materialBOM: any) => {
  //   let sql = `
  //           SELECT
  //               tb_1.BOM_ID
  //             , tb_1.BOM_NAME
  //             , tb_1.BOM_CODE
  //             , tb_2.NO
  //             , tb_3.FLOW_PROCESS_ID
  //             , tb_5.PROCESS_NAME
  //             , tb_4.FLOW_ID
  //             , tb_4.FLOW_NAME
  //             , tb_4.FLOW_CODE
  //             , tb_4.TOTAL_COUNT_PROCESS
  //             , tb_4.PRODUCT_MAIN_ID
  //           FROM
  //               BOM tb_1
  //               INNER JOIN BOM_FLOW_PROCESS_ITEM_USAGE tb_2 ON tb_1.BOM_ID = tb_2.BOM_ID AND tb_2.INUSE = 1
  //               INNER JOIN FLOW_PROCESS tb_3 ON tb_2.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID AND tb_3.INUSE = 1
  //               INNER JOIN FLOW tb_4 ON tb_1.FLOW_ID = tb_4.FLOW_ID AND tb_4.INUSE = 1
  //               INNER JOIN PROCESS tb_5 ON tb_3.PROCESS_ID = tb_5.PROCESS_ID AND tb_5.INUSE = 1
  //           WHERE
  //           (dataItem.MATERIAL_BOM)
  //           AND tb_1.INUSE = 1
  //           AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'

  //               ;
  //       `

  //   sql = sql.replaceAll('dataItem.MATERIAL_BOM', materialBOM)
  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
  //   console.log(sql)

  //   return sql
  // },

  getBOMName: async (dataItem: any) => {
    let sql = `
            SELECT
                tb_1.BOM_NAME
            FROM
                BOM tb_1
            WHERE
                tb_1.BOM_NAME = 'dataItem.BOM_NAME'
                AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                AND tb_1.INUSE = 1
        `

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  getBOMNameByLike: async (dataItem: any) => {
    let sql = `
            SELECT
                 tb_1.BOM_CODE
                ,tb_1.BOM_NAME
                ,tb_1.BOM_ID
            FROM
                BOM tb_1
            WHERE
                tb_1.BOM_NAME Like '%dataItem.BOM_NAME%'
                AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                AND tb_1.INUSE = 1
            LIMIT 50
        `

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  getBOMCodeByLike: async (dataItem: any) => {
    let sql = `
            SELECT
                 tb_1.BOM_CODE
                ,tb_1.BOM_NAME
                ,tb_1.BOM_ID
            FROM
                BOM tb_1
            WHERE
                tb_1.BOM_CODE Like '%dataItem.BOM_CODE%'
                AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                AND tb_1.INUSE = 1
            LIMIT 50
        `

    sql = sql.replaceAll('dataItem.BOM_CODE', dataItem['BOM_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  getBOMNameByLikeAndProductSub: async (dataItem: any) => {
    let sql = `
            SELECT
                tb_1.BOM_CODE
                ,tb_1.BOM_NAME
                ,tb_1.BOM_ID
            FROM
                BOM tb_1
            LEFT JOIN PRODUCT_MAIN tb_2
                ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_2.INUSE = 1
            LEFT JOIN PRODUCT_SUB tb_3
                ON tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_3.INUSE = 1

            WHERE
                tb_1.BOM_NAME Like '%dataItem.BOM_NAME%'
                AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                AND tb_1.INUSE = 1
        `

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  getBOMCodeByLikeAndProductSub: async (dataItem: any) => {
    let sql = `
            SELECT
                tb_1.BOM_CODE
                ,tb_1.BOM_NAME
                ,tb_1.BOM_ID
            FROM
                BOM tb_1
            LEFT JOIN PRODUCT_MAIN tb_2
                ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_2.INUSE = 1
            LEFT JOIN PRODUCT_SUB tb_3
                ON tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_3.INUSE = 1

            WHERE
                tb_1.BOM_CODE Like '%dataItem.BOM_CODE%'
                AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                AND tb_1.INUSE = 1
        `

    sql = sql.replaceAll('dataItem.BOM_CODE', dataItem['BOM_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  UpdateBOMName: async (dataItem: any) => {
    let sql = `
            UPDATE
                BOM
            SET
                BOM_NAME = 'dataItem.BOM_NAME'
                , UPDATE_BY = 'dataItem.UPDATE_BY'
                , UPDATE_DATE = CURRENT_TIMESTAMP()
            WHERE
                BOM_ID = 'dataItem.BOM_ID'
        `

    sql = sql.replaceAll('dataItem.BOM_NAME', dataItem['BOM_NAME'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  searchBomIdFromSctId: async (dataItem: any) => {
    let sql = `
            SELECT
                  BOM_ID
            FROM
                  dataItem.STANDARD_COST_DB.SCT
            WHERE
                  SCT_ID = 'dataItem.SCT_ID'
              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID_SELECTION)

    return sql
  },
  getItemCodeForSupportMesByLike: async (dataItem: any) => {
    let sql = `SELECT tb_4.ITEM_CODE_FOR_SUPPORT_MES
                      ,tb_1.PRODUCT_MAIN_ID
                      ,tb_1.PRODUCT_MAIN_NAME
                      ,tb_2.BOM_ID
                      ,tb_3.ITEM_ID
                        FROM PRODUCT_MAIN tb_1
                        LEFT JOIN BOM tb_2
                            ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_2.INUSE = 1
                        LEFT JOIN BOM_FLOW_PROCESS_ITEM_USAGE tb_3
                            ON tb_2.BOM_ID = tb_3.BOM_ID AND tb_3.INUSE = 1
                        LEFT JOIN ITEM_MANUFACTURING tb_4
                            ON tb_3.ITEM_ID = tb_4.ITEM_ID AND tb_4.INUSE = 1
                        WHERE tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                             AND tb_4.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE_FOR_SUPPORT_MES%'
                        GROUP BY tb_4.ITEM_CODE_FOR_SUPPORT_MES
                        `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])

    return sql
  },

  getItemCodeForSupportMesByLikeAndProductSub: async (dataItem: any) => {
    let sql = `SELECT tb_4.ITEM_CODE_FOR_SUPPORT_MES
                      ,tb_1.PRODUCT_MAIN_ID
                      ,tb_1.PRODUCT_MAIN_NAME
                      ,tb_2.BOM_ID
                      ,tb_3.ITEM_ID
                        FROM
                        PRODUCT_SUB tb_5
                        LEFT JOIN PRODUCT_MAIN tb_1
                            ON tb_5.PRODUCT_MAIN_ID = tb_1.PRODUCT_MAIN_ID AND tb_1.INUSE = 1
                        PRODUCT_MAIN tb_1
                        LEFT JOIN BOM tb_2
                            ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_2.INUSE = 1
                        LEFT JOIN BOM_FLOW_PROCESS_ITEM_USAGE tb_3
                            ON tb_2.BOM_ID = tb_3.BOM_ID AND tb_3.INUSE = 1
                        LEFT JOIN ITEM_MANUFACTURING tb_4
                            ON tb_3.ITEM_ID = tb_4.ITEM_ID AND tb_4.INUSE = 1
                        WHERE tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                             AND tb_5.PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'
                             AND tb_4.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE_FOR_SUPPORT_MES%'
                        GROUP BY tb_4.ITEM_CODE_FOR_SUPPORT_MES
                        `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    return sql
  },
  getByLikeBomCodeAndInuse: async (dataItem: any) => {
    let sql = `   SELECT
                              BOM_ID
                            , FLOW_ID
                            , BOM_NAME
                            , BOM_CODE
                        FROM
                              BOM
                        WHERE
                              BOM_CODE LIKE '%dataItem.BOM_CODE%'
                          AND INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                          BOM_CODE ASC
                        LIMIT
                          50
                        `

    sql = sql.replaceAll('dataItem.BOM_CODE', dataItem['BOM_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('getBy', sql)
    return sql
  },
}
