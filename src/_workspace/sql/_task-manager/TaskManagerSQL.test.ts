import { describe, expect, test } from 'bun:test'
import { TaskManagerRequestService } from '../../services/_task-manager/TaskManagerRequestService'
import { TaskManagerRequestSQL } from './TaskManagerRequestSQL'
import { TaskManagerSQL } from './TaskManagerSQL'

describe('TaskManagerRequestService SQL input helpers', () => {
  test('normalizes and bounds pagination', () => {
    expect(TaskManagerRequestService.normalizeTaskManagerPagination('1000', '-20')).toEqual({ limit: 500, offset: 0 })
    expect(TaskManagerRequestService.normalizeTaskManagerPagination('25', '50')).toEqual({ limit: 25, offset: 50 })
    expect(TaskManagerRequestService.normalizeTaskManagerPagination('invalid', 'invalid')).toEqual({ limit: 50, offset: 0 })
  })

  test('builds ORDER from sort model and falls back to request id', () => {
    const sorted = TaskManagerRequestService.buildTaskManagerSqlDataItem({
      ORDER: [{ id: 'COMPANY_NAME', desc: false }, { id: 'CREATE_DATE', desc: true }],
    })
    expect(sorted.ORDER).toContain('COMPANY_NAME ASC')
    expect(sorted.ORDER).toContain('CREATE_DATE DESC')

    const fallback = TaskManagerRequestService.buildTaskManagerSqlDataItem({})
    expect(fallback.ORDER).toBe('t.REQUEST_REGISTER_VENDOR_ID DESC')
  })
})

describe('TaskManagerSQL search query', () => {
  test('uses SQL values prepared by service', async () => {
    const [, dataSql] = await TaskManagerSQL.searchAllTask(TaskManagerRequestService.buildTaskManagerSqlDataItem({
      SEARCHFILTERS: [
        { id: 'CURRENT_M_REQUEST_STATUS_ID', value: 4 },
        { id: 'CURRENT_OWNER_EMPCODE', value: 'EMP001' },
        { id: 'COMPANY_NAME', value: 'ACME' },
      ],
      ORDER: [{ id: 'REQUEST_REGISTER_VENDOR_ID', desc: true }],
      LIMIT: 20,
      OFFSET: 0,
    }))

    expect(dataSql).toContain('t.CURRENT_M_REQUEST_STATUS_ID = \'4\'')
    expect(dataSql).toContain('rr.CURRENT_M_REQUEST_STATUS_ID')
    expect(dataSql).not.toContain('AS CURRENT_STATUS_ID')

    expect(dataSql).toContain("t.CURRENT_OWNER_EMPCODE = 'EMP001'")
    expect(dataSql).toContain("t.COMPANY_NAME LIKE '%ACME%'")
    expect(dataSql).not.toContain("CURRENT_OWNER_EMPCODE LIKE '%EMP001%'")
  })

  test('selects the first active workflow step by step order', async () => {
    const [, dataSql] = await TaskManagerSQL.searchAllTask(TaskManagerRequestService.buildTaskManagerSqlDataItem({}))

    expect(dataSql).toContain('ORDER BY ras_current.STEP_ORDER ASC, ras_current.REQUEST_APPROVAL_STEP_ID ASC')
    expect(dataSql).toContain('LIMIT 1')
    expect(dataSql).toContain('WHEN ras.REQUEST_APPROVAL_STEP_ID IS NOT NULL')
    expect(dataSql).toContain('SELECT MIN(a_pic_match.APPROVAL_GROUP_MEMBER_ID)')
    expect(dataSql).toContain("request_state_master.STATE_CODE = 'IN_PROGRESS'")
    expect(dataSql).not.toContain('rr.REQUEST_STATE')
  })
})

describe('TaskManagerRequestSQL GPR C queue', () => {
  test('owns the task-manager queue query and resolves every placeholder', () => {
    const sql = TaskManagerRequestSQL.getTaskManagerQueue()

    expect(sql).toContain('FROM REQUEST_VENDOR_GPR_C_FLOWS f')
    expect(sql).toContain('JOIN REQUEST_VENDOR_GPR_C_STEPS s')
    expect(sql).not.toContain('dataItem.')
  })
})
