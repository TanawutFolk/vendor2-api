import { MasterDataSystemModel } from '@src/_workspace/models/_MasterDataSystem/_MasterDataSystemModel'
import { Request, Response } from 'express'

export const MasterDataSystemController = {
  getItemCodeInBomOfProduct: async (req: Request, res: Response) => {
    let dataItem
    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await MasterDataSystemModel.getItemCodeInBomOfProduct(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'Search ProductCategory',
      TotalCountOnDb: 0,
    })
  },
}
