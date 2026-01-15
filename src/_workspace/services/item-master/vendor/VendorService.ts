import { MySQLExecute } from '@businessData/dbExecute'
import { VendorSQL } from '@src/_workspace/sql/item-master/vendor/VendorSQL'
import { RowDataPacket } from 'mysql2'

export const VendorService = {
  getItemImportTypeByItemId: async (dataItem: any) => {
    const sql = await VendorSQL.getItemImportTypeByItemId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getItemImportType: async (dataItem: any) => {
    const sql = await VendorSQL.getItemImportType(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getVendor: async (dataItem: any) => {
    const sql = await VendorSQL.getVendor(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  searchVendor: async (dataItem: any) => {
    const sql = await VendorSQL.searchVendor(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  createVendor: async (dataItem: any) => {
    const sqlCheckDuplicate = await VendorSQL.getVendorName(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]
    // console.log(resultCheckDuplicate.length)

    if (resultCheckDuplicate.length === 0) {
      const sqlCheckDuplicateAlphabet = await VendorSQL.getVendorAlphabet(dataItem)
      const resultCheckDuplicateAlphabet = (await MySQLExecute.search(sqlCheckDuplicateAlphabet)) as RowDataPacket[]

      if (resultCheckDuplicateAlphabet.length === 0) {
        const sqlInsert = await VendorSQL.createVendor(dataItem)
        const resultInsertData = (await MySQLExecute.execute(sqlInsert)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultInsertData,
          MethodOnDb: 'Insert Vendor Success',
          TotalCountOnDb: resultInsertData.length ?? 0,
        }
      }

      return {
        Status: false,
        Message: 'Duplicate Vendor Alphabet',
        ResultOnDb: [],
        MethodOnDb: 'Insert Vendor Failed',
        TotalCountOnDb: 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Vendor Name',
      ResultOnDb: [],
      MethodOnDb: 'Insert Vendor Failed',
      TotalCountOnDb: 0,
    }
  },

  updateVendor: async (dataItem: any) => {
    const sqlCheckDuplicate = await VendorSQL.getVendorName(dataItem)
    const resultCheckDuplicate = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

    if (resultCheckDuplicate.length === 0 || (resultCheckDuplicate.length !== 0 && resultCheckDuplicate[0].VENDOR_ID === dataItem.VENDOR_ID)) {
      const sqlCheckDuplicateCode = await VendorSQL.getVendorAlphabet(dataItem)
      const resultCheckDuplicateCode = (await MySQLExecute.search(sqlCheckDuplicateCode)) as RowDataPacket[]

      if (resultCheckDuplicateCode.length === 0 || (resultCheckDuplicateCode.length !== 0 && resultCheckDuplicateCode[0].VENDOR_ID === dataItem.VENDOR_ID)) {
        const sqlUpdate = await VendorSQL.updateVendor(dataItem)
        const resultUpdateData = (await MySQLExecute.execute(sqlUpdate)) as RowDataPacket[]

        return {
          Status: true,
          Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
          ResultOnDb: resultUpdateData,
          MethodOnDb: 'Update Vendor Success',
          TotalCountOnDb: resultUpdateData.length ?? 0,
        }
      }

      return {
        Status: false,
        Message: 'Duplicate Vendor Alphabet',
        ResultOnDb: [],
        MethodOnDb: 'Update Vendor Failed',
        TotalCountOnDb: 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Vendor Name',
      ResultOnDb: [],
      MethodOnDb: 'Update Vendor Failed',
      TotalCountOnDb: 0,
    }
  },
  deleteVendor: async (dataItem: any) => {
    const sql = await VendorSQL.deleteVendor(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },

  getByLikeVendorName: async (dataItem: any) => {
    const sql = await VendorSQL.getByLikeVendorName(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getByLikeVendorAlphabetAndInuse: async (dataItem: any) => {
    const sql = await VendorSQL.getByLikeVendorAlphabetAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeVendorNameAndImportType: async (dataItem: any) => {
    const sql = await VendorSQL.getByLikeVendorNameAndImportType(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
