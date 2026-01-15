export const YieldRateGoStraightRateProcessForSctSQL = {
  getByFiscalYearAndProductTypeIdAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest: async (dataItem: any) => {
    let sql = `     SELECT
                                tb_1.PROCESS_ID
                              , tb_1.YIELD_RATE_FOR_SCT
                              , tb_1.YIELD_ACCUMULATION_FOR_SCT
                              , tb_1.GO_STRAIGHT_RATE_FOR_SCT
                              , tb_1.COLLECTION_POINT_FOR_SCT
                              , tb_1.FLOW_ID
                              , tb_1.REVISION_NO
                    FROM
                              YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_1
                    WHERE
                                  tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                              AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                              AND tb_1.REVISION_NO = (
                                      SELECT
                                              MAX(tbs_1.REVISION_NO)
                                      FROM
                                              YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tbs_1
                                      WHERE
                                                  tbs_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                              AND tbs_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                              AND tbs_1.INUSE = 1
                              )
                              AND tb_1.INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: { FISCAL_YEAR: number; PRODUCT_TYPE_ID: number }) => {
    let sql = `     SELECT
                                tb_1.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID
                              , tb_1.FISCAL_YEAR
                              , tb_1.REVISION_NO
                              , tb_1.PRODUCT_TYPE_ID
                              , tb_1.FLOW_ID
                              , tb_1.FLOW_PROCESS_ID
                              , tb_2.NO AS FLOW_PROCESS_NO
                              , tb_1.PROCESS_ID
                              , tb_1.YIELD_RATE_FOR_SCT
                              , tb_1.YIELD_ACCUMULATION_FOR_SCT
                              , tb_1.GO_STRAIGHT_RATE_FOR_SCT
                              , tb_1.COLLECTION_POINT_FOR_SCT
                              , tb_3.FLOW_CODE
                              , tb_3.FLOW_NAME
                    FROM
                              YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_1
                                    INNER JOIN
                              FLOW_PROCESS tb_2
                                    ON tb_2.FLOW_PROCESS_ID = tb_1.FLOW_PROCESS_ID
                                    INNER JOIN
                              FLOW tb_3
                                    ON tb_3.FLOW_ID = tb_2.FLOW_ID
                    WHERE
                                  tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                              AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                              AND tb_1.REVISION_NO = (
                                      SELECT
                                              MAX(tbs_1.REVISION_NO)
                                      FROM
                                              YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tbs_1
                                      WHERE
                                                  tbs_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                              AND tbs_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                              AND tbs_1.INUSE = 1
                              )
                              AND tb_1.INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())

    return sql
  },
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: { FISCAL_YEAR: number; PRODUCT_TYPE_ID: number; REVISION_NO: number }) => {
    let sql = `     SELECT
                                tb_1.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID
                              , tb_1.FISCAL_YEAR
                              , tb_1.REVISION_NO
                              , tb_1.PRODUCT_TYPE_ID
                              , tb_1.FLOW_ID
                              , tb_1.FLOW_PROCESS_ID
                              , tb_2.NO AS FLOW_PROCESS_NO
                              , tb_1.PROCESS_ID
                              , tb_1.YIELD_RATE_FOR_SCT
                              , tb_1.YIELD_ACCUMULATION_FOR_SCT
                              , tb_1.GO_STRAIGHT_RATE_FOR_SCT
                              , tb_1.COLLECTION_POINT_FOR_SCT
                              , tb_3.FLOW_CODE
                              , tb_3.FLOW_NAME
                    FROM
                              YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_1
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

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.REVISION_NO', dataItem['REVISION_NO'].toString())

    return sql
  },
}
