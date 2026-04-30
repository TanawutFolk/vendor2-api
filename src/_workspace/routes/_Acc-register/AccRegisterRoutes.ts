import { Router } from 'express'
import { AccRegisterController } from '@src/_workspace/controllers/_Acc-register/AccRegisterController'

const accRegisterRoutes = Router()

accRegisterRoutes.post('/completeRegistration', AccRegisterController.completeRegistration)

export default accRegisterRoutes
