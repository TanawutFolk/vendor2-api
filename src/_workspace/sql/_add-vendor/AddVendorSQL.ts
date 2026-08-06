
export const AddVendorSQL = {
  toNullableStringSql: (value: any) => {
    if (value === null || value === undefined || String(value).trim() === '') return 'NULL'
    let sql = '\'dataItem.ESCAPED_VALUE\''
    sql = sql.replaceAll('dataItem.ESCAPED_VALUE', String(String(value).replaceAll("'", "''")))
    return sql
  },

  // Check duplicate vendor by local address or oversea country.
  checkDuplicateVendor: async (dataItem: any) => {
    const isOversea = String(dataItem['VENDOR_REGION'] || dataItem['vendor_region'] || '').trim().toLowerCase() === 'oversea'

    let sql = `
                            SELECT
                                       VENDORS_ID
                                     , COMPANY_NAME
                                     , VENDOR_REGION
                                     , PROVINCE
                                     , POSTAL_CODE
                                     , COUNTRY
                            FROM
                                       vendors
                            WHERE
                                       LOWER(TRIM(COMPANY_NAME)) = LOWER(TRIM('dataItem.COMPANY_NAME'))
                                       dataItem.DUPLICATEWHERE
                                       AND INUSE = 1
        `

    const duplicateWhere = isOversea
      ? `
                                       AND LOWER(TRIM(IFNULL(VENDOR_REGION, ''))) = 'oversea'
                                       AND LOWER(TRIM(IFNULL(COUNTRY, ''))) = LOWER(TRIM('dataItem.COUNTRY'))`
      : `
                                       AND LOWER(TRIM(IFNULL(VENDOR_REGION, 'Local'))) != 'oversea'
                                       AND LOWER(TRIM(IFNULL(PROVINCE, ''))) = LOWER(TRIM('dataItem.PROVINCE'))
                                       AND TRIM(IFNULL(POSTAL_CODE, '')) = TRIM('dataItem.POSTAL_CODE')`

    sql = sql.replaceAll('dataItem.DUPLICATEWHERE', duplicateWhere)
    sql = sql.replaceAll('dataItem.COMPANY_NAME', dataItem['COMPANY_NAME'] || '')
    sql = sql.replaceAll('dataItem.PROVINCE', dataItem['PROVINCE'] || '')
    sql = sql.replaceAll('dataItem.POSTAL_CODE', dataItem['POSTAL_CODE'] || '')
    sql = sql.replaceAll('dataItem.COUNTRY', dataItem['COUNTRY'] || '')

    return sql
  },
  // Create new vendor (main table)
  createVendor: async (dataItem: any) => {
    let sql = `
                            INSERT INTO vendors (
                                       COMPANY_NAME
                                     , PROVINCE
                                     , POSTAL_CODE
                                     , COUNTRY
                                     , BUSINESS_CATEGORY_ID
                                     , VENDOR_REGION
                                     , WEBSITE
                                     , TEL_CENTER
                                     , EMAILMAIN
                                     , ADDRESS
                                     , NOTE
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       'dataItem.COMPANY_NAME'
                                     , dataItem.PROVINCE_SQL
                                     , dataItem.POSTAL_CODE_SQL
                                     , dataItem.COUNTRY_SQL
                                     ,  dataItem.MASTER_VENDOR_TYPES_ID
                                     , 'dataItem.VENDOR_REGION'
                                     , 'dataItem.WEBSITE'
                                     , 'dataItem.TEL_CENTER'
                                     , 'dataItem.EMAILMAIN'
                                     , 'dataItem.ADDRESS'
                                     , 'dataItem.NOTE'
                                     , LEFT(COALESCE(NULLIF('dataItem.NOTE', ''), 'dataItem.COMPANY_NAME'), 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.COMPANY_NAME', dataItem['COMPANY_NAME'] || '')
    sql = sql.replaceAll('dataItem.PROVINCE_SQL', AddVendorSQL.toNullableStringSql(dataItem['PROVINCE']))
    sql = sql.replaceAll('dataItem.POSTAL_CODE_SQL', AddVendorSQL.toNullableStringSql(dataItem['POSTAL_CODE']))
    sql = sql.replaceAll('dataItem.COUNTRY_SQL', AddVendorSQL.toNullableStringSql(dataItem['COUNTRY']))
    sql = sql.replaceAll('dataItem.MASTER_VENDOR_TYPES_ID', (dataItem['MASTER_VENDOR_TYPES_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.VENDOR_REGION', dataItem['VENDOR_REGION'] || 'Local')
    sql = sql.replaceAll('dataItem.WEBSITE', dataItem['WEBSITE'] || '')
    sql = sql.replaceAll('dataItem.TEL_CENTER', dataItem['TEL_CENTER'] || '')
    sql = sql.replaceAll('dataItem.EMAILMAIN', dataItem['EMAILMAIN'] || '')
    sql = sql.replaceAll('dataItem.ADDRESS', dataItem['ADDRESS'] || '')
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Create vendor contact
  createVendorContact: async (dataItem: any) => {
    let sql = `
                            INSERT INTO vendor_contacts (
                                       VENDORS_ID
                                     , CONTACT_NAME
                                     , TEL_PHONE
                                     , EMAIL
                                     , POSITION
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                        dataItem.VENDORS_ID
                                     , 'dataItem.CONTACT_NAME'
                                     , 'dataItem.TEL_PHONE'
                                     , 'dataItem.EMAIL'
                                     , 'dataItem.POSITION'
                                     , LEFT('dataItem.CONTACT_NAME', 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CONTACT_NAME', dataItem['CONTACT_NAME'] || '')
    sql = sql.replaceAll('dataItem.TEL_PHONE', dataItem['TEL_PHONE'] || '')
    sql = sql.replaceAll('dataItem.EMAIL', dataItem['EMAIL'] || '')
    sql = sql.replaceAll('dataItem.POSITION', dataItem['POSITION'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Create vendor product
  createVendorProduct: async (dataItem: any) => {
    let sql = `
                            INSERT INTO vendor_products (
                                       VENDORS_ID
                                     , MASTER_PRODUCT_GROUPS_ID
                                     , MAKER_NAME
                                     , PRODUCT_NAME
                                     , MODEL_LIST
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                        dataItem.VENDORS_ID
                                     ,  dataItem.MASTER_PRODUCT_GROUPS_ID
                                     , 'dataItem.MAKER_NAME'
                                     , 'dataItem.PRODUCT_NAME'
                                     , 'dataItem.MODEL_LIST'
                                     , LEFT(CONCAT_WS(' / ', 'dataItem.PRODUCT_NAME', 'dataItem.MAKER_NAME', 'dataItem.MODEL_LIST'), 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.MASTER_PRODUCT_GROUPS_ID', (dataItem['MASTER_PRODUCT_GROUPS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'] || '')
    sql = sql.replaceAll('dataItem.PRODUCT_NAME', dataItem['PRODUCT_NAME'] || '')
    sql = sql.replaceAll('dataItem.MODEL_LIST', dataItem['MODEL_LIST'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Get vendor types for dropdown
  getVendorTypes: async (_dataItem?: any) => {
    let sql = `
                            SELECT
                                       BUSINESS_CATEGORY_ID
                                     , BUSINESS_CATEGORY_NAME
                            FROM
                                       info_business_category
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       BUSINESS_CATEGORY_NAME ASC
        `
    return sql
  },

  // Get product groups for dropdown
  getProductGroups: async (_dataItem?: any) => {
    let sql = `
                            SELECT
                                       MASTER_PRODUCT_GROUPS_ID
                                     , GROUP_NAME
                            FROM
                                       master_product_groups
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       GROUP_NAME ASC
        `
    return sql
  },

  // Get last inserted vendor id
  getLastInsertId: async (_dataItem?: any) => {
    let sql = 'SELECT LAST_INSERT_ID() AS VENDORS_ID'
    return sql
  },

  // Create new product group
  createProductGroup: async (dataItem: any) => {
    let sql = `
                            INSERT INTO master_product_groups (
                                       GROUP_NAME
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       'dataItem.GROUP_NAME'
                                     , LEFT('dataItem.GROUP_NAME', 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.GROUP_NAME', dataItem['GROUP_NAME'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Check duplicate product group
  checkDuplicateProductGroup: async (dataItem: any) => {
    let sql = `
                            SELECT
                                       MASTER_PRODUCT_GROUPS_ID
                                     , GROUP_NAME
                            FROM
                                       master_product_groups
                            WHERE
                                       GROUP_NAME = 'dataItem.GROUP_NAME'
                                       AND INUSE = 1
        `

    sql = sql.replaceAll('dataItem.GROUP_NAME', dataItem['GROUP_NAME'] || '')

    return sql
  },

  checkBlacklist: async (normalizedCompanyName: string) => {
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
                                                , bu.ENTITY_NUMBER
                                                , bu.TYPE AS ENTITY_TYPE
                                                , bu.ADDRESSES
                                                , bu.PROGRAMS
                                       FROM
                                                  blacklist_us bu
                                       WHERE
                                                  bu.INUSE = 1
                                                  AND TRIM(REGEXP_REPLACE(
                                                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(bu.NAME,
                                                            '.', ' '), ',', ' '), '(', ' '), ')', ' '), '-', ' '), '/', ' ')),
                                                        ' {2,}', ' ')) = 'dataItem.NORMALIZED_COMPANY_NAME'

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
                                       FROM
                                                  blacklist_cn bc
                                       WHERE
                                                  bc.INUSE = 1
                                                  AND bc.NORMALIZED_NAME = 'dataItem.NORMALIZED_COMPANY_NAME'

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
                                       FROM
                                                  blacklist_cn_aliases bca
                                                       INNER JOIN
                                                  blacklist_cn bc ON bc.BLACKLIST_CN_ID = bca.BLACKLIST_CN_ID AND bc.INUSE = 1
                                       WHERE
                                                  bca.INUSE = 1
                                                  AND bca.NORMALIZED_ALIAS_NAME = 'dataItem.NORMALIZED_COMPANY_NAME'
                            ) AS MATCHES
                            ORDER BY
                                       GROUP_CODE ASC
                                     , MATCH_TYPE ASC
        `
    sql = sql.replaceAll('dataItem.NORMALIZED_COMPANY_NAME', normalizedCompanyName.replaceAll("'", "''"))
    return sql
  },
}
