import { ExchangeRateModel } from '@src/_workspace/models/cost-condition/ExchangeRateModel'
import { getSqlWhereByColumnFilters_elysia } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

const urlAssets = (symbol: any) => {
  return `https://fftwebstorage.blob.core.windows.net/exchange-rate-assets/${symbol}.png`
}

export const ExchangeRateController = {
  getCurrency: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = (await ExchangeRateModel.getCurrency(dataItem)) as RowDataPacket

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
      TotalCountOnDb: result['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Currency',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const tableIds = [
      { table: 'tb_1', id: 'EXCHANGE_RATE_VALUE' },
      { table: 'tb_1', id: 'FISCAL_YEAR' },
      { table: 'tb_1', id: 'VERSION' },
      { table: 'tb_2', id: 'CURRENCY_SYMBOL' },
      { table: 'tb_1', id: 'UPDATE_BY' },
      { table: 'tb_1', id: 'UPDATE_DATE' },
      { table: 'tb_1', id: 'INUSE' },
    ]

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''

    if (dataItem['Order'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC, tb_1.CURRENCY_ID ASC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters_elysia(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    let result = await ExchangeRateModel.search(dataItem)

    result[1] = result[1].map((item: any) => {
      return {
        ...item,
        FROM_AMOUNT: 1,
        FROM_CURRENCY: 'THB',
        FROM_CURRENCY_IMAGE: urlAssets('THB'),
        TO_CURRENCY_IMAGE: urlAssets(item.CURRENCY_SYMBOL),
      }
    })

    res.json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Exchange Rate',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    let result = await ExchangeRateModel.create(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Create Exchange Rate',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },
}
