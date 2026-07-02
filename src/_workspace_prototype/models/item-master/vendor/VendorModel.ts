import { VendorService } from '@src/_workspace/services/item-master/vendor/VendorService'

export const VendorModel = {
  getItemImportType: async (dataItem: any) => VendorService.getItemImportType(dataItem),

  getVendor: async (dataItem: any) => VendorService.getVendor(dataItem),

  searchVendor: async (dataItem: any) => VendorService.searchVendor(dataItem),

  createVendor: async (dataItem: any) => VendorService.createVendor(dataItem),

  updateVendor: async (dataItem: any) => VendorService.updateVendor(dataItem),

  deleteVendor: async (dataItem: any) => VendorService.deleteVendor(dataItem),

  getByLikeVendorName: async (dataItem: any) => VendorService.getByLikeVendorName(dataItem),

  getByLikeVendorAlphabetAndInuse: async (dataItem: any) => VendorService.getByLikeVendorAlphabetAndInuse(dataItem),

  getByLikeVendorNameAndImportType: async (dataItem: any) => VendorService.getByLikeVendorNameAndImportType(dataItem),
}
