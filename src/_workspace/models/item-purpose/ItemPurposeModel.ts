import { ItemPurposeService } from '@src/_workspace/services/item-purpose/ItemPurposeService'

export const ItemPurposeModel = {
  getByLikeItemPurposeNameAndInuse: async (dataItem: any) => ItemPurposeService.getByLikeItemPurposeNameAndInuse(dataItem),
}
