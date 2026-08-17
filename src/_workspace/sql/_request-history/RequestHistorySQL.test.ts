import { describe, expect, test } from 'bun:test'
import { RequestHistorySQL } from './RequestHistorySQL'

describe('RequestHistorySQL GPR C setup options', () => {
  test('loads Product Main options from the MES product master', () => {
    const sql = RequestHistorySQL.getGprCProducts({ SEARCH_TEXT: "Engineer's" })

    expect(sql).toContain('PRODUCT_MAIN_ALPHABET')
    expect(sql).toContain('pm.INUSE = 1')
    expect(sql).toContain("Engineer''s")
  })

  test('loads Section options from the person section master', () => {
    const sql = RequestHistorySQL.getGprCSections({ SEARCH_TEXT: "QA's" })

    expect(sql).toContain('set_section_fed')
    expect(sql).toContain('TRIM(section_master.SECT_NAME) AS SECT_NAME')
    expect(sql).not.toContain('AS value')
    expect(sql).not.toContain('AS label')
    expect(sql).toContain("QA''s")
  })
})
