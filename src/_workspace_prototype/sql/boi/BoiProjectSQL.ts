export const BoiProjectSQL = {
  // search: async dataItem => {
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
  //console.log('search', sql)
  //   return sqls
  // },
  getBoiProjectByBoiProjectForCheck: async (dataItem: any) => {
    let sql = `     SELECT
                          BOI_PROJECT_ID
                        , BOI_PROJECT_NAME
                      FROM
                        BOI_PROJECT
                      WHERE
                        BOI_PROJECT_NAME = 'dataItem.BOI_PROJECT_NAME'
                        AND INUSE = 1
`
    sql = sql.replaceAll('dataItem.BOI_PROJECT_NAME', dataItem['BOI_PROJECT_NAME'])
    //console.log('SearchBOIBefore' + sql)
    return sql
  },

  getBoiProjectCode: async (dataItem: any) => {
    let sql = `     SELECT
                          BOI_PROJECT_ID
                        , BOI_PROJECT_CODE
                      FROM
                        BOI_PROJECT
                      WHERE
                        BOI_PROJECT_CODE = 'dataItem.BOI_PROJECT_CODE'
                        AND INUSE = 1
`
    sql = sql.replaceAll('dataItem.BOI_PROJECT_CODE', dataItem['BOI_PROJECT_CODE'])
    return sql
  },

  getBoiProjectGroupName: async (dataItem: any) => {
    let sql = `     SELECT
                          BOI_PROJECT_ID
                        , BOI_PRODUCT_GROUP_NAME
                      FROM
                        BOI_PROJECT
                      WHERE
                        BOI_PRODUCT_GROUP_NAME = 'dataItem.BOI_PRODUCT_GROUP_NAME'
                        AND INUSE = 1
`
    sql = sql.replaceAll('dataItem.BOI_PRODUCT_GROUP_NAME', dataItem['BOI_PRODUCT_GROUP_NAME'])
    //console.log('SearchBOIBefore' + sql)
    return sql
  },

  getBoiProjectGroupNameByLike: async (dataItem: any) => {
    let sql = `     SELECT
                          BOI_PROJECT_ID
                        , BOI_PRODUCT_GROUP_NAME
                      FROM
                        BOI_PROJECT
                      WHERE
                        BOI_PRODUCT_GROUP_NAME Like '%dataItem.BOI_PRODUCT_GROUP_NAME%'

`
    sql = sql.replaceAll('dataItem.BOI_PRODUCT_GROUP_NAME', dataItem['BOI_PRODUCT_GROUP_NAME'])
    //console.log('SearchBOIBefore' + sql)
    return sql
  },

  getByLikeBoiProductGroupAndInuse: async (dataItem: any) => {
    let sql = `
                          SELECT
                                    BOI_PROJECT_ID
                                  , BOI_PROJECT_NAME
                                  , BOI_PROJECT_CODE
                                  , BOI_PRODUCT_GROUP_NAME

                          FROM
                                    BOI_PROJECT
                          WHERE
                                    BOI_PRODUCT_GROUP_NAME LIKE '%dataItem.BOI_PRODUCT_GROUP_NAME%'


                          GROUP BY  BOI_PROJECT_NAME

                          `

    sql = sql.replaceAll('dataItem.BOI_PRODUCT_GROUP_NAME', dataItem['BOI_PRODUCT_GROUP_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeBoiProjectCodeAndInuse: async (dataItem: any) => {
    let sql = `
                          SELECT
                                    BOI_PROJECT_ID
                                  , BOI_PROJECT_NAME
                                  , BOI_PROJECT_CODE
                                  , BOI_PRODUCT_GROUP_NAME

                          FROM
                                    BOI_PROJECT
                          WHERE
                                    BOI_PROJECT_CODE LIKE '%dataItem.BOI_PROJECT_CODE%'

                          GROUP BY  BOI_PROJECT_CODE

                          `

    sql = sql.replaceAll('dataItem.BOI_PROJECT_CODE', dataItem['BOI_PROJECT_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('hhhh', sql)

    return sql
  },
  getByLikeBoiProjectNameAndInuse: async (dataItem: any) => {
    let sql = `
                          SELECT
                                    BOI_PROJECT_ID
                                  , BOI_PROJECT_NAME
                                  , BOI_PROJECT_CODE
                                  , BOI_PRODUCT_GROUP_NAME

                          FROM
                                    BOI_PROJECT
                          WHERE
                                    BOI_PROJECT_NAME LIKE '%dataItem.BOI_PROJECT_NAME%'

                          GROUP BY  BOI_PROJECT_NAME

                          `

    sql = sql.replaceAll('dataItem.BOI_PROJECT_NAME', dataItem['BOI_PROJECT_NAME'])
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
    let sql = `
                      UPDATE
                            BOI_PROJECT
                      SET
                            INUSE = '0'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                      WHERE
                            BOI_PROJECT_ID = 'dataItem.BOI_PROJECT_ID'
                        `

    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  update: async (dataItem: any) => {
    let sql = `
    UPDATE  BOI_PROJECT

    SET
            BOI_PROJECT_NAME = 'dataItem.BOI_PROJECT_NAME'
          , BOI_PROJECT_CODE = 'dataItem.BOI_PROJECT_CODE'
          , BOI_PRODUCT_GROUP_NAME = 'dataItem.BOI_PRODUCT_GROUP_NAME'
          , DESCRIPTION = 'dataItem.DESCRIPTION'
          , UPDATE_BY = 'dataItem.UPDATE_BY'
          , UPDATE_DATE = CURRENT_TIMESTAMP()
          , INUSE = 'dataItem.INUSE'
    WHERE
         BOI_PROJECT_ID = 'dataItem.BOI_PROJECT_ID'
            `

    sql = sql.replaceAll('dataItem.BOI_PROJECT_NAME', dataItem['BOI_PROJECT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_CODE', dataItem['BOI_PROJECT_CODE'])
    sql = sql.replaceAll('dataItem.BOI_PRODUCT_GROUP_NAME', dataItem['BOI_PRODUCT_GROUP_NAME'])
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  create: async (dataItem: any) => {
    let sql = `
    INSERT INTO BOI_PROJECT
            (
                BOI_PROJECT_ID
              , BOI_PROJECT_NAME
              , BOI_PROJECT_CODE
              , BOI_PRODUCT_GROUP_NAME
              , DESCRIPTION
              , CREATE_BY
              , UPDATE_BY
              , CREATE_DATE
              , UPDATE_DATE
            )
    VALUES
            (
              (SELECT IFNULL( MAX(BOI_PROJECT_ID), 0) + 1 AS MAX_VAL FROM BOI_PROJECT MAX_ID)
              , 'dataItem.BOI_PROJECT_NAME'
              , 'dataItem.BOI_PROJECT_CODE'
              , 'dataItem.BOI_PRODUCT_GROUP_NAME'
              , 'dataItem.DESCRIPTION'
              , 'dataItem.CREATE_BY'
              , 'dataItem.CREATE_BY'
              , CURRENT_TIMESTAMP()
              , CURRENT_TIMESTAMP()
            )
    `

    sql = sql.replaceAll('dataItem.BOI_PROJECT_NAME', dataItem['BOI_PROJECT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_CODE', dataItem['BOI_PROJECT_CODE'])
    sql = sql.replaceAll('dataItem.BOI_PRODUCT_GROUP_NAME', dataItem['BOI_PRODUCT_GROUP_NAME'])
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },

  search: async (dataItem: any) => {
    let sqlList = []

    let sql = `
                        SELECT
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
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_NAME', dataItem['BOI_PROJECT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_CODE', dataItem['BOI_PROJECT_CODE'])
    sql = sql.replaceAll('dataItem.BOI_PRODUCT_GROUP_NAME', dataItem['BOI_PRODUCT_GROUP_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)

    sql = `  SELECT
                                      tb_1.BOI_PROJECT_ID
                                    , tb_1.BOI_PROJECT_NAME
                                    , tb_1.BOI_PROJECT_CODE
                                    , tb_1.BOI_PRODUCT_GROUP_NAME
                                    , tb_1.DESCRIPTION
                                    , tb_1.CREATE_BY
                                    , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s') AS CREATE_DATE
                                    , tb_1.UPDATE_BY AS UPDATE_BY
                                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                    , tb_1.INUSE as inuseForSearch
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
    sql = sql.replaceAll('dataItem.BOI_PROJECT_NAME', dataItem['BOI_PROJECT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_CODE', dataItem['BOI_PROJECT_CODE'])
    sql = sql.replaceAll('dataItem.BOI_PRODUCT_GROUP_NAME', dataItem['BOI_PRODUCT_GROUP_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)

    // sqlList = sqlList.join(";");
    // console.log(sql)

    return sqlList
  },
}
