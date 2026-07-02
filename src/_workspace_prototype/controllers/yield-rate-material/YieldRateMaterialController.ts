import { YieldRateMaterialModel } from '@src/_workspace/models/yield-rate-material/YieldRateMaterialModel'
import getSqlWhere from '@src/helpers/sqlWhere'
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
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_ID', Fns: '=' },
      { table: 'tb_1', id: 'PRODUCT_CATEGORY_NAME', Fns: 'LIKE' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_ID', Fns: '=' },
      { table: 'tb_2', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'PRODUCT_SUB_ID', Fns: '=' },
      { table: 'tb_3', id: 'PRODUCT_SUB_NAME', Fns: 'LIKE' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_CODE', Fns: 'LIKE' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_CODE_FOR_SCT', Fns: 'LIKE' },
      { table: 'tb_5', id: 'SCT_REASON_SETTING_ID', Fns: '=' },
      { table: 'tb_7', id: 'SCT_REASON_SETTING_NAME', Fns: 'LIKE' },
      { table: 'tb_5', id: 'FISCAL_YEAR', Fns: 'LIKE' },
      { table: 'tb_5', id: 'SCT_TAG_SETTING_ID', Fns: '=' },
      { table: 'tb_5', id: 'INUSE', Fns: '=' },
      { table: 'tb_5', id: 'UPDATE_BY', Fns: '=' },
      { table: 'tb_5', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_5', id: 'REVISION_NO', Fns: '=' },
      { table: 'tb_6', id: 'ITEM_CODE_FOR_SUPPORT_MES', Fns: 'LIKE' },
      { table: 'tb_6', id: 'ITEM_INTERNAL_SHORT_NAME', Fns: 'LIKE' },
      { table: 'tb_6', id: 'ITEM_INTERNAL_FULL_NAME', Fns: 'LIKE' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                                 PRODUCT_CATEGORY tb_1
                INNER JOIN PRODUCT_MAIN tb_2 ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID AND tb_2.INUSE = 1
                INNER JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                INNER JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID AND tb_4.INUSE = 1
                INNER JOIN yield_accumulation_of_item_for_sct tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                INNER JOIN ITEM_MANUFACTURING tb_6 ON tb_5.ITEM_ID = tb_6.ITEM_ID AND tb_6.INUSE = 1
                INNER JOIN dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_7 ON tb_7.SCT_REASON_SETTING_ID = tb_5.SCT_REASON_SETTING_ID
`,

      selectInuseForSearch: `
            tb_5.INUSE AS inuseForSearch
          `,
    }

    // dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    // let orderBy = ''

    // if (dataItem['Order']?.length <= 0) {
    //   orderBy = 'tb_5.UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < dataItem['Order'].length; i++) {
    //     const word = dataItem['Order'][i]
    //     // orderBy += (`${tableIds.find((e) => e.id === word['id'])?.table}.` ??'') + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //   }
    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy

    // let sqlWhereColumnFilter = ''
    // if (dataItem?.ColumnFilters?.length > 0) {
    //   sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    // }

    // dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter
    getSqlWhere(dataItem, tableIds)
    const result = await YieldRateMaterialModel.search(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Section',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  createMaterialYieldRateData: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await YieldRateMaterialModel.createMaterialYieldRateData(dataItem)

    res.status(200).json(result)
  },
}
