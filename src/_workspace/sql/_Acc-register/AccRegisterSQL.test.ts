import { describe, expect, test } from 'bun:test'
import { AccRegisterSQL } from './AccRegisterSQL'

describe('AccRegisterSQL registration completion', () => {
  test('loads the linked vendor ID with the workflow context', async () => {
    const sql = await AccRegisterSQL.getWorkflowContext({
      REQUEST_REGISTER_VENDOR_ID: 10,
    })

    expect(sql).toContain('rr.VENDORS_ID')
    expect(sql).toContain('rr.REQUEST_REGISTER_VENDOR_ID = 10')
  })

  test('updates the vendor code and registered status', async () => {
    const [vendorCodeSql, vendorStatusSql] = await Promise.all([
      AccRegisterSQL.updateVendorFftVendorCode({
        VENDORS_ID: 166,
        VENDOR_CODE: 'V000166',
      }),
      AccRegisterSQL.updateVendorFftStatus({
        VENDORS_ID: 166,
        M_VENDOR_STATUS_ID: 2,
      }),
    ])

    expect(vendorCodeSql).toContain("FFT_VENDOR_CODE = 'V000166'")
    expect(vendorCodeSql).toContain('VENDORS_ID = 166')
    expect(vendorStatusSql).toContain('FFT_STATUS = 2')
    expect(vendorStatusSql).not.toContain("STATUS_CODE = 'REGISTERED'")
    expect(vendorStatusSql).toContain('VENDORS_ID = 166')
  })
})
