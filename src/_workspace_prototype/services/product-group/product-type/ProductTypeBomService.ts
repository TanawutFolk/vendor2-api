import { MySQLExecute } from '@businessData/dbExecute'
import { ProductTypeBomNewSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeBomNewSQL'
import { RowDataPacket } from 'mysql2'

export const ProductTypeBomService = {
  getBomByLikeProductTypeId: async (dataItem: any) => {
    const sql = await ProductTypeBomNewSQL.getBomByLikeProductTypeId(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  exportToFile: async (dataItem: any) => {
    let sql = await ProductTypeBomNewSQL.exportToFile(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  searchProductTypeBOMAllPage: async (dataItem: any) => {
    const sql = await ProductTypeBomNewSQL.searchProductTypeBOMAllPage(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
}
