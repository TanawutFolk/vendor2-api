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
      VENDORS_ID: 1,
      STATUS_CHECK: 'matched',
      PRONES_CODE: 'P001',
      PRONES_NAME: 'Vendor',
      MATCH_METHOD: 'code',
    }])

    expect(sql).toContain('ON DUPLICATE KEY UPDATE')
    expect(sql).toContain('INUSE = 1')
    expect(sql).toContain('DESCRIPTION')
  })

  test('loads province dropdown from info_province master data', () => {
    const sql = FindVendorSQL.getProvinces()

    expect(sql).toContain('FROM')
    expect(sql).toContain('info_province')
    expect(sql).toContain('PROVINCE AS value')
    expect(sql).toContain('PROVINCE AS label')
    expect(sql).toContain('IFNULL(INUSE, 1) = 1')
    expect(sql).not.toContain('FROM\n                                       vendors')
  })

  test('loads vendor business category dropdown from info_business_category master data', () => {
    const sql = FindVendorSQL.getVendorBusinessCategoryName()

    expect(sql).toContain('info_business_category')
    expect(sql).toContain('BUSINESS_CATEGORY_ID AS value')
    expect(sql).toContain('BUSINESS_CATEGORY_NAME AS label')
    expect(sql).toContain('BUSINESS_CATEGORY_NAME ASC')
    expect(sql).not.toContain('master_vendor_types')
    expect(sql).not.toContain('FROM\n                                       business_category')
  })
})
