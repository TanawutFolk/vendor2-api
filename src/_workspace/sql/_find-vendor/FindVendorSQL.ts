import { RequestApprovalSummarySqlSnippets } from '../_request-register/RequestApprovalSummarySqlSnippets'


export const FindVendorSQL = {
  // Search vendors with contacts
  search: (dataItem: any, sqlWhere: any = '') => {
    const statusCheckExpression = `
            CASE
                WHEN v.FFT_STATUS = 2 THEN 'Cannot Register'
                WHEN EXISTS (
                    SELECT 1
                    FROM request_register_vendor rrv_ip
                    WHERE rrv_ip.VENDORS_ID = v.VENDORS_ID
                      AND rrv_ip.INUSE = 1
                      AND rrv_ip.REQUEST_STATE = 'in_progress'
                ) THEN 'In Progress'
                ELSE IFNULL(vmr.STATUS_CHECK, 'Not Registered')
            END
        `
    // Count query
    let sqlCount = `
                            SELECT
                                       COUNT(DISTINCT v.VENDORS_ID) AS TOTAL_COUNT
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.MASTER_VENDOR_TYPES_ID = vt.MASTER_VENDOR_TYPES_ID
                                            LEFT JOIN
                                       vendor_contacts vc ON v.VENDORS_ID = vc.VENDORS_ID AND vc.INUSE = 1
                                            LEFT JOIN
                                       vendor_products vp ON v.VENDORS_ID = vp.VENDORS_ID AND vp.INUSE = 1
                                            LEFT JOIN
                                       master_product_groups mpg ON vp.MASTER_PRODUCT_GROUPS_ID = mpg.MASTER_PRODUCT_GROUPS_ID
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.VENDORS_ID = vmr.VENDORS_ID
                            WHERE
                                       1 = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
        `

    // Data query
    let sqlData = `
                            SELECT
                                       v.VENDORS_ID
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , vp.VENDOR_PRODUCTS_ID
                                     , vp.MASTER_PRODUCT_GROUPS_ID
                                     , vc.VENDOR_CONTACTS_ID
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
                                          SELECT ${RequestApprovalSummarySqlSnippets.latestApprovalRemarkExpr('rrv.REQUEST_REGISTER_VENDOR_ID')}
                                          FROM request_register_vendor rrv
                                          WHERE rrv.VENDORS_ID = v.VENDORS_ID AND rrv.REQUEST_STATE = 'rejected'
                                          ORDER BY rrv.REQUEST_REGISTER_VENDOR_ID DESC LIMIT 1
                                     ) AS reject_reason
                                     
                                     -- Contacts JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_contact_id', sub_vc.VENDOR_CONTACTS_ID,
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
                                                           sub_vc.VENDORS_ID = v.VENDORS_ID AND sub_vc.INUSE = 1
                                       ) AS contacts_json

                                     -- Products JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_product_id', sub_vp.VENDOR_PRODUCTS_ID,
                                                                    'product_group_id', sub_vp.MASTER_PRODUCT_GROUPS_ID,
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
                                                           master_product_groups sub_mpg ON sub_vp.MASTER_PRODUCT_GROUPS_ID = sub_mpg.MASTER_PRODUCT_GROUPS_ID
                                                WHERE
                                                           sub_vp.VENDORS_ID = v.VENDORS_ID AND sub_vp.INUSE = 1
                                       ) AS products_json
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.MASTER_VENDOR_TYPES_ID = vt.MASTER_VENDOR_TYPES_ID
                                            LEFT JOIN
                                       vendor_contacts vc ON v.VENDORS_ID = vc.VENDORS_ID AND vc.INUSE = 1
                                            LEFT JOIN
                                       vendor_products vp ON v.VENDORS_ID = vp.VENDORS_ID AND vp.INUSE = 1
                                            LEFT JOIN
                                       master_product_groups mpg ON vp.MASTER_PRODUCT_GROUPS_ID = mpg.MASTER_PRODUCT_GROUPS_ID
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.VENDORS_ID = vmr.VENDORS_ID
                            WHERE
                                       1 = 1
                                       dataItem.SQLWHERE
                                       dataItem.SQLWHERECOLUMNFILTER
                            GROUP BY
                                       v.VENDORS_ID
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
    sqlData = sqlData.replaceAll('dataItem.ORDER', dataItem['ORDER'] || 'v.VENDORS_ID DESC')
    sqlData = sqlData.replaceAll('dataItem.LIMIT', (dataItem['LIMIT'] || 10).toString())
    sqlData = sqlData.replaceAll('dataItem.OFFSET', (dataItem['OFFSET'] || 0).toString())

    return [sqlCount, sqlData]
  },

  // Get vendor by ID
  getById: (dataItem: any) => {
    const statusCheckExpression = `
            CASE
                WHEN v.FFT_STATUS = 2 THEN 'Cannot Register'
                WHEN EXISTS (
                    SELECT 1
                    FROM request_register_vendor rrv_ip
                    WHERE rrv_ip.VENDORS_ID = v.VENDORS_ID
                      AND rrv_ip.INUSE = 1
                      AND rrv_ip.REQUEST_STATE = 'in_progress'
                ) THEN 'In Progress'
                ELSE IFNULL(vmr.STATUS_CHECK, 'Not Registered')
            END
        `
    let sql = `
                            SELECT
                                       v.VENDORS_ID
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , v.COMPANY_NAME
                                     , v.MASTER_VENDOR_TYPES_ID
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
                                                                    'vendor_contact_id', sub_vc.VENDOR_CONTACTS_ID,
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
                                                           sub_vc.VENDORS_ID = v.VENDORS_ID AND sub_vc.INUSE = 1
                                        ) AS contacts_json

                                     -- Products JSON (aggregated)
                                     , (
                                                SELECT
                                                           JSON_ARRAYAGG(
                                                                JSON_OBJECT(
                                                                    'vendor_product_id', sub_vp.VENDOR_PRODUCTS_ID,
                                                                    'product_group_id', sub_vp.MASTER_PRODUCT_GROUPS_ID,
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
                                                           master_product_groups sub_mpg ON sub_vp.MASTER_PRODUCT_GROUPS_ID = sub_mpg.MASTER_PRODUCT_GROUPS_ID
                                                WHERE
                                                           sub_vp.VENDORS_ID = v.VENDORS_ID AND sub_vp.INUSE = 1
                                        ) AS products_json
                            FROM
                                       vendors v
                                            LEFT JOIN
                                       master_vendor_types vt ON v.MASTER_VENDOR_TYPES_ID = vt.MASTER_VENDOR_TYPES_ID
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.VENDORS_ID = vmr.VENDORS_ID
                            WHERE
                                       v.VENDORS_ID = dataItem.VENDORS_ID
        `
    sql = sql.replaceAll('dataItem.STATUSCHECKEXPRESSION', statusCheckExpression)
    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    return sql
  },

  // Helper to escape single quotes for SQL  toNullableNumberSql: (value: any) => {
    if (value === null || value === undefined || value === '') return 'NULL'
    return String(value)
  },

  // Update vendor
  updateVendor: (dataItem: any) => {
    let sql = `
                            UPDATE vendors SET
                                       COMPANY_NAME = 'dataItem.COMPANY_NAME'
                                     , MASTER_VENDOR_TYPES_ID = dataItem.MASTER_VENDOR_TYPES_ID
                                     , VENDOR_REGION = 'dataItem.VENDOR_REGION'
                                     , PROVINCE = 'dataItem.PROVINCE'
                                     , POSTAL_CODE = 'dataItem.POSTAL_CODE'
                                     , WEBSITE = 'dataItem.WEBSITE'
                                     , ADDRESS = 'dataItem.ADDRESS'
                                     , TEL_CENTER = 'dataItem.TEL_CENTER'
                                     , EMAILMAIN = 'dataItem.EMAILMAIN'
                                     , DESCRIPTION = LEFT(COALESCE(NULLIF(DESCRIPTION, ''), 'dataItem.COMPANY_NAME'), 100)
                                     , INUSE = dataItem.INUSE
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDORS_ID = dataItem.VENDORS_ID
        `
    sql = sql.replaceAll('dataItem.COMPANY_NAME', dataItem['COMPANY_NAME'] || '')
    sql = sql.replaceAll('dataItem.MASTER_VENDOR_TYPES_ID', FindVendorSQL.toNullableNumberSql(dataItem['MASTER_VENDOR_TYPES_ID']))
    sql = sql.replaceAll('dataItem.VENDOR_REGION', dataItem['VENDOR_REGION'] || 'Local')
    sql = sql.replaceAll('dataItem.PROVINCE', dataItem['PROVINCE'] || '')
    sql = sql.replaceAll('dataItem.POSTAL_CODE', dataItem['POSTAL_CODE'] || '')
    sql = sql.replaceAll('dataItem.WEBSITE', dataItem['WEBSITE'] || '')
    sql = sql.replaceAll('dataItem.ADDRESS', dataItem['ADDRESS'] || '')
    sql = sql.replaceAll('dataItem.TEL_CENTER', dataItem['TEL_CENTER'] || '')
    sql = sql.replaceAll('dataItem.EMAILMAIN', dataItem['EMAILMAIN'] || '')
    sql = sql.replaceAll('dataItem.INUSE', (dataItem['INUSE'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())

    return sql
  },

  // Update vendor contact
  updateVendorContact: (dataItem: any) => {
    let sql = `
                            UPDATE vendor_contacts SET
                                       CONTACT_NAME = 'dataItem.CONTACT_NAME'
                                     , TEL_PHONE = 'dataItem.TEL_PHONE'
                                     , EMAIL = 'dataItem.EMAIL'
                                     , POSITION = 'dataItem.POSITION'
                                     , DESCRIPTION = LEFT('dataItem.CONTACT_NAME', 100)
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDOR_CONTACTS_ID = dataItem.VENDOR_CONTACTS_ID
        `
    sql = sql.replaceAll('dataItem.CONTACT_NAME', dataItem['CONTACT_NAME'] || '')
    sql = sql.replaceAll('dataItem.TEL_PHONE', dataItem['TEL_PHONE'] || '')
    sql = sql.replaceAll('dataItem.EMAIL', dataItem['EMAIL'] || '')
    sql = sql.replaceAll('dataItem.POSITION', dataItem['POSITION'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_CONTACTS_ID', (dataItem['VENDOR_CONTACTS_ID'] || 0).toString())

    return sql
  },

  // Create vendor contact
  createVendorContact: (dataItem: any) => {
    let sql = `
                            INSERT INTO vendor_contacts (
                                       VENDORS_ID
                                     , CONTACT_NAME
                                     , TEL_PHONE
                                     , EMAIL
                                     , POSITION
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , CREATE_DATE
                                     , UPDATE_BY
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.VENDORS_ID
                                     , 'dataItem.CONTACT_NAME'
                                     , 'dataItem.TEL_PHONE'
                                     , 'dataItem.EMAIL'
                                     , 'dataItem.POSITION'
                                     , LEFT('dataItem.CONTACT_NAME', 100)
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     ,  1
                            )
        `
    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.CONTACT_NAME', dataItem['CONTACT_NAME'] || '')
    sql = sql.replaceAll('dataItem.TEL_PHONE', dataItem['TEL_PHONE'] || '')
    sql = sql.replaceAll('dataItem.EMAIL', dataItem['EMAIL'] || '')
    sql = sql.replaceAll('dataItem.POSITION', dataItem['POSITION'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  // Update vendor product
  updateVendorProduct: (dataItem: any) => {
    let sql = `
                            UPDATE vendor_products SET
                                       MASTER_PRODUCT_GROUPS_ID = dataItem.MASTER_PRODUCT_GROUPS_ID
                                     , MAKER_NAME = 'dataItem.MAKER_NAME'
                                     , PRODUCT_NAME = 'dataItem.PRODUCT_NAME'
                                     , MODEL_LIST = 'dataItem.MODEL_LIST'
                                     , DESCRIPTION = LEFT(CONCAT_WS(' / ', 'dataItem.PRODUCT_NAME', 'dataItem.MAKER_NAME', 'dataItem.MODEL_LIST'), 100)
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDOR_PRODUCTS_ID = dataItem.VENDOR_PRODUCTS_ID
        `
    sql = sql.replaceAll('dataItem.MASTER_PRODUCT_GROUPS_ID', (dataItem['MASTER_PRODUCT_GROUPS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'] || '')
    sql = sql.replaceAll('dataItem.PRODUCT_NAME', dataItem['PRODUCT_NAME'] || '')
    sql = sql.replaceAll('dataItem.MODEL_LIST', dataItem['MODEL_LIST'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_PRODUCTS_ID', (dataItem['VENDOR_PRODUCTS_ID'] || 0).toString())

    return sql
  },

  // Create vendor product
  createVendorProduct: (dataItem: any) => {
    let sql = `
                            INSERT INTO vendor_products (
                                       VENDORS_ID
                                     , MASTER_PRODUCT_GROUPS_ID
                                     , MAKER_NAME
                                     , PRODUCT_NAME
                                     , MODEL_LIST
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , CREATE_DATE
                                     , UPDATE_BY
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES (
                                        dataItem.VENDORS_ID
                                     ,  dataItem.MASTER_PRODUCT_GROUPS_ID
                                     , 'dataItem.MAKER_NAME'
                                     , 'dataItem.PRODUCT_NAME'
                                     , 'dataItem.MODEL_LIST'
                                     , LEFT(CONCAT_WS(' / ', 'dataItem.PRODUCT_NAME', 'dataItem.MAKER_NAME', 'dataItem.MODEL_LIST'), 100)
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     , 'dataItem.UPDATE_BY'
                                     ,  NOW()
                                     ,  1
                            )
        `
    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.MASTER_PRODUCT_GROUPS_ID', (dataItem['MASTER_PRODUCT_GROUPS_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.MAKER_NAME', dataItem['MAKER_NAME'] || '')
    sql = sql.replaceAll('dataItem.PRODUCT_NAME', dataItem['PRODUCT_NAME'] || '')
    sql = sql.replaceAll('dataItem.MODEL_LIST', dataItem['MODEL_LIST'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  // Delete vendor contact (Soft Delete)
  deleteVendorContact: (dataItem: any) => {
    let sql = `
                            UPDATE vendor_contacts SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDOR_CONTACTS_ID = dataItem.VENDOR_CONTACTS_ID
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_CONTACTS_ID', (dataItem['VENDOR_CONTACTS_ID'] || 0).toString())
    return sql
  },

  // Delete vendor product (Soft Delete)
  deleteVendorProduct: (dataItem: any) => {
    let sql = `
                            UPDATE vendor_products SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDOR_PRODUCTS_ID = dataItem.VENDOR_PRODUCTS_ID
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDOR_PRODUCTS_ID', (dataItem['VENDOR_PRODUCTS_ID'] || 0).toString())
    return sql
  },

  // Delete vendor (Soft Delete)
  deleteVendor: (dataItem: any) => {
    let sql = `
                            UPDATE vendors SET
                                       INUSE = 0
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       VENDORS_ID = dataItem.VENDORS_ID
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')
    sql = sql.replaceAll('dataItem.VENDORS_ID', (dataItem['VENDORS_ID'] || 0).toString())
    return sql
  },

  // Get vendor types for dropdown
  getVendorTypes: (dataItem?: any) => {
    let sql = `
                            SELECT
                                       MASTER_VENDOR_TYPES_ID AS value
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
                                       MASTER_PRODUCT_GROUPS_ID AS value
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
  searchAllForExport: (dataItem: any, sqlWhere: any = '') => {
    const statusCheckExpression = `
            CASE
                WHEN v.FFT_STATUS = 2 THEN 'Cannot Register'
                WHEN EXISTS (
                    SELECT 1
                    FROM request_register_vendor rrv_ip
                    WHERE rrv_ip.VENDORS_ID = v.VENDORS_ID
                      AND rrv_ip.INUSE = 1
                      AND rrv_ip.REQUEST_STATE = 'in_progress'
                ) THEN 'In Progress'
                ELSE IFNULL(vmr.STATUS_CHECK, 'Not Registered')
            END
        `
    let sqlData = `
                            SELECT
                                       v.VENDORS_ID
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , vp.VENDOR_PRODUCTS_ID
                                     , vc.VENDOR_CONTACTS_ID
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
                                          SELECT ${RequestApprovalSummarySqlSnippets.latestApprovalRemarkExpr('rrv.REQUEST_REGISTER_VENDOR_ID')}
                                          FROM request_register_vendor rrv
                                          WHERE rrv.VENDORS_ID = v.VENDORS_ID AND rrv.REQUEST_STATE = 'rejected'
                                          ORDER BY rrv.REQUEST_REGISTER_VENDOR_ID DESC LIMIT 1
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
                                       master_vendor_types vt ON v.MASTER_VENDOR_TYPES_ID = vt.MASTER_VENDOR_TYPES_ID
                                            LEFT JOIN
                                       vendor_contacts vc ON v.VENDORS_ID = vc.VENDORS_ID AND vc.INUSE = 1
                                            LEFT JOIN
                                       vendor_products vp ON v.VENDORS_ID = vp.VENDORS_ID AND vp.INUSE = 1
                                            LEFT JOIN
                                       master_product_groups mpg ON vp.MASTER_PRODUCT_GROUPS_ID = mpg.MASTER_PRODUCT_GROUPS_ID
                                            LEFT JOIN
                                       vendor_match_result vmr ON v.VENDORS_ID = vmr.VENDORS_ID
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
    sqlData = sqlData.replaceAll('dataItem.ORDER', dataItem['ORDER'] || 'v.VENDORS_ID DESC')

    return sqlData
  },

  // Generate Global Search SQL
  generateGlobalSearchSql: (dataItem: any) => {
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

      const searchVal = `%${cleanKeyword}%`

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
    let sql = `
      UPDATE staging_prones_data
      SET INUSE = 0, UPDATE_BY = 'SYSTEM', UPDATE_DATE = NOW()
      WHERE INUSE = 1
    `
    return sql
  },

  // Staging Prones - Batch Insert
  insertStagingPronesBatch: (rows: any[]) => {    const values = rows
      .map((row: any, index: any) => {
        let valueSql = `('dataItem.CUSTOMER_CODE_${index}', 'dataItem.CUSTOMER_NAME_${index}', 'dataItem.CUSTOMER_ADDRESS1_${index}', 'dataItem.CUSTOMER_ADDRESS2_${index}', 'dataItem.CUSTOMER_ADDRESS3_${index}', 'dataItem.CUSTOMER_TEL_${index}', LEFT('dataItem.CUSTOMER_NAME_${index}', 100), 'SYSTEM', 'SYSTEM', NOW(), NOW(), 1)`
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_CODE_${index}`, row.CUSTOMER_CODE)
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_NAME_${index}`, row.CUSTOMER_NAME)
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_ADDRESS1_${index}`, row.CUSTOMER_ADDRESS1)
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_ADDRESS2_${index}`, row.CUSTOMER_ADDRESS2)
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_ADDRESS3_${index}`, row.CUSTOMER_ADDRESS3)
        valueSql = valueSql.replaceAll(`dataItem.CUSTOMER_TEL_${index}`, row.CUSTOMER_TEL)
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
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , CREATE_DATE
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES dataItem.VALUES
        `
    sql = sql.replaceAll('dataItem.VALUES', values)
    return sql
  },

  // Vendor Matching - Get staging prones data (from MySQL)
  getStagingPronesData: (dataItem?: any) => {
    let sql = `SELECT CUSTOMER_CODE, CUSTOMER_NAME, CUSTOMER_ADDRESS1, CUSTOMER_ADDRESS2, CUSTOMER_ADDRESS3, CUSTOMER_TEL FROM staging_prones_data WHERE INUSE = 1`
    return sql
  },

  // Vendor Matching - Get vendors for matching
  getVendorsForMatch: (dataItem?: any) => {
    let sql = `SELECT VENDORS_ID, COMPANY_NAME, ADDRESS, TEL_CENTER FROM vendors WHERE INUSE = 1`
    return sql
  },

  // Vendor Matching - Truncate match result
  truncateMatchResult: (dataItem?: any) => {
    let sql = `
      UPDATE vendor_match_result
      SET INUSE = 0, UPDATE_BY = 'SYSTEM', UPDATE_DATE = NOW()
      WHERE INUSE = 1
    `
    return sql
  },

  // Vendor Matching - Batch insert match results
  insertMatchResultBatch: (rows: any[]) => {    const values = rows
      .map((row: any, index: any) => {
        let valueSql = `(dataItem.VENDOR_ID_${index}, 'dataItem.STATUS_CHECK_${index}', 'dataItem.PRONES_CODE_${index}', 'dataItem.PRONES_NAME_${index}', 'dataItem.MATCH_METHOD_${index}', NOW(), LEFT('dataItem.MATCH_METHOD_${index}', 100), 'SYSTEM', 'SYSTEM', NOW(), NOW(), 1)`
        valueSql = valueSql.replaceAll(`dataItem.VENDOR_ID_${index}`, (Number(row.VENDORS_ID) || 0).toString())
        valueSql = valueSql.replaceAll(`dataItem.STATUS_CHECK_${index}`, row.STATUS_CHECK)
        valueSql = valueSql.replaceAll(`dataItem.PRONES_CODE_${index}`, row.PRONES_CODE)
        valueSql = valueSql.replaceAll(`dataItem.PRONES_NAME_${index}`, row.PRONES_NAME)
        valueSql = valueSql.replaceAll(`dataItem.MATCH_METHOD_${index}`, row.MATCH_METHOD)
        return valueSql
      })
      .join(',\n')

    let sql = `
                            INSERT INTO vendor_match_result (
                                       VENDORS_ID
                                     , STATUS_CHECK
                                     , PRONES_CODE
                                     , PRONES_NAME
                                     , MATCH_METHOD
                                     , LAST_UPDATED
                                     , DESCRIPTION
                                     , CREATE_BY
                                     , UPDATE_BY
                                     , CREATE_DATE
                                     , UPDATE_DATE
                                     , INUSE
                            ) VALUES dataItem.VALUES
                            ON DUPLICATE KEY UPDATE
                                       STATUS_CHECK = VALUES(STATUS_CHECK)
                                     , PRONES_CODE = VALUES(PRONES_CODE)
                                     , PRONES_NAME = VALUES(PRONES_NAME)
                                     , MATCH_METHOD = VALUES(MATCH_METHOD)
                                     , LAST_UPDATED = VALUES(LAST_UPDATED)
                                     , DESCRIPTION = VALUES(DESCRIPTION)
                                     , UPDATE_BY = VALUES(UPDATE_BY)
                                     , UPDATE_DATE = NOW()
                                     , INUSE = 1
        `
    sql = sql.replaceAll('dataItem.VALUES', values)
    return sql
  },

  // Vendor Matching - Get match result by vendor_id
  getMatchResultByVendorIds: (dataItem: any) => {
    const ids = dataItem.VENDORIDS.map((id: any) => Number(id) || 0).join(',')
    let sql = `SELECT VENDORS_ID, STATUS_CHECK, PRONES_CODE, PRONES_NAME, MATCH_METHOD FROM vendor_match_result WHERE VENDORS_ID IN (dataItem.VENDOR_IDS) AND INUSE = 1`
    sql = sql.replaceAll('dataItem.VENDOR_IDS', ids)
    return sql
  },

  // Vendor Matching - Get all match results
  getAllMatchResults: (dataItem?: any) => {
    let sql = `SELECT VENDORS_ID, STATUS_CHECK, PRONES_CODE, PRONES_NAME, MATCH_METHOD FROM vendor_match_result WHERE INUSE = 1`
    return sql
  },
}

