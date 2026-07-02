export const SctFSQL = {
  generateSctFCode_ForMultipleCreate: async (dataItem: { SCT_F_CREATE_TYPE_ALPHABET: string; FISCAL_YEAR: number; SCT_PATTERN_ID: number; SCT_PATTERN_NO: string }) => {
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

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_NO', dataItem['SCT_PATTERN_NO'])

    return sql
  },
  insertBySctFCode_variable: async (dataItem: { SCT_F_ID: string; SCT_F_CREATE_TYPE_ID: number; CREATE_BY: string; UPDATE_BY: string }) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.SCT_F
        (
                  SCT_F_ID
                , SCT_F_CODE
                , SCT_F_CREATE_TYPE_ID
                , CREATE_BY
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.SCT_F_ID'
                ,  @sctFCode
                , 'dataItem.SCT_F_CREATE_TYPE_ID'
                , 'dataItem.CREATE_BY'
                , 'dataItem.UPDATE_BY'
                , CURRENT_TIMESTAMP()
                , 1
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_CREATE_TYPE_ID', dataItem['SCT_F_CREATE_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
