import { YieldRateMaterialController } from '@src/_workspace/controllers/yield-rate/YieldRateMaterialController'
import { Router } from 'express'

const yieldRateMaterialRoutes = Router()

yieldRateMaterialRoutes.post('/search', YieldRateMaterialController.search)

export default yieldRateMaterialRoutes
