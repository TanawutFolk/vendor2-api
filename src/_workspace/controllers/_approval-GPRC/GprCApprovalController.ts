import { GprCApprovalModel } from '@src/_workspace/models/_approval-GPRC/GprCApprovalModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const GprCApprovalController = {
  gprCApproveStep: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
      if (!request_id || isNaN(request_id)) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Approve GPR C Step',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await GprCApprovalModel.gprCApproveStep({
        REQUEST_REGISTER_VENDOR_ID: request_id,
        ACTION_BY: dataItem.ACTION_BY || dataItem.UPDATE_BY || '',
        REMARK: dataItem.REMARK || dataItem.ACTION_REMARK || '',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.ACTION_BY || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Approve GPR C Step Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Approve GPR C Step',
        Message: error?.message || 'Failed to approve GPR C step',
      } as ResponseI)
    }
  },

  gprCRejectStep: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
      if (!request_id || isNaN(request_id)) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Reject GPR C Step',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await GprCApprovalModel.gprCRejectStep({
        REQUEST_REGISTER_VENDOR_ID: request_id,
        ACTION_BY: dataItem.ACTION_BY || dataItem.UPDATE_BY || '',
        REMARK: dataItem.REMARK || dataItem.ACTION_REMARK || '',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.ACTION_BY || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Reject GPR C Step Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Reject GPR C Step',
        Message: error?.message || 'Failed to reject GPR C step',
      } as ResponseI)
    }
  },

  gprCActionRequired: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
      if (!request_id || isNaN(request_id)) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'GPR C Action Required',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await GprCApprovalModel.gprCActionRequired({
        REQUEST_REGISTER_VENDOR_ID: request_id,
        ACTION_BY: dataItem.ACTION_BY || dataItem.UPDATE_BY || '',
        PIC_NAME: dataItem.PIC_NAME || '',
        PIC_EMAIL: dataItem.PIC_EMAIL || '',
        REQUIRED_DETAIL: dataItem.REQUIRED_DETAIL || dataItem.REMARK || '',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.ACTION_BY || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('GPR C Action Required Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'GPR C Action Required',
        Message: error?.message || 'Failed to send GPR C Action Required',
      } as ResponseI)
    }
  },

  gprCRecordActionResult: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const action_required_id = parseInt(dataItem.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID as string)
      if (!action_required_id || isNaN(action_required_id)) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Record GPR C Action Result',
          Message: 'Invalid action_required_id',
        } as ResponseI)
        return
      }

      const actionResultStatusId = Number(dataItem.M_ACTION_RESULT_STATUS_ID)
      if (!Number.isInteger(actionResultStatusId) || actionResultStatusId <= 0) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Record GPR C Action Result',
          Message: 'Invalid action result status ID',
        } as ResponseI)
        return
      }

      const result = await GprCApprovalModel.gprCRecordActionResult({
        REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: action_required_id,
        M_ACTION_RESULT_STATUS_ID: actionResultStatusId,
        RESULT_REMARK: dataItem.RESULT_REMARK || '',
        RESULT_BY: dataItem.RESULT_BY || dataItem.UPDATE_BY || '',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.RESULT_BY || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Record GPR C Action Result Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Record GPR C Action Result',
        Message: error?.message || 'Failed to record GPR C Action Result',
      } as ResponseI)
    }
  },

  gprCQueue: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const approver_empcode = String(dataItem.APPROVER_EMPCODE || dataItem.APPROVER_EMPCODE || '').trim()
      if (!approver_empcode) {
        res.status(400).json({
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Get GPR C Queue',
          Message: 'Missing approver_empcode',
        } as ResponseI)
        return
      }

      const result = await GprCApprovalModel.gprCQueue({
        ...dataItem,
        APPROVER_EMPCODE: approver_empcode,
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Get GPR C Queue Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get GPR C Queue',
        Message: error?.message || 'Failed to get GPR C queue',
      } as ResponseI)
    }
  },

  gprCActionRequiredQueue: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const pic_email = String(dataItem.PIC_EMAIL || '').trim()
      if (!pic_email) {
        res.status(400).json({
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Get GPR C Action Required Queue',
          Message: 'Missing pic_email',
        } as ResponseI)
        return
      }

      const result = await GprCApprovalModel.gprCActionRequiredQueue({
        ...dataItem,
        PIC_EMAIL: pic_email,
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Get GPR C Action Required Queue Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get GPR C Action Required Queue',
        Message: error?.message || 'Failed to get GPR C Action Required queue',
      } as ResponseI)
    }
  },
}
