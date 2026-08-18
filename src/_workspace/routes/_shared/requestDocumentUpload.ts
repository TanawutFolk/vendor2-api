import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})

export const uploadRequestDocuments = upload.array('files')
export const uploadSingleRequestDocument = upload.single('file')
