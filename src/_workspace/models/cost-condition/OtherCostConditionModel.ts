import { OtherCostConditionService } from '@src/_workspace/services/cost-condition/cost-conditionNew/OtherCostConditionService'

export const OtherCostConditionModel = {
  search: async (query: any) => OtherCostConditionService.search(query),
  create: async (query: any) => OtherCostConditionService.create(query),
  getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest: async (dataItem: any) =>
    OtherCostConditionService.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem),
  getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo: async (dataItem: any) =>
    OtherCostConditionService.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem),
}
