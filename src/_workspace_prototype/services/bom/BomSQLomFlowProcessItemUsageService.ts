import { MySQLExecute } from '@businessData/dbExecute'
import { BomFlowProcessItemUsageSQL } from '@src/_workspace/sql/bom/BomFlowProcessItemUsageSQL'
import { RowDataPacket } from 'mysql2'

export const BomSQLomFlowProcessItemUsageService = {
  getByProductTypeCodeAndProcessName: async (dataItem: { PRODUCT_TYPE_CODE: string; PROCESS_NAME: string }) => {
    let sql = await BomFlowProcessItemUsageSQL.getByProductTypeCodeAndProcessName(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId: async (dataItem: any) => {
    let sql = await BomFlowProcessItemUsageSQL.getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },
}
