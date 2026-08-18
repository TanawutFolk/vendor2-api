import { ApprovalFlowSettingService } from '../../services/_approval-flow-setting/ApprovalFlowSettingService'

export const ApprovalFlowSettingModel = {
  getWorkflowSetting: async (dataItem: any) => ApprovalFlowSettingService.getWorkflowSetting(dataItem),
  getApprovalGroups: async () => ApprovalFlowSettingService.getApprovalGroups(),
  getWorkflowStepTypes: async () => ApprovalFlowSettingService.getWorkflowStepTypes(),
  saveWorkflowSetting: async (dataItem: any) => ApprovalFlowSettingService.saveWorkflowSetting(dataItem),
  createWorkflowDraft: async (dataItem: any) => ApprovalFlowSettingService.createWorkflowDraft(dataItem),
  saveWorkflowDraft: async (dataItem: any) => ApprovalFlowSettingService.saveWorkflowDraft(dataItem),
  validateWorkflowDraft: async (dataItem: any) => ApprovalFlowSettingService.validateWorkflowDraft(dataItem),
  publishWorkflow: async (dataItem: any) => ApprovalFlowSettingService.publishWorkflow(dataItem),
  discardWorkflowDraft: async (dataItem: any) => ApprovalFlowSettingService.discardWorkflowDraft(dataItem),
}
