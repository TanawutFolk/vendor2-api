import { Router } from 'express'
import { RequestHistoryController } from '@src/_workspace/controllers/_request-history/RequestHistoryController'

const requestHistoryRoutes = Router()

requestHistoryRoutes.post('/getById', RequestHistoryController.getById)
requestHistoryRoutes.post('/getApprovalSteps', RequestHistoryController.getApprovalSteps)
requestHistoryRoutes.post('/getApprovalLogs', RequestHistoryController.getApprovalLogs)
requestHistoryRoutes.post('/resolveEmployeeProfile', RequestHistoryController.resolveEmployeeProfile)
requestHistoryRoutes.post('/getGprCProducts', RequestHistoryController.getGprCProducts)
requestHistoryRoutes.post('/getGprCSections', RequestHistoryController.getGprCSections)
requestHistoryRoutes.post('/getSelectionForm', RequestHistoryController.getSelectionForm)

// Compatibility alias used by the current frontend.
requestHistoryRoutes.post('/getSelectionSheet', RequestHistoryController.getSelectionForm)

export default requestHistoryRoutes
