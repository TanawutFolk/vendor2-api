import { MaterialListController } from '@src/_workspace/controllers/environment-certificate/MaterialListController'
import { Router } from 'express'

const materialListRoutes = Router()

materialListRoutes.get('/search', MaterialListController.search)
// materialListRoutes.get('/searchExport', MaterialListController.searchExport)

export default materialListRoutes
