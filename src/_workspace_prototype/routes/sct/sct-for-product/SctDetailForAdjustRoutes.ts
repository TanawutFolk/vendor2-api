import { SctDetailForAdjustController } from '@src/_workspace/controllers/sct/sct-for-product/SctDetailForAdjustController'
import { Router } from 'express'

const SctDetailForAdjustRoutes = Router()

SctDetailForAdjustRoutes.post('/getBySctId', SctDetailForAdjustController.getBySctId)

export default SctDetailForAdjustRoutes
