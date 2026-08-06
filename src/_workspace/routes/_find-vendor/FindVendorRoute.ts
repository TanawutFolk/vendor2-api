import { FindVendorController } from '@src/_workspace/controllers/_find-vendor/FindVendorController'
import { validateData } from '@src/middlewares/validationMiddleware'
import {
  SearchVendorSchema,
  VendorDetailsSchema,
  UpdateVendorSchema,
  UpdateVendorComprehensiveSchema,
  DeleteVendorSchema,
} from './validateSchema'
import { Router } from 'express'

const findVendorRoutes = Router()

findVendorRoutes.post('/search', validateData(SearchVendorSchema), FindVendorController.search)
findVendorRoutes.post('/getVendorDetail', validateData(VendorDetailsSchema), FindVendorController.getVendorDetail)
findVendorRoutes.post('/update', validateData(UpdateVendorSchema), FindVendorController.update)
findVendorRoutes.post('/updateComprehensive', validateData(UpdateVendorComprehensiveSchema), FindVendorController.updateComprehensive)
findVendorRoutes.post('/deleteVendor', validateData(DeleteVendorSchema), FindVendorController.deleteVendor)
findVendorRoutes.post('/getVendorBusinessCategoryName', FindVendorController.getVendorBusinessCategoryName)
findVendorRoutes.post('/getProvinces', FindVendorController.getProvinces)
findVendorRoutes.post('/getCountries', FindVendorController.getCountries)
findVendorRoutes.post('/getProductGroups', FindVendorController.getProductGroups)
findVendorRoutes.post('/getAllVendorNames', FindVendorController.getAllVendorNames)
findVendorRoutes.post('/downloadFileForExport', FindVendorController.downloadFileForExport)
findVendorRoutes.post('/deleteContact', FindVendorController.deleteVendorContact)
findVendorRoutes.post('/deleteProduct', FindVendorController.deleteVendorProduct)
findVendorRoutes.post('/getPronesRawTest', FindVendorController.getPronesRawTest)

// Compatibility aliases used by the current frontend.
findVendorRoutes.post('/SearchVendor', validateData(SearchVendorSchema), FindVendorController.search)
findVendorRoutes.post('/update-comprehensive', validateData(UpdateVendorComprehensiveSchema), FindVendorController.updateComprehensive)
findVendorRoutes.post('/dropdown/vendor-business-category-name', FindVendorController.getVendorBusinessCategoryName)
findVendorRoutes.post('/dropdown/provinces', FindVendorController.getProvinces)
findVendorRoutes.post('/dropdown/countries', FindVendorController.getCountries)
findVendorRoutes.post('/dropdown/product-groups', FindVendorController.getProductGroups)
findVendorRoutes.post('/dropdown/vendor-names', FindVendorController.getAllVendorNames)
findVendorRoutes.post('/prones-test/raw', FindVendorController.getPronesRawTest)
export default findVendorRoutes
