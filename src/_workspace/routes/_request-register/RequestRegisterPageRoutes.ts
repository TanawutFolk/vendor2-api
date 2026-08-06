import { Router } from 'express'
import { RequestRegisterPageController } from '@src/_workspace/controllers/_request-register/RequestRegisterPageController'
import { uploadRequestDocuments, uploadSingleRequestDocument } from '../_shared/requestDocumentUpload'

const requestRegisterPageRoutes = Router()

requestRegisterPageRoutes.post('/getBusinessCategories', RequestRegisterPageController.getBusinessCategories)
requestRegisterPageRoutes.post('/getCurrencies', RequestRegisterPageController.getCurrencies)
requestRegisterPageRoutes.post('/createRequestVendor', uploadRequestDocuments, RequestRegisterPageController.create)
requestRegisterPageRoutes.post('/updateRequest', RequestRegisterPageController.updateRequest)
requestRegisterPageRoutes.post('/sendAgreementEmail', RequestRegisterPageController.sendMail_ToSupplier_RequestFormA)
requestRegisterPageRoutes.post('/createApprovalStep', RequestRegisterPageController.createApprovalStep)
requestRegisterPageRoutes.post('/updateApprovalStep', RequestRegisterPageController.updateApprovalStep)
requestRegisterPageRoutes.post('/updateCcEmails', RequestRegisterPageController.updateCcEmails)
requestRegisterPageRoutes.post('/saveSelectionForm', RequestRegisterPageController.saveSelectionForm)
requestRegisterPageRoutes.post('/saveAccountVendorCode', RequestRegisterPageController.saveAccountVendorCode)
requestRegisterPageRoutes.post('/saveGprCNotification', RequestRegisterPageController.saveGprCNotification)
requestRegisterPageRoutes.post('/getGprCFlow', RequestRegisterPageController.gprCGetFlow)
requestRegisterPageRoutes.post('/submitGprCSetup', RequestRegisterPageController.gprCSubmitSetup)
requestRegisterPageRoutes.post('/addDocument', uploadSingleRequestDocument, RequestRegisterPageController.addDocument)
requestRegisterPageRoutes.post('/downloadSelectionDocument', RequestRegisterPageController.downloadSelectionDocument)
// GET variant so managed files (e.g. 02.Request Documents) can be opened directly via a URL.
requestRegisterPageRoutes.get('/downloadSelectionDocument', RequestRegisterPageController.downloadSelectionDocument)
requestRegisterPageRoutes.post('/deleteSelectionDocument', RequestRegisterPageController.deleteSelectionDocument)

// Compatibility aliases used by the current frontend.
requestRegisterPageRoutes.post('/dropdown/business-categories', RequestRegisterPageController.getBusinessCategories)
requestRegisterPageRoutes.post('/dropdown/currencies', RequestRegisterPageController.getCurrencies)
requestRegisterPageRoutes.post('/gpr-c/get-flow', RequestRegisterPageController.gprCGetFlow)
requestRegisterPageRoutes.post('/gpr-c/submit-setup', RequestRegisterPageController.gprCSubmitSetup)

export default requestRegisterPageRoutes
