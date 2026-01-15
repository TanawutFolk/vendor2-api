import { FindVendorModel } from '@src/_workspace/models/_find-vendor/FindVendorModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const FindVendorController = {
    // Search vendors
    search: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            // Extract search filters
            const searchParams = {
                company_name: dataItem.company_name || '',
                vendor_type_id: dataItem.vendor_type_id || '',
                province: dataItem.province || '',
                status: dataItem.status !== undefined ? dataItem.status : '',
                Start: dataItem.Start || 0,
                Limit: dataItem.Limit || 100
            }

            const result = await FindVendorModel.searchVendors(searchParams)
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
    }
}
