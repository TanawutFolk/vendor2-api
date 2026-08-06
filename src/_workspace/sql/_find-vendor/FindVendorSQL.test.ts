import { describe, expect, test } from 'bun:test'
import { FindVendorSQL } from './FindVendorSQL'
import { VendorSearchSqlSnippets } from '../common/VendorSearchSqlSnippets'

describe('FindVendorSQL', () => {
  test('loads province dropdown from info_province master data', () => {
    const sql = FindVendorSQL.getProvinces()

    expect(sql).toContain('FROM')
    expect(sql).toContain('info_province')
    expect(sql).toContain('PROVINCE AS value')
    expect(sql).toContain('PROVINCE AS label')
    expect(sql).toContain('IFNULL(INUSE, 1) = 1')
    expect(sql).not.toContain('FROM\n                                       vendors')
  })
  test('loads country dropdown from info_country master data', () => {
    const sql = FindVendorSQL.getCountries()

    expect(sql).toContain('info_country')
    expect(sql).toContain('INFO_COUNTRY_NAME AS value')
    expect(sql).toContain('INFO_COUNTRY_NAME AS label')
    expect(sql).toContain('IFNULL(INUSE, 1) = 1')
    expect(sql).not.toContain('FROM\n                                       vendors')
  })

  test('loads vendor type dropdown from info_business_category master data', () => {
    const sql = FindVendorSQL.getVendorBusinessCategoryName()

    expect(sql).toContain('info_business_category')
    expect(sql).toContain('BUSINESS_CATEGORY_ID AS value')
    expect(sql).toContain('BUSINESS_CATEGORY_NAME AS label')
    expect(sql).toContain('BUSINESS_CATEGORY_NAME ASC')
    expect(sql).not.toContain('master_vendor_types')
  })
  test('keeps paged vendor search lightweight without aggregated detail arrays', () => {
    const [, dataSql] = FindVendorSQL.search({
      LIMIT: 20,
      OFFSET: 0,
      ORDER: 'v.COMPANY_NAME ASC',
      SQLWHERECOLUMNFILTER: '',
    }, '')

    expect(dataSql).toContain('v.VENDORS_ID')
    expect(dataSql).toContain('vc.VENDOR_CONTACTS_ID')
    expect(dataSql).toContain('vp.VENDOR_PRODUCTS_ID')
    expect(dataSql).not.toContain('CONTACTS_JSON')
    expect(dataSql).not.toContain('PRODUCTS_JSON')
    expect(dataSql).not.toContain('JSON_ARRAYAGG')
  })

  test('resolves grid status from vendor master and active requests without staging joins', () => {
    const [countSql, dataSql] = FindVendorSQL.search({
      LIMIT: 20,
      OFFSET: 0,
      ORDER: 'VENDOR_STATUS_LABEL ASC',
      SQLWHERECOLUMNFILTER: '',
    }, '')

    for (const sql of [countSql, dataSql]) {
      expect(sql).toContain('m_vendor_status mvs')
    }
    expect(dataSql).toContain('AS VENDOR_STATUS_CODE')
    expect(dataSql).toContain('AS VENDOR_STATUS_LABEL')
    expect(dataSql).toContain('request_register_vendor active_vendor_request')
    expect(countSql).not.toContain('vendor_match_result')
    expect(dataSql).not.toContain('vendor_match_result')
    expect(dataSql).not.toContain('PRONES_CODE')
  })

  test('filters vendor status by the selected master ID', () => {
    const sql = VendorSearchSqlSnippets.statusIdFilter({
      VENDOR_ALIAS: 'v',
      M_VENDOR_STATUS_ID: 37,
    })

    expect(sql).toContain('= 37')
    expect(sql).toContain('m_vendor_status')
    expect(sql).not.toContain('dataItem.')
  })

  test('keeps the direct Prones raw-test query', () => {
    const sql = FindVendorSQL.getPronesRawTest()

    expect(sql).toContain('FFT.T_TRADE_MS')
    expect(sql).not.toContain('staging_prones_data')
    expect(sql).not.toContain('vendor_match_result')
  })

  test('loads contact and product arrays only in vendor detail query', () => {
    const sql = FindVendorSQL.getVendorDetail({ VENDORS_ID: 1 })

    expect(sql).toContain('v.VENDORS_ID = 1')
    expect(sql).toContain('CONTACTS_JSON')
    expect(sql).toContain('PRODUCTS_JSON')
    expect(sql).toContain('JSON_ARRAYAGG')
    expect(sql).toContain("DATE_FORMAT(v.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE")
    expect(sql).toContain("DATE_FORMAT(sub_vc.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')")
    expect(sql).toContain("DATE_FORMAT(sub_vp.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')")
  })
})
