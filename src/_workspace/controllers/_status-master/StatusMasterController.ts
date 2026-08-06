import { StatusMasterModel } from '@src/_workspace/models/_status-master/StatusMasterModel'
import type { StatusMasterSearchData } from '@src/_workspace/types/StatusMaster'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

const requestData = (req: Request) =>
  !req.body || Object.entries(req.body).length === 0 ? req.query : req.body

export const StatusMasterController = {
  getStatusMasters: async (req: Request, res: Response) => {
    try {
      const dataItem = requestData(req)
      const searchData: StatusMasterSearchData = {
        MASTER_TYPE: String(dataItem.MASTER_TYPE || '')
          .trim()
          .toUpperCase() as StatusMasterSearchData['MASTER_TYPE'],
      }
      const result = await StatusMasterModel.getStatusMasters(searchData)

      res.status(200).json({
        Status: true,
        ResultOnDb: result,
        TotalCountOnDb: result.length,
        MethodOnDb: 'Get Status Masters',
        Message: 'Get Data Success',
      } as ResponseI)
      return
    } catch (error: any) {
      res.status(200).json({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Get Status Masters',
        Message: error?.message || 'Failed to get status masters',
      } as ResponseI)
      return
    }
  },
}
