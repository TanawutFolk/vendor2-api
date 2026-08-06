export const BlacklistSQL = {
  search: (dataItem: any) => {
    const groupCode = String(dataItem.GROUP_CODE || '')
      .trim()
      .toUpperCase()
    const keyword = String(dataItem.VENDOR_NAME || '').trim()

    const keywordValue = keyword
    const keywordUpperValue = keyword.toUpperCase()

    let usKeywordSql = keyword
      ? ` AND (
                   bu.NAME LIKE '%dataItem.KEYWORDVAL%'
                OR bu.ALT_NAMES LIKE '%dataItem.KEYWORDVAL%'
                OR bu.SOURCE LIKE '%dataItem.KEYWORDVAL%'
            )`
      : ''

    usKeywordSql = usKeywordSql.replaceAll('dataItem.KEYWORDVAL', keywordValue)

    let cnKeywordSql = keyword
      ? ` AND (
                   bc.PRIMARY_NAME LIKE '%dataItem.KEYWORDVAL%'
                OR bc.NORMALIZED_NAME LIKE '%dataItem.KEYWORDUPPERVAL%'
                OR EXISTS (
                    SELECT 1
                    FROM blacklist_cn_aliases va
                    WHERE va.BLACKLIST_CN_ID = bc.BLACKLIST_CN_ID
                      AND va.INUSE = 1
                      AND (
                           va.ALIAS_NAME LIKE '%dataItem.KEYWORDVAL%'
                        OR va.NORMALIZED_ALIAS_NAME LIKE '%dataItem.KEYWORDUPPERVAL%'
                      )
                )
            )`
      : ''

    cnKeywordSql = cnKeywordSql.replaceAll('dataItem.KEYWORDUPPERVAL', keywordUpperValue)
    cnKeywordSql = cnKeywordSql.replaceAll('dataItem.KEYWORDVAL', keywordValue)

    let usSql = `
            SELECT
                  bu.BLACKLIST_US_ID AS BLACKLIST_ID
                , 'US' AS GROUP_CODE
                , bu.SOURCE AS SOURCE_NAME
                , bu.ENTITY_NUMBER AS ENTITY_NUMBER
                , bu.TYPE AS ENTITY_TYPE
                , bu.PROGRAMS AS PROGRAMS
                , NULL AS COUNTRY
                , bu.NAME AS VENDOR_NAME
                , NULL AS WMD_TYPE
                , bu.DESCRIPTION AS DESCRIPTION
                , bu.CREATE_BY AS CREATE_BY
                , bu.UPDATE_BY AS UPDATE_BY
                , bu.INUSE AS IN_USE
                , 0 AS ALIAS_COUNT
                , bu.UPDATE_DATE AS UPDATED_DATE
                , bu.CREATE_DATE AS CREATE_DATE
            FROM
                blacklist_us bu
            WHERE
                bu.INUSE = 1
                dataItem.USKEYWORDSQL
        `

    usSql = usSql.replaceAll('dataItem.USKEYWORDSQL', usKeywordSql)

    let cnSql = `
            SELECT
                  bc.BLACKLIST_CN_ID AS BLACKLIST_ID
                , 'CN' AS GROUP_CODE
                , bc.SOURCE_NAME
                , bc.ENTITY_NUMBER
                , bc.ENTITY_TYPE
                , bc.PROGRAMS
                , bc.COUNTRY
                , bc.PRIMARY_NAME AS VENDOR_NAME
                , bc.WMD_TYPE
                , bc.DESCRIPTION AS DESCRIPTION
                , bc.CREATE_BY AS CREATE_BY
                , bc.UPDATE_BY AS UPDATE_BY
                , bc.INUSE AS IN_USE
                , (
                    SELECT COUNT(*)
                    FROM blacklist_cn_aliases va
                    WHERE va.BLACKLIST_CN_ID = bc.BLACKLIST_CN_ID
                      AND va.INUSE = 1
                ) AS ALIAS_COUNT
                , bc.UPDATE_DATE AS UPDATED_DATE
                , bc.CREATE_DATE AS CREATE_DATE
            FROM
                blacklist_cn bc
            WHERE
                bc.INUSE = 1
                dataItem.CNKEYWORDSQL
        `

    cnSql = cnSql.replaceAll('dataItem.CNKEYWORDSQL', cnKeywordSql)

    if (groupCode === 'US') {
      let sql = `
                dataItem.USSQL
                ORDER BY VENDOR_NAME ASC
            `

      sql = sql.replaceAll('dataItem.USSQL', usSql)

      return sql
    }

    if (groupCode === 'CN') {
      let sql = `
                dataItem.CNSQL
                ORDER BY VENDOR_NAME ASC
            `

      sql = sql.replaceAll('dataItem.CNSQL', cnSql)

      return sql
    }

    let sql = `
            (dataItem.USSQL)
            UNION ALL
            (dataItem.CNSQL)
            ORDER BY VENDOR_NAME ASC
        `

    sql = sql.replaceAll('dataItem.USSQL', usSql)
    sql = sql.replaceAll('dataItem.CNSQL', cnSql)

    return sql
  },

  searchAgGrid: (dataItem: any) => {
    const sqlWhereClause = String(dataItem.SQLWHERE || '')
      .trim()
      .replace(/^WHERE\s+/i, 'AND ')

    const baseSql = `
            SELECT
                  bu.BLACKLIST_US_ID AS BLACKLIST_ID
                , 'US' AS GROUP_CODE
                , bu.SOURCE AS SOURCE_NAME
                , bu.ENTITY_NUMBER AS ENTITY_NUMBER
                , bu.TYPE AS ENTITY_TYPE
                , bu.PROGRAMS AS PROGRAMS
                , NULL AS COUNTRY
                , bu.NAME AS VENDOR_NAME
                , NULL AS WMD_TYPE
                , bu.DESCRIPTION AS DESCRIPTION
                , bu.CREATE_BY AS CREATE_BY
                , bu.UPDATE_BY AS UPDATE_BY
                , bu.INUSE AS IN_USE
                , 0 AS ALIAS_COUNT
                , bu.UPDATE_DATE AS UPDATED_DATE
                , bu.CREATE_DATE AS CREATE_DATE
            FROM
                blacklist_us bu
            WHERE
                bu.INUSE = 1

            UNION ALL

            SELECT
                  bc.BLACKLIST_CN_ID AS BLACKLIST_ID
                , 'CN' AS GROUP_CODE
                , bc.SOURCE_NAME
                , bc.ENTITY_NUMBER
                , bc.ENTITY_TYPE
                , bc.PROGRAMS
                , bc.COUNTRY
                , bc.PRIMARY_NAME AS VENDOR_NAME
                , bc.WMD_TYPE
                , bc.DESCRIPTION AS DESCRIPTION
                , bc.CREATE_BY AS CREATE_BY
                , bc.UPDATE_BY AS UPDATE_BY
                , bc.INUSE AS IN_USE
                , (
                    SELECT COUNT(*)
                    FROM blacklist_cn_aliases va
                    WHERE va.BLACKLIST_CN_ID = bc.BLACKLIST_CN_ID
                      AND va.INUSE = 1
                ) AS ALIAS_COUNT
                , bc.UPDATE_DATE AS UPDATED_DATE
                , bc.CREATE_DATE AS CREATE_DATE
            FROM
                blacklist_cn bc
            WHERE
                bc.INUSE = 1
        `

    let sqlCount = `
            SELECT
                COUNT(*) AS TOTAL_COUNT
            FROM (
                dataItem.BASESQL
            ) bl
            WHERE
                1 = 1
                dataItem.SQLWHERE
        `

    let sqlData = `
            SELECT
                *
            FROM (
                dataItem.BASESQL
            ) bl
            WHERE
                1 = 1
                dataItem.SQLWHERE
            ORDER BY
                dataItem.ORDER
            LIMIT
                dataItem.LIMIT OFFSET dataItem.OFFSET
        `

    sqlCount = sqlCount.replaceAll('dataItem.BASESQL', baseSql)
    sqlCount = sqlCount.replaceAll('dataItem.SQLWHERE', sqlWhereClause)

    sqlData = sqlData.replaceAll('dataItem.BASESQL', baseSql)
    sqlData = sqlData.replaceAll('dataItem.SQLWHERE', sqlWhereClause)
    sqlData = sqlData.replaceAll('dataItem.ORDER', dataItem.ORDER || 'bl.updated_date DESC')
    sqlData = sqlData.replaceAll('dataItem.LIMIT', String(dataItem.LIMIT || 20))
    sqlData = sqlData.replaceAll('dataItem.OFFSET', String(dataItem.OFFSET || 0))

    return [sqlCount, sqlData]
  },

  deactivateUs: (updateBy: any) => {
    let sql = `
    UPDATE blacklist_us
    SET
      INUSE = 0,
      UPDATE_BY = 'dataItem.UPDATE_BY',
      UPDATE_DATE = NOW()
    WHERE INUSE = 1
  `
    sql = sql.replaceAll('dataItem.UPDATE_BY', String(updateBy || 'SYSTEM'))
    return sql
  },
  deactivateCnAliases: (updateBy: any) => {
    let sql = `
    UPDATE blacklist_cn_aliases
    SET
      INUSE = 0,
      UPDATE_BY = 'dataItem.UPDATE_BY',
      UPDATE_DATE = NOW()
    WHERE INUSE = 1
  `
    sql = sql.replaceAll('dataItem.UPDATE_BY', String(updateBy || 'SYSTEM'))
    return sql
  },
  deactivateCn: (updateBy: any) => {
    let sql = `
    UPDATE blacklist_cn
    SET
      INUSE = 0,
      UPDATE_BY = 'dataItem.UPDATE_BY',
      UPDATE_DATE = NOW()
    WHERE INUSE = 1
  `
    sql = sql.replaceAll('dataItem.UPDATE_BY', String(updateBy || 'SYSTEM'))
    return sql
  },

  insertUs: (dataItem: any) => {
    let sql = `
        INSERT INTO blacklist_us (
              SOURCE
            , ENTITY_NUMBER
            , TYPE
            , PROGRAMS
            , NAME
            , TITLE
            , ADDRESSES
            , FEDERAL_REGISTER_NOTICE
            , START_DATE
            , END_DATE
            , STANDARD_ORDER
            , LICENSE_REQUIREMENT
            , LICENSE_POLICY
            , VESSEL_INFORMATION
            , REMARKS
            , SOURCE_LIST_URL
            , ALT_NAMES
            , CITIZENSHIPS
            , DATES_OF_BIRTH
            , NATIONALITIES
            , PLACES_OF_BIRTH
            , SOURCE_INFORMATION_URL
            , DESCRIPTION
            , CREATE_BY
            , UPDATE_BY
            , INUSE
        ) VALUES (
              dataItem.SOURCE
            , dataItem.ENTITY_NUMBER
            , dataItem.ENTITY_TYPE
            , dataItem.PROGRAMS
            , 'dataItem.NAME'
            , dataItem.TITLE
            , dataItem.ADDRESSES
            , dataItem.FEDERAL_REGISTER_NOTICE
            , dataItem.START_DATE
            , dataItem.END_DATE
            , dataItem.STANDARD_ORDER
            , dataItem.LICENSE_REQUIREMENT
            , dataItem.LICENSE_POLICY
            , dataItem.VESSEL_INFORMATION
            , dataItem.REMARKS
            , dataItem.SOURCE_LIST_URL
            , dataItem.ALT_NAMES
            , dataItem.CITIZENSHIPS
            , dataItem.DATES_OF_BIRTH
            , dataItem.NATIONALITIES
            , dataItem.PLACES_OF_BIRTH
            , dataItem.SOURCE_INFORMATION_URL
            , dataItem.DESCRIPTION
            , 'dataItem.CREATE_BY'
            , dataItem.UPDATE_BY
            , dataItem.INUSE
        )
    `

    // âš ï¸  Order matters: replace longer keys BEFORE shorter ones that share a prefix
    //    e.g. 'dataItem.SOURCE_LIST_URL' must come before 'dataItem.SOURCE'
    sql = sql.replaceAll('dataItem.SOURCE_LIST_URL', nullableSqlText(dataItem.SOURCE_LIST_URL))
    sql = sql.replaceAll('dataItem.SOURCE_INFORMATION_URL', nullableSqlText(dataItem.SOURCE_INFORMATION_URL))
    sql = sql.replaceAll('dataItem.SOURCE', nullableSqlText(dataItem.SOURCE))
    sql = sql.replaceAll('dataItem.ENTITY_NUMBER', nullableSqlText(dataItem.ENTITY_NUMBER))
    sql = sql.replaceAll('dataItem.ENTITY_TYPE', nullableSqlText(dataItem.ENTITY_TYPE))
    sql = sql.replaceAll('dataItem.PROGRAMS', nullableSqlText(dataItem.PROGRAMS))
    sql = sql.replaceAll('dataItem.NAME', dataItem.NAME)
    sql = sql.replaceAll('dataItem.TITLE', nullableSqlText(dataItem.TITLE))
    sql = sql.replaceAll('dataItem.ADDRESSES', nullableSqlText(dataItem.ADDRESSES))
    sql = sql.replaceAll('dataItem.FEDERAL_REGISTER_NOTICE', nullableSqlText(dataItem.FEDERAL_REGISTER_NOTICE))
    sql = sql.replaceAll('dataItem.START_DATE', nullableSqlText(dataItem.START_DATE))
    sql = sql.replaceAll('dataItem.END_DATE', nullableSqlText(dataItem.END_DATE))
    sql = sql.replaceAll('dataItem.STANDARD_ORDER', nullableSqlText(dataItem.STANDARD_ORDER))
    sql = sql.replaceAll('dataItem.LICENSE_REQUIREMENT', nullableSqlText(dataItem.LICENSE_REQUIREMENT))
    sql = sql.replaceAll('dataItem.LICENSE_POLICY', nullableSqlText(dataItem.LICENSE_POLICY))
    sql = sql.replaceAll('dataItem.VESSEL_INFORMATION', nullableSqlText(dataItem.VESSEL_INFORMATION))
    sql = sql.replaceAll('dataItem.REMARKS', nullableSqlText(dataItem.REMARKS))
    sql = sql.replaceAll('dataItem.ALT_NAMES', nullableSqlText(dataItem.ALT_NAMES))
    sql = sql.replaceAll('dataItem.CITIZENSHIPS', nullableSqlText(dataItem.CITIZENSHIPS))
    sql = sql.replaceAll('dataItem.DATES_OF_BIRTH', nullableSqlText(dataItem.DATES_OF_BIRTH))
    sql = sql.replaceAll('dataItem.NATIONALITIES', nullableSqlText(dataItem.NATIONALITIES))
    sql = sql.replaceAll('dataItem.PLACES_OF_BIRTH', nullableSqlText(dataItem.PLACES_OF_BIRTH))
    sql = sql.replaceAll('dataItem.DESCRIPTION', nullableSqlText(dataItem.DESCRIPTION))
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)
    sql = sql.replaceAll('dataItem.UPDATE_BY', nullableSqlText(dataItem.UPDATE_BY))
    sql = sql.replaceAll('dataItem.INUSE', String(dataItem.INUSE ?? 1))

    return sql
  },

  insertCn: (dataItem: any) => {
    let sql = `
        INSERT INTO blacklist_cn (
              SOURCE_NAME
            , ENTITY_NUMBER
            , ENTITY_TYPE
            , PROGRAMS
            , COUNTRY
            , PRIMARY_NAME
            , NORMALIZED_NAME
            , WMD_TYPE
            , RAW_PAYLOAD
            , DESCRIPTION
            , CREATE_BY
            , UPDATE_BY
            , INUSE
        ) VALUES (
              dataItem.SOURCE_NAME
            , dataItem.ENTITY_NUMBER
            , dataItem.ENTITY_TYPE
            , dataItem.PROGRAMS
            , dataItem.COUNTRY
            , 'dataItem.PRIMARY_NAME'
            , 'dataItem.NORMALIZED_NAME'
            , dataItem.WMD_TYPE
            , dataItem.RAW_PAYLOAD
            , dataItem.DESCRIPTION
            , 'dataItem.CREATE_BY'
            , dataItem.UPDATE_BY
            , dataItem.INUSE
        )
    `

    sql = sql.replaceAll('dataItem.SOURCE_NAME', nullableSqlText(dataItem.SOURCE_NAME))
    sql = sql.replaceAll('dataItem.ENTITY_NUMBER', nullableSqlText(dataItem.ENTITY_NUMBER))
    sql = sql.replaceAll('dataItem.ENTITY_TYPE', nullableSqlText(dataItem.ENTITY_TYPE))
    sql = sql.replaceAll('dataItem.PROGRAMS', nullableSqlText(dataItem.PROGRAMS))
    sql = sql.replaceAll('dataItem.COUNTRY', nullableSqlText(dataItem.COUNTRY))
    sql = sql.replaceAll('dataItem.PRIMARY_NAME', dataItem.PRIMARY_NAME)
    sql = sql.replaceAll('dataItem.NORMALIZED_NAME', dataItem.NORMALIZED_NAME)
    sql = sql.replaceAll('dataItem.WMD_TYPE', nullableSqlText(dataItem.WMD_TYPE))
    sql = sql.replaceAll('dataItem.RAW_PAYLOAD', nullableSqlText(dataItem.RAW_PAYLOAD))
    sql = sql.replaceAll('dataItem.DESCRIPTION', nullableSqlText(dataItem.DESCRIPTION))
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)
    sql = sql.replaceAll('dataItem.UPDATE_BY', nullableSqlText(dataItem.UPDATE_BY))
    sql = sql.replaceAll('dataItem.INUSE', String(dataItem.INUSE ?? 1))

    return sql
  },

  insertAlias: (dataItem: any) => {
    let sql = `
                INSERT INTO blacklist_cn_aliases (
              BLACKLIST_CN_ID
            , ALIAS_NAME
            , NORMALIZED_ALIAS_NAME
            , DESCRIPTION
            , CREATE_BY
            , UPDATE_BY
            , INUSE
        ) VALUES (
              dataItem.BLACKLIST_CN_ID
            , 'dataItem.ALIAS_NAME'
            , 'dataItem.NORMALIZED_ALIAS_NAME'
            , dataItem.DESCRIPTION
            , 'dataItem.CREATE_BY'
            , dataItem.UPDATE_BY
            , dataItem.INUSE
        )
    `

    sql = sql.replaceAll('dataItem.BLACKLIST_CN_ID', String(dataItem.BLACKLIST_CN_ID ?? dataItem.blacklist_cn_id))
    sql = sql.replaceAll('dataItem.ALIAS_NAME', dataItem.ALIAS_NAME)
    sql = sql.replaceAll('dataItem.NORMALIZED_ALIAS_NAME', dataItem.NORMALIZED_ALIAS_NAME)
    sql = sql.replaceAll('dataItem.DESCRIPTION', nullableSqlText(dataItem.DESCRIPTION))
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)
    sql = sql.replaceAll('dataItem.UPDATE_BY', nullableSqlText(dataItem.UPDATE_BY))
    sql = sql.replaceAll('dataItem.INUSE', String(dataItem.INUSE ?? 1))

    return sql
  },

  // â”€â”€â”€ Blacklist check for Add Vendor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // normalizedCompanyName must already be normalized (uppercase, punctuation stripped)
  checkBlacklist: (normalizedCompanyName: any) => {
    const normalizedNameValue = normalizedCompanyName

    let sql = `
            SELECT
                  GROUP_CODE
                , MATCHED_NAME
                , MATCH_TYPE
                , SOURCE_NAME
                , ENTITY_NUMBER
                , ENTITY_TYPE
                , ADDRESSES
                , PROGRAMS
            FROM (
                SELECT
                      'US' AS GROUP_CODE
                    , bu.NAME AS MATCHED_NAME
                    , 'name' AS MATCH_TYPE
                    , bu.SOURCE AS SOURCE_NAME
                    , bu.ENTITY_NUMBER AS ENTITY_NUMBER
                    , bu.TYPE AS ENTITY_TYPE
                    , bu.ADDRESSES AS ADDRESSES
                    , bu.PROGRAMS AS PROGRAMS
                FROM blacklist_us bu
                WHERE bu.INUSE = 1
                  AND TRIM(REGEXP_REPLACE(
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(bu.NAME,
                            '.', ' '), ',', ' '), '(', ' '), ')', ' '), '-', ' '), '/', ' ')),
                        ' {2,}', ' ')) = 'dataItem.NORMALIZEDCOMPANYNAME'

                UNION ALL

                SELECT
                      'CN' AS GROUP_CODE
                    , bc.PRIMARY_NAME AS MATCHED_NAME
                    , 'name' AS MATCH_TYPE
                    , bc.SOURCE_NAME
                    , bc.ENTITY_NUMBER
                    , bc.ENTITY_TYPE
                    , bc.COUNTRY AS ADDRESSES
                    , bc.PROGRAMS
                FROM blacklist_cn bc
                WHERE bc.INUSE = 1
                  AND bc.NORMALIZED_NAME = 'dataItem.NORMALIZEDCOMPANYNAME'

                UNION ALL

                SELECT
                      'CN' AS GROUP_CODE
                    , bca.ALIAS_NAME AS MATCHED_NAME
                    , 'alias' AS MATCH_TYPE
                    , bc.SOURCE_NAME
                    , bc.ENTITY_NUMBER
                    , bc.ENTITY_TYPE
                    , bc.COUNTRY AS ADDRESSES
                    , bc.PROGRAMS
                FROM blacklist_cn_aliases bca
                JOIN blacklist_cn bc ON bc.BLACKLIST_CN_ID = bca.BLACKLIST_CN_ID AND bc.INUSE = 1
                WHERE bca.INUSE = 1
                  AND bca.NORMALIZED_ALIAS_NAME = 'dataItem.NORMALIZEDCOMPANYNAME'
            ) AS MATCHES
            ORDER BY GROUP_CODE ASC, MATCH_TYPE ASC
        `

    sql = sql.replaceAll('dataItem.NORMALIZEDCOMPANYNAME', normalizedNameValue)

    return sql
  },
}

function nullableSqlText(value: any) {
  return value ? "'" + value + "'" : 'NULL'
}
