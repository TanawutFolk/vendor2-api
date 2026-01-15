import { YieldRateMaterialModel } from '@src/_workspace/models/yield-rate-material/YieldRateMaterialModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const CreateYieldRateMaterial = async (req: Request, res: Response) => {
  const result = await YieldRateMaterialModel.createYieldRateMaterial(req.body)
  res.json(result as ResponseI)
}
