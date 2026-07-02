import { BoiUnitService } from '@services/boi/BoiUnitService'

export const BoiUnitModel = {
  search: async (dataItem: any) => BoiUnitService.search(dataItem),
  create: async (dataItem: any) => BoiUnitService.create(dataItem),
  update: async (dataItem: any) => BoiUnitService.update(dataItem),
  delete: async (dataItem: any) => BoiUnitService.delete(dataItem),
  getByLikeBoiUnitNameAndInuse: async (dataItem: any) => BoiUnitService.getByLikeBoiUnitNameAndInuse(dataItem),
  getByLikeBoiSymbolAndInuse: async (dataItem: any) => BoiUnitService.getByLikeBoiSymbolAndInuse(dataItem),
  GetByLikeBoiSymbol: async (dataItem: any) => BoiUnitService.GetByLikeBoiSymbol(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async dataItem => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
