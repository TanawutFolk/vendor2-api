import { StandardPriceController } from '@src/_workspace/controllers/manufacturing-item/StandardPriceController'
import { Router } from 'express'

const standardPriceRoutes = Router()

standardPriceRoutes.get('/search', StandardPriceController.search)
standardPriceRoutes.post('/search', StandardPriceController.search)
standardPriceRoutes.post('/create', StandardPriceController.create)
standardPriceRoutes.post('/downloadFileForExportStandardPrice', async (req, res) => {
  await StandardPriceController.downloadFileForExportStandardPrice(req, res)
})
standardPriceRoutes.get('/downloadFileForExport', async (req, res) => {
  const result = await StandardPriceController.downloadFileForExport(res)
  res.status(200).json(result)
})
// standardPriceRoutes.get('/getStandardPriceDetail', StandardPriceController.getStandardPriceDetail)
standardPriceRoutes.post('/delete', StandardPriceController.delete)

export default standardPriceRoutes
