import { ProductCategorySQL } from '@src/_workspace/sql/product-group/product-category/ProductCategorySQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const ProductCategoryService = {
  search: async (dataItem: any) => {
    const sql = await ProductCategorySQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  getByLikeProductCategoryNameAndInuse: async (dataItem: any) => {
    const sql = await ProductCategorySQL.getByLikeProductCategoryNameAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  create: async (dataItem: any) => {
    const sql = await ProductCategorySQL.getProductCategoryNameAndAlphabet(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const sqlAlphabet = await ProductCategorySQL.getProductCategoryNameAndAlphabetByAlphabet(dataItem)
      const resultDataAlphabet = (await MySQLExecute.search(sqlAlphabet)) as RowDataPacket[]

      if (resultDataAlphabet.length === 0) {
        const query = await ProductCategorySQL.create(dataItem)
        const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultDataForInsert,
          MethodOnDb: 'Insert Product Category',
          TotalCountOnDb: 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Product Category Alphabet ',
          ResultOnDb: [],
          MethodOnDb: 'Insert Product Category Alphabet',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Product Category Name',
        ResultOnDb: [],
        MethodOnDb: 'Insert Product Category Name',
        TotalCountOnDb: 0,
      }
    }
  },

  update: async (dataItem: any) => {
    const sql = await ProductCategorySQL.getProductCategoryNameAndAlphabet(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0 || (resultData.length !== 0 && resultData[0].PRODUCT_CATEGORY_ID === dataItem.PRODUCT_CATEGORY_ID)) {
      const sqlAlphabet = await ProductCategorySQL.getProductCategoryNameAndAlphabetByAlphabet(dataItem)
      const resultDataAlphabet = (await MySQLExecute.search(sqlAlphabet)) as RowDataPacket[]

      if (resultDataAlphabet.length === 0 || (resultDataAlphabet.length !== 0 && resultDataAlphabet[0].PRODUCT_CATEGORY_ID === dataItem.PRODUCT_CATEGORY_ID)) {
        const query = await ProductCategorySQL.update(dataItem)
        const resultDataForUpdate = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultDataForUpdate,
          MethodOnDb: 'Update Product Category',
          TotalCountOnDb: resultDataForUpdate?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Product Category Alphabet',
          ResultOnDb: [],
          MethodOnDb: 'Update Product Category Alphabet',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Product Category Name',
        ResultOnDb: [],
        MethodOnDb: 'Update Product Category Name',
        TotalCountOnDb: 0,
      }
    }
  },

  delete: async (dataItem: any) => {
    const sql = await ProductCategorySQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
