import { RequestHistoryService } from '../../services/_request-history/RequestHistoryService'

export const RequestHistoryModel = {
  getById: async (dataItem: any) => RequestHistoryService.getById(dataItem),
  getApprovalSteps: async (dataItem: any) => RequestHistoryService.getApprovalSteps(dataItem),
  getApprovalLogs: async (dataItem: any) => RequestHistoryService.getApprovalLogs(dataItem),
  resolveEmployeeProfile: async (dataItem: any) => RequestHistoryService.resolveEmployeeProfile(dataItem),
  getGprCProducts: async (dataItem: any) => RequestHistoryService.getGprCProducts(dataItem),
  getSelectionForm: async (request_id: number) => RequestHistoryService.getSelectionForm({ REQUEST_REGISTER_VENDOR_ID: request_id }),
}
