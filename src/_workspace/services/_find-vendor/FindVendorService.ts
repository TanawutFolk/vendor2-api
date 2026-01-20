import { MySQLExecute } from '@businessData/dbExecute'
import { FindVendorSQL } from '../../sql/_find-vendor/FindVendorSQL'
import { RowDataPacket } from 'mysql2'

export const FindVendorService = {
    // Search vendors with contacts
    searchVendors: async (dataItem: any, sqlWhere: string = '') => {
        try {
            // Get SQL queries [countSql, dataSql]
            const sqlList = await FindVendorSQL.search(dataItem, sqlWhere)

            // Execute count query
            const countResult = (await MySQLExecute.search(sqlList[0])) as RowDataPacket[]
            const totalCount = countResult[0]?.TOTAL_COUNT || 0

            // Execute data query
            const resultData = (await MySQLExecute.search(sqlList[1])) as RowDataPacket[]

            return {
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: totalCount,
                MethodOnDb: 'Search Vendors',
                Message: 'Search Data Success'
            }
        } catch (error: any) {
            return {
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Vendors Failed',
                Message: error?.message || 'Failed to search vendors'
            }
        }
    },

    // Get vendor by ID
    getById: async (vendor_id: number) => {
        try {
            const sql = await FindVendorSQL.getById(vendor_id)
            const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

            if (resultData.length === 0) {
                return {
                    Status: false,
                    ResultOnDb: null,
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Vendor By ID',
                    Message: 'Vendor not found'
                }
            }

            return {
                Status: true,
                ResultOnDb: resultData[0],
                TotalCountOnDb: 1,
                MethodOnDb: 'Get Vendor By ID',
                Message: 'Get Data Success'
            }
        } catch (error: any) {
            return {
                Status: false,
                ResultOnDb: null,
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor By ID Failed',
                Message: error?.message || 'Failed to get vendor'
            }
        }
    },

    // Update vendor
    updateVendor: async (dataItem: any) => {
        try {
            // Update vendor ONLY if company_name is provided (means vendor update)
            if (dataItem.company_name !== undefined) {
                const vendorSql = await FindVendorSQL.updateVendor(dataItem)
                await MySQLExecute.execute(vendorSql)
            }

            // Update vendor contact if vendor_contact_id is provided
            if (dataItem.vendor_contact_id) {
                const contactSql = await FindVendorSQL.updateVendorContact(dataItem)
                await MySQLExecute.execute(contactSql)
            }

            // Update vendor product if vendor_product_id is provided
            if (dataItem.vendor_product_id) {
                const productSql = await FindVendorSQL.updateVendorProduct(dataItem)
                await MySQLExecute.execute(productSql)
            }

            return {
                Status: true,
                ResultOnDb: dataItem,
                TotalCountOnDb: 1,
                MethodOnDb: 'Update Vendor',
                Message: 'Update Data Success'
            }
        } catch (error: any) {
            return {
                Status: false,
                ResultOnDb: null,
                TotalCountOnDb: 0,
                MethodOnDb: 'Update Vendor Failed',
                Message: error?.message || 'Failed to update vendor'
            }
        }
    },

    // Get vendor types
    getVendorTypes: async () => {
        try {
            const sql = await FindVendorSQL.getVendorTypes()
            const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
            return {
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: resultData.length,
                MethodOnDb: 'Get Vendor Types',
                Message: 'Get Data Success'
            }
        } catch (error: any) {
            return {
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor Types Failed',
                Message: error?.message || 'Failed to get vendor types'
            }
        }
    },

    // Get provinces
    getProvinces: async () => {
        try {
            const sql = await FindVendorSQL.getProvinces()
            const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
            return {
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: resultData.length,
                MethodOnDb: 'Get Provinces',
                Message: 'Get Data Success'
            }
        } catch (error: any) {
            return {
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Provinces Failed',
                Message: error?.message || 'Failed to get provinces'
            }
        }
    },

    // Get product groups
    getProductGroups: async () => {
        try {
            const sql = await FindVendorSQL.getProductGroups()
            const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
            return {
                Status: true,
                ResultOnDb: resultData,
                TotalCountOnDb: resultData.length,
                MethodOnDb: 'Get Product Groups',
                Message: 'Get Data Success'
            }
        } catch (error: any) {
            return {
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Product Groups Failed',
                Message: error?.message || 'Failed to get product groups'
            }
        }
    },

    // Search all vendors for export (no pagination)
    searchAllForExport: async (dataItem: any, sqlWhere: string = '') => {
        try {
            const sql = await FindVendorSQL.searchAllForExport(dataItem, sqlWhere)
            const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
            return resultData
        } catch (error: any) {
            console.error('searchAllForExport error:', error)
            return []
        }
    }
}
