import { MySQLExecute } from '@businessData/dbExecute'
import { RowDataPacket } from 'mysql2'
import { AllRequestHistorySQL } from '../../sql/_all-request-history/AllRequestHistorySQL'
import type { AllRequestHistorySearchData } from '../../types/AllRequestHistory'

export const AllRequestHistoryService = {
  search: async (dataItem: AllRequestHistorySearchData) => {
    const sqlList = await AllRequestHistorySQL.search(dataItem)
    const result = (await MySQLExecute.searchList(sqlList)) as RowDataPacket[][]

    return {
      totalCount: Number(result[0]?.[0]?.TOTAL_COUNT) || 0,
      data: result[1] || [],
    }
  },

  getFilterOptions: async () => {
    const sql = await AllRequestHistorySQL.getFilterOptions()
    return (await MySQLExecute.search(sql)) as RowDataPacket[]
  },

  getById: async (requestId: number) => {
    const sql = await AllRequestHistorySQL.getById({ REQUEST_REGISTER_VENDOR_ID: requestId })
    const result = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return result[0] || null
  },
}
