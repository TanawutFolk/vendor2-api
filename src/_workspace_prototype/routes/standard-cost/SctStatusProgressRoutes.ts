import { SctStatusProgressController } from '@src/_workspace/controllers/sct/SctStatusProgressController'
import { Router } from 'express'

const SctStatusProgressRoutes = Router()

SctStatusProgressRoutes.post('/getByLikeSctStatusProgressNameAndInuse', SctStatusProgressController.getByLikeSctStatusProgressNameAndInuse)
SctStatusProgressRoutes.post('/getBySctStatusProgressNameAndInuse_withDisabledOption', SctStatusProgressController.getBySctStatusProgressNameAndInuse_withDisabledOption)

export default SctStatusProgressRoutes
