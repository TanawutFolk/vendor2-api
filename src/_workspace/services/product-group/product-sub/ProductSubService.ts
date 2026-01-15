import { ProductSubSQL } from '@src/_workspace/sql/product-group/product-sub/ProductSubSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { saveDataSuccess } from '@src/utils/MessageReturn'
import { RowDataPacket } from 'mysql2'

export const ProductSubService = {
  search: async (dataItem: any) => {
    const sql = await ProductSubSQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  create: async (dataItem: any) => {
    const sql = await ProductSubSQL.getByProductSubNameByProductSubName(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const sqlProductSubAlphabet = await ProductSubSQL.getProductSubAlphabet(dataItem)
      const resultDataProductSubAlphabet = (await MySQLExecute.search(sqlProductSubAlphabet)) as RowDataPacket[]
      if (resultDataProductSubAlphabet.length === 0) {
        const query = await ProductSubSQL.create(dataItem)
        const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultDataForInsert,
          MethodOnDb: 'Insert Product Sub',
          TotalCountOnDb: resultDataForInsert?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Product Sub Alphabet ภายใต้ Product Main นี้',
          ResultOnDb: [],
          MethodOnDb: 'Insert Product Sub Name',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Product Sub Name',
        ResultOnDb: [],
        MethodOnDb: 'Insert Product Sub Name',
        TotalCountOnDb: 0,
      }
    }
  },

  update: async (dataItem: any) => {
    const existingProductSub_condition = await ProductSubSQL.getByProductSubNameByProductSubName(dataItem)
    const checkDuplicateResultData = (await MySQLExecute.search(existingProductSub_condition)) as RowDataPacket[]
    if (checkDuplicateResultData?.length === 0 || (checkDuplicateResultData?.length !== 0 && checkDuplicateResultData[0].PRODUCT_SUB_ID === dataItem.PRODUCT_SUB_ID)) {
      const sqlProductSubAlphabet = await ProductSubSQL.getProductSubAlphabet(dataItem)
      const resultDataProductSubAlphabet = (await MySQLExecute.search(sqlProductSubAlphabet)) as RowDataPacket[]
      if (resultDataProductSubAlphabet.length === 0 || (resultDataProductSubAlphabet.length !== 0 && resultDataProductSubAlphabet[0].PRODUCT_SUB_ID === dataItem.PRODUCT_SUB_ID)) {
        const sql = await ProductSubSQL.update(dataItem)
        const resultData = (await MySQLExecute.execute(sql)) as RowDataPacket[]
        return {
          Status: true,
          Message: saveDataSuccess,
          ResultOnDb: resultData,
          MethodOnDb: 'Update Product Sub Success',
          TotalCountOnDb: resultData?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Product Sub Alphabet ภายใต้ Product Main นี้',
          ResultOnDb: [],
          MethodOnDb: 'Update Product Sub Name',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Product Sub Name',
        ResultOnDb: [],
        MethodOnDb: 'Duplicate Product Sub Name',
        TotalCountOnDb: 0,
      }
    }
  },
  delete: async (dataItem: any) => {
    const sql = await ProductSubSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  getByLikeProductSubNameAndInuse: async (dataItem: any) => {
    const sql = await ProductSubSQL.getByLikeProductSubNameAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByLikeProductSubNameAndProductMainIdAndInuse: async (dataItem: any) => {
    const sql = await ProductSubSQL.getByLikeProductSubNameAndProductMainIdAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByLikeProductSubNameAndProductCategoryIdAndInuse: async (dataItem: any) => {
    const sql = await ProductSubSQL.getByLikeProductSubNameAndProductCategoryIdAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
