import { SctCompareController } from '@src/_workspace/controllers/sct/sct-for-product/SctCompareController'
import { Router } from 'express'

const SctCompareRoutes = Router()

SctCompareRoutes.post('/getBySctId', SctCompareController.getBySctId)

export default SctCompareRoutes
