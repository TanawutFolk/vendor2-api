import { BomFlowProcessItemUsageController } from '@src/_workspace/controllers/bom/BomFlowProcessItemUsageController'
import { validateData } from '@src/middlewares/validationMiddleware'

import { Router } from 'express'
import { z } from 'zod'

const BomFlowProcessItemUsageRoutes = Router()

BomFlowProcessItemUsageRoutes.post(
  '/getByProductTypeCodeAndProcessName',
  validateData(
    z.object({
      PRODUCT_TYPE_CODE: z.string(),
      PROCESS_NAME: z.string(),
    })
  ),
  BomFlowProcessItemUsageController.getByProductTypeCodeAndProcessName
)

BomFlowProcessItemUsageRoutes.post(
  '/getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId',
  validateData(
    z.object({
      BOM_ID: z.number(),
    })
  ),
  BomFlowProcessItemUsageController.getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId
)

export default BomFlowProcessItemUsageRoutes
