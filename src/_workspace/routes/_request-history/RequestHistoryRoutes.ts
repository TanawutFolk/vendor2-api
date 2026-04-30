import { Router } from 'express'
import { RequestHistoryController } from '@src/_workspace/controllers/_request-history/RequestHistoryController'

const requestHistoryRoutes = Router()

requestHistoryRoutes.post('/getById', RequestHistoryController.getById)
requestHistoryRoutes.post('/getApprovalSteps', RequestHistoryController.getApprovalSteps)
requestHistoryRoutes.post('/getApprovalLogs', RequestHistoryController.getApprovalLogs)
requestHistoryRoutes.post('/resolveEmployeeProfile', RequestHistoryController.resolveEmployeeProfile)
requestHistoryRoutes.post('/getGprForm', RequestHistoryController.getGprForm)

export default requestHistoryRoutes
