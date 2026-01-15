import { OrderTypeModel } from '@_workspace/models/production-control/OrderTypeModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const OrderTypeController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'ORDER_TYPE_ID', Fns: '=' },
      { table: 'tb_1', id: 'ORDER_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'ORDER_TYPE_ALPHABET', Fns: 'LIKE' },
      // { table: 'tb_1', id: 'INUSE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                          ORDER_TYPE tb_1`,

      selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
    }
    getSqlWhere(dataItem, tableIds)

    const result = await OrderTypeModel.search(dataItem)
    // for (let i = 0; i < result[1].length; i++) {
    //   result[1][i]['No'] = i + 1
    // }

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search OrderType',
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
    const result = await OrderTypeModel.create(dataItem)

    res.status(200).json(result)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await OrderTypeModel.update(dataItem)

    res.json(result)
  },

  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await OrderTypeModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
      ResultOnDb: result,
      MethodOnDb: 'Delete FlowType',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
