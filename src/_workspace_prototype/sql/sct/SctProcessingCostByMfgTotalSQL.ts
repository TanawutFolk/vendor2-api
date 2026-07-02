export const SctProcessingCostByMfgTotalSQL = {
  insert: async (dataItem: any) => {
    let sql = `
              INSERT INTO dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_MFG_TOTAL
                              (
                                      SCT_PROCESSING_COST_BY_MFG_TOTAL_ID
                                    , SCT_ID
                                    , TOTAL_CLEAR_TIME
                                    , TOTAL_ESSENTIAL_TIME
                                    , CREATE_BY
                                    , UPDATE_DATE
                                    , UPDATE_BY
                                    , INUSE
                              )
                                    SELECT
                                          'dataItem.SCT_PROCESSING_COST_BY_MFG_TOTAL_ID'
                                        , 'dataItem.SCT_ID'
                                        ,  dataItem.TOTAL_CLEAR_TIME
                                        ,  dataItem.TOTAL_ESSENTIAL_TIME
                                        , 'dataItem.CREATE_BY'
                                        ,  CURRENT_TIMESTAMP()
                                        , 'dataItem.UPDATE_BY'
                                        , 'dataItem.INUSE'
              )
                          `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_PROCESSING_COST_BY_MFG_TOTAL_ID', dataItem['SCT_PROCESSING_COST_BY_MFG_TOTAL_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.TOTAL_CLEAR_TIME', dataItem['TOTAL_CLEAR_TIME'] ? "'" + dataItem['TOTAL_CLEAR_TIME'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.TOTAL_ESSENTIAL_TIME', dataItem['TOTAL_ESSENTIAL_TIME'] ? "'" + dataItem['TOTAL_ESSENTIAL_TIME'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `      UPDATE
                                  dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_MFG_TOTAL
                            SET
                                    INUSE = '0'
                                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                                  , UPDATE_DATE = CURRENT_TIMESTAMP()
                            WHERE
                                      SCT_ID = 'dataItem.SCT_ID'
                                  AND INUSE = '1'
                                  AND IS_FROM_SCT_COPY = 'dataItem.IS_FROM_SCT_COPY'

                              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
}
