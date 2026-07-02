import { ProductTypeSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const ProductTypeService = {
  getProductTypeByProductMainId: async (dataItem: any) => {
    let sql = await ProductTypeSQL.getProductTypeByProductMainId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
