import { ItemCategoryModel } from '@src/_workspace/models/item-category/ItemCategoryModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

export const ItemCategoryController = {
  getItemCategory: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = (await ItemCategoryModel.getItemCategory(dataItem)) as RowDataPacket[]

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'Search ItemCategory',
      TotalCountOnDb: result.length,
    } as ResponseI)
  },

  searchItemCategory: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const tableIds = [
      { table: 'tb_1', id: 'ITEM_CATEGORY_ID', Fns: '=' },
      { table: 'tb_1', id: 'ITEM_CATEGORY_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'ITEM_CATEGORY_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_1', id: 'ITEM_CATEGORY_SHORT_NAME', Fns: 'LIKE' },
      { table: 'tb_2', id: 'PURCHASE_MODULE_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                           ITEM_CATEGORY tb_1
                    JOIN
                        PURCHASE_MODULE tb_2
                        ON tb_1.PURCHASE_MODULE_ID = tb_2.PURCHASE_MODULE_ID`,

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
    //   orderBy = 'tb_1.UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < dataItem['Order'].length; i++) {
    //     const word = dataItem['Order'][i]
    //     orderBy += `${tableIds.find((e) => e.id === word['id'])?.table}.` + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //   }
    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy

    // let sqlWhereColumnFilter = ''
    // if (dataItem?.ColumnFilters?.length > 0) {
    //   sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    // }

    // dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = (await ItemCategoryModel.searchItemCategory(dataItem)) as RowDataPacket[]

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search ItemCategory',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },

  createItemCategory: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.createItemCategory(dataItem)

    res.status(200).json(result as ResponseI)
  },

  updateItemCategory: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.updateItemCategory(dataItem)

    res.json(result as ResponseI)
  },

  deleteItemCategory: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.deleteItemCategory(dataItem)

    res.json({
      Status: true,
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      ResultOnDb: result,
      MethodOnDb: 'Update ItemCategory',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByLikeItemCategoryNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getByLikeItemCategoryNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'GetByLikeItemCategoryNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getForBomByLikeItemCategoryNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getForBomByLikeItemCategoryNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'GetForBomByLikeItemCategoryNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'GetByLikeItemCategoryNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'GetItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getAllByInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getAllByInuse(dataItem)

    res.json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'GetAllByInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
