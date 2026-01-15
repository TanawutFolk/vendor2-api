export const SctFMComponentTypeResourceOptionSelectSQL = {
  insert: async (dataItem: any, uuid: string) => {
    let sql = `
      INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION
        (
              SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_ID
            , SCT_F_M_ID
            , SCT_F_M_COMPONENT_TYPE_ID
            , SCT_F_M_RESOURCE_OPTION_ID
            , DESCRIPTION
            , CREATE_BY
            , CREATE_DATE
            , UPDATE_BY
            , UPDATE_DATE
            , INUSE
        )
        VALUES
        (
              'dataItem.UUID'
            , 'dataItem.SCT_F_M_ID'
            , 'dataItem.SCT_F_M_COMPONENT_TYPE_ID'
            , 'dataItem.SCT_F_M_RESOURCE_OPTION_ID'
            , ''
            , 'dataItem.CREATE_BY'
            , CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'
            , CURRENT_TIMESTAMP()
            , 1
        )
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.UUID', uuid)
    sql = sql.replaceAll('dataItem.SCT_F_M_ID', dataItem.UUID_SCT_F_M_ID)
    sql = sql.replaceAll('dataItem.SCT_F_M_COMPONENT_TYPE_ID', dataItem.SCT_F_COMPONENT_TYPE_ID)
    sql = sql.replaceAll('dataItem.SCT_F_M_RESOURCE_OPTION_ID', dataItem.SCT_F_RESOURCE_OPTION_ID)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)

    return sql
  },
}
