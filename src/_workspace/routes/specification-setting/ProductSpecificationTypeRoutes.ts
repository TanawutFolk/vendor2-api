import { ProductSpecificationTypeController } from '@src/_workspace/controllers/specification-setting/ProductSpecificationTypeController'
import { Router } from 'express'

const ProductSpecificationTypeRoutes = Router()

ProductSpecificationTypeRoutes.get('/getByLikeProductSpecificationTypeAndInuse', ProductSpecificationTypeController.getByLikeProductSpecificationTypeAndInuse)

export default ProductSpecificationTypeRoutes
