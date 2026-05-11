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
  SearchFilters?: Array<{ id: string; value: unknown }>
  Order?: Array<{ id: string; desc?: boolean }>
  Start?: number | string
  Limit?: number | string
}

const esc = (value: unknown) => String(value || '').replace(/'/g, "\\'")
const num = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const parseSearchFilters = (dataItem: AssigneesDataItem) => {
  const searchFilterMap = new Map<string, unknown>()

  for (const item of Array.isArray(dataItem.SearchFilters) ? dataItem.SearchFilters : []) {
    if (item?.id) {
      searchFilterMap.set(item.id, item.value)
    }
  }

  return {
    keyword: String(searchFilterMap.get('keyword') ?? dataItem.keyword ?? '').trim(),
    group_code: String(searchFilterMap.get('group_code') ?? dataItem.group_code ?? '')
      .trim()
      .toUpperCase(),
    in_use: String(searchFilterMap.get('in_use') ?? dataItem.in_use ?? '').trim(),
  }
}

const buildWhereClause = (dataItem: AssigneesDataItem) => {
  const filters = parseSearchFilters(dataItem)
  const whereParts = ['1 = 1']

  if (filters.keyword) {
    const keywordVal = `%${esc(filters.keyword)}%`
    whereParts.push(`(empName LIKE '${keywordVal}' OR empcode LIKE '${keywordVal}' OR empEmail LIKE '${keywordVal}')`)
  }

  if (filters.group_code) {
    const groupCompact = filters.group_code.replace(/[^A-Z0-9]/g, '')
    whereParts.push(`(
      UPPER(TRIM(COALESCE(group_code, ''))) = '${esc(filters.group_code)}'
      OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = '${esc(filters.group_code)}'
      OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_code, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = '${esc(groupCompact)}'
      OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = '${esc(groupCompact)}'
    )`)
  }

  if (filters.in_use !== '') {
    whereParts.push(`INUSE = ${num(filters.in_use)}`)
  }

  return whereParts.join('\n              AND ')
}

const buildOrderClause = (dataItem: AssigneesDataItem) => {
  const sortableColumns: Record<string, string> = {
    Assignees_id: 'Assignees_id',
    empcode: 'empcode',
    empName: 'empName',
    empEmail: 'empEmail',
    group_code: 'group_code',
    group_name: 'group_name',
    INUSE: 'INUSE',
  }

  const orderItems = (Array.isArray(dataItem.Order) ? dataItem.Order : [])
    .map(item => {
      const column = sortableColumns[item?.id || '']
      if (!column) return null
      return `${column} ${item?.desc ? 'DESC' : 'ASC'}`
    })
    .filter(Boolean)

  return orderItems.length > 0 ? orderItems.join(', ') : 'group_code ASC, empcode ASC'
}

export const AssigneesSQL = {
  getGroups: (_dataItem: { keyword?: string }) => {
    return `
                            SELECT DISTINCT
                                    group_code
                            FROM 
                                    assignees_to
                            WHERE
                                    1 = 1
                            ORDER BY
                                    group_code ASC
                            `
  },

  search: (dataItem: AssigneesDataItem) => {
    const sqlWhere = buildWhereClause(dataItem)
    const orderBy = buildOrderClause(dataItem)
    const offset = num(dataItem.Start, 0)
    const limit = num(dataItem.Limit, 20)

    const sqlCount = `
                            SELECT
                                       COUNT(*) AS TOTAL_COUNT
                            FROM
                                       assignees_to
                            WHERE
                                       ${sqlWhere}
        `

    const sqlData = `
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
                                       ${sqlWhere}
                            ORDER BY
                                       ${orderBy}
                            LIMIT ${limit} OFFSET ${offset}
        `

    return [sqlCount, sqlData]
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
