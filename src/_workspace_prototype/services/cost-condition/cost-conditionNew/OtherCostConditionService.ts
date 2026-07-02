import { MySQLExecute } from '@businessData/dbExecute'
import { OtherCostConditionSQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/OtherCostConditionSQL'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'
import { CostConditionSettingService } from '../CostConditionSettingService'

export const OtherCostConditionService = {
  search: async (query: any) => {
    let sqlWhere = ''

    if (query?.PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_1.PRODUCT_MAIN_ID = '${query.PRODUCT_MAIN_ID}'`
    }
    const sql = await OtherCostConditionSQL.search(query, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  create: async (dataItem: any) => {
    let sqlList = []

    let sql = await OtherCostConditionSQL.createVersion(dataItem)
    sqlList.push(sql)

    dataItem.UUID_V7 = uuidv7()

    sql = await OtherCostConditionSQL.create(dataItem)
    sqlList.push(sql)

    sqlList.push(await StandardCostForProductSQL.updateStandardCostForProductByCostCondition(dataItem))

    // const sql = await ExchangeRateSQL.create(dataItem)
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
    let sql = await OtherCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (dbSetting.GA_RATE === 0) {
        resultData[0].GA = 0
      }
      if (dbSetting.MARGIN_RATE === 0) {
        resultData[0].MARGIN = 0
      }
      if (dbSetting.SELLING_EXPENSE_RATE === 0) {
        resultData[0].SELLING_EXPENSE = 0
      }
      if (dbSetting.VAT === 0) {
        resultData[0].VAT = 0
      }
      if (dbSetting.CIT === 0) {
        resultData[0].CIT = 0
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
    let sql = await OtherCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (dbSetting.GA_RATE === 0) {
        resultData[0].GA = 0
      }
      if (dbSetting.MARGIN_RATE === 0) {
        resultData[0].MARGIN = 0
      }
      if (dbSetting.SELLING_EXPENSE_RATE === 0) {
        resultData[0].SELLING_EXPENSE = 0
      }
      if (dbSetting.VAT === 0) {
        resultData[0].VAT = 0
      }
      if (dbSetting.CIT === 0) {
        resultData[0].CIT = 0
      }
    }

    return resultData
  },
}
