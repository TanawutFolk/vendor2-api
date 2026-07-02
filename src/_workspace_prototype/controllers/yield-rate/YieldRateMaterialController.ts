import { YieldRateMaterialModel } from '@src/_workspace/models/yield-rate/YieldRateMaterialModel'
import { getSqlWhereByColumnFilters } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'

import { Request, Response } from 'express'

export const YieldRateMaterialController = {
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
      { table: 'tb_5', id: 'SCT_REASON_SETTING_ID' },
      { table: 'tb_5', id: 'FISCAL_YEAR' },
      { table: 'tb_5', id: 'SCT_TAG_SETTING_ID' },
      { table: 'tb_5', id: 'INUSE' },
      { table: 'tb_5', id: 'UPDATE_BY' },
      { table: 'tb_5', id: 'UPDATE_DATE' },
      { table: 'tb_5', id: 'REVISION_NO' },
      { table: 'tb_6', id: 'ITEM_CODE_FOR_SUPPORT_MES' },
      { table: 'tb_6', id: 'ITEM_INTERNAL_SHORT_NAME' },
      { table: 'tb_6', id: 'ITEM_INTERNAL_FULL_NAME' },
    ]

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''

    if (dataItem['Order']?.length <= 0) {
      orderBy = 'tb_5.UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        // orderBy += (`${tableIds.find((e) => e.id === word['id'])?.table}.` ??'') + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await YieldRateMaterialModel.search(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Section',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
