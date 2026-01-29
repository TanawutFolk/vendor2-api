export const FindVendorSQL = {
    // Search vendors with contacts
    search: (dataItem: any, sqlWhere: string = '') => {
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
                1 = 1
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
                vp.product_group_id,
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
                vc.contact_name,
                vc.tel_phone,
                vc.email,
                vc.position,
                v.CREATE_BY,
                v.UPDATE_BY,
                v.CREATE_DATE,
                v.UPDATE_DATE,
                v.INUSE,
                
                -- Contact Audit
                vc.CREATE_BY AS contact_create_by,
                vc.UPDATE_BY AS contact_update_by,
                vc.CREATE_DATE AS contact_create_date,
                vc.UPDATE_DATE AS contact_update_date,
                
                -- Product Audit
                vp.UPDATE_BY AS product_update_by,
                vp.UPDATE_DATE AS product_update_date
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
                1 = 1
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
    getById: (vendor_id: number) => {
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
                vc.contact_name,
                vc.tel_phone,
                vc.email,
                vc.position,
                v.CREATE_BY,
                v.UPDATE_BY,
                v.CREATE_DATE,
                v.UPDATE_DATE,
                v.INUSE,

                -- Contact Audit
                vc.CREATE_BY AS contact_create_by,
                vc.UPDATE_BY AS contact_update_by,
                vc.CREATE_DATE AS contact_create_date,
                vc.UPDATE_DATE AS contact_update_date,
                
                -- Product Audit
                vp.UPDATE_BY AS product_update_by,
                vp.UPDATE_DATE AS product_update_date
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
    updateVendor: (dataItem: any) => {
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
    updateVendorContact: (dataItem: any) => {
        const sql = `
            UPDATE vendor_contacts SET
                contact_name = '${dataItem.contact_name || ''}',
                tel_phone = '${dataItem.tel_phone || ''}',
                email = '${dataItem.email || ''}',
                position = '${dataItem.position || ''}',
                UPDATE_BY = '${dataItem.UPDATE_BY || ''}',
                UPDATE_DATE = NOW()
            WHERE vendor_contact_id = ${dataItem.vendor_contact_id}
        `
        return sql
    },

    // Create vendor contact
    createVendorContact: (dataItem: any) => {
        let sql = `
            INSERT INTO vendor_contacts (
                vendor_id,
                contact_name,
                tel_phone,
                email,
                position,
                CREATE_BY,
                CREATE_DATE,
                UPDATE_BY,
                UPDATE_DATE,
                INUSE
            ) VALUES (
                dataItem.vendor_id,
                'dataItem.contact_name',
                'dataItem.tel_phone',
                'dataItem.email',
                'dataItem.position',
                'dataItem.UPDATE_BY',
                NOW(),
                'dataItem.UPDATE_BY',
                NOW(),
                1
            )
        `
        sql = sql.replaceAll('dataItem.vendor_id', String(dataItem.vendor_id))
        sql = sql.replaceAll('dataItem.contact_name', dataItem.contact_name || '')
        sql = sql.replaceAll('dataItem.tel_phone', dataItem.tel_phone || '')
        sql = sql.replaceAll('dataItem.email', dataItem.email || '')
        sql = sql.replaceAll('dataItem.position', dataItem.position || '')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || '')

        return sql
    },

    // Update vendor product
    updateVendorProduct: (dataItem: any) => {
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

    // Create vendor product
    createVendorProduct: (dataItem: any) => {
        let sql = `
            INSERT INTO vendor_products (
                vendor_id,
                product_group_id,
                maker_name,
                product_name,
                model_list,
                CREATE_BY,
                CREATE_DATE,
                UPDATE_BY,
                UPDATE_DATE,
                INUSE
            ) VALUES (
                dataItem.vendor_id,
                dataItem.product_group_id,
                'dataItem.maker_name',
                'dataItem.product_name',
                'dataItem.model_list',
                'dataItem.UPDATE_BY',
                NOW(),
                'dataItem.UPDATE_BY',
                NOW(),
                1
            )
        `
        sql = sql.replaceAll('dataItem.vendor_id', String(dataItem.vendor_id))
        sql = sql.replaceAll('dataItem.product_group_id', String(Number(dataItem.product_group_id) || 1))
        sql = sql.replaceAll('dataItem.maker_name', dataItem.maker_name || '')
        sql = sql.replaceAll('dataItem.product_name', dataItem.product_name || '')
        sql = sql.replaceAll('dataItem.model_list', dataItem.model_list || '')
        sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem.UPDATE_BY || '')

        return sql
    },

    // Get vendor types for dropdown
    getVendorTypes: () => {
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
    getProvinces: () => {
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
    getProductGroups: () => {
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
    searchAllForExport: (dataItem: any, sqlWhere: string = '') => {
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
                vc.contact_name,
                vc.tel_phone,
                vc.email,
                vc.position,
                v.CREATE_BY,
                v.UPDATE_BY,
                v.CREATE_DATE,
                v.UPDATE_DATE,
                
                -- Contact Audit
                vc.CREATE_BY AS contact_create_by,
                vc.UPDATE_BY AS contact_update_by,
                vc.CREATE_DATE AS contact_create_date,
                vc.UPDATE_DATE AS contact_update_date,
                
                -- Product Audit
                vp.UPDATE_BY AS product_update_by,
                vp.UPDATE_DATE AS product_update_date,
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
                1 = 1
                dataItem.sqlWhere
                dataItem.sqlWhereColumnFilter
            ORDER BY dataItem.Order
        `

        sqlData = sqlData.replaceAll('dataItem.sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'] || '')
        sqlData = sqlData.replaceAll('dataItem.sqlWhere', sqlWhere)
        sqlData = sqlData.replaceAll('dataItem.Order', dataItem['Order'] || 'v.company_name ASC')

        return sqlData
    },

    // Generate Global Search SQL //Dont delete comment 1/27/2026
    generateGlobalSearchSql: (keyword: string) => {
        // Remove special characters that might break BOOLEAN MODE, keep spaces
        keyword = keyword.replace(/[+\-><()~*"]/g, ' ')
        // Add wildcard * to each word for "starts with" behavior
        const booleanKeyword = keyword.split(/\s+/).filter((w: any) => w.length > 0).map((w: any) => `+${w}*`).join(' ')

        if (booleanKeyword) {
            // Old Code
            // return `
            //     AND (
            //         MATCH(v.company_name, v.fft_vendor_code, v.province, v.website) AGAINST('${booleanKeyword}' IN BOOLEAN MODE)
            //         OR MATCH(vc.email, vc.contact_name, vc.tel_phone) AGAINST('${booleanKeyword}' IN BOOLEAN MODE)
            //         OR MATCH(vp.product_name, vp.maker_name, vp.model_list) AGAINST('${booleanKeyword}' IN BOOLEAN MODE)
            //         OR MATCH(mpg.group_name) AGAINST('${booleanKeyword}' IN BOOLEAN MODE)
            //     )
            // `

            let sql = `
                AND (
                    MATCH(v.company_name, v.fft_vendor_code, v.province, v.website) AGAINST('booleanKeyword' IN BOOLEAN MODE)
                    OR MATCH(vc.email, vc.contact_name, vc.tel_phone) AGAINST('booleanKeyword' IN BOOLEAN MODE)
                    OR MATCH(vp.product_name, vp.maker_name, vp.model_list) AGAINST('booleanKeyword' IN BOOLEAN MODE)
                    OR MATCH(mpg.group_name) AGAINST('booleanKeyword' IN BOOLEAN MODE)
                )
            `
            sql = sql.replaceAll('booleanKeyword', booleanKeyword)
            return sql
        }
        return ''
    },




    // //prones
    getPronesData: () => {
        let sql =
            `
            SELECT 
                    RTRIM(I_DL_CD) Customer_code, 
                    RTRIM(I_DL_ARG_DESC) Customer_name,  
                    RTRIM(I_ADDRESS1) Customer_Address1, 
                    RTRIM(I_ADDRESS2) Customer_Address2,  
                    RTRIM(I_ADDRESS3) Customer_Address3, 
                    RTRIM(I_TEL) Customer_tel    
            FROM FFT.T_TRADE_MS
            WHERE  
                I_DL_CD LIKE '20030CA%'
        `
        // console.log(sql)
        return sql
    },

    getAllVendorNames: () => {
        let sql = `SELECT company_name,
                        address,
                        tel_center 
                FROM vendors 
                WHERE INUSE = 1`
        // console.log(sql)
        return sql
    },




}
