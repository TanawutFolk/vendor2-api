export const SctComponentTypeResourceOptionSelectSQL = {
  insert: async (dataItem: {
    SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: string
    SCT_COMPONENT_TYPE_ID: number
    SCT_ID: string
    SCT_RESOURCE_OPTION_ID: number
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
    IS_FROM_SCT_COPY: number
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
                                , IS_FROM_SCT_COPY
                        )
                        VALUES
                        (
                                  'dataItem.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                                , 'dataItem.SCT_COMPONENT_TYPE_ID'
                                , 'dataItem.SCT_ID'
                                , 'dataItem.SCT_RESOURCE_OPTION_ID'
                                , 'dataItem.CREATE_BY'
                                , 'dataItem.UPDATE_BY'
                                ,  NOW()
                                , 'dataItem.INUSE'
                                , 'dataItem.IS_FROM_SCT_COPY'
                        )
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem['SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'])
    sql = sql.replaceAll('dataItem.SCT_COMPONENT_TYPE_ID', dataItem['SCT_COMPONENT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_RESOURCE_OPTION_ID', dataItem['SCT_RESOURCE_OPTION_ID'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())
    return sql
  },
  getBySctId: async (dataItem: any) => {
    let sql = `
                      SELECT
                              SCT_ID
                            , SCT_RESOURCE_OPTION_ID
                            , SCT_COMPONENT_TYPE_ID
                            , IS_FROM_SCT_COPY
                      FROM
                            dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
                      WHERE
                                SCT_ID = 'dataItem.SCT_ID'
                            AND INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getBySctIdAndIsFromSctCopy: async (dataItem: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) => {
    let sql = `
                      SELECT
                              SCT_ID
                            , SCT_RESOURCE_OPTION_ID
                            , SCT_COMPONENT_TYPE_ID
                            , IS_FROM_SCT_COPY
                      FROM
                            dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
                      WHERE
                                SCT_ID = 'dataItem.SCT_ID'
                            AND IS_FROM_SCT_COPY LIKE '%dataItem.IS_FROM_SCT_COPY%'
                            AND INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
}
