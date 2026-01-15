import { MySQLExecute } from '@businessData/dbExecute'
import { MasterDataSystemSQL } from '@src/_workspace/sql/_MasterDataSystemSQL.js/_MasterDataSystemSQL'
import { RowDataPacket } from 'mysql2'

export const MasterDataSystemService = {
  getItemCodeInBomOfProduct: async (dataItem: any) => {
    let resultData = []
    let query
    let sqlWhere = ''

    if (dataItem['ITEM_CODE'] !== '') {
      sqlWhere += " AND tb_1.ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE'"
      query = await MasterDataSystemSQL.getItemCode(dataItem, sqlWhere)
      resultData = (await MySQLExecute.search(query)) as RowDataPacket[]
    } else {
      if (dataItem['PRODUCT_TYPE_ID'] !== '') {
        sqlWhere += " AND tb_9.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'"
      }
      if (dataItem['PRODUCT_SUB_ID'] !== '') {
        sqlWhere += " AND tb_5.PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'"
      }
      if (dataItem['PRODUCT_MAIN_ID'] !== '') {
        sqlWhere += " AND tb_3.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'"
      }
      if (dataItem['ITEM_CATEGORY_ID'] !== '') {
        sqlWhere += " AND tb_8.ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID'"
      }
      if (dataItem['BOM_ID'] !== '') {
        sqlWhere += " AND tb_3.BOM_ID = 'dataItem.BOM_ID'"
      }
      query = await MasterDataSystemSQL.getItemCodeInBomOfProduct(dataItem, sqlWhere)
      resultData = (await MySQLExecute.search(query)) as RowDataPacket[]
    }

    return resultData
  },
}
