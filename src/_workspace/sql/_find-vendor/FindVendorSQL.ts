export const FindVendorSQL = {
    // Search vendors with contacts
    searchVendors: async (dataItem: any) => {
        let sql = `
            SELECT
                v.vendor_id,
                v.company_name,
                vt.name AS vendor_type_name,
                v.province,
                v.postal_code,
                v.website,
                v.address,
                v.tel_center,
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
            WHERE
                v.INUSE = 1
                AND v.company_name LIKE '%dataItem.company_name%'
                AND v.province LIKE '%dataItem.province%'
            ORDER BY v.company_name ASC, vc.seller_name ASC
            LIMIT dataItem.Limit OFFSET dataItem.Offset
        `

        sql = sql.replaceAll('dataItem.company_name', dataItem['company_name'] || '')
        sql = sql.replaceAll('dataItem.province', dataItem['province'] || '')
        sql = sql.replaceAll('dataItem.Limit', String(dataItem['Limit'] || 10))
        sql = sql.replaceAll('dataItem.Offset', String((dataItem['Start'] || 0) * (dataItem['Limit'] || 100)))

        return sql
    },

    // Count total vendors for pagination
    countVendors: async (dataItem: any) => {
        let sql = `
            SELECT
                COUNT(DISTINCT v.vendor_id) AS total_count
            FROM
                vendors v
            LEFT JOIN
                master_vendor_types vt ON v.vendor_type_id = vt.vendor_type_id
            LEFT JOIN
                vendor_contacts vc ON v.vendor_id = vc.vendor_id AND vc.INUSE = 1
            WHERE
                v.INUSE = 1
                AND v.company_name LIKE '%dataItem.company_name%'
                AND v.province LIKE '%dataItem.province%'
        `

        sql = sql.replaceAll('dataItem.company_name', dataItem['company_name'] || '')
        sql = sql.replaceAll('dataItem.province', dataItem['province'] || '')

        return sql
    }
}
