import { FindVendorService } from '@src/_workspace/services/_find-vendor/FindVendorService'

export const FindVendorModel = {
    searchVendors: async (dataItem: any, sqlWhere: string = '') => FindVendorService.searchVendors(dataItem, sqlWhere),
    getById: async (vendor_id: number) => FindVendorService.getById(vendor_id),
    updateVendor: async (dataItem: any) => FindVendorService.updateVendor(dataItem),
    getVendorTypes: async () => FindVendorService.getVendorTypes(),
    getProvinces: async () => FindVendorService.getProvinces(),
    getProductGroups: async () => FindVendorService.getProductGroups(),
    searchAllForExport: async (dataItem: any, sqlWhere: string = '') => FindVendorService.searchAllForExport(dataItem, sqlWhere),
    streamAllForExport: async (dataItem: any, sqlWhere: string = '') => FindVendorService.streamAllForExport(dataItem, sqlWhere),
    getPronesData: async (dataItem: any) => FindVendorService.getPronesData(),
    getAllVendorNames: async () => FindVendorService.getAllVendorNames(),
    deleteVendorContact: async (dataItem: any) => FindVendorService.deleteVendorContact(dataItem),
    deleteVendorProduct: async (dataItem: any) => FindVendorService.deleteVendorProduct(dataItem),
    getMatchResults: async () => FindVendorService.getMatchResults(),
    getMatchResultsByVendorIds: async (vendorIds: number[]) => FindVendorService.getMatchResultsByVendorIds(vendorIds),
}
