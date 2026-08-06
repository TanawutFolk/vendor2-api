import { describe, expect, test } from 'bun:test'
import { buildCriteriaReceivingFileName } from './SelectionFileService'

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

  test('keeps Thai file names while removing characters invalid on Windows', () => {
    expect(buildCriteriaReceivingFileName('4.11', 'หนังสือรับรอง:บริษัท?.pdf')).toBe('4.11 หนังสือรับรองบริษัท.pdf')
  })
})
