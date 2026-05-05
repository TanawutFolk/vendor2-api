import { GprCApprovalModel } from '@src/_workspace/models/_approval-GPRC/GprCApprovalModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const GprCApprovalController = {
  gprCApproveStep: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const request_id = parseInt(dataItem.request_id as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Approve GPR C Step',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await GprCApprovalModel.gprCApproveStep({
        request_id,
        action_by: dataItem.action_by || dataItem.UPDATE_BY || '',
        remark: dataItem.remark || dataItem.action_remark || '',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.action_by || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Approve GPR C Step Error:', error)
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
      const request_id = parseInt(dataItem.request_id as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Reject GPR C Step',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await GprCApprovalModel.gprCRejectStep({
        request_id,
        action_by: dataItem.action_by || dataItem.UPDATE_BY || '',
        remark: dataItem.remark || dataItem.action_remark || '',
        UPDATE_BY: dataItem.UPDATE_BY || dataItem.action_by || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Reject GPR C Step Error:', error)
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
      const request_id = parseInt(dataItem.request_id as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'GPR C Action Required',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await GprCApprovalModel.gprCActionRequired({
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
      const action_required_id = parseInt(dataItem.action_required_id as string)
      if (!action_required_id || isNaN(action_required_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Record GPR C Action Result',
          Message: 'Invalid action_required_id',
        } as ResponseI)
      }

      const result = await GprCApprovalModel.gprCRecordActionResult({
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
      const approver_empcode = String(dataItem.approver_empcode || dataItem.approver_id || '').trim()
      if (!approver_empcode) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Get GPR C Queue',
          Message: 'Missing approver_empcode',
        } as ResponseI)
      }

      const result = await GprCApprovalModel.gprCQueue({ approver_empcode })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Get GPR C Queue Error:', error)
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
      const pic_email = String(dataItem.pic_email || '').trim()
      if (!pic_email) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Get GPR C Action Required Queue',
          Message: 'Missing pic_email',
        } as ResponseI)
      }

      const result = await GprCApprovalModel.gprCActionRequiredQueue({ pic_email })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Get GPR C Action Required Queue Error:', error)
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
