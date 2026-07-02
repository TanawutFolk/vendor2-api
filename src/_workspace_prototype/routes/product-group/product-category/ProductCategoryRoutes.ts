import { productCategoryController } from '@src/_workspace/controllers/product-group/product-category/ProductCategoryController'
import { Router } from 'express'

const ProductCategoryRoutes = Router()

// ProductCategoryRoutes.get('/search', productCategoryController.search)
ProductCategoryRoutes.post('/search', productCategoryController.search)

ProductCategoryRoutes.post('/create', productCategoryController.create)
ProductCategoryRoutes.delete('/delete', productCategoryController.delete)
ProductCategoryRoutes.patch('/update', productCategoryController.update)
ProductCategoryRoutes.get('/getByLikeProductCategoryNameAndInuse', productCategoryController.getByLikeProductCategoryNameAndInuse)
ProductCategoryRoutes.post('/getByLikeProductCategoryNameAndInuse', productCategoryController.getByLikeProductCategoryNameAndInuse)
export default ProductCategoryRoutes
