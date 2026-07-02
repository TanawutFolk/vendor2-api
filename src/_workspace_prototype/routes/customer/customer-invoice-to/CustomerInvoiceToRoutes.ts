import { CustomerInvoiceToController } from '@src/_workspace/controllers/customer/customer-invoice-to/CustomerInvoiceToController'
import { Router } from 'express'
const customerInvoiceToRoutes = Router()

customerInvoiceToRoutes.post('/search', CustomerInvoiceToController.search)

customerInvoiceToRoutes.post('/create', CustomerInvoiceToController.create)

customerInvoiceToRoutes.patch('/update', CustomerInvoiceToController.update)

customerInvoiceToRoutes.delete('/delete', CustomerInvoiceToController.delete)

customerInvoiceToRoutes.post('/getByLikeCustomerInvoiceToName', CustomerInvoiceToController.getByLikeCustomerInvoiceToName)
customerInvoiceToRoutes.post('/getByLikeCustomerInvoiceToAlphabet', CustomerInvoiceToController.getByLikeCustomerInvoiceToAlphabet)

export default customerInvoiceToRoutes
