import { MySQLExecute } from '@businessData/dbExecute'
import { ProcessSQL } from '@src/_workspace/sql/process/ProcessSQL'
import { RowDataPacket } from 'mysql2'

export const ProcessService = {
  getAllProcessInProductMain: async () => {
    let sql = await ProcessSQL.getAllProcessInProductMain()
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
