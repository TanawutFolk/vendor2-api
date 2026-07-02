import { ProductMainService } from '@src/_workspace/services/product-group/product-main/ProductMainService'

export const ProductMainModel = {
  search: async (dataItem: any) => ProductMainService.search(dataItem),
  getByLikeProductMainNameAndInuse: async (dataItem: any) => ProductMainService.getByLikeProductMainNameAndInuse(dataItem),
  getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem: any) => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
  create: async (dataItem: any) => ProductMainService.create(dataItem),
  update: async (dataItem: any) => ProductMainService.update(dataItem),
  delete: async (dataItem: any) => ProductMainService.delete(dataItem),
  getProductMainByLikeProductMainNameAndInuse: async (dataItem: any) => ProductMainService.getProductMainByLikeProductMainNameAndInuse(dataItem),
}
