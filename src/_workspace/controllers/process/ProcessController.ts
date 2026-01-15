import { ProcessModel } from '@src/_workspace/models/process/ProcessModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ProcessController = {
  getAllProcessInProductMain: async (req: Request, res: Response) => {
    // let dataItem

    // if (Object.entries(req.body).length === 0) {
    //   dataItem = req.query.data
    // } else {
    //   dataItem = req.body
    // }

    const result = await ProcessModel.getAllProcessInProductMain()

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'getAllProcessInProductMain',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
