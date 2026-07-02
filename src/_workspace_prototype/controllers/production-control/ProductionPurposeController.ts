import { ProductionPurposeModel } from '@src/_workspace/models/production-control/ProductionPurposeModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ProductionPurposeController = {
  getByLikeProductionPurposeNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ProductionPurposeModel.getByLikeProductionPurposeNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'Get By Like Production Purpose Name And Inuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
