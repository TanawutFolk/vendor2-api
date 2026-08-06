export const AssigneesSQL = {
  num: (value: any, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  },

  parseSearchFilters: (dataItem: any) => {
    const searchFilterMap = new Map<any, any>()

    for (const item of Array.isArray(dataItem.SEARCHFILTERS) ? dataItem.SEARCHFILTERS : []) {
      if (item?.id) searchFilterMap.set(item.id, item.value)
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
      let keywordVal = '%dataItem.SEARCH_KEYWORD%'
      keywordVal = keywordVal.replaceAll('dataItem.SEARCH_KEYWORD', String(filters.keyword))
      let keywordSql =
        '(agm.EMPNAME LIKE \'dataItem.KEYWORDVAL\' OR agm.EMPCODE LIKE \'dataItem.KEYWORDVAL\' OR agm.EMPEMAIL LIKE \'dataItem.KEYWORDVAL\')'
      keywordSql = keywordSql.replaceAll('dataItem.KEYWORDVAL', keywordVal)
      whereParts.push(keywordSql)
    }

    if (filters.group_code) {
      let groupSql = 'ag.GROUP_CODE = \'dataItem.GROUP_CODE\''
      groupSql = groupSql.replaceAll('dataItem.GROUP_CODE', filters.group_code)
      whereParts.push(groupSql)
    }

    if (filters.in_use !== '') {
      let inUseSql = 'agm.INUSE = dataItem.IN_USE'
      inUseSql = inUseSql.replaceAll('dataItem.IN_USE', AssigneesSQL.num(filters.in_use).toString())
      whereParts.push(inUseSql)
    }

    return whereParts.join('\n              AND ')
  },

  buildOrderClause: (dataItem: any) => {
    const sortableColumns: any = {
      ASSIGNEES_TO_ID: 'agm.APPROVAL_GROUP_MEMBER_ID',
      Assignees_id: 'agm.APPROVAL_GROUP_MEMBER_ID',
      EMPCODE: 'agm.EMPCODE',
      empcode: 'agm.EMPCODE',
      EMPNAME: 'agm.EMPNAME',
      empName: 'agm.EMPNAME',
      EMPEMAIL: 'agm.EMPEMAIL',
      empEmail: 'agm.EMPEMAIL',
      GROUP_CODE: 'ag.GROUP_CODE',
      group_code: 'ag.GROUP_CODE',
      GROUP_NAME: 'ag.GROUP_NAME',
      group_name: 'ag.GROUP_NAME',
      INUSE: 'agm.INUSE',
    }

    const orderItems = (Array.isArray(dataItem.ORDER) ? dataItem.ORDER : [])
      .map((item: any) => {
        const column = sortableColumns[item?.id || '']
        if (!column) return null

        let sql = 'dataItem.ORDER_COLUMN dataItem.ORDER_DIRECTION'
        sql = sql.replaceAll('dataItem.ORDER_COLUMN', column)
        sql = sql.replaceAll('dataItem.ORDER_DIRECTION', item?.desc ? 'DESC' : 'ASC')
        return sql
      })
      .filter(Boolean)

    return orderItems.length > 0 ? orderItems.join(', ') : 'ag.GROUP_CODE ASC, agm.EMPCODE ASC'
  },

  getGroups: (_dataItem: any) => `
    SELECT
        APPROVAL_GROUP_ID,
        GROUP_CODE,
        GROUP_NAME
    FROM approval_group
    WHERE INUSE = 1
    ORDER BY GROUP_CODE ASC
  `,

  search: (dataItem: any) => {
    const sqlWhere = AssigneesSQL.buildWhereClause(dataItem)
    const orderBy = AssigneesSQL.buildOrderClause(dataItem)
    const offset = AssigneesSQL.num(dataItem.START, 0)
    const limit = AssigneesSQL.num(dataItem.LIMIT, 20)

    let sqlCount = `
      SELECT COUNT(*) AS TOTAL_COUNT
      FROM approval_group_member agm
      JOIN approval_group ag
        ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
      WHERE dataItem.SQLWHERE
    `

    let sqlData = `
      SELECT
          agm.APPROVAL_GROUP_MEMBER_ID AS ASSIGNEES_TO_ID,
          agm.APPROVAL_GROUP_MEMBER_ID,
          ag.APPROVAL_GROUP_ID,
          agm.EMPCODE,
          agm.EMPNAME,
          agm.EMPEMAIL,
          ag.GROUP_CODE,
          ag.GROUP_NAME,
          agm.PRIORITY_NO,
          agm.IS_PRIMARY,
          agm.INUSE
      FROM approval_group_member agm
      JOIN approval_group ag
        ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
      WHERE dataItem.SQLWHERE
      ORDER BY dataItem.ORDERBY
      LIMIT dataItem.LIMIT OFFSET dataItem.OFFSET
    `

    sqlCount = sqlCount.replaceAll('dataItem.SQLWHERE', sqlWhere)
    sqlData = sqlData.replaceAll('dataItem.SQLWHERE', sqlWhere)
    sqlData = sqlData.replaceAll('dataItem.ORDERBY', orderBy)
    sqlData = sqlData.replaceAll('dataItem.LIMIT', limit.toString())
    sqlData = sqlData.replaceAll('dataItem.OFFSET', offset.toString())

    return [sqlCount, sqlData]
  },

  upsertGroup: (dataItem: any) => {
    let sql = `
      INSERT INTO approval_group (
          GROUP_CODE,
          GROUP_NAME,
          CREATE_BY,
          UPDATE_BY,
          INUSE,
          DESCRIPTION
      )
      VALUES (
          'dataItem.GROUP_CODE',
          'dataItem.GROUP_NAME',
          'dataItem.UPDATE_BY',
          'dataItem.UPDATE_BY',
          1,
          LEFT(CONCAT('Approval group: ', 'dataItem.GROUP_CODE'), 100)
      )
      ON DUPLICATE KEY UPDATE
          GROUP_NAME = VALUES(GROUP_NAME),
          UPDATE_BY = VALUES(UPDATE_BY),
          UPDATE_DATE = NOW(),
          INUSE = 1
    `
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem.GROUP_CODE)
    sql = sql.replaceAll('dataItem.GROUP_NAME', dataItem.GROUP_NAME || dataItem.GROUP_CODE)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    return sql
  },

  insert: (dataItem: any) => {
    let sql = `
      INSERT INTO approval_group_member (
          APPROVAL_GROUP_ID,
          EMPCODE,
          EMPNAME,
          EMPEMAIL,
          PRIORITY_NO,
          IS_PRIMARY,
          CREATE_BY,
          UPDATE_BY,
          INUSE,
          DESCRIPTION
      )
      SELECT
          ag.APPROVAL_GROUP_ID,
          'dataItem.EMPCODE',
          'dataItem.EMPNAME',
          'dataItem.EMPEMAIL',
          dataItem.PRIORITY_NO,
          dataItem.IS_PRIMARY,
          'dataItem.CREATE_BY',
          'dataItem.UPDATE_BY',
          dataItem.INUSE,
          LEFT(CONCAT(ag.GROUP_NAME, ': ', 'dataItem.EMPNAME'), 100)
      FROM approval_group ag
      WHERE ag.GROUP_CODE = 'dataItem.GROUP_CODE'
      LIMIT 1
    `
    sql = sql.replaceAll('dataItem.EMPCODE', dataItem.EMPCODE)
    sql = sql.replaceAll('dataItem.EMPNAME', dataItem.EMPNAME)
    sql = sql.replaceAll('dataItem.EMPEMAIL', dataItem.EMPEMAIL)
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem.GROUP_CODE)
    sql = sql.replaceAll('dataItem.PRIORITY_NO', AssigneesSQL.num(dataItem.PRIORITY_NO, 1).toString())
    sql = sql.replaceAll('dataItem.IS_PRIMARY', AssigneesSQL.num(dataItem.IS_PRIMARY, 0).toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.INUSE', (dataItem.INUSE !== undefined ? dataItem.INUSE : 1).toString())
    return sql
  },

  update: (dataItem: any) => {
    let sql = `
      UPDATE approval_group_member agm
      JOIN approval_group ag
        ON ag.GROUP_CODE = 'dataItem.GROUP_CODE'
      SET agm.APPROVAL_GROUP_ID = ag.APPROVAL_GROUP_ID,
          agm.EMPCODE = 'dataItem.EMPCODE',
          agm.EMPNAME = 'dataItem.EMPNAME',
          agm.EMPEMAIL = 'dataItem.EMPEMAIL',
          agm.PRIORITY_NO = dataItem.PRIORITY_NO,
          agm.IS_PRIMARY = dataItem.IS_PRIMARY,
          agm.DESCRIPTION = LEFT(CONCAT(ag.GROUP_NAME, ': ', 'dataItem.EMPNAME'), 100),
          agm.UPDATE_BY = 'dataItem.UPDATE_BY',
          agm.UPDATE_DATE = NOW(),
          agm.INUSE = dataItem.INUSE
      WHERE agm.APPROVAL_GROUP_MEMBER_ID = dataItem.ASSIGNEES_TO_ID
    `
    sql = sql.replaceAll('dataItem.EMPCODE', dataItem.EMPCODE)
    sql = sql.replaceAll('dataItem.EMPNAME', dataItem.EMPNAME)
    sql = sql.replaceAll('dataItem.EMPEMAIL', dataItem.EMPEMAIL)
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem.GROUP_CODE)
    sql = sql.replaceAll('dataItem.PRIORITY_NO', AssigneesSQL.num(dataItem.PRIORITY_NO, 1).toString())
    sql = sql.replaceAll('dataItem.IS_PRIMARY', AssigneesSQL.num(dataItem.IS_PRIMARY, 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || 'SYSTEM')
    sql = sql.replaceAll('dataItem.INUSE', (dataItem.INUSE !== undefined ? dataItem.INUSE : 1).toString())
    sql = sql.replaceAll('dataItem.ASSIGNEES_TO_ID', AssigneesSQL.num(dataItem.ASSIGNEES_TO_ID).toString())
    return sql
  },

  findDuplicate: (dataItem: any) => {
    let excludeIdSql = ''
    if (dataItem.ASSIGNEES_TO_ID) {
      excludeIdSql = 'AND agm.APPROVAL_GROUP_MEMBER_ID <> dataItem.ASSIGNEES_TO_ID'
      excludeIdSql = excludeIdSql.replaceAll(
        'dataItem.ASSIGNEES_TO_ID',
        AssigneesSQL.num(dataItem.ASSIGNEES_TO_ID).toString()
      )
    }

    let sql = `
      SELECT
          agm.APPROVAL_GROUP_MEMBER_ID AS ASSIGNEES_TO_ID,
          agm.EMPCODE,
          ag.GROUP_CODE,
          agm.INUSE
      FROM approval_group_member agm
      JOIN approval_group ag
        ON ag.APPROVAL_GROUP_ID = agm.APPROVAL_GROUP_ID
      WHERE agm.EMPCODE = 'dataItem.EMPCODE'
        AND ag.GROUP_CODE = 'dataItem.GROUP_CODE'
        dataItem.EXCLUDEIDSQL
      LIMIT 1
    `
    sql = sql.replaceAll('dataItem.EMPCODE', dataItem.EMPCODE)
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem.GROUP_CODE)
    sql = sql.replaceAll('dataItem.EXCLUDEIDSQL', excludeIdSql)
    return sql
  },
}
