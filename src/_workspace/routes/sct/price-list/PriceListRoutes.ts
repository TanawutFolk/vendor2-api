import { exportFile_new_template } from '@src/_workspace/controllers/sct/price-list/PriceListExportController'
import { Router } from 'express'

const PriceListRoutes = Router()

// PriceListRoutes.get('/yield-rate-material-export', GetPriceListExport)
// PriceListRoutes.post('/yield-rate-material-export', GetPriceListExport)

PriceListRoutes.get('/exportToFile-new-template', exportFile_new_template)
PriceListRoutes.post('/exportToFile-new-template', exportFile_new_template)

export default PriceListRoutes
