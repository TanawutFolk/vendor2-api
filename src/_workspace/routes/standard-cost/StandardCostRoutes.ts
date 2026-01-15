import { StandardCostController } from '@src/_workspace/controllers/sct/StandardCostController'
import { Router } from 'express'

const standardCostRoutes = Router()

standardCostRoutes.post('/getByLikeSctPatternName', StandardCostController.getByLikeSctPatternName)
standardCostRoutes.post('/getSctByLikeProductTypeIdAndCondition', StandardCostController.getSctByLikeProductTypeIdAndCondition)
standardCostRoutes.post('/getByLikeSctTagSettingNameAndInuse', StandardCostController.getByLikeSctTagSettingNameAndInuse)
standardCostRoutes.post('/getByLikeSctReasonSettingNameAndInuse', StandardCostController.getByLikeSctReasonSettingNameAndInuse)

standardCostRoutes.route('/searchSctCodeForSelection').get(StandardCostController.searchSctCodeForSelection).post(StandardCostController.searchSctCodeForSelection)

standardCostRoutes.get('/searchProductSubBySctNo', StandardCostController.searchProductSubBySctNo)
standardCostRoutes.get('/searchMaterialPackingAndRawMatBySctNo', StandardCostController.searchMaterialPackingAndRawMatBySctNo)
standardCostRoutes.post('/searchSctCodeForSelectionMaterialPrice', StandardCostController.searchSctCodeForSelectionMaterialPrice)
standardCostRoutes.post('/get', StandardCostController.get)

export default standardCostRoutes
