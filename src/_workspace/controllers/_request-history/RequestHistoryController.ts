import { RequestHistoryModel } from '@src/_workspace/models/_request-history/RequestHistoryModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const RequestHistoryController = {
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
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await RequestHistoryModel.getById({ request_id })
      res.status(200).json({
        Status: true,
        ResultOnDb: result || {},
        TotalCountOnDb: result ? 1 : 0,
        MethodOnDb: 'Get Registration Request',
        Message: 'Get Data Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Get Registration Request Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Registration Request',
        Message: error?.message || 'Failed to get registration request',
      } as ResponseI)
    }
  },

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
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Get Approval Steps',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await RequestHistoryModel.getApprovalSteps({ request_id })
      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get Approval Steps',
        Message: 'Get Data Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Get Approval Steps Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Approval Steps',
        Message: error?.message || 'Failed to get approval steps',
      } as ResponseI)
    }
  },

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
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Get Approval Logs',
          Message: 'Invalid request_id',
        } as ResponseI)
      }

      const result = await RequestHistoryModel.getApprovalLogs({ request_id })
      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get Approval Logs',
        Message: 'Get Data Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Get Approval Logs Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Approval Logs',
        Message: error?.message || 'Failed to get approval logs',
      } as ResponseI)
    }
  },

  resolveEmployeeProfile: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const empcode = String(dataItem.empcode || '').trim()

      if (!empcode) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Resolve Employee Profile',
          Message: 'Missing empcode',
        } as ResponseI)
      }

      const result = await RequestHistoryModel.resolveEmployeeProfile({ empcode })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Resolve Employee Profile Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Resolve Employee Profile',
        Message: error?.message || 'Failed to resolve employee profile',
      } as ResponseI)
    }
  },

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
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Get GPR Form',
          Message: 'Invalid request_id',
        } as ResponseI)
      }
      const result = await RequestHistoryModel.getGprForm(request_id)
      res.status(200).json({
        Status: true,
        ResultOnDb: result || [],
        TotalCountOnDb: result ? 1 : 0,
        MethodOnDb: 'Get GPR Form',
        Message: 'Success',
      } as ResponseI)
    } catch (error: any) {
      console.error('Get GPR Form Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Get GPR Form',
        Message: error?.message || 'Failed to get GPR form',
      } as ResponseI)
    }
  },
}
