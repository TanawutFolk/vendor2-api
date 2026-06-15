import { describe, expect, test } from 'bun:test'
import { FindVendorSQL } from './FindVendorSQL'

describe('FindVendorSQL audit preservation', () => {
  test('soft-resets PRONES staging and match results', () => {
    const stagingSql = FindVendorSQL.truncateStagingPrones()
    const matchSql = FindVendorSQL.truncateMatchResult()

    for (const sql of [stagingSql, matchSql]) {
      expect(sql).toContain('INUSE = 0')
      expect(sql).not.toContain('TRUNCATE TABLE')
      expect(sql).not.toContain('DELETE FROM')
    }
  })

  test('reactivates existing vendor match results through upsert', () => {
    const sql = FindVendorSQL.insertMatchResultBatch([{
      VENDOR_ID: 1,
      STATUS_CHECK: 'matched',
      PRONES_CODE: 'P001',
      PRONES_NAME: 'Vendor',
      MATCH_METHOD: 'code',
    }])

    expect(sql).toContain('ON DUPLICATE KEY UPDATE')
    expect(sql).toContain('INUSE = 1')
    expect(sql).toContain('DESCRIPTION')
  })
})
