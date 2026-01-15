import { FindVendorService } from '@src/_workspace/services/_find-vendor/FindVendorService'

export const FindVendorModel = {
    searchVendors: async (dataItem: any) => FindVendorService.searchVendors(dataItem)
}
