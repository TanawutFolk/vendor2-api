import { Router } from 'express'
import { AllRequestHistoryController } from '@src/_workspace/controllers/_all-request-history/AllRequestHistoryController'

const allRequestHistoryRoutes = Router()

allRequestHistoryRoutes.post('/search', AllRequestHistoryController.search)
allRequestHistoryRoutes.post('/getFilterOptions', AllRequestHistoryController.getFilterOptions)
allRequestHistoryRoutes.post('/getById', AllRequestHistoryController.getById)

// Compatibility aliases used by the current frontend.
allRequestHistoryRoutes.post('/filter-options', AllRequestHistoryController.getFilterOptions)
allRequestHistoryRoutes.post('/details', AllRequestHistoryController.getById)

export default allRequestHistoryRoutes
