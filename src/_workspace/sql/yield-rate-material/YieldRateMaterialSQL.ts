export const YieldRateMaterialSQL = {
  GetLastYieldRateMaterialRevision: async (dataItem: any) => {
    let sql = `


                           SELECT  IFNULL( MAX(FISCAL_YEAR), 0) + 0 AS FISCAL_YEAR

                                 , IFNULL( MAX(REVISION_NO), 0) + 0 AS REVISION_NO


                                FROM YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_1

                                WHERE tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                AND tb_1.INUSE = 1

    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem.PRODUCT_TYPE_ID)
    sql = sql.replaceAll('dataItem.INUSE', dataItem.INUSE)

    return sql
  },
  generateYieldRateMaterialRevisionNo: async (dataItem: any) => {
    let sql = `
            SET @yieldRateRevisionNo = (
                    SELECT
                                    IFNULL(MAX(tb_5.REVISION_NO), 0) + 1 AS REVISION_NO

                                    FROM
                                               PRODUCT_CATEGORY tb_1
                                                      INNER JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID AND tb_2.INUSE = 1
                                                      INNER JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                                                      INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_4.INUSE = 1
                                                      INNER JOIN yield_accumulation_of_item_for_sct tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                                      INNER JOIN ITEM_MANUFACTURING tb_6 ON tb_5.ITEM_ID = tb_6.ITEM_ID AND tb_6.INUSE = 1
                                    WHERE
                                                  tb_5.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                                  AND tb_4.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                                  AND tb_5.ITEM_ID = 'dataItem.ITEM_ID'
                                                  AND tb_5.INUSE = 1

            ) ;
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process?.env?.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    // console.log(sql)
    return sql
  },

  insertYieldRateMaterial: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO yield_accumulation_of_item_for_sct
            (
                      YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID
                    , FISCAL_YEAR
                    , REVISION_NO
                    , PRODUCT_TYPE_ID
                    , ITEM_ID
                    , YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
                    , SCT_REASON_SETTING_ID
                    , DESCRIPTION
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
            )
            VALUES
            (
                      'dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID'
                    , 'dataItem.FISCAL_YEAR'
                    , @yieldRateRevisionNo
                    , 'dataItem.PRODUCT_TYPE_ID'
                    , 'dataItem.ITEM_ID'
                    , 'dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT'
                    , 'dataItem.SCT_REASON_SETTING_ID'
                    , 'dataItem.NOTE'
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
            )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID', uuid)
    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT', dataItem['YIELD_ACCUMULATION_OF_ITEM_FOR_SCT'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.yield_accumulation_of_item_for_sct', dataItem['yield_accumulation_of_item_for_sct'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log(sql)
    return sql
  },

  search: async (dataItem: any) => {
    let sqlList: any = []

    let sql = `  SELECT COUNT(*) AS TOTAL_COUNT

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
    // sql = sql.replaceAll('dataItem.TEST_DB', process.env.TEST_DB)

    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    sql = `         SELECT
                      tb_1.PRODUCT_CATEGORY_ID
                    , tb_1.PRODUCT_CATEGORY_NAME
                    , tb_2.PRODUCT_MAIN_ID
                    , tb_2.PRODUCT_MAIN_NAME
                    , tb_3.PRODUCT_SUB_ID
                    , tb_3.PRODUCT_SUB_NAME
                    , tb_4.PRODUCT_TYPE_ID
                    , tb_4.PRODUCT_TYPE_NAME
                    , tb_4.PRODUCT_TYPE_CODE
                    , tb_4.PRODUCT_TYPE_CODE_FOR_SCT
                    , tb_5.ITEM_ID
                    , tb_5.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
                    , tb_5.DESCRIPTION
                    , tb_5.FISCAL_YEAR
                    , tb_5.REVISION_NO
                    , tb_5.UPDATE_BY
                    , DATE_FORMAT(tb_5.UPDATE_DATE, '%d-%b-%Y %H:%i:%s' ) AS UPDATE_DATE
                    , tb_5.INUSE
                    , tb_6.ITEM_CODE_FOR_SUPPORT_MES
                    , tb_6.ITEM_INTERNAL_SHORT_NAME
                    , tb_6.ITEM_INTERNAL_FULL_NAME
                    , tb_7.SCT_REASON_SETTING_NAME

                  FROM

                    dataItem.sqlJoin
                          dataItem.sqlWhere
                          dataItem.sqlHaving

                        ORDER BY
                            dataItem.Order
                        LIMIT
                            dataItem.Start
                        ,   dataItem.Limit


        `
    //  sql = sql.replaceAll('dataItem.TEST_DB', process.env.TEST_DB)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.Order', dataItem.Order)
    sql = sql.replaceAll('dataItem.Start', dataItem.Start)
    sql = sql.replaceAll('dataItem.Limit', dataItem.Limit)
    sql = sql.replaceAll('dataItem.INUSE', dataItem['inuseForSearch'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')
    // console.log(sql)

    return sqlList
  },

  getMaterialYieldRateDuplicate: async (dataItem: any) => {
    let sql = `    SELECT
                        tb_5.FISCAL_YEAR
                        ,tb_4.PRODUCT_TYPE_ID
                        ,tb_5.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
                        ,tb_5.ITEM_ID
                        ,tb_5.SCT_REASON_SETTING_ID
                  FROM
                              PRODUCT_CATEGORY tb_1
                      INNER JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID AND tb_2.INUSE = 1
                      INNER JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                      INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_4.INUSE = 1
                      INNER JOIN yield_accumulation_of_item_for_sct tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                      INNER JOIN ITEM_MANUFACTURING tb_6 ON tb_5.ITEM_ID = tb_6.ITEM_ID AND tb_6.INUSE = 1
                      INNER JOIN dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_7 ON tb_7.SCT_REASON_SETTING_ID = tb_5.SCT_REASON_SETTING_ID
                  WHERE
                        tb_5.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                        AND tb_4.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                        AND tb_5.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT = 'dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT'
                        AND tb_5.ITEM_ID = 'dataItem.ITEM_ID'
                        AND tb_5.SCT_REASON_SETTING_ID = 'dataItem.SCT_REASON_SETTING_ID'
                        AND tb_5.INUSE = 1

                            `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT', dataItem['YIELD_ACCUMULATION_OF_ITEM_FOR_SCT'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    // console.log(sql)

    return sql
  },
  createMaterialYieldRate: async (dataItem: any, uuid: any) => {
    let sql = `
                INSERT INTO yield_accumulation_of_item_for_sct
                (
                          YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID
                          , FISCAL_YEAR
                          , REVISION_NO
                          , PRODUCT_TYPE_ID
                          , ITEM_ID
                          , YIELD_ACCUMULATION_OF_ITEM_FOR_SCT
                          , SCT_REASON_SETTING_ID
                          , CREATE_BY
                          , CREATE_DATE
                          , UPDATE_BY
                          , UPDATE_DATE
                          , INUSE
                )
                VALUES
                (
                          'dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID'
                          , 'dataItem.FISCAL_YEAR'
                          , @yieldRateRevisionNo
                          , 'dataItem.PRODUCT_TYPE_ID'
                          , 'dataItem.ITEM_ID'
                          , 'dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT'
                          , 'dataItem.SCT_REASON_SETTING_ID'
                          , 'dataItem.CREATE_BY'
                          , NOW()
                          , 'dataItem.UPDATE_BY'
                          , NOW()
                          , 1
                )



    `
    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID', uuid)
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])
    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT', dataItem['YIELD_ACCUMULATION_OF_ITEM_FOR_SCT'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log(sql)

    return sql
  },
}
