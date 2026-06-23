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
                  bu.BLACKLIST_US_ID AS blacklist_id
                , 'US' AS group_code
                , bu.SOURCE AS source_name
                , bu.ENTITY_NUMBER AS entity_number
                , bu.TYPE AS entity_type
                , bu.PROGRAMS AS programs
                , NULL AS country
                , bu.NAME AS vendor_name
                , NULL AS wmd_type
                , bu.DESCRIPTION AS description
                , bu.CREATE_BY AS create_by
                , bu.UPDATE_BY AS update_by
                , bu.INUSE AS in_use
                , 0 AS alias_count
                , bu.UPDATE_DATE AS updated_date
                , bu.CREATE_DATE AS create_date
            FROM
                blacklist_us bu
            WHERE
                bu.INUSE = 1
                dataItem.USKEYWORDSQL
        `

    usSql = usSql.replaceAll('dataItem.USKEYWORDSQL', usKeywordSql)

    let cnSql = `
            SELECT
                  bc.BLACKLIST_CN_ID AS blacklist_id
                , 'CN' AS group_code
                , bc.SOURCE_NAME
                , bc.ENTITY_NUMBER
                , bc.ENTITY_TYPE
                , bc.PROGRAMS
                , bc.COUNTRY
                , bc.PRIMARY_NAME AS vendor_name
                , bc.WMD_TYPE
                , bc.DESCRIPTION AS description
                , bc.CREATE_BY AS create_by
                , bc.UPDATE_BY AS update_by
                , bc.INUSE AS in_use
                , (
                    SELECT COUNT(*)
                    FROM blacklist_cn_aliases va
                    WHERE va.BLACKLIST_CN_ID = bc.BLACKLIST_CN_ID
                      AND va.INUSE = 1
                ) AS alias_count
                , bc.UPDATE_DATE AS updated_date
                , bc.CREATE_DATE AS create_date
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
                  bu.BLACKLIST_US_ID AS blacklist_id
                , 'US' AS group_code
                , bu.SOURCE AS source_name
                , bu.ENTITY_NUMBER AS entity_number
                , bu.TYPE AS entity_type
                , bu.PROGRAMS AS programs
                , NULL AS country
                , bu.NAME AS vendor_name
                , NULL AS wmd_type
                , bu.DESCRIPTION AS description
                , bu.CREATE_BY AS create_by
                , bu.UPDATE_BY AS update_by
                , bu.INUSE AS in_use
                , 0 AS alias_count
                , bu.UPDATE_DATE AS updated_date
                , bu.CREATE_DATE AS create_date
            FROM
                blacklist_us bu
            WHERE
                bu.INUSE = 1

            UNION ALL

            SELECT
                  bc.BLACKLIST_CN_ID AS blacklist_id
                , 'CN' AS group_code
                , bc.SOURCE_NAME
                , bc.ENTITY_NUMBER
                , bc.ENTITY_TYPE
                , bc.PROGRAMS
                , bc.COUNTRY
                , bc.PRIMARY_NAME AS vendor_name
                , bc.WMD_TYPE
                , bc.DESCRIPTION AS description
                , bc.CREATE_BY AS create_by
                , bc.UPDATE_BY AS update_by
                , bc.INUSE AS in_use
                , (
                    SELECT COUNT(*)
                    FROM blacklist_cn_aliases va
                    WHERE va.BLACKLIST_CN_ID = bc.BLACKLIST_CN_ID
                      AND va.INUSE = 1
                ) AS alias_count
                , bc.UPDATE_DATE AS updated_date
                , bc.CREATE_DATE AS create_date
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

  deactivateUs: (updateBy: any) => `
    UPDATE blacklist_us
    SET
      INUSE = 0,
      UPDATE_BY = '${updateBy || 'SYSTEM'}',
      UPDATE_DATE = NOW()
    WHERE INUSE = 1
  `,
  deactivateCnAliases: (updateBy: any) => `
    UPDATE blacklist_cn_aliases
    SET
      INUSE = 0,
      UPDATE_BY = '${updateBy || 'SYSTEM'}',
      UPDATE_DATE = NOW()
    WHERE INUSE = 1
  `,
  deactivateCn: (updateBy: any) => `
    UPDATE blacklist_cn
    SET
      INUSE = 0,
      UPDATE_BY = '${updateBy || 'SYSTEM'}',
      UPDATE_DATE = NOW()
    WHERE INUSE = 1
  `,

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
    sql = sql.replaceAll('dataItem.SOURCE_LIST_URL', dataItem.SOURCE_LIST_URL ? `'${dataItem.SOURCE_LIST_URL}'` : 'NULL')
    sql = sql.replaceAll('dataItem.SOURCE_INFORMATION_URL', dataItem.SOURCE_INFORMATION_URL ? `'${dataItem.SOURCE_INFORMATION_URL}'` : 'NULL')
    sql = sql.replaceAll('dataItem.SOURCE', dataItem.SOURCE ? `'${dataItem.SOURCE}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ENTITY_NUMBER', dataItem.ENTITY_NUMBER ? `'${dataItem.ENTITY_NUMBER}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ENTITY_TYPE', dataItem.ENTITY_TYPE ? `'${dataItem.ENTITY_TYPE}'` : 'NULL')
    sql = sql.replaceAll('dataItem.PROGRAMS', dataItem.PROGRAMS ? `'${dataItem.PROGRAMS}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NAME', dataItem.NAME)
    sql = sql.replaceAll('dataItem.TITLE', dataItem.TITLE ? `'${dataItem.TITLE}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ADDRESSES', dataItem.ADDRESSES ? `'${dataItem.ADDRESSES}'` : 'NULL')
    sql = sql.replaceAll('dataItem.FEDERAL_REGISTER_NOTICE', dataItem.FEDERAL_REGISTER_NOTICE ? `'${dataItem.FEDERAL_REGISTER_NOTICE}'` : 'NULL')
    sql = sql.replaceAll('dataItem.START_DATE', dataItem.START_DATE ? `'${dataItem.START_DATE}'` : 'NULL')
    sql = sql.replaceAll('dataItem.END_DATE', dataItem.END_DATE ? `'${dataItem.END_DATE}'` : 'NULL')
    sql = sql.replaceAll('dataItem.STANDARD_ORDER', dataItem.STANDARD_ORDER ? `'${dataItem.STANDARD_ORDER}'` : 'NULL')
    sql = sql.replaceAll('dataItem.LICENSE_REQUIREMENT', dataItem.LICENSE_REQUIREMENT ? `'${dataItem.LICENSE_REQUIREMENT}'` : 'NULL')
    sql = sql.replaceAll('dataItem.LICENSE_POLICY', dataItem.LICENSE_POLICY ? `'${dataItem.LICENSE_POLICY}'` : 'NULL')
    sql = sql.replaceAll('dataItem.VESSEL_INFORMATION', dataItem.VESSEL_INFORMATION ? `'${dataItem.VESSEL_INFORMATION}'` : 'NULL')
    sql = sql.replaceAll('dataItem.REMARKS', dataItem.REMARKS ? `'${dataItem.REMARKS}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ALT_NAMES', dataItem.ALT_NAMES ? `'${dataItem.ALT_NAMES}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CITIZENSHIPS', dataItem.CITIZENSHIPS ? `'${dataItem.CITIZENSHIPS}'` : 'NULL')
    sql = sql.replaceAll('dataItem.DATES_OF_BIRTH', dataItem.DATES_OF_BIRTH ? `'${dataItem.DATES_OF_BIRTH}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NATIONALITIES', dataItem.NATIONALITIES ? `'${dataItem.NATIONALITIES}'` : 'NULL')
    sql = sql.replaceAll('dataItem.PLACES_OF_BIRTH', dataItem.PLACES_OF_BIRTH ? `'${dataItem.PLACES_OF_BIRTH}'` : 'NULL')
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY ? `'${dataItem.UPDATE_BY}'` : 'NULL')
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

    sql = sql.replaceAll('dataItem.SOURCE_NAME', dataItem.SOURCE_NAME ? `'${dataItem.SOURCE_NAME}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ENTITY_NUMBER', dataItem.ENTITY_NUMBER ? `'${dataItem.ENTITY_NUMBER}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ENTITY_TYPE', dataItem.ENTITY_TYPE ? `'${dataItem.ENTITY_TYPE}'` : 'NULL')
    sql = sql.replaceAll('dataItem.PROGRAMS', dataItem.PROGRAMS ? `'${dataItem.PROGRAMS}'` : 'NULL')
    sql = sql.replaceAll('dataItem.COUNTRY', dataItem.COUNTRY ? `'${dataItem.COUNTRY}'` : 'NULL')
    sql = sql.replaceAll('dataItem.PRIMARY_NAME', dataItem.PRIMARY_NAME)
    sql = sql.replaceAll('dataItem.NORMALIZED_NAME', dataItem.NORMALIZED_NAME)
    sql = sql.replaceAll('dataItem.WMD_TYPE', dataItem.WMD_TYPE ? `'${dataItem.WMD_TYPE}'` : 'NULL')
    sql = sql.replaceAll('dataItem.RAW_PAYLOAD', dataItem.RAW_PAYLOAD ? `'${dataItem.RAW_PAYLOAD}'` : 'NULL')
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY ? `'${dataItem.UPDATE_BY}'` : 'NULL')
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
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem.DESCRIPTION ? `'${dataItem.DESCRIPTION}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY ? `'${dataItem.UPDATE_BY}'` : 'NULL')
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
                , matched_name
                , match_type
                , SOURCE_NAME
                , ENTITY_NUMBER
                , ENTITY_TYPE
                , addresses
                , PROGRAMS
            FROM (
                SELECT
                      'US' AS group_code
                    , bu.NAME AS matched_name
                    , 'name' AS match_type
                    , bu.SOURCE AS source_name
                    , bu.ENTITY_NUMBER AS entity_number
                    , bu.TYPE AS entity_type
                    , bu.ADDRESSES AS addresses
                    , bu.PROGRAMS AS programs
                FROM blacklist_us bu
                WHERE bu.INUSE = 1
                  AND TRIM(REGEXP_REPLACE(
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(bu.NAME,
                            '.', ' '), ',', ' '), '(', ' '), ')', ' '), '-', ' '), '/', ' ')),
                        ' {2,}', ' ')) = 'dataItem.NORMALIZEDCOMPANYNAME'

                UNION ALL

                SELECT
                      'CN' AS group_code
                    , bc.PRIMARY_NAME AS matched_name
                    , 'name' AS match_type
                    , bc.SOURCE_NAME
                    , bc.ENTITY_NUMBER
                    , bc.ENTITY_TYPE
                    , bc.COUNTRY AS addresses
                    , bc.PROGRAMS
                FROM blacklist_cn bc
                WHERE bc.INUSE = 1
                  AND bc.NORMALIZED_NAME = 'dataItem.NORMALIZEDCOMPANYNAME'

                UNION ALL

                SELECT
                      'CN' AS group_code
                    , bca.ALIAS_NAME AS matched_name
                    , 'alias' AS match_type
                    , bc.SOURCE_NAME
                    , bc.ENTITY_NUMBER
                    , bc.ENTITY_TYPE
                    , bc.COUNTRY AS addresses
                    , bc.PROGRAMS
                FROM blacklist_cn_aliases bca
                JOIN blacklist_cn bc ON bc.BLACKLIST_CN_ID = bca.BLACKLIST_CN_ID AND bc.INUSE = 1
                WHERE bca.INUSE = 1
                  AND bca.NORMALIZED_ALIAS_NAME = 'dataItem.NORMALIZEDCOMPANYNAME'
            ) AS matches
            ORDER BY GROUP_CODE ASC, match_type ASC
        `

    sql = sql.replaceAll('dataItem.NORMALIZEDCOMPANYNAME', normalizedNameValue)

    return sql
  },
}
