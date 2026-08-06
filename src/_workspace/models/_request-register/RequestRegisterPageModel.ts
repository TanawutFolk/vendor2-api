import { RequestRegisterPageService } from '../../services/_request-register/RequestRegisterPageService'

export const RequestRegisterPageModel = {
  createRequest: async (dataItem: any) => RequestRegisterPageService.createRequest(dataItem),
  getBusinessCategories: async (dataItem: any = {}) => RequestRegisterPageService.getBusinessCategories(dataItem),
  getCurrencies: async (dataItem: any = {}) => RequestRegisterPageService.getCurrencies(dataItem),
  createDocument: async (dataItem: any) => RequestRegisterPageService.createDocument(dataItem),
  updateGprBFile: async (dataItem: any) => RequestRegisterPageService.updateGprBFile(dataItem),
  updateRequest: async (dataItem: any) => RequestRegisterPageService.updateRequest(dataItem),
  sendMail_ToSupplier_RequestFormA: async (dataItem: any) => RequestRegisterPageService.sendMail_ToSupplier_RequestFormA(dataItem),
  createApprovalStep: async (dataItem: any) => RequestRegisterPageService.createApprovalStep(dataItem),
  updateApprovalStep: async (dataItem: any) => RequestRegisterPageService.updateApprovalStep(dataItem),
  createApprovalLog: async (dataItem: any) => RequestRegisterPageService.createApprovalLog(dataItem),
  updateCcEmails: async (dataItem: any) => RequestRegisterPageService.updateCcEmails(dataItem),
  saveSelectionForm: async (dataItem: any) => RequestRegisterPageService.saveSelectionForm(dataItem),
  saveAccountVendorCode: async (dataItem: any) => RequestRegisterPageService.saveAccountVendorCode(dataItem),
  assertSelectionSheetEditable: async (requestId: number) => RequestRegisterPageService.assertSelectionSheetEditable(requestId),
  saveGprCNotification: async (dataItem: any) => RequestRegisterPageService.saveGprCNotification(dataItem),
  gprCGetFlow: async (dataItem: any) => RequestRegisterPageService.gprCGetFlow(dataItem),
  gprCSubmitSetup: async (dataItem: any) => RequestRegisterPageService.gprCSubmitSetup(dataItem),
  saveSelectionFileToReceiving: (
    requestNumber: string,
    sourcePath: string,
    criteriaNo: string,
    criteriaDetail: string,
    originalFileName: string,
  ) =>
    RequestRegisterPageService.saveSelectionFileToReceiving(
      requestNumber,
      sourcePath,
      criteriaNo,
      criteriaDetail,
      originalFileName,
    ),
  saveSelectionFileToSending: (
    requestNumber: string,
    sourcePath: string,
    originalFileName: string,
  ) => RequestRegisterPageService.saveSelectionFileToSending(requestNumber, sourcePath, originalFileName),
  saveGprBFileToReceiving: (
    requestNumber: string,
    sourcePath: string,
    originalFileName: string,
  ) => RequestRegisterPageService.saveGprBFileToReceiving(requestNumber, sourcePath, originalFileName),
  deleteSelectionFile: (filePath: string, fileName: string, requestNumber: string) =>
    RequestRegisterPageService.deleteSelectionFile(filePath, fileName, requestNumber),
  resolveSelectionDownloadPath: (filePath: string, fileName: string, requestNumber: string) =>
    RequestRegisterPageService.resolveSelectionDownloadPath(filePath, fileName, requestNumber),
  createCriteriaFile: (dataItem: any) => RequestRegisterPageService.createCriteriaFile(dataItem),
  getCriteriaFileForDelete: (requestId: number, criteriaFileId: number) =>
    RequestRegisterPageService.getCriteriaFileForDelete(requestId, criteriaFileId),
  softDeleteCriteriaFile: (criteriaFileId: number, updateBy: string) =>
    RequestRegisterPageService.softDeleteCriteriaFile(criteriaFileId, updateBy),
}
