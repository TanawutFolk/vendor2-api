import { ItemManufacturingStandardPriceSQL } from '@src/_workspace/sql/item/00.BackUp/ItemManufacturingStandardPriceSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'

export const ItemManufacturingStandardPriceService = {
  getStandardPriceByItemId: async (dataItem: any, fiscalYear: any) => {
    const sql = await ItemManufacturingStandardPriceSQL.getStandardPriceByItemId(dataItem, fiscalYear)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getItemMSPriceBySctFId: async (dataItem: any) => {
    const sql = await ItemManufacturingStandardPriceSQL.getItemMSPriceBySctFId(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
