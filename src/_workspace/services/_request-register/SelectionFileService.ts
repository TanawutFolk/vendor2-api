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

const resolveUniquePath = (destPath: string) => {
  if (!fs.existsSync(destPath)) return destPath

  const parsed = path.parse(destPath)
  let counter = 1
  let candidate = path.join(parsed.dir, `${parsed.name}_${counter}${parsed.ext}`)
  while (fs.existsSync(candidate)) {
    counter += 1
    candidate = path.join(parsed.dir, `${parsed.name}_${counter}${parsed.ext}`)
  }
  return candidate
}

const moveFile = (sourcePath: string, destPath: string) => {
  const finalDestPath = resolveUniquePath(destPath)
  try {
    fs.renameSync(sourcePath, finalDestPath)
  } catch (error: any) {
    if (error?.code !== 'EXDEV') throw error
    fs.copyFileSync(sourcePath, finalDestPath)
    fs.unlinkSync(sourcePath)
  }
  return finalDestPath
}

const resolveManagedFilePath = (filePath: string) => path.normalize(path.resolve(String(filePath || '')))

const findSelectionFileByRequestNumber = (requestNumber: string, candidateFileName: string) => {
  const normalizedRequestNumber = String(requestNumber || '').trim()
  const normalizedCandidateFileName = String(candidateFileName || '').trim()

  if (!normalizedRequestNumber || !normalizedCandidateFileName) return ''

  const basePath = getSelectionFileBasePath()
  if (!fs.existsSync(basePath)) return ''

  const yearFolders = fs.readdirSync(basePath, { withFileTypes: true }).filter(entry => entry.isDirectory())

  for (const yearFolder of yearFolders) {
    const receivingPath = path.join(basePath, yearFolder.name, normalizedRequestNumber, '01.Receiving')
    if (!fs.existsSync(receivingPath)) continue

    const matchedFilePath = path.join(receivingPath, normalizedCandidateFileName)
    if (fs.existsSync(matchedFilePath)) {
      return matchedFilePath
    }
  }

  return ''
}

// ── Service ──────────────────────────────────────────────────────────────────

export const SelectionFileService = {
  getBasePath() {
    return getSelectionFileBasePath()
  },

  isManagedSelectionFilePath(filePath: string) {
    const normalizedFilePath = resolveManagedFilePath(filePath).toLowerCase()
    const normalizedBasePath = resolveManagedFilePath(getSelectionFileBasePath()).toLowerCase()
    const relativePath = path.relative(normalizedBasePath, normalizedFilePath)

    return Boolean(relativePath) && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
  },

  resolveDownloadPath(filePath: string, fileName?: string, requestNumber?: string) {
    const normalizedFilePath = String(filePath || '').trim()
    const normalizedFileName = String(fileName || '').trim()
    const normalizedRequestNumber = String(requestNumber || '').trim()

    if (normalizedFilePath && this.isManagedSelectionFilePath(normalizedFilePath)) {
      const resolvedPath = resolveManagedFilePath(normalizedFilePath)
      if (fs.existsSync(resolvedPath)) {
        return resolvedPath
      }
    }

    const candidateFileName = normalizedFileName || path.basename(normalizedFilePath)
    if (normalizedRequestNumber && candidateFileName) {
      const matchedPath = findSelectionFileByRequestNumber(normalizedRequestNumber, candidateFileName)
      if (matchedPath) {
        return matchedPath
      }
    }

    return ''
  },

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

  saveToSending(requestNumber: string, sourceFilePath: string, originalName: string, year?: number) {
    const folderYear = year || new Date().getFullYear()
    const sendingPath = path.join(getSelectionFileBasePath(), String(folderYear), requestNumber, '00.Sending')

    fs.mkdirSync(sendingPath, { recursive: true })

    const safeOriginalName = sanitizeForFileName(originalName) || path.basename(sourceFilePath)
    const destPath = path.join(sendingPath, safeOriginalName)

    ensureFileExists(sourceFilePath, 'Sending source')
    const finalDestPath = moveFile(sourceFilePath, destPath)
    console.log(`[SelectionFile] Saved to Sending: ${finalDestPath}`)

    return { destPath: finalDestPath, newFileName: path.basename(finalDestPath) }
  },

  /**
   * Save a file directly to 01.Receiving using only the uploaded file name.
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

    const sanitizedOriginalName = sanitizeForFileName(originalName) || path.basename(sourceFilePath)
    const destPath = path.join(receivingPath, sanitizedOriginalName)

    ensureFileExists(sourceFilePath, 'Receiving source')
    const finalDestPath = moveFile(sourceFilePath, destPath)
    console.log(`[SelectionFile] Saved to Receiving: ${finalDestPath}`)

    return { destPath: finalDestPath, newFileName: path.basename(finalDestPath) }
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
