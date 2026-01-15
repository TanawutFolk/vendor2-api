import { ShapeService } from '@src/_workspace/services/item-master/item-property/shape/ShapeService'

export const ShapeModel = {
  getItemPropertyShape: async (dataItem: any) => ShapeService.getItemPropertyShape(dataItem),

  searchItemPropertyShape: async (dataItem: any) => ShapeService.searchItemPropertyShape(dataItem),

  createItemPropertyShape: async (dataItem: any) => ShapeService.createItemPropertyShape(dataItem),

  updateItemPropertyShape: async (dataItem: any) => ShapeService.updateItemPropertyShape(dataItem),

  deleteItemPropertyShape: async (dataItem: any) => ShapeService.deleteItemPropertyShape(dataItem),

  getByLikeItemPropertyShapeName: async (dataItem: any) => ShapeService.getByLikeItemPropertyShapeName(dataItem),
}
