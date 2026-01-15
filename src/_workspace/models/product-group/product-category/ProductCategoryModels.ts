import { ProductCategoryService } from '@src/_workspace/services/product-group/product-category/ProductCategoryService'

export const ProductCategoryModel = {
  search: async (dataItem: any) => ProductCategoryService.search(dataItem),
  getByLikeProductCategoryNameAndInuse: async (dataItem: any) => ProductCategoryService.getByLikeProductCategoryNameAndInuse(dataItem),
  create: async (dataItem: any) => ProductCategoryService.create(dataItem),
  update: async (dataItem: any) => ProductCategoryService.update(dataItem),
  delete: async (dataItem: any) => ProductCategoryService.delete(dataItem),
}
