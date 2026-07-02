import { CustomerOrderFromController } from '@src/_workspace/controllers/customer/customer-order-from/CustomerOrderFromController'
import { Router } from 'express'

const customerOrderFromRoutes = Router()

customerOrderFromRoutes.post('/search', CustomerOrderFromController.search)

customerOrderFromRoutes.post('/create', CustomerOrderFromController.create)

customerOrderFromRoutes.patch('/update', CustomerOrderFromController.update)

customerOrderFromRoutes.delete('/delete', CustomerOrderFromController.delete)

customerOrderFromRoutes.get('/getByLikeCustomerOrderFromNameAndInuse', CustomerOrderFromController.GetByLikeCustomerOrderFromNameAndInuse)

export default customerOrderFromRoutes
