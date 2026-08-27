import { describe, expect, test } from 'bun:test'
import { buildVendorSystemUrl, getVendorSystemOrigin } from './VendorSystemUrl'

describe('VendorSystemUrl', () => {
  test('removes trailing slashes from the configured origin', () => {
    expect(getVendorSystemOrigin('http://192.168.14.237:8089/')).toBe('http://192.168.14.237:8089')
    expect(getVendorSystemOrigin('http://192.168.14.237:8089///')).toBe('http://192.168.14.237:8089')
  })

  test('joins the origin and application path with one slash', () => {
    expect(buildVendorSystemUrl('/en/request-register', 'http://192.168.14.237:8089/')).toBe('http://192.168.14.237:8089/en/request-register')
    expect(buildVendorSystemUrl('en/approval-gpr-c', 'http://192.168.14.237:8089')).toBe('http://192.168.14.237:8089/en/approval-gpr-c')
  })
})
