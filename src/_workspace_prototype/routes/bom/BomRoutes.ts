import { BomController } from '@src/_workspace/controllers/bom/BomController'
import { Router } from 'express'

const bomRoutes = Router()

bomRoutes.post('/search', BomController.search)

bomRoutes.get('/search', BomController.search)

bomRoutes.get('/searchBomDetailsByBomId', BomController.searchBomDetailsByBomId)

bomRoutes.get('/searchBomDetailsByBomIdAndProductTypeId', BomController.searchBomDetailsByBomIdAndProductTypeId)

bomRoutes.post('/create', BomController.create)

bomRoutes.patch('/update', BomController.update)

bomRoutes.patch('/updateBomProductType', BomController.updateBomProductType)

bomRoutes.delete('/delete', BomController.Delete)

bomRoutes.get('/getByLikeBomNameAndInuse', BomController.getByLikeBomNameAndInuse)

bomRoutes.get('/getByBomNameAndProductMainIdAndInuse', BomController.getByBomNameAndProductMainIdAndInuse)

bomRoutes.get('/getByBomCodeAndProductMainIdAndInuse', BomController.getByBomCodeAndProductMainIdAndInuse)

bomRoutes.post('/getBomByLikeProductTypeIdAndCondition', BomController.getBomByLikeProductTypeIdAndCondition)

bomRoutes.post('/getItemCodeForSupportMes', BomController.getItemCodeForSupportMes)

bomRoutes.post('/getByLikeBomCodeAndProductMainIdAndInuse', BomController.getByLikeBomCodeAndProductMainIdAndInuse)

bomRoutes.post('/getBOMCodeByLike', BomController.getBOMCodeByLike)

bomRoutes.post('/getBOMNameByLike', BomController.getBOMNameByLike)
bomRoutes.post('/getByLikeBomCodeAndInuse', BomController.getByLikeBomCodeAndInuse)

export default bomRoutes
