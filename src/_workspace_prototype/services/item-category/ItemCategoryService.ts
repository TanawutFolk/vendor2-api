import { MySQLExecute } from '@businessData/dbExecute'
import { ItemCategorySQL } from '@src/_workspace/sql/item-category/ItemCategorySQL'
import { RowDataPacket } from 'mysql2'

export const ItemCategoryService = {
  getItemCategory: async (dataItem: any) => {
    const sql = await ItemCategorySQL.getItemCategory(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  searchItemCategory: async (dataItem: any) => {
    const sql = await ItemCategorySQL.searchItemCategory(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  createItemCategory: async (dataItem: any) => {
    const sqlCheckDuplicateName = await ItemCategorySQL.getItemCategoryNameAndInuse(dataItem)
    const resultCheckDuplicateName = (await MySQLExecute.search(sqlCheckDuplicateName)) as RowDataPacket[]

    if (resultCheckDuplicateName.length === 0) {
      const sqlCheckDuplicateCode = await ItemCategorySQL.getItemCategoryAlphabetAndInuse(dataItem)
      const resultCheckDuplicateCode = (await MySQLExecute.search(sqlCheckDuplicateCode)) as RowDataPacket[]

      if (resultCheckDuplicateCode.length === 0) {
        const sqlCheckDuplicateType = await ItemCategorySQL.getItemCategoryShortNameAndInuse(dataItem)
        const resultCheckDuplicateType = (await MySQLExecute.search(sqlCheckDuplicateType)) as RowDataPacket[]

        if (resultCheckDuplicateType.length === 0) {
          const sqlInsert = await ItemCategorySQL.createItemCategory(dataItem)
          const resultInsertData = (await MySQLExecute.execute(sqlInsert)) as RowDataPacket[]

          return {
            Status: true,
            Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
            ResultOnDb: resultInsertData,
            MethodOnDb: 'Insert Item Category Success',
            TotalCountOnDb: resultInsertData.length ?? 0,
          }
        }

        return {
          Status: false,
          Message: 'Duplicate Item Category Short Name',
          ResultOnDb: [],
          MethodOnDb: 'Insert Item Category Failed',
          TotalCountOnDb: 0,
        }
      }

      return {
        Status: false,
        Message: 'Duplicate Item Category Alphabet',
        ResultOnDb: [],
        MethodOnDb: 'Insert Item Category Failed',
        TotalCountOnDb: 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Item Category Name',
      ResultOnDb: [],
      MethodOnDb: 'Insert Item Category Failed',
      TotalCountOnDb: 0,
    }
  },

  updateItemCategory: async (dataItem: any) => {
    const sqlCheckDuplicateName = await ItemCategorySQL.getItemCategoryNameAndInuse(dataItem)
    const resultCheckDuplicateName = (await MySQLExecute.search(sqlCheckDuplicateName)) as RowDataPacket[]

    if (resultCheckDuplicateName.length === 0 || (resultCheckDuplicateName.length !== 0 && resultCheckDuplicateName[0].ITEM_CATEGORY_ID === dataItem.ITEM_CATEGORY_ID)) {
      const sqlCheckDuplicateCode = await ItemCategorySQL.getItemCategoryAlphabetAndInuse(dataItem)
      const resultCheckDuplicateCode = (await MySQLExecute.search(sqlCheckDuplicateCode)) as RowDataPacket[]

      if (resultCheckDuplicateCode.length === 0 || (resultCheckDuplicateCode.length !== 0 && resultCheckDuplicateCode[0].ITEM_CATEGORY_ID === dataItem.ITEM_CATEGORY_ID)) {
        const sqlCheckDuplicateType = await ItemCategorySQL.getItemCategoryShortNameAndInuse(dataItem)
        const resultCheckDuplicateType = (await MySQLExecute.search(sqlCheckDuplicateType)) as RowDataPacket[]

        if (resultCheckDuplicateType.length === 0 || (resultCheckDuplicateType.length !== 0 && resultCheckDuplicateType[0].ITEM_CATEGORY_ID === dataItem.ITEM_CATEGORY_ID)) {
          const sqlUpdate = await ItemCategorySQL.updateItemCategory(dataItem)
          const resultUpdateData = (await MySQLExecute.execute(sqlUpdate)) as RowDataPacket[]

          return {
            Status: true,
            Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
            ResultOnDb: resultUpdateData,
            MethodOnDb: 'Update Item Category Success',
            TotalCountOnDb: resultUpdateData.length ?? 0,
          }
        }

        return {
          Status: false,
          Message: 'Duplicate Item Category Short Name',
          ResultOnDb: [],
          MethodOnDb: 'Update Item Category Failed',
          TotalCountOnDb: 0,
        }
      }

      return {
        Status: false,
        Message: 'Duplicate Item Category Alphabet',
        ResultOnDb: [],
        MethodOnDb: 'Update Item Category Failed',
        TotalCountOnDb: 0,
      }
    }

    return {
      Status: false,
      Message: 'Duplicate Item Category Name',
      ResultOnDb: [],
      MethodOnDb: 'Update Item Category Failed',
      TotalCountOnDb: 0,
    }
  },

  deleteItemCategory: async (dataItem: any) => {
    const sql = await ItemCategorySQL.deleteItemCategory(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },

  getByLikeItemCategoryNameAndInuse: async (dataItem: any) => {
    const sql = await ItemCategorySQL.getByLikeItemCategoryNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getForBomByLikeItemCategoryNameAndInuse: async (dataItem: any) => {
    const sql = await ItemCategorySQL.getForBomByLikeItemCategoryNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse: async (dataItem: any) => {
    const sql = await ItemCategorySQL.getByLikeItemCategoryNameAndPurchaseModuleIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse: async (dataItem: any) => {
    const sql = await ItemCategorySQL.getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse: async (dataItem: any) => {
    const sql = await ItemCategorySQL.getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getAllByInuse: async (dataItem: any) => {
    const sql = await ItemCategorySQL.getAllByInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
