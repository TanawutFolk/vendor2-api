import { Router } from 'express'
import { RequestRegisterPageController } from '@src/_workspace/controllers/_request-register/RequestRegisterPageController'
import { uploadRequestDocuments, uploadSingleRequestDocument } from '../_shared/requestDocumentUpload'

const requestRegisterPageRoutes = Router()

requestRegisterPageRoutes.post('/dropdown/business-categories', RequestRegisterPageController.getBusinessCategories)
requestRegisterPageRoutes.post('/dropdown/currencies', RequestRegisterPageController.getCurrencies)
requestRegisterPageRoutes.post('/createRequestVendor', uploadRequestDocuments, RequestRegisterPageController.create)
requestRegisterPageRoutes.post('/updateRequest', RequestRegisterPageController.updateRequest)
requestRegisterPageRoutes.post('/sendAgreementEmail', RequestRegisterPageController.sendAgreementEmail)
requestRegisterPageRoutes.post('/createApprovalStep', RequestRegisterPageController.createApprovalStep)
requestRegisterPageRoutes.post('/updateApprovalStep', RequestRegisterPageController.updateApprovalStep)
requestRegisterPageRoutes.post('/updateCcEmails', RequestRegisterPageController.updateCcEmails)
requestRegisterPageRoutes.post('/saveGprForm', RequestRegisterPageController.saveGprForm)
requestRegisterPageRoutes.post('/saveGprCNotification', RequestRegisterPageController.saveGprCNotification)
requestRegisterPageRoutes.post('/gpr-c/get-flow', RequestRegisterPageController.gprCGetFlow)
requestRegisterPageRoutes.post('/gpr-c/submit-setup', RequestRegisterPageController.gprCSubmitSetup)
requestRegisterPageRoutes.post('/addDocument', uploadSingleRequestDocument, RequestRegisterPageController.addDocument)
requestRegisterPageRoutes.post('/downloadSelectionDocument', RequestRegisterPageController.downloadSelectionDocument)
requestRegisterPageRoutes.post('/deleteSelectionDocument', RequestRegisterPageController.deleteSelectionDocument)

export default requestRegisterPageRoutes
