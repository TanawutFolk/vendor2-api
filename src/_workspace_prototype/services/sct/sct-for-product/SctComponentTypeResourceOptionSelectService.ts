import { MySQLExecute } from '@businessData/dbExecute'
import { SctComponentTypeResourceOptionSelectSQL } from '@src/_workspace/sql/sct/sct-for-product/SctComponentTypeResourceOptionSelectSQL'
import { RowDataPacket } from 'mysql2'

export const SctComponentTypeResourceOptionSelectService = {
  getBySctId: async (dataItem: any) => {
    let sql = await SctComponentTypeResourceOptionSelectSQL.getBySctId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
