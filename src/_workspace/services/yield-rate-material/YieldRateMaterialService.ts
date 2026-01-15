import { MySQLExecute } from '@businessData/dbExecute'
import { YieldRateMaterialSQL } from '@src/_workspace/sql/yield-rate-material/YieldRateMaterialSQL'
import { ResponseI } from '@src/types/ResponseI'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'

export const YieldRateMaterialService = {
  createYieldRateMaterial: async (dataItem: any) => {
    let sqlList = []

    // console.log(dataItem?.length)

    for (let i = 0; i < Object.keys(dataItem)?.length; i++) {
      const element = dataItem[Object.keys(dataItem)[i]]

      sqlList.push(await YieldRateMaterialSQL.generateYieldRateMaterialRevisionNo(element))
      // ** Insert Total
      const YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID = uuidv7()
      sqlList.push(await YieldRateMaterialSQL.insertYieldRateMaterial(element, YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID))
    }

    await MySQLExecute.executeList(sqlList)

    return {
      Status: true,
      ResultOnDb: [],
      TotalCountOnDb: 0,
      MethodOnDb: 'Create Yield Rate Material',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI
  },
  search: async (dataItem: any) => {
    // if (dataItem.FISCAL_YEAR !== '') {
    //   sqlWhere += " AND tb_5.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'"
    // }
    // if (dataItem.PRODUCT_CATEGORY_ID !== '') {
    //   sqlWhere += " AND tb_1.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID'"
    // }
    // if (dataItem.PRODUCT_MAIN_ID !== '') {
    //   sqlWhere += " AND tb_2.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'"
    // }
    // if (dataItem.PRODUCT_SUB_ID !== '') {
    //   sqlWhere += " AND tb_3.PRODUCT_SUB_ID = 'dataItem.PRODUCT_SUB_ID'"
    // }
    // if (dataItem.PRODUCT_TYPE_CODE !== '') {
    //   sqlWhere += " AND tb_4.PRODUCT_TYPE_CODE_FOR_SCT LIKE '%dataItem.PRODUCT_TYPE_CODE%'"
    // }
    // if (dataItem.PRODUCT_TYPE_NAME !== '') {
    //   sqlWhere += " AND tb_4.PRODUCT_TYPE_NAME LIKE '%dataItem.PRODUCT_TYPE_NAME%'"
    // }
    // // if (dataItem.SCT_REASON_SETTING_ID !== '') {
    // //   sqlWhere += " AND tb_5.SCT_REASON_SETTING_ID = 'dataItem.SCT_REASON_SETTING_ID'"
    // // }
    // // if (dataItem.SCT_TAG_SETTING_ID !== '') {
    // //   sqlWhere += " AND tb_5.SCT_TAG_SETTING_ID = 'dataItem.SCT_TAG_SETTING_ID'"
    // // }

    // ** Mode Process
    const sql = await YieldRateMaterialSQL.search(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  // createMaterialYieldRateData: async (dataItem: any) => {
  //   let sqlList = []

  //   for (let i = 0; i < dataItem.PRODUCT_TYPE_SELECTED.length; i++) {
  //     for (let j = 0; j < dataItem.DATA_MATERIAL_YIELD.length; j++) {
  //       let data = {
  //         FISCAL_YEAR: dataItem.YEAR_SELECTED.label,
  //         PRODUCT_TYPE_ID: dataItem.PRODUCT_TYPE_SELECTED[i].PRODUCT_TYPE_ID,
  //         ITEM_ID: dataItem.DATA_MATERIAL_YIELD[j].ITEM_ID,
  //         YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: dataItem.DATA_MATERIAL_YIELD[j].YIELD,
  //         CREATE_BY: dataItem.CREATE_BY,
  //         UPDATE_BY: dataItem.UPDATE_BY,
  //       }
  //       sqlList.push(await YieldRateMaterialSQL.generateYieldRateMaterialRevisionNo(data))
  //       let checkDuplicateData = (await MySQLExecute.search(await YieldRateMaterialSQL.getMaterialYieldRateDuplicate(data))) as RowDataPacket[]
  //       if (checkDuplicateData.length === 0) {
  //         const YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID = uuidv7()
  //         sqlList.push(await YieldRateMaterialSQL.createMaterialYieldRate(data, YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID))
  //         await MySQLExecute.executeList(sqlList)

  //         return {
  //           Status: true,
  //           ResultOnDb: [],
  //           TotalCountOnDb: 0,
  //           MethodOnDb: 'Create Yield Rate Material',
  //           Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
  //         } as ResponseI
  //       } else {
  //         return {
  //           Status: false,
  //           MethodOnDb: 'Duplicate Data',
  //           Message: 'Duplicate Data',
  //         } as ResponseI
  //       }
  //     }
  //   }

  //   // sqlList.push(await YieldRateMaterialSQL.createMaterialYieldRate(dataItem, uuidv7()))

  //   // await MySQLExecute.executeList(sqlList)

  //   // return {
  //   //   Status: true,
  //   //   ResultOnDb: [],
  //   //   TotalCountOnDb: 0,
  //   //   MethodOnDb: 'Create Yield Rate Material',
  //   //   Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
  //   // } as ResponseI
  // },
  createMaterialYieldRateData: async (dataItem: any) => {
    let sqlList = []

    for (let i = 0; i < dataItem.PRODUCT_TYPE_SELECTED.length; i++) {
      for (let j = 0; j < dataItem.DATA_MATERIAL_YIELD.length; j++) {
        let data = {
          FISCAL_YEAR: dataItem.YEAR_SELECTED.label,
          PRODUCT_TYPE_ID: dataItem.PRODUCT_TYPE_SELECTED[i].PRODUCT_TYPE_ID,
          ITEM_ID: dataItem.DATA_MATERIAL_YIELD[j].ITEM_ID,
          YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: dataItem.DATA_MATERIAL_YIELD[j].YIELD,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.UPDATE_BY,
          SCT_REASON_SETTING_ID: dataItem.SCT_REASON_SETTING_ID,
          PRODUCT_TYPE_CODE: dataItem.PRODUCT_TYPE_SELECTED[i].PRODUCT_TYPE_CODE,
          ITEM_CODE_FOR_SUPPORT_MES: dataItem.DATA_MATERIAL_YIELD[j].ITEM_CODE_FOR_SUPPORT_MES,
        }

        let checkDuplicateData = (await MySQLExecute.search(await YieldRateMaterialSQL.getMaterialYieldRateDuplicate(data))) as RowDataPacket[]

        if (checkDuplicateData.length > 0) {
          return {
            Status: false,
            MethodOnDb: 'Duplicate Data',
            Message: 'Duplicate Data : ไม่สามารถเพิ่มข้อมูลได้เนื่องจากมีข้อมูลซ้ำในระบบ',
          } as ResponseI
        }

        // ถ้าไม่เจอข้อมูลซ้ำ ให้เพิ่มเข้า SQL List
        sqlList.push(await YieldRateMaterialSQL.generateYieldRateMaterialRevisionNo(data))

        const YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID = uuidv7()
        sqlList.push(await YieldRateMaterialSQL.createMaterialYieldRate(data, YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_ID))
      }
    }

    if (sqlList.length > 0) {
      // console.log(sqlList)

      await MySQLExecute.executeList(sqlList)
      return {
        Status: true,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Yield Rate Material',
        Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      } as ResponseI
    }

    return {
      Status: false,
      MethodOnDb: 'No Data Processed',
      Message: 'No new data was added.',
    } as ResponseI
  },
}
