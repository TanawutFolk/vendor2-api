export const EnvironmentCertificateSQL = {
  // search: async (dataItem:any) => {
  //   let sql = `     SELECT
  //                                 PRODUCT_CATEGORY_ID
  //                               , PRODUCT_CATEGORY_NAME
  //                               , PRODUCT_CATEGORY_CODE
  //                               , PRODUCT_CATEGORY_ALPHABET
  //                               , INUSE
  //                        FROM
  //                               PRODUCT_CATEGORY; `

  //   sql += `     SELECT
  //                               PRODUCT_CATEGORY_ID
  //                             , PRODUCT_CATEGORY_NAME
  //                             , PRODUCT_CATEGORY_CODE
  //                             , PRODUCT_CATEGORY_ALPHABET
  //                             , INUSE
  //                      FROM
  //                             PRODUCT_CATEGORY; `

  //   sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem.PRODUCT_CATEGORY_ID)
  //   //console.log('search', sql)
  //   return sqls
  // },

  getByLikeEnvironmentCertificateNameAndInuse: async (dataItem: any) => {
    let sql = `
                          SELECT
                                    ENVIRONMENT_CERTIFICATE_ID
                                  , ENVIRONMENT_CERTIFICATE_NAME
                          FROM
                                    ENVIRONMENT_CERTIFICATE
                          WHERE
                                    ENVIRONMENT_CERTIFICATE_NAME LIKE '%dataItem.ENVIRONMENT_CERTIFICATE_NAME%'

                          GROUP BY  ENVIRONMENT_CERTIFICATE_NAME

                          `

    sql = sql.replaceAll('dataItem.ENVIRONMENT_CERTIFICATE_NAME', dataItem['ENVIRONMENT_CERTIFICATE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem: any) => {
    let sql = `      SELECT
                            tb_1.PRODUCT_MAIN_ID
                          , tb_1.PRODUCT_MAIN_NAME
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

    let sql = `   SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        PRODUCT_MAIN tb_1
                    WHERE
                            tb_1.PRODUCT_MAIN_NAME LIKE '%dataItem.PRODUCT_MAIN_NAME%'
                      AND tb_1.PRODUCT_MAIN_CODE LIKE '%dataItem.PRODUCT_MAIN_CODE%'
                      AND tb_1.PRODUCT_MAIN_ALPHABET LIKE '%dataItem.PRODUCT_MAIN_ALPHABET%'
                      AND tb_1.INUSE LIKE '%dataItem.INUSE%' `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_CODE', dataItem['PRODUCT_MAIN_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = `  SELECT
                    tb_2.PRODUCT_CATEGORY_ID AS PRODUCT_CATEGORY_ID
                  , tb_2.PRODUCT_CATEGORY_CODE AS PRODUCT_CATEGORY_CODE
                  , tb_2.PRODUCT_CATEGORY_NAME AS PRODUCT_CATEGORY_NAME
                  , tb_1.PRODUCT_MAIN_ID AS PRODUCT_MAIN_ID
                  , tb_1.PRODUCT_MAIN_CODE AS PRODUCT_MAIN_CODE
                  , tb_1.PRODUCT_MAIN_NAME AS PRODUCT_MAIN_NAME
                  , tb_1.PRODUCT_MAIN_ALPHABET AS PRODUCT_MAIN_ALPHABET
                  , tb_1.UPDATE_BY AS UPDATE_BY
                  , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS MODIFIED_DATE
                  , tb_1.INUSE AS INUSE
                FROM
                  PRODUCT_MAIN tb_1
                INNER JOIN
                  PRODUCT_CATEGORY tb_2 on tb_1.PRODUCT_CATEGORY_ID = tb_2.PRODUCT_CATEGORY_ID
                WHERE
                      tb_1.PRODUCT_MAIN_NAME LIKE '%dataItem.PRODUCT_MAIN_NAME%'
                AND tb_1.PRODUCT_MAIN_ALPHABET LIKE '%dataItem.PRODUCT_MAIN_ALPHABET%'
                AND tb_1.PRODUCT_MAIN_CODE LIKE '%dataItem.PRODUCT_MAIN_CODE%'
                AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                AND tb_2.PRODUCT_CATEGORY_ID LIKE '%dataItem.PRODUCT_CATEGORY_ID%'
                AND tb_2.PRODUCT_CATEGORY_NAME LIKE '%dataItem.PRODUCT_CATEGORY_NAME%'
                ORDER BY dataItem.Order
                LIMIT dataItem.Start, dataItem.Limit ;  `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_CODE', dataItem['PRODUCT_MAIN_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_NAME', dataItem['PRODUCT_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    //console.log('SearchMain', sql)
    sqlList.push(sql)

    return sqlList
  },
  getAllByLikeInuse: async (dataItem: any) => {
    let sql = `
                          SELECT
                                    ENVIRONMENT_CERTIFICATE_ID
                                  , ENVIRONMENT_CERTIFICATE_NAME
                          FROM
                                    ENVIRONMENT_CERTIFICATE
                          WHERE
                                    INUSE LIKE '%dataItem.INUSE%'
              `

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
