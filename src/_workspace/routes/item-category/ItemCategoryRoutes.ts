import { ItemCategoryController } from '@src/_workspace/controllers/item-category/ItemCategoryController'
import { Router } from 'express'

const itemCategoryRoutes = Router()

itemCategoryRoutes.get('/get', ItemCategoryController.getItemCategory)

itemCategoryRoutes.post('/search', ItemCategoryController.searchItemCategory)

itemCategoryRoutes.post('/create', ItemCategoryController.createItemCategory)

itemCategoryRoutes.patch('/update', ItemCategoryController.updateItemCategory)

itemCategoryRoutes.delete('/delete', ItemCategoryController.deleteItemCategory)

itemCategoryRoutes.get('/getByLikeItemCategoryNameAndInuse', ItemCategoryController.getByLikeItemCategoryNameAndInuse)

itemCategoryRoutes.get('/getForBomByLikeItemCategoryNameAndInuse', ItemCategoryController.getForBomByLikeItemCategoryNameAndInuse)

itemCategoryRoutes.get('/getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse', ItemCategoryController.getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse)

itemCategoryRoutes.get('/getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse', ItemCategoryController.getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse)

itemCategoryRoutes.get(
  '/getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse',
  ItemCategoryController.getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse
)

itemCategoryRoutes.get('/getAllByInuse', ItemCategoryController.getAllByInuse)

export default itemCategoryRoutes
