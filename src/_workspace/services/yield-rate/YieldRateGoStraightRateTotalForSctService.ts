import { YieldRateGoStraightRateTotalForSctSQL } from '@src/_workspace/sql/yield-rate-go-straight-rate/YieldRateGoStraightRateTotalForSctSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const YieldRateGoStraightRateTotalForSctService = {
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: any) => {
    let sql = await YieldRateGoStraightRateTotalForSctSQL.getByProductTypeIdAndFiscalYear_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: any) => {
    let sql = await YieldRateGoStraightRateTotalForSctSQL.getByProductTypeIdAndFiscalYearAndRevisionNo(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
