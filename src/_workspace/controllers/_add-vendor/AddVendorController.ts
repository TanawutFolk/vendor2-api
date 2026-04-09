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
            const result = await AddVendorModel.checkDuplicateVendor(dataItem) as any
            return res.status(200).json({
                Status: result?.Status ?? true,
                isDuplicate: result?.isDuplicate ?? false,
                existingVendorId: result?.existingVendorId ?? null,
                ResultOnDb: result?.ResultOnDb ?? [],
                TotalCountOnDb: result?.TotalCountOnDb ?? 0,
                MethodOnDb: 'Check Duplicate Vendor',
                Message: result?.Message || 'Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Check Duplicate Vendor Error:', error);
            return res.status(200).json({
                Status: false,
                isDuplicate: false,
                existingVendorId: null,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Check Duplicate Vendor',
                Message: error?.message || 'Failed to check duplicate'
            } as ResponseI)
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
            return res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Create Vendor Error:', error);
            return res.status(200).json({
                Status: false,
                Message: error?.message || 'Failed to create vendor',
                ResultOnDb: [],
                MethodOnDb: 'Create Vendor',
                TotalCountOnDb: 0
            } as ResponseI)
        }
    },

    // Get vendor types for dropdown
    getVendorTypes: async (req: Request, res: Response) => {
        try {
            const result = await AddVendorModel.getVendorTypes()

            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Vendor Types',
                Message: 'Search Data Success',
            } as ResponseI)
        } catch (error: any) {
            console.error('Get Vendor Types Error:', error);
            return res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Vendor Types',
                Message: error?.message || 'Failed to get vendor types',
            } as ResponseI)
        }
    },

    // Get product groups for dropdown
    getProductGroups: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const result = await AddVendorModel.getProductGroups()

            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Product Groups',
                Message: 'Search Data Success',
            } as ResponseI)
        } catch (error: any) {
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Product Groups',
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
            res.status(200).json({
                Status: false,
                Message: error?.message || 'Failed to create product group',
                ResultOnDb: [],
                MethodOnDb: 'Create Product Group',
                TotalCountOnDb: 0
            } as ResponseI)
        }
    },
}
