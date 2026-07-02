import { BomPivotingModel } from '@src/_workspace/models/bom-pivoting/BomPivotingModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const BomPivotingController = {
  search: async (req: Request, res: Response) => {
    const dataItem = !req.body || Object.entries(req.body).length === 0 ? req.query : req.body
    const result = await BomPivotingModel.search(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result || [],
      TotalCountOnDb: result?.length ?? 0,
      MethodOnDb: 'Search BOM Pivoting Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
