import { MySQLExecute } from '@businessData/dbExecute'
import { CustomerOrderFromSQL } from '@src/_workspace/sql/customer/customer-order-from/CustomerOrderFromSQL'
import { RowDataPacket } from 'mysql2'

export const CustomerOrderFromService = {
  search: async (dataItem: any) => {
    const sql = await CustomerOrderFromSQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  // getByLikeProductMainNameAndInuse: async dataItem => {
  //   const sql = await ProductMainSQL.getByLikeProductMainNameAndInuse(dataItem)
  //   const resultData = await MySQLExecute.search(sql)
  //   return resultData
  // },
  getByLikeCustomerOrderFromNameAndInuse: async (dataItem: any) => {
    const sql = await CustomerOrderFromSQL.getByLikeCustomerOrderFromNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  create: async (dataItem: any) => {
    const sql = await CustomerOrderFromSQL.getByCustomerOrderFromName_condition(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const sqlCheckDuplicate = await CustomerOrderFromSQL.getByCustomerOrderFromAlphabet_condition(dataItem)
      const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

      if (resultCheckDuplicate.length === 0) {
        const query = await CustomerOrderFromSQL.create(dataItem)
        const resultInsertData = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultInsertData,
          MethodOnDb: 'Add Customer Order From Success',
          TotalCountOnDb: resultInsertData?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Customer Order From Alphabet',
          ResultOnDb: [],
          MethodOnDb: 'Insert Customer Order From Failed',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Customer Order From Name',
        ResultOnDb: [],
        MethodOnDb: 'Insert Customer Order From Failed',
        TotalCountOnDb: 0,
      }
    }
  },

  update: async (dataItem: any) => {
    const existingConditionQuery = await CustomerOrderFromSQL.getByCustomerOrderFromName_condition(dataItem)
    const duplicateCheckResult = (await MySQLExecute.search(existingConditionQuery)) as RowDataPacket[]

    if (duplicateCheckResult.length === 0 || (duplicateCheckResult.length !== 0 && duplicateCheckResult[0].CUSTOMER_ORDER_FROM_ID === dataItem.CUSTOMER_ORDER_FROM_ID)) {
      const sqlCheckDuplicate = await CustomerOrderFromSQL.getByCustomerOrderFromAlphabet_condition(dataItem)
      const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

      if (resultCheckDuplicate.length === 0 || (resultCheckDuplicate.length !== 0 && resultCheckDuplicate[0].CUSTOMER_ORDER_FROM_ID === dataItem.CUSTOMER_ORDER_FROM_ID)) {
        const query = await CustomerOrderFromSQL.update(dataItem)
        const resultInsertData = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultInsertData,
          MethodOnDb: 'Update Customer Order From Success',
          TotalCountOnDb: resultInsertData.length ?? 0,
        }
      }

      return {
        Status: false,
        Message: 'Duplicate Customer Order From Alphabet',
        ResultOnDb: [],
        MethodOnDb: 'Update Customer Order From Failed',
        TotalCountOnDb: 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Customer Order From Name',
      ResultOnDb: [],
      MethodOnDb: 'Update Customer Order From Failed',
      TotalCountOnDb: 0,
    }
  },

  delete: async (dataItem: any) => {
    const sql = await CustomerOrderFromSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
