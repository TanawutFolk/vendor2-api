import { ItemCategoryService } from '@src/_workspace/services/item-category/ItemCategoryService'

export const ItemCategoryModel = {
  getItemCategory: async (dataItem: any) => ItemCategoryService.getItemCategory(dataItem),

  searchItemCategory: async (dataItem: any) => ItemCategoryService.searchItemCategory(dataItem),

  createItemCategory: async (dataItem: any) => ItemCategoryService.createItemCategory(dataItem),

  updateItemCategory: async (dataItem: any) => ItemCategoryService.updateItemCategory(dataItem),

  deleteItemCategory: async (dataItem: any) => ItemCategoryService.deleteItemCategory(dataItem),

  getByLikeItemCategoryNameAndInuse: async (dataItem: any) => ItemCategoryService.getByLikeItemCategoryNameAndInuse(dataItem),

  getForBomByLikeItemCategoryNameAndInuse: async (dataItem: any) => ItemCategoryService.getForBomByLikeItemCategoryNameAndInuse(dataItem),

  getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse: async (dataItem: any) => ItemCategoryService.getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse(dataItem),

  getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse: async (dataItem: any) => ItemCategoryService.getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse(dataItem),

  getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse: async (dataItem: any) =>
    ItemCategoryService.getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(dataItem),

  getAllByInuse: async (dataItem: any) => ItemCategoryService.getAllByInuse(dataItem),
}
