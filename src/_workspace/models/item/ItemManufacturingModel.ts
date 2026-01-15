import { ItemManufacturingService } from '@src/_workspace/services/item/ItemManufacturingService'

export const ItemManufacturingModel = {
  getByLikeItemManufacturingByProductTypeId: async (dataItem: any) => await ItemManufacturingService.getByLikeItemManufacturingByProductTypeId(dataItem),
}
