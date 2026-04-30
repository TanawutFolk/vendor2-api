import { Router } from 'express'
import { GprCApprovalController } from '@src/_workspace/controllers/_approval-GPRC/GprCApprovalController'

const gprCApprovalRoutes = Router()

gprCApprovalRoutes.post('/gpr-c/approve-step', GprCApprovalController.gprCApproveStep)
gprCApprovalRoutes.post('/gpr-c/reject-step', GprCApprovalController.gprCRejectStep)
gprCApprovalRoutes.post('/gpr-c/action-required', GprCApprovalController.gprCActionRequired)
gprCApprovalRoutes.post('/gpr-c/record-action-result', GprCApprovalController.gprCRecordActionResult)
gprCApprovalRoutes.post('/gpr-c/queue', GprCApprovalController.gprCQueue)
gprCApprovalRoutes.post('/gpr-c/action-required-queue', GprCApprovalController.gprCActionRequiredQueue)

export default gprCApprovalRoutes
