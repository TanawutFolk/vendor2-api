import { DirectCostConditionController } from '@src/_workspace/controllers/cost-condition/DirectCostConditionController'
import { Router } from 'express'

const directCostConditionRoutes = Router()

directCostConditionRoutes.post('/search', DirectCostConditionController.search)
directCostConditionRoutes.post('/create', DirectCostConditionController.create)
directCostConditionRoutes.post(
  '/getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo',
  DirectCostConditionController.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo
)
directCostConditionRoutes.post(
  '/getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest',
  DirectCostConditionController.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest
)
export default directCostConditionRoutes
