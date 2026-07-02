export const OtherCostConditionSQL = {
  search: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        OTHER_COST_CONDITION tb_1
                    JOIN
                        PRODUCT_MAIN tb_2
                    ON
                        tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
                    WHERE
                            tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'
                        AND tb_1.INUSE = '1'
                        sqlWhere
                        sqlWhereColumnFilter `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('sqlWhere', sqlWhere)

    sqlList.push(sql)

    sql = `
                SELECT
                      tb_1.OTHER_COST_CONDITION_ID
                    , tb_1.GA
                    , tb_1.MARGIN
                    , tb_1.SELLING_EXPENSE
                    , tb_1.VAT
                    , tb_1.CIT
                    , tb_1.FISCAL_YEAR
                    , tb_1.VERSION
                    , tb_2.PRODUCT_MAIN_ID
                    , tb_2.PRODUCT_MAIN_NAME
                    , tb_1.UPDATE_BY
                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                FROM
                    OTHER_COST_CONDITION tb_1
                JOIN
                    PRODUCT_MAIN tb_2
                ON
                    tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
                WHERE
                        tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'
                    AND tb_1.INUSE = '1'
                    sqlWhere
                    sqlWhereColumnFilter
                ORDER BY
                    dataItem.Order
                LIMIT
                      dataItem.Start
                    , dataItem.Limit
            `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('sqlWhere', sqlWhere)

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  create: async (dataItem: any) => {
    let sql = `     INSERT INTO
                        OTHER_COST_CONDITION
                    (
                          OTHER_COST_CONDITION_ID
                        , PRODUCT_MAIN_ID
                        , GA
                        , MARGIN
                        , SELLING_EXPENSE
                        , VAT
                        , CIT
                        , FISCAL_YEAR
                        , VERSION
                        , DESCRIPTION
                        , CREATE_BY
                        , UPDATE_BY
                        , CREATE_DATE
                        , UPDATE_DATE
                        , INUSE
                    )

                    SELECT
                          'dataItem.UUID_V7'
                        , dataItem.PRODUCT_MAIN_ID
                        , dataItem.GA
                        , dataItem.MARGIN
                        , dataItem.SELLING_EXPENSE
                        , dataItem.VAT
                        , dataItem.CIT
                        , 'dataItem.FISCAL_YEAR'
                        , @version
                        , ''
                        , 'dataItem.CREATE_BY'
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , CURRENT_TIMESTAMP()
                        , 1

                      ;
                    `

    sql = sql.replaceAll('dataItem.UUID_V7', dataItem['UUID_V7'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.GA', dataItem['GA'])
    sql = sql.replaceAll('dataItem.MARGIN', dataItem['MARGIN'])
    sql = sql.replaceAll('dataItem.SELLING_EXPENSE', dataItem['SELLING_EXPENSE'])
    sql = sql.replaceAll('dataItem.VAT', dataItem['VAT'])
    sql = sql.replaceAll('dataItem.CIT', dataItem['CIT'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  createVersion: async (dataItem: any) => {
    let sql = `
        SET @version =  (
                            SELECT
                                IFNULL(MAX(VERSION), 0) + 1
                            FROM
                                OTHER_COST_CONDITION
                            WHERE
                                    FISCAL_YEAR = dataItem.FISCAL_YEAR
                                AND PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID
                        )
`

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest: async (dataItem: { FISCAL_YEAR: number; PRODUCT_MAIN_ID: number }) => {
    let sql = `

                        SELECT
                                  tb_1.OTHER_COST_CONDITION_ID
                                , tb_1.PRODUCT_MAIN_ID
                                , tb_1.FISCAL_YEAR
                                , tb_1.GA
                                , tb_1.MARGIN
                                , tb_1.SELLING_EXPENSE
                                , tb_1.VAT
                                , tb_1.CIT
                                , tb_1.VERSION
                        FROM
                                OTHER_COST_CONDITION tb_1
                        WHERE
                                    tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND tb_1.VERSION = (
                                        SELECT
                                                MAX(VERSION)
                                        FROM
                                                OTHER_COST_CONDITION
                                        WHERE
                                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                                AND INUSE = 1
                                )
                                AND tb_1.INUSE = 1
                                AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'`

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'].toString())

    return sql
  },
  getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo: async (dataItem: { FISCAL_YEAR: number; PRODUCT_MAIN_ID: number; VERSION: number }) => {
    let sql = `        SELECT
                                  tb_1.OTHER_COST_CONDITION_ID
                                , tb_1.PRODUCT_MAIN_ID
                                , tb_1.FISCAL_YEAR
                                , tb_1.GA
                                , tb_1.MARGIN
                                , tb_1.SELLING_EXPENSE
                                , tb_1.VAT
                                , tb_1.CIT
                                , tb_1.VERSION
                        FROM
                                OTHER_COST_CONDITION tb_1
                        WHERE
                                  tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                              AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                              AND tb_1.VERSION = 'dataItem.VERSION'
                              AND tb_1.INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'].toString())
    sql = sql.replaceAll('dataItem.VERSION', dataItem['VERSION'].toString())

    return sql
  },
}
