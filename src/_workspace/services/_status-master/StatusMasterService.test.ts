import { afterEach, describe, expect, spyOn, test } from 'bun:test'
import { MySQLExecute } from '@businessData/dbExecute'
import { StatusMasterService } from './StatusMasterService'

describe('StatusMasterService', () => {
  afterEach(() => {
    ;(MySQLExecute.search as any).mockRestore?.()
  })

  test('executes StatusMasterSQL and returns database rows', async () => {
    const rows = [
      {
        MASTER_TYPE: 'REQUEST_STATE',
        STATUS_ID: 1,
        STATUS_CODE: 'IN_PROGRESS',
        SORT_ORDER: 1,
      },
    ] as any
    const search = spyOn(MySQLExecute, 'search').mockResolvedValue(rows)

    const result = await StatusMasterService.getStatusMasters({ MASTER_TYPE: 'REQUEST_STATE' })

    expect(result).toEqual(rows)
    const statusMasterCall = search.mock.calls.find(([sql]) =>
      String(sql).includes("WHERE master_data.MASTER_TYPE = 'REQUEST_STATE'"),
    )
    expect(statusMasterCall).toBeDefined()
  })
})
