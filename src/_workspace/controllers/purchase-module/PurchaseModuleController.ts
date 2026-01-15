import { PurchaseModuleModel } from '@src/_workspace/models/purchase-module/PurchaseModuleModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const PurchaseModuleController = {
  getByLikePurchaseModuleNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await PurchaseModuleModel.getByLikePurchaseModuleNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'getByLikePurchaseModuleNameAndInuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
