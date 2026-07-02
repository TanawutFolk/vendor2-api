import { CustomerShipToController } from '@src/_workspace/controllers/customer/customer-ship-to/CustomerShipToController'
import { Router } from 'express'

const customerShipToRoutes = Router()

customerShipToRoutes.post('/search', CustomerShipToController.search)

customerShipToRoutes.post('/create', CustomerShipToController.create)

customerShipToRoutes.patch('/update', CustomerShipToController.update)

customerShipToRoutes.delete('/delete', CustomerShipToController.delete)

export default customerShipToRoutes
