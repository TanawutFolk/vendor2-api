import { AddVendorModel } from '@src/_workspace/models/_add-vendor/AddVendorModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const AddVendorController = {
    // Check duplicate vendor
    checkDuplicate: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const result = await AddVendorModel.checkDuplicateVendor(dataItem)
            res.status(200).json(result)
        } catch (error: any) {
            res.status(500).json({
                Status: false,
                isDuplicate: false,
                existingVendorId: null,
                Message: error?.message || 'Failed to check duplicate'
            })
        }
    },

    // Create new vendor with contacts and products
    create: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query.data
        } else {
            dataItem = req.body
        }

        try {
            // Ensure contacts and products are arrays if they exist
            if (dataItem.contacts && !Array.isArray(dataItem.contacts)) {
                dataItem.contacts = [dataItem.contacts]
            }
            if (dataItem.products && !Array.isArray(dataItem.products)) {
                dataItem.products = [dataItem.products]
            }

            const result = await AddVendorModel.createVendor(dataItem)
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            res.status(500).json({
                Status: false,
                Message: error?.message || 'Failed to create vendor',
                ResultOnDb: [],
                MethodOnDb: 'Create Vendor Failed',
                TotalCountOnDb: 0
            } as ResponseI)
        }
    },

    // Get vendor types for dropdown
    getVendorTypes: async (req: Request, res: Response) => {
        try {
            const result = await AddVendorModel.getVendorTypes()

            return res.json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Vendor Types',
                Message: 'Search Data Success',
            } as ResponseI)
        } catch (error: any) {
            res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor Types Failed',
                Message: error?.message || 'Failed to get vendor types',
            } as ResponseI)
        }
    },

    // Get product groups for dropdown
    getProductGroups: async (req: Request, res: Response) => {
        try {
            const result = await AddVendorModel.getProductGroups()

            return res.json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Product Groups',
                Message: 'Search Data Success',
            } as ResponseI)
        } catch (error: any) {
            res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Product Groups Failed',
                Message: error?.message || 'Failed to get product groups',
            } as ResponseI)
        }
    },

    // Create new product group
    createProductGroup: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const result = await AddVendorModel.createProductGroup(dataItem)
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            res.status(500).json({
                Status: false,
                Message: error?.message || 'Failed to create product group',
                ResultOnDb: [],
                MethodOnDb: 'Create Product Group Failed',
                TotalCountOnDb: 0
            } as ResponseI)
        }
    },
}
