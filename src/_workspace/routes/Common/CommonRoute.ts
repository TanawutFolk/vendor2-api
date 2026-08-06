import { CommonController } from '@src/_workspace/controllers/Common/CommonController'
import { Router } from 'express'

const commonRoutes = Router()

commonRoutes.post('/getByLikeMonthShortNameEnglish', CommonController.getByLikeMonthShortNameEnglish)
commonRoutes.post('/getImageFromUrl', CommonController.getImageFromUrl)
commonRoutes.post('/getImageArrayFromUrl', CommonController.getImageArrayFromUrl)
commonRoutes.get('/getYearNow', CommonController.getYearNow)

commonRoutes.get('/getImageEmployeeFromUrl', CommonController.getImageEmployeeFromUrl)
commonRoutes.post('/getImageEmployeeFromUrl', CommonController.getImageEmployeeFromUrl)

// Compatibility alias for the previous route casing.
commonRoutes.post('/GetByLikeMonthShortNameEnglish', CommonController.getByLikeMonthShortNameEnglish)

export default commonRoutes
