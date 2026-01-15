import { AddVendorService } from '@src/_workspace/services/_add-vendor/AddVendorService'

export const AddVendorModel = {
    checkDuplicateVendor: async (dataItem: any) => AddVendorService.checkDuplicateVendor(dataItem),

    createVendor: async (dataItem: any) => AddVendorService.createVendor(dataItem),

    getVendorTypes: async () => AddVendorService.getVendorTypes(),

    getProductGroups: async () => AddVendorService.getProductGroups(),

    createProductGroup: async (dataItem: any) => AddVendorService.createProductGroup(dataItem),
}
