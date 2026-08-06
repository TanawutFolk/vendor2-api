// Express Imports
import { Router } from 'express'

// Routes Imports
import commonRoutes from './routes/Common/CommonRoute'
import addVendorRoutes from './routes/_add-vendor/AddVendorRoutes'
import accRegisterRoutes from './routes/_Acc-register/AccRegisterRoutes'
import gprCApprovalRoutes from './routes/_approval-GPRC/GprCApprovalRoutes'
import blacklistRoutes from './routes/_black-list/BlacklistRoute'
import findVendorRoutes from './routes/_find-vendor/FindVendorRoute'
import reRegisterRoutes from './routes/_re-register/ReRegisterRoute'
import approvalQueueRoutes from './routes/_approval-queue/ApprovalQueueRoutes'
import requestRegisterRouter from './routes/_request-register/RequestRegisterRouter'
import assigneesRoutes from './routes/_Employee-manager/AssigneesRoutes'
import taskManagerRequestRoutes from './routes/_task-manager/TaskManagerRequestRoutes'
import allRequestHistoryRoutes from './routes/_all-request-history/AllRequestHistoryRoutes'
import statusMasterRoutes from './routes/_status-master/StatusMasterRoutes'

const Routers = Router()

// ? Common Routes
Routers.use('/common', commonRoutes)

// ? Add Vendor Routes
Routers.use('/add-vendor', addVendorRoutes)

// ? Blacklist Routes
Routers.use('/black-list', blacklistRoutes)

// ? Find Vendor Routes
Routers.use('/find-vendor', findVendorRoutes)
Routers.use('/re-register', reRegisterRoutes)

// ? Register Request Routes
Routers.use('/register-request', requestRegisterRouter)

// ? Vendor Workflow Routes
Routers.use('/acc-register', accRegisterRoutes)
Routers.use('/approval-gprc', gprCApprovalRoutes)
Routers.use('/approval-queue', approvalQueueRoutes)
Routers.use('/task-manager', taskManagerRequestRoutes)
Routers.use('/all-request-history', allRequestHistoryRoutes)

// ? Status Master Routes
Routers.use('/status-master', statusMasterRoutes)

// ? Assignees Configuration Routes
Routers.use('/assignees', assigneesRoutes)

export default Routers
