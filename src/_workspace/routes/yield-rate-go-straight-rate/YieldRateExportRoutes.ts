import { GetYieldRateExport } from '@src/_workspace/controllers/yield-rate-and-go-straight-rate/YieldRateExportController'
import { CreateYieldRate, getAll } from '@src/_workspace/controllers/yield-rate-and-go-straight-rate/YieldRateImportController'
import { Router } from 'express'

const YieldRateExportRoutes = Router()

YieldRateExportRoutes.route('/yield-rate-export').get(GetYieldRateExport).post(GetYieldRateExport)

YieldRateExportRoutes.get('/yield-rate-import', CreateYieldRate)
YieldRateExportRoutes.post('/yield-rate-import', CreateYieldRate)

YieldRateExportRoutes.get('/getAll', getAll)
YieldRateExportRoutes.post('/getAll', getAll)

export default YieldRateExportRoutes
