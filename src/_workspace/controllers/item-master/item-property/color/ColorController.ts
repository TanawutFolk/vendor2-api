import { ColorModel } from '@src/_workspace/models/item-master/item-property/color/ColorModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ColorController = {
  getItemPropertyColor: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ColorModel.getItemPropertyColor(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'Search ItemPropertyColor',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  searchItemPropertyColor: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'ITEM_PROPERTY_COLOR_ID', Fns: '=' },
      { table: 'tb_1', id: 'ITEM_PROPERTY_COLOR_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'INUSE', Fns: 'LIKE' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                ITEM_PROPERTY_COLOR as tb_1`,

      selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
    }

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

    const result = await ColorModel.searchItemPropertyColor(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search ItemPropertyColor',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },

  createItemPropertyColor: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ColorModel.createItemPropertyColor(dataItem)

    res.status(200).json(result as ResponseI)
  },

  updateItemPropertyColor: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ColorModel.updateItemPropertyColor(dataItem)

    res.json(result as ResponseI)
  },

  deleteItemPropertyColor: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ColorModel.deleteItemPropertyColor(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
      ResultOnDb: result,
      MethodOnDb: 'delete ItemPropertyColor',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByLikeItemPropertyColorName: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ColorModel.getByLikeItemPropertyColorName(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'GetByLikeItemPropertyColorName',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
