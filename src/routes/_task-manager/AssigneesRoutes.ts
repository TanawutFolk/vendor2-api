import { Router } from 'express'
import { AssigneesController } from '../../_workspace/controllers/_task-manager/AssigneesController'

const router = Router()

router.post('/search', AssigneesController.search)
router.post('/save', AssigneesController.save)
router.delete('/:id', AssigneesController.delete)

export default router
