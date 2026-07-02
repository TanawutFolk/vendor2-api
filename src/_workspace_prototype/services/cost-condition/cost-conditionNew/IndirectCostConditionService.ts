import { MySQLExecute } from '@businessData/dbExecute'
import { IndirectCostConditionSQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/IndirectCostConditionSQL'
import { RowDataPacket } from 'mysql2'

import { CostConditionSettingService } from '../CostConditionSettingService'

export const IndirectCostConditionService = {
  search: async (query: any) => {
    let sqlWhere = ''
    if (query?.PRODUCT_CATEGORY_ID) {
      sqlWhere += ` AND tb_2.PRODUCT_CATEGORY_ID = '${query.PRODUCT_CATEGORY_ID}'`
    }
    if (query?.PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_1.PRODUCT_MAIN_ID = '${query.PRODUCT_MAIN_ID}'`
    }
    if (query?.PRODUCT_SUB_ID) {
      sqlWhere += ` AND tb_1.PRODUCT_SUB_ID = '${query.PRODUCT_SUB_ID}'`
    }
    if (query.includingCancelled == false) {
      sqlWhere += ' AND tb_1.INUSE = 1'
    }
    if (query.indirectCostConditionOption === 'Latest') {
      sqlWhere += ' AND tb_1.IS_CURRENT = 1'
    }
    if (query.INUSE) {
      sqlWhere += ` AND tb_1.INUSE = ${query.INUSE}`
    }

    const sql = await IndirectCostConditionSQL.search(query, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  checkDuplicateAllFields(data: any[]) {
    const map = new Map<string, number[]>()

    for (let i = 0; i < data.length; i++) {
      const row = data[i]

      // normalize ค่าให้ type ตรงกันก่อนเทียบ
      const key = [
        row.PRODUCT_MAIN_ID ?? 'null',
        row.PRODUCT_SUB_ID ?? 'null',
        Number(row.LABOR ?? 0),
        Number(row.DEPRECIATION ?? 0),
        Number(row.OTHER_EXPENSE ?? 0),
        Number(row.TOTAL_INDIRECT_COST ?? 0),
      ].join('|')

      if (!map.has(key)) {
        map.set(key, [])
      }

      map.get(key)!.push(i + 1) // row number เริ่มที่ 1
    }

    const duplicates: { row: number; duplicateWith: number[] }[] = []

    for (const rows of map.values()) {
      if (rows.length > 1) {
        for (const row of rows) {
          duplicates.push({
            row,
            duplicateWith: rows.filter((r) => r !== row),
          })
        }
      }
    }

    return duplicates
  },
  create: async (dataItem: any) => {
    // console.log(dataItem)
    let sqlList = []
    const errorMap = new Map<number, any>()

    // ✅ เช็ค duplicate ภายใน DATA ก่อน
    const duplicateRows = IndirectCostConditionService.checkDuplicateAllFields(dataItem.DATA)

    for (const dup of duplicateRows) {
      const rowIndex = dup.row - 1
      const row = dataItem.DATA[rowIndex]

      if (!errorMap.has(dup.row)) {
        errorMap.set(dup.row, {
          PRODUCT_MAIN_ID: row.PRODUCT_MAIN_ID,
          PRODUCT_SUB_ID: row.PRODUCT_SUB_ID,
          LABOR: row.LABOR,
          DEPRECIATION: row.DEPRECIATION,
          OTHER_EXPENSE: row.OTHER_EXPENSE,
          TOTAL_INDIRECT_COST: row.TOTAL_INDIRECT_COST,
          row: dup.row,
          errors: {},
        })
      }

      errorMap.get(dup.row).errors.DUPLICATE_ALL_FIELDS = `This row is duplicated with row ${dup.duplicateWith.join(', ')}.`
    }
    let errorList: any[] = []
    for (let i = 0; i < dataItem?.DATA?.length; i++) {
      let rowError: any = {}
      const element = dataItem.DATA[i]
      let checkDataDuplicate = await IndirectCostConditionSQL.checkDuplicateData({
        PRODUCT_MAIN_ID: element.PRODUCT_MAIN_ID,
        PRODUCT_SUB_ID: element.PRODUCT_SUB_ID,
        LABOR: element.LABOR,
        DEPRECIATION: element.DEPRECIATION,
        OTHER_EXPENSE: element.OTHER_EXPENSE,
        TOTAL_INDIRECT_COST: element.TOTAL_INDIRECT_COST,
        FISCAL_YEAR: element.FISCAL_YEAR,
      })
      checkDataDuplicate = await MySQLExecute.search(checkDataDuplicate)
      if (checkDataDuplicate.length > 0) {
        rowError.DUPLICATE_ALL_FIELDS = 'This Indirect Cost Condition already exists in the system.'
      }
      if (Object.keys(rowError).length > 0) {
        if (!errorMap.has(i + 1)) {
          errorMap.set(i + 1, {
            PRODUCT_MAIN_ID: element.PRODUCT_MAIN_ID,
            PRODUCT_MAIN_NAME: element.PRODUCT_MAIN_NAME,
            PRODUCT_SUB_ID: element.PRODUCT_SUB_ID,
            PRODUCT_SUB_NAME: element.PRODUCT_SUB_NAME,
            LABOR: element.LABOR,
            DEPRECIATION: element.DEPRECIATION,
            OTHER_EXPENSE: element.OTHER_EXPENSE,
            TOTAL_INDIRECT_COST: element.TOTAL_INDIRECT_COST,
            FISCAL_YEAR: element.FISCAL_YEAR,
            row: i + 1,
            errors: {},
          })
        }

        Object.assign(errorMap.get(i + 1).errors, rowError)
      }
    }
    errorList = Array.from(errorMap.values())

    if (errorList.length > 0) {
      return {
        Status: false,
        ResultOnDb: errorList,
        TotalCountOnDb: 0,
        MethodOnDb: 'Create IndirectCostCondition',
        Message: 'บันทึกข้อมูลไม่สำเร็จ Duplicate data found',
      }
    }
    for (let i = 0; i < dataItem.DATA.length; i++) {
      const element = dataItem.DATA[i]

      sqlList.push(await IndirectCostConditionSQL.updateIsCurrent(element))

      let sql = await IndirectCostConditionSQL.createVersion(element)
      sqlList.push(sql)

      sql = await IndirectCostConditionSQL.create(element)
      sqlList.push(sql)
    }

    //! please check again 2026-03-03
    // sqlList.push(await StandardCostForProductSQL.updateStandardCostForProductByCostCondition(dataItem))

    const resultData = await MySQLExecute.executeList(sqlList)
    return {
      Status: true,
      ResultOnDb: resultData,
      TotalCountOnDb: 0,
      MethodOnDb: 'Create IndirectCostCondition',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    }
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

    let sql = await IndirectCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
      ...dataItem,
      LEVEL_OF_INDIRECT_COST: dataItem.LEVEL_OF_INDIRECT_COST,
    })
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (dbSetting.INDIRECT_COST === 0) {
        resultData[0].LABOR = 0
        resultData[0].DEPRECIATION = 0
        resultData[0].OTHER_EXPENSE = 0
        resultData[0].TOTAL_INDIRECT_COST = 0
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

    let sql = await IndirectCostConditionSQL.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
      ...dataItem,
      LEVEL_OF_INDIRECT_COST: dataItem.LEVEL_OF_INDIRECT_COST,
    })
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (dbSetting.INDIRECT_COST === 0) {
        resultData[0].LABOR = 0
        resultData[0].DEPRECIATION = 0
        resultData[0].OTHER_EXPENSE = 0
        resultData[0].TOTAL_INDIRECT_COST = 0
      }

      return resultData
    }
  },
  getIndirectCostConditionByIndirectCostConditionId: async (dataItem: any) => {
    let sql = await IndirectCostConditionSQL.getIndirectCostConditionByIndirectCostConditionId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
