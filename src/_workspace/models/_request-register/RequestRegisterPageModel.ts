import { RequestRegisterPageService } from '../../services/_request-register/RequestRegisterPageService'

export const RequestRegisterPageModel = {
    createRequest: async (dataItem: any) => RequestRegisterPageService.createRequest(dataItem),
    createDocument: async (dataItem: any) => RequestRegisterPageService.createDocument(dataItem),
    updateRequest: async (dataItem: any) => RequestRegisterPageService.updateRequest(dataItem),
    sendAgreementEmail: async (dataItem: any) => RequestRegisterPageService.sendAgreementEmail(dataItem),
    createApprovalStep: async (dataItem: any) => RequestRegisterPageService.createApprovalStep(dataItem),
    updateApprovalStep: async (dataItem: any) => RequestRegisterPageService.updateApprovalStep(dataItem),
    createApprovalLog: async (dataItem: any) => RequestRegisterPageService.createApprovalLog(dataItem),
    updateCcEmails: async (dataItem: any) => RequestRegisterPageService.updateCcEmails(dataItem),
    saveGprForm: async (dataItem: any) => RequestRegisterPageService.saveGprForm(dataItem),
    saveGprCNotification: async (dataItem: any) => RequestRegisterPageService.saveGprCNotification(dataItem),
    gprCGetFlow: async (dataItem: any) => RequestRegisterPageService.gprCGetFlow(dataItem),
    gprCSubmitSetup: async (dataItem: any) => RequestRegisterPageService.gprCSubmitSetup(dataItem),
}
