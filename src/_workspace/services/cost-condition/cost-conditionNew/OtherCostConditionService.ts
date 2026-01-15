import { MySQLExecute } from '@businessData/dbExecute'
import { OtherCostConditionSQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/OtherCostConditionSQL'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'
import LIST_COST_CONDITION_SETTING from '../COST_CONDITION_SETTING'

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
    const COST_CONDITION_SETTING = LIST_COST_CONDITION_SETTING.find(
      (item) => item.PRODUCT_MAIN_ID == dataItem.PRODUCT_MAIN_ID && item.ITEM_CATEGORY_ID == dataItem.ITEM_CATEGORY_ID
    )

    if (!COST_CONDITION_SETTING) {
      throw new Error(`COST_CONDITION_SETTING : Not found data for PRODUCT_MAIN_ID : ${dataItem.PRODUCT_MAIN_ID} and ITEM_CATEGORY_NAME : ${dataItem.ITEM_CATEGORY_NAME}`)
    }
    let sql = await OtherCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (COST_CONDITION_SETTING.VALUE[6] === 0) {
        //GA (%)
        resultData[0].GA = 0
      }
      if (COST_CONDITION_SETTING.VALUE[7] === 0) {
        //MARGIN
        resultData[0].MARGIN = 0
      }
      if (COST_CONDITION_SETTING.VALUE[8] === 0) {
        //SELLING_EXPENSE
        resultData[0].SELLING_EXPENSE = 0
      }
      if (COST_CONDITION_SETTING.VALUE[9] === 0) {
        //VAT
        resultData[0].VAT = 0
      }
      if (COST_CONDITION_SETTING.VALUE[10] === 0) {
        //CIT
        resultData[0].CIT = 0
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
    let sql = await OtherCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (COST_CONDITION_SETTING.VALUE[6] === 0) {
        //GA (%)
        resultData[0].GA = 0
      }
      if (COST_CONDITION_SETTING.VALUE[7] === 0) {
        //MARGIN
        resultData[0].MARGIN = 0
      }
      if (COST_CONDITION_SETTING.VALUE[8] === 0) {
        //SELLING_EXPENSE
        resultData[0].SELLING_EXPENSE = 0
      }
      if (COST_CONDITION_SETTING.VALUE[9] === 0) {
        //VAT
        resultData[0].VAT = 0
      }
      if (COST_CONDITION_SETTING.VALUE[10] === 0) {
        //CIT
        resultData[0].CIT = 0
      }
    }

    return resultData
  },
}
