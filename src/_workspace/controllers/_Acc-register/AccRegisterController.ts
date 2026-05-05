import { AccRegisterModel } from '@src/_workspace/models/_Acc-register/AccRegisterModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const AccRegisterController = {
  completeRegistration: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    try {
      const request_id = parseInt(dataItem.request_id as string)
      if (!request_id || isNaN(request_id)) {
        return res.status(400).json({
          Status: false,
          ResultOnDb: {},
          TotalCountOnDb: 0,
          MethodOnDb: 'Complete Registration',
          Message: 'Invalid request_id',
        } as ResponseI)
      }
      const result = await AccRegisterModel.completeRegistration({
        request_id,
        vendor_code: dataItem.vendor_code || '',
        UPDATE_BY: dataItem.UPDATE_BY || 'SYSTEM',
      })
      res.status(200).json(result as ResponseI)
    } catch (error: any) {
      console.error('Complete Registration Error:', error)
      res.status(200).json({
        Status: false,
        ResultOnDb: {},
        TotalCountOnDb: 0,
        MethodOnDb: 'Complete Registration',
        Message: error?.message || 'Failed to complete registration',
      } as ResponseI)
    }
  },
}
