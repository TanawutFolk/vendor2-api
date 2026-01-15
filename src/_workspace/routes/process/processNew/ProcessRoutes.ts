import { ProcessController } from '@src/_workspace/controllers/process/processNew/ProcessController'
import { Router } from 'express'

const processRoutes = Router()

processRoutes.get('/get', ProcessController.getProcess)
processRoutes.post('/search', ProcessController.searchProcess)
processRoutes.post('/create', ProcessController.createProcess)
processRoutes.patch('/update', ProcessController.updateProcess)
processRoutes.delete('/delete', ProcessController.deleteProcess)
processRoutes.get('/getByLikeProcessName', ProcessController.getByLikeProcessName)
processRoutes.post('/getByLikeProcessNameAndInuse', ProcessController.getByLikeProcessNameAndInuse)

processRoutes.get('/getByLikeProcessNameAndProductMainIdAndInuse', ProcessController.getByLikeProcessNameAndProductMainIdAndInuse)
processRoutes.post('/getByLikeProcessNameAndProductMainIdAndInuse', ProcessController.getByLikeProcessNameAndProductMainIdAndInuse)

export default processRoutes
