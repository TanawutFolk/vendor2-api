import { RegisterRequestService } from '@src/_workspace/services/_request-registrer/RegisterRequestService'

export const RegisterRequestModel = {
    createRequest: async (dataItem: any) => RegisterRequestService.createRequest(dataItem),
    createDocument: async (dataItem: any) => RegisterRequestService.createDocument(dataItem),
    getAllRequests: async (dataItem?: any, sqlWhere: string = '') => RegisterRequestService.getAllRequests(dataItem, sqlWhere),
    getById: async (dataItem: any) => RegisterRequestService.getById(dataItem),
    updateStatus: async (dataItem: any) => RegisterRequestService.updateStatus(dataItem),
    sendAgreementEmail: async (dataItem: any) => RegisterRequestService.sendAgreementEmail(dataItem),
    getStatusOptions: async () => RegisterRequestService.getStatusOptions(),
    createApprovalStep: async (dataItem: any) => RegisterRequestService.createApprovalStep(dataItem),
    getApprovalSteps: async (dataItem: any) => RegisterRequestService.getApprovalSteps(dataItem),
    updateApprovalStep: async (dataItem: any) => RegisterRequestService.updateApprovalStep(dataItem),
    createApprovalLog: async (dataItem: any) => RegisterRequestService.createApprovalLog(dataItem),
    getApprovalLogs: async (dataItem: any) => RegisterRequestService.getApprovalLogs(dataItem),
    updateCcEmails: async (dataItem: any) => RegisterRequestService.updateCcEmails(dataItem),
    completeRegistration: async (dataItem: any) => RegisterRequestService.completeRegistration(dataItem),
    saveGprForm: async (dataItem: any) => RegisterRequestService.saveGprForm(dataItem),
    getGprForm: async (request_id: number) => RegisterRequestService.getGprForm(request_id),
}
