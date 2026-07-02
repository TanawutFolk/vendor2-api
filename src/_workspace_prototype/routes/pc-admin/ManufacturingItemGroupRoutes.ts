import { Router } from 'express'

import { ManufacturingItemPriceController } from '../../controllers/pc-admin/ManufacturingItemPriceController'

const manufacturingItemPriceRoutes = Router()

manufacturingItemPriceRoutes.post('/create', ManufacturingItemPriceController.create)

export default manufacturingItemPriceRoutes
