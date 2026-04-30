import { RequestRegisterPageService } from '../../services/_request-register/RequestRegisterPageService'

export const RequestRegisterPageModel = {
    createRequest: RequestRegisterPageService.createRequest,
    createDocument: RequestRegisterPageService.createDocument,
    updateRequest: RequestRegisterPageService.updateRequest,
    sendAgreementEmail: RequestRegisterPageService.sendAgreementEmail,
    createApprovalStep: RequestRegisterPageService.createApprovalStep,
    updateApprovalStep: RequestRegisterPageService.updateApprovalStep,
    createApprovalLog: RequestRegisterPageService.createApprovalLog,
    updateCcEmails: RequestRegisterPageService.updateCcEmails,
    saveGprForm: RequestRegisterPageService.saveGprForm,
    saveGprCNotification: RequestRegisterPageService.saveGprCNotification,
    gprCGetFlow: RequestRegisterPageService.gprCGetFlow,
    gprCSubmitSetup: RequestRegisterPageService.gprCSubmitSetup,
}
