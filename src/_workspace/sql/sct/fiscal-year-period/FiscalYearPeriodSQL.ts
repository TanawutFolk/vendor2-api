export const FiscalYearPeriodSQL = {
  search: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `
                    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                       (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT
                `

    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.P2_NEED', dataItem['P2_NEED'])
    sql = sql.replaceAll('dataItem.P2_START_MONTH_OF_FISCAL_YEAR_NAME', dataItem['P2_START_MONTH_OF_FISCAL_YEAR_NAME'])
    sql = sql.replaceAll('dataItem.P3_START_MONTH_OF_FISCAL_YEAR_NAME', dataItem['P3_START_MONTH_OF_FISCAL_YEAR_NAME'])
    sql = sql.replaceAll('dataItem.P2_START_MONTH_OF_FISCAL_YEAR_ID', dataItem['P2_START_MONTH_OF_FISCAL_YEAR_ID'])
    sql = sql.replaceAll('dataItem.P3_START_MONTH_OF_FISCAL_YEAR_ID', dataItem['P3_START_MONTH_OF_FISCAL_YEAR_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])

    sqlList.push(sql)

    sql = `
                  SELECT
                      tb_1.FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID
                    , tb_1.CUSTOMER_INVOICE_TO_ID
                    , tb_2.CUSTOMER_INVOICE_TO_ALPHABET
                    , tb_2.CUSTOMER_INVOICE_TO_NAME
                    , tb_1.P2_NEED
                    , tb_1.P2_START_MONTH_OF_FISCAL_YEAR_ID
                    , tb_4.MONTH_SHORT_NAME_ENGLISH AS P2_START_MONTH_OF_FISCAL_YEAR_NAME
                    , tb_1.P3_START_MONTH_OF_FISCAL_YEAR_ID
                    , tb_3.MONTH_SHORT_NAME_ENGLISH AS P3_START_MONTH_OF_FISCAL_YEAR_NAME
                    , tb_1.UPDATE_BY
                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                    , tb_1.INUSE
                    , tb_1.INUSE AS inuseForSearch

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

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)

    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.P2_NEED', dataItem['P2_NEED'])
    sql = sql.replaceAll('dataItem.P2_START_MONTH_OF_FISCAL_YEAR_NAME', dataItem['P2_START_MONTH_OF_FISCAL_YEAR_NAME'])
    sql = sql.replaceAll('dataItem.P3_START_MONTH_OF_FISCAL_YEAR_NAME', dataItem['P3_START_MONTH_OF_FISCAL_YEAR_NAME'])
    sql = sql.replaceAll('dataItem.P2_START_MONTH_OF_FISCAL_YEAR_ID', dataItem['P2_START_MONTH_OF_FISCAL_YEAR_ID'])
    sql = sql.replaceAll('dataItem.P3_START_MONTH_OF_FISCAL_YEAR_ID', dataItem['P3_START_MONTH_OF_FISCAL_YEAR_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)
    // console.log(sql)
    sqlList = sqlList.join(';')

    return sqlList
  },

  createFiscalYearPeriodReferToCustomerInvoiceTo: async (dataItem: any) => {
    let sql = `
                    INSERT INTO FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO
                    (
                          FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID
                        , CUSTOMER_INVOICE_TO_ID
                        , P2_NEED
                        , P2_START_MONTH_OF_FISCAL_YEAR_ID
                        , P3_START_MONTH_OF_FISCAL_YEAR_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                    SELECT
                           1 + coalesce((SELECT max(FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID) FROM FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO), 0)
                        , 'dataItem.CUSTOMER_INVOICE_TO_ID'
                        , 'dataItem.P2_NEED'
                        ,  dataItem.P2_START_MONTH_OF_FISCAL_YEAR_ID
                        , 'dataItem.P3_START_MONTH_OF_FISCAL_YEAR_ID'
                        , 'dataItem.CREATE_BY'
                        ,  CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'


                              `

    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.P2_NEED', dataItem['P2_NEED'])
    sql = sql.replaceAll('dataItem.P2_START_MONTH_OF_FISCAL_YEAR_ID', dataItem['P2_START_MONTH_OF_FISCAL_YEAR_ID'] !== '' ? dataItem['P2_START_MONTH_OF_FISCAL_YEAR_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.P3_START_MONTH_OF_FISCAL_YEAR_ID', dataItem['P3_START_MONTH_OF_FISCAL_YEAR_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },

  updateFiscalYearPeriodReferToCustomerInvoiceTo: async (dataItem: any) => {
    let sql = `     UPDATE
                        FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO
                    SET
                        P2_NEED = 'dataItem.P2_NEED'
                        , P2_START_MONTH_OF_FISCAL_YEAR_ID = dataItem.P2_START_MONTH_OF_FISCAL_YEAR_ID
                        , P3_START_MONTH_OF_FISCAL_YEAR_ID = 'dataItem.P3_START_MONTH_OF_FISCAL_YEAR_ID'
                        , INUSE = 'dataItem.INUSE'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID = 'dataItem.FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID'
                      `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID', dataItem['FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID'])

    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.P2_NEED', dataItem['P2_NEED'])
    sql = sql.replaceAll('dataItem.P2_START_MONTH_OF_FISCAL_YEAR_ID', dataItem['P2_START_MONTH_OF_FISCAL_YEAR_ID'] !== '' ? dataItem['P2_START_MONTH_OF_FISCAL_YEAR_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.P3_START_MONTH_OF_FISCAL_YEAR_ID', dataItem['P3_START_MONTH_OF_FISCAL_YEAR_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['CREATE_BY'])
    return sql
  },

  // *** Function Delete
  deleteFiscalYearPeriodReferToCustomerInvoiceTo: async (dataItem: any) => {
    let sql = `      UPDATE
                            FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO
                        SET
                            INUSE = '0'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                            FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID = 'dataItem.FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID'
                      `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID', dataItem['FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['CREATE_BY'])

    return sql
  },

  DeleteByCustomerInvoiceToId: async (dataItem: any) => {
    let sql = `            UPDATE
                                FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO
                            SET
                                  INUSE = '0'
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                    INUSE = '1'
                                AND CUSTOMER_INVOICE_TO_ID = 'dataItem.CUSTOMER_INVOICE_TO_ID' ;
                                                `

    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['CREATE_BY'])
    // console.log(sql)
    return sql
  },

  GetByCustomerInvoiceToIdAndInuse: async (dataItem: any) => {
    let sql = `           SELECT
                                tb_1.FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID
                            , tb_1.CUSTOMER_INVOICE_TO_ID
                            , tb_2.CUSTOMER_INVOICE_TO_ALPHABET
                            , tb_1.P2_NEED
                            , tb_1.P2_START_MONTH_OF_FISCAL_YEAR_ID
                            , tb_2.MONTH_FULL_NAME_ENGLISH AS P2_START_MONTH_OF_FISCAL_YEAR_NAME
                            , tb_1.P3_START_MONTH_OF_FISCAL_YEAR_ID
                            , tb_2.MONTH_FULL_NAME_ENGLISH AS P3_START_MONTH_OF_FISCAL_YEAR_NAME
                            , tb_1.UPDATE_BY
                            , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS MODIFIED_DATE
                            , tb_1.INUSE
                            FROM
                            FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO tb_1
                                INNER JOIN
                            CUSTOMER_INVOICE_TO tb_2
                                ON tb_1.CUSTOMER_INVOICE_TO_ID = tb_2.CUSTOMER_INVOICE_TO_ID
                            WHERE
                                CUSTOMER_INVOICE_TO_ID = 'dataItem.CUSTOMER_INVOICE_TO_ID'
                            AND INUSE = 'dataItem.INUSE'
                                                `

    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  GetByCustomerInvoiceToIdAndInuseDuplicate: async (dataItem: any) => {
    let sql = `           SELECT
                               tb_1.CUSTOMER_INVOICE_TO_ID
                            , tb_2.CUSTOMER_INVOICE_TO_ALPHABET

                            FROM
                            FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO tb_1
                                INNER JOIN
                            CUSTOMER_INVOICE_TO tb_2
                                ON tb_1.CUSTOMER_INVOICE_TO_ID = tb_2.CUSTOMER_INVOICE_TO_ID
                            WHERE
                                tb_1.CUSTOMER_INVOICE_TO_ID = 'dataItem.CUSTOMER_INVOICE_TO_ID'
                            AND tb_1.INUSE = 1
                                                `

    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
