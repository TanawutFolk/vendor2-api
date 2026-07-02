import { MySQLExecute } from '@businessData/dbExecute'
import { ProductSpecificationTypeSQL } from '@src/_workspace/sql/product-specification-document-setting/ProductSpecificationTypeSQL'
import { RowDataPacket } from 'mysql2'

export const ProductSpecificationTypeService = {
  getByLikeProductSpecificationTypeAndInuse: async (dataItem: any) => {
    const sql = await ProductSpecificationTypeSQL.getByLikeProductSpecificationTypeAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
