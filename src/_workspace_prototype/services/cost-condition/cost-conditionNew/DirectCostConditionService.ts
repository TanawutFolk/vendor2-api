import { MySQLExecute } from '@businessData/dbExecute'
import { DirectCostConditionSQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/DirectCostConditionSQL'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'
import { CostConditionSettingService } from '../CostConditionSettingService'

export const DirectCostConditionService = {
  search: async (query: any) => {
    let sqlWhere = ''

    if (query?.PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_1.PRODUCT_MAIN_ID = '${query.PRODUCT_MAIN_ID}'`
    }

    const sql = await DirectCostConditionSQL.search(query, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  create: async (dataItem: any) => {
    let sqlList = []

    let sql = await DirectCostConditionSQL.createVersion(dataItem)
    sqlList.push(sql)

    dataItem.UUID_V7 = uuidv7()

    sql = await DirectCostConditionSQL.create(dataItem)
    sqlList.push(sql)

    sqlList.push(await StandardCostForProductSQL.updateStandardCostForProductByCostCondition(dataItem))

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest: async (dataItem: any) => {
    if (!dataItem.ITEM_CATEGORY_ID) {
      throw new Error('ITEM_CATEGORY_ID is required')
    }
    if (!dataItem.PRODUCT_TYPE_ID) {
      throw new Error('PRODUCT_TYPE_ID is required')
    }
    const dbSetting = await CostConditionSettingService.getByProductTypeId({ PRODUCT_TYPE_ID: dataItem.PRODUCT_TYPE_ID })

    if (!dbSetting) {
      throw new Error(`Cost Condition Setting : ไม่พบข้อมูลสำหรับ PRODUCT_MAIN_ID : ${dataItem.PRODUCT_MAIN_ID} and ITEM_CATEGORY_ID : ${dataItem.ITEM_CATEGORY_ID}`)
    }

    let sql = await DirectCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (dbSetting.DIRECT_UNIT_PROCESS_COST === 0) {
        resultData[0].DIRECT_UNIT_PROCESS_COST = 0
      }
      if (dbSetting.INDIRECT_RATE_OF_DIRECT_PROCESS_COST === 0) {
        resultData[0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST = 0
      }
    }

    return resultData
  },
  getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo: async (dataItem: any) => {
    if (!dataItem.ITEM_CATEGORY_ID) {
      throw new Error('ITEM_CATEGORY_ID is required')
    }
    if (!dataItem.PRODUCT_TYPE_ID) {
      throw new Error('PRODUCT_TYPE_ID is required')
    }
    const dbSetting = await CostConditionSettingService.getByProductTypeId({ PRODUCT_TYPE_ID: dataItem.PRODUCT_TYPE_ID })

    if (!dbSetting) {
      throw new Error(`Cost Condition Setting : ไม่พบข้อมูลสำหรับ PRODUCT_MAIN_ID : ${dataItem.PRODUCT_MAIN_ID} and ITEM_CATEGORY_ID : ${dataItem.ITEM_CATEGORY_ID}`)
    }

    let sql = await DirectCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (dbSetting.DIRECT_UNIT_PROCESS_COST === 0) {
        resultData[0].DIRECT_UNIT_PROCESS_COST = 0
      }
      if (dbSetting.INDIRECT_RATE_OF_DIRECT_PROCESS_COST === 0) {
        resultData[0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST = 0
      }
    }

    return resultData
  },
}
