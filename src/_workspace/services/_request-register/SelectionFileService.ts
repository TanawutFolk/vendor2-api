import fs from 'fs'
import path from 'path'

// ── Configuration ────────────────────────────────────────────────────────────
// Base path for Selection Supplier file storage.
// Production: use a server/network share path.
// Dev/Test: uses local C: drive.
const DEFAULT_SELECTION_FILE_BASE_PATH = 'C:\\c01_qms\\PM\\02_Record\\FM-PM-303 Selection Supplier\\01.Selection_File'

// Upload directory where multer stores temporary files
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'documents')

const getSelectionFileBasePath = () => process.env.SELECTION_FILE_BASE_PATH || DEFAULT_SELECTION_FILE_BASE_PATH

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sanitize a string for use as part of a file/folder name.
 * Removes characters that are invalid in Windows file paths.
 */
const sanitizeForFileName = (text: string): string =>
  text
    .replace(/[<>:"/\\|?*]/g, '')   // remove invalid Windows file name chars
    .replace(/\s+/g, '_')           // spaces → underscores
    .replace(/_+/g, '_')            // collapse multiple underscores
    .replace(/^_|_$/g, '')          // trim leading/trailing underscores

const ensureFileExists = (filePath: string, context: string) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${context} file not found: ${filePath}`)
  }
}

// ── Service ──────────────────────────────────────────────────────────────────

export const SelectionFileService = {
  /**
   * Create the folder structure for a request:
   *   {basePath}/{year}/{requestNumber}/00.Sending
   *   {basePath}/{year}/{requestNumber}/01.Receiving
   *
   * Idempotent: if folders already exist, no error is thrown.
   *
   * @param requestNumber - e.g. "RQ-2026-001"
   * @param year          - CE year, defaults to current year
   */
  createFolderStructure(requestNumber: string, year?: number) {
    const folderYear = year || new Date().getFullYear()
    const requestPath = path.join(getSelectionFileBasePath(), String(folderYear), requestNumber)
    const sendingPath = path.join(requestPath, '00.Sending')
    const receivingPath = path.join(requestPath, '01.Receiving')

    fs.mkdirSync(sendingPath, { recursive: true })
    fs.mkdirSync(receivingPath, { recursive: true })

    console.log(`[SelectionFile] Created folder structure: ${requestPath}`)
    return { requestPath, sendingPath, receivingPath }
  },

  /**
   * Copy a file from the uploads directory to 00.Sending.
   *
   * @param requestNumber - e.g. "RQ-2026-001"
   * @param uploadedFileName - the filename as stored in uploads/documents (multer output)
   * @param originalName     - the human-readable original file name
   * @param year             - CE year, defaults to current year
   */
  copyToSending(requestNumber: string, uploadedFileName: string, originalName: string, year?: number) {
    const folderYear = year || new Date().getFullYear()
    const sendingPath = path.join(getSelectionFileBasePath(), String(folderYear), requestNumber, '00.Sending')

    // Ensure folder exists (in case called independently)
    fs.mkdirSync(sendingPath, { recursive: true })

    const sourcePath = path.join(UPLOADS_DIR, uploadedFileName)
    const safeOriginalName = sanitizeForFileName(originalName) || path.basename(sourcePath)
    const destPath = path.join(sendingPath, safeOriginalName)

    ensureFileExists(sourcePath, 'Sending source')
    fs.copyFileSync(sourcePath, destPath)
    console.log(`[SelectionFile] Copied to Sending: ${destPath}`)

    return destPath
  },

  /**
   * Save a file directly to 01.Receiving with criteria-based naming.
   * File name format: {criteriaNo}_{criteriaDetail}_{originalName}
   * e.g. "4.1_Compliant_of_the_law_certificate.pdf"
   *
   * @param requestNumber  - e.g. "RQ-2026-001"
   * @param sourceFilePath - absolute path to the temp file (from multer)
   * @param criteriaNo     - e.g. "4.1"
   * @param criteriaDetail - e.g. "Compliant of the law"
   * @param originalName   - original uploaded file name
   * @param year           - CE year, defaults to current year
   */
  saveToReceiving(
    requestNumber: string,
    sourceFilePath: string,
    criteriaNo: string,
    criteriaDetail: string,
    originalName: string,
    year?: number,
  ) {
    const folderYear = year || new Date().getFullYear()
    const receivingPath = path.join(getSelectionFileBasePath(), String(folderYear), requestNumber, '01.Receiving')

    // Ensure folder exists
    fs.mkdirSync(receivingPath, { recursive: true })

    // Build file name: "4.1_Compliant_of_the_law_original.pdf"
    const sanitizedCriteriaNo = sanitizeForFileName(criteriaNo)
    const sanitizedDetail = sanitizeForFileName(criteriaDetail)
    const sanitizedOriginalName = sanitizeForFileName(originalName) || path.basename(sourceFilePath)
    const newFileName = `${sanitizedCriteriaNo}_${sanitizedDetail}_${sanitizedOriginalName}`
    const destPath = path.join(receivingPath, newFileName)

    ensureFileExists(sourceFilePath, 'Receiving source')
    fs.copyFileSync(sourceFilePath, destPath)
    console.log(`[SelectionFile] Saved to Receiving: ${destPath}`)

    return { destPath, newFileName }
  },

  /**
   * Copy vendor document attachments (the standard Agreement package) to 00.Sending.
   * These are the template files from the vendor-documents folder that get attached to the email.
   *
   * @param requestNumber - e.g. "RQ-2026-001"
   * @param attachments   - array of { filename, content (Buffer) }
   * @param year          - CE year, defaults to current year
   */
  copyAttachmentsToSending(
    requestNumber: string,
    attachments: Array<{ filename?: string; content?: Buffer | string; path?: string }>,
    year?: number,
  ) {
    const folderYear = year || new Date().getFullYear()
    const sendingPath = path.join(getSelectionFileBasePath(), String(folderYear), requestNumber, '00.Sending')

    fs.mkdirSync(sendingPath, { recursive: true })

    for (const attachment of attachments) {
      const fileName = attachment.filename || `attachment_${Date.now()}`
      const destPath = path.join(sendingPath, fileName)

      // Resolve content: prefer inline Buffer/string, fallback to reading from path
      if (Buffer.isBuffer(attachment.content)) {
        fs.writeFileSync(destPath, attachment.content)
      } else if (typeof attachment.content === 'string' && attachment.content.length > 0) {
        fs.writeFileSync(destPath, Buffer.from(attachment.content))
      } else if (attachment.path && fs.existsSync(attachment.path)) {
        fs.copyFileSync(attachment.path, destPath)
      } else {
        console.warn(`[SelectionFile] Skipping attachment "${fileName}" — no content or valid path`)
        throw new Error(`Attachment source not found or empty: ${fileName}`)
      }

      console.log(`[SelectionFile] Copied attachment to Sending: ${destPath}`)
    }
  },
}
