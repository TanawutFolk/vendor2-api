export const ExchangeRateSQL = {
  getLatestExchangeRate: async (dataItem: any) => {
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
                      ;
                    `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
}
