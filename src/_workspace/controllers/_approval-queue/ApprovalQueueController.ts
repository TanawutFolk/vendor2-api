import { ApprovalQueueModel } from '@src/_workspace/models/_approval-queue/ApprovalQueueModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ApprovalQueueController = {
  getById: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)

      if (!request_id || isNaN(request_id)) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Get Registration Request By Id',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await ApprovalQueueModel.getById({ REQUEST_REGISTER_VENDOR_ID: request_id })

      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result ? 1 : 0,
        MethodOnDb: 'Get Registration Request By Id',
        Message: 'Get Data Success',
      } as ResponseI)
      return
    } catch (error: any) {
      // console.error('Get Registration Request By Id Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Registration Request By Id',
        Message: error?.message || 'Failed to get registration request',
      } as ResponseI)
      return
    }
  },

  getAll: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

    try {
      const { data, totalCount } = await ApprovalQueueModel.getAllRequests(dataItem)
      res.status(200).json({
        Status: true,
        ResultOnDb: data,
        TotalCountOnDb: totalCount,
        MethodOnDb: 'Get All Registration Requests',
        Message: 'Get Data Success',
      } as ResponseI)
      return
    } catch (error: any) {
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get All Registration Requests',
        Message: error?.message || 'Failed to get registration requests',
      } as ResponseI)
      return
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      const request_id = parseInt((dataItem.REQUEST_REGISTER_VENDOR_ID ?? dataItem.request_id) as string)
      const workflowTransitionId = Number(dataItem.WORKFLOW_TRANSITION_ID ?? dataItem.workflow_transition_id ?? 0)
      const approveBy = dataItem.APPROVE_BY ?? dataItem.approve_by ?? ''
      const approverRemark = dataItem.APPROVER_REMARK ?? dataItem.approver_remark ?? ''
      const updateBy = dataItem.UPDATE_BY ?? dataItem.update_by ?? 'SYSTEM'
      const currentTaskId = Number(dataItem.CURRENT_TASK_ID ?? dataItem.current_task_id ?? 0)
      const lockVersionRaw = dataItem.LOCK_VERSION ?? dataItem.lock_version
      const lockVersion = lockVersionRaw === undefined || lockVersionRaw === null || lockVersionRaw === '' ? undefined : Number(lockVersionRaw)

      if (!request_id || isNaN(request_id)) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Update Request Status',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await ApprovalQueueModel.updateStatus({
        REQUEST_REGISTER_VENDOR_ID: request_id,
        CURRENT_TASK_ID: currentTaskId,
        LOCK_VERSION: lockVersion,
        WORKFLOW_TRANSITION_ID: workflowTransitionId,
        APPROVE_BY: approveBy,
        APPROVER_REMARK: approverRemark,
        UPDATE_BY: updateBy,
      })

      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Update Status Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Request Status',
        Message: error?.message || 'Failed to update status',
      } as ResponseI)
    }
  },

  getStatusOptions: async (_req: Request, res: Response) => {
    try {
      const result = await ApprovalQueueModel.getStatusOptions()
      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get Status Options',
        Message: 'Get Data Success',
      } as ResponseI)
    } catch (error: any) {
      // console.error('Get Status Options Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Status Options',
        Message: error?.message || 'Failed to get status options',
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
      const request_id = parseInt(dataItem.REQUEST_REGISTER_VENDOR_ID as string)
      if (!request_id || isNaN(request_id)) {
        res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Reassign Request',
          Message: 'Invalid request_id',
        } as ResponseI)
        return
      }

      const result = await ApprovalQueueModel.reassignAssignment({
        REQUEST_REGISTER_VENDOR_ID: request_id,
        SCOPE: dataItem.SCOPE || '',
        TO_EMPCODE: dataItem.TO_EMPCODE || '',
        REASON: dataItem.REASON || '',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })

      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      // console.error('Reassign Request Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Reassign Request',
        Message: error?.message || 'Failed to reassign request',
      } as ResponseI)
    }
  },
}

