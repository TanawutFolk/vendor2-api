import { ProductMainAccountDepartmentCodeSQL } from '@src/_workspace/sql/product-group/product-main/ProductMainAccountDepartmentCodeSQL'
import { ProductMainBoiSQL } from '@src/_workspace/sql/product-group/product-main/ProductMainBoiSQL'
import { ProductMainSQL } from '@src/_workspace/sql/product-group/product-main/ProductMainSQL'
import { ProductMainLocSQL } from '@src/_workspace/sql/product-group/product-main/productMainLocSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const ProductMainService = {
  search: async (dataItem: any) => {
    const sql = await ProductMainSQL.search(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  // create: async (dataItem: any) => {
  //   let sqlList = []

  //   // Check Duplicate
  //   const sqlCheckDuplicate = await ProductMainSQL.getByProductMainNameAndProductMainAlphabetAndInuse(dataItem)
  //   const checkDuplicateResultData = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

  //   if (checkDuplicateResultData.length > 0) {
  //     return {
  //       Status: false,
  //       Message: 'Duplicate Data',
  //       ResultOnDb: [],
  //       MethodOnDb: 'Create Product Main',
  //       TotalCountOnDb: 0,
  //     }
  //   } else {
  //     sqlList.push(await ProductMainSQL.generateProductMainId_Variable())
  //     sqlList.push(await ProductMainSQL.createByProductMainId_Variable(dataItem))

  //     // Account Department Code
  //     sqlList.push(await ProductMainAccountDepartmentCodeSQL.createByProductMainId_Variable(dataItem))
  //     // BOI
  //     sqlList.push(await ProductMainBoiSQL.createByProductMainId_Variable(dataItem))
  //     // Other
  //     sqlList.push(await ProductMainOtherSQL.createByProductMainId_Variable(dataItem))

  //     await MySQLExecute.executeList(sqlList)

  //     return {
  //       Status: true,
  //       Message: 'Save Data Success',
  //       ResultOnDb: [],
  //       MethodOnDb: 'Create Product Main',
  //       TotalCountOnDb: 0,
  //     }
  //   }
  // },
  create: async (dataItem: any) => {
    const sql = await ProductMainSQL.getByProductMainNameByProductMainAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      const sqlAlphabet = await ProductMainSQL.getByProductMainAlphabetByProductAlphabetAndInuse(dataItem)
      const resultDataAlphabet = (await MySQLExecute.search(sqlAlphabet)) as RowDataPacket[]

      if (resultDataAlphabet.length === 0) {
        let sqlList = []

        // Product Main
        sqlList.push(await ProductMainSQL.generateProductMainId_Variable())
        sqlList.push(await ProductMainSQL.createByProductMainId_Variable(dataItem))

        // BOI
        if (dataItem.IS_BOI !== '') {
          sqlList.push(await ProductMainBoiSQL.createByProductMainId_Variable(dataItem))
        }

        // Account Department Code
        if (dataItem.ACCOUNT_DEPARTMENT_CODE_ID !== '') {
          sqlList.push(await ProductMainAccountDepartmentCodeSQL.createByProductMainId_Variable(dataItem))
        }

        // Other
        // sqlList.push(await ProductMainOtherSQL.createByProductMainId_Variable(dataItem))

        // Loc
        if (dataItem.LOC.length !== 0) {
          for (const loc of dataItem.LOC) {
            const locItem = {
              LOC_ID: loc.LOC_ID,
              CREATE_BY: dataItem.CREATE_BY,
              UPDATE_BY: dataItem.UPDATE_BY,
              DESCRIPTION: dataItem.DESCRIPTION,
            }
            sqlList.push(await ProductMainLocSQL.createByProductMainId_Variable(locItem))
          }
        }

        // Execute Insert
        const resultDataForInsert = await MySQLExecute.executeList(sqlList)

        return {
          Status: true,
          Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
          ResultOnDb: resultDataForInsert,
          MethodOnDb: 'Insert Product Main',
          TotalCountOnDb: resultDataForInsert?.length ?? 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Product Main Alphabet',
          ResultOnDb: [],
          MethodOnDb: 'Insert Product Main Alphabet',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Product Main Name',
        ResultOnDb: [],
        MethodOnDb: 'Insert Product Main Name',
        TotalCountOnDb: 0,
      }
    }
  },

  update: async (dataItem: any) => {
    const sql = await ProductMainSQL.getByProductMainNameByProductMainAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0 || (resultData.length !== 0 && resultData[0].PRODUCT_MAIN_ID === dataItem.PRODUCT_MAIN_ID)) {
      const sqlAlphabet = await ProductMainSQL.getByProductMainAlphabetByProductAlphabetAndInuse(dataItem)
      const resultDataAlphabet = (await MySQLExecute.search(sqlAlphabet)) as RowDataPacket[]

      if (resultDataAlphabet.length === 0 || (resultDataAlphabet.length !== 0 && resultDataAlphabet[0].PRODUCT_MAIN_ID === dataItem.PRODUCT_MAIN_ID)) {
        let sqlList = []

        // Reset Inuse
        // sqlList.push(await ProductMainAccountDepartmentCodeSQL.updateInuseByProductMainId(dataItem))
        // sqlList.push(await ProductMainBoiSQL.updateInuseByProductMainId(dataItem))
        // sqlList.push(await ProductMainOtherSQL.updateInuseByProductMainId(dataItem))

        // Account Department Code
        sqlList.push(await ProductMainAccountDepartmentCodeSQL.deleteByProductMainId(dataItem))

        if (dataItem.ACCOUNT_DEPARTMENT_CODE_ID !== '') {
          sqlList.push(await ProductMainAccountDepartmentCodeSQL.createByProductMainId_VariableByProductMainId(dataItem))
        }

        // BOI
        sqlList.push(await ProductMainBoiSQL.deleteByProductMainId(dataItem))
        if (dataItem.IS_BOI !== '') {
          sqlList.push(await ProductMainBoiSQL.createProductMainBoiByProductMainId(dataItem))
        }

        // Other
        // sqlList.push(await ProductMainOtherSQL.createProductMainOtherByProductMainId(dataItem))

        // Product Main
        sqlList.push(await ProductMainSQL.updateUpdateByAndUpdateDate(dataItem))

        // Loc
        sqlList.push(await ProductMainLocSQL.updateLocDeleteAll(dataItem))

        if (dataItem.LOC.length !== 0) {
          for (const loc of dataItem.LOC) {
            const locItem = {
              LOC_ID: loc.LOC_ID,
              CREATE_BY: dataItem.CREATE_BY,
              UPDATE_BY: dataItem.UPDATE_BY,
              DESCRIPTION: dataItem.DESCRIPTION,
              PRODUCT_MAIN_ID: dataItem.PRODUCT_MAIN_ID,
            }
            sqlList.push(await ProductMainLocSQL.updateByProductMainId_Variable(locItem))
          }
        }

        // Execute Update
        await MySQLExecute.executeList(sqlList)

        return {
          Status: true,
          Message: 'Save Data Success',
          ResultOnDb: [],
          MethodOnDb: 'Update Product Main',
          TotalCountOnDb: 0,
        }
      } else {
        return {
          Status: false,
          Message: 'Duplicate Product Main Alphabet',
          ResultOnDb: [],
          MethodOnDb: 'Update Product Main Alphabet',
          TotalCountOnDb: 0,
        }
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Product Main Name',
        ResultOnDb: [],
        MethodOnDb: 'Update Product Main Name',
        TotalCountOnDb: 0,
      }
    }
  },
  delete: async (dataItem: any) => {
    let sqlList = []

    sqlList.push(await ProductMainSQL.delete(dataItem))
    await MySQLExecute.executeList(sqlList)

    return {
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: [],
      MethodOnDb: 'Delete Product Main',
      TotalCountOnDb: 0,
    }
  },
  getProductMainByLikeProductMainNameAndInuse: async (dataItem: any) => {
    const sql = await ProductMainSQL.getProductMainByLikeProductMainNameAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByLikeProductMainNameAndInuse: async (dataItem: any) => {
    const sql = await ProductMainSQL.getByLikeProductMainNameAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem: any) => {
    const sql = await ProductMainSQL.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
