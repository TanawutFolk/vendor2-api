import { RegisterRequestModel } from '@src/_workspace/models/_find-vendor/RegisterRequestModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import path from 'path'
import getSqlWhere_aggrid from '@src/helpers/getSqlWhere_aggrid'

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

            const insertedId = await RegisterRequestModel.createRequest({
                vendor_id,
                vendor_contact_id: dataItem.vendor_contact_id || null,
                Request_By_EmployeeCode: dataItem.Request_By_EmployeeCode || '',
                supportProduct_Process: dataItem.support_type || '',
                purchase_frequency: dataItem.purchase_frequency || '',
                requester_remark: dataItem.requester_remark || '',
                CREATE_BY: dataItem.CREATE_BY || 'ถ้าเห็นข้อความนี้แจ้งS524',
                // assign_to is resolved by the service via round-robin logic (do NOT set here)
            })

            // Insert each uploaded file into the request_register_document table
            if (files.length > 0) {
                for (const file of files) {
                    await RegisterRequestModel.createDocument({
                        request_id: insertedId,
                        file_name: file.originalname || path.basename(file.path),
                        file_path: file.filename || path.basename(file.path),
                        file_size: file.size || 0,
                        file_type: file.mimetype || '',
                        CREATE_BY: dataItem.CREATE_BY || 'ถ้าเห็นข้อความนี้แจ้งS524'
                    })
                }
            }

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
            // Table mapping for AG Grid ColumnFilters and SearchFilters
            const tableIds = [
                { table: 'rr', id: 'request_id', Fns: '=' },
                { table: 'rr', id: 'request_status', Fns: '=' },
                { table: 'rr', id: 'supportProduct_Process', Fns: 'LIKE' },
                { table: 'rr', id: 'purchase_frequency', Fns: 'LIKE' },
                { table: 'rr', id: 'assign_to', Fns: '=' },
                { table: 'rr', id: 'PIC_Email', Fns: 'LIKE' },
                { table: 'rr', id: 'Request_By_EmployeeCode', Fns: '=' },
                // Vendor Info
                { table: 'v', id: 'company_name', Fns: 'LIKE' },
                { table: 'v', id: 'fft_vendor_code', Fns: 'LIKE' },
                { table: 'v', id: 'fft_status', Fns: '=' },
                { table: 'v', id: 'vendor_region', Fns: '=' },
                { table: 'v', id: 'province', Fns: 'LIKE' },
                { table: 'vt', id: 'vendor_type_name', alias: 'name', Fns: 'LIKE' }
            ]

            // Filter out null/empty values from SearchFilters before passing to helper
            if (dataItem.SearchFilters && Array.isArray(dataItem.SearchFilters)) {
                dataItem.SearchFilters = dataItem.SearchFilters.filter((item: any) =>
                    item.value !== null && item.value !== undefined && item.value !== ''
                )
            }

            // Create SQL WHERE, ORDER BY, and Offset using AG Grid-compatible helper
            getSqlWhere_aggrid(dataItem, tableIds, 'rr.request_id')

            // Default Limit if not provided by frontend
            dataItem.Limit = dataItem.Limit || 50

            // Extract sqlWhere from dataItem
            let sqlWhere = ''
            if (dataItem.sqlWhere) {
                sqlWhere = dataItem.sqlWhere.trim()
                sqlWhere = sqlWhere.replace(/^WHERE\s+/i, '')
            }

            // Manually add root-level filters (frontend passes these directly instead of via SearchFilters)
            const manualFilters: string[] = []
            if (dataItem.assign_to) {
                manualFilters.push(`rr.assign_to = '${dataItem.assign_to}'`)
            }
            if (dataItem.Request_By_EmployeeCode) {
                manualFilters.push(`rr.Request_By_EmployeeCode = '${dataItem.Request_By_EmployeeCode}'`)
            }
            if (dataItem.request_status) {
                manualFilters.push(`rr.request_status = '${dataItem.request_status}'`)
            }

            // Combine AG Grid filters and manual root filters
            if (manualFilters.length > 0) {
                const combinedManual = manualFilters.join(' AND ')
                if (sqlWhere) {
                    sqlWhere = `${sqlWhere} AND ${combinedManual}`
                } else {
                    sqlWhere = combinedManual
                }
            }

            if (sqlWhere) {
                sqlWhere = ` AND ${sqlWhere}`
            }

            dataItem['sqlWhereColumnFilter'] = ''

            const { data, totalCount } = await RegisterRequestModel.getAllRequests(dataItem, sqlWhere)
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

