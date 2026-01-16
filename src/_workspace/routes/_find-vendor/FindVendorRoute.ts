import { FindVendorController } from '@src/_workspace/controllers/_find-vendor/FindVendorController'
import { Router } from 'express'

const findVendorRoutes = Router()

// Search vendors
findVendorRoutes.post('/search', FindVendorController.search)

// Get vendor by ID
findVendorRoutes.post('/getById', FindVendorController.getById)

// Update vendor
findVendorRoutes.post('/update', FindVendorController.update)

// Dropdowns
findVendorRoutes.post('/dropdown/vendor-types', FindVendorController.getVendorTypes)
findVendorRoutes.post('/dropdown/provinces', FindVendorController.getProvinces)
findVendorRoutes.post('/dropdown/product-groups', FindVendorController.getProductGroups)

export default findVendorRoutes
