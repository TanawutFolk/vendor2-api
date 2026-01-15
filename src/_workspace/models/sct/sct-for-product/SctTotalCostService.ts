import { MySQLExecute } from '@businessData/dbExecute'
import { SctTotalCostSQL } from '@src/_workspace/sql/sct/sct-for-product/SctTotalCostSQL'
import { RowDataPacket } from 'mysql2'

export const SctTotalCostService = {
  getBySctId: async (dataItem: any) => {
    let sql = await SctTotalCostSQL.getBySctId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
