import { YieldRateMaterialSQL } from '@src/_workspace/sql/yield-rate-material/YieldRateMaterialSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const YieldRateMaterialService = {
  search: async (dataItem: any) => {
    let sql = ''

    // let sqlWhere = ''

    // if (dataItem.FISCAL_YEAR !== '') {
    //   sqlWhere += " AND tb_5.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'"
    // }
    // if (dataItem.PRODUCT_CATEGORY_ID !== '') {
    //   sqlWhere += " AND tb_1.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'"
    // }
    // if (dataItem.PRODUCT_MAIN_ID !== '') {
    //   sqlWhere += " AND tb_2.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'"
    // }
    // if (dataItem.PRODUCT_SUB_ID !== '') {
    //   sqlWhere += " AND tb_3.PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'"
    // }
    // if (dataItem.PRODUCT_TYPE_CODE !== '') {
    //   sqlWhere += " AND tb_4.PRODUCT_TYPE_CODE_FOR_SCT LIKE '%dataItem.PRODUCT_TYPE_CODE%'"
    // }
    // if (dataItem.PRODUCT_TYPE_NAME !== '') {
    //   sqlWhere += " AND tb_4.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'"
    // }
    // if (dataItem.SCT_REASON_SETTING_ID !== '') {
    //   sqlWhere += " AND tb_5.SCT_REASON_SETTING_ID = 'dataItem.SCT_REASON_SETTING_ID'"
    // }
    // if (dataItem.SCT_TAG_SETTING_ID !== '') {
    //   sqlWhere += " AND tb_5.SCT_TAG_SETTING_ID = 'dataItem.SCT_TAG_SETTING_ID'"
    // }

    // ** Mode Process
    sql = await YieldRateMaterialSQL.search(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
