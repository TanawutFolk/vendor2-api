export const BoiUnitSQL = {
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
  //   //console.log('search', sql)
  //   return sqls
  // },

  getBoiUnitByBoiUnitForCheck: async (dataItem: any) => {
    let sql = `     SELECT
                          BOI_UNIT_ID
                        , BOI_UNIT_NAME
                      FROM
                        BOI_UNIT
                      WHERE
                        BOI_UNIT_NAME = 'dataItem.BOI_UNIT_NAME'
                        AND INUSE = 1
`
    sql = sql.replaceAll('dataItem.BOI_UNIT_NAME', dataItem['BOI_UNIT_NAME'])
    //console.log('SearchBOIUnitBefore' + sql)
    return sql
  },
  getBoiSymbol: async (dataItem: any) => {
    let sql = `     SELECT
                          BOI_UNIT_ID
                        , BOI_UNIT_SYMBOL
                      FROM
                        BOI_UNIT
                      WHERE
                        BOI_UNIT_SYMBOL = 'dataItem.BOI_UNIT_SYMBOL'
                        AND INUSE = 1
`
    sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    //console.log('SearchBOIUnitBefore' + sql)
    return sql
  },

  GetByLikeBoiSymbol: async (dataItem: any) => {
    let sql = `     SELECT
                          BOI_UNIT_ID
                        , BOI_UNIT_SYMBOL
                      FROM
                          BOI_UNIT
                      WHERE
                      BOI_UNIT_SYMBOL LIKE '%dataItem.BOI_UNIT_SYMBOL%'
                      AND  INUSE = '1'
                      ORDER BY
                          BOI_UNIT_SYMBOL
                      LIMIT
                          50
                      `
    sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeBoiUnitNameAndInuse: async (dataItem: any) => {
    let sql = `
                          SELECT
                                    BOI_UNIT_ID
                                  , BOI_UNIT_NAME
                                  , BOI_UNIT_SYMBOL
                          FROM
                                    BOI_UNIT
                          WHERE
                                    BOI_UNIT_NAME LIKE '%dataItem.BOI_UNIT_NAME%'

                          GROUP BY  BOI_UNIT_NAME

                          `

    sql = sql.replaceAll('dataItem.BOI_UNIT_NAME', dataItem['BOI_UNIT_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeBoiSymbolAndInuse: async (dataItem: any) => {
    let sql = `
                          SELECT
                                    BOI_UNIT_ID
                                  , BOI_UNIT_NAME
                                  , BOI_UNIT_SYMBOL
                          FROM
                                    BOI_UNIT
                          WHERE
                                    BOI_UNIT_SYMBOL LIKE '%dataItem.BOI_UNIT_SYMBOL%'

                          GROUP BY  BOI_UNIT_SYMBOL

                          `

    sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('hhhh', sql)

    return sql
  },

  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async dataItem => {
  //   let sql = `      SELECT
  //                           tb_1.PRODUCT_MAIN_ID
  //                         , tb_1.PRODUCT_MAIN_NAME
  //                       FROM
  //                         PRODUCT_MAIN tb_1
  //                             INNER JOIN
  //                         PRODUCT_CATEGORY tb_2
  //                             ON (tb_1.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID' ) = tb_2.PRODUCT_CATEGORY_ID
  //                       WHERE
  //                             tb_1.PRODUCT_MAIN_NAME LIKE '%dataItem.PRODUCT_MAIN_NAME%'
  //                         AND tb_1.INUSE LIKE '%dataItem.INUSE%'
  //                       ORDER BY
  //                         tb_1.PRODUCT_MAIN_NAME ASC
  //                       LIMIT
  //                         50
  //             `

  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
  //   sql = sql.replaceAll(
  //     'dataItem.PRODUCT_CATEGORY_ID',
  //     dataItem['PRODUCT_CATEGORY_ID'] ? dataItem['PRODUCT_CATEGORY_ID'] : ''
  //   )

  //   sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] ? dataItem['INUSE'] : '')

  //   return sql
  // },

  delete: async (dataItem: any) => {
    let sql = `   UPDATE
                        BOI_UNIT
                    SET
                        INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        BOI_UNIT_ID = 'dataItem.BOI_UNIT_ID'
                  `

    sql = sql.replaceAll('dataItem.BOI_UNIT_ID', dataItem['BOI_UNIT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  update: async (dataItem: any) => {
    let sql = `    UPDATE
                          BOI_UNIT
                      SET
                          BOI_UNIT_NAME = 'dataItem.BOI_UNIT_NAME'
                          , BOI_UNIT_SYMBOL = 'dataItem.BOI_UNIT_SYMBOL'
                          , INUSE = 'dataItem.INUSE'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                      WHERE
                          BOI_UNIT_ID = 'dataItem.BOI_UNIT_ID'
                      `

    sql = sql.replaceAll('dataItem.BOI_UNIT_ID', dataItem['BOI_UNIT_ID'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_NAME', dataItem['BOI_UNIT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  create: async (dataItem: any) => {
    let sql = `
    INSERT INTO BOI_UNIT
    (
          BOI_UNIT_ID
        , BOI_UNIT_NAME
        , BOI_UNIT_SYMBOL
        , CREATE_BY
        , UPDATE_BY
    )
    SELECT
              1 + coalesce((SELECT max(BOI_UNIT_ID) FROM BOI_UNIT), 0)
            , 'dataItem.BOI_UNIT_NAME'
            , 'dataItem.BOI_UNIT_SYMBOL'
            , 'dataItem.CREATE_BY'
            , 'dataItem.UPDATE_BY'
      `
    sql = sql.replaceAll('dataItem.BOI_UNIT_NAME', dataItem['BOI_UNIT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log(sql)
    return sql
  },

  search: async (dataItem: any) => {
    let sqlList = []

    let sql = `  SELECT COUNT(*) AS TOTAL_COUNT
                    FROM
                         (
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
    sql = sql.replaceAll('dataItem.BOI_UNIT_NAME', dataItem['BOI_UNIT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = `
            SELECT
              tb_1.BOI_UNIT_ID
            , tb_1.BOI_UNIT_NAME
            , tb_1.BOI_UNIT_SYMBOL
            , tb_1.UPDATE_BY
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
    sql = sql.replaceAll('dataItem.BOI_UNIT_NAME', dataItem['BOI_UNIT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sqlList.push(sql)
    // console.log(sql)

    return sqlList
  },
}
