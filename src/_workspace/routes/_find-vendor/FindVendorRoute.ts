import { FindVendorController } from '@src/_workspace/controllers/_find-vendor/FindVendorController'
import { Router } from 'express'

const findVendorRoutes = Router()

// Search vendors
findVendorRoutes.post('/search', FindVendorController.search)

export default findVendorRoutes
