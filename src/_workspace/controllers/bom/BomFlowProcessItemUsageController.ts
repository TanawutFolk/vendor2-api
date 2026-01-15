import { BomFlowProcessItemUsageModel } from '@src/_workspace/models/bom/BomFlowProcessItemUsageModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const BomFlowProcessItemUsageController = {
  getByProductTypeCodeAndProcessName: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await BomFlowProcessItemUsageModel.getByProductTypeCodeAndProcessName(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'getByProductTypeCodeAndProcessName',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await BomFlowProcessItemUsageModel.getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'getByBomId',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
