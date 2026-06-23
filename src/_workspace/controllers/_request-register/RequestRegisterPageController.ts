import { RequestRegisterPageModel } from '@src/_workspace/models/_request-register/RequestRegisterPageModel'
import { SelectionFileService } from '@src/_workspace/services/_request-register/SelectionFileService'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const parseVendorContactIds = (dataItem: any): string[] => {
  const rawValue = dataItem.VENDOR_CONTACT_IDS || dataItem['VENDOR_CONTACT_IDS[]'] || dataItem.VENDOR_CONTACTS_ID || []
  const rawList = Array.isArray(rawValue) ? rawValue : [rawValue]

  return rawList
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter((value) => value && Number(value) > 0)
}

const removeTempUpload = (filePath?: string) => {
  if (!filePath || !fs.existsSync(filePath)) return
  fs.unlinkSync(filePath)
}

export const RequestRegisterPageController = {
  getBusinessCategories: async (_req: Request, res: Response) => {
    try {
      const result = await RequestRegisterPageModel.getBusinessCategories()

      return res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get Business Categories',
        Message: 'Search Data Success',
      } as ResponseI)
    } catch (error: any) {
      return res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Business Categories',
        Message: error?.message || 'Failed to get business categories',
      } as ResponseI)
    }
  },

  getCurrencies: async (_req: Request, res: Response) => {
    try {
      const result = await RequestRegisterPageModel.getCurrencies()

      return res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get Currencies',
        Message: 'Search Data Success',
      } as ResponseI)
    } catch (error: any) {
      return res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Currencies',
        Message: error?.message || 'Failed to get currencies',
      } as ResponseI)
    }
  },

  create: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      const vendor_id = parseInt(dataItem.VENDORS_ID as string)
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
        VENDORS_ID: vendor_id,
        VENDOR_CONTACTS_ID: vendorContactIds[0] || dataItem.VENDOR_CONTACTS_ID || null,
        VENDOR_CONTACT_IDS: vendorContactIds,
        UPLOADED_FILES: files,
        REQUEST_BY_EMPLOYEECODE: dataItem.REQUEST_BY_EMPLOYEECODE || '',
        REQUEST_BY_EMAIL: dataItem.REQUEST_BY_EMAIL || '',
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
        files.forEach((uploadedFile) => removeTempUpload(uploadedFile?.path))
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
        files.forEach((uploadedFile) => removeTempUpload(uploadedFile?.path))
        return res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Registration Request',
          Message: 'Create request succeeded but request_id was not returned correctly',
        } as ResponseI)
      }

      return res.status(200).json({
        Status: true,
        ResultOnDb: { REQUEST_REGISTER_VENDOR_ID: insertedId, REQUEST_NUMBER: createResultData?.request_number || '' },
        TotalCountOnDb: 1,
        MethodOnDb: 'Create Registration Request',
        Message: createResult?.Message || 'Create Request Register Success',
      } as ResponseI)

    } catch (error: any) {
      const files = (req.files as any[]) || []
      files.forEach((uploadedFile) => removeTempUpload(uploadedFile?.path))
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
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)

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
        REQUEST_REGISTER_VENDOR_ID: request_id,
        VENDOR_CONTACTS_ID: dataItem.VENDOR_CONTACTS_ID || null,
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
      if (!dataItem.EMAILMAIN && !dataItem.REQUEST_REGISTER_VENDOR_ID) {
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
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
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
        REQUEST_REGISTER_VENDOR_ID: request_id,
        STEP_ORDER: dataItem.STEP_ORDER || 1,
        APPROVER_EMPCODE: dataItem.APPROVER_EMPCODE || '',
        STEP_STATUS: dataItem.STEP_STATUS || 'pending',
        DESCRIPTION: dataItem.DESCRIPTION || '',
        STEP_CODE: dataItem.STEP_CODE || '',
        ASSIGNMENT_MODE: dataItem.ASSIGNMENT_MODE || 'AUTO',
        CREATE_BY: dataItem.CREATE_BY || '',
      })

      res.status(200).json({
        Status: true,
        ResultOnDb: { REQUEST_APPROVAL_STEP_ID: insertedId },
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
      const step_id = parseInt(dataItem.REQUEST_APPROVAL_STEP_ID as string)
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
        REQUEST_APPROVAL_STEP_ID: step_id,
        STEP_STATUS: dataItem.STEP_STATUS || '',
        UPDATE_BY: dataItem.UPDATE_BY || '',
      })

      // Create approval log
      if (dataItem.REQUEST_REGISTER_VENDOR_ID) {
        await RequestRegisterPageModel.createApprovalLog({
          REQUEST_REGISTER_VENDOR_ID: parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string),
          REQUEST_APPROVAL_STEP_ID: step_id,
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
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
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
        REQUEST_REGISTER_VENDOR_ID: request_id,
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
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
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
        REQUEST_REGISTER_VENDOR_ID: request_id,
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
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
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
        REQUEST_REGISTER_VENDOR_ID: request_id,
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
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Get GPR C Flow',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await RequestRegisterPageModel.gprCGetFlow({ REQUEST_REGISTER_VENDOR_ID: request_id })
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
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
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
        REQUEST_REGISTER_VENDOR_ID: request_id,
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

    const { REQUEST_REGISTER_VENDOR_ID, CREATE_BY, DOCUMENT_SCOPE } = dataItem

    try {
      const reqId = parseInt(REQUEST_REGISTER_VENDOR_ID as string)
      if (!reqId || isNaN(reqId)) {
        removeTempUpload(file?.path)
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
      const documentScope = String(DOCUMENT_SCOPE || '').trim().toUpperCase()
      const persistedFileName = file_name || path.basename(file.path)
      const { CRITERIA_NO, CRITERIA_DETAIL, REQUEST_NUMBER } = dataItem
      if (documentScope === 'GPR_CRITERIA' && (!CRITERIA_NO || !REQUEST_NUMBER)) {
        throw new Error('Missing CRITERIA_NO or REQUEST_NUMBER for GPR criteria file upload')
      }
      if (documentScope === 'GPR_PDF' && !REQUEST_NUMBER) {
        throw new Error('Missing REQUEST_NUMBER for GPR PDF upload')
      }

      const isSelectionDocument = documentScope === 'GPR_CRITERIA' || documentScope === 'GPR_PDF'

      const selectionFileResult = documentScope === 'GPR_CRITERIA'
        ? SelectionFileService.saveToReceiving(
          String(REQUEST_NUMBER),
          file.path,
          String(CRITERIA_NO),
          String(CRITERIA_DETAIL || ''),
          file_name || path.basename(file.path),
        )
        : documentScope === 'GPR_PDF'
          ? SelectionFileService.saveToSending(
            String(REQUEST_NUMBER),
            file.path,
            file_name || path.basename(file.path),
          )
          : null

      const storedFilePath = selectionFileResult?.destPath || file.filename || path.basename(file.path)
      const storedFileName = selectionFileResult?.newFileName || file_name || path.basename(file.path)

      let document_id = 0

      if (!isSelectionDocument) {
        const createDocumentResult = await RequestRegisterPageModel.createDocument({
          REQUEST_REGISTER_VENDOR_ID: reqId,
          FILE_NAME: persistedFileName,
          FILE_PATH: storedFilePath,
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

        document_id = Number((createDocumentResult?.ResultOnDb as any)?.document_id || 0)

        if (!document_id || Number.isNaN(document_id)) {
          return res.status(200).json({
            Status: false,
            ResultOnDb: {},
            TotalCountOnDb: 0,
            MethodOnDb: 'Add Document',
            Message: 'Document was created but document_id was not returned correctly',
          } as ResponseI)
        }
      }

      // â”€â”€ Selection File: Save criteria uploads directly to 01.Receiving â”€â”€
      if (false && CRITERIA_NO && REQUEST_NUMBER) {
        try {
          SelectionFileService.saveToReceiving(
            String(REQUEST_NUMBER),
            file!.path,
            String(CRITERIA_NO),
            String(CRITERIA_DETAIL || ''),
            file_name || path.basename(file!.path),
          )
        } catch (selectionFileError: any) {
          // Never block the document upload â€” log warning only
          console.warn('[SelectionFile] Failed to save to Receiving:', selectionFileError?.message)
        }
      }

      res.status(200).json({
        Status: true,
        ResultOnDb: {
          document_id,
          file_path: storedFilePath,
          file_name: storedFileName,
          selection_file_path: selectionFileResult?.destPath || '',
          selection_file_name: selectionFileResult?.newFileName || '',
        },
        TotalCountOnDb: 1,
        MethodOnDb: 'Add Document',
        Message: 'Document added successfully',
      } as ResponseI)
    } catch (error: any) {
      removeTempUpload(file?.path)
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

  downloadSelectionDocument: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const rawFilePath = String(dataItem.FILE_PATH || dataItem.file_path || '').trim()
      const rawFileName = String(dataItem.FILE_NAME || dataItem.file_name || '').trim()
      const rawRequestNumber = String(dataItem.REQUEST_NUMBER || dataItem.request_number || '').trim()

      if (!rawFilePath) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Download Selection Document',
          Message: 'Missing file_path',
        } as ResponseI)
      }

      const resolvedPath = SelectionFileService.resolveDownloadPath(rawFilePath, rawFileName, rawRequestNumber)
      if (!resolvedPath) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Download Selection Document',
          Message: 'Invalid selection document path',
        } as ResponseI)
      }

      if (!fs.existsSync(resolvedPath)) {
        return res.status(404).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Download Selection Document',
          Message: 'Selection document not found',
        } as ResponseI)
      }

      return res.download(resolvedPath, rawFileName || path.basename(resolvedPath))
    } catch (error: any) {
      console.error('Download Selection Document Error:', error)

      return res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Download Selection Document',
        Message: error?.message || 'Failed to download selection document',
      } as ResponseI)
    }
  },

  deleteSelectionDocument: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID || dataItem.request_id || 0)
      const criteriaNo = String(dataItem.CRITERIA_NO || dataItem.criteria_no || '').trim()
      const updateBy = String(dataItem.UPDATE_BY || dataItem.update_by || 'SYSTEM').trim() || 'SYSTEM'
      const rawRequestNumber = String(dataItem.REQUEST_NUMBER || dataItem.request_number || '').trim()

      if (!requestId || !criteriaNo) {
        return res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Delete Selection Document',
          Message: 'Missing request_id or criteria_no',
        } as ResponseI)
      }

      const criteriaRows = await RequestRegisterPageModel.getCriteriaFileForDelete({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        CRITERIA_NO: criteriaNo,
      })
      const criteriaRow = criteriaRows[0]

      if (!criteriaRow) {
        return res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Delete Selection Document',
          Message: 'Criteria document record not found',
        } as ResponseI)
      }

      const rawFilePath = String(
        dataItem.FILE_PATH
        || dataItem.file_path
        || criteriaRow.UPLOADED_FILE_PATH
        || ''
      ).trim()
      const rawFileName = String(
        dataItem.FILE_NAME
        || dataItem.file_name
        || criteriaRow.UPLOADED_FILE_NAME
        || ''
      ).trim()

      const deleteResult = rawFilePath
        ? SelectionFileService.deleteSelectionFile(rawFilePath, rawFileName, rawRequestNumber)
        : { deleted: false, filePath: '', reason: 'No file path in criteria record' }

      await RequestRegisterPageModel.clearCriteriaUploadedFile({
        REQUEST_VENDOR_SELECTIONS_ID: criteriaRow.REQUEST_VENDOR_SELECTIONS_ID,
        CRITERIA_NO: criteriaNo,
        UPDATE_BY: updateBy,
      })

      return res.status(200).json({
        Status: true,
        ResultOnDb: {
          criteria_no: criteriaNo,
          physical_deleted: deleteResult.deleted,
          deleted_file_path: deleteResult.filePath,
          reason: deleteResult.reason,
        },
        TotalCountOnDb: 1,
        MethodOnDb: 'Delete Selection Document',
        Message: deleteResult.deleted
          ? 'Selection document deleted successfully'
          : 'Selection document record cleared, but physical file was not found',
      } as ResponseI)
    } catch (error: any) {
      console.error('Delete Selection Document Error:', error)

      return res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Delete Selection Document',
        Message: error?.message || 'Failed to delete selection document',
      } as ResponseI)
    }
  },
}
