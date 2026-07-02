import { productSubController } from '@src/_workspace/controllers/product-group/product-sub/ProductSubController'
import { Router } from 'express'

const ProductSubRoutes = Router()

ProductSubRoutes.post('/search', productSubController.search)
// ProcessRoutes.post('/getAllProcessInProductMain', productSubController.getAllProcessInProductMain)
ProductSubRoutes.post('/create', productSubController.create)
ProductSubRoutes.delete('/delete', productSubController.delete)
ProductSubRoutes.patch('/update', productSubController.update)
ProductSubRoutes.get('/getByLikeProductSubNameAndInuse', productSubController.getByLikeProductSubNameAndInuse)
ProductSubRoutes.get('/getByLikeProductSubNameAndProductMainIdAndInuse', productSubController.getByLikeProductSubNameAndProductMainIdAndInuse)
ProductSubRoutes.get('/getByLikeProductSubNameAndProductCategoryIdAndInuse', productSubController.getByLikeProductSubNameAndProductCategoryIdAndInuse)
ProductSubRoutes.post('/getByLikeProductSubNameAndProductCategoryIdAndInuse', productSubController.getByLikeProductSubNameAndProductCategoryIdAndInuse)

export default ProductSubRoutes
