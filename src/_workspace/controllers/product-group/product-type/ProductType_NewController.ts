import { ProductType_NewModel } from '@src/_workspace/models/product-group/product-type/ProductType_NewModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'
const excel = require('exceljs')
export const ProductTypeNewController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    // Define tableIds and corresponding fields
    const tableIds = [
      { table: 'tb_6', id: 'PC_NAME', Fns: 'LIKE' },
      { table: 'tb_6', id: 'FFT_PART_NUMBER', Fns: 'LIKE' },
      { table: 'tb_32', id: 'PRODUCT_ITEM_NAME', Fns: 'LIKE' },
      { table: 'tb_32', id: 'PRODUCT_ITEM_CODE', Fns: 'LIKE' },

      { table: 'tb_1', id: 'PRODUCT_TYPE_CODE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_6', id: 'SUFFIX_FOR_PART_NUMBER', Fns: 'LIKE' },

      { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
    ]
    getSqlWhere(dataItem, tableIds)

    // dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    // let orderBy = ''

    // if (dataItem['Order'] == '') {
    //   orderBy = 'UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < dataItem['Order'].length; i++) {
    //     const word = dataItem['Order'][i]
    //     orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //   }

    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy
    // //console.log('query', body)
    const result = (await ProductType_NewModel.search(dataItem)) as RowDataPacket[]

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1] || 0,
      MethodOnDb: 'Search ProductCategory',
      TotalCountOnDb: result?.[1]?.length ?? 0,
    } as ResponseI)
  },

  getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductTypeNameAndProductCategoryIdAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndProductCategoryIdAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeProductTypeNameAndProductCategoryIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await ProductType_NewModel.getByLikeProductTypeNameAndProductCategoryIdAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductTypeNameAndProductCategoryIdAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndProductCategoryIdAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeProductTypeNameAndProductSubIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductTypeNameAndProductSubIdAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductTypeNameAndProductSubIdAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndProductSubIdAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getProductTypeByProductGroup: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getProductTypeByProductGroup(dataItem)

    res.json({
      Status: true,
      Message: 'GetProductTypeByProductGroup Data Success',
      ResultOnDb: result,
      MethodOnDb: 'GetProductTypeByProductGroup',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  searchProductTypeList: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.searchProductTypeList(dataItem)

    res.json({
      Status: true,
      Message: 'searchProductTypeList Data Success',
      ResultOnDb: result,
      MethodOnDb: 'searchProductTypeList',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByProductGroup: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByProductGroup(dataItem)

    res.json({
      Status: true,
      Message: 'Get Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByProductGroup',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  //   getByProductTypeForCopy: async () => {
  //     const result = await ProductType_NewModel.getByProductTypeForCopy()

  //     for (let i = 0; i < result[1].length; i++) {
  //       result[1][i]['No'] = i + 1
  //     }

  //     return {
  //       Status: true,
  //       Message: 'getByLikeProductTypeNameAndProductCategoryIdAndInuse',
  //       ResultOnDb: result,
  //       MethodOnDb: 'getByLikeProductTypeNameAndProductCategoryIdAndInuse',
  //       TotalCountOnDb: result.length,
  //     }
  //   },

  // getByProductTypeForCopy: async () => {
  //   // console.log('1111111111111111111111111111111111111111111111')
  //   const result = await ProductType_NewModel.getByProductTypeForCopy()

  //   for (let i = 0; i < result[1].length; i++) {
  //     result[1][i]['No'] = i + 1
  //   }

  //   return {
  //     Status: true,
  //     ResultOnDb: result[1],
  //     TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
  //     MethodOnDb: '',
  //     Message: ''
  //   } as ResponseI
  // },
  getByProductTypeForCopy: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''

    if (dataItem['Order'] == '') {
      orderBy = 'UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    const result = (await ProductType_NewModel.getByProductTypeForCopy(dataItem)) as RowDataPacket[]

    res.status(200).json({
      Status: true,
      Message: '',
      ResultOnDb: result[1] || '',
      MethodOnDb: '',
      TotalCountOnDb: result?.[1]?.length ?? 0,
    } as ResponseI)
  },
  getByProductTypeStatusWorkingAndInuse: async (req: Request, res: Response) => {
    const result = (await ProductType_NewModel.getByProductTypeStatusWorkingAndInuse()) as RowDataPacket[]

    for (let i = 0; i < result[1].length; i++) {
      result[1][i]['No'] = i + 1
    }

    res.status(200).json({
      Status: true,
      Message: '',
      ResultOnDb: result[1] || '',
      MethodOnDb: '',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
    } as ResponseI)
  },

  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    let result = (await ProductType_NewModel.create(dataItem)) as RowDataPacket[]

    res.status(200).json({
      Status: true,
      Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
      ResultOnDb: result,
      MethodOnDb: 'Create Product Sub',
      TotalCountOnDb: result?.[1]?.length ?? 0,
    } as ResponseI)
  },
  createProductType: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    let result = await ProductType_NewModel.createProductType(dataItem)

    res.status(200).json(result as ResponseI)
  },

  getByLikeProductCategoryNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductCategoryNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductCategoryNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductCategoryNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeProductTypeStatusWorkingNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductTypeStatusWorkingNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductTypeStatusWorkingNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeStatusWorkingNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.update(dataItem)

    res.json({
      Status: true,
      Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
      ResultOnDb: result,
      MethodOnDb: 'Update Product Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Product Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByLikeProductTypeNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await ProductType_NewModel.getByLikeProductTypeNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: '',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeProductTypeNameAndInuseForPriceList: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductTypeNameAndInuseForPriceList(dataItem)

    res.json({
      Status: true,
      Message: '',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeProductTypeCodeAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductTypeCodeAndInuse(dataItem)

    res.json({
      Status: true,
      Message: '',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeProductTypeNameAndProductMainIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductTypeNameAndProductMainIdAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductTypeNameAndProductMainIdAndInuse',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndProductMainIdAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getByLikeProductTypeCodeAndProductMainIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.getByLikeProductTypeCodeAndProductMainIdAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductTypeNameAndProductMainIdAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductTypeNameAndProductMainIdAndInuse',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  getProductTypeByProductMainID: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await ProductType_NewModel.getProductTypeByProductMainID(dataItem)

    res.json({
      Status: true,
      Message: 'getProductTypeByProductMainID Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getProductTypeByProductMainID',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  searchProductType: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const tableIds = [
      { table: 'tb_4', id: 'PRODUCT_CATEGORY_NAME', Fns: 'LIKE' },
      { table: 'tb_4', id: 'PRODUCT_CATEGORY_ID', Fns: '=' },
      { table: 'tb_4', id: 'PRODUCT_CATEGORY_CODE_FOR_SCT', Fns: 'LIKE' },
      { table: 'tb_3', id: 'PRODUCT_MAIN_CODE', Fns: 'LIKE' },
      { table: 'tb_3', id: 'PRODUCT_MAIN_ID', Fns: '=' },
      { table: 'tb_3', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
      { table: 'tb_2', id: 'PRODUCT_SUB_ID', Fns: '=' },
      { table: 'tb_2', id: 'PRODUCT_SUB_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_TYPE_CODE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_TYPE_CODE_FOR_SCT', Fns: 'LIKE' },
      { table: 'tb_6', id: 'ITEM_CATEGORY_NAME', Fns: 'LIKE' },
      { table: 'tb_5', id: 'ITEM_CATEGORY_ID', Fns: '=' },

      { table: 'tb_11', id: 'BOM_CODE', Fns: 'LIKE' },
      { table: 'tb_13', id: 'FLOW_CODE', Fns: 'LIKE' },
      { table: 'tb_12', id: 'ACCOUNT_DEPARTMENT_CODE', Fns: 'LIKE' },
      { table: 'tb_14', id: 'CUSTOMER_INVOICE_TO_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_17', id: 'PRODUCT_SPECIFICATION_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      // { table: 'tb_1', id: dataItem.inuseForSearch !== '' ? 'INUSE' : '', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                           PRODUCT_TYPE tb_1
                                            INNER JOIN
                                    PRODUCT_SUB tb_2
                                            ON tb_1.PRODUCT_SUB_ID  = tb_2.PRODUCT_SUB_ID
                                            INNER JOIN
                                    PRODUCT_MAIN tb_3
                                            ON tb_2.PRODUCT_MAIN_ID  = tb_3.PRODUCT_MAIN_ID
                                            INNER JOIN
                                    PRODUCT_CATEGORY tb_4
                                            ON tb_3.PRODUCT_CATEGORY_ID  = tb_4.PRODUCT_CATEGORY_ID
                                            INNER JOIN
                                    PRODUCT_TYPE_ITEM_CATEGORY tb_5
                                            ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                            AND tb_5.INUSE = 1
                                            INNER JOIN
                                    ITEM_CATEGORY tb_6
                                            ON tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID
                                            LEFT JOIN
                                    PRODUCT_TYPE_BOM tb_7
                                            ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
                                            AND tb_7.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE tb_8
                                            ON tb_1.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID
                                            AND tb_8.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_FLOW tb_9
                                            ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                            AND tb_9.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_10
                                            ON tb_1.PRODUCT_TYPE_ID = tb_10.PRODUCT_TYPE_ID
                                            AND tb_10.INUSE = 1
                                            LEFT JOIN
                                    BOM tb_11
                                            ON tb_7.BOM_ID = tb_11.BOM_ID
                                            LEFT JOIN
                                    ACCOUNT_DEPARTMENT_CODE tb_12
                                            ON tb_8.ACCOUNT_DEPARTMENT_CODE_ID = tb_12.ACCOUNT_DEPARTMENT_CODE_ID
                                            LEFT JOIN
                                    FLOW tb_13
                                            ON tb_9.FLOW_ID = tb_13.FLOW_ID
                                            LEFT JOIN
                                    CUSTOMER_INVOICE_TO tb_14
                                            ON tb_10.CUSTOMER_INVOICE_TO_ID = tb_14.CUSTOMER_INVOICE_TO_ID
                                            LEFT JOIN
                                    PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_15
                                            ON tb_1.PRODUCT_TYPE_ID = tb_15.PRODUCT_TYPE_ID
                                            AND tb_15.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_16
                                            ON tb_15.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_16.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                            LEFT JOIN
                                    PRODUCT_SPECIFICATION_TYPE tb_17
                                            ON tb_16.PRODUCT_SPECIFICATION_TYPE_ID = tb_17.PRODUCT_SPECIFICATION_TYPE_ID`,

      selectInuseForSearch: `
         (IF (tb_1.INUSE = 0, 0,
                                        IF (
                                            EXISTS (
                                                SELECT tb_1.PRODUCT_TYPE_ID  FROM sct tbs_1
                                                WHERE tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                AND tbs_1.INUSE = 1
                                            )
                                            OR EXISTS (
                                          SELECT tb_1.PRODUCT_TYPE_ID  FROM standard_cost.sct tbs_1
                                                WHERE tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                AND tbs_1.INUSE = 1
                                            ),
                                            2,
                                            IF (
                                                 EXISTS (
                                                SELECT tb_1.PRODUCT_TYPE_ID  FROM sct tbs_1
                                                WHERE tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                AND tbs_1.INUSE = 0
                                            )
                                            OR EXISTS (
                                          SELECT tb_1.PRODUCT_TYPE_ID  FROM standard_cost.sct tbs_1
                                                WHERE tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                AND tbs_1.INUSE = 0
                                            ),
                                                3,
                                                1
                                            )
                                        )
                                    )) AS inuseForSearch
      `,
    }
    // (IF (tb_1.INUSE = 0 ,0 ,IF(
    //   EXISTS
    //           (
    //               SELECT
    //                   tbs_1.PRODUCT_TYPE_BOM_ID
    //               FROM
    //                   PRODUCT_TYPE_BOM tbs_1
    //               WHERE
    //                       tbs_1.INUSE = 1
    //                   AND tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID) = TRUE
    //           , 2
    //           ,   IF(
    //                       EXISTS
    //                       (
    //                           SELECT
    //                                     tbs_1.PRODUCT_TYPE_BOM_ID
    //                           FROM
    //                                     PRODUCT_TYPE_BOM tbs_1
    //                           WHERE
    //                                     tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
    //                       ) = TRUE
    //           , 3
    //           , 1
    //           )))) AS inuseForSearch
    getSqlWhere(dataItem, tableIds)

    const result = (await ProductType_NewModel.searchProductType(dataItem)) as RowDataPacket[]
    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search ProductType',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },
  updateProductType: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await ProductType_NewModel.updateProductType(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
      ResultOnDb: result,
      MethodOnDb: 'Update Product Type',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  deleteProductTypeAndItem: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    let result = await ProductType_NewModel.deleteProductTypeAndItem(dataItem)
    res.status(200).json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Product Type',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  downloadFileForExportProductType: async (req: Request, res: Response) => {
    // console.log('test-------------------------', req.body)
    let query = req.body.DataForFetch
    const tableIds = [
      { table: 'tb_4', id: 'PRODUCT_CATEGORY_NAME', Fns: 'LIKE' },
      { table: 'tb_4', id: 'PRODUCT_CATEGORY_ID', Fns: '=' },
      // { table: 'tb_4', id: 'PRODUCT_CATEGORY_CODE_FOR_SCT', Fns: 'LIKE' },
      { table: 'tb_3', id: 'PRODUCT_MAIN_CODE', Fns: 'LIKE' },
      { table: 'tb_3', id: 'PRODUCT_MAIN_ID', Fns: '=' },
      { table: 'tb_3', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },

      { table: 'tb_2', id: 'PRODUCT_SUB_ID', Fns: '=' },
      { table: 'tb_2', id: 'PRODUCT_SUB_NAME', Fns: 'LIKE' },

      { table: 'tb_1', id: 'PRODUCT_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_TYPE_CODE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_TYPE_CODE_FOR_SCT', Fns: 'LIKE' },

      { table: 'tb_6', id: 'ITEM_CATEGORY_NAME', Fns: 'LIKE' },
      { table: 'tb_5', id: 'ITEM_CATEGORY_ID', Fns: '=' },

      { table: 'tb_11', id: 'BOM_CODE', Fns: 'LIKE' },
      { table: 'tb_13', id: 'FLOW_CODE', Fns: 'LIKE' },
      { table: 'tb_12', id: 'ACCOUNT_DEPARTMENT_CODE', Fns: 'LIKE' },
      { table: 'tb_14', id: 'CUSTOMER_INVOICE_TO_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_17', id: 'PRODUCT_SPECIFICATION_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      // { table: 'tb_1', id: dataItem.inuseForSearch !== '' ? 'INUSE' : '', Fns: '=' },
    ]

    query = {
      ...query,
      sqlJoin: `
                           PRODUCT_TYPE tb_1
                                            INNER JOIN
                                    PRODUCT_SUB tb_2
                                            ON tb_1.PRODUCT_SUB_ID  = tb_2.PRODUCT_SUB_ID AND tb_2.INUSE = 1
                                            INNER JOIN
                                    PRODUCT_MAIN tb_3
                                            ON tb_2.PRODUCT_MAIN_ID  = tb_3.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                                            INNER JOIN
                                    PRODUCT_CATEGORY tb_4
                                            ON tb_3.PRODUCT_CATEGORY_ID  = tb_4.PRODUCT_CATEGORY_ID AND tb_4.INUSE = 1
                                            INNER JOIN
                                    PRODUCT_TYPE_ITEM_CATEGORY tb_5
                                            ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                            AND tb_5.INUSE = 1
                                            INNER JOIN
                                    ITEM_CATEGORY tb_6
                                            ON tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID AND tb_6.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_BOM tb_7
                                            ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
                                            AND tb_7.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE tb_8
                                            ON tb_1.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID
                                            AND tb_8.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_FLOW tb_9
                                            ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                            AND tb_9.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_10
                                            ON tb_1.PRODUCT_TYPE_ID = tb_10.PRODUCT_TYPE_ID
                                            AND tb_10.INUSE = 1
                                            LEFT JOIN
                                    BOM tb_11
                                            ON tb_7.BOM_ID = tb_11.BOM_ID
                                            LEFT JOIN
                                    ACCOUNT_DEPARTMENT_CODE tb_12
                                            ON tb_8.ACCOUNT_DEPARTMENT_CODE_ID = tb_12.ACCOUNT_DEPARTMENT_CODE_ID
                                            LEFT JOIN
                                    FLOW tb_13
                                            ON tb_9.FLOW_ID = tb_13.FLOW_ID
                                            LEFT JOIN
                                    CUSTOMER_INVOICE_TO tb_14
                                            ON tb_10.CUSTOMER_INVOICE_TO_ID = tb_14.CUSTOMER_INVOICE_TO_ID
                                            LEFT JOIN
                                    PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_15
                                            ON tb_1.PRODUCT_TYPE_ID = tb_15.PRODUCT_TYPE_ID
                                            AND tb_15.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_16
                                            ON tb_15.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_16.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                            LEFT JOIN
                                    PRODUCT_SPECIFICATION_TYPE tb_17
                                            ON tb_16.PRODUCT_SPECIFICATION_TYPE_ID = tb_17.PRODUCT_SPECIFICATION_TYPE_ID`,

      selectInuseForSearch: `
         (IF (tb_1.INUSE = 0, 0,
                                        IF (
                                            EXISTS (
                                                SELECT tb_1.PRODUCT_TYPE_ID  FROM sct tbs_1
                                                WHERE tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                AND tbs_1.INUSE = 1
                                            )
                                            OR EXISTS (
                                          SELECT tb_1.PRODUCT_TYPE_ID  FROM standard_cost.sct tbs_1
                                                WHERE tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                AND tbs_1.INUSE = 1
                                            ),
                                            2,
                                            IF (
                                                 EXISTS (
                                                SELECT tb_1.PRODUCT_TYPE_ID  FROM sct tbs_1
                                                WHERE tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                AND tbs_1.INUSE = 0
                                            )
                                            OR EXISTS (
                                          SELECT tb_1.PRODUCT_TYPE_ID  FROM standard_cost.sct tbs_1
                                                WHERE tbs_1.PRODUCT_TYPE_ID = tb_1.PRODUCT_TYPE_ID
                                                AND tbs_1.INUSE = 0
                                            ),
                                                3,
                                                1
                                            )
                                        )
                                    )) AS inuseForSearch
      `,
    }
    getSqlWhere(query, tableIds)
    // console.log(req.body.TYPE)

    if (req.body.TYPE === 'currentPage') {
      const result = await ProductType_NewModel.searchProductType(query)

      let dataItem = Object.entries(req.body).length === 0 ? req.query : req.body
      const columnFilters = dataItem.columnFilters || []
      const columnVisibility = dataItem.columnVisibility || {}
      const data = result[1] || []

      const visibleColumns = columnFilters.filter(
        (col: any) => columnVisibility[col] !== false && col !== 'mrt-row-spacer' && col !== 'mrt-row-actions' && col !== 'mrt-row-select'
      )

      if (visibleColumns.length === 0) {
        return res.status(400).json({ error: 'No visible columns to export.' })
      }

      const workbook = new excel.Workbook()
      const worksheet = workbook.addWorksheet('ProductType')

      const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'AA',
        'AB',
        'AC',
        'AD',
        'AE',
        'AF',
        'AG',
        'AH',
        'AI',
        'AJ',
        'AK',
        'AL',
        'AM',
        'AN',
        'AO',
        'AP',
        'AQ',
        'AR',
        'AS',
        'AT',
        'AU',
        'AV',
        'AW',
        'AX',
        'AY',
        'AZ',
        'BA',
        'BB',
        'BC',
        'BD',
        'BE',
        'BF',
        'BG',
        'BH',
        'BI',
        'BJ',
        'BK',
        'BL',
        'BM',
        'BN',
        'BO',
        'BP',
        'BQ',
        'BR',
        'BS',
        'BT',
      ]

      let columns: any = []
      columns = visibleColumns.map((item: any, i: number) => {
        let column: any = {}
        item == 'inuseForSearch' ? (item = 'STATUS') : item
        column.header = item
        column.key = item
        column.position = item ? `${alphabet[i]}1` : `${alphabet[i]}2`
        column.mergeCells = item ? '' : `${alphabet[i]}1:${alphabet[i]}2`

        return column
      })

      columns.forEach((column: any, i: number) => {
        worksheet.getColumn(i + 1).numFmt = '0.00'
        worksheet.getColumn(i + 1).width = 22
        if (column.mergeCells) {
          worksheet.mergeCells(column.mergeCells)
        }
        worksheet.getCell(column.position).value = column.header
        worksheet.getCell(column.position).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        worksheet.getCell(column.position).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9D9D9' },
        }
        worksheet.getCell(column.position).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
      worksheet.autoFilter = `${columns[0].position}:${columns[columns?.length - 1].position}`.replaceAll('2', '1')

      //** Columns Fit
      worksheet.columns.forEach((column: any) => {
        let maxLength = 10

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const raw = cell.value?.toString() || ''
          const value = cell.value
          maxLength = Math.max(maxLength, raw.length)

          let cellLength = 0

          if (value == null) {
            cellLength = 0
          } else if (typeof value === 'string') {
            cellLength = value.length
          } else if (typeof value === 'number') {
            cellLength = value.toString().length
          } else if (typeof value === 'object') {
            cellLength = cell.text?.length || 10
          }

          if (cellLength > maxLength) {
            maxLength = cellLength
          }
          cell.font = {
            name: 'Aptos Display',
            color: { argb: 'FF000000' },
          }
        })
        column.width = maxLength + 10
      })

      function autoFitColumns(worksheet: any) {
        worksheet.columns?.forEach((column: any) => {
          let maxLength = 0

          column.eachCell({ includeEmpty: true }, (cell: any) => {
            let text = typeof cell.value === 'object' ? cell.text || '' : String(cell.value ?? '')

            if (text.length > maxLength) {
              maxLength = text.length
            }
          })
          column.width = maxLength + 10 // เผื่อ padding
        })
        worksheet.eachRow((row: any) => {
          row.eachCell((cell: any) => {
            cell.font = {
              name: 'Aptos Display',
              size: 11,
            }
          })
        })
      }

      data.map((item: any) => {
        const rowValues: any = []
        // console.log('967 ', visibleColumns)

        visibleColumns.forEach((col: string, j: number) => {
          const key = col
          let value = item[key]

          if (key === 'inuseForSearch' && value === 1) {
            value = 'Can use'
          } else if (key === 'inuseForSearch' && value === 0) {
            value = 'Cancel'
          } else if (key === 'inuseForSearch' && value === 2) {
            value = 'Using'
          } else if (key === 'inuseForSearch' && value === 3) {
            value = 'Can use (Used)'
          }
          rowValues[j + 1] = value
        })
        worksheet.addRow(rowValues)
      })

      autoFitColumns(worksheet)

      await workbook.xlsx
        .writeBuffer()
        .then((buffer: any) => {
          const contentLength = buffer.length
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', 'attachment; filename="Item_Export.xlsx"')
          res.setHeader('Content-Length', contentLength)
          res.end(buffer)
        })
        .catch((err: Error) => {
          console.error('Error:', err)
          res.status(500).send('Error generating the Excel file')
        })
    } else if (req.body.TYPE === 'selected') {
      let sqlSelected = ` WHERE tb_1.PRODUCT_TYPE_ID IN ('${req.body.ListSelected.join("','")}')  `

      query.sqlWhere = sqlSelected

      const result = await ProductType_NewModel.searchProductTypeBySelected(query)

      //console.log(query.sqlWhere)

      let dataItem = Object.entries(req.body).length === 0 ? req.query : req.body

      const columnFilters = dataItem.columnFilters || []
      const columnVisibility = dataItem.columnVisibility || {}
      const data = result[1] || []

      const visibleColumns = columnFilters.filter(
        (col: any) => columnVisibility[col] !== false && col !== 'mrt-row-spacer' && col !== 'mrt-row-actions' && col !== 'mrt-row-select'
      )

      if (visibleColumns.length === 0) {
        return res.status(400).json({ error: 'No visible columns to export.' })
      }

      const workbook = new excel.Workbook()
      const worksheet = workbook.addWorksheet('ProductType')

      const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'AA',
        'AB',
        'AC',
        'AD',
        'AE',
        'AF',
        'AG',
        'AH',
        'AI',
        'AJ',
        'AK',
        'AL',
        'AM',
        'AN',
        'AO',
        'AP',
        'AQ',
        'AR',
        'AS',
        'AT',
        'AU',
        'AV',
        'AW',
        'AX',
        'AY',
        'AZ',
        'BA',
        'BB',
        'BC',
        'BD',
        'BE',
        'BF',
        'BG',
        'BH',
        'BI',
        'BJ',
        'BK',
        'BL',
        'BM',
        'BN',
        'BO',
        'BP',
        'BQ',
        'BR',
        'BS',
        'BT',
      ]

      let columns: any = []
      columns = visibleColumns.map((item: any, i: number) => {
        let column: any = {}
        item == 'inuseForSearch' ? (item = 'STATUS') : item
        column.header = item
        column.key = item
        column.position = item ? `${alphabet[i]}1` : `${alphabet[i]}2`
        column.mergeCells = item ? '' : `${alphabet[i]}1:${alphabet[i]}2`

        return column
      })

      columns.forEach((column: any, i: number) => {
        worksheet.getColumn(i + 1).numFmt = '0.00'
        worksheet.getColumn(i + 1).width = 22
        if (column.mergeCells) {
          worksheet.mergeCells(column.mergeCells)
        }
        worksheet.getCell(column.position).value = column.header
        worksheet.getCell(column.position).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        worksheet.getCell(column.position).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9D9D9' },
        }
        worksheet.getCell(column.position).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
      worksheet.autoFilter = `${columns[0].position}:${columns[columns?.length - 1].position}`.replaceAll('2', '1')

      //** Columns Fit
      worksheet.columns.forEach((column: any) => {
        let maxLength = 10

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const raw = cell.value?.toString() || ''
          const value = cell.value
          maxLength = Math.max(maxLength, raw.length)

          let cellLength = 0

          if (value == null) {
            cellLength = 0
          } else if (typeof value === 'string') {
            cellLength = value.length
          } else if (typeof value === 'number') {
            cellLength = value.toString().length
          } else if (typeof value === 'object') {
            cellLength = cell.text?.length || 10
          }

          if (cellLength > maxLength) {
            maxLength = cellLength
          }
          cell.font = {
            name: 'Aptos Display',
            color: { argb: 'FF000000' },
          }
        })
        column.width = maxLength + 10
      })

      function autoFitColumns(worksheet: any) {
        worksheet.columns?.forEach((column: any) => {
          let maxLength = 0

          column.eachCell({ includeEmpty: true }, (cell: any) => {
            let text = typeof cell.value === 'object' ? cell.text || '' : String(cell.value ?? '')

            if (text.length > maxLength) {
              maxLength = text.length
            }
          })
          column.width = maxLength + 10 // เผื่อ padding
        })
        worksheet.eachRow((row: any) => {
          row.eachCell((cell: any) => {
            cell.font = {
              name: 'Aptos Display',
              size: 11,
            }
          })
        })
      }

      data.map((item: any) => {
        const rowValues: any = []
        visibleColumns.forEach((col: string, j: number) => {
          const key = col
          let value = item[key]

          if (key === 'inuseForSearch' && value === 1) {
            value = 'Can use'
          } else if (key === 'inuseForSearch' && value === 0) {
            value = 'Cancel'
          } else if (key === 'inuseForSearch' && value === 2) {
            value = 'Using'
          } else if (key === 'inuseForSearch' && value === 3) {
            value = 'Can use (Used)'
          }
          rowValues[j + 1] = value
        })
        worksheet.addRow(rowValues)
      })

      autoFitColumns(worksheet)

      await workbook.xlsx
        .writeBuffer()
        .then((buffer: any) => {
          const contentLength = buffer.length
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', 'attachment; filename="Item_Export.xlsx"')
          res.setHeader('Content-Length', contentLength)
          res.end(buffer)
        })
        .catch((err: Error) => {
          console.error('Error:', err)
          res.status(500).send('Error generating the Excel file')
        })
    } else {
      const result = await ProductType_NewModel.searchProductTypeAllPage(query)
      let dataItem = Object.entries(req.body).length === 0 ? req.query : req.body
      const columnFilters = dataItem.columnFilters || []
      const columnVisibility = dataItem.columnVisibility || {}
      const data = result[1] || []

      const visibleColumns = columnFilters.filter(
        (col: any) => columnVisibility[col] !== false && col !== 'mrt-row-spacer' && col !== 'mrt-row-actions' && col !== 'mrt-row-select'
      )

      if (visibleColumns.length === 0) {
        return res.status(400).json({ error: 'No visible columns to export.' })
      }

      if (visibleColumns.length === 0) {
        return res.status(400).json({ error: 'No visible columns to export.' })
      }

      const workbook = new excel.Workbook()
      const worksheet = workbook.addWorksheet('ProductType')

      const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'AA',
        'AB',
        'AC',
        'AD',
        'AE',
        'AF',
        'AG',
        'AH',
        'AI',
        'AJ',
        'AK',
        'AL',
        'AM',
        'AN',
        'AO',
        'AP',
        'AQ',
        'AR',
        'AS',
        'AT',
        'AU',
        'AV',
        'AW',
        'AX',
        'AY',
        'AZ',
        'BA',
        'BB',
        'BC',
        'BD',
        'BE',
        'BF',
        'BG',
        'BH',
        'BI',
        'BJ',
        'BK',
        'BL',
        'BM',
        'BN',
        'BO',
        'BP',
        'BQ',
        'BR',
        'BS',
        'BT',
      ]

      let columns: any = []
      columns = visibleColumns.map((item: any, i: number) => {
        let column: any = {}
        item == 'inuseForSearch' ? (item = 'STATUS') : item
        column.header = item
        column.key = item
        column.position = item ? `${alphabet[i]}1` : `${alphabet[i]}2`
        column.mergeCells = item ? '' : `${alphabet[i]}1:${alphabet[i]}2`

        return column
      })

      columns.forEach((column: any, i: number) => {
        worksheet.getColumn(i + 1).numFmt = '0.00'
        worksheet.getColumn(i + 1).width = 22
        if (column.mergeCells) {
          worksheet.mergeCells(column.mergeCells)
        }
        worksheet.getCell(column.position).value = column.header
        worksheet.getCell(column.position).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        worksheet.getCell(column.position).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9D9D9' },
        }
        worksheet.getCell(column.position).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
      worksheet.autoFilter = `${columns[0].position}:${columns[columns?.length - 1].position}`.replaceAll('2', '1')

      //** Columns Fit
      worksheet.columns.forEach((column: any) => {
        let maxLength = 10

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const raw = cell.value?.toString() || ''
          const value = cell.value
          maxLength = Math.max(maxLength, raw.length)

          let cellLength = 0

          if (value == null) {
            cellLength = 0
          } else if (typeof value === 'string') {
            cellLength = value.length
          } else if (typeof value === 'number') {
            cellLength = value.toString().length
          } else if (typeof value === 'object') {
            cellLength = cell.text?.length || 10
          }

          if (cellLength > maxLength) {
            maxLength = cellLength
          }
          cell.font = {
            name: 'Aptos Display',
            color: { argb: 'FF000000' },
          }
        })
        column.width = maxLength + 10
      })

      function autoFitColumns(worksheet: any) {
        worksheet.columns?.forEach((column: any) => {
          let maxLength = 0

          column.eachCell({ includeEmpty: true }, (cell: any) => {
            let text = typeof cell.value === 'object' ? cell.text || '' : String(cell.value ?? '')

            if (text.length > maxLength) {
              maxLength = text.length
            }
          })
          column.width = maxLength + 10 // เผื่อ padding
        })

        worksheet.eachRow((row: any) => {
          row.eachCell((cell: any) => {
            cell.font = {
              name: 'Aptos Display',
              size: 11,
            }
          })
        })
      }

      data.map((item: any) => {
        const rowValues: any = []
        visibleColumns.forEach((col: string, j: number) => {
          const key = col
          let value = item[key]

          if (key === 'inuseForSearch' && value === 1) {
            value = 'Can use'
          } else if (key === 'inuseForSearch' && value === 0) {
            value = 'Cancel'
          } else if (key === 'inuseForSearch' && value === 2) {
            value = 'Using'
          } else if (key === 'inuseForSearch' && value === 3) {
            value = 'Can use (Used)'
          }
          rowValues[j + 1] = value
        })
        worksheet.addRow(rowValues)
      })

      autoFitColumns(worksheet)

      await workbook.xlsx
        .writeBuffer()
        .then((buffer: any) => {
          const contentLength = buffer.length
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', 'attachment; filename="Item_Export.xlsx"')
          res.setHeader('Content-Length', contentLength)
          res.end(buffer)
        })
        .catch((err: Error) => {
          console.error('Error:', err)
          res.status(500).send('Error generating the Excel file')
        })
    }
  },
}
