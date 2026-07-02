export const WorkOrderSQL = {
  getAll: async () => {
    let sql = `      SELECT
                          WORK_ORDER_ID
                        , WORK_ORDER_CODE
                      FROM 
                        WORK_ORDER   ;                 

                    `

    return sql
  },
}
