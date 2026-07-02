import { OrderTypeService } from '@_workspace/services/production-control/OrderTypeService'

export const OrderTypeModel = {
  search: async (dataItem: any) => OrderTypeService.search(dataItem),
  create: async (dataItem: any) => OrderTypeService.create(dataItem),
  update: async (dataItem: any) => OrderTypeService.update(dataItem),
  delete: async (dataItem: any) => OrderTypeService.delete(dataItem),
}
