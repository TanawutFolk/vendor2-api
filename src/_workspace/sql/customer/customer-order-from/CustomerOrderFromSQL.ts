export const CustomerOrderFromSQL = {
  getByCustomerOrderFromName_condition: async (dataItem: any) => {
    let sql = `
                                SELECT
                                                  CUSTOMER_ORDER_FROM_ID
                                                , CUSTOMER_ORDER_FROM_NAME
                                                , CUSTOMER_ORDER_FROM_ALPHABET
                                FROM
                                               CUSTOMER_ORDER_FROM

                                WHERE
                                              CUSTOMER_ORDER_FROM_NAME = 'dataItem.CUSTOMER_ORDER_FROM_NAME'
                                              AND INUSE = '1'

                `

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_NAME', dataItem['CUSTOMER_ORDER_FROM_NAME'])
    // console.log('getByAccountDepartmentName_condition', sql)
    return sql
  },

  getByCustomerOrderFromAlphabet_condition: async (dataItem: any) => {
    let sql = `
                                SELECT
                                                  CUSTOMER_ORDER_FROM_ID
                                                , CUSTOMER_ORDER_FROM_NAME
                                                , CUSTOMER_ORDER_FROM_ALPHABET
                                FROM
                                               CUSTOMER_ORDER_FROM

                                WHERE
                                              CUSTOMER_ORDER_FROM_ALPHABET = 'dataItem.CUSTOMER_ORDER_FROM_ALPHABET'
                                              AND INUSE = '1'

                `

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ALPHABET', dataItem['CUSTOMER_ORDER_FROM_ALPHABET'])
    // console.log('getByAccountDepartmentName_condition', sql)
    return sql
  },

  getByLikeCustomerOrderFromNameAndInuse: async (dataItem: any) => {
    let sql = `         SELECT
                                CUSTOMER_ORDER_FROM_ID
                              , CUSTOMER_ORDER_FROM_NAME
                          FROM
                                CUSTOMER_ORDER_FROM
                          WHERE
                                CUSTOMER_ORDER_FROM_NAME LIKE '%dataItem.CUSTOMER_ORDER_FROM_NAME%'
                          AND   INUSE LIKE '%dataItem.INUSE%'
                          ORDER BY
                          CUSTOMER_ORDER_FROM_NAME
                          LIMIT 50
                                              `

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_NAME', dataItem['CUSTOMER_ORDER_FROM_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('getByLikeCustomer', sql)

    return sql
  },
  delete: async (dataItem: any) => {
    let sql = `    UPDATE
                        CUSTOMER_ORDER_FROM
                    SET
                        INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        CUSTOMER_ORDER_FROM_ID = 'dataItem.CUSTOMER_ORDER_FROM_ID'
                      `

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  update: async (dataItem: any) => {
    let sql = `    UPDATE
                            CUSTOMER_ORDER_FROM
                        SET
                            CUSTOMER_ORDER_FROM_NAME = 'dataItem.CUSTOMER_ORDER_FROM_NAME'
                            , CUSTOMER_ORDER_FROM_ALPHABET = 'dataItem.CUSTOMER_ORDER_FROM_ALPHABET'
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                            CUSTOMER_ORDER_FROM_ID = 'dataItem.CUSTOMER_ORDER_FROM_ID'
                      `

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_NAME', dataItem['CUSTOMER_ORDER_FROM_NAME'])
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ALPHABET', dataItem['CUSTOMER_ORDER_FROM_ALPHABET'])
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('upOrder', sql)
    return sql
  },

  create: async (dataItem: any) => {
    let sql = `
    INSERT INTO CUSTOMER_ORDER_FROM
    (
          CUSTOMER_ORDER_FROM_ID
        , CUSTOMER_ORDER_FROM_NAME
        , CUSTOMER_ORDER_FROM_ALPHABET
        , CREATE_BY
        , UPDATE_DATE
        , UPDATE_BY
    )
    SELECT
           1 + coalesce((SELECT max(CUSTOMER_ORDER_FROM_ID) FROM CUSTOMER_ORDER_FROM), 0)
        , 'dataItem.CUSTOMER_ORDER_FROM_NAME'
        , 'dataItem.CUSTOMER_ORDER_FROM_ALPHABET'
        , 'dataItem.CREATE_BY'
        ,  CURRENT_TIMESTAMP()
        , 'dataItem.CREATE_BY'
`

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_NAME', dataItem['CUSTOMER_ORDER_FROM_NAME'])
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ALPHABET', dataItem['CUSTOMER_ORDER_FROM_ALPHABET'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    //console.log('CreateOrder', sql)
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
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_NAME', dataItem['CUSTOMER_ORDER_FROM_NAME'])
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ALPHABET', dataItem['CUSTOMER_ORDER_FROM_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    sqlList.push(sql)

    sql = `SELECT
                  tb_1.CUSTOMER_ORDER_FROM_ID
                , tb_1.CUSTOMER_ORDER_FROM_NAME
                , tb_1.CUSTOMER_ORDER_FROM_ALPHABET
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
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_NAME', dataItem['CUSTOMER_ORDER_FROM_NAME'])
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ALPHABET', dataItem['CUSTOMER_ORDER_FROM_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sqlList.push(sql)

    // sqlList = sqlList.join(";");
    //console.log('SearchOfOrder' + sqlList)
    return sqlList
  },
  getAll: async () => {
    let sql = `    SELECT
                          CUSTOMER_ORDER_FROM_ID
                        , CUSTOMER_ORDER_FROM_NAME
                        , CUSTOMER_ORDER_FROM_ALPHABET
                    FROM 
                        CUSTOMER_ORDER_FROM    ;                 
                    `
    return sql
  },
}
