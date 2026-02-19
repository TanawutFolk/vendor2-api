import { AddVendorController } from '@src/_workspace/controllers/_add-vendor/AddVendorController'
import { Router } from 'express'
import { validateData } from '@src/middlewares/validationMiddleware'
import { CheckDuplicateSchema, CreateVendorSchema } from './validateSchema'

const addVendorRoutes = Router()

addVendorRoutes.post('/check-duplicate', validateData(CheckDuplicateSchema), AddVendorController.checkDuplicate)
addVendorRoutes.post('/CreateVendor', validateData(CreateVendorSchema), AddVendorController.create)
addVendorRoutes.post('/vendor-types', AddVendorController.getVendorTypes)
addVendorRoutes.post('/product-groups', AddVendorController.getProductGroups)
addVendorRoutes.post('/create-product-group', AddVendorController.createProductGroup)

export default addVendorRoutes
