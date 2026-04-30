import { RequestRegisterPageModel } from '@src/_workspace/models/_request-register/RequestRegisterPageModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import path from 'path'

export const RequestRegisterPageController = {
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

            const createResult = await RequestRegisterPageModel.createRequest({
                vendor_id,
                vendor_contact_id: dataItem.vendor_contact_id || null,
                Request_By_EmployeeCode: dataItem.Request_By_EmployeeCode || '',
                supportProduct_Process: dataItem.support_type || '',
                purchase_frequency: dataItem.purchase_frequency || '',
                requester_remark: dataItem.requester_remark || '',
                CREATE_BY: dataItem.CREATE_BY || 'ถ้าเห็นข้อความนี้แจ้งS524ด่วนๆ',
                // assign_to is resolved by the service via round-robin logic (do NOT set here)
            })

            if (!createResult?.Status) {
                return res.status(200).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Create Registration Request',
                    Message: createResult?.Message || 'Failed to create registration request'
                } as ResponseI)
            }

            const insertedId = Number((createResult?.ResultOnDb as any)?.insertedId || 0)

            if (!insertedId || Number.isNaN(insertedId)) {
                return res.status(200).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Create Registration Request',
                    Message: 'Create request succeeded but request_id was not returned correctly'
                } as ResponseI)
            }

            // Insert each uploaded file into the request_register_document table
            if (files.length > 0) {
                for (const file of files) {
                    // Multer reads originalname as latin1 bytes — decode back to utf8
                    // so Thai/Japanese/etc. filenames are stored correctly in the DB.
                    const file_name = Buffer.from(file.originalname, 'latin1').toString('utf8')
                    await RequestRegisterPageModel.createDocument({
                        request_id: insertedId,
                        file_name: file_name || path.basename(file.path),
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
                Message: 'Create Request Register Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Create Registration Request Error:', error);
            return res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Create Registration Request',
                Message: error?.message || 'Failed to create registration request'
            } as ResponseI)
        }
    },

    updateRequest: async (req: Request, res: Response) => {
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
                    MethodOnDb: 'Update Request',
                    Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RequestRegisterPageModel.updateRequest({
                request_id,
                vendor_contact_id: dataItem.vendor_contact_id || null,
                supportProduct_Process: dataItem.supportProduct_Process || '',
                purchase_frequency: dataItem.purchase_frequency || '',
                requester_remark: dataItem.requester_remark || '',
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })

            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Update Request Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Update Request',
                Message: error?.message || 'Failed to update request'
            } as ResponseI)
        }
    },

    sendAgreementEmail: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            if (!dataItem.emailmain && !dataItem.request_id) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Send Agreement Email',
                    Message: 'Vendor emailmain or request_id is required'
                } as ResponseI)
            }

            const result = await RequestRegisterPageModel.sendAgreementEmail(dataItem)

            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: 1,
                MethodOnDb: 'Send Agreement Email',
                Message: `Agreement email sent to ${result.sent_to}`
            } as ResponseI)
        } catch (error: any) {
            console.error('Send Agreement Email Error:', error);
            return res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Send Agreement Email',
                Message: error?.message || 'Failed to send agreement email'
            } as ResponseI)
        }
    },

    createApprovalStep: async (req: Request, res: Response) => {
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
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Create Approval Step', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const insertedId = await RequestRegisterPageModel.createApprovalStep({
                request_id,
                step_order: dataItem.step_order || 1,
                approver_id: dataItem.approver_id || '',
                step_status: dataItem.step_status || 'pending',
                DESCRIPTION: dataItem.DESCRIPTION || '',
                step_code: dataItem.step_code || '',
                actor_type: dataItem.actor_type || '',
                group_code: dataItem.group_code || '',
                assignment_mode: dataItem.assignment_mode || 'AUTO',
                CREATE_BY: dataItem.CREATE_BY || '',
            })

            res.status(200).json({
                Status: true,
                ResultOnDb: { step_id: insertedId },
                TotalCountOnDb: 1,
                MethodOnDb: 'Create Approval Step',
                Message: 'Create Data Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Create Approval Step Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Create Approval Step',
                Message: error?.message || 'Failed to create approval step'
            } as ResponseI)
        }
    },

    updateApprovalStep: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const step_id = parseInt(dataItem.step_id as string)
            if (!step_id || isNaN(step_id)) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Update Approval Step', Message: 'Invalid step_id'
                } as ResponseI)
            }

            await RequestRegisterPageModel.updateApprovalStep({
                step_id,
                step_status: dataItem.step_status || '',
                UPDATE_BY: dataItem.UPDATE_BY || '',
            })

            // Create approval log
            if (dataItem.request_id) {
                await RequestRegisterPageModel.createApprovalLog({
                    request_id: parseInt(dataItem.request_id as string),
                    step_id,
                    action_by: dataItem.action_by || dataItem.UPDATE_BY || '',
                    action_type: dataItem.action_type || dataItem.step_status || '',
                    remark: dataItem.remark || '',
                })
            }

            res.status(200).json({
                Status: true,
                ResultOnDb: {},
                TotalCountOnDb: 1,
                MethodOnDb: 'Update Approval Step',
                Message: 'Update Data Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Update Approval Step Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Update Approval Step',
                Message: error?.message || 'Failed to update approval step'
            } as ResponseI)
        }
    },

    updateCcEmails: async (req: Request, res: Response) => {
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
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Update CC Emails', Message: 'Invalid request_id'
                } as ResponseI)
            }
            await RequestRegisterPageModel.updateCcEmails({
                request_id,
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })
            res.status(200).json({
                Status: true, ResultOnDb: {}, TotalCountOnDb: 1,
                MethodOnDb: 'Update CC Emails', Message: 'CC emails updated successfully'
            } as ResponseI)
        } catch (error: any) {
            console.error('Update CC Emails Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Update CC Emails', Message: error?.message || 'Failed to update CC emails'
            } as ResponseI)
        }
    },

    saveGprForm: async (req: Request, res: Response) => {
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
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Save GPR Form', Message: 'Invalid request_id'
                } as ResponseI)
            }
            const result = await RequestRegisterPageModel.saveGprForm({
                request_id,
                gpr_data: dataItem.gpr_data || {},
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Save GPR Form Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Save GPR Form', Message: error?.message || 'Failed to save GPR form'
            } as ResponseI)
        }
    },

    saveGprCNotification: async (req: Request, res: Response) => {
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
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Save GPR C Notification', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RequestRegisterPageModel.saveGprCNotification({
                request_id,
                gpr_c_data: dataItem.gpr_c_data || {},
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })

            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Save GPR C Notification Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Save GPR C Notification', Message: error?.message || 'Failed to save GPR C notification'
            } as ResponseI)
        }
    },

    gprCGetFlow: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const request_id = parseInt(dataItem.request_id as string)
            if (!request_id || isNaN(request_id)) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Get GPR C Flow', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RequestRegisterPageModel.gprCGetFlow({ request_id })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Get GPR C Flow Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Get GPR C Flow', Message: error?.message || 'Failed to get GPR C flow'
            } as ResponseI)
        }
    },

    gprCSubmitSetup: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const request_id = parseInt(dataItem.request_id as string)
            if (!request_id || isNaN(request_id)) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Submit GPR C Setup', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RequestRegisterPageModel.gprCSubmitSetup({
                request_id,
                gpr_c_data: dataItem.gpr_c_data || {},
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Submit GPR C Setup Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Submit GPR C Setup', Message: error?.message || 'Failed to submit GPR C setup'
            } as ResponseI)
        }
    },

    addDocument: async (req: Request, res: Response) => {
        const file = req.file
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        const { request_id, CREATE_BY } = dataItem

        try {
            const reqId = parseInt(request_id as string)
            if (!reqId || isNaN(reqId)) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Add Document', Message: 'Invalid request_id'
                } as ResponseI)
            }
            if (!file) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Add Document', Message: 'No file uploaded'
                } as ResponseI)
            }
            const file_name = Buffer.from(file.originalname, 'latin1').toString('utf8')
            const createDocumentResult = await RequestRegisterPageModel.createDocument({
                request_id: reqId,
                file_name: file_name || path.basename(file.path),
                file_path: file.filename || path.basename(file.path),
                file_size: file.size || 0,
                file_type: file.mimetype || '',
                CREATE_BY: CREATE_BY || 'SYSTEM',
            })

            if (!createDocumentResult?.Status) {
                return res.status(200).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Add Document', Message: createDocumentResult?.Message || 'Failed to add document'
                } as ResponseI)
            }

            const document_id = Number((createDocumentResult?.ResultOnDb as any)?.document_id || 0)

            if (!document_id || Number.isNaN(document_id)) {
                return res.status(200).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Add Document', Message: 'Document was created but document_id was not returned correctly'
                } as ResponseI)
            }

            res.status(200).json({
                Status: true,
                ResultOnDb: {
                    document_id,
                    file_path: file.filename || path.basename(file.path),
                    file_name: file_name || path.basename(file.path),
                },
                TotalCountOnDb: 1,
                MethodOnDb: 'Add Document',
                Message: 'Document added successfully'
            } as ResponseI)
        } catch (error: any) {
            console.error('Add Document Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Add Document', Message: error?.message || 'Failed to add document'
            } as ResponseI)
        }
    }
}
