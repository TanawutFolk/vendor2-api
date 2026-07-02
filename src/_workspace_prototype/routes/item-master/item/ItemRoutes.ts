import { ItemController } from '@src/_workspace/controllers/item-master/item/ItemController'
import { Router } from 'express'

const itemRoutes = Router()

itemRoutes.post('/getViewItemDataByItemId', ItemController.getViewItemDataByItemId)
itemRoutes.get('/getByLikeItemCodeNameAndInuse', ItemController.getByLikeItemCodeNameAndInuse)
itemRoutes.post('/getByLikeItemCodeNameAndInuseMaster', ItemController.getByLikeItemCodeNameAndInuse)

itemRoutes.get('/getByLikeItemCodeNameAndInuse_NotFG', ItemController.getByLikeItemCodeNameAndInuse_NotFG)
itemRoutes.post('/search', ItemController.getAll)
itemRoutes.post('/getAllUnlimit', ItemController.getAllUnlimit)
itemRoutes.get('/searchItemPrice', ItemController.getItemPriceByItemIdAndFiscalYear)
itemRoutes.get('/getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs', ItemController.getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs)
itemRoutes.post('/create', ItemController.create)
itemRoutes.post('/importItemList', ItemController.createItemList)
itemRoutes.post('/update', ItemController.update)
itemRoutes.post('/delete', ItemController.delete)
itemRoutes.post('/getImageFromUrl', ItemController.getImageFromUrl)
itemRoutes.post('/download-item-template', ItemController.downloadTemplate)
itemRoutes.post('/downloadFileForExportItem', async (req, res) => {
  await ItemController.downloadFileForExportItem(req, res)
})
itemRoutes.post('/getByLikeItemCodeByLike', ItemController.getByLikeItemCodeByLike)
itemRoutes.post('/getByLikeItemCodeByLikeAndBOMId', ItemController.getByLikeItemCodeByLikeAndBOMId)
itemRoutes.post('/getByLikeItemCodeAll', ItemController.getByLikeItemCodeAll)
itemRoutes.post('/getByLikeItemCodeAndProductMain', ItemController.getByLikeItemCodeAndProductMain)
itemRoutes.post('/getByLikeItemCode', ItemController.getByLikeItemCode)
export default itemRoutes
