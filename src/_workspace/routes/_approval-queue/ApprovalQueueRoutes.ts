import { Router } from 'express'
import { ApprovalQueueController } from '@src/_workspace/controllers/_approval-queue/ApprovalQueueController'

const approvalQueueRoutes = Router()

approvalQueueRoutes.post('/getById', ApprovalQueueController.getById)
approvalQueueRoutes.post('/searchRequest', ApprovalQueueController.getAll)
approvalQueueRoutes.post('/updateStatus', ApprovalQueueController.updateStatus)
approvalQueueRoutes.post('/getStatusOptions', ApprovalQueueController.getStatusOptions)
approvalQueueRoutes.post('/reassign', ApprovalQueueController.reassign)

export default approvalQueueRoutes
