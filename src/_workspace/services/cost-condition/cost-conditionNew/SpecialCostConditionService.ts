import { MySQLExecute } from '@businessData/dbExecute'
import { SpecialCostConditionSQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/SpecialCostConditionSQL'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'
import LIST_COST_CONDITION_SETTING from '../COST_CONDITION_SETTING'

export const SpecialCostConditionService = {
  search: async (query: any) => {
    let sqlWhere = ''

    if (query?.PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_1.PRODUCT_MAIN_ID = '${query.PRODUCT_MAIN_ID}'`
    }
    const sql = await SpecialCostConditionSQL.search(query, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  create: async (dataItem: any) => {
    let sqlList = []

    let sql = await SpecialCostConditionSQL.createVersion(dataItem)
    sqlList.push(sql)

    dataItem.UUID_V7 = uuidv7()

    sql = await SpecialCostConditionSQL.create(dataItem)
    sqlList.push(sql)

    sqlList.push(await StandardCostForProductSQL.updateStandardCostForProductByCostCondition(dataItem))

    // const sql = await ExchangeRateSQL.create(dataItem)
    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  getAdjustPrice: async (dataItem: any) => {
    let sqlList = []

    let sql = await SpecialCostConditionSQL.getAdjustPrice(dataItem)
    sqlList.push(sql)

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest: async (dataItem: any) => {
    if (!dataItem.ITEM_CATEGORY_ID) {
      throw new Error('ITEM_CATEGORY_ID is required')
    }
    const COST_CONDITION_SETTING = LIST_COST_CONDITION_SETTING.find(
      (item) => item.PRODUCT_MAIN_ID == dataItem.PRODUCT_MAIN_ID && item.ITEM_CATEGORY_ID == dataItem.ITEM_CATEGORY_ID
    )

    if (!COST_CONDITION_SETTING) {
      throw new Error(`COST_CONDITION_SETTING : Not found data for PRODUCT_MAIN_ID : ${dataItem.PRODUCT_MAIN_ID} and ITEM_CATEGORY_NAME : ${dataItem.ITEM_CATEGORY_NAME}`)
    }
    let sql = await SpecialCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (COST_CONDITION_SETTING.VALUE[10] === 0) {
        //ADJUST_PRICE
        resultData[0].ADJUST_PRICE = 0
      }
    }

    return resultData
  },
  getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo: async (dataItem: any) => {
    if (!dataItem.ITEM_CATEGORY_ID) {
      throw new Error('ITEM_CATEGORY_ID is required')
    }
    const COST_CONDITION_SETTING = LIST_COST_CONDITION_SETTING.find(
      (item) => item.PRODUCT_MAIN_ID == dataItem.PRODUCT_MAIN_ID && item.ITEM_CATEGORY_ID == dataItem.ITEM_CATEGORY_ID
    )

    if (!COST_CONDITION_SETTING) {
      throw new Error(`COST_CONDITION_SETTING : Not found data for PRODUCT_MAIN_ID : ${dataItem.PRODUCT_MAIN_ID} and ITEM_CATEGORY_NAME : ${dataItem.ITEM_CATEGORY_NAME}`)
    }
    let sql = await SpecialCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (COST_CONDITION_SETTING.VALUE[10] === 0) {
        //ADJUST_PRICE
        resultData[0].ADJUST_PRICE = 0
      }
    }

    return resultData
  },
}
