export const ProductTypeBomSQL = {
  getByProductTypeId: async (dataItem: { PRODUCT_TYPE_ID: string }) => {
    let sql = `
                      SELECT
                                    tb_3.BOM_ID
                                  , tb_3.BOM_CODE
                                  , tb_3.FLOW_ID
                      FROM
                                PRODUCT_TYPE tb_1
                                      INNER JOIN
                                PRODUCT_TYPE_BOM tb_2
                                          ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                      AND tb_2.INUSE = '1'
                                      AND tb_2.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                      INNER JOIN
                                BOM tb_3
                                          ON tb_2.BOM_ID = tb_3.BOM_ID

                                `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem.PRODUCT_TYPE_ID)
    return sql
  },
  getSctByProductTypeId: async (dataItem: {
    PRODUCT_TYPE_ID: string
    FISCAL_YEAR: number

    SCT_STATUS_PROGRESS_ID: number
    SCT_REASON_SETTING_ID: number
    SCT_TAG_SETTING_ID: number
    SCT_PATTERN_ID: number
  }) => {
    let sql = `
                      SELECT
                                    tb_3.BOM_ID
                                  , tb_3.BOM_CODE
                                  , tb_3.FLOW_ID

                          , tb_4.SCT_ID
                          , tb_4.SCT_REVISION_CODE
                          , tb_4.BOM_ID
                          , tb_4.FISCAL_YEAR
                          , IFNULL(tb_4.SCT_PATTERN_ID, 'dataItem.SCT_PATTERN_ID') as SCT_PATTERN_ID
                          , tb_4.ESTIMATE_PERIOD_START_DATE
                          , tb_4.ESTIMATE_PERIOD_END_DATE
                          , tb_4.PRODUCT_TYPE_ID
                          , 'dataItem.FISCAL_YEAR' as FISCAL_YEAR
                      FROM
                                PRODUCT_TYPE tb_1
                                      INNER JOIN
                                PRODUCT_TYPE_BOM tb_2
                                          ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                      AND tb_2.INUSE = '1'
                                      AND tb_2.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                      INNER JOIN
                                BOM tb_3
                                          ON tb_2.BOM_ID = tb_3.BOM_ID
                                      LEFT JOIN
                                (
                                      SELECT
                                                  tb_1.SCT_ID
                                                , tb_1.SCT_REVISION_CODE
                                                , tb_1.BOM_ID
                                                , tb_1.FISCAL_YEAR
                                                , tb_1.SCT_PATTERN_ID
                                                , tb_1.ESTIMATE_PERIOD_START_DATE
                                                , tb_1.ESTIMATE_PERIOD_END_DATE
                                                , tb_1.PRODUCT_TYPE_ID
                                      FROM
                                                dataItem.STANDARD_COST_DB.SCT tb_1
                                                      INNER JOIN
                                                dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                                          ON tb_1.SCT_ID = tb_2.SCT_ID
                                                      AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                                      AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                                      AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                                                      AND tb_2.INUSE = 1
                                                      AND tb_2.SCT_STATUS_PROGRESS_ID = 'dataItem.SCT_STATUS_PROGRESS_ID'
                                                      INNER JOIN
                                                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_3
                                                          ON tb_1.SCT_ID = tb_3.SCT_ID
                                                      AND tb_3.INUSE = 1
                                                      AND tb_3.SCT_REASON_SETTING_ID = 'dataItem.SCT_REASON_SETTING_ID'
                                                      INNER JOIN
                                                dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_4
                                                          ON tb_1.SCT_ID = tb_4.SCT_ID
                                                      AND tb_4.SCT_TAG_SETTING_ID = 'dataItem.SCT_TAG_SETTING_ID'
                                                      AND tb_4.INUSE = 1

                                ) tb_4
                                  ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID

                                `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem.PRODUCT_TYPE_ID)

    // Subquery
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem.FISCAL_YEAR.toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem.PRODUCT_TYPE_ID)
    sql = sql.replaceAll('dataItem.SCT_STATUS_PROGRESS_ID', dataItem.SCT_STATUS_PROGRESS_ID.toString())
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem.SCT_REASON_SETTING_ID.toString())
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem.SCT_TAG_SETTING_ID.toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem.SCT_PATTERN_ID.toString())

    return sql
  },
  updateInuseByProductTypeId: async (dataItem: any) => {
    let sql = `     UPDATE
                              PRODUCT_TYPE_BOM
                    SET
                              INUSE = 0
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                                PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                            AND INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  create: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_BOM
                    (
                          PRODUCT_TYPE_BOM_ID
                        , PRODUCT_TYPE_ID
                        , BOM_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )
                        SELECT
                              1 + coalesce((SELECT max(PRODUCT_TYPE_BOM_ID) FROM PRODUCT_TYPE_BOM), 0)
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , 'dataItem.BOM_ID'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
               `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
}
