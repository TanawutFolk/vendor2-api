export const CustomerShipToSQL = {
  getByCustomerShipToName_condition: async (dataItem: any) => {
    let sql = `
                                SELECT
                                                  CUSTOMER_SHIP_TO_ID
                                                , CUSTOMER_SHIP_TO_NAME
                                                , CUSTOMER_SHIP_TO_ALPHABET
                                FROM
                                               CUSTOMER_SHIP_TO

                                WHERE
                                              CUSTOMER_SHIP_TO_NAME = 'dataItem.CUSTOMER_SHIP_TO_NAME'
                                              AND INUSE = 1

                `

    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_NAME', dataItem['CUSTOMER_SHIP_TO_NAME'])
    // console.log('getByAccountDepartmentName_condition', sql)
    return sql
  },

  getByCustomerShipToAlphabet_condition: async (dataItem: any) => {
    let sql = `
                                SELECT
                                                  CUSTOMER_SHIP_TO_ID
                                                , CUSTOMER_SHIP_TO_NAME
                                                , CUSTOMER_SHIP_TO_ALPHABET
                                FROM
                                               CUSTOMER_SHIP_TO

                                WHERE
                                              CUSTOMER_SHIP_TO_ALPHABET = 'dataItem.CUSTOMER_SHIP_TO_ALPHABET'
                                              AND INUSE = 1

                `

    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_ALPHABET', dataItem['CUSTOMER_SHIP_TO_ALPHABET'])
    // console.log('getByAccountDepartmentName_condition', sql)
    return sql
  },

  delete: async (dataItem: any) => {
    let sql = `      UPDATE
                            CUSTOMER_SHIP_TO
                        SET
                            INUSE = '0'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                            CUSTOMER_SHIP_TO_ID = 'dataItem.CUSTOMER_SHIP_TO_ID'
                      `

    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_ID', dataItem['CUSTOMER_SHIP_TO_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  update: async (dataItem: any) => {
    let sql = `    UPDATE
                      CUSTOMER_SHIP_TO
                  SET
                      CUSTOMER_SHIP_TO_NAME = 'dataItem.CUSTOMER_SHIP_TO_NAME'
                      , CUSTOMER_SHIP_TO_ALPHABET = 'dataItem.CUSTOMER_SHIP_TO_ALPHABET'
                      , INUSE = 'dataItem.INUSE'
                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                      , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                      CUSTOMER_SHIP_TO_ID = 'dataItem.CUSTOMER_SHIP_TO_ID'
                    `

    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_ID', dataItem['CUSTOMER_SHIP_TO_ID'])
    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_NAME', dataItem['CUSTOMER_SHIP_TO_NAME'])
    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_ALPHABET', dataItem['CUSTOMER_SHIP_TO_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    return sql
  },

  create: async (dataItem: any) => {
    let sql = `
                            INSERT INTO CUSTOMER_SHIP_TO
                            (
                                  CUSTOMER_SHIP_TO_ID
                                , CUSTOMER_SHIP_TO_NAME
                                , CUSTOMER_SHIP_TO_ALPHABET
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                            )
                            SELECT
                                   1 + coalesce((SELECT max(CUSTOMER_SHIP_TO_ID) FROM CUSTOMER_SHIP_TO), 0)
                                , 'dataItem.CUSTOMER_SHIP_TO_NAME'
                                , 'dataItem.CUSTOMER_SHIP_TO_ALPHABET'
                                , 'dataItem.CREATE_BY'
                                ,  CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                              `

    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_NAME', dataItem['CUSTOMER_SHIP_TO_NAME'])
    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_ALPHABET', dataItem['CUSTOMER_SHIP_TO_ALPHABET'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },

  search: async (dataItem: any) => {
    let sqlList = []

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM (
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
    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_NAME', dataItem['CUSTOMER_SHIP_TO_NAME'])
    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_ALPHABET', dataItem['CUSTOMER_SHIP_TO_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = `
                    SELECT
                    tb_1.CUSTOMER_SHIP_TO_ID
                , tb_1.CUSTOMER_SHIP_TO_NAME
                , tb_1.CUSTOMER_SHIP_TO_ALPHABET
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
    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_NAME', dataItem['CUSTOMER_SHIP_TO_NAME'])
    sql = sql.replaceAll('dataItem.CUSTOMER_SHIP_TO_ALPHABET', dataItem['CUSTOMER_SHIP_TO_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)
    return sqlList
  },
}
