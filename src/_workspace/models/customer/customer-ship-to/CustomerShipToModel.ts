import { CustomerShipToService } from '@src/_workspace/services/customer/customer-ship-to/CustomerShipToService'

export const CustomerShipToModel = {
  search: async (dataItem: any) => CustomerShipToService.search(dataItem),
  create: async (dataItem: any) => CustomerShipToService.create(dataItem),
  update: async (dataItem: any) => CustomerShipToService.update(dataItem),
  delete: async (dataItem: any) => CustomerShipToService.delete(dataItem),
  // getByLikeProductMainNameAndInuse: async (dataItem : any) => ProductMainService.getByLikeProductMainNameAndInuse(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem : any) => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
