export const ProductCategorySQL = {
  getByProductCategoryAlphabet_condition: async (dataItem: any) => {
    let sql = `
                                  SELECT
                                                    PRODUCT_CATEGORY_ID
                                                  , PRODUCT_CATEGORY_NAME
                                                  , PRODUCT_CATEGORY_ALPHABET
                                  FROM
                                                 PRODUCT_CATEGORY

                                  WHERE
                                                PRODUCT_CATEGORY_ALPHABET LIKE '%dataItem.PRODUCT_CATEGORY_ALPHABET%'
                  `

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ALPHABET', dataItem['PRODUCT_CATEGORY_ALPHABET'])
    // console.log('getByAccountDepartmentCode_condition', sql)
    return sql
  },

  getByProductCategoryName_condition: async (dataItem: any) => {
    let sql = `
                                  SELECT
                                                    PRODUCT_CATEGORY_ID
                                                  , PRODUCT_CATEGORY_NAME
                                                  , PRODUCT_CATEGORY_ALPHABET
                                  FROM
                                                 PRODUCT_CATEGORY

                                  WHERE
                                                PRODUCT_CATEGORY_NAME = 'dataItem.PRODUCT_CATEGORY_NAME'
                                                AND INUSE = '1'

                  `

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    // console.log('getByAccountDepartmentName_condition', sql)
    return sql
  },

  getProductCategoryName: async (dataItem: any) => {
    let sql = `         SELECT
                                    PRODUCT_CATEGORY_ID
                                  , PRODUCT_CATEGORY_NAME
                                  , PRODUCT_CATEGORY_ALPHABET
                           FROM
                                  PRODUCT_CATEGORY
                          WHERE
                                PRODUCT_CATEGORY_NAME = 'dataItem.PRODUCT_CATEGORY_NAME'
                                  `
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    //console.log('searchForCheck', sql)
    return sql
  },
  getProductCategoryNameAndAlphabet: async (dataItem: any) => {
    let sql = `         SELECT
                                    PRODUCT_CATEGORY_ID
                                  , PRODUCT_CATEGORY_NAME
                                  , PRODUCT_CATEGORY_ALPHABET
                           FROM
                                  PRODUCT_CATEGORY
                          WHERE
                                PRODUCT_CATEGORY_NAME = 'dataItem.PRODUCT_CATEGORY_NAME'
                                AND INUSE = '1'
                                  `
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    //console.log('searchForCheck', sql)
    return sql
  },

  getProductCategoryNameAndAlphabetByAlphabet: async (dataItem: any) => {
    let sql = `         SELECT
                                    PRODUCT_CATEGORY_ID
                                  , PRODUCT_CATEGORY_NAME
                                  , PRODUCT_CATEGORY_ALPHABET
                           FROM
                                  PRODUCT_CATEGORY
                          WHERE
                                PRODUCT_CATEGORY_ALPHABET = 'dataItem.PRODUCT_CATEGORY_ALPHABET'
                                AND INUSE = '1'
                                  `
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ALPHABET', dataItem['PRODUCT_CATEGORY_ALPHABET'])
    // console.log('searchForCheck', sql)
    return sql
  },

  getByLikeProductCategoryNameAndInuse: async (dataItem: any) => {
    let sql = `   SELECT
                            PRODUCT_CATEGORY_ID
                          , PRODUCT_CATEGORY_NAME
                          , PRODUCT_CATEGORY_ALPHABET
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

    return sql
  },
  delete: async (dataItem: any) => {
    let sql = ` UPDATE
                        PRODUCT_CATEGORY
                    SET
                          INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'
                    `

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])

    return sql
  },

  update: async (dataItem: any) => {
    let sql = `   UPDATE     PRODUCT_CATEGORY
      SET        PRODUCT_CATEGORY_NAME = 'dataItem.PRODUCT_CATEGORY_NAME'
                , PRODUCT_CATEGORY_ALPHABET = 'dataItem.PRODUCT_CATEGORY_ALPHABET'
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

  create: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_CATEGORY
                      (
                          PRODUCT_CATEGORY_ID
                        , PRODUCT_CATEGORY_NAME
                        , PRODUCT_CATEGORY_CODE
                        , PRODUCT_CATEGORY_ALPHABET
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              1 + coalesce((SELECT max(PRODUCT_CATEGORY_ID) FROM PRODUCT_CATEGORY), 0)
                            , 'dataItem.PRODUCT_CATEGORY_NAME'
                            ,  CONCAT('PD-C-', LPAD((COUNT(*) + 1), 4, 0))
                            , 'dataItem.PRODUCT_CATEGORY_ALPHABET'
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                        FROM
                            PRODUCT_CATEGORY
                      `

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ALPHABET', dataItem['PRODUCT_CATEGORY_ALPHABET'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    //console.log('ProCre' + sql)
    return sql
  },

  search: async (dataItem: any) => {
    let sqlList = []

    let sql = ` SELECT COUNT(*) AS TOTAL_COUNT
           FROM  (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT;
                 `
    // sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_CODE', dataItem['PRODUCT_CATEGORY_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ALPHABET', dataItem['PRODUCT_CATEGORY_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = ` SELECT    tb_1.PRODUCT_CATEGORY_ID,
                        tb_1.PRODUCT_CATEGORY_CODE,
                        tb_1.PRODUCT_CATEGORY_NAME,
                        tb_1.PRODUCT_CATEGORY_ALPHABET,
                        tb_1.UPDATE_BY,
                        DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE,
                        dataItem.selectInuseForSearch
                  FROM    dataItem.sqlJoin
                          dataItem.sqlWhere
                          dataItem.sqlHaving
                        ORDER BY
                                  dataItem.Order
                      LIMIT
                                    dataItem.Start
                                  , dataItem.Limit
                      `
    // sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    // sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_CODE', dataItem['PRODUCT_CATEGORY_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ALPHABET', dataItem['PRODUCT_CATEGORY_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.inuseForSearch', dataItem['inuseForSearch'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)

    return sqlList
  },
}
