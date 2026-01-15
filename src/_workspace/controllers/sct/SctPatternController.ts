import { SctPatternModel } from '@_workspace/models/sct/SctPatternModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const SctPatternController = {
  getByLikePatternNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await SctPatternModel.getByLikePatternNameAndInuse(dataItem)

    res.status(200).send({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}

// export const getByLikePatternNameAndInuse = async (req: Request, res: Response) => {

//   const result = await SctPatternModel.getByLikePatternNameAndInuse(req)

//   res.status(200).send({
//     Status: true,
//     ResultOnDb: result,
//     TotalCountOnDb: 0,
//     MethodOnDb: 'Search Sct Data',
//     Message: 'Search Data Success'
//   } as ResponseI)
// }
