export const ClearTimeForSctProcessSQL = {
  getByFiscalYearAndProductTypeIdAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest: async (dataItem: any) => {
    let sql = `

            SELECT
                                  tb_1.PROCESS_ID
                                , tb_1.FLOW_ID
                                , tb_1.CLEAR_TIME_FOR_SCT
                                , tb_1.REVISION_NO
                        FROM
                                cycle_time_system.CLEAR_TIME_FOR_SCT_PROCESS tb_1
                        WHERE
                                    tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                AND tb_1.REVISION_NO = (
                                        SELECT
                                                MAX(tbs_1.REVISION_NO)
                                        FROM
                                                cycle_time_system.CLEAR_TIME_FOR_SCT_PROCESS tbs_1
                                        WHERE
                                                    tbs_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                                AND tbs_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                                AND tbs_1.INUSE = 1
                                )
                                AND tb_1.INUSE = 1
                  `
    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: any) => {
    let sql = `

            SELECT
                                  tb_1.PROCESS_ID
                                , tb_1.FLOW_ID
                                , tb_1.CLEAR_TIME_FOR_SCT
                                , tb_1.CLEAR_TIME_FOR_SCT_PROCESS_ID
                                , tb_1.FISCAL_YEAR
                                , tb_1.REVISION_NO
                                , tb_1.PRODUCT_TYPE_ID
                                , tb_2.FLOW_PROCESS_ID
                                , tb_2.NO AS FLOW_PROCESS_NO
                        FROM
                                dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS tb_1
                                        JOIN
                                FLOW_PROCESS tb_2
                                        ON tb_1.FLOW_PROCESS_ID = tb_2.FLOW_PROCESS_ID
                        WHERE
                                    tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                AND tb_1.REVISION_NO = (
                                        SELECT
                                                MAX(tbs_1.REVISION_NO)
                                        FROM
                                                dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS tbs_1
                                        WHERE
                                                    tbs_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                                AND tbs_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                                AND tbs_1.INUSE = 1
                                )
                                AND tb_1.INUSE = 1
                  `
    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: { FISCAL_YEAR: number; PRODUCT_TYPE_ID: number; REVISION_NO: number }) => {
    let sql = `     SELECT
                                  tb_1.PROCESS_ID
                                , tb_1.FLOW_ID
                                , tb_1.CLEAR_TIME_FOR_SCT
                                , tb_1.CLEAR_TIME_FOR_SCT_PROCESS_ID
                                , tb_1.FISCAL_YEAR
                                , tb_1.REVISION_NO
                                , tb_1.PRODUCT_TYPE_ID
                                , tb_2.FLOW_PROCESS_ID
                                , tb_2.NO AS FLOW_PROCESS_NO
                                , tb_3.FLOW_CODE
                                , tb_3.FLOW_NAME
                    FROM
                              dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS tb_1
                                    INNER JOIN
                              FLOW_PROCESS tb_2
                                    ON tb_2.FLOW_PROCESS_ID = tb_1.FLOW_PROCESS_ID
                                    INNER JOIN
                              FLOW tb_3
                                    ON tb_3.FLOW_ID = tb_2.FLOW_ID
                    WHERE
                                  tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                              AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                              AND tb_1.REVISION_NO = 'dataItem.REVISION_NO'
                              AND tb_1.INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.REVISION_NO', dataItem['REVISION_NO'].toString())

    return sql
  },
}
