import { MySQLExecute } from '@businessData/dbExecute'
import { ProductionPurposeSQL } from '@src/_workspace/sql/production-control/ProductionPurposeSQL'

export const ProductionPurposeService = {
  getByLikeProductionPurposeNameAndInuse: async (dataItem: any) => {
    let sql = await ProductionPurposeSQL.getByLikeProductionPurposeNameAndInuse(dataItem)
    let resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
