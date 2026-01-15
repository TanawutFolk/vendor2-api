import { BoiUnitModel } from '@models/boi/BoiUnitModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const boiUnitController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    // dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    // let orderBy = ''

    // if (dataItem['Order'] == '') {
    //   orderBy = 'UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < JSON.parse(dataItem['Order']).length; i++) {
    //     const word = JSON.parse(dataItem['Order'])[i]
    //     orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //   }

    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy

    // Define tableIds and corresponding fields
    const tableIds = [
      { table: 'tb_1', id: 'BOI_UNIT_ID', Fns: '=' },
      { table: 'tb_1', id: 'BOI_UNIT_NAME', Fns: 'LIKE' },

      { table: 'tb_1', id: 'BOI_UNIT_SYMBOL', Fns: 'LIKE' },

      { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
          BOI_UNIT tb_1`,

      selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
    }

    // Use getSqlWhere to construct the WHERE clause
    getSqlWhere(dataItem, tableIds)

    const result = await BoiUnitModel.search(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search CustomerOrderFrom',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },
  GetByLikeBoiSymbol: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await BoiUnitModel.GetByLikeBoiSymbol(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'getByLikeProductMainNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeBoiUnitNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await BoiUnitModel.getByLikeBoiUnitNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductMainNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeBoiSymbolAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await BoiUnitModel.getByLikeBoiSymbolAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductMainNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await BoiUnitModel.create(dataItem)
    res.status(200).json(result as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await BoiUnitModel.update(dataItem)
    res.json(result as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await BoiUnitModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Product Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  // getByLikeBoiProjectNameAndInuse: async ({ query }) => {
  //   if (query !== '') {
  //     let result = await BoiUnitModel.getByLikeBoiProjectNameAndInuse(query)
  //     return {
  //       Status: true,
  //       Message: 'getByLikeProductMainNameAndInuse Data Success',
  //       ResultOnDb: result,
  //       MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
  //       TotalCountOnDb: ''
  //     }
  //   }
  // }
  // GetByLikeProductMainNameAndProductCategoryIdAndInuse: async ({ query }) => {
  //   if (query !== '') {
  //     let result = await ProductMainModel.getByLikeProductMainNameAndProductCategoryIdAndInuse(query)
  //     return {
  //       Status: true,
  //       Message: 'getByLikeProductMainNameAndInuse Data Success',
  //       ResultOnDb: result,
  //       MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
  //       TotalCountOnDb: ''
  //     }
  //   }
  // }
}
