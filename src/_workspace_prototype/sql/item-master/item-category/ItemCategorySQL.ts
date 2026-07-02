export const ItemCategorySQL = {
  getItemCategory: async (dataItem: any) => {
    let sql = `     SELECT
                        ITEM_CATEGORY_ID
                    , ITEM_CATEGORY_NAME
                    , ITEM_CATEGORY_ALPHABET
                    , PURCHASE_MODULE_ID
                    , INUSE
                    FROM
                    ITEM_CATEGORY
                    WHERE
                    ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID' ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])

    return sql
  },
  getAll: async () => {
    let sql = `     SELECT
                        ITEM_CATEGORY_ID
                      , ITEM_CATEGORY_NAME
                      , ITEM_CATEGORY_ALPHABET
                      , PURCHASE_MODULE_ID
                      , INUSE
                    FROM
                      ITEM_CATEGORY  ;
                    `
    return sql
  },
  searchItemCategory: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `   SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        ITEM_CATEGORY tb_1
                    JOIN
                        PURCHASE_MODULE tb_2
                        ON tb_1.PURCHASE_MODULE_ID = tb_2.PURCHASE_MODULE_ID
                    WHERE
                            tb_1.ITEM_CATEGORY_NAME LIKE '%dataItem.ITEM_CATEGORY_NAME%'
                        AND tb_1.ITEM_CATEGORY_ALPHABET LIKE '%dataItem.ITEM_CATEGORY_ALPHABET%'
                        AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                        sqlWhereColumnFilter `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_NAME', dataItem['ITEM_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ALPHABET', dataItem['ITEM_CATEGORY_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
                SELECT
                tb_1.ITEM_CATEGORY_ID
            , tb_1.ITEM_CATEGORY_NAME
            , tb_1.ITEM_CATEGORY_ALPHABET
            , tb_1.ITEM_CATEGORY_SHORT_NAME
            , tb_1.PURCHASE_MODULE_ID
            , tb_2.PURCHASE_MODULE_NAME
            , tb_1.UPDATE_BY
            , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS MODIFIED_DATE
            , tb_1.INUSE
    FROM
                ITEM_CATEGORY tb_1
                    INNER JOIN
                PURCHASE_MODULE tb_2
                    ON tb_1.PURCHASE_MODULE_ID = tb_2.PURCHASE_MODULE_ID
    WHERE
                    tb_1.ITEM_CATEGORY_NAME LIKE '%dataItem.ITEM_CATEGORY_NAME%'
                AND tb_1.ITEM_CATEGORY_ALPHABET LIKE '%dataItem.ITEM_CATEGORY_ALPHABET%'
                AND tb_1.INUSE LIKE '%dataItem.INUSE%'
                sqlWhereColumnFilter
    ORDER BY
                dataItem.Order
    LIMIT
                    dataItem.Start
                , dataItem.Limit
            `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_NAME', dataItem['ITEM_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ALPHABET', dataItem['ITEM_CATEGORY_ALPHABET'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  createItemCategory: async (dataItem: any) => {
    let sql = `
                    INSERT INTO ITEM_CATEGORY
                    (
                          ITEM_CATEGORY_ID
                        , ITEM_CATEGORY_NAME
                        , ITEM_CATEGORY_ALPHABET
                        , ITEM_CATEGORY_SHORT_NAME
                        , PURCHASE_MODULE_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                    SELECT
                          1 + coalesce((SELECT max(ITEM_CATEGORY_ID) FROM ITEM_CATEGORY), 0)
                        , 'dataItem.ITEM_CATEGORY_NAME'
                        , 'dataItem.ITEM_CATEGORY_ALPHABET'
                        , 'dataItem.ITEM_CATEGORY_SHORT_NAME'
                        , 'dataItem.PURCHASE_MODULE_ID'
                        , 'dataItem.CREATE_BY'
                        ,  CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'
                    FROM
                        DUAL
                    WHERE NOT EXISTS (
                      SELECT
                          1
                      FROM
                          ITEM_CATEGORY
                      WHERE
                          (
                                  ITEM_CATEGORY_NAME = 'dataItem.ITEM_CATEGORY_NAME'
                              OR ITEM_CATEGORY_ALPHABET = 'dataItem.ITEM_CATEGORY_ALPHABET'
                              OR ITEM_CATEGORY_SHORT_NAME = 'dataItem.ITEM_CATEGORY_SHORT_NAME'
                          )
                          AND INUSE = 1
                    )


                            `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_NAME', dataItem['ITEM_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ALPHABET', dataItem['ITEM_CATEGORY_ALPHABET'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_SHORT_NAME', dataItem['ITEM_CATEGORY_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.PURCHASE_MODULE_ID', dataItem['PURCHASE_MODULE_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  updateItemCategory: async (dataItem: any) => {
    let sql = `    UPDATE
                      ITEM_CATEGORY
                  SET
                      ITEM_CATEGORY_NAME = 'dataItem.ITEM_CATEGORY_NAME'
                      , ITEM_CATEGORY_ALPHABET = 'dataItem.ITEM_CATEGORY_ALPHABET'
                      , ITEM_CATEGORY_SHORT_NAME = 'dataItem.ITEM_CATEGORY_SHORT_NAME'
                      , PURCHASE_MODULE_ID = 'dataItem.PURCHASE_MODULE_ID'
                      , INUSE = 'dataItem.INUSE'
                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                      , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                      ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID'
                    `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_NAME', dataItem['ITEM_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ALPHABET', dataItem['ITEM_CATEGORY_ALPHABET'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_SHORT_NAME', dataItem['ITEM_CATEGORY_SHORT_NAME'])

    sql = sql.replaceAll('dataItem.PURCHASE_MODULE_ID', dataItem['PURCHASE_MODULE_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    return sql
  },
  deleteItemCategory: async (dataItem: any) => {
    let sql = `    UPDATE
                    ITEM_CATEGORY
                SET
                    INUSE = '0'
                    , UPDATE_BY = 'dataItem.UPDATE_BY'
                    , UPDATE_DATE = CURRENT_TIMESTAMP()
                WHERE
                    ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID'
                    `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getByLikeItemCategoryNameAndInuse: async (dataItem: any) => {
    let sql = `          SELECT
                            ITEM_CATEGORY_ID
                        , ITEM_CATEGORY_NAME
                        , ITEM_CATEGORY_ALPHABET
                        , PURCHASE_MODULE_ID
                        FROM
                        ITEM_CATEGORY
                        WHERE
                            ITEM_CATEGORY_NAME LIKE '%dataItem.ITEM_CATEGORY_NAME%'
                        AND INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                        ITEM_CATEGORY_NAME
                        LIMIT
                        50
                                            `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_NAME', dataItem['ITEM_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse: async (dataItem: any) => {
    let sql = `               SELECT
                                ITEM_CATEGORY_ID
                              , ITEM_CATEGORY_NAME
                              , ITEM_CATEGORY_ALPHABET
                              , PURCHASE_MODULE_ID
                        FROM
                                ITEM_CATEGORY
                        WHERE
                                    ITEM_CATEGORY_NAME LIKE '%dataItem.ITEM_CATEGORY_NAME%'
                                AND INUSE LIKE '%dataItem.INUSE%'
                                AND ITEM_CATEGORY_ID IN (4,5,6)
                        ORDER BY
                                ITEM_CATEGORY_NAME
                                            `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_NAME', dataItem['ITEM_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getForBomByLikeItemCategoryNameAndInuse: async (dataItem: any) => {
    let sql = `         SELECT
                            ITEM_CATEGORY_ID
                        , ITEM_CATEGORY_NAME
                        , ITEM_CATEGORY_ALPHABET
                        , PURCHASE_MODULE_ID
                        FROM
                        ITEM_CATEGORY
                        WHERE
                            ITEM_CATEGORY_NAME LIKE '%dataItem.ITEM_CATEGORY_NAME%'
                        AND ITEM_CATEGORY_ID != 1
                        AND INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                        ITEM_CATEGORY_NAME
                        LIMIT
                        50
                                            `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_NAME', dataItem['ITEM_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse: async (dataItem: any) => {
    let sql = `           SELECT
                            ITEM_CATEGORY_ID
                        , ITEM_CATEGORY_NAME
                        , ITEM_CATEGORY_ALPHABET
                        , PURCHASE_MODULE_ID
                        FROM
                        ITEM_CATEGORY
                        WHERE
                            ITEM_CATEGORY_NAME LIKE '%dataItem.ITEM_CATEGORY_NAME%'
                        AND PURCHASE_MODULE_ID = 'dataItem.PURCHASE_MODULE_ID'
                        AND INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                        ITEM_CATEGORY_NAME
                        LIMIT
                        50
                                            `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_NAME', dataItem['ITEM_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.PURCHASE_MODULE_ID', dataItem['PURCHASE_MODULE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse: async (dataItem: any) => {
    let sql = `         SELECT
                            ITEM_CATEGORY_ID
                            , ITEM_CATEGORY_NAME
                            , ITEM_CATEGORY_ALPHABET
                            , ITEM_CATEGORY_SHORT_NAME
                            , PURCHASE_MODULE_ID
                        FROM
                            ITEM_CATEGORY
                        WHERE
                                ITEM_CATEGORY_NAME LIKE '%dataItem.ITEM_CATEGORY_NAME%'
                            AND
                                (       PURCHASE_MODULE_ID = '1'
                                    OR
                                        PURCHASE_MODULE_ID = '2'
                                )
                            AND INUSE LIKE '%dataItem.INUSE%'
                        ORDER BY
                            ITEM_CATEGORY_NAME
                        LIMIT
                            50
                                            `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_NAME', dataItem['ITEM_CATEGORY_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('sql', sql)

    return sql
  },
  getAllByInuse: async (dataItem: any) => {
    let sql = `        SELECT
                        ITEM_CATEGORY_ID
                    , ITEM_CATEGORY_NAME
                    FROM
                    ITEM_CATEGORY
                    WHERE
                    INUSE = 'dataItem.INUSE'
                    ORDER BY
                    ITEM_CATEGORY_NAME
                                            `

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
}
