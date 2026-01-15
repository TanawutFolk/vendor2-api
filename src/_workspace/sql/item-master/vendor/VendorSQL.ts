export const VendorSQL = {
  getItemImportTypeByItemId: async (dataItem: any) => {
    let sql = `     SELECT
                          tb_2.ITEM_IMPORT_TYPE_ID
                    FROM
                        ITEM_MANUFACTURING tb_1
                    JOIN
                        VENDOR tb_2
                    ON
                        tb_1.VENDOR_ID = tb_2.VENDOR_ID
                    WHERE
                            tb_1.ITEM_ID = 'dataItem.ITEM_ID'
                        AND tb_1.INUSE = '1'
                    `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    return sql
  },
  getItemImportType: async (dataItem: any) => {
    let sql = `     SELECT
                          ITEM_IMPORT_TYPE_ID
                        , ITEM_IMPORT_TYPE_NAME
                    FROM
                        ITEM_IMPORT_TYPE
                    WHERE
                        ITEM_IMPORT_TYPE_NAME LIKE '%dataItem.ITEM_IMPORT_TYPE_NAME%'
                        AND INUSE = 'dataItem.INUSE'
                    `

    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_NAME', dataItem['ITEM_IMPORT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  getVendor: async (dataItem: any) => {
    let sql = `     SELECT
                            VENDOR_ID
                        , VENDOR_NAME
                        , VENDOR_ALPHABET
                        , INUSE
                        FROM
                        VENDOR
                        WHERE
                        VENDOR_ID = 'dataItem.VENDOR_ID'
                    `

    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])

    return sql
  },
  getAll: async () => {
    let sql = `     SELECT
                      VENDOR_ID
                    , VENDOR_NAME
                    , VENDOR_ALPHABET
                    , INUSE
                  FROM
                      VENDOR   ;
                  `

    return sql
  },
  searchVendor: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `   SELECT
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
    sql = sql.replaceAll('dataItem.VENDOR_NAME', dataItem['VENDOR_NAME'])
    sql = sql.replaceAll('dataItem.VENDOR_ALPHABET', dataItem['VENDOR_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
            SELECT
                  tb_1.VENDOR_ID
                , tb_1.VENDOR_NAME
                , tb_1.VENDOR_ALPHABET
                , tb_2.ITEM_IMPORT_TYPE_ID
                , tb_2.ITEM_IMPORT_TYPE_NAME
                , tb_1.VENDOR_CD_PRONES
                , tb_1.VENDOR_NAME_PRONES
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
    sql = sql.replaceAll('dataItem.VENDOR_NAME', dataItem['VENDOR_NAME'])
    sql = sql.replaceAll('dataItem.VENDOR_ALPHABET', dataItem['VENDOR_ALPHABET'])
    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  createVendor: async (dataItem: any) => {
    let sql = `
                    INSERT INTO VENDOR
                    (
                          VENDOR_ID
                        , VENDOR_NAME
                        , VENDOR_ALPHABET
                        , ITEM_IMPORT_TYPE_ID
                        , VENDOR_CD_PRONES
                        , VENDOR_NAME_PRONES
                        , IMPORT_TYPE_PRONES_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                    SELECT
                           1 + coalesce((SELECT max(VENDOR_ID) FROM VENDOR), 0)
                        , 'dataItem.VENDOR_NAME'
                        , 'dataItem.VENDOR_ALPHABET'
                        , 'dataItem.ITEM_IMPORT_TYPE_ID'
                        , 'dataItem.VENDOR_CD_PRONES'
                        , 'dataItem.VENDOR_NAME_PRONES'
                        , 'dataItem.IMPORT_TYPE_PRONES_ID'
                        , 'dataItem.CREATE_BY'
                        ,  CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'
                    FROM
                        DUAL
                    WHERE NOT EXISTS (
                      SELECT
                          1
                      FROM
                          VENDOR
                      WHERE
                          (
                                 VENDOR_NAME = 'dataItem.VENDOR_NAME'
                              OR VENDOR_ALPHABET = 'dataItem.VENDOR_ALPHABET'
                              OR VENDOR_CD_PRONES = 'dataItem.VENDOR_CD_PRONES'
                              OR VENDOR_NAME_PRONES = 'dataItem.VENDOR_NAME_PRONES'
                          )
                          AND INUSE = 1
                    )


                              `

    sql = sql.replaceAll('dataItem.VENDOR_ALPHABET', dataItem['VENDOR_ALPHABET'])
    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.VENDOR_CD_PRONES', dataItem['VENDOR_CD_PRONES'])
    sql = sql.replaceAll('dataItem.VENDOR_NAME_PRONES', dataItem['VENDOR_NAME_PRONES'])
    sql = sql.replaceAll('dataItem.IMPORT_TYPE_PRONES_ID', dataItem['IMPORT_TYPE_PRONES_ID'])
    sql = sql.replaceAll('dataItem.VENDOR_NAME', dataItem['VENDOR_NAME'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  updateVendor: async (dataItem: any) => {
    let sql = `     UPDATE
                        VENDOR
                    SET
                          VENDOR_NAME = 'dataItem.VENDOR_NAME'
                        , VENDOR_ALPHABET = 'dataItem.VENDOR_ALPHABET'
                        , ITEM_IMPORT_TYPE_ID = 'dataItem.ITEM_IMPORT_TYPE_ID'
                        , VENDOR_CD_PRONES = 'dataItem.VENDOR_CD_PRONES'
                        , VENDOR_NAME_PRONES = 'dataItem.VENDOR_NAME_PRONES'
                        , IMPORT_TYPE_PRONES_ID = 'dataItem.IMPORT_TYPE_PRONES_ID'
                        , INUSE = 'dataItem.INUSE'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        VENDOR_ID = 'dataItem.VENDOR_ID'
                      `

    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])

    sql = sql.replaceAll('dataItem.VENDOR_ALPHABET', dataItem['VENDOR_ALPHABET'])
    sql = sql.replaceAll('dataItem.ITEM_IMPORT_TYPE_ID', dataItem['ITEM_IMPORT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.VENDOR_CD_PRONES', dataItem['VENDOR_CD_PRONES'])
    sql = sql.replaceAll('dataItem.VENDOR_NAME_PRONES', dataItem['VENDOR_NAME_PRONES'])
    sql = sql.replaceAll('dataItem.IMPORT_TYPE_PRONES_ID', dataItem['IMPORT_TYPE_PRONES_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.VENDOR_NAME', dataItem['VENDOR_NAME'])
    return sql
  },
  deleteVendor: async (dataItem: any) => {
    let sql = `     UPDATE
                        VENDOR
                    SET
                        INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        VENDOR_ID = 'dataItem.VENDOR_ID'
                      `

    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getByLikeVendorName: async (dataItem: any) => {
    let sql = `            SELECT
                                VENDOR_ID
                            , VENDOR_NAME
                            FROM
                            VENDOR
                            WHERE
                                VENDOR_NAME LIKE '%dataItem.VENDOR_NAME%'
                            AND INUSE LIKE '%dataItem.INUSE%'
                            ORDER BY
                            VENDOR_NAME
                            LIMIT
                            50
                                                `

    sql = sql.replaceAll('dataItem.VENDOR_NAME', dataItem['VENDOR_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeVendorAlphabetAndInuse: async (dataItem: any) => {
    let sql = `     SELECT
                        VENDOR_ID
                    , VENDOR_ALPHABET
                    FROM
                    VENDOR
                    WHERE
                        VENDOR_ALPHABET LIKE '%dataItem.VENDOR_ALPHABET%'
                    AND INUSE LIKE '%dataItem.INUSE%'
                    ORDER BY
                    VENDOR_ALPHABET
                    LIMIT
                    50          `

    sql = sql.replaceAll('dataItem.VENDOR_ALPHABET', dataItem['VENDOR_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getVendorName: async (dataItem: any) => {
    let sql = `            SELECT
                                VENDOR_ID
                            , VENDOR_NAME
                            FROM
                            VENDOR
                            WHERE
                                VENDOR_NAME = 'dataItem.VENDOR_NAME'
                            AND INUSE = 1
                                    `

    sql = sql.replaceAll('dataItem.VENDOR_NAME', dataItem['VENDOR_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    console.log('sql', sql)

    return sql
  },
  getVendorAlphabet: async (dataItem: any) => {
    let sql = `     SELECT
                        VENDOR_ID
                    , VENDOR_ALPHABET
                    FROM
                    VENDOR
                    WHERE
                        VENDOR_ALPHABET = 'dataItem.VENDOR_ALPHABET'
                    AND INUSE = 1
                          `

    sql = sql.replaceAll('dataItem.VENDOR_ALPHABET', dataItem['VENDOR_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  getByLikeVendorNameAndImportType: async (dataItem: any) => {
    let sql = `            SELECT
                              tb_1.VENDOR_ID
                            , tb_1.VENDOR_NAME
                            , tb_1.ITEM_IMPORT_TYPE_ID
                            , tb_2.ITEM_IMPORT_TYPE_NAME
                            FROM
                            VENDOR tb_1
                            INNER JOIN ITEM_IMPORT_TYPE AS tb_2 ON tb_2.ITEM_IMPORT_TYPE_ID = tb_1.ITEM_IMPORT_TYPE_ID
                            WHERE
                                tb_1.VENDOR_NAME LIKE '%dataItem.VENDOR_NAME%'
                            AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                            ORDER BY
                            VENDOR_NAME
                            LIMIT
                            50
                                                `

    sql = sql.replaceAll('dataItem.VENDOR_NAME', dataItem['VENDOR_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
