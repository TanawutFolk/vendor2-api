import { ProductTypeNewService } from '@src/_workspace/services/product-group/product-type/ProductType_NewService'

export const ProductType_NewModel = {
  searchProductTypeList: async (dataItem: any) => ProductTypeNewService.searchProductTypeList(dataItem),
  search: async (dataItem: any) => ProductTypeNewService.search(dataItem),
  create: async (dataItem: any) => ProductTypeNewService.create(dataItem),
  getByProductTypeForCopy: async (dataItem: any) => ProductTypeNewService.getByProductTypeForCopy(dataItem),
  getByLikeProductTypeNameAndProductSubIdAndInuse: async (dataItem: any) => ProductTypeNewService.getByLikeProductTypeNameAndProductSubIdAndInuse(dataItem),
  getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods: async (dataItem: any) =>
    ProductTypeNewService.getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods(dataItem),
  getByProductTypeStatusWorkingAndInuse: async () => ProductTypeNewService.getByProductTypeStatusWorkingAndInuse(),
  getByLikeProductCategoryNameAndInuse: async (dataItem: any) => ProductTypeNewService.getByLikeProductCategoryNameAndInuse(dataItem),
  getByLikeProductTypeStatusWorkingNameAndInuse: async (dataItem: any) => ProductTypeNewService.getByLikeProductTypeStatusWorkingNameAndInuse(dataItem),
  getByProductGroup: async (dataItem: any) => ProductTypeNewService.getByProductGroup(dataItem),
  delete: async (dataItem: any) => ProductTypeNewService.delete(dataItem),
  update: async (dataItem: any) => ProductTypeNewService.update(dataItem),
  getProductTypeByProductGroup: async (dataItem: any) => ProductTypeNewService.getProductTypeByProductGroup(dataItem),
  getByLikeProductTypeNameAndProductCategoryIdAndInuse: async (dataItem: any) => ProductTypeNewService.getByLikeProductTypeNameAndProductCategoryIdAndInuse(dataItem),
  getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods: async (dataItem: any) =>
    ProductTypeNewService.getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods(dataItem),
  getByLikeProductTypeNameAndInuse: async (dataItem: any) => ProductTypeNewService.getByLikeProductTypeNameAndInuse(dataItem),
  getByLikeProductTypeNameAndInuseForPriceList: async (dataItem: any) => ProductTypeNewService.getByLikeProductTypeNameAndInuseForPriceList(dataItem),
  getByLikeProductTypeCodeAndInuse: async (dataItem: any) => ProductTypeNewService.getByLikeProductTypeCodeAndInuse(dataItem),
  getByLikeProductTypeNameAndProductMainIdAndInuse: async (dataItem: any) => ProductTypeNewService.getByLikeProductTypeNameAndProductMainIdAndInuse(dataItem),
  getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods: async (dataItem: any) =>
    ProductTypeNewService.getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods(dataItem),
  getByLikeProductTypeCodeAndProductMainIdAndInuse: async (dataItem: any) => ProductTypeNewService.getByLikeProductTypeCodeAndProductMainIdAndInuse(dataItem),
  getProductTypeByProductMainID: async (dataItem: any) => ProductTypeNewService.getProductTypeByProductMainID(dataItem),
  searchProductType: async (dataItem: any) => ProductTypeNewService.searchProductType(dataItem),
  searchProductTypeBySelected: async (dataItem: any) => ProductTypeNewService.searchProductTypeBySelected(dataItem),
  searchProductTypeAllPage: async (dataItem: any) => ProductTypeNewService.searchProductTypeAllPage(dataItem),
  createProductType: async (dataItem: any) => ProductTypeNewService.createProductType(dataItem),
  updateProductType: async (dataItem: any) => ProductTypeNewService.updateProductType(dataItem),
  deleteProductTypeAndItem: async (dataItem: any) => ProductTypeNewService.deleteProductTypeAndItem(dataItem),
}
