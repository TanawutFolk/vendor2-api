import { MySQLExecute } from '@businessData/dbExecute'
import { ItemGroupSQL } from '@src/_workspace/sql/item-group/ItemGroupSQL'
import { ItemSQL } from '@src/_workspace/sql/item-master/item/ItemSQL'
import { ItemManufacturingSQL } from '@src/_workspace/sql/item/ItemManufacturingSQL'
import { ItemProductDetailSQL } from '@src/_workspace/sql/item/ItemProductDetailSQL'
import { ItemProductMainSQL } from '@src/_workspace/sql/item/itemProductMainSQL'
import { ItemStockSQL } from '@src/_workspace/sql/item/itemStockSQL'
import { ProductItemSQL } from '@src/_workspace/sql/product-group/product-type/product-type/product-item/ProductItemSQL'
import { ProductTypeNewSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductType_NewSQL'
import { ProductTypeAccountDepartmentCodeSQL } from '@src/_workspace/sql/product-group/product-type/product-type/productTypeAccountDepartmentCodeSQL'
import { ProductTypeBomNewSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeBomNewSQL'
import { ProductTypeCustomerInvoiceTo } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeCustomerInvoiceToSQL'
import { ProductTypeDetailSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeDetailSQL'
import { ProductTypeFlowSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeFlowSQL'
import { ProductTypeItemCategorySQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeItemCategorySQL'
import { ProductTypeProductSpecSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeProductSpecSQL'
import { ProductTypeProgressWorkingSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeProgressWorkingSQL'
import { ProductTypeStatusWorkingSQL } from '@src/_workspace/sql/product-group/product-type/product-type/ProductTypeStatusWorkingSQL'
import { ProductTypeBomSQL } from '@src/_workspace/sql/product-group/product-type/ProductTypeBomSQL'
import { ProductSpecificationDocumentSettingSQL } from '@src/_workspace/sql/product-specification-document-setting/ProductSpecificationDocumentSettingSQL'
import { duplicateData } from '@src/utils/MessageReturn'
import { RowDataPacket } from 'mysql2'
// import sqlWhere from '@src/helpers/sqlWhere'

export const ProductTypeNewService = {
  searchProductTypeList: async (dataItem: any) => {
    // console.log('dataItem', dataItem)

    let sqlWhere = ''

    if (dataItem.PRODUCT_CATEGORY_ID) {
      sqlWhere += " AND tb_5.PRODUCT_CATEGORY_ID =  'dataItem.PRODUCT_CATEGORY_ID'"
    }
    if (dataItem.PRODUCT_MAIN_ID) {
      sqlWhere += "AND tb_4.PRODUCT_MAIN_ID =  'dataItem.PRODUCT_MAIN_ID'"
    }
    if (dataItem.PRODUCT_SUB_ID) {
      sqlWhere += "AND tb_3.PRODUCT_SUB_ID =  'dataItem.PRODUCT_SUB_ID'"
    }
    if (dataItem.PRODUCT_TYPE_ID) {
      sqlWhere += " AND tb_1.PRODUCT_TYPE_ID =  'dataItem.PRODUCT_TYPE_ID'"
    }
    if (dataItem.PRODUCT_TYPE_NAME) {
      sqlWhere += "AND tb_1.PRODUCT_TYPE_NAME LIKE  '%dataItem.PRODUCT_TYPE_NAME%'"
    }

    const sql = await ProductTypeNewSQL.searchProductTypeList(dataItem, sqlWhere)
    const resultData = await MySQLExecute.search(sql)

    // console.log(sql.join('/n'))

    return resultData
  },

  search: async (dataItem: any) => {
    // // console.log('dataItem', dataItem)

    // // let resultData = []
    // let sqlWhere = ''

    // if (dataItem.PRODUCT_TYPE_NAME != '') {
    //   sqlWhere += " AND tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'"
    // }
    // if (dataItem.PRODUCT_TYPE_CODE != '') {
    //   sqlWhere += " AND tb_1.PRODUCT_TYPE_CODE LIKE '%dataItem.PRODUCT_TYPE_CODE%'"
    // }

    // if (dataItem.PRODUCT_TYPE_STATUS_WORKING_ID != '') {
    //   sqlWhere += " AND tb_27.PRODUCT_TYPE_STATUS_WORKING_ID = 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'"
    // }

    // if (dataItem.SUFFIX_FOR_PART_NUMBER != '') {
    //   sqlWhere += " AND tb_6.SUFFIX_FOR_PART_NUMBER LIKE '%dataItem.SUFFIX_FOR_PART_NUMBER%'"
    // }

    // if (dataItem.PRODUCT_ITEM_NAME != '') {
    //   sqlWhere += " AND tb_32.PRODUCT_ITEM_NAME LIKE '%dataItem.PRODUCT_ITEM_NAME%'"
    // }

    // if (dataItem.PRODUCT_ITEM_CODE != '') {
    //   sqlWhere += " AND tb_32.PRODUCT_ITEM_CODE LIKE '%dataItem.PRODUCT_ITEM_CODE%'"
    // }

    // if (dataItem.FFT_PART_NUMBER != '') {
    //   sqlWhere += " AND tb_6.FFT_PART_NUMBER LIKE '%dataItem.FFT_PART_NUMBER%'"
    // }

    // if (dataItem.PC_NAME != '') {
    //   sqlWhere += " AND tb_6.PC_NAME LIKE '%dataItem.PC_NAME%'"
    // }

    // if (dataItem.INUSE !== '') {
    //   sqlWhere += " AND tb_1.INUSE = 'dataItem.INUSE'"
    // }

    // if (dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME != '') {
    //   sqlWhere += " AND tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME LIKE '%dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME%'"
    // }

    // if (dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER != '') {
    //   sqlWhere += " AND tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER LIKE '%dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER%'"
    // }

    // if (dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION != '') {
    //   sqlWhere += " AND tb_22.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION LIKE '%dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION%'"
    // }

    // if (dataItem.PRODUCT_PART_NUMBER != '') {
    //   sqlWhere += " AND tb_22.PRODUCT_PART_NUMBER LIKE '%dataItem.PRODUCT_PART_NUMBER%'"
    // }

    // // if (dataItem.PRODUCT_ITEM_NAME != '') {
    // //   sqlWhere +=
    // //     " AND SELECTED_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE LIKE '%dataItem.SELECTED_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE%'"
    // // }
    // // if (dataItem.PRODUCT_ITEM_NAME != '') {
    // //   sqlWhere += " AND PC_NAME LIKE '%dataItem.PC_NAME%'"
    // // }

    // // if (sqlWhere != '') {
    // //   sqlWhere = ` WHERE INUSE IS NOT NULL ${sqlWhere}`
    // // }

    // if (sqlWhere != '') {
    //   sqlWhere = ' WHERE ' + sqlWhere.substring(4)
    // }

    const sql = await ProductTypeNewSQL.search(dataItem)
    const resultData = await MySQLExecute.searchList(sql)

    // console.log(sql.join('/n'))

    return resultData
  },

  getByProductTypeForCopy: async (dataItem: any) => {
    let sql
    let sqlWhereProductTypeForCopy = ''

    sqlWhereProductTypeForCopy =
      'WHERE tb_27.PRODUCT_TYPE_STATUS_WORKING_ID LIKE %dataItem.PRODUCT_TYPE_STATUS_WORKING_ID% AND tb_1.INUSE LIKE 1 AND tb_1.PRODUCT_TYPE_NAME LIKE %dataItem.PRODUCT_TYPE_NAME%'
    sql = await ProductTypeNewSQL.getByProductTypeForCopy(dataItem, sqlWhereProductTypeForCopy)
    const resultData = await MySQLExecute.searchList(sql)
    // console.log(sql.join('/n'))

    return resultData
  },

  getByLikeProductTypeNameAndProductSubIdAndInuse: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductTypeNameAndProductSubIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  // getByProductTypeForCopy: async () => {
  //   let sql
  //   sql = await ProductTypeNewSQL.getByProductTypeForCopy()
  //   const resultData = await MySQLExecute.searchList(sql)
  //   // console.log(sql.join('/n'))

  //   return resultData
  // },
  getByProductTypeStatusWorkingAndInuse: async () => {
    // let resultData = []
    // let sqlWhere = ''
    let sql
    // // sqlWhere += "  tb_27.PRODUCT_TYPE_STATUS_WORKING_ID = 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'"

    // // sqlWhere += " AND tb_1.INUSE  = 'dataItem.INUSE'"
    // sqlWhere += " AND tb_1.PRODUCT_TYPE_STATUS_WORKING_ID = 'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'"

    // sqlWhere += " AND tb_1.INUSE  = 'dataItem.INUSE'"

    // if (dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'] != '') {
    //   sqlWhere +=
    //     " AND tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION  LIKE '%dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION%'"
    // }
    // if (dataItem['PRODUCT_PART_NUMBER'] != '') {
    //   sqlWhere += " AND tb_1.PRODUCT_PART_NUMBER  LIKE '%dataItem.PRODUCT_PART_NUMBER%'"
    // }
    // if (dataItem['PRODUCT_PART_NUMBER'] != '') {
    //   sqlWhere += " AND tb_1.PRODUCT_PART_NUMBER  LIKE '%dataItem.PRODUCT_PART_NUMBER%'"
    // }
    // if (dataItem['PRODUCT_PART_NUMBER'] != '') {
    //   sqlWhere += " AND tb_1.PRODUCT_PART_NUMBER  LIKE '%dataItem.PRODUCT_PART_NUMBER%'"
    // }

    sql = await ProductTypeNewSQL.getByProductTypeStatusWorkingAndInuse()
    const resultData = await MySQLExecute.searchList(sql)
    // console.log(sql.join('/n'))
    return resultData
  },
  // getByProductTypeStatusWorkingAndInuse: async () => {
  //   let sql
  //   sql = await ProductTypeNewSQL.getByProductTypeStatusWorkingAndInuse()
  //   const resultData = await MySQLExecute.searchList(sql)
  //   //console.log('resultDataType', resultData)
  //   return resultData
  // },
  getByLikeProductCategoryNameAndInuse: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductCategoryNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getByLikeProductTypeStatusWorkingNameAndInuse: async (dataItem: any) => {
    const sql = await ProductTypeStatusWorkingSQL.getByLikeProductTypeStatusWorkingNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  create: async (dataItem: any) => {
    let sqlList: any = []
    let resultData

    for (const data of dataItem.LIST_DATA) {
      // Ausada 2024-Oct-12
      // ** (1) Check Materials of Product Type Code
      if (
        data.ITEM_CATEGORY_ALPHABET !== '' &&
        data.ACCOUNT_DEPARTMENT_CODE_ID !== '' &&
        data.productMainOrSubAlphabet !== '' &&
        data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE !== ''
      ) {
        let sqlWhereProductTypeCode = ''

        // ** Check Product Type When Have Materials
        const existingProductTypeID = await ProductTypeNewSQL.getByProductType_condition(data)
        const checkDuplicateResultData = (await MySQLExecute.search(existingProductTypeID)) as RowDataPacket[]
        if (checkDuplicateResultData?.length === 0) {
          // console.log('Have Materials & Product Type = 0')
          // console.log('Have PRODUCT_TYPE_ID', data.PRODUCT_TYPE_ID)

          // ** Product Type Code not Duplicated & PRODUCT_TYPE_ID === ''
          if (!dataItem.PRODUCT_TYPE_ID) {
            // console.log('Have Materials & Product Type = 0 & PRODUCT_TYPE_ID === "')
            sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
            sqlList.push(await ProductTypeNewSQL.createByProductTypeId_VariableAndProductTypeCode_Variable(data))

            //**  Create New PRODUCT TYPE DETAIL Or Update
            if (data.IS_PRODUCT_FOR_REPAIR !== '') {
              if (data.PRODUCT_TYPE_DETAIL_ID === '') {
                // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
                sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailId())
                sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailForNewType(data))
              }
            } else if (data.PRODUCT_TYPE_DETAIL_ID === '') {
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailId())
              sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailWhenNotRepairForNewType(data))
            }

            //**  Create New PRODUCT TYPE ITEM CATEGORY
            if (data.PRODUCT_TYPE_ITEM_CATEGORY_ID === '') {
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryId())
              sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryForNewType(data))
            }

            //**  Create New PRODUCT TYPE FLOW
            if (data.PRODUCT_TYPE_FLOW_ID === '') {
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowId())
              sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowForNewType(data))
            }

            //**  Create New PRODUCT TYPE BOM
            if (data.PRODUCT_TYPE_BOM_ID === '') {
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomId())
              sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomForNewType(data))
            }

            //**  Create New PRODUCT TYPE CUSTOMER INVOICE TO
            if (data.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID === '') {
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToId())
              sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToForNewType(data))
            }

            //**  Create New PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING
            if (data.PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID === '') {
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              // sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToId())
              sqlList.push(await ProductTypeProductSpecSQL.createByProductTypeId_VariableAndProductSpecificationDocumentId_ForProductType(data))
            }

            //** Create New PRODUCT ITEM CODE
            if (data.PRODUCT_ITEM_ID === '') {
              // console.log('1111111111111111111')
              sqlList.push(await ProductItemSQL.createProductItemId())
              sqlList.push(await ProductItemSQL.createProductTypeCodeForItemNewType())
              sqlList.push(await ProductItemSQL.createProductItemForNewType(data))
              // data.PRODUCT_TYPE_ID = resultCheckExistProductType[0].PRODUCT_TYPE_ID
              // data.PRODUCT_TYPE_CODE = resultCheckExistProductType[0].PRODUCT_TYPE_CODE
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              // sqlList.push(await ProductItemSQL.createByProductTypeId_DuplicateProductType(data))
            }

            //** Create New PRODUCT TYPE BOI
            if (data.PRODUCT_TYPE_BOI_ID === '') {
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProjectId())
              sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProjectForNewItem(data))
            }

            //** UPDATE Status Working
            if (data.PRODUCT_TYPE_PROGRESS_WORKING_ID === '') {
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorkingId())
              sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorkingForNewType(data))
            }
            // ** Finished Add and Update When Product Item Not Duplicated and Product Type Id = ''
          } else {
            // console.log('Have Materials & Product Type = 0 & PRODUCT_TYPE_ID !== " ')
            // ** Product Type Code not Duplicated & PRODUCT_TYPE_ID !== ''
            // Not Duplicated Product Item And Have Product Type Id
            if (data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE !== '') {
              if (data.PRODUCT_SUB_ID !== '' && data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE === '0') {
                // sqlList.push(await ProductTypeNewSQL.createProductTypeId())
                sqlWhereProductTypeCode = 'WHERE PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID'
                sqlList.push(await ProductTypeNewSQL.updateProductType(data, sqlWhereProductTypeCode))
                // sqlList.push(await ProductTypeNewSQL.createProductTypeHistory(data, sqlWhereProductTypeCode))
              } else if (data.PRODUCT_MAIN_ID !== '' && data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE === '1') {
                // sqlList.push(await ProductTypeNewSQL.createProductTypeId())
                sqlWhereProductTypeCode = 'WHERE PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID'
                sqlList.push(await ProductTypeNewSQL.updateProductType(data, sqlWhereProductTypeCode))
                // sqlList.push(await ProductTypeNewSQL.createProductTypeHistory(data, sqlWhereProductTypeCode))
              } else if (data.PRODUCT_SUB_ID !== '') {
                sqlList.push(await ProductTypeNewSQL.updateProductTypeByProductSub(data))
              }
            } else if (data.PRODUCT_SUB_ID !== '') {
              sqlList.push(await ProductTypeNewSQL.updateProductTypeWhenNotGen(data))
            }

            // ** Create Product Item (16 digits) When Have Product Type Id
            if (data.PRODUCT_ITEM_ID === '') {
              sqlList.push(await ProductItemSQL.createProductItemId())
              sqlList.push(await ProductItemSQL.createProductTypeCodeForItem(data))
              sqlList.push(await ProductItemSQL.createProductItem(data))
            } else {
              sqlList.push(await ProductItemSQL.createProductTypeCodeForItem(data))
              sqlList.push(await ProductItemSQL.updateProductItem(data))
            }

            // ** Create New PRODUCT TYPE DETAIL Or Update When Have Product Type Id
            if (data.PRODUCT_TYPE_DETAIL_ID === '') {
              sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailId())
              sqlList.push(await ProductTypeDetailSQL.createProductTypeDetail(data))
            } else {
              sqlList.push(await ProductTypeDetailSQL.updateProductTypeDetail(data))
            }

            // ** Update PRODUCT MAIN When Have Product Type Id
            if (data.PRODUCT_MAIN_ID !== '') {
              sqlList.push(await ProductSpecificationDocumentSettingSQL.updateProductMainForSpecification(data))
            }

            // ** Create New PRODUCT TYPE ITEM CATEGORY Or Update When Have Product Type Id
            if (data.PRODUCT_TYPE_ITEM_CATEGORY_ID === '') {
              sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryId())
              sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategory(data))
            } else {
              sqlList.push(await ProductTypeItemCategorySQL.updateProductTypeItemCategory(data))
            }

            // ** Create New PRODUCT TYPE FLOW Or Update When Have Product Type Id
            if (data.PRODUCT_TYPE_FLOW_ID === '') {
              sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowId())
              sqlList.push(await ProductTypeFlowSQL.createProductTypeFlow(data))
            } else {
              sqlList.push(await ProductTypeFlowSQL.updateProductTypeFlow(data))
            }

            // ** Create New PRODUCT TYPE FLOW Or Update When Have Product Type Id
            if (data.PRODUCT_TYPE_FLOW_ID === '') {
              sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowId())
              sqlList.push(await ProductTypeFlowSQL.createProductTypeFlow(data))
            } else {
              sqlList.push(await ProductTypeFlowSQL.updateProductTypeFlow(data))
            }

            // ** Create New PRODUCT TYPE BOM Or Update When Have Product Type Id
            if (data.PRODUCT_TYPE_BOM_ID === '') {
              sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomId())
              sqlList.push(await ProductTypeBomNewSQL.createProductTypeBom(data))
            } else {
              sqlList.push(await ProductTypeBomNewSQL.updateProductTypeBom(data))
            }

            // ** Create New PRODUCT TYPE CUSTOMER INVOICE TO Or Update When Have Product Type Id
            if (data.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID === '') {
              sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToId())
              sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceTo(data))
            } else {
              sqlList.push(await ProductTypeCustomerInvoiceTo.updateProductTypeCustomerInvoiceTo(data))
            }
            // ** Create New PRODUCT TYPE CODE Or Update When Have Product Type Id
            if (data.PRODUCT_TYPE_BOI_ID === '') {
              sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProjectId())
              sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProject(data))
            } else {
              sqlList.push(await ProductTypeNewSQL.updateProductTypeBoiProject(data))
            }

            //**(2.10) UPDATE Status Working
            if (data.PRODUCT_TYPE_PROGRESS_WORKING_ID !== '') {
              sqlList.push(await ProductTypeStatusWorkingSQL.updateProductTypeStatusWorking(data))
            } else {
              sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorkingId())
              sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorking(data))
            }
            // ** Finished Add and Update When Product Type Code Not Duplicated and Have Product Type Id
          }
        } else {
          // console.log('Have Materials & DuplicatedProduct Type Code')
          // ** Have Materials but Duplicated Product Type Code ( Delete Product Type Id MySelf )
          sqlList.push(await ProductTypeNewSQL.delete(data))

          const sqlCheckExistProductItemCode = await ProductItemSQL.getByProductItem_condition(data)
          const resultCheckExistProductItem = (await MySQLExecute.search(sqlCheckExistProductItemCode)) as RowDataPacket[]
          // data.PRODUCT_TYPE_ID = resultCheckExistProductItem[0].PRODUCT_TYPE_ID
          // data.PRODUCT_TYPE_CODE = resultCheckExistProductItem[0].PRODUCT_TYPE_CODE

          // const sqlCreteProductItemFromAdd = await ProductItemSQL.CheckProductItem_condition(data)
          // // sqlList.push(await ProductItemSQL.createProductTypeCodeForItemNewType(data))
          // const sqlCheckExistProductItemFromAdd = await ProductTypeNewSQL.getByProductType_condition(data)
          // const resultCheckExistProductItemFromAdd = await MySQLExecute.search(sqlCheckExistProductItemFromAdd)

          data.PRODUCT_TYPE_ID = resultCheckExistProductItem[0].PRODUCT_TYPE_ID
          data.PRODUCT_TYPE_CODE = resultCheckExistProductItem[0].PRODUCT_TYPE_CODE
          data.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = resultCheckExistProductItem[0].PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID

          // ** Check Product Item If Not Duplicated ( From Delete Product Type Id MySelf )

          if (resultCheckExistProductItem.length === 0) {
            // console.log('Have Materials & DuplicatedProduct Type & Not Duplicated Product Item')

            if (dataItem.PRODUCT_TYPE_ID === '') {
              // console.log('Have Materials & DuplicatedProduct Type & Not Duplicated Product Item & TypeId = ""')
              // sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())
              // sqlList.push(
              //   await ProductTypeNewSQL.createByProductTypeId_VariableAndProductTypeCode_VariableWithoutProductTypeCode(
              //     data
              //   )
              // )

              //**  Create New PRODUCT TYPE DETAIL Or Update ( From Delete Product Type Id MySelf )
              if (data.IS_PRODUCT_FOR_REPAIR !== '') {
                if (data.PRODUCT_TYPE_DETAIL_ID === '') {
                  sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailId())
                  sqlList.push(await ProductTypeDetailSQL.createProductTypeDetail(data))
                }
              } else if (data.PRODUCT_TYPE_DETAIL_ID === '') {
                sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailId())
                sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailWhenNotRepair(data))
              }

              //**  Create New PRODUCT TYPE ITEM CATEGORY ( From Delete Product Type Id MySelf )
              if (data.PRODUCT_TYPE_ITEM_CATEGORY_ID === '') {
                sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryId())
                sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategory(data))
              }

              //**  Create New PRODUCT TYPE FLOW ( From Delete Product Type Id MySelf )
              if (data.PRODUCT_TYPE_FLOW_ID === '') {
                sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowId())
                sqlList.push(await ProductTypeFlowSQL.createProductTypeFlow(data))
              }

              //**  Create New PRODUCT TYPE BOM ( From Delete Product Type Id MySelf )
              if (data.PRODUCT_TYPE_BOM_ID === '') {
                sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomId())
                sqlList.push(await ProductTypeBomNewSQL.createProductTypeBom(data))
              }

              //**  Create New PRODUCT TYPE CUSTOMER INVOICE TO ( From Delete Product Type Id MySelf )
              if (data.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID === '') {
                sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToId())
                sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceTo(data))
              }

              //** Create New PRODUCT ITEM CODE ( From Delete Product Type Id MySelf )
              if (data.PRODUCT_ITEM_ID === '') {
                // console.log('1111111111111111111')
                // sqlList.push(await ProductItemSQL.createProductItemId())
                // sqlList.push(await ProductItemSQL.createProductTypeCodeForItemNewType(data))
                // sqlList.push(await ProductItemSQL.createProductItemForNewType(data))
                // data.PRODUCT_TYPE_ID = resultCheckExistProductType[0].PRODUCT_TYPE_ID
                // data.PRODUCT_TYPE_CODE = resultCheckExistProductType[0].PRODUCT_TYPE_CODE
                sqlList.push(await ProductItemSQL.createByProductTypeId_DuplicateProductType(data))
              }

              //** Create New PRODUCT TYPE BOI ( From Delete Product Type Id MySelf )
              if (data.PRODUCT_TYPE_BOI_ID === '') {
                sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProjectId())
                sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProject(data))
              }

              //** UPDATE Status Working ( From Delete Product Type Id MySelf )
              if (data.PRODUCT_TYPE_PROGRESS_WORKING_ID === '') {
                sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorkingId())
                sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorking(data))
              }
              // ** Finished Add and Update When Product Item Not Duplicated and Product Type Id = ''
            } else {
              // ** Not Duplicated Product Item And Have Product Type Id
              // console.log(
              //   'Have Materials & Duplicated Product Type & Not Duplicated Product Item & Have Product Type Id'
              // )
              if (data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE !== '') {
                if (data.PRODUCT_SUB_ID !== '' && data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE === '0') {
                  // sqlList.push(await ProductTypeNewSQL.createProductTypeId())
                  sqlWhereProductTypeCode = 'WHERE PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID'
                  sqlList.push(await ProductTypeNewSQL.updateProductType(data, sqlWhereProductTypeCode))
                  // sqlList.push(await ProductTypeNewSQL.createProductTypeHistory(data, sqlWhereProductTypeCode))
                } else if (data.PRODUCT_MAIN_ID !== '' && data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE === '1') {
                  // sqlList.push(await ProductTypeNewSQL.createProductTypeId())
                  sqlWhereProductTypeCode = 'WHERE PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID'
                  sqlList.push(await ProductTypeNewSQL.updateProductType(data, sqlWhereProductTypeCode))
                  // sqlList.push(await ProductTypeNewSQL.createProductTypeHistory(data, sqlWhereProductTypeCode))
                } else if (data.PRODUCT_SUB_ID !== '') {
                  sqlList.push(await ProductTypeNewSQL.updateProductTypeByProductSub(data))
                }
              } else if (data.PRODUCT_SUB_ID !== '') {
                sqlList.push(await ProductTypeNewSQL.updateProductTypeWhenNotGen(data))
              }

              // ** Create Product Item (16 digits) When Have Product Type Id
              if (data.PRODUCT_ITEM_ID === '') {
                sqlList.push(await ProductItemSQL.createProductItemId())
                sqlList.push(await ProductItemSQL.createProductTypeCodeForItem(data))
                sqlList.push(await ProductItemSQL.createProductItem(data))
              } else {
                sqlList.push(await ProductItemSQL.createProductTypeCodeForItem(data))
                sqlList.push(await ProductItemSQL.updateProductItem(data))
              }

              // ** Update PRODUCT MAIN When Have Product Type Id
              if (data.PRODUCT_MAIN_ID !== '') {
                sqlList.push(await ProductSpecificationDocumentSettingSQL.updateProductMainForSpecification(data))
              }

              // ** Create New PRODUCT TYPE DETAIL Or Update When Have Product Type Id
              if (data.PRODUCT_TYPE_DETAIL_ID === '') {
                sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailId())
                sqlList.push(await ProductTypeDetailSQL.createProductTypeDetail(data))
              } else {
                sqlList.push(await ProductTypeDetailSQL.updateProductTypeDetail(data))
              }

              // ** Update PRODUCT MAIN When Have Product Type Id
              if (data.PRODUCT_MAIN_ID !== '') {
                sqlList.push(await ProductSpecificationDocumentSettingSQL.updateProductMainForSpecification(data))
              }

              // ** Create New PRODUCT TYPE ITEM CATEGORY Or Update When Have Product Type Id
              if (data.PRODUCT_TYPE_ITEM_CATEGORY_ID === '') {
                sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryId())
                sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategory(data))
              } else {
                sqlList.push(await ProductTypeItemCategorySQL.updateProductTypeItemCategory(data))
              }

              // ** Create New PRODUCT TYPE FLOW Or Update When Have Product Type Id
              if (data.PRODUCT_TYPE_FLOW_ID === '') {
                sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowId())
                sqlList.push(await ProductTypeFlowSQL.createProductTypeFlow(data))
              } else {
                sqlList.push(await ProductTypeFlowSQL.updateProductTypeFlow(data))
              }

              // ** Create New PRODUCT TYPE FLOW Or Update When Have Product Type Id
              if (data.PRODUCT_TYPE_FLOW_ID === '') {
                sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowId())
                sqlList.push(await ProductTypeFlowSQL.createProductTypeFlow(data))
              } else {
                sqlList.push(await ProductTypeFlowSQL.updateProductTypeFlow(data))
              }

              // ** Create New PRODUCT TYPE BOM Or Update When Have Product Type Id
              if (data.PRODUCT_TYPE_BOM_ID === '') {
                sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomId())
                sqlList.push(await ProductTypeBomNewSQL.createProductTypeBom(data))
              } else {
                sqlList.push(await ProductTypeBomNewSQL.updateProductTypeBom(data))
              }

              // ** Create New PRODUCT TYPE CUSTOMER INVOICE TO Or Update When Have Product Type Id
              if (data.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID === '') {
                sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToId())
                sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceTo(data))
              } else {
                sqlList.push(await ProductTypeCustomerInvoiceTo.updateProductTypeCustomerInvoiceTo(data))
              }
              // ** Create New PRODUCT TYPE CODE Or Update When Have Product Type Id
              if (data.PRODUCT_TYPE_BOI_ID === '') {
                sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProjectId())
                sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProject(data))
              } else {
                sqlList.push(await ProductTypeNewSQL.updateProductTypeBoiProject(data))
              }
              //**(2.10) UPDATE Status Working
              if (data.PRODUCT_TYPE_PROGRESS_WORKING_ID !== '') {
                sqlList.push(await ProductTypeStatusWorkingSQL.updateProductTypeStatusWorking(data))
              } else {
                sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorkingId())
                sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorking(data))
              }
              // ** Finished Add and Update When Product Item Not Duplicated and Have Product Type Id
            }
          } else {
            // console.log('Have Materials & Duplicated Product Type & Duplicated Product Item')
            // ** Have Material but Duplicated Product Type Code And Duplicated Product Item(From delete myself)
            return {
              Status: false,
              Message: duplicateData,
              ResultOnDb: [],
              MethodOnDb: 'Create Product Item Code',
              TotalCountOnDb: 0,
            }
          }
        }
      }

      //**  Don't have Materials of Product Type Code and PRODUCT_TYPE_ID === ''
      else if (data.PRODUCT_TYPE_ID === '') {
        // console.log('Dont Have Materials & PRODUCT_TYPE_ID === ""')
        sqlList.push(await ProductTypeNewSQL.generateProductTypeId_Variable())

        // sqlList.push(await ProductTypeNewSQL.generateProductTypeCode_Variable(data))

        sqlList.push(await ProductTypeNewSQL.createByProductTypeId_VariableAndProductTypeCode_WithOutProductTypeCode(data))

        //**(3.1)  Create New PRODUCT TYPE DETAIL Or Update
        if (data.IS_PRODUCT_FOR_REPAIR !== '') {
          if (data.PRODUCT_TYPE_DETAIL_ID === '') {
            sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailId())
            sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailForNewType(data))
          }
        } else if (data.PRODUCT_TYPE_DETAIL_ID === '') {
          sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailId())
          sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailWhenNotRepairForNewType(data))
        }

        //**(3.2) Create New PRODUCT TYPE ITEM CATEGORY
        if (data.PRODUCT_TYPE_ITEM_CATEGORY_ID === '') {
          sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryId())
          sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryForNewType(data))
        }

        //**(3.3) Create New PRODUCT TYPE FLOW
        if (data.PRODUCT_TYPE_FLOW_ID === '') {
          sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowId())
          sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowForNewType(data))
        }

        //**(3.4) Create New PRODUCT TYPE FLOW
        if (data.PRODUCT_TYPE_BOM_ID === '') {
          sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomId())
          sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomForNewType(data))
        }

        //**(3.5) Create New PRODUCT TYPE CUSTOMER INVOICE TO
        if (data.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID === '') {
          sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToId())
          sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToForNewType(data))
        }

        //** Create New PRODUCT TYPE BOI
        if (data.PRODUCT_TYPE_BOI_ID === '') {
          sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProjectId())
          sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProjectForNewItem(data))
        }

        //** UPDATE Status Working
        if (data.PRODUCT_TYPE_PROGRESS_WORKING_ID === '') {
          sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorkingId())
          sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorkingForNewType(data))
        }
      }
      //**  Don't have materials of Product Type but PRODUCT_TYPE_ID !== ''
      else {
        // console.log('Dont Have Materials & PRODUCT_TYPE_ID !== ""')
        let sqlWhereProductTypeCode = ''

        // ** Update Product Type
        if (data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE !== '') {
          if (data.PRODUCT_SUB_ID !== '' && data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE === '0') {
            // sqlList.push(await ProductTypeNewSQL.createProductTypeId())
            sqlWhereProductTypeCode = 'WHERE PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID'
            sqlList.push(await ProductTypeNewSQL.updateProductTypeWithoutProductTypeCode(data, sqlWhereProductTypeCode))
            // sqlList.push(await ProductTypeNewSQL.createProductTypeHistory(data, sqlWhereProductTypeCode))
          } else if (data.PRODUCT_MAIN_ID !== '' && data.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE === '1') {
            // sqlList.push(await ProductTypeNewSQL.createProductTypeId())
            sqlWhereProductTypeCode = 'WHERE PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID'
            sqlList.push(await ProductTypeNewSQL.updateProductTypeWithoutProductTypeCode(data, sqlWhereProductTypeCode))
            // sqlList.push(await ProductTypeNewSQL.createProductTypeHistory(data, sqlWhereProductTypeCode))
          } else if (data.PRODUCT_SUB_ID !== '') {
            sqlList.push(await ProductTypeNewSQL.updateProductTypeByProductSub(data))
          }
        } else if (data.PRODUCT_SUB_ID !== '') {
          sqlList.push(await ProductTypeNewSQL.updateProductTypeWhenNotGen(data))
        }

        // **(1) Create New PRODUCT TYPE DETAIL Or Update
        // if (data.IS_PRODUCT_FOR_REPAIR !== '') {
        if (data.PRODUCT_TYPE_DETAIL_ID === '') {
          sqlList.push(await ProductTypeDetailSQL.createProductTypeDetailId())
          sqlList.push(await ProductTypeDetailSQL.createProductTypeDetail(data))
        } else {
          sqlList.push(await ProductTypeDetailSQL.updateProductTypeDetail(data))
        }

        // **(1) Update PRODUCT MAIN
        if (data.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID !== '') {
          if (data.PRODUCT_MAIN_ID !== '') {
            sqlList.push(await ProductSpecificationDocumentSettingSQL.updateProductMainForSpecification(data))
          }
        }

        // **(1) Create New PRODUCT TYPE ITEM CATEGORY Or Update
        if (data.PRODUCT_TYPE_ITEM_CATEGORY_ID === '') {
          sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryId())
          sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategory(data))
        } else {
          sqlList.push(await ProductTypeItemCategorySQL.updateProductTypeItemCategory(data))
        }

        // **(1) Create New PRODUCT TYPE FLOW Or Update
        if (data.PRODUCT_TYPE_FLOW_ID === '') {
          sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowId())
          sqlList.push(await ProductTypeFlowSQL.createProductTypeFlow(data))
        } else {
          sqlList.push(await ProductTypeFlowSQL.updateProductTypeFlow(data))
        }

        // **(1) Create New PRODUCT TYPE BOM Or Update
        if (data.PRODUCT_TYPE_BOM_ID === '') {
          sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomId())
          sqlList.push(await ProductTypeBomNewSQL.createProductTypeBom(data))
        } else {
          sqlList.push(await ProductTypeBomNewSQL.updateProductTypeBom(data))
        }

        // **(1) Create New PRODUCT TYPE CUSTOMER INVOICE TO Or Update
        if (data.PRODUCT_TYPE_CUSTOMER_INVOICE_TO_ID === '') {
          sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToId())
          sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceTo(data))
        } else {
          sqlList.push(await ProductTypeCustomerInvoiceTo.updateProductTypeCustomerInvoiceTo(data))
        }

        // **(1) Create New PRODUCT TYPE CODE Or Update
        if (data.PRODUCT_TYPE_BOI_ID === '') {
          sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProjectId())
          sqlList.push(await ProductTypeNewSQL.createProductTypeBoiProject(data))
        } else {
          sqlList.push(await ProductTypeNewSQL.updateProductTypeBoiProject(data))
        }

        // **(1) Create New PRODUCT ITEM Or Update
        if (data.PRODUCT_ITEM_ID === '') {
          sqlList.push(await ProductItemSQL.createProductItemId())
          sqlList.push(await ProductItemSQL.createProductItemWithoutProductItem(data))
        } else {
          sqlList.push(await ProductItemSQL.createProductTypeCodeForItem(data))
          sqlList.push(await ProductItemSQL.updateProductItemWithoutProductItem(data))
        }

        //**(1) UPDATE Status Working
        if (data.PRODUCT_TYPE_PROGRESS_WORKING_ID !== '') {
          sqlList.push(await ProductTypeStatusWorkingSQL.updateProductTypeStatusWorking(data))
        } else {
          sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorkingId())
          sqlList.push(await ProductTypeStatusWorkingSQL.createProductTypeStatusWorking(data))
        }
      }
    }
    // console.log(sqlList.join('\n'))
    resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  update: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.update(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  delete: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  getByProductGroup: async (dataItem: any) => {
    let sqlWhere = ''

    const { PRODUCT_SUB_ID, PRODUCT_MAIN_ID, PRODUCT_CATEGORY_ID, PRODUCT_TYPE_NAME, PRODUCT_TYPE_CODE, CUSTOMER_INVOICE_TO_ID, ITEM_CATEGORY_ID } = dataItem

    if (PRODUCT_TYPE_CODE) {
      sqlWhere += ` AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT LIKE '%${PRODUCT_TYPE_CODE}%'`
    } else if (PRODUCT_TYPE_NAME) {
      sqlWhere += ` AND tb_1.PRODUCT_TYPE_NAME LIKE '%${PRODUCT_TYPE_NAME}%'`
    } else if (PRODUCT_SUB_ID) {
      sqlWhere += ` AND tb_2.PRODUCT_SUB_ID = ${PRODUCT_SUB_ID}`
    } else if (PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_3.PRODUCT_MAIN_ID = ${PRODUCT_MAIN_ID}`
    } else if (PRODUCT_CATEGORY_ID) {
      sqlWhere += ` AND tb_4.PRODUCT_CATEGORY_ID = ${PRODUCT_CATEGORY_ID}`
    }
    if (CUSTOMER_INVOICE_TO_ID) {
      sqlWhere += ` AND tb_12.CUSTOMER_INVOICE_TO_ID = ${CUSTOMER_INVOICE_TO_ID}`
    }
    if (ITEM_CATEGORY_ID) {
      sqlWhere += ` AND tb_11.ITEM_CATEGORY_ID = ${ITEM_CATEGORY_ID}`
    }

    const sql = await ProductTypeNewSQL.getByProductGroup(dataItem, sqlWhere)

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getProductTypeByProductGroup: async (dataItem: any) => {
    let sqlWhere = ''

    if (dataItem.PRODUCT_TYPE_NAME != '') {
      sqlWhere += " AND tb_1.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'"
    }
    // if (dataItem.PRODUCT_TYPE_ID && dataItem.PRODUCT_TYPE_ID.trim() !== '') {
    //   sqlWhere += ` AND tb_1.PRODUCT_TYPE_ID LIKE '%${dataItem.PRODUCT_TYPE_ID}%'`
    // }
    if (dataItem.PRODUCT_TYPE_ID != '') {
      sqlWhere += " AND tb_1.PRODUCT_TYPE_ID LIKE '%dataItem.PRODUCT_TYPE_ID%'"
    }
    if (dataItem.PRODUCT_TYPE_CODE != '') {
      sqlWhere += " AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT LIKE '%dataItem.PRODUCT_TYPE_CODE%'"
    }

    if (dataItem.PRODUCT_SUB_ID != '') {
      sqlWhere += " AND tb_2.PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'"
    }

    if (dataItem.PRODUCT_MAIN_ID != '') {
      sqlWhere += " AND tb_3.PRODUCT_MAIN_ID LIKE '%dataItem.PRODUCT_MAIN_ID%'"
    }

    if (dataItem.PRODUCT_CATEGORY_ID != '') {
      sqlWhere += " AND tb_4.PRODUCT_CATEGORY_ID LIKE '%dataItem.PRODUCT_CATEGORY_ID%'"
    }
    // if (sqlWhere != '') {
    //   sqlWhere = ` WHERE ` + sqlWhere.substring(4)
    // }

    const sql = await ProductTypeNewSQL.getProductTypeByProductGroup(dataItem, sqlWhere)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProductTypeNameAndProductCategoryIdAndInuse: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductTypeNameAndProductCategoryIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProductTypeNameAndInuse: async (dataItem: any) => {
    let sqlWhere = ''

    const { PRODUCT_SUB_ID, PRODUCT_MAIN_ID, PRODUCT_CATEGORY_ID, PRODUCT_TYPE_NAME, INUSE, PRODUCT_TYPE_CODE } = dataItem

    if (PRODUCT_TYPE_CODE) {
      sqlWhere += ` AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT LIKE '%${dataItem.PRODUCT_TYPE_CODE}%'`
    }
    if (PRODUCT_TYPE_NAME) {
      sqlWhere += ` AND tb_1.PRODUCT_TYPE_NAME LIKE '%${dataItem.PRODUCT_TYPE_NAME}%'`
    }
    if (PRODUCT_SUB_ID) {
      sqlWhere += ` AND tb_7.PRODUCT_SUB_ID = ${PRODUCT_SUB_ID}`
    }
    if (PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_8.PRODUCT_MAIN_ID = ${PRODUCT_MAIN_ID}`
    }
    if (PRODUCT_CATEGORY_ID) {
      sqlWhere += ` AND tb_10.PRODUCT_CATEGORY_ID = ${PRODUCT_CATEGORY_ID}`
    }

    sqlWhere += " AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT <> ''"

    if (INUSE) {
      sqlWhere += ` AND tb_1.INUSE = ${INUSE}`
    }

    if (sqlWhere) {
      sqlWhere = ` WHERE ${sqlWhere.substring(4)}`
    }

    const sql = await ProductTypeNewSQL.getByLikeProductTypeNameAndInuse_withSqlWhere(dataItem, sqlWhere)

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getByLikeProductTypeNameAndInuseForPriceList: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductTypeNameAndInuseForPriceList(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getByLikeProductTypeCodeAndInuse: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductTypeCodeAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProductTypeNameAndProductMainIdAndInuse: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductTypeNameAndProductMainIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProductTypeCodeAndProductMainIdAndInuse: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getByLikeProductTypeCodeAndProductMainIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getProductTypeByProductMainID: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.getProductTypeByProductMainID(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  searchProductType: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.searchProductType(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  searchProductTypeBySelected: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.searchProductTypeBySelected(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  searchProductTypeAllPage: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.searchProductTypeAllPage(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  createProductType: async (dataItem: any) => {
    let sqlList = []
    let queryDuplicateProductTypeCodeForSCT = await ProductTypeNewSQL.getByProductTypeCodeForSCT(dataItem)
    let resultDuplicateProductTypeCodeForSCT = (await MySQLExecute.search(queryDuplicateProductTypeCodeForSCT)) as RowDataPacket[]
    if (resultDuplicateProductTypeCodeForSCT.length > 0) {
      return {
        Status: false,
        Message: 'Duplicate Product Type Code For SCT',
        ResultOnDb: [],
        MethodOnDb: 'Insert Product Type',
        TotalCountOnDb: 0,
      }
    } else {
      let queryDuplicateProductTypeName = await ProductTypeNewSQL.getByProductTypeName(dataItem)
      let resultDuplicateProductTypeName = (await MySQLExecute.search(queryDuplicateProductTypeName)) as RowDataPacket[]
      if (resultDuplicateProductTypeName.length > 0) {
        return {
          Status: false,
          Message: 'Duplicate Product Type Name',
          ResultOnDb: [],
          MethodOnDb: 'Insert Product Type',
          TotalCountOnDb: 0,
        }
      } else {
        sqlList.push(await ProductTypeNewSQL.createProductTypeId())
        sqlList.push(await ProductTypeNewSQL.createByProductTypeIdVariable(dataItem))

        // Item Category
        sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryId())
        sqlList.push(await ProductTypeItemCategorySQL.createProductTypeItemCategoryForNewType(dataItem))

        // Customer Invoice To
        sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToId())
        sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceToForNewType(dataItem))

        // Account Department Code - optional
        if (dataItem?.ACCOUNT_DEPARTMENT_CODE_ID) {
          sqlList.push(await ProductTypeAccountDepartmentCodeSQL.createByProductTypeIdVariable(dataItem))
        }

        // BOM and Flow - optional
        if (dataItem?.BOM_ID) {
          // BOM
          sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomId()) // OK
          sqlList.push(await ProductTypeBomNewSQL.createProductTypeBomForNewType(dataItem)) // OK
          // Flow

          if (!dataItem?.FLOW_ID) {
            return {
              Status: false,
              Message: 'Flow ID Not Found',
              ResultOnDb: [],
              MethodOnDb: 'Insert Product Type',
              TotalCountOnDb: 0,
            }
          }
          sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowId()) // OK
          sqlList.push(await ProductTypeFlowSQL.createProductTypeFlowForNewType(dataItem)) // OK
        }

        // Product Specification Document Setting
        // ?? Force to ID = 1
        sqlList.push(await ProductTypeProductSpecSQL.createByProductTypeId_Variable(dataItem)) // OK

        // BOI
        //listSql.push(await ProductTypeBoiSQL.createByProductTypeIdVariable(dataItem))

        // Product Type Detail
        //listSql.push(await ProductTypeDetailSQL.createByProductTypeIdVariable(dataItem))

        // TODO : Product Type Progress Working
        sqlList.push(await ProductTypeProgressWorkingSQL.createByProductTypeId_Variable(dataItem)) // OK

        // TODO : Insert Item Master
        // ** Optional

        sqlList.push(await ItemSQL.CreateItemId()) // OK
        sqlList.push(await ItemSQL.createItem(dataItem)) // OK

        sqlList.push(await ItemGroupSQL.CreateItemGroupId()) // OK
        dataItem['ITEM_GROUP_NAME'] = dataItem['PRODUCT_TYPE_NAME'] !== '' ? dataItem['PRODUCT_TYPE_NAME'] : null

        let sql = await ItemGroupSQL.getItemGroupNameAndInuse(dataItem)
        let chkItemGroup = (await MySQLExecute.search(sql)) as RowDataPacket[]

        if (chkItemGroup?.length === 0) {
          sqlList.push(await ItemGroupSQL.createItemGroupByVariableId(dataItem)) // OK
          sqlList.push(await ItemManufacturingSQL.createItemManufacturingByProductType(dataItem)) // OK
        } else {
          // ** Insert Item Group By Item Group Id
          dataItem['ITEM_GROUP_ID'] = chkItemGroup[0]['ITEM_GROUP_ID']
          sqlList.push(await ItemManufacturingSQL.createItemManufacturingByProductTypeAndItemGroupId(dataItem)) // OK
        }
        if (dataItem['MOQ'] !== '' || dataItem['LEAD_TIME'] !== '' || dataItem['SAFETY_STOCK'] !== '') {
          sqlList.push(await ItemStockSQL.createItemStockByItemIdVariable(dataItem))
        }

        sqlList.push(await ItemProductDetailSQL.createItemProductDetailByProductType(dataItem))
        sqlList.push(await ItemProductMainSQL.InsertByItemIdGenKey(dataItem))

        // ** End Optional
        let resultData = await MySQLExecute.executeList(sqlList)
        return {
          Status: true,
          ResultOnDb: resultData,
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Product Type',
          Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
        }
      }
    }
  },
  updateProductType: async (dataItem: any) => {
    let sqlList = []

    // TODO : Product Type
    sqlList.push(await ProductTypeNewSQL.updateProductTypeNew(dataItem))

    // // TODO : Customer Invoice To
    // sqlList.push(await ProductTypeCustomerInvoiceTo.updateInuseByProductTypeId(dataItem))
    // sqlList.push(await ProductTypeCustomerInvoiceTo.createProductTypeCustomerInvoiceTo(dataItem))

    // TODO : Account Department Code - optional
    sqlList.push(await ProductTypeAccountDepartmentCodeSQL.updateInuseByProductTypeId(dataItem))
    if (dataItem?.ACCOUNT_DEPARTMENT_CODE_ID) {
      sqlList.push(await ProductTypeAccountDepartmentCodeSQL.create(dataItem))
    }

    // TODO : BOM - optional
    sqlList.push(await ProductTypeBomSQL.updateInuseByProductTypeId(dataItem))
    sqlList.push(await ProductTypeFlowSQL.updateInuseByProductTypeId(dataItem))

    if (dataItem?.BOM_ID) {
      sqlList.push(await ProductTypeBomSQL.create(dataItem))

      if (!dataItem?.FLOW_ID) {
        throw new Error('Flow ID Not Found')
      }

      // TODO : Flow - optional
      sqlList.push(await ProductTypeFlowSQL.updateInuseByProductTypeId(dataItem))
      if (dataItem?.FLOW_ID) {
        sqlList.push(await ProductTypeFlowSQL.create(dataItem))
      }
    }

    // TODO : Product Type Progress Working
    sqlList.push(await ProductTypeProgressWorkingSQL.updateInuseByProductTypeId(dataItem))
    sqlList.push(await ProductTypeProgressWorkingSQL.create(dataItem))

    let resultData = await MySQLExecute.executeList(sqlList)

    return resultData
  },
  deleteProductTypeAndItem: async (dataItem: any) => {
    const sql = await ProductTypeNewSQL.deleteProductTypeAndItem(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
