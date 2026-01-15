export const ImportFeeSQL = {
  getLatestImportFee: async (dataItem: any) => {
    let sql = `     SELECT
                          tb_1.IMPORT_FEE_RATE
                        , tb_2.ITEM_IMPORT_TYPE_NAME
                        , tb_1.IMPORT_FEE_ID
                        , tb_1.ITEM_IMPORT_TYPE_ID
                        , tb_1.VERSION
                        , tb_1.FISCAL_YEAR
                    FROM
                        IMPORT_FEE tb_1
                    JOIN
                        ITEM_IMPORT_TYPE tb_2
                    ON
                        tb_1.ITEM_IMPORT_TYPE_ID = tb_2.ITEM_IMPORT_TYPE_ID
                    WHERE
                            tb_1.INUSE = 1
                        AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                        AND tb_1.IS_CURRENT = 1
                      ;
                    `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  search: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        IMPORT_FEE tb_1
                    JOIN
                        ITEM_IMPORT_TYPE tb_2
                    ON
                        tb_1.ITEM_IMPORT_TYPE_ID = tb_2.ITEM_IMPORT_TYPE_ID
                    WHERE
                            tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'
                        AND tb_1.ITEM_IMPORT_TYPE_ID LIKE '%dataItem.ITEM_IMPORT_TYPE_ID%'
                        AND tb_1.INUSE = '1'
                        sqlWhereColumnFilter `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
                SELECT
                      tb_1.IMPORT_FEE_ID
                    , tb_2.ITEM_IMPORT_TYPE_ID
                    , tb_2.ITEM_IMPORT_TYPE_NAME
                    , tb_1.IMPORT_FEE_RATE
                    , tb_1.FISCAL_YEAR
                    , tb_1.VERSION
                    , tb_1.UPDATE_BY
                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                FROM
                    IMPORT_FEE tb_1
                JOIN
                    ITEM_IMPORT_TYPE tb_2
                ON
                    tb_1.ITEM_IMPORT_TYPE_ID = tb_2.ITEM_IMPORT_TYPE_ID
                WHERE
                        tb_1.FISCAL_YEAR LIKE '%dataItem.FISCAL_YEAR%'
                    AND tb_1.ITEM_IMPORT_TYPE_ID LIKE '%dataItem.ITEM_IMPORT_TYPE_ID%'
                    AND tb_1.INUSE = '1'
                    sqlWhereColumnFilter
                ORDER BY
                    dataItem.Order
                LIMIT
                      dataItem.Start
                    , dataItem.Limit
            `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  create: async (dataItem: { FISCAL_YEAR: number; ITEM_IMPORT_TYPE_ID: number; IMPORT_FEE_RATE: string; CREATE_BY: string }) => {
    let sql = `     INSERT INTO
                              IMPORT_FEE
                            (
                                FISCAL_YEAR
                              , VERSION
                              , ITEM_IMPORT_TYPE_ID
                              , IMPORT_FEE_RATE
                              , CREATE_BY
                              , UPDATE_BY
                              , UPDATE_DATE
                              , INUSE
                              , IS_CURRENT
                            )

                            SELECT
                                dataItem.FISCAL_YEAR
                              , @version
                              , 'dataItem.ITEM_IMPORT_TYPE_ID'
                              , 'dataItem.IMPORT_FEE_RATE'
                              , 'dataItem.CREATE_BY'
                              , 'dataItem.CREATE_BY'
                              , CURRENT_TIMESTAMP()
                              , 1
                              , 1
                            ;

                            SET @new_import_fee_id = LAST_INSERT_ID();

`

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.IMPORT_FEE_RATE', dataItem['IMPORT_FEE_RATE'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'].toString())

    return sql
  },
  deleteOldDataByFiscalYear: async (dataItem: any) => {
    let sql = `    UPDATE
                        IMPORT_FEE
                    SET
                        INUSE = '0'
                    WHERE
                        FISCAL_YEAR = dataItem.FISCAL_YEAR
`

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  createVersion: async (dataItem: any) => {
    let sql = `
        SET @version =  (
                            SELECT
                                IFNULL(MAX(VERSION), 0) + 1
                            FROM
                                IMPORT_FEE
                            WHERE
                                FISCAL_YEAR = dataItem.FISCAL_YEAR
                        )
`

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  getByFiscalYear_MasterDataLatest: async (dataItem: { FISCAL_YEAR: number }) => {
    let sql = `     SELECT
                          tb_1.IMPORT_FEE_RATE
                        , tb_2.ITEM_IMPORT_TYPE_NAME
                        , tb_1.IMPORT_FEE_ID
                        , tb_1.ITEM_IMPORT_TYPE_ID
                        , tb_1.VERSION
                        , tb_1.FISCAL_YEAR
                    FROM
                        IMPORT_FEE tb_1
                            INNER JOIN
                        ITEM_IMPORT_TYPE tb_2
                            ON tb_1.ITEM_IMPORT_TYPE_ID = tb_2.ITEM_IMPORT_TYPE_ID
                    WHERE
                            tb_1.INUSE = 1
                        AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'`

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())

    return sql
  },
  updateIsCurrentByFiscalYear: async (dataItem: { FISCAL_YEAR: number }) => {
    let sql = `     UPDATE
                        IMPORT_FEE
                    SET
                        IS_CURRENT = 0
                    WHERE
                            FISCAL_YEAR = dataItem.FISCAL_YEAR
                        AND IS_CURRENT = 1    `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())

    return sql
  },
}
