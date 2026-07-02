import { MakerController } from '@src/_workspace/controllers/item-master/maker/MakerController'
import { Router } from 'express'

const makerRoutes = Router()

makerRoutes.get('/get', MakerController.getMaker)

makerRoutes.get('/getByLikeMakerNameAndInuse', MakerController.getByLikeMakerNameAndInuse)

makerRoutes.post('/search', MakerController.searchMaker)

makerRoutes.post('/create', MakerController.createMaker)

makerRoutes.patch('/update', MakerController.updateMaker)

makerRoutes.delete('/delete', MakerController.deleteMaker)

export default makerRoutes
