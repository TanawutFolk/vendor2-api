import { Request, Response } from 'express'

import { ApprovalFlowSettingModel } from '../../models/_approval-flow-setting/ApprovalFlowSettingModel'
import { ResponseI } from '@src/types/ResponseI'

const getDataItem = (req: Request) => (!req.body || Object.entries(req.body).length === 0 ? req.query : req.body)

const sendResult = (res: Response, result: unknown) => {
  res.status(200).json(result as ResponseI)
}

export const ApprovalFlowSettingController = {
  getWorkflowSetting: async (req: Request, res: Response) => {
    sendResult(res, await ApprovalFlowSettingModel.getWorkflowSetting(getDataItem(req)))
  },
  getApprovalGroups: async (_req: Request, res: Response) => {
    sendResult(res, await ApprovalFlowSettingModel.getApprovalGroups())
  },
  getWorkflowStepTypes: async (_req: Request, res: Response) => {
    sendResult(res, await ApprovalFlowSettingModel.getWorkflowStepTypes())
  },
  saveWorkflowSetting: async (req: Request, res: Response) => {
    sendResult(res, await ApprovalFlowSettingModel.saveWorkflowSetting(getDataItem(req)))
  },
  createWorkflowDraft: async (req: Request, res: Response) => {
    sendResult(res, await ApprovalFlowSettingModel.createWorkflowDraft(getDataItem(req)))
  },
  saveWorkflowDraft: async (req: Request, res: Response) => {
    sendResult(res, await ApprovalFlowSettingModel.saveWorkflowDraft(getDataItem(req)))
  },
  validateWorkflowDraft: async (req: Request, res: Response) => {
    sendResult(res, await ApprovalFlowSettingModel.validateWorkflowDraft(getDataItem(req)))
  },
  publishWorkflow: async (req: Request, res: Response) => {
    sendResult(res, await ApprovalFlowSettingModel.publishWorkflow(getDataItem(req)))
  },
  discardWorkflowDraft: async (req: Request, res: Response) => {
    sendResult(res, await ApprovalFlowSettingModel.discardWorkflowDraft(getDataItem(req)))
  },
}
