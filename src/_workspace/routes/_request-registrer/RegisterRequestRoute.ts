import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { RegisterRequestController } from '@src/_workspace/controllers/_request-registrer/RegisterRequestController'

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
registerRequestRoutes.post('/createRequestVendor', upload.array('files'), RegisterRequestController.create)

// POST /register-request/searchRequest
registerRequestRoutes.post('/searchRequest', RegisterRequestController.getAll)

// POST /register-request/getById
registerRequestRoutes.post('/getById', RegisterRequestController.getById)

// POST /register-request/updateRequest  — PIC แก้ไขข้อมูลคำขอ
registerRequestRoutes.post('/updateRequest', RegisterRequestController.updateRequest)

// POST /register-request/updateStatus
registerRequestRoutes.post('/updateStatus', RegisterRequestController.updateStatus)

// POST /register-request/sendAgreementEmail
registerRequestRoutes.post('/sendAgreementEmail', RegisterRequestController.sendAgreementEmail)

// GET /register-request/getStatusOptions
registerRequestRoutes.get('/getStatusOptions', RegisterRequestController.getStatusOptions)

// POST /register-request/getApprovalSteps
registerRequestRoutes.post('/getApprovalSteps', RegisterRequestController.getApprovalSteps)

// POST /register-request/getApprovalLogs
registerRequestRoutes.post('/getApprovalLogs', RegisterRequestController.getApprovalLogs)

// POST /register-request/createApprovalStep
registerRequestRoutes.post('/createApprovalStep', RegisterRequestController.createApprovalStep)

// POST /register-request/updateApprovalStep
registerRequestRoutes.post('/updateApprovalStep', RegisterRequestController.updateApprovalStep)

// POST /register-request/updateCcEmails
registerRequestRoutes.post('/updateCcEmails', RegisterRequestController.updateCcEmails)

// POST /register-request/reassign
registerRequestRoutes.post('/reassign', RegisterRequestController.reassign)

// POST /register-request/completeRegistration
registerRequestRoutes.post('/completeRegistration', RegisterRequestController.completeRegistration)

// POST /register-request/saveGprForm
registerRequestRoutes.post('/saveGprForm', RegisterRequestController.saveGprForm)

// POST /register-request/saveGprCNotification
registerRequestRoutes.post('/saveGprCNotification', RegisterRequestController.saveGprCNotification)

// POST /register-request/gpr-c/get-flow
registerRequestRoutes.post('/gpr-c/get-flow', RegisterRequestController.gprCGetFlow)

// POST /register-request/gpr-c/submit-setup
registerRequestRoutes.post('/gpr-c/submit-setup', RegisterRequestController.gprCSubmitSetup)

// POST /register-request/gpr-c/approve-step
registerRequestRoutes.post('/gpr-c/approve-step', RegisterRequestController.gprCApproveStep)

// POST /register-request/gpr-c/reject-step
registerRequestRoutes.post('/gpr-c/reject-step', RegisterRequestController.gprCRejectStep)

// POST /register-request/gpr-c/action-required
registerRequestRoutes.post('/gpr-c/action-required', RegisterRequestController.gprCActionRequired)

// POST /register-request/gpr-c/record-action-result
registerRequestRoutes.post('/gpr-c/record-action-result', RegisterRequestController.gprCRecordActionResult)

// POST /register-request/gpr-c/queue
registerRequestRoutes.post('/gpr-c/queue', RegisterRequestController.gprCQueue)

// POST /register-request/gpr-c/task-manager-queue
registerRequestRoutes.post('/gpr-c/task-manager-queue', RegisterRequestController.gprCTaskManagerQueue)

// POST /register-request/gpr-c/action-required-queue
registerRequestRoutes.post('/gpr-c/action-required-queue', RegisterRequestController.gprCActionRequiredQueue)

// POST /register-request/resolveEmployeeProfile
registerRequestRoutes.post('/resolveEmployeeProfile', RegisterRequestController.resolveEmployeeProfile)

// POST /register-request/getGprForm
registerRequestRoutes.post('/getGprForm', RegisterRequestController.getGprForm)

// POST /register-request/addDocument  — single file upload for a request (GPR criteria docs, PDF export, etc.)
registerRequestRoutes.post('/addDocument', upload.single('file'), RegisterRequestController.addDocument)

export default registerRequestRoutes
