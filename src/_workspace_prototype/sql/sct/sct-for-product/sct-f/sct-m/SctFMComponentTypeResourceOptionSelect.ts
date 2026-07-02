export const SctFMComponentTypeResourceOptionSelect = {
  insert: async (dataItem: {
    SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: string
    SCT_F_M_ID: string
    SCT_F_M_COMPONENT_TYPE_ID: number
    SCT_F_M_RESOURCE_OPTION_ID: number
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
  }) => {
    let sql = `
                      INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
                        (
                                  SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                                , SCT_F_M_ID
                                , SCT_F_M_COMPONENT_TYPE_ID
                                , SCT_F_M_RESOURCE_OPTION_ID
                                , CREATE_BY
                                , UPDATE_BY
                                , UPDATE_DATE
                                , INUSE
                        )
                        VALUES
                        (
                                  'dataItem.SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                                , 'dataItem.SCT_F_M_ID'
                                , 'dataItem.SCT_F_M_COMPONENT_TYPE_ID'
                                , 'dataItem.SCT_F_M_RESOURCE_OPTION_ID'
                                , 'dataItem.CREATE_BY'
                                , 'dataItem.UPDATE_BY'
                                ,  NOW()
                                , 'dataItem.INUSE'
                        )
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_M_ID', dataItem['SCT_F_M_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem['SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_M_COMPONENT_TYPE_ID', dataItem['SCT_F_M_COMPONENT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_F_M_RESOURCE_OPTION_ID', dataItem['SCT_F_M_RESOURCE_OPTION_ID'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())
    return sql
  },
  insertSctFMProductType: async (dataItem: any, uuid: any) => {
    let sql = `
                    INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_M_PRODUCT_TYPE
                    (
                              SCT_F_M_PRODUCT_TYPE_ID
                            , SCT_F_M_ID
                            , PRODUCT_TYPE_ID
                            , SCT_F_M_RESOURCE_FROM_ID
                            , DESCRIPTION
                            , CREATE_BY
                            , CREATE_DATE
                            , UPDATE_BY
                            , UPDATE_DATE
                            , INUSE
                    )
                    VALUES
                    (
                              'dataItem.SCT_F_M_PRODUCT_TYPE_ID'
                            , 'dataItem.UUID_SCT_F_M_ID'
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , 'dataItem.SCT_F_M_RESOURCE_FROM_ID'
                            , ''
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 1
                    )
                            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_M_PRODUCT_TYPE_ID', uuid)
    sql = sql.replaceAll('dataItem.UUID_SCT_F_M_ID', dataItem['UUID_SCT_F_M_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE']?.PRODUCT_TYPE_ID)
    sql = sql.replaceAll('dataItem.SCT_F_M_RESOURCE_FROM_ID', dataItem['SCT_F_M_RESOURCE_FROM_ID'])
    sql = sql.replaceAll('dataItem.START_DATE', dataItem['START_DATE'] ? `'${dataItem['START_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.END_DATE', dataItem['END_DATE'] ? `'${dataItem['END_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
}
