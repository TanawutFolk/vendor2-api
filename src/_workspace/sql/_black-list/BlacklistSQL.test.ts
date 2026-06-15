import { describe, expect, test } from 'bun:test'
import { BlacklistSQL } from './BlacklistSQL'

describe('BlacklistSQL audit preservation', () => {
  test('deactivates imported rows instead of deleting them', () => {
    const usSql = BlacklistSQL.deactivateUs('S00001')
    const cnSql = BlacklistSQL.deactivateCn('S00001')
    const aliasSql = BlacklistSQL.deactivateCnAliases('S00001')

    for (const sql of [usSql, cnSql, aliasSql]) {
      expect(sql).toContain('INUSE = 0')
      expect(sql).toContain("UPDATE_BY = 'S00001'")
      expect(sql).not.toContain('DELETE FROM')
      expect(sql).not.toContain('TRUNCATE TABLE')
    }
  })

  test('searches only active imported rows', () => {
    const [countSql, dataSql] = BlacklistSQL.searchAgGrid({
      SQLWHERE: '',
      LIMIT: 10,
      OFFSET: 0,
    })

    expect(countSql).toContain('bu.INUSE = 1')
    expect(countSql).toContain('bc.INUSE = 1')
    expect(dataSql).toContain('bu.INUSE = 1')
    expect(dataSql).toContain('bc.INUSE = 1')
  })
})
