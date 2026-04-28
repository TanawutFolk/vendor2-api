const esc = (value: any) => String(value ?? '').replaceAll('\\', '\\\\').replaceAll("'", "\\'")

export interface BlacklistSearchDataItem {
    vendor_name?: string
    group_code?: 'ALL' | 'US' | 'CN' | string
}

export interface BlacklistSearchAgGridDataItem {
    sqlWhere?: string
    Order?: string
    Limit?: number | string
    Offset?: number | string
}

export interface BlacklistUsInsertDataItem {
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
    vendor_id: number
    alias_name: string
    normalized_alias_name: string
    CREATE_BY: string
    UPDATE_BY?: string | null
    DESCRIPTION?: string | null
    INUSE?: number
}

export const BlacklistSQL = {
    search: (dataItem: BlacklistSearchDataItem) => {
        const groupCode = String(dataItem.group_code || '').trim().toUpperCase()
        const keyword = String(dataItem.vendor_name || '').trim()

        const escapedKeyword = esc(keyword)
        const escapedKeywordUpper = esc(keyword.toUpperCase())

        let usKeywordSql = keyword
            ? ` AND (
                   bu.NAME LIKE '%dataItem.keywordVal%'
                OR bu.ALT_NAMES LIKE '%dataItem.keywordVal%'
                OR bu.SOURCE LIKE '%dataItem.keywordVal%'
            )`
            : ''

        usKeywordSql = usKeywordSql.replaceAll('dataItem.keywordVal', escapedKeyword)

        let cnKeywordSql = keyword
            ? ` AND (
                   bc.primary_name LIKE '%dataItem.keywordVal%'
                OR bc.normalized_name LIKE '%dataItem.keywordUpperVal%'
                OR EXISTS (
                    SELECT 1
                    FROM blacklist_cn_aliases va
                    WHERE va.vendor_id = bc.id
                      AND va.INUSE = 1
                      AND (
                           va.alias_name LIKE '%dataItem.keywordVal%'
                        OR va.normalized_alias_name LIKE '%dataItem.keywordUpperVal%'
                      )
                )
            )`
            : ''

        cnKeywordSql = cnKeywordSql.replaceAll('dataItem.keywordUpperVal', escapedKeywordUpper)
        cnKeywordSql = cnKeywordSql.replaceAll('dataItem.keywordVal', escapedKeyword)

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
                dataItem.usKeywordSql
        `

        usSql = usSql.replaceAll('dataItem.usKeywordSql', usKeywordSql)

        let cnSql = `
            SELECT
                  bc.id AS blacklist_id
                , 'CN' AS group_code
                , bc.source_name
                , bc.entity_number
                , bc.entity_type
                , bc.programs
                , bc.country
                , bc.primary_name AS vendor_name
                , bc.wmd_type
                , bc.DESCRIPTION AS description
                , bc.CREATE_BY AS create_by
                , bc.UPDATE_BY AS update_by
                , bc.INUSE AS in_use
                , (
                    SELECT COUNT(*)
                    FROM blacklist_cn_aliases va
                    WHERE va.vendor_id = bc.id
                      AND va.INUSE = 1
                ) AS alias_count
                , bc.UPDATE_DATE AS updated_date
                , bc.CREATE_DATE AS create_date
            FROM
                blacklist_cn bc
            WHERE
                bc.INUSE = 1
                dataItem.cnKeywordSql
        `

        cnSql = cnSql.replaceAll('dataItem.cnKeywordSql', cnKeywordSql)

        if (groupCode === 'US') {
            let sql = `
                dataItem.usSql
                ORDER BY vendor_name ASC
            `

            sql = sql.replaceAll('dataItem.usSql', usSql)

            return sql
        }

        if (groupCode === 'CN') {
            let sql = `
                dataItem.cnSql
                ORDER BY vendor_name ASC
            `

            sql = sql.replaceAll('dataItem.cnSql', cnSql)

            return sql
        }

        let sql = `
            (dataItem.usSql)
            UNION ALL
            (dataItem.cnSql)
            ORDER BY vendor_name ASC
        `

        sql = sql.replaceAll('dataItem.usSql', usSql)
        sql = sql.replaceAll('dataItem.cnSql', cnSql)

        return sql
    },

    searchAgGrid: (dataItem: BlacklistSearchAgGridDataItem) => {
        const sqlWhereClause = String(dataItem.sqlWhere || '').trim().replace(/^WHERE\s+/i, 'AND ')

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

            UNION ALL

            SELECT
                  bc.id AS blacklist_id
                , 'CN' AS group_code
                , bc.source_name
                , bc.entity_number
                , bc.entity_type
                , bc.programs
                , bc.country
                , bc.primary_name AS vendor_name
                , bc.wmd_type
                , bc.DESCRIPTION AS description
                , bc.CREATE_BY AS create_by
                , bc.UPDATE_BY AS update_by
                , bc.INUSE AS in_use
                , (
                    SELECT COUNT(*)
                    FROM blacklist_cn_aliases va
                    WHERE va.vendor_id = bc.id
                      AND va.INUSE = 1
                ) AS alias_count
                , bc.UPDATE_DATE AS updated_date
                , bc.CREATE_DATE AS create_date
            FROM
                blacklist_cn bc
        `

        let sqlCount = `
            SELECT
                COUNT(*) AS TOTAL_COUNT
            FROM (
                dataItem.baseSql
            ) bl
            WHERE
                1 = 1
                dataItem.sqlWhere
        `

        let sqlData = `
            SELECT
                *
            FROM (
                dataItem.baseSql
            ) bl
            WHERE
                1 = 1
                dataItem.sqlWhere
            ORDER BY
                dataItem.Order
            LIMIT
                dataItem.Limit OFFSET dataItem.Offset
        `

        sqlCount = sqlCount.replaceAll('dataItem.baseSql', baseSql)
        sqlCount = sqlCount.replaceAll('dataItem.sqlWhere', sqlWhereClause)

        sqlData = sqlData.replaceAll('dataItem.baseSql', baseSql)
        sqlData = sqlData.replaceAll('dataItem.sqlWhere', sqlWhereClause)
        sqlData = sqlData.replaceAll('dataItem.Order', dataItem.Order || 'bl.updated_date DESC')
        sqlData = sqlData.replaceAll('dataItem.Limit', String(dataItem.Limit || 20))
        sqlData = sqlData.replaceAll('dataItem.Offset', String(dataItem.Offset || 0))

        return [sqlCount, sqlData]
    },

    deleteUs: () => 'DELETE FROM blacklist_us',
    deleteCn: () => 'DELETE FROM blacklist_cn',

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
              dataItem.source
            , dataItem.entity_number
            , dataItem.entity_type
            , dataItem.programs
            , 'dataItem.name'
            , dataItem.title
            , dataItem.addresses
            , dataItem.federal_register_notice
            , dataItem.start_date
            , dataItem.end_date
            , dataItem.standard_order
            , dataItem.license_requirement
            , dataItem.license_policy
            , dataItem.vessel_information
            , dataItem.remarks
            , dataItem.source_list_url
            , dataItem.alt_names
            , dataItem.citizenships
            , dataItem.dates_of_birth
            , dataItem.nationalities
            , dataItem.places_of_birth
            , dataItem.source_information_url
            , dataItem.description
            , 'dataItem.CREATE_BY'
            , dataItem.UPDATE_BY
            , dataItem.INUSE
        )
    `

        // ⚠️  Order matters: replace longer keys BEFORE shorter ones that share a prefix
        //    e.g. 'dataItem.source_list_url' must come before 'dataItem.source'
        sql = sql.replaceAll('dataItem.source_list_url', dataItem.source_list_url ? `'${esc(dataItem.source_list_url)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.source_information_url', dataItem.source_information_url ? `'${esc(dataItem.source_information_url)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.source', dataItem.source ? `'${esc(dataItem.source)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.entity_number', dataItem.entity_number ? `'${esc(dataItem.entity_number)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.entity_type', dataItem.entity_type ? `'${esc(dataItem.entity_type)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.programs', dataItem.programs ? `'${esc(dataItem.programs)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.name', esc(dataItem.name))
        sql = sql.replaceAll('dataItem.title', dataItem.title ? `'${esc(dataItem.title)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.addresses', dataItem.addresses ? `'${esc(dataItem.addresses)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.federal_register_notice', dataItem.federal_register_notice ? `'${esc(dataItem.federal_register_notice)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.start_date', dataItem.start_date ? `'${esc(dataItem.start_date)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.end_date', dataItem.end_date ? `'${esc(dataItem.end_date)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.standard_order', dataItem.standard_order ? `'${esc(dataItem.standard_order)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.license_requirement', dataItem.license_requirement ? `'${esc(dataItem.license_requirement)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.license_policy', dataItem.license_policy ? `'${esc(dataItem.license_policy)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.vessel_information', dataItem.vessel_information ? `'${esc(dataItem.vessel_information)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.remarks', dataItem.remarks ? `'${esc(dataItem.remarks)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.alt_names', dataItem.alt_names ? `'${esc(dataItem.alt_names)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.citizenships', dataItem.citizenships ? `'${esc(dataItem.citizenships)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.dates_of_birth', dataItem.dates_of_birth ? `'${esc(dataItem.dates_of_birth)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.nationalities', dataItem.nationalities ? `'${esc(dataItem.nationalities)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.places_of_birth', dataItem.places_of_birth ? `'${esc(dataItem.places_of_birth)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.description', dataItem.description ? `'${esc(dataItem.description)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY))
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY ? `'${esc(dataItem.UPDATE_BY)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.INUSE', String(dataItem.INUSE ?? 1))

        return sql
    },

    insertCn: (dataItem: BlacklistCnInsertDataItem) => {
        let sql = `
        INSERT INTO blacklist_cn (
              source_name
            , entity_number
            , entity_type
            , programs
            , country
            , primary_name
            , normalized_name
            , wmd_type
            , raw_payload
            , DESCRIPTION
            , CREATE_BY
            , UPDATE_BY
            , INUSE
        ) VALUES (
              dataItem.source_name
            , dataItem.entity_number
            , dataItem.entity_type
            , dataItem.programs
            , dataItem.country
            , 'dataItem.primary_name'
            , 'dataItem.normalized_name'
            , dataItem.wmd_type
            , dataItem.raw_payload
            , dataItem.DESCRIPTION
            , 'dataItem.CREATE_BY'
            , dataItem.UPDATE_BY
            , dataItem.INUSE
        )
    `

        sql = sql.replaceAll('dataItem.source_name', dataItem.source_name ? `'${esc(dataItem.source_name)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.entity_number', dataItem.entity_number ? `'${esc(dataItem.entity_number)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.entity_type', dataItem.entity_type ? `'${esc(dataItem.entity_type)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.programs', dataItem.programs ? `'${esc(dataItem.programs)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.country', dataItem.country ? `'${esc(dataItem.country)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.primary_name', esc(dataItem.primary_name))
        sql = sql.replaceAll('dataItem.normalized_name', esc(dataItem.normalized_name))
        sql = sql.replaceAll('dataItem.wmd_type', dataItem.wmd_type ? `'${esc(dataItem.wmd_type)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.raw_payload', dataItem.raw_payload ? `'${esc(dataItem.raw_payload)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem.DESCRIPTION ? `'${esc(dataItem.DESCRIPTION)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY))
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY ? `'${esc(dataItem.UPDATE_BY)}'` : 'NULL')
        sql = sql.replaceAll('dataItem.INUSE', String(dataItem.INUSE ?? 1))

        return sql
    },

    insertAlias: (dataItem: BlacklistAliasInsertDataItem) => {
        let sql = `
                INSERT INTO blacklist_cn_aliases (
              vendor_id
            , alias_name
            , normalized_alias_name
            , DESCRIPTION
            , CREATE_BY
            , UPDATE_BY
            , INUSE
        ) VALUES (
              dataItem.vendor_id
            , 'dataItem.alias_name'
            , 'dataItem.normalized_alias_name'
            , dataItem.DESCRIPTION
            , 'dataItem.CREATE_BY'
            , dataItem.UPDATE_BY
            , dataItem.INUSE
        )
    `

        sql = sql.replaceAll('dataItem.vendor_id', String(dataItem.vendor_id))
        sql = sql.replaceAll('dataItem.alias_name', esc(dataItem.alias_name))
        sql = sql.replaceAll('dataItem.normalized_alias_name', esc(dataItem.normalized_alias_name))
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
                  group_code
                , matched_name
                , match_type
                , source_name
                , entity_number
                , entity_type
                , addresses
                , programs
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
                        ' {2,}', ' ')) = 'dataItem.normalizedCompanyName'

                UNION ALL

                SELECT
                      'CN' AS group_code
                    , bc.primary_name AS matched_name
                    , 'name' AS match_type
                    , bc.source_name
                    , bc.entity_number
                    , bc.entity_type
                    , bc.country AS addresses
                    , bc.programs
                FROM blacklist_cn bc
                WHERE bc.INUSE = 1
                  AND bc.normalized_name = 'dataItem.normalizedCompanyName'

                UNION ALL

                SELECT
                      'CN' AS group_code
                    , bca.alias_name AS matched_name
                    , 'alias' AS match_type
                    , bc.source_name
                    , bc.entity_number
                    , bc.entity_type
                    , bc.country AS addresses
                    , bc.programs
                FROM blacklist_cn_aliases bca
                JOIN blacklist_cn bc ON bc.id = bca.vendor_id AND bc.INUSE = 1
                WHERE bca.INUSE = 1
                  AND bca.normalized_alias_name = 'dataItem.normalizedCompanyName'
            ) AS matches
            ORDER BY group_code ASC, match_type ASC
        `

        sql = sql.replaceAll('dataItem.normalizedCompanyName', escaped)

        return sql
    },
}
