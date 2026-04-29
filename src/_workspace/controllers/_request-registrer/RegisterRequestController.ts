import { RegisterRequestModel } from '@src/_workspace/models/_request-registrer/RegisterRequestModel'
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

            const createResult = await RegisterRequestModel.createRequest({
                vendor_id,
                vendor_contact_id: dataItem.vendor_contact_id || null,
                Request_By_EmployeeCode: dataItem.Request_By_EmployeeCode || '',
                supportProduct_Process: dataItem.support_type || '',
                purchase_frequency: dataItem.purchase_frequency || '',
                cc_emails: dataItem.cc_emails || '[]',
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

            const insertedId = Number(createResult?.ResultOnDb?.insertedId || 0)

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
                    await RegisterRequestModel.createDocument({
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
            const actorFilters: string[] = []
            if (dataItem.approver_id) {
                const queueStepCode = String(dataItem.queue_step_code || '').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '')

                const queueStepCondition = (() => {
                    if (!queueStepCode) return ''
                    if (queueStepCode === 'DOC_CHECK') {
                        return `(UPPER(IFNULL(ras.step_code, '')) = 'DOC_CHECK' OR LOWER(IFNULL(ras.description, '')) LIKE '%checker%' OR LOWER(IFNULL(ras.description, '')) LIKE '%check all document%')`
                    }
                    if (queueStepCode === 'ACCOUNT_REGISTERED') {
                        return `(UPPER(IFNULL(ras.step_code, '')) = 'ACCOUNT_REGISTERED' OR LOWER(IFNULL(ras.description, '')) LIKE '%account%')`
                    }
                    if (queueStepCode === 'ISSUE_GPR_C') {
                        return `(UPPER(IFNULL(ras.step_code, '')) = 'ISSUE_GPR_C' OR LOWER(IFNULL(ras.description, '')) LIKE '%issue gpr c%')`
                    }
                    return `UPPER(IFNULL(ras.step_code, '')) = '${queueStepCode}'`
                })()

                // Approval pages (MD / PO GM / PO Mgr / Check Document):
                // Show requests where this approver has an in_progress OR already-actioned (approved/rejected) step.
                // Items stay visible after being actioned so the approver can track their work history.
                // The Approve/Reject buttons are hidden on the frontend when step_status is not 'in_progress'.
                if (queueStepCondition) {
                    // Queue view: keep actionable + action history for this queue step.
                    actorFilters.push(`EXISTS (SELECT 1 FROM request_approval_step ras WHERE ras.request_id = rr.request_id AND ras.approver_id = '${dataItem.approver_id}' AND ras.step_status IN ('in_progress', 'approved', 'rejected') AND ${queueStepCondition} AND ras.INUSE = 1)`)
                } else {
                    // Fallback (legacy): include in-progress and action history for this approver.
                    actorFilters.push(`EXISTS (SELECT 1 FROM request_approval_step ras WHERE ras.request_id = rr.request_id AND ras.approver_id = '${dataItem.approver_id}' AND ras.step_status IN ('in_progress', 'approved', 'rejected') AND ras.INUSE = 1)`)
                }
            }
            if (dataItem.assign_to) {
                // PIC dashboard: show requests assigned to PIC only.
                // Excludes approver step records so PIC doesn't see MD/GM/Mgr queues.
                actorFilters.push(`rr.assign_to = '${dataItem.assign_to}'`)
            }
            if (actorFilters.length > 0) {
                manualFilters.push(`(${actorFilters.join(' OR ')})`)
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

            dataItem.sqlWhere = sqlWhere
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
            console.error('Get All Registration Requests Error:', error);
            return res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get All Registration Requests',
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
            res.status(200).json({
                Status: true,
                ResultOnDb: result || {},
                TotalCountOnDb: result ? 1 : 0,
                MethodOnDb: 'Get Registration Request',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Get Registration Request Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Registration Request',
                Message: error?.message || 'Failed to get registration request'
            } as ResponseI)
        }
    },

    // Update request details (PIC แก้ไขข้อมูลคำขอ)
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

            const result = await RegisterRequestModel.updateRequest({
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

            // approve_date: set to 'NOW()' (DB CURRENT_TIMESTAMP) when Rejected, or when it's the final step
            const isFinalStep = dataItem.isFinalStep === true || dataItem.isFinalStep === 'true'
            const isFinalStepOrRejected = dataItem.request_status === 'Rejected' || isFinalStep
            const result = await RegisterRequestModel.updateStatus({
                request_id,
                request_status: dataItem.request_status || '',
                workflow_action: dataItem.workflow_action || '',
                action_type: dataItem.action_type || '',
                negotiation_action: dataItem.negotiation_action || '',
                approve_by: dataItem.approve_by || '',
                approve_date: isFinalStepOrRejected ? 'NOW()' : null,
                approver_remark: dataItem.approver_remark || '',
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
                isFinalStep,
            })

            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Update Status Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Update Request Status',
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
            if (!dataItem.emailmain && !dataItem.request_id) {
                return res.status(400).json({
                    Status: false,
                    ResultOnDb: {},
                    TotalCountOnDb: 0,
                    MethodOnDb: 'Send Agreement Email',
                    Message: 'Vendor emailmain or request_id is required'
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

    // Get all active status options from m_request_status
    getStatusOptions: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        try {
            const result = await RegisterRequestModel.getStatusOptions()
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Status Options',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Get Status Options Error:', error);
            res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Get Status Options',
                Message: error?.message || 'Failed to get status options'
            } as ResponseI)
        }
    },

    // Get approval steps for a request
    getApprovalSteps: async (req: Request, res: Response) => {
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
                    Status: false, ResultOnDb: [], TotalCountOnDb: 0,
                    MethodOnDb: 'Get Approval Steps', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.getApprovalSteps({ request_id })
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Approval Steps',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Get Approval Steps Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: [], TotalCountOnDb: 0,
                MethodOnDb: 'Get Approval Steps',
                Message: error?.message || 'Failed to get approval steps'
            } as ResponseI)
        }
    },

    // Get approval logs for a request
    getApprovalLogs: async (req: Request, res: Response) => {
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
                    Status: false, ResultOnDb: [], TotalCountOnDb: 0,
                    MethodOnDb: 'Get Approval Logs', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.getApprovalLogs({ request_id })
            res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Get Approval Logs',
                Message: 'Get Data Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Get Approval Logs Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: [], TotalCountOnDb: 0,
                MethodOnDb: 'Get Approval Logs',
                Message: error?.message || 'Failed to get approval logs'
            } as ResponseI)
        }
    },

    // Create an approval step
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

            const insertedId = await RegisterRequestModel.createApprovalStep({
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

    // Update an approval step and log the action
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

            await RegisterRequestModel.updateApprovalStep({
                step_id,
                step_status: dataItem.step_status || '',
                UPDATE_BY: dataItem.UPDATE_BY || '',
            })

            // Create approval log
            if (dataItem.request_id) {
                await RegisterRequestModel.createApprovalLog({
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

    // Update CC emails list for a request
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
            await RegisterRequestModel.updateCcEmails({
                request_id,
                cc_emails: dataItem.cc_emails || [],
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

    reassign: async (req: Request, res: Response) => {
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
                    MethodOnDb: 'Reassign Request', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.reassignAssignment({
                request_id,
                scope: dataItem.scope || '',
                to_empcode: dataItem.to_empcode || '',
                reason: dataItem.reason || '',
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })

            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Reassign Request Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Reassign Request',
                Message: error?.message || 'Failed to reassign request'
            } as ResponseI)
        }
    },

    // Save GPR form (Supplier / Outsourcing Selection Sheet)
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
            const result = await RegisterRequestModel.saveGprForm({
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

    // Save requester-only GPR C notification setup
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

            const result = await RegisterRequestModel.saveGprCNotification({
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

            const result = await RegisterRequestModel.gprCGetFlow({ request_id })
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

            const result = await RegisterRequestModel.gprCSubmitSetup({
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

    gprCApproveStep: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const request_id = parseInt(dataItem.request_id as string)
            if (!request_id || isNaN(request_id)) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Approve GPR C Step', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.gprCApproveStep({
                request_id,
                action_by: dataItem.action_by || dataItem.UPDATE_BY || '',
                remark: dataItem.remark || dataItem.action_remark || '',
                UPDATE_BY: dataItem.UPDATE_BY || dataItem.action_by || 'SYSTEM',
            })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Approve GPR C Step Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Approve GPR C Step', Message: error?.message || 'Failed to approve GPR C step'
            } as ResponseI)
        }
    },

    gprCRejectStep: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const request_id = parseInt(dataItem.request_id as string)
            if (!request_id || isNaN(request_id)) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Reject GPR C Step', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.gprCRejectStep({
                request_id,
                action_by: dataItem.action_by || dataItem.UPDATE_BY || '',
                remark: dataItem.remark || dataItem.action_remark || '',
                UPDATE_BY: dataItem.UPDATE_BY || dataItem.action_by || 'SYSTEM',
            })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Reject GPR C Step Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Reject GPR C Step', Message: error?.message || 'Failed to reject GPR C step'
            } as ResponseI)
        }
    },

    gprCActionRequired: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const request_id = parseInt(dataItem.request_id as string)
            if (!request_id || isNaN(request_id)) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'GPR C Action Required', Message: 'Invalid request_id'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.gprCActionRequired({
                request_id,
                action_by: dataItem.action_by || dataItem.UPDATE_BY || '',
                pic_name: dataItem.pic_name || '',
                pic_email: dataItem.pic_email || '',
                required_detail: dataItem.required_detail || dataItem.remark || '',
                UPDATE_BY: dataItem.UPDATE_BY || dataItem.action_by || 'SYSTEM',
            })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('GPR C Action Required Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'GPR C Action Required', Message: error?.message || 'Failed to send GPR C Action Required'
            } as ResponseI)
        }
    },

    gprCRecordActionResult: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const action_required_id = parseInt(dataItem.action_required_id as string)
            if (!action_required_id || isNaN(action_required_id)) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Record GPR C Action Result', Message: 'Invalid action_required_id'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.gprCRecordActionResult({
                action_required_id,
                result_status: dataItem.result_status || 'COMPLETED',
                result_remark: dataItem.result_remark || '',
                result_by: dataItem.result_by || dataItem.UPDATE_BY || '',
                UPDATE_BY: dataItem.UPDATE_BY || dataItem.result_by || 'SYSTEM',
            })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Record GPR C Action Result Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Record GPR C Action Result', Message: error?.message || 'Failed to record GPR C Action Result'
            } as ResponseI)
        }
    },

    gprCQueue: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const approver_empcode = String(dataItem.approver_empcode || dataItem.approver_id || '').trim()
            if (!approver_empcode) {
                return res.status(400).json({
                    Status: false, ResultOnDb: [], TotalCountOnDb: 0,
                    MethodOnDb: 'Get GPR C Queue', Message: 'Missing approver_empcode'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.gprCQueue({ approver_empcode })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Get GPR C Queue Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: [], TotalCountOnDb: 0,
                MethodOnDb: 'Get GPR C Queue', Message: error?.message || 'Failed to get GPR C queue'
            } as ResponseI)
        }
    },

    gprCActionRequiredQueue: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const pic_email = String(dataItem.pic_email || '').trim()
            if (!pic_email) {
                return res.status(400).json({
                    Status: false, ResultOnDb: [], TotalCountOnDb: 0,
                    MethodOnDb: 'Get GPR C Action Required Queue', Message: 'Missing pic_email'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.gprCActionRequiredQueue({ pic_email })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Get GPR C Action Required Queue Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: [], TotalCountOnDb: 0,
                MethodOnDb: 'Get GPR C Action Required Queue', Message: error?.message || 'Failed to get GPR C Action Required queue'
            } as ResponseI)
        }
    },

    resolveEmployeeProfile: async (req: Request, res: Response) => {
        const dataItem = (!req.body || Object.entries(req.body).length === 0) ? req.query : req.body

        try {
            const empcode = String(dataItem.empcode || '').trim()

            if (!empcode) {
                return res.status(400).json({
                    Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                    MethodOnDb: 'Resolve Employee Profile', Message: 'Missing empcode'
                } as ResponseI)
            }

            const result = await RegisterRequestModel.resolveEmployeeProfile({ empcode })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Resolve Employee Profile Error:', error)
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Resolve Employee Profile', Message: error?.message || 'Failed to resolve employee profile'
            } as ResponseI)
        }
    },

    // Get GPR form data (Supplier / Outsourcing Selection Sheet)
    getGprForm: async (req: Request, res: Response) => {
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
                    MethodOnDb: 'Get GPR Form', Message: 'Invalid request_id'
                } as ResponseI)
            }
            const result = await RegisterRequestModel.getGprForm(request_id)
            res.status(200).json({
                Status: true, ResultOnDb: result || [], TotalCountOnDb: result ? 1 : 0,
                MethodOnDb: 'Get GPR Form', Message: 'Success'
            } as ResponseI)
        } catch (error: any) {
            console.error('Get GPR Form Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Get GPR Form', Message: error?.message || 'Failed to get GPR form'
            } as ResponseI)
        }
    },

    // Attach a single document file to an existing request (e.g. GPR criteria PDF, generated Form A PDF)
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
            const createDocumentResult = await RegisterRequestModel.createDocument({
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

            const document_id = Number(createDocumentResult?.ResultOnDb?.document_id || 0)

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
    },

    // Account PIC: complete vendor registration (fill vendor code + trigger final email)
    completeRegistration: async (req: Request, res: Response) => {
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
                    MethodOnDb: 'Complete Registration', Message: 'Invalid request_id'
                } as ResponseI)
            }
            const result = await RegisterRequestModel.completeRegistration({
                request_id,
                vendor_code: dataItem.vendor_code || '',
                UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
            })
            res.status(200).json(result as ResponseI)
        } catch (error: any) {
            console.error('Complete Registration Error:', error);
            res.status(200).json({
                Status: false, ResultOnDb: {}, TotalCountOnDb: 0,
                MethodOnDb: 'Complete Registration', Message: error?.message || 'Failed to complete registration'
            } as ResponseI)
        }
    }
}

