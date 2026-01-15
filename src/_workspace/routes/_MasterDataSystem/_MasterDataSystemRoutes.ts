import { MasterDataSystemController } from '@src/_workspace/controllers/_MasterDataSystem/_MasterDataSystemController'
import { Router } from 'express'

const MasterDataSystemRoutes = Router()

MasterDataSystemRoutes.post('/getItemCodeInBomOfProduct', MasterDataSystemController.getItemCodeInBomOfProduct)

export default MasterDataSystemRoutes
