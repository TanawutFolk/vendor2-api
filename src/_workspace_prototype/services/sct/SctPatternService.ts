import { MySQLExecute } from '@businessData/dbExecute'
import { SctPatternSQL } from '@sql/sct/SctPatternSQL'
import { RowDataPacket } from 'mysql2'

export const SctPatternService = {
  getByLikePatternNameAndInuse: async (dataItem: any) => {
    let sql = await SctPatternSQL.getByLikePatternNameAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
