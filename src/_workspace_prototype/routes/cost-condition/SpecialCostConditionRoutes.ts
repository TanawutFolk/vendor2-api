import { SpecialCostConditionController } from '@src/_workspace/controllers/cost-condition/SpecialCostConditionController'
import { Router } from 'express'

const specialCostConditionRoutes = Router()

specialCostConditionRoutes.post('/search', SpecialCostConditionController.search)
specialCostConditionRoutes.post('/create', SpecialCostConditionController.create)

specialCostConditionRoutes.post('/getAdjustPrice', SpecialCostConditionController.getAdjustPrice)
specialCostConditionRoutes.post(
  '/getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo',
  SpecialCostConditionController.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo
)
specialCostConditionRoutes.post(
  '/getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest',
  SpecialCostConditionController.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest
)
export default specialCostConditionRoutes
