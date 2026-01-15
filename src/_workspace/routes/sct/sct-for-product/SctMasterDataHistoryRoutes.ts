import { SctMasterDataHistoryController } from '@src/_workspace/controllers/sct/sct-for-product/SctMasterDataHistoryController'
import { Router } from 'express'

const SctMasterDataHistoryRoutes = Router()

SctMasterDataHistoryRoutes.post('/getBySctIdAndIsFromSctCopy', SctMasterDataHistoryController.getBySctIdAndIsFromSctCopy)

export default SctMasterDataHistoryRoutes
