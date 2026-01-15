import { EnvironmentCertificateService } from '@src/_workspace/services/environment-certificate/EnvironmentCertificateService'

export const EnvironmentCertificateModel = {
  search: async (dataItem: any) => EnvironmentCertificateService.search(dataItem),
  create: async (dataItem: any) => EnvironmentCertificateService.create(dataItem),
  update: async (dataItem: any) => EnvironmentCertificateService.update(dataItem),
  delete: async (dataItem: any) => EnvironmentCertificateService.delete(dataItem),
  getByLikeEnvironmentCertificateNameAndInuse: async (dataItem: any) => EnvironmentCertificateService.getByLikeEnvironmentCertificateNameAndInuse(dataItem),
  getAllByLikeInuse: async (dataItem: any) => EnvironmentCertificateService.getAllByLikeInuse(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem:any) => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
