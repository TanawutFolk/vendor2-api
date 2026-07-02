export const SctMasterDataHistorySQL = {
  insert: async (dataItem: {
    SCT_ID: string
    SCT_MASTER_DATA_SETTING_ID: number
    FISCAL_YEAR: number
    VERSION_NO: number
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: 0 | 1
    IS_FROM_SCT_COPY: 0 | 1
  }) => {
    let sql = `     INSERT INTO dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_HISTORY
                    (
                              SCT_ID
                            , SCT_MASTER_DATA_SETTING_ID
                            , FISCAL_YEAR
                            , VERSION_NO
                            , CREATE_BY
                            , UPDATE_BY
                            , UPDATE_DATE
                            , INUSE
                            , IS_FROM_SCT_COPY
                    )
                    VALUES
                    (
                              'dataItem.SCT_ID'
                            , 'dataItem.SCT_MASTER_DATA_SETTING_ID'
                            , 'dataItem.FISCAL_YEAR'
                            , 'dataItem.VERSION_NO'
                            , 'dataItem.CREATE_BY'
                            , 'dataItem.UPDATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.INUSE'
                            , 'dataItem.IS_FROM_SCT_COPY'
                    )
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_MASTER_DATA_SETTING_ID', dataItem['SCT_MASTER_DATA_SETTING_ID'].toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.VERSION_NO', dataItem['VERSION_NO'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())

    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  getBySctId: async (dataItem: any) => {
    let sql = `     SELECT
                            tb_1.SCT_MASTER_DATA_SETTING_ID
                            tb_1.VERSION_ID
                            tb_2.SCT_MASTER_DATA_SETTING_NAME
                            tb_1.IS_FROM_SCT_COPY
                    FROM
                            dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_HISTORY tb_1
                                INNER JOIN
                            dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_SETTING tb_2
                                ON tb_1.SCT_MASTER_DATA_SETTING_ID = tb_2.SCT_MASTER_DATA_SETTING_ID
                    WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
                            AND tb_1.INUSE = 1
                            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getBySctIdAndIsFromSctCopy: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `     SELECT
                              tb_1.SCT_MASTER_DATA_SETTING_ID
                            , tb_1.FISCAL_YEAR
                            , tb_1.VERSION_NO
                            , tb_2.SCT_MASTER_DATA_SETTING_NAME
                            , tb_1.IS_FROM_SCT_COPY
                    FROM
                            dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_HISTORY tb_1
                                INNER JOIN
                            dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_SETTING tb_2
                                ON tb_1.SCT_MASTER_DATA_SETTING_ID = tb_2.SCT_MASTER_DATA_SETTING_ID
                    WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
                            AND tb_1.IS_FROM_SCT_COPY LIKE '%dataItem.IS_FROM_SCT_COPY%'
                            AND tb_1.INUSE = 1
                            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  getBySctIdAndSctMasterDataSettingId: async (dataItem: any) => {
    let sql = `     SELECT
                            tb_1.VERSION_ID
                            tb_2.SCT_MASTER_DATA_SETTING_NAME
                            tb_1.IS_FROM_SCT_COPY
                    FROM
                            dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_HISTORY tb_1
                                INNER JOIN
                            dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_SETTING tb_2
                                ON tb_1.SCT_MASTER_DATA_SETTING_ID = tb_2.SCT_MASTER_DATA_SETTING_ID
                    WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
                            AND tb_1.SCT_MASTER_DATA_SETTING_ID = 'dataItem.SCT_MASTER_DATA_SETTING_ID'
                            AND tb_1.INUSE = 1
                            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_MASTER_DATA_SETTING_ID', dataItem['SCT_MASTER_DATA_SETTING_ID'])

    return sql
  },
  deleteBySctIdAndIsFromSctCopy: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: number; UPDATE_BY: string }) => {
    let sql = `     UPDATE
                            dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_HISTORY tb_1
                    SET
                              INUSE = 0
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
                            AND tb_1.IS_FROM_SCT_COPY = 'dataItem.IS_FROM_SCT_COPY'
                            AND tb_1.INUSE = 1
                            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
