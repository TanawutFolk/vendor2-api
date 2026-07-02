export const MadeBySQL = {
  getAll: async () => {
    let sql = `    SELECT
                        ITEM_PROPERTY_MADE_BY_ID
                      , ITEM_PROPERTY_MADE_BY_NAME
                      , INUSE
                    FROM 
                        ITEM_PROPERTY_MADE_BY  ;
                  `

    return sql
  },
}
