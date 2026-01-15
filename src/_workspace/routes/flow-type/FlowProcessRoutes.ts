import { FlowProcessController } from '@src/_workspace/controllers/flow-process/FlowProcessController'
import { Router } from 'express'

const flowProcessRoutes = Router()

flowProcessRoutes.get('/searchProcessByFlowProcessId', FlowProcessController.searchProcessByFlowProcessId)

flowProcessRoutes.post('/create', FlowProcessController.createFlowProcess)

flowProcessRoutes.patch('/update', FlowProcessController.updateFlowProcess)

flowProcessRoutes.delete('/delete', FlowProcessController.deleteFlowProcess)

flowProcessRoutes.get('/getByLikeFlowNameAndInuse', FlowProcessController.getByLikeFlowNameAndInuse)

flowProcessRoutes.get('/getByFlowNameAndProductMainIdAndInuse', FlowProcessController.getByLikeFlowNameAndProductMainIdAndInuse)
flowProcessRoutes.post('/getByFlowId', FlowProcessController.getByFlowId)
flowProcessRoutes.get('/getByLikeFlowNameAndInuse', FlowProcessController.getByLikeFlowNameAndInuse)
export default flowProcessRoutes
