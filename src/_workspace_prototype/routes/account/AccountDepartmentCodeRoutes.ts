import { AccountDepartmentCodeController } from '@src/_workspace/controllers/account/AccountDepartmentCodeController'
import { Router } from 'express'

const AccountDepartmentCodeRoutes = Router()

AccountDepartmentCodeRoutes.get('/search', AccountDepartmentCodeController.search)
AccountDepartmentCodeRoutes.post('/search', AccountDepartmentCodeController.search)

AccountDepartmentCodeRoutes.post('/create', AccountDepartmentCodeController.create)
AccountDepartmentCodeRoutes.delete('/delete', AccountDepartmentCodeController.delete)
AccountDepartmentCodeRoutes.patch('/update', AccountDepartmentCodeController.update)
AccountDepartmentCodeRoutes.get('/getByLikeAccountDepartmentCodeAndInuse', AccountDepartmentCodeController.getByLikeAccountDepartmentCodeAndInuse)
AccountDepartmentCodeRoutes.post(
  '/getAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse',
  AccountDepartmentCodeController.getAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse
)

export default AccountDepartmentCodeRoutes
