import { FlowProductTypeModel } from '@src/_workspace/models/flow-product-type/FlowProductTypeModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

export const FlowProductTypeController = {
  searchFlowProductTypeByFlowId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = (await FlowProductTypeModel.searchFlowProductTypeByFlowId(dataItem)) as RowDataPacket[]

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result || [],
      MethodOnDb: 'Search Flow Product Type',
      TotalCountOnDb: result?.length ?? 0,
    } as ResponseI)
  },
}
