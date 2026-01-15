import { MySQLExecute } from '@businessData/dbExecute'
import { PurchaseModuleSQL } from '@src/_workspace/sql/purchase-module/PurchaseModuleSQL'

export const PurchaseModuleService = {
  getByLikePurchaseModuleNameAndInuse: async (dataItem: any) => {
    const sql = await PurchaseModuleSQL.getByLikePurchaseModuleNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
