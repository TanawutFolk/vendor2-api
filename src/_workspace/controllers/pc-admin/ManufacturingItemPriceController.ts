import { ManufacturingItemPriceModel } from '@src/_workspace/models/pc-admin/ManufacturingItemGroupModel'

import { Request, Response } from 'express'

export const ManufacturingItemPriceController = {
  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ManufacturingItemPriceModel.create(dataItem)

    res.status(200).json(result)
  },
}
