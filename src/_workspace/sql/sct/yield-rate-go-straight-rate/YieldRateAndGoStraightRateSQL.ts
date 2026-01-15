export const YieldRateAndGoStraightRateSQL = {
  GetLastYieldRateRevision: async (dataItem: any) => {
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
  generateYieldRateRevisionNo: async (dataItem: any) => {
    let sql = `
            SET @yieldRateRevisionNo = (
                    SELECT
                                    IFNULL(MAX(REVISION_NO), 0) + 1 AS REVISION_NO

                                    FROM
                                               YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT
                                    WHERE
                                                PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                            AND FISCAL_YEAR = 'dataItem.FISCAL_YEAR'

            ) ;
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process?.env?.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    // console.log(sql)
    return sql
  },
  insertYieldRate: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT
            (
                      YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID
                    , FISCAL_YEAR
                    , REVISION_NO
                    , PRODUCT_TYPE_ID
                    , FLOW_ID
                    , FLOW_PROCESS_ID
                    , FLOW_PROCESS_NO
                    , PROCESS_ID
                    , YIELD_RATE_FOR_SCT
                    , YIELD_ACCUMULATION_FOR_SCT
                    , GO_STRAIGHT_RATE_FOR_SCT
                    , COLLECTION_POINT_FOR_SCT
                    , NOTE
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
            )
            VALUES
            (
                      'dataItem.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID'
                    , 'dataItem.FISCAL_YEAR'
                    , @yieldRateRevisionNo
                    , 'dataItem.PRODUCT_TYPE_ID'
                    , 'dataItem.FLOW_ID'
                    , 'dataItem.FLOW_PROCESS_ID'
                    , 'dataItem.FLOW_PROCESS_NO'
                    , 'dataItem.PROCESS_ID'
                    , 'dataItem.YIELD_RATE_FOR_SCT'
                    , 'dataItem.YIELD_ACCUMULATION_FOR_SCT'
                    , 'dataItem.GO_STRAIGHT_RATE_FOR_SCT'
                    , 'dataItem.COLLECTION_POINT_FOR_SCT'
                    , 'dataItem.NOTE'
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
            )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID', uuid)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_ID', dataItem['FLOW_PROCESS_ID'])
    sql = sql.replaceAll('dataItem.FLOW_PROCESS_NO', dataItem['FLOW_PROCESS_NO'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.PROCESS_ID', dataItem['PROCESS_ID'])
    sql = sql.replaceAll('dataItem.YIELD_RATE_FOR_SCT', dataItem['YIELD_RATE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.YIELD_ACCUMULATION_FOR_SCT', dataItem['YIELD_ACCUMULATION_FOR_SCT'])
    sql = sql.replaceAll('dataItem.GO_STRAIGHT_RATE_FOR_SCT', dataItem['GO_STRAIGHT_RATE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.COLLECTION_POINT_FOR_SCT', dataItem['COLLECTION_POINT_FOR_SCT'])
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log(sql)
    return sql
  },
  insertTotalYieldRate: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT
            (
                      YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID
                    , FISCAL_YEAR
                    , REVISION_NO
                    , PRODUCT_TYPE_ID
                    , FLOW_ID
                    , TOTAL_YIELD_RATE_FOR_SCT
                    , TOTAL_GO_STRAIGHT_RATE_FOR_SCT
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
            )
            VALUES
            (
                      'dataItem.YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID'
                    , 'dataItem.FISCAL_YEAR'
                    , @yieldRateRevisionNo
                    , 'dataItem.PRODUCT_TYPE_ID'
                    , 'dataItem.FLOW_ID'
                    , 'dataItem.TOTAL_YIELD_RATE_FOR_SCT'
                    , 'dataItem.TOTAL_GO_STRAIGHT_RATE_FOR_SCT'
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
            )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID', uuid)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])
    sql = sql.replaceAll('dataItem.TOTAL_GO_STRAIGHT_RATE_FOR_SCT', dataItem['TOTAL_GO_STRAIGHT_RATE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.TOTAL_YIELD_RATE_FOR_SCT', dataItem['TOTAL_YIELD_RATE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log(sql)
    return sql
  },
  getAll: async () => {
    let sql = `

            SELECT
                  tb_1.* , tb_2.FLOW_CODE
            FROM
                  --  cycle_time_system.clear_time_for_sct_process tb_1
                  yield_rate_go_straight_rate_process_for_sct tb_1
                          INNER JOIN
                  flow tb_2
                          ON tb_1.flow_id = tb_2.flow_id

            WHERE tb_1.INUSE = 1
            `
    return sql
  },
}
