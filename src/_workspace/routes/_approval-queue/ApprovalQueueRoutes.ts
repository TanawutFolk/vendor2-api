import { Router } from 'express'
import { ApprovalQueueController } from '@src/_workspace/controllers/_approval-queue/ApprovalQueueController'

const applyDefaultQueueStepCode = (defaultQueueStepCode?: string) => (req: any, _res: any, next: any) => {
  if (defaultQueueStepCode) {
    if (req.body && Object.entries(req.body).length > 0) {
      req.body.queue_step_code = req.body.queue_step_code || defaultQueueStepCode
    } else {
      req.query.queue_step_code = req.query.queue_step_code || defaultQueueStepCode
    }
  }
  next()
}

const createApprovalQueueRoutes = (defaultQueueStepCode?: string) => {
  const approvalQueueRoutes = Router()
  const defaultQueue = applyDefaultQueueStepCode(defaultQueueStepCode)

  approvalQueueRoutes.post('/getById', defaultQueue, ApprovalQueueController.getById)
  approvalQueueRoutes.post('/searchRequest', defaultQueue, ApprovalQueueController.getAll)
  approvalQueueRoutes.post('/updateStatus', defaultQueue, ApprovalQueueController.updateStatus)
  approvalQueueRoutes.get('/getStatusOptions', defaultQueue, ApprovalQueueController.getStatusOptions)
  approvalQueueRoutes.post('/reassign', defaultQueue, ApprovalQueueController.reassign)

  return approvalQueueRoutes
}

export default createApprovalQueueRoutes
