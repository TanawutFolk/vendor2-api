import { MySQLExecute } from '@businessData/dbExecute'
import { SctBomFlowProcessItemUsagePriceAdjustSQL } from '@src/_workspace/sql/sct/sct-for-product/SctBomFlowProcessItemUsagePriceAdjustSQL'
import { RowDataPacket } from 'mysql2'

export const SctBomFlowProcessItemUsagePriceAdjustService = {
  getBySctId: async (dataItem: any) => {
    let sql = await SctBomFlowProcessItemUsagePriceAdjustSQL.getBySctId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
