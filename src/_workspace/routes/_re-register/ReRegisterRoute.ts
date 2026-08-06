import { ReRegisterController } from '@src/_workspace/controllers/_re-register/ReRegisterController'
import { validateData } from '@src/middlewares/validationMiddleware'
import { Router } from 'express'

import {
  ReRegisterDeleteSchema,
  ReRegisterDetailSchema,
  ReRegisterSearchSchema,
  ReRegisterUpdateSchema,
} from './validateSchema'

const reRegisterRoutes = Router()

reRegisterRoutes.post('/search', validateData(ReRegisterSearchSchema), ReRegisterController.search)
reRegisterRoutes.post('/getVendorDetail', validateData(ReRegisterDetailSchema), ReRegisterController.getVendorDetail)
reRegisterRoutes.post('/updateComprehensive', validateData(ReRegisterUpdateSchema), ReRegisterController.updateComprehensive)
reRegisterRoutes.post('/deleteVendor', validateData(ReRegisterDeleteSchema), ReRegisterController.deleteVendor)
reRegisterRoutes.post('/downloadFileForExport', ReRegisterController.downloadFileForExport)
reRegisterRoutes.post('/getVendorTypes', ReRegisterController.getVendorTypes)
reRegisterRoutes.post('/getProvinces', ReRegisterController.getProvinces)
reRegisterRoutes.post('/getCountries', ReRegisterController.getCountries)
reRegisterRoutes.post('/getProductGroups', ReRegisterController.getProductGroups)

// Compatibility aliases used by the current frontend.
reRegisterRoutes.post('/update-comprehensive', validateData(ReRegisterUpdateSchema), ReRegisterController.updateComprehensive)
reRegisterRoutes.post('/delete-vendor', validateData(ReRegisterDeleteSchema), ReRegisterController.deleteVendor)
reRegisterRoutes.post('/download-file-for-export', ReRegisterController.downloadFileForExport)
reRegisterRoutes.post('/dropdown/vendor-types', ReRegisterController.getVendorTypes)
reRegisterRoutes.post('/dropdown/provinces', ReRegisterController.getProvinces)
reRegisterRoutes.post('/dropdown/countries', ReRegisterController.getCountries)
reRegisterRoutes.post('/dropdown/product-groups', ReRegisterController.getProductGroups)

export default reRegisterRoutes
