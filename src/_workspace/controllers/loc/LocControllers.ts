import { LocModels } from '@src/_workspace/models/loc/locModels'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const locControllers = {
  getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await LocModels.getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result || [],
      TotalCountOnDb: result.length,
      MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
      Message: 'getByLikeProductMainNameAndInuse Data Success',
    } as ResponseI)
  },
}
