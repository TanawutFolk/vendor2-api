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
blacklistRoutes.post('/us/search', BlacklistUSController.search)
blacklistRoutes.post('/us/import', upload.single('file'), BlacklistUSController.importFile)

// ─── CN ──────────────────────────────────────────────────────
blacklistRoutes.post('/cn/search', BlacklistCNController.search)
blacklistRoutes.post('/cn/import', upload.single('file'), BlacklistCNController.importFile)

export default blacklistRoutes
