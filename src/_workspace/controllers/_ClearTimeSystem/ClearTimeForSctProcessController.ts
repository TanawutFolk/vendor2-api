import { ClearTimeForSctProcessModel } from '@src/_workspace/models/_ClearTimeSystem/ClearTimeForSctProcessModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ClearTimeForSctProcessController = {
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await ClearTimeForSctProcessModel.getByProductTypeIdAndFiscalYear_MasterDataLatest(dataItem)

    res.status(200).send({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await ClearTimeForSctProcessModel.getByProductTypeIdAndFiscalYearAndRevisionNo(dataItem)

    res.status(200).send({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
