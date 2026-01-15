import { CustomerShipToModel } from '@src/_workspace/models/customer/customer-ship-to/CustomerShipToModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const CustomerShipToController = {
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
      { table: 'tb_1', id: 'CUSTOMER_SHIP_TO_ID', Fns: '=' },
      { table: 'tb_1', id: 'CUSTOMER_SHIP_TO_NAME', Fns: 'LIKE' },

      { table: 'tb_1', id: 'CUSTOMER_SHIP_TO_ALPHABET', Fns: 'LIKE' },

      { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                          CUSTOMER_SHIP_TO tb_1`,

      selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
    }

    // Use getSqlWhere to construct the WHERE clause
    getSqlWhere(dataItem, tableIds)
    const result = await CustomerShipToModel.search(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search CustomerOrderFrom',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },

  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await CustomerShipToModel.create(dataItem)
    // {
    //   Status: true,
    //   Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
    //   ResultOnDb: result,
    //   MethodOnDb: 'Create Product Category',
    //   TotalCountOnDb: ''
    // }
    res.status(200).json(result as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await CustomerShipToModel.update(dataItem)
    // {
    //   Status: true,
    //   Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
    //   ResultOnDb: result,
    //   MethodOnDb: 'Update Product Category',
    //   TotalCountOnDb: ''
    // }
    res.json(result as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await CustomerShipToModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Product Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  // GetByLikeProductMainNameAndInuse: async ({ query }) => {
  //   if (query !== '') {
  //     let result = await ProductMainModel.getByLikeProductMainNameAndInuse(query)
  //     return {
  //       Status: true,
  //       Message: 'getByLikeProductMainNameAndInuse Data Success',
  //       ResultOnDb: result,
  //       MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
  //       TotalCountOnDb: ''
  //     }
  //   }
  // },
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
