import { RequestHistoryService } from '../../services/_request-history/RequestHistoryService'

export const RequestHistoryModel = {
  getById: async (dataItem: any) => RequestHistoryService.getById(dataItem),
  getApprovalSteps: async (dataItem: any) => RequestHistoryService.getApprovalSteps(dataItem),
  getApprovalLogs: async (dataItem: any) => RequestHistoryService.getApprovalLogs(dataItem),
  resolveEmployeeProfile: async (dataItem: any) => RequestHistoryService.resolveEmployeeProfile(dataItem),
  getGprForm: async (request_id: number) => RequestHistoryService.getGprForm({ request_id }),
}
