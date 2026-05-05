export interface AddVendorDataItem {
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
                                       vendor_id
                                     , company_name
                                     , province
                                     , postal_code
                            FROM
                                       vendors
                            WHERE
                                       LOWER(TRIM(company_name)) = LOWER(TRIM('dataItem.company_name'))
                                       AND LOWER(TRIM(province)) = LOWER(TRIM('dataItem.province'))
                                       AND TRIM(postal_code) = TRIM('dataItem.postal_code')
                                       AND INUSE = 1
        `

    sql = sql.replaceAll('dataItem.company_name', dataItem['company_name'] || '')
    sql = sql.replaceAll('dataItem.province', dataItem['province'] || '')
    sql = sql.replaceAll('dataItem.postal_code', dataItem['postal_code'] || '')

    return sql
  },

  // Create new vendor (main table)
  createVendor: async (dataItem: AddVendorDataItem) => {
    let sql = `
                            INSERT INTO vendors (
                                       company_name
                                     , province
                                     , postal_code
                                     , vendor_type_id
                                     , vendor_region
                                     , website
                                     , tel_center
                                     , emailmain
                                     , address
                                     , note
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       'dataItem.company_name'
                                     , 'dataItem.province'
                                     , 'dataItem.postal_code'
                                     ,  dataItem.vendor_type_id
                                     , 'dataItem.vendor_region'
                                     , 'dataItem.website'
                                     , 'dataItem.tel_center'
                                     , 'dataItem.emailmain'
                                     , 'dataItem.address'
                                     , 'dataItem.note'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.company_name', dataItem['company_name'] || '')
    sql = sql.replaceAll('dataItem.province', dataItem['province'] || '')
    sql = sql.replaceAll('dataItem.postal_code', dataItem['postal_code'] || '')
    sql = sql.replaceAll('dataItem.vendor_type_id', (dataItem['vendor_type_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.vendor_region', dataItem['vendor_region'] || 'Local')
    sql = sql.replaceAll('dataItem.website', dataItem['website'] || '')
    sql = sql.replaceAll('dataItem.tel_center', dataItem['tel_center'] || '')
    sql = sql.replaceAll('dataItem.emailmain', dataItem['emailmain'] || '')
    sql = sql.replaceAll('dataItem.address', dataItem['address'] || '')
    sql = sql.replaceAll('dataItem.note', dataItem['note'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Create vendor contact
  createVendorContact: async (dataItem: AddVendorDataItem) => {
    let sql = `
                            INSERT INTO vendor_contacts (
                                       vendor_id
                                     , contact_name
                                     , tel_phone
                                     , email
                                     , position
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                        dataItem.vendor_id
                                     , 'dataItem.contact_name'
                                     , 'dataItem.tel_phone'
                                     , 'dataItem.email'
                                     , 'dataItem.position'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.contact_name', dataItem['contact_name'] || '')
    sql = sql.replaceAll('dataItem.tel_phone', dataItem['tel_phone'] || '')
    sql = sql.replaceAll('dataItem.email', dataItem['email'] || '')
    sql = sql.replaceAll('dataItem.position', dataItem['position'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Create vendor product
  createVendorProduct: async (dataItem: AddVendorDataItem) => {
    let sql = `
                            INSERT INTO vendor_products (
                                       vendor_id
                                     , product_group_id
                                     , maker_name
                                     , product_name
                                     , model_list
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                        dataItem.vendor_id
                                     ,  dataItem.product_group_id
                                     , 'dataItem.maker_name'
                                     , 'dataItem.product_name'
                                     , 'dataItem.model_list'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.product_group_id', (dataItem['product_group_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.maker_name', dataItem['maker_name'] || '')
    sql = sql.replaceAll('dataItem.product_name', dataItem['product_name'] || '')
    sql = sql.replaceAll('dataItem.model_list', dataItem['model_list'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Get vendor types for dropdown
  getVendorTypes: async (dataItem?: any) => {
    let sql = `
                            SELECT
                                       vendor_type_id
                                     , name
                            FROM
                                       master_vendor_types
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       name ASC
        `
    return sql
  },

  // Get product groups for dropdown
  getProductGroups: async (dataItem?: any) => {
    let sql = `
                            SELECT
                                       product_group_id
                                     , group_name
                            FROM
                                       master_product_groups
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       group_name ASC
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
                                       group_name
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , INUSE
                            )
                            VALUES (
                                       'dataItem.group_name'
                                     , 'dataItem.CREATE_BY'
                                     , 'dataItem.CREATE_BY'
                                     ,  1
                            )
        `

    sql = sql.replaceAll('dataItem.group_name', dataItem['group_name'] || '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'] || '')

    return sql
  },

  // Check duplicate product group
  checkDuplicateProductGroup: async (dataItem: AddVendorDataItem) => {
    let sql = `
                            SELECT
                                       product_group_id
                                     , group_name
                            FROM
                                       master_product_groups
                            WHERE
                                       group_name = 'dataItem.group_name'
                                       AND INUSE = 1
        `

    sql = sql.replaceAll('dataItem.group_name', dataItem['group_name'] || '')

    return sql
  },
}
