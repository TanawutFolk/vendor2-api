const esc = (value: any) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")

export interface BlacklistSearchDataItem {
  [key: string]: any
  vendor_name?: string
  group_code?: 'ALL' | 'US' | 'CN' | string
}

export interface BlacklistSearchAgGridDataItem {
  [key: string]: any
  sqlWhere?: string
  Order?: string
  Limit?: number | string
  Offset?: number | string
}

export interface BlacklistUsInsertDataItem {
  [key: string]: any
  source?: string | null
  entity_number?: string | null
  entity_type?: string | null
  programs?: string | null
  name: string
  title?: string | null
  addresses?: string | null
  federal_register_notice?: string | null
  start_date?: string | null
  end_date?: string | null
  standard_order?: string | null
  license_requirement?: string | null
  license_policy?: string | null
  vessel_information?: string | null
  remarks?: string | null
  source_list_url?: string | null
  alt_names?: string | null
  citizenships?: string | null
  dates_of_birth?: string | null
  nationalities?: string | null
  places_of_birth?: string | null
  source_information_url?: string | null
  description?: string | null
  CREATE_BY: string
  UPDATE_BY?: string | null
  INUSE?: number
}

export interface BlacklistCnInsertDataItem {
  [key: string]: any
  source_name?: string | null
  entity_number?: string | null
  entity_type?: string | null
  programs?: string | null
  country?: string | null
  primary_name: string
  normalized_name: string
  wmd_type?: string | null
  raw_payload?: string | null
  DESCRIPTION?: string | null
  CREATE_BY: string
  UPDATE_BY?: string | null
  INUSE?: number
}

export interface BlacklistAliasInsertDataItem {
  [key: string]: any
  vendor_id?: number
  alias_name?: string
  normalized_alias_name?: string
  CREATE_BY: string
  UPDATE_BY?: string | null
  DESCRIPTION?: string | null
  INUSE?: number
}

export const BlacklistSQL = {
  search: (dataItem: BlacklistSearchDataItem) => {
    const groupCode = String(dataItem.GROUP_CODE || '')
      .trim()
      .toUpperCase()
    const keyword = String(dataItem.VENDOR_NAME || '').trim()

    const escapedKeyword = esc(keyword)
    const escapedKeywordUpper = esc(keyword.toUpperCase())

    let usKeywordSql = keyword
      ? ` AND (
                   bu.NAME LIKE '%dataItem.KEYWORDVAL%'
                OR bu.ALT_NAMES LIKE '%dataItem.KEYWORDVAL%'
                OR bu.SOURCE LIKE '%dataItem.KEYWORDVAL%'
            )`
      : ''

    usKeywordSql = usKeywordSql.replaceAll('dataItem.KEYWORDVAL', escapedKeyword)

    let cnKeywordSql = keyword
      ? ` AND (
                   bc.PRIMARY_NAME LIKE '%dataItem.KEYWORDVAL%'
                OR bc.NORMALIZED_NAME LIKE '%dataItem.KEYWORDUPPERVAL%'
                OR EXISTS (
                    SELECT 1
                    FROM blacklist_cn_aliases va
                    WHERE va.VENDOR_ID = bc.ID
                      AND va.INUSE = 1
                      AND (
                           va.ALIAS_NAME LIKE '%dataItem.KEYWORDVAL%'
                        OR va.NORMALIZED_ALIAS_NAME LIKE '%dataItem.KEYWORDUPPERVAL%'
                      )
                )
            )`
      : ''

    cnKeywordSql = cnKeywordSql.replaceAll('dataItem.KEYWORDUPPERVAL', escapedKeywordUpper)
    cnKeywordSql = cnKeywordSql.replaceAll('dataItem.KEYWORDVAL', escapedKeyword)

    let usSql = `
            SELECT
                  bu.ID AS blacklist_id
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
                  bc.ID AS blacklist_id
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
                    WHERE va.VENDOR_ID = bc.ID
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

  searchAgGrid: (dataItem: BlacklistSearchAgGridDataItem) => {
    const sqlWhereClause = String(dataItem.SQLWHERE || '')
      .trim()
      .replace(/^WHERE\s+/i, 'AND ')

    const baseSql = `
            SELECT
                  bu.ID AS blacklist_id
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
                  bc.ID AS blacklist_id
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
                    WHERE va.VENDOR_ID = bc.ID
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

  deactivateUs: (updateBy: string) => `
    UPDATE blacklist_us
    SET
      INUSE = 0,
      UPDATE_BY = '${esc(updateBy || 'SYSTEM')}',
      UPDATE_DATE = NOW()
    WHERE INUSE = 1
  `,
  deactivateCnAliases: (updateBy: string) => `
    UPDATE blacklist_cn_aliases
    SET
      INUSE = 0,
      UPDATE_BY = '${esc(updateBy || 'SYSTEM')}',
      UPDATE_DATE = NOW()
    WHERE INUSE = 1
  `,
  deactivateCn: (updateBy: string) => `
    UPDATE blacklist_cn
    SET
      INUSE = 0,
      UPDATE_BY = '${esc(updateBy || 'SYSTEM')}',
      UPDATE_DATE = NOW()
    WHERE INUSE = 1
  `,

  insertUs: (dataItem: BlacklistUsInsertDataItem) => {
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

    // ⚠️  Order matters: replace longer keys BEFORE shorter ones that share a prefix
    //    e.g. 'dataItem.SOURCE_LIST_URL' must come before 'dataItem.SOURCE'
    sql = sql.replaceAll('dataItem.SOURCE_LIST_URL', dataItem.SOURCE_LIST_URL ? `'${esc(dataItem.SOURCE_LIST_URL)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.SOURCE_INFORMATION_URL', dataItem.SOURCE_INFORMATION_URL ? `'${esc(dataItem.SOURCE_INFORMATION_URL)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.SOURCE', dataItem.SOURCE ? `'${esc(dataItem.SOURCE)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ENTITY_NUMBER', dataItem.ENTITY_NUMBER ? `'${esc(dataItem.ENTITY_NUMBER)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ENTITY_TYPE', dataItem.ENTITY_TYPE ? `'${esc(dataItem.ENTITY_TYPE)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.PROGRAMS', dataItem.PROGRAMS ? `'${esc(dataItem.PROGRAMS)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NAME', esc(dataItem.NAME))
    sql = sql.replaceAll('dataItem.TITLE', dataItem.TITLE ? `'${esc(dataItem.TITLE)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ADDRESSES', dataItem.ADDRESSES ? `'${esc(dataItem.ADDRESSES)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.FEDERAL_REGISTER_NOTICE', dataItem.FEDERAL_REGISTER_NOTICE ? `'${esc(dataItem.FEDERAL_REGISTER_NOTICE)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.START_DATE', dataItem.START_DATE ? `'${esc(dataItem.START_DATE)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.END_DATE', dataItem.END_DATE ? `'${esc(dataItem.END_DATE)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.STANDARD_ORDER', dataItem.STANDARD_ORDER ? `'${esc(dataItem.STANDARD_ORDER)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.LICENSE_REQUIREMENT', dataItem.LICENSE_REQUIREMENT ? `'${esc(dataItem.LICENSE_REQUIREMENT)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.LICENSE_POLICY', dataItem.LICENSE_POLICY ? `'${esc(dataItem.LICENSE_POLICY)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.VESSEL_INFORMATION', dataItem.VESSEL_INFORMATION ? `'${esc(dataItem.VESSEL_INFORMATION)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.REMARKS', dataItem.REMARKS ? `'${esc(dataItem.REMARKS)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ALT_NAMES', dataItem.ALT_NAMES ? `'${esc(dataItem.ALT_NAMES)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CITIZENSHIPS', dataItem.CITIZENSHIPS ? `'${esc(dataItem.CITIZENSHIPS)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.DATES_OF_BIRTH', dataItem.DATES_OF_BIRTH ? `'${esc(dataItem.DATES_OF_BIRTH)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NATIONALITIES', dataItem.NATIONALITIES ? `'${esc(dataItem.NATIONALITIES)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.PLACES_OF_BIRTH', dataItem.PLACES_OF_BIRTH ? `'${esc(dataItem.PLACES_OF_BIRTH)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem.DESCRIPTION ? `'${esc(dataItem.DESCRIPTION)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY))
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY ? `'${esc(dataItem.UPDATE_BY)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.INUSE', String(dataItem.INUSE ?? 1))

    return sql
  },

  insertCn: (dataItem: BlacklistCnInsertDataItem) => {
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

    sql = sql.replaceAll('dataItem.SOURCE_NAME', dataItem.SOURCE_NAME ? `'${esc(dataItem.SOURCE_NAME)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ENTITY_NUMBER', dataItem.ENTITY_NUMBER ? `'${esc(dataItem.ENTITY_NUMBER)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ENTITY_TYPE', dataItem.ENTITY_TYPE ? `'${esc(dataItem.ENTITY_TYPE)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.PROGRAMS', dataItem.PROGRAMS ? `'${esc(dataItem.PROGRAMS)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.COUNTRY', dataItem.COUNTRY ? `'${esc(dataItem.COUNTRY)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.PRIMARY_NAME', esc(dataItem.PRIMARY_NAME))
    sql = sql.replaceAll('dataItem.NORMALIZED_NAME', esc(dataItem.NORMALIZED_NAME))
    sql = sql.replaceAll('dataItem.WMD_TYPE', dataItem.WMD_TYPE ? `'${esc(dataItem.WMD_TYPE)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.RAW_PAYLOAD', dataItem.RAW_PAYLOAD ? `'${esc(dataItem.RAW_PAYLOAD)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem.DESCRIPTION ? `'${esc(dataItem.DESCRIPTION)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY))
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY ? `'${esc(dataItem.UPDATE_BY)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.INUSE', String(dataItem.INUSE ?? 1))

    return sql
  },

  insertAlias: (dataItem: BlacklistAliasInsertDataItem) => {
    let sql = `
                INSERT INTO blacklist_cn_aliases (
              VENDOR_ID
            , ALIAS_NAME
            , NORMALIZED_ALIAS_NAME
            , DESCRIPTION
            , CREATE_BY
            , UPDATE_BY
            , INUSE
        ) VALUES (
              dataItem.VENDOR_ID
            , 'dataItem.ALIAS_NAME'
            , 'dataItem.NORMALIZED_ALIAS_NAME'
            , dataItem.DESCRIPTION
            , 'dataItem.CREATE_BY'
            , dataItem.UPDATE_BY
            , dataItem.INUSE
        )
    `

    sql = sql.replaceAll('dataItem.VENDOR_ID', String(dataItem.VENDOR_ID))
    sql = sql.replaceAll('dataItem.ALIAS_NAME', esc(dataItem.ALIAS_NAME))
    sql = sql.replaceAll('dataItem.NORMALIZED_ALIAS_NAME', esc(dataItem.NORMALIZED_ALIAS_NAME))
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem.DESCRIPTION ? `'${esc(dataItem.DESCRIPTION)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY))
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY ? `'${esc(dataItem.UPDATE_BY)}'` : 'NULL')
    sql = sql.replaceAll('dataItem.INUSE', String(dataItem.INUSE ?? 1))

    return sql
  },

  // ─── Blacklist check for Add Vendor ────────────────────────────────────────
  // normalizedCompanyName must already be normalized (uppercase, punctuation stripped)
  checkBlacklist: (normalizedCompanyName: string) => {
    const escaped = esc(normalizedCompanyName)

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
                JOIN blacklist_cn bc ON bc.ID = bca.VENDOR_ID AND bc.INUSE = 1
                WHERE bca.INUSE = 1
                  AND bca.NORMALIZED_ALIAS_NAME = 'dataItem.NORMALIZEDCOMPANYNAME'
            ) AS matches
            ORDER BY GROUP_CODE ASC, match_type ASC
        `

    sql = sql.replaceAll('dataItem.NORMALIZEDCOMPANYNAME', escaped)

    return sql
  },
}
