import { RequestRegisterPageModel } from '@src/_workspace/models/_request-register/RequestRegisterPageModel'
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

export const RequestRegisterPageController = {
  getBusinessCategories: async (req: Request, res: Response) => {
    try {
      const result = await RequestRegisterPageModel.getBusinessCategories(req.body || {})

      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get Business Categories',
        Message: 'Search Data Success',
      } as ResponseI)
      return
    } catch (error: any) {
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Business Categories',
        Message: error?.message || 'Failed to get business categories',
      } as ResponseI)
      return
    }
  },

  getCurrencies: async (req: Request, res: Response) => {
    try {
      const result = await RequestRegisterPageModel.getCurrencies(req.body || {})

      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get Currencies',
        Message: 'Search Data Success',
      } as ResponseI)
      return
    } catch (error: any) {
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Currencies',
        Message: error?.message || 'Failed to get currencies',
      } as ResponseI)
      return
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Registration Request',
          Message: 'Invalid vendor_id',
        } as ResponseI)
        return
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
        res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Registration Request',
          Message: createResult?.Message || 'Failed to create registration request',
        } as ResponseI)
        return
      }

      const createResultData = (createResult?.ResultOnDb as any) || {}
      const insertedId = Number(createResultData?.insertedId || 0)

      if (!insertedId || Number.isNaN(insertedId)) {
        res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Registration Request',
          Message: 'Create request succeeded but request_id was not returned correctly',
        } as ResponseI)
        return
      }

      res.status(200).json({
        Status: true,
        ResultOnDb: {
          REQUEST_REGISTER_VENDOR_ID: insertedId,
          REQUEST_NUMBER: createResultData?.request_number || '',
          REQUESTS_AHEAD: Number(createResultData?.requests_ahead || 0),
        },
        TotalCountOnDb: 1,
        MethodOnDb: 'Create Registration Request',
        Message: createResult?.Message || 'Create Request Register Success',
      } as ResponseI)
      return

    } catch (error: any) {
      console.error('Create Registration Request Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Registration Request',
        Message: error?.message || 'Failed to create registration request',
      } as ResponseI)
      return
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Update Request',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
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
      // console.error('Update Request Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Request',
        Message: error?.message || 'Failed to update request',
      } as ResponseI)
    }
  },

  sendMail_ToSupplier_RequestFormA: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      if (!dataItem.EMAILMAIN && !dataItem.REQUEST_REGISTER_VENDOR_ID) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Send Agreement Email',
          Message: 'Vendor emailmain or request_id is required',
        } as ResponseI)
        return
      }

      const result = await RequestRegisterPageModel.sendMail_ToSupplier_RequestFormA(dataItem)

      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: 1,
        MethodOnDb: 'Send Agreement Email',
        Message: `Agreement email sent to ${result.sent_to}`,
      } as ResponseI)
      return
    } catch (error: any) {
      console.error('Send Agreement Email Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Send Agreement Email',
        Message: error?.message || 'Failed to send agreement email',
      } as ResponseI)
      return
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Approval Step',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const insertedId = await RequestRegisterPageModel.createApprovalStep({
        REQUEST_REGISTER_VENDOR_ID: request_id,
        WORKFLOW_STEP_MASTER_ID: Number(dataItem.WORKFLOW_STEP_MASTER_ID || 0),
        STEP_ORDER: dataItem.STEP_ORDER || 1,
        APPROVER_EMPCODE: dataItem.APPROVER_EMPCODE || '',
        M_APPROVAL_STEP_STATUS_ID: Number(dataItem.M_APPROVAL_STEP_STATUS_ID || 0),
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
      // console.error('Create Approval Step Error:', error)
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Update Approval Step',
          Message: 'Invalid step_id',
        } as ResponseI)
        return
      }

      await RequestRegisterPageModel.updateApprovalStep({
        REQUEST_APPROVAL_STEP_ID: step_id,
        M_APPROVAL_STEP_STATUS_ID: Number(dataItem.M_APPROVAL_STEP_STATUS_ID || 0),
        UPDATE_BY: dataItem.UPDATE_BY || '',
      })

      // Create approval log
      if (dataItem.REQUEST_REGISTER_VENDOR_ID) {
        await RequestRegisterPageModel.createApprovalLog({
          REQUEST_REGISTER_VENDOR_ID: parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string),
          REQUEST_APPROVAL_STEP_ID: step_id,
          ACTION_BY: dataItem.ACTION_BY || dataItem.UPDATE_BY || '',
          ACTION_TYPE: dataItem.ACTION_TYPE || 'status_changed',
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
      // console.error('Update Approval Step Error:', error)
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Update CC Emails',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
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
      // console.error('Update CC Emails Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Update CC Emails',
        Message: error?.message || 'Failed to update CC emails',
      } as ResponseI)
    }
  },

  saveSelectionForm: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
      if (!request_id || isNaN(request_id)) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Save Selection Form',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }
      const result = await RequestRegisterPageModel.saveSelectionForm({
        REQUEST_REGISTER_VENDOR_ID: request_id,
        SELECTION_FORM_DATA: dataItem.SELECTION_FORM_DATA || {},
        CREATE_BY: dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Save Selection Form Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Save Selection Form',
        Message: error?.message || 'Failed to save Selection Form',
      } as ResponseI)
    }
  },

  saveAccountVendorCode: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const requestId = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
      if (!requestId || isNaN(requestId)) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Save Account Vendor Code',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await RequestRegisterPageModel.saveAccountVendorCode({
        REQUEST_REGISTER_VENDOR_ID: requestId,
        VENDOR_CODE: dataItem.VENDOR_CODE || '',
        UPDATE_BY: dataItem.UPDATE_BY || '',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Save Account Vendor Code',
        Message: error?.message || 'Failed to save Vendor Code',
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Save GPR C Notification',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await RequestRegisterPageModel.saveGprCNotification({
        REQUEST_REGISTER_VENDOR_ID: request_id,
        GPR_C_DATA: dataItem.GPR_C_DATA || {},
        CREATE_BY: dataItem.CREATE_BY || dataItem.UPDATE_BY || 'SYSTEM',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })

      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Save GPR C Notification Error:', error)
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Get GPR C Flow',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await RequestRegisterPageModel.gprCGetFlow({ REQUEST_REGISTER_VENDOR_ID: request_id })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Get GPR C Flow Error:', error)
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Submit GPR C Setup',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await RequestRegisterPageModel.gprCSubmitSetup({
        REQUEST_REGISTER_VENDOR_ID: request_id,
        GPR_C_DATA: dataItem.GPR_C_DATA || {},
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Submit GPR C Setup Error:', error)
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
    let storedNetworkPath = ''
    let storedNetworkFileName = ''
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Add Document',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }
      if (!file) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Add Document',
          Message: 'No file uploaded',
        } as ResponseI)
        return
      }
      const file_name = Buffer.from(file.originalname, 'latin1').toString('utf8')
      const documentScope = String(DOCUMENT_SCOPE || '').trim().toUpperCase()
      const persistedFileName = file_name || file.originalname || 'file'
      const { CRITERIA_NO, CRITERIA_DETAIL, REQUEST_NUMBER } = dataItem
      if (!REQUEST_NUMBER) throw new Error('Missing REQUEST_NUMBER for document upload')
      if (documentScope === 'GPR_CRITERIA' && !CRITERIA_NO) {
        throw new Error('Missing CRITERIA_NO for GPR criteria file upload')
      }

      // Selection document binaries live in the request's network folder. Criteria attachment
      // metadata is normalized in vendor_selection_criteria_files instead of request_register_file.
      // GPR B is a selection document too, but it belongs to the GPR B/C stage and must not
      // be gated by the Selection Sheet edit lock (which only guards GPR A criteria editing).
      const isSelectionDocument = documentScope === 'GPR_CRITERIA' || documentScope === 'GPR_PDF' || documentScope === 'GPR_B'

      if (documentScope === 'GPR_CRITERIA' || documentScope === 'GPR_PDF') {
        await RequestRegisterPageModel.assertSelectionSheetEditable(reqId)
      }

      const networkFileResult = documentScope === 'GPR_CRITERIA'
        ? RequestRegisterPageModel.saveSelectionFileToReceiving(
          String(REQUEST_NUMBER),
          file.buffer,
          String(CRITERIA_NO),
          String(CRITERIA_DETAIL || ''),
          persistedFileName,
        )
        : documentScope === 'GPR_PDF'
          ? RequestRegisterPageModel.saveSelectionFileToSending(
            String(REQUEST_NUMBER),
            file.buffer,
            persistedFileName,
          )
          : documentScope === 'GPR_B'
            ? RequestRegisterPageModel.saveGprBFileToReceiving(
              String(REQUEST_NUMBER),
              file.buffer,
              persistedFileName,
            )
            : RequestRegisterPageModel.saveRequestDocument(
              String(REQUEST_NUMBER),
              file.buffer,
              persistedFileName,
            )

      const storedFilePath = networkFileResult.destPath
      const storedFileName = networkFileResult.newFileName
      storedNetworkPath = storedFilePath
      storedNetworkFileName = storedFileName

      let criteriaFileResult: any = null
      if (documentScope === 'GPR_CRITERIA') {
        criteriaFileResult = await RequestRegisterPageModel.createCriteriaFile({
          requestId: reqId,
          criteriaNo: String(CRITERIA_NO),
          filePath: storedFilePath,
          fileName: storedFileName,
          fileSize: file.size || 0,
          fileType: file.mimetype || '',
          createBy: CREATE_BY || 'SYSTEM',
        })
      }

      const deleteStoredNetworkFile = () => {
        if (storedNetworkPath) {
          RequestRegisterPageModel.deleteSelectionFile(
            storedNetworkPath,
            storedNetworkFileName,
            String(REQUEST_NUMBER || ''),
          )
          storedNetworkPath = ''
        }
      }

      // Persist the single GPR B file reference on the request's selection row.
      if (documentScope === 'GPR_B') {
        const gprBResult = await RequestRegisterPageModel.updateGprBFile({
          REQUEST_REGISTER_VENDOR_ID: reqId,
          GPR_B_FILE_PATH: storedFilePath,
          GPR_B_FILE_NAME: storedFileName,
          UPDATE_BY: CREATE_BY || 'SYSTEM',
        })

        if (!gprBResult?.Status) {
          deleteStoredNetworkFile()
          res.status(200).json({
            Status: false,
            ResultOnDb: {},
            TotalCountOnDb: 0,
            MethodOnDb: 'Add Document',
            Message: gprBResult?.Message || 'Failed to save GPR B file',
          } as ResponseI)
          return
        }
      }

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
          deleteStoredNetworkFile()
          res.status(200).json({
            Status: false,
            ResultOnDb: {},
            TotalCountOnDb: 0,
            MethodOnDb: 'Add Document',
            Message: createDocumentResult?.Message || 'Failed to add document',
          } as ResponseI)
          return
        }

        document_id = Number((createDocumentResult?.ResultOnDb as any)?.document_id || 0)

        if (!document_id || Number.isNaN(document_id)) {
          res.status(200).json({
            Status: false,
            ResultOnDb: {},
            TotalCountOnDb: 0,
            MethodOnDb: 'Add Document',
            Message: 'Document was created but document_id was not returned correctly',
          } as ResponseI)
          return
        }
      }

      res.status(200).json({
        Status: true,
        ResultOnDb: {
          DOCUMENT_ID: document_id,
          CRITERIA_FILE_ID: criteriaFileResult?.CRITERIA_FILE_ID || 0,
          FILE_ORDER: criteriaFileResult?.FILE_ORDER || 0,
          FILE_PATH: storedFilePath,
          FILE_NAME: storedFileName,
          SELECTION_FILE_PATH: isSelectionDocument ? storedFilePath : '',
          SELECTION_FILE_NAME: isSelectionDocument ? storedFileName : '',
        },
        TotalCountOnDb: 1,
        MethodOnDb: 'Add Document',
        Message: 'Document added successfully',
      } as ResponseI)
    } catch (error: any) {
      if (storedNetworkPath) {
        try {
          RequestRegisterPageModel.deleteSelectionFile(
            storedNetworkPath,
            storedNetworkFileName,
            String(dataItem.REQUEST_NUMBER || ''),
          )
        } catch (cleanupError: any) {
          console.warn('[SelectionFile] Failed to clean up uploaded document:', cleanupError?.message)
        }
      }
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
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Download Selection Document',
          Message: 'Missing file_path',
        } as ResponseI)
        return
      }

      const resolvedPath = RequestRegisterPageModel.resolveSelectionDownloadPath(
        rawFilePath,
        rawFileName,
        rawRequestNumber,
      )
      if (!resolvedPath) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Download Selection Document',
          Message: 'Invalid selection document path',
        } as ResponseI)
        return
      }

      if (!fs.existsSync(resolvedPath)) {
        res.status(404).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Download Selection Document',
          Message: 'Selection document not found',
        } as ResponseI)
        return
      }

      const resolvedName = rawFileName || path.basename(resolvedPath)
      // GET (or explicit DISPOSITION=inline) is used for in-app preview â†’ serve inline so the
      // browser renders PDFs/images instead of forcing a save. POST keeps the attachment download.
      const wantsInline = req.method === 'GET' || String(dataItem.DISPOSITION || '').toLowerCase() === 'inline'
      if (wantsInline) {
        res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(resolvedName)}`)
        res.sendFile(resolvedPath)
        return
      }

      res.download(resolvedPath, resolvedName)
      return
    } catch (error: any) {
      // console.error('Download Selection Document Error:', error)

      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Download Selection Document',
        Message: error?.message || 'Failed to download selection document',
      } as ResponseI)
      return
    }
  },

  deleteSelectionDocument: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID || dataItem.request_id || 0)
      const criteriaFileId = Number(dataItem.CRITERIA_FILE_ID || dataItem.criteria_file_id || 0)
      const updateBy = String(dataItem.UPDATE_BY || dataItem.update_by || 'SYSTEM').trim() || 'SYSTEM'
      const rawRequestNumber = String(dataItem.REQUEST_NUMBER || dataItem.request_number || '').trim()

      if (!requestId || !criteriaFileId) {
        res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Delete Selection Document',
          Message: 'Missing request_id or criteria_file_id',
        } as ResponseI)
        return
      }

      await RequestRegisterPageModel.assertSelectionSheetEditable(requestId)

      const criteriaFile = await RequestRegisterPageModel.getCriteriaFileForDelete(
        requestId,
        criteriaFileId,
      )

      if (!criteriaFile) {
        res.status(200).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Delete Selection Document',
          Message: 'Criteria file record not found',
        } as ResponseI)
        return
      }

      const rawFilePath = String(criteriaFile.FILE_PATH || '').trim()
      const rawFileName = String(criteriaFile.FILE_NAME || '').trim()

      const deleteResult = rawFilePath
        ? RequestRegisterPageModel.deleteSelectionFile(rawFilePath, rawFileName, rawRequestNumber)
        : { deleted: false, filePath: '', reason: 'No file path in criteria record' }

      await RequestRegisterPageModel.softDeleteCriteriaFile(criteriaFileId, updateBy)

      res.status(200).json({
        Status: true,
        ResultOnDb: {
          criteria_file_id: criteriaFileId,
          criteria_no: criteriaFile.CRITERIA_NO,
          file_order: criteriaFile.FILE_ORDER,
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
      return
    } catch (error: any) {
      // console.error('Delete Selection Document Error:', error)

      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Delete Selection Document',
        Message: error?.message || 'Failed to delete selection document',
      } as ResponseI)
      return
    }
  },
}
