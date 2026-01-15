import { MySQLExecute } from '@businessData/dbExecute'
import { CustomerShipToSQL } from '@src/_workspace/sql/customer/customer-ship-to/CustomerShipToSQL'
import { RowDataPacket } from 'mysql2'

export const CustomerShipToService = {
  search: async (dataItem: any) => {
    const sql = await CustomerShipToSQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  // getByLikeProductMainNameAndInuse: async (dataItem : any) => {
  //   const sql = await ProductMainSQL.getByLikeProductMainNameAndInuse(dataItem)
  //   const resultData = await MySQLExecute.search(sql)
  //   return resultData
  // },
  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem : any) => {
  //   const sql = await ProductMainSQL.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem)
  //   const resultData = await MySQLExecute.search(sql)
  //   return resultData
  // },
  create: async (dataItem: any) => {
    const sql = await CustomerShipToSQL.getByCustomerShipToName_condition(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const sqlCheckDuplicate = await CustomerShipToSQL.getByCustomerShipToAlphabet_condition(dataItem)
      const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

      if (resultCheckDuplicate.length === 0) {
        const query = await CustomerShipToSQL.create(dataItem)
        const resultInsertData = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultInsertData,
          MethodOnDb: 'Add Customer Ship To Success',
          TotalCountOnDb: resultInsertData?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Customer Ship To Alphabet',
          ResultOnDb: [],
          MethodOnDb: 'Insert Customer Ship To Failed',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Customer Ship To Name',
        ResultOnDb: [],
        MethodOnDb: 'Insert Customer Ship To Failed',
        TotalCountOnDb: 0,
      }
    }
  },
  update: async (dataItem: any) => {
    const existingConditionQuery = await CustomerShipToSQL.getByCustomerShipToName_condition(dataItem)
    const duplicateCheckResult = (await MySQLExecute.search(existingConditionQuery)) as RowDataPacket[]

    if (duplicateCheckResult.length === 0 || (duplicateCheckResult.length !== 0 && duplicateCheckResult[0].CUSTOMER_SHIP_TO_ID === dataItem.CUSTOMER_SHIP_TO_ID)) {
      const sqlCheckDuplicate = await CustomerShipToSQL.getByCustomerShipToAlphabet_condition(dataItem)
      const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

      if (resultCheckDuplicate.length === 0 || (resultCheckDuplicate.length !== 0 && resultCheckDuplicate[0].CUSTOMER_SHIP_TO_ID === dataItem.CUSTOMER_SHIP_TO_ID)) {
        const query = await CustomerShipToSQL.update(dataItem)
        const resultUpdateData = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultUpdateData,
          MethodOnDb: 'Update Customer Ship To Success',
          TotalCountOnDb: resultUpdateData.length ?? 0,
        }
      }

      return {
        Status: false,
        Message: 'Duplicate Customer Ship To Alphabet',
        ResultOnDb: [],
        MethodOnDb: 'Update Customer Ship To Failed',
        TotalCountOnDb: 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Customer Ship To Name',
      ResultOnDb: [],
      MethodOnDb: 'Update Customer Ship To Failed',
      TotalCountOnDb: 0,
    }
  },

  delete: async (dataItem: any) => {
    const sql = await CustomerShipToSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
