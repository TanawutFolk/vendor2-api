import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

import { ThemeColorModels } from '@src/_workspace/models/theme-color/ThemeColorModel'

export const ThemeColorController = {
  getThemeColor: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    // console.log(dataItem)

    const result = await ThemeColorModels.getThemeColor(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getThemeColor',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
