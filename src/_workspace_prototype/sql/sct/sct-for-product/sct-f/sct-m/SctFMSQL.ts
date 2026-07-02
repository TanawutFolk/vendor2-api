export const SctFMSQL = {
  generateSctFCode_ForMultipleCreate: async (dataItem: { SCT_F_CREATE_TYPE_ALPHABET: string }) => {
    let sql = `
            SET @sctFCode = (
                    SELECT
                            CONCAT('dataItem.SCT_F_CREATE_TYPE_ALPHABET', DATE_FORMAT(CURDATE() ,"%y"),DATE_FORMAT(CURDATE() ,"%m") , '-' , (

                                    SELECT
                                            LPAD(IFNULL(COUNT(*), 0) + 1, 3, '0')
                                    FROM
                                            dataItem.STANDARD_COST_DB.SCT_F_M
                                    WHERE

                                             FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                            AND SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                            ) , '-' ,SUBSTRING('dataItem.FISCAL_YEAR',3,4), '-', 'dataItem.SCT_PATTERN_NO')

            );
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_CREATE_TYPE_ALPHABET', dataItem['SCT_F_CREATE_TYPE_ALPHABET'])

    return sql
  },
  insert: async (dataItem: {
    SCT_F_M_ID: string
    SCT_F_ID: string
    FISCAL_YEAR: number
    SCT_PATTERN_ID: number
    ESTIMATE_PERIOD_START_DATE: string
    ESTIMATE_PERIOD_END_DATE: string
    NOTE: string
    CREATE_BY: string
    UPDATE_BY: string
  }) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_M
        (
                  SCT_F_M_ID
                , SCT_F_ID
                , FISCAL_YEAR
                , SCT_PATTERN_ID
                , ESTIMATE_PERIOD_START_DATE
                , ESTIMATE_PERIOD_END_DATE
                , NOTE
                , CREATE_BY
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.SCT_F_M_ID'
                , 'dataItem.SCT_F_ID'
                , 'dataItem.FISCAL_YEAR'
                , 'dataItem.SCT_PATTERN_ID'
                , 'dataItem.ESTIMATE_PERIOD_START_DATE'
                , 'dataItem.ESTIMATE_PERIOD_END_DATE'
                , 'dataItem.NOTE'
                , 'dataItem.CREATE_BY'
                , 'dataItem.UPDATE_BY'
                , CURRENT_TIMESTAMP()
                , 1
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_M_ID', dataItem['SCT_F_M_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_START_DATE', dataItem['ESTIMATE_PERIOD_START_DATE'])
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_END_DATE', dataItem['ESTIMATE_PERIOD_END_DATE'])
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
