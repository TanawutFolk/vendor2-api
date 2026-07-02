import { ShapeController } from '@src/_workspace/controllers/item-master/item-property/shape/ShapeController'
import { Router } from 'express'

const shapeRoutes = Router()

shapeRoutes.get('/get', ShapeController.getItemPropertyShape)
shapeRoutes.get('/getByLikeShapeNameAndInuse', ShapeController.getByLikeItemPropertyShapeName)
shapeRoutes.post('/search', ShapeController.searchItemPropertyShape)

shapeRoutes.post('/create', ShapeController.createItemPropertyShape)

shapeRoutes.patch('/update', ShapeController.updateItemPropertyShape)

shapeRoutes.delete('/delete', ShapeController.deleteItemPropertyShape)

shapeRoutes.get('/getByLikeItemPropertyShapeName', ShapeController.getByLikeItemPropertyShapeName)

export default shapeRoutes
