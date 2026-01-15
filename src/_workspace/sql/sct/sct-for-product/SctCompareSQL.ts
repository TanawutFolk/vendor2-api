export const SctCompareSQL = {
  getSctCompare: (dataItem: any) => {
    let sql = `
        SELECT
              SCT_ID_FOR_COMPARE
            , SCT_COMPARE_NO
            , IS_DEFAULT_EXPORT_COMPARE
        FROM
          dataItem.STANDARD_COST_DB.SCT_COMPARE
        WHERE
              SCT_ID = 'dataItem.SCT_ID'
          AND INUSE = 1
        ORDER BY
          SCT_COMPARE_NO ASC
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  insert: async (dataItem: {
    SCT_COMPARE_ID: string
    SCT_COMPARE_NO: number
    SCT_ID: string
    SCT_ID_FOR_COMPARE: string
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
    IS_DEFAULT_EXPORT_COMPARE: number
  }) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.SCT_COMPARE
        (
                  SCT_COMPARE_ID
                , SCT_COMPARE_NO
                , SCT_ID
                , SCT_ID_FOR_COMPARE
                , CREATE_BY
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
                , IS_DEFAULT_EXPORT_COMPARE
        )
        VALUES
        (
                  'dataItem.SCT_COMPARE_ID'
                , 'dataItem.SCT_COMPARE_NO'
                , 'dataItem.SCT_ID'
                , 'dataItem.SCT_ID_FOR_COMPARE'
                , 'dataItem.CREATE_BY'
                , 'dataItem.UPDATE_BY'
                ,  CURRENT_TIMESTAMP()
                , 'dataItem.INUSE'
                , 'dataItem.IS_DEFAULT_EXPORT_COMPARE'
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_COMPARE_ID', dataItem['SCT_COMPARE_ID'])
    sql = sql.replaceAll('dataItem.SCT_COMPARE_NO', dataItem['SCT_COMPARE_NO'].toString())

    sql = sql.replaceAll('dataItem.SCT_ID_FOR_COMPARE', dataItem['SCT_ID_FOR_COMPARE'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())

    sql = sql.replaceAll('dataItem.IS_DEFAULT_EXPORT_COMPARE', dataItem['IS_DEFAULT_EXPORT_COMPARE'].toString())

    return sql
  },
  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string }) => {
    let sql = `

                  UPDATE
                          dataItem.STANDARD_COST_DB.SCT_COMPARE
                  SET
                            INUSE = '0'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                              SCT_ID = 'dataItem.SCT_ID'
                          AND INUSE = 1

                          `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getBySctId: (dataItem: any) => {
    let sql = `
        SELECT
                  tb_1.SCT_ID_FOR_COMPARE
                , tb_1.SCT_COMPARE_NO
                , tb_1.IS_DEFAULT_EXPORT_COMPARE
                , tb_3.BOM_ID
                , tb_3.BOM_CODE
                , tb_3.BOM_NAME
                , tb_2.SCT_REVISION_CODE
                , tb_4.FLOW_NAME
                , tb_4.FLOW_CODE
                , tb_4.FLOW_ID
                , tb_4.TOTAL_COUNT_PROCESS
        FROM
                dataItem.STANDARD_COST_DB.SCT_COMPARE tb_1
                    INNER JOIN
                dataItem.STANDARD_COST_DB.SCT tb_2
                    ON tb_2.SCT_ID= tb_1.SCT_ID_FOR_COMPARE
                    INNER JOIN
                BOM tb_3
                    ON tb_2.BOM_ID = tb_3.BOM_ID
                    INNER JOIN
                FLOW tb_4
                    ON tb_3.FLOW_ID = tb_4.FLOW_ID
        WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID'
                AND tb_1.INUSE = 1
        ORDER BY
                tb_1.SCT_COMPARE_NO ASC
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
}
