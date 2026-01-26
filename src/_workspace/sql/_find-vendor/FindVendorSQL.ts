export const FindVendorSQL = {
    // Search vendors with contacts
    search: async (dataItem: any, sqlWhere: string = '') => {
        let sqlList: any = []

        // Count query - นับทุก rows (รวม products ของแต่ละ vendor)
        let sqlCount = `
            SELECT COUNT(*) AS TOTAL_COUNT
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
            WHERE
                v.INUSE = 1
                dataItem.sqlWhere
                dataItem.sqlWhereColumnFilter
        `

        // Data query
        let sqlData = `
            SELECT
                v.vendor_id,
                v.fft_vendor_code,
                v.fft_status,
                vp.vendor_product_id,
                vc.vendor_contact_id,
                v.company_name,
                vt.name AS vendor_type_name,
                v.province,
                v.postal_code,
                v.website,
                v.address,
                v.tel_center,
                mpg.group_name,
                vp.maker_name,
                vp.product_name,
                vp.model_list,
                vc.seller_name,
                vc.tel_phone,
                vc.email,
                vc.position,
                vc.CREATE_BY,
                vc.UPDATE_BY,
                vc.CREATE_DATE,
                vc.UPDATE_DATE,
                v.INUSE
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
            WHERE
                v.INUSE = 1
                dataItem.sqlWhere
                dataItem.sqlWhereColumnFilter
            ORDER BY dataItem.Order
            LIMIT dataItem.Limit OFFSET dataItem.Offset
        `

        // Replace placeholders
        sqlCount = sqlCount.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
        sqlCount = sqlCount.replaceAll('dataItem.sqlWhere', sqlWhere)

        sqlData = sqlData.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
        sqlData = sqlData.replaceAll('dataItem.sqlWhere', sqlWhere)
        sqlData = sqlData.replaceAll('dataItem.Order', dataItem['Order'] || 'v.company_name ASC')
        sqlData = sqlData.replaceAll('dataItem.Limit', String(dataItem['Limit'] || 20))
        sqlData = sqlData.replaceAll('dataItem.Offset', String(dataItem['Offset'] || 0))

        sqlList.push(sqlCount)
        sqlList.push(sqlData)

        console.log('--- FindVendorSQL Debug ---')
        console.log('sqlWhere param:', sqlWhere)
        console.log('sqlWhereColumnFilter:', dataItem['sqlWhereColumnFilter'])
        console.log('Generated SQL Data:', sqlData)
        console.log('---------------------------')

        return sqlList
    },

    // Get vendor by ID
    getById: async (vendor_id: number) => {
        const sql = `
            SELECT
                v.vendor_id,
                v.fft_vendor_code,
                v.fft_status,
                v.company_name,
                v.vendor_type_id,
                vt.name AS vendor_type_name,
                v.province,
                v.postal_code,
                v.website,
                v.address,
                v.tel_center,
                vp.vendor_product_id,
                mpg.group_name,
                vp.maker_name,
                vp.product_name,
                vp.model_list,
                vc.vendor_contact_id,
                vc.seller_name,
                vc.tel_phone,
                vc.email,
                vc.position,
                vc.CREATE_BY,
                vc.UPDATE_BY,
                vc.CREATE_DATE,
                vc.UPDATE_DATE,
                v.INUSE
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
            WHERE
                v.vendor_id = ${vendor_id}
                AND v.INUSE = 1
        `
        return sql
    },

    // Update vendor
    updateVendor: async (dataItem: any) => {
        const sql = `
            UPDATE vendors SET
                company_name = '${dataItem.company_name || ''}',
                vendor_type_id = ${dataItem.vendor_type_id},
                province = '${dataItem.province || ''}',
                postal_code = '${dataItem.postal_code || ''}',
                website = '${dataItem.website || ''}',
                address = '${dataItem.address || ''}',
                tel_center = '${dataItem.tel_center || ''}',
                UPDATE_BY = '${dataItem.UPDATE_BY || ''}',
                UPDATE_DATE = NOW()
            WHERE vendor_id = ${dataItem.vendor_id}
        `
        return sql
    },

    // Update vendor contact
    updateVendorContact: async (dataItem: any) => {
        const sql = `
            UPDATE vendor_contacts SET
                seller_name = '${dataItem.seller_name || ''}',
                tel_phone = '${dataItem.tel_phone || ''}',
                email = '${dataItem.email || ''}',
                position = '${dataItem.position || ''}',
                UPDATE_BY = '${dataItem.UPDATE_BY || ''}',
                UPDATE_DATE = NOW()
            WHERE vendor_contact_id = ${dataItem.vendor_contact_id}
        `
        return sql
    },

    // Update vendor product
    updateVendorProduct: async (dataItem: any) => {
        const sql = `
            UPDATE vendor_products SET
                product_group_id = ${Number(dataItem.product_group_id) || 1},
                maker_name = '${dataItem.maker_name || ''}',
                product_name = '${dataItem.product_name || ''}',
                model_list = '${dataItem.model_list || ''}',
                UPDATE_BY = '${dataItem.UPDATE_BY || ''}',
                UPDATE_DATE = NOW()
            WHERE vendor_product_id = ${dataItem.vendor_product_id}
        `
        return sql
    },

    // Get vendor types for dropdown
    getVendorTypes: async () => {
        const sql = `
            SELECT
                vendor_type_id AS value,
                name AS label
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
    getProvinces: async () => {
        const sql = `
            SELECT DISTINCT
                province AS value,
                province AS label
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
    getProductGroups: async () => {
        const sql = `
            SELECT
                product_group_id AS value,
                group_name AS label
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
    searchAllForExport: async (dataItem: any, sqlWhere: string = '') => {
        let sqlData = `
            SELECT
                v.vendor_id,
                v.fft_vendor_code,
                v.fft_status,
                vp.vendor_product_id,
                vc.vendor_contact_id,
                v.company_name,
                vt.name AS vendor_type_name,
                v.province,
                v.postal_code,
                v.website,
                v.address,
                v.tel_center,
                mpg.group_name,
                vp.maker_name,
                vp.product_name,
                vp.model_list,
                vc.seller_name,
                vc.tel_phone,
                vc.email,
                vc.position,
                vc.CREATE_BY,
                vc.UPDATE_BY,
                vc.CREATE_DATE,
                vc.UPDATE_DATE,
                v.INUSE
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
            WHERE
                v.INUSE = 1
                dataItem.sqlWhere
                dataItem.sqlWhereColumnFilter
            ORDER BY dataItem.Order
        `

        // Replace placeholders
        sqlData = sqlData.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
        sqlData = sqlData.replaceAll('dataItem.sqlWhere', sqlWhere)
        sqlData = sqlData.replaceAll('dataItem.Order', dataItem['Order'] || 'v.company_name ASC')

        return sqlData
    }
}
