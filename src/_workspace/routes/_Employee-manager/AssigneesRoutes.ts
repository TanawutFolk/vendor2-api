import { Router } from 'express'
import { AssigneesController } from '../../controllers/_Employee-manager/AssigneesController'

const router = Router()

router.post('/getGroups', AssigneesController.getGroups)
router.post('/search', AssigneesController.search)
router.post('/save', AssigneesController.save)

// Compatibility alias used by the current frontend.
router.post('/groups', AssigneesController.getGroups)

export default router
