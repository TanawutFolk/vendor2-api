import { YieldRateGoStraightRateProcessForSctSQL } from '@src/_workspace/sql/yield-rate-go-straight-rate/YieldRateGoStraightRateProcessForSctSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const YieldRateGoStraightRateProcessForSctService = {
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: any) => {
    let sql = await YieldRateGoStraightRateProcessForSctSQL.getByProductTypeIdAndFiscalYear_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: any) => {
    let sql = await YieldRateGoStraightRateProcessForSctSQL.getByProductTypeIdAndFiscalYearAndRevisionNo(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
