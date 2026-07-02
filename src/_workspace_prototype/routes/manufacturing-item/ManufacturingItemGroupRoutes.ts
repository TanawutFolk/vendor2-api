import { ManufacturingItemGroupController } from '@src/_workspace/controllers/manufacturing-item/ManufacturingItemGroupController'
import { Router } from 'express'

const manufacturingItemGroupRoutes = Router()

manufacturingItemGroupRoutes.post('/search', ManufacturingItemGroupController.search)
manufacturingItemGroupRoutes.post('/create', ManufacturingItemGroupController.create)
manufacturingItemGroupRoutes.post('/delete', ManufacturingItemGroupController.delete)
manufacturingItemGroupRoutes.post('/update', ManufacturingItemGroupController.update)

export default manufacturingItemGroupRoutes
