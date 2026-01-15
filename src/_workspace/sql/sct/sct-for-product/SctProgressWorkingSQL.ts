export const SctProgressWorkingSQL = {
  getBySctStatusProgressIdAndProductTypeCodeAndSctReasonSettingIdAndSctPatternId: async (dataItem: {
    SCT_STATUS_PROGRESS_ID: number
    SCT_PATTERN_ID: number
    FISCAL_YEAR: number
    SCT_REASON_SETTING_ID: number
    PRODUCT_TYPE_CODE: string
  }) => {
    let sql = `
                      SELECT
                                  tb_1.SCT_ID
                                , tb_4.PRODUCT_TYPE_ID
                                , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%m-%d') AS ESTIMATE_PERIOD_START_DATE
                                , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%m-%d') AS ESTIMATE_PERIOD_END_DATE
                                , tb_1.BOM_ID
                                , tb_1.SCT_REVISION_CODE
                                , tb_5.TOTAL_INDIRECT_COST
                                , tb_5.CIT
                                , tb_5.VAT
                      FROM
                              dataItem.STANDARD_COST_DB.SCT tb_1
                                    INNER JOIN
                              dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_2
                                        ON tb_1.SCT_ID = tb_2.SCT_ID
                                    AND tb_2.INUSE = 1
                                    AND tb_1.INUSE = 1
                                    AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                    AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                                    AND tb_2.SCT_STATUS_PROGRESS_ID = 'dataItem.SCT_STATUS_PROGRESS_ID'
                                    INNER JOIN
                              dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_3
                                        ON tb_1.SCT_ID = tb_3.SCT_ID
                                    AND tb_3.INUSE = 1
                                    AND tb_3.SCT_REASON_SETTING_ID = 'dataItem.SCT_REASON_SETTING_ID'
                                    INNER JOIN
                              PRODUCT_TYPE tb_4
                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                    AND tb_4.INUSE = 1
                                    LEFT JOIN
                              dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_5
                                        ON tb_1.SCT_ID = tb_5.SCT_ID
                                    AND tb_5.INUSE = 1
                      WHERE
                                  tb_4.PRODUCT_TYPE_CODE_FOR_SCT = 'dataItem.PRODUCT_TYPE_CODE'
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_STATUS_PROGRESS_ID', dataItem.SCT_STATUS_PROGRESS_ID.toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem.SCT_PATTERN_ID.toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem.FISCAL_YEAR.toString())
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem.SCT_REASON_SETTING_ID.toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem.PRODUCT_TYPE_CODE)

    return sql
  },
  insert: async (dataItem: {
    SCT_PROGRESS_WORKING_ID: string
    SCT_ID: string
    SCT_STATUS_PROGRESS_ID: number
    SCT_STATUS_WORKING_ID: number
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
  }) => {
    let sql = `

    SET @sctProgressWorkingNo = (1 + coalesce((SELECT max(SCT_PROGRESS_WORKING_NO) FROM dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING WHERE SCT_ID = 'dataItem.SCT_ID'), 0));

        INSERT INTO dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING
                        (

                              SCT_PROGRESS_WORKING_ID
                            , SCT_ID
                            , SCT_PROGRESS_WORKING_NO
                            , SCT_STATUS_PROGRESS_ID
                            , SCT_STATUS_WORKING_ID
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                            , INUSE
                        )
                            VALUES
                            (
                                    'dataItem.SCT_PROGRESS_WORKING_ID'
                                  , 'dataItem.SCT_ID'
                                  ,  @sctProgressWorkingNo
                                  , 'dataItem.SCT_STATUS_PROGRESS_ID'
                                  , 'dataItem.SCT_STATUS_WORKING_ID'
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  , 'dataItem.UPDATE_BY'
                                  , 'dataItem.INUSE'
                );
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_PROGRESS_WORKING_ID', dataItem['SCT_PROGRESS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_STATUS_PROGRESS_ID', dataItem['SCT_STATUS_PROGRESS_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_STATUS_WORKING_ID', dataItem['SCT_STATUS_WORKING_ID'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())

    return sql
  },

  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string }) => {
    let sql = `      UPDATE
                            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING
                      SET
                              INUSE = '0'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                      WHERE
                                SCT_ID = 'dataItem.SCT_ID'
                            AND INUSE = '1'
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
