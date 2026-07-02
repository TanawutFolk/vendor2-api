import { MySQLExecute } from '@businessData/dbExecute'
import { CustomerInvoiceToSQL } from '@src/_workspace/sql/customer/customer-invoice-to/CustomerInvoiceToSQL'
import { RowDataPacket } from 'mysql2'

export const CustomerInvoiceToService = {
  search: async (dataItem: any) => {
    const sql = await CustomerInvoiceToSQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },

  create: async (dataItem: any) => {
    const sql = await CustomerInvoiceToSQL.getByCustomerInvoiceToName_condition(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const sqlCheckDuplicate = await CustomerInvoiceToSQL.getByCustomerInvoiceToAlphabet_condition(dataItem)
      const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

      if (resultCheckDuplicate.length === 0) {
        const query = await CustomerInvoiceToSQL.create(dataItem)
        const resultInsertData = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultInsertData,
          MethodOnDb: 'Add Customer Invoice To Success',
          TotalCountOnDb: resultInsertData.length ?? 0,
        }
      }

      return {
        Status: false,
        Message: 'Duplicate Customer Invoice To Alphabet',
        ResultOnDb: [],
        MethodOnDb: 'Insert Customer Invoice To Failed',
        TotalCountOnDb: 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Customer Invoice To Name',
      ResultOnDb: [],
      MethodOnDb: 'Insert Customer Invoice To Failed',
      TotalCountOnDb: 0,
    }
  },

  update: async (dataItem: any) => {
    const existingConditionQuery = await CustomerInvoiceToSQL.getByCustomerInvoiceToName_condition(dataItem)
    const duplicateCheckResult = (await MySQLExecute.search(existingConditionQuery)) as RowDataPacket[]

    if (duplicateCheckResult.length === 0 || (duplicateCheckResult.length !== 0 && duplicateCheckResult[0].CUSTOMER_INVOICE_TO_ID === dataItem.CUSTOMER_INVOICE_TO_ID)) {
      const sqlCheckDuplicate = await CustomerInvoiceToSQL.getByCustomerInvoiceToAlphabet_condition(dataItem)
      const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

      if (resultCheckDuplicate.length === 0 || (resultCheckDuplicate.length !== 0 && resultCheckDuplicate[0].CUSTOMER_INVOICE_TO_ID === dataItem.CUSTOMER_INVOICE_TO_ID)) {
        const query = await CustomerInvoiceToSQL.update(dataItem)
        const resultUpdateData = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultUpdateData,
          MethodOnDb: 'Update Customer Invoice To Success',
          TotalCountOnDb: resultUpdateData.length ?? 0,
        }
      }

      return {
        Status: false,
        Message: 'Duplicate Customer Invoice To Alphabet',
        ResultOnDb: [],
        MethodOnDb: 'Update Customer Invoice To Failed',
        TotalCountOnDb: 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Customer Invoice To Name',
      ResultOnDb: [],
      MethodOnDb: 'Update Customer Invoice To Failed',
      TotalCountOnDb: 0,
    }
  },

  delete: async (dataItem: any) => {
    const sql = await CustomerInvoiceToSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  getByLikeCustomerInvoiceToName: async (dataItem: any) => {
    const sql = await CustomerInvoiceToSQL.getByLikeCustomerInvoiceToName(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeCustomerInvoiceToAlphabet: async (dataItem: any) => {
    const sql = await CustomerInvoiceToSQL.getByLikeCustomerInvoiceToAlphabet(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
