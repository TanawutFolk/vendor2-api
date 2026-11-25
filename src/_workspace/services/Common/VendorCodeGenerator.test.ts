import { describe, expect, mock, test } from 'bun:test'

// DB access is mocked (MySQL = the request's vendor, Oracle = PRONES). Mocks + import happen inside each test so
// bun's global mock.module registry can't leak across files. Code samples come from the PRONES export of 2026-11-23.

type SetupOptions = {
  vendorRegion?: string
  companyName?: string
  pronesRows?: Record<string, unknown>[]
  pronesError?: Error
}

async function setup(options: SetupOptions = {}) {
  const searchOracle = mock(async () => {
    if (options.pronesError) throw options.pronesError
    return { rows: options.pronesRows ?? [] }
  })
  const search = mock(async (query: string) => {
    if (query.includes('v.VENDOR_REGION')) {
      return [{ VENDORS_ID: 55, COMPANY_NAME: options.companyName ?? 'W-TECH (THAILAND) CO.,LTD.', VENDOR_REGION: options.vendorRegion ?? 'Local' }]
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

  const generator = await import('./VendorCodeGenerator')
  return { ...generator, search, searchOracle }
}

const code = (value: string, enteredAt: string) => ({ code: value, enteredAt })

describe('getVendorNameLetters', () => {
  test('keeps A-Z only and drops a dotted salutation', async () => {
    const { getVendorNameLetters } = await setup()

    expect(getVendorNameLetters('W-TECH (THAILAND) CO.,LTD.')).toBe('WTECHTHAILANDCOLTD')
    expect(getVendorNameLetters('WK ELECTRIC CO.,LTD.')).toBe('WKELECTRICCOLTD')
    expect(getVendorNameLetters('MR.WANCHAI  SIRIJINNO')).toBe('WANCHAISIRIJINNO')
    expect(getVendorNameLetters('MISS.PRANICHAYA CHINPETH')).toBe('PRANICHAYACHINPETH')
    expect(getVendorNameLetters('MS ELECTRIC CO.,LTD.')).toBe('MSELECTRICCOLTD')
    expect(getVendorNameLetters('Société Générale')).toBe('SOCIETEGENERALE')
    expect(getVendorNameLetters('บริษัท ทดสอบ จำกัด')).toBe('')
  })
})

describe('generateNextVendorCode', () => {
  test('continues the running number of the first letter, not of the 3 letters', async () => {
    const { generateNextVendorCode } = await setup()

    const result = generateNextVendorCode({
      prefix: '20030',
      companyName: 'W-TECH (THAILAND) CO.,LTD.',
      existingCodes: [code('20030WIN60', '2022-03-18'), code('20030WKE63', '2024-04-29'), code('20030WOR64', '2026-01-12')],
    })

    expect(result).toEqual({ VENDOR_CODE: '20030WTE65', LAST_VENDOR_CODE: '20030WOR64' })
  })

  test('starts at 01 when the letter has no code yet', async () => {
    const { generateNextVendorCode } = await setup()

    expect(generateNextVendorCode({ prefix: '20031', companyName: 'OPLINK (ZHUHAI) COMMUNICATION', existingCodes: [] })).toEqual({
      VENDOR_CODE: '20031OPL01',
      LAST_VENDOR_CODE: '',
    })
  })

  test('ignores codes of other letters and other prefixes', async () => {
    const { generateNextVendorCode } = await setup()

    const result = generateNextVendorCode({
      prefix: '20031',
      companyName: 'OPLINK (ZHUHAI) COMMUNICATION',
      existingCodes: [code('20031OPN22', '2023-11-09'), code('20030ORA29', '2024-07-24'), code('20031PHY09', '2026-04-01')],
    })

    expect(result.VENDOR_CODE).toBe('20031OPL23')
  })

  test('switches to 2 letters + 3 digits after 99 and keeps counting', async () => {
    const { generateNextVendorCode } = await setup()

    const result = generateNextVendorCode({
      prefix: '20030',
      companyName: 'MURATA ELECTRONICS',
      existingCodes: [code('20030MFE96', '2026-08-24'), code('20030MMT99', '2026-09-08')],
    })

    expect(result.VENDOR_CODE).toBe('20030MU100')
  })

  test('stays on 2 letters + 3 digits once Account has moved the letter there', async () => {
    const { generateNextVendorCode } = await setup()

    const result = generateNextVendorCode({
      prefix: '20030',
      companyName: 'TOGO CORPORATION CO., LTD.',
      existingCodes: [code('20030THA99', '2013-02-27'), code('20030TO219', '2026-10-01'), code('20030TO221', '2026-11-02')],
    })

    expect(result).toEqual({ VENDOR_CODE: '20030TO222', LAST_VENDOR_CODE: '20030TO221' })
  })

  test('follows the most recent format, so an old 3-digit typo does not move the letter to 3 digits', async () => {
    const { generateNextVendorCode } = await setup()

    const result = generateNextVendorCode({
      prefix: '20030',
      companyName: 'KANEMATSU (THAILAND) LTD.',
      existingCodes: [code('20030KO153', '2026-02-11T16:45:23'), code('20030KAN92', '2026-10-05'), code('20030KON93', '2026-10-19T16:53:47')],
    })

    expect(result.VENDOR_CODE).toBe('20030KAN94')
  })

  test('skips a number that another format already took', async () => {
    const { generateNextVendorCode } = await setup()

    const result = generateNextVendorCode({
      prefix: '20030',
      companyName: 'ALPHA TECH',
      existingCodes: [code('20030ABC41', '2026-01-01'), code('20030AX042', '2020-01-01')],
    })

    expect(result.VENDOR_CODE).toBe('20030ALP43')
  })

  test('rejects names without 3 English letters', async () => {
    const { generateNextVendorCode } = await setup()

    expect(() => generateNextVendorCode({ prefix: '20030', companyName: 'บริษัท ทดสอบ จำกัด', existingCodes: [] })).toThrow(
      'Company name needs at least 3 English letters',
    )
    expect(() => generateNextVendorCode({ prefix: '20030', companyName: '3M', existingCodes: [] })).toThrow('at least 3 English letters')
  })

  test('rejects when the 3-digit running numbers are used up', async () => {
    const { generateNextVendorCode } = await setup()

    expect(() =>
      generateNextVendorCode({ prefix: '20030', companyName: 'ZETA', existingCodes: [code('20030ZE999', '2026-01-01')] }),
    ).toThrow('Running numbers for 20030Z are used up')
  })
})

describe('generateVendorCodeForRequest', () => {
  test('uses the vendor region prefix and asks PRONES for codes of that prefix + first letter', async () => {
    const { generateVendorCodeForRequest, searchOracle } = await setup({
      vendorRegion: 'Oversea',
      companyName: 'OPLINK (ZHUHAI) COMMUNICATION',
      pronesRows: [{ VENDOR_CODE: '20031OPN22', ENTERED_AT: new Date('2023-11-09T10:00:00') }],
    })

    const result = await generateVendorCodeForRequest({ REQUEST_REGISTER_VENDOR_ID: 101 })

    expect(result).toEqual({ VENDOR_CODE: '20031OPL23', LAST_VENDOR_CODE: '20031OPN22' })
    const [sql, configDb, binds] = searchOracle.mock.calls[0] as unknown as [string, string, Record<string, string>]
    expect(sql).toContain('FFT.T_TRADE_MS')
    expect(configDb).toBe('PRONES')
    expect(binds).toEqual({ CODE_LIKE: '20031O%' })
  })

  test('reports PRONES as unavailable when the lookup fails', async () => {
    const { generateVendorCodeForRequest } = await setup({ pronesError: new Error('NJS-116: password verifier type not supported') })

    await expect(generateVendorCodeForRequest({ REQUEST_REGISTER_VENDOR_ID: 101 })).rejects.toThrow('Cannot verify Vendor Code with PRONES right now')
  })

  test('does not call PRONES when the name has no English letters', async () => {
    const { generateVendorCodeForRequest, searchOracle } = await setup({ companyName: 'บริษัท ทดสอบ จำกัด' })

    await expect(generateVendorCodeForRequest({ REQUEST_REGISTER_VENDOR_ID: 101 })).rejects.toThrow('at least 3 English letters')
    expect(searchOracle).not.toHaveBeenCalled()
  })

  test('rejects a missing request id', async () => {
    const { generateVendorCodeForRequest } = await setup()

    await expect(generateVendorCodeForRequest({ REQUEST_REGISTER_VENDOR_ID: 0 })).rejects.toThrow('Missing request_id')
  })
})
