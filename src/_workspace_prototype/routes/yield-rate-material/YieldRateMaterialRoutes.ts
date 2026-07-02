import { YieldRateMaterialController } from '@src/_workspace/controllers/yield-rate-material/YieldRateMaterialController'
import { GetYieldRateMaterialExport } from '@src/_workspace/controllers/yield-rate-material/YieldRateMaterialExportController'
import { CreateYieldRateMaterial } from '@src/_workspace/controllers/yield-rate-material/YieldRateMaterialImportController'
import { Router } from 'express'

const YieldRateMaterialRoutes = Router()

YieldRateMaterialRoutes.post('/search', YieldRateMaterialController.search)

YieldRateMaterialRoutes.get('/yield-rate-material-export', GetYieldRateMaterialExport)
YieldRateMaterialRoutes.post('/yield-rate-material-export', GetYieldRateMaterialExport)

YieldRateMaterialRoutes.get('/yield-rate-material-import', CreateYieldRateMaterial)
YieldRateMaterialRoutes.post('/yield-rate-material-import', CreateYieldRateMaterial)
YieldRateMaterialRoutes.post('/createMaterialYieldRateData', YieldRateMaterialController.createMaterialYieldRateData)

export default YieldRateMaterialRoutes
