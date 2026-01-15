export const ClearTimeForSctTotalSQL = {
  getByFiscalYearAndProductTypeIdAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest: async (dataItem: any) => {
    let sql = `         SELECT
                                  TOTAL_CLEAR_TIME_FOR_SCT
                                  , REVISION_NO
                        FROM
                                dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL
                        WHERE
                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                AND REVISION_NO = (
                                        SELECT
                                                MAX(REVISION_NO)
                                        FROM
                                                dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL
                                        WHERE
                                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                                AND PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                                AND INUSE = 1
                                )
                                AND INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])

    return sql
  },
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: any) => {
    let sql = `         SELECT
                                          tb_1.CLEAR_TIME_FOR_SCT_TOTAL_ID
                                        , tb_1.FISCAL_YEAR
                                        , tb_1.REVISION_NO
                                        , tb_1.PRODUCT_TYPE_ID
                                        , tb_1.FLOW_ID
                                        , tb_1.TOTAL_CLEAR_TIME_FOR_SCT
                                        , tb_2.FLOW_NAME
                                        , tb_2.FLOW_CODE
                        FROM
                                dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL tb_1
                                       INNER JOIN
                                FLOW tb_2
                                        ON tb_2.FLOW_ID = tb_1.FLOW_ID
                        WHERE
                                    tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                AND tb_1.REVISION_NO = (
                                        SELECT
                                                MAX(REVISION_NO)
                                        FROM
                                                dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL
                                        WHERE
                                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                                AND PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                                AND INUSE = 1
                                )
                                AND tb_1.INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])

    return sql
  },
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: any) => {
    let sql = `         SELECT
                                          tb_1.CLEAR_TIME_FOR_SCT_TOTAL_ID
                                        , tb_1.FISCAL_YEAR
                                        , tb_1.REVISION_NO
                                        , tb_1.PRODUCT_TYPE_ID
                                        , tb_1.FLOW_ID
                                        , tb_1.TOTAL_CLEAR_TIME_FOR_SCT
                                        , tb_2.FLOW_NAME
                                        , tb_2.FLOW_CODE
                        FROM
                                dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL tb_1
                                        INNER JOIN
                                FLOW tb_2
                                        ON tb_2.FLOW_ID = tb_1.FLOW_ID
                        WHERE
                                    tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                AND tb_1.REVISION_NO = 'dataItem.REVISION_NO'
                                AND tb_1.INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.REVISION_NO', dataItem['REVISION_NO'])

    return sql
  },
}
