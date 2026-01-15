import { SpecialCostConditionService } from '@src/_workspace/services/cost-condition/cost-conditionNew/SpecialCostConditionService'

export const SpecialCostConditionModel = {
  search: async (query: any) => SpecialCostConditionService.search(query),
  create: async (query: any) => SpecialCostConditionService.create(query),
  getAdjustPrice: async (dataItem: any) => SpecialCostConditionService.getAdjustPrice(dataItem),
  getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest: async (dataItem: any) =>
    SpecialCostConditionService.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem),
  getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo: async (dataItem: any) =>
    SpecialCostConditionService.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem),
}
