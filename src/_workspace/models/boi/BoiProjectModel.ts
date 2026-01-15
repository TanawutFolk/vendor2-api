import { BoiProjectService } from '@services/boi/BoiProjectService'

export const BoiProjectModel = {
  search: async (dataItem: any) => BoiProjectService.search(dataItem),
  create: async (dataItem: any) => BoiProjectService.create(dataItem),
  update: async (dataItem: any) => BoiProjectService.update(dataItem),
  delete: async (dataItem: any) => BoiProjectService.delete(dataItem),
  getByLikeBoiProductGroupAndInuse: async (dataItem: any) => BoiProjectService.getByLikeBoiProductGroupAndInuse(dataItem),
  getByLikeBoiProjectCodeAndInuse: async (dataItem: any) => BoiProjectService.getByLikeBoiProjectCodeAndInuse(dataItem),
  getByLikeBoiProjectNameAndInuse: async (dataItem: any) => BoiProjectService.getByLikeBoiProjectNameAndInuse(dataItem),
  getBoiProjectGroupNameByLike: async (dataItem: any) => BoiProjectService.getBoiProjectGroupNameByLike(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async dataItem => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
