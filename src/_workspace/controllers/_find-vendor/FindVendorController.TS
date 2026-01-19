import { FindVendorModel } from '@src/_workspace/models/_find-vendor/FindVendorModel'
import { getSqlWhereByColumnFilters_elysia } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

// Helper function to get value from SearchFilters array
const getFilterValue = (searchFilters: any[], id: string) => {
    return searchFilters?.find((f: any) => f.id === id)?.value ?? ''
}

export const FindVendorController = {
    // Search vendors
    search: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        // Table mapping for ColumnFilters
        const tableIds = [
            { table: 'v', id: 'company_name' },
            { table: 'v', id: 'fft_vendor_code' },
            { table: 'v', id: 'fft_status' },
            { table: 'v', id: 'province' },
            { table: 'v', id: 'website' },
            { table: 'v', id: 'address' },
            { table: 'v', id: 'tel_center' },
            { table: 'vt', id: 'vendor_type_name', alias: 'name' },
            { table: 'mpg', id: 'group_name' },
            { table: 'vp', id: 'maker_name' },
            { table: 'vp', id: 'product_name' },
            { table: 'vp', id: 'model_list' },
            { table: 'vc', id: 'seller_name' },
            { table: 'vc', id: 'tel_phone' },
            { table: 'vc', id: 'email' },
            { table: 'vc', id: 'CREATE_BY' },
            { table: 'vc', id: 'UPDATE_BY' },
            { table: 'vc', id: 'CREATE_DATE' },
            { table: 'vc', id: 'UPDATE_DATE' },
        ]

        // 1. แปลง Start สำหรับ pagination (Start * Limit = Offset)
        dataItem['Offset'] = Number(dataItem['Start'] || 0) * Number(dataItem['Limit'] || 20)

        // 2. แปลง Order array เป็น SQL string
        let orderBy = ''
        if (!dataItem['Order'] || dataItem['Order'].length <= 0) {
            orderBy = 'v.company_name ASC'
        } else {
            for (let i = 0; i < dataItem['Order'].length; i++) {
                const word = dataItem['Order'][i]
                orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
            }
            orderBy = orderBy.slice(0, -1) // ตัด comma ตัวสุดท้าย
        }
        dataItem['Order'] = orderBy

        // 3. แปลง ColumnFilters เป็น SQL WHERE
        let sqlWhereColumnFilter = ''
        if (dataItem?.ColumnFilters?.length > 0) {
            sqlWhereColumnFilter = getSqlWhereByColumnFilters_elysia(dataItem.ColumnFilters, tableIds)
        }
        dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

        // 4. สร้าง sqlWhere จาก SearchFilters
        const searchFilters = dataItem.SearchFilters || []
        const companyName = getFilterValue(searchFilters, 'company_name')
        const province = getFilterValue(searchFilters, 'province')
        const vendorTypeId = getFilterValue(searchFilters, 'vendor_type_id')
        const status = getFilterValue(searchFilters, 'status')
        const groupName = getFilterValue(searchFilters, 'group_name')
        const productName = getFilterValue(searchFilters, 'product_name')
        const makerName = getFilterValue(searchFilters, 'maker_name')
        const modelList = getFilterValue(searchFilters, 'model_list')

        let sqlWhere = ''
        if (companyName) sqlWhere += ` AND v.company_name LIKE '%${companyName}%'`
        if (province) sqlWhere += ` AND v.province LIKE '%${province}%'`
        if (vendorTypeId && vendorTypeId !== '' && vendorTypeId !== -1) {
            sqlWhere += ` AND v.vendor_type_id = ${vendorTypeId}`
        }
        if (status) sqlWhere += ` AND v.fft_status = '${status}'`
        if (groupName) sqlWhere += ` AND vp.product_group_id = ${groupName}`
        if (productName) sqlWhere += ` AND vp.product_name LIKE '%${productName}%'`
        if (makerName) sqlWhere += ` AND vp.maker_name LIKE '%${makerName}%'`
        if (modelList) sqlWhere += ` AND vp.model_list LIKE '%${modelList}%'`

        dataItem['sqlWhere'] = sqlWhere

        console.log('dataItem:', dataItem)

        try {
            const result = await FindVendorModel.searchVendors(dataItem, sqlWhere)
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Vendors Failed',
                Message: error?.message || 'Failed to search vendors'
            } as ResponseI)
        }
    },

    // Get vendor by ID
    getById: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const vendor_id = parseInt(dataItem.vendor_id as string)

            if (!vendor_id || isNaN(vendor_id)) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Vendor By ID',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
            }

            const result = await FindVendorModel.getById(vendor_id)
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor By ID Failed',
                Message: error?.message || 'Failed to get vendor'
            } as ResponseI)
        }
    },

    // Update vendor
    update: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const vendor_id = parseInt(dataItem.vendor_id as string)

            if (!vendor_id || isNaN(vendor_id)) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Update Vendor',
                    Message: 'Invalid vendor ID'
                } as ResponseI)
            }

            const updateData = {
                vendor_id,
                ...dataItem
            }

            const result = await FindVendorModel.updateVendor(updateData)
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Update Vendor Failed',
                Message: error?.message || 'Failed to update vendor'
            } as ResponseI)
        }
    },

    // Get vendor types for dropdown
    getVendorTypes: async (req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getVendorTypes()
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor Types Failed',
                Message: error?.message || 'Failed to get vendor types'
            } as ResponseI)
        }
    },

    // Get provinces for dropdown
    getProvinces: async (req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getProvinces()
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Provinces Failed',
                Message: error?.message || 'Failed to get provinces'
            } as ResponseI)
        }
    },

    // Get product groups for dropdown
    getProductGroups: async (req: Request, res: Response) => {
        try {
            const result = await FindVendorModel.getProductGroups()
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Product Groups Failed',
                Message: error?.message || 'Failed to get product groups'
            } as ResponseI)
        }
    }
}
