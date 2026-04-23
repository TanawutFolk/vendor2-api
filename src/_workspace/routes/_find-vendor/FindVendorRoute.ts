import { FindVendorController } from '@src/_workspace/controllers/_find-vendor/FindVendorController'
import { validateData } from '@src/middlewares/validationMiddleware'
import {
    SearchVendorSchema,
    GetVendorByIdSchema,
    UpdateVendorSchema,
    ExportVendorSchema
} from './validateSchema'
import { Router } from 'express'

const findVendorRoutes = Router()

findVendorRoutes.post('/search', validateData(SearchVendorSchema), FindVendorController.search)
findVendorRoutes.post('/getById', validateData(GetVendorByIdSchema), FindVendorController.getById)
findVendorRoutes.post('/update', validateData(UpdateVendorSchema), FindVendorController.update)
findVendorRoutes.post('/dropdown/vendor-types', FindVendorController.getVendorTypes)
findVendorRoutes.post('/dropdown/provinces', FindVendorController.getProvinces)
findVendorRoutes.post('/dropdown/product-groups', FindVendorController.getProductGroups)
findVendorRoutes.post('/dropdown/prones-Check', FindVendorController.getPronesData)
findVendorRoutes.post('/dropdown/vendor-names', FindVendorController.getAllVendorNames)
findVendorRoutes.post('/downloadFileForExport', FindVendorController.downloadFileForExport)
findVendorRoutes.post('/deleteContact', FindVendorController.deleteVendorContact)
findVendorRoutes.post('/deleteProduct', FindVendorController.deleteVendorProduct)
findVendorRoutes.post('/prones-data-all', FindVendorController.getPronesDataAll)
findVendorRoutes.post('/prones-test/raw', FindVendorController.getPronesRawTest)
export default findVendorRoutes
