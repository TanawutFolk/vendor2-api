import { YieldRateController } from '@src/_workspace/controllers/yield-rate/YieldRateController'
import { Router } from 'express'

const yieldRateRoutes = Router()

yieldRateRoutes.post('/search', YieldRateController.search)

export default yieldRateRoutes
