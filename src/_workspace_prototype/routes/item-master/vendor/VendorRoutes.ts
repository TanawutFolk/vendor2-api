import { VendorController } from '@src/_workspace/controllers/item-master/vendor/VendorController'
import { Router } from 'express'

const vendorRoutes = Router()

vendorRoutes.get('/get', VendorController.getVendor)

vendorRoutes.get('/getByLikeVendorNameAndInuse', VendorController.getByLikeVendorAlphabetAndInuse)

vendorRoutes.get('/getItemImportType', VendorController.getItemImportType)

vendorRoutes.post('/search', VendorController.searchVendor)

vendorRoutes.post('/create', VendorController.createVendor)

vendorRoutes.patch('/update', VendorController.updateVendor)

vendorRoutes.delete('/delete', VendorController.deleteVendor)

vendorRoutes.get('/getByLikeVendorName', VendorController.getByLikeVendorName)

vendorRoutes.get('/getByLikeVendorAlphabetAndInuse', VendorController.getByLikeVendorAlphabetAndInuse)

vendorRoutes.get('/getByLikeVendorNameAndImportType', VendorController.getByLikeVendorNameAndImportType)

export default vendorRoutes
