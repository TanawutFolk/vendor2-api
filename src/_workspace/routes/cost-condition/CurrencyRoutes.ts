import { CurrencyController } from '@src/_workspace/controllers/cost-condition/CurrencyController'
import { Router } from 'express'

const currencyRoutes = Router()

currencyRoutes.post('/getByInuse', CurrencyController.getByInuse)

export default currencyRoutes
