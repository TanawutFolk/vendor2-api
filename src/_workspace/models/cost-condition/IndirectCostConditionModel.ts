import { IndirectCostConditionService } from '@src/_workspace/services/cost-condition/cost-conditionNew/IndirectCostConditionService'

export const IndirectCostConditionModel = {
  search: async (query: any) => IndirectCostConditionService.search(query),
  create: async (query: any) => IndirectCostConditionService.create(query),
  getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest: async (dataItem: any) =>
    IndirectCostConditionService.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem),
  getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo: async (dataItem: any) =>
    IndirectCostConditionService.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem),
}
