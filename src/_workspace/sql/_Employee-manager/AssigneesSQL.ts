export interface AssigneesDataItem {
  Assignees_id?: number | string
  empcode?: string
  empName?: string
  empEmail?: string
  group_code?: string
  group_name?: string
  INUSE?: number | string
  keyword?: string
  in_use?: string | number
}

const esc = (value: any) => String(value || '').replace(/'/g, "\\'")

export const AssigneesSQL = {
  getGroups: (dataItem: { keyword?: string }) => {
    let sql = `
                            SELECT
                                    group_code
                            FROM 
                                    assignees_to
                            WHERE
                                       1 = 1
                            `

    return sql
  },

  search: (dataItem: AssigneesDataItem) => {
    let sql = `
                            SELECT 
                                       Assignees_id
                                     , empcode
                                     , empName
                                     , empEmail
                                     , group_code
                                     , group_name
                                     , INUSE 
                            FROM
                                       assignees_to 
                            WHERE
                                       1 = 1
                                       dataItem.keywordSql
                                       dataItem.groupSql
                                       dataItem.inUseSql
                            ORDER BY
                                       group_code, empcode ASC
        `

    let keywordSql = ''
    if (dataItem.keyword) {
      keywordSql = ` AND (empName LIKE 'keywordVal' OR empcode LIKE 'keywordVal' OR empEmail LIKE 'keywordVal')`
      const keywordVal = `%${dataItem.keyword}%`
      keywordSql = keywordSql.replaceAll('keywordVal', keywordVal)
    }

    let groupSql = ''
    if (dataItem.group_code) {
      groupSql = ` AND (
                UPPER(TRIM(COALESCE(group_code, ''))) = 'dataItem.group_code'
                OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = 'dataItem.group_code'
                OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_code, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.group_compact'
                OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.group_compact'
            )`
    }

    let inUseSql = ''
    if (dataItem.in_use && dataItem.in_use !== '') {
      inUseSql = ` AND INUSE = dataItem.in_use`
    }

    sql = sql.replaceAll('dataItem.keywordSql', keywordSql)
    sql = sql.replaceAll('dataItem.groupSql', groupSql)
    sql = sql.replaceAll('dataItem.inUseSql', inUseSql)
    sql = sql.replaceAll(
      'dataItem.group_code',
      String(dataItem.group_code || '')
        .trim()
        .toUpperCase()
    )
    sql = sql.replaceAll(
      'dataItem.group_compact',
      String(dataItem.group_code || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
    )
    sql = sql.replaceAll('dataItem.in_use', (dataItem.in_use || 0).toString())

    return sql
  },

  insert: (dataItem: AssigneesDataItem) => {
    let sql = `
                            INSERT INTO assignees_to (
                                       empcode
                                     , empName
                                     , empEmail
                                     , group_code
                                     , group_name
                                     , INUSE
                            )
                            VALUES (
                                       'dataItem.empcode'
                                     , 'dataItem.empName'
                                     , 'dataItem.empEmail'
                                     , 'dataItem.group_code'
                                     , 'dataItem.group_name'
                                     ,  dataItem.INUSE
                            )
        `
    sql = sql.replaceAll('dataItem.empcode', esc(dataItem.empcode))
    sql = sql.replaceAll('dataItem.empName', esc(dataItem.empName))
    sql = sql.replaceAll('dataItem.empEmail', esc(dataItem.empEmail))
    sql = sql.replaceAll('dataItem.group_code', esc(dataItem.group_code))
    sql = sql.replaceAll('dataItem.group_name', esc(dataItem.group_name))
    sql = sql.replaceAll('dataItem.INUSE', (dataItem.INUSE !== undefined ? dataItem.INUSE : 1).toString())

    return sql
  },

  update: (dataItem: AssigneesDataItem) => {
    let sql = `
                            UPDATE assignees_to SET
                                       empcode = 'dataItem.empcode'
                                     , empName = 'dataItem.empName'
                                     , empEmail = 'dataItem.empEmail'
                                     , group_code = 'dataItem.group_code'
                                     , group_name = 'dataItem.group_name'
                                     , INUSE = dataItem.INUSE
                            WHERE
                                       Assignees_id = dataItem.Assignees_id
        `
    sql = sql.replaceAll('dataItem.empcode', esc(dataItem.empcode))
    sql = sql.replaceAll('dataItem.empName', esc(dataItem.empName))
    sql = sql.replaceAll('dataItem.empEmail', esc(dataItem.empEmail))
    sql = sql.replaceAll('dataItem.group_code', esc(dataItem.group_code))
    sql = sql.replaceAll('dataItem.group_name', esc(dataItem.group_name))
    sql = sql.replaceAll('dataItem.INUSE', (dataItem.INUSE !== undefined ? dataItem.INUSE : 1).toString())
    sql = sql.replaceAll('dataItem.Assignees_id', (dataItem.Assignees_id || 0).toString())

    return sql
  },

  findDuplicate: (dataItem: AssigneesDataItem) => {
    let sql = `
                            SELECT
                                       Assignees_id
                                     , empcode
                                     , group_code
                                     , INUSE
                            FROM
                                       assignees_to
                            WHERE
                                       empcode = 'dataItem.empcode'
                                       AND group_code = 'dataItem.group_code'
                                       dataItem.excludeIdSql
                            LIMIT
                                       1
        `
    const excludeIdSql = dataItem.Assignees_id ? ` AND Assignees_id <> ${Number(dataItem.Assignees_id) || 0}` : ''

    sql = sql.replaceAll('dataItem.empcode', esc(dataItem.empcode))
    sql = sql.replaceAll('dataItem.group_code', esc(dataItem.group_code))
    sql = sql.replaceAll('dataItem.excludeIdSql', excludeIdSql)

    return sql
  },
}
