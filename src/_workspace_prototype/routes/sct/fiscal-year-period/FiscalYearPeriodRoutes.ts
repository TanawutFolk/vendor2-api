import { FiscalYearPeriodController } from '@src/_workspace/controllers/sct/fiscal-year-period/FiscalYearPeriodController'
import { Router } from 'express'

const fiscalYearPeriodRoutes = Router()

fiscalYearPeriodRoutes.post('/search', FiscalYearPeriodController.search)
fiscalYearPeriodRoutes.post('/create', FiscalYearPeriodController.create)
fiscalYearPeriodRoutes.post('/delete', FiscalYearPeriodController.delete)
fiscalYearPeriodRoutes.post('/update', FiscalYearPeriodController.update)

export default fiscalYearPeriodRoutes
