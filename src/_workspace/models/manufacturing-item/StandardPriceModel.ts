import { StandardPriceService } from '@src/_workspace/services/manufacturing-item/StandardPriceService'

export const StandardPriceModel = {
  getAllStandardPrice: async () => StandardPriceService.getAllStandardPrice(),
  search: async (dataItem: any) => StandardPriceService.search(dataItem),
  searchAll: async (dataItem: any) => StandardPriceService.searchAll(dataItem),
  // getOriginalPriceDetailByItemId: async (dataItem: any) => StandardPriceService.getOriginalPriceDetailByItemId(dataItem),
  // searchDataUnlimit: async (dataItem: any) => StandardPriceService.searchDataUnlimit(dataItem),
  create: async (dataItem: any) => StandardPriceService.create(dataItem),
  // getStandardPriceDetail: async (dataItem: any) => StandardPriceService.getStandardPriceDetail(dataItem),
  delete: async (dataItem: any) => StandardPriceService.delete(dataItem),
}
