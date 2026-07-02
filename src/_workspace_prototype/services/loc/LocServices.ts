import { locProjectSQL } from '@src/_workspace/sql/loc/LocProjectSQL'

import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const LocServices = {
  getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType: async (dataItem: any) => {
    const sql = await locProjectSQL.getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
