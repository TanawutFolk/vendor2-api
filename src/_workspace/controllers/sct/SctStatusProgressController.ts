import { SctStatusProgressModel } from '@src/_workspace/models/sct/SctStatusProgressModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const SctStatusProgressController = {
  getByLikeSctStatusProgressNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await SctStatusProgressModel.getByLikeSctStatusProgressNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result?.length ?? 0,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getBySctStatusProgressNameAndInuse_withDisabledOption: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await SctStatusProgressModel.getBySctStatusProgressNameAndInuse_withDisabledOption(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    })
  },
}
