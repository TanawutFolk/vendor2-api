import { ClearTimeForSctTotalSQL } from '@src/_workspace/sql/_cycle-time-system/ClearTimeForSctTotalSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const ClearTimeForSctTotalService = {
  getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest: async (dataItem: any) => {
    let sql = await ClearTimeForSctTotalSQL.getByFiscalYearAndProductTypeIdAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: any) => {
    let sql = await ClearTimeForSctTotalSQL.getByProductTypeIdAndFiscalYear_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: any) => {
    let sql = await ClearTimeForSctTotalSQL.getByProductTypeIdAndFiscalYearAndRevisionNo(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
