import { StandardCostExportService } from '@services/sct/StandardCostExportService'

export const StandardCostExportModel = {
  search: async (dataItem: any) => await StandardCostExportService.search(dataItem),
  searchByProductTypeId: async (dataItem: any) => await StandardCostExportService.searchByProductTypeId(dataItem),
  getSctData: async (dataItem: any) => await StandardCostExportService.getSctData(dataItem),
  //getSCTPricingBySctIdAndSctCompareId: async (dataItem: any) => await StandardCostExportService.getSCTPricingBySctIdAndSctCompareId(dataItem),
  getSubByProductTypeId: async (dataItem: any) => StandardCostExportService.getSubByProductTypeId(dataItem),
  //getSctDataByProductTypeId: async (dataItem: any) => StandardCostExportService.getSctDataByProductTypeId(dataItem),
}
