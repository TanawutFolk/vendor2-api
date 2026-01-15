export const SctTagHistorySQL = {
  insert: async (dataItem: any) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY
        (
                  SCT_TAG_HISTORY_ID
                , SCT_ID
                , SCT_TAG_SETTING_ID
                , CREATE_BY
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.SCT_TAG_HISTORY_ID'
                , 'dataItem.SCT_ID'
                , 'dataItem.SCT_TAG_SETTING_ID'
                , 'dataItem.CREATE_BY'
                , 'dataItem.UPDATE_BY'
                ,  CURRENT_TIMESTAMP()
                , 'dataItem.INUSE'
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_TAG_HISTORY_ID', dataItem['SCT_TAG_HISTORY_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  deleteBySctId: async (dataItem: any) => {
    let sql = `

                  UPDATE
                          dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_1
                      JOIN
                          dataItem.STANDARD_COST_DB.SCT tb_2
                      ON
                          tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                  SET
                            tb_1.INUSE = '0'
                          , tb_1.UPDATE_BY = 'dataItem.UPDATE_BY'
                          , tb_1.UPDATE_DATE = CURRENT_TIMESTAMP()
                          , tb_2.UPDATE_BY = 'dataItem.UPDATE_BY'
                          , tb_2.UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                              tb_1.SCT_ID = 'dataItem.SCT_ID'
                          AND tb_1.INUSE = 1
                                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteSctBudgetWhenSctCancelled: async (dataItem: any) => {
    let sql = `
                  UPDATE
                          dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY
                  SET
                            INUSE = IF(SCT_TAG_SETTING_ID = 1, '0', '1')
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
  deleteSctBudgetByProductTypeId: async (dataItem: { UPDATE_BY: string; SCT_ID: string; PRODUCT_TYPE_ID: number }) => {
    let sql = `
                  UPDATE
                          dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_1
                      JOIN
                          dataItem.STANDARD_COST_DB.SCT tb_2
                      ON
                          tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                  SET
                            tb_1.INUSE = '0'
                          , tb_1.UPDATE_BY = 'dataItem.UPDATE_BY'
                          , tb_1.UPDATE_DATE = CURRENT_TIMESTAMP()
                          , tb_2.UPDATE_BY = 'dataItem.UPDATE_BY'
                          , tb_2.UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                              tb_2.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                          AND tb_1.INUSE = 1
                          AND tb_1.SCT_ID != 'dataItem.SCT_ID'
                                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
}
