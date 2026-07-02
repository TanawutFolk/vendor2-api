import { MySQLExecute } from '@businessData/dbExecute'
import { PriceListExportSQL } from '@src/_workspace/sql/sct/price-list/PriceListSQL'
import { RowDataPacket } from 'mysql2'

export const PriceListExportService = {
  exportToFile: async (dataItem: any) => {
    let sql = await PriceListExportSQL.exportToFile(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
