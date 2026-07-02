import { ManufacturingItemPriceService } from '@_workspace/services/pc-admin/ManufacturingItemPriceService'

export const ManufacturingItemPriceModel = {
  create: async (dataItem: any) => ManufacturingItemPriceService.create(dataItem),
}
