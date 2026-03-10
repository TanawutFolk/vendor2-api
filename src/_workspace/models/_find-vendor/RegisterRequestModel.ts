import { RegisterRequestService } from '@src/_workspace/services/_find-vendor/RegisterRequestService'

export const RegisterRequestModel = {
    createRequest: async (dataItem: any) => RegisterRequestService.createRequest(dataItem),
    createDocument: async (dataItem: any) => RegisterRequestService.createDocument(dataItem),
    getAllRequests: async (dataItem?: any, sqlWhere: string = '') => RegisterRequestService.getAllRequests(dataItem, sqlWhere),
    getById: async (dataItem: any) => RegisterRequestService.getById(dataItem),
    updateStatus: async (dataItem: any) => RegisterRequestService.updateStatus(dataItem),
    sendAgreementEmail: async (dataItem: any) => RegisterRequestService.sendAgreementEmail(dataItem),
}
