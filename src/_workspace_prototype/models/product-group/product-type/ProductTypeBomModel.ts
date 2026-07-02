import { ProductTypeBomService } from '@src/_workspace/services/product-group/product-type/ProductTypeBomService'

export const ProductTypeBomModel = {
  getBomByLikeProductTypeId: async (dataItem: any) => ProductTypeBomService.getBomByLikeProductTypeId(dataItem),
  exportToFile: async (dataItem: any) => await ProductTypeBomService.exportToFile(dataItem),
  searchProductTypeBOMAllPage: async (dataItem: any) => ProductTypeBomService.searchProductTypeBOMAllPage(dataItem),
}
