import { ProductionPurposeController } from '@src/_workspace/controllers/production-control/ProductionPurposeController'
import { Router } from 'express'

const productionPurposeRoutes = Router()

productionPurposeRoutes.get('/getByLikeProductionPurposeNameAndInuse', ProductionPurposeController.getByLikeProductionPurposeNameAndInuse)

export default productionPurposeRoutes
