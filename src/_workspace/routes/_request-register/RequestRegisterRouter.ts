import { Router } from 'express'
import accRegisterRoutes from '../_Acc-register/AccRegisterRoutes'
import gprCApprovalRoutes from '../_approval-GPRC/GprCApprovalRoutes'
import requestHistoryRoutes from '../_request-history/RequestHistoryRoutes'
import taskManagerRequestRoutes from '../_task-manager/TaskManagerRequestRoutes'
import requestRegisterPageRoutes from './RequestRegisterPageRoutes'

const requestRegisterRouter = Router()

requestRegisterRouter.use(requestRegisterPageRoutes)
requestRegisterRouter.use(requestHistoryRoutes)
requestRegisterRouter.use(accRegisterRoutes)
requestRegisterRouter.use(gprCApprovalRoutes)
requestRegisterRouter.use(taskManagerRequestRoutes)

export default requestRegisterRouter
