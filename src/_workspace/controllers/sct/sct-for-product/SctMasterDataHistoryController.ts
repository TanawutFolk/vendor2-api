import { SctMasterDataHistoryModel } from '@src/_workspace/models/sct/sct-for-product/SctMasterDataHistoryModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const SctMasterDataHistoryController = {
  getBySctIdAndIsFromSctCopy: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await SctMasterDataHistoryModel.getBySctIdAndIsFromSctCopy(dataItem)

    return res.status(200).send({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'getByLikePatternNameAndInuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
