import { MySQLExecute } from '@businessData/dbExecute'
import { MakerSQL } from '@src/_workspace/sql/item-master/maker/MakerSQL'
import { RowDataPacket } from 'mysql2'

export const MakerService = {
  getMaker: async (dataItem: any) => {
    const sql = await MakerSQL.getMaker(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  searchMaker: async (dataItem: any) => {
    const sql = await MakerSQL.searchMaker(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  createMaker: async (dataItem: any) => {
    const sqlCheckDuplicate = await MakerSQL.getMakerNameAndInuse(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

    if (resultCheckDuplicate.length === 0) {
      const sqlInsert = await MakerSQL.createMaker(dataItem)
      const resultInsertData = (await MySQLExecute.execute(sqlInsert)) as RowDataPacket[]

      return {
        Status: true,
        Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
        ResultOnDb: resultInsertData,
        MethodOnDb: 'Add Maker Success',
        TotalCountOnDb: resultInsertData.length ?? 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Maker Name',
      ResultOnDb: [],
      MethodOnDb: 'Insert Maker Failed',
      TotalCountOnDb: 0,
    }
  },

  updateMaker: async (dataItem: any) => {
    const sqlCheckDuplicate = await MakerSQL.getMakerNameAndInuse(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

    if (resultCheckDuplicate.length === 0 || (resultCheckDuplicate.length !== 0 && resultCheckDuplicate[0].MAKER_ID === dataItem.MAKER_ID)) {
      const sqlUpdate = await MakerSQL.updateMaker(dataItem)
      const resultUpdateData = (await MySQLExecute.execute(sqlUpdate)) as RowDataPacket[]

      return {
        Status: true,
        Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
        ResultOnDb: resultUpdateData,
        MethodOnDb: 'Update Maker Success',
        TotalCountOnDb: resultUpdateData.length ?? 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Maker Name',
      ResultOnDb: [],
      MethodOnDb: 'Update Maker Failed',
      TotalCountOnDb: 0,
    }
  },

  deleteMaker: async (dataItem: any) => {
    const sql = await MakerSQL.deleteMaker(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },

  getByLikeMakerNameAndInuse: async (dataItem: any) => {
    const sql = await MakerSQL.getByLikeMakerNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
