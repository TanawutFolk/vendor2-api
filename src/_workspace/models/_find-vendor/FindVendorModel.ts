import { FindVendorService } from '@src/_workspace/services/_find-vendor/FindVendorService'

export const FindVendorModel = {
    searchVendors: async (dataItem: any, sqlWhere: string = '') => FindVendorService.searchVendors(dataItem, sqlWhere),
    getById: async (vendor_id: number) => FindVendorService.getById(vendor_id),
    updateVendor: async (dataItem: any) => FindVendorService.updateVendor(dataItem),
    getVendorTypes: async () => FindVendorService.getVendorTypes(),
    getProvinces: async () => FindVendorService.getProvinces(),
    getProductGroups: async () => FindVendorService.getProductGroups()
}
