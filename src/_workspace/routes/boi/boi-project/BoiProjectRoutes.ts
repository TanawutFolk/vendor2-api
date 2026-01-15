import { boiProjectController } from '@src/_workspace/controllers/boi/BoiProjectController'
import { Router } from 'express'

const boiProjectRoutes = Router()

boiProjectRoutes.post('/search', boiProjectController.search)

boiProjectRoutes.get('/getByLikeBoiProjectCodeAndInuse', boiProjectController.getByLikeBoiProjectCodeAndInuse)

boiProjectRoutes.get('/getByLikeBoiProductGroupAndInuse', boiProjectController.getByLikeBoiProductGroupAndInuse)

boiProjectRoutes.post('/create', boiProjectController.create)

boiProjectRoutes.patch('/update', boiProjectController.update)

boiProjectRoutes.delete('/delete', boiProjectController.delete)

boiProjectRoutes.get('/getByLikeBoiProjectNameAndInuse', boiProjectController.getByLikeBoiProjectNameAndInuse)
boiProjectRoutes.get('/getBoiProjectGroupNameByLike', boiProjectController.getBoiProjectGroupNameByLike)
export default boiProjectRoutes
