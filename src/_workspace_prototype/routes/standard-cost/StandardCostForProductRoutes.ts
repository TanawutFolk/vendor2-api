import { StandardCostController } from '@src/_workspace/controllers/sct/StandardCostController'
import { StandardCostForProductController } from '@src/_workspace/controllers/sct/StandardCostForProductController'
import { Router } from 'express'
import SctCompareRoutes from '../sct/sct-for-product/SctCompareRoutes'

const standardCostForProductRoutes = Router()

standardCostForProductRoutes.get('/getCompletedSctAllData', StandardCostForProductController.getCompletedSctAllData)
standardCostForProductRoutes.get('/getSctFormDetail', StandardCostForProductController.getSctFormDetail)

standardCostForProductRoutes.route('/getSctDataDetail').get(StandardCostForProductController.getSctDataDetail).post(StandardCostForProductController.getSctDataDetail)

// standardCostForProductRoutes.get('/getCostConditionData', StandardCostForProductController.getCostConditionData)
standardCostForProductRoutes.get('/getYrGrData', StandardCostForProductController.getYrGrData)
standardCostForProductRoutes.get('/getTimeData', StandardCostForProductController.getTimeData)
standardCostForProductRoutes.get('/getMaterialPriceData', StandardCostForProductController.getMaterialPriceData)
standardCostForProductRoutes.get('/getYrAccumulationMaterialData', StandardCostForProductController.getYrAccumulationMaterialData)
standardCostForProductRoutes.get('/getSctCompareData', StandardCostForProductController.getSctCompareData)
standardCostForProductRoutes.get('/getSctDetailForAdjust', StandardCostForProductController.getSctDetailForAdjust)
standardCostForProductRoutes.get('/getSctDataOptionSelection', StandardCostForProductController.getSctDataOptionSelection)
standardCostForProductRoutes.get('/getSctDataFlowProcess', StandardCostForProductController.getSctDataFlowProcess)
standardCostForProductRoutes.get('/getSctDataMaterial', StandardCostForProductController.getSctDataMaterial)
standardCostForProductRoutes.post('/search', StandardCostForProductController.search)
standardCostForProductRoutes.post('/getAllWithWhereCondition_old_version', StandardCostForProductController.getAllWithWhereCondition_old_version)
standardCostForProductRoutes.get('/searchProductType', StandardCostForProductController.searchProductType)
standardCostForProductRoutes.get('/searchStandardFormProductType', StandardCostForProductController.searchStandardFormProductType)
standardCostForProductRoutes.post('/createSctData', StandardCostForProductController.createSctData)
standardCostForProductRoutes.post('/updateSctData', StandardCostForProductController.updateSctData)
standardCostForProductRoutes.post('/updateSctForm', StandardCostForProductController.update)
standardCostForProductRoutes.post('/createSctForm', StandardCostForProductController.create)
standardCostForProductRoutes.post('/deleteSctForm', StandardCostForProductController.deleteSctForm)
standardCostForProductRoutes.post('/createSctFormMultiple', StandardCostForProductController.createSctFormMultiple)
standardCostForProductRoutes.post('/createDraftSctFormMultiple', StandardCostForProductController.createSctFormMultiple)
standardCostForProductRoutes.post('/changeSctProgress', StandardCostForProductController.changeSctProgress)
standardCostForProductRoutes.post('/deleteSctData', StandardCostForProductController.deleteSctData)
standardCostForProductRoutes.post('/getTotalYR', StandardCostForProductController.getTotalYR)
standardCostForProductRoutes.get('/getTotalYR', StandardCostForProductController.getTotalYR)
standardCostForProductRoutes.get('/getSctReCalButton', StandardCostForProductController.getSctReCalButton)
standardCostForProductRoutes.post('/getSctReCalButton', StandardCostForProductController.getSctReCalButton)
standardCostForProductRoutes.post('/updateSctTagBudget', StandardCostForProductController.updateSctTagBudget)

// for clear time sct
standardCostForProductRoutes.post('/getByLikeSctTagSettingNameAndInuse', StandardCostController.getByLikeSctTagSettingNameAndInuse)
standardCostForProductRoutes.post('/getByLikeSctReasonSettingNameAndInuse', StandardCostController.getByLikeSctReasonSettingNameAndInuse)

standardCostForProductRoutes.use('/sct-compare', SctCompareRoutes)

export default standardCostForProductRoutes
