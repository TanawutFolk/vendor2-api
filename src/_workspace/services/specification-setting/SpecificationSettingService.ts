import { MySQLExecute } from '@businessData/dbExecute'
import { ProductTypeNewSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductType_NewSQL'
import { ProductTypeProgressWorkingSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeProgressWorkingSQL'
import { ProductSpecificationDocumentSettingSQL } from '@src/_workspace/sql/product-specification-document-setting/ProductSpecificationDocumentSettingSQL'
import { RowDataPacket } from 'mysql2'
import { duplicateData, saveDataSuccess } from '../../../utils/MessageReturn'
import { ProductTypeProductSpecSQL } from '../../sql/product-group/product-type/product-type/ProductTypeProductSpecSQL'
// import { now } from 'moment'

export const SpecificationSettingService = {
  search: async (dataItem: any) => {
    // let sqlWhere = ''

    // if (dataItem['PRODUCT_MAIN_ID'] != '') {
    //   sqlWhere += " AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'"
    // }
    // if (dataItem['CUSTOMER_ORDER_FROM_ID'] != '') {
    //   sqlWhere += " AND tb_1.CUSTOMER_ORDER_FROM_ID = 'dataItem.CUSTOMER_ORDER_FROM_ID'"
    // }
    // if (dataItem['PRODUCT_SPECIFICATION_TYPE_ID'] != '') {
    //   sqlWhere += " AND tb_1.PRODUCT_SPECIFICATION_TYPE_ID = 'dataItem.PRODUCT_SPECIFICATION_TYPE_ID'"
    // }

    const sql = await ProductSpecificationDocumentSettingSQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  getBySpecificationSettingForCopy: async () => {
    // let sql
    const sql = await ProductSpecificationDocumentSettingSQL.getBySpecificationSettingForCopy()
    const resultData = await MySQLExecute.searchList(sql)
    //console.log('888888888888888888888888888888888888888888');
    return resultData
  },
  getByLikeSpecificationSettingAndInuse: async (dataItem: any) => {
    const sql = await ProductSpecificationDocumentSettingSQL.getByLikeSpecificationSettingAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  // getByLikeCustomerOrderFromNameAndInuse: async dataItem => {
  //   const sql = await ProductSpecificationDocumentSettingSQL.getByLikeCustomerOrderFromNameAndInuse(dataItem)
  //   const resultData = await MySQLExecute.search(sql)
  //   return resultData
  // },
  // create: async dataItem => {
  //   const sql = await ProductSpecificationDocumentSettingSQL.create(dataItem)
  //   const resultData = await MySQLExecute.execute(sql)
  //   return resultData
  // },
  create: async (dataItem: any) => {
    let sqlList = []

    for (const data of dataItem.LIST_DATA) {
      // ** (1) Check Duplicate Data (all columns)
      const sqlCheckDuplicate = await ProductSpecificationDocumentSettingSQL.checkDuplicate(data)
      const checkDuplicateResultData = (await MySQLExecute.search(sqlCheckDuplicate)) as RowDataPacket[]

      if (checkDuplicateResultData[0].TOTAL_COUNT != 0) {
        return {
          Status: false,
          Message: duplicateData,
          ResultOnDb: [],
          MethodOnDb: 'Create Specification Setting',
          TotalCountOnDb: 0,
        }
      } else {
        // ** (2) Create New - Product Specification Document Setting
        sqlList.push(await ProductSpecificationDocumentSettingSQL.generateProductSpecificationDocumentSettingId_Variable())
        sqlList.push(await ProductSpecificationDocumentSettingSQL.create(data))
      }

      // ** (3) Check exist by Product Specification Document Setting Name, Product Part Number, Inuse

      const sqlGetByProductSpecificationDocumentSettingNameAndProductPartNumberAndInuse =
        await ProductSpecificationDocumentSettingSQL.getByProductSpecificationDocumentSettingNameAndProductPartNumberAndInuse(data)

      const resultGetByProductSpecificationDocumentSettingNameAndProductPartNumberAndInuse = (await MySQLExecute.search(
        sqlGetByProductSpecificationDocumentSettingNameAndProductPartNumberAndInuse
      )) as RowDataPacket[]

      if (resultGetByProductSpecificationDocumentSettingNameAndProductPartNumberAndInuse[0].TOTAL_COUNT === 0) {
        // ** (4) Create New - Product Type

        // Product Type
        sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
        sqlList.push(await ProductTypeNewSQL.createByProductTypeId_Variable(data))

        // Product Type - Product Specification Document Setting
        sqlList.push(await ProductTypeProductSpecSQL.createByProductTypeId_VariableAndProductSpecificationDocumentId_Variable(data))

        // Product Type - Progress Working
        sqlList.push(await ProductTypeProgressWorkingSQL.createByProductTypeId_Variable(data))

        // // Product Type - Phototype From History
        // sqlList.push(await ProductTypePhototypeFromHistorySQL.createByProductTypeId_Variable(data))
      }
    }

    // console.log(sqlList.join('\n'))

    await MySQLExecute.executeList(sqlList)

    return {
      Status: true,
      Message: saveDataSuccess,
      ResultOnDb: [],
      MethodOnDb: 'Create Specification Setting',
      TotalCountOnDb: 0,
    }
  },
  update: async (dataItem: any) => {
    const sql = await ProductSpecificationDocumentSettingSQL.update(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  delete: async (dataItem: any) => {
    const sql = await ProductSpecificationDocumentSettingSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
