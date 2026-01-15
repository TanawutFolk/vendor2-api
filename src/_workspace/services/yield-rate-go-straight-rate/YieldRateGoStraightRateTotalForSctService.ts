import { YieldRateGoStraightRateTotalForSctSQL } from '@src/_workspace/sql/yield-rate-go-straight-rate/YieldRateGoStraightRateTotalForSctSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const YieldRateGoStraightRateTotalForSctService = {
  search: async (dataItem: any) => {
    let sql = ''

    let sqlWhere = ''

    if (dataItem.FISCAL_YEAR !== '') {
      sqlWhere += " AND tb_5.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'"
    }
    if (dataItem.PRODUCT_CATEGORY_ID) {
      sqlWhere += " AND tb_1.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'"
    }
    if (dataItem.PRODUCT_MAIN_ID) {
      sqlWhere += " AND tb_2.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'"
    }
    if (dataItem.PRODUCT_SUB_ID) {
      sqlWhere += " AND tb_3.PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'"
    }
    if (dataItem.PRODUCT_TYPE_ID) {
      sqlWhere += " AND tb_4.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'"
    }
    if (dataItem.PRODUCT_TYPE_CODE) {
      sqlWhere += " AND tb_4.PRODUCT_TYPE_CODE_FOR_SCT LIKE '%dataItem.PRODUCT_TYPE_CODE%'"
    }
    if (dataItem.PRODUCT_TYPE_NAME) {
      sqlWhere += " AND tb_4.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'"
    }

    sql = await YieldRateGoStraightRateTotalForSctSQL.search(dataItem, sqlWhere)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest: async (dataItem: any) => {
    let sql = await YieldRateGoStraightRateTotalForSctSQL.getByFiscalYearAndProductTypeIdAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
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
