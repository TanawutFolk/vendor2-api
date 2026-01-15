import { SpecificationSettingService } from '@services/specification-setting/SpecificationSettingService'

export const SpecificationSettingModel = {
  search: async (dataItem: any) => SpecificationSettingService.search(dataItem),
  getByLikeSpecificationSettingAndInuse: async (dataItem: any) => SpecificationSettingService.getByLikeSpecificationSettingAndInuse(dataItem),
  getBySpecificationSettingForCopy: async () => SpecificationSettingService.getBySpecificationSettingForCopy(),
  create: async (dataItem: any) => SpecificationSettingService.create(dataItem),
  update: async (dataItem: any) => SpecificationSettingService.update(dataItem),
  delete: async (dataItem: any) => SpecificationSettingService.delete(dataItem),
  // getByLikeCustomerOrderFromNameAndInuse: async dataItem => SpecificationSettingService.getByLikeCustomerOrderFromNameAndInuse(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async dataItem => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
