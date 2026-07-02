import { DirectCostConditionService } from '@src/_workspace/services/cost-condition/cost-conditionNew/DirectCostConditionService'

export const DirectCostConditionModel = {
  search: async (query: any) => DirectCostConditionService.search(query),
  create: async (query: any) => DirectCostConditionService.create(query),
  getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest: async (dataItem: any) =>
    DirectCostConditionService.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem),
  getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo: async (dataItem: any) =>
    DirectCostConditionService.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem),
}
