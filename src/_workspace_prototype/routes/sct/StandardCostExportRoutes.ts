import { Router } from 'express'

import { GetSctExportNoneFormula } from '@src/_workspace/controllers/sct/SctExport/SctExportNoneFormulaController'
import { GetSctExportWithFormula } from '@src/_workspace/controllers/sct/SctExport/SctExportWithFormulaController'
import { StandardCostExportController } from '@src/_workspace/controllers/sct/StandardCostExportController'

const SctExportRoutes = Router()

SctExportRoutes.route('/sct-export').get(GetSctExportNoneFormula).post(GetSctExportNoneFormula)
SctExportRoutes.route('/sct-export-formula').get(GetSctExportWithFormula).post(GetSctExportWithFormula)

SctExportRoutes.post('/getSubAssyBySctId', StandardCostExportController.getSubAssyBySctId)
// SctExportRoutes.post('/getSubAssyByProductTypeId', StandardCostExportController.getSubAssyByProductTypeId)

SctExportRoutes.post('/searchSctExport', StandardCostExportController.search)
SctExportRoutes.post('/searchProductTypeExport', StandardCostExportController.searchByProductTypeId)

export default SctExportRoutes
