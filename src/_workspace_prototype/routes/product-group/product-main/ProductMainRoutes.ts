import { productMainController } from '@src/_workspace/controllers/product-group/product-main/ProductMainController'
import { Router } from 'express'

const ProductMainRoutes = Router()

ProductMainRoutes.post('/search', productMainController.search)
ProductMainRoutes.post('/create', productMainController.create)
ProductMainRoutes.post('/update', productMainController.update)
ProductMainRoutes.post('/delete', productMainController.delete)
ProductMainRoutes.get('/getByLikeProductMainNameAndInuse', productMainController.getByLikeProductMainNameAndInuse)
ProductMainRoutes.post('/getByLikeProductMainNameAndInuse', productMainController.getByLikeProductMainNameAndInuse)
ProductMainRoutes.post('/getByLikeProductMainNameAndProductCategoryIdAndInuse', productMainController.getByLikeProductMainNameAndProductCategoryIdAndInuse)
ProductMainRoutes.get('/getByLikeProductMainNameAndProductCategoryIdAndInuse', productMainController.getByLikeProductMainNameAndProductCategoryIdAndInuse)
ProductMainRoutes.get('/getProductMainByLikeProductMainNameAndInuse', productMainController.getProductMainByLikeProductMainNameAndInuse)

export default ProductMainRoutes
