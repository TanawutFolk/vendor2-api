import { MySQLExecute } from '@businessData/dbExecute'
import { ItemManufacturingSQL } from '@src/_workspace/sql/item/ItemManufacturingSQL'

export const ItemManufacturingService = {
  getByLikeItemManufacturingByProductTypeId: async (dataItem: any) => {
    const sql = await ItemManufacturingSQL.getByLikeItemManufacturingByProductTypeId(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
