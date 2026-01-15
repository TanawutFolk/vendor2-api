export const SpecificationSQL = {
  getAll: async () => {
    let sql = `       SELECT
                          SPECIFICATION_ID
                        , SPECIFICATION_CODE
                      FROM 
                        SPECIFICATION   ;                 

                    `

    return sql
  },
}
