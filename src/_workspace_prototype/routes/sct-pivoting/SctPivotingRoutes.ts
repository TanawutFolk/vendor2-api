import { SctPivotingController } from '@src/_workspace/controllers/sct-pivoting/SctPivotingController'
import { Router } from 'express'

const sctPivotingRoutes = Router()

sctPivotingRoutes.post('/search', SctPivotingController.search)
sctPivotingRoutes.get('/search', SctPivotingController.search)

export default sctPivotingRoutes
