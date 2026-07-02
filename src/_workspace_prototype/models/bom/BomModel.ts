import { BomService } from '@src/_workspace/services/bom/BomService'

export const BomModel = {
  search: async (dataItem: any) => BomService.search(dataItem),
  getByLikeBomNameAndInuse: async (dataItem: any) => BomService.getByLikeBomNameAndInuse(dataItem),
  searchBomDetailsByBomId: async (dataItem: any) => BomService.searchBomDetailsByBomId(dataItem),
  searchBomDetailsByBomIdAndProductTypeId: async (dataItem: any) => BomService.searchBomDetailsByBomIdAndProductTypeId(dataItem),
  create: async (dataItem: any) => BomService.create(dataItem),
  update: async (dataItem: any) => BomService.update(dataItem),
  updateBomProductType: async (dataItem: any) => BomService.updateBomProductType(dataItem),
  createFlowFromCreateBom: async (dataItem: any) => BomService.createFlowFromCreateBom(dataItem),
  Delete: async (dataItem: any) => BomService.Delete(dataItem),
  getBomDetailByBomId: async (dataItem: any) => BomService.getBomDetailByBomId(dataItem),
  getBomByLikeProductTypeIdAndCondition: async (dataItem: any) => BomService.getBomByLikeProductTypeIdAndCondition(dataItem),
  getByBomNameAndProductMainIdAndInuse: async (dataItem: any) => BomService.getByBomNameAndProductMainIdAndInuse(dataItem),
  getByBomCodeAndProductMainIdAndInuse: async (dataItem: any) => BomService.getByBomCodeAndProductMainIdAndInuse(dataItem),
  getItemCodeForSupportMes: async (dataItem: any) => BomService.getItemCodeForSupportMes(dataItem),
  getByLikeBomCodeAndProductMainIdAndInuse: async (dataItem: any) => BomService.getByLikeBomCodeAndProductMainIdAndInuse(dataItem),
  getBOMNameByLike: async (dataItem: any) => BomService.getBOMNameByLike(dataItem),
  getBOMCodeByLike: async (dataItem: any) => BomService.getBOMCodeByLike(dataItem),
  getByLikeBomCodeAndInuse: async (dataItem: any) => BomService.getByLikeBomCodeAndInuse(dataItem),
}
