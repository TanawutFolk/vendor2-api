import { StandardPriceController } from '@src/_workspace/controllers/manufacturing-item/StandardPriceController'
import { Router } from 'express'

const standardPriceRoutes = Router()

standardPriceRoutes.get('/search', StandardPriceController.search)
standardPriceRoutes.post('/search', StandardPriceController.search)
standardPriceRoutes.post('/create', async (req, res) => {
  await StandardPriceController.create(req, res)
})
standardPriceRoutes.post('/createByImportFile', async (req, res) => {
  await StandardPriceController.createByImportFile(req, res)
})
standardPriceRoutes.post('/downloadFileForExportStandardPrice', async (req, res) => {
  await StandardPriceController.downloadFileForExportStandardPrice(req, res)
})
standardPriceRoutes.get('/downloadFileForExport', async (req, res) => {
  await StandardPriceController.downloadFileForExport(res)
})
// standardPriceRoutes.get('/getStandardPriceDetail', StandardPriceController.getStandardPriceDetail)
standardPriceRoutes.post('/delete', StandardPriceController.delete)

export default standardPriceRoutes
