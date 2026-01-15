import { ProductSubModel } from '@src/_workspace/models/product-group/product-sub/ProductSubModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const productSubController = {
  search: async (req: Request, res: Response) => {
    let query

    if (Object.entries(req.body).length === 0) {
      query = req.query
    } else {
      query = req.body
    }

    // Define tableIds and corresponding fields
    const tableIds = [
      { table: 'tb_3', id: 'PRODUCT_CATEGORY_ID', Fns: '=' },
      { table: 'tb_3', id: 'PRODUCT_CATEGORY_NAME', Fns: 'LIKE' },

      { table: 'tb_2', id: 'PRODUCT_MAIN_CODE', Fns: 'LIKE' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_SUB_CODE', Fns: 'LIKE' },

      { table: 'tb_1', id: 'PRODUCT_SUB_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_SUB_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
    ]

    query = {
      ...query,
      sqlJoin: `
          PRODUCT_SUB tb_1
                INNER JOIN
            PRODUCT_MAIN tb_2
                ON tb_1.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
                INNER JOIN
            PRODUCT_CATEGORY tb_3
                ON tb_2.PRODUCT_CATEGORY_ID = tb_3.PRODUCT_CATEGORY_ID`,

      selectInuseForSearch: `
                (IF (tb_1.INUSE = 0 ,0 ,IF(
                                      EXISTS
                                              (
                                                  SELECT
                                                      tbs_1.PRODUCT_TYPE_ID
                                                  FROM
                                                      PRODUCT_TYPE tbs_1
                                                  WHERE
                                                          tbs_1.INUSE = 1
                                                      AND tbs_1.PRODUCT_SUB_ID = tb_1.PRODUCT_SUB_ID) = TRUE
                                              , 2
                                              ,   IF(
                                                          EXISTS
                                                          (
                                                              SELECT
                                                                        tbs_1.PRODUCT_TYPE_ID
                                                              FROM
                                                                        PRODUCT_TYPE tbs_1
                                                              WHERE
                                                                        tbs_1.PRODUCT_SUB_ID = tb_1.PRODUCT_SUB_ID
                                                          ) = TRUE
                                              , 3
                                              , 1
                                              )))) AS inuseForSearch
      `,
    }
    //  tb_1.INUSE AS inuseForSearch
    getSqlWhere(query, tableIds)

    // query['Start'] = Number(query['Start']) * Number(query['Limit'])
    // let orderBy = ''

    // if (query['Order'] == '') {
    //   orderBy = 'tb_1.UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < query['Order'].length; i++) {
    //     const word = query['Order'][i]
    //     if (word['id'] == 'PRODUCT_CATEGORY_NAME') {
    //       orderBy += 'tb_3.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else if (word['id'] == 'PRODUCT_MAIN_NAME') {
    //       orderBy += 'tb_2.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else {
    //       orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     }
    //   }
    //   orderBy = orderBy.slice(0, -1)
    // }
    // query['Order'] = orderBy

    const result = await ProductSubModel.search(query)

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1] || [],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] as Number,
      MethodOnDb: 'getByProductTypeCodeAndProcessName',
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

    let result = await ProductSubModel.create(dataItem)

    res.status(200).json(result as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await ProductSubModel.update(dataItem)

    res.json(result as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await ProductSubModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Product Sub',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByLikeProductSubNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductSubModel.getByLikeProductSubNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result || [],
      TotalCountOnDb: result.length,
      MethodOnDb: '',
      Message: '',
    } as ResponseI)
  },

  getByLikeProductSubNameAndProductMainIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await ProductSubModel.getByLikeProductSubNameAndProductMainIdAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result || [],
      TotalCountOnDb: result?.length ?? 0,
      MethodOnDb: '',
      Message: '',
    } as ResponseI)
  },
  getByLikeProductSubNameAndProductCategoryIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ProductSubModel.getByLikeProductSubNameAndProductCategoryIdAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result || [],
      TotalCountOnDb: result?.length ?? 0,
      MethodOnDb: '',
      Message: '',
    } as ResponseI)
  },
}
