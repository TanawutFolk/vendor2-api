import { MySQLExecute } from '@businessData/dbExecute'
import { CurrencySQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/CurrencySQL'

export const CurrencyService = {
  getByInuse: async (body: any) => {
    const sql = await CurrencySQL.getByInuse(body)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
