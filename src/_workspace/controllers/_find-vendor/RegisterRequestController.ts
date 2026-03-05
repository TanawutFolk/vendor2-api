import { RegisterRequestModel } from '@src/_workspace/models/_find-vendor/RegisterRequestModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import path from 'path'

export const RegisterRequestController = {

    // Create a new vendor registration request
    create: async (req: Request, res: Response) => {
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
                    MethodOnDb: 'Create Registration Request',
                    Message: 'Invalid vendor_id'
                } as ResponseI)
            }

            // req.files is populated by multer upload.array() middleware in the route
            const files = (req.files as any[]) || []
            let filePath: string | null = null
            if (files.length > 0) {
                filePath = files.map((f: any) => path.basename(f.path)).join(',')
            }

            const insertedId = await RegisterRequestModel.createRequest({
                vendor_id,
                Request_By_EmployeeCode: dataItem.Request_By_EmployeeCode || '',
                supportProduct_Process: dataItem.support_type || '',
                purchase_frequency: dataItem.purchase_frequency || '',
                File_Path: filePath || '',
                requester_remark: dataItem.requester_remark || '',
                CREATE_BY: dataItem.CREATE_BY || 'ถ้าเห็นข้อความนี้แจ้งS524',
                // assign_to is resolved by the service via round-robin logic (do NOT set here)
            })

            return res.status(200).json({
                Status: true,
                ResultOnDb: { request_id: insertedId },
                TotalCountOnDb: 1,
                MethodOnDb: 'Create Registration Request',
                Message: 'Create Data Success'
            } as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Create Registration Request Failed',
                Message: error?.message || 'Failed to create registration request'
            } as ResponseI)
        }
    },

    // Get all registration requests
    getAll: async (req: Request, res: Response) => {
        let dataItem
        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const { data, totalCount } = await RegisterRequestModel.getAllRequests(dataItem)
            return res.status(200).json({
                Status: true,
                ResultOnDb: data,
                TotalCountOnDb: totalCount,
                MethodOnDb: 'Get All Registration Requests',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get All Registration Requests Failed',
                Message: error?.message || 'Failed to get registration requests'
            } as ResponseI)
        }
    },

    // Get a single registration request
    getById: async (req: Request, res: Response) => {
        let dataItem
        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const request_id = parseInt(dataItem.request_id as string)

            if (!request_id || isNaN(request_id)) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Get Registration Request',
                    Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.getById({ request_id })
            return res.status(200).json({
                Status: true,
                ResultOnDb: result || {},
                TotalCountOnDb: result ? 1 : 0,
                MethodOnDb: 'Get Registration Request',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Registration Request Failed',
                Message: error?.message || 'Failed to get registration request'
            } as ResponseI)
        }
    },

    // Update request status (approve/reject)
    updateStatus: async (req: Request, res: Response) => {
        let dataItem
        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const request_id = parseInt(dataItem.request_id as string)

            if (!request_id || isNaN(request_id)) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Update Request Status',
                    Message: 'Invalid request_id'
                } as ResponseI)
            }

            await RegisterRequestModel.updateStatus({
                request_id,
                request_status: dataItem.request_status || '',
                approve_by: dataItem.approve_by || '',
                approve_date: dataItem.request_status === 'Approved' ? new Date() : null,
                approver_remark: dataItem.approver_remark || '',
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })

            return res.status(200).json({
                Status: true,
                ResultOnDb: {},
                TotalCountOnDb: 1,
                MethodOnDb: 'Update Request Status',
                Message: 'Update Data Success'
            } as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Update Request Status Failed',
                Message: error?.message || 'Failed to update status'
            } as ResponseI)
        }
    },

    // Send agreement/document-request email to the Vendor
    sendAgreementEmail: async (req: Request, res: Response) => {
        let dataItem
        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            if (!dataItem.emailmain) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Send Agreement Email',
                    Message: 'Vendor emailmain is required'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.sendAgreementEmail(dataItem)

            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: 1,
                MethodOnDb: 'Send Agreement Email',
                Message: `Agreement email sent to ${result.sent_to}`
            } as ResponseI)
        } catch (error: any) {
            return res.status(500).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Send Agreement Email Failed',
                Message: error?.message || 'Failed to send agreement email'
            } as ResponseI)
        }
    }
}

