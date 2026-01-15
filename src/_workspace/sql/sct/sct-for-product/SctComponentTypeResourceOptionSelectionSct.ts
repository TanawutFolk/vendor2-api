export const SctComponentTypeResourceOptionSelectionSct = {
  insert: async (dataItem: any, uuid: string) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_SCT
                  (
                        SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_SCT_ID
                      , SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                      , SCT_ID_SELECTION
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
                      , 'dataItem.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                      , 'dataItem.SCT_ID_SELECTION'
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
    sql = sql.replaceAll('dataItem.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem.UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID)
    sql = sql.replaceAll('dataItem.SCT_ID_SELECTION', dataItem.SCT_ID_SELECTION)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)

    return sql
  },
}
