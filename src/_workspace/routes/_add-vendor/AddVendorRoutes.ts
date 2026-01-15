import { AddVendorController } from '@src/_workspace/controllers/_add-vendor/AddVendorController'
import { Router } from 'express'
import { validateData } from '@src/middlewares/validationMiddleware'
import { CheckDuplicateSchema, CreateVendorSchema } from './schema'

const addVendorRoutes = Router()

// Check duplicate vendor
addVendorRoutes.post('/check-duplicate', validateData(CheckDuplicateSchema), AddVendorController.checkDuplicate)

// Create new vendor
addVendorRoutes.post('/create', validateData(CreateVendorSchema), AddVendorController.create)

// Get master data for dropdowns
addVendorRoutes.post('/vendor-types', AddVendorController.getVendorTypes)
addVendorRoutes.post('/product-groups', AddVendorController.getProductGroups)

// Create new product group
addVendorRoutes.post('/create-product-group', AddVendorController.createProductGroup)

export default addVendorRoutes
