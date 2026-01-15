import { IndirectCostConditionController } from '@src/_workspace/controllers/cost-condition/IndirectCostConditionController'
import { Router } from 'express'

const indirectCostConditionRoutes = Router()

indirectCostConditionRoutes.post('/search', IndirectCostConditionController.search)
indirectCostConditionRoutes.post('/create', IndirectCostConditionController.create)
indirectCostConditionRoutes.post(
  '/getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo',
  IndirectCostConditionController.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo
)
indirectCostConditionRoutes.post(
  '/getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest',
  IndirectCostConditionController.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest
)
export default indirectCostConditionRoutes
