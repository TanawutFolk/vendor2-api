import { ProductTypeNewController } from '@src/_workspace/controllers/product-group/product-type/ProductType_NewController'
import { Router } from 'express'

const ProductTypeRoutes = Router()

ProductTypeRoutes.post('/search', ProductTypeNewController.search)
export default ProductTypeRoutes
