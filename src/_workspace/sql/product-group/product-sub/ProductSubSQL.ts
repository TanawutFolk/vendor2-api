export const ProductSubSQL = {
  getByProductSubName_condition: async (dataItem: any) => {
    let sql = `
                                SELECT
                                                  PRODUCT_SUB_ID
                                                , PRODUCT_SUB_NAME
                                                , PRODUCT_SUB_ALPHABET
                                FROM
                                               PRODUCT_SUB

                                WHERE
                                              PRODUCT_SUB_NAME LIKE '%dataItem.PRODUCT_SUB_NAME%'
                                              AND INUSE = '1'

                `

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_NAME', dataItem['PRODUCT_SUB_NAME'])
    // console.log('getByAccountDepartmentName_condition', sql)
    return sql
  },

  getByProductSubNameByProductSubName: async (dataItem: any) => {
    let sql = `
                                SELECT
                                                  PRODUCT_SUB_ID
                                                , PRODUCT_SUB_NAME
                                                , PRODUCT_SUB_ALPHABET
                                FROM
                                               PRODUCT_SUB

                                WHERE
                                              PRODUCT_SUB_NAME = 'dataItem.PRODUCT_SUB_NAME'
                                              AND INUSE = '1'

                `

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_NAME', dataItem['PRODUCT_SUB_NAME'])
    // console.log('getByAccountDepartmentName_condition', sql)
    return sql
  },

  getByProductSubAlphabetByProductSubAlphabet: async (dataItem: any) => {
    let sql = `
                                SELECT
                                                  PRODUCT_SUB_ID
                                                , PRODUCT_SUB_NAME
                                                , PRODUCT_SUB_ALPHABET
                                FROM
                                               PRODUCT_SUB

                                WHERE
                                              PRODUCT_SUB_ALPHABET = 'dataItem.PRODUCT_SUB_ALPHABET'

                `

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ALPHABET', dataItem['PRODUCT_SUB_ALPHABET'])
    // console.log('getByAccountDepartmentName_condition', sql)
    return sql
  },

  getByLikeProductSubNameAndProductMainIdAndInuse: async (dataItem: any) => {
    let sql = `      SELECT
                            tb_1.PRODUCT_SUB_ID
                          , tb_1.PRODUCT_SUB_NAME
                          , tb_1.PRODUCT_SUB_ALPHABET
                        FROM
                          PRODUCT_SUB tb_1
                              INNER JOIN
                          PRODUCT_MAIN tb_2
                              ON tb_1.PRODUCT_MAIN_ID  = tb_2.PRODUCT_MAIN_ID
                        WHERE
                              tb_1.PRODUCT_SUB_NAME LIKE '%dataItem.PRODUCT_SUB_NAME%'
                              AND tb_2.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                              AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                          tb_1.PRODUCT_SUB_NAME ASC
                        LIMIT
                          50
              `

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_NAME', dataItem['PRODUCT_SUB_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] ? dataItem['PRODUCT_MAIN_ID'] : '')
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] ? dataItem['INUSE'] : '')
    // console.log('getByLikeProductSubNameAndProductMainIdAndInuse', sql)
    return sql
  },
  getByLikeProductSubNameAndProductCategoryIdAndInuse: async (dataItem: any) => {
    let sql = `      SELECT
                            tb_1.PRODUCT_SUB_ID
                          , tb_1.PRODUCT_SUB_NAME
                          , tb_1.PRODUCT_SUB_ALPHABET
                        FROM
                          PRODUCT_SUB tb_1
                              INNER JOIN
                          PRODUCT_MAIN tb_2
                              ON tb_1.PRODUCT_MAIN_ID  = tb_2.PRODUCT_MAIN_ID
                              INNER JOIN
                          PRODUCT_CATEGORY tb_3
                              ON tb_2.PRODUCT_CATEGORY_ID  = tb_3.PRODUCT_CATEGORY_ID
                        WHERE
                              tb_1.PRODUCT_SUB_NAME LIKE '%dataItem.PRODUCT_SUB_NAME%'
                              AND tb_3.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'
                              AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                          tb_1.PRODUCT_SUB_NAME ASC
                        LIMIT
                          50
              `

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_NAME', dataItem['PRODUCT_SUB_NAME'] ? dataItem['PRODUCT_SUB_NAME'] : '')
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'] ? dataItem['PRODUCT_CATEGORY_ID'] : '')
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] ? dataItem['INUSE'] : '')

    return sql
  },
  getByLikeProductSubNameAndInuse: async (dataItem: any) => {
    let sql = `   SELECT
                          PRODUCT_SUB_ID
                        , PRODUCT_SUB_NAME
                        , PRODUCT_SUB_ALPHABET
                    FROM
                          PRODUCT_SUB
                    WHERE
                          PRODUCT_SUB_NAME LIKE '%dataItem.PRODUCT_SUB_NAME%'
                      AND INUSE LIKE '%dataItem.INUSE%'
                    ORDER BY
                      PRODUCT_SUB_NAME ASC
                    LIMIT
                      50
                    `

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_NAME', dataItem['PRODUCT_SUB_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('getBy', sql)

    return sql
  },

  delete: async (dataItem: any) => {
    let sql = `   UPDATE
                          PRODUCT_SUB
                      SET
                          INUSE = '0'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                      WHERE
                          PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'
                      `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    return sql
  },

  update: async (dataItem: any) => {
    let sql = `    UPDATE
                        PRODUCT_SUB
                    SET
                        PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                        , PRODUCT_SUB_NAME = 'dataItem.PRODUCT_SUB_NAME'
                        , PRODUCT_SUB_ALPHABET = 'dataItem.PRODUCT_SUB_ALPHABET'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'
                `

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_NAME', dataItem['PRODUCT_SUB_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ALPHABET', dataItem['PRODUCT_SUB_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('sqlUpdate', sql)
    return sql
  },

  create: async (dataItem: any) => {
    let sql = `
    INSERT INTO PRODUCT_SUB
    (
          PRODUCT_SUB_ID
        , PRODUCT_MAIN_ID
        , PRODUCT_SUB_NAME
        , PRODUCT_SUB_ALPHABET
        , PRODUCT_SUB_CODE
        , CREATE_BY
        , UPDATE_DATE
        , UPDATE_BY
    )
        SELECT
               1 + coalesce((SELECT max(PRODUCT_SUB_ID) FROM PRODUCT_SUB), 0)
            , 'dataItem.PRODUCT_MAIN_ID'
            , 'dataItem.PRODUCT_SUB_NAME'
            , 'dataItem.PRODUCT_SUB_ALPHABET'
            ,  CONCAT('PD-S-', LPAD((COUNT(*) + 1), 4, 0))
            , 'dataItem.CREATE_BY'
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'
        FROM
            PRODUCT_SUB
   `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_NAME', dataItem['PRODUCT_SUB_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ALPHABET', dataItem['PRODUCT_SUB_ALPHABET'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    //console.log('sqlCreate', sql)

    return sql
  },

  search: async (dataItem: any) => {
    let sqlList = []

    let sql = `    SELECT
                COUNT(*) AS TOTAL_COUNT
            FROM(
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT;
           `
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_NAME', dataItem['PRODUCT_SUB_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ALPHABET', dataItem['PRODUCT_SUB_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_CODE', dataItem['PRODUCT_SUB_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = `
    SELECT   tb_3.PRODUCT_CATEGORY_ID
            , tb_3.PRODUCT_CATEGORY_NAME
            , tb_2.PRODUCT_MAIN_ID
            , tb_2.PRODUCT_MAIN_NAME
            , tb_1.PRODUCT_SUB_ID
            , tb_1.PRODUCT_SUB_CODE
            , tb_1.PRODUCT_SUB_ALPHABET
            , tb_1.PRODUCT_SUB_NAME
            , tb_1.UPDATE_BY
            , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
            , dataItem.selectInuseForSearch
        FROM
              dataItem.sqlJoin
              dataItem.sqlWhere
              dataItem.sqlHaving
        ORDER BY
            dataItem.Order
        LIMIT
            dataItem.Start, dataItem.Limit
      `
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.PRODUCT_SUB_NAME', dataItem['PRODUCT_SUB_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ALPHABET', dataItem['PRODUCT_SUB_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_CODE', dataItem['PRODUCT_SUB_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)

    // sqlList = sqlList.join(';')
    //console.log('SSS', sqlList)

    return sqlList
  },
  getProductSubAlphabet: async (dataItem: any) => {
    let sql = `
                    SELECT
                                tb_2.PRODUCT_SUB_ALPHABET
                                ,tb_2.PRODUCT_SUB_ID
                    FROM
                                PRODUCT_MAIN tb_1
                                    INNER JOIN
                                PRODUCT_SUB tb_2
                                    ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_2.INUSE = 1
                    WHERE
                                tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                AND tb_2.PRODUCT_SUB_ALPHABET = 'dataItem.PRODUCT_SUB_ALPHABET'
                                AND tb_1.INUSE = 1
    `
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ALPHABET', dataItem['PRODUCT_SUB_ALPHABET'])

    return sql
  },
  getAll: async () => {
    let sql = `     SELECT PRODUCT_SUB_ID
                        , PRODUCT_SUB_NAME
                        , PRODUCT_SUB_CODE
                        , PRODUCT_SUB_ALPHABET
                  FROM
                          PRODUCT_SUB  ;
                  `

    return sql
  },
}
