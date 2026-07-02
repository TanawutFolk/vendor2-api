import { getSqlWhereByColumnFilters } from '@helpers/getSqlWhereByFilterColumn'
import { ItemCategoryModel } from '@src/_workspace/models/item-category/ItemCategoryModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const ItemCategoryController = {
  getItemCategory: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getItemCategory(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search ItemCategory',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  searchItemCategory: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    // console.log('test', dataItem)

    const tableIds = [
      { table: 'tb_1', id: 'ITEM_CATEGORY_ID' },
      { table: 'tb_1', id: 'ITEM_CATEGORY_NAME' },
      { table: 'tb_1', id: 'ITEM_CATEGORY_ALPHABET' },
      { table: 'tb_1', id: 'ITEM_CATEGORY_SHORT_NAME' },
      { table: 'tb_2', id: 'PURCHASE_MODULE_NAME' },
      { table: 'tb_1', id: 'UPDATE_BY' },
      { table: 'tb_1', id: 'UPDATE_DATE' },
      { table: 'tb_1', id: 'INUSE' },
    ]

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''

    if (dataItem['Order'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        orderBy += `${tableIds.find((e) => e.id === word['id'])?.table}.` + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await ItemCategoryModel.searchItemCategory(dataItem)
    for (let i = 0; i < result[1].length; i++) {
      result[1][i]['No'] = i + 1
    }

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search ItemCategory',
      Message: 'Search Data Success',
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
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'delete ItemCategory',
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
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
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'GetByLikeItemCategoryNameAndInuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  getForBomByLikeItemCategoryNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getForBomByLikeItemCategoryNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Product Sub',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'GetByLikeItemCategoryNameAndInuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await ItemCategoryModel.getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'GetItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  getAllByInuse: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemCategoryModel.getAllByInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'GetAllByInuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
