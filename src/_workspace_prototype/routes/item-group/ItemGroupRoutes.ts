import { ItemGroupController } from '@src/_workspace/controllers/item-group/ItemGroupController'

import { Router } from 'express'

const itemGroupRoutes = Router()

itemGroupRoutes.get('/getByLikeItemGroupName', ItemGroupController.getByLikeItemGroupName)

export default itemGroupRoutes
