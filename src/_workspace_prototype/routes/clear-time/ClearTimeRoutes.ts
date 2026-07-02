import { GetClearTimeExport } from '@src/_workspace/controllers/clear-time/ClearTimeExportController'
import { CreateClearTime } from '@src/_workspace/controllers/clear-time/ClearTimeImportController'

import { Router } from 'express'

const ClearTimeRoutes = Router()

// ClearTimeRoutes.post('/search', ClearTimeController.search)

ClearTimeRoutes.route('/clear-time-export').get(GetClearTimeExport).post(GetClearTimeExport)
ClearTimeRoutes.route('/clear-time-import').get(CreateClearTime).post(CreateClearTime)

export default ClearTimeRoutes
