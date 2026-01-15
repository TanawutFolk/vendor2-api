export const ProductTypeNewSQL = {
  searchProductTypeList: async (dataItem: any, sqlWhere: any) => {
    let sql = ` SELECT
                                  tb_1.PRODUCT_TYPE_ID
                                , tb_1.PRODUCT_TYPE_NAME
                            FROM
                                PRODUCT_TYPE tb_1
                            JOIN
                                PRODUCT_TYPE_ITEM_CATEGORY tb_2
                                ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                            JOIN
                                PRODUCT_SUB tb_3
                                ON tb_1.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                            JOIN
                                PRODUCT_MAIN tb_4
                                ON tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                            JOIN
                                PRODUCT_CATEGORY tb_5
                                ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                            WHERE
                                    tb_1.INUSE = 1
                                AND tb_2.ITEM_CATEGORY_ID = 1
                                sqlWhere

                                                      `
    sql = sql.replaceAll('sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    //     console.log('TYPElist', sql)
    return sql
  },

  getByLikeProductTypeNameAndInuseForPriceList: async (dataItem: any) => {
    let sql = `
                                  SELECT
                              tb_1.PRODUCT_TYPE_ID
                            , tb_1.PRODUCT_TYPE_NAME
                            , tb_1.PRODUCT_TYPE_CODE
                            , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                        FROM
                            PRODUCT_TYPE tb_1
                        JOIN
                            PRODUCT_TYPE_ITEM_CATEGORY tb_2
                            ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                        WHERE
                                tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'
                            AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                            AND tb_2.ITEM_CATEGORY_ID = 1
                            AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT != ''
                        ORDER BY
                            tb_1.PRODUCT_TYPE_NAME ASC
                        LIMIT
                        300
                              `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  getByLikeProductTypeNameAndProductSubIdAndInuse: async (dataItem: any) => {
    let sql = `
                        SELECT
                                tb_1.PRODUCT_TYPE_ID
                              , tb_1.PRODUCT_TYPE_NAME
                              , tb_1.PRODUCT_TYPE_CODE
                              , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                              , tb_1.PRODUCT_SUB_ID
                      FROM
                              PRODUCT_TYPE tb_1
                      LEFT JOIN
                              PRODUCT_TYPE_PROGRESS_WORKING tb_2
                      ON
                              tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                      LEFT JOIN
                              PRODUCT_SUB tb_3
                      ON
                              tb_1.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                      LEFT JOIN
                              PRODUCT_MAIN tb_4
                      ON
                              tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                       LEFT JOIN
                              PRODUCT_CATEGORY tb_5
                      ON
                              tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                      WHERE
                                  tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'
                              AND tb_1.INUSE = 'dataItem.INUSE'
                              AND tb_2.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
                              AND tb_3.PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'
                              AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT != ''
                      ORDER BY
                              PRODUCT_TYPE_NAME ASC
                      LIMIT
                            50
                      `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log('sql', sql)

    return sql
  },

  getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods: async (dataItem: any) => {
    let sql = `
                        SELECT
                          tb_1.PRODUCT_TYPE_ID
                        , tb_1.PRODUCT_TYPE_NAME
                        , tb_1.PRODUCT_TYPE_CODE
                        , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                    FROM
                        PRODUCT_TYPE tb_1
                    JOIN
                        PRODUCT_TYPE_ITEM_CATEGORY tb_2
                        ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                    JOIN
                        PRODUCT_SUB tb_3
                        ON tb_1.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                    WHERE
                            tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'
                        AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                        AND tb_2.ITEM_CATEGORY_ID = 1
                        AND tb_3.PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'
                        AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT != ''

                    ORDER BY
                        tb_1.PRODUCT_TYPE_NAME ASC
                    LIMIT
                        300
                      `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log('getByLikeProductTypeNameAndProductCategoryIdAndInuse', sql)
    return sql
  },
  //   getProductTypeIDForExisting_condition: async (dataItem, sqlWhereProductTypeIDForExisting) => {
  //     let sql = `
  //                                 SELECT
  //                                                   tb_1.PRODUCT_TYPE_ID
  //                                 FROM
  //                                                 PRODUCT_TYPE tb_1
  //                                                         INNER JOIN
  //                                                 PRODUCT_TYPE_ITEM_CATEGORY tb_2
  //                                                         ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
  //                                                         AND tb_1.INUSE = 1
  //                                                         AND tb_2.INUSE = 1
  //                                                         INNER JOIN
  //                                                 PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_3
  //                                                         ON tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
  //                                                         AND tb_3.INUSE = 1
  //                                                         INNER JOIN
  //                                                 PRODUCT_TYPE_DETAIL tb_4
  //                                                         ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
  //                                                         AND tb_4.INUSE = 1
  //                                                         INNER JOIN
  //                                                 PRODUCT_TYPE_BOI tb_5
  //                                                         ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
  //                                                         AND tb_5.INUSE = 1
  //                                                         INNER JOIN
  //                                                 PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_6
  //                                                 on     tb_3.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_6.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_6.INUSE =1
  //                                                         INNER JOIN
  //                                                 PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_7
  //                                                 on
  //                                                         tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID and tb_7.INUSE =1
  //                                                 dataItem.sqlWhereProductTypeIDForExisting

  //                 `
  //     sql = sql.replaceAll('dataItem.sqlWhereProductTypeIDForExisting', sqlWhereProductTypeIDForExisting)
  //     sql = sql.replaceAll(
  //       'dataItem.ITEM_CATEGORY_ID',
  //       dataItem['ITEM_CATEGORY_ID'] != '' ? "'" + dataItem['ITEM_CATEGORY_ID'] + "'" : 'NULL'
  //     )
  //     sql = sql.replaceAll(
  //       'dataItem.ACCOUNT_DEPARTMENT_CODE_ID',
  //       dataItem['ACCOUNT_DEPARTMENT_CODE_ID'] != '' ? "'" + dataItem['ACCOUNT_DEPARTMENT_CODE_ID'] + "'" : 'NULL'
  //     )
  //     sql = sql.replaceAll(
  //       'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE',
  //       dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] != ''
  //         ? "'" + dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] + "'"
  //         : 'NULL'
  //     )
  //     sql = sql.replaceAll(
  //       'dataItem.PRODUCT_SUB_ID',
  //       dataItem['PRODUCT_SUB_ID'] != '' ? "'" + dataItem['PRODUCT_SUB_ID'] + "'" : 'NULL'
  //     )
  //     sql = sql.replaceAll(
  //       'dataItem.PRODUCT_MAIN_ID',
  //       dataItem['PRODUCT_MAIN_ID'] != '' ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'" : 'NULL'
  //     )

  //     sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] != '' ? "'" + dataItem['INUSE'] + "'" : 'NULL')
  //     console.log('getProductTypeIDForExisting_condition', sql)
  //     return sql
  //   },
  getByProductType_condition: async (dataItem: any) => {
    let sql = `
                                SELECT
                                                  tb_1.PRODUCT_TYPE_ID
                                                , tb_1.PRODUCT_TYPE_NAME
                                                , tb_1.PRODUCT_TYPE_CODE
                                FROM
                                                PRODUCT_TYPE tb_1
                                                        INNER JOIN
                                                PRODUCT_TYPE_ITEM_CATEGORY tb_2
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                                        AND tb_1.INUSE = 1
                                                        AND tb_2.INUSE = 1
                                                        INNER JOIN
                                                PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_3
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
                                                        AND tb_3.INUSE = 1
                                                        INNER JOIN
                                                PRODUCT_TYPE_DETAIL tb_4
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                                        AND tb_4.INUSE = 1
                                                        INNER JOIN
                                                PRODUCT_TYPE_BOI tb_5
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                                        AND tb_5.INUSE = 1
                                                        INNER JOIN
                                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_6
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID AND tb_6.INUSE = 1
                                                        INNER JOIN
                                                PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_7
                                                on     tb_3.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_7.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_7.INUSE =1
                                                        INNER JOIN
                                                PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_8
                                                on
                                                        tb_7.PRODUCT_MAIN_ID = tb_8.PRODUCT_MAIN_ID and tb_8.INUSE =1
                                                        INNER JOIN
                                                PRODUCT_TYPE_PROGRESS_WORKING tb_9
                                                on
                                                        tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID and tb_9.INUSE =1
                                WHERE
                                                    tb_2.ITEM_CATEGORY_ID = dataItem.ITEM_CATEGORY_ID
                                                AND tb_8.ACCOUNT_DEPARTMENT_CODE_ID = dataItem.ACCOUNT_DEPARTMENT_CODE_ID
                                                AND tb_4.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE = dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                                                AND tb_4.FFT_PART_NUMBER = 'dataItem.FFT_PART_NUMBER'
                                                AND tb_5.IS_BOI = dataItem.IS_BOI
                                                AND tb_6.CUSTOMER_INVOICE_TO_ID = dataItem.CUSTOMER_INVOICE_TO_ID
                                                AND tb_9.PRODUCT_TYPE_STATUS_WORKING_ID = '1'

                `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'] != '' ? "'" + dataItem['ITEM_CATEGORY_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'] != '' ? "'" + dataItem['ACCOUNT_DEPARTMENT_CODE_ID'] + "'" : 'NULL')
    sql = sql.replaceAll(
      'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE',
      dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] != '' ? "'" + dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] + "'" : 'NULL'
    )
    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'] != '' ? "'" + dataItem['IS_BOI'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'] != '' ? "'" + dataItem['CUSTOMER_INVOICE_TO_ID'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] != '' ? "'" + dataItem['INUSE'] + "'" : 'NULL')
    //     console.log('getByProductType_condition', sql)
    return sql
  },

  checkDuplicateForProductItemCode: async (dataItem: any) => {
    let sql = `
                              SELECT
                                      COUNT(*) AS TOTAL_COUNT
                              FROM
                                      PRODUCT_TYPE tb_1
                                left join
                                        PRODUCT_TYPE_DETAIL tb_2
                                on
                                        tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID and tb_2.INUSE =1
                                left join
                                        PRODUCT_TYPE_ITEM_CATEGORY tb_3
                                on
                                        tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID and tb_3.INUSE =1
                                left join
                                        ITEM_CATEGORY tb_4
                                on
                                        tb_3.ITEM_CATEGORY_ID = tb_4.ITEM_CATEGORY_ID and tb_4.INUSE =1
                                left join
                                        PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_5
                                on
                                        tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID and tb_5.INUSE =1
                                left join
                                        PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_6
                                on
                                        tb_5.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_6.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_6.INUSE =1
                                left join
                                        PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_7
                                on
                                        tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID and tb_7.INUSE =1
                                left join
                                        ACCOUNT_DEPARTMENT_CODE tb_8
                                on
                                        tb_7.ACCOUNT_DEPARTMENT_CODE_ID = tb_8.ACCOUNT_DEPARTMENT_CODE_ID and tb_8.INUSE =1
                                left join
                                        PRODUCT_TYPE_BOI tb_9
                                on
                                        tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID and tb_9.INUSE =1
                                left join
                                        PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_10
                                on
                                        tb_1.PRODUCT_TYPE_ID = tb_10.PRODUCT_TYPE_ID and tb_10.INUSE =1
                                left join
                                        CUSTOMER_INVOICE_TO tb_11
                                on
                                        tb_10.CUSTOMER_INVOICE_TO_ID = tb_11.CUSTOMER_INVOICE_TO_ID and tb_11.INUSE =1
                              WHERE
                                            tb_2.FFT_PART_NUMBER = 'dataItem.FFT_PART_NUMBER'
                                      AND  tb_2.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE = 'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'
                                      AND  tb_8.ACCOUNT_DEPARTMENT_CODE = 'dataItem.ACCOUNT_DEPARTMENT_CODE'
                                      AND  tb_4.ITEM_CATEGORY_SHORT_NAME = 'dataItem.ITEM_CATEGORY_SHORT_NAME'
                                      AND  tb_9.IS_BOI = 'dataItem.IS_BOI'
                                      AND  tb_11.CUSTOMER_INVOICE_TO_NAME = 'dataItem.CUSTOMER_INVOICE_TO_NAME'
                                      `

    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE', dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_SHORT_NAME', dataItem['ITEM_CATEGORY_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'])
    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_NAME', dataItem['CUSTOMER_INVOICE_TO_NAME'])

    return sql
  },

  getProductTypeByProductGroup: async (dataItem: any, sqlWhere: any) => {
    let sql = `
                                      SELECT
                                             tb_10.BOM_ID
                                            ,tb_9.PRODUCT_TYPE_STATUS_WORKING_ID
                                            ,tb_8.PRODUCT_SPECIFICATION_TYPE_NAME
                                            ,tb_7.PRODUCT_SPECIFICATION_TYPE_ID
                                            ,tb_6.ITEM_CATEGORY_NAME
                                            ,tb_5.ITEM_CATEGORY_ID
                                            ,tb_4.PRODUCT_CATEGORY_ID
                                            ,tb_3.PRODUCT_MAIN_ID
                                            ,tb_2.PRODUCT_SUB_ID
                                            ,tb_1.PRODUCT_TYPE_ID
                                            ,tb_1.PRODUCT_TYPE_NAME
                                            ,tb_1.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                                        FROM
                                             PRODUCT_TYPE tb_1
                                        LEFT JOIN
                                              PRODUCT_SUB tb_2
                                           ON tb_1.PRODUCT_SUB_ID  = tb_2.PRODUCT_SUB_ID and tb_2.INUSE =1
                                          LEFT JOIN
                                              PRODUCT_MAIN tb_3
                                           ON tb_2.PRODUCT_MAIN_ID  = tb_3.PRODUCT_MAIN_ID and tb_3.INUSE =1
                                          LEFT JOIN
                                              PRODUCT_CATEGORY tb_4
                                           ON tb_3.PRODUCT_CATEGORY_ID  = tb_4.PRODUCT_CATEGORY_ID and tb_4.INUSE =1
                                            LEFT JOIN
                                              PRODUCT_TYPE_ITEM_CATEGORY tb_5
                                           ON tb_1.PRODUCT_TYPE_ID  = tb_5.PRODUCT_TYPE_ID and tb_5.INUSE =1
                                            LEFT JOIN
                                               ITEM_CATEGORY tb_6
                                           ON tb_5.ITEM_CATEGORY_ID  = tb_6.ITEM_CATEGORY_ID and tb_6.INUSE =1
                                            LEFT JOIN
                                               PRODUCT_SPECIFICATION_DOCUMENT_SETTING  tb_7
                                           ON tb_3.PRODUCT_MAIN_ID  = tb_7.PRODUCT_MAIN_ID and tb_7.INUSE =1
                                           LEFT JOIN
                                               PRODUCT_SPECIFICATION_TYPE tb_8
                                           ON tb_7.PRODUCT_SPECIFICATION_TYPE_ID  = tb_8. PRODUCT_SPECIFICATION_TYPE_ID and tb_8.INUSE =1
                                           LEFT JOIN
                                               PRODUCT_TYPE_PROGRESS_WORKING tb_9
                                           ON tb_1.PRODUCT_TYPE_ID  = tb_9.PRODUCT_TYPE_ID and tb_9.INUSE =1
                                           LEFT JOIN
                                               PRODUCT_TYPE_BOM tb_10
                                           ON tb_1.PRODUCT_TYPE_ID  = tb_10.PRODUCT_TYPE_ID and tb_10.INUSE =1
                                        WHERE
                                           tb_9.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
                                          AND tb_1.INUSE = 1
                                          dataItem.sqlWhere
                                        LIMIT 50
                 `

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    //     sql = sql.replaceAll(
    //       'dataItem.PRODUCT_SUB_ID',
    //       dataItem['PRODUCT_SUB_ID'] != '' ? "'" + dataItem['PRODUCT_SUB_ID'] + "'" : 'NULL'
    //     )
    //     sql = sql.replaceAll(
    //       'dataItem.PRODUCT_MAIN_ID',
    //       dataItem['PRODUCT_MAIN_ID'] != '' ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'" : 'NULL'
    //     )
    //     sql = sql.replaceAll(
    //       'dataItem.PRODUCT_CATEGORY_ID',
    //       dataItem['PRODUCT_CATEGORY_ID'] != '' ? "'" + dataItem['PRODUCT_CATEGORY_ID'] + "'" : 'NULL'
    //     )
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    return sql
  },
  getByLikeProductCategoryNameAndInuse: async (dataItem: any) => {
    let sql = `   SELECT
                          PRODUCT_CATEGORY_ID
                        , PRODUCT_CATEGORY_NAME
                    FROM
                          PRODUCT_CATEGORY
                    WHERE
                          PRODUCT_CATEGORY_NAME LIKE '%dataItem.PRODUCT_CATEGORY_NAME%'
                      AND INUSE LIKE '%dataItem.INUSE%'
                    ORDER BY
                      PRODUCT_CATEGORY_NAME ASC
                    LIMIT
                      50
                    `

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    console.log('getBy', sql)

    return sql
  },
  getByLikeProductTypeNameAndProductCategoryIdAndInuse: async (dataItem: any) => {
    let sql = `
                        SELECT
                                tb_1.PRODUCT_TYPE_ID
                              , tb_1.PRODUCT_TYPE_NAME
                              , tb_1.PRODUCT_TYPE_CODE
                              , tb_1.PRODUCT_SUB_ID
                      FROM
                              PRODUCT_TYPE tb_1
                      LEFT JOIN
                              PRODUCT_TYPE_PROGRESS_WORKING tb_2
                      ON
                              tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                      LEFT JOIN
                              PRODUCT_SUB tb_3
                      ON
                              tb_1.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                      LEFT JOIN
                              PRODUCT_MAIN tb_4
                      ON
                              tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                       LEFT JOIN
                              PRODUCT_CATEGORY tb_5
                      ON
                              tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                      WHERE
                                  tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'
                              AND tb_1.INUSE = 'dataItem.INUSE'
                              AND tb_2.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
                              AND tb_5.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'
                      ORDER BY
                              PRODUCT_TYPE_NAME ASC
                      LIMIT
                            50
                      `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods: async (dataItem: any) => {
    let sql = `
                       SELECT
                                tb_1.PRODUCT_TYPE_ID
                              , tb_1.PRODUCT_TYPE_NAME
                              , tb_1.PRODUCT_TYPE_CODE
                              , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                              , tb_5.ITEM_CATEGORY_ID
                              , tb_5.ITEM_CATEGORY_NAME
                              , tb_5.ITEM_CATEGORY_ALPHABET
                              , tb_2.PRODUCT_SUB_ALPHABET
                  FROM
                              PRODUCT_TYPE tb_1
                                  INNER JOIN
                              PRODUCT_SUB tb_2
                                  ON tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
                                  INNER JOIN
                              PRODUCT_MAIN tb_3
                                      ON tb_2.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
                                  AND tb_3.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'
                                  INNER JOIN
                              PRODUCT_TYPE_ITEM_CATEGORY tb_4
                                      ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                      AND tb_4.INUSE = 1
                                      INNER JOIN
                              ITEM_CATEGORY tb_5
                                      ON tb_4.ITEM_CATEGORY_ID = tb_5.ITEM_CATEGORY_ID
                  WHERE
                                  tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'
                              AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                              AND tb_4.ITEM_CATEGORY_ID = 1
                              AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT != ''
                  ORDER BY
                              tb_1.PRODUCT_TYPE_NAME ASC
                  LIMIT
                              300
                      `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log('getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods', sql)

    return sql
  },
  delete: async (dataItem: any) => {
    let sql = ` UPDATE
                      PRODUCT_TYPE
                  SET
                        INUSE = '0'
                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                      , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                      PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                  `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },

  //   updateProductTypeSpecDocSetting: async dataItem => {
  //     let sql = `        UPDATE     PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING
  //                             SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
  //                                   , PC_NAME = 'dataItem.PC_NAME'
  //                                   , FFT_PART_NUMBER = 'dataItem.FFT_PART_NUMBER'
  //                                   , IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE = 'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'
  //                                   , IS_PRODUCT_FOR_REPAIR = 'dataItem.IS_PRODUCT_FOR_REPAIR'
  //                                   , SUFFIX_FOR_PART_NUMBER = 'dataItem.SUFFIX_FOR_PART_NUMBER'
  //                                   , INUSE = 'dataItem.INUSE'
  //                                   , UPDATE_BY = 'dataItem.UPDATE_BY'
  //                                   , UPDATE_DATE = CURRENT_TIMESTAMP()
  //                           WHERE
  //                                   PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = 'dataItem.PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'
  //     `
  //     sql = sql.replaceAll(
  //       'dataItem.PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID',
  //       dataItem['PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID']
  //     )
  //     sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
  //     sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //     sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
  //     return sql
  //   },
  //   updateProductTypeCode: async dataItem => {
  //     let sql = `        UPDATE     PRODUCT_TYPE_CODE
  //                           SET     PRODUCT_ITEM_CODE = 'dataItem.PRODUCT_ITEM_CODE'
  //                                 , PRODUCT_ITEM_NAME = 'dataItem.PRODUCT_ITEM_NAME'
  //                                 , IS_BOI = 'dataItem.IS_BOI'
  //                                 , INUSE = 'dataItem.INUSE'
  //                                 , UPDATE_BY = 'dataItem.UPDATE_BY'
  //                                 , UPDATE_DATE = CURRENT_TIMESTAMP()
  //                         WHERE
  //                                 PRODUCT_TYPE_CODE_ID = 'dataItem.PRODUCT_TYPE_CODE_ID'
  //   `
  //     sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_ID', dataItem['PRODUCT_TYPE_CODE_ID'])
  //     sql = sql.replaceAll('dataItem.PRODUCT_ITEM_CODE', dataItem['PRODUCT_ITEM_CODE'])
  //     sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
  //     sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'])
  //     sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //     sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
  //     return sql
  //   },

  updateProductTypeStatusWorking: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_TYPE_PROGRESS_WORKING
                          SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                , PRODUCT_TYPE_STATUS_WORKING_ID = 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                PRODUCT_TYPE_PROGRESS_WORKING_ID = 'dataItem.PRODUCT_TYPE_PROGRESS_WORKING_ID'
  `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_PROGRESS_WORKING_ID', dataItem['PRODUCT_TYPE_PROGRESS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('updateProductTypeStatusWorking', sql)
    return sql
  },

  updateProductTypeBoiProject: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_TYPE_BOI
                          SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                , BOI_PROJECT_ID = dataItem.BOI_PROJECT_ID
                                , IS_BOI = dataItem.IS_BOI
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                PRODUCT_TYPE_BOI_ID = 'dataItem.PRODUCT_TYPE_BOI_ID'
  `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_BOI_ID', dataItem['PRODUCT_TYPE_BOI_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'] != '' ? "'" + dataItem['BOI_PROJECT_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'] != '' ? "'" + dataItem['IS_BOI'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //     console.log('updateProductTypeBoiProject', sql)
    return sql
  },

  updateProductCategoryForProductMain: async (dataItem: any) => {
    let sql = `        UPDATE
                                  PRODUCT_MAIN
                          SET
                                  PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'
  `
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] != '' ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('updateProductTypeProductMain', sql)
    return sql
  },

  updateProductTypeWithoutProductTypeCode: async (dataItem: any, sqlWhereProductTypeCode: any) => {
    //   updateProductType: async dataItem => {
    let sql = `
      UPDATE     PRODUCT_TYPE
                     SET          PRODUCT_TYPE_NAME = 'dataItem.PRODUCT_TYPE_NAME'
                                , PRODUCT_SUB_ID = dataItem.PRODUCT_SUB_ID
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        dataItem.sqlWhereProductTypeCode
    `
    sql = sql.replaceAll('dataItem.sqlWhereProductTypeCode', sqlWhereProductTypeCode)
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_SHORT_NAME', dataItem['ITEM_CATEGORY_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'] != '' ? "'" + dataItem['PRODUCT_SUB_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] != '' ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('ItemAlphabetWithAccountCode', dataItem.ItemAlphabetWithAccountCode)
    //     console.log('updateProductType', sql)
    return sql
  },
  updateProductType: async (dataItem: any, sqlWhereProductTypeCode: any) => {
    //   updateProductType: async dataItem => {
    let sql = `
      SET @count = (SELECT COUNT(PRODUCT_TYPE_ID) FROM PRODUCT_TYPE);
      UPDATE    PRODUCT_TYPE
        SET     PRODUCT_TYPE_NAME = 'dataItem.productTypeName'
                , PRODUCT_TYPE_CODE = CONCAT('dataItem.ITEM_CATEGORY_SHORT_NAME','dataItem.ACCOUNT_DEPARTMENT_CODE','dataItem.productAlphabet', LPAD(@count + 1, 3, 0))
                , PRODUCT_SUB_ID = dataItem.PRODUCT_SUB_ID
                , UPDATE_BY = 'dataItem.UPDATE_BY'
                , UPDATE_DATE = CURRENT_TIMESTAMP()
                dataItem.sqlWhereProductTypeCode
    `
    sql = sql.replaceAll('dataItem.sqlWhereProductTypeCode', sqlWhereProductTypeCode)
    sql = sql.replaceAll(
      'dataItem.productTypeName',
      dataItem['ITEM_CATEGORY_SHORT_NAME'] === '' || dataItem['PC_NAME'] === '' ? '' : dataItem.ITEM_CATEGORY_SHORT_NAME + '_' + dataItem.PC_NAME
    )
    sql = sql.replaceAll(
      'dataItem.productAlphabet',
      dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] === '0' ? dataItem.PRODUCT_SUB_ALPHABET : dataItem.PRODUCT_MAIN_ALPHABET
      //       '1' === '0'
    )

    sql = sql.replaceAll(
      'dataItem.ItemAlphabetWithAccountCode',
      dataItem['ITEM_CATEGORY_SHORT_NAME'] === '' || dataItem['ACCOUNT_DEPARTMENT_CODE'] === '' ? '' : dataItem.ITEM_CATEGORY_SHORT_NAME + dataItem.ACCOUNT_DEPARTMENT_CODE
    )
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_SHORT_NAME', dataItem['ITEM_CATEGORY_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'] != '' ? "'" + dataItem['PRODUCT_SUB_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] != '' ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('ItemAlphabetWithAccountCode', dataItem.ItemAlphabetWithAccountCode)
    //     console.log('updateProductType', sql)
    return sql
  },
  updateProductTypeByProductSub: async (dataItem: any) => {
    let sql = ` UPDATE
                        PRODUCT_TYPE
                  SET
                       PRODUCT_SUB_ID = dataItem.PRODUCT_SUB_ID
                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                      , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                      PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                  `
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'] != '' ? "'" + dataItem['PRODUCT_SUB_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    //     console.log('updateProductTypeByProductSub', sql)
    return sql
  },
  updateProductTypeWhenNotGen: async (dataItem: any) => {
    let sql = ` UPDATE
                        PRODUCT_TYPE
                  SET
                       PRODUCT_SUB_ID = dataItem.PRODUCT_SUB_ID
                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                      , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                      PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                  `
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'] != '' ? "'" + dataItem['PRODUCT_SUB_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    //     console.log('updateProductTypeWhenNotGen', sql)
    return sql
  },

  update: async (dataItem: any) => {
    let sql = `   UPDATE     PRODUCT_CATEGORY
    SET        PRODUCT_CATEGORY_NAME = 'dataItem.PRODUCT_CATEGORY_NAME'
              , PRODUCT_CATEGORY_ALPHABET = 'dataItem.PRODUCT_CATEGORY_ALPHABET'
              , INUSE = 'dataItem.INUSE'
              , UPDATE_BY = 'dataItem.UPDATE_BY'
              , UPDATE_DATE = CURRENT_TIMESTAMP()
    WHERE
              PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'
  `

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ALPHABET', dataItem['PRODUCT_CATEGORY_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])

    return sql
  },

  createSpecificationSettingIdForProductType: async () => {
    let sql = `  SET @specificationForProductTypeId=(1 + coalesce((SELECT max(PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID)
        FROM PRODUCT_SPECIFICATION_DOCUMENT_SETTING), 0)) ; `
    //console.log('SpecificationForProductTypeId', sql)
    return sql
    //return sql
  },
  createSpecificationSettingForProductType: async (dataItem: any) => {
    let sql = `
        INSERT INTO PRODUCT_SPECIFICATION_DOCUMENT_SETTING
          (
          PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
        , PRODUCT_PART_NUMBER
        , PRODUCT_MAIN_ID
        , CUSTOMER_ORDER_FROM_ID
        , CREATE_BY
        , UPDATE_DATE
        , UPDATE_BY
          )
            VALUES (
           @specificationForProductTypeId
        , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'
        , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'
        , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'
        , 'dataItem.PRODUCT_PART_NUMBER'
        , dataItem.PRODUCT_MAIN_ID
        , dataItem.CUSTOMER_ORDER_FROM_ID
        , 'dataItem.CREATE_BY'
        ,  CURRENT_TIMESTAMP()
        , 'dataItem.CREATE_BY' )
          `
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] != '' ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'] != '' ? "'" + dataItem['CUSTOMER_ORDER_FROM_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('createProductTypeStatusWorking', sql)
    return sql
  },
  createProductTypeStatusWorkingId: async () => {
    let sql = `  SET @createProductTypeStatusWorkingId =(1 + coalesce((SELECT max(PRODUCT_TYPE_PROGRESS_WORKING_ID)
            FROM PRODUCT_TYPE_PROGRESS_WORKING), 0)) ; `
    //console.log('createProductTypeStatusWorkingId', sql)
    return sql
  },
  createProductTypeStatusWorking: async (dataItem: any) => {
    let sql = `
        INSERT INTO PRODUCT_TYPE_PROGRESS_WORKING
          (
              PRODUCT_TYPE_PROGRESS_WORKING_ID
            , PRODUCT_TYPE_ID
            , PRODUCT_TYPE_STATUS_WORKING_ID
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
          )
            SELECT
                  @createProductTypeStatusWorkingId
                , 'dataItem.PRODUCT_TYPE_ID'
                , 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 'dataItem.CREATE_BY'
          `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('createProductTypeStatusWorking', sql)
    return sql
  },
  createProductTypeBoiProjectId: async () => {
    let sql = `  SET @productTypeBoiProjectId =(1 + coalesce((SELECT max(PRODUCT_TYPE_BOI_ID)
                FROM PRODUCT_TYPE_BOI), 0)) ; `
    //console.log('createProductTypeBoiProjectId', sql)
    return sql
  },

  createProductTypeBoiProjectForNewItem: async (dataItem: any) => {
    let sql = `
        INSERT INTO PRODUCT_TYPE_BOI
          (
              PRODUCT_TYPE_BOI_ID
            , PRODUCT_TYPE_ID
            , BOI_PROJECT_ID
            , IS_BOI
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
          )
            SELECT
                  @productTypeBoiProjectId
                , @productTypeId
                , dataItem.BOI_PROJECT_ID
                , dataItem.IS_BOI
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 'dataItem.CREATE_BY'
          `

    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'] != '' ? "'" + dataItem['BOI_PROJECT_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'] != '' ? "'" + dataItem['IS_BOI'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log('createProductTypeBoiProject' + sql)
    return sql
  },
  createProductTypeBoiProject: async (dataItem: any) => {
    let sql = `
        INSERT INTO PRODUCT_TYPE_BOI
          (
              PRODUCT_TYPE_BOI_ID
            , PRODUCT_TYPE_ID
            , BOI_PROJECT_ID
            , IS_BOI
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
          )
            SELECT
                  @productTypeBoiProjectId
                , 'dataItem.PRODUCT_TYPE_ID'
                , dataItem.BOI_PROJECT_ID
                , dataItem.IS_BOI
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 'dataItem.CREATE_BY'
          `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'] != '' ? "'" + dataItem['BOI_PROJECT_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'] != '' ? "'" + dataItem['IS_BOI'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log('createProductTypeBoiProject' + sql)
    return sql
  },

  //   createProductTypeSpecDocSettingId: async () => {
  //     let sql = `  SET @productTypeSpecDocSettingId =(1 + coalesce((SELECT max(PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID)
  //         FROM PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING), 0)) ; `
  //     //console.log('createProductTypeSpecDocSettingId', sql)
  //     return sql
  //   },
  //   createProductTypeSpecDocSetting: async dataItem => {
  //     let sql = `
  //                   INSERT INTO PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING
  //                     (
  //                         PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
  //                       , PRODUCT_TYPE_ID
  //                       , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
  //                       , CREATE_BY
  //                       , UPDATE_DATE
  //                       , UPDATE_BY
  //                     )
  //                       SELECT
  //                             @productTypeSpecDocSettingId
  //                           , 'dataItem.PRODUCT_TYPE_ID'
  //                           , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'
  //                           , 'dataItem.CREATE_BY'
  //                           , CURRENT_TIMESTAMP()
  //                           , 'dataItem.CREATE_BY'
  //                     `

  //     sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
  //     sql = sql.replaceAll(
  //       'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID',
  //       dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID']
  //     )
  //     sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
  //     sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //     //console.log('createProductTypeSpecDocSetting', sql)
  //     return sql
  //   },

  //   createProductSpecificationDocumentSettingId: async () => {
  //     let sql = `  SET @productSpecificationDocumentSettingId =(1 + coalesce((SELECT max(PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID)
  //         FROM PRODUCT_SPECIFICATION_DOCUMENT_SETTING), 0)) ; `
  //     console.log('createProductSpecificationDocumentSettingId', sql)
  //     return sql
  //   },
  //   createProductSpecificationDocumentSetting: async dataItem => {
  //     let sql = `
  //                   INSERT INTO PRODUCT_SPECIFICATION_DOCUMENT_SETTING
  //                     (
  //                         PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
  //                       , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
  //                       , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
  //                       , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
  //                       , PRODUCT_PART_NUMBER
  //                       , PRODUCT_MAIN_ID
  //                       , CUSTOMER_ORDER_FROM_ID
  //                       , CREATE_BY
  //                       , UPDATE_DATE
  //                       , UPDATE_BY
  //                     )
  //                       SELECT
  //                             @productSpecificationDocumentSettingId
  //                           , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'
  //                           , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'
  //                           , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'
  //                           , 'dataItem.PRODUCT_PART_NUMBER'
  //                           , dataItem.PRODUCT_MAIN_ID
  //                           , dataItem.CUSTOMER_ORDER_FROM_ID
  //                           , 'dataItem.CREATE_BY'
  //                           , CURRENT_TIMESTAMP()
  //                           , 'dataItem.CREATE_BY'
  //                     `
  //     sql =
  //       sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID']) != ''
  //         ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'"
  //         : 'NULL'
  //     sql =
  //       sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID']) != ''
  //         ? "'" + dataItem['CUSTOMER_ORDER_FROM_ID'] + "'"
  //         : 'NULL'
  //     sql = sql.replaceAll(
  //       'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
  //       dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME']
  //     )
  //     sql = sql.replaceAll(
  //       'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
  //       dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER']
  //     )
  //     sql = sql.replaceAll(
  //       'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION',
  //       dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION']
  //     )
  //     sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
  //     sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
  //     console.log('createProductSpecificationDocumentSetting', sql)
  //     return sql
  //   },

  createProductTypeDetailId: async () => {
    let sql = `  SET @productTypeDetailId =(1 + coalesce((SELECT max(PRODUCT_TYPE_DETAIL_ID)
        FROM PRODUCT_TYPE_DETAIL), 0)) ; `
    return sql
  },
  createProductTypeDetailWhenNotRepair: async (dataItem: any) => {
    let sql = `
                  INSERT INTO PRODUCT_TYPE_DETAIL
                    (
                        PRODUCT_TYPE_DETAIL_ID
                      , PRODUCT_TYPE_ID
                      , PC_NAME
                      , IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                      , SUFFIX_FOR_PART_NUMBER
                      , CREATE_BY
                      , UPDATE_DATE
                      , UPDATE_BY
                    )
                      SELECT
                            @productTypeDetailId
                          , 'dataItem.PRODUCT_TYPE_ID'
                          , 'dataItem.PC_NAME'
                          , dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                          , 'dataItem.SUFFIX_FOR_PART_NUMBER'
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 'dataItem.CREATE_BY'
                    `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE', dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    //     //console.log('PRODUCT_PART_NUMBER', dataItem.PRODUCT_PART_NUMBER)
    //     console.log('createProductTypeDetailWhenNotRepair', sql)
    return sql
  },

  createProductTypeDetail: async (dataItem: any) => {
    let sql = `
                  INSERT INTO PRODUCT_TYPE_DETAIL
                    (
                        PRODUCT_TYPE_DETAIL_ID
                      , PRODUCT_TYPE_ID
                      , PC_NAME
                      , FFT_PART_NUMBER
                      , IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                      , IS_PRODUCT_FOR_REPAIR
                      , SUFFIX_FOR_PART_NUMBER
                      , CREATE_BY
                      , UPDATE_DATE
                      , UPDATE_BY
                    )
                      SELECT
                            @productTypeDetailId
                          , 'dataItem.PRODUCT_TYPE_ID'
                          , 'dataItem.PC_NAME'
                          , 'dataItem.FFT_PART_NUMBER'
                          , 'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'
                          , 'dataItem.IS_PRODUCT_FOR_REPAIR'
                          , 'dataItem.SUFFIX_FOR_PART_NUMBER'
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 'dataItem.CREATE_BY'
                    `
    //     sql = sql.replaceAll(
    //       'dataItem.pcNameCode',
    //       dataItem['ITEM_CATEGORY_ALPHABET'] === null ? '' : '_' + dataItem.PC_NAME
    //     )
    //     sql = sql.replaceAll(
    //       'dataItem.suffixForFftPartNumber',
    //       dataItem['IS_PRODUCT_FOR_REPAIR'] === '0' ? '' : '(' + dataItem.SUFFIX_FOR_PART_NUMBER + ')'
    //     )
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE', dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_FOR_REPAIR', dataItem['IS_PRODUCT_FOR_REPAIR'])
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    //     //console.log('PRODUCT_PART_NUMBER', dataItem.PRODUCT_PART_NUMBER)
    return sql
  },

  createProductTypeCodeForItem: async (dataItem: any) => {
    let sql = `
        SET @productTypeCodeForItem = (SELECT PRODUCT_TYPE_CODE FROM PRODUCT_TYPE
      WHERE PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
    );
        `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    //console.log('createProductTypeCodeForItem', sql)
    return sql
  },
  generateProductTypeId_Variable: async () => {
    let sql = '  SET @productTypeId =(1 + coalesce((SELECT max(PRODUCT_TYPE_ID) FROM PRODUCT_TYPE), 0))'
    //     console.log('generateProductTypeId_Variable', sql)
    return sql
  },
  generateProductTypeCode_Variable: async (dataItem: any) => {
    let sql = `  SET @productTypeCode =
                        (
                                SELECT
                                        CONCAT('dataItem.ITEM_CATEGORY_ALPHABET','dataItem.ACCOUNT_DEPARTMENT_CODE','dataItem.productMainOrSubAlphabet', LPAD((COUNT(*) + 1), 3, 0))
                                FROM
                                        PRODUCT_TYPE tb_1
                                                INNER JOIN
                                        PRODUCT_TYPE_ITEM_CATEGORY tb_2
                                                ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                                        AND tb_1.INUSE = 1
                                                        AND tb_2.INUSE = 1
                                                INNER JOIN
                                        PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_3
                                                ON tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
                                                AND tb_3.INUSE = 1
                                                   INNER JOIN
                                        PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_4
                                        on     tb_3.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_4.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_4.INUSE =1
                                         INNER JOIN
                                        PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_5
                                        on
                                                tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID and tb_5.INUSE =1
                                WHERE
                                        tb_2.ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID'
                                        AND tb_5.ACCOUNT_DEPARTMENT_CODE_ID = 'dataItem.ACCOUNT_DEPARTMENT_CODE_ID'
                )`

    //     console.log(dataItem['ITEM_CATEGORY_ALPHABET'])

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ALPHABET', dataItem['ITEM_CATEGORY_ALPHABET'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.productMainOrSubAlphabet', dataItem['productMainOrSubAlphabet'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])

    //     sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    //     console.log('generateProductTypeCode_Variable', sql)
    return sql
  },
  createProductTypeId: async () => {
    let sql = `  SET @productTypeId =(1 + coalesce((SELECT max(PRODUCT_TYPE_ID)
        FROM PRODUCT_TYPE), 0)) ; `
    return sql
  },
  createByProductTypeIdVariable: async (dataItem: any) => {
    let sql = `
                    SET @next_product_type_code = (
                            SELECT
                                        CONCAT('PD-T-', LPAD(IFNULL(SUBSTRING_INDEX(MAX(PRODUCT_TYPE_CODE), '-', -1) + 1, 1), 4, '0'))
                            FROM
                                        PRODUCT_TYPE
                            WHERE
                                        PRODUCT_TYPE_ID = (
                                            SELECT
                                                        MAX(PRODUCT_TYPE_ID)
                                            FROM
                                                        PRODUCT_TYPE
                                        )
                    );

                        INSERT INTO PRODUCT_TYPE
                        (
                              PRODUCT_TYPE_ID
                            , PRODUCT_SUB_ID
                            , PRODUCT_TYPE_NAME
                            , PRODUCT_TYPE_CODE
                            , PRODUCT_TYPE_CODE_FOR_SCT
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                        )
                        VALUES
                        (
                               @productTypeId
                            , 'dataItem.PRODUCT_SUB_ID'
                            , 'dataItem.PRODUCT_TYPE_NAME'
                            ,  @next_product_type_code
                            , 'dataItem.PRODUCT_TYPE_CODE_FOR_SCT'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                        );
                   `

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  //   createProductTypeForNonSub: async (dataItem, sqlWhereProductTypeCode) => {
  //     let sql = `
  //                   INSERT INTO PRODUCT_TYPE
  //                     (
  //                         PRODUCT_TYPE_ID
  //                       , PRODUCT_TYPE_NAME
  //                       , PRODUCT_TYPE_CODE
  //                       , CREATE_BY
  //                       , UPDATE_DATE
  //                       , UPDATE_BY
  //                     )
  //                       SELECT
  //                             @productTypeId
  //                           , 'dataItem.PRODUCT_TYPE_NAME'
  //                           ,  CONCAT('dataItem.ITEM_CATEGORY_ALPHABET','dataItem.ACCOUNT_DEPARTMENT_CODE','dataItem.productAlphabet', LPAD((COUNT(*) + 1), 4, 0))
  //                           , 'dataItem.CREATE_BY'
  //                           , CURRENT_TIMESTAMP()
  //                           , 'dataItem.CREATE_BY'
  //                     from
  //                           PRODUCT_TYPE tb_1
  //                     inner join PRODUCT_SUB tb_2
  //                           on tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
  //                     inner join PRODUCT_MAIN tb_3
  //                           ON  tb_2.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
  //                           dataItem.sqlWhereProductTypeCode

  //                     `

  //     sql = sql.replaceAll('dataItem.sqlWhereProductTypeCode', sqlWhereProductTypeCode)

  //     sql = sql.replaceAll(
  //       'dataItem.productAlphabet',
  //       dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] === '0'
  //         ? dataItem.PRODUCT_SUB_ALPHABET
  //         : dataItem.PRODUCT_MAIN_ALPHABET
  //     )
  //     sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
  //     sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
  //     sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ALPHABET', dataItem['ITEM_CATEGORY_ALPHABET'])
  //     sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
  //     sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
  //     sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
  //     sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //     //console.log('CreateProductType' + sql)
  //     return sql
  //   },
  //   createProductTypeHistory: async (dataItem, sqlWhereProductTypeCode) => {
  //     let sql = `
  //                   INSERT INTO PRODUCT_TYPE_HISTORY
  //                     (
  //                         PRODUCT_TYPE_ID
  //                       , PRODUCT_TYPE_NAME
  //                       , PRODUCT_TYPE_CODE
  //                       , PRODUCT_SUB_ID
  //                       , CREATE_BY
  //                       , UPDATE_DATE
  //                       , UPDATE_BY
  //                     )
  //                       SELECT
  //                             @productTypeId
  //                           , 'dataItem.PRODUCT_TYPE_NAME'
  //                           ,  CONCAT('dataItem.ITEM_CATEGORY_ALPHABET','dataItem.ACCOUNT_DEPARTMENT_CODE','dataItem.productAlphabet', LPAD((COUNT(*) + 1), 4, 0))
  //                           , 'dataItem.PRODUCT_SUB_ID'
  //                           , 'dataItem.CREATE_BY'
  //                           , CURRENT_TIMESTAMP()
  //                           , 'dataItem.CREATE_BY'
  //                     from
  //                           PRODUCT_TYPE_HISTORY tb_1
  //                     inner join PRODUCT_SUB tb_2
  //                           on tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
  //                     inner join PRODUCT_MAIN tb_3
  //                           ON  tb_2.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
  //                           dataItem.sqlWhereProductTypeCode

  //                     `

  //     sql = sql.replaceAll('dataItem.sqlWhereProductTypeCode', sqlWhereProductTypeCode)

  //     sql = sql.replaceAll(
  //       'dataItem.productAlphabet',
  //       dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] === '0'
  //         ? dataItem.PRODUCT_SUB_ALPHABET
  //         : dataItem.PRODUCT_MAIN_ALPHABET
  //       //       '1' === '0'
  //     )

  //     sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
  //     sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
  //     sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ALPHABET', dataItem['ITEM_CATEGORY_ALPHABET'])
  //     sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
  //     sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID ', dataItem['PRODUCT_SUB_ID'])
  //     sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
  //     sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
  //     sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
  //     //console.log('CreateProductType' + sql)
  //     return sql
  //   },

  createByProductTypeId_Variable: async (dataItem: any) => {
    let sql = `
                INSERT INTO PRODUCT_TYPE
                        (
                                  PRODUCT_TYPE_ID
                                , PRODUCT_TYPE_NAME
                                , PRODUCT_TYPE_CODE
                                , PRODUCT_SUB_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                                , INUSE
                        )
                VALUES
                        (
                                   @productTypeId
                                , dataItem.PRODUCT_TYPE_NAME
                                , dataItem.PRODUCT_TYPE_CODE
                                ,  dataItem.PRODUCT_SUB_ID
                                , 'dataItem.CREATE_BY'
                                ,  CURRENT_TIMESTAMP()
                                , 'dataItem.UPDATE_BY'
                                , dataItem.INUSE
                        )
          `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'] === '' ? 'NULL' : `'${dataItem['PRODUCT_TYPE_NAME']}'`)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'] === '' ? 'NULL' : `'${dataItem['PRODUCT_TYPE_CODE']}'`)
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'] === '' ? 'NULL' : `'${dataItem['PRODUCT_SUB_ID']}'`)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  createByProductTypeId_VariableAndProductTypeCode_Variable: async (dataItem: any) => {
    let sql = `
                SET @count = (SELECT COUNT(PRODUCT_TYPE_ID) FROM PRODUCT_TYPE);
                INSERT INTO PRODUCT_TYPE
                        (
                                  PRODUCT_TYPE_ID
                                , PRODUCT_TYPE_NAME
                                , PRODUCT_TYPE_CODE
                                , PRODUCT_SUB_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                        )
                VALUES
                        (
                                   @productTypeId
                                ,  'dataItem.PRODUCT_TYPE_NAME'
                                ,  CONCAT(dataItem.ITEM_CATEGORY_SHORT_NAME,dataItem.ACCOUNT_DEPARTMENT_CODE,'dataItem.productAlphabet', LPAD(@count + 1, 3, 0))
                                ,  dataItem.PRODUCT_SUB_ID
                                , 'dataItem.CREATE_BY'
                                ,  CURRENT_TIMESTAMP()
                                , 'dataItem.UPDATE_BY'
                        )
          `
    // sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['ITEM_CATEGORY_SHORT_NAME'] + '_' + dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'] === '' ? 'NULL' : `'${dataItem['PRODUCT_SUB_ID']}'`)
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'] != '' ? "'" + dataItem['ACCOUNT_DEPARTMENT_CODE'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_SHORT_NAME', dataItem['ITEM_CATEGORY_SHORT_NAME'] != '' ? "'" + dataItem['ITEM_CATEGORY_SHORT_NAME'] + "'" : 'NULL')
    sql = sql.replaceAll(
      'dataItem.productAlphabet',
      dataItem['ITEM_CATEGORY_SHORT_NAME'] === ' ' || dataItem['ACCOUNT_DEPARTMENT_CODE'] === ' '
        ? ' '
        : dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] === '0'
          ? dataItem.PRODUCT_SUB_ALPHABET
          : dataItem.PRODUCT_MAIN_ALPHABET
    )
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log('createByProductTypeId_VariableAndProductTypeCode_Variable', sql)
    return sql
  },
  createByProductTypeId_VariableAndProductTypeCode_WithOutProductTypeCode: async (dataItem: any) => {
    let sql = `
                INSERT INTO PRODUCT_TYPE
                        (
                                  PRODUCT_TYPE_ID
                                , PRODUCT_TYPE_NAME
                                , PRODUCT_SUB_ID
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY

                        )
                VALUES
                        (
                                   @productTypeId
                                ,  'dataItem.PRODUCT_TYPE_NAME'
                                ,  dataItem.PRODUCT_SUB_ID
                                , 'dataItem.CREATE_BY'
                                ,  CURRENT_TIMESTAMP()
                                , 'dataItem.UPDATE_BY'

                        )
          `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['ITEM_CATEGORY_SHORT_NAME'] + '_' + dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'] === '' ? 'NULL' : `'${dataItem['PRODUCT_SUB_ID']}'`)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log('createByProductTypeId_VariableAndProductTypeCode_Variable', sql)
    return sql
  },

  createProductType: async (dataItem: any, sqlWhereProductTypeCode: any) => {
    let sql = `
                  INSERT INTO PRODUCT_TYPE
                    (
                        PRODUCT_TYPE_ID
                      , PRODUCT_TYPE_NAME
                      , PRODUCT_TYPE_CODE
                      , PRODUCT_SUB_ID
                      , CREATE_BY
                      , UPDATE_DATE
                      , UPDATE_BY
                    )
                      SELECT
                            'dataItem.PRODUCT_TYPE_ID'
                          , 'dataItem.productTypeName'
                          ,  CONCAT('dataItem.ITEM_CATEGORY_SHORT_NAME','dataItem.ACCOUNT_DEPARTMENT_CODE','dataItem.productAlphabet', LPAD((SELECT COUNT(*) + 1), 3, 0))
                          , dataItem.PRODUCT_SUB_ID
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 'dataItem.CREATE_BY'
                    from
                          PRODUCT_TYPE tb_1
                    inner join PRODUCT_SUB tb_2
                          on tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
                    inner join PRODUCT_MAIN tb_3
                          ON  tb_2.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
                          dataItem.sqlWhereProductTypeCode

                    `

    sql = sql.replaceAll('dataItem.sqlWhereProductTypeCode', sqlWhereProductTypeCode)

    sql = sql.replaceAll(
      'dataItem.productTypeName',
      dataItem['ITEM_CATEGORY_SHORT_NAME'] === '' || dataItem['PC_NAME'] === '' ? '' : dataItem.ITEM_CATEGORY_SHORT_NAME + '_' + dataItem.PC_NAME
    )
    sql = sql.replaceAll(
      'dataItem.productAlphabet',
      dataItem['ITEM_CATEGORY_SHORT_NAME'] === ' ' || dataItem['ACCOUNT_DEPARTMENT_CODE'] === ' '
        ? ' '
        : dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] === '0'
          ? dataItem.PRODUCT_SUB_ALPHABET
          : dataItem.PRODUCT_MAIN_ALPHABET
    )
    sql = sql.replaceAll(
      'dataItem.ItemAlphabetWithAccountCode',
      dataItem['ITEM_CATEGORY_SHORT_NAME'] === '' || dataItem['ACCOUNT_DEPARTMENT_CODE'] === '' ? '' : dataItem.ITEM_CATEGORY_SHORT_NAME + dataItem.ACCOUNT_DEPARTMENT_CODE
    )

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_SHORT_NAME', dataItem['ITEM_CATEGORY_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'] != '' ? "'" + dataItem['PRODUCT_SUB_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('ItemAlphabetWithAccountCode' + sql)
    //console.log('CreateProductType' + sql)
    return sql
  },

  getByProductTypeForCopy: (dataItem: any, sqlWhereProductTypeForCopy: any) => {
    let sqlList = []
    let sql = `
          SELECT
                                  COUNT(*) AS TOTAL_COUNT
                            FROM     PRODUCT_TYPE tb_1
                      left join
                            PRODUCT_TYPE_BOI tb_2
                    on
                            tb_1.PRODUCT_TYPE_ID  = tb_2.PRODUCT_TYPE_ID
                    left join
                            PRODUCT_TYPE_BOM tb_4
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID  and tb_4.INUSE =1
                    left join
                            PRODUCT_TYPE_DETAIL tb_6
                    on
                            tb_1.PRODUCT_TYPE_ID =tb_6.PRODUCT_TYPE_ID  and tb_6.INUSE =1
                    left join
                            PRODUCT_TYPE_FLOW tb_7
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID and tb_7.INUSE =1
                    left join
                            PRODUCT_TYPE_ITEM_CATEGORY tb_8
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID and tb_8.INUSE =1
                    left join
                            PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_12
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID and tb_12.INUSE =1
                    left join
                            PRODUCT_TYPE_PROGRESS_WORKING tb_15
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_15.PRODUCT_TYPE_ID and tb_15.INUSE =1
                    left join
                            BOM tb_18
                    on
                            tb_4.BOM_ID = tb_18.BOM_ID and tb_18.INUSE =1
                    left join
                            FLOW tb_20
                    on
                              tb_7.FLOW_ID = tb_20.FLOW_ID and tb_20.INUSE =1
                    left join
                            ITEM_CATEGORY tb_21
                    on
                            tb_8.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID and tb_21.INUSE =1
                    left join
                            PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_22
                    on
                            tb_12.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_22.INUSE =1
                    left join
                            PRODUCT_MAIN tb_23
                    on
                              tb_22.PRODUCT_MAIN_ID = tb_23.PRODUCT_MAIN_ID and tb_23.INUSE =1
                    left join
                            PRODUCT_CATEGORY tb_24
                    on
                            tb_23.PRODUCT_CATEGORY_ID = tb_24.PRODUCT_CATEGORY_ID and tb_22.INUSE =1
                    left join
                            PRODUCT_SPECIFICATION_TYPE tb_25
                    on
                            tb_22.PRODUCT_SPECIFICATION_TYPE_ID = tb_25.PRODUCT_SPECIFICATION_TYPE_ID and tb_25.INUSE =1
                    left join
                            PRODUCT_SUB tb_26
                    on
                            tb_1.PRODUCT_SUB_ID = tb_26.PRODUCT_SUB_ID and tb_26.INUSE =1
                    left join
                           PRODUCT_TYPE_STATUS_WORKING tb_27
                    on
                            tb_15.PRODUCT_TYPE_STATUS_WORKING_ID = tb_27.PRODUCT_TYPE_STATUS_WORKING_ID and tb_27.INUSE = 1
                     left join
                            PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_28
                    on
                            tb_22.PRODUCT_MAIN_ID = tb_28.PRODUCT_MAIN_ID and tb_28.INUSE =1
                     left join
                            ACCOUNT_DEPARTMENT_CODE tb_29
                    on
                            tb_28.ACCOUNT_DEPARTMENT_CODE_ID = tb_29.ACCOUNT_DEPARTMENT_CODE_ID and tb_29.INUSE =1
                     left join
                            product_main_boi tb_30
                    on
                            tb_23.PRODUCT_MAIN_ID = tb_30.PRODUCT_MAIN_ID and tb_30.INUSE =1
                     left join
                            boi_project tb_31
                    on
                            tb_30.BOI_PROJECT_ID = tb_31.BOI_PROJECT_ID and tb_31.INUSE =1
                     left join
                            PRODUCT_ITEM tb_32
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_32.PRODUCT_TYPE_ID and tb_32.INUSE =1
                    left join
                        PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_33
                on
                        tb_1.PRODUCT_TYPE_ID = tb_33.PRODUCT_TYPE_ID and tb_33.INUSE =1
                    left join
                        CUSTOMER_INVOICE_TO tb_34
                on
                        tb_33.CUSTOMER_INVOICE_TO_ID = tb_34.CUSTOMER_INVOICE_TO_ID and tb_34.INUSE =1
                   dataItem.sqlWhereProductTypeForCopy
                                        `
    sql = sql.replaceAll('dataItem.sqlWhereProductTypeForCopy', sqlWhereProductTypeForCopy)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'] === '' ? 'NULL' : `'${dataItem['PRODUCT_TYPE_NAME']}'`)
    sqlList.push(sql)

    sql = `
      SELECT
       tb_1.PRODUCT_TYPE_ID
     , tb_1.PRODUCT_TYPE_NAME
     , tb_1.PRODUCT_TYPE_CODE
     , tb_1.PRODUCT_SUB_ID
     , tb_2.PRODUCT_TYPE_BOI_ID
     , tb_2.IS_BOI
     , tb_4.PRODUCT_TYPE_BOM_ID
     , tb_6.PRODUCT_TYPE_DETAIL_ID
     , tb_6.PC_NAME
     , tb_6.SUFFIX_FOR_PART_NUMBER
     , tb_6.IS_PRODUCT_FOR_REPAIR
     , tb_6.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
     , tb_6.FFT_PART_NUMBER
     , tb_7.PRODUCT_TYPE_FLOW_ID
     , tb_8.PRODUCT_TYPE_ITEM_CATEGORY_ID
     , tb_12.PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
     , tb_15.PRODUCT_TYPE_PROGRESS_WORKING_ID
     , tb_18.BOM_ID
     , tb_18.BOM_NAME
     , tb_18.BOM_CODE
     , tb_18.REVISION
     , tb_20.FLOW_ID
     , tb_20.FLOW_CODE
     , tb_20.FLOW_NAME
     , tb_20.TOTAL_COUNT_PROCESS
     , tb_21.ITEM_CATEGORY_ID
     , tb_21.ITEM_CATEGORY_NAME
     , tb_21.ITEM_CATEGORY_ALPHABET
     , tb_21.ITEM_CATEGORY_SHORT_NAME
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
     , tb_22.PRODUCT_PART_NUMBER
     , tb_22.PRODUCT_MAIN_ID
     , tb_23.PRODUCT_MAIN_NAME
     , tb_23.PRODUCT_MAIN_CODE
     , tb_23.PRODUCT_MAIN_ALPHABET
     , tb_23.PRODUCT_CATEGORY_ID
     , tb_24.PRODUCT_CATEGORY_NAME
     , tb_24.PRODUCT_CATEGORY_CODE
     , tb_24.PRODUCT_CATEGORY_ALPHABET
     , tb_25.PRODUCT_SPECIFICATION_TYPE_ID
     , tb_25.PRODUCT_SPECIFICATION_TYPE_NAME
     , tb_25.PRODUCT_SPECIFICATION_TYPE_ALPHABET
     , tb_26.PRODUCT_SUB_NAME
     , tb_26.PRODUCT_SUB_CODE
     , tb_26.PRODUCT_SUB_ALPHABET
     , tb_27.PRODUCT_TYPE_STATUS_WORKING_ID
     , tb_27.PRODUCT_TYPE_STATUS_WORKING_NAME
     , tb_28.PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID
     , tb_28.ACCOUNT_DEPARTMENT_CODE_ID
     , tb_29.ACCOUNT_DEPARTMENT_NAME
     , tb_29.ACCOUNT_DEPARTMENT_CODE
     , tb_30.BOI_PROJECT_ID
     , tb_31.BOI_PROJECT_NAME
     , tb_31.BOI_PROJECT_CODE
     , tb_32.PRODUCT_ITEM_ID
     , tb_32.PRODUCT_ITEM_CODE
     , tb_32.PRODUCT_ITEM_NAME
     , tb_33.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID
     , tb_33.CUSTOMER_INVOICE_TO_ID
     , tb_34.CUSTOMER_INVOICE_TO_NAME
     , tb_34.CUSTOMER_INVOICE_TO_ALPHABET
     , tb_1.UPDATE_BY
     , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS MODIFIED_DATE
     , tb_1.INUSE
     FROM     PRODUCT_TYPE tb_1
       left join
             PRODUCT_TYPE_BOI tb_2
     on
             tb_1.PRODUCT_TYPE_ID  = tb_2.PRODUCT_TYPE_ID
     left join
             PRODUCT_TYPE_BOM tb_4
     on
             tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID  and tb_4.INUSE =1
     left join
             PRODUCT_TYPE_DETAIL tb_6
     on
             tb_1.PRODUCT_TYPE_ID =tb_6.PRODUCT_TYPE_ID  and tb_6.INUSE =1
     left join
             PRODUCT_TYPE_FLOW tb_7
     on
             tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID and tb_7.INUSE =1
     left join
             PRODUCT_TYPE_ITEM_CATEGORY tb_8
     on
             tb_1.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID and tb_8.INUSE =1
     left join
             PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_12
     on
             tb_1.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID and tb_12.INUSE =1
     left join
             PRODUCT_TYPE_PROGRESS_WORKING tb_15
     on
             tb_1.PRODUCT_TYPE_ID = tb_15.PRODUCT_TYPE_ID and tb_15.INUSE =1
     left join
             BOM tb_18
     on
             tb_4.BOM_ID = tb_18.BOM_ID and tb_18.INUSE =1
     left join
             FLOW tb_20
     on
               tb_7.FLOW_ID = tb_20.FLOW_ID and tb_20.INUSE =1
     left join
             ITEM_CATEGORY tb_21
     on
             tb_8.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID and tb_21.INUSE =1
     left join
             PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_22
     on
             tb_12.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_22.INUSE =1
     left join
             PRODUCT_MAIN tb_23
     on
               tb_22.PRODUCT_MAIN_ID = tb_23.PRODUCT_MAIN_ID and tb_23.INUSE =1
     left join
             PRODUCT_CATEGORY tb_24
     on
             tb_23.PRODUCT_CATEGORY_ID = tb_24.PRODUCT_CATEGORY_ID and tb_22.INUSE =1
     left join
             PRODUCT_SPECIFICATION_TYPE tb_25
     on
             tb_22.PRODUCT_SPECIFICATION_TYPE_ID = tb_25.PRODUCT_SPECIFICATION_TYPE_ID and tb_25.INUSE =1
     left join
             PRODUCT_SUB tb_26
     on
             tb_1.PRODUCT_SUB_ID = tb_26.PRODUCT_SUB_ID and tb_26.INUSE =1
     left join
            PRODUCT_TYPE_STATUS_WORKING tb_27
     on
             tb_15.PRODUCT_TYPE_STATUS_WORKING_ID = tb_27.PRODUCT_TYPE_STATUS_WORKING_ID and tb_27.INUSE = 1
      left join
             PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_28
     on
             tb_22.PRODUCT_MAIN_ID = tb_28.PRODUCT_MAIN_ID and tb_28.INUSE =1
      left join
             ACCOUNT_DEPARTMENT_CODE tb_29
     on
             tb_28.ACCOUNT_DEPARTMENT_CODE_ID = tb_29.ACCOUNT_DEPARTMENT_CODE_ID and tb_29.INUSE =1
      left join
             product_main_boi tb_30
     on
             tb_23.PRODUCT_MAIN_ID = tb_30.PRODUCT_MAIN_ID and tb_30.INUSE =1
      left join
             boi_project tb_31
     on
             tb_30.BOI_PROJECT_ID = tb_31.BOI_PROJECT_ID and tb_31.INUSE =1
      left join
             PRODUCT_ITEM tb_32
     on
             tb_1.PRODUCT_TYPE_ID = tb_32.PRODUCT_TYPE_ID and tb_32.INUSE =1
      left join
             PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_33
     on
             tb_1.PRODUCT_TYPE_ID = tb_33.PRODUCT_TYPE_ID and tb_33.INUSE =1
      left join
             CUSTOMER_INVOICE_TO tb_34
       on
             tb_33.CUSTOMER_INVOICE_TO_ID = tb_34.CUSTOMER_INVOICE_TO_ID and tb_34.INUSE =1
        sqlWhereProductTypeForCopy
 `
    sql = sql.replaceAll('dataItem.sqlWhereProductTypeForCopy', sqlWhereProductTypeForCopy)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'] === '' ? 'NULL' : `'${dataItem['PRODUCT_TYPE_NAME']}'`)
    sqlList.push(sql)
    //     console.log('getByProductTypeForCopy2nd', sql)
    return sqlList
  },
  search: async (dataItem: any) => {
    let sqlList = []
    let sql = `
         SELECT
                                  COUNT(*) AS TOTAL_COUNT
                            FROM     PRODUCT_TYPE tb_1
                      left join
                            PRODUCT_TYPE_BOI tb_2
                    on
                            tb_1.PRODUCT_TYPE_ID  = tb_2.PRODUCT_TYPE_ID
                    left join
                            PRODUCT_TYPE_BOM tb_4
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID  and tb_4.INUSE =1
                    left join
                            PRODUCT_TYPE_DETAIL tb_6
                    on
                            tb_1.PRODUCT_TYPE_ID =tb_6.PRODUCT_TYPE_ID  and tb_6.INUSE =1
                    left join
                            PRODUCT_TYPE_FLOW tb_7
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID and tb_7.INUSE =1
                    left join
                            PRODUCT_TYPE_ITEM_CATEGORY tb_8
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID and tb_8.INUSE =1
                    inner join
                            PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_12
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID and tb_12.INUSE =1
                    inner join
                            PRODUCT_TYPE_PROGRESS_WORKING tb_15
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_15.PRODUCT_TYPE_ID and tb_15.INUSE =1
                    left join
                            BOM tb_18
                    on
                            tb_4.BOM_ID = tb_18.BOM_ID and tb_18.INUSE =1
                    left join
                            FLOW tb_20
                    on
                              tb_7.FLOW_ID = tb_20.FLOW_ID and tb_20.INUSE =1
                    left join
                            ITEM_CATEGORY tb_21
                    on
                            tb_8.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID and tb_21.INUSE =1
                    inner join
                            PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_22
                    on
                            tb_12.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_22.INUSE =1
                    left join
                            PRODUCT_MAIN tb_23
                    on
                              tb_22.PRODUCT_MAIN_ID = tb_23.PRODUCT_MAIN_ID and tb_23.INUSE =1
                    left join
                            PRODUCT_CATEGORY tb_24
                    on
                            tb_23.PRODUCT_CATEGORY_ID = tb_24.PRODUCT_CATEGORY_ID and tb_22.INUSE =1
                    left join
                            PRODUCT_SPECIFICATION_TYPE tb_25
                    on
                            tb_22.PRODUCT_SPECIFICATION_TYPE_ID = tb_25.PRODUCT_SPECIFICATION_TYPE_ID and tb_25.INUSE =1
                    left join
                            PRODUCT_SUB tb_26
                    on
                            tb_1.PRODUCT_SUB_ID = tb_26.PRODUCT_SUB_ID and tb_26.INUSE =1
                    inner join
                           PRODUCT_TYPE_STATUS_WORKING tb_27
                    on
                            tb_15.PRODUCT_TYPE_STATUS_WORKING_ID = tb_27.PRODUCT_TYPE_STATUS_WORKING_ID and tb_27.INUSE = 1
                     left join
                            PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_28
                    on
                            tb_22.PRODUCT_MAIN_ID = tb_28.PRODUCT_MAIN_ID and tb_28.INUSE =1
                     left join
                            ACCOUNT_DEPARTMENT_CODE tb_29
                    on
                            tb_28.ACCOUNT_DEPARTMENT_CODE_ID = tb_29.ACCOUNT_DEPARTMENT_CODE_ID and tb_29.INUSE =1
                     left join
                            product_main_boi tb_30
                    on
                            tb_23.PRODUCT_MAIN_ID = tb_30.PRODUCT_MAIN_ID and tb_30.INUSE =1
                     left join
                            boi_project tb_31
                    on
                            tb_30.BOI_PROJECT_ID = tb_31.BOI_PROJECT_ID and tb_31.INUSE =1
                     left join
                            PRODUCT_ITEM tb_32
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_32.PRODUCT_TYPE_ID and tb_32.INUSE =1
                    left join
                        PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_33
                on
                        tb_1.PRODUCT_TYPE_ID = tb_33.PRODUCT_TYPE_ID and tb_33.INUSE =1
                    left join
                        CUSTOMER_INVOICE_TO tb_34
                on
                        tb_33.CUSTOMER_INVOICE_TO_ID = tb_34.CUSTOMER_INVOICE_TO_ID and tb_34.INUSE =1

                        dataItem.sqlWhere
                 `
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_CODE', dataItem['PRODUCT_ITEM_CODE'])
    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    console.log('sqlWhere ' + sql)
    sqlList.push(sql)

    sql = `
   SELECT
       tb_1.PRODUCT_TYPE_ID
     , tb_1.PRODUCT_TYPE_NAME
     , tb_1.PRODUCT_TYPE_CODE
     , tb_1.PRODUCT_SUB_ID
     , tb_2.PRODUCT_TYPE_BOI_ID
     , tb_2.IS_BOI
     , tb_4.PRODUCT_TYPE_BOM_ID
     , tb_6.PRODUCT_TYPE_DETAIL_ID
     , tb_6.PC_NAME
     , tb_6.SUFFIX_FOR_PART_NUMBER
     , tb_6.IS_PRODUCT_FOR_REPAIR
     , tb_6.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
     , tb_6.FFT_PART_NUMBER
     , tb_7.PRODUCT_TYPE_FLOW_ID
     , tb_8.PRODUCT_TYPE_ITEM_CATEGORY_ID
     , tb_12.PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
     , tb_15.PRODUCT_TYPE_PROGRESS_WORKING_ID
     , tb_18.BOM_ID
     , tb_18.BOM_NAME
     , tb_18.BOM_CODE
     , tb_18.REVISION
     , tb_20.FLOW_ID
     , tb_20.FLOW_CODE
     , tb_20.FLOW_NAME
     , tb_20.TOTAL_COUNT_PROCESS
     , tb_21.ITEM_CATEGORY_ID
     , tb_21.ITEM_CATEGORY_NAME
     , tb_21.ITEM_CATEGORY_ALPHABET
     , tb_21.ITEM_CATEGORY_SHORT_NAME
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
     , tb_22.PRODUCT_PART_NUMBER
     , tb_22.PRODUCT_MAIN_ID
     , tb_23.PRODUCT_MAIN_NAME
     , tb_23.PRODUCT_MAIN_CODE
     , tb_23.PRODUCT_MAIN_ALPHABET
     , tb_23.PRODUCT_CATEGORY_ID
     , tb_24.PRODUCT_CATEGORY_NAME
     , tb_24.PRODUCT_CATEGORY_CODE
     , tb_24.PRODUCT_CATEGORY_ALPHABET
     , tb_25.PRODUCT_SPECIFICATION_TYPE_ID
     , tb_25.PRODUCT_SPECIFICATION_TYPE_NAME
     , tb_25.PRODUCT_SPECIFICATION_TYPE_ALPHABET
     , tb_26.PRODUCT_SUB_NAME
     , tb_26.PRODUCT_SUB_CODE
     , tb_26.PRODUCT_SUB_ALPHABET
     , tb_27.PRODUCT_TYPE_STATUS_WORKING_ID
     , tb_27.PRODUCT_TYPE_STATUS_WORKING_NAME
     , tb_28.PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID
     , tb_28.ACCOUNT_DEPARTMENT_CODE_ID
     , tb_29.ACCOUNT_DEPARTMENT_NAME
     , tb_29.ACCOUNT_DEPARTMENT_CODE
     , tb_30.BOI_PROJECT_ID
     , tb_31.BOI_PROJECT_NAME
     , tb_31.BOI_PROJECT_CODE
     , tb_32.PRODUCT_ITEM_ID
     , tb_32.PRODUCT_ITEM_CODE
     , tb_32.PRODUCT_ITEM_NAME
     , tb_33.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID
     , tb_33.CUSTOMER_INVOICE_TO_ID
     , tb_34.CUSTOMER_INVOICE_TO_NAME
     , tb_34.CUSTOMER_INVOICE_TO_ALPHABET
     , tb_1.UPDATE_BY
     , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS MODIFIED_DATE
     , tb_1.INUSE
     FROM     PRODUCT_TYPE tb_1
       left join
             PRODUCT_TYPE_BOI tb_2
     on
             tb_1.PRODUCT_TYPE_ID  = tb_2.PRODUCT_TYPE_ID
     left join
             PRODUCT_TYPE_BOM tb_4
     on
             tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID  and tb_4.INUSE =1
     left join
             PRODUCT_TYPE_DETAIL tb_6
     on
             tb_1.PRODUCT_TYPE_ID =tb_6.PRODUCT_TYPE_ID  and tb_6.INUSE =1
     left join
             PRODUCT_TYPE_FLOW tb_7
     on
             tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID and tb_7.INUSE =1
     left join
             PRODUCT_TYPE_ITEM_CATEGORY tb_8
     on
             tb_1.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID and tb_8.INUSE =1
     inner join
             PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_12
     on
             tb_1.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID and tb_12.INUSE =1
     inner join
             PRODUCT_TYPE_PROGRESS_WORKING tb_15
     on
             tb_1.PRODUCT_TYPE_ID = tb_15.PRODUCT_TYPE_ID and tb_15.INUSE =1
     left join
             BOM tb_18
     on
             tb_4.BOM_ID = tb_18.BOM_ID and tb_18.INUSE =1
     left join
             FLOW tb_20
     on
               tb_7.FLOW_ID = tb_20.FLOW_ID and tb_20.INUSE =1
     left join
             ITEM_CATEGORY tb_21
     on
             tb_8.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID and tb_21.INUSE =1
     inner join
             PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_22
     on
             tb_12.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_22.INUSE =1
     left join
             PRODUCT_MAIN tb_23
     on
               tb_22.PRODUCT_MAIN_ID = tb_23.PRODUCT_MAIN_ID and tb_23.INUSE =1
     left join
             PRODUCT_CATEGORY tb_24
     on
             tb_23.PRODUCT_CATEGORY_ID = tb_24.PRODUCT_CATEGORY_ID and tb_22.INUSE =1
     left join
             PRODUCT_SPECIFICATION_TYPE tb_25
     on
             tb_22.PRODUCT_SPECIFICATION_TYPE_ID = tb_25.PRODUCT_SPECIFICATION_TYPE_ID and tb_25.INUSE =1
     left join
             PRODUCT_SUB tb_26
     on
             tb_1.PRODUCT_SUB_ID = tb_26.PRODUCT_SUB_ID and tb_26.INUSE =1
     inner join
            PRODUCT_TYPE_STATUS_WORKING tb_27
     on
             tb_15.PRODUCT_TYPE_STATUS_WORKING_ID = tb_27.PRODUCT_TYPE_STATUS_WORKING_ID and tb_27.INUSE = 1
      left join
             PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_28
     on
             tb_22.PRODUCT_MAIN_ID = tb_28.PRODUCT_MAIN_ID and tb_28.INUSE =1
      left join
             ACCOUNT_DEPARTMENT_CODE tb_29
     on
             tb_28.ACCOUNT_DEPARTMENT_CODE_ID = tb_29.ACCOUNT_DEPARTMENT_CODE_ID and tb_29.INUSE =1
      left join
             product_main_boi tb_30
     on
             tb_23.PRODUCT_MAIN_ID = tb_30.PRODUCT_MAIN_ID and tb_30.INUSE =1
      left join
             boi_project tb_31
     on
             tb_30.BOI_PROJECT_ID = tb_31.BOI_PROJECT_ID and tb_31.INUSE =1
      left join
             PRODUCT_ITEM tb_32
     on
             tb_1.PRODUCT_TYPE_ID = tb_32.PRODUCT_TYPE_ID and tb_32.INUSE =1
      left join
             PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_33
     on
             tb_1.PRODUCT_TYPE_ID = tb_33.PRODUCT_TYPE_ID and tb_33.INUSE =1
      left join
             CUSTOMER_INVOICE_TO tb_34
       on
             tb_33.CUSTOMER_INVOICE_TO_ID = tb_34.CUSTOMER_INVOICE_TO_ID and tb_34.INUSE =1

        dataItem.sqlWhere
       LIMIT
                                dataItem.Start
                              , dataItem.Limit

 `

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_STATUS_WORKING_ID', dataItem['PRODUCT_TYPE_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_CODE', dataItem['PRODUCT_ITEM_CODE'])
    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sqlList.push(sql)
    //     console.log(sql)

    return sqlList
  },

  getByProductTypeStatusWorkingAndInuse: () => {
    let sqlList = []
    let sql = `
                     SELECT
                                  COUNT(*) AS TOTAL_COUNT
                            FROM     PRODUCT_TYPE tb_1
                      left join
                            PRODUCT_TYPE_BOI tb_2
                    on
                            tb_1.PRODUCT_TYPE_ID  = tb_2.PRODUCT_TYPE_ID
                    left join
                            PRODUCT_TYPE_BOM tb_4
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID  and tb_4.INUSE =1
                    left join
                            PRODUCT_TYPE_DETAIL tb_6
                    on
                            tb_1.PRODUCT_TYPE_ID =tb_6.PRODUCT_TYPE_ID  and tb_6.INUSE =1
                    left join
                            PRODUCT_TYPE_FLOW tb_7
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID and tb_7.INUSE =1
                    left join
                            PRODUCT_TYPE_ITEM_CATEGORY tb_8
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID and tb_8.INUSE =1
                    left join
                            PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_12
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID and tb_12.INUSE =1
                    left join
                            PRODUCT_TYPE_PROGRESS_WORKING tb_15
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_15.PRODUCT_TYPE_ID and tb_15.INUSE =1
                    left join
                            BOM tb_18
                    on
                            tb_4.BOM_ID = tb_18.BOM_ID and tb_18.INUSE =1
                    left join
                            FLOW tb_20
                    on
                              tb_7.FLOW_ID = tb_20.FLOW_ID and tb_20.INUSE =1
                    left join
                            ITEM_CATEGORY tb_21
                    on
                            tb_8.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID and tb_21.INUSE =1
                    left join
                            PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_22
                    on
                            tb_12.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_22.INUSE =1
                    left join
                            PRODUCT_MAIN tb_23
                    on
                              tb_22.PRODUCT_MAIN_ID = tb_23.PRODUCT_MAIN_ID and tb_23.INUSE =1
                    left join
                            PRODUCT_CATEGORY tb_24
                    on
                            tb_23.PRODUCT_CATEGORY_ID = tb_24.PRODUCT_CATEGORY_ID and tb_22.INUSE =1
                    left join
                            PRODUCT_SPECIFICATION_TYPE tb_25
                    on
                            tb_22.PRODUCT_SPECIFICATION_TYPE_ID = tb_25.PRODUCT_SPECIFICATION_TYPE_ID and tb_25.INUSE =1
                    left join
                            PRODUCT_SUB tb_26
                    on
                            tb_1.PRODUCT_SUB_ID = tb_26.PRODUCT_SUB_ID and tb_26.INUSE =1
                    left join
                           PRODUCT_TYPE_STATUS_WORKING tb_27
                    on
                            tb_15.PRODUCT_TYPE_STATUS_WORKING_ID = tb_27.PRODUCT_TYPE_STATUS_WORKING_ID and tb_27.INUSE = 1
                     left join
                            PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_28
                    on
                            tb_22.PRODUCT_MAIN_ID = tb_28.PRODUCT_MAIN_ID and tb_28.INUSE =1
                     left join
                            ACCOUNT_DEPARTMENT_CODE tb_29
                    on
                            tb_28.ACCOUNT_DEPARTMENT_CODE_ID = tb_29.ACCOUNT_DEPARTMENT_CODE_ID and tb_29.INUSE =1
                     left join
                            product_main_boi tb_30
                    on
                            tb_23.PRODUCT_MAIN_ID = tb_30.PRODUCT_MAIN_ID and tb_30.INUSE =1
                     left join
                            boi_project tb_31
                    on
                            tb_30.BOI_PROJECT_ID = tb_31.BOI_PROJECT_ID and tb_31.INUSE =1
                     left join
                            PRODUCT_ITEM tb_32
                    on
                            tb_1.PRODUCT_TYPE_ID = tb_32.PRODUCT_TYPE_ID and tb_32.INUSE =1
                    left join
                        PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_33
                on
                        tb_1.PRODUCT_TYPE_ID = tb_33.PRODUCT_TYPE_ID and tb_33.INUSE =1
                    left join
                        CUSTOMER_INVOICE_TO tb_34
                on
                        tb_33.CUSTOMER_INVOICE_TO_ID = tb_34.CUSTOMER_INVOICE_TO_ID and tb_34.INUSE =1
                WHERE    (tb_27.PRODUCT_TYPE_STATUS_WORKING_ID LIKE '2' OR tb_27.PRODUCT_TYPE_STATUS_WORKING_ID IS NULL)
     AND
                           tb_1.INUSE LIKE '1'
                                    `
    //console.log('SearchTypeInComplete', sql)
    sqlList.push(sql)

    sql = `
   SELECT
       tb_1.PRODUCT_TYPE_ID
     , tb_1.PRODUCT_TYPE_NAME
     , tb_1.PRODUCT_TYPE_CODE
     , tb_1.PRODUCT_SUB_ID
     , tb_2.PRODUCT_TYPE_BOI_ID
     , tb_2.IS_BOI
     , tb_4.PRODUCT_TYPE_BOM_ID
     , tb_6.PRODUCT_TYPE_DETAIL_ID
     , tb_6.PC_NAME
     , tb_6.SUFFIX_FOR_PART_NUMBER
     , tb_6.IS_PRODUCT_FOR_REPAIR
     , tb_6.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
     , tb_6.FFT_PART_NUMBER
     , tb_7.PRODUCT_TYPE_FLOW_ID
     , tb_8.PRODUCT_TYPE_ITEM_CATEGORY_ID
     , tb_12.PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
     , tb_15.PRODUCT_TYPE_PROGRESS_WORKING_ID
     , tb_18.BOM_ID
     , tb_18.BOM_NAME
     , tb_18.BOM_CODE
     , tb_18.REVISION
     , tb_20.FLOW_ID
     , tb_20.FLOW_CODE
     , tb_20.FLOW_NAME
     , tb_20.TOTAL_COUNT_PROCESS
     , tb_21.ITEM_CATEGORY_ID
     , tb_21.ITEM_CATEGORY_NAME
     , tb_21.ITEM_CATEGORY_ALPHABET
     , tb_21.ITEM_CATEGORY_SHORT_NAME
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
     , tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
     , tb_22.PRODUCT_PART_NUMBER
     , tb_22.PRODUCT_MAIN_ID
     , tb_23.PRODUCT_MAIN_NAME
     , tb_23.PRODUCT_MAIN_CODE
     , tb_23.PRODUCT_MAIN_ALPHABET
     , tb_23.PRODUCT_CATEGORY_ID
     , tb_24.PRODUCT_CATEGORY_NAME
     , tb_24.PRODUCT_CATEGORY_CODE
     , tb_24.PRODUCT_CATEGORY_ALPHABET
     , tb_25.PRODUCT_SPECIFICATION_TYPE_ID
     , tb_25.PRODUCT_SPECIFICATION_TYPE_NAME
     , tb_25.PRODUCT_SPECIFICATION_TYPE_ALPHABET
     , tb_26.PRODUCT_SUB_NAME
     , tb_26.PRODUCT_SUB_CODE
     , tb_26.PRODUCT_SUB_ALPHABET
     , tb_27.PRODUCT_TYPE_STATUS_WORKING_ID
     , tb_27.PRODUCT_TYPE_STATUS_WORKING_NAME
     , tb_28.PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID
     , tb_28.ACCOUNT_DEPARTMENT_CODE_ID
     , tb_29.ACCOUNT_DEPARTMENT_NAME
     , tb_29.ACCOUNT_DEPARTMENT_CODE
     , tb_30.BOI_PROJECT_ID
     , tb_31.BOI_PROJECT_NAME
     , tb_31.BOI_PROJECT_CODE
     , tb_32.PRODUCT_ITEM_ID
     , tb_32.PRODUCT_ITEM_CODE
     , tb_32.PRODUCT_ITEM_NAME
     , tb_33.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID
     , tb_33.CUSTOMER_INVOICE_TO_ID
     , tb_34.CUSTOMER_INVOICE_TO_NAME
     , tb_34.CUSTOMER_INVOICE_TO_ALPHABET
     , tb_1.UPDATE_BY
     , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS MODIFIED_DATE
     , tb_1.INUSE
     FROM     PRODUCT_TYPE tb_1
       left join
             PRODUCT_TYPE_BOI tb_2
     on
             tb_1.PRODUCT_TYPE_ID  = tb_2.PRODUCT_TYPE_ID
     left join
             PRODUCT_TYPE_BOM tb_4
     on
             tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID  and tb_4.INUSE =1
     left join
             PRODUCT_TYPE_DETAIL tb_6
     on
             tb_1.PRODUCT_TYPE_ID =tb_6.PRODUCT_TYPE_ID  and tb_6.INUSE =1
     left join
             PRODUCT_TYPE_FLOW tb_7
     on
             tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID and tb_7.INUSE =1
     left join
             PRODUCT_TYPE_ITEM_CATEGORY tb_8
     on
             tb_1.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID and tb_8.INUSE =1
     left join
             PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_12
     on
             tb_1.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID and tb_12.INUSE =1
     left join
             PRODUCT_TYPE_PROGRESS_WORKING tb_15
     on
             tb_1.PRODUCT_TYPE_ID = tb_15.PRODUCT_TYPE_ID and tb_15.INUSE =1
     left join
             BOM tb_18
     on
             tb_4.BOM_ID = tb_18.BOM_ID and tb_18.INUSE =1
     left join
             FLOW tb_20
     on
               tb_7.FLOW_ID = tb_20.FLOW_ID and tb_20.INUSE =1
     left join
             ITEM_CATEGORY tb_21
     on
             tb_8.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID and tb_21.INUSE =1
     left join
             PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_22
     on
             tb_12.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_22.INUSE =1
     left join
             PRODUCT_MAIN tb_23
     on
               tb_22.PRODUCT_MAIN_ID = tb_23.PRODUCT_MAIN_ID and tb_23.INUSE =1
     left join
             PRODUCT_CATEGORY tb_24
     on
             tb_23.PRODUCT_CATEGORY_ID = tb_24.PRODUCT_CATEGORY_ID and tb_22.INUSE =1
     left join
             PRODUCT_SPECIFICATION_TYPE tb_25
     on
             tb_22.PRODUCT_SPECIFICATION_TYPE_ID = tb_25.PRODUCT_SPECIFICATION_TYPE_ID and tb_25.INUSE =1
     left join
             PRODUCT_SUB tb_26
     on
             tb_1.PRODUCT_SUB_ID = tb_26.PRODUCT_SUB_ID and tb_26.INUSE =1
     left join
            PRODUCT_TYPE_STATUS_WORKING tb_27
     on
             tb_15.PRODUCT_TYPE_STATUS_WORKING_ID = tb_27.PRODUCT_TYPE_STATUS_WORKING_ID and tb_27.INUSE = 1
      left join
             PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_28
     on
             tb_22.PRODUCT_MAIN_ID = tb_28.PRODUCT_MAIN_ID and tb_28.INUSE =1
      left join
             ACCOUNT_DEPARTMENT_CODE tb_29
     on
             tb_28.ACCOUNT_DEPARTMENT_CODE_ID = tb_29.ACCOUNT_DEPARTMENT_CODE_ID and tb_29.INUSE =1
      left join
             product_main_boi tb_30
     on
             tb_23.PRODUCT_MAIN_ID = tb_30.PRODUCT_MAIN_ID and tb_30.INUSE =1
      left join
             boi_project tb_31
     on
             tb_30.BOI_PROJECT_ID = tb_31.BOI_PROJECT_ID and tb_31.INUSE =1
      left join
             PRODUCT_ITEM tb_32
     on
             tb_1.PRODUCT_TYPE_ID = tb_32.PRODUCT_TYPE_ID and tb_32.INUSE =1
      left join
             PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_33
     on
             tb_1.PRODUCT_TYPE_ID = tb_33.PRODUCT_TYPE_ID and tb_33.INUSE =1
      left join
             CUSTOMER_INVOICE_TO tb_34
       on
             tb_33.CUSTOMER_INVOICE_TO_ID = tb_34.CUSTOMER_INVOICE_TO_ID and tb_34.INUSE =1
                WHERE      tb_27.PRODUCT_TYPE_STATUS_WORKING_ID LIKE '2'
                AND
                           tb_1.INUSE LIKE '1'
                ;
            `
    sqlList.push(sql)
    return sqlList
  },

  getByLikeProductTypeNameAndInuse_: async (dataItem: any) => {
    let sql = `
                    SELECT
                            tb_1.PRODUCT_TYPE_ID
                          , tb_1.PRODUCT_TYPE_NAME
                          , tb_1.PRODUCT_TYPE_CODE
                          , tb_1.PRODUCT_SUB_ID
                          , tb_2.BOM_ID
                  FROM
                          PRODUCT_TYPE tb_1
                                LEFT JOIN
                          PRODUCT_TYPE_BOM tb_2
                                ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID and tb_2.INUSE =1
                  WHERE
                              tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'
                          AND tb_1.INUSE = 'dataItem.INUSE'
                  ORDER BY
                          tb_1.PRODUCT_TYPE_NAME ASC
                  LIMIT
                        50
                  `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeProductTypeCodeAndInuse: async (dataItem: any) => {
    let sql = `
                    SELECT
                            tb_1.PRODUCT_TYPE_ID
                          , tb_1.PRODUCT_TYPE_NAME
                          , tb_1.PRODUCT_TYPE_CODE_FOR_SCT as PRODUCT_TYPE_CODE
                          , tb_1.PRODUCT_SUB_ID
                  FROM
                          PRODUCT_TYPE tb_1
                  WHERE
                              tb_1.PRODUCT_TYPE_CODE_FOR_SCT LIKE '%dataItem.PRODUCT_TYPE_CODE%'
                          AND tb_1.INUSE = 'dataItem.INUSE'
                  ORDER BY
                          tb_1.PRODUCT_TYPE_NAME ASC
                  LIMIT
                        50
                  `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeProductTypeNameAndInuse_withSqlWhere: async (dataItem: any, sqlWhere: any) => {
    let sql = `
                        SELECT
                                  tb_1.PRODUCT_TYPE_ID
                                , tb_1.PRODUCT_TYPE_NAME
                                , tb_1.PRODUCT_TYPE_CODE_FOR_SCT as PRODUCT_TYPE_CODE
                                , tb_1.PRODUCT_SUB_ID
                                , tb_3.ITEM_CATEGORY_NAME
                                , tb_3.ITEM_CATEGORY_ID
                                , tb_6.PRODUCT_SPECIFICATION_TYPE_NAME
                                , tb_6.PRODUCT_SPECIFICATION_TYPE_ALPHABET
                                , tb_7.PRODUCT_SUB_NAME
                                , tb_7.PRODUCT_SUB_ALPHABET
                                , tb_8.PRODUCT_MAIN_ALPHABET
                                , tb_8.PRODUCT_MAIN_ID
                                , tb_8.PRODUCT_MAIN_NAME
                                , tb_9.BOM_ID
                                , tb_10.PRODUCT_CATEGORY_NAME
                                , tb_10.PRODUCT_CATEGORY_CODE
                                , tb_10.PRODUCT_CATEGORY_ALPHABET
                                , tb_10.PRODUCT_CATEGORY_ID
                                , tb_12.P2_NEED
                                , tb_13.BOM_NAME
                                , tb_13.BOM_CODE
                        FROM
                                PRODUCT_TYPE tb_1
                                     INNER JOIN
                                PRODUCT_TYPE_ITEM_CATEGORY tb_2
                                        ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                         and tb_2.INUSE =1
                                     INNER JOIN
                                ITEM_CATEGORY tb_3
                                        ON
                                        tb_2.ITEM_CATEGORY_ID = tb_3.ITEM_CATEGORY_ID
                                      LEFT JOIN
                                PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_4
                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID  and tb_4.INUSE =1
                                        LEFT JOIN
                                PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_5
                                        ON tb_4.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_5.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                        LEFT JOIN
                                 PRODUCT_SPECIFICATION_TYPE tb_6
                                        ON tb_5.PRODUCT_SPECIFICATION_TYPE_ID = tb_6.PRODUCT_SPECIFICATION_TYPE_ID
                                        LEFT JOIN
                                PRODUCT_SUB tb_7
                                        ON tb_1.PRODUCT_SUB_ID = tb_7.PRODUCT_SUB_ID
                                        LEFT JOIN
                                PRODUCT_MAIN tb_8
                                        ON tb_7.PRODUCT_MAIN_ID = tb_8.PRODUCT_MAIN_ID
                                        LEFT JOIN
                                PRODUCT_CATEGORY tb_10
                                        ON tb_8.PRODUCT_CATEGORY_ID = tb_10.PRODUCT_CATEGORY_ID
                                        LEFT JOIN
                                PRODUCT_TYPE_BOM tb_9
                                        ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                        and tb_9.INUSE = 1
                                        LEFT JOIN
                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_11
                                        ON
                                tb_1.PRODUCT_TYPE_ID = tb_11.PRODUCT_TYPE_ID and tb_11.INUSE = 1
                                        LEFT JOIN
                                FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO tb_12
                                        ON
                                tb_11.CUSTOMER_INVOICE_TO_ID = tb_12.CUSTOMER_INVOICE_TO_ID
                                        LEFT JOIN
                                BOM tb_13
                                        ON tb_9.BOM_ID = tb_13.BOM_ID

                        dataItem.sqlWhere

                        GROUP BY
                                tb_1.PRODUCT_TYPE_NAME

                        ORDER BY
                                tb_1.PRODUCT_TYPE_NAME ASC
                        LIMIT
                                50
                  `
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log(sql)
    return sql
  },
  getByLikeProductTypeNameAndProductMainIdAndInuse_: async (dataItem: any) => {
    let sql = `
                        SELECT
                                      tb_1.PRODUCT_TYPE_ID
                                    , tb_1.PRODUCT_TYPE_NAME
                                    , tb_1.PRODUCT_TYPE_CODE_FOR_SCT as PRODUCT_TYPE_CODE
                                    , tb_5.BOM_ID
                                    , tb_5.BOM_CODE
                                    , tb_6.FLOW_ID
                                    , tb_6.FLOW_NAME
                                    , tb_6.FLOW_CODE
                        FROM
                                    PRODUCT_TYPE tb_1
                                        INNER JOIN
                                    PRODUCT_SUB tb_2
                                            ON tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
                                        AND tb_1.INUSE = 1
                                        INNER JOIN
                                    PRODUCT_MAIN tb_3
                                            ON tb_2.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID and  tb_2.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID
                                        AND tb_3.INUSE = 1
                                        LEFT JOIN
                                    product_type_bom tb_4
                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID and tb_4.INUSE =1
                                        LEFT JOIN
                                    bom tb_5
                                        ON tb_4.BOM_ID = tb_5.BOM_ID
                                        LEFT JOIN
                                    FLOW tb_6
                                        ON tb_5.FLOW_ID = tb_6.FLOW_ID
                        WHERE
                                        tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'
                                    AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                                    AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT <> ''
                        ORDER BY
                                    tb_1.PRODUCT_TYPE_NAME ASC
                        LIMIT
                                    50
          `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    //     console.log(sql)

    return sql
  },
  getByLikeProductTypeCodeAndProductMainIdAndInuse: async (dataItem: any) => {
    let sql = `
                                                SELECT
                                      tb_1.PRODUCT_TYPE_ID
                                    , tb_1.PRODUCT_TYPE_NAME
                                    , tb_1.PRODUCT_TYPE_CODE_FOR_SCT as PRODUCT_TYPE_CODE
                                    , tb_5.BOM_ID
                                    , tb_5.BOM_CODE
                                    , tb_6.FLOW_ID
                                    , tb_6.FLOW_CODE
                                    , tb_6.FLOW_NAME
                        FROM
                                    PRODUCT_TYPE tb_1
                                        INNER JOIN
                                    PRODUCT_SUB tb_2
                                            ON tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
                                        AND tb_1.INUSE = 1
                                        INNER JOIN
                                    PRODUCT_MAIN tb_3
                                            ON tb_2.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID and  tb_2.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID
                                        AND tb_3.INUSE = 1
                                         LEFT JOIN
                                        product_type_bom tb_4
                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID and  tb_4.INUSE =1
                                        LEFT JOIN
                                    bom tb_5
                                        ON tb_4.BOM_ID = tb_5.BOM_ID
                                        LEFT JOIN
                                    FLOW tb_6
                                        ON tb_5.FLOW_ID = tb_6.FLOW_ID
                        WHERE
                                    tb_1.PRODUCT_TYPE_CODE_FOR_SCT LIKE '%dataItem.PRODUCT_TYPE_CODE%'
                                AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                                AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT <> ''
                        ORDER BY
                                    tb_1.PRODUCT_TYPE_CODE_FOR_SCT ASC
                        LIMIT
                                    50
          `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeProductTypeNameAndProductMainIdAndInuse: async (dataItem: any) => {
    let sql = `
                        SELECT
                                      tb_1.PRODUCT_TYPE_ID
                                    , tb_1.PRODUCT_TYPE_NAME
                                    , tb_1.PRODUCT_TYPE_CODE_FOR_SCT as PRODUCT_TYPE_CODE
                                    , tb_4.ITEM_CATEGORY_ID
                                    , tb_4.ITEM_CATEGORY_NAME
                                    , tb_4.ITEM_CATEGORY_ALPHABET
                                    , tb_2.PRODUCT_SUB_ALPHABET
                                    , tb_7.PRODUCT_SPECIFICATION_TYPE_NAME
                                    , tb_7.PRODUCT_SPECIFICATION_TYPE_ALPHABET
                                    , tb_8.PRODUCT_MAIN_ALPHABET
                                    , tb_8.PRODUCT_MAIN_ID
                                    , tb_9.BOM_ID
                                    , tb_10.BOM_CODE
                                    , tb_12.FLOW_CODE
                        FROM
                                    PRODUCT_TYPE tb_1
                                INNER JOIN
                                    PRODUCT_SUB tb_2
                                            ON tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
                                            AND tb_2.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                INNER JOIN
                                    PRODUCT_TYPE_ITEM_CATEGORY tb_3
                                                ON tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
                                                AND tb_3.INUSE = 1
                                INNER JOIN
                                    ITEM_CATEGORY tb_4
                                                ON tb_3.ITEM_CATEGORY_ID = tb_4.ITEM_CATEGORY_ID
                                JOIN
                                        PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_5
                                ON
                                        tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                JOIN
                                        PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_6
                                ON
                                        tb_5.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_6.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                JOIN
                                        PRODUCT_SPECIFICATION_TYPE tb_7
                                ON
                                        tb_6.PRODUCT_SPECIFICATION_TYPE_ID = tb_7.PRODUCT_SPECIFICATION_TYPE_ID
                                JOIN
                                        PRODUCT_MAIN tb_8
                                ON
                                        tb_2.PRODUCT_MAIN_ID = tb_8.PRODUCT_MAIN_ID
                                LEFT JOIN
                                        PRODUCT_TYPE_BOM tb_9
                                ON
                                        tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID AND tb_9.INUSE = 1
                                LEFT JOIN
                                        BOM tb_10
                                ON
                                        tb_9.BOM_ID = tb_10.BOM_ID
                                LEFT JOIN
                                        PRODUCT_TYPE_FLOW tb_11
                                ON
                                        tb_1.PRODUCT_TYPE_ID = tb_11.PRODUCT_TYPE_ID AND tb_11.INUSE = 1
                                LEFT JOIN
                                        FLOW tb_12
                                ON
                                        tb_11.FLOW_ID = tb_12.FLOW_ID
                        WHERE
                                        tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'
                                    AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                                    AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT != ''
                        ORDER BY
                                    tb_1.PRODUCT_TYPE_NAME ASC
                        LIMIT
                                    50
          `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods: async (dataItem: any) => {
    let sql = `
                      SELECT
                                  tb_1.PRODUCT_TYPE_ID
                                , tb_1.PRODUCT_TYPE_NAME
                                , tb_1.PRODUCT_TYPE_CODE
                                , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                                , tb_4.ITEM_CATEGORY_ID
                                , tb_4.ITEM_CATEGORY_NAME
                                , tb_4.ITEM_CATEGORY_ALPHABET
                                , tb_2.PRODUCT_SUB_ALPHABET
                    FROM
                                PRODUCT_TYPE tb_1
                                        INNER JOIN
                                PRODUCT_SUB tb_2
                                        ON tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
                                        AND tb_2.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                        INNER JOIN
                                PRODUCT_TYPE_ITEM_CATEGORY tb_3
                                            ON tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
                                            AND tb_3.INUSE = 1
                                            INNER JOIN
                                ITEM_CATEGORY tb_4
                                            ON tb_3.ITEM_CATEGORY_ID = tb_4.ITEM_CATEGORY_ID
                    WHERE
                                    tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'
                                AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                                AND tb_4.ITEM_CATEGORY_ID = 1
                                AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT != ''
                    ORDER BY
                                tb_1.PRODUCT_TYPE_NAME ASC
                    LIMIT
                                300
          `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByProductGroup: async (dataItem: any, sqlWhere: any) => {
    let sql = `
                                      SELECT
                                                 tb_4.PRODUCT_CATEGORY_ID
                                                , tb_4.PRODUCT_CATEGORY_NAME
                                                , tb_4.PRODUCT_CATEGORY_ALPHABET
                                                , tb_3.PRODUCT_MAIN_ID
                                                , tb_3.PRODUCT_MAIN_NAME
                                                , tb_3.PRODUCT_MAIN_ALPHABET
                                                , tb_2.PRODUCT_SUB_ID
                                                , tb_2.PRODUCT_SUB_NAME
                                                , tb_2.PRODUCT_SUB_ALPHABET
                                                , tb_1.PRODUCT_TYPE_ID
                                                , tb_1.PRODUCT_TYPE_NAME
                                                , tb_1.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                                                , tb_8.PRODUCT_SPECIFICATION_TYPE_ID
                                                , tb_8.PRODUCT_SPECIFICATION_TYPE_NAME
                                                , tb_8.PRODUCT_SPECIFICATION_TYPE_ALPHABET
                                                , tb_1.INUSE
                                                , tb_13.P2_NEED
                                                , tb_14.MONTH_NO AS P2_START_MONTH_NO
                                                , tb_15.MONTH_NO AS P3_START_MONTH_NO
                                        FROM
                                                PRODUCT_TYPE tb_1
                                                        INNER JOIN
                                                PRODUCT_SUB tb_2
                                                        ON tb_1.PRODUCT_SUB_ID  = tb_2.PRODUCT_SUB_ID and tb_2.INUSE =1
                                                        INNER JOIN
                                                PRODUCT_MAIN tb_3
                                                        ON tb_2.PRODUCT_MAIN_ID  = tb_3.PRODUCT_MAIN_ID and tb_3.INUSE =1
                                                        INNER JOIN
                                                PRODUCT_CATEGORY tb_4
                                                        ON tb_3.PRODUCT_CATEGORY_ID  = tb_4.PRODUCT_CATEGORY_ID and tb_4.INUSE = 1
					                INNER JOIN
                                                PRODUCT_TYPE_PROGRESS_WORKING tb_5
					                ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                                        AND tb_5.INUSE = 1
                                        		INNER JOIN
                                                PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_6
                                                        ON  tb_6.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                        INNER JOIN
                                                PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_7
                                                        ON tb_7.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_6.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                                        INNER JOIN
                                                PRODUCT_SPECIFICATION_TYPE tb_8
                                                        ON tb_8.PRODUCT_SPECIFICATION_TYPE_ID = tb_7.PRODUCT_SPECIFICATION_TYPE_ID
                                                        INNER JOIN
                                                PRODUCT_TYPE_BOM tb_9
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                                        AND tb_9.INUSE = 1
                                                        INNER JOIN
                                                BOM tb_10
                                                        ON tb_10.BOM_ID = tb_9.BOM_ID
                                                        AND tb_10.INUSE = 1
                                                        JOIN
                                                PRODUCT_TYPE_ITEM_CATEGORY tb_11
                                                        ON
                                                        tb_1.PRODUCT_TYPE_ID = tb_11.PRODUCT_TYPE_ID and tb_11.INUSE =1
                                                        JOIN
                                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_12
                                                        ON
                                                        tb_1.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID and tb_12.INUSE =1
                                                        LEFT JOIN
                                                FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO tb_13
                                                        ON
                                                        tb_12.CUSTOMER_INVOICE_TO_ID = tb_13.CUSTOMER_INVOICE_TO_ID
                                                        LEFT JOIN
                                                MONTH tb_14
                                                        ON
                                                        tb_13.P2_START_MONTH_OF_FISCAL_YEAR_ID = tb_14.MONTH_ID
                                                        LEFT JOIN
                                                MONTH tb_15
                                                        ON
                                                        tb_13.P3_START_MONTH_OF_FISCAL_YEAR_ID = tb_15.MONTH_ID
                                        WHERE
                                                    tb_5.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
                                                AND tb_1.INUSE = 1

                                                sqlWhere

                                    `

    sql = sql.replaceAll('sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    return sql
  },
  getProductTypeByProductMainID: async (dataItem: any) => {
    let sql = `
                                          SELECT
                                                    tb_4.PRODUCT_CATEGORY_ID
                                                    , tb_4.PRODUCT_CATEGORY_NAME
                                                    , tb_4.PRODUCT_CATEGORY_ALPHABET
                                                    , tb_3.PRODUCT_MAIN_ID
                                                    , tb_3.PRODUCT_MAIN_NAME
                                                    , tb_3.PRODUCT_MAIN_ALPHABET
                                                    , tb_2.PRODUCT_SUB_ID
                                                    , tb_2.PRODUCT_SUB_NAME
                                                    , tb_2.PRODUCT_SUB_ALPHABET
                                                    , tb_1.PRODUCT_TYPE_ID
                                                    , tb_1.PRODUCT_TYPE_NAME
                                                    , tb_1.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                                                    , tb_1.INUSE
                                            FROM
                                                    PRODUCT_TYPE tb_1
                                                            INNER JOIN
                                                    PRODUCT_SUB tb_2
                                                            ON tb_1.PRODUCT_SUB_ID  = tb_2.PRODUCT_SUB_ID and tb_2.INUSE =1
                                                            INNER JOIN
                                                    PRODUCT_MAIN tb_3
                                                            ON tb_2.PRODUCT_MAIN_ID  = tb_3.PRODUCT_MAIN_ID and tb_3.INUSE =1
                                                            INNER JOIN
                                                    PRODUCT_CATEGORY tb_4
                                                            ON tb_3.PRODUCT_CATEGORY_ID  = tb_4.PRODUCT_CATEGORY_ID and tb_4.INUSE = 1
                                                            INNER JOIN
                                                    PRODUCT_TYPE_PROGRESS_WORKING tb_5
                                                            ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                                            AND tb_5.INUSE = 1

                                            WHERE
                                                        tb_3.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                                    AND tb_5.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
                                                    AND tb_1.INUSE = 1


                                         `

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    return sql
  },
  searchProductType: async (dataItem: any) => {
    let sqlList = []

    let sql = `    SELECT COUNT(*) AS TOTAL_COUNT
           FROM  (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT;
                                    `

    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = `
                                SELECT
                                      tb_4.PRODUCT_CATEGORY_ID
                                    , tb_4.PRODUCT_CATEGORY_NAME
                                    , tb_3.PRODUCT_MAIN_ID
                                    , tb_3.PRODUCT_MAIN_NAME
                                    , tb_2.PRODUCT_SUB_ID
                                    , tb_2.PRODUCT_SUB_NAME
                                    , tb_1.PRODUCT_TYPE_ID
                                    , tb_1.PRODUCT_TYPE_CODE
                                    , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                                    , tb_1.PRODUCT_TYPE_NAME
                                    , tb_5.ITEM_CATEGORY_ID
                                    , tb_6.ITEM_CATEGORY_NAME
                                    , tb_1.UPDATE_BY
                                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                    , dataItem.selectInuseForSearch
                                    , tb_11.BOM_ID
                                    , tb_11.BOM_CODE
                                    , tb_11.BOM_NAME
                                    , tb_13.FLOW_CODE
                                    , tb_13.FLOW_ID
                                    , tb_12.ACCOUNT_DEPARTMENT_CODE_ID
                                    , tb_12.ACCOUNT_DEPARTMENT_CODE
                                    , tb_12.ACCOUNT_DEPARTMENT_NAME
                                    , tb_14.CUSTOMER_INVOICE_TO_ID
                                    , tb_14.CUSTOMER_INVOICE_TO_ALPHABET
                                    , tb_14.CUSTOMER_INVOICE_TO_NAME
                                    , tb_17.PRODUCT_SPECIFICATION_TYPE_NAME
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
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])

    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)

    return sqlList
  },

  searchProductTypeAllPage: async (dataItem: any) => {
    let sqlList = []

    let sql = `    SELECT COUNT(*) AS TOTAL_COUNT
           FROM  (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT;
                                    `

    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = `
                                SELECT
                                      tb_4.PRODUCT_CATEGORY_ID
                                    , tb_4.PRODUCT_CATEGORY_NAME
                                    , tb_3.PRODUCT_MAIN_ID
                                    , tb_3.PRODUCT_MAIN_NAME
                                    , tb_2.PRODUCT_SUB_ID
                                    , tb_2.PRODUCT_SUB_NAME
                                    , tb_1.PRODUCT_TYPE_ID
                                    , tb_1.PRODUCT_TYPE_CODE
                                    , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                                    , tb_1.PRODUCT_TYPE_NAME
                                    , tb_5.ITEM_CATEGORY_ID
                                    , tb_6.ITEM_CATEGORY_NAME
                                    , tb_1.UPDATE_BY
                                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                    , dataItem.selectInuseForSearch
                                    , tb_11.BOM_ID
                                    , tb_11.BOM_CODE
                                    , tb_11.BOM_NAME
                                    , tb_13.FLOW_CODE
                                    , tb_13.FLOW_ID
                                    , tb_12.ACCOUNT_DEPARTMENT_CODE_ID
                                    , tb_12.ACCOUNT_DEPARTMENT_CODE
                                    , tb_12.ACCOUNT_DEPARTMENT_NAME
                                    , tb_14.CUSTOMER_INVOICE_TO_ID
                                    , tb_14.CUSTOMER_INVOICE_TO_ALPHABET
                                    , tb_14.CUSTOMER_INVOICE_TO_NAME
                                    , tb_17.PRODUCT_SPECIFICATION_TYPE_NAME
                                FROM
                                    dataItem.sqlJoin
                                    dataItem.sqlWhere
                                    dataItem.sqlHaving

                                    ORDER BY
                                        dataItem.Order

                                    `

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    // console.log(sql)
    sqlList.push(sql)

    return sqlList
  },
  searchProductTypeBySelected: async (dataItem: any) => {
    let sqlList = []

    let sql = `    SELECT COUNT(*) AS TOTAL_COUNT
           FROM  (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT;
                                    `

    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = `
                                SELECT
                                      tb_4.PRODUCT_CATEGORY_ID
                                    , tb_4.PRODUCT_CATEGORY_NAME
                                    , tb_3.PRODUCT_MAIN_ID
                                    , tb_3.PRODUCT_MAIN_NAME
                                    , tb_2.PRODUCT_SUB_ID
                                    , tb_2.PRODUCT_SUB_NAME
                                    , tb_1.PRODUCT_TYPE_ID
                                    , tb_1.PRODUCT_TYPE_CODE
                                    , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                                    , tb_1.PRODUCT_TYPE_NAME
                                    , tb_5.ITEM_CATEGORY_ID
                                    , tb_6.ITEM_CATEGORY_NAME
                                    , tb_1.UPDATE_BY
                                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                    , dataItem.selectInuseForSearch
                                    , tb_11.BOM_ID
                                    , tb_11.BOM_CODE
                                    , tb_11.BOM_NAME
                                    , tb_13.FLOW_CODE
                                    , tb_13.FLOW_ID
                                    , tb_12.ACCOUNT_DEPARTMENT_CODE_ID
                                    , tb_12.ACCOUNT_DEPARTMENT_CODE
                                    , tb_12.ACCOUNT_DEPARTMENT_NAME
                                    , tb_14.CUSTOMER_INVOICE_TO_ID
                                    , tb_14.CUSTOMER_INVOICE_TO_ALPHABET
                                    , tb_14.CUSTOMER_INVOICE_TO_NAME
                                    , tb_17.PRODUCT_SPECIFICATION_TYPE_NAME
                                FROM
                                    dataItem.sqlJoin
                                    dataItem.sqlWhere
                                    dataItem.sqlHaving

                                    ORDER BY
                                        dataItem.Order

                                    `

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    //     console.log(sql)
    sqlList.push(sql)

    return sqlList
  },
  getByProductTypeCodeForSCT: async (dataItem: any) => {
    let sql = `
                            SELECT
                              tb_1.PRODUCT_TYPE_ID
                            , tb_1.PRODUCT_TYPE_NAME
                            , tb_1.PRODUCT_TYPE_CODE
                            , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                        FROM
                            PRODUCT_TYPE tb_1

                        WHERE

                             tb_1.PRODUCT_TYPE_CODE_FOR_SCT = 'dataItem.PRODUCT_TYPE_CODE_FOR_SCT'
                             AND tb_1.INUSE = 1


                          `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log('getByLikeProductTypeNameAndProductCategoryIdAndInuse', sql)
    return sql
  },
  getByProductTypeName: async (dataItem: any) => {
    let sql = `
                                SELECT
                                  tb_1.PRODUCT_TYPE_ID
                                , tb_1.PRODUCT_TYPE_NAME
                                , tb_1.PRODUCT_TYPE_CODE
                                , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                            FROM
                                PRODUCT_TYPE tb_1

                            WHERE

                                 tb_1.PRODUCT_TYPE_NAME = 'dataItem.PRODUCT_TYPE_NAME'
                                 AND tb_1.INUSE = 1


                              `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //     console.log('getByLikeProductTypeNameAndProductCategoryIdAndInuse', sql)
    return sql
  },
  updateProductTypeNew: async (dataItem: any) => {
    let sql = `     UPDATE
                                        PRODUCT_TYPE
                                SET
                                  UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()

                                WHERE
                                PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
`

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteProductTypeAndItem: async (dataItem: any) => {
    let sql = `         UPDATE
                                PRODUCT_TYPE tb_1


                        SET tb_1.INUSE = 0 ,

                                tb_1.UPDATE_BY = 'dataItem.UPDATE_BY' ,
                                tb_1.UPDATE_DATE = CURRENT_TIMESTAMP()

                        WHERE
                                tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
  `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
}
