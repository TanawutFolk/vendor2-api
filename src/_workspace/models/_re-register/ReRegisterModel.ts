import { ReRegisterService } from '@src/_workspace/services/_re-register/ReRegisterService'

export const ReRegisterModel = {
  search: async (dataItem: any) => ReRegisterService.searchVendors(dataItem),
  getVendorDetail: async (vendorId: number) =>
    ReRegisterService.getVendorDetail({ VENDORS_ID: vendorId }),
  updateComprehensive: async (dataItem: any) =>
    ReRegisterService.updateVendorComprehensive(dataItem),
  deleteVendor: async (dataItem: any) => ReRegisterService.deleteVendor(dataItem),
  getVendorTypes: async (dataItem: any = {}) => ReRegisterService.getVendorTypes(dataItem),
  getProvinces: async (dataItem: any = {}) => ReRegisterService.getProvinces(dataItem),
  getCountries: async (dataItem: any = {}) => ReRegisterService.getCountries(dataItem),
  getProductGroups: async (dataItem: any = {}) => ReRegisterService.getProductGroups(dataItem),
  searchAllForExport: async (dataItem: any) => ReRegisterService.searchAllForExport(dataItem),
}
