export interface FindVendorDataItem {
  [key: string]: any
  vendor_id?: number | string
  sqlWhere?: string
  sqlWhereColumnFilter?: string
  Order?: string
  Limit?: number | string
  Offset?: number | string
  company_name?: string
  vendor_type_id?: number | string | null
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
                WHEN v.FFT_STATUS = 2 THEN 'Cannot Register'
                WHEN EXISTS (
                    SELECT 1
                    FROM request_register_vendor rrv_ip
                    WHERE rrv_ip.VENDOR_ID = v.VENDOR_ID
                      AND rrv_ip.INUSE = 1
                      AND rrv_ip.REQUEST_STATUS NOT IN ('Completed', 'Rejected', 'Vendor Disagreed', 'Cancelled')
                ) THEN 'In Progress'
                ELSE IFNULL(vmr.STATUS_CHECK, 'Not Registered')
            END
        `
    // Count query
    let sqlCount = `
                            SELECT
                                       COUNT(DISTINCT v.VENDOR_ID) AS TOTAL_COUNT
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.VENDOR_TYPE_ID = vt.VENDOR_TYPE_ID
                                            LEFT JOIN
                                       vendor_contacts vc ON v.VENDOR_ID = vc.VENDOR_ID AND vc.INUSE = 1
                                            LEFT JOIN
                                       vendor_products vp ON v.VENDOR_ID = vp.VENDOR_ID AND vp.INUSE = 1
                                            LEFT JOIN
                                       master_product_groups mpg ON vp.PRODUCT_GROUP_ID = mpg.PRODUCT_GROUP_ID
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.VENDOR_ID = vmr.VENDOR_ID
                            WHERE
                                       1 = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
        `

    // Data query
    let sqlData = `
                            SELECT
                                       v.VENDOR_ID
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , vp.VENDOR_PRODUCT_ID
                                     , vp.PRODUCT_GROUP_ID
                                     , vc.VENDOR_CONTACT_ID
                                     , v.COMPANY_NAME
                                     , vt.NAME AS vendor_type_name
                                     , v.VENDOR_REGION
                                     , v.PROVINCE
                                     , v.POSTAL_CODE
                                     , v.WEBSITE
                                     , v.ADDRESS
                                     , v.TEL_CENTER
                                     , v.EMAILMAIN
                                     , mpg.GROUP_NAME
                                     , vp.MAKER_NAME
                                     , vp.PRODUCT_NAME
                                     , vp.MODEL_LIST
                                     , vc.CONTACT_NAME
                                     , vc.TEL_PHONE
                                     , vc.EMAIL
                                     , vc.POSITION
                                     , v.CREATE_BY
                                     , v.UPDATE_BY
                                     , v.CREATE_DATE
                                     , v.UPDATE_DATE
                                     , v.INUSE
                                     
                                     -- Prones Matching Data
                                     , dataItem.STATUSCHECKEXPRESSION AS status_check
                                     , IFNULL(vmr.PRONES_CODE, v.FFT_VENDOR_CODE) AS prones_code
                                     , vmr.PRONES_NAME AS prones_name_en
                                     , vmr.MATCH_METHOD

                                     -- Reject Reason
                                     , (
                                          SELECT rrv.APPROVER_REMARK
                                          FROM request_register_vendor rrv
                                          WHERE rrv.VENDOR_ID = v.VENDOR_ID AND rrv.REQUEST_STATUS = 'Rejected'
                                          ORDER BY rrv.REQUEST_ID DESC LIMIT 1
                                     ) AS reject_reason
                                     
                                     -- Contacts JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_contact_id', sub_vc.VENDOR_CONTACT_ID,
                                                                    'contact_name', sub_vc.CONTACT_NAME,
                                                                    'tel_phone', sub_vc.TEL_PHONE,
                                                                    'email', sub_vc.EMAIL,
                                                                    'position', sub_vc.POSITION,
                                                                    'CREATE_BY', sub_vc.CREATE_BY,
                                                                    'UPDATE_BY', sub_vc.UPDATE_BY,
                                                                    'CREATE_DATE', DATE_FORMAT(sub_vc.CREATE_DATE, '%Y-%m-%d %H:%i:%s'),
                                                                    'UPDATE_DATE', DATE_FORMAT(sub_vc.UPDATE_DATE, '%Y-%m-%d %H:%i:%s')
                                                                )
                                                           )
                                                FROM
                                                           vendor_contacts sub_vc
                                                WHERE
                                                           sub_vc.VENDOR_ID = v.VENDOR_ID AND sub_vc.INUSE = 1
                                       ) AS contacts_json

                                     -- Products JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_product_id', sub_vp.VENDOR_PRODUCT_ID,
                                                                    'product_group_id', sub_vp.PRODUCT_GROUP_ID,
                                                                    'group_name', sub_mpg.GROUP_NAME,
                                                                    'maker_name', sub_vp.MAKER_NAME,
                                                                    'product_name', sub_vp.PRODUCT_NAME,
                                                                    'model_list', sub_vp.MODEL_LIST,
                                                                    'CREATE_BY', sub_vp.CREATE_BY,
                                                                    'UPDATE_BY', sub_vp.UPDATE_BY,
                                                                    'CREATE_DATE', DATE_FORMAT(sub_vp.CREATE_DATE, '%Y-%m-%d %H:%i:%s'),
                                                                    'UPDATE_DATE', DATE_FORMAT(sub_vp.UPDATE_DATE, '%Y-%m-%d %H:%i:%s')
                                                                )
                                                           )
                                                FROM
                                                           vendor_products sub_vp
                                                                LEFT JOIN
                                                           master_product_groups sub_mpg ON sub_vp.PRODUCT_GROUP_ID = sub_mpg.PRODUCT_GROUP_ID
                                                WHERE
                                                           sub_vp.VENDOR_ID = v.VENDOR_ID AND sub_vp.INUSE = 1
                                       ) AS products_json
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.VENDOR_TYPE_ID = vt.VENDOR_TYPE_ID
                                            LEFT JOIN
                                       vendor_contacts vc ON v.VENDOR_ID = vc.VENDOR_ID AND vc.INUSE = 1
                                            LEFT JOIN
                                       vendor_products vp ON v.VENDOR_ID = vp.VENDOR_ID AND vp.INUSE = 1
                                            LEFT JOIN
                                       master_product_groups mpg ON vp.PRODUCT_GROUP_ID = mpg.PRODUCT_GROUP_ID
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.VENDOR_ID = vmr.VENDOR_ID
                            WHERE
                                       1 = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
                            GROUP BY
                                       v.VENDOR_ID
                            ORDER BY
                                       dataItem.ORDER
                            LIMIT
                                       dataItem.LIMIT OFFSET dataItem.OFFSET
        `

    // Replace placeholders
    sqlCount = sqlCount.replaceAll('dataItem.STATUSCHECKEXPRESSION', statusCheckExpression)
    sqlCount = sqlCount.replaceAll('dataItem.SQLWHERECOLUMNFILTER', dataItem['SQLWHERECOLUMNFILTER'] || '')
    sqlCount = sqlCount.replaceAll('dataItem.SQLWHERE', sqlWhere)

    sqlData = sqlData.replaceAll('dataItem.STATUSCHECKEXPRESSION', statusCheckExpression)
    sqlData = sqlData.replaceAll('dataItem.SQLWHERECOLUMNFILTER', dataItem['SQLWHERECOLUMNFILTER'] || '')
    sqlData = sqlData.replaceAll('dataItem.SQLWHERE', sqlWhere)
    sqlData = sqlData.replaceAll('dataItem.ORDER', dataItem['ORDER'] || 'v.VENDOR_ID DESC')
    sqlData = sqlData.replaceAll('dataItem.LIMIT', (dataItem['LIMIT'] || 10).toString())
    sqlData = sqlData.replaceAll('dataItem.OFFSET', (dataItem['OFFSET'] || 0).toString())

    return [sqlCount, sqlData]
  },

  // Get vendor by ID
  getById: (dataItem: { [key: string]: any; VENDOR_ID?: number | string; vendor_id?: number | string }) => {
    const statusCheckExpression = `
            CASE
                WHEN v.FFT_STATUS = 2 THEN 'Cannot Register'
                WHEN EXISTS (
                    SELECT 1
                    FROM request_register_vendor rrv_ip
                    WHERE rrv_ip.VENDOR_ID = v.VENDOR_ID
                      AND rrv_ip.INUSE = 1
                      AND rrv_ip.REQUEST_STATUS NOT IN ('Completed', 'Rejected', 'Vendor Disagreed', 'Cancelled')
                ) THEN 'In Progress'
                ELSE IFNULL(vmr.STATUS_CHECK, 'Not Registered')
            END
        `
    let sql = `
                            SELECT
                                       v.VENDOR_ID
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , v.COMPANY_NAME
                                     , v.VENDOR_TYPE_ID
                                     , vt.NAME AS vendor_type_name
                                     , v.VENDOR_REGION
                                     , v.PROVINCE
                                     , v.POSTAL_CODE
                                     , v.WEBSITE
                                     , v.ADDRESS
                                     , v.TEL_CENTER
                                     , v.EMAILMAIN
                                     , v.CREATE_BY
                                     , v.UPDATE_BY
                                     , v.CREATE_DATE
                                     , v.UPDATE_DATE
                                     , v.INUSE
                                     
                                     -- Prones Matching Data
                                     , dataItem.STATUSCHECKEXPRESSION AS status_check
                                     , IFNULL(vmr.PRONES_CODE, v.FFT_VENDOR_CODE) AS prones_code
                                     , vmr.PRONES_NAME AS prones_name_en
                                     , vmr.MATCH_METHOD
                                     
                                     -- Contacts JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_contact_id', sub_vc.VENDOR_CONTACT_ID,
                                                                    'contact_name', sub_vc.CONTACT_NAME,
                                                                    'tel_phone', sub_vc.TEL_PHONE,
                                                                    'email', sub_vc.EMAIL,
                                                                    'position', sub_vc.POSITION,
                                                                    'contact_create_by', sub_vc.CREATE_BY,
                                                                    'contact_update_by', sub_vc.UPDATE_BY,
                                                                    'contact_create_date', DATE_FORMAT(sub_vc.CREATE_DATE, '%Y-%m-%d %H:%i:%s'),
                                                                    'contact_update_date', DATE_FORMAT(sub_vc.UPDATE_DATE, '%Y-%m-%d %H:%i:%s')
                                                                )
                                                           )
                                                FROM
                                                           vendor_contacts sub_vc
                                                WHERE
                                                           sub_vc.VENDOR_ID = v.VENDOR_ID AND sub_vc.INUSE = 1
                                        ) AS contacts_json

                                     -- Products JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_product_id', sub_vp.VENDOR_PRODUCT_ID,
                                                                    'product_group_id', sub_vp.PRODUCT_GROUP_ID,
                                                                    'group_name', sub_mpg.GROUP_NAME,
                                                                    'maker_name', sub_vp.MAKER_NAME,
                                                                    'product_name', sub_vp.PRODUCT_NAME,
                                                                    'model_list', sub_vp.MODEL_LIST,
                                                                    'product_create_by', sub_vp.CREATE_BY,
                                                                    'product_create_date', DATE_FORMAT(sub_vp.CREATE_DATE, '%Y-%m-%d %H:%i:%s'),
                                                                    'product_update_by', sub_vp.UPDATE_BY,
                                                                    'product_update_date', DATE_FORMAT(sub_vp.UPDATE_DATE, '%Y-%m-%d %H:%i:%s')
                                                                )
                                                           )
                                                FROM
                                                           vendor_products sub_vp
                                                                LEFT JOIN
                                                           master_product_groups sub_mpg ON sub_vp.PRODUCT_GROUP_ID = sub_mpg.PRODUCT_GROUP_ID
                                                WHERE
                                                           sub_vp.VENDOR_ID = v.VENDOR_ID AND sub_vp.INUSE = 1
                                        ) AS products_json
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.VENDOR_TYPE_ID = vt.VENDOR_TYPE_ID
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.VENDOR_ID = vmr.VENDOR_ID
                            WHERE
                                       v.VENDOR_ID = dataItem.VENDOR_ID
        `
    sql = sql.replaceAll('dataItem.STATUSCHECKEXPRESSION', statusCheckExpression)
    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    return sql
  },

  // Helper to escape single quotes for SQL
  escapeSql: (str: string | null | undefined) => {
    if (str === null || str === undefined) return ''
    return String(str).replace(/'/g, "\\'")
  },

  toNullableNumberSql: (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return 'NULL'
    return String(value)
  },

  // Update vendor
  updateVendor: (dataItem: FindVendorDataItem) => {
    let sql = `
                            UPDATE vendors SET
                                       COMPANY_NAME = 'dataItem.COMPANY_NAME'
                                     , VENDOR_TYPE_ID = dataItem.VENDOR_TYPE_ID
                                     , VENDOR_REGION = 'dataItem.VENDOR_REGION'
                                     , PROVINCE = 'dataItem.PROVINCE'
                                     , POSTAL_CODE = 'dataItem.POSTAL_CODE'
                                     , WEBSITE = 'dataItem.WEBSITE'
                                     , ADDRESS = 'dataItem.ADDRESS'
                                     , TEL_CENTER = 'dataItem.TEL_CENTER'
                                     , EMAILMAIN = 'dataItem.EMAILMAIN'
                                     , INUSE = dataItem.INUSE
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDOR_ID = dataItem.VENDOR_ID
        `
    sql = sql.replaceAll('dataItem.COMPANY_NAME', dataItem['COMPANY_NAME'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_TYPE_ID', FindVendorSQL.toNullableNumberSql(dataItem['VENDOR_TYPE_ID']))
    sql = sql.replaceAll('dataItem.VENDOR_REGION', dataItem['VENDOR_REGION'] || 'Local')
    sql = sql.replaceAll('dataItem.PROVINCE', dataItem['PROVINCE'] || '')
    sql = sql.replaceAll('dataItem.POSTAL_CODE', dataItem['POSTAL_CODE'] || '')
    sql = sql.replaceAll('dataItem.WEBSITE', dataItem['WEBSITE'] || '')
    sql = sql.replaceAll('dataItem.ADDRESS', dataItem['ADDRESS'] || '')
    sql = sql.replaceAll('dataItem.TEL_CENTER', dataItem['TEL_CENTER'] || '')
    sql = sql.replaceAll('dataItem.EMAILMAIN', dataItem['EMAILMAIN'] || '')
    sql = sql.replaceAll('dataItem.INUSE', (dataItem['INUSE'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())

    return sql
  },

  // Update vendor contact
  updateVendorContact: (dataItem: FindVendorDataItem) => {
    let sql = `
                            UPDATE vendor_contacts SET
                                       CONTACT_NAME = 'dataItem.CONTACT_NAME'
                                     , TEL_PHONE = 'dataItem.TEL_PHONE'
                                     , EMAIL = 'dataItem.EMAIL'
                                     , POSITION = 'dataItem.POSITION'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDOR_CONTACT_ID = dataItem.VENDOR_CONTACT_ID
        `
    sql = sql.replaceAll('dataItem.CONTACT_NAME', dataItem['CONTACT_NAME'] || '')
    sql = sql.replaceAll('dataItem.TEL_PHONE', dataItem['TEL_PHONE'] || '')
    sql = sql.replaceAll('dataItem.EMAIL', dataItem['EMAIL'] || '')
    sql = sql.replaceAll('dataItem.POSITION', dataItem['POSITION'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_CONTACT_ID', (dataItem['VENDOR_CONTACT_ID'] || 0).toString())

    return sql
  },

  // Create vendor contact
  createVendorContact: (dataItem: FindVendorDataItem) => {
    let sql = `
                            INSERT INTO vendor_contacts (
                                       VENDOR_ID
                                     , CONTACT_NAME
                                     , TEL_PHONE
                                     , EMAIL
                                     , POSITION
                                     , CREATE_BY
                                     , CREATE_DATE
                                     , UPDATE_BY
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.VENDOR_ID
                                     , 'dataItem.CONTACT_NAME'
                                     , 'dataItem.TEL_PHONE'
                                     , 'dataItem.EMAIL'
                                     , 'dataItem.POSITION'
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     ,  1
                            )
        `
    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CONTACT_NAME', dataItem['CONTACT_NAME'] || '')
    sql = sql.replaceAll('dataItem.TEL_PHONE', dataItem['TEL_PHONE'] || '')
    sql = sql.replaceAll('dataItem.EMAIL', dataItem['EMAIL'] || '')
    sql = sql.replaceAll('dataItem.POSITION', dataItem['POSITION'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  // Update vendor product
  updateVendorProduct: (dataItem: FindVendorDataItem) => {
    let sql = `
                            UPDATE vendor_products SET
                                       PRODUCT_GROUP_ID = dataItem.PRODUCT_GROUP_ID
                                     , MAKER_NAME = 'dataItem.MAKER_NAME'
                                     , PRODUCT_NAME = 'dataItem.PRODUCT_NAME'
                                     , MODEL_LIST = 'dataItem.MODEL_LIST'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDOR_PRODUCT_ID = dataItem.VENDOR_PRODUCT_ID
        `
    sql = sql.replaceAll('dataItem.PRODUCT_GROUP_ID', (dataItem['PRODUCT_GROUP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'] || '')
    sql = sql.replaceAll('dataItem.PRODUCT_NAME', dataItem['PRODUCT_NAME'] || '')
    sql = sql.replaceAll('dataItem.MODEL_LIST', dataItem['MODEL_LIST'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_PRODUCT_ID', (dataItem['VENDOR_PRODUCT_ID'] || 0).toString())

    return sql
  },

  // Create vendor product
  createVendorProduct: (dataItem: FindVendorDataItem) => {
    let sql = `
                            INSERT INTO vendor_products (
                                       VENDOR_ID
                                     , PRODUCT_GROUP_ID
                                     , MAKER_NAME
                                     , PRODUCT_NAME
                                     , MODEL_LIST
                                     , CREATE_BY
                                     , CREATE_DATE
                                     , UPDATE_BY
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.VENDOR_ID
                                     ,  dataItem.PRODUCT_GROUP_ID
                                     , 'dataItem.MAKER_NAME'
                                     , 'dataItem.PRODUCT_NAME'
                                     , 'dataItem.MODEL_LIST'
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     ,  1
                            )
        `
    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.PRODUCT_GROUP_ID', (dataItem['PRODUCT_GROUP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'] || '')
    sql = sql.replaceAll('dataItem.PRODUCT_NAME', dataItem['PRODUCT_NAME'] || '')
    sql = sql.replaceAll('dataItem.MODEL_LIST', dataItem['MODEL_LIST'] || '')
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
                                       VENDOR_CONTACT_ID = dataItem.VENDOR_CONTACT_ID
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_CONTACT_ID', (dataItem['VENDOR_CONTACT_ID'] || 0).toString())
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
                                       VENDOR_PRODUCT_ID = dataItem.VENDOR_PRODUCT_ID
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_PRODUCT_ID', (dataItem['VENDOR_PRODUCT_ID'] || 0).toString())
    return sql
  },

  // Delete vendor (Soft Delete)
  deleteVendor: (dataItem: FindVendorDataItem) => {
    let sql = `
                            UPDATE vendors SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDOR_ID = dataItem.VENDOR_ID
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    return sql
  },

  // Get vendor types for dropdown
  getVendorTypes: (dataItem?: any) => {
    let sql = `
                            SELECT
                                       VENDOR_TYPE_ID AS value
                                     , NAME AS label
                            FROM
                                       master_vendor_types
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       NAME ASC
        `
    return sql
  },

  // Get provinces for dropdown
  getProvinces: (dataItem?: any) => {
    let sql = `
                            SELECT DISTINCT
                                       PROVINCE AS value
                                     , PROVINCE AS label
                            FROM
                                       vendors
                            WHERE
                                       INUSE = 1
                                       AND PROVINCE IS NOT NULL
                                       AND PROVINCE != ''
                            ORDER BY
                                       PROVINCE ASC
        `
    return sql
  },

  // Get product groups for dropdown
  getProductGroups: (dataItem?: any) => {
    let sql = `
                            SELECT
                                       PRODUCT_GROUP_ID AS value
                                     , GROUP_NAME AS label
                            FROM
                                       master_product_groups
                            WHERE
                                       INUSE = 1
                            ORDER BY
                                       GROUP_NAME ASC
        `
    return sql
  },

  // Search all vendors for export (no pagination limit)
  searchAllForExport: (dataItem: FindVendorDataItem, sqlWhere: string = '') => {
    const statusCheckExpression = `
            CASE
                WHEN v.FFT_STATUS = 2 THEN 'Cannot Register'
                WHEN EXISTS (
                    SELECT 1
                    FROM request_register_vendor rrv_ip
                    WHERE rrv_ip.VENDOR_ID = v.VENDOR_ID
                      AND rrv_ip.INUSE = 1
                      AND rrv_ip.REQUEST_STATUS NOT IN ('Completed', 'Rejected', 'Vendor Disagreed', 'Cancelled')
                ) THEN 'In Progress'
                ELSE IFNULL(vmr.STATUS_CHECK, 'Not Registered')
            END
        `
    let sqlData = `
                            SELECT
                                       v.VENDOR_ID
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , vp.VENDOR_PRODUCT_ID
                                     , vc.VENDOR_CONTACT_ID
                                     , v.COMPANY_NAME
                                     , vt.NAME AS vendor_type_name
                                     , v.VENDOR_REGION
                                     , v.PROVINCE
                                     , v.POSTAL_CODE
                                     , v.WEBSITE
                                     , v.ADDRESS
                                     , v.TEL_CENTER
                                     , v.EMAILMAIN
                                     , mpg.GROUP_NAME
                                     , vp.MAKER_NAME
                                     , vp.PRODUCT_NAME
                                     , vp.MODEL_LIST
                                     , vc.CONTACT_NAME
                                     , vc.TEL_PHONE
                                     , vc.EMAIL
                                     , vc.POSITION
                                     , v.CREATE_BY
                                     , v.UPDATE_BY
                                     , v.CREATE_DATE
                                     , v.UPDATE_DATE
                                     , v.INUSE

                                     -- Prones Matching Data
                                     , dataItem.STATUSCHECKEXPRESSION AS status_check
                                     , IFNULL(vmr.PRONES_CODE, v.FFT_VENDOR_CODE) AS prones_code
                                     , vmr.PRONES_NAME AS prones_name_en
                                     , vmr.MATCH_METHOD

                                     -- Reject Reason
                                     , (
                                          SELECT rrv.APPROVER_REMARK
                                          FROM request_register_vendor rrv
                                          WHERE rrv.VENDOR_ID = v.VENDOR_ID AND rrv.REQUEST_STATUS = 'Rejected'
                                          ORDER BY rrv.REQUEST_ID DESC LIMIT 1
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
                                       master_vendor_types vt ON v.VENDOR_TYPE_ID = vt.VENDOR_TYPE_ID
                                            LEFT JOIN
                                       vendor_contacts vc ON v.VENDOR_ID = vc.VENDOR_ID AND vc.INUSE = 1
                                            LEFT JOIN
                                       vendor_products vp ON v.VENDOR_ID = vp.VENDOR_ID AND vp.INUSE = 1
                                            LEFT JOIN
                                       master_product_groups mpg ON vp.PRODUCT_GROUP_ID = mpg.PRODUCT_GROUP_ID
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.VENDOR_ID = vmr.VENDOR_ID
                            WHERE
                                       1 = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
                            ORDER BY
                                       dataItem.ORDER
        `

    sqlData = sqlData.replaceAll('dataItem.STATUSCHECKEXPRESSION', statusCheckExpression)
    sqlData = sqlData.replaceAll('dataItem.SQLWHERECOLUMNFILTER', dataItem['SQLWHERECOLUMNFILTER'] || '')
    sqlData = sqlData.replaceAll('dataItem.SQLWHERE', sqlWhere)
    sqlData = sqlData.replaceAll('dataItem.ORDER', dataItem['ORDER'] || 'v.VENDOR_ID DESC')

    return sqlData
  },

  // Generate Global Search SQL
  generateGlobalSearchSql: (dataItem: { [key: string]: any; SEARCHKEYWORD?: string; searchKeyword?: string }) => {
    const cleanKeyword = dataItem && dataItem.SEARCHKEYWORD ? dataItem.SEARCHKEYWORD.trim() : ''

    if (cleanKeyword) {
      let sql = `
                            AND (
                                       v.COMPANY_NAME LIKE 'searchVal'
                                     OR v.PROVINCE LIKE 'searchVal'
                                     OR v.WEBSITE LIKE 'searchVal'
                                     OR v.FFT_VENDOR_CODE LIKE 'searchVal'
                                     OR v.EMAILMAIN LIKE 'searchVal'
                                     OR vc.EMAIL LIKE 'searchVal'
                                     OR vc.CONTACT_NAME LIKE 'searchVal'
                                     OR vc.TEL_PHONE LIKE 'searchVal'
                                     OR vp.PRODUCT_NAME LIKE 'searchVal'
                                     OR vp.MAKER_NAME LIKE 'searchVal'
                                     OR vp.MODEL_LIST LIKE 'searchVal'
                                     OR mpg.GROUP_NAME LIKE 'searchVal'
                                     OR vt.NAME LIKE 'searchVal'
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
                                       COMPANY_NAME
                                     , ADDRESS
                                     , TEL_CENTER
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
      .map((row: any, index: number) => {
        let valueSql = `('dataItem.CUSTOMER_CODE_${index}', 'dataItem.CUSTOMER_NAME_${index}', 'dataItem.CUSTOMER_ADDRESS1_${index}', 'dataItem.CUSTOMER_ADDRESS2_${index}', 'dataItem.CUSTOMER_ADDRESS3_${index}', 'dataItem.CUSTOMER_TEL_${index}')`
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_CODE_${index}`, escape(row.CUSTOMER_CODE))
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_NAME_${index}`, escape(row.CUSTOMER_NAME))
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_ADDRESS1_${index}`, escape(row.CUSTOMER_ADDRESS1))
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_ADDRESS2_${index}`, escape(row.CUSTOMER_ADDRESS2))
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_ADDRESS3_${index}`, escape(row.CUSTOMER_ADDRESS3))
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_TEL_${index}`, escape(row.CUSTOMER_TEL))
        return valueSql
      })
      .join(',\n')

    let sql = `
                            INSERT INTO staging_prones_data (
                                       CUSTOMER_CODE
                                     , CUSTOMER_NAME
                                     , CUSTOMER_ADDRESS1
                                     , CUSTOMER_ADDRESS2
                                     , CUSTOMER_ADDRESS3
                                     , CUSTOMER_TEL
                            ) VALUES dataItem.VALUES
        `
    sql = sql.replaceAll('dataItem.VALUES', values)
    return sql
  },

  // Vendor Matching - Get staging prones data (from MySQL)
  getStagingPronesData: (dataItem?: any) => {
    let sql = `SELECT CUSTOMER_CODE, CUSTOMER_NAME, CUSTOMER_ADDRESS1, CUSTOMER_ADDRESS2, CUSTOMER_ADDRESS3, CUSTOMER_TEL FROM staging_prones_data`
    return sql
  },

  // Vendor Matching - Get vendors for matching
  getVendorsForMatch: (dataItem?: any) => {
    let sql = `SELECT VENDOR_ID, COMPANY_NAME, ADDRESS, TEL_CENTER FROM vendors WHERE INUSE = 1`
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
      .map((row: any, index: number) => {
        let valueSql = `(dataItem.VENDOR_ID_${index}, 'dataItem.STATUS_CHECK_${index}', 'dataItem.PRONES_CODE_${index}', 'dataItem.PRONES_NAME_${index}', 'dataItem.MATCH_METHOD_${index}', NOW())`
        valueSql = valueSql.replaceAll(`dataItem.VENDOR_ID_${index}`, (Number(row.VENDOR_ID) || 0).toString())
        valueSql = valueSql.replaceAll(`dataItem.STATUS_CHECK_${index}`, escape(row.STATUS_CHECK))
        valueSql = valueSql.replaceAll(`dataItem.PRONES_CODE_${index}`, escape(row.PRONES_CODE))
        valueSql = valueSql.replaceAll(`dataItem.PRONES_NAME_${index}`, escape(row.PRONES_NAME))
        valueSql = valueSql.replaceAll(`dataItem.MATCH_METHOD_${index}`, escape(row.MATCH_METHOD))
        return valueSql
      })
      .join(',\n')

    let sql = `
                            INSERT INTO vendor_match_result (
                                       VENDOR_ID
                                     , STATUS_CHECK
                                     , PRONES_CODE
                                     , PRONES_NAME
                                     , MATCH_METHOD
                                     , LAST_UPDATED
                            ) VALUES dataItem.VALUES
        `
    sql = sql.replaceAll('dataItem.VALUES', values)
    return sql
  },

  // Vendor Matching - Get match result by vendor_id
  getMatchResultByVendorIds: (dataItem: { VENDORIDS: number[] }) => {
    const ids = dataItem.VENDORIDS.map(id => Number(id) || 0).join(',')
    let sql = `SELECT VENDOR_ID, STATUS_CHECK, PRONES_CODE, PRONES_NAME, MATCH_METHOD FROM vendor_match_result WHERE VENDOR_ID IN (dataItem.VENDOR_IDS)`
    sql = sql.replaceAll('dataItem.VENDOR_IDS', ids)
    return sql
  },

  // Vendor Matching - Get all match results
  getAllMatchResults: (dataItem?: any) => {
    let sql = `SELECT VENDOR_ID, STATUS_CHECK, PRONES_CODE, PRONES_NAME, MATCH_METHOD FROM vendor_match_result`
    return sql
  },
}
