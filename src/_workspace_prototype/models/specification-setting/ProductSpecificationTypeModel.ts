import { ProductSpecificationTypeService } from '@services/specification-setting/ProductSpecificationTypeService'

export const ProductSpecificationTypeModel = {
  // search: async dataItem => SpecificationSettingService.search(dataItem),
  // create: async dataItem => SpecificationSettingService.create(dataItem),
  // update: async dataItem => SpecificationSettingService.update(dataItem),
  // delete: async dataItem => SpecificationSettingService.delete(dataItem),
  getByLikeProductSpecificationTypeAndInuse: async (dataItem: any) => ProductSpecificationTypeService.getByLikeProductSpecificationTypeAndInuse(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async dataItem => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
