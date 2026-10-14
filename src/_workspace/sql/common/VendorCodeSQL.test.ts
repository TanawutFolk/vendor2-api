import { describe, expect, test } from 'bun:test'
import { VendorCodeSQL } from './VendorCodeSQL'

describe('VendorCodeSQL', () => {
  test('loads the vendor linked to the request', () => {
    const sql = VendorCodeSQL.getRequestVendor({ REQUEST_REGISTER_VENDOR_ID: 101 })

    expect(sql).toContain('rr.REQUEST_REGISTER_VENDOR_ID = 101')
    expect(sql).toContain('v.VENDOR_REGION')
    expect(sql).toContain('v.COMPANY_NAME')
  })

  test('finds the code on other vendors and other in-progress requests only', () => {
    const sql = VendorCodeSQL.getVendorCodeUsage({
      VENDOR_CODE: '20031A0012',
      VENDORS_ID: 55,
      REQUEST_REGISTER_VENDOR_ID: 101,
    })

    expect(sql).toContain("TRIM(v.FFT_VENDOR_CODE) = '20031A0012'")
    expect(sql).toContain("TRIM(rvs.PROPOSED_VENDOR_CODE) = '20031A0012'")
    expect(sql).toContain('v.VENDORS_ID <> 55')
    expect(sql).toContain('rr.VENDORS_ID <> 55')
    expect(sql).toContain('rvs.REQUEST_REGISTER_VENDOR_ID <> 101')
    expect(sql).toContain("request_state_master.STATE_CODE = 'IN_PROGRESS'")
    expect(sql).not.toContain('dataItem.')
  })

  test('escapes quotes and backslashes in the vendor code', () => {
    const sql = VendorCodeSQL.getVendorCodeUsage({ VENDOR_CODE: "20030\\' OR '1'='1", VENDORS_ID: 1, REQUEST_REGISTER_VENDOR_ID: 1 })

    expect(sql).toContain("'20030\\\\'' OR ''1''=''1'")
  })

  test('looks up PRONES by exact code through bind variables', () => {
    const sql = VendorCodeSQL.getPronesVendorByCode()

    expect(sql).toContain('FFT.T_TRADE_MS')
    expect(sql).toContain('I_DL_CD LIKE :VENDOR_CODE_LIKE')
    expect(sql).toContain('RTRIM(I_DL_CD) = :VENDOR_CODE')
    expect(sql).not.toContain("'20030%'")
  })
})
