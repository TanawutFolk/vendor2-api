import { FlowTypeController } from '@src/_workspace/controllers/flow-type/FlowTypeController'
import { Router } from 'express'

const flowTypeRoutes = Router()

flowTypeRoutes.get('/get', FlowTypeController.getFlowType)

flowTypeRoutes.post('/search', FlowTypeController.searchFlowType)

flowTypeRoutes.post('/create', FlowTypeController.createFlowType)

flowTypeRoutes.patch('/update', FlowTypeController.updateFlowType)

flowTypeRoutes.delete('/delete', FlowTypeController.deleteFlowType)

flowTypeRoutes.get('/getByLikeFlowTypeName', FlowTypeController.getByLikeFlowTypeName)

export default flowTypeRoutes
