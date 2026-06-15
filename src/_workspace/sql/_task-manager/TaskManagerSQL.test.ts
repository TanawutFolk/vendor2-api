import { describe, expect, test } from 'bun:test'
import { buildTaskManagerOrder, normalizeTaskManagerPagination, TaskManagerSQL } from './TaskManagerSQL'

describe('TaskManagerSQL helpers', () => {
  test('allows known sort columns and directions', () => {
    expect(buildTaskManagerOrder('t.company_name asc, t.CREATE_DATE DESC')).toBe('t.COMPANY_NAME ASC, t.CREATE_DATE DESC')
  })

  test('rejects unknown or injected sort expressions', () => {
    expect(buildTaskManagerOrder('t.action ASC')).toBe('t.REQUEST_ID DESC')
    expect(buildTaskManagerOrder('t.request_id DESC; DROP TABLE vendors')).toBe('t.REQUEST_ID DESC')
  })

  test('normalizes and bounds pagination', () => {
    expect(normalizeTaskManagerPagination('1000', '-20')).toEqual({ limit: 500, offset: 0 })
    expect(normalizeTaskManagerPagination('25', '50')).toEqual({ limit: 25, offset: 50 })
    expect(normalizeTaskManagerPagination('invalid', 'invalid')).toEqual({ limit: 50, offset: 0 })
  })
})

describe('TaskManagerSQL search query', () => {
  test('uses exact PIC filtering and escapes apostrophes', async () => {
    const [, dataSql] = await TaskManagerSQL.searchAllTask({
      SEARCHFILTERS: [
        { id: 'current_owner_empcode', value: 'EMP001' },
        { id: 'company_name', value: "O'Neil" },
      ],
      ORDER: 't.request_id DESC',
      LIMIT: 20,
      OFFSET: 0,
    })

    expect(dataSql).toContain("t.CURRENT_OWNER_EMPCODE = 'EMP001'")
    expect(dataSql).toContain("t.COMPANY_NAME LIKE '%O\\'Neil%'")
    expect(dataSql).not.toContain("CURRENT_OWNER_EMPCODE LIKE '%EMP001%'")
  })

  test('selects the first active workflow step by step order', async () => {
    const [, dataSql] = await TaskManagerSQL.searchAllTask({})

    expect(dataSql).toContain('ORDER BY ras_current.STEP_ORDER ASC, ras_current.STEP_ID ASC')
    expect(dataSql).toContain('LIMIT 1')
    expect(dataSql).toContain('WHEN ras.STEP_ID IS NOT NULL')
    expect(dataSql).toContain('SELECT MIN(a_pic_match.ASSIGNEES_ID)')
    expect(dataSql).toContain("'completed'")
    expect(dataSql).toContain("'rejected'")
  })
})
