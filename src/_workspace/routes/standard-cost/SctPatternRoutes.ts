import { SctPatternController } from '@src/_workspace/controllers/sct/SctPatternController'
import { Router } from 'express'

const SctPatternRoutes = Router()

SctPatternRoutes.post('/getByLikePatternNameAndInuse', SctPatternController.getByLikePatternNameAndInuse)

export default SctPatternRoutes
