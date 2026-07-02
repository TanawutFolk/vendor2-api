import { PurchaseModuleService } from '@src/_workspace/services/purchase-module/PurchaseModuleService'

export const PurchaseModuleModel = {
  getByLikePurchaseModuleNameAndInuse: async (dataItem: any) => PurchaseModuleService.getByLikePurchaseModuleNameAndInuse(dataItem),
}
