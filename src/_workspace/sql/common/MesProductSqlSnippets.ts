const getMesSchema = () => {
  const schema = String(process.env.MES_DB || '_test_mes_tanawut_2026_03_08').trim()
  if (!/^[A-Za-z0-9_]+$/.test(schema)) {
    throw new Error('MES_DB contains an invalid schema name')
  }

  let sql = '`dataItem.SCHEMA_NAME`'
  sql = sql.replaceAll('dataItem.SCHEMA_NAME', schema)
  return sql
}

export const MesProductSqlSnippets = {
  productMainTable: () => {
    let sql = 'dataItem.MES_SCHEMA.product_main'
    sql = sql.replaceAll('dataItem.MES_SCHEMA', getMesSchema())
    return sql
  },
}
