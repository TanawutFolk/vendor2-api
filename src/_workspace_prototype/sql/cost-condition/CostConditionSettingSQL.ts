export const CostConditionSettingSQL = {
  search: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        cost_condition_setting tb_1
                    LEFT JOIN
                        PRODUCT_TYPE tb_2 ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                    LEFT JOIN
                        PRODUCT_SUB tb_3 ON tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                    LEFT JOIN
                        PRODUCT_MAIN tb_4 ON tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                    LEFT JOIN
                        PRODUCT_CATEGORY tb_5 ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                    LEFT JOIN
                        PRODUCT_TYPE_ITEM_CATEGORY tb_6 ON tb_2.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID AND tb_6.INUSE = 1
                    LEFT JOIN
                        ITEM_CATEGORY tb_7 ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
                    LEFT JOIN
                        PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_8 ON tb_2.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID AND tb_8.INUSE = 1
                    LEFT JOIN
                        CUSTOMER_INVOICE_TO tb_9 ON tb_8.CUSTOMER_INVOICE_TO_ID = tb_9.CUSTOMER_INVOICE_TO_ID
                    WHERE
                        1 = 1
                        sqlWhere
                        sqlWhereColumnFilter `

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('sqlWhere', sqlWhere)

    sqlList.push(sql)

    sql = `
                SELECT
                      tb_1.COST_CONDITION_SETTING_ID
                    , tb_1.INUSE AS COST_CONDITION_SETTING_INUSE
                    , tb_1.PRODUCT_TYPE_ID
                    , tb_2.INUSE AS PRODUCT_TYPE_INUSE
                    , tb_2.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                    , tb_2.PRODUCT_TYPE_NAME
                    , tb_2.PRODUCT_TYPE_IS_CURRENT
                    , tb_2.PRODUCT_TYPE_VERSION
                    , tb_3.PRODUCT_SUB_ID
                    , tb_3.PRODUCT_SUB_NAME
                    , tb_4.PRODUCT_MAIN_ID
                    , tb_4.PRODUCT_MAIN_NAME
                    , tb_5.PRODUCT_CATEGORY_ID
                    , tb_5.PRODUCT_CATEGORY_NAME
                    , tb_7.ITEM_CATEGORY_ID
                    , tb_7.ITEM_CATEGORY_NAME
                    , tb_9.CUSTOMER_INVOICE_TO_NAME
                    , tb_1.DIRECT_UNIT_PROCESS_COST
                    , tb_1.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                    , tb_1.INDIRECT_COST
                    , tb_1.LEVEL_OF_INDIRECT_COST
                    , tb_1.SELLING_EXPENSE_RATE
                    , tb_1.GA_RATE
                    , tb_1.MARGIN_RATE
                    , tb_1.CIT
                    , tb_1.VAT
                    , tb_1.ADJUST_PRICE
                    , tb_1.COST_CONDITION_SETTING_VERSION
                    , tb_1.COST_CONDITION_SETTING_IS_CURRENT
                    , CASE
                        WHEN tb_1.INUSE = 0 THEN 0
                        WHEN tb_1.INUSE = 1 THEN 1
                      END AS STATUS
                    , tb_1.UPDATE_BY
                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                    , tb_1.CREATE_BY
                    , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s') AS CREATE_DATE
                    , tb_1.INUSE
                FROM
                    cost_condition_setting tb_1
                LEFT JOIN
                    PRODUCT_TYPE tb_2 ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                LEFT JOIN
                    PRODUCT_SUB tb_3 ON tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                LEFT JOIN
                    PRODUCT_MAIN tb_4 ON tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                LEFT JOIN
                    PRODUCT_CATEGORY tb_5 ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                LEFT JOIN
                    PRODUCT_TYPE_ITEM_CATEGORY tb_6 ON tb_2.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID AND tb_6.INUSE = 1
                LEFT JOIN
                    ITEM_CATEGORY tb_7 ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
                LEFT JOIN
                    PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_8 ON tb_2.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID AND tb_8.INUSE = 1
                LEFT JOIN
                    CUSTOMER_INVOICE_TO tb_9 ON tb_8.CUSTOMER_INVOICE_TO_ID = tb_9.CUSTOMER_INVOICE_TO_ID
                WHERE
                    1 = 1
                    sqlWhere
                    sqlWhereColumnFilter
                ORDER BY
                    dataItem.Order
                LIMIT
                      dataItem.Start
                    , dataItem.Limit
            `

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('sqlWhere', sqlWhere)
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  create: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `UPDATE cost_condition_setting SET COST_CONDITION_SETTING_IS_CURRENT = 0 WHERE PRODUCT_TYPE_ID
    = dataItem.PRODUCT_TYPE_ID`

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sqlList.push(sql)

    sql = `     INSERT INTO
                        cost_condition_setting
                    (
                          PRODUCT_TYPE_ID
                        , DIRECT_UNIT_PROCESS_COST
                        , INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                        , INDIRECT_COST
                        , LEVEL_OF_INDIRECT_COST
                        , SELLING_EXPENSE_RATE
                        , GA_RATE
                        , MARGIN_RATE
                        , CIT
                        , VAT
                        , ADJUST_PRICE
                        , COST_CONDITION_SETTING_VERSION
                        , COST_CONDITION_SETTING_IS_CURRENT
                        , CREATE_BY
                        , UPDATE_BY
                        , CREATE_DATE
                        , UPDATE_DATE
                        , INUSE
                    )
                    VALUES
                    (
                          dataItem.PRODUCT_TYPE_ID
                        , dataItem.DIRECT_UNIT_PROCESS_COST
                        , dataItem.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                        , dataItem.INDIRECT_COST
                        , 'dataItem.LEVEL_OF_INDIRECT_COST'
                        , dataItem.SELLING_EXPENSE_RATE
                        , dataItem.GA_RATE
                        , dataItem.MARGIN_RATE
                        , dataItem.CIT
                        , dataItem.VAT
                        , dataItem.ADJUST_PRICE
                        , @version
                        , 1
                        , 'dataItem.CREATE_BY'
                        , 'dataItem.UPDATE_BY'
                        , CURRENT_TIMESTAMP()
                        , CURRENT_TIMESTAMP()
                        , 1
                    )
                    ;
                    `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.DIRECT_UNIT_PROCESS_COST', dataItem['DIRECT_UNIT_PROCESS_COST'])
    sql = sql.replaceAll('dataItem.INDIRECT_RATE_OF_DIRECT_PROCESS_COST', dataItem['INDIRECT_RATE_OF_DIRECT_PROCESS_COST'])
    sql = sql.replaceAll('dataItem.INDIRECT_COST', dataItem['INDIRECT_COST'])
    sql = sql.replaceAll('dataItem.LEVEL_OF_INDIRECT_COST', dataItem['LEVEL_OF_INDIRECT_COST'])
    sql = sql.replaceAll('dataItem.SELLING_EXPENSE_RATE', dataItem['SELLING_EXPENSE_RATE'])
    sql = sql.replaceAll('dataItem.GA_RATE', dataItem['GA_RATE'])
    sql = sql.replaceAll('dataItem.MARGIN_RATE', dataItem['MARGIN_RATE'])
    sql = sql.replaceAll('dataItem.CIT', dataItem['CIT'])
    sql = sql.replaceAll('dataItem.VAT', dataItem['VAT'])
    sql = sql.replaceAll('dataItem.ADJUST_PRICE', dataItem['ADJUST_PRICE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    sqlList.push(sql)

    return sqlList.join(';')
  },
  createVersion: async (dataItem: any) => {
    let sql = `
        SET @version = (
    SELECT IFNULL(MAX(c.COST_CONDITION_SETTING_VERSION), 0) + 1
    FROM cost_condition_setting c
    JOIN product_type p
         ON p.PRODUCT_TYPE_ID = c.PRODUCT_TYPE_ID
    WHERE p.PRODUCT_TYPE_CODE_FOR_SCT = 'dataItem.PRODUCT_TYPE_CODE'
)
`

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    return sql
  },
  delete: async (dataItem: any) => {
    let sql = `     UPDATE
                        cost_condition_setting
                    SET
                          INUSE = 0
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        COST_CONDITION_SETTING_ID = dataItem.COST_CONDITION_SETTING_ID
                    `

    sql = sql.replaceAll('dataItem.COST_CONDITION_SETTING_ID', dataItem['COST_CONDITION_SETTING_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getUnsettledCount: async () => {
    let sql = `
        SELECT COUNT(DISTINCT p.PRODUCT_TYPE_CODE_FOR_SCT) AS UNSETTLED_COUNT
        FROM product_type p
        WHERE p.INUSE = 1
          AND NOT EXISTS (
            SELECT 1
            FROM cost_condition_setting c
            JOIN product_type p2
                 ON p2.PRODUCT_TYPE_ID = c.PRODUCT_TYPE_ID
            WHERE p2.PRODUCT_TYPE_CODE_FOR_SCT = p.PRODUCT_TYPE_CODE_FOR_SCT
          )
    `
    return sql
  },
  getUnsettledProductTypes: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        PRODUCT_TYPE tb_1
                    LEFT JOIN
                        PRODUCT_SUB tb_2 ON tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
                    LEFT JOIN
                        PRODUCT_MAIN tb_3 ON tb_2.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
                    LEFT JOIN
                        PRODUCT_CATEGORY tb_4 ON tb_3.PRODUCT_CATEGORY_ID = tb_4.PRODUCT_CATEGORY_ID
                    LEFT JOIN
                        PRODUCT_TYPE_ITEM_CATEGORY tb_5 ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID AND tb_5.INUSE = 1
                    LEFT JOIN
                        ITEM_CATEGORY tb_6 ON tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID
                    LEFT JOIN
                        PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_7 ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID AND tb_7.INUSE = 1
                    LEFT JOIN
                        CUSTOMER_INVOICE_TO tb_8 ON tb_7.CUSTOMER_INVOICE_TO_ID = tb_8.CUSTOMER_INVOICE_TO_ID
                    WHERE
                        tb_1.INUSE = 1 AND tb_1.PRODUCT_TYPE_IS_CURRENT = 1
                        sqlWhere
                        sqlWhereColumnFilter `

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
    sql = sql.replaceAll('sqlWhere', sqlWhere || '')

    sqlList.push(sql)

    sql = `
                SELECT
                      tb_1.PRODUCT_TYPE_ID
                    , tb_1.PRODUCT_TYPE_CODE
                    , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                    , tb_1.PRODUCT_TYPE_NAME
                    , tb_2.PRODUCT_SUB_ID
                    , tb_2.PRODUCT_SUB_NAME
                    , tb_3.PRODUCT_MAIN_ID
                    , tb_3.PRODUCT_MAIN_NAME
                    , tb_4.PRODUCT_CATEGORY_ID
                    , tb_4.PRODUCT_CATEGORY_NAME
                    , tb_6.ITEM_CATEGORY_ID
                    , tb_6.ITEM_CATEGORY_NAME
                    , tb_8.CUSTOMER_INVOICE_TO_NAME
                    , CASE
                        WHEN EXISTS (
                            SELECT 1 FROM cost_condition_setting c2
                            JOIN product_type p2 ON p2.PRODUCT_TYPE_ID = c2.PRODUCT_TYPE_ID
                            WHERE p2.PRODUCT_TYPE_CODE_FOR_SCT = tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                              AND c2.INUSE = 1
                        ) THEN 1 ELSE 0
                      END AS IS_SETTLED
                FROM
                    PRODUCT_TYPE tb_1
                LEFT JOIN
                    PRODUCT_SUB tb_2 ON tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
                LEFT JOIN
                    PRODUCT_MAIN tb_3 ON tb_2.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
                LEFT JOIN
                    PRODUCT_CATEGORY tb_4 ON tb_3.PRODUCT_CATEGORY_ID = tb_4.PRODUCT_CATEGORY_ID
                LEFT JOIN
                    PRODUCT_TYPE_ITEM_CATEGORY tb_5 ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID AND tb_5.INUSE = 1
                LEFT JOIN
                    ITEM_CATEGORY tb_6 ON tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID
                LEFT JOIN
                    PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_7 ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID AND tb_7.INUSE = 1
                LEFT JOIN
                    CUSTOMER_INVOICE_TO tb_8 ON tb_7.CUSTOMER_INVOICE_TO_ID = tb_8.CUSTOMER_INVOICE_TO_ID
                WHERE
                    tb_1.INUSE = 1 AND tb_1.PRODUCT_TYPE_IS_CURRENT = 1
                    sqlWhere
                    sqlWhereColumnFilter
                ORDER BY
                    dataItem.Order
            `

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'] || 'tb_1.PRODUCT_TYPE_CODE_FOR_SCT ASC')
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'] ? String(dataItem['Start']) : '0')
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'] ? String(dataItem['Limit']) : '1000')
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
    sql = sql.replaceAll('sqlWhere', sqlWhere || '')
    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  updateVersionOldRow: async (dataItem: any) => {
    let sql = `     UPDATE
                        cost_condition_setting
                    SET
                          INUSE = 0
                        , COST_CONDITION_SETTING_IS_CURRENT = 0
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        COST_CONDITION_SETTING_ID = dataItem.COST_CONDITION_SETTING_ID
                    `

    sql = sql.replaceAll('dataItem.COST_CONDITION_SETTING_ID', dataItem['COST_CONDITION_SETTING_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  getByProductTypeId: async (dataItem: { PRODUCT_TYPE_ID: number }) => {
    const sql = `
      SELECT
            COST_CONDITION_SETTING_ID
          , COST_CONDITION_SETTING_VERSION
          , DIRECT_UNIT_PROCESS_COST
          , INDIRECT_RATE_OF_DIRECT_PROCESS_COST
          , INDIRECT_COST
          , LEVEL_OF_INDIRECT_COST
          , SELLING_EXPENSE_RATE
          , GA_RATE
          , MARGIN_RATE
          , CIT
          , VAT
          , ADJUST_PRICE
      FROM
          cost_condition_setting
      WHERE
            PRODUCT_TYPE_ID = ${dataItem.PRODUCT_TYPE_ID}
        AND INUSE = 1
        AND COST_CONDITION_SETTING_IS_CURRENT = 1
    `
    return sql
  },

}
