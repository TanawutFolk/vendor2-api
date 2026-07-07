import fs from 'fs'
import path from 'path'

// Configuration
// Base path for Selection Supplier file storage.
const DEFAULT_SELECTION_FILE_BASE_PATH =
  '\\\\192.168.14.35\\c01_qms\\PM\\02_Record\\FM-PM-303 Selection Supplier Test\\01.Selection_File'

// Upload directory where multer stores temporary files
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'documents')

const getSelectionFileBasePath = () => process.env.SELECTION_FILE_BASE_PATH || DEFAULT_SELECTION_FILE_BASE_PATH

const logFolder = (message: string, detail?: unknown) => {
  if (detail === undefined) {
    // console.log(`[SelectionFile] ${message}`)
    return
  }

  // console.log(`[SelectionFile] ${message}:`, detail)
}

// Helpers

/**
 * Sanitize a string for use as part of a file/folder name.
 * Removes characters that are invalid in Windows file paths.
 */
const sanitizeForFileName = (text: string): string =>
  text
    .replace(/[<>:"/\\|?*]/g, '')   // remove invalid Windows file name chars
    .replace(/\s+/g, '_')           // spaces Ã¢â€ â€™ underscores
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

// Request attachments live in 02.Request Documents, GPR criteria uploads in 01.Receiving, and
// GPR PDF/Form A attachments in 00.Sending Ã¢â‚¬â€ search all three since the caller may not know
// which stage a file belongs to (and this is also the recovery path when a DB-stored FILE_PATH
// is stale or corrupted).
const SELECTION_SUBFOLDERS = ['02.Request Documents', '01.Receiving', '00.Sending']

const findSelectionFileByRequestNumber = (requestNumber: string, candidateFileName: string) => {
  const normalizedRequestNumber = String(requestNumber || '').trim()
  const normalizedCandidateFileName = String(candidateFileName || '').trim()

  logFolder('Find selection folder start', { requestNumber: normalizedRequestNumber })

  if (!normalizedRequestNumber || !normalizedCandidateFileName) return ''

  const basePath = getSelectionFileBasePath()
  logFolder('Checking selection base folder', basePath)
  if (!fs.existsSync(basePath)) {
    logFolder('Selection base folder not found', basePath)
    return ''
  }

  // Files on disk are saved under their sanitized name (spaces Ã¢â€ â€™ underscores, etc.), but callers
  // may pass the original human-readable name, so try both.
  const sanitizedCandidateFileName = sanitizeForFileName(normalizedCandidateFileName)
  const candidateNames = Array.from(new Set([normalizedCandidateFileName, sanitizedCandidateFileName].filter(Boolean)))

  const yearFolders = fs.readdirSync(basePath, { withFileTypes: true }).filter(entry => entry.isDirectory())
  logFolder('Selection year folders found', yearFolders.map(entry => entry.name))

  for (const yearFolder of yearFolders) {
    const requestPath = path.join(basePath, yearFolder.name, normalizedRequestNumber)
    if (!fs.existsSync(requestPath)) continue

    for (const subfolder of SELECTION_SUBFOLDERS) {
      const subfolderPath = path.join(requestPath, subfolder)
      if (!fs.existsSync(subfolderPath)) {
        logFolder('Selection subfolder not found', subfolderPath)
        continue
      }

      for (const candidateName of candidateNames) {
        const matchedFilePath = path.join(subfolderPath, candidateName)
        if (fs.existsSync(matchedFilePath)) {
          return matchedFilePath
        }
      }
    }
  }

  return ''
}

// Service

const resolveUploadedDocumentPath = (filePath: string, fileName?: string) => {
  const candidateNames = Array.from(new Set([
    path.basename(String(filePath || '').trim()),
    path.basename(String(fileName || '').trim()),
  ].filter(Boolean)))

  for (const candidateName of candidateNames) {
    const candidatePath = path.resolve(UPLOADS_DIR, candidateName)
    const relativePath = path.relative(UPLOADS_DIR, candidatePath)

    if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) continue
    if (fs.existsSync(candidatePath)) return candidatePath
  }

  return ''
}

export const SelectionFileService = {
  getBasePath() {
    const basePath = getSelectionFileBasePath()
    logFolder('Resolved base path', basePath)
    return basePath
  },

  isManagedSelectionFilePath(filePath: string) {
    const normalizedFilePath = resolveManagedFilePath(filePath).toLowerCase()
    const normalizedBasePath = resolveManagedFilePath(getSelectionFileBasePath()).toLowerCase()
    const relativePath = path.relative(normalizedBasePath, normalizedFilePath)
    const isManaged = Boolean(relativePath) && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)

    return isManaged
  },

  resolveDownloadPath(filePath: string, fileName?: string, requestNumber?: string, options?: { allowUploadedFallback?: boolean }) {
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

    if (options?.allowUploadedFallback) {
      const uploadedPath = resolveUploadedDocumentPath(normalizedFilePath, normalizedFileName)
      if (uploadedPath) {
        return uploadedPath
      }
    }

    return ''
  },


  deleteSelectionFile(filePath: string, fileName?: string, requestNumber?: string) {
    const resolvedPath = this.resolveDownloadPath(filePath, fileName, requestNumber)

    if (!resolvedPath) {
      return {
        deleted: false,
        filePath: '',
        reason: 'Selection document not found',
      }
    }

    if (!this.isManagedSelectionFilePath(resolvedPath)) {
      throw new Error('Invalid selection document path')
    }

    if (!fs.existsSync(resolvedPath)) {
      return {
        deleted: false,
        filePath: resolvedPath,
        reason: 'Selection document not found',
      }
    }

    fs.unlinkSync(resolvedPath)

    return {
      deleted: true,
      filePath: resolvedPath,
      reason: '',
    }
  },

  /**
   * Create the folder structure for a request:
   *   {basePath}/{year}/{requestNumber}/00.Sending
   *   {basePath}/{year}/{requestNumber}/01.Receiving
   *   {basePath}/{year}/{requestNumber}/02.Request Documents
   *
   * Idempotent: if folders already exist, no error is thrown.
   *
   * @param requestNumber - e.g. "RQ-2026-001"
   * @param year          - CE year, defaults to current year
   */
  createFolderStructure(requestNumber: string, year?: number) {
    const folderYear = year || new Date().getFullYear()
    const basePath = getSelectionFileBasePath()
    const requestPath = path.join(basePath, String(folderYear), requestNumber)
    const sendingPath = path.join(requestPath, '00.Sending')
    const receivingPath = path.join(requestPath, '01.Receiving')
    const requestDocumentsPath = path.join(requestPath, '02.Request Documents')

    logFolder('Create folder structure start', { basePath, folderYear, requestNumber, requestPath, sendingPath, receivingPath, requestDocumentsPath })
    fs.mkdirSync(sendingPath, { recursive: true })
    logFolder('Ensured sending folder', sendingPath)
    fs.mkdirSync(receivingPath, { recursive: true })
    logFolder('Ensured receiving folder', receivingPath)
    fs.mkdirSync(requestDocumentsPath, { recursive: true })
    logFolder('Ensured request documents folder', requestDocumentsPath)

    logFolder('Created folder structure', requestPath)
    return { requestPath, sendingPath, receivingPath, requestDocumentsPath }
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
    const basePath = getSelectionFileBasePath()
    const sendingPath = path.join(basePath, String(folderYear), requestNumber, '00.Sending')

    logFolder('Checking sending folder before upload copy', sendingPath)
    // Ensure folder exists (in case called independently)
    fs.mkdirSync(sendingPath, { recursive: true })
    logFolder('Ensured sending folder', sendingPath)

    const sourcePath = path.join(UPLOADS_DIR, uploadedFileName)
    const safeOriginalName = sanitizeForFileName(originalName) || path.basename(sourcePath)
    const destPath = path.join(sendingPath, safeOriginalName)

    ensureFileExists(sourcePath, 'Sending source')
    fs.copyFileSync(sourcePath, destPath)

    return destPath
  },

  /**
   * Move a requester attachment (uploaded at Request time, stored in uploads/documents
   * and recorded in request_register_file) into 02.Request Documents. The original is
   * removed from uploads/documents Ã¢â‚¬â€ the network folder becomes the single source of
   * truth, so the caller must repoint request_register_file.FILE_PATH to the returned path.
   *
   * @param requestNumber    - e.g. "Selection-26-N001"
   * @param uploadedFileName - the multer filename stored in uploads/documents
   * @param originalName     - the human-readable original file name
   * @param year             - CE year, defaults to current year
   */
  moveToRequestDocuments(requestNumber: string, uploadedFileName: string, originalName: string, year?: number) {
    const folderYear = year || new Date().getFullYear()
    const basePath = getSelectionFileBasePath()
    const requestDocumentsPath = path.join(basePath, String(folderYear), requestNumber, '02.Request Documents')

    logFolder('Checking request documents folder before move', requestDocumentsPath)
    fs.mkdirSync(requestDocumentsPath, { recursive: true })
    logFolder('Ensured request documents folder', requestDocumentsPath)

    const sourcePath = path.join(UPLOADS_DIR, uploadedFileName)
    const safeOriginalName = sanitizeForFileName(originalName) || path.basename(sourcePath)
    const destPath = path.join(requestDocumentsPath, safeOriginalName)

    ensureFileExists(sourcePath, 'Request document source')
    const finalDestPath = moveFile(sourcePath, destPath)

    return { destPath: finalDestPath, newFileName: path.basename(finalDestPath) }
  },

  saveToSending(requestNumber: string, sourceFilePath: string, originalName: string, year?: number) {
    const folderYear = year || new Date().getFullYear()
    const basePath = getSelectionFileBasePath()
    const sendingPath = path.join(basePath, String(folderYear), requestNumber, '00.Sending')

    logFolder('Checking sending folder before save', sendingPath)
    fs.mkdirSync(sendingPath, { recursive: true })
    logFolder('Ensured sending folder', sendingPath)

    const safeOriginalName = sanitizeForFileName(originalName) || path.basename(sourceFilePath)
    const destPath = path.join(sendingPath, safeOriginalName)

    ensureFileExists(sourceFilePath, 'Sending source')
    const finalDestPath = moveFile(sourceFilePath, destPath)

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
    const basePath = getSelectionFileBasePath()
    const receivingPath = path.join(basePath, String(folderYear), requestNumber, '01.Receiving')

    logFolder('Checking receiving folder before save', receivingPath)
    // Ensure folder exists
    fs.mkdirSync(receivingPath, { recursive: true })
    logFolder('Ensured receiving folder', receivingPath)

    const sanitizedOriginalName = sanitizeForFileName(originalName) || path.basename(sourceFilePath)
    const destPath = path.join(receivingPath, sanitizedOriginalName)

    ensureFileExists(sourceFilePath, 'Receiving source')
    const finalDestPath = moveFile(sourceFilePath, destPath)

    return { destPath: finalDestPath, newFileName: path.basename(finalDestPath) }
  },

  /**
   * Save the GPR B file (the vendor's response, handed to the PO PIC) directly to
   * 01.Receiving. One GPR B file per request; a re-upload overwrites via unique naming.
   *
   * @param requestNumber  - e.g. "RQ-2026-001"
   * @param sourceFilePath - absolute path to the temp file (from multer)
   * @param originalName   - original uploaded file name
   * @param year           - CE year, defaults to current year
   */
  saveGprBToReceiving(requestNumber: string, sourceFilePath: string, originalName: string, year?: number) {
    const folderYear = year || new Date().getFullYear()
    const basePath = getSelectionFileBasePath()
    const receivingPath = path.join(basePath, String(folderYear), requestNumber, '01.Receiving')

    logFolder('Checking receiving folder before GPR B save', receivingPath)
    fs.mkdirSync(receivingPath, { recursive: true })
    logFolder('Ensured receiving folder', receivingPath)

    const sanitizedOriginalName = sanitizeForFileName(originalName) || path.basename(sourceFilePath)
    const destPath = path.join(receivingPath, sanitizedOriginalName)

    ensureFileExists(sourceFilePath, 'GPR B source')
    const finalDestPath = moveFile(sourceFilePath, destPath)

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
    const basePath = getSelectionFileBasePath()
    const sendingPath = path.join(basePath, String(folderYear), requestNumber, '00.Sending')

    logFolder('Checking sending folder before attachment copy', sendingPath)
    fs.mkdirSync(sendingPath, { recursive: true })
    logFolder('Ensured sending folder', sendingPath)

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
        throw new Error(`Attachment source not found or empty: ${fileName}`)
      }

    }
  },
}
