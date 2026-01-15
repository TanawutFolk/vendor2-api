import { ClearTimeForSctTotalController } from '@src/_workspace/controllers/_ClearTimeSystem/ClearTimeForSctTotalController'
import { Router } from 'express'

const ClearTimeTotalForSctRoutes = Router()

// ClearTimeTotalForSctRoutes.post('/search', ClearTimeForSctTotalController.search)
ClearTimeTotalForSctRoutes.post('/getByProductTypeIdAndFiscalYear_MasterDataLatest', ClearTimeForSctTotalController.getByProductTypeIdAndFiscalYear_MasterDataLatest)
ClearTimeTotalForSctRoutes.post('/getByProductTypeIdAndFiscalYearAndRevisionNo', ClearTimeForSctTotalController.getByProductTypeIdAndFiscalYearAndRevisionNo)

export default ClearTimeTotalForSctRoutes
