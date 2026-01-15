export const PartNoSQL = {
  getAll: async () => {
    let sql = `      SELECT
                      PART_NO_ID
                    , PART_NO_CODE
                  FROM 
                    PART_NO   ;                 

                    `

    return sql
  },
}
