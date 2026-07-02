export const ItemGroupSQL = {
  getByLikeItemGroupName: async (dataItem: any) => {
    let sql = `             SELECT
                                ITEM_GROUP_ID
                            , ITEM_GROUP_NAME
                            FROM
                            ITEM_GROUP
                            WHERE
                                ITEM_GROUP_NAME LIKE '%dataItem.ITEM_GROUP_NAME%'
                            AND INUSE LIKE '%dataItem.INUSE%'
                            ORDER BY
                            ITEM_GROUP_NAME
                            LIMIT
                            50
                                                `

    sql = sql.replaceAll('dataItem.ITEM_GROUP_NAME', dataItem['ITEM_GROUP_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  getAll: async () => {
    let sql = `     SELECT
                          ITEM_GROUP_ID
                        , ITEM_GROUP_NAME
                        , INUSE
                     FROM 
                          ITEM_GROUP ;
                    `
    return sql
  },

  CreateItemGroupId: async () => {
    let sql = ` SET @itemGroupId=(1 + coalesce((SELECT max(ITEM_GROUP_ID)
                        FROM ITEM_GROUP), 0)) ; `
    return sql
  },
  getItemGroupNameAndInuse: async (dataItem: any) => {
    let sql = `  SELECT
                      ITEM_GROUP_ID
                    , ITEM_GROUP_NAME
                FROM
                      ITEM_GROUP
                WHERE
                  ITEM_GROUP_NAME = 'dataItem.ITEM_GROUP_NAME'
                AND INUSE = 1
    `

    sql = sql.replaceAll('dataItem.ITEM_GROUP_NAME', dataItem['ITEM_GROUP_NAME'])
    return sql
  },
  createItemGroupByVariableId: async (dataItem: any) => {
    let sql = `
                            INSERT INTO ITEM_GROUP
                            (
                                  ITEM_GROUP_ID
                                , ITEM_GROUP_NAME
                                , CREATE_BY
                                , UPDATE_DATE
                                , UPDATE_BY
                            )
                            SELECT
                                   @itemGroupId
                                , 'dataItem.ITEM_GROUP_NAME'
                                , 'dataItem.CREATE_BY'
                                ,  CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'


                              `

    sql = sql.replaceAll('dataItem.ITEM_GROUP_NAME', dataItem['ITEM_GROUP_NAME'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
}
