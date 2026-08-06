import { FindVendorService } from '@src/_workspace/services/_find-vendor/FindVendorService'

export const FindVendorModel = {
  searchVendors: async (dataItem: any) => FindVendorService.searchVendors(dataItem),
  getVendorDetail: async (vendor_id: number) => FindVendorService.getVendorDetail({ VENDORS_ID: vendor_id }),
  updateVendor: async (dataItem: any) => FindVendorService.updateVendor(dataItem),
  updateVendorComprehensive: async (dataItem: any) => FindVendorService.updateVendorComprehensive(dataItem),
  deleteVendor: async (dataItem: any) => FindVendorService.deleteVendor(dataItem),
  getVendorBusinessCategoryName: async (dataItem: any = {}) => FindVendorService.getVendorBusinessCategoryName(dataItem),
  getVendorTypes: async (dataItem: any = {}) => FindVendorService.getVendorBusinessCategoryName(dataItem),
  getProvinces: async (dataItem: any = {}) => FindVendorService.getProvinces(dataItem),
  getCountries: async (dataItem: any = {}) => FindVendorService.getCountries(dataItem),
  getProductGroups: async (dataItem: any = {}) => FindVendorService.getProductGroups(dataItem),
  searchAllForExport: async (dataItem: any) => FindVendorService.searchAllForExport(dataItem),
  // streamAllForExport is omitted as it does not exist on FindVendorService
  getPronesRawTest: async (dataItem: any = {}) => FindVendorService.getPronesRawTest(dataItem),
  getAllVendorNames: async (dataItem: any = {}) => FindVendorService.getAllVendorNames(dataItem),
  deleteVendorContact: async (dataItem: any) => FindVendorService.deleteVendorContact(dataItem),
  deleteVendorProduct: async (dataItem: any) => FindVendorService.deleteVendorProduct(dataItem),
}
