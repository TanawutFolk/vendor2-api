import { UnitOfMeasurementController } from '@src/_workspace/controllers/unit/unit-of-measurement/UnitOfMeasurementController'
import { Router } from 'express'

const unitOfMeasurementRoutes = Router()

unitOfMeasurementRoutes.get('/get', UnitOfMeasurementController.getUnit)

unitOfMeasurementRoutes.post('/search', UnitOfMeasurementController.searchUnit)

unitOfMeasurementRoutes.post('/create', UnitOfMeasurementController.createUnit)

unitOfMeasurementRoutes.patch('/update', UnitOfMeasurementController.updateUnit)

unitOfMeasurementRoutes.delete('/delete', UnitOfMeasurementController.deleteUnit)

unitOfMeasurementRoutes.get('/getByLikeUnitOfMeasurementName', UnitOfMeasurementController.getByLikeUnitOfMeasurementName)

unitOfMeasurementRoutes.get('/getByLikeSymbol', UnitOfMeasurementController.getByLikeSymbol)

export default unitOfMeasurementRoutes
