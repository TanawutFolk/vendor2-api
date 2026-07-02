import { ColorService } from '@src/_workspace/services/item-master/item-property/color/ColorService'

export const ColorModel = {
  getItemPropertyColor: async (dataItem: any) => ColorService.getItemPropertyColor(dataItem),

  searchItemPropertyColor: async (dataItem: any) => ColorService.searchItemPropertyColor(dataItem),

  createItemPropertyColor: async (dataItem: any) => ColorService.createItemPropertyColor(dataItem),

  updateItemPropertyColor: async (dataItem: any) => ColorService.updateItemPropertyColor(dataItem),

  deleteItemPropertyColor: async (dataItem: any) => ColorService.deleteItemPropertyColor(dataItem),

  getByLikeItemPropertyColorName: async (dataItem: any) => ColorService.getByLikeItemPropertyColorName(dataItem),
}
