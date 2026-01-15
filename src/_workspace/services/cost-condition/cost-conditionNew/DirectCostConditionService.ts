import { MySQLExecute } from '@businessData/dbExecute'
import { DirectCostConditionSQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/DirectCostConditionSQL'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'
import LIST_COST_CONDITION_SETTING from '../COST_CONDITION_SETTING'

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
    const COST_CONDITION_SETTING = LIST_COST_CONDITION_SETTING.find(
      (item) => item.PRODUCT_MAIN_ID == dataItem.PRODUCT_MAIN_ID && item.ITEM_CATEGORY_ID == dataItem.ITEM_CATEGORY_ID
    )

    if (!COST_CONDITION_SETTING) {
      throw new Error(`COST_CONDITION_SETTING : Not found data for PRODUCT_MAIN_ID : ${dataItem.PRODUCT_MAIN_ID} and ITEM_CATEGORY_NAME : ${dataItem.ITEM_CATEGORY_NAME}`)
    }

    let sql = await DirectCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (COST_CONDITION_SETTING.VALUE[0] === 0) {
        //Direct Unit Process Cost (h)
        resultData[0].DIRECT_UNIT_PROCESS_COST = 0
      }
      if (COST_CONDITION_SETTING.VALUE[1] === 0) {
        //Indirect Rate of Direct Process Cost (%)
        resultData[0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST = 0
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

    let sql = await DirectCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (COST_CONDITION_SETTING.VALUE[0] === 0) {
        //Direct Unit Process Cost (h)
        resultData[0].DIRECT_UNIT_PROCESS_COST = 0
      }
      if (COST_CONDITION_SETTING.VALUE[1] === 0) {
        //Indirect Rate of Direct Process Cost (%)
        resultData[0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST = 0
      }
    }

    return resultData
  },
}
