import fs from 'fs'
import multer from 'multer'
import path from 'path'

const uploadsDir = path.join(process.cwd(), 'uploads', 'documents')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${uniquePrefix}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
})

export const uploadRequestDocuments = upload.array('files')
export const uploadSingleRequestDocument = upload.single('file')
