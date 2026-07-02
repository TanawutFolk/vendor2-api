import { FlowProductTypeController } from '@src/_workspace/controllers/flow-product-type/FlowProductTypeController'
import { Router } from 'express'

const flowProductTypeRoutes = Router()

flowProductTypeRoutes.get('/searchFlowProductTypeByFlowId', FlowProductTypeController.searchFlowProductTypeByFlowId)

export default flowProductTypeRoutes
