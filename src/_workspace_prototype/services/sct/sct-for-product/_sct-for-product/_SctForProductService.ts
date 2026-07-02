import { _SctForProductSQL } from '@src/_workspace/sql/sct/sct-for-product/_sct-for-product/_SctForProductSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const _SctForProductService = {
  getSctBomItemItemPriceByBomIdAndFiscalYear_MasterDataLatest: async (dataItem: { BOM_ID: number; FISCAL_YEAR: number; SCT_PATTERN_ID: number; PRODUCT_TYPE_ID: number }) => {
    let sql = await _SctForProductSQL.getSctBomItemItemPriceByBomIdAndFiscalYear_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getLastSellingBySctId: async (dataItem: { SCT_ID: string }) => {
    let sql = await _SctForProductSQL.getLastSellingBySctId(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as Array<{
      ITEM_M_S_PRICE_ID: string
      ITEM_M_S_PRICE_VALUE: number
      SCT_ID: string
      VERSION: string
      CREATE_DATE: string
    }>
    return resultData
  },
  getSctBomFlowProcessPriceAdjustBySct: async (dataItem: { SCT_ID: string }) => {
    let sql = await _SctForProductSQL.getSctBomFlowProcessPriceAdjustBySct(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
