import { MySQLExecute } from '@businessData/dbExecute'
import { BoiUnitSQL } from '@sql/boi/BoiUnitSQL'
import { RowDataPacket } from 'mysql2'

export const BoiUnitService = {
  search: async (dataItem: any) => {
    const sql = await BoiUnitSQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  GetByLikeBoiSymbol: async (dataItem: any) => {
    const sql = await BoiUnitSQL.GetByLikeBoiSymbol(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeBoiUnitNameAndInuse: async (dataItem: any) => {
    const sql = await BoiUnitSQL.getByLikeBoiUnitNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeBoiSymbolAndInuse: async (dataItem: any) => {
    const sql = await BoiUnitSQL.getByLikeBoiSymbolAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  // create: async dataItem => {
  //   const sql = await BoiUnitSQL.create(dataItem)
  //   const resultData = await MySQLExecute.execute(sql)
  //   return resultData
  // },
  create: async (dataItem: any) => {
    const sql = await BoiUnitSQL.getBoiUnitByBoiUnitForCheck(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const sqlBoiUnitSymbol = await BoiUnitSQL.getBoiSymbol(dataItem)
      const resultBoiUnitSymbol = (await MySQLExecute.search(sqlBoiUnitSymbol)) as RowDataPacket[]

      if (resultBoiUnitSymbol.length === 0) {
        const query = await BoiUnitSQL.create(dataItem)
        const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultDataForInsert,
          MethodOnDb: 'Insert BOI Unit',
          TotalCountOnDb: 0,
        }
      } else {
        return {
          Status: false,
          Message: 'BOI Symbol already exists',
          ResultOnDb: [],
          MethodOnDb: 'Insert BOI Symbol',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'BOI Unit Name already exists',
        ResultOnDb: [],
        MethodOnDb: 'Insert BOI Unit Name',
        TotalCountOnDb: 0,
      }
    }
  },

  update: async (dataItem: any) => {
    const sql = await BoiUnitSQL.getBoiUnitByBoiUnitForCheck(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0 || (resultData.length !== 0 && resultData[0].BOI_UNIT_ID === dataItem.BOI_UNIT_ID)) {
      const sqlBoiUnitSymbol = await BoiUnitSQL.getBoiSymbol(dataItem)
      const resultBoiUnitSymbol = (await MySQLExecute.search(sqlBoiUnitSymbol)) as RowDataPacket[]

      if (resultBoiUnitSymbol.length === 0 || (resultBoiUnitSymbol.length !== 0 && resultBoiUnitSymbol[0].BOI_UNIT_ID === dataItem.BOI_UNIT_ID)) {
        const query = await BoiUnitSQL.update(dataItem)
        const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultDataForInsert,
          MethodOnDb: 'Update BOI Unit',
          TotalCountOnDb: 0,
        }
      } else {
        return {
          Status: false,
          Message: 'BOI Symbol already exists',
          ResultOnDb: [],
          MethodOnDb: 'Update BOI Symbol',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'BOI Unit Name already exists',
        ResultOnDb: [],
        MethodOnDb: 'Update BOI Unit',
        TotalCountOnDb: 0,
      }
    }
  },

  delete: async (dataItem: any) => {
    const sql = await BoiUnitSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
