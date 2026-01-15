import { PurchaseModuleController } from '@src/_workspace/controllers/purchase-module/PurchaseModuleController'
import { Router } from 'express'

const purchaseModuleRoutes = Router()

purchaseModuleRoutes.get('/getByLikePurchaseModuleNameAndInuse', PurchaseModuleController.getByLikePurchaseModuleNameAndInuse)

export default purchaseModuleRoutes
