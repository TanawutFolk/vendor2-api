import { SctPatternController } from '@src/_workspace/controllers/sct/SctPatternController'
import { validateData } from '@src/middlewares/validationMiddleware'

import { Router } from 'express'
import { z } from 'zod'

const SctPatternRoutes = Router()

SctPatternRoutes.get(
  '/getByLikePatternNameAndInuse',
  validateData(
    z.object({
      username: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
    })
  ),
  SctPatternController.getByLikePatternNameAndInuse
)

export default SctPatternRoutes
