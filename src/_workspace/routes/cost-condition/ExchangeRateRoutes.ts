import { ExchangeRateController } from '@src/_workspace/controllers/cost-condition/ExchangeRateController'
import { Router } from 'express'

const exchangeRateRoutes = Router()

exchangeRateRoutes.get('/getCurrency', ExchangeRateController.getCurrency)
exchangeRateRoutes.get('/search', ExchangeRateController.search)
exchangeRateRoutes.post('/search', ExchangeRateController.search)
exchangeRateRoutes.post('/create', ExchangeRateController.create)

export default exchangeRateRoutes
