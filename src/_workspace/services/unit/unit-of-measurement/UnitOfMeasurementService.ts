import { MySQLExecute } from '@businessData/dbExecute'
import { UnitOfMeasurementSQL } from '@src/_workspace/sql/unit/unit-of-measurement/UnitOfMeasurementSQL'
import { RowDataPacket } from 'mysql2'

export const UnitOfMeasurementService = {
  getUnit: async (dataItem: any) => {
    const sql = await UnitOfMeasurementSQL.getUnit(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  searchUnit: async (dataItem: any) => {
    const sql = await UnitOfMeasurementSQL.searchUnit(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  // createUnit: async (dataItem: any) => {
  //   const sql = await UnitOfMeasurementSQL.createUnit(dataItem)
  //   const resultData = await MySQLExecute.execute(sql)
  //   return resultData
  // },
  createUnit: async (dataItem: any) => {
    const sql = await UnitOfMeasurementSQL.getUnitOfMeasurementNameByUnitOfMeasurementName(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const sqlBoiUnitSymbol = await UnitOfMeasurementSQL.getSymbolBySymbol(dataItem)
      const resultBoiUnitSymbol = (await MySQLExecute.search(sqlBoiUnitSymbol)) as RowDataPacket[]

      if (resultBoiUnitSymbol.length === 0) {
        const query = await UnitOfMeasurementSQL.createUnit(dataItem)
        const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultDataForInsert,
          MethodOnDb: 'Insert Unit of Measurement',
          TotalCountOnDb: resultDataForInsert?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Unit of Measurement Symbol',
          ResultOnDb: [],
          MethodOnDb: 'Insert Unit of Measurement',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Unit of Measurement Name',
        ResultOnDb: [],
        MethodOnDb: 'Insert Unit of Measurement',
        TotalCountOnDb: 0,
      }
    }
  },

  // updateUnit: async (dataItem: any) => {
  //   const sql = await UnitOfMeasurementSQL.updateUnit(dataItem)
  //   const resultData = await MySQLExecute.execute(sql)
  //   return resultData
  // },
  updateUnit: async (dataItem: any) => {
    const sql = await UnitOfMeasurementSQL.getUnitOfMeasurementNameByUnitOfMeasurementName(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0 || (resultData.length !== 0 && resultData[0].UNIT_OF_MEASUREMENT_ID === dataItem.UNIT_OF_MEASUREMENT_ID)) {
      const sqlUnitSymbol = await UnitOfMeasurementSQL.getSymbolBySymbol(dataItem)
      const resultUnitSymbol = (await MySQLExecute.search(sqlUnitSymbol)) as RowDataPacket[]

      if (resultUnitSymbol.length === 0 || (resultUnitSymbol.length !== 0 && resultUnitSymbol[0].UNIT_OF_MEASUREMENT_ID === dataItem.UNIT_OF_MEASUREMENT_ID)) {
        const query = await UnitOfMeasurementSQL.updateUnit(dataItem)
        const resultDataForInsert = (await MySQLExecute.execute(query)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultDataForInsert,
          MethodOnDb: 'Update Unit of Measurement',
          TotalCountOnDb: 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Unit of Measurement Symbol',
          ResultOnDb: [],
          MethodOnDb: 'Update Unit of Measurement Symbol',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Unit of Measurement Name',
        ResultOnDb: [],
        MethodOnDb: 'Update Unit of Measurement',
        TotalCountOnDb: 0,
      }
    }
  },
  deleteUnit: async (dataItem: any) => {
    const sql = await UnitOfMeasurementSQL.deleteUnit(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  getByLikeUnitOfMeasurementName: async (dataItem: any) => {
    const sql = await UnitOfMeasurementSQL.getByLikeUnitOfMeasurementName(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeSymbol: async (dataItem: any) => {
    const sql = await UnitOfMeasurementSQL.getByLikeSymbol(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
