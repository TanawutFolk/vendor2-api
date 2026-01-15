import { SctTotalCostController } from '@src/_workspace/controllers/sct/sct-for-product/SctTotalCostController'
import { Router } from 'express'

const SctTotalCostRoutes = Router()

SctTotalCostRoutes.post('/getBySctId', SctTotalCostController.getBySctId)

export default SctTotalCostRoutes
