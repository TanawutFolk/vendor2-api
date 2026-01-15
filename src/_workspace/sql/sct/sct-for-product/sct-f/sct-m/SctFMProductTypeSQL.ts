export const SctFMProductTypeSQL = {
  insert: async (dataItem: {
    SCT_F_M_PRODUCT_TYPE_ID: string
    SCT_F_M_ID: string
    PRODUCT_TYPE_ID: number
    SCT_F_M_CREATE_FROM_ID: number
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: 0 | 1
  }) => {
    let sql = `
                    INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_M_PRODUCT_TYPE
                    (
                              SCT_F_M_PRODUCT_TYPE_ID
                            , SCT_F_M_ID
                            , PRODUCT_TYPE_ID
                            , SCT_F_M_CREATE_FROM_ID
                            , CREATE_BY
                            , UPDATE_BY
                            , UPDATE_DATE
                            , INUSE
                    )
                    VALUES
                    (
                              'dataItem.SCT_F_M_PRODUCT_TYPE_ID'
                            , 'dataItem.SCT_F_M_ID'
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , 'dataItem.SCT_F_M_CREATE_FROM_ID'
                            , 'dataItem.CREATE_BY'
                            , 'dataItem.UPDATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.INUSE'
                    )
                            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_M_PRODUCT_TYPE_ID', dataItem['SCT_F_M_PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_M_ID', dataItem['SCT_F_M_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_F_M_CREATE_FROM_ID', dataItem['SCT_F_M_CREATE_FROM_ID'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())
    return sql
  },
}
