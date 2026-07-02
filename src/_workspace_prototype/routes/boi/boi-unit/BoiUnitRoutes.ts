import { boiUnitController } from '@src/_workspace/controllers/boi/BoiUnitController'
import { Router } from 'express'

const boiUnitRoutes = Router()

boiUnitRoutes.post('/search', boiUnitController.search)

boiUnitRoutes.get('/getByLikeSymbol', boiUnitController.GetByLikeBoiSymbol)

boiUnitRoutes.get('/getByLikeBoiUnitNameAndInuse', boiUnitController.getByLikeBoiUnitNameAndInuse)

boiUnitRoutes.get('/getByLikeBoiSymbolAndInuse', boiUnitController.getByLikeBoiSymbolAndInuse)

boiUnitRoutes.post('/create', boiUnitController.create)

boiUnitRoutes.patch('/update', boiUnitController.update)

boiUnitRoutes.delete('/delete', boiUnitController.delete)

// หากต้องการใช้ route ที่ถูกคอมเมนต์ไว้สามารถเปิดใช้งานได้
// boiUnitRoutes.get('/getByLikeBoiProjectNameAndInuse', boiUnitController.getByLikeBoiProjectNameAndInuse);

// boiUnitRoutes.get('/getByLikeBoiUnitByLikeBoiGroupNameAndBoiProjectIdAndInuse', boiUnitController.getByLikeBoiUnitByLikeBoiGroupNameAndBoiProjectIdAndInuse);

export default boiUnitRoutes
