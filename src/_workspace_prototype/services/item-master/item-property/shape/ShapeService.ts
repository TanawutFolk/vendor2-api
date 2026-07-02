import { MySQLExecute } from '@businessData/dbExecute'
import { ShapeSQL } from '@src/_workspace/sql/item-master/item-property/shape/ShapeSQL'
import { RowDataPacket } from 'mysql2'

export const ShapeService = {
  getItemPropertyShape: async (dataItem: any) => {
    const sql = await ShapeSQL.getItemPropertyShape(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getAll: async () => {
    const sql = await ShapeSQL.getAll()
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  searchItemPropertyShape: async (dataItem: any) => {
    const sql = await ShapeSQL.searchItemPropertyShape(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  createItemPropertyShape: async (dataItem: any) => {
    const sqlCheckDuplicate = await ShapeSQL.getItemPropertyShapeName(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

    if (resultCheckDuplicate.length === 0) {
      const sqlInsert = await ShapeSQL.createItemPropertyShape(dataItem)
      const resultInsertData = (await MySQLExecute.execute(sqlInsert)) as RowDataPacket[]

      return {
        Status: true,
        Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
        ResultOnDb: resultInsertData,
        MethodOnDb: 'Insert Item Property Shape',
        TotalCountOnDb: resultInsertData.length ?? 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Item Property Shape Name',
      ResultOnDb: [],
      MethodOnDb: 'Insert Item Property Shape Failed',
      TotalCountOnDb: 0,
    }
  },

  updateItemPropertyShape: async (dataItem: any) => {
    const sqlCheckDuplicate = await ShapeSQL.getItemPropertyShapeName(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

    if (resultCheckDuplicate.length === 0 || (resultCheckDuplicate.length !== 0 && resultCheckDuplicate[0].ITEM_PROPERTY_SHAPE_ID === dataItem.ITEM_PROPERTY_SHAPE_ID)) {
      const sqlUpdate = await ShapeSQL.updateItemPropertyShape(dataItem)
      const resultUpdateData = (await MySQLExecute.execute(sqlUpdate)) as RowDataPacket[]

      return {
        Status: true,
        Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
        ResultOnDb: resultUpdateData,
        MethodOnDb: 'Update Item Property Shape Success',
        TotalCountOnDb: resultUpdateData.length ?? 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Item Property Shape Name',
      ResultOnDb: [],
      MethodOnDb: 'Update Item Property Shape Failed',
      TotalCountOnDb: 0,
    }
  },

  deleteItemPropertyShape: async (dataItem: any) => {
    const sql = await ShapeSQL.deleteItemPropertyShape(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },

  getByLikeItemPropertyShapeName: async (dataItem: any) => {
    const sql = await ShapeSQL.getByLikeItemPropertyShapeName(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
