import { ClearTimeModel } from '@src/_workspace/models/clear-time/ClearTimeModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const CreateClearTime = async (req: Request, res: Response) => {
  const result = await ClearTimeModel.createClearTime(req.body)
  res.json(result as ResponseI)
}
