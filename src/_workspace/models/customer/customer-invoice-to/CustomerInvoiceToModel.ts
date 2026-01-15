import { CustomerInvoiceToService } from '@src/_workspace/services/customer/customer-invoice-to/CustomerInvoiceToService'

export const CustomerInvoiceToModel = {
  search: async (dataItem: any) => CustomerInvoiceToService.search(dataItem),
  create: async (dataItem: any) => CustomerInvoiceToService.create(dataItem),
  update: async (dataItem: any) => CustomerInvoiceToService.update(dataItem),
  delete: async (dataItem: any) => CustomerInvoiceToService.delete(dataItem),
  getByLikeCustomerInvoiceToName: async (dataItem: any) => CustomerInvoiceToService.getByLikeCustomerInvoiceToName(dataItem),
  getByLikeCustomerInvoiceToAlphabet: async (dataItem: any) => CustomerInvoiceToService.getByLikeCustomerInvoiceToAlphabet(dataItem),
  // getByLikeProductMainNameAndInuse: async dataItem => ProductMainService.getByLikeProductMainNameAndInuse(dataItem),
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async dataItem => ProductMainService.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem),
}
