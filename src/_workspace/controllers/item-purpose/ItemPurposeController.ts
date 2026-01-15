import { ItemPurposeModel } from '@src/_workspace/models/item-purpose/ItemPurposeModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ItemPurposeController = {
  getByLikeItemPurposeNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemPurposeModel.getByLikeItemPurposeNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item Purpose',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
