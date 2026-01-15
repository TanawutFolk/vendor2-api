import { MySQLExecute } from '@businessData/dbExecute'
import { MaterialListSQL } from '@src/_workspace/sql/environment-certificate/MaterialListSQL'
import { RowDataPacket } from 'mysql2'

export const MaterialListServices = {
  search: async (dataItem: any) => {
    let resultData
    let query = ''
    let sqlWhere = ''

    dataItem.ITEM_CATEGORY = JSON.parse(dataItem.ITEM_CATEGORY)

    dataItem.ITEM_CATEGORY = dataItem.ITEM_CATEGORY.map((item: any) => {
      return item.ITEM_CATEGORY_ID
    })

    if (dataItem.ITEM_CATEGORY.length > 0) {
      sqlWhere += ` AND tb_8.ITEM_CATEGORY_ID in ('${dataItem.ITEM_CATEGORY.join("','")}')`
    }

    if (dataItem.PRODUCT_CATEGORY_ID) {
      sqlWhere += ` AND tb_6.PRODUCT_CATEGORY_ID = '${dataItem.PRODUCT_CATEGORY_ID}'`
    }

    if (dataItem.PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_5.PRODUCT_MAIN_ID = '${dataItem.PRODUCT_MAIN_ID}'`
    }

    if (dataItem.PRODUCT_SUB_ID) {
      sqlWhere += ` AND tb_4.PRODUCT_SUB_ID = '${dataItem.PRODUCT_SUB_ID}'`
    }

    if (dataItem.PRODUCT_TYPE_ID) {
      sqlWhere += ` AND tb_1.PRODUCT_TYPE_ID = '${dataItem.PRODUCT_TYPE_ID}'`
    }

    if (dataItem.CUSTOMER_INVOICE_TO_ID) {
      sqlWhere += ` AND tb_11.CUSTOMER_INVOICE_TO_ID = '${dataItem.CUSTOMER_INVOICE_TO_ID}'`
    }

    query = await MaterialListSQL.search(dataItem, sqlWhere)
    //console.log(query)

    resultData = (await MySQLExecute.search(query)) as RowDataPacket[]

    return resultData
  },
  searchExport: async (dataItem: any) => {
    let resultData
    let queryTemp = ''
    // let query = []
    let sqlWhere = ''
    let sqlGroupBy = ''

    if (dataItem.EXPORT_MODE_ID === '2' || dataItem.EXPORT_MODE_ID === 2) {
      sqlGroupBy = 'GROUP BY tb_2.SCT_CODE_FOR_SUPPORT_MES, tb_12.ITEM_CODE_FOR_SUPPORT_MES'
    }

    dataItem.ITEM_CATEGORY = JSON.parse(dataItem.ITEM_CATEGORY)

    dataItem.ITEM_CATEGORY = dataItem.ITEM_CATEGORY.map((item: any) => {
      return item.ITEM_CATEGORY_ID
    })

    if (dataItem.ITEM_CATEGORY.length > 0) {
      sqlWhere += ` AND tb_8.ITEM_CATEGORY_ID in ('${dataItem.ITEM_CATEGORY.join("','")}')`
    }

    if (dataItem.PRODUCT_CATEGORY_ID) {
      sqlWhere += ` AND tb_6.PRODUCT_CATEGORY_ID = '${dataItem.PRODUCT_CATEGORY_ID}'`
    }

    if (dataItem.PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_5.PRODUCT_MAIN_ID = '${dataItem.PRODUCT_MAIN_ID}'`
    }

    if (dataItem.PRODUCT_SUB_ID) {
      sqlWhere += ` AND tb_4.PRODUCT_SUB_ID = '${dataItem.PRODUCT_SUB_ID}'`
    }

    if (dataItem.PRODUCT_TYPE_ID) {
      sqlWhere += ` AND tb_1.PRODUCT_TYPE_ID = '${dataItem.PRODUCT_TYPE_ID}'`
    }

    if (dataItem.CUSTOMER_INVOICE_TO_ID) {
      sqlWhere += ` AND tb_11.CUSTOMER_INVOICE_TO_ID = '${dataItem.CUSTOMER_INVOICE_TO_ID}'`
    }

    if (dataItem.EXPORT_MODE_ID === '3' || dataItem.EXPORT_MODE_ID === 3) {
      queryTemp = await MaterialListSQL.getItemDetailForExportByAllMCode()
    } else {
      queryTemp = await MaterialListSQL.getItemDetailForExport(dataItem, sqlWhere, sqlGroupBy)
    }

    resultData = (await MySQLExecute.search(queryTemp)) as RowDataPacket[]

    // serve({
    //   async fetch(request) {

    //   },
    //   idleTimeout: 255 // ตั้งค่าเวลาหมดอายุเป็น 30 วินาที
    // })

    //console.log(queryTemp)

    for (let i = 0; i < resultData.length; i++) {
      const item = resultData[i]

      if (item.SCT_ID_SUB) {
        queryTemp = await MaterialListSQL.getItemDetailByItemIdForExport(item)
        let children = (await MySQLExecute.search(queryTemp)) as RowDataPacket[]

        children = children.map((ch) => {
          let res = {
            ITEM_CATEGORY: item.ITEM_CATEGORY,
            PRODUCT_CATEGORY: item.PRODUCT_CATEGORY,
            PRODUCT_MAIN: item.PRODUCT_MAIN,
            PRODUCT_SUB: item.PRODUCT_SUB,
            STANDARD_COST_CODE: item.STANDARD_COST_CODE,
            PRODUCT_TYPE_NAME: item.PRODUCT_TYPE_NAME,
            CUSTOMER_INVOICE_TO_NAME: item.CUSTOMER_INVOICE_TO_NAME,
            ...ch,
          }

          return res
        })

        if (children.length > 0) {
          resultData.splice(i + 1, 0, ...children)
        }
      }
    }
    //console.log('133', resultData)
    return resultData
  },
}
