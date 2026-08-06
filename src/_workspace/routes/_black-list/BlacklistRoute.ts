import { Router } from 'express'
import multer from 'multer'
import { BlacklistController } from '@src/_workspace/controllers/_black-list/BlacklistController'
import { BlacklistUSController, BlacklistCNController } from '@src/_workspace/controllers/_black-list/BlacklistController'

const blacklistRoutes = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})

// ─── US ──────────────────────────────────────────────────────
blacklistRoutes.post('/search', BlacklistController.search)
blacklistRoutes.post('/searchUS', BlacklistUSController.search)
blacklistRoutes.post('/importUS', upload.single('file'), BlacklistUSController.importFile)
blacklistRoutes.post('/searchCN', BlacklistCNController.search)
blacklistRoutes.post('/importCN', upload.single('file'), BlacklistCNController.importFile)

// Compatibility aliases used by the current frontend.
blacklistRoutes.post('/us/search', BlacklistUSController.search)
blacklistRoutes.post('/us/import', upload.single('file'), BlacklistUSController.importFile)

// ─── CN ──────────────────────────────────────────────────────
blacklistRoutes.post('/cn/search', BlacklistCNController.search)
blacklistRoutes.post('/cn/import', upload.single('file'), BlacklistCNController.importFile)

export default blacklistRoutes
