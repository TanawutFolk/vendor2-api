import { ProductCategoryModel } from '@src/_workspace/models/product-group/product-category/ProductCategoryModels'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const productCategoryController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const tableIds = [
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_CODE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      // { table: 'tb_1', id: dataItem.inuseForSearch !== '' ? 'INUSE' : '', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                          PRODUCT_CATEGORY tb_1`,

      selectInuseForSearch: `
            (IF (tb_1.INUSE = 0 ,0 ,IF(
                                      EXISTS
                                              (
                                                  SELECT
                                                      tbs_1.PRODUCT_MAIN_ID
                                                  FROM
                                                      PRODUCT_MAIN tbs_1
                                                  WHERE
                                                          tbs_1.INUSE = 1
                                                      AND tbs_1.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID) = TRUE
                                              , 2
                                              ,   IF(
                                                          EXISTS
                                                          (
                                                              SELECT
                                                                        tbs_1.PRODUCT_MAIN_ID
                                                              FROM
                                                                        PRODUCT_MAIN tbs_1
                                                              WHERE
                                                                        tbs_1.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID
                                                          ) = TRUE
                                              , 3
                                              , 1
                                              )))) AS inuseForSearch
      `,
    }
    getSqlWhere(dataItem, tableIds)
    //tb_1.INUSE AS inuseForSearch

    // if (dataItem['Order'].length <= 0) {
    //   orderBy = 'tb_1.UPDATE_DATE DESC, tb_1.PRODUCT_CATEGORY_ID ASC'
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

    const result = await ProductCategoryModel.search(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search ProductCategory',
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

    let result = await ProductCategoryModel.create(dataItem)
    res.status(200).json(result as ResponseI)
  },
  getByLikeProductCategoryNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductCategoryModel.getByLikeProductCategoryNameAndInuse(dataItem)
    res.json({
      Status: true,
      Message: 'getByLikeProductCategoryNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductCategoryNameAndInuse Category',
      TotalCountOnDb: result.length,
    } as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await ProductCategoryModel.update(dataItem)

    res.json(result as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await ProductCategoryModel.delete(dataItem)
    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Product Sub',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
