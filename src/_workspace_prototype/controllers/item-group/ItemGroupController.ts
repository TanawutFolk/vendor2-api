import { ItemGroupModels } from '@src/_workspace/models/item-group/ItemGroupModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ItemGroupController = {
  getByLikeItemGroupName: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemGroupModels.getByLikeItemGroupName(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeItemGroupName',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
