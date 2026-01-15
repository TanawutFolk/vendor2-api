import { BoiProjectModel } from '@models/boi/BoiProjectModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const boiProjectController = {
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
      { table: 'tb_1', id: 'BOI_PROJECT_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'BOI_PROJECT_CODE', Fns: 'LIKE' },

      { table: 'tb_1', id: 'BOI_PRODUCT_GROUP_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'INUSE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'BOI_PROJECT_ID', Fns: '=' },

      { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                          BOI_PROJECT tb_1`,

      selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
    }

    getSqlWhere(dataItem, tableIds)
    const result = await BoiProjectModel.search(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search CustomerOrderFrom',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },
  getByLikeBoiProjectCodeAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await BoiProjectModel.getByLikeBoiProjectCodeAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductMainNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeBoiProductGroupAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await BoiProjectModel.getByLikeBoiProductGroupAndInuse(dataItem)

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

    let result = await BoiProjectModel.create(dataItem)
    res.status(200).json(result as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await BoiProjectModel.update(dataItem)

    res.json(result as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await BoiProjectModel.delete(dataItem)
    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Boi',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeBoiProjectNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await BoiProjectModel.getByLikeBoiProjectNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductMainNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getBoiProjectGroupNameByLike: async (req: Request, res: Response) => {
    let dataItem
    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await BoiProjectModel.getBoiProjectGroupNameByLike(dataItem)
    res.json({
      Status: true,
      Message: 'getBoiProjectGroupNameByLike Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getBoiProjectGroupNameByLike',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
