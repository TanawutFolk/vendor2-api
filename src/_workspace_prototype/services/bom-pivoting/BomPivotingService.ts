import { BomPivotingSQL } from '@src/_workspace/sql/bom-pivoting/BomPivotingSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const BomPivotingService = {
  search: async (dataItem: any) => {
    let sqlWhere = ''

    if (dataItem.PRODUCT_CATEGORY_ID) {
      sqlWhere += ` AND tb_1.PRODUCT_CATEGORY_ID = '${dataItem.PRODUCT_CATEGORY_ID}'`
    }

    if (dataItem.PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_2.PRODUCT_MAIN_ID = '${dataItem.PRODUCT_MAIN_ID}'`
    }

    if (dataItem.PRODUCT_SUB_ID) {
      sqlWhere += ` AND tb_3.PRODUCT_SUB_ID = '${dataItem.PRODUCT_SUB_ID}'`
    }

    if (dataItem.PRODUCT_TYPE_ID) {
      sqlWhere += ` AND tb_4.PRODUCT_TYPE_ID = '${dataItem.PRODUCT_TYPE_ID}'`
    }

    if (dataItem.ITEM_CATEGORY_ID) {
      sqlWhere += ` AND tb_12.ITEM_CATEGORY_ID = '${dataItem.ITEM_CATEGORY_ID}'`
    }

    if (dataItem.CUSTOMER_INVOICE_TO_ID) {
      sqlWhere += ` AND EXISTS (
        SELECT 1
        FROM PRODUCT_TYPE_CUSTOMER_INVOICE_TO ptci
        WHERE ptci.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
          AND ptci.CUSTOMER_INVOICE_TO_ID = '${dataItem.CUSTOMER_INVOICE_TO_ID}'
          AND ptci.INUSE = 1
      )`
    }

    if (dataItem.BOM_CODE) {
      sqlWhere += ` AND tb_6.BOM_CODE LIKE '%${dataItem.BOM_CODE}%'`
    }

    if (dataItem.BOM_NAME) {
      sqlWhere += ` AND tb_6.BOM_NAME LIKE '%${dataItem.BOM_NAME}%'`
    }

    const sql = await BomPivotingSQL.search(sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },
}
