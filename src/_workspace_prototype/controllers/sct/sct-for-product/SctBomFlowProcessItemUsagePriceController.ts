import { SctBomFlowProcessItemUsagePriceModel } from '@src/_workspace/models/sct/sct-for-product/SctBomFlowProcessItemUsagePriceModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const SctBomFlowProcessItemUsagePriceController = {
  getBySctId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await SctBomFlowProcessItemUsagePriceModel.getBySctId(dataItem)

    res.status(200).send({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
