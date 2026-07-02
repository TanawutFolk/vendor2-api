import { SctBomFlowProcessItemUsagePriceController } from '@src/_workspace/controllers/sct/sct-for-product/SctBomFlowProcessItemUsagePriceController'
import { Router } from 'express'

const SctBomFlowProcessItemUsagePriceRoutes = Router()

SctBomFlowProcessItemUsagePriceRoutes.post('/getBySctId', SctBomFlowProcessItemUsagePriceController.getBySctId)

export default SctBomFlowProcessItemUsagePriceRoutes
