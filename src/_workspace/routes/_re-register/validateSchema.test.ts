import { describe, expect, test } from 'bun:test'

import { ReRegisterDeleteSchema } from './validateSchema'

describe('ReRegisterDeleteSchema', () => {
  test('accepts the payload the Re-register page sends (VENDORS_ID)', () => {
    expect(ReRegisterDeleteSchema.safeParse({ VENDORS_ID: 12, UPDATE_BY: 'E0001' }).success).toBe(true)
  })

  test('still accepts the legacy vendor_id key', () => {
    expect(ReRegisterDeleteSchema.safeParse({ vendor_id: '12', UPDATE_BY: 'E0001' }).success).toBe(true)
  })

  test('rejects a request without any vendor id', () => {
    const result = ReRegisterDeleteSchema.safeParse({ UPDATE_BY: 'E0001' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['VENDORS_ID'])
  })

  test('rejects invalid vendor ids and a missing UPDATE_BY', () => {
    expect(ReRegisterDeleteSchema.safeParse({ VENDORS_ID: 0, UPDATE_BY: 'E0001' }).success).toBe(false)
    expect(ReRegisterDeleteSchema.safeParse({ VENDORS_ID: 'abc', UPDATE_BY: 'E0001' }).success).toBe(false)
    expect(ReRegisterDeleteSchema.safeParse({ VENDORS_ID: 12, UPDATE_BY: '' }).success).toBe(false)
  })
})
