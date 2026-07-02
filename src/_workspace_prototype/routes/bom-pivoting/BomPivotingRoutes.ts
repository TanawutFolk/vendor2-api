import { BomPivotingController } from '@src/_workspace/controllers/bom-pivoting/BomPivotingController'
import { Router } from 'express'

const bomPivotingRoutes = Router()

bomPivotingRoutes.post('/search', BomPivotingController.search)
bomPivotingRoutes.get('/search', BomPivotingController.search)

export default bomPivotingRoutes
