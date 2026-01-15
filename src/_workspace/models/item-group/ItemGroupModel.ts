import { ItemGroupService } from '@src/_workspace/services/item-group/ItemGroupService'

export const ItemGroupModels = {
  getByLikeItemGroupName: async (dataItem: any) => ItemGroupService.getByLikeItemGroupName(dataItem),
}
