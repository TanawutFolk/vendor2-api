import { YieldRateGoStraightRateTotalForSctController } from '@src/_workspace/controllers/yield-rate/YieldRateGoStraightRateTotalForSctController'
import { Router } from 'express'

const YieldRateGoStraightRateTotalForSctRoutes = Router()

YieldRateGoStraightRateTotalForSctRoutes.post('/search', YieldRateGoStraightRateTotalForSctController.search)
YieldRateGoStraightRateTotalForSctRoutes.post(
  '/getByProductTypeIdAndFiscalYear_MasterDataLatest',
  YieldRateGoStraightRateTotalForSctController.getByProductTypeIdAndFiscalYear_MasterDataLatest
)
YieldRateGoStraightRateTotalForSctRoutes.post(
  '/getByProductTypeIdAndFiscalYearAndRevisionNo',
  YieldRateGoStraightRateTotalForSctController.getByProductTypeIdAndFiscalYearAndRevisionNo
)

export default YieldRateGoStraightRateTotalForSctRoutes
