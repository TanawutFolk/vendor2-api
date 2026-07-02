import { MySQLExecute } from '@businessData/dbExecute'
import { SctMasterDataHistorySQL } from '@sql/sct/sct-for-product/SctMasterDataHistorySQL'
import { RowDataPacket } from 'mysql2'

export const SctMasterDataHistoryService = {
  getBySctIdAndIsFromSctCopy: async (dataItem: any) => {
    let sql = await SctMasterDataHistorySQL.getBySctIdAndIsFromSctCopy(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
