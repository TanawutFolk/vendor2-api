export const ProcessSQL = {
  getAllProcessInProductMain: async () => {
    let sql = `
                    SELECT
                                PRODUCT_MAIN_NAME
                              , PROCESS_NAME
                    FROM
                              PRODUCT_MAIN
                                    LEFT JOIN
                              PROCESS USING (PRODUCT_MAIN_ID)

                              `
    return sql
  },
}
