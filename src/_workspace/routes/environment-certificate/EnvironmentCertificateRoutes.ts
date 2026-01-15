import { EnvironmentCertificateController } from '@src/_workspace/controllers/environment-certificate/EnvironmentCertificateController'
import { Router } from 'express'

const environmentCertificateRoutes = Router()

environmentCertificateRoutes.get('/search', EnvironmentCertificateController.search)
environmentCertificateRoutes.post('/create', EnvironmentCertificateController.create)
environmentCertificateRoutes.patch('/update', EnvironmentCertificateController.update)
environmentCertificateRoutes.delete('/delete', EnvironmentCertificateController.delete)
environmentCertificateRoutes.post('/getAllByLikeInuse', EnvironmentCertificateController.getAllByLikeInuse)

export default environmentCertificateRoutes
