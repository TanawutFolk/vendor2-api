import { ColorController } from '@src/_workspace/controllers/item-master/item-property/color/ColorController'
import { Router } from 'express'

const colorRoutes = Router()

colorRoutes.get('/get', ColorController.getItemPropertyColor)
colorRoutes.get('/getByLikeColorNameAndInuse', ColorController.getByLikeItemPropertyColorName)
colorRoutes.post('/search', ColorController.searchItemPropertyColor)

colorRoutes.post('/create', ColorController.createItemPropertyColor)

colorRoutes.patch('/update', ColorController.updateItemPropertyColor)

colorRoutes.delete('/delete', ColorController.deleteItemPropertyColor)

colorRoutes.get('/getByLikeItemPropertyColorName', ColorController.getByLikeItemPropertyColorName)

export default colorRoutes
