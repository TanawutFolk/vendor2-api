import { MySQLExecute } from '@businessData/dbExecute'

import { ItemCategorySQL } from '@src/_workspace/sql/item-category/ItemCategorySQL'
import { ItemGroupSQL } from '@src/_workspace/sql/item-group/ItemGroupSQL'
import { ColorSQL } from '@src/_workspace/sql/item-master/item-property/color/ColorSQL'
import { ShapeSQL } from '@src/_workspace/sql/item-master/item-property/shape/ShapeSQL'
import { ItemSQL } from '@src/_workspace/sql/item-master/item/ItemSQL'
import { MakerSQL } from '@src/_workspace/sql/item-master/maker/MakerSQL'
import { VendorSQL } from '@src/_workspace/sql/item-master/vendor/VendorSQL'
import { ItemPurposeSQL } from '@src/_workspace/sql/item-purpose/ItemPurposeSQL'
import { ItemManufacturingSQL } from '@src/_workspace/sql/item/ItemManufacturingSQL'
import { ItemStockSQL } from '@src/_workspace/sql/item/itemStockSQL'
import { ThemeColorSQL } from '@src/_workspace/sql/theme-color/ThemeColorSQL'
import { UnitOfMeasurementSQL } from '@src/_workspace/sql/unit/unit-of-measurement/UnitOfMeasurementSQL'
import type { RowDataPacket } from 'mysql2'

export const ItemService = {
  getViewItemDataByItemId: async (dataItem: any) => {
    const sql = await ItemSQL.getViewItemDataByItemId(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  createItemList: async (dataItem: any) => {
    let sqlList = []
    let data = []
    let itemList: createItemByListItem_Type[] = []

    type ImportItem_Type = {
      'ITEM CATEGORY NAME': string
      'ITEM CODE': string
      'ITEM PURPOSE NAME': string
      'ITEM GROUP NAME': string
      'VENDOR NAME': string
      'MAKER NAME': string
      'WIDTH [mm] (optional)': string
      'HEIGHT [mm] (optional)': string
      'DEPTH [mm] (optional)': string
      'COLOR (optional)': string
      'SHAPE (optional)': string
      'ITEM INTERNAL FULL NAME': string
      'ITEM INTERNAL SHORT NAME': string
      'ITEM EXTERNAL CODE (P/N)': string
      'ITEM EXTERNAL FULL NAME': string
      'ITEM EXTERNAL SHORT NAME': string
      'PURCHASE UNIT RATIO': string
      'PURCHASE UNIT CODE': string
      'USAGE UNIT RATIO': string
      'USAGE UNIT CODE': string
      'MOQ [Purchase Unit] (optional)': string
      'LEAD TIME [Day] (optional)': string
      'SAFETY STOCK  [Purchase Unit] (optional)': string
      'THEME COLOR NAME (optional)': string
      'CREATE BY': string
    }

    // ** 1. Prepare Master Data to compare data from excel file
    // Header
    sqlList.push(await ItemCategorySQL.getAll())
    sqlList.push(await ItemSQL.getAllListInuse())

    // Component
    sqlList.push(await ItemPurposeSQL.getAll())
    sqlList.push(await ItemGroupSQL.getAll())
    sqlList.push(await VendorSQL.getAll())
    sqlList.push(await MakerSQL.getAll())

    // Property
    sqlList.push(await ColorSQL.getAll())

    sqlList.push(await ShapeSQL.getAll())

    // Purchase Unit
    sqlList.push(await UnitOfMeasurementSQL.getAll())

    // Item Theme Color
    sqlList.push(await ThemeColorSQL.getAll())

    data = (await MySQLExecute.searchList(sqlList)) as RowDataPacket[]

    const itemCategory = data[0]
    const listItemCode = data[1]

    const itemPurpose = data[2]
    const itemGroup = data[3]
    const vender = data[4]
    const maker = data[5]

    const itemColor = data[6]
    const itemShape = data[7]

    const unit = data[8]

    const itemThemeColor = data[9]

    // ** 2. Verified data
    sqlList = []
    let resultVerified = []

    let excelColumnName: ImportItem_Type

    // ** Declare variable

    let itemCategoryId_forInsertDb

    let itemPurposeId_forInsertDb
    let itemGroupId_forInsertDb
    let venderId_forInsertDb
    let makerId_forInsertDb

    let purchaseUnitId_forInsertDb
    let usageUnitId_forInsertDb

    let itemColorId_forInsertDb = ''
    let itemShapeId_forInsertDb = ''

    let itemThemeColorId_forInsertDb = ''

    for (let idx = 0; idx < dataItem['LIST_ITEM_IMPORT'].length; idx++) {
      excelColumnName = dataItem['LIST_ITEM_IMPORT'][idx]

      let obj: any = []

      //GET CATEGORY ID
      if (excelColumnName['ITEM CATEGORY NAME'] !== null) {
        itemCategoryId_forInsertDb = itemCategory.find((e: any) => e.ITEM_CATEGORY_NAME === excelColumnName['ITEM CATEGORY NAME'])?.ITEM_CATEGORY_ID

        if (typeof itemCategoryId_forInsertDb === 'undefined') {
          //add into object
          obj = {
            POSITION: 'A' + (idx + 3),
            ITEM_NAME: 'ITEM CATEGORY NAME',
            VALUE: excelColumnName['ITEM CATEGORY NAME'],
            REASON: 'Item category Name not found',
          }
          resultVerified.push(obj)
        }
      } else {
        obj = {
          POSITION: 'A' + (idx + 3),
          ITEM_NAME: 'ITEM CATEGORY',
          VALUE: excelColumnName['ITEM CATEGORY NAME'],
          REASON: 'Item category Name is required',
        }
        resultVerified.push(obj)
      }

      // GET ITEM CODE
      if (excelColumnName['ITEM CODE'] != null) {
        const itemCode_forInsertDb = listItemCode.find((e: any) => e.ITEM_CODE_FOR_SUPPORT_MES == excelColumnName['ITEM CODE'])

        if (typeof itemCode_forInsertDb !== 'undefined') {
          obj = {
            POSITION: 'B' + (idx + 3),
            ITEM_NAME: 'ITEM CODE',
            VALUE: excelColumnName['ITEM CODE'],
            REASON: 'Item Code Duplicate',
          }
          resultVerified.push(obj)
        }
      }

      //GET PURPOSE ID
      if (excelColumnName['ITEM PURPOSE NAME'] !== null) {
        itemPurposeId_forInsertDb = itemPurpose.find((e: any) => e.ITEM_PURPOSE_NAME == excelColumnName['ITEM PURPOSE NAME'])?.ITEM_PURPOSE_ID

        if (typeof itemPurposeId_forInsertDb === 'undefined') {
          obj = {
            POSITION: 'C' + (idx + 3),
            ITEM_NAME: 'ITEM PURPOSE NAME',
            VALUE: excelColumnName['ITEM PURPOSE NAME'],
            REASON: 'Item Purpose Name not found',
          }
          resultVerified.push(obj)
        }
      } else {
        obj = {
          POSITION: 'C' + (idx + 3),
          ITEM_NAME: 'ITEM PURPOSE NAME',
          VALUE: excelColumnName['ITEM PURPOSE NAME'],
          REASON: 'Item Purpose Name is required ',
        }
        resultVerified.push(obj)
      }

      //GET GROUP ID
      if (excelColumnName['ITEM GROUP NAME'] !== null) {
        itemGroupId_forInsertDb = itemGroup.find((e: any) => e.ITEM_GROUP_NAME === excelColumnName['ITEM GROUP NAME'])?.ITEM_GROUP_ID

        if (typeof itemGroupId_forInsertDb === 'undefined') {
          obj = {
            POSITION: 'D' + (idx + 3),
            ITEM_NAME: 'ITEM GROUP NAME',
            VALUE: excelColumnName['ITEM GROUP NAME'],
            REASON: 'Item Group Name not found',
          }
          resultVerified.push(obj)
        }
      } else {
        obj = {
          POSITION: 'D' + (idx + 3),
          ITEM_NAME: 'ITEM GROUP NAME',
          VALUE: excelColumnName['ITEM GROUP NAME'],
          REASON: 'Item Group Name is required',
        }
        resultVerified.push(obj)
      }

      //GET VENDER ID
      if (excelColumnName['VENDOR NAME'] !== null) {
        venderId_forInsertDb = vender.find((e: any) => e.VENDOR_NAME === excelColumnName['VENDOR NAME'])?.VENDOR_ID

        if (typeof venderId_forInsertDb === 'undefined') {
          obj = {
            POSITION: 'E' + (idx + 3),
            ITEM_NAME: 'VENDER NAME',
            VALUE: excelColumnName['VENDOR NAME'],
            REASON: 'Vender Name not found',
          }
          resultVerified.push(obj)
        }
      } else {
        obj = {
          POSITION: 'E' + (idx + 3),
          ITEM_NAME: 'VENDER NAME',
          VALUE: excelColumnName['VENDOR NAME'],
          REASON: 'Vender Name is required',
        }
        resultVerified.push(obj)
      }

      //GET MAKER ID
      if (excelColumnName['MAKER NAME'] !== null) {
        makerId_forInsertDb = maker.find((e: any) => e.MAKER_NAME === excelColumnName['MAKER NAME'])?.MAKER_ID

        if (typeof makerId_forInsertDb === 'undefined') {
          obj = {
            POSITION: 'F' + (idx + 3),
            ITEM_NAME: 'MAKER NAME',
            VALUE: excelColumnName['MAKER NAME'],
            REASON: 'Maker Name not found',
          }
          resultVerified.push(obj)
        }
      } else {
        obj = {
          POSITION: 'F' + (idx + 3),
          ITEM_NAME: 'MAKER NAME',
          VALUE: excelColumnName['MAKER NAME'],
          REASON: 'Maker Name is required',
        }
        resultVerified.push(obj)
      }

      // GET COLOR ID
      if (excelColumnName['COLOR (optional)'] != null) {
        itemColorId_forInsertDb = itemColor.find((e: any) => e.ITEM_PROPERTY_COLOR_NAME === excelColumnName['COLOR (optional)'])?.ITEM_PROPERTY_COLOR_ID

        if (typeof itemColorId_forInsertDb === 'undefined') {
          obj = {
            POSITION: 'J' + (idx + 3),
            ITEM_NAME: 'COLOR',
            VALUE: excelColumnName['COLOR (optional)'],
            REASON: 'Color not found',
          }
          resultVerified.push(obj)
        }
      }

      // GET SHAPE ID
      if (excelColumnName['SHAPE (optional)'] != null) {
        itemShapeId_forInsertDb = itemShape.find((e: any) => e.ITEM_PROPERTY_SHAPE_NAME === excelColumnName['SHAPE (optional)'])?.ITEM_PROPERTY_SHAPE_ID

        if (typeof itemShapeId_forInsertDb === 'undefined') {
          obj = {
            POSITION: 'K' + (idx + 3),
            ITEM_NAME: 'SHAPE',
            VALUE: excelColumnName['SHAPE (optional)'],
            REASON: 'Shape not found',
          }
          resultVerified.push(obj)
        }
      }

      // GET PURCHASE_UNIT

      if (!excelColumnName['PURCHASE UNIT RATIO']) {
        obj = {
          POSITION: 'Q' + (idx + 3),
          ITEM_NAME: 'PURCHASE UNIT RATIO',
          VALUE: excelColumnName['PURCHASE UNIT RATIO'],
          REASON: 'Purchase Unit RATIO is required',
        }
        resultVerified.push(obj)
      }

      if (excelColumnName['PURCHASE UNIT RATIO'] != '1') {
        obj = {
          POSITION: 'Q' + (idx + 3),
          ITEM_NAME: 'PURCHASE UNIT RATIO',
          VALUE: excelColumnName['PURCHASE UNIT RATIO'],
          REASON: 'Purchase Unit Ratio must be "1" only.',
        }
      }

      if (excelColumnName['PURCHASE UNIT CODE'] !== null) {
        purchaseUnitId_forInsertDb = unit.find((e: any) => e.SYMBOL === excelColumnName['PURCHASE UNIT CODE'])?.UNIT_OF_MEASUREMENT_ID

        if (typeof purchaseUnitId_forInsertDb === 'undefined') {
          obj = {
            POSITION: 'R' + (idx + 3),
            ITEM_NAME: 'PURCHASE UNIT CODE',
            VALUE: excelColumnName['PURCHASE UNIT CODE'],
            REASON: 'Purchase Unit Code not found',
          }
          resultVerified.push(obj)
        }
      } else {
        obj = {
          POSITION: 'R' + (idx + 3),
          ITEM_NAME: 'PURCHASE UNIT CODE',
          VALUE: excelColumnName['PURCHASE UNIT CODE'],
          REASON: 'Purchase Unit Code is required',
        }
        resultVerified.push(obj)
      }

      // GET USAGE_UNIT
      if (!excelColumnName['USAGE UNIT RATIO']) {
        obj = {
          POSITION: 'S' + (idx + 3),
          ITEM_NAME: 'USAGE UNIT RATIO',
          VALUE: excelColumnName['USAGE UNIT RATIO'],
          REASON: 'USAGE Unit RATIO is required',
        }
        resultVerified.push(obj)
      }

      if (excelColumnName['USAGE UNIT CODE'] !== null) {
        usageUnitId_forInsertDb = unit.find((e: any) => e.SYMBOL === excelColumnName['USAGE UNIT CODE'])?.UNIT_OF_MEASUREMENT_ID

        if (typeof usageUnitId_forInsertDb === 'undefined') {
          obj = {
            POSITION: 'T' + (idx + 3),
            ITEM_NAME: 'USAGE UNIT CODE',
            VALUE: excelColumnName['USAGE UNIT CODE'],
            REASON: 'Usage Unit Code not found',
          }
          resultVerified.push(obj)
        }
      } else {
        obj = {
          POSITION: 'T' + (idx + 3),
          ITEM_NAME: 'USAGE UNIT CODE',
          VALUE: excelColumnName['USAGE UNIT CODE'],
          REASON: 'Usage Unit Code is required',
        }
        resultVerified.push(obj)
      }

      if (excelColumnName['THEME COLOR NAME (optional)'] != null) {
        itemThemeColorId_forInsertDb = itemThemeColor.find((e: any) => e.COLOR_NAME == excelColumnName['THEME COLOR NAME (optional)'])?.COLOR_ID

        if (typeof itemThemeColorId_forInsertDb === 'undefined') {
          obj = {
            POSITION: 'X' + (idx + 3),
            ITEM_NAME: 'THEME COLOR NAME',
            VALUE: excelColumnName['THEME COLOR NAME (optional)'],
            REASON: 'Item Theme Color not found',
          }
          resultVerified.push(obj)
        }
      }

      // *** Get Data
      // **  Component data before insert

      const dataItemForInsert: createItemByListItem_Type = {
        ITEM_CATEGORY_ID: itemCategoryId_forInsertDb,
        ITEM_CODE_FOR_SUPPORT_MES: excelColumnName['ITEM CODE'],

        ITEM_PURPOSE_ID: itemPurposeId_forInsertDb,
        ITEM_GROUP_ID: itemGroupId_forInsertDb,
        VENDOR_ID: venderId_forInsertDb,
        MAKER_ID: makerId_forInsertDb,

        WIDTH: excelColumnName['WIDTH [mm] (optional)'],
        HEIGHT: excelColumnName['HEIGHT [mm] (optional)'],
        DEPTH: excelColumnName['DEPTH [mm] (optional)'],
        ITEM_PROPERTY_COLOR_ID: itemColorId_forInsertDb,
        ITEM_PROPERTY_SHAPE_ID: itemShapeId_forInsertDb,

        ITEM_INTERNAL_FULL_NAME: excelColumnName['ITEM INTERNAL FULL NAME'],
        ITEM_INTERNAL_SHORT_NAME: excelColumnName['ITEM INTERNAL SHORT NAME'],
        ITEM_EXTERNAL_CODE: excelColumnName['ITEM EXTERNAL CODE (P/N)'],
        ITEM_EXTERNAL_FULL_NAME: excelColumnName['ITEM EXTERNAL FULL NAME'],
        ITEM_EXTERNAL_SHORT_NAME: excelColumnName['ITEM EXTERNAL SHORT NAME'],

        PURCHASE_UNIT_RATIO: excelColumnName['PURCHASE UNIT RATIO'],
        PURCHASE_UNIT_ID: purchaseUnitId_forInsertDb,
        USAGE_UNIT_RATIO: excelColumnName['USAGE UNIT RATIO'],
        USAGE_UNIT_ID: usageUnitId_forInsertDb,

        MOQ: excelColumnName['MOQ [Purchase Unit] (optional)'],
        LEAD_TIME: excelColumnName['LEAD TIME [Day] (optional)'],
        SAFETY_STOCK: excelColumnName['SAFETY STOCK  [Purchase Unit] (optional)'],

        COLOR_ID_FOR_ITEM_THEME: itemThemeColorId_forInsertDb,

        CREATE_BY: excelColumnName['CREATE BY'],
      }

      itemList.push(dataItemForInsert)
    }
    if (resultVerified.length > 0) {
      return {
        Message: 'Insert data unsuccess',
        ResultOnDb: resultVerified,
        MethodOnDb: 'create Item List',
        TotalCountOnDb: resultVerified.length,
        Status: false,
      }
    } else {
      await createItemByListItem(itemList)

      return {
        Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
        ResultOnDb: [],
        MethodOnDb: 'Insert Item List',
        TotalCountOnDb: 0,
        Status: true,
      }
    }
  },
  //   getAll: async (dataItem: any) => {
  //     console.log(dataItem)

  //     let resultData: any = []
  //     let query
  //     let sqlWhere = ''
  //     let sqlSelect = ''

  //     // if (dataItem['CHECK_ITEM_IN_PRODUCT_MAIN_ID'] !== '') {
  //     //   sqlSelect += ` , (SELECT COUNT(*) FROM ITEM_PRODUCT_MAIN WHERE PRODUCT_MAIN_ID  = 'dataItem.PRODUCT_MAIN_ID_FOR_ITEM_PRODUCT_MAIN'
  //     //     AND tb_3.ITEM_ID = ITEM_ID) AS IS_EXIST_ITEM_IN_PRODUCT_MAIN , 'dataItem.PRODUCT_MAIN_ID_FOR_ITEM_PRODUCT_MAIN' AS PRODUCT_MAIN_ID_FOR_ITEM_PRODUCT_MAIN `
  //     // }

  //     if (dataItem['ITEM_INTERNAL_SHORT_NAME'] != '') {
  //       sqlWhere += " AND tb_3.ITEM_INTERNAL_SHORT_NAME LIKE '%dataItem.ITEM_INTERNAL_SHORT_NAME%'"
  //     }

  //     if (dataItem['WIDTH'] != '') {
  //       sqlWhere += " AND tb_3.WIDTH LIKE '%dataItem.WIDTH%'"
  //     }

  //     if (dataItem['HEIGHT'] != '') {
  //       sqlWhere += " AND tb_3.HEIGHT LIKE '%dataItem.HEIGHT%'"
  //     }

  //     if (dataItem['DEPTH'] != '') {
  //       sqlWhere += " AND tb_3.DEPTH LIKE '%dataItem.DEPTH%'"
  //     }

  //     if (dataItem['IS_SEARCH_FOR_BOM'] != '' && dataItem['IS_SEARCH_FOR_BOM'] != '0') {
  //       sqlWhere += ' AND tb_1.ITEM_CATEGORY_ID != 1'
  //     }

  //     if (dataItem['ITEM_CATEGORY_ID'] != '') {
  //       sqlWhere += " AND tb_1.ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID'"
  //     }

  //     if (dataItem['ITEM_PURPOSE_ID'] != '') {
  //       sqlWhere += " AND tb_3.ITEM_PURPOSE_ID = 'dataItem.ITEM_PURPOSE_ID'"
  //     }

  //     if (dataItem['ITEM_GROUP_ID'] != '') {
  //       sqlWhere += " AND tb_3.ITEM_GROUP_ID = 'dataItem.ITEM_GROUP_ID'"
  //     }

  //     if (dataItem['VENDOR_ID'] != '') {
  //       sqlWhere += " AND tb_3.VENDOR_ID = 'dataItem.VENDOR_ID'"
  //     }

  //     if (dataItem['MAKER_ID'] != '') {
  //       sqlWhere += " AND tb_3.MAKER_ID = 'dataItem.MAKER_ID'"
  //     }

  //     if (dataItem['PRODUCT_TYPE_ID'] != '') {
  //       sqlWhere += " AND tb_12.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'"
  //     } else if (dataItem['PRODUCT_SUB_ID'] != '') {
  //       sqlWhere += " AND tb_13.PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'"
  //     } else if (dataItem['PRODUCT_MAIN_ID'] != '') {
  //       sqlWhere += " AND tb_18.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'"
  //     } else if (dataItem['PRODUCT_CATEGORY_ID'] != '') {
  //       sqlWhere += " AND tb_19.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'"
  //     }

  //     if (dataItem['WORK_ORDER_ID'] != '') {
  //       sqlWhere += " AND tb_14.WORK_ORDER_ID = 'dataItem.WORK_ORDER_ID'"
  //     }
  //     if (dataItem['PART_NO_ID'] != '') {
  //       sqlWhere += " AND tb_15.PART_NO_ID = 'dataItem.PART_NO_ID'"
  //     }
  //     if (dataItem['SPECIFICATION_ID'] != '') {
  //       sqlWhere += " AND tb_16.SPECIFICATION_ID = 'dataItem.SPECIFICATION_ID'"
  //     }
  //     if (dataItem['CUSTOMER_ORDER_FROM_ID'] != '') {
  //       sqlWhere += " AND tb_17.CUSTOMER_ORDER_FROM_ID = 'dataItem.CUSTOMER_ORDER_FROM_ID'"
  //     }

  //     if (dataItem['WORK_ORDER_ID'] != '') {
  //       sqlWhere += " AND tb_14.WORK_ORDER_ID = 'dataItem.WORK_ORDER_ID'"
  //     }
  //     if (dataItem['PART_NO_ID'] != '') {
  //       sqlWhere += " AND tb_15.PART_NO_ID = 'dataItem.PART_NO_ID'"
  //     }
  //     if (dataItem['SPECIFICATION_ID'] != '') {
  //       sqlWhere += " AND tb_16.SPECIFICATION_ID = 'dataItem.SPECIFICATION_ID'"
  //     }
  //     if (dataItem['CUSTOMER_ORDER_FROM_ID'] != '') {
  //       sqlWhere += " AND tb_17.CUSTOMER_ORDER_FROM_ID = 'dataItem.CUSTOMER_ORDER_FROM_ID'"
  //     }

  //     if (dataItem['ITEM_PROPERTY_COLOR_ID'] != '') {
  //       sqlWhere += " AND tb_3.ITEM_PROPERTY_COLOR_ID = 'dataItem.ITEM_PROPERTY_COLOR_ID'"
  //     }
  //     if (dataItem['ITEM_PROPERTY_SHAPE_ID'] != '') {
  //       sqlWhere += " AND tb_3.ITEM_PROPERTY_SHAPE_ID = 'dataItem.ITEM_PROPERTY_SHAPE_ID'"
  //     }
  //     if (dataItem['ITEM_PROPERTY_MADE_BY_ID'] != '') {
  //       sqlWhere += " AND tb_3.ITEM_PROPERTY_MADE_BY_ID = 'dataItem.ITEM_PROPERTY_MADE_BY_ID'"
  //     }

  //     if (dataItem['USAGE_UNIT_ID'] != '') {
  //       sqlWhere += " AND tb_3.USAGE_UNIT_ID = 'dataItem.USAGE_UNIT_ID'"
  //     }

  //     if (dataItem.hasOwnProperty('BOM_ID') && dataItem['BOM_ID'] != '') {
  //       sqlWhere += " AND tb_21.BOM_ID = 'dataItem.BOM_ID'"
  //     }

  //     if (dataItem['IS_HAVE_ITEM_PRICE_OF_FISCAL_YEAR'] != '') {
  //       if (dataItem['IS_HAVE_ITEM_PRICE_OF_FISCAL_YEAR'] == '1') {
  //         sqlWhere += ` AND EXISTS (
  //             SELECT
  //                  ITEM_PRICE_ID
  //             FROM
  //                  ITEM_PRICE
  //             WHERE
  //                      ITEM_ID = tb_1.ITEM_ID
  //                  AND FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
  //                  AND INUSE = 1
  //          )  `
  //       } else {
  //         sqlWhere += `
  //         AND NOT EXISTS (
  //                        SELECT
  //                             ITEM_PRICE_ID
  //                        FROM
  //                             ITEM_PRICE
  //                        WHERE
  //                                 ITEM_ID = tb_1.ITEM_ID
  //                             AND FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
  //                             AND INUSE = 1
  //                     )
  //      `
  //       }
  //     }

  //     if (dataItem['IS_EXISTS_ITEM_IN_PRODUCT_MAIN'] != '' && dataItem['IS_EXISTS_ITEM_IN_PRODUCT_MAIN'] == '1') {
  //       if (dataItem['IS_EXISTS_ITEM_IN_PRODUCT_MAIN'] == '1') {
  //         if (dataItem['PRODUCT_MAIN_ID_FOR_ITEM_PRODUCT_MAIN'] != '') {
  //           sqlWhere += ` AND EXISTS (
  //             SELECT
  //                  ITEM_ID
  //             FROM
  //                  ITEM_PRODUCT_MAIN
  //             WHERE
  //                      ITEM_ID = tb_1.ITEM_ID
  //                  AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID_FOR_ITEM_PRODUCT_MAIN'
  //                  AND INUSE = 1
  //          )                      `
  //         } else if (dataItem['PRODUCT_CATEGORY_ID_FOR_ITEM_PRODUCT_MAIN'] != '') {
  //           sqlWhere += ` AND EXISTS (
  //                                           SELECT
  //                                               ITEM_ID
  //                                           FROM
  //                                               ITEM_PRODUCT_MAIN tbs_1
  //                                                     INNER JOIN
  //                                               PRODUCT_MAIN tbs_2
  //                                                     ON tbs_1.PRODUCT_MAIN_ID = tbs_2.PRODUCT_MAIN_ID
  //                                           WHERE
  //                                                   tbs_1.ITEM_ID = tb_1.ITEM_ID
  //                                               AND tbs_2.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID_FOR_ITEM_PRODUCT_MAIN'
  //                                               AND tbs_1.INUSE = 1
  //                                     ) `
  //         }
  //       } else {
  //         sqlWhere += `  AND NOT EXISTS (
  //             SELECT
  //                  ITEM_ID
  //             FROM
  //                  ITEM_PRODUCT_MAIN
  //             WHERE
  //                      ITEM_ID = tb_1.ITEM_ID
  //                  AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID_FOR_ITEM_PRODUCT_MAIN'
  //                  AND INUSE = 1
  //          )           `
  //       }
  //     }
  //     if (dataItem['INUSE'] != '') {
  //       sqlWhere += ` AND (IF(tb_1.INUSE = 0 OR tb_3.INUSE = 0,0 , IF(EXISTS(SELECT ITEM_ID from BOM_FLOW_PROCESS_ITEM_USAGE tbs_1
  //         INNER JOIN BOM tbs_2
  //         ON tbs_1.BOM_ID = tbs_2.BOM_ID AND tbs_2.INUSE = 1
  //         WHERE tbs_1.ITEM_ID = tb_1.ITEM_ID AND tbs_1.INUSE = 1 LIMIT 1),2,IF(
  //         EXISTS
  //         (
  //                 SELECT
  //                     ITEM_ID
  //                 FROM
  //                     BOM_FLOW_PROCESS_ITEM_USAGE
  //                 WHERE
  //                     ITEM_ID = tb_1.ITEM_ID
  //         ) = TRUE
  // , 3
  // , 1
  // ))) = 'dataItem.INUSE')`
  //     }
  //     if (dataItem['InuseRawData'] && dataItem['InuseRawData'] != '') {
  //       sqlWhere += " AND tb_1.INUSE LIKE '%dataItem.InuseRawData%'"
  //     }

  //     query = await ItemSQL.getAll(dataItem, sqlWhere, sqlSelect)

  //     resultData = await MySQLExecute.search(query)

  //     return resultData
  //   },

  getAll: async (dataItem: any) => {
    let sqlWhereForCount = ''

    if (dataItem.SearchFilters.find((dataItem: any) => dataItem?.id == 'inuseForSearch')?.value !== '') {
      sqlWhereForCount += `${dataItem.sqlWhere == '' ? ' WHERE' : ' AND'} (IF(tb_1.INUSE = 0 OR tb_3.INUSE = 0,0 , IF(EXISTS(SELECT ITEM_ID from BOM_FLOW_PROCESS_ITEM_USAGE tbs_1
        INNER JOIN BOM tbs_2
        ON tbs_1.BOM_ID = tbs_2.BOM_ID AND tbs_2.INUSE = 1
        WHERE tbs_1.ITEM_ID = tb_1.ITEM_ID AND tbs_1.INUSE = 1 LIMIT 1),2,IF(
        EXISTS
        (
                SELECT
                    ITEM_ID
                FROM
                    BOM_FLOW_PROCESS_ITEM_USAGE
                WHERE
                    ITEM_ID = tb_1.ITEM_ID
        ) = TRUE
, 3
, 1
))) = 'dataItem.inuseForSearch')`
    }
    const listSQL = await ItemSQL.getAll(dataItem, sqlWhereForCount)

    const resultData = (await MySQLExecute.searchList(listSQL)) as RowDataPacket[]

    return resultData
  },
  getAllUnlimit: async (dataItem: any) => {
    const sql = await ItemSQL.getAllUnlimit(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },

  getByLikeItemCodeNameAndInuse: async (dataItem: any) => {
    const sql = await ItemSQL.getByLikeItemCodeNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeItemCodeNameAndInuse_NotFG: async (dataItem: any) => {
    const sql = await ItemSQL.getByLikeItemCodeNameAndInuse_NotFG(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs: async (dataItem: any) => {
    const sql = await ItemSQL.getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeItemCodeAndInuseAndNotFGSemiFGSubAsNoLimit: async () => {
    const sql = await ItemSQL.getByLikeItemCodeAndInuseAndNotFGSemiFGSubAsNoLimit()
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getItemDetailByItemId: async (dataItem: any) => {
    const sql = await ItemSQL.getItemDetailByItemId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getItemDetailByItemCode: async (dataItem: any) => {
    const sql = await ItemSQL.getItemDetailByItemCode(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  create: async (dataItem: any) => {
    const sql = await ItemSQL.getByItemCodeAndInuse(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length === 0) {
      let sqlList = []

      if (!dataItem['ITEM_CODE_FOR_SUPPORT_MES']) {
        throw new Error('ITEM_CODE_FOR_SUPPORT_MES is required')
      }

      sqlList.push(await ItemSQL.CreateItemId())
      sqlList.push(
        await ItemSQL.createVersionNo({
          ITEM_CODE_FOR_SUPPORT_MES: dataItem['ITEM_CODE_FOR_SUPPORT_MES'],
        })
      )
      sqlList.push(await ItemSQL.createItem(dataItem))
      sqlList.push(await ItemSQL.updateIsCurrentByItemCodeForSupportMes(dataItem))
      sqlList.push(await ItemSQL.createItemManufacturing(dataItem))

      if (dataItem['MOQ'] || dataItem['LEAD_TIME'] || dataItem['SAFETY_STOCK']) {
        sqlList.push(await ItemSQL.createItemStockByItemIdVariable(dataItem))
      }

      if (dataItem['COLOR_ID']) {
        sqlList.push(await ThemeColorSQL.createThemeColor(dataItem))
      }

      let resultData = await MySQLExecute.executeList(sqlList)

      return {
        Status: true,
        Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
        ResultOnDb: resultData,
        MethodOnDb: 'Add Customer Order From Success',
        TotalCountOnDb: resultData?.length ?? 0,
      }
    } else {
      return {
        Status: false,
        Message: 'Duplicate Item Code',
        ResultOnDb: [],
        MethodOnDb: 'Insert Item Failed',
        TotalCountOnDb: 0,
      }
    }
  },
  update: async (dataItem: any) => {
    let sqlList = []

    if (dataItem?.IS_UP_VERSION) {
      if (!dataItem['ITEM_CODE_FOR_SUPPORT_MES'] || !dataItem['ITEM_ID']) {
        throw new Error('ITEM_CODE_FOR_SUPPORT_MES and ITEM_ID is required')
      }

      sqlList.push(await ItemSQL.updateInuseByItemCodeForSupportMes(dataItem))
      sqlList.push(await ItemSQL.updateIsCurrentByItemCodeForSupportMes(dataItem))

      sqlList.push(await ItemSQL.CreateItemId())

      sqlList.push(
        await ItemSQL.createVersionNo({
          ITEM_CODE_FOR_SUPPORT_MES: dataItem['ITEM_CODE_FOR_SUPPORT_MES'],
        })
      )
      sqlList.push(await ItemSQL.createItem(dataItem))
      sqlList.push(await ItemSQL.createItemManufacturing(dataItem))

      if (dataItem['MOQ'] || dataItem['LEAD_TIME'] || dataItem['SAFETY_STOCK']) {
        sqlList.push(await ItemSQL.createItemStockByItemIdVariable(dataItem))
      }

      if (dataItem['COLOR_ID']) {
        sqlList.push(await ThemeColorSQL.createThemeColor(dataItem))
      }
    } else {
      // edit Property

      sqlList.push(await ItemSQL.updateProperty(dataItem))

      // edit Item Stock
      sqlList.push(await ItemSQL.deleteItemStock(dataItem))
      if (dataItem['MOQ'] || dataItem['LEAD_TIME'] || dataItem['SAFETY_STOCK']) {
        sqlList.push(await ItemSQL.createItemStockByItemId(dataItem))
      }

      // edit Theme Color
      sqlList.push(await ThemeColorSQL.deleteThemeColor(dataItem))
      if (dataItem['COLOR_ID']) {
        sqlList.push(await ThemeColorSQL.createThemeColorByItemId(dataItem))
      }
    }

    let resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  delete: async (dataItem: any) => {
    let sqlList = []

    sqlList.push(await ItemSQL.deleteItem(dataItem))
    sqlList.push(await ItemSQL.deleteItemManufacturing(dataItem))
    sqlList.push(await ItemSQL.deleteItemStock(dataItem))
    sqlList.push(await ThemeColorSQL.deleteThemeColor(dataItem))

    let resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  getDefaultImagePath: async (dataItem: any) => {
    const sql = await ItemSQL.getDefaultImagePath(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getItemPriceByItemIdAndFiscalYear: async (dataItem: any) => {
    const sql = await ItemSQL.getItemPriceByItemIdAndFiscalYear(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeItemCodeByLike: async (dataItem: any) => {
    const sql = await ItemSQL.getByLikeItemCodeByLike(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeItemCodeByLikeAndBOMId: async (dataItem: any) => {
    const sql = await ItemSQL.getByLikeItemCodeByLikeAndBOMId(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeItemCodeAll: async (dataItem: any) => {
    const sql = await ItemSQL.getByLikeItemCodeAll(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeItemCodeAndProductMain: async (dataItem: any) => {
    const sql = await ItemSQL.getByLikeItemCodeAndProductMain(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },

  getByLikeItemCode: async (dataItem: any) => {
    let sqlWhere = ''

    if (dataItem.ITEM_CATEGORY_ID != '') {
      sqlWhere += " AND tb_8.ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID'"
    }

    // if (sqlWhere != '') {
    //   sqlWhere = ` WHERE ` + sqlWhere.substring(4)
    // }

    const sql = await ItemSQL.getByLikeItemCode(dataItem, sqlWhere)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}

export type createItemByListItem_Type = {
  ITEM_CATEGORY_ID: string
  ITEM_CODE_FOR_SUPPORT_MES: string // ITEM_CODE
  ITEM_PURPOSE_ID: string
  ITEM_GROUP_ID: string
  VENDOR_ID: string
  MAKER_ID: string

  WIDTH: string
  HEIGHT: string
  DEPTH: string

  ITEM_PROPERTY_COLOR_ID: string
  ITEM_PROPERTY_SHAPE_ID: string

  ITEM_INTERNAL_FULL_NAME: string
  ITEM_INTERNAL_SHORT_NAME: string
  ITEM_EXTERNAL_CODE: string
  ITEM_EXTERNAL_FULL_NAME: string
  ITEM_EXTERNAL_SHORT_NAME: string

  PURCHASE_UNIT_RATIO: string
  PURCHASE_UNIT_ID: string // UNIT_OF_MEASUREMENT_ID
  USAGE_UNIT_RATIO: string
  USAGE_UNIT_ID: string // UNIT_OF_MEASUREMENT_ID

  MOQ: string
  LEAD_TIME: string
  SAFETY_STOCK: string

  COLOR_ID_FOR_ITEM_THEME: string // COLOR_ID

  CREATE_BY: string
}

export const createItemByListItem = async (data: createItemByListItem_Type[]) => {
  let resultData

  let sqlList = []

  for (let idx = 0; idx < data.length; idx++) {
    const dataItem = data[idx]

    sqlList.push(await ItemSQL.CreateItemId())
    sqlList.push(
      await ItemSQL.createItem({
        CREATE_BY: dataItem.CREATE_BY,
        ITEM_CATEGORY_ID: dataItem.ITEM_CATEGORY_ID,
      })
    )
    sqlList.push(
      await ItemManufacturingSQL.createItemManufacturing({
        ITEM_CATEGORY_ID: dataItem.ITEM_CATEGORY_ID,
        ITEM_CODE_FOR_SUPPORT_MES: dataItem.ITEM_CODE_FOR_SUPPORT_MES,
        ITEM_PURPOSE_ID: dataItem.ITEM_PURPOSE_ID,
        ITEM_GROUP_ID: dataItem.ITEM_GROUP_ID,
        VENDOR_ID: dataItem.VENDOR_ID,
        MAKER_ID: dataItem.MAKER_ID,
        WIDTH: dataItem.WIDTH,
        HEIGHT: dataItem.HEIGHT,
        DEPTH: dataItem.DEPTH,
        ITEM_PROPERTY_COLOR_ID: dataItem.ITEM_PROPERTY_COLOR_ID,
        ITEM_PROPERTY_SHAPE_ID: dataItem.ITEM_PROPERTY_SHAPE_ID,
        ITEM_INTERNAL_FULL_NAME: dataItem.ITEM_INTERNAL_FULL_NAME,
        ITEM_INTERNAL_SHORT_NAME: dataItem.ITEM_INTERNAL_SHORT_NAME,
        ITEM_EXTERNAL_CODE: dataItem.ITEM_EXTERNAL_CODE,
        ITEM_EXTERNAL_FULL_NAME: dataItem.ITEM_EXTERNAL_FULL_NAME,
        ITEM_EXTERNAL_SHORT_NAME: dataItem.ITEM_EXTERNAL_SHORT_NAME,
        PURCHASE_UNIT_RATIO: dataItem.PURCHASE_UNIT_RATIO,
        PURCHASE_UNIT_ID: dataItem.PURCHASE_UNIT_ID,
        USAGE_UNIT_RATIO: dataItem.USAGE_UNIT_RATIO,
        USAGE_UNIT_ID: dataItem.USAGE_UNIT_ID,
        CREATE_BY: dataItem.CREATE_BY,
      })
    )

    if (dataItem['MOQ'] !== '' || dataItem['LEAD_TIME'] !== '' || dataItem['SAFETY_STOCK'] !== '') {
      sqlList.push(await ItemStockSQL.createItemStockByItemIdVariable(dataItem))
    }

    if (dataItem['COLOR_ID_FOR_ITEM_THEME'] !== '') {
      sqlList.push(await ThemeColorSQL.create(dataItem))
    }
  }

  if (sqlList.length > 0) resultData = await MySQLExecute.executeList(sqlList)

  return resultData
}
