export interface FindVendorDataItem {
  vendor_id?: number | string
  sqlWhere?: string
  sqlWhereColumnFilter?: string
  Order?: string
  Limit?: number | string
  Offset?: number | string
  company_name?: string
  vendor_type_id?: number | string
  vendor_region?: string
  province?: string
  postal_code?: string
  website?: string
  address?: string
  tel_center?: string
  emailmain?: string
  INUSE?: number | string
  UPDATE_BY?: string
  contact_name?: string
  tel_phone?: string
  email?: string
  position?: string
  vendor_contact_id?: number | string
  product_group_id?: number | string
  maker_name?: string
  product_name?: string
  model_list?: string
  vendor_product_id?: number | string
  CREATE_BY?: string
}

export const FindVendorSQL = {
  // Search vendors with contacts
  search: (dataItem: FindVendorDataItem, sqlWhere: string = '') => {
    const statusCheckExpression = `
            CASE
                WHEN v.fft_status = 2 THEN 'Cannot Register'
                WHEN EXISTS (
                    SELECT 1
                    FROM request_register_vendor rrv_ip
                    WHERE rrv_ip.vendor_id = v.vendor_id
                      AND rrv_ip.INUSE = 1
                      AND rrv_ip.request_status NOT IN ('Completed', 'Rejected', 'Vendor Disagreed', 'Cancelled')
                ) THEN 'In Progress'
                ELSE IFNULL(vmr.status_check, 'Not Registered')
            END
        `
    // Count query
    let sqlCount = `
                            SELECT
                                       COUNT(DISTINCT v.vendor_id) AS TOTAL_COUNT
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.vendor_type_id = vt.vendor_type_id
                                            LEFT JOIN
                                       vendor_contacts vc ON v.vendor_id = vc.vendor_id AND vc.INUSE = 1
                                            LEFT JOIN
                                       vendor_products vp ON v.vendor_id = vp.vendor_id AND vp.INUSE = 1
                                            LEFT JOIN
                                       master_product_groups mpg ON vp.product_group_id = mpg.product_group_id
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.vendor_id = vmr.vendor_id
                            WHERE
                                       1 = 1
                                       dataItem.sqlWhere
                                       dataItem.sqlWhereColumnFilter
        `

    // Data query
    let sqlData = `
                            SELECT
                                       v.vendor_id
                                     , v.fft_vendor_code
                                     , v.fft_status
                                     , vp.vendor_product_id
                                     , vp.product_group_id
                                     , vc.vendor_contact_id
                                     , v.company_name
                                     , vt.name AS vendor_type_name
                                     , v.vendor_region
                                     , v.province
                                     , v.postal_code
                                     , v.website
                                     , v.address
                                     , v.tel_center
                                     , v.emailmain
                                     , mpg.group_name
                                     , vp.maker_name
                                     , vp.product_name
                                     , vp.model_list
                                     , vc.contact_name
                                     , vc.tel_phone
                                     , vc.email
                                     , vc.position
                                     , v.CREATE_BY
                                     , v.UPDATE_BY
                                     , v.CREATE_DATE
                                     , v.UPDATE_DATE
                                     , v.INUSE
                                     
                                     -- Prones Matching Data
                                     , dataItem.statusCheckExpression AS status_check
                                     , IFNULL(vmr.prones_code, v.fft_vendor_code) AS prones_code
                                     , vmr.prones_name AS prones_name_en
                                     , vmr.match_method

                                     -- Reject Reason
                                     , (
                                          SELECT rrv.approver_remark
                                          FROM request_register_vendor rrv
                                          WHERE rrv.vendor_id = v.vendor_id AND rrv.request_status = 'Rejected'
                                          ORDER BY rrv.request_id DESC LIMIT 1
                                     ) AS reject_reason
                                     
                                     -- Contacts JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_contact_id', sub_vc.vendor_contact_id,
                                                                    'contact_name', sub_vc.contact_name,
                                                                    'tel_phone', sub_vc.tel_phone,
                                                                    'email', sub_vc.email,
                                                                    'position', sub_vc.position,
                                                                    'CREATE_BY', sub_vc.CREATE_BY,
                                                                    'UPDATE_BY', sub_vc.UPDATE_BY,
                                                                    'CREATE_DATE', DATE_FORMAT(sub_vc.CREATE_DATE, '%Y-%m-%d %H:%i:%s'),
                                                                    'UPDATE_DATE', DATE_FORMAT(sub_vc.UPDATE_DATE, '%Y-%m-%d %H:%i:%s')
                                                                )
                                                           )
                                                FROM
                                                           vendor_contacts sub_vc
                                                WHERE
                                                           sub_vc.vendor_id = v.vendor_id AND sub_vc.INUSE = 1
                                       ) AS contacts_json

                                     -- Products JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_product_id', sub_vp.vendor_product_id,
                                                                    'product_group_id', sub_vp.product_group_id,
                                                                    'group_name', sub_mpg.group_name,
                                                                    'maker_name', sub_vp.maker_name,
                                                                    'product_name', sub_vp.product_name,
                                                                    'model_list', sub_vp.model_list,
                                                                    'CREATE_BY', sub_vp.CREATE_BY,
                                                                    'UPDATE_BY', sub_vp.UPDATE_BY,
                                                                    'CREATE_DATE', DATE_FORMAT(sub_vp.CREATE_DATE, '%Y-%m-%d %H:%i:%s'),
                                                                    'UPDATE_DATE', DATE_FORMAT(sub_vp.UPDATE_DATE, '%Y-%m-%d %H:%i:%s')
                                                                )
                                                           )
                                                FROM
                                                           vendor_products sub_vp
                                                                LEFT JOIN
                                                           master_product_groups sub_mpg ON sub_vp.product_group_id = sub_mpg.product_group_id
                                                WHERE
                                                           sub_vp.vendor_id = v.vendor_id AND sub_vp.INUSE = 1
                                       ) AS products_json
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.vendor_type_id = vt.vendor_type_id
                                            LEFT JOIN
                                       vendor_contacts vc ON v.vendor_id = vc.vendor_id AND vc.INUSE = 1
                                            LEFT JOIN
                                       vendor_products vp ON v.vendor_id = vp.vendor_id AND vp.INUSE = 1
                                            LEFT JOIN
                                       master_product_groups mpg ON vp.product_group_id = mpg.product_group_id
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.vendor_id = vmr.vendor_id
                            WHERE
                                       1 = 1
                                       dataItem.sqlWhere
                                       dataItem.sqlWhereColumnFilter
                            GROUP BY
                                       v.vendor_id
                            ORDER BY
                                       dataItem.Order
                            LIMIT
                                       dataItem.Limit OFFSET dataItem.Offset
        `

    // Replace placeholders
    sqlCount = sqlCount.replaceAll('dataItem.statusCheckExpression', statusCheckExpression)
    sqlCount = sqlCount.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
    sqlCount = sqlCount.replaceAll('dataItem.sqlWhere', sqlWhere)

    sqlData = sqlData.replaceAll('dataItem.statusCheckExpression', statusCheckExpression)
    sqlData = sqlData.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
    sqlData = sqlData.replaceAll('dataItem.sqlWhere', sqlWhere)
    sqlData = sqlData.replaceAll('dataItem.Order', dataItem['Order'] || 'v.vendor_id DESC')
    sqlData = sqlData.replaceAll('dataItem.Limit', (dataItem['Limit'] || 10).toString())
    sqlData = sqlData.replaceAll('dataItem.Offset', (dataItem['Offset'] || 0).toString())

    return [sqlCount, sqlData]
  },

  // Get vendor by ID
  getById: (dataItem: { vendor_id: number | string }) => {
    const statusCheckExpression = `
            CASE
                WHEN v.fft_status = 2 THEN 'Cannot Register'
                WHEN EXISTS (
                    SELECT 1
                    FROM request_register_vendor rrv_ip
                    WHERE rrv_ip.vendor_id = v.vendor_id
                      AND rrv_ip.INUSE = 1
                      AND rrv_ip.request_status NOT IN ('Completed', 'Rejected', 'Vendor Disagreed', 'Cancelled')
                ) THEN 'In Progress'
                ELSE IFNULL(vmr.status_check, 'Not Registered')
            END
        `
    let sql = `
                            SELECT
                                       v.vendor_id
                                     , v.fft_vendor_code
                                     , v.fft_status
                                     , v.company_name
                                     , v.vendor_type_id
                                     , vt.name AS vendor_type_name
                                     , v.vendor_region
                                     , v.province
                                     , v.postal_code
                                     , v.website
                                     , v.address
                                     , v.tel_center
                                     , v.emailmain
                                     , v.CREATE_BY
                                     , v.UPDATE_BY
                                     , v.CREATE_DATE
                                     , v.UPDATE_DATE
                                     , v.INUSE
                                     
                                     -- Prones Matching Data
                                     , dataItem.statusCheckExpression AS status_check
                                     , IFNULL(vmr.prones_code, v.fft_vendor_code) AS prones_code
                                     , vmr.prones_name AS prones_name_en
                                     , vmr.match_method
                                     
                                     -- Contacts JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_contact_id', sub_vc.vendor_contact_id,
                                                                    'contact_name', sub_vc.contact_name,
                                                                    'tel_phone', sub_vc.tel_phone,
                                                                    'email', sub_vc.email,
                                                                    'position', sub_vc.position,
                                                                    'contact_create_by', sub_vc.CREATE_BY,
                                                                    'contact_update_by', sub_vc.UPDATE_BY,
                                                                    'contact_create_date', DATE_FORMAT(sub_vc.CREATE_DATE, '%Y-%m-%d %H:%i:%s'),
                                                                    'contact_update_date', DATE_FORMAT(sub_vc.UPDATE_DATE, '%Y-%m-%d %H:%i:%s')
                                                                )
                                                           )
                                                FROM
                                                           vendor_contacts sub_vc
                                                WHERE
                                                           sub_vc.vendor_id = v.vendor_id AND sub_vc.INUSE = 1
                                        ) AS contacts_json

                                     -- Products JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_product_id', sub_vp.vendor_product_id,
                                                                    'product_group_id', sub_vp.product_group_id,
                                                                    'group_name', sub_mpg.group_name,
                                                                    'maker_name', sub_vp.maker_name,
                                                                    'product_name', sub_vp.product_name,
                                                                    'model_list', sub_vp.model_list,
                                                                    'product_create_by', sub_vp.CREATE_BY,
                                                                    'product_create_date', DATE_FORMAT(sub_vp.CREATE_DATE, '%Y-%m-%d %H:%i:%s'),
                                                                    'product_update_by', sub_vp.UPDATE_BY,
                                                                    'product_update_date', DATE_FORMAT(sub_vp.UPDATE_DATE, '%Y-%m-%d %H:%i:%s')
                                                                )
                                                           )
                                                FROM
                                                           vendor_products sub_vp
                                                                LEFT JOIN
                                                           master_product_groups sub_mpg ON sub_vp.product_group_id = sub_mpg.product_group_id
                                                WHERE
                                                           sub_vp.vendor_id = v.vendor_id AND sub_vp.INUSE = 1
                                        ) AS products_json
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.vendor_type_id = vt.vendor_type_id
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.vendor_id = vmr.vendor_id
                            WHERE
                                       v.vendor_id = dataItem.vendor_id
        `
    sql = sql.replaceAll('dataItem.statusCheckExpression', statusCheckExpression)
    sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())
    return sql
  },

  // Helper to escape single quotes for SQL
  escapeSql: (str: string | null | undefined) => {
    if (str === null || str === undefined) return ''
    return String(str).replace(/'/g, "\\'")
  },

  // Update vendor
  updateVendor: (dataItem: FindVendorDataItem) => {
    let sql = `
                            UPDATE vendors SET
                                       company_name = 'dataItem.company_name'
                                     , vendor_type_id = dataItem.vendor_type_id
                                     , vendor_region = 'dataItem.vendor_region'
                                     , province = 'dataItem.province'
                                     , postal_code = 'dataItem.postal_code'
                                     , website = 'dataItem.website'
                                     , address = 'dataItem.address'
                                     , tel_center = 'dataItem.tel_center'
                                     , emailmain = 'dataItem.emailmain'
                                     , INUSE = dataItem.INUSE
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       vendor_id = dataItem.vendor_id
        `
    sql = sql.replaceAll('dataItem.company_name', dataItem['company_name'] || '')
    sql = sql.replaceAll('dataItem.vendor_type_id', (dataItem['vendor_type_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.vendor_region', dataItem['vendor_region'] || 'Local')
    sql = sql.replaceAll('dataItem.province', dataItem['province'] || '')
    sql = sql.replaceAll('dataItem.postal_code', dataItem['postal_code'] || '')
    sql = sql.replaceAll('dataItem.website', dataItem['website'] || '')
    sql = sql.replaceAll('dataItem.address', dataItem['address'] || '')
    sql = sql.replaceAll('dataItem.tel_center', dataItem['tel_center'] || '')
    sql = sql.replaceAll('dataItem.emailmain', dataItem['emailmain'] || '')
    sql = sql.replaceAll('dataItem.INUSE', (dataItem['INUSE'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())

    return sql
  },

  // Update vendor contact
  updateVendorContact: (dataItem: FindVendorDataItem) => {
    let sql = `
                            UPDATE vendor_contacts SET
                                       contact_name = 'dataItem.contact_name'
                                     , tel_phone = 'dataItem.tel_phone'
                                     , email = 'dataItem.email'
                                     , position = 'dataItem.position'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       vendor_contact_id = dataItem.vendor_contact_id
        `
    sql = sql.replaceAll('dataItem.contact_name', dataItem['contact_name'] || '')
    sql = sql.replaceAll('dataItem.tel_phone', dataItem['tel_phone'] || '')
    sql = sql.replaceAll('dataItem.email', dataItem['email'] || '')
    sql = sql.replaceAll('dataItem.position', dataItem['position'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.vendor_contact_id', (dataItem['vendor_contact_id'] || 0).toString())

    return sql
  },

  // Create vendor contact
  createVendorContact: (dataItem: FindVendorDataItem) => {
    let sql = `
                            INSERT INTO vendor_contacts (
                                       vendor_id
                                     , contact_name
                                     , tel_phone
                                     , email
                                     , position
                                     , CREATE_BY
                                     , CREATE_DATE
                                     , UPDATE_BY
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.vendor_id
                                     , 'dataItem.contact_name'
                                     , 'dataItem.tel_phone'
                                     , 'dataItem.email'
                                     , 'dataItem.position'
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     ,  1
                            )
        `
    sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.contact_name', dataItem['contact_name'] || '')
    sql = sql.replaceAll('dataItem.tel_phone', dataItem['tel_phone'] || '')
    sql = sql.replaceAll('dataItem.email', dataItem['email'] || '')
    sql = sql.replaceAll('dataItem.position', dataItem['position'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  // Update vendor product
  updateVendorProduct: (dataItem: FindVendorDataItem) => {
    let sql = `
                            UPDATE vendor_products SET
                                       product_group_id = dataItem.product_group_id
                                     , maker_name = 'dataItem.maker_name'
                                     , product_name = 'dataItem.product_name'
                                     , model_list = 'dataItem.model_list'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       vendor_product_id = dataItem.vendor_product_id
        `
    sql = sql.replaceAll('dataItem.product_group_id', (dataItem['product_group_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.maker_name', dataItem['maker_name'] || '')
    sql = sql.replaceAll('dataItem.product_name', dataItem['product_name'] || '')
    sql = sql.replaceAll('dataItem.model_list', dataItem['model_list'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.vendor_product_id', (dataItem['vendor_product_id'] || 0).toString())

    return sql
  },

  // Create vendor product
  createVendorProduct: (dataItem: FindVendorDataItem) => {
    let sql = `
                            INSERT INTO vendor_products (
                                       vendor_id
                                     , product_group_id
                                     , maker_name
                                     , product_name
                                     , model_list
                                     , CREATE_BY
                                     , CREATE_DATE
                                     , UPDATE_BY
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.vendor_id
                                     ,  dataItem.product_group_id
                                     , 'dataItem.maker_name'
                                     , 'dataItem.product_name'
                                     , 'dataItem.model_list'
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     ,  1
                            )
        `
    sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.product_group_id', (dataItem['product_group_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.maker_name', dataItem['maker_name'] || '')
    sql = sql.replaceAll('dataItem.product_name', dataItem['product_name'] || '')
    sql = sql.replaceAll('dataItem.model_list', dataItem['model_list'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  // Delete vendor contact (Soft Delete)
  deleteVendorContact: (dataItem: FindVendorDataItem) => {
    let sql = `
                            UPDATE vendor_contacts SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       vendor_contact_id = dataItem.vendor_contact_id
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.vendor_contact_id', (dataItem['vendor_contact_id'] || 0).toString())
    return sql
  },

  // Delete vendor product (Soft Delete)
  deleteVendorProduct: (dataItem: FindVendorDataItem) => {
    let sql = `
                            UPDATE vendor_products SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       vendor_product_id = dataItem.vendor_product_id
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.vendor_product_id', (dataItem['vendor_product_id'] || 0).toString())
    return sql
  },

  // Get vendor types for dropdown
  getVendorTypes: (dataItem?: any) => {
    let sql = `
                            SELECT
                                       vendor_type_id AS value
                                     , name AS label
                            FROM
                                       master_vendor_types
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       name ASC
        `
    return sql
  },

  // Get provinces for dropdown
  getProvinces: (dataItem?: any) => {
    let sql = `
                            SELECT DISTINCT
                                       province AS value
                                     , province AS label
                            FROM
                                       vendors
                            WHERE
                                       INUSE = 1
                                       AND province IS NOT NULL
                                       AND province != ''
                            ORDER BY
                                       province ASC
        `
    return sql
  },

  // Get product groups for dropdown
  getProductGroups: (dataItem?: any) => {
    let sql = `
                            SELECT
                                       product_group_id AS value
                                     , group_name AS label
                            FROM
                                       master_product_groups
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       group_name ASC
        `
    return sql
  },

  // Search all vendors for export (no pagination limit)
  searchAllForExport: (dataItem: FindVendorDataItem, sqlWhere: string = '') => {
    const statusCheckExpression = `
            CASE
                WHEN v.fft_status = 2 THEN 'Cannot Register'
                WHEN EXISTS (
                    SELECT 1
                    FROM request_register_vendor rrv_ip
                    WHERE rrv_ip.vendor_id = v.vendor_id
                      AND rrv_ip.INUSE = 1
                      AND rrv_ip.request_status NOT IN ('Completed', 'Rejected', 'Vendor Disagreed', 'Cancelled')
                ) THEN 'In Progress'
                ELSE IFNULL(vmr.status_check, 'Not Registered')
            END
        `
    let sqlData = `
                            SELECT
                                       v.vendor_id
                                     , v.fft_vendor_code
                                     , v.fft_status
                                     , vp.vendor_product_id
                                     , vc.vendor_contact_id
                                     , v.company_name
                                     , vt.name AS vendor_type_name
                                     , v.vendor_region
                                     , v.province
                                     , v.postal_code
                                     , v.website
                                     , v.address
                                     , v.tel_center
                                     , v.emailmain
                                     , mpg.group_name
                                     , vp.maker_name
                                     , vp.product_name
                                     , vp.model_list
                                     , vc.contact_name
                                     , vc.tel_phone
                                     , vc.email
                                     , vc.position
                                     , v.CREATE_BY
                                     , v.UPDATE_BY
                                     , v.CREATE_DATE
                                     , v.UPDATE_DATE
                                     , v.INUSE

                                     -- Prones Matching Data
                                     , dataItem.statusCheckExpression AS status_check
                                     , IFNULL(vmr.prones_code, v.fft_vendor_code) AS prones_code
                                     , vmr.prones_name AS prones_name_en
                                     , vmr.match_method

                                     -- Reject Reason
                                     , (
                                          SELECT rrv.approver_remark
                                          FROM request_register_vendor rrv
                                          WHERE rrv.vendor_id = v.vendor_id AND rrv.request_status = 'Rejected'
                                          ORDER BY rrv.request_id DESC LIMIT 1
                                     ) AS reject_reason
                                     
                                     -- Contact Audit
                                     , vc.CREATE_BY AS contact_create_by
                                     , vc.UPDATE_BY AS contact_update_by
                                     , vc.CREATE_DATE AS contact_create_date
                                     , vc.UPDATE_DATE AS contact_update_date
                                     
                                     -- Product Audit
                                     , vp.CREATE_BY AS product_create_by
                                     , vp.CREATE_DATE AS product_create_date
                                     , vp.UPDATE_BY AS product_update_by
                                     , vp.UPDATE_DATE AS product_update_date
                                     , v.INUSE
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.vendor_type_id = vt.vendor_type_id
                                            LEFT JOIN
                                       vendor_contacts vc ON v.vendor_id = vc.vendor_id AND vc.INUSE = 1
                                            LEFT JOIN
                                       vendor_products vp ON v.vendor_id = vp.vendor_id AND vp.INUSE = 1
                                            LEFT JOIN
                                       master_product_groups mpg ON vp.product_group_id = mpg.product_group_id
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.vendor_id = vmr.vendor_id
                            WHERE
                                       1 = 1
                                       dataItem.sqlWhere
                                       dataItem.sqlWhereColumnFilter
                            ORDER BY
                                       dataItem.Order
        `

    sqlData = sqlData.replaceAll('dataItem.statusCheckExpression', statusCheckExpression)
    sqlData = sqlData.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
    sqlData = sqlData.replaceAll('dataItem.sqlWhere', sqlWhere)
    sqlData = sqlData.replaceAll('dataItem.Order', dataItem['Order'] || 'v.vendor_id DESC')

    return sqlData
  },

  // Generate Global Search SQL
  generateGlobalSearchSql: (dataItem: { searchKeyword?: string }) => {
    const cleanKeyword = dataItem && dataItem.searchKeyword ? dataItem.searchKeyword.trim() : ''

    if (cleanKeyword) {
      let sql = `
                            AND (
                                       v.company_name LIKE 'searchVal'
                                     OR v.province LIKE 'searchVal'
                                     OR v.website LIKE 'searchVal'
                                     OR v.fft_vendor_code LIKE 'searchVal'
                                     OR v.emailmain LIKE 'searchVal'
                                     OR vc.email LIKE 'searchVal'
                                     OR vc.contact_name LIKE 'searchVal'
                                     OR vc.tel_phone LIKE 'searchVal'
                                     OR vp.product_name LIKE 'searchVal'
                                     OR vp.maker_name LIKE 'searchVal'
                                     OR vp.model_list LIKE 'searchVal'
                                     OR mpg.group_name LIKE 'searchVal'
                                     OR vt.name LIKE 'searchVal'
                            )
            `

      // Escape single quotes and prepare search value
      const safeKeyword = cleanKeyword.replace(/'/g, "\\'")
      const searchVal = `%${safeKeyword}%`

      sql = sql.replaceAll('searchVal', searchVal)

      return sql
    }
    return ''
  },

  // prones
  getPronesData: (dataItem?: any) => {
    let sql = `
                            SELECT 
                                       RTRIM(I_DL_CD) Customer_code
                                     , RTRIM(I_DL_ARG_DESC) Customer_name
                                     , RTRIM(I_ADDRESS1) Customer_Address1
                                     , RTRIM(I_ADDRESS2) Customer_Address2
                                     , RTRIM(I_ADDRESS3) Customer_Address3
                                     , RTRIM(I_TEL) Customer_tel    
                            FROM
                                       FFT.T_TRADE_MS
                            WHERE  
                                       (
                                           I_DL_CD LIKE '20030%'
                                        OR I_DL_CD LIKE '20031%'
                                        OR I_DL_CD = '20030FEC01'
                                        OR I_DL_CD = '20020FTC03'
                                       )
        `
    return sql
  },

  // prones raw test
  getPronesRawTest: (dataItem?: any) => {
    let sql = `
                            SELECT
                                       RTRIM(I_DL_CD) Customer_code
                                     , RTRIM(I_DL_ARG_DESC) Customer_name
                                     , RTRIM(I_ADDRESS1) Customer_Address1
                                     , RTRIM(I_ADDRESS2) Customer_Address2
                                     , RTRIM(I_ADDRESS3) Customer_Address3
                                     , RTRIM(I_TEL) Customer_tel
                            FROM
                                       FFT.T_TRADE_MS
                            WHERE
                                       (
                                           I_DL_CD LIKE '20030%'
                                        OR I_DL_CD LIKE '20031%'
                                        OR I_DL_CD = '20030FEC01'
                                        OR I_DL_CD = '20020FTC03'
                                       )
        `
    return sql
  },

  getAllVendorNames: (dataItem?: any) => {
    let sql = `
                            SELECT
                                       company_name
                                     , address
                                     , tel_center 
                            FROM
                                       vendors 
                            WHERE
                                       INUSE = 1
        `
    return sql
  },

  // Staging Prones - Truncate
  truncateStagingPrones: (dataItem?: any) => {
    let sql = `TRUNCATE TABLE staging_prones_data`
    return sql
  },

  // Staging Prones - Batch Insert
  insertStagingPronesBatch: (rows: any[]) => {
    const escape = FindVendorSQL.escapeSql
    const values = rows
      .map((row: any) => {
        return `('${escape(row.CUSTOMER_CODE)}', '${escape(row.CUSTOMER_NAME)}', '${escape(row.CUSTOMER_ADDRESS1)}', '${escape(row.CUSTOMER_ADDRESS2)}', '${escape(row.CUSTOMER_ADDRESS3)}', '${escape(row.CUSTOMER_TEL)}')`
      })
      .join(',\n')

    let sql = `
                            INSERT INTO staging_prones_data (
                                       customer_code
                                     , customer_name
                                     , customer_address1
                                     , customer_address2
                                     , customer_address3
                                     , customer_tel
                            ) VALUES ${values}
        `
    return sql
  },

  // Vendor Matching - Get staging prones data (from MySQL)
  getStagingPronesData: (dataItem?: any) => {
    let sql = `SELECT customer_code, customer_name, customer_address1, customer_address2, customer_address3, customer_tel FROM staging_prones_data`
    return sql
  },

  // Vendor Matching - Get vendors for matching
  getVendorsForMatch: (dataItem?: any) => {
    let sql = `SELECT vendor_id, company_name, address, tel_center FROM vendors WHERE INUSE = 1`
    return sql
  },

  // Vendor Matching - Truncate match result
  truncateMatchResult: (dataItem?: any) => {
    let sql = `TRUNCATE TABLE vendor_match_result`
    return sql
  },

  // Vendor Matching - Batch insert match results
  insertMatchResultBatch: (rows: any[]) => {
    const escape = FindVendorSQL.escapeSql
    const values = rows
      .map((row: any) => {
        return `(${row.vendor_id}, '${escape(row.status_check)}', '${escape(row.prones_code)}', '${escape(row.prones_name)}', '${escape(row.match_method)}', NOW())`
      })
      .join(',\n')

    let sql = `
                            INSERT INTO vendor_match_result (
                                       vendor_id
                                     , status_check
                                     , prones_code
                                     , prones_name
                                     , match_method
                                     , last_updated
                            ) VALUES ${values}
        `
    return sql
  },

  // Vendor Matching - Get match result by vendor_id
  getMatchResultByVendorIds: (dataItem: { vendorIds: number[] }) => {
    const ids = dataItem.vendorIds.join(',')
    let sql = `SELECT vendor_id, status_check, prones_code, prones_name, match_method FROM vendor_match_result WHERE vendor_id IN (${ids})`
    return sql
  },

  // Vendor Matching - Get all match results
  getAllMatchResults: (dataItem?: any) => {
    let sql = `SELECT vendor_id, status_check, prones_code, prones_name, match_method FROM vendor_match_result`
    return sql
  },
}
