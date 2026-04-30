import { Router } from 'express'
import accRegisterRoutes from '../_Acc-register/AccRegisterRoutes'
import gprCApprovalRoutes from '../_approval-GPRC/GprCApprovalRoutes'
import requestHistoryRoutes from '../_request-history/RequestHistoryRoutes'
import taskManagerRequestRoutes from '../_task-manager/TaskManagerRequestRoutes'
import requestRegisterRoutes from './RegisterRequestRoutes'

const registerRequestRoutes = Router()

registerRequestRoutes.use(requestRegisterRoutes)
registerRequestRoutes.use(requestHistoryRoutes)
registerRequestRoutes.use(accRegisterRoutes)
registerRequestRoutes.use(gprCApprovalRoutes)
registerRequestRoutes.use(taskManagerRequestRoutes)

export default registerRequestRoutes
