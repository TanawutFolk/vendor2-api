import { MySQLExecute } from '@businessData/dbExecute'
import { SctCompareSQL } from '@src/_workspace/sql/sct/sct-for-product/SctCompareSQL'
import { RowDataPacket } from 'mysql2'

export const SctCompareService = {
  getBySctId: async (dataItem: any) => {
    let sql = await SctCompareSQL.getBySctId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
