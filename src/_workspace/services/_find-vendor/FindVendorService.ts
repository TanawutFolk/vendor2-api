import { MySQLExecute, OracleExecute } from '@businessData/dbExecute'
import { FindVendorSQL } from '../../sql/_find-vendor/FindVendorSQL'
import { RowDataPacket } from 'mysql2'

export const FindVendorService = {
    // Search vendors with contacts
    searchVendors: async (dataItem: any, sqlWhere: string = '') => {
        // Check for Global Search
        const globalSearchFilter = dataItem.SearchFilters?.find((item: any) => item.id === 'global_search')
        if (globalSearchFilter?.value) {
            sqlWhere += FindVendorSQL.generateGlobalSearchSql(globalSearchFilter.value)
        }

        // Get SQL queries [countSql, dataSql]
        const sqlList = await FindVendorSQL.search(dataItem, sqlWhere)

        // Execute count query
        const countResult = (await MySQLExecute.search(sqlList[0])) as RowDataPacket[]
        const totalCount = countResult[0]?.TOTAL_COUNT || 0

        // Execute data query
        const resultData = (await MySQLExecute.search(sqlList[1])) as RowDataPacket[]

        return {
            resultData,
            totalCount
        }
    },

    // Get vendor by ID
    getById: async (vendor_id: number) => {
        const sql = await FindVendorSQL.getById(vendor_id)
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Update vendor
    updateVendor: async (dataItem: any) => {
        // Update vendor ONLY if company_name is provided (means vendor update)
        if (dataItem.company_name !== undefined) {
            const vendorSql = await FindVendorSQL.updateVendor(dataItem)
            await MySQLExecute.execute(vendorSql)
        }

        // Contact Logic
        if (dataItem.vendor_contact_id) {
            // Update Existing Contact
            const contactSql = await FindVendorSQL.updateVendorContact(dataItem)
            await MySQLExecute.execute(contactSql)
        } else if (dataItem.vendor_id && (dataItem.contact_name !== undefined || dataItem.email !== undefined)) {
            // Create New Contact
            const contactCreateSql = await FindVendorSQL.createVendorContact(dataItem)
            await MySQLExecute.execute(contactCreateSql)
        }

        // Product Logic
        if (dataItem.vendor_product_id) {
            // Update Existing Product
            const productSql = await FindVendorSQL.updateVendorProduct(dataItem)
            await MySQLExecute.execute(productSql)
        } else if (dataItem.vendor_id && (dataItem.product_name !== undefined || dataItem.maker_name !== undefined)) {
            // Create New Product
            const productCreateSql = await FindVendorSQL.createVendorProduct(dataItem)
            await MySQLExecute.execute(productCreateSql)
        }

        return dataItem
    },

    // Get vendor types
    getVendorTypes: async () => {
        const sql = await FindVendorSQL.getVendorTypes()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Get provinces
    getProvinces: async () => {
        const sql = await FindVendorSQL.getProvinces()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Get product groups
    getProductGroups: async () => {
        const sql = await FindVendorSQL.getProductGroups()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Search all vendors for export (no pagination)
    searchAllForExport: async (dataItem: any, sqlWhere: string = '') => {
        // Check for Global Search
        const globalSearchFilter = dataItem.SearchFilters?.find((item: any) => item.id === 'global_search')
        if (globalSearchFilter?.value) {
            sqlWhere += FindVendorSQL.generateGlobalSearchSql(globalSearchFilter.value)
        }

        const sql = await FindVendorSQL.searchAllForExport(dataItem, sqlWhere)
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },


    // Get prones data
    getPronesData: async (dataItem: any) => {
        const sql = await FindVendorSQL.getPronesData(dataItem)
        const resultData = (await OracleExecute.searchOracle(sql, 'PRONES')) as RowDataPacket[]
        return resultData
    },

    // Get all vendor names
    getAllVendorNames: async () => {
        const sql = await FindVendorSQL.getAllVendorNames()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    }
}
