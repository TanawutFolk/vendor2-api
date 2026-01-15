import { MySQLExecute } from '@businessData/dbExecute'
import { FiscalYearPeriodSQL } from '@src/_workspace/sql/sct/fiscal-year-period/FiscalYearPeriodSQL'
import { RowDataPacket } from 'mysql2'

export const FiscalYearPeriodService = {
  search: async (dataItem: any) => {
    let resultData = []
    // let sqlWhere = ''
    let sql

    // if (dataItem['CUSTOMER_INVOICE_TO_ID'] != '') {
    //   sqlWhere += " AND tb_2.CUSTOMER_INVOICE_TO_ID = 'dataItem.CUSTOMER_INVOICE_TO_ID'"
    // }
    // if (dataItem['P2_START_MONTH_OF_FISCAL_YEAR_ID'] != '') {
    //   sqlWhere += " AND tb_2.P2_START_MONTH_OF_FISCAL_YEAR_ID = 'dataItem.P2_START_MONTH_OF_FISCAL_YEAR_ID'"
    // }
    // if (dataItem['P3_START_MONTH_OF_FISCAL_YEAR_ID'] != '') {
    //   sqlWhere += " AND tb_2.P3_START_MONTH_OF_FISCAL_YEAR_ID = 'dataItem.P3_START_MONTH_OF_FISCAL_YEAR_ID'"
    // }

    sql = await FiscalYearPeriodSQL.search(dataItem)

    resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },

  create: async (dataItem: any) => {
    let sqlList = []
    let resultData

    let query = await FiscalYearPeriodSQL.GetByCustomerInvoiceToIdAndInuseDuplicate(dataItem)
    let resultQuery = (await MySQLExecute.search(query)) as RowDataPacket[]

    if (resultQuery.length === 0) {
      sqlList.push(await FiscalYearPeriodSQL.createFiscalYearPeriodReferToCustomerInvoiceTo(dataItem))

      resultData = await MySQLExecute.executeList(sqlList)
      resultData = {
        Status: true,
        Message: 'Insert Customer Invoice To Alphabet Success',
        ResultOnDb: [],
        MethodOnDb: 'Insert Customer Invoice To Alphabet',
        TotalCountOnDb: 0,
      }
    } else {
      resultData = {
        Status: false,
        Message: 'Duplicate Customer Invoice To Alphabet',
        ResultOnDb: [],
        MethodOnDb: 'Insert Customer Invoice To Alphabet',
        TotalCountOnDb: 0,
      }
    }

    // sqlList.push(await FiscalYearPeriodSQL.DeleteByCustomerInvoiceToId(dataItem))
    // sqlList.push(await FiscalYearPeriodSQL.createFiscalYearPeriodReferToCustomerInvoiceTo(dataItem))

    // resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },

  async update(dataItem: any) {
    let sql = await FiscalYearPeriodSQL.updateFiscalYearPeriodReferToCustomerInvoiceTo(dataItem)
    let resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  async delete(dataItem: any) {
    let sql = await FiscalYearPeriodSQL.deleteFiscalYearPeriodReferToCustomerInvoiceTo(dataItem)
    let resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
