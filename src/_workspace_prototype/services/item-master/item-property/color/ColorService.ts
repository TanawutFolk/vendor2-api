import { MySQLExecute } from '@businessData/dbExecute'
import { ColorSQL } from '@src/_workspace/sql/item-master/item-property/color/ColorSQL'
import { RowDataPacket } from 'mysql2'

export const ColorService = {
  getItemPropertyColor: async (dataItem: any) => {
    const sql = await ColorSQL.getItemPropertyColor(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getAll: async () => {
    const sql = await ColorSQL.getAll()
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  searchItemPropertyColor: async (dataItem: any) => {
    const sql = await ColorSQL.searchItemPropertyColor(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  createItemPropertyColor: async (dataItem: any) => {
    const sqlCheckDuplicate = await ColorSQL.getItemPropertyColorName(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

    if (resultCheckDuplicate.length === 0) {
      const sqlInsert = await ColorSQL.createItemPropertyColor(dataItem)
      const resultInsertData = (await MySQLExecute.execute(sqlInsert)) as RowDataPacket[]

      return {
        Status: true,
        Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
        ResultOnDb: resultInsertData,
        MethodOnDb: 'Add Item Property Color Success',
        TotalCountOnDb: resultInsertData.length ?? 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Item Property Color Name',
      ResultOnDb: [],
      MethodOnDb: 'Insert Item Property Color Failed',
      TotalCountOnDb: 0,
    }
  },

  updateItemPropertyColor: async (dataItem: any) => {
    const sqlCheckDuplicate = await ColorSQL.getItemPropertyColorName(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

    if (resultCheckDuplicate.length === 0 || (resultCheckDuplicate.length !== 0 && resultCheckDuplicate[0].ITEM_PROPERTY_COLOR_ID === dataItem.ITEM_PROPERTY_COLOR_ID)) {
      const sqlUpdate = await ColorSQL.updateItemPropertyColor(dataItem)
      const resultUpdateData = (await MySQLExecute.execute(sqlUpdate)) as RowDataPacket[]

      return {
        Status: true,
        Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
        ResultOnDb: resultUpdateData,
        MethodOnDb: 'Update Item Property Color Success',
        TotalCountOnDb: resultUpdateData.length ?? 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Item Property Color Name',
      ResultOnDb: [],
      MethodOnDb: 'Update Item Property Color Failed',
      TotalCountOnDb: 0,
    }
  },

  deleteItemPropertyColor: async (dataItem: any) => {
    const sql = await ColorSQL.deleteItemPropertyColor(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },

  getByLikeItemPropertyColorName: async (dataItem: any) => {
    const sql = await ColorSQL.getByLikeItemPropertyColorName(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
