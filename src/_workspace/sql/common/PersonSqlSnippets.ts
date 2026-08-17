const getPersonSchema = () => {
  const schema = String(process.env.PERSON_DB || 'person').trim()
  if (!/^[A-Za-z0-9_]+$/.test(schema)) {
    throw new Error('PERSON_DB contains an invalid schema name')
  }
  let sql = '`dataItem.SCHEMA_NAME`'
  sql = sql.replaceAll('dataItem.SCHEMA_NAME', String(schema))
  return sql
}

export const PersonSqlSnippets = {
  memberTable: () => {
    let sql = 'dataItem.PERSON_SCHEMA.member_fed'
    sql = sql.replaceAll('dataItem.PERSON_SCHEMA', String(getPersonSchema()))
    return sql
  },
  sectionTable: () => {
    let sql = 'dataItem.PERSON_SCHEMA.set_section_fed'
    sql = sql.replaceAll('dataItem.PERSON_SCHEMA', String(getPersonSchema()))
    return sql
  },
}
