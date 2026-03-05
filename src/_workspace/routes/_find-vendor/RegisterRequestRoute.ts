import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { RegisterRequestController } from '@src/_workspace/controllers/_find-vendor/RegisterRequestController'

// --- Multer Configuration (Local Disk Storage) ---
// Files will be saved to: <project_root>/uploads/documents/
// When ready to switch to Azure, only this section needs to change.
const uploadsDir = path.join(process.cwd(), 'uploads', 'documents')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (_req, file, cb) => {
        // Generate a unique filename: timestamp_originalname
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, `${uniquePrefix}${ext}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB per file
})

const registerRequestRoutes = Router()

// POST /register-request/create  — accepts multipart/form-data with optional file uploads
registerRequestRoutes.post('/create', upload.array('files'), RegisterRequestController.create)

// POST /register-request/getAll
registerRequestRoutes.post('/getAll', RegisterRequestController.getAll)

// POST /register-request/getById
registerRequestRoutes.post('/getById', RegisterRequestController.getById)

// POST /register-request/updateStatus
registerRequestRoutes.post('/updateStatus', RegisterRequestController.updateStatus)

export default registerRequestRoutes
