import { ProcessController } from '@src/_workspace/controllers/process/ProcessController'
import { Router } from 'express'

const ProcessRoutes = Router()

ProcessRoutes.get('/getAllProcessInProductMain', ProcessController.getAllProcessInProductMain)
ProcessRoutes.post('/getAllProcessInProductMain', ProcessController.getAllProcessInProductMain)

export default ProcessRoutes
