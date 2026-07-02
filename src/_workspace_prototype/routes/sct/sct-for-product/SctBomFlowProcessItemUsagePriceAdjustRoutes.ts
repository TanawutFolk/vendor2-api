import { SctBomFlowProcessItemUsagePriceAdjustController } from '@src/_workspace/controllers/sct/sct-for-product/SctBomFlowProcessItemUsagePriceAdjustController'
import { Router } from 'express'

const SctBomFlowProcessItemUsagePriceAdjustRoutes = Router()

SctBomFlowProcessItemUsagePriceAdjustRoutes.post('/getBySctId', SctBomFlowProcessItemUsagePriceAdjustController.getBySctId)

export default SctBomFlowProcessItemUsagePriceAdjustRoutes
