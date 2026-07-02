import { MySQLExecute } from '@businessData/dbExecute'
import { StandardCostExportSQL } from '@sql/sct/SctExportSQL'
import { RowDataPacket } from 'mysql2'

export const StandardCostExportService = {
  search: async (dataItem: any) => {
    let sqlList = []

    for (const data of dataItem.LIST_SCT_ID) {
      // console.log(data.SCT_ID)
      const sql = await StandardCostExportSQL.search(data)
      sqlList.push(sql)
    }

    const resultData = await MySQLExecute.searchList(sqlList)

    return resultData
  },
  getSubByProductTypeId: async (dataItem: any) => {
    const sql = await StandardCostExportSQL.getSubByProductTypeId(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },
  // searchByProductTypeId: async (dataItem: any) => {
  //   let sqlList = []

  //   for (const data of dataItem.LIST_PRODUCT_TYPE_ID) {
  //     const sql = await StandardCostExportSQL.searchByProductTypeId(data)
  //     sqlList.push(sql)
  //   }

  //   const resultData = await MySQLExecute.searchList(sqlList)

  //   return resultData
  // },
  getSctData: async (dataItem: any) => {
    let sql = await StandardCostExportSQL.getSctData(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  // getSctDataByProductTypeId: async (dataItem: any) => {
  //   let sql = await StandardCostExportSQL.getSctDataByProductTypeId(dataItem)

  //   const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
  //   return resultData
  // },
  // getSCTPricingBySctIdAndSctCompareId: async (dataItem: any) => {
  //   const sql = await StandardCostExportSQL.getSCTPricingBySctIdAndSctCompareId(dataItem)
  //   const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
  //   return resultData
  // },
  searchByProductTypeId: async (_dataItem: any) => {
    const sql = ''
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
