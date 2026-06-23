import { describe, expect, test } from 'bun:test'
import { TaskManagerRequestService } from '../../services/_task-manager/TaskManagerRequestService'
import { TaskManagerSQL } from './TaskManagerSQL'

describe('TaskManagerRequestService SQL input helpers', () => {
  test('allows known sort columns and directions', () => {
    expect(TaskManagerRequestService.buildTaskManagerOrder('t.company_name asc, t.CREATE_DATE DESC')).toBe('t.COMPANY_NAME ASC, t.CREATE_DATE DESC')
  })

  test('rejects unknown or injected sort expressions', () => {
    expect(TaskManagerRequestService.buildTaskManagerOrder('t.action ASC')).toBe('t.REQUEST_REGISTER_VENDOR_ID DESC')
    expect(TaskManagerRequestService.buildTaskManagerOrder('t.request_id DESC; DROP TABLE vendors')).toBe('t.REQUEST_REGISTER_VENDOR_ID DESC')
  })

  test('normalizes and bounds pagination', () => {
    expect(TaskManagerRequestService.normalizeTaskManagerPagination('1000', '-20')).toEqual({ limit: 500, offset: 0 })
    expect(TaskManagerRequestService.normalizeTaskManagerPagination('25', '50')).toEqual({ limit: 25, offset: 50 })
    expect(TaskManagerRequestService.normalizeTaskManagerPagination('invalid', 'invalid')).toEqual({ limit: 50, offset: 0 })
  })
})

describe('TaskManagerSQL search query', () => {
  test('uses SQL values prepared by service', async () => {
    const [, dataSql] = await TaskManagerSQL.searchAllTask(TaskManagerRequestService.buildTaskManagerSqlDataItem({
      SEARCHFILTERS: [
        { id: 'current_owner_empcode', value: 'EMP001' },
        { id: 'company_name', value: "O'Neil" },
      ],
      ORDER: 't.request_id DESC',
      LIMIT: 20,
      OFFSET: 0,
    }))

    expect(dataSql).toContain("t.CURRENT_OWNER_EMPCODE = 'EMP001'")
    expect(dataSql).toContain("t.COMPANY_NAME LIKE '%O'Neil%'")
    expect(dataSql).not.toContain("CURRENT_OWNER_EMPCODE LIKE '%EMP001%'")
  })

  test('selects the first active workflow step by step order', async () => {
    const [, dataSql] = await TaskManagerSQL.searchAllTask(TaskManagerRequestService.buildTaskManagerSqlDataItem({}))

    expect(dataSql).toContain('ORDER BY ras_current.STEP_ORDER ASC, ras_current.REQUEST_APPROVAL_STEP_ID ASC')
    expect(dataSql).toContain('LIMIT 1')
    expect(dataSql).toContain('WHEN ras.REQUEST_APPROVAL_STEP_ID IS NOT NULL')
    expect(dataSql).toContain('SELECT MIN(a_pic_match.ASSIGNEES_TO_ID)')
    expect(dataSql).toContain("'completed'")
    expect(dataSql).toContain("'rejected'")
  })
})
