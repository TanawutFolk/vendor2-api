import { RequestHistoryService } from '../../services/_request-history/RequestHistoryService'

export const RequestHistoryModel = {
    getById: RequestHistoryService.getById,
    getApprovalSteps: RequestHistoryService.getApprovalSteps,
    getApprovalLogs: RequestHistoryService.getApprovalLogs,
    resolveEmployeeProfile: RequestHistoryService.resolveEmployeeProfile,
    getGprForm: RequestHistoryService.getGprForm,
}
