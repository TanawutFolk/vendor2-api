import { RegisterRequestService } from '@src/_workspace/services/_find-vendor/RegisterRequestService'

export const RegisterRequestModel = {
    createRequest: async (dataItem: any) => RegisterRequestService.createRequest(dataItem),
    getAllRequests: async (dataItem?: any) => RegisterRequestService.getAllRequests(dataItem),
    getById: async (dataItem: any) => RegisterRequestService.getById(dataItem),
    updateStatus: async (dataItem: any) => RegisterRequestService.updateStatus(dataItem),
}
