export const ExchangeRateSQL = {
  getLatestExchangeRate: async (dataItem: { FISCAL_YEAR: number }) => {
    let sql = `     SELECT
                          tb_1.CURRENCY_ID
                        , tb_1.CURRENCY_SYMBOL
                        , tb_1.CURRENCY_NAME
                        , tb_2.EXCHANGE_RATE_ID
                        , tb_2.EXCHANGE_RATE_VALUE
                        , tb_2.FISCAL_YEAR
                        , tb_2.VERSION
                    FROM
                        CURRENCY tb_1
                    JOIN
                        EXCHANGE_RATE tb_2
                    ON
                        tb_1.CURRENCY_ID = tb_2.CURRENCY_ID
                    WHERE
                            tb_2.INUSE = 1
                        AND tb_2.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                        AND tb_2.IS_CURRENT = 1
                      ;
                    `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())

    //console.log(sql)

    return sql
  },
  getCurrency: async (dataItem: any) => {
    let sql = `     SELECT
                          tb_1.CURRENCY_ID
                        , tb_1.CURRENCY_SYMBOL
                        , tb_1.CURRENCY_NAME
                        , tb_2.EXCHANGE_RATE_VALUE
                        , tb_2.FISCAL_YEAR
                        , tb_2.VERSION
                        , DATE_FORMAT(tb_2.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                        , tb_2.UPDATE_BY
                    FROM
                        CURRENCY tb_1
                    LEFT JOIN
                        EXCHANGE_RATE tb_2
                    ON
                        (tb_1.CURRENCY_ID = tb_2.CURRENCY_ID)
                    WHERE
                            tb_1.INUSE = 1
                    GROUP BY
                        tb_1.CURRENCY_SYMBOL
                      ;
                    `

    sql = sql.replaceAll('dataItem.CURRENCY_SYMBOL', dataItem['CURRENCY_SYMBOL'])

    return sql
  },
  search: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        EXCHANGE_RATE tb_1
                    JOIN
                        CURRENCY tb_2
                    ON
                        tb_1.CURRENCY_ID = tb_2.CURRENCY_ID
                    WHERE
                            tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'
                        AND tb_1.CURRENCY_ID LIKE '%dataItem.CURRENCY_ID%'
                        AND tb_1.INUSE = '1'
                        sqlWhereColumnFilter `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.CURRENCY_ID', dataItem['CURRENCY_ID'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
                SELECT
                      tb_1.EXCHANGE_RATE_ID
                    , tb_1.CURRENCY_ID
                    , tb_1.EXCHANGE_RATE_VALUE
                    , tb_1.FISCAL_YEAR
                    , tb_1.VERSION
                    , tb_2.CURRENCY_SYMBOL
                    , tb_2.CURRENCY_NAME
                    , tb_1.UPDATE_BY
                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS MODIFIED_DATE
                FROM
                    EXCHANGE_RATE tb_1
                JOIN
                    CURRENCY tb_2
                ON
                    tb_1.CURRENCY_ID = tb_2.CURRENCY_ID
                WHERE
                        tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'
                    AND tb_1.CURRENCY_ID LIKE '%dataItem.CURRENCY_ID%'
                    AND tb_1.INUSE = '1'
                    sqlWhereColumnFilter
                ORDER BY
                    dataItem.Order
                LIMIT
                      dataItem.Start
                    , dataItem.Limit
            `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.CURRENCY_ID', dataItem['CURRENCY_ID'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  create: async (currencyData: any, dataItem: any) => {
    let sql = `     INSERT INTO
                        EXCHANGE_RATE
                    (
                          FISCAL_YEAR
                        , VERSION
                        , CURRENCY_ID
                        , EXCHANGE_RATE_VALUE
                        , DESCRIPTION
                        , CREATE_BY
                        , UPDATE_BY
                        , CREATE_DATE
                        , UPDATE_DATE
                        , INUSE
                        , IS_CURRENT
                    )

                    SELECT
                          dataItem.FISCAL_YEAR
                        , @version
                        , dataItem.CURRENCY_ID
                        , dataItem.CURRENCY_VALUE
                        , ''
                        , 'dataItem.CREATE_BY'
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , CURRENT_TIMESTAMP()
                        , '1'
                        , 1
                      ;

SET @new_exchange_rate_id_for_dataItem.CURRENCY_ID = LAST_INSERT_ID();

                    `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.CURRENCY_ID', currencyData['CURRENCY_ID'])
    sql = sql.replaceAll('dataItem.CURRENCY_VALUE', currencyData['CURRENCY_VALUE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  deleteOldDataByFiscalYear: async (dataItem: any) => {
    let sql = `     UPDATE
                        EXCHANGE_RATE
                    SET
                        INUSE = '0'
                    WHERE
                        FISCAL_YEAR = dataItem.FISCAL_YEAR
                    ;
                    `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  createVersion: async (dataItem: { FISCAL_YEAR: number }) => {
    let sql = `
        SET @version =  (
                            SELECT
                                IFNULL(MAX(VERSION), 0) + 1
                            FROM
                                EXCHANGE_RATE
                            WHERE
                                FISCAL_YEAR = dataItem.FISCAL_YEAR
                        )
`

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())

    return sql
  },
  getCurrencyAll: async () => {
    let sql = `     SELECT
                          tb_1.CURRENCY_ID
                        , tb_1.CURRENCY_SYMBOL
                        , tb_1.CURRENCY_NAME
                    FROM
                        CURRENCY tb_1
                    WHERE
                            tb_1.INUSE = 1
                    GROUP BY
                        tb_1.CURRENCY_SYMBOL
                    `
    return sql
  },
  updateIsCurrentByFiscalYear: async (dataItem: { FISCAL_YEAR: number }) => {
    let sql = `     UPDATE
                        EXCHANGE_RATE
                    SET
                        IS_CURRENT = 0
                    WHERE
                            FISCAL_YEAR = dataItem.FISCAL_YEAR
                        AND IS_CURRENT = 1    `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())

    return sql
  },
}
