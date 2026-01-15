import { ProductMainModel } from '@src/_workspace/models/product-group/product-main/ProductMainModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const productMainController = {
  search: async (req: Request, res: Response) => {
    let query

    // If the request body is empty, use the query data
    if (Object.entries(req.body).length === 0) {
      query = req.query
    } else {
      query = req.body
    }
    // console.log(query)

    // Define tableIds and corresponding fields
    const tableIds = [
      { table: 'tb_2', id: 'PRODUCT_CATEGORY_ID', Fns: '=' },
      { table: 'tb_2', id: 'PRODUCT_CATEGORY_NAME', Fns: 'LIKE' },

      { table: 'tb_9', id: 'LOC', Fns: 'LIKE' },
      { table: 'tb_9', id: 'POD', Fns: 'LIKE' },
      { table: 'tb_9', id: 'PD', Fns: 'LIKE' },

      { table: 'tb_3', id: 'IS_BOI', Fns: 'LIKE' },
      { table: 'tb_7', id: 'BOI_PROJECT_CODE', Fns: 'LIKE' },

      { table: 'tb_6', id: 'ACCOUNT_DEPARTMENT_CODE', Fns: 'LIKE' },
      { table: 'tb_6', id: 'ACCOUNT_DEPARTMENT_NAME', Fns: 'LIKE' },

      { table: 'tb_1', id: 'PRODUCT_MAIN_CODE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_MAIN_ALPHABET', Fns: 'LIKE' },

      { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
    ]

    query = {
      ...query,
      sqlJoin: `
 PRODUCT_MAIN tb_1
                                INNER JOIN
                          PRODUCT_CATEGORY tb_2 ON tb_1.PRODUCT_CATEGORY_ID = tb_2.PRODUCT_CATEGORY_ID
                                LEFT JOIN
                          PRODUCT_MAIN_BOI tb_3
                                ON tb_1.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
                                AND tb_3.INUSE = 1
                                LEFT JOIN
                          PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_4
                                ON tb_1.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                                AND tb_4.INUSE = 1
                                LEFT JOIN
                          ACCOUNT_DEPARTMENT_CODE tb_6
                                ON tb_4.ACCOUNT_DEPARTMENT_CODE_ID = tb_6.ACCOUNT_DEPARTMENT_CODE_ID
                                LEFT JOIN
                          BOI_PROJECT tb_7
                                ON tb_3.BOI_PROJECT_ID = tb_7.BOI_PROJECT_ID
                                LEFT JOIN
                          PRODUCT_MAIN_OTHER tb_9
                                ON tb_1.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID
                                AND tb_9.INUSE = 1
                                 LEFT JOIN (
                                                  SELECT
                                                      t.PRODUCT_MAIN_ID,
                                                      JSON_ARRAYAGG(
                                                          JSON_OBJECT(
                                                              'LOC_ID',  t.LOC_ID,
                                                              'LOC_CODE',t.LOC_CODE,
                                                              'LOC_NAME',t.LOC_NAME
                                                          )
                                                      ) AS LOC
                                                  FROM (
                                                      SELECT DISTINCT
                                                          pl.PRODUCT_MAIN_ID,
                                                          l.LOC_ID,
                                                          l.LOC_CODE,
                                                          l.LOC_NAME
                                                      FROM PRODUCT_MAIN_LOC pl
                                                      INNER JOIN LOC l
                                                              ON l.LOC_ID = pl.LOC_ID
                                                            AND l.INUSE = 1
                                                      WHERE pl.INUSE = 1
                                                  ) AS t
                                                  GROUP BY t.PRODUCT_MAIN_ID
                                              ) AS locs
                                                ON locs.PRODUCT_MAIN_ID = tb_1.PRODUCT_MAIN_ID
                                `,
      selectInuseForSearch: `
        (IF (tb_1.INUSE = 0 ,0 ,IF(
                                      EXISTS
                                              (
                                                  SELECT
                                                      tbs_1.PRODUCT_SUB_ID
                                                  FROM
                                                      PRODUCT_SUB tbs_1
                                                  WHERE
                                                          tbs_1.INUSE = 1
                                                      AND tbs_1.PRODUCT_MAIN_ID = tb_1.PRODUCT_MAIN_ID) = TRUE
                                              , 2
                                              ,   IF(
                                                          EXISTS
                                                          (
                                                              SELECT
                                                                        tbs_1.PRODUCT_SUB_ID
                                                              FROM
                                                                        PRODUCT_SUB tbs_1
                                                              WHERE
                                                                        tbs_1.PRODUCT_MAIN_ID = tb_1.PRODUCT_MAIN_ID
                                                          ) = TRUE
                                              , 3
                                              , 1
                                              )))) AS inuseForSearch
      `,
    }

    // Use getSqlWhere to construct the WHERE clause
    getSqlWhere(query, tableIds)
    // Fetch the data
    const result = await ProductMainModel.search(query)
    // console.log(result)

    // Send the response
    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search ProductCategory',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] as Number,
    } as ResponseI)
  },

  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    let result = await ProductMainModel.create(dataItem)
    res.status(200).json(result as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    let result = await ProductMainModel.update(dataItem)
    res.json(result as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    await ProductMainModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: [],
      MethodOnDb: 'Delete Product Sub',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getProductMainByLikeProductMainNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductMainModel.getProductMainByLikeProductMainNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'getProductMainByLikeProductMainNameAndInuse',
      Message: '',
    } as ResponseI)
  },
  getByLikeProductMainNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await ProductMainModel.getByLikeProductMainNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result || [],
      TotalCountOnDb: result.length,
      MethodOnDb: 'getByLikeProductMainNameAndInuse ',
      Message: 'getByLikeProductMainNameAndInuse Data Success',
    } as ResponseI)
  },
  getByLikeProductMainNameAndProductCategoryIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await ProductMainModel.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result || [],
      TotalCountOnDb: result.length,
      MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
      Message: 'getByLikeProductMainNameAndInuse Data Success',
    } as ResponseI)
  },
}
