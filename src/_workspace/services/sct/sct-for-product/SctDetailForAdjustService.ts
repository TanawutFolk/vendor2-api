import { MySQLExecute } from '@businessData/dbExecute'
import { SctDetailForAdjustSQL } from '@sql/sct/sct-for-product/SctDetailForAdjustSQL'
import { RowDataPacket } from 'mysql2'

export const SctDetailForAdjustService = {
  getBySctId: async (dataItem: any) => {
    let sql = await SctDetailForAdjustSQL.getBySctId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
