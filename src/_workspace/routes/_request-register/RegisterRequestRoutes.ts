import { Router } from 'express'
import { RequestRegisterPageController } from '@src/_workspace/controllers/_request-register/RequestRegisterPageController'
import { uploadRequestDocuments, uploadSingleRequestDocument } from '../_shared/requestDocumentUpload'

const requestRegisterRoutes = Router()

requestRegisterRoutes.post('/createRequestVendor', uploadRequestDocuments, RequestRegisterPageController.create)
requestRegisterRoutes.post('/updateRequest', RequestRegisterPageController.updateRequest)
requestRegisterRoutes.post('/sendAgreementEmail', RequestRegisterPageController.sendAgreementEmail)
requestRegisterRoutes.post('/createApprovalStep', RequestRegisterPageController.createApprovalStep)
requestRegisterRoutes.post('/updateApprovalStep', RequestRegisterPageController.updateApprovalStep)
requestRegisterRoutes.post('/updateCcEmails', RequestRegisterPageController.updateCcEmails)
requestRegisterRoutes.post('/saveGprForm', RequestRegisterPageController.saveGprForm)
requestRegisterRoutes.post('/saveGprCNotification', RequestRegisterPageController.saveGprCNotification)
requestRegisterRoutes.post('/gpr-c/get-flow', RequestRegisterPageController.gprCGetFlow)
requestRegisterRoutes.post('/gpr-c/submit-setup', RequestRegisterPageController.gprCSubmitSetup)
requestRegisterRoutes.post('/addDocument', uploadSingleRequestDocument, RequestRegisterPageController.addDocument)

export default requestRegisterRoutes
