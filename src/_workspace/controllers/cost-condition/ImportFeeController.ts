import { ImportFeeModel } from '@src/_workspace/models/cost-condition/ImportFeeModel'
import { getSqlWhereByColumnFilters_elysia } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ImportFeeController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'IMPORT_FEE_RATE' },
      { table: 'tb_2', id: 'ITEM_IMPORT_TYPE_NAME' },
      { table: 'tb_1', id: 'FISCAL_YEAR' },
      { table: 'tb_1', id: 'VERSION' },
      { table: 'tb_1', id: 'UPDATE_BY' },
      { table: 'tb_1', id: 'UPDATE_DATE' },
      { table: 'tb_1', id: 'INUSE' },
    ]

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''

    if (dataItem['Order'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC, tb_1.ITEM_IMPORT_TYPE_ID ASC'
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

    let result = await ImportFeeModel.search(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Import Fee',
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
    let result = await ImportFeeModel.create(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Create Import Fee',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },
  getByFiscalYear_MasterDataLatest: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await ImportFeeModel.getByFiscalYear_MasterDataLatest(dataItem)

    res.status(200).send({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
