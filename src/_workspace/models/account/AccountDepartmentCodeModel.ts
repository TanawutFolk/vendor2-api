import { AccountDepartmentCodeService } from '@src/_workspace/services/account/AccountDepartmentCodeService'

export const AccountDepartmentCodeModel = {
  search: async (dataItem: any) => AccountDepartmentCodeService.search(dataItem),
  create: async (dataItem: any) => AccountDepartmentCodeService.create(dataItem),
  update: async (dataItem: any) => AccountDepartmentCodeService.update(dataItem),
  delete: async (dataItem: any) => AccountDepartmentCodeService.delete(dataItem),
  getByLikeAccountDepartmentCodeAndInuse: async (dataItem: any) => AccountDepartmentCodeService.getByLikeAccountDepartmentCodeAndInuse(dataItem),
  getAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse: async (dataItem: any) =>
    AccountDepartmentCodeService.getAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse(dataItem),
  // getByLikeProductMainNameAndInuse: async dataItem => ProductMainService.getByLikeProductMainNameAndInuse(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async dataItem => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
