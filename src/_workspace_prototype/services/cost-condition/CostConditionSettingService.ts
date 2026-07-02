import { MySQLExecute } from '@businessData/dbExecute'
import { CostConditionSettingSQL } from '@src/_workspace/sql/cost-condition/CostConditionSettingSQL'
import { RowDataPacket } from 'mysql2'

const normalizeStringValue = (value: unknown) => `${value ?? ''}`.trim()

const normalizeYesNoValue = (value: unknown): 'yes' | 'no' | '' | null => {
  const normalizedValue = normalizeStringValue(value).toLowerCase()

  if (!normalizedValue) return ''
  if (normalizedValue === 'yes' || normalizedValue === 'no') return normalizedValue

  return null
}

const normalizeLevelOfIndirectCost = (value: unknown): '' | 'Product Sub' | 'Product Main' | null => {
  const normalizedValue = normalizeStringValue(value).toLowerCase()

  if (!normalizedValue) return ''
  if (normalizedValue === 'product sub') return 'Product Sub'
  if (normalizedValue === 'product main') return 'Product Main'

  return null
}

export const CostConditionSettingService = {
  getExportData: async (productTypeIds: number[]) => {
    if (!productTypeIds || productTypeIds.length === 0) return []
    const ids = productTypeIds.join(',')
    const sqlStr = `
        SELECT
            tb_1.COST_CONDITION_SETTING_ID
          , tb_2.PRODUCT_TYPE_ID
          , tb_2.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
          , tb_2.PRODUCT_TYPE_NAME
          , tb_3.PRODUCT_SUB_NAME
          , tb_4.PRODUCT_MAIN_NAME
          , tb_5.PRODUCT_CATEGORY_NAME
          , tb_7.ITEM_CATEGORY_NAME
          , tb_9.CUSTOMER_INVOICE_TO_NAME
          , tb_1.DIRECT_UNIT_PROCESS_COST
          , tb_1.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
          , tb_1.INDIRECT_COST
          , tb_1.LEVEL_OF_INDIRECT_COST
          , tb_1.SELLING_EXPENSE_RATE
          , tb_1.GA_RATE
          , tb_1.MARGIN_RATE
          , tb_1.CIT
          , tb_1.VAT
          , tb_1.ADJUST_PRICE
          , tb_1.COST_CONDITION_SETTING_VERSION
          , tb_1.CREATE_BY
          , tb_1.CREATE_DATE
          , tb_1.UPDATE_BY
          , tb_1.UPDATE_DATE
        FROM
            PRODUCT_TYPE tb_2
        LEFT JOIN
            cost_condition_setting tb_1 ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID AND tb_1.COST_CONDITION_SETTING_IS_CURRENT = 1
        LEFT JOIN
            PRODUCT_SUB tb_3 ON tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
        LEFT JOIN
            PRODUCT_MAIN tb_4 ON tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
        LEFT JOIN
            PRODUCT_CATEGORY tb_5 ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
        LEFT JOIN
            PRODUCT_TYPE_ITEM_CATEGORY tb_6 ON tb_2.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID AND tb_6.INUSE = 1
        LEFT JOIN
            ITEM_CATEGORY tb_7 ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
        LEFT JOIN
            PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_8 ON tb_2.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID AND tb_8.INUSE = 1
        LEFT JOIN
            CUSTOMER_INVOICE_TO tb_9 ON tb_8.CUSTOMER_INVOICE_TO_ID = tb_9.CUSTOMER_INVOICE_TO_ID
        WHERE tb_2.PRODUCT_TYPE_ID IN (${ids})
    `
    const result = await MySQLExecute.execute(sqlStr)

    if (Array.isArray(result) && Array.isArray(result[0])) {
      return result[0] as RowDataPacket[]
    }

    return (Array.isArray(result) ? result : []) as RowDataPacket[]
  },

  search: async (query: any) => {
    let sqlWhere = ''

    if (query?.SearchFilters && Array.isArray(query.SearchFilters)) {
      query.SearchFilters.forEach((filter: any) => {
        if (filter.value === undefined || filter.value === null || filter.value === '') return

        switch (filter.id) {
          case 'PRODUCT_CATEGORY_ID':
            sqlWhere += ` AND tb_5.PRODUCT_CATEGORY_ID = '${filter.value}'`
            break
          case 'PRODUCT_MAIN_ID':
            sqlWhere += ` AND tb_4.PRODUCT_MAIN_ID = '${filter.value}'`
            break
          case 'PRODUCT_SUB_ID':
            sqlWhere += ` AND tb_3.PRODUCT_SUB_ID = '${filter.value}'`
            break
          case 'PRODUCT_TYPE_ID':
            sqlWhere += ` AND tb_1.PRODUCT_TYPE_ID = '${filter.value}'`
            break
          case 'PRODUCT_TYPE_CODE':
            sqlWhere += ` AND tb_2.PRODUCT_TYPE_CODE_FOR_SCT = '${filter.value}'`
            break
          case 'PRODUCT_TYPE_NAME':
            sqlWhere += ` AND tb_2.PRODUCT_TYPE_NAME = '${filter.value}'`
            break
          case 'ITEM_CATEGORY_ID':
            sqlWhere += ` AND tb_7.ITEM_CATEGORY_ID = '${filter.value}'`
            break
          case 'CUSTOMER_INVOICE_TO_ID':
            sqlWhere += ` AND tb_9.CUSTOMER_INVOICE_TO_ID = '${filter.value}'`
            break
          case 'INDIRECT_COST':
            if (filter.value === 0 || filter.value === 1 || filter.value === '0' || filter.value === '1') {
              sqlWhere += ` AND tb_1.INDIRECT_COST = '${filter.value}'`
            }
            break
          case 'LEVEL_OF_INDIRECT_COST': {
            const levelOfIndirectCost = normalizeLevelOfIndirectCost(filter.value)
            if (levelOfIndirectCost) {
              sqlWhere += ` AND tb_1.LEVEL_OF_INDIRECT_COST = '${levelOfIndirectCost}'`
            }
            break
          }
          case 'costConditionSettingVersionOption':
            if (filter.value === 'Latest') {
              sqlWhere += ' AND tb_1.COST_CONDITION_SETTING_IS_CURRENT = 1'
            } else if (filter.value === 'Not Current') {
              sqlWhere += ' AND tb_1.COST_CONDITION_SETTING_IS_CURRENT = 0'
            }
            // If 'All', do not append anything
            break
          case 'STATUS':
            if (filter.value === 0) {
              sqlWhere += ' AND tb_1.INUSE = 0'
            } else if (filter.value === 1) {
              // Can use
              // sqlWhere +=' AND tb_1.INUSE = 1 AND tb_1.COST_CONDITION_SETTING_IS_CURRENT IS NULL`
              sqlWhere += ' AND tb_1.INUSE = 1'
            } else if (filter.value === 2) {
              // Using
              // sqlWhere += ` AND tb_1.INUSE = 1 AND tb_1.COST_CONDITION_SETTING_IS_CURRENT = 1`
              sqlWhere += ' AND 0 = 1'
            } else if (filter.value === 3) {
              // Can use (Used)
              sqlWhere += ' AND tb_1.INUSE = 1 AND tb_1.COST_CONDITION_SETTING_IS_CURRENT = 0'
            }
            break
          case 'includingCancelled':
            // Handled below
            break
        }
      })
    }

    const isIncludingCancelled = query.SearchFilters?.find((f: any) => f.id === 'includingCancelled')?.value
    if (!isIncludingCancelled) {
      sqlWhere += ' AND tb_1.INUSE = 1'
    }

    const sql = await CostConditionSettingSQL.search(query, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  create: async (dataItems: any[]) => {
    let sqlList: string[] = []

    for (const dataItem of dataItems) {
      let sql = await CostConditionSettingSQL.createVersion(dataItem)
      sqlList.push(sql)

      sql = await CostConditionSettingSQL.create(dataItem)
      sqlList.push(sql)
    }

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  checkDuplicateProductTypeCode(data: any[]) {
    const map = new Map<string, number[]>()

    for (let i = 0; i < data.length; i++) {
      const pCode = data[i].PRODUCT_TYPE_CODE?.trim()

      if (!pCode) continue

      if (!map.has(pCode)) {
        map.set(pCode, [])
      }

      map.get(pCode)!.push(data[i].row)
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

  createByImportFile: async (dataItems: any[]) => {
    let sqlList: string[] = []
    const errorMap = new Map<number, any>()
    const existingCostConditionMap = new Map<number, any>()

    const productTypeResult = await CostConditionSettingService.getUnsettledProductTypes({
      Order: 'tb_1.PRODUCT_TYPE_CODE_FOR_SCT ASC',
      Start: 0,
      Limit: 100000,
      sqlWhereColumnFilter: '',
    })
    const productTypesList = productTypeResult[1] || []
    const productTypeMap = new Map<string, number>()
    productTypesList.forEach((pt: any) => {
      productTypeMap.set(pt.PRODUCT_TYPE_CODE_FOR_SCT, pt.PRODUCT_TYPE_ID)
    })

    const duplicateProductTypeRows = CostConditionSettingService.checkDuplicateProductTypeCode(dataItems)

    // Populate duplicate excel rows error
    for (const dup of duplicateProductTypeRows) {
      if (!errorMap.has(dup.row)) {
        errorMap.set(dup.row, {
          item: dataItems.find((d) => d.row === dup.row),
          row: dup.row,
          errors: {},
        })
      }
      errorMap.get(dup.row).errors.DUPLICATE_CODE = `Product Type Code ซ้ำซ้อนกับแถวที่ ${dup.duplicateWith.join(', ')}`
    }

    for (const dataItem of dataItems) {
      const rowNum = dataItem.row
      let rowError: any = {}

      dataItem.PRODUCT_TYPE_CODE = normalizeStringValue(dataItem.PRODUCT_TYPE_CODE)
      const normalizedIndirectCost = normalizeYesNoValue(dataItem.RAW_INDIRECT_COST)
      const normalizedSellingExpenseRate = normalizeYesNoValue(dataItem.RAW_SELLING_EXPENSE_RATE)
      const normalizedGaRate = normalizeYesNoValue(dataItem.RAW_GA_RATE)
      const normalizedMarginRate = normalizeYesNoValue(dataItem.RAW_MARGIN_RATE)
      const normalizedCit = normalizeYesNoValue(dataItem.RAW_CIT)
      const normalizedAdjustPrice = normalizeYesNoValue(dataItem.RAW_ADJUST_PRICE)
      const normalizedLevelOfIndirectCost = normalizeLevelOfIndirectCost(dataItem.RAW_LEVEL_OF_INDIRECT_COST)
      const isIndirectCostYes = normalizedIndirectCost === 'yes'

      if (normalizedIndirectCost === null) rowError.INVALID_INDIRECT_COST = 'Indirect Cost ต้องเป็น Yes หรือ No'
      if (normalizedSellingExpenseRate === null) {
        rowError.INVALID_SELLING_EXPENSE_RATE = 'Selling Expense Rate ต้องเป็น Yes หรือ No'
      }
      if (normalizedGaRate === null) rowError.INVALID_GA_RATE = 'GA Rate ต้องเป็น Yes หรือ No'
      if (normalizedMarginRate === null) rowError.INVALID_MARGIN_RATE = 'Margin Rate ต้องเป็น Yes หรือ No'
      if (normalizedCit === null) rowError.INVALID_CIT = 'CIT ต้องเป็น Yes หรือ No'
      if (normalizedAdjustPrice === null) rowError.INVALID_ADJUST_PRICE = 'Adjust Price ต้องเป็น Yes หรือ No'
      if (normalizedLevelOfIndirectCost === null) {
        rowError.INVALID_LEVEL_OF_INDIRECT_COST = 'Level of Indirect Cost ต้องเป็น Product Sub หรือ Product Main'
      }
      if (!isIndirectCostYes && normalizedLevelOfIndirectCost) {
        rowError.INVALID_LEVEL_OF_INDIRECT_COST = 'Level of Indirect Cost ต้องว่างเมื่อ Indirect Cost เป็น No'
      }

      if (
        !dataItem.PRODUCT_TYPE_CODE ||
        normalizedIndirectCost === '' ||
        (isIndirectCostYes && normalizedLevelOfIndirectCost === '') ||
        normalizedSellingExpenseRate === '' ||
        normalizedGaRate === '' ||
        normalizedMarginRate === '' ||
        normalizedCit === '' ||
        normalizedAdjustPrice === ''
      ) {
        rowError.INCOMPLETE = 'กรอกข้อมูลไม่ครบ'
      }

      // Parse RAW string into Database Values (1 / 0) for Insert/Update comparisons
      dataItem.DIRECT_UNIT_PROCESS_COST = 1
      dataItem.INDIRECT_RATE_OF_DIRECT_PROCESS_COST = 1
      dataItem.INDIRECT_COST = normalizedIndirectCost === 'yes' ? 1 : 0
      dataItem.LEVEL_OF_INDIRECT_COST = normalizedLevelOfIndirectCost || ''
      dataItem.SELLING_EXPENSE_RATE = normalizedSellingExpenseRate === 'yes' ? 1 : 0
      dataItem.GA_RATE = normalizedGaRate === 'yes' ? 1 : 0
      dataItem.MARGIN_RATE = normalizedMarginRate === 'yes' ? 1 : 0
      dataItem.CIT = normalizedCit === 'yes' ? 1 : 0
      dataItem.ADJUST_PRICE = normalizedAdjustPrice === 'yes' ? 1 : 0
      dataItem.VAT = 0

      if (dataItem.PRODUCT_TYPE_CODE) {
        dataItem.PRODUCT_TYPE_ID = productTypeMap.get(dataItem.PRODUCT_TYPE_CODE)
      }

      // Verify Product Type exists
      if (!dataItem.PRODUCT_TYPE_ID) {
        rowError.INVALID_CODE = 'Product Type Code ไม่ถูกต้องหรือไม่มีในระบบ'
      } else {
        // Auto-detect Action based on DB existence
        let existing = existingCostConditionMap.get(dataItem.PRODUCT_TYPE_ID)

        if (existing === undefined) {
          existing = await CostConditionSettingService.getByProductTypeId({ PRODUCT_TYPE_ID: dataItem.PRODUCT_TYPE_ID })
          existingCostConditionMap.set(dataItem.PRODUCT_TYPE_ID, existing ?? null)
        }

        if (!existing) {
          dataItem.RAW_ACTION = 'Add New'
        } else {
          dataItem.RAW_ACTION = 'Edit'
          dataItem.COST_CONDITION_SETTING_ID = existing.COST_CONDITION_SETTING_ID
          
          // Evaluate if any of the configuration flags or levels have actually changed
          const isChanged =
            Number(dataItem.INDIRECT_COST || 0) !== Number(existing.INDIRECT_COST || 0) ||
            (dataItem.LEVEL_OF_INDIRECT_COST || '').trim() !== (existing.LEVEL_OF_INDIRECT_COST || '').trim() ||
            Number(dataItem.SELLING_EXPENSE_RATE || 0) !== Number(existing.SELLING_EXPENSE_RATE || 0) ||
            Number(dataItem.GA_RATE || 0) !== Number(existing.GA_RATE || 0) ||
            Number(dataItem.MARGIN_RATE || 0) !== Number(existing.MARGIN_RATE || 0) ||
            Number(dataItem.CIT || 0) !== Number(existing.CIT || 0) ||
            Number(dataItem.ADJUST_PRICE || 0) !== Number(existing.ADJUST_PRICE || 0)

          // Reject if exact match
          if (!isChanged) {
            rowError.DUPLICATE_DB = 'ข้อมูลซ้ำกับที่มีอยู่แล้ว (ไม่มีการเปลี่ยนแปลง)'
          }
        }
      }

      // If any row error, accumulate into the map
      if (Object.keys(rowError).length > 0) {
        if (!errorMap.has(rowNum)) {
          errorMap.set(rowNum, {
            item: dataItem,
            row: rowNum,
            errors: {},
          })
        }
        Object.assign(errorMap.get(rowNum).errors, rowError)
      }
    }

    // Abort and return errors if Validation fails completely
    const errorList = Array.from(errorMap.values())
    if (errorList.length > 0) {
      return {
        Status: false,
        ResultOnDb: errorList,
        TotalCountOnDb: 0,
        Message: 'Validation Failed. Please fix the exported file.',
      }
    }

    // Success flow - Insert SQL
    for (const dataItem of dataItems) {
      const existing = existingCostConditionMap.get(dataItem.PRODUCT_TYPE_ID)

      if (existing) {
        dataItem.COST_CONDITION_SETTING_ID = existing.COST_CONDITION_SETTING_ID
        const sqlUpdateOld = await CostConditionSettingSQL.updateVersionOldRow(dataItem)
        sqlList.push(sqlUpdateOld)
      }

      const sqlVersion = await CostConditionSettingSQL.createVersion(dataItem)
      sqlList.push(sqlVersion)

      const sqlInsertNew = await CostConditionSettingSQL.create(dataItem)
      sqlList.push(sqlInsertNew)
    }

    const resultData = await MySQLExecute.executeList(sqlList)
    return {
      Status: true,
      ResultOnDb: resultData,
      Message: 'บันทึกข้อมูลสำเร็จ',
    }
  },
  update: async (dataItem: any) => {
    let sqlList: string[] = []

    const sqlUpdateOld = await CostConditionSettingSQL.updateVersionOldRow(dataItem)
    sqlList.push(sqlUpdateOld)

    const sqlVersion = await CostConditionSettingSQL.createVersion(dataItem)
    sqlList.push(sqlVersion)

    const sqlInsertNew = await CostConditionSettingSQL.create(dataItem)
    sqlList.push(sqlInsertNew)

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  delete: async (dataItem: any) => {
    const sql = await CostConditionSettingSQL.delete(dataItem)
    const resultData = await MySQLExecute.executeList([sql])
    return resultData
  },

  getUnsettledCount: async () => {
    const sql = await CostConditionSettingSQL.getUnsettledCount()
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getUnsettledProductTypes: async (query: any) => {
    let sqlWhere = ''

    if (query?.PRODUCT_TYPE_NAME) {
      sqlWhere += ` AND tb_1.PRODUCT_TYPE_NAME LIKE '%${query.PRODUCT_TYPE_NAME}%'`
    }
    if (query?.PRODUCT_TYPE_CODE) {
      sqlWhere += ` AND tb_1.PRODUCT_TYPE_CODE_FOR_SCT LIKE '%${query.PRODUCT_TYPE_CODE}%'`
    }
    if (query?.PRODUCT_CATEGORY_ID) {
      sqlWhere += ` AND tb_4.PRODUCT_CATEGORY_ID = '${query.PRODUCT_CATEGORY_ID}'`
    }
    if (query?.PRODUCT_MAIN_ID) {
      sqlWhere += ` AND tb_3.PRODUCT_MAIN_ID = '${query.PRODUCT_MAIN_ID}'`
    }
    if (query?.PRODUCT_SUB_ID) {
      sqlWhere += ` AND tb_2.PRODUCT_SUB_ID = '${query.PRODUCT_SUB_ID}'`
    }
    if (query?.CUSTOMER_INVOICE_TO_ID) {
      sqlWhere += ` AND tb_8.CUSTOMER_INVOICE_TO_ID = '${query.CUSTOMER_INVOICE_TO_ID}'`
    }
    if (query?.ITEM_CATEGORY_ID) {
      sqlWhere += ` AND tb_6.ITEM_CATEGORY_ID = '${query.ITEM_CATEGORY_ID}'`
    }

    const sql = await CostConditionSettingSQL.getUnsettledProductTypes(query, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  getByProductTypeId: async (dataItem: { PRODUCT_TYPE_ID: number }) => {
    const sql = await CostConditionSettingSQL.getByProductTypeId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData?.[0]
  },

}
