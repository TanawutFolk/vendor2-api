import { OrderTypeController } from '@src/_workspace/controllers/production-control/OrderTypeController'
import { Router } from 'express'

const orderTypeRoutes = Router()

orderTypeRoutes.post('/search', OrderTypeController.search)
orderTypeRoutes.post('/create', OrderTypeController.create)
orderTypeRoutes.post('/delete', OrderTypeController.delete)
orderTypeRoutes.post('/update', OrderTypeController.update)

export default orderTypeRoutes
