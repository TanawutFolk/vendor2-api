import { locControllers } from '@src/_workspace/controllers/loc/LocControllers'
import { Router } from 'express'

const LocRoutes = Router()

LocRoutes.get('/getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType', locControllers.getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType)

export default LocRoutes
