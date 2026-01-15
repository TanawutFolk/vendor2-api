export const SearchResultTableSQL = {
    getVendor: (data: any){
        let sql = `
            SELECT DISTINCT
                v.vendor_id,            
                v.company_name,
                t.name AS vendor_type,  
                v.province,
                v.website,
                vc.seller_name,
                vc.tel_phone,
                v.email
            FROM vendors v
            LEFT JOIN master_vendor_types t ON v.vendor_type_id = t.vendor_type_id
            LEFT JOIN vendor_contacts vc ON v.vendor_id = vc.vendor_id AND vc.INUSE = 1
            LEFT JOIN vendor_products vp ON v.vendor_id = vp.vendor_id AND vp.INUSE = 1
            dataItem.WHERE
            ORDER BY dataItem.Order
            LIMIT dataItem.Start, dataItem.Limit
        `

        return sql
    }
}