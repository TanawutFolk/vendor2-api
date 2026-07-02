import { YieldRateImportModel } from '@src/_workspace/models/yield-rate-and-go-straight-rate/YieldRateImportModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const CreateYieldRate = async (req: Request, res: Response) => {
  const result = await YieldRateImportModel.createYieldRate(req.body)
  res.json({
    Status: true,
    ResultOnDb: result,
    TotalCountOnDb: 0,
    MethodOnDb: 'Create Yield Rate',
    Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
  } as ResponseI)
}

export const getAll = async (req: Request, res: Response) => {
  const result = await YieldRateImportModel.getAll()
  res.json({
    Status: true,
    ResultOnDb: result,
    TotalCountOnDb: result.length,
    MethodOnDb: 'Search Sct Data',
    Message: 'Search Data Success',
  } as ResponseI)
}
