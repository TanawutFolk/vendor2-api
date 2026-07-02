import { CostConditionSettingController } from '@src/_workspace/controllers/cost-condition/CostConditionSettingController'
import { Router } from 'express'

const costConditionSettingRoutes = Router()

costConditionSettingRoutes.post('/search', CostConditionSettingController.search)
costConditionSettingRoutes.post('/create', CostConditionSettingController.create)
costConditionSettingRoutes.post('/update', CostConditionSettingController.update)
costConditionSettingRoutes.post('/delete', CostConditionSettingController.delete)
costConditionSettingRoutes.post('/getByProductTypeId', CostConditionSettingController.getByProductTypeId)
costConditionSettingRoutes.post('/getUnsettledCount', CostConditionSettingController.getUnsettledCount)
costConditionSettingRoutes.post('/getUnsettledProductTypes', CostConditionSettingController.getUnsettledProductTypes)
costConditionSettingRoutes.post('/downloadFileForExportSearchResult', async (req, res) => {
  await CostConditionSettingController.downloadFileForExportSearchResult(req, res)
})
costConditionSettingRoutes.post('/downloadFileForExport', async (req, res) => {
  await CostConditionSettingController.downloadFileForExport(req, res)
})
costConditionSettingRoutes.get('/downloadFileForExport', async (req, res) => {
  await CostConditionSettingController.downloadFileForExport(req, res)
})
costConditionSettingRoutes.post('/createByImportFile', async (req, res) => {
  await CostConditionSettingController.createByImportFile(req, res)
})

export default costConditionSettingRoutes

