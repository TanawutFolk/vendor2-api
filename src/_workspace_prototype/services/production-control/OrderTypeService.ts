import { MySQLExecute } from '@businessData/dbExecute'
import { OrderTypeSQL } from '@src/_workspace/sql/production-control/OrderTypeSQL'
import { ResponseI } from '@src/types/ResponseI'
import { RowDataPacket } from 'mysql2'

export const OrderTypeService = {
  search: async (dataItem: any) => {
    let resultData = []
    // let sqlWhere = ''
    let sql

    // if (dataItem['ORDER_TYPE_ID'] != '') {
    //   sqlWhere += " AND tb_1.ORDER_TYPE_ID = 'dataItem.ORDER_TYPE_ID'"
    // }
    // if (dataItem['ORDER_TYPE_NAME'] != '') {
    //   sqlWhere += " AND tb_1.ORDER_TYPE_NAME LIKE '%dataItem.ORDER_TYPE_NAME%'"
    // }
    // if (dataItem['ORDER_TYPE_ALPHABET'] != '') {
    //   sqlWhere += " AND tb_1.ORDER_TYPE_ALPHABET LIKE '%dataItem.ORDER_TYPE_ALPHABET%'"
    // }

    sql = await OrderTypeSQL.search(dataItem)

    resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },

  //   create: async (dataItem: any) => {
  //     let sqlList = []
  //     let resultData

  //     sqlList.push(await OrderTypeSQL.DeleteByCustomerInvoiceToId(dataItem))
  //     sqlList.push(await OrderTypeSQL.createFiscalYearPeriodReferToCustomerInvoiceTo(dataItem))

  //     resultData = await MySQLExecute.executeList(sqlList)
  //     return resultData
  //   },

  create: async (dataItem: any) => {
    const sql = await OrderTypeSQL.getByOrderTypeNameAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const sqlAlphabet = await OrderTypeSQL.getByOrderTypeAlphabetAndInuse(dataItem)
      const resultDataAlphabet = (await MySQLExecute.search(sqlAlphabet)) as RowDataPacket[]

      if (resultDataAlphabet.length === 0) {
        const query = await OrderTypeSQL.create(dataItem)
        const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultDataForInsert,
          MethodOnDb: 'Insert Order Type',
          TotalCountOnDb: 0,
        } as ResponseI
      } else {
        return {
          Status: false,
          Message: 'Duplicate Order Type Alphabet ',
          ResultOnDb: [],
          MethodOnDb: 'Insert Order Type Alphabet',
          TotalCountOnDb: 0,
        } as ResponseI
      }
    } else {
      return {
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Order Type',
        Message: 'Duplicate Order Type Name',
      } as ResponseI
    }
  },
  update: async (dataItem: any) => {
    const sql = await OrderTypeSQL.getByOrderTypeNameAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0 || (resultData.length !== 0 && resultData[0].ORDER_TYPE_ID === dataItem.ORDER_TYPE_ID)) {
      const sqlAlphabet = await OrderTypeSQL.getByOrderTypeAlphabetAndInuse(dataItem)
      const resultDataAlphabet = (await MySQLExecute.search(sqlAlphabet)) as RowDataPacket[]

      if (resultDataAlphabet.length === 0 || (resultDataAlphabet.length !== 0 && resultDataAlphabet[0].ORDER_TYPE_ID === dataItem.ORDER_TYPE_ID)) {
        const query = await OrderTypeSQL.update(dataItem)
        const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultDataForInsert,
          MethodOnDb: 'Update Order Type',
          TotalCountOnDb: 0,
        } as ResponseI
      } else {
        return {
          Status: false,
          Message: 'Duplicate Order Type Alphabet ',
          ResultOnDb: [],
          MethodOnDb: 'Update Order Type Alphabet',
          TotalCountOnDb: 0,
        } as ResponseI
      }
    } else {
      return {
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Order Type',
        Message: 'Duplicate Order Type Name',
      } as ResponseI
    }
  },

  async delete(dataItem: any) {
    let sql = await OrderTypeSQL.delete(dataItem)
    let resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
