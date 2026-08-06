import { StatusMasterController } from '@src/_workspace/controllers/_status-master/StatusMasterController'
import { Router } from 'express'

const statusMasterRoutes = Router()

statusMasterRoutes.post('/getStatusMasters', StatusMasterController.getStatusMasters)

export default statusMasterRoutes
