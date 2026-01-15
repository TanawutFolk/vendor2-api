import { MySQLExecute } from '@businessData/dbExecute'
import { IndirectCostConditionSQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/IndirectCostConditionSQL'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'
import LIST_COST_CONDITION_SETTING from '../COST_CONDITION_SETTING'

export const IndirectCostConditionService = {
  search: async (query: any) => {
    let sqlWhere = ''

    if (query?.PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_1.PRODUCT_MAIN_ID = '${query.PRODUCT_MAIN_ID}'`
    }

    const sql = await IndirectCostConditionSQL.search(query, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  create: async (dataItem: any) => {
    let sqlList = []

    let sql = await IndirectCostConditionSQL.createVersion(dataItem)
    sqlList.push(sql)

    dataItem.UUID_V7 = uuidv7()

    sql = await IndirectCostConditionSQL.create(dataItem)
    sqlList.push(sql)

    sqlList.push(await StandardCostForProductSQL.updateStandardCostForProductByCostCondition(dataItem))

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

    let sql = await IndirectCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (COST_CONDITION_SETTING.VALUE[2] === 0) {
        //Labor
        resultData[0].LABOR = 0
      }
      if (COST_CONDITION_SETTING.VALUE[3] === 0) {
        //Depreciation
        resultData[0].DEPRECIATION = 0
      }
      if (COST_CONDITION_SETTING.VALUE[4] === 0) {
        //Other Expense
        resultData[0].OTHER_EXPENSE = 0
      }
      if (COST_CONDITION_SETTING.VALUE[5] === 0) {
        //Total Indirect Cost
        resultData[0].TOTAL_INDIRECT_COST = 0
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

    let sql = await IndirectCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (COST_CONDITION_SETTING.VALUE[2] === 0) {
        //Labor
        resultData[0].LABOR = 0
      }
      if (COST_CONDITION_SETTING.VALUE[3] === 0) {
        //Depreciation
        resultData[0].DEPRECIATION = 0
      }
      if (COST_CONDITION_SETTING.VALUE[4] === 0) {
        //Other Expense
        resultData[0].OTHER_EXPENSE = 0
      }
      if (COST_CONDITION_SETTING.VALUE[5] === 0) {
        //Total Indirect Cost
        resultData[0].TOTAL_INDIRECT_COST = 0
      }

      return resultData
    }
  },
}
