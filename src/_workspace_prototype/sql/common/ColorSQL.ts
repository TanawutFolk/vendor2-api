export const ColorSQL = {
  getAll: async () => {
    let sql = `   SELECT
                            COLOR_NAME
                          , COLOR_ID
                          , COLOR_HEX
                      FROM
                          COLOR `

    return sql
  },
}
