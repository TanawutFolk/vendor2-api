import { describe, expect, mock, test } from 'bun:test'

// DB access is mocked: MySQL returns the request's vendor (+ optional code usage) and Oracle stands in for PRONES.
// Mocks + import happen inside each test so bun's global mock.module registry can't leak across files.

type SetupOptions = {
  vendorRegion?: string
  companyName?: string
  usage?: Record<string, unknown> | null
  pronesRows?: Record<string, unknown>[]
  pronesError?: Error
}

async function setup(options: SetupOptions = {}) {
  const searchOracle = mock(async () => {
    if (options.pronesError) throw options.pronesError
    return { rows: options.pronesRows ?? [] }
  })
  const search = mock(async (query: string) => {
    if (query.includes('USAGE_SOURCE')) return options.usage ? [options.usage] : []
    if (query.includes('v.VENDOR_REGION')) {
      return [{ VENDORS_ID: 55, COMPANY_NAME: options.companyName ?? 'ABC Company Limited', VENDOR_REGION: options.vendorRegion ?? 'Oversea' }]
    }
    return []
  })

  mock.module('@businessData/dbExecute', () => ({
    MySQLExecute: {
      search,
      executeList: mock(async () => []),
      executeGuardedList: mock(async () => []),
      execute: mock(async () => ({ insertId: 1 })),
      searchList: mock(async () => []),
    },
    OracleExecute: { searchOracle },
  }))

  const verification = await import('./VendorCodeVerification')
  return { ...verification, search, searchOracle }
}

describe('verifyVendorCode', () => {
  test('accepts a code found in PRONES and returns its PRONES name for display', async () => {
    const { verifyVendorCode, searchOracle } = await setup({
      pronesRows: [{ VENDOR_CODE: '20031A0012', VENDOR_NAME: 'ABC CO., LTD.' }],
    })

    const result = await verifyVendorCode({ REQUEST_REGISTER_VENDOR_ID: 101, VENDOR_CODE: ' 20031a0012 ' })

    expect(result).toEqual({ VENDOR_CODE: '20031A0012', PRONES_VENDOR_NAME: 'ABC CO., LTD.' })
    expect(searchOracle).toHaveBeenCalledTimes(1)
    const [, configDb, binds] = searchOracle.mock.calls[0] as unknown as [string, string, Record<string, string>]
    expect(configDb).toBe('PRONES')
    expect(binds).toEqual({ VENDOR_CODE: '20031A0012', VENDOR_CODE_LIKE: '20031A0012%' })
  })

  test('checks only the code: a different PRONES name is not compared and does not block', async () => {
    const { verifyVendorCode } = await setup({
      companyName: 'ABC Company Limited',
      pronesRows: [{ VENDOR_CODE: '20031A0012', VENDOR_NAME: 'XYZ TRADING CO., LTD.' }],
    })

    const result = await verifyVendorCode({ REQUEST_REGISTER_VENDOR_ID: 101, VENDOR_CODE: '20031A0012' })

    expect(result).toEqual({ VENDOR_CODE: '20031A0012', PRONES_VENDOR_NAME: 'XYZ TRADING CO., LTD.' })
  })

  test('blocks a code that is not in PRONES', async () => {
    const { verifyVendorCode } = await setup({ pronesRows: [] })

    await expect(verifyVendorCode({ REQUEST_REGISTER_VENDOR_ID: 101, VENDOR_CODE: '20031A0012' })).rejects.toThrow(
      'Vendor Code 20031A0012 was not found in PRONES.',
    )
  })

  test('blocks when PRONES cannot be reached', async () => {
    const { verifyVendorCode, PRONES_UNAVAILABLE_MESSAGE } = await setup({ pronesError: new Error('ORA-12541: TNS:no listener') })
    const consoleError = console.error
    console.error = () => undefined

    try {
      await expect(verifyVendorCode({ REQUEST_REGISTER_VENDOR_ID: 101, VENDOR_CODE: '20031A0012' })).rejects.toThrow(PRONES_UNAVAILABLE_MESSAGE)
    } finally {
      console.error = consoleError
    }
  })

  test('blocks a code already used by another vendor before asking PRONES', async () => {
    const { verifyVendorCode, searchOracle } = await setup({
      usage: { USAGE_SOURCE: 'VENDOR', VENDORS_ID: 77, COMPANY_NAME: 'Other Vendor Co., Ltd.', REQUEST_NUMBER: null },
    })

    await expect(verifyVendorCode({ REQUEST_REGISTER_VENDOR_ID: 101, VENDOR_CODE: '20031A0012' })).rejects.toThrow(
      'Vendor Code 20031A0012 is already used by Other Vendor Co., Ltd.',
    )
    expect(searchOracle).not.toHaveBeenCalled()
  })

  test('blocks a code proposed on another in-progress request', async () => {
    const { verifyVendorCode } = await setup({
      usage: { USAGE_SOURCE: 'REQUEST', VENDORS_ID: 77, COMPANY_NAME: 'Other Vendor', REQUEST_NUMBER: 'Selection-26-N007' },
    })

    await expect(verifyVendorCode({ REQUEST_REGISTER_VENDOR_ID: 101, VENDOR_CODE: '20031A0012' })).rejects.toThrow(
      'is already proposed for Other Vendor in request Selection-26-N007',
    )
  })

  test('blocks a prefix that does not match the vendor region', async () => {
    const { verifyVendorCode, searchOracle } = await setup({ vendorRegion: 'Local' })

    await expect(verifyVendorCode({ REQUEST_REGISTER_VENDOR_ID: 101, VENDOR_CODE: '20031A0012' })).rejects.toThrow(
      'Vendor Code must start with 20030',
    )
    expect(searchOracle).not.toHaveBeenCalled()
  })
})
