import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test'
import { StatusMasterModel } from '@src/_workspace/models/_status-master/StatusMasterModel'
import type { Request, Response } from 'express'
import { StatusMasterController } from './StatusMasterController'

describe('StatusMasterController', () => {
  afterEach(() => {
    ;(StatusMasterModel.getStatusMasters as any).mockRestore?.()
  })

  test('normalizes the request and returns the company ResponseI contract', async () => {
    const rows = [{ MASTER_TYPE: 'REQUEST_STATE', STATUS_CODE: 'IN_PROGRESS' }]
    const getStatusMasters = spyOn(StatusMasterModel, 'getStatusMasters').mockResolvedValue(rows as any)
    const json = mock(() => undefined)
    const response = {
      status: mock(() => response),
      json,
    } as unknown as Response
    const request = {
      body: { MASTER_TYPE: 'request_state' },
      query: {},
    } as unknown as Request

    await StatusMasterController.getStatusMasters(request, response)

    expect(getStatusMasters).toHaveBeenCalledWith({ MASTER_TYPE: 'REQUEST_STATE' })
    expect(response.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({
      Status: true,
      ResultOnDb: rows,
      TotalCountOnDb: 1,
      MethodOnDb: 'Get Status Masters',
      Message: 'Get Data Success',
    })
  })
})
