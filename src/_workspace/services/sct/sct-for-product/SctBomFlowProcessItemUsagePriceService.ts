import { MySQLExecute } from '@businessData/dbExecute'
import { SctBomFlowProcessItemUsagePriceSQL } from '@src/_workspace/sql/sct/sct-for-product/SctBomFlowProcessItemUsagePriceSQL'
import { RowDataPacket } from 'mysql2'

export const SctBomFlowProcessItemUsagePriceService = {
  getBySctId: async (dataItem: any) => {
    let sql = await SctBomFlowProcessItemUsagePriceSQL.getBySctId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
