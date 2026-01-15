export const ItemSQL = {
  getByLikeItemCodeNameAndInuse: async (dataItem: any) => {
    let sql = `     SELECT
                          tb_1.ITEM_ID
                        , tb_1.ITEM_CATEGORY_ID
                        , tb_2.ITEM_CATEGORY_NAME
                        , tb_2.ITEM_CATEGORY_ALPHABET
                        , tb_2.ITEM_CATEGORY_SHORT_NAME
                        , tb_3.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_3.ITEM_INTERNAL_FULL_NAME
                        , tb_4.UNIT_OF_MEASUREMENT_NAME
                    FROM
                        ITEM tb_1
                    JOIN
                        ITEM_CATEGORY tb_2
                    ON
                        tb_1.ITEM_CATEGORY_ID = tb_2.ITEM_CATEGORY_ID
                    JOIN
                        ITEM_MANUFACTURING tb_3
                    ON
                        tb_1.ITEM_ID = tb_3.ITEM_ID
                    JOIN
                        UNIT_OF_MEASUREMENT tb_4
                    ON
                        tb_3.USAGE_UNIT_ID = tb_4.UNIT_OF_MEASUREMENT_ID
                    WHERE
                        tb_3.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE%'
                    LIMIT
                        300
                      ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_CODE', dataItem['ITEM_CODE'])

    return sql
  },
  getByLikeItemCodeNameAndInuse_NotFG: async (dataItem: any) => {
    let sql = `     SELECT
                          tb_1.ITEM_ID
                        , tb_1.ITEM_CATEGORY_ID
                        , tb_2.ITEM_CATEGORY_NAME
                        , tb_2.ITEM_CATEGORY_ALPHABET
                        , tb_2.ITEM_CATEGORY_SHORT_NAME
                        , tb_3.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_3.ITEM_INTERNAL_FULL_NAME
                        , tb_4.UNIT_OF_MEASUREMENT_NAME
                    FROM
                        ITEM tb_1
                    JOIN
                        ITEM_CATEGORY tb_2
                    ON
                        tb_1.ITEM_CATEGORY_ID = tb_2.ITEM_CATEGORY_ID
                    JOIN
                        ITEM_MANUFACTURING tb_3
                    ON
                        tb_1.ITEM_ID = tb_3.ITEM_ID
                    JOIN
                        UNIT_OF_MEASUREMENT tb_4
                    ON
                        tb_3.USAGE_UNIT_ID = tb_4.UNIT_OF_MEASUREMENT_ID
                    WHERE
                            tb_1.INUSE = 1
                        AND tb_3.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE%'
                        AND tb_2.ITEM_CATEGORY_ID <> 1
                    LIMIT
                        300
                      ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_CODE', dataItem['ITEM_CODE'])

    return sql
  },
  getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs: async (dataItem: any) => {
    let sql = `     SELECT
                          tb_1.ITEM_ID
                        , tb_1.ITEM_MANUFACTURING_ID
                        , tb_1.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_1.ITEM_INTERNAL_FULL_NAME
                        , tb_1.ITEM_INTERNAL_SHORT_NAME
                        , tb_1.PURCHASE_UNIT_RATIO
                        , tb_1.USAGE_UNIT_RATIO
                        , tb_4.UNIT_OF_MEASUREMENT_NAME AS PURCHASE_UNIT
                        , tb_3.UNIT_OF_MEASUREMENT_NAME AS USAGE_UNIT
                        , tb_4.UNIT_OF_MEASUREMENT_ID AS PURCHASE_UNIT_ID
                        , tb_3.UNIT_OF_MEASUREMENT_ID AS USAGE_UNIT_ID
                        , tb_4.SYMBOL as PURCHASE_UNIT_CODE
                        , tb_3.SYMBOL as USAGE_UNIT_CODE
                        , tb_1.VERSION_NO
                        , tb_5.ITEM_CATEGORY_NAME
                        , tb_5.ITEM_CATEGORY_ID
                    FROM
                        ITEM_MANUFACTURING tb_1
                    JOIN
                        ITEM tb_2
                    ON
                        tb_1.ITEM_ID = tb_2.ITEM_ID
                    JOIN
                        UNIT_OF_MEASUREMENT tb_3
                    ON
                        tb_1.USAGE_UNIT_ID = tb_3.UNIT_OF_MEASUREMENT_ID
                    JOIN
                        UNIT_OF_MEASUREMENT tb_4
                    ON
                        tb_1.PURCHASE_UNIT_ID = tb_4.UNIT_OF_MEASUREMENT_ID
                        JOIN
                        ITEM_CATEGORY tb_5
                    ON
                        tb_2.ITEM_CATEGORY_ID = tb_5.ITEM_CATEGORY_ID
                    WHERE
                            tb_1.INUSE = 1
                        AND tb_1.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE%'
                        AND tb_2.ITEM_CATEGORY_ID NOT IN (1,2,3)
                        AND tb_1.IS_CURRENT = 1
                    LIMIT
                        100
                      ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_CODE', dataItem['ITEM_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeItemCodeAndInuseAndNotFGSemiFGSubAsNoLimit: async () => {
    let sql = `     SELECT
                          tb_1.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_1.ITEM_INTERNAL_SHORT_NAME
                        , tb_1.ITEM_INTERNAL_FULL_NAME
                        , tb_1.PURCHASE_UNIT_RATIO
                        , tb_4.UNIT_OF_MEASUREMENT_NAME AS PURCHASE_UNIT
                        , tb_4.SYMBOL AS PURCHASE_UNIT_CODE
                        , tb_1.USAGE_UNIT_RATIO
                        , tb_3.UNIT_OF_MEASUREMENT_NAME AS USAGE_UNIT
                        , tb_3.SYMBOL AS USAGE_UNIT_CODE
                        , tb_1.ITEM_ID
                        , tb_1.ITEM_MANUFACTURING_ID
                        , tb_4.UNIT_OF_MEASUREMENT_ID AS PURCHASE_UNIT_ID
                        , tb_3.UNIT_OF_MEASUREMENT_ID AS USAGE_UNIT_ID
                        , tb_5.ITEM_CATEGORY_NAME
                        , tb_5.ITEM_CATEGORY_ID
                        , tb_1.VERSION_NO
                    FROM
                        ITEM_MANUFACTURING tb_1
                    JOIN
                        ITEM tb_2
                    ON
                        tb_1.ITEM_ID = tb_2.ITEM_ID
                    JOIN
                        UNIT_OF_MEASUREMENT tb_3
                    ON
                        tb_1.USAGE_UNIT_ID = tb_3.UNIT_OF_MEASUREMENT_ID
                    JOIN
                        UNIT_OF_MEASUREMENT tb_4
                    ON
                        tb_1.PURCHASE_UNIT_ID = tb_4.UNIT_OF_MEASUREMENT_ID
                        JOIN
                        ITEM_CATEGORY tb_5
                    ON
                        tb_2.ITEM_CATEGORY_ID = tb_5.ITEM_CATEGORY_ID
                    WHERE
                            tb_1.INUSE = 1
                            AND tb_1.IS_CURRENT = 1
                        AND tb_2.ITEM_CATEGORY_ID NOT IN (1,2,3)
                      ;
                    `

    return sql
  },
  getItemDetailByItemId: async (dataItem: { ITEM_ID: number }) => {
    let sql = `
            SELECT
                  tb_1.PURCHASE_UNIT_RATIO
                , tb_1.USAGE_UNIT_RATIO
                , tb_2.ITEM_IMPORT_TYPE_ID
                , tb_1.IS_CURRENT
            FROM
                ITEM_MANUFACTURING tb_1
                    INNER JOIN
                VENDOR tb_2
                    ON tb_1.VENDOR_ID = tb_2.VENDOR_ID
            WHERE
                    tb_1.ITEM_ID = 'dataItem.ITEM_ID'
          `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'].toString())

    return sql
  },
  getViewItemDataByItemId: async (dataItem: any) => {
    let sql = `
            SELECT
                  tb_3.ITEM_CATEGORY_NAME
                , tb_3.ITEM_CATEGORY_ID
                , tb_4.ITEM_PURPOSE_NAME
                , tb_4.ITEM_PURPOSE_ID
                , tb_5.VENDOR_ALPHABET
                , tb_5.VENDOR_NAME
                , tb_5.VENDOR_ID
                , tb_6.MAKER_NAME
                , tb_6.MAKER_ID
                , tb_7.ITEM_PROPERTY_COLOR_NAME
                , tb_7.ITEM_PROPERTY_COLOR_ID
                , tb_8.ITEM_PROPERTY_SHAPE_NAME
                , tb_8.ITEM_PROPERTY_SHAPE_ID
                , tb_9.UNIT_OF_MEASUREMENT_NAME AS PURCHASE_UNIT
                , tb_9.UNIT_OF_MEASUREMENT_ID AS PURCHASE_UNIT_ID
                , tb_10.UNIT_OF_MEASUREMENT_NAME AS USAGE_UNIT
                , tb_10.UNIT_OF_MEASUREMENT_ID AS USAGE_UNIT_ID
                , tb_1.PURCHASE_UNIT_RATIO
                , tb_1.USAGE_UNIT_RATIO
                , tb_1.ITEM_INTERNAL_CODE
                , tb_1.ITEM_INTERNAL_FULL_NAME
                , tb_1.ITEM_INTERNAL_SHORT_NAME
                , tb_1.ITEM_CODE_FOR_SUPPORT_MES
                , tb_1.ITEM_EXTERNAL_CODE
                , tb_1.ITEM_EXTERNAL_FULL_NAME
                , tb_1.ITEM_EXTERNAL_SHORT_NAME
                , tb_13.MOQ
                , tb_13.SAFETY_STOCK
                , tb_13.LEAD_TIME
                , tb_12.COLOR_NAME
                , tb_12.COLOR_ID
                , tb_1.INUSE
            FROM
                ITEM_MANUFACTURING tb_1
            JOIN
                ITEM tb_2
            ON
                tb_1.ITEM_ID = tb_2.ITEM_ID
            JOIN
                ITEM_CATEGORY tb_3
            ON
                tb_2.ITEM_CATEGORY_ID = tb_3.ITEM_CATEGORY_ID
            JOIN
                ITEM_PURPOSE tb_4
            ON
                tb_1.ITEM_PURPOSE_ID = tb_4.ITEM_PURPOSE_ID
            JOIN
                VENDOR tb_5
            ON
                tb_1.VENDOR_ID = tb_5.VENDOR_ID
            JOIN
                MAKER tb_6
            ON
                tb_1.MAKER_ID = tb_6.MAKER_ID
            LEFT JOIN
                ITEM_PROPERTY_COLOR tb_7
            ON
                tb_1.ITEM_PROPERTY_COLOR_ID = tb_7.ITEM_PROPERTY_COLOR_ID
            LEFT JOIN
                ITEM_PROPERTY_SHAPE tb_8
            ON
                tb_1.ITEM_PROPERTY_SHAPE_ID = tb_8.ITEM_PROPERTY_SHAPE_ID
            LEFT JOIN
                UNIT_OF_MEASUREMENT tb_9
            ON
                tb_1.PURCHASE_UNIT_ID = tb_9.UNIT_OF_MEASUREMENT_ID
            LEFT JOIN
                UNIT_OF_MEASUREMENT tb_10
            ON
                tb_1.USAGE_UNIT_ID = tb_10.UNIT_OF_MEASUREMENT_ID
            LEFT JOIN
                ITEM_THEME_COLOR tb_11
            ON
                tb_1.ITEM_ID = tb_11.ITEM_ID
            LEFT JOIN
                COLOR tb_12
            ON
                tb_11.COLOR_ID = tb_12.COLOR_ID
            LEFT JOIN
                ITEM_STOCK tb_13
            ON
                tb_1.ITEM_ID = tb_13.ITEM_ID
            WHERE
                    tb_1.ITEM_ID = 'dataItem.ITEM_ID'
                AND tb_1.INUSE = 1
          `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },

  CreateItemId: async () => {
    let sql = ' SET @itemId=(1 + coalesce((SELECT max(ITEM_ID) FROM ITEM), 0)) ; '
    return sql
  },
  createVersionNo: async (dataItem: { ITEM_CODE_FOR_SUPPORT_MES: string }) => {
    let sql = " SET @versionNo=(SELECT 1 + coalesce((SELECT max(VERSION_NO) FROM item_manufacturing  WHERE ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'), 0))"

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    return sql
  },
  createItem: async (dataItem: { ITEM_CATEGORY_ID: string; CREATE_BY: string }) => {
    let sql = `
      INSERT INTO ITEM
      (
                ITEM_ID
              , ITEM_CATEGORY_ID
              , CREATE_BY
              , UPDATE_DATE
              , UPDATE_BY
      )
      VALUES
      (
                 @itemId
              , 'dataItem.ITEM_CATEGORY_ID'
              , 'dataItem.CREATE_BY'
              ,  CURRENT_TIMESTAMP()
              , 'dataItem.CREATE_BY'
              ) ;

                                `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  createItemStockByItemIdVariable: async (dataItem: any) => {
    let sql = `
    INSERT INTO ITEM_STOCK
    (
              ITEM_STOCK_ID
            , ITEM_ID
            , MOQ
            , LEAD_TIME
            , SAFETY_STOCK
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
    )
    SELECT
              1 + coalesce((SELECT max(ITEM_STOCK_ID) FROM ITEM_STOCK), 0)
            ,  @itemId
            , dataItem.MOQ
            , dataItem.LEAD_TIME
            , dataItem.SAFETY_STOCK
            , 'dataItem.CREATE_BY'
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'

            `

    sql = sql.replaceAll('dataItem.MOQ', dataItem['MOQ'] != '' ? dataItem['MOQ'] : 'NULL')
    sql = sql.replaceAll('dataItem.LEAD_TIME', dataItem['LEAD_TIME'] != '' ? dataItem['LEAD_TIME'] : 'NULL')
    sql = sql.replaceAll('dataItem.SAFETY_STOCK', dataItem['SAFETY_STOCK'] != '' ? dataItem['SAFETY_STOCK'] : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    // console.log('createItemStockByItemIdVariable', sql)

    return sql
  },
  createItemStockByItemId: async (dataItem: any) => {
    let sql = `
    INSERT INTO ITEM_STOCK
    (
              ITEM_STOCK_ID
            , ITEM_ID
            , MOQ
            , LEAD_TIME
            , SAFETY_STOCK
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
    )
    SELECT
              1 + coalesce((SELECT max(ITEM_STOCK_ID) FROM ITEM_STOCK), 0)
            ,  'dataItem.ITEM_ID'
            , dataItem.MOQ
            , dataItem.LEAD_TIME
            , dataItem.SAFETY_STOCK
            , 'dataItem.CREATE_BY'
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'

            `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    sql = sql.replaceAll('dataItem.MOQ', dataItem['MOQ'] != '' ? dataItem['MOQ'] : 'NULL')
    sql = sql.replaceAll('dataItem.LEAD_TIME', dataItem['LEAD_TIME'] != '' ? dataItem['LEAD_TIME'] : 'NULL')
    sql = sql.replaceAll('dataItem.SAFETY_STOCK', dataItem['SAFETY_STOCK'] != '' ? dataItem['SAFETY_STOCK'] : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    // console.log('createItemStockByItemIdVariable', sql)

    return sql
  },
  createItemManufacturing: async (dataItem: {
    ITEM_CATEGORY_ID: number
    ITEM_PURPOSE_ID: number
    ITEM_GROUP_ID: number
    VENDOR_ID: number
    MAKER_ID: number
    ITEM_PROPERTY_COLOR_ID: number | ''
    ITEM_PROPERTY_SHAPE_ID: number | ''
    ITEM_PROPERTY_MADE_BY_ID: string
    ITEM_INTERNAL_CODE: string | null
    ITEM_INTERNAL_FULL_NAME: string
    ITEM_INTERNAL_SHORT_NAME: string
    ITEM_EXTERNAL_CODE: string
    ITEM_EXTERNAL_FULL_NAME: string
    ITEM_EXTERNAL_SHORT_NAME: string
    IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE: number
    PURCHASE_UNIT_RATIO: number
    USAGE_UNIT_RATIO: number
    PURCHASE_UNIT_ID: number
    USAGE_UNIT_ID: number
    WIDTH: number | ''
    HEIGHT: number | ''
    DEPTH: number | ''
    MOQ: number | ''
    LEAD_TIME: number | ''
    SAFETY_STOCK: number | ''

    COLOR_ID: number | ''
    ITEM_CODE_FOR_SUPPORT_MES: string
    CREATE_BY: string
    UPDATE_BY: string
    IMG_NUMBER: number
  }) => {
    let sql = `

    INSERT INTO ITEM_MANUFACTURING
    (
              ITEM_MANUFACTURING_ID
            , ITEM_ID
            , ITEM_PURPOSE_ID
            , ITEM_GROUP_ID
            , VENDOR_ID
            , MAKER_ID
            , WIDTH
            , HEIGHT
            , DEPTH
            , ITEM_PROPERTY_COLOR_ID
            , ITEM_PROPERTY_SHAPE_ID
            , ITEM_PROPERTY_MADE_BY_ID
            , IMAGE_PATH
            , ITEM_INTERNAL_CODE
            , ITEM_INTERNAL_FULL_NAME
            , ITEM_INTERNAL_SHORT_NAME
            , ITEM_EXTERNAL_CODE
            , ITEM_EXTERNAL_FULL_NAME
            , ITEM_EXTERNAL_SHORT_NAME
            , IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE
            , ITEM_CODE_FOR_SUPPORT_MES
            , PURCHASE_UNIT_ID
            , PURCHASE_UNIT_RATIO
            , USAGE_UNIT_RATIO
            , USAGE_UNIT_ID
            , CREATE_BY
            , DEFAULT_IMG_PATH
            , IMG_NUMBER
            , UPDATE_DATE
            , UPDATE_BY
            , VERSION_NO
            , IS_CURRENT
    )
    SELECT
              1 + coalesce((SELECT max(ITEM_MANUFACTURING_ID) FROM ITEM_MANUFACTURING), 0)
            ,  @itemId
            , 'dataItem.ITEM_PURPOSE_ID'
            , 'dataItem.ITEM_GROUP_ID'
            , 'dataItem.VENDOR_ID'
            , 'dataItem.MAKER_ID'
            , dataItem.WIDTH
            , dataItem.HEIGHT
            , dataItem.DEPTH
            , dataItem.ITEM_PROPERTY_COLOR_ID
            , dataItem.ITEM_PROPERTY_SHAPE_ID
            , dataItem.ITEM_PROPERTY_MADE_BY_ID
            , null
            , null
            , 'dataItem.ITEM_INTERNAL_FULL_NAME'
            , dataItem.ITEM_INTERNAL_SHORT_NAME
            , 'dataItem.ITEM_EXTERNAL_CODE'
            , 'dataItem.ITEM_EXTERNAL_FULL_NAME'
            , 'dataItem.ITEM_EXTERNAL_SHORT_NAME'
            , 'dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE'
            , 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
            , 'dataItem.PURCHASE_UNIT_ID'
            , 'dataItem.PURCHASE_UNIT_RATIO'
            , 'dataItem.USAGE_UNIT_RATIO'
            , 'dataItem.USAGE_UNIT_ID'
            , 'dataItem.CREATE_BY'
            , null
            , dataItem.IMG_NUMBER
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'
            , @versionNo
            , 1

                              `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'].toString())
    sql = sql.replaceAll('dataItem.ITEM_PURPOSE_ID', dataItem['ITEM_PURPOSE_ID'].toString())
    sql = sql.replaceAll('dataItem.ITEM_GROUP_ID', dataItem['ITEM_GROUP_ID'].toString())
    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'].toString())
    sql = sql.replaceAll('dataItem.MAKER_ID', dataItem['MAKER_ID'].toString())

    sql = sql.replaceAll('dataItem.WIDTH', dataItem['WIDTH'] ? dataItem['WIDTH'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.HEIGHT', dataItem['HEIGHT'] ? dataItem['HEIGHT'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.DEPTH', dataItem['DEPTH'] ? dataItem['DEPTH'].toString() : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_ID', dataItem['ITEM_PROPERTY_COLOR_ID'] ? dataItem['ITEM_PROPERTY_COLOR_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_ID', dataItem['ITEM_PROPERTY_SHAPE_ID'] ? dataItem['ITEM_PROPERTY_SHAPE_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_MADE_BY_ID', dataItem['ITEM_PROPERTY_MADE_BY_ID'] ? dataItem['ITEM_PROPERTY_MADE_BY_ID'].toString() : 'NULL')

    // sql = sql.replaceAll('dataItem.IMAGE_PATH', dataItem['IMAGE_PATH'] ? "'" + dataItem['IMAGE_PATH'].toString() + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.IMG_NUMBER', dataItem['IMG_NUMBER'].toString())
    // sql = sql.replaceAll('dataItem.DEFAULT_IMG_PATH', dataItem['DEFAULT_IMG_PATH'] != '' ? "'" + dataItem['DEFAULT_IMG_PATH'] + "'" : 'NULL')

    // sql = sql.replaceAll('dataItem.ITEM_INTERNAL_CODE', )
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'] != '' ? "'" + dataItem['ITEM_INTERNAL_SHORT_NAME'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_CODE', dataItem['ITEM_EXTERNAL_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_FULL_NAME', dataItem['ITEM_EXTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_SHORT_NAME', dataItem['ITEM_EXTERNAL_SHORT_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])

    // sql = sql.replaceAll('dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE', dataItem['IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE'])
    sql = sql.replaceAll('dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE', '0')

    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_ID', dataItem['PURCHASE_UNIT_ID'].toString())
    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_RATIO', dataItem['PURCHASE_UNIT_RATIO'].toString())
    sql = sql.replaceAll('dataItem.USAGE_UNIT_RATIO', dataItem['USAGE_UNIT_RATIO'].toString())
    sql = sql.replaceAll('dataItem.USAGE_UNIT_ID', dataItem['USAGE_UNIT_ID'].toString())

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  getDefaultImagePath: async (dataItem: any) => {
    let sql = `
                SELECT
                        DEFAULT_IMG_PATH
                FROM
                        ITEM_MANUFACTURING
                WHERE
                        ITEM_ID = 'dataItem.ITEM_ID'
    `
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    return sql
  },
  getAll: async (dataItem: any, sqlWhereForCount: string = '') => {
    let sqlList = []

    let sql = `         SELECT
                                  COUNT(*) AS TOTAL_COUNT
                        FROM
                                dataItem.sqlJoin
                                dataItem.sqlWhere

                                dataItem.sqlWhereForCount`

    sql = sql.replaceAll('dataItem.sqlWhereForCount', sqlWhereForCount)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.inuseForSearch', dataItem.SearchFilters.find((dataItem: any) => dataItem?.id == 'inuseForSearch')?.value)

    sqlList.push(sql)

    sql = `
            SELECT
                  tb_3.ITEM_ID
                , tb_3.ITEM_CODE_FOR_SUPPORT_MES
                , tb_1.ITEM_CATEGORY_ID
                , tb_2.ITEM_CATEGORY_NAME
                , tb_3.ITEM_INTERNAL_FULL_NAME
                , tb_3.ITEM_INTERNAL_SHORT_NAME
                , tb_3.ITEM_EXTERNAL_CODE
                , tb_3.ITEM_EXTERNAL_FULL_NAME
                , tb_3.ITEM_EXTERNAL_SHORT_NAME
                , tb_3.ITEM_PURPOSE_ID
                , tb_4.ITEM_PURPOSE_NAME
                , tb_3.ITEM_GROUP_ID
                , tb_5.ITEM_GROUP_NAME
                , tb_3.VENDOR_ID
                , tb_6.VENDOR_ALPHABET
                , tb_6.VENDOR_NAME
                , tb_3.USAGE_UNIT_RATIO
                , tb_26.MOQ
                , tb_26.LEAD_TIME
                , tb_26.SAFETY_STOCK
                , tb_3.WIDTH
                , tb_3.HEIGHT
                , tb_3.DEPTH
                , tb_3.ITEM_PROPERTY_COLOR_ID
                , tb_8.ITEM_PROPERTY_COLOR_NAME
                , tb_25.COLOR_ID
                , tb_25.COLOR_HEX
                , tb_25.COLOR_NAME
                , tb_3.ITEM_PROPERTY_SHAPE_ID
                , tb_9.ITEM_PROPERTY_SHAPE_NAME
                , tb_3.UPDATE_BY
                , DATE_FORMAT(tb_3.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                , tb_3.IMAGE_PATH
                , tb_3.IMG_NUMBER
                , tb_3.DEFAULT_IMG_PATH
                , tb_3.ITEM_PROPERTY_MADE_BY_ID
                , tb_10.ITEM_PROPERTY_MADE_BY_NAME
                , tb_3.USAGE_UNIT_ID
                , tb_3.PURCHASE_UNIT_ID
                , tb_20.SYMBOL AS USAGE_UNIT_NAME
                , tb_23.SYMBOL AS PURCHASE_UNIT_NAME
                , tb_3.PURCHASE_UNIT_RATIO
                , tb_20.SYMBOL AS USAGE_UNIT_SYMBOL
                , tb_23.SYMBOL AS PURCHASE_UNIT_SYMBOL
                , tb_3.ITEM_INTERNAL_CODE
                , tb_3.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE
                , tb_2.ITEM_CATEGORY_ALPHABET
                , tb_2.PURCHASE_MODULE_ID
                , tb_3.MAKER_ID
                , tb_7.MAKER_NAME
                , dataItem.selectInuseForSearch
                , tb_1.INUSE AS INUSE_RAW_DATA

                , tb_3.VERSION_NO
                , tb_3.IS_CURRENT

            FROM
                        dataItem.sqlJoin
                        dataItem.sqlWhere
                        dataItem.sqlHaving

             ORDER BY
                            dataItem.Order
             LIMIT
                            dataItem.Start
                           ,dataItem.Limit;
`

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)
    // console.log('sql', sql)

    return sqlList
  },
  getAllUnlimit: async (dataItem: any) => {
    let sql = `

            SELECT
                            COUNT(*) AS TOTAL_COUNT
              FROM (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT;

            SELECT
                  tb_3.ITEM_ID
                , tb_3.ITEM_CODE_FOR_SUPPORT_MES
                , tb_1.ITEM_CATEGORY_ID
                , tb_2.ITEM_CATEGORY_NAME
                , tb_3.ITEM_INTERNAL_FULL_NAME
                , tb_3.ITEM_INTERNAL_SHORT_NAME
                , tb_3.ITEM_EXTERNAL_CODE
                , tb_3.ITEM_EXTERNAL_FULL_NAME
                , tb_3.ITEM_EXTERNAL_SHORT_NAME
                , tb_3.ITEM_PURPOSE_ID
                , tb_4.ITEM_PURPOSE_NAME
                , tb_3.ITEM_GROUP_ID
                , tb_5.ITEM_GROUP_NAME
                , tb_3.VENDOR_ID
                , tb_6.VENDOR_ALPHABET
                , tb_6.VENDOR_NAME
                , tb_3.USAGE_UNIT_RATIO
                , tb_26.MOQ
                , tb_26.LEAD_TIME
                , tb_26.SAFETY_STOCK
                , tb_3.WIDTH
                , tb_3.HEIGHT
                , tb_3.DEPTH
                , tb_3.ITEM_PROPERTY_COLOR_ID
                , tb_8.ITEM_PROPERTY_COLOR_NAME
                , tb_25.COLOR_ID
                , tb_25.COLOR_HEX
                , tb_25.COLOR_NAME
                , tb_3.ITEM_PROPERTY_SHAPE_ID
                , tb_9.ITEM_PROPERTY_SHAPE_NAME
                , tb_11.CUSTOMER_ORDER_FROM_ID
                , tb_17.CUSTOMER_ORDER_FROM_ALPHABET
                , tb_3.UPDATE_BY
                , DATE_FORMAT(tb_3.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                , tb_3.IMAGE_PATH
                , tb_3.IMG_NUMBER
                , tb_3.DEFAULT_IMG_PATH

                , tb_3.ITEM_PROPERTY_MADE_BY_ID
                , tb_10.ITEM_PROPERTY_MADE_BY_NAME
                , tb_3.USAGE_UNIT_ID
                , tb_3.PURCHASE_UNIT_ID
                , tb_23.SYMBOL AS PURCHASE_UNIT_NAME
                , tb_3.PURCHASE_UNIT_RATIO
                , tb_20.SYMBOL AS USAGE_UNIT_NAME
                , tb_23.SYMBOL AS PURCHASE_UNIT_NAME
                , tb_3.ITEM_INTERNAL_CODE
                , tb_3.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE
                , tb_2.ITEM_CATEGORY_ALPHABET
                , tb_2.PURCHASE_MODULE_ID
                , tb_3.MAKER_ID
                , tb_7.MAKER_NAME
                , tb_11.ITEM_PRODUCT_DETAIL_ID
                , tb_18.PRODUCT_CATEGORY_ID
                , tb_19.PRODUCT_CATEGORY_NAME
                , tb_13.PRODUCT_MAIN_ID
                , tb_18.PRODUCT_MAIN_NAME
                , tb_18.PRODUCT_MAIN_ALPHABET
                , tb_12.PRODUCT_SUB_ID
                , tb_13.PRODUCT_SUB_NAME
                , tb_11.PRODUCT_TYPE_ID
                , tb_12.PRODUCT_TYPE_NAME
                , tb_11.WORK_ORDER_ID
                , tb_14.WORK_ORDER_CODE
                , tb_11.PART_NO_ID
                , tb_15.PART_NO_CODE
                , tb_11.SPECIFICATION_ID
                , tb_16.SPECIFICATION_CODE
                , dataItem.selectInuseForSearch
                , tb_1.INUSE AS INUSE_RAW_DATA

FROM
                        dataItem.sqlJoin


                        dataItem.sqlWhere
                        dataItem.sqlHaving

                 ORDER BY
                            dataItem.Order

                ;
`

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    //console.log('sql', sql)

    return sql
  },
  updateItemManufacturing: async (dataItem: any) => {
    let sql = `
                UPDATE
                            ITEM_MANUFACTURING
                SET
                            WIDTH = dataItem.WIDTH
                           ,HEIGHT = dataItem.HEIGHT
                           ,DEPTH = dataItem.DEPTH

                           ,ITEM_PROPERTY_COLOR_ID = dataItem.ITEM_PROPERTY_COLOR_ID
                           ,ITEM_PROPERTY_SHAPE_ID = dataItem.ITEM_PROPERTY_SHAPE_ID
                           ,ITEM_PROPERTY_MADE_BY_ID = dataItem.ITEM_PROPERTY_MADE_BY_ID

                           ,ITEM_INTERNAL_CODE = dataItem.ITEM_INTERNAL_CODE
                           ,ITEM_INTERNAL_FULL_NAME = 'dataItem.ITEM_INTERNAL_FULL_NAME'
                           ,ITEM_INTERNAL_SHORT_NAME = dataItem.ITEM_INTERNAL_SHORT_NAME
                           ,ITEM_EXTERNAL_CODE = 'dataItem.ITEM_EXTERNAL_CODE'
                           ,ITEM_EXTERNAL_FULL_NAME = 'dataItem.ITEM_EXTERNAL_FULL_NAME'
                           ,ITEM_EXTERNAL_SHORT_NAME = 'dataItem.ITEM_EXTERNAL_SHORT_NAME'
                           ,IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE = 'dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE'
                           ,ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'

                           ,PURCHASE_UNIT_ID = 'dataItem.PURCHASE_UNIT_ID'
                           ,PURCHASE_UNIT_RATIO = 'dataItem.PURCHASE_UNIT_RATIO'
                           ,USAGE_UNIT_RATIO = 'dataItem.USAGE_UNIT_RATIO'
                           ,USAGE_UNIT_ID = 'dataItem.USAGE_UNIT_ID'

                           ,UPDATE_DATE = CURRENT_TIMESTAMP()
                           ,UPDATE_BY = 'dataItem.CREATE_BY'
                    WHERE
                            ITEM_ID = 'dataItem.ITEM_ID'`

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.WIDTH', dataItem['WIDTH'] ? dataItem['WIDTH'] : 'NULL')
    sql = sql.replaceAll('dataItem.HEIGHT', dataItem['HEIGHT'] ? dataItem['HEIGHT'] : 'NULL')
    sql = sql.replaceAll('dataItem.DEPTH', dataItem['DEPTH'] ? dataItem['DEPTH'] : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_ID', dataItem['ITEM_PROPERTY_COLOR_ID'] != '' ? dataItem['ITEM_PROPERTY_COLOR_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_ID', dataItem['ITEM_PROPERTY_SHAPE_ID'] != '' ? dataItem['ITEM_PROPERTY_SHAPE_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_MADE_BY_ID', dataItem['ITEM_PROPERTY_MADE_BY_ID'] != '' ? dataItem['ITEM_PROPERTY_MADE_BY_ID'] : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_CODE', dataItem['ITEM_INTERNAL_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'] != '' ? "'" + dataItem['ITEM_INTERNAL_SHORT_NAME'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_CODE', dataItem['ITEM_EXTERNAL_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_FULL_NAME', dataItem['ITEM_EXTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_SHORT_NAME', dataItem['ITEM_EXTERNAL_SHORT_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])

    sql = sql.replaceAll('dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE', '0')

    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_ID', dataItem['PURCHASE_UNIT_ID'])
    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_RATIO', dataItem['PURCHASE_UNIT_RATIO'])
    sql = sql.replaceAll('dataItem.USAGE_UNIT_RATIO', dataItem['USAGE_UNIT_RATIO'])
    sql = sql.replaceAll('dataItem.USAGE_UNIT_ID', dataItem['USAGE_UNIT_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log(sql)

    return sql
  },

  updateProperty: async (dataItem: any) => {
    let sql = `
                UPDATE
                            ITEM_MANUFACTURING
                SET
                            WIDTH = dataItem.WIDTH
                           ,HEIGHT = dataItem.HEIGHT
                           ,DEPTH = dataItem.DEPTH

                           ,ITEM_PROPERTY_COLOR_ID = dataItem.ITEM_PROPERTY_COLOR_ID
                           ,ITEM_PROPERTY_SHAPE_ID = dataItem.ITEM_PROPERTY_SHAPE_ID
                           ,ITEM_PROPERTY_MADE_BY_ID = dataItem.ITEM_PROPERTY_MADE_BY_ID

                           ,UPDATE_DATE = CURRENT_TIMESTAMP()
                           ,UPDATE_BY = 'dataItem.CREATE_BY'
                    WHERE
                            ITEM_ID = 'dataItem.ITEM_ID'`

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.WIDTH', dataItem['WIDTH'] ? dataItem['WIDTH'] : 'NULL')
    sql = sql.replaceAll('dataItem.HEIGHT', dataItem['HEIGHT'] ? dataItem['HEIGHT'] : 'NULL')
    sql = sql.replaceAll('dataItem.DEPTH', dataItem['DEPTH'] ? dataItem['DEPTH'] : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_ID', dataItem['ITEM_PROPERTY_COLOR_ID'] != '' ? dataItem['ITEM_PROPERTY_COLOR_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_ID', dataItem['ITEM_PROPERTY_SHAPE_ID'] != '' ? dataItem['ITEM_PROPERTY_SHAPE_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_MADE_BY_ID', dataItem['ITEM_PROPERTY_MADE_BY_ID'] != '' ? dataItem['ITEM_PROPERTY_MADE_BY_ID'] : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  updateImgItemManufacturing: async (dataItem: any) => {
    let sql = `
                UPDATE
                            ITEM_MANUFACTURING
                SET
                            IMAGE_PATH = 'dataItem.IMAGE_PATH'
                           ,DEFAULT_IMG_PATH = 'dataItem.DEFAULT_IMG_PATH'
                           ,IMG_NUMBER = dataItem.IMG_NUMBER
                    WHERE
                            ITEM_ID = 'dataItem.ITEM_ID'`

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.IMAGE_PATH', dataItem['IMAGE_PATH'])
    sql = sql.replaceAll('dataItem.IMG_NUMBER', dataItem['IMG_NUMBER'])
    sql = sql.replaceAll('dataItem.DEFAULT_IMG_PATH', dataItem['DEFAULT_IMG_PATH'])

    // console.log(sql)

    return sql
  },
  updateNoImgItemManufacturing: async (dataItem: any) => {
    let sql = `
                UPDATE
                            ITEM_MANUFACTURING
                SET
                            IMAGE_PATH = null
                           ,DEFAULT_IMG_PATH = null
                           ,IMG_NUMBER = 0
                    WHERE
                            ITEM_ID = 'dataItem.ITEM_ID'`

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    // console.log(sql)

    return sql
  },
  upDateItemStockByItemIdVariable: async (dataItem: any) => {
    let sql = `
                    UPDATE
                            ITEM_STOCK
                    SET
                              MOQ = dataItem.MOQ
                            , LEAD_TIME = dataItem.LEAD_TIME
                            , SAFETY_STOCK = dataItem.SAFETY_STOCK
                            , CREATE_BY = 'dataItem.CREATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                            , UPDATE_BY = 'dataItem.CREATE_BY'
                    WHERE
                            ITEM_ID = 'dataItem.ITEM_ID'`

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.MOQ', dataItem['MOQ'] != '' ? dataItem['MOQ'] : 'NULL')
    sql = sql.replaceAll('dataItem.LEAD_TIME', dataItem['LEAD_TIME'] != '' ? dataItem['LEAD_TIME'] : 'NULL')
    sql = sql.replaceAll('dataItem.SAFETY_STOCK', dataItem['SAFETY_STOCK'] != '' ? dataItem['SAFETY_STOCK'] : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  deleteItem: async (dataItem: any) => {
    let sql = `    UPDATE
                              ITEM
                          SET
                                INUSE = '0'
                              , UPDATE_BY = 'dataItem.UPDATE_BY'
                              , UPDATE_DATE = CURRENT_TIMESTAMP()
                          WHERE
                              ITEM_ID = 'dataItem.ITEM_ID' ;
                        `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteItemManufacturing: async (dataItem: any) => {
    let sql = `         UPDATE
                                ITEM_MANUFACTURING
                        SET
                                INUSE = '0'
                              , UPDATE_BY = 'dataItem.UPDATE_BY'
                              , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                              ITEM_ID = 'dataItem.ITEM_ID' ;
                      `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteItemStock: async (dataItem: any) => {
    let sql = `         UPDATE
                                ITEM_STOCK
                        SET
                                INUSE = '0'
                              , UPDATE_BY = 'dataItem.UPDATE_BY'
                              , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                              ITEM_ID = 'dataItem.ITEM_ID' ;
                      `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  updateIsCurrent: async (dataItem: any) => {
    let sql = `         UPDATE
                                ITEM_MANUFACTURING
                        SET
                                IS_CURRENT = '0'
                              , UPDATE_BY = 'dataItem.UPDATE_BY'
                              , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                  ITEM_ID = 'dataItem.ITEM_ID'
                              AND IS_CURRENT = '1'
                      `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  updateInuseByItemCodeForSupportMes: async (dataItem: any) => {
    let sql = `         UPDATE
                                ITEM_MANUFACTURING
                        SET
                                INUSE = '0'
                              , UPDATE_BY = 'dataItem.UPDATE_BY'
                              , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                  ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
                              AND INUSE = '1'
                      `

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  updateIsCurrentByItemCodeForSupportMes: async (dataItem: any) => {
    let sql = `         UPDATE
                                ITEM_MANUFACTURING
                        SET
                                IS_CURRENT = '0'
                              , UPDATE_BY = 'dataItem.UPDATE_BY'
                              , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                  ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
                              AND IS_CURRENT = '1'
                      `

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  createItemByProcedure: async () => {
    let sql = 'call generate_item_internal_code(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    return sql
  },
  getItemPriceByItemIdAndFiscalYear: async (dataItem: any) => {
    let sql = `
        SELECT
            COUNT(*) AS TOTAL_COUNT
        FROM
            ITEM_M_O_PRICE tb_1
                JOIN
            ITEM_M_S_PRICE tb_2
                ON
            tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
                JOIN
            UNIT_OF_MEASUREMENT tb_3
                ON
            tb_2.PURCHASE_UNIT_ID = tb_3.UNIT_OF_MEASUREMENT_ID
                JOIN
            UNIT_OF_MEASUREMENT tb_4
                ON
            tb_2.USAGE_UNIT_ID = tb_4.UNIT_OF_MEASUREMENT_ID
        WHERE
                tb_1.ITEM_ID = 'dataItem.ITEM_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND tb_1.INUSE = 1;

        SELECT
              tb_1.FISCAL_YEAR
            , tb_2.VERSION
            , tb_2.ITEM_M_S_PRICE_VALUE
            , tb_2.PURCHASE_UNIT_RATIO
            , tb_2.USAGE_UNIT_RATIO
            , tb_3.SYMBOL AS PURCHASE_UNIT
            , tb_4.SYMBOL AS USAGE_UNIT
        FROM
            ITEM_M_O_PRICE tb_1
                JOIN
            ITEM_M_S_PRICE tb_2
                ON
            tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
                JOIN
            UNIT_OF_MEASUREMENT tb_3
                ON
            tb_2.PURCHASE_UNIT_ID = tb_3.UNIT_OF_MEASUREMENT_ID
                JOIN
            UNIT_OF_MEASUREMENT tb_4
                ON
            tb_2.USAGE_UNIT_ID = tb_4.UNIT_OF_MEASUREMENT_ID
        WHERE
                tb_1.ITEM_ID = 'dataItem.ITEM_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND tb_1.INUSE = 1
        ORDER BY
            tb_2.UPDATE_DATE DESC
        LIMIT
            dataItem.Start, dataItem.Limit
        `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    return sql
  },
  getByItemCodeAndInuse: async (dataItem: any) => {
    let sql = `
            SELECT
                ITEM_CODE_FOR_SUPPORT_MES
            FROM
                ITEM_MANUFACTURING
            WHERE
                    ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
                AND INUSE = 'dataItem.INUSE'
          `

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getAllListInuse: async () => {
    let sql = `
            SELECT
                ITEM_CODE_FOR_SUPPORT_MES
            FROM
                ITEM_MANUFACTURING
            WHERE
                INUSE = 1
          `
    return sql
  },

  getByLikeItemCodeByLike: async (dataItem: any) => {
    let sql = `     SELECT
                          tb_1.ITEM_ID
                        , tb_1.ITEM_MANUFACTURING_ID
                        , tb_1.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_3.BOM_NAME
                        , tb_3.BOM_CODE
                        , tb_3.BOM_ID
                        , tb_8.ITEM_CATEGORY_ID
                    FROM
                        ITEM_MANUFACTURING tb_1
                    INNER JOIN
                        bom_flow_process_item_usage tb_2
                    ON
                        tb_1.ITEM_ID = tb_2.ITEM_ID AND tb_2.INUSE = 1
                    LEFT JOIN
                        BOM tb_3
                    ON
                        tb_2.BOM_ID = tb_3.BOM_ID AND tb_3.INUSE = 1
                    LEFT JOIN
                        PRODUCT_MAIN tb_4
                    ON
                        tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID AND tb_4.INUSE = 1
                    LEFT JOIN
                    	PRODUCT_SUB tb_5
                    on tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID AND tb_5.INUSE = 1
                    LEFT JOIN
                    	PRODUCT_TYPE tb_6
                    on tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID AND tb_6.INUSE = 1
                    LEFT JOIN
                    	product_type_bom tb_7
                    on tb_6.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID AND tb_7.INUSE = 1
                    LEFT JOIN
                    	ITEM tb_8
                    on tb_1.ITEM_ID = tb_8.ITEM_ID AND tb_8.INUSE = 1

                    WHERE
                            tb_1.INUSE = 1
                        AND tb_1.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE%'
                        AND tb_3.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                        AND tb_8.ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID'

                    GROUP BY tb_1.ITEM_CODE_FOR_SUPPORT_MES
                    LIMIT
                        50
                      ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_CODE', dataItem['ITEM_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log(sql)

    return sql
  },
  getByLikeItemCodeByLikeAndBOMId: async (dataItem: any) => {
    let sql = `     SELECT
                          tb_1.ITEM_ID
                        , tb_1.ITEM_MANUFACTURING_ID
                        , tb_1.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_3.BOM_NAME
                        , tb_3.BOM_CODE
                        , tb_3.BOM_ID
                        , tb_8.ITEM_CATEGORY_ID
                    FROM
                        ITEM_MANUFACTURING tb_1
                    INNER JOIN
                        bom_flow_process_item_usage tb_2
                    ON
                        tb_1.ITEM_ID = tb_2.ITEM_ID AND tb_1.INUSE = 1 AND tb_2.INUSE = 1
                    LEFT JOIN
                        BOM tb_3
                    ON
                        tb_2.BOM_ID = tb_3.BOM_ID AND tb_3.INUSE = 1
                    LEFT JOIN
                        PRODUCT_MAIN tb_4
                    ON
                        tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID AND tb_4.INUSE = 1
                    LEFT JOIN
                    	PRODUCT_SUB tb_5
                    on tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID AND tb_5.INUSE = 1
                    LEFT JOIN
                    	PRODUCT_TYPE tb_6
                    on tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID AND tb_6.INUSE = 1
                    LEFT JOIN
                    	product_type_bom tb_7
                    on tb_6.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID AND tb_7.INUSE = 1
                     LEFT JOIN
                    	ITEM tb_8
                    on tb_1.ITEM_ID = tb_8.ITEM_ID AND tb_8.INUSE = 1

                    WHERE
                            tb_1.INUSE = 1
                        AND tb_1.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE%'
                        AND tb_3.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                        AND tb_3.BOM_ID = 'dataItem.BOM_ID'
                        AND tb_8.ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID'

                    GROUP BY tb_1.ITEM_CODE_FOR_SUPPORT_MES
                    LIMIT
                        50
                      ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_CODE', dataItem['ITEM_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getByLikeItemCodeAll: async (dataItem: any) => {
    let sql = `     SELECT
                              tb_1.ITEM_ID
                            , tb_1.ITEM_INTERNAL_CODE
                            , tb_1.ITEM_INTERNAL_FULL_NAME
                            , tb_1.ITEM_CODE_FOR_SUPPORT_MES
                            , tb_2.SYMBOL AS USAGE_UNIT_SYMBOL
                            , tb_4.ITEM_CATEGORY_ID
                      FROM
                            ITEM_MANUFACTURING tb_1
                            INNER JOIN
                                UNIT_OF_MEASUREMENT tb_2
                            ON
                                tb_2.UNIT_OF_MEASUREMENT_ID = tb_1.USAGE_UNIT_ID
                            INNER JOIN
                                ITEM tb_3
                            ON
                                tb_3.ITEM_ID = tb_1.ITEM_ID
                            INNER JOIN
                                ITEM_CATEGORY tb_4
                            ON
                                tb_4.ITEM_CATEGORY_ID = tb_3.ITEM_CATEGORY_ID

                      WHERE
                            tb_1.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE_FOR_SUPPORT_MES%'
                      AND
                            tb_1.INUSE = 1
                            AND
                            tb_4.ITEM_CATEGORY_ID IN (4,5,6)

                      ORDER BY
                            tb_1.ITEM_CODE_FOR_SUPPORT_MES
                      LIMIT
                            50
                      ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log(sql)

    return sql
  },
  getByLikeItemCodeAndProductMain: async (dataItem: any) => {
    let sql = `     SELECT
                          tb_1.ITEM_ID
                        , tb_1.ITEM_MANUFACTURING_ID
                        , tb_1.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_3.BOM_NAME
                        , tb_3.BOM_CODE
                        , tb_3.BOM_ID
                        , tb_8.ITEM_CATEGORY_ID
                    FROM
                        ITEM_MANUFACTURING tb_1
                    INNER JOIN
                        bom_flow_process_item_usage tb_2
                    ON
                        tb_1.ITEM_ID = tb_2.ITEM_ID AND tb_1.INUSE = 1 AND tb_2.INUSE = 1
                    LEFT JOIN
                        BOM tb_3
                    ON
                        tb_2.BOM_ID = tb_3.BOM_ID AND tb_3.INUSE = 1
                    LEFT JOIN
                        PRODUCT_MAIN tb_4
                    ON
                        tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID AND tb_4.INUSE = 1
                    LEFT JOIN
                    	PRODUCT_SUB tb_5
                    on tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID AND tb_5.INUSE = 1
                    LEFT JOIN
                    	PRODUCT_TYPE tb_6
                    on tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID AND tb_6.INUSE = 1
                    LEFT JOIN
                    	product_type_bom tb_7
                    on tb_6.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID AND tb_7.INUSE = 1
                     LEFT JOIN
                    	ITEM tb_8
                    on tb_1.ITEM_ID = tb_8.ITEM_ID AND tb_8.INUSE = 1

                    WHERE
                            tb_1.INUSE = 1
                        AND tb_1.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE%'
                        AND tb_3.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'


                    GROUP BY tb_1.ITEM_CODE_FOR_SUPPORT_MES
                    LIMIT
                        50
                      ;
                    `

    sql = sql.replaceAll('dataItem.ITEM_CODE', dataItem['ITEM_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  getByLikeItemCode: async (dataItem: any, sqlWhere: any) => {
    let sql = `     SELECT
                          tb_1.ITEM_ID
                        , tb_1.ITEM_MANUFACTURING_ID
                        , tb_1.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_8.ITEM_CATEGORY_ID
                    FROM
                        ITEM_MANUFACTURING tb_1
                     LEFT JOIN
                    	ITEM tb_8
                    on tb_1.ITEM_ID = tb_8.ITEM_ID AND tb_8.INUSE = 1

                    WHERE
                            tb_1.INUSE = 1
                        AND tb_1.ITEM_CODE_FOR_SUPPORT_MES LIKE '%dataItem.ITEM_CODE%'
                        dataItem.sqlWhere

                    GROUP BY tb_1.ITEM_CODE_FOR_SUPPORT_MES
                    LIMIT
                        50
                      ;
                    `
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sql = sql.replaceAll('dataItem.ITEM_CODE', dataItem['ITEM_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getItemDetailByItemCode: async (dataItem: { ITEM_CODE_FOR_SUPPORT_MES: string }) => {
    let sql = `
            SELECT
                  tb_1.PURCHASE_UNIT_RATIO
                , tb_1.USAGE_UNIT_RATIO
                , tb_2.ITEM_IMPORT_TYPE_ID
                , tb_1.IS_CURRENT
            FROM
                ITEM_MANUFACTURING tb_1
                    INNER JOIN
                VENDOR tb_2
                    ON tb_1.VENDOR_ID = tb_2.VENDOR_ID
            WHERE
                    tb_1.ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
                AND tb_1.INUSE = 1
                AND tb_1.IS_CURRENT = 1
          `

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])

    return sql
  },
}
