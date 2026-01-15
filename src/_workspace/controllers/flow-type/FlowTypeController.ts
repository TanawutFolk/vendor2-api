import { FlowTypeModel } from '@src/_workspace/models/flow-type/FlowTypeModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const FlowTypeController = {
  getFlowType: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await FlowTypeModel.getFlowType(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'Search FlowType',
      TotalCountOnDb: result.length,
    } as ResponseI)
  },

  searchFlowType: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'FLOW_TYPE_ID', Fns: '=' },
      { table: 'tb_1', id: 'FLOW_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'FLOW_TYPE_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                              FLOW_TYPE tb_1`,

      selectInuseForSearch: `
            tb_1.INUSE AS inuseForSearch
          `,
    }

    // Use getSqlWhere to construct the WHERE clause
    getSqlWhere(dataItem, tableIds)

    // dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    // let orderBy = ''
    // if (typeof dataItem.Order === 'string') {
    //   try {
    //     dataItem.Order = JSON.parse(dataItem.Order) // แปลง string → array
    //   } catch (error) {
    //     console.error('Error parsing Order:', error)
    //     dataItem.Order = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
    //   }
    // }
    // if (dataItem['Order'].length <= 0) {
    //   orderBy = 'UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < dataItem['Order'].length; i++) {
    //     const word = dataItem['Order'][i]
    //     orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //   }
    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy

    // let sqlWhereColumnFilter = ''
    // if (dataItem?.ColumnFilters?.length > 0) {
    //   sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    // }

    // dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await FlowTypeModel.searchFlowType(dataItem)
    // for (let i = 0; i < result[1].length; i++) {
    //   result[1][i]['No'] = i + 1
    // }

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search FlowType',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },

  createFlowType: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await FlowTypeModel.createFlowType(dataItem)

    res.status(200).json(result as ResponseI)
  },

  updateFlowType: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FlowTypeModel.updateFlowType(dataItem)

    res.json(result as ResponseI)
  },

  deleteFlowType: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await FlowTypeModel.deleteFlowType(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
      ResultOnDb: result,
      MethodOnDb: 'Delete FlowType',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByLikeFlowTypeName: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await FlowTypeModel.getByLikeFlowTypeName(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'GetByLikeFlowTypeName',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
