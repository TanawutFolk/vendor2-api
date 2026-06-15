export interface AddVendorDataItem {
  [key: string]: any
  company_name?: string
  province?: string
  postal_code?: string
  vendor_type_id?: number | string
  vendor_region?: string
  website?: string
  tel_center?: string
  emailmain?: string
  address?: string
  note?: string
  CREATE_BY?: string
  contact_name?: string
  tel_phone?: string
  email?: string
  position?: string
  vendor_id?: number | string
  product_group_id?: number | string
  maker_name?: string
  product_name?: string
  model_list?: string
  group_name?: string
}

export const AddVendorSQL = {
  // Check duplicate vendor by company_name, province, and postal_code
  checkDuplicateVendor: async (dataItem: AddVendorDataItem) => {
    let sql = `
                            SELECT
                                       VENDOR_ID
                                     , COMPANY_NAME
                                     , PROVINCE
                                     , POSTAL_CODE
                            FROM
                                       vendors
                            WHERE
                                       LOWER(TRIM(COMPANY_NAME)) = LOWER(TRIM('dataItem.COMPANY_NAME'))
                                       AND LOWER(TRIM(PROVINCE)) = LOWER(TRIM('dataItem.PROVINCE'))
                                       AND TRIM(POSTAL_CODE) = TRIM('dataItem.POSTAL_CODE')
                                       AND INUSE = 1
        `

    sql = sql.replaceAll('dataItem.COMPANY_NAME', dataItem['COMPANY_NAME'] || '')
    sql = sql.replaceAll('dataItem.PROVINCE', dataItem['PROVINCE'] || '')
    sql = sql.replaceAll('dataItem.POSTAL_CODE', dataItem['POSTAL_CODE'] || '')

    return sql
  },

  // Create new vendor (main table)
  createVendor: async (dataItem: AddVendorDataItem) => {
    let sql = `
                            INSERT INTO vendors (
                                       COMPANY_NAME
                                     , PROVINCE
                                     , POSTAL_CODE
                                     , VENDOR_TYPE_ID
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
                                     , 'dataItem.PROVINCE'
                                     , 'dataItem.POSTAL_CODE'
                                     ,  dataItem.VENDOR_TYPE_ID
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
    sql = sql.replaceAll('dataItem.PROVINCE', dataItem['PROVINCE'] || '')
    sql = sql.replaceAll('dataItem.POSTAL_CODE', dataItem['POSTAL_CODE'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_TYPE_ID', (dataItem['VENDOR_TYPE_ID'] || 0).toString())
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
  createVendorContact: async (dataItem: AddVendorDataItem) => {
    let sql = `
                            INSERT INTO vendor_contacts (
                                       VENDOR_ID
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
                                        dataItem.VENDOR_ID
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

    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CONTACT_NAME', dataItem['CONTACT_NAME'] || '')
    sql = sql.replaceAll('dataItem.TEL_PHONE', dataItem['TEL_PHONE'] || '')
    sql = sql.replaceAll('dataItem.EMAIL', dataItem['EMAIL'] || '')
    sql = sql.replaceAll('dataItem.POSITION', dataItem['POSITION'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Create vendor product
  createVendorProduct: async (dataItem: AddVendorDataItem) => {
    let sql = `
                            INSERT INTO vendor_products (
                                       VENDOR_ID
                                     , PRODUCT_GROUP_ID
                                     , MAKER_NAME
                                     , PRODUCT_NAME
                                     , MODEL_LIST
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                        dataItem.VENDOR_ID
                                     ,  dataItem.PRODUCT_GROUP_ID
                                     , 'dataItem.MAKER_NAME'
                                     , 'dataItem.PRODUCT_NAME'
                                     , 'dataItem.MODEL_LIST'
                                     , LEFT(CONCAT_WS(' / ', 'dataItem.PRODUCT_NAME', 'dataItem.MAKER_NAME', 'dataItem.MODEL_LIST'), 100)
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.PRODUCT_GROUP_ID', (dataItem['PRODUCT_GROUP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'] || '')
    sql = sql.replaceAll('dataItem.PRODUCT_NAME', dataItem['PRODUCT_NAME'] || '')
    sql = sql.replaceAll('dataItem.MODEL_LIST', dataItem['MODEL_LIST'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Get vendor types for dropdown
  getVendorTypes: async (dataItem?: any) => {
    let sql = `
                            SELECT
                                       VENDOR_TYPE_ID
                                     , NAME
                            FROM
                                       master_vendor_types
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       NAME ASC
        `
    return sql
  },

  // Get product groups for dropdown
  getProductGroups: async (dataItem?: any) => {
    let sql = `
                            SELECT
                                       PRODUCT_GROUP_ID
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
  getLastInsertId: async (dataItem?: any) => {
    let sql = `SELECT LAST_INSERT_ID() AS vendor_id`
    return sql
  },

  // Create new product group
  createProductGroup: async (dataItem: AddVendorDataItem) => {
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
  checkDuplicateProductGroup: async (dataItem: AddVendorDataItem) => {
    let sql = `
                            SELECT
                                       PRODUCT_GROUP_ID
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
}
