import { MySQLExecute } from '@businessData/dbExecute'
// import { RowDataPacket } from 'mysql2'
import { ItemGroupSQL } from '@src/_workspace/sql/item-group/ItemGroupSQL'

export const ItemGroupService = {
  getByLikeItemGroupName: async (dataItem: any) => {
    const sql = await ItemGroupSQL.getByLikeItemGroupName(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
