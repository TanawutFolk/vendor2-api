import { ProductTypeNewController } from '@src/_workspace/controllers/product-group/product-type/ProductType_NewController'
import { ProductTypeBomController } from '@src/_workspace/controllers/product-group/product-type/ProductTypeBomController'
import { Router } from 'express'

const ProductTypeNewRoutes = Router()

ProductTypeNewRoutes.post('/search', ProductTypeNewController.search)
ProductTypeNewRoutes.post('/create', ProductTypeNewController.create)
ProductTypeNewRoutes.delete('/delete', ProductTypeNewController.delete)

ProductTypeNewRoutes.post('/getByProductTypeForCopy', ProductTypeNewController.getByProductTypeForCopy)
ProductTypeNewRoutes.post('/getByProductTypeStatusWorkingAndInuse', ProductTypeNewController.getByProductTypeStatusWorkingAndInuse)
ProductTypeNewRoutes.post('/getByLikeProductTypeNameAndProductMainIdAndInuse', ProductTypeNewController.getByLikeProductTypeNameAndProductMainIdAndInuse)
ProductTypeNewRoutes.post(
  '/getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods',
  ProductTypeNewController.getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods
)
ProductTypeNewRoutes.post('/getByLikeProductTypeCodeAndProductMainIdAndInuse', ProductTypeNewController.getByLikeProductTypeCodeAndProductMainIdAndInuse)
ProductTypeNewRoutes.get('/searchProductTypeList', ProductTypeNewController.searchProductTypeList)
ProductTypeNewRoutes.patch('/update', ProductTypeNewController.update)

ProductTypeNewRoutes.get('/getByLikeProductCategoryNameAndInuse', ProductTypeNewController.getByLikeProductCategoryNameAndInuse)
// ProductTypeNewRoutes.get('/searchByLikeProductCategoryName', ProductTypeNewController.searchByLikeProductCategoryName)
ProductTypeNewRoutes.post('/getByLikeProductTypeNameAndInuse', ProductTypeNewController.getByLikeProductTypeNameAndInuse)
ProductTypeNewRoutes.get('/getByLikeProductTypeNameAndInuse', ProductTypeNewController.getByLikeProductTypeNameAndInuse)
ProductTypeNewRoutes.post(
  '/getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods',
  ProductTypeNewController.getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods
)
ProductTypeNewRoutes.post('/getByLikeProductTypeNameAndProductCategoryIdAndInuse', ProductTypeNewController.getByLikeProductTypeNameAndProductCategoryIdAndInuse)
ProductTypeNewRoutes.post('/getByLikeProductTypeNameAndInuseForPriceList', ProductTypeNewController.getByLikeProductTypeNameAndInuseForPriceList)
ProductTypeNewRoutes.get('/getByProductGroup', ProductTypeNewController.getByProductGroup)
ProductTypeNewRoutes.post('/getBomByLikeProductTypeId', ProductTypeBomController.getBomByLikeProductTypeId)
ProductTypeNewRoutes.get('/getProductTypeByProductGroup', ProductTypeNewController.getProductTypeByProductGroup)
ProductTypeNewRoutes.get('/getByLikeProductTypeStatusWorkingNameAndInuse', ProductTypeNewController.getByLikeProductTypeStatusWorkingNameAndInuse)
ProductTypeNewRoutes.post('/getByLikeProductTypeNameAndProductSubIdAndInuse', ProductTypeNewController.getByLikeProductTypeNameAndProductSubIdAndInuse)
ProductTypeNewRoutes.get('/getByLikeProductTypeNameAndProductSubIdAndInuse', ProductTypeNewController.getByLikeProductTypeNameAndProductSubIdAndInuse)
ProductTypeNewRoutes.post(
  '/getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods',
  ProductTypeNewController.getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods
)
ProductTypeNewRoutes.post('/getProductTypeByProductMainID', ProductTypeNewController.getProductTypeByProductMainID)
ProductTypeNewRoutes.post('/searchProductType', ProductTypeNewController.searchProductType)
ProductTypeNewRoutes.post('/createProductType', ProductTypeNewController.createProductType)
ProductTypeNewRoutes.patch('/updateProductType', ProductTypeNewController.updateProductType)
ProductTypeNewRoutes.delete('/deleteProductTypeAndItem', ProductTypeNewController.deleteProductTypeAndItem)
ProductTypeNewRoutes.post('/downloadFileForExportProductType', async (req, res) => {
  await ProductTypeNewController.downloadFileForExportProductType(req, res)
})
ProductTypeNewRoutes.post('/downloadFileForExportProductTypeBOM', async (req, res) => {
  await ProductTypeBomController.downloadFileForExportProductTypeBOM(req, res)
})
export default ProductTypeNewRoutes
