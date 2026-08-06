import { describe, expect, test } from 'bun:test'
import { AllRequestHistorySQL } from './AllRequestHistorySQL'

describe('AllRequestHistorySQL', () => {
  test('loads filter options from persisted request section and request create year', async () => {
    const sql = await AllRequestHistorySQL.getFilterOptions()

    expect(sql).toContain('TRIM(rr.REQUESTER_SECTION) AS REQUESTER_SECTION')
    expect(sql).toContain('YEAR(rr.CREATE_DATE) AS REQUEST_YEAR')
    expect(sql).toContain('rr.INUSE = 1')
  })

  test('builds a lightweight read-only list query for section and year', async () => {
    const [countSql, dataSql] = await AllRequestHistorySQL.search({
      REQUESTER_SECTION: "R&D's",
      REQUEST_YEAR: 2026,
      ORDER: [{ id: 'CREATE_DATE', desc: true }],
      START: 25,
      LIMIT: 25,
    })

    expect(countSql).toContain("rr.REQUESTER_SECTION = 'R&D''s'")
    expect(dataSql).toContain("rr.CREATE_DATE >= '2026-01-01 00:00:00'")
    expect(dataSql).toContain("rr.CREATE_DATE < '2027-01-01 00:00:00'")
    expect(dataSql).toContain('rr.CREATE_DATE DESC')
    expect(dataSql).toContain('LIMIT\n                                       25 OFFSET 25')
    expect(dataSql).toContain('DOCUMENTS_COUNT')
    expect(dataSql).not.toContain('ALLOWED_ACTIONS')
    expect(dataSql).not.toContain('MY_APPROVAL_STATUS')
  })

  test('ignores unrecognized sort columns', async () => {
    const [, dataSql] = await AllRequestHistorySQL.search({
      ORDER: [{ id: 'DROP TABLE request_register_vendor', desc: false }],
    })

    expect(dataSql).toContain('rr.REQUEST_REGISTER_VENDOR_ID DESC')
    expect(dataSql).not.toContain('DROP TABLE')
  })

  test('owns the request detail query and resolves every placeholder', async () => {
    const sql = await AllRequestHistorySQL.getById({ REQUEST_REGISTER_VENDOR_ID: 123 })

    expect(sql).toContain('rr.REQUEST_REGISTER_VENDOR_ID = 123')
    expect(sql).toContain('AS CONTACTS')
    expect(sql).toContain('AS PRODUCTS')
    expect(sql).not.toContain('dataItem.')
  })
})
