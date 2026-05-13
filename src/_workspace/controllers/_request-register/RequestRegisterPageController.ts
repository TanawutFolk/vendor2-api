import { RequestRegisterPageModel } from '@src/_workspace/models/_request-register/RequestRegisterPageModel'
import { SelectionFileService } from '@src/_workspace/services/_request-register/SelectionFileService'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import path from 'path'

const parseVendorContactIds = (dataItem: any): string[] => {
  const rawValue = dataItem.VENDOR_CONTACT_IDS || dataItem['VENDOR_CONTACT_IDS[]'] || dataItem.VENDOR_CONTACT_ID || []
  const rawList = Array.isArray(rawValue) ? rawValue : [rawValue]

  return rawList
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter((value) => value && Number(value) > 0)
}

export const RequestRegisterPageController = {
  create: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      const vendor_id = parseInt(dataItem.VENDOR_ID as string)
      const normalizedCreator = dataItem.CREATE_BY || dataItem.REQUEST_BY_EMPLOYEECODE || 'SYSTEM'

      if (!vendor_id || isNaN(vendor_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Registration Request',
          Message: 'Invalid vendor_id',
        } as ResponseI)
      }

      // req.files is populated by multer upload.array() middleware in the route
      const files = (req.files as any[]) || []
      const vendorContactIds = parseVendorContactIds(dataItem)

      const createResult = await RequestRegisterPageModel.createRequest({
        VENDOR_ID: vendor_id,
        VENDOR_CONTACT_ID: vendorContactIds[0] || dataItem.VENDOR_CONTACT_ID || null,
        VENDOR_CONTACT_IDS: vendorContactIds,
        REQUEST_BY_EMPLOYEECODE: dataItem.REQUEST_BY_EMPLOYEECODE || '',
        SUPPORTPRODUCT_PROCESS: dataItem.SUPPORTPRODUCT_PROCESS || dataItem.SUPPORT_TYPE || '',
        PURCHASE_FREQUENCY: dataItem.PURCHASE_FREQUENCY || '',
        REQUESTER_REMARK: dataItem.REQUESTER_REMARK || '',
        REQUEST_TYPE: dataItem.REQUEST_TYPE || '',
        REQUEST_NUMBER_PREFIX: dataItem.REQUEST_NUMBER_PREFIX || '',
        PIC_EMAIL: dataItem.PIC_EMAIL || '',
        CREATE_BY: normalizedCreator,
        // assign_to is resolved by the service via round-robin logic (do NOT set here)
      })

      if (!createResult?.Status) {
        return res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Registration Request',
          Message: createResult?.Message || 'Failed to create registration request',
        } as ResponseI)
      }

      const createResultData = (createResult?.ResultOnDb as any) || {}
      const insertedId = Number(createResultData?.insertedId || 0)

      if (!insertedId || Number.isNaN(insertedId)) {
        return res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Registration Request',
          Message: 'Create request succeeded but request_id was not returned correctly',
        } as ResponseI)
      }

      // Insert each uploaded file into the request_register_document table
      if (files.length > 0) {
        for (const file of files) {
          // Multer reads originalname as latin1 bytes Ã¢â‚¬â€ decode back to utf8
          // so Thai/Japanese/etc. filenames are stored correctly in the DB.
          const file_name = Buffer.from(file.originalname, 'latin1').toString('utf8')
          await RequestRegisterPageModel.createDocument({
            REQUEST_ID: insertedId,
            FILE_NAME: file_name || path.basename(file.path),
            FILE_PATH: file.filename || path.basename(file.path),
            FILE_SIZE: file.size || 0,
            FILE_TYPE: file.mimetype || '',
            CREATE_BY: normalizedCreator,
          })
        }
      }
      return res.status(200).json({
        Status: true,
        ResultOnDb: { request_id: insertedId, request_number: createResultData?.request_number || '' },
        TotalCountOnDb: 1,
        MethodOnDb: 'Create Registration Request',
        Message: createResult?.Message || 'Create Request Register Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Create Registration Request Error:', error)
      return res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Registration Request',
        Message: error?.message || 'Failed to create registration request',
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
      const request_id = parseInt(dataItem.REQUEST_ID as string)

      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Update Request',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await RequestRegisterPageModel.updateRequest({
        REQUEST_ID: request_id,
        VENDOR_CONTACT_ID: dataItem.VENDOR_CONTACT_ID || null,
        SUPPORTPRODUCT_PROCESS: dataItem.SUPPORTPRODUCT_PROCESS || '',
        PURCHASE_FREQUENCY: dataItem.PURCHASE_FREQUENCY || '',
        REQUESTER_REMARK: dataItem.REQUESTER_REMARK || '',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })

      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Update Request Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Request',
        Message: error?.message || 'Failed to update request',
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
      if (!dataItem.EMAILMAIN && !dataItem.REQUEST_ID) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Send Agreement Email',
          Message: 'Vendor emailmain or request_id is required',
        } as ResponseI)
      }

      const result = await RequestRegisterPageModel.sendAgreementEmail(dataItem)

      return res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: 1,
        MethodOnDb: 'Send Agreement Email',
        Message: `Agreement email sent to ${result.sent_to}`,
      } as ResponseI)
    } catch (error: any) {
      console.error('Send Agreement Email Error:', error)
      return res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Send Agreement Email',
        Message: error?.message || 'Failed to send agreement email',
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
      const request_id = parseInt(dataItem.REQUEST_ID as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Approval Step',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const insertedId = await RequestRegisterPageModel.createApprovalStep({
        REQUEST_ID: request_id,
        STEP_ORDER: dataItem.STEP_ORDER || 1,
        APPROVER_ID: dataItem.APPROVER_ID || '',
        STEP_STATUS: dataItem.STEP_STATUS || 'pending',
        DESCRIPTION: dataItem.DESCRIPTION || '',
        STEP_CODE: dataItem.STEP_CODE || '',
        ACTOR_TYPE: dataItem.ACTOR_TYPE || '',
        GROUP_CODE: dataItem.GROUP_CODE || '',
        ASSIGNMENT_MODE: dataItem.ASSIGNMENT_MODE || 'AUTO',
        CREATE_BY: dataItem.CREATE_BY || '',
      })

      res.status(200).json({
        Status: true,
        ResultOnDb: { step_id: insertedId },
        TotalCountOnDb: 1,
        MethodOnDb: 'Create Approval Step',
        Message: 'Create Data Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Create Approval Step Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Approval Step',
        Message: error?.message || 'Failed to create approval step',
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
      const step_id = parseInt(dataItem.STEP_ID as string)
      if (!step_id || isNaN(step_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Update Approval Step',
          Message: 'Invalid step_id',
        } as ResponseI)
      }

      await RequestRegisterPageModel.updateApprovalStep({
        STEP_ID: step_id,
        STEP_STATUS: dataItem.STEP_STATUS || '',
        UPDATE_BY: dataItem.UPDATE_BY || '',
      })

      // Create approval log
      if (dataItem.REQUEST_ID) {
        await RequestRegisterPageModel.createApprovalLog({
          REQUEST_ID: parseInt(dataItem.REQUEST_ID as string),
          STEP_ID: step_id,
          ACTION_BY: dataItem.ACTION_BY || dataItem.UPDATE_BY || '',
          ACTION_TYPE: dataItem.ACTION_TYPE || dataItem.STEP_STATUS || '',
          REMARK: dataItem.REMARK || '',
        })
      }

      res.status(200).json({
        Status: true,
        ResultOnDb: {},
        TotalCountOnDb: 1,
        MethodOnDb: 'Update Approval Step',
        Message: 'Update Data Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Update Approval Step Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Approval Step',
        Message: error?.message || 'Failed to update approval step',
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
      const request_id = parseInt(dataItem.REQUEST_ID as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Update CC Emails',
          Message: 'Invalid request_id',
        } as ResponseI)
      }
      await RequestRegisterPageModel.updateCcEmails({
        REQUEST_ID: request_id,
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
      res.status(200).json({
        Status: true,
        ResultOnDb: {},
        TotalCountOnDb: 1,
        MethodOnDb: 'Update CC Emails',
        Message: 'CC emails updated successfully',
      } as ResponseI)
    } catch (error: any) {
      console.error('Update CC Emails Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Update CC Emails',
        Message: error?.message || 'Failed to update CC emails',
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
      const request_id = parseInt(dataItem.REQUEST_ID as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Save GPR Form',
          Message: 'Invalid request_id',
        } as ResponseI)
      }
      const result = await RequestRegisterPageModel.saveGprForm({
        REQUEST_ID: request_id,
        GPR_DATA: dataItem.GPR_DATA || {},
        CREATE_BY: dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Save GPR Form Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Save GPR Form',
        Message: error?.message || 'Failed to save GPR form',
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
      const request_id = parseInt(dataItem.REQUEST_ID as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Save GPR C Notification',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await RequestRegisterPageModel.saveGprCNotification({
        REQUEST_ID: request_id,
        GPR_C_DATA: dataItem.GPR_C_DATA || {},
        CREATE_BY: dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })

      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Save GPR C Notification Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Save GPR C Notification',
        Message: error?.message || 'Failed to save GPR C notification',
      } as ResponseI)
    }
  },

  gprCGetFlow: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const request_id = parseInt(dataItem.REQUEST_ID as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Get GPR C Flow',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await RequestRegisterPageModel.gprCGetFlow({ REQUEST_ID: request_id })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Get GPR C Flow Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Get GPR C Flow',
        Message: error?.message || 'Failed to get GPR C flow',
      } as ResponseI)
    }
  },

  gprCSubmitSetup: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const request_id = parseInt(dataItem.REQUEST_ID as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Submit GPR C Setup',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await RequestRegisterPageModel.gprCSubmitSetup({
        REQUEST_ID: request_id,
        GPR_C_DATA: dataItem.GPR_C_DATA || {},
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Submit GPR C Setup Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Submit GPR C Setup',
        Message: error?.message || 'Failed to submit GPR C setup',
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

    const { REQUEST_ID, CREATE_BY } = dataItem

    try {
      const reqId = parseInt(REQUEST_ID as string)
      if (!reqId || isNaN(reqId)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Add Document',
          Message: 'Invalid request_id',
        } as ResponseI)
      }
      if (!file) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Add Document',
          Message: 'No file uploaded',
        } as ResponseI)
      }
      const file_name = Buffer.from(file.originalname, 'latin1').toString('utf8')
      const createDocumentResult = await RequestRegisterPageModel.createDocument({
        REQUEST_ID: reqId,
        FILE_NAME: file_name || path.basename(file.path),
        FILE_PATH: file.filename || path.basename(file.path),
        FILE_SIZE: file.size || 0,
        FILE_TYPE: file.mimetype || '',
        CREATE_BY: CREATE_BY || 'SYSTEM',
      })

      if (!createDocumentResult?.Status) {
        return res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Add Document',
          Message: createDocumentResult?.Message || 'Failed to add document',
        } as ResponseI)
      }

      const document_id = Number((createDocumentResult?.ResultOnDb as any)?.document_id || 0)

      if (!document_id || Number.isNaN(document_id)) {
        return res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Add Document',
          Message: 'Document was created but document_id was not returned correctly',
        } as ResponseI)
      }

      // ── Selection File: Save criteria uploads directly to 01.Receiving ──
      const { CRITERIA_NO, CRITERIA_DETAIL, REQUEST_NUMBER } = dataItem
      if (CRITERIA_NO && REQUEST_NUMBER) {
        try {
          SelectionFileService.saveToReceiving(
            String(REQUEST_NUMBER),
            file.path,
            String(CRITERIA_NO),
            String(CRITERIA_DETAIL || ''),
            file_name || path.basename(file.path),
          )
        } catch (selectionFileError: any) {
          // Never block the document upload — log warning only
          console.warn('[SelectionFile] Failed to save to Receiving:', selectionFileError?.message)
        }
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
        Message: 'Document added successfully',
      } as ResponseI)
    } catch (error: any) {
      console.error('Add Document Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Add Document',
        Message: error?.message || 'Failed to add document',
      } as ResponseI)
    }
  },
}
