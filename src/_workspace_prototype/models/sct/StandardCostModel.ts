import { StandardCostService } from '@src/_workspace/services/sct/StandardCostService'

export const StandardCostModel = {
  getByLikeSctPatternName: async (dataItem: any) => StandardCostService.getByLikeSctPatternName(dataItem),
  getSctByLikeProductTypeIdAndCondition: async (dataItem: any) => StandardCostService.getSctByLikeProductTypeIdAndCondition(dataItem),
  getByLikeSctReasonSettingNameAndInuse: async (dataItem: any) => StandardCostService.getByLikeSctReasonSettingNameAndInuse(dataItem),
  getByLikeSctTagSettingNameAndInuse: async (dataItem: any) => StandardCostService.getByLikeSctTagSettingNameAndInuse(dataItem),
  searchSctCodeForSelection: async (dataItem: any) => StandardCostService.searchSctCodeForSelection(dataItem),
  searchProductSubBySctNo: async (dataItem: any) => StandardCostService.searchProductSubBySctNo(dataItem),
  searchMaterialPackingAndRawMatBySctNo: async (dataItem: any) => StandardCostService.searchMaterialPackingAndRawMatBySctNo(dataItem),
  searchSctCodeForSelectionMaterialPrice: async (dataItem: any) => StandardCostService.searchSctCodeForSelectionMaterialPrice(dataItem),
  get: async (dataItem: any) => StandardCostService.get(dataItem),
}
