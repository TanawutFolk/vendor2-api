import { CurrencyRateModel } from '@src/_workspace/models/cost-condition/CurrencyRateModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

const urlAssets = (symbol: any) => {
  return `https://fftwebstorage.blob.core.windows.net/exchange-rate-assets/${symbol}.png`
}

export const CurrencyController = {
  getByInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = (await CurrencyRateModel.getByInuse(dataItem)) as RowDataPacket[]

    result = result.map((item: any) => {
      return {
        ...item,
        THB_IMAGE: urlAssets('THB'),
        CURRENCY_IMAGE: urlAssets(item.CURRENCY_SYMBOL),
      }
    })

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Currency',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
