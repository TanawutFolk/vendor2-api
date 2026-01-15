import { ItemPurposeController } from '@src/_workspace/controllers/item-purpose/ItemPurposeController'
import { Router } from 'express'

const itemPurposeRoutes = Router()

itemPurposeRoutes.get('/getByLikeItemPurposeNameAndInuse', ItemPurposeController.getByLikeItemPurposeNameAndInuse)

export default itemPurposeRoutes
