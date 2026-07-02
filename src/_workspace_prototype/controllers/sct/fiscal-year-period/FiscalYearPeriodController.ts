import { FiscalYearPeriodModel } from '@_workspace/models/sct/fiscal-year-period/FiscalYearPeriodModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const FiscalYearPeriodController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_2', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CUSTOMER_INVOICE_TO_ID', Fns: '=' },
      { table: 'tb_2', id: 'CUSTOMER_INVOICE_TO_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_2', id: 'CUSTOMER_INVOICE_TO_NAME', Fns: 'LIKE' },
      { table: 'tb_4', id: 'MONTH_SHORT_NAME_ENGLISH', alias: 'P2_START_MONTH_OF_FISCAL_YEAR_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'MONTH_SHORT_NAME_ENGLISH', alias: 'P3_START_MONTH_OF_FISCAL_YEAR_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'FLOW_CODE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'FLOW_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'P2_NEED', Fns: 'LIKE' },
      { table: 'tb_1', id: 'TOTAL_COUNT_PROCESS', Fns: 'LIKE' },
      { table: 'tb_5', id: 'PRODUCT_TYPE_CODE', Fns: 'LIKE' },
      { table: 'tb_5', id: 'PRODUCT_TYPE_NAME', Fns: 'LIKE' },
      // { table: 'tb_1', id: 'INUSE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                               FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO tb_1
                        INNER JOIN
                    CUSTOMER_INVOICE_TO tb_2
                        ON tb_1.CUSTOMER_INVOICE_TO_ID = tb_2.CUSTOMER_INVOICE_TO_ID
                        INNER JOIN
                    MONTH tb_3
                        ON tb_1.P3_START_MONTH_OF_FISCAL_YEAR_ID  = tb_3.MONTH_ID
                        LEFT JOIN
                    MONTH tb_4
                        ON tb_1.P2_START_MONTH_OF_FISCAL_YEAR_ID = tb_4.MONTH_ID`,

      selectInuseForSearch: `
            tb_1.INUSE AS inuseForSearch
          `,
    }
    getSqlWhere(dataItem, tableIds)
    // dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    // let orderBy = ''

    // if (dataItem['Order'].length <= 0) {
    //   orderBy = 'tb_1.UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < dataItem['Order'].length; i++) {
    //     const word = dataItem['Order'][i]
    //     if (word['id'] == 'CUSTOMER_INVOICE_TO_ALPHABET') {
    //       orderBy += 'tb_2.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else if (word['id'] == 'INUSE') {
    //       orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else if (word['id'] == 'P2_START_MONTH_OF_FISCAL_YEAR_NAME') {
    //       orderBy += 'tb_4.MONTH_SHORT_NAME_ENGLISH' + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else if (word['id'] == 'P3_START_MONTH_OF_FISCAL_YEAR_NAME') {
    //       orderBy += 'tb_3.MONTH_SHORT_NAME_ENGLISH' + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     } else {
    //       orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //     }
    //   }
    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy

    // let sqlWhereColumnFilter = ''
    // if (dataItem?.ColumnFilters?.length > 0) {
    //   sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    // }

    // dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await FiscalYearPeriodModel.search(dataItem)
    // for (let i = 0; i < result[1].length; i++) {
    //   result[1][i]['No'] = i + 1
    // }

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Process',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FiscalYearPeriodModel.create(dataItem)

    res.status(200).json(result as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await FiscalYearPeriodModel.update(dataItem)

    res.json({
      Status: true,
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      ResultOnDb: result,
      MethodOnDb: 'Update FlowType',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await FiscalYearPeriodModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
      ResultOnDb: result,
      MethodOnDb: 'Delete FlowType',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
