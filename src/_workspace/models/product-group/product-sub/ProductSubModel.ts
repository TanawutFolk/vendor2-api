import { ProductSubService } from '@src/_workspace/services/product-group/product-sub/ProductSubService'

export const ProductSubModel = {
  search: async (dataItem: any) => ProductSubService.search(dataItem),
  getByLikeProductSubNameAndInuse: async (dataItem: any) => ProductSubService.getByLikeProductSubNameAndInuse(dataItem),
  getByLikeProductSubNameAndProductMainIdAndInuse: async (dataItem: any) => ProductSubService.getByLikeProductSubNameAndProductMainIdAndInuse(dataItem),
  getByLikeProductSubNameAndProductCategoryIdAndInuse: async (dataItem: any) => ProductSubService.getByLikeProductSubNameAndProductCategoryIdAndInuse(dataItem),
  create: async (dataItem: any) => ProductSubService.create(dataItem),
  update: async (dataItem: any) => ProductSubService.update(dataItem),
  delete: async (dataItem: any) => ProductSubService.delete(dataItem),
}
