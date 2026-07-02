import { ItemService } from '@src/_workspace/services/item-master/item/ItemService'

export const ItemModel = {
  getViewItemDataByItemId: async (dataItem: any) => ItemService.getViewItemDataByItemId(dataItem),
  getAll: async (dataItem: any) => ItemService.getAll(dataItem),
  getAllUnlimit: async (dataItem: any) => ItemService.getAllUnlimit(dataItem),
  getDefaultImagePath: async (dataItem: any) => ItemService.getDefaultImagePath(dataItem),
  getByLikeItemCodeNameAndInuse: async (dataItem: any) => ItemService.getByLikeItemCodeNameAndInuse(dataItem),
  getByLikeItemCodeNameAndInuse_NotFG: async (dataItem: any) => ItemService.getByLikeItemCodeNameAndInuse_NotFG(dataItem),
  getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs: async (dataItem: any) => ItemService.getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs(dataItem),
  getByLikeItemCodeAndInuseAndNotFGSemiFGSubAsNoLimit: async () => ItemService.getByLikeItemCodeAndInuseAndNotFGSemiFGSubAsNoLimit(),
  getItemPriceByItemIdAndFiscalYear: async (dataItem: any) => ItemService.getItemPriceByItemIdAndFiscalYear(dataItem),
  getByLikeItemCodeByLike: async (dataItem: any) => ItemService.getByLikeItemCodeByLike(dataItem),
  getByLikeItemCodeByLikeAndBOMId: async (dataItem: any) => ItemService.getByLikeItemCodeByLikeAndBOMId(dataItem),
  getByLikeItemCodeAll: async (dataItem: any) => ItemService.getByLikeItemCodeAll(dataItem),
  getByLikeItemCodeAndProductMain: async (dataItem: any) => ItemService.getByLikeItemCodeAndProductMain(dataItem),
  getByLikeItemCode: async (dataItem: any) => ItemService.getByLikeItemCode(dataItem),
  create: async (dataItem: any) => ItemService.create(dataItem),
  update: async (dataItem: any) => ItemService.update(dataItem),
  delete: async (dataItem: any) => ItemService.delete(dataItem),
  createItemList: async (dataItem: any) => ItemService.createItemList(dataItem),
}
