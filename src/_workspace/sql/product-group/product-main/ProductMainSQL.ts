export const ProductMainSQL = {
  createByProductMainId_Variable: async (dataItem: any) => {
    let sql = `
                          INSERT INTO PRODUCT_MAIN
                                (
                                    PRODUCT_MAIN_ID
                                  , PRODUCT_CATEGORY_ID
                                  , PRODUCT_MAIN_NAME
                                  , PRODUCT_MAIN_ALPHABET
                                  , PRODUCT_MAIN_CODE
                                  , CREATE_BY
                                  , UPDATE_BY
                                  , UPDATE_DATE
                                  , INUSE
                                )
                                  SELECT
                                        @productMainId
                                      , 'dataItem.PRODUCT_CATEGORY_ID'
                                      , 'dataItem.PRODUCT_MAIN_NAME'
                                      , 'dataItem.PRODUCT_MAIN_ALPHABET'
                                      ,  CONCAT('PD-M-', LPAD((COUNT(*) + 1), 4, 0))
                                      , 'dataItem.CREATE_BY'
                                      , 'dataItem.UPDATE_BY'
                                      ,  CURRENT_TIMESTAMP()
                                      , 'dataItem.INUSE'
                                  FROM
                                      PRODUCT_MAIN;
                      `

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])

    sql = sql.replaceAll('dataItem.LOC', dataItem['LOC'])
    sql = sql.replaceAll('dataItem.POD', dataItem['POD'])
    sql = sql.replaceAll('dataItem.PD', dataItem['PD'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  getByProductMainNameAndProductMainAlphabetAndInuse: async (dataItem: any) => {
    let sql = `
                    SELECT
                              PRODUCT_MAIN_ID
                            , PRODUCT_MAIN_CODE
                            , PRODUCT_MAIN_NAME
                            , PRODUCT_MAIN_ALPHABET
                    FROM
                            PRODUCT_MAIN
                    WHERE
                            (       PRODUCT_MAIN_NAME = 'dataItem.PRODUCT_MAIN_NAME'
                                OR  PRODUCT_MAIN_ALPHABET = 'dataItem.PRODUCT_MAIN_ALPHABET'
                            )
                            AND INUSE = '1' `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])

    return sql
  },

  getByProductMainNameByProductMainAndInuse: async (dataItem: any) => {
    let sql = `
                      SELECT
                                PRODUCT_MAIN_ID
                              , PRODUCT_MAIN_CODE
                              , PRODUCT_MAIN_NAME
                              , PRODUCT_MAIN_ALPHABET
                      FROM
                              PRODUCT_MAIN
                      WHERE
                                    PRODUCT_MAIN_NAME = 'dataItem.PRODUCT_MAIN_NAME'
                              AND INUSE = '1' `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])

    return sql
  },

  getByProductMainAlphabetByProductAlphabetAndInuse: async (dataItem: any) => {
    let sql = `
                      SELECT
                                PRODUCT_MAIN_ID
                              , PRODUCT_MAIN_CODE
                              , PRODUCT_MAIN_NAME
                              , PRODUCT_MAIN_ALPHABET
                      FROM
                              PRODUCT_MAIN
                      WHERE
                                    PRODUCT_MAIN_ALPHABET = 'dataItem.PRODUCT_MAIN_ALPHABET'
                              AND INUSE = '1' `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])

    return sql
  },

  search: async (dataItem: any) => {
    let sql = `   SELECT
                            COUNT(*) AS TOTAL_COUNT
                      FROM
                            (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT;


                    SELECT
                            tb_1.PRODUCT_MAIN_ID
                          , tb_1.PRODUCT_MAIN_CODE
                          , tb_1.PRODUCT_MAIN_NAME
                          , tb_1.PRODUCT_MAIN_ALPHABET

                          , tb_2.PRODUCT_CATEGORY_ID
                          , tb_2.PRODUCT_CATEGORY_NAME


                          , tb_9.POD
                          , tb_9.PD
                          , COALESCE(locs.LOC, JSON_ARRAY()) AS LOC
                          , tb_4.ACCOUNT_DEPARTMENT_CODE_ID
                          , tb_6.ACCOUNT_DEPARTMENT_CODE
                          , tb_6.ACCOUNT_DEPARTMENT_NAME

                          , tb_3.IS_BOI
                          , tb_3.BOI_PROJECT_ID
                          , tb_7.BOI_PROJECT_CODE
                          , tb_7.BOI_PROJECT_NAME

                          , tb_1.UPDATE_BY
                          , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                          , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s') AS CREATE_DATE
                          , tb_1.INUSE

                          ,  (IF (tb_1.INUSE = 0 ,0 ,IF(
                                      EXISTS
                                              (
                                                  SELECT
                                                      tbs_1.PRODUCT_SUB_ID
                                                  FROM
                                                      PRODUCT_SUB tbs_1
                                                  WHERE
                                                          tbs_1.INUSE = 1
                                                      AND tbs_1.PRODUCT_MAIN_ID = tb_1.PRODUCT_MAIN_ID) = TRUE
                                              , 2
                                              ,   IF(
                                                          EXISTS
                                                          (
                                                              SELECT
                                                                        tbs_1.PRODUCT_SUB_ID
                                                              FROM
                                                                        PRODUCT_SUB tbs_1
                                                              WHERE
                                                                        tbs_1.PRODUCT_MAIN_ID = tb_1.PRODUCT_MAIN_ID
                                                          ) = TRUE
                                              , 3
                                              , 1
                                              )))) AS inuseForSearch

                  FROM
                          dataItem.sqlJoin

                            dataItem.sqlWhere

                            dataItem.sqlHaving

                          ORDER BY
                                dataItem.Order

                          LIMIT
                                  dataItem.Start
                                , dataItem.Limit;`
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_CODE', dataItem['PRODUCT_MAIN_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    // console.log('sql', sql)

    return sql
  },

  update: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN

                       SET    PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'
                            , PRODUCT_MAIN_NAME = 'dataItem.PRODUCT_MAIN_NAME'
                            , PRODUCT_MAIN_ALPHABET = 'dataItem.PRODUCT_MAIN_ALPHABET'
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
    `

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  updateProductMainInuse: async (dataItem: any) => {
    let sql = `   UPDATE
                                PRODUCT_MAIN

                         SET    INUSE = 0
                    WHERE
                                PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
      `

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  delete: async (dataItem: any) => {
    let sql = ` UPDATE
                        PRODUCT_MAIN
                    SET
                          INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                    `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },

  generateProductMainId_Variable: async () => {
    let sql = '   SET @productMainId=(1 + coalesce((SELECT max(PRODUCT_MAIN_ID) FROM PRODUCT_MAIN), 0));'
    return sql
  },

  getProductMainByLikeProductMainNameAndInuse: async (dataItem: any) => {
    let sql = `
                  SELECT
                            tb_1.PRODUCT_MAIN_ID
                          , tb_1.PRODUCT_MAIN_NAME
                          , tb_1.PRODUCT_MAIN_ALPHABET
                          , tb_2.PRODUCT_CATEGORY_NAME
                          , tb_2.PRODUCT_CATEGORY_CODE
                          , tb_2.PRODUCT_CATEGORY_ALPHABET
                          , tb_2.PRODUCT_CATEGORY_ID
                  FROM
                          PRODUCT_MAIN tb_1
                                INNER JOIN
                          PRODUCT_CATEGORY tb_2
                                ON tb_1.PRODUCT_CATEGORY_ID = tb_2.PRODUCT_CATEGORY_ID
                  WHERE
                              tb_1.PRODUCT_MAIN_NAME LIKE '%dataItem.PRODUCT_MAIN_NAME%'
                          AND tb_1.INUSE = 'dataItem.INUSE'
                  ORDER BY
                          tb_1.PRODUCT_MAIN_NAME ASC
                  LIMIT
                        50
                `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  getByLikeProductMainNameAndInuse: async (dataItem: any) => {
    let sql = `
                  SELECT
                            tb_1.PRODUCT_MAIN_ID
                          , tb_1.PRODUCT_MAIN_NAME
                          , tb_1.PRODUCT_MAIN_ALPHABET
                          , tb_1.PRODUCT_CATEGORY_ID
                          , tb_2.PRODUCT_CATEGORY_NAME
                          , tb_2.PRODUCT_CATEGORY_CODE
                          , tb_2.PRODUCT_CATEGORY_ALPHABET
                  FROM
                          PRODUCT_MAIN tb_1
                                INNER JOIN
                          PRODUCT_CATEGORY tb_2
                                ON tb_1.PRODUCT_CATEGORY_ID = tb_2.PRODUCT_CATEGORY_ID
                  WHERE
                              tb_1.PRODUCT_MAIN_NAME LIKE '%dataItem.PRODUCT_MAIN_NAME%'
                          AND tb_1.INUSE = 'dataItem.INUSE'
                  ORDER BY
                          tb_1.PRODUCT_MAIN_NAME ASC
                  LIMIT
                        50
                `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log(sql)

    return sql
  },
  getByLikeProductMainNameAndInuse_: async (dataItem: any) => {
    let sql = `
                  SELECT
                            tb_1.PRODUCT_MAIN_ID
                          , tb_1.PRODUCT_MAIN_NAME
                          , tb_1.PRODUCT_MAIN_ALPHABET
                          , tb_1.PRODUCT_CATEGORY_ID
                          , tb_4.PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID
                          , tb_4.ACCOUNT_DEPARTMENT_CODE_ID
                          , tb_6.ACCOUNT_DEPARTMENT_NAME
                          , tb_6.ACCOUNT_DEPARTMENT_CODE
                          , tb_2.PRODUCT_CATEGORY_NAME
                          , tb_2.PRODUCT_CATEGORY_CODE
                          , tb_2.PRODUCT_CATEGORY_ALPHABET
                  FROM
                          PRODUCT_MAIN tb_1
                                INNER JOIN
                          PRODUCT_CATEGORY tb_2
                                ON tb_1.PRODUCT_CATEGORY_ID = tb_2.PRODUCT_CATEGORY_ID
                                INNER JOIN
                          PRODUCT_MAIN_BOI tb_3
                                ON tb_1.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
                                AND tb_3.INUSE = 1
                                INNER JOIN
                          PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_4
                                ON tb_1.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                                AND tb_4.INUSE = 1
                                INNER JOIN
                          ACCOUNT_DEPARTMENT_CODE tb_6
                                ON tb_4.ACCOUNT_DEPARTMENT_CODE_ID = tb_6.ACCOUNT_DEPARTMENT_CODE_ID
                                LEFT JOIN
                          BOI_PROJECT tb_7
                                ON tb_3.BOI_PROJECT_ID = tb_7.BOI_PROJECT_ID
                                INNER JOIN
                          PRODUCT_MAIN_OTHER tb_9
                                ON tb_1.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID
                                AND tb_9.INUSE = 1
                  WHERE
                              tb_1.PRODUCT_MAIN_NAME LIKE '%dataItem.PRODUCT_MAIN_NAME%'
                          AND tb_1.INUSE = 'dataItem.INUSE'
                  ORDER BY
                          tb_1.PRODUCT_MAIN_NAME ASC
                  LIMIT
                        50
                `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem: any) => {
    let sql = `      SELECT
                              tb_1.PRODUCT_MAIN_ID
                            , tb_1.PRODUCT_MAIN_NAME
                            , tb_1.PRODUCT_MAIN_ALPHABET
                          FROM
                            PRODUCT_MAIN tb_1
                                INNER JOIN
                            PRODUCT_CATEGORY tb_2
                                ON (tb_1.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID' ) = tb_2.PRODUCT_CATEGORY_ID
                          WHERE
                                tb_1.PRODUCT_MAIN_NAME LIKE '%dataItem.PRODUCT_MAIN_NAME%'
                            AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                          ORDER BY
                            tb_1.PRODUCT_MAIN_NAME ASC
                          LIMIT
                            50
                `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'] ? dataItem['PRODUCT_CATEGORY_ID'] : '')

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] ? dataItem['INUSE'] : '')

    return sql
  },

  updateUpdateByAndUpdateDate: async (dataItem: any) => {
    let sql = `   UPDATE
                              PRODUCT_MAIN

                       SET
                             UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                              PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
