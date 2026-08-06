import { ReRegisterService } from '@src/_workspace/services/_re-register/ReRegisterService'

export const ReRegisterModel = {
  search: async (dataItem: any) => ReRegisterService.searchVendors(dataItem),
  getVendorDetail: async (vendorId: number) =>
    ReRegisterService.getVendorDetail({ VENDORS_ID: vendorId }),
  updateComprehensive: async (dataItem: any) =>
    ReRegisterService.updateVendorComprehensive(dataItem),
  deleteVendor: async (dataItem: any) => ReRegisterService.deleteVendor(dataItem),
  getVendorTypes: async () => ReRegisterService.getVendorTypes({}),
  getProvinces: async () => ReRegisterService.getProvinces({}),
  getCountries: async () => ReRegisterService.getCountries({}),
  getProductGroups: async () => ReRegisterService.getProductGroups({}),
  searchAllForExport: async (dataItem: any) => ReRegisterService.searchAllForExport(dataItem),
}
