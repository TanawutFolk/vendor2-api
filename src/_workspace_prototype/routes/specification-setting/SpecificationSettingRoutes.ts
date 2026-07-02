import { SpecificationSettingController } from '@src/_workspace/controllers/specification-setting/SpecificationSettingController'
import { Router } from 'express'

const SpecificationSettingRoutes = Router()

SpecificationSettingRoutes.get('/search', SpecificationSettingController.search)
SpecificationSettingRoutes.post('/search', SpecificationSettingController.search)

SpecificationSettingRoutes.post('/create', SpecificationSettingController.create)
SpecificationSettingRoutes.delete('/delete', SpecificationSettingController.delete)
SpecificationSettingRoutes.patch('/update', SpecificationSettingController.update)
SpecificationSettingRoutes.get('/getByLikeSpecificationSettingAndInuse', SpecificationSettingController.getByLikeSpecificationSettingAndInuse)
export default SpecificationSettingRoutes
