import { MySQLExecute } from '@businessData/dbExecute'
import { CommonSQL } from '@src/_workspace/sql/common/CommonSQl'
import { RowDataPacket } from 'mysql2'

export const CommonService = {
  getByLikeMonthShortNameEnglish: async (dataItem: any) => {
    const sql = await CommonSQL.getByLikeMonthShortNameEnglish(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getYearNow: async () => {
    const sql = await CommonSQL.getYearNow()
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
