import { YieldRateGoStraightRateProcessForSctController } from '@src/_workspace/controllers/yield-rate/YieldRateGoStraightRateProcessForSctController'
import { Router } from 'express'

const YieldRateGoStraightRateProcessForSctRoutes = Router()

YieldRateGoStraightRateProcessForSctRoutes.post(
  '/getByProductTypeIdAndFiscalYear_MasterDataLatest',
  YieldRateGoStraightRateProcessForSctController.getByProductTypeIdAndFiscalYear_MasterDataLatest
)
YieldRateGoStraightRateProcessForSctRoutes.post(
  '/getByProductTypeIdAndFiscalYearAndRevisionNo',
  YieldRateGoStraightRateProcessForSctController.getByProductTypeIdAndFiscalYearAndRevisionNo
)

export default YieldRateGoStraightRateProcessForSctRoutes
