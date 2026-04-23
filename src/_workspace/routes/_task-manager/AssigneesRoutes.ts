import { Router } from 'express'
import { AssigneesController } from '../../controllers/_task-manager/AssigneesController'

const router = Router()

router.post('/groups', AssigneesController.getGroups)
router.post('/search', AssigneesController.search)
router.post('/save', AssigneesController.save)

export default router
