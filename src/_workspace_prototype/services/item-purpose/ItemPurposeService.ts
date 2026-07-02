import { MySQLExecute } from '@businessData/dbExecute'
import { ItemPurposeSQL } from '@src/_workspace/sql/item-purpose/ItemPurposeSQL'

export const ItemPurposeService = {
  getByLikeItemPurposeNameAndInuse: async (dataItem: any) => {
    const sql = await ItemPurposeSQL.getByLikeItemPurposeNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
