export const AssigneesSQL = {
  num: (value: any, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  },

  parseSearchFilters: (dataItem: any) => {
    const searchFilterMap = new Map<any, any>()

    for (const item of Array.isArray(dataItem.SEARCHFILTERS) ? dataItem.SEARCHFILTERS : []) {
      if (item?.id) {
        searchFilterMap.set(item.id, item.value)
      }
    }

    return {
      keyword: String(searchFilterMap.get('KEYWORD') ?? searchFilterMap.get('keyword') ?? dataItem.KEYWORD ?? '').trim(),
      group_code: String(searchFilterMap.get('GROUP_CODE') ?? searchFilterMap.get('group_code') ?? dataItem.GROUP_CODE ?? '')
        .trim()
        .toUpperCase(),
      in_use: String(searchFilterMap.get('IN_USE') ?? searchFilterMap.get('in_use') ?? dataItem.IN_USE ?? '').trim(),
    }
  },

  buildWhereClause: (dataItem: any) => {
    const filters = AssigneesSQL.parseSearchFilters(dataItem)
    const whereParts = ['1 = 1']

    if (filters.keyword) {
      const keywordVal = `%${filters.keyword}%`
      let keywordSql = `(EMPNAME LIKE 'dataItem.KEYWORDVAL' OR EMPCODE LIKE 'dataItem.KEYWORDVAL' OR EMPEMAIL LIKE 'dataItem.KEYWORDVAL')`
      keywordSql = keywordSql.replaceAll('dataItem.KEYWORDVAL', keywordVal)
      whereParts.push(keywordSql)
    }

    if (filters.group_code) {
      const groupCompact = filters.group_code.replace(/[^A-Z0-9]/g, '')
      let groupSql = `(
      UPPER(TRIM(COALESCE(GROUP_CODE, ''))) = 'dataItem.GROUP_CODE'
      OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = 'dataItem.GROUP_CODE'
      OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_CODE, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.GROUP_COMPACT'
      OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.GROUP_COMPACT'
    )`
      groupSql = groupSql.replaceAll('dataItem.GROUP_CODE', filters.group_code)
      groupSql = groupSql.replaceAll('dataItem.GROUP_COMPACT', groupCompact)
      whereParts.push(groupSql)
    }

    if (filters.in_use !== '') {
      let inUseSql = `INUSE = dataItem.IN_USE`
      inUseSql = inUseSql.replaceAll('dataItem.IN_USE', AssigneesSQL.num(filters.in_use).toString())
      whereParts.push(inUseSql)
    }

    return whereParts.join('\n              AND ')
  },

  buildOrderClause: (dataItem: any) => {
    const sortableColumns: any = {
      ASSIGNEES_TO_ID: 'ASSIGNEES_TO_ID',
      Assignees_id: 'ASSIGNEES_TO_ID',
      EMPCODE: 'EMPCODE',
      empcode: 'EMPCODE',
      EMPNAME: 'EMPNAME',
      empName: 'EMPNAME',
      EMPEMAIL: 'EMPEMAIL',
      empEmail: 'EMPEMAIL',
      GROUP_CODE: 'GROUP_CODE',
      group_code: 'GROUP_CODE',
      GROUP_NAME: 'GROUP_NAME',
      group_name: 'GROUP_NAME',
      INUSE: 'INUSE',
    }

    const orderItems = (Array.isArray(dataItem.ORDER) ? dataItem.ORDER : [])
      .map((item: any) => {
        const column = sortableColumns[item?.id || '']
        if (!column) return null
        return `${column} ${item?.desc ? 'DESC' : 'ASC'}`
      })
      .filter(Boolean)

    return orderItems.length > 0 ? orderItems.join(', ') : 'GROUP_CODE ASC, EMPCODE ASC'
  },
  getGroups: (_dataItem: any) => {
    return `
                            SELECT DISTINCT
                                    GROUP_CODE
                            FROM 
                                    assignees_to
                            WHERE
                                    1 = 1
                            ORDER BY
                                    GROUP_CODE ASC
                            `
  },

  search: (dataItem: any) => {
    const sqlWhere = AssigneesSQL.buildWhereClause(dataItem)
    const orderBy = AssigneesSQL.buildOrderClause(dataItem)
    const offset = AssigneesSQL.num(dataItem.START, 0)
    const limit = AssigneesSQL.num(dataItem.LIMIT, 20)

    const sqlCount = `
                            SELECT
                                       COUNT(*) AS TOTAL_COUNT
                            FROM
                                       assignees_to
                            WHERE
                                       dataItem.SQLWHERE
        `

    let sqlData = `
                            SELECT 
                                       ASSIGNEES_TO_ID
                                     , EMPCODE
                                     , EMPNAME
                                     , EMPEMAIL
                                     , GROUP_CODE
                                     , GROUP_NAME
                                     , INUSE 
                            FROM
                                       assignees_to 
                            WHERE
                                       dataItem.SQLWHERE
                            ORDER BY
                                       dataItem.ORDERBY
                            LIMIT dataItem.LIMIT OFFSET dataItem.OFFSET
        `
    let sqlCountPrepared = sqlCount
    sqlCountPrepared = sqlCountPrepared.replaceAll('dataItem.SQLWHERE', sqlWhere)
    sqlData = sqlData.replaceAll('dataItem.SQLWHERE', sqlWhere)
    sqlData = sqlData.replaceAll('dataItem.ORDERBY', orderBy)
    sqlData = sqlData.replaceAll('dataItem.LIMIT', limit.toString())
    sqlData = sqlData.replaceAll('dataItem.OFFSET', offset.toString())

    return [sqlCountPrepared, sqlData]
  },

  insert: (dataItem: any) => {
    let sql = `
                            INSERT INTO assignees_to (
                                       EMPCODE
                                     , EMPNAME
                                     , EMPEMAIL
                                     , GROUP_CODE
                                     , GROUP_NAME
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       'dataItem.EMPCODE'
                                     , 'dataItem.EMPNAME'
                                     , 'dataItem.EMPEMAIL'
                                     , 'dataItem.GROUP_CODE'
                                     , 'dataItem.GROUP_NAME'
                                     , LEFT(CONCAT('dataItem.GROUP_NAME', ': ', 'dataItem.EMPNAME'), 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.UPDATE_BY'
                                     ,  dataItem.INUSE
                            )
        `
    sql = sql.replaceAll('dataItem.EMPCODE', dataItem.EMPCODE)
    sql = sql.replaceAll('dataItem.EMPNAME', dataItem.EMPNAME)
    sql = sql.replaceAll('dataItem.EMPEMAIL', dataItem.EMPEMAIL)
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem.GROUP_CODE)
    sql = sql.replaceAll('dataItem.GROUP_NAME', dataItem.GROUP_NAME)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.INUSE', (dataItem.INUSE !== undefined ? dataItem.INUSE : 1).toString())

    return sql
  },

  update: (dataItem: any) => {
    let sql = `
                            UPDATE assignees_to SET
                                       EMPCODE = 'dataItem.EMPCODE'
                                     , EMPNAME = 'dataItem.EMPNAME'
                                     , EMPEMAIL = 'dataItem.EMPEMAIL'
                                     , GROUP_CODE = 'dataItem.GROUP_CODE'
                                     , GROUP_NAME = 'dataItem.GROUP_NAME'
                                     , DESCRIPTION = LEFT(CONCAT('dataItem.GROUP_NAME', ': ', 'dataItem.EMPNAME'), 100)
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                                     , INUSE = dataItem.INUSE
                            WHERE
                                       ASSIGNEES_TO_ID = dataItem.ASSIGNEES_TO_ID
        `
    sql = sql.replaceAll('dataItem.EMPCODE', dataItem.EMPCODE)
    sql = sql.replaceAll('dataItem.EMPNAME', dataItem.EMPNAME)
    sql = sql.replaceAll('dataItem.EMPEMAIL', dataItem.EMPEMAIL)
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem.GROUP_CODE)
    sql = sql.replaceAll('dataItem.GROUP_NAME', dataItem.GROUP_NAME)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.INUSE', (dataItem.INUSE !== undefined ? dataItem.INUSE : 1).toString())
    sql = sql.replaceAll('dataItem.ASSIGNEES_TO_ID', (dataItem.ASSIGNEES_TO_ID || 0).toString())

    return sql
  },

  findDuplicate: (dataItem: any) => {
    let sql = `
                            SELECT
                                       ASSIGNEES_TO_ID
                                     , EMPCODE
                                     , GROUP_CODE
                                     , INUSE
                            FROM
                                       assignees_to
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                                       AND GROUP_CODE = 'dataItem.GROUP_CODE'
                                       dataItem.EXCLUDEIDSQL
                            LIMIT
                                       1
        `
    let excludeIdSql = ''
    if (dataItem.ASSIGNEES_TO_ID) {
      excludeIdSql = ` AND ASSIGNEES_TO_ID <> dataItem.ASSIGNEES_TO_ID`
      excludeIdSql = excludeIdSql.replaceAll('dataItem.ASSIGNEES_TO_ID', (Number(dataItem.ASSIGNEES_TO_ID) || 0).toString())
    }

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem.EMPCODE)
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem.GROUP_CODE)
    sql = sql.replaceAll('dataItem.EXCLUDEIDSQL', excludeIdSql)

    return sql
  },
}

