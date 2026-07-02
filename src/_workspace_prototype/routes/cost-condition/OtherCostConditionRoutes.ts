import { OtherCostConditionController } from '@src/_workspace/controllers/cost-condition/OtherCostConditionController'
import { Router } from 'express'

const otherCostConditionRoutes = Router()

otherCostConditionRoutes.post('/search', OtherCostConditionController.search)
otherCostConditionRoutes.post('/create', OtherCostConditionController.create)
otherCostConditionRoutes.post(
  '/getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo',
  OtherCostConditionController.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo
)
otherCostConditionRoutes.post(
  '/getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest',
  OtherCostConditionController.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest
)
export default otherCostConditionRoutes
