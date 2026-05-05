import { FindVendorService } from '@src/_workspace/services/_find-vendor/FindVendorService'

export const FindVendorModel = {
  searchVendors: async (dataItem: any) => FindVendorService.searchVendors(dataItem),
  getById: async (vendor_id: number) => FindVendorService.getById({ vendor_id }),
  updateVendor: async (dataItem: any) => FindVendorService.updateVendor(dataItem),
  getVendorTypes: async (dataItem: any = {}) => FindVendorService.getVendorTypes(dataItem),
  getProvinces: async (dataItem: any = {}) => FindVendorService.getProvinces(dataItem),
  getProductGroups: async (dataItem: any = {}) => FindVendorService.getProductGroups(dataItem),
  searchAllForExport: async (dataItem: any) => FindVendorService.searchAllForExport(dataItem),
  // streamAllForExport is omitted as it does not exist on FindVendorService
  getPronesData: async (dataItem: any = {}) => FindVendorService.getPronesData(dataItem),
  getPronesRawTest: async (dataItem: any = {}) => FindVendorService.getPronesRawTest(dataItem),
  getAllVendorNames: async (dataItem: any = {}) => FindVendorService.getAllVendorNames(dataItem),
  deleteVendorContact: async (dataItem: any) => FindVendorService.deleteVendorContact(dataItem),
  deleteVendorProduct: async (dataItem: any) => FindVendorService.deleteVendorProduct(dataItem),
  getMatchResults: async (dataItem: any = {}) => FindVendorService.getMatchResults(dataItem),
  getMatchResultsByVendorIds: async (vendorIds: number[]) => FindVendorService.getMatchResultsByVendorIds({ vendorIds }),
}
