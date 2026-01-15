import { ManufacturingItemGroupModel } from '@_workspace/models/manufacturing-item/ManufacturingItemGroupModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ManufacturingItemGroupController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'ITEM_GROUP_ID', Fns: '=' },
      { table: 'tb_1', id: 'ITEM_GROUP_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                          ITEM_GROUP tb_1`,

      selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
    }

    getSqlWhere(dataItem, tableIds)

    // dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    // let orderBy = ''

    // if (dataItem['Order'].length <= 0) {
    //   orderBy = 'tb_1.UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < dataItem['Order'].length; i++) {
    //     const word = dataItem['Order'][i]
    //     if (word['id'] == 'INUSE') {
    //       orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else {
    //       orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     }
    //   }
    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy

    // let sqlWhereColumnFilter = ''
    // if (dataItem?.ColumnFilters?.length > 0) {
    //   sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    // }

    // dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await ManufacturingItemGroupModel.search(dataItem)
    // for (let i = 0; i < result[1].length; i++) {
    //   result[1][i]['No'] = i + 1
    // }

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search ManufacturingItemGroup',
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
    const result = await ManufacturingItemGroupModel.create(dataItem)

    res.status(200).json(result)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ManufacturingItemGroupModel.update(dataItem)

    res.json(result)
  },

  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await ManufacturingItemGroupModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
      ResultOnDb: result,
      MethodOnDb: 'Delete FlowType',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
