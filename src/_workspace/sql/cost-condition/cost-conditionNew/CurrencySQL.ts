export const CurrencySQL = {
  getByInuse: async (dataItem: any) => {
    let sql = `     SELECT
                              tb_1.CURRENCY_ID
                            , tb_1.CURRENCY_SYMBOL
                            , tb_1.CURRENCY_NAME
                            , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                    FROM
                            CURRENCY tb_1
                    WHERE
                            tb_1.INUSE = dataItem.INUSE
                        AND tb_1.CURRENCY_SYMBOL LIKE '%dataItem.CURRENCY_SYMBOL%'
                    `

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.CURRENCY_SYMBOL', dataItem['CURRENCY_SYMBOL'])

    return sql
  },
}
