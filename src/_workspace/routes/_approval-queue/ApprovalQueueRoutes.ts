import { Router } from 'express'
import { ApprovalQueueController } from '@src/_workspace/controllers/_approval-queue/ApprovalQueueController'

const approvalQueueRoutes = Router()

approvalQueueRoutes.post('/getRequestDetail', ApprovalQueueController.getById)
approvalQueueRoutes.post('/searchRequest', ApprovalQueueController.getAll)
approvalQueueRoutes.post('/updateStatus', ApprovalQueueController.updateStatus)
approvalQueueRoutes.post('/getStatusOptions', ApprovalQueueController.getStatusOptions)
approvalQueueRoutes.post('/reassign', ApprovalQueueController.reassign)

// Compatibility alias for the previous plural route name.
approvalQueueRoutes.post('/getRequestDetails', ApprovalQueueController.getById)

export default approvalQueueRoutes
