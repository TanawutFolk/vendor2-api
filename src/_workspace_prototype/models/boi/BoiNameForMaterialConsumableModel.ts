import { BoiNameForMaterialConsumableService } from '@src/_workspace/services/boi/BoiNameForMaterialConsumableService'

export const BoiNameForMaterialConsumableModel = {
  search: async (dataItem: any) => BoiNameForMaterialConsumableService.search(dataItem),
  create: async (dataItem: any) => BoiNameForMaterialConsumableService.create(dataItem),
  update: async (dataItem: any) => BoiNameForMaterialConsumableService.update(dataItem),
  delete: async (dataItem: any) => BoiNameForMaterialConsumableService.delete(dataItem),
  getByLikeBoiGroupNoAndInuse: async (dataItem: any) => BoiNameForMaterialConsumableService.getByLikeBoiGroupNoAndInuse(dataItem),
  getByLikeBoiSymbolAndInuse: async (dataItem: any) => BoiNameForMaterialConsumableService.getByLikeBoiSymbolAndInuse(dataItem),
  SearchWorkFlowStepBoiGroupNoForFetch: async (dataItem: any) => BoiNameForMaterialConsumableService.SearchWorkFlowStepBoiGroupNoForFetch(dataItem),
  SearchWorkFlowStepDescriptionMainNameForFetch: async (dataItem: any) => BoiNameForMaterialConsumableService.SearchWorkFlowStepDescriptionMainNameForFetch(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async dataItem => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
