import { afterEach, describe, expect, test } from 'bun:test'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { buildCriteriaReceivingFileName, SelectionFileService } from './SelectionFileService'

const originalSelectionFileBasePath = process.env.SELECTION_FILE_BASE_PATH
const testFolders: string[] = []

afterEach(() => {
  if (originalSelectionFileBasePath === undefined) {
    delete process.env.SELECTION_FILE_BASE_PATH
  } else {
    process.env.SELECTION_FILE_BASE_PATH = originalSelectionFileBasePath
  }

  for (const testFolder of testFolders.splice(0)) {
    fs.rmSync(testFolder, { recursive: true, force: true })
  }
})

describe('SelectionFileService criteria file naming', () => {
  test('prefixes the original file with the criterion number and preserves the extension', () => {
    expect(buildCriteriaReceivingFileName('4.1', 'Supplier Policy.pdf')).toBe('4.1 Supplier_Policy.pdf')
  })

  test('uses the same criterion prefix for every file without attachment sequence numbers', () => {
    const names = [
      buildCriteriaReceivingFileName('4.1', 'policy.pdf'),
      buildCriteriaReceivingFileName('4.1', 'certificate.pdf'),
      buildCriteriaReceivingFileName('4.1', 'factory photo.jpg'),
    ]

    expect(names).toEqual([
      '4.1 policy.pdf',
      '4.1 certificate.pdf',
      '4.1 factory_photo.jpg',
    ])
    expect(names.every((name) => !/^4\.1-[123]/.test(name))).toBe(true)
  })

  test('writes an uploaded buffer directly to the request documents folder', () => {
    const testBasePath = fs.mkdtempSync(path.join(os.tmpdir(), 'selection-file-service-'))
    testFolders.push(testBasePath)
    process.env.SELECTION_FILE_BASE_PATH = testBasePath

    const result = SelectionFileService.saveBufferToRequestDocuments(
      'Selection-26-N999',
      Buffer.from('document-content'),
      'Vendor Document.pdf',
      2026,
    )

    expect(result.destPath).toBe(
      path.join(testBasePath, '2026', 'Selection-26-N999', '02.Request Documents', 'Vendor_Document.pdf'),
    )
    expect(fs.readFileSync(result.destPath, 'utf8')).toBe('document-content')
  })

  test('keeps Thai file names while removing characters invalid on Windows', () => {
    expect(buildCriteriaReceivingFileName('4.11', 'หนังสือรับรอง:บริษัท?.pdf')).toBe('4.11 หนังสือรับรองบริษัท.pdf')
  })
})
