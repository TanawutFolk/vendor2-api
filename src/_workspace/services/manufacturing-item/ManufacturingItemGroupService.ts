import { MySQLExecute } from '@businessData/dbExecute'
import { ManufacturingItemGroupSQL } from '@src/_workspace/sql/manufacturing-item/ManufacturingItemGroupSQL'
import { ResponseI } from '@src/types/ResponseI'
import { RowDataPacket } from 'mysql2'

export const ManufacturingItemGroupService = {
  search: async (dataItem: any) => {
    // let resultData = []
    // let sqlWhere = ''
    // let sql

    // if (dataItem['ITEM_GROUP_ID'] != '') {
    //   sqlWhere += " AND tb_1.ITEM_GROUP_ID = 'dataItem.ITEM_GROUP_ID'"
    // }
    // if (dataItem['ITEM_GROUP_NAME'] != '') {
    //   sqlWhere += " AND tb_1.ITEM_GROUP_NAME LIKE '%dataItem.ITEM_GROUP_NAME%'"
    // }

    const sql = await ManufacturingItemGroupSQL.search(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },

  create: async (dataItem: any) => {
    let resultData
    let sqlWhere = ''

    const sql = await ManufacturingItemGroupSQL.getByManufacturingItemGroupNameAndInuse(dataItem, sqlWhere)
    resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    // console.log(resultData?.length)

    if (resultData?.length === 0) {
      const sql = await ManufacturingItemGroupSQL.create(dataItem)
      resultData = await MySQLExecute.execute(sql)
      return {
        Status: true,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Order Type',
        Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      } as ResponseI
    } else {
      return {
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Order Type',
        Message: 'ข้อมูลที่ต้องการบันทึก มีอยู่แล้ว Data already exists',
      } as ResponseI
    }
  },
  update: async (dataItem: any) => {
    let resultData

    let sqlWhere = ''

    if (dataItem.ITEM_GROUP_ID !== '') {
      sqlWhere += "AND ITEM_GROUP_ID != 'dataItem.ITEM_GROUP_ID'"
    }

    const sql = await ManufacturingItemGroupSQL.getByManufacturingItemGroupNameAndInuse(dataItem, sqlWhere)
    resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    // ** Have data already in DB
    if (resultData?.length > 0) {
      const sqlList = []

      // ** Can edit data by id
      if (resultData[0].ITEM_GROUP_ID == dataItem.ITEM_GROUP_ID) {
        sqlList.push(await ManufacturingItemGroupSQL.update(dataItem))
        resultData = await MySQLExecute.executeList(sqlList)

        return {
          Status: true,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Update Department',
          Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
        } as ResponseI
      } else {
        return {
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Update Department',
          Message: 'ข้อมูลที่ต้องการบันทึก มีอยู่แล้ว Data already exists',
        } as ResponseI
      }
    }
    // ** Not found data in DB
    else if (resultData?.length <= 0) {
      const sqlList = []

      sqlList.push(await ManufacturingItemGroupSQL.update(dataItem))
      resultData = await MySQLExecute.executeList(sqlList)

      return {
        Status: true,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Order Type',
        Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      } as ResponseI
    } else {
      return {
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Update Order Type',
        Message: 'ข้อมูลที่ต้องการบันทึก มีอยู่แล้ว Data already exists',
      } as ResponseI
    }
  },

  async delete(dataItem: any) {
    let sql = await ManufacturingItemGroupSQL.delete(dataItem)
    let resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
