import { SctComponentTypeResourceOptionSelectModel } from '@src/_workspace/models/sct/sct-for-product/SctComponentTypeResourceOptionSelectModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const SctComponentTypeResourceOptionSelectController = {
  getBySctId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await SctComponentTypeResourceOptionSelectModel.getBySctId(dataItem)

    res.status(200).send({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
