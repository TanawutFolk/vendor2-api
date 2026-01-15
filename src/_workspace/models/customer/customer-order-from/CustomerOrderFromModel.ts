import { CustomerOrderFromService } from '@src/_workspace/services/customer/customer-order-from/CustomerOrderFromService'

export const CustomerOrderFromModel = {
  search: async (dataItem: any) => CustomerOrderFromService.search(dataItem),
  create: async (dataItem: any) => CustomerOrderFromService.create(dataItem),
  update: async (dataItem: any) => CustomerOrderFromService.update(dataItem),
  delete: async (dataItem: any) => CustomerOrderFromService.delete(dataItem),
  getByLikeCustomerOrderFromNameAndInuse: async (dataItem: any) => CustomerOrderFromService.getByLikeCustomerOrderFromNameAndInuse(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem : any) => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
