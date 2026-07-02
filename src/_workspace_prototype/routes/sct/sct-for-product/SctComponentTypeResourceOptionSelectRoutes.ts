import { SctComponentTypeResourceOptionSelectController } from '@src/_workspace/controllers/sct/sct-for-product/SctComponentTypeResourceOptionSelectController'
import { Router } from 'express'

const SctComponentTypeResourceOptionSelectRoutes = Router()

SctComponentTypeResourceOptionSelectRoutes.post('/getBySctId', SctComponentTypeResourceOptionSelectController.getBySctId)

export default SctComponentTypeResourceOptionSelectRoutes
