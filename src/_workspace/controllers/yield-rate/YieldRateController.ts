import { YieldRateModel } from '@src/_workspace/models/yield-rate/YieldRateModel'
import { getSqlWhereByColumnFilters } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const YieldRateController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_ID' },
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_NAME' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_ID' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_NAME' },
      { table: 'tb_3', id: 'PRODUCT_SUB_ID' },
      { table: 'tb_3', id: 'PRODUCT_SUB_NAME' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_CODE' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_NAME' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_CODE_FOR_SCT' },
      { table: 'tb_5', id: 'FLOW_PROCESS_NO' },
      { table: 'tb_5', id: 'SCT_REASON_SETTING_ID' },
      { table: 'tb_9', id: 'SCT_REASON_SETTING_NAME' },
      { table: 'tb_5', id: 'FISCAL_YEAR' },
      { table: 'tb_5', id: 'SCT_TAG_SETTING_ID' },
      { table: 'tb_5', id: 'NOTE' },
      { table: 'tb_5', id: 'INUSE' },
      { table: 'tb_5', id: 'COLLECTION_POINT_FOR_SCT' },
      { table: 'tb_5', id: 'UPDATE_BY' },
      { table: 'tb_5', id: 'UPDATE_DATE' },
      { table: 'tb_5', id: 'REVISION_NO' },
      { table: 'tb_7', id: 'PROCESS_NAME' },
      { table: 'tb_8', id: 'FLOW_NAME' },
      { table: 'tb_8', id: 'FLOW_CODE' },
      { table: 'tb_13', id: 'ITEM_CATEGORY_ID' },
      { table: 'tb_13', id: 'ITEM_CATEGORY_NAME' },
      { table: 'tb_11', id: 'CUSTOMER_INVOICE_TO_ID' },
      { table: 'tb_11', id: 'CUSTOMER_INVOICE_TO_NAME' },
    ]

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''
    if (typeof dataItem.Order === 'string') {
      try {
        dataItem.Order = JSON.parse(dataItem.Order) // แปลง string → array
      } catch (error) {
        console.error('Error parsing Order:', error)
        dataItem.Order = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
      }
    }
    if (dataItem['Order']?.length <= 0) {
      if (dataItem['IS_MODE'] === false) {
        orderBy = 'tb_5.UPDATE_DATE DESC , tb_1.PRODUCT_CATEGORY_NAME ,tb_2.PRODUCT_MAIN_NAME , tb_3.PRODUCT_SUB_NAME , tb_4.PRODUCT_TYPE_NAME , tb_5.FLOW_PROCESS_NO ASC'
      } else {
        orderBy = 'tb_5.UPDATE_DATE DESC'
      }
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]

        orderBy += `${tableIds.find((e) => e.id === word['id'])?.table || ''}.${word['id']} ${word['desc'] ? 'DESC' : 'ASC'},`
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await YieldRateModel.search(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Yield Rate Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
