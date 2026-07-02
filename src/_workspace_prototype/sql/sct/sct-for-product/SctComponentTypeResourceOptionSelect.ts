export const SctComponentTypeResourceOptionSelect = {
  insert: async (dataItem: {
    SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: string
    SCT_COMPONENT_TYPE_ID: number
    SCT_ID: string
    SCT_RESOURCE_OPTION_ID: number
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
  }) => {
    let sql = `
                      INSERT INTO dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
                        (
                                  SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                                , SCT_COMPONENT_TYPE_ID
                                , SCT_ID
                                , SCT_RESOURCE_OPTION_ID
                                , CREATE_BY
                                , UPDATE_BY
                                , UPDATE_DATE
                                , INUSE
                        )
                        VALUES
                        (
                                  'dataItem.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                                , 'dataItem.SCT_COMPONENT_TYPE_ID'
                                , 'dataItem.SCT_ID'
                                , 'dataItem.SCT_RESOURCE_OPTION_ID'
                                , 'dataItem.CREATE_BY'
                                , 'dataItem.UPDATE_BY'
                                , NOW()
                                , 'dataItem.INUSE'
                        )
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem['SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'])
    sql = sql.replaceAll('dataItem.SCT_COMPONENT_TYPE_ID', dataItem['SCT_COMPONENT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_RESOURCE_OPTION_ID', dataItem['SCT_RESOURCE_OPTION_ID'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())
    return sql
  },
  getBySctId: async (dataItem: any) => {
    let sql = `
                      SELECT 
                              SCT_ID
                            , SCT_RESOURCE_OPTION_ID
                            , SCT_COMPONENT_TYPE_ID
                      FROM 
                            dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
                      WHERE 
                                SCT_ID = 'dataItem.SCT_ID'
                            AND INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
}
