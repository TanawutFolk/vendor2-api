import { ApprovalQueueService } from '../../services/_approval-queue/ApprovalQueueService'

export const ApprovalQueueModel = {
  getAllRequests: async (dataItem: any, sqlWhere: string = '') => ApprovalQueueService.getAllRequests(dataItem, sqlWhere),
  getById: async (dataItem: any) => ApprovalQueueService.getById(dataItem),
  updateStatus: async (dataItem: any) => ApprovalQueueService.updateStatus(dataItem),
  getStatusOptions: async (dataItem: any = {}) => ApprovalQueueService.getStatusOptions(dataItem),
  reassignAssignment: async (dataItem: any) => ApprovalQueueService.reassignAssignment(dataItem),
}
