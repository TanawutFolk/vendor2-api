import { FlowController } from '@src/_workspace/controllers/flow/FlowController'
import { Router } from 'express'

const flowRoutes = Router()

flowRoutes.get('/get', FlowController.getFlow)
flowRoutes.post('/search', FlowController.searchFlow)
flowRoutes.get('/search', FlowController.searchFlow)

flowRoutes.post('/create', FlowController.createFlow)
flowRoutes.patch('/update', FlowController.updateFlow)
flowRoutes.delete('/delete', FlowController.deleteFlow)
flowRoutes.get('/getByLikeFlowNameAndInuse', FlowController.getByLikeFlowNameAndInuse)
flowRoutes.post('/getByLikeFlowCodeAndInuse', FlowController.getByLikeFlowCodeAndInuse)

// ถ้าต้องการเปิดใช้งาน route นี้ ให้เอา comment ออก
// flowRoutes.get('/getBy', FlowController.getByLikeFlowNameAndProductMainIdAndInuse);

export default flowRoutes
