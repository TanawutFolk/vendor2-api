import { ImportFeeController } from '@src/_workspace/controllers/cost-condition/ImportFeeController'
import { Router } from 'express'

const importFeeRoutes = Router()

importFeeRoutes.post('/search', ImportFeeController.search)
importFeeRoutes.post('/create', ImportFeeController.create)
importFeeRoutes.post('/getByFiscalYear_MasterDataLatest', ImportFeeController.getByFiscalYear_MasterDataLatest)

export default importFeeRoutes
