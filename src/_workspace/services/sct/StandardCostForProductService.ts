import { MySQLExecute } from '@businessData/dbExecute'

import { v7 as uuidv7 } from 'uuid'
import { StandardPriceService } from '../manufacturing-item/StandardPriceService'

import { BomSQL } from '@_workspace/sql/bom/BomSQL'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
import { RowDataPacket } from 'mysql2'
import { SctSQL } from '@src/_workspace/sql/sct/SctSQL'
import { SctTagHistorySQL } from '@src/_workspace/sql/sct/SctTagHistorySQL'
import { SctReasonHistorySQL } from '@src/_workspace/sql/sct/SctReasonHistorySQL'
import { SctCompareSQL } from '@src/_workspace/sql/sct/SctCompareSQL'
import { SctFlowProcessSequenceSQL } from '@src/_workspace/sql/sct/SctFlowProcessSequenceSQL'
import { SctProcessingCostByEngineerTotalSQL } from '@src/_workspace/sql/sct/SctProcessingCostByEngineerTotalSQL'
import { SctFlowProcessProcessingCostByEngineerSQL } from '@src/_workspace/sql/sct/SctFlowProcessProcessingCostByEngineerSQL'
import { SctProcessingCostByMfgTotalSQL } from '@src/_workspace/sql/sct/SctProcessingCostByMfgTotalSQL'
import { SctFlowProcessProcessingCostByMfgSQL } from '@src/_workspace/sql/sct/SctFlowProcessProcessingCostByMfgSQL'
import { SctBomFlowProcessItemUsagePriceSQL } from '@src/_workspace/sql/sct/SctBomFlowProcessItemUsagePriceSQL'
import { SctProgressWorkingSQL } from '@src/_workspace/sql/sct/SctProgressWorkingSQL'
import { conditionFormName } from '@src/_workspace/controllers/sct/StandardCostForProductController'
import { ResponseI } from '@src/types/ResponseI'
import { SctComponentTypeResourceOptionSelectionSct } from '@src/_workspace/sql/sct/sct-for-product/SctComponentTypeResourceOptionSelectionSct'
import { YieldRateAndGoStraightRateSQL } from '@src/_workspace/sql/sct/yield-rate-go-straight-rate/YieldRateAndGoStraightRateSQL'
import { SctTotalCostSQL } from '@src/_workspace/sql/sct/sct-for-product/SctTotalCostSQL'
import getSqlWhere_elysia from '@src/helpers/getSqlWhere_elysia'

const conditionName = ['COST_CONDITION', 'MATERIAL_PRICE', 'YR_GR_FROM_ENGINEER', 'TIME_FROM_MFG', 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER']

export const StandardCostForProductService = {
  search: async (
    dataItem: any,
    sqlWhere?: {
      sctRevisionCode_Fns?: 'LIKE' | 'IN'
    }
  ) => {
    //#region
    // กำหนด tableIds
    const tableIds = [
      // Header
      { table: '', id: 'SCT_REVISION_CODE', Fns: sqlWhere?.sctRevisionCode_Fns ?? 'LIKE' },
      { table: '', id: 'FISCAL_YEAR', Fns: 'LIKE' },
      { table: '', id: 'SCT_PATTERN_ID', Fns: '=' },

      // Product
      { table: '', id: 'ITEM_CATEGORY_ID', Fns: '=' },
      { table: '', id: 'PRODUCT_CATEGORY_ID', Fns: '=' },
      { table: '', id: 'PRODUCT_MAIN_ID', Fns: '=' },
      { table: '', id: 'PRODUCT_SUB_ID', Fns: '=' },
      { table: '', id: 'PRODUCT_TYPE_ID', Fns: '=' },

      { table: '', id: 'SCT_REASON_SETTING_ID', Fns: '=' },
      { table: '', id: 'SCT_TAG_SETTING_ID', Fns: '=' },
      { table: '', id: 'SCT_STATUS_PROGRESS_ID', Fns: '=' },
      { table: '', id: 'RE_CAL_UPDATE_DATE', Fns: '=' },
      { table: '', id: 'INDIRECT_COST_MODE', Fns: 'LIKE' },

      { table: '', id: 'CREATE_BY', Fns: 'LIKE' },
      { table: '', id: 'CREATE_DATE', Fns: '=' },
      { table: '', id: 'NOTE', Fns: 'LIKE' },
      { table: '', id: 'DESCRIPTION', Fns: 'LIKE' },
      { table: '', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: '', id: 'UPDATE_DATE', Fns: '=' },
      { table: '', id: 'SCT_STATUS_PROGRESS_NAME', Fns: 'LIKE' },
      { table: '', id: 'PRODUCT_TYPE_CODE', Fns: 'LIKE' },
      { table: '', id: 'SCT_PATTERN_NAME', Fns: 'LIKE' },
      { table: '', id: 'SCT_REASON_SETTING_NAME', Fns: 'LIKE' },
      { table: '', id: 'SCT_TAG_SETTING_NAME', Fns: 'LIKE' },
      { table: '', id: 'ESTIMATE_PERIOD_START_DATE', Fns: '=' },
      { table: '', id: 'ESTIMATE_PERIOD_END_DATE', Fns: '=' },
      { table: '', id: 'CANCEL_REASON', Fns: '=' },
      { table: '', id: 'PRODUCT_CATEGORY_NAME', Fns: 'LIKE' },
      { table: '', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
      { table: '', id: 'PRODUCT_SUB_NAME', Fns: 'LIKE' },
      { table: '', id: 'PRODUCT_TYPE_NAME', Fns: 'LIKE' },
      { table: '', id: 'ITEM_CATEGORY_NAME', Fns: 'LIKE' },
      { table: '', id: 'BOM_CODE', Fns: 'LIKE' },
      { table: '', id: 'FLOW_CODE', Fns: 'LIKE' },
      { table: '', id: 'SELLING_PRICE', Fns: 'LIKE' },
      { table: '', id: 'ADJUST_PRICE', Fns: 'LIKE' },
      { table: '', id: 'CUSTOMER_INVOICE_TO_ALPHABET', Fns: 'LIKE' },
      { table: '', id: 'ASSEMBLY_GROUP_FOR_SUPPORT_MES', Fns: 'LIKE' },
      { table: '', id: 'CUSTOMER_INVOICE_TO_NAME', Fns: 'LIKE' },
      { table: '', id: 'CUSTOMER_INVOICE_TO_ID', Fns: '=' },
      { table: '', id: 'STATUS_UPDATE_BY', Fns: 'LIKE' },
      { table: '', id: 'STATUS_UPDATE_DATE', Fns: '=' },
      { table: '', id: 'ITEM_CODE_FOR_SUPPORT_MES', Fns: 'IN' },
      { table: '', id: 'BOM_ID', Fns: '=' },
      { table: '', id: 'FLOW_ID', Fns: '=' },
    ]

    getSqlWhere_elysia(dataItem, tableIds, 'RE_CAL_UPDATE_DATE_NO_FORMAT')

    if (
      dataItem.SearchFilters.find((item: any) => item.id == 'alreadyHaveSellingPrice') !== '' &&
      dataItem.SearchFilters.find((item: any) => item.id == 'alreadyHaveSellingPrice') !== undefined
    ) {
      if (dataItem.SearchFilters.find((item: any) => item.id == 'alreadyHaveSellingPrice').value === 0) {
        dataItem.sqlWhere += dataItem.sqlWhere.includes('WHERE') ? ' AND SELLING_PRICE IS NULL' : ' WHERE SELLING_PRICE IS NULL'
      } else if (dataItem.SearchFilters.find((item: any) => item.id == 'alreadyHaveSellingPrice').value === 1) {
        dataItem.sqlWhere += dataItem.sqlWhere.includes('WHERE') ? ' AND SELLING_PRICE IS NOT NULL' : ' WHERE SELLING_PRICE IS NOT NULL'
      }
    }

    if (
      dataItem.SearchFilters.find((item: any) => item.id == 'includingCancelled')?.value === false ||
      dataItem.SearchFilters.find((item: any) => item.id == 'includingCancelled')?.value === ''
    ) {
      dataItem.sqlWhere += dataItem.sqlWhere.includes('WHERE') ? ' AND SCT_STATUS_PROGRESS_ID <> 1' : ' WHERE SCT_STATUS_PROGRESS_ID <> 1'
    }

    dataItem.sqlWhere = dataItem.sqlWhere.replace(/WHERE\s+AND/g, 'WHERE ')
    dataItem.sqlWhere = dataItem.sqlWhere.replace(/AND\s+AND/g, 'AND')

    dataItem.sqlLimit = ''

    if (typeof dataItem?.Start === 'number' && typeof dataItem?.Limit === 'number') {
      dataItem.sqlLimit = `LIMIT
                                                dataItem.Start
                                              , dataItem.Limit
                                        `
    }
    //#endregion

    //#region SQL - JOIN
    dataItem.sqlJoin = ''

    if (
      typeof dataItem.SearchFilters.find((item: any) => item.id == 'ITEM_CODE_FOR_SUPPORT_MES')?.value === 'object' &&
      dataItem.SearchFilters.find((item: any) => item.id == 'ITEM_CODE_FOR_SUPPORT_MES')?.value?.length > 0
    ) {
      dataItem.sqlJoin += ` LEFT JOIN
                                            dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_25
                                                    ON tb_1.SCT_ID = tb_25.SCT_ID
                                                    AND tb_25.INUSE = 1
                                                    LEFT JOIN
                                            BOM_FLOW_PROCESS_ITEM_USAGE tb_26
                                                    ON tb_25.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_26.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                                    AND tb_26.INUSE = 1
                                                    LEFT JOIN
                                            ITEM_MANUFACTURING tb_27
                                                    ON tb_26.ITEM_ID = tb_27.ITEM_ID
                                                    AND tb_27.INUSE = 1
                                                    `
    }

    //#endregion SQL - JOIN

    //#region SQL - Select
    dataItem.sqlSelect = ''

    if (
      typeof dataItem.SearchFilters.find((item: any) => item.id == 'ITEM_CODE_FOR_SUPPORT_MES')?.value === 'object' &&
      dataItem.SearchFilters.find((item: any) => item.id == 'ITEM_CODE_FOR_SUPPORT_MES')?.value?.length > 0
    ) {
      dataItem.sqlSelect += `
                  , tb_27.ITEM_CODE_FOR_SUPPORT_MES`
    }
    //#endregion SQL - JOIN

    const sql = await StandardCostForProductSQL.search(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getAllWithWhereCondition_old_version: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getAllWithWhereCondition_old_version(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getSctHeader: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctHeader(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getSctHeaderCompare: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctHeaderCompare(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getSellingPrice: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSellingPrice(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getSellingPriceCompare: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSellingPriceCompare(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getTotalFlowProcess: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getTotalFlowProcess(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getFlowProcess: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getFlowProcess(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getTotalMaterial: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getTotalMaterial(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getMaterial: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getMaterial(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getMaterialCompare: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getMaterialCompare(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getIndirectCostPriceTabsData: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getIndirectCostPriceTabsData(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getIndirectCostPriceTabsDataCompare: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getIndirectCostPriceTabsDataCompare(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  getIndirectCostPriceTabsDataForExport: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getIndirectCostPriceTabsDataForExport(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getIndirectCostPriceTabsDataCompareForExport: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getIndirectCostPriceTabsDataCompareForExport(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getSctComponentTypeResourceOption: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctComponentTypeResourceOption(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getSctCompareData: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctCompareData(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getSctCompareFlowProcess: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctCompareFlowProcess(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getSctCompareMaterial: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctCompareMaterial(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getYieldRateExportDataByProductTypeId: async (dataItem: any) => {
    // ** Check Revision
    let resultData
    let sqlWhere = ''

    let sqlCheck = await YieldRateAndGoStraightRateSQL.GetLastYieldRateRevision(dataItem)
    resultData = (await MySQLExecute.search(sqlCheck)) as RowDataPacket[]

    if (resultData.length > 0) {
      if (resultData[0].FISCAL_YEAR != 0) {
        sqlWhere += ` AND tb_9.FISCAL_YEAR  = '${resultData[0].FISCAL_YEAR}'`
      }
      if (resultData[0].REVISION_NO > 0) {
        sqlWhere += ` AND tb_9.REVISION_NO = '${resultData[0].REVISION_NO}'`
      }

      // console.log('Revision', resultData[0])

      const sql = await StandardCostForProductSQL.getYieldRateExportDataByProductTypeId(dataItem, sqlWhere)
      resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
      return resultData
    }
  },
  getItemPriceAdjustment: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getItemPriceAdjustment(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getYrGrData: async (dataItem: any) => {
    let sql = ''

    if (dataItem.RESOURCE_OPTION_ID === 1 || dataItem.RESOURCE_OPTION_ID === '1') {
      sql = await StandardCostForProductSQL.getYrGrDataLatest(dataItem)
    }

    if (dataItem.RESOURCE_OPTION_ID === 2 || dataItem.RESOURCE_OPTION_ID === '2') {
      sql = await StandardCostForProductSQL.getSctSelection(dataItem)
      const sctSelection = ((await MySQLExecute.search(sql)) as RowDataPacket[])?.[0] ?? {}

      sql = await StandardCostForProductSQL.getYrGrDataBySctId(sctSelection)
    }

    if (dataItem.RESOURCE_OPTION_ID === 4 || dataItem.RESOURCE_OPTION_ID === '4') {
      dataItem['SCT_COMPONENT_TYPE_ID'] = 3

      sql = await StandardCostForProductSQL.getDataMasterSelection(dataItem)
      const YrGrSelection = ((await MySQLExecute.search(sql)) as RowDataPacket[])?.[0] ?? {}

      sql = await StandardCostForProductSQL.getYrGrDataByRevision(YrGrSelection)
    }

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getTimeData: async (dataItem: any) => {
    let sql = ''

    if (dataItem.RESOURCE_OPTION_ID === 1 || dataItem.RESOURCE_OPTION_ID === '1') {
      sql = await StandardCostForProductSQL.getTimeDataLatest(dataItem)
    }

    if (dataItem.RESOURCE_OPTION_ID === 2 || dataItem.RESOURCE_OPTION_ID === '2') {
      sql = await StandardCostForProductSQL.getSctSelection(dataItem)
      const sctSelection = ((await MySQLExecute.search(sql)) as RowDataPacket[])?.[0] ?? {}

      sql = await StandardCostForProductSQL.getTimeDataBySctId(sctSelection)
    }

    if (dataItem.RESOURCE_OPTION_ID === 4 || dataItem.RESOURCE_OPTION_ID === '4') {
      dataItem['SCT_COMPONENT_TYPE_ID'] = 4

      sql = await StandardCostForProductSQL.getDataMasterSelection(dataItem)
      const TimeSelection = ((await MySQLExecute.search(sql)) as RowDataPacket[])?.[0] ?? {}

      sql = await StandardCostForProductSQL.getTimeDataByRevision(TimeSelection)
    }

    const resultData = await MySQLExecute.search(sql)

    return resultData
  },
  getMaterialPriceData: async (dataItem: any) => {
    let sqlList = []

    if (dataItem.RESOURCE_OPTION_ID === 1 || dataItem.RESOURCE_OPTION_ID === '1') {
      sqlList.push(await StandardCostForProductSQL.getMaterialPriceDataLatestRMPackingConsume(dataItem))
      sqlList.push(await StandardCostForProductSQL.getMaterialPriceDataLatestFGSemiFGSubAssy(dataItem))
    }

    if (dataItem.RESOURCE_OPTION_ID === 2 || dataItem.RESOURCE_OPTION_ID === '2') {
      let sql = await StandardCostForProductSQL.getSctSelection(dataItem)
      const sctSelection = ((await MySQLExecute.search(sql)) as RowDataPacket[])?.[0] ?? {}

      sqlList.push(await StandardCostForProductSQL.getMaterialPriceDataBySctId(sctSelection))
    }

    const resultData = await MySQLExecute.searchList(sqlList)
    return resultData
  },
  getYrAccumulationMaterialData: async (dataItem: any) => {
    let sql = ''

    if (dataItem.RESOURCE_OPTION_ID === 1 || dataItem.RESOURCE_OPTION_ID === '1') {
      sql = await StandardCostForProductSQL.getYrAccumulationMaterialDataLatest(dataItem)
    }

    if (dataItem.RESOURCE_OPTION_ID === 2 || dataItem.RESOURCE_OPTION_ID === '2') {
      sql = await StandardCostForProductSQL.getSctSelection(dataItem)
      const sctSelection = ((await MySQLExecute.search(sql)) as RowDataPacket[])?.[0] ?? {}

      sql = await StandardCostForProductSQL.getYrAccumulationMaterialDataBySctId(sctSelection)
    }

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getSctFormDetail: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctFormDetail(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getSctDataDetail: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctDataDetail(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getSctDetailForAdjust: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctDetailForAdjust(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getSctDataOptionSelection: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctDataOptionSelection(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getSctDataFlowProcess: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctDataFlowProcess(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getSctDataMaterial: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctDataMaterial(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getSctFComponentTypeResourceOption: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getSctFComponentTypeResourceOption(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  searchCostConditionIdByProductTypeIdAndSctLatest: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.searchCostConditionIdByProductTypeIdAndSctLatest(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  searchCostConditionBySctFId: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.searchCostConditionBySctFId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  searchProductType: async (dataItem: any) => {
    let sqlWhere = ''

    if (dataItem?.PRODUCT_TYPE_ID) {
      sqlWhere += `AND tb_1.PRODUCT_TYPE_ID = '${dataItem.PRODUCT_TYPE_ID}'`
    }

    const sql = await StandardCostForProductSQL.searchProductType(dataItem, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  searchStandardFormProductType: async (dataItem: any) => {
    let sqlWhere = ''

    if (dataItem?.PRODUCT_TYPE_ID) {
      sqlWhere += `AND tb_4.PRODUCT_TYPE_ID = '${dataItem.PRODUCT_TYPE_ID}'`
    }
    if (dataItem?.PRODUCT_CATEGORY_ID) {
      sqlWhere += `AND tb_10.PRODUCT_CATEGORY_ID = '${dataItem.PRODUCT_CATEGORY_ID}'`
    }
    if (dataItem?.PRODUCT_MAIN_ID) {
      sqlWhere += `AND tb_9.PRODUCT_MAIN_ID = '${dataItem.PRODUCT_MAIN_ID}'`
    }
    if (dataItem?.PRODUCT_SUB_ID) {
      sqlWhere += `AND tb_8.PRODUCT_SUB_ID = '${dataItem.PRODUCT_SUB_ID}'`
    }
    if (dataItem?.FISCAL_YEAR) {
      sqlWhere += `AND tb_1.FISCAL_YEAR = '${dataItem.FISCAL_YEAR}'`
    }
    if (dataItem?.FLOW_NAME) {
      sqlWhere += `AND tb_11.FLOW_NAME = '${dataItem.FLOW_NAME}'`
    }
    if (dataItem?.SCT_PATTERN_ID) {
      sqlWhere += `AND tb_12.SCT_PATTERN_ID = '${dataItem.SCT_PATTERN_ID}'`
    }
    if (dataItem?.SCT_REASON_SETTING_ID) {
      sqlWhere += `AND tb_14.SCT_REASON_SETTING_ID = '${dataItem.SCT_REASON_SETTING_ID}'`
    }
    if (dataItem?.SCT_TAG_SETTING_ID) {
      sqlWhere += `AND tb_16.SCT_TAG_SETTING_ID = '${dataItem.SCT_TAG_SETTING_ID}'`
    }

    const sql = await StandardCostForProductSQL.searchStandardFormProductType(dataItem, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  createSctData: async (dataItem: any) => {
    let sqlList = []
    let resultData: any

    // SCT_STATUS_PROGRESS_ID
    // 1	SCT Form - BOM Preparing
    // 2	SCT Data - Preparing
    // 3	SCT Data - Prepared
    // 4	SCT Complete
    // 5	SCT Checking
    // 6	SCT Waiting Approve
    // 7	SCT Can use
    // 0	Cancelled

    const isNewSct: boolean = !!!dataItem['SCT_ID']

    // TODO : Header
    if (isNewSct) {
      // func : generate SCT_ID
      dataItem['SCT_ID'] = uuidv7()

      // header
      sqlList.push(await SctSQL.insertBySctCode_Variable(dataItem))
    }

    // tag
    // ? can update before '.....' status only
    if (dataItem['SCT_STATUS_PROGRESS_ID'] <= 4) {
      // ? can be optional
      if (dataItem['SCT_TAG_SETTING_ID'] !== '') {
        if (dataItem['SCT_TAG_SETTING_ID'] === 1) {
          // 1 => Budget
          resultData = await SctSQL.getByProductTypeIdAndFiscalYearAndSctPatternIdAndSctTagSettingId(dataItem)

          if (resultData.length > 0 && resultData[0]['SCT_ID'] != dataItem['SCT_ID']) {
            sqlList.push(await SctTagHistorySQL.deleteBySctId({ ...dataItem, SCT_ID: resultData[0]['SCT_ID'] }))
            sqlList.push(await SctTagHistorySQL.insert(dataItem))
          }
        } else if (dataItem['SCT_TAG_SETTING_ID'] === 2) {
          // 2 => Price
          resultData = await SctSQL.getByProductTypeIdAndSctTagSettingId(dataItem)

          if (resultData.length > 0 && resultData[0]['SCT_ID'] != dataItem['SCT_ID']) {
            sqlList.push(await SctTagHistorySQL.deleteBySctId({ ...dataItem, SCT_ID: resultData[0]['SCT_ID'] }))
            sqlList.push(await SctTagHistorySQL.insert(dataItem))
          }
        } else if (dataItem['SCT_TAG_SETTING_ID'] === 3) {
          // 2 => Mes
          resultData = await SctSQL.getByProductTypeIdAndSctTagSettingId(dataItem)

          if (resultData.length > 0 && resultData[0]['SCT_ID'] != dataItem['SCT_ID']) {
            sqlList.push(await SctTagHistorySQL.deleteBySctId({ ...dataItem, SCT_ID: resultData[0]['SCT_ID'] }))
            sqlList.push(await SctTagHistorySQL.insert(dataItem))
          }
        } else {
          throw new Error('SCT_TAG_SETTING_ID ไม่ถูกต้อง')
        }
      }
    }

    // reason
    // ? can update before '.....' status only
    if (dataItem['SCT_STATUS_PROGRESS_ID'] <= 4) {
      if (isNewSct === false) {
        sqlList.push(await SctReasonHistorySQL.deleteBySctId(dataItem))
      }
      // ? can't be optional
      sqlList.push(await SctReasonHistorySQL.insert(dataItem))
    }

    // note
    // ? can update before 'Prepared' status only
    if (isNewSct === false) {
      // ? include in func : insertBySctCode_Variable
      if (dataItem['SCT_STATUS_PROGRESS_ID'] <= 4) {
        sqlList.push(await SctSQL.updateNoteBySctId(dataItem))
      }
    }

    // estimate period
    // ? can update before '.....' status only
    if (isNewSct === false) {
      // ? include in func : insertBySctCode_Variable
      if (dataItem['SCT_STATUS_PROGRESS_ID'] <= 4) {
        sqlList.push(await SctSQL.updateEstimatePeriodBySctId(dataItem))
      }
    }

    // sct compare
    // ? can update before '.....' status only
    if (dataItem['SCT_STATUS_PROGRESS_ID'] <= 4) {
      if (isNewSct === false) {
        sqlList.push(await SctCompareSQL.deleteBySctId(dataItem))
      }

      dataItem['LIST_SCT_COMPARE'].forEach(async (element: any) => {
        sqlList.push(await SctCompareSQL.insert(element))
      })
    }

    // TODO : Flow Process Sequence
    // ? can update before '.....' status only
    if (dataItem['SCT_STATUS_PROGRESS_ID'] <= 4) {
      if (isNewSct === false) {
        sqlList.push(await SctFlowProcessSequenceSQL.deleteBySctId(dataItem))
      }
      dataItem['LIST_FLOW_PROCESS_SEQUENCE'].forEach(async (element: any) => {
        sqlList.push(await SctFlowProcessSequenceSQL.insert(element))
      })
    }

    // TODO : Processing Cost By ENG
    // ? can update before '.....' status only
    if (dataItem['SCT_STATUS_PROGRESS_ID'] <= 4) {
      // by total
      if (isNewSct === false) {
        sqlList.push(await SctProcessingCostByEngineerTotalSQL.deleteBySctId(dataItem))
      }
      sqlList.push(await SctProcessingCostByEngineerTotalSQL.insert(dataItem))

      // by process
      if (isNewSct === false) {
        sqlList.push(await SctFlowProcessProcessingCostByEngineerSQL.deleteBySctId(dataItem))
      }
      dataItem['LIST_FLOW_PROCESS_PROCESSING_COST_ENG'].forEach(async (element: any) => {
        sqlList.push(await SctFlowProcessProcessingCostByEngineerSQL.insert(element))
      })
    }

    // TODO : Processing Cost By MFG
    // ? can update before '.....' status only
    if (dataItem['SCT_STATUS_PROGRESS_ID'] <= 4) {
      // by total
      if (isNewSct === false) {
        sqlList.push(await SctProcessingCostByMfgTotalSQL.deleteBySctId(dataItem))
      }
      sqlList.push(await SctProcessingCostByMfgTotalSQL.insert(dataItem))

      // by process
      if (isNewSct === false) {
        sqlList.push(await SctFlowProcessProcessingCostByMfgSQL.deleteBySctId(dataItem))
      }
      dataItem['LIST_FLOW_PROCESS_PROCESSING_COST_MFG'].forEach(async (element: any) => {
        sqlList.push(await SctFlowProcessProcessingCostByMfgSQL.insert(element))
      })
    }

    // TODO : Item Cost
    if (isNewSct === false) {
      sqlList.push(await SctBomFlowProcessItemUsagePriceSQL.deleteBySctId(dataItem))
    }
    dataItem['LIST_SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE'].forEach(async (element: any) => {
      sqlList.push(await SctBomFlowProcessItemUsagePriceSQL.insert(element))
    })

    // TODO :

    // TODO : Other
    // Update By , Update Date
    if (isNewSct === false) {
      sqlList.push(await SctSQL.updateUpdateByAndUpdateDateBySctId(dataItem))
    }

    // progress working
    if (isNewSct === false) {
      sqlList.push(await SctProgressWorkingSQL.deleteBySctId(dataItem))
    }
    sqlList.push(await SctProgressWorkingSQL.insert(dataItem))

    resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  updateSctData: async (dataItem: {
    saveMode: 'Save Detail Only' | 'Save Data for Cal'
    isDraft: boolean
    sct: {
      SCT_ID: string
      CREATE_BY: string
      UPDATE_BY: string
      ESTIMATE_PERIOD_START_DATE: string
      ESTIMATE_PERIOD_END_DATE: string
      NOTE: string
    }
    sct_progress_working: {
      SCT_ID: string
      SCT_STATUS_WORKING_ID: number
      SCT_STATUS_PROGRESS_ID: number
      CREATE_BY: string
      UPDATE_BY: string
    }
    sct_compare: {
      SCT_COMPARE_NO: number
      SCT_ID: string
      SCT_ID_FOR_COMPARE: string
      IS_DEFAULT_EXPORT_COMPARE: number
      CREATE_BY: string
      UPDATE_BY: string
    }[]
    sct_detail_for_adjust: {
      SCT_ID: string
      IS_FROM_SCT_COPY: number

      TOTAL_INDIRECT_COST: number | ''
      CIT: number | ''
      VAT: number | ''
      GA: number | ''
      MARGIN: number | ''
      SELLING_EXPENSE: number | ''
      ADJUST_PRICE: number | ''
      REMARK_FOR_ADJUST_PRICE: string | ''

      TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID: number | ''
      CIT_SCT_RESOURCE_OPTION_ID: number | ''
      VAT_SCT_RESOURCE_OPTION_ID: number | ''
      GA_SCT_RESOURCE_OPTION_ID: number | ''
      MARGIN_SCT_RESOURCE_OPTION_ID: number | ''
      SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID: number | ''
      ADJUST_PRICE_SCT_RESOURCE_OPTION_ID: number | ''

      CREATE_BY: string
      UPDATE_BY: string
    }
    sct_master_data_history: {
      SCT_ID: string
      IS_FROM_SCT_COPY: number
      SCT_MASTER_DATA_SETTING_ID: number
      FISCAL_YEAR: number
      VERSION_NO: number
      CREATE_BY: string
      UPDATE_BY: string
    }[]
    sct_component_type_resource_option_select: {
      SCT_ID: string
      SCT_COMPONENT_TYPE_ID: number
      SCT_RESOURCE_OPTION_ID: number
      IS_FROM_SCT_COPY: number
      CREATE_BY: string
      UPDATE_BY: string
    }[]
  }) => {
    let sqlList = []
    let resultData

    if (dataItem.saveMode === 'Save Data for Cal') {
      if (dataItem.sct_component_type_resource_option_select.length !== 8) {
        throw new Error('sct_component_type_resource_option_select is not 8')
      }
      if (dataItem.sct_master_data_history.length !== 6) {
        throw new Error('sct_master_data_history is not 6')
      }

      //#region SCT Progress Working
      sqlList.push(
        await StandardCostForProductSQL.deleteSctProgressWorking({
          SCT_ID: dataItem.sct.SCT_ID,
          UPDATE_BY: dataItem.sct.UPDATE_BY,
        })
      )

      sqlList.push(
        await StandardCostForProductSQL.generateSctProgressWorkingNo({
          SCT_ID: dataItem.sct.SCT_ID,
        })
      )
      sqlList.push(
        await StandardCostForProductSQL.insertSctProgressWorking({
          SCT_PROGRESS_WORKING_ID: uuidv7(),
          SCT_ID: dataItem.sct_progress_working.SCT_ID,
          SCT_STATUS_PROGRESS_ID: dataItem.sct_progress_working.SCT_STATUS_PROGRESS_ID,
          SCT_STATUS_WORKING_ID: dataItem.sct_progress_working.SCT_STATUS_WORKING_ID,
          CREATE_BY: dataItem.sct_progress_working.CREATE_BY,
          UPDATE_BY: dataItem.sct_progress_working.UPDATE_BY,
        })
      )
      //#endregion SCT Progress Working

      //#region SCT
      sqlList.push(
        await SctSQL.updateEstimatePeriodAndNoteBySctId({
          SCT_ID: dataItem.sct.SCT_ID,
          ESTIMATE_PERIOD_START_DATE: dataItem.sct.ESTIMATE_PERIOD_START_DATE,
          ESTIMATE_PERIOD_END_DATE: dataItem.sct.ESTIMATE_PERIOD_END_DATE,
          NOTE: dataItem.sct.NOTE,
          UPDATE_BY: dataItem.sct.UPDATE_BY,
        })
      )
      //#endregion SCT

      //#region SCT Compare
      sqlList.push(
        await SctSQL.deleteSctCompareBySctId({
          SCT_ID: dataItem.sct.SCT_ID,
          UPDATE_BY: dataItem.sct.UPDATE_BY,
        })
      )

      for (let i = 0; i < dataItem.sct_compare.length; i++) {
        const element = dataItem.sct_compare[i]

        if (!element.SCT_ID_FOR_COMPARE) continue

        sqlList.push(
          await SctSQL.insertSctCompare({
            SCT_COMPARE_ID: uuidv7(),
            SCT_COMPARE_NO: element.SCT_COMPARE_NO,
            SCT_ID: element.SCT_ID,
            SCT_ID_FOR_COMPARE: element.SCT_ID_FOR_COMPARE,
            IS_DEFAULT_EXPORT_COMPARE: element.IS_DEFAULT_EXPORT_COMPARE,
            CREATE_BY: element.CREATE_BY,
            UPDATE_BY: element.UPDATE_BY,
          })
        )
      }
      //#endregion SCT Compare

      //#region SCT Detail For Adjust
      sqlList.push(
        await SctSQL.deleteSctDetailForAdjustBySctId({
          SCT_ID: dataItem.sct_detail_for_adjust.SCT_ID,
          UPDATE_BY: dataItem.sct_detail_for_adjust.UPDATE_BY,
          IS_FROM_SCT_COPY: dataItem.sct_detail_for_adjust.IS_FROM_SCT_COPY,
        })
      )

      sqlList.push(
        await SctSQL.insertSctDetailForAdjust({
          SCT_ID: dataItem.sct.SCT_ID,
          SCT_DETAIL_FOR_ADJUST_ID: uuidv7(),
          TOTAL_INDIRECT_COST: dataItem.sct_detail_for_adjust.TOTAL_INDIRECT_COST,
          CIT: dataItem.sct_detail_for_adjust.CIT,
          VAT: dataItem.sct_detail_for_adjust.VAT,
          GA: dataItem.sct_detail_for_adjust.GA,
          MARGIN: dataItem.sct_detail_for_adjust.MARGIN,
          SELLING_EXPENSE: dataItem.sct_detail_for_adjust.SELLING_EXPENSE,
          ADJUST_PRICE: dataItem.sct_detail_for_adjust.ADJUST_PRICE,
          IS_FROM_SCT_COPY: dataItem.sct_detail_for_adjust.IS_FROM_SCT_COPY,
          TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID: dataItem.sct_detail_for_adjust.TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID,
          CIT_SCT_RESOURCE_OPTION_ID: dataItem.sct_detail_for_adjust.CIT_SCT_RESOURCE_OPTION_ID,
          VAT_SCT_RESOURCE_OPTION_ID: dataItem.sct_detail_for_adjust.VAT_SCT_RESOURCE_OPTION_ID,
          GA_SCT_RESOURCE_OPTION_ID: dataItem.sct_detail_for_adjust.GA_SCT_RESOURCE_OPTION_ID,
          MARGIN_SCT_RESOURCE_OPTION_ID: dataItem.sct_detail_for_adjust.MARGIN_SCT_RESOURCE_OPTION_ID,
          SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID: dataItem.sct_detail_for_adjust.SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID,
          ADJUST_PRICE_SCT_RESOURCE_OPTION_ID: dataItem.sct_detail_for_adjust.ADJUST_PRICE_SCT_RESOURCE_OPTION_ID,
          CREATE_BY: dataItem.sct.CREATE_BY,
          UPDATE_BY: dataItem.sct.UPDATE_BY,
        })
      )
      //#endregion SCT Detail For Adjust

      //#region update Sct Total Cost
      sqlList.push(
        await SctSQL.deleteAdjustPriceSctTotalCostBySctId({
          SCT_ID: dataItem.sct_detail_for_adjust.SCT_ID,
          UPDATE_BY: dataItem.sct_detail_for_adjust.UPDATE_BY,
          IS_FROM_SCT_COPY: dataItem.sct_detail_for_adjust.IS_FROM_SCT_COPY,
        })
      )
      //#endregion update Sct Total Cost

      //#region sct_component_type_resource_option_select
      sqlList.push(
        await StandardCostForProductSQL.deleteSctComponentTypeResourceOptionSelect({
          SCT_ID: dataItem.sct.SCT_ID,
          UPDATE_BY: dataItem.sct.UPDATE_BY,
          IS_FROM_SCT_COPY: 0,
        })
      )

      for (let i = 0; i < dataItem.sct_component_type_resource_option_select.length; i++) {
        const element = dataItem.sct_component_type_resource_option_select[i]

        sqlList.push(
          await StandardCostForProductSQL.insertSctComponentTypeResourceOptionSelect({
            SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: uuidv7(),
            IS_FROM_SCT_COPY: element.IS_FROM_SCT_COPY,
            SCT_ID: element.SCT_ID,
            SCT_COMPONENT_TYPE_ID: element.SCT_COMPONENT_TYPE_ID,
            SCT_RESOURCE_OPTION_ID: element.SCT_RESOURCE_OPTION_ID,
            CREATE_BY: element.CREATE_BY,
            UPDATE_BY: element.UPDATE_BY,
          })
        )
      }
      //#endregion sct_component_type_resource_option_select

      //#region sct_master_data_history
      sqlList.push(
        await StandardCostForProductSQL.deleteSctMasterDataHistory({
          SCT_ID: dataItem.sct.SCT_ID,
          UPDATE_BY: dataItem.sct.UPDATE_BY,
          IS_FROM_SCT_COPY: 0,
        })
      )

      for (let i = 0; i < dataItem.sct_master_data_history.length; i++) {
        const element = dataItem.sct_master_data_history[i]

        sqlList.push(
          await StandardCostForProductSQL.insertSctMasterDataHistory({
            SCT_ID: element.SCT_ID,
            SCT_MASTER_DATA_SETTING_ID: element.SCT_MASTER_DATA_SETTING_ID,
            FISCAL_YEAR: element.FISCAL_YEAR,
            IS_FROM_SCT_COPY: element.IS_FROM_SCT_COPY,
            VERSION_NO: element.VERSION_NO,
            CREATE_BY: element.CREATE_BY,
            UPDATE_BY: element.UPDATE_BY,
          })
        )
      }
      //#endregion sct_master_data_history
    } else if (dataItem.saveMode === 'Save Detail Only') {
      //#region SCT
      sqlList.push(
        await SctSQL.updateEstimatePeriodAndNoteBySctId({
          SCT_ID: dataItem.sct.SCT_ID,
          ESTIMATE_PERIOD_START_DATE: dataItem.sct.ESTIMATE_PERIOD_START_DATE,
          ESTIMATE_PERIOD_END_DATE: dataItem.sct.ESTIMATE_PERIOD_END_DATE,
          NOTE: dataItem.sct.NOTE,
          UPDATE_BY: dataItem.sct.UPDATE_BY,
        })
      )
      //#endregion SCT

      //#region SCT Compare
      sqlList.push(
        await SctSQL.deleteSctCompareBySctId({
          SCT_ID: dataItem.sct.SCT_ID,
          UPDATE_BY: dataItem.sct.UPDATE_BY,
        })
      )

      for (let i = 0; i < dataItem.sct_compare.length; i++) {
        const element = dataItem.sct_compare[i]

        if (!element.SCT_ID_FOR_COMPARE) continue

        sqlList.push(
          await SctSQL.insertSctCompare({
            SCT_COMPARE_ID: uuidv7(),
            SCT_COMPARE_NO: element.SCT_COMPARE_NO,
            SCT_ID: element.SCT_ID,
            SCT_ID_FOR_COMPARE: element.SCT_ID_FOR_COMPARE,
            IS_DEFAULT_EXPORT_COMPARE: element.IS_DEFAULT_EXPORT_COMPARE,
            CREATE_BY: element.CREATE_BY,
            UPDATE_BY: element.UPDATE_BY,
          })
        )
      }
      //#endregion SCT Compare
    } else {
      throw new Error('Save Mode not found')
    }

    resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  create: async (dataItem: any) => {
    let sqlList = []

    if (!dataItem.IS_DRAFT) {
      sqlList.push(await StandardCostForProductSQL.generateSctCode(dataItem))

      let startDate = new Date(dataItem?.START_DATE)
      startDate.setHours(startDate.getHours() + 7)
      startDate.setUTCHours(0, 0, 0, 0)

      let endDate = new Date(dataItem?.END_DATE)
      endDate.setHours(endDate.getHours() + 7)
      endDate.setUTCHours(0, 0, 0, 0)

      dataItem.START_DATE = startDate.toISOString().split('T')[0]
      dataItem.END_DATE = endDate.toISOString().split('T')[0]

      const UUID_SCT_ID = uuidv7()
      sqlList.push(await StandardCostForProductSQL.insertSct(dataItem, UUID_SCT_ID))

      const UUID_SCT_F_ID = uuidv7()
      sqlList.push(await StandardCostForProductSQL.insertSctF(dataItem, UUID_SCT_F_ID))

      const UUID_SCT_F_REASON_HISTORY_ID = uuidv7()
      dataItem.UUID_SCT_F_ID = UUID_SCT_F_ID

      sqlList.push(await StandardCostForProductSQL.insertSctFReasonHistory(dataItem, UUID_SCT_F_REASON_HISTORY_ID))

      if (dataItem?.SCT_TAG_SETTING) {
        const UUID_SCT_F_TAG_HISTORY_ID = uuidv7()

        sqlList.push(await StandardCostForProductSQL.insertSctFTagHistory(dataItem, UUID_SCT_F_TAG_HISTORY_ID))
      }

      const UUID_SCT_SCT_F_ID = uuidv7()
      dataItem.UUID_SCT_ID = UUID_SCT_ID
      dataItem.UUID_SCT_F_ID = UUID_SCT_F_ID
      sqlList.push(await StandardCostForProductSQL.insertSctSctF(dataItem, UUID_SCT_SCT_F_ID))

      const UUID_SCT_F_S_ID = uuidv7()
      sqlList.push(await StandardCostForProductSQL.insertSctFS(dataItem, UUID_SCT_F_S_ID))

      for (let i = 1; i <= conditionFormName.length; i++) {
        const UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()
        const UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()

        const dataTemp = {
          UUID_SCT_F_ID: UUID_SCT_F_ID,
          UUID_SCT_ID: UUID_SCT_ID,
          SCT_F_COMPONENT_TYPE_ID: i,
          SCT_F_RESOURCE_OPTION_ID: dataItem[conditionFormName[i - 1]],
          RESOURCE_OPTION_DESCRIPTION:
            dataItem[conditionFormName[i - 1]] == 2 && conditionName[i - 1] !== 'COST_CONDITION'
              ? JSON.stringify(dataItem[conditionName[i - 1]])
              : dataItem[conditionFormName[i - 1]] == 4
                ? JSON.stringify(dataItem[conditionName[i - 1]])
                : '',
          CREATE_BY: dataItem.CREATE_BY,
        }

        sqlList.push(await StandardCostForProductSQL.insertSctFComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))
        sqlList.push(
          await StandardCostForProductSQL.insertSctComponentTypeResourceOptionSelect({
            SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
            SCT_ID: UUID_SCT_ID,
            SCT_COMPONENT_TYPE_ID: i,
            SCT_RESOURCE_OPTION_ID: dataItem[conditionFormName[i - 1]],
            CREATE_BY: dataItem.CREATE_BY,
            UPDATE_BY: dataItem.CREATE_BY,
            IS_FROM_SCT_COPY: 0,
          })
        )

        //* Insert sct data (for preparing) if RESOURCE_OPTION_ID = 2, 4
        //* if RESOURCE_OPTION_ID = 1, 3 => will insert after sct status is prepared

        //* Cost Condition
        if (conditionFormName[i - 1] === 'COST_CONDITION_RESOURCE_OPTION_ID') {
          if (dataItem[conditionFormName[i - 1]] === '2') {
            const costCondition = {
              DIRECT_COST_CONDITION_ID: dataItem.COST_CONDITION.DIRECT_COST_CONDITION.DIRECT_COST_CONDITION_ID,
              INDIRECT_COST_CONDITION_ID: dataItem.COST_CONDITION.INDIRECT_COST_CONDITION.INDIRECT_COST_CONDITION_ID,
              OTHER_COST_CONDITION_ID: dataItem.COST_CONDITION.OTHER_COST_CONDITION.OTHER_COST_CONDITION_ID,
              SPECIAL_COST_CONDITION_ID: dataItem.COST_CONDITION.SPECIAL_COST_CONDITION.SPECIAL_COST_CONDITION_ID,
            }

            const dataTempForDirectCostCondition = {
              SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))

            const dataTempForIndirectCostCondition = {
              SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))

            const dataTempForOtherCostCondition = {
              SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))

            const dataTempForSpecialCostCondition = {
              SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
          } else if (dataItem[conditionFormName[i - 1]] === '4') {
            const costCondition: any = (await StandardCostForProductService.searchCostConditionBySctFId(dataItem))[0]

            const dataTempForDirectCostCondition = {
              SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))

            const dataTempForIndirectCostCondition = {
              SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))

            const dataTempForOtherCostCondition = {
              SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))

            const dataTempForSpecialCostCondition = {
              SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
          }
        } else if (conditionFormName[i - 1] === 'MATERIAL_PRICE_RESOURCE_OPTION_ID') {
          const materialInProcess: any[] = Object.values(dataItem.MATERIAL_IN_PROCESS)

          const itemIds = materialInProcess.map((item) => item.ITEM.ITEM_ID)

          if (dataItem[conditionFormName[i - 1]] === '2') {
            let itemMSPriceId: any[] = await StandardPriceService.getStandardPriceByItemId(itemIds, dataItem.MATERIAL_PRICE.FISCAL_YEAR)

            itemMSPriceId = itemMSPriceId.map((item) => item.ITEM_M_S_PRICE_ID)

            // for (let id of itemMSPriceId) {
            //   const dataTempForMaterialPrice = {
            //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
            //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
            //     ITEM_M_S_PRICE_ID: id,
            //     CREATE_BY: dataItem.CREATE_BY
            //   }
            //   sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
            // }
          } else if (dataItem[conditionFormName[i - 1]] === '4') {
            let itemMSPriceIds: any[] = await StandardPriceService.getItemMSPriceBySctFId(dataItem)

            itemMSPriceIds = itemMSPriceIds.filter((item) => itemIds.includes(item.ITEM_ID))

            itemMSPriceIds = itemMSPriceIds.map((item) => item.ITEM_M_S_PRICE_ID)

            // for (let id of itemMSPriceIds) {
            //   const dataTempForMaterialPrice = {
            //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
            //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
            //     ITEM_M_S_PRICE_ID: id,
            //     SCT_ID: dataItem.MATERIAL_PRICE.SCT_ID,
            //     CREATE_BY: dataItem.CREATE_BY
            //   }
            //   sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
            // }
          }
        }

        //! YR_GR, TIME_FROM_MFG, YR_ACCUMULATION_MATERIAL_FROM_ENGINEER SKIP FOR NOW
      }

      // !!! pls change INUSE to Web APP
      dataItem.SCT_ID = UUID_SCT_ID
      dataItem.INUSE = 1

      // Sct Reason
      const UUID_SCT_REASON_HISTORY_ID = uuidv7()
      dataItem.SCT_REASON_HISTORY_ID = UUID_SCT_REASON_HISTORY_ID

      dataItem.SCT_REASON_SETTING_ID = dataItem.SCT_REASON_SETTING.SCT_REASON_SETTING_ID
      sqlList.push(await SctReasonHistorySQL.insert(dataItem))

      // Sct Tag
      if (dataItem?.SCT_TAG_SETTING) {
        const UUID_SCT_TAG_HISTORY_ID = uuidv7()
        dataItem.SCT_TAG_HISTORY_ID = UUID_SCT_TAG_HISTORY_ID

        dataItem.SCT_TAG_SETTING_ID = dataItem.SCT_TAG_SETTING.SCT_TAG_SETTING_ID
        sqlList.push(await SctTagHistorySQL.insert(dataItem))
      }

      const UUID_SCT_F_PROGRESS_WORKING_ID = uuidv7()
      dataItem.SCT_F_STATUS_PROGRESS_ID = 1
      dataItem.SCT_F_STATUS_WORKING_ID = 1

      sqlList.push(await StandardCostForProductSQL.generateSctFProgressWorkingNo(dataItem))
      sqlList.push(await StandardCostForProductSQL.insertSctFProgressWorking(dataItem, UUID_SCT_F_PROGRESS_WORKING_ID))

      const UUID_SCT_PROGRESS_WORKING_ID = uuidv7()
      dataItem.SCT_STATUS_PROGRESS_ID = 2
      dataItem.SCT_STATUS_WORKING_ID = 2
      sqlList.push(await StandardCostForProductSQL.generateSctProgressWorkingNo(dataItem))
      sqlList.push(await StandardCostForProductSQL.insertSctProgressWorking(dataItem))

      //
    } else if (dataItem.IS_DRAFT) {
      sqlList.push(await StandardCostForProductSQL.generateSctCode(dataItem))

      // const UUID_SCT_ID = uuidv7()
      // sqlList.push(await StandardCostForProductSQL.insertSct(dataItem, UUID_SCT_ID))

      const UUID_SCT_F_ID = uuidv7()
      sqlList.push(await StandardCostForProductSQL.insertSctF(dataItem, UUID_SCT_F_ID))

      dataItem.UUID_SCT_F_ID = UUID_SCT_F_ID

      if (dataItem?.SCT_TAG_SETTING) {
        const UUID_SCT_F_TAG_HISTORY_ID = uuidv7()
        sqlList.push(await StandardCostForProductSQL.insertSctFTagHistory(dataItem, UUID_SCT_F_TAG_HISTORY_ID))
      }

      if (dataItem?.SCT_REASON_SETTING) {
        const UUID_SCT_F_REASON_HISTORY_ID = uuidv7()
        sqlList.push(await StandardCostForProductSQL.insertSctFReasonHistory(dataItem, UUID_SCT_F_REASON_HISTORY_ID))
      }

      // const UUID_SCT_SCT_F_ID = uuidv7()
      // dataItem.UUID_SCT_ID = UUID_SCT_ID
      // dataItem.UUID_SCT_F_ID = UUID_SCT_F_ID
      // sqlList.push(await StandardCostForProductSQL.insertSctSctF(dataItem, UUID_SCT_SCT_F_ID))

      dataItem.UUID_SCT_F_ID = UUID_SCT_F_ID
      const UUID_SCT_F_S_ID = uuidv7()
      if (dataItem?.START_DATE) {
        let startDate = new Date(dataItem?.START_DATE)
        startDate.setHours(startDate.getHours() + 7)
        startDate.setUTCHours(0, 0, 0, 0)
        dataItem.START_DATE = startDate.toISOString().split('T')[0]
      }

      if (dataItem?.END_DATE) {
        let endDate = new Date(dataItem?.END_DATE)
        endDate.setHours(endDate.getHours() + 7)
        endDate.setUTCHours(0, 0, 0, 0)
        dataItem.END_DATE = endDate.toISOString().split('T')[0]
      }

      sqlList.push(await StandardCostForProductSQL.insertSctFS(dataItem, UUID_SCT_F_S_ID))

      for (let i = 1; i <= conditionFormName.length; i++) {
        if (!dataItem[conditionFormName[i - 1]]) continue

        const UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()

        const dataTemp = {
          UUID_SCT_F_ID: UUID_SCT_F_ID,
          SCT_F_COMPONENT_TYPE_ID: i,
          SCT_F_RESOURCE_OPTION_ID: dataItem[conditionFormName[i - 1]],
          RESOURCE_OPTION_DESCRIPTION:
            dataItem[conditionFormName[i - 1]] == 2 && conditionName[i - 1] !== 'COST_CONDITION'
              ? JSON.stringify(dataItem[conditionName[i - 1]])
              : dataItem[conditionFormName[i - 1]] == 4
                ? JSON.stringify(dataItem[conditionName[i - 1]])
                : '',
          CREATE_BY: dataItem.CREATE_BY,
        }

        sqlList.push(await StandardCostForProductSQL.insertSctFComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))

        //* Insert sct data (for preparing) if RESOURCE_OPTION_ID = 2, 4
        //* if RESOURCE_OPTION_ID = 1, 3 => will insert after sct status is prepared

        //* Cost Condition
        if (conditionFormName[i - 1] === 'COST_CONDITION_RESOURCE_OPTION_ID') {
          if (dataItem[conditionFormName[i - 1]] === '2') {
            const costCondition = {
              DIRECT_COST_CONDITION_ID: dataItem.COST_CONDITION.DIRECT_COST_CONDITION.DIRECT_COST_CONDITION_ID,
              INDIRECT_COST_CONDITION_ID: dataItem.COST_CONDITION.INDIRECT_COST_CONDITION.INDIRECT_COST_CONDITION_ID,
              OTHER_COST_CONDITION_ID: dataItem.COST_CONDITION.OTHER_COST_CONDITION.OTHER_COST_CONDITION_ID,
              SPECIAL_COST_CONDITION_ID: dataItem.COST_CONDITION.SPECIAL_COST_CONDITION.SPECIAL_COST_CONDITION_ID,
            }

            const dataTempForDirectCostCondition = {
              SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))

            const dataTempForIndirectCostCondition = {
              SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))

            const dataTempForOtherCostCondition = {
              SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))

            const dataTempForSpecialCostCondition = {
              SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
          } else if (dataItem[conditionFormName[i - 1]] === '4') {
            const costCondition = (await StandardCostForProductService.searchCostConditionBySctFId(dataItem))[0]

            const dataTempForDirectCostCondition = {
              SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))

            const dataTempForIndirectCostCondition = {
              SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))

            const dataTempForOtherCostCondition = {
              SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))

            const dataTempForSpecialCostCondition = {
              SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
          }
        } else if (conditionFormName[i - 1] === 'MATERIAL_PRICE_RESOURCE_OPTION_ID') {
          const materialInProcess: any[] = Object.values(dataItem.MATERIAL_IN_PROCESS)

          const itemIds = materialInProcess.map((item) => item.ITEM.ITEM_ID)

          if (dataItem[conditionFormName[i - 1]] === '2') {
            let itemMSPriceId: any[] = await StandardPriceService.getStandardPriceByItemId(itemIds, dataItem.MATERIAL_PRICE.FISCAL_YEAR)

            itemMSPriceId = itemMSPriceId.map((item) => item.ITEM_M_S_PRICE_ID)

            // for (let id of itemMSPriceId) {
            //   const dataTempForMaterialPrice = {
            //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
            //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
            //     ITEM_M_S_PRICE_ID: id,
            //     CREATE_BY: dataItem.CREATE_BY
            //   }
            //   sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
            // }
          } else if (dataItem[conditionFormName[i - 1]] === '4') {
            let itemMSPriceIds: any[] = await StandardPriceService.getItemMSPriceBySctFId(dataItem)

            itemMSPriceIds = itemMSPriceIds.filter((item) => itemIds.includes(item.ITEM_ID))

            itemMSPriceIds = itemMSPriceIds.map((item) => item.ITEM_M_S_PRICE_ID)

            // for (let id of itemMSPriceIds) {
            //   const dataTempForMaterialPrice = {
            //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
            //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
            //     ITEM_M_S_PRICE_ID: id,
            //     SCT_ID: dataItem.MATERIAL_PRICE.SCT_ID,
            //     CREATE_BY: dataItem.CREATE_BY
            //   }
            //   sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
            // }
          }
        }

        //! YR_GR, TIME_FROM_MFG, YR_ACCUMULATION_MATERIAL_FROM_ENGINEER SKIP FOR NOW
      }

      const UUID_SCT_F_PROGRESS_WORKING_ID = uuidv7()
      dataItem.SCT_F_STATUS_PROGRESS_ID = 1
      dataItem.SCT_F_STATUS_WORKING_ID = 2
      sqlList.push(await StandardCostForProductSQL.generateSctFProgressWorkingNo(dataItem))
      sqlList.push(await StandardCostForProductSQL.insertSctFProgressWorking(dataItem, UUID_SCT_F_PROGRESS_WORKING_ID))

      //
    }

    // console.log(sqlList.join('\n'))

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  update: async (dataItem: any) => {
    let sqlList = []

    dataItem.UUID_SCT_F_ID = dataItem.SCT_F_ID

    if (!dataItem.IS_DRAFT) {
      let startDate = new Date(dataItem?.START_DATE)
      startDate.setHours(startDate.getHours() + 7)
      startDate.setUTCHours(0, 0, 0, 0)

      let endDate = new Date(dataItem?.END_DATE)
      endDate.setHours(endDate.getHours() + 7)
      endDate.setUTCHours(0, 0, 0, 0)

      dataItem.START_DATE = startDate.toISOString().split('T')[0]
      dataItem.END_DATE = endDate.toISOString().split('T')[0]

      const UUID_SCT_ID = uuidv7()
      sqlList.push(await StandardCostForProductSQL.insertSct(dataItem, UUID_SCT_ID))

      const UUID_SCT_F_REASON_HISTORY_ID = uuidv7()
      dataItem.UUID_SCT_F_ID = dataItem.SCT_F_ID

      sqlList.push(await StandardCostForProductSQL.deleteSctFTagHistory(dataItem))
      sqlList.push(await StandardCostForProductSQL.deleteSctFReasonHistory(dataItem))

      sqlList.push(await StandardCostForProductSQL.insertSctFReasonHistory(dataItem, UUID_SCT_F_REASON_HISTORY_ID))

      if (dataItem?.SCT_TAG_SETTING) {
        const UUID_SCT_F_TAG_HISTORY_ID = uuidv7()

        sqlList.push(await StandardCostForProductSQL.insertSctFTagHistory(dataItem, UUID_SCT_F_TAG_HISTORY_ID))
      }

      const UUID_SCT_SCT_F_ID = uuidv7()
      dataItem.UUID_SCT_ID = UUID_SCT_ID
      sqlList.push(await StandardCostForProductSQL.insertSctSctF(dataItem, UUID_SCT_SCT_F_ID))

      sqlList.push(await StandardCostForProductSQL.updateSctFS(dataItem))

      const conditionFormName = [
        'COST_CONDITION_RESOURCE_OPTION_ID',
        'MATERIAL_PRICE_RESOURCE_OPTION_ID',
        'YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID',
        'TIME_FROM_MFG_RESOURCE_OPTION_ID',
        'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID',
      ]

      sqlList.push(await StandardCostForProductSQL.deleteSctFComponentTypeResourceOptionSelect(dataItem))

      for (let i = 1; i <= conditionFormName.length; i++) {
        const UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()
        const UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()

        const dataTemp = {
          UUID_SCT_F_ID: dataItem.UUID_SCT_F_ID,
          UUID_SCT_ID: UUID_SCT_ID,
          SCT_F_COMPONENT_TYPE_ID: i,
          SCT_F_RESOURCE_OPTION_ID: dataItem[conditionFormName[i - 1]],
          CREATE_BY: dataItem.CREATE_BY,
          RESOURCE_OPTION_DESCRIPTION:
            dataItem[conditionFormName[i - 1]] == 2 && conditionName[i - 1] !== 'COST_CONDITION'
              ? JSON.stringify(dataItem[conditionName[i - 1]])
              : dataItem[conditionFormName[i - 1]] == 4
                ? JSON.stringify(dataItem[conditionName[i - 1]])
                : '',
        }

        sqlList.push(await StandardCostForProductSQL.insertSctFComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))
        //sqlList.push(await StandardCostForProductSQL.insertSctComponentTypeResourceOptionSelect({}))

        //* Insert sct data (for preparing) if RESOURCE_OPTION_ID = 2, 4
        //* if RESOURCE_OPTION_ID = 1, 3 => will insert after sct status is prepared

        //* Cost Condition
        if (conditionFormName[i - 1] === 'COST_CONDITION_RESOURCE_OPTION_ID') {
          if (dataItem[conditionFormName[i - 1]] === '2') {
            const costCondition = {
              DIRECT_COST_CONDITION_ID: dataItem.COST_CONDITION.DIRECT_COST_CONDITION.DIRECT_COST_CONDITION_ID,
              INDIRECT_COST_CONDITION_ID: dataItem.COST_CONDITION.INDIRECT_COST_CONDITION.INDIRECT_COST_CONDITION_ID,
              OTHER_COST_CONDITION_ID: dataItem.COST_CONDITION.OTHER_COST_CONDITION.OTHER_COST_CONDITION_ID,
              SPECIAL_COST_CONDITION_ID: dataItem.COST_CONDITION.SPECIAL_COST_CONDITION.SPECIAL_COST_CONDITION_ID,
            }

            const dataTempForDirectCostCondition = {
              SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))

            const dataTempForIndirectCostCondition = {
              SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))

            const dataTempForOtherCostCondition = {
              SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))

            const dataTempForSpecialCostCondition = {
              SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
          } else if (dataItem[conditionFormName[i - 1]] === '4') {
            const costCondition = (await StandardCostForProductService.searchCostConditionBySctFId(dataItem))[0]

            const dataTempForDirectCostCondition = {
              SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))

            const dataTempForIndirectCostCondition = {
              SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))

            const dataTempForOtherCostCondition = {
              SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))

            const dataTempForSpecialCostCondition = {
              SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
          }
        } else if (conditionFormName[i - 1] === 'MATERIAL_PRICE_RESOURCE_OPTION_ID') {
          const materialInProcess: any[] = Object.values(dataItem.MATERIAL_IN_PROCESS)

          const itemIds = materialInProcess.map((item) => item.ITEM.ITEM_ID)

          if (dataItem[conditionFormName[i - 1]] === '2') {
            let itemMSPriceId: any[] = await StandardPriceService.getStandardPriceByItemId(itemIds, dataItem.MATERIAL_PRICE.FISCAL_YEAR)

            itemMSPriceId = itemMSPriceId.map((item) => item.ITEM_M_S_PRICE_ID)

            // for (let id of itemMSPriceId) {
            //   const dataTempForMaterialPrice = {
            //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
            //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
            //     ITEM_M_S_PRICE_ID: id,
            //     CREATE_BY: dataItem.CREATE_BY
            //   }
            //   sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
            // }
          } else if (dataItem[conditionFormName[i - 1]] === '4') {
            let itemMSPriceIds: any[] = await StandardPriceService.getItemMSPriceBySctFId(dataItem)

            itemMSPriceIds = itemMSPriceIds.filter((item) => itemIds.includes(item.ITEM_ID))

            itemMSPriceIds = itemMSPriceIds.map((item) => item.ITEM_M_S_PRICE_ID)

            // for (let id of itemMSPriceIds) {
            //   const dataTempForMaterialPrice = {
            //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
            //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
            //     ITEM_M_S_PRICE_ID: id,
            //     SCT_ID: dataItem.MATERIAL_PRICE.SCT_ID,
            //     CREATE_BY: dataItem.CREATE_BY
            //   }
            //   sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
            // }
          }
        }

        //! YR_GR, TIME_FROM_MFG, YR_ACCUMULATION_MATERIAL_FROM_ENGINEER SKIP FOR NOW
      }

      sqlList.push(await StandardCostForProductSQL.deleteSctFProgressWorking(dataItem))

      const UUID_SCT_F_PROGRESS_WORKING_ID = uuidv7()
      dataItem.SCT_F_STATUS_PROGRESS_ID = 1
      dataItem.SCT_F_STATUS_WORKING_ID = 1
      sqlList.push(await StandardCostForProductSQL.generateSctFProgressWorkingNo(dataItem))
      sqlList.push(await StandardCostForProductSQL.insertSctFProgressWorking(dataItem, UUID_SCT_F_PROGRESS_WORKING_ID))

      dataItem.UUID_SCT_ID = UUID_SCT_ID

      const UUID_SCT_PROGRESS_WORKING_ID = uuidv7()

      dataItem.SCT_STATUS_PROGRESS_ID = 1
      dataItem.SCT_STATUS_WORKING_ID = 1
      //sqlList.push(await StandardCostForProductSQL.insertSctProgressWorking(dataItem, UUID_SCT_PROGRESS_WORKING_ID))

      //
    } else if (dataItem.IS_DRAFT) {
      sqlList.push(await StandardCostForProductSQL.deleteSctFTagHistory(dataItem))
      sqlList.push(await StandardCostForProductSQL.deleteSctFReasonHistory(dataItem))

      if (dataItem?.SCT_TAG_SETTING) {
        const UUID_SCT_F_TAG_HISTORY_ID = uuidv7()
        sqlList.push(await StandardCostForProductSQL.insertSctFTagHistory(dataItem, UUID_SCT_F_TAG_HISTORY_ID))
      }

      if (dataItem?.SCT_REASON_SETTING) {
        const UUID_SCT_F_REASON_HISTORY_ID = uuidv7()
        sqlList.push(await StandardCostForProductSQL.insertSctFReasonHistory(dataItem, UUID_SCT_F_REASON_HISTORY_ID))
      }

      if (dataItem?.START_DATE) {
        let startDate = new Date(dataItem?.START_DATE)
        startDate.setHours(startDate.getHours() + 7)
        startDate.setUTCHours(0, 0, 0, 0)
        dataItem.START_DATE = startDate.toISOString().split('T')[0]
      }

      if (dataItem?.END_DATE) {
        let endDate = new Date(dataItem?.END_DATE)
        endDate.setHours(endDate.getHours() + 7)
        endDate.setUTCHours(0, 0, 0, 0)
        dataItem.END_DATE = endDate.toISOString().split('T')[0]
      }

      sqlList.push(await StandardCostForProductSQL.updateSctFS(dataItem))

      sqlList.push(await StandardCostForProductSQL.deleteSctFComponentTypeResourceOptionSelect(dataItem))
      for (let i = 1; i <= conditionFormName.length; i++) {
        if (!dataItem[conditionFormName[i - 1]]) continue

        const UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()

        const dataTemp = {
          UUID_SCT_F_ID: dataItem.UUID_SCT_F_ID,
          SCT_F_COMPONENT_TYPE_ID: i,
          SCT_F_RESOURCE_OPTION_ID: dataItem[conditionFormName[i - 1]],
          CREATE_BY: dataItem.CREATE_BY,
          RESOURCE_OPTION_DESCRIPTION:
            dataItem[conditionFormName[i - 1]] == 2 && conditionName[i - 1] !== 'COST_CONDITION'
              ? JSON.stringify(dataItem[conditionName[i - 1]])
              : dataItem[conditionFormName[i - 1]] == 4
                ? JSON.stringify(dataItem[conditionName[i - 1]])
                : '',
        }

        sqlList.push(await StandardCostForProductSQL.insertSctFComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))

        //* Insert sct data (for preparing) if RESOURCE_OPTION_ID = 2, 4
        //* if RESOURCE_OPTION_ID = 1, 3 => will insert after sct status is prepared

        //* Cost Condition
        if (conditionFormName[i - 1] === 'COST_CONDITION_RESOURCE_OPTION_ID') {
          if (dataItem[conditionFormName[i - 1]] === '2') {
            const costCondition = {
              DIRECT_COST_CONDITION_ID: dataItem.COST_CONDITION.DIRECT_COST_CONDITION.DIRECT_COST_CONDITION_ID,
              INDIRECT_COST_CONDITION_ID: dataItem.COST_CONDITION.INDIRECT_COST_CONDITION.INDIRECT_COST_CONDITION_ID,
              OTHER_COST_CONDITION_ID: dataItem.COST_CONDITION.OTHER_COST_CONDITION.OTHER_COST_CONDITION_ID,
              SPECIAL_COST_CONDITION_ID: dataItem.COST_CONDITION.SPECIAL_COST_CONDITION.SPECIAL_COST_CONDITION_ID,
            }

            const dataTempForDirectCostCondition = {
              SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))

            const dataTempForIndirectCostCondition = {
              SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))

            const dataTempForOtherCostCondition = {
              SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))

            const dataTempForSpecialCostCondition = {
              SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
          } else if (dataItem[conditionFormName[i - 1]] === '4') {
            const costCondition = (await StandardCostForProductService.searchCostConditionBySctFId(dataItem))[0]

            const dataTempForDirectCostCondition = {
              SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))

            const dataTempForIndirectCostCondition = {
              SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))

            const dataTempForOtherCostCondition = {
              SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))

            const dataTempForSpecialCostCondition = {
              SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
              SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
              SCT_ID: dataItem.COST_CONDITION.SCT_ID,
              CREATE_BY: dataItem.CREATE_BY,
            }
            sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
          }
        } else if (conditionFormName[i - 1] === 'MATERIAL_PRICE_RESOURCE_OPTION_ID') {
          const materialInProcess: any[] = Object.values(dataItem.MATERIAL_IN_PROCESS)

          const itemIds = materialInProcess.map((item) => item.ITEM.ITEM_ID)

          if (dataItem[conditionFormName[i - 1]] === '2') {
            let itemMSPriceId: any[] = await StandardPriceService.getStandardPriceByItemId(itemIds, dataItem.MATERIAL_PRICE.FISCAL_YEAR)

            itemMSPriceId = itemMSPriceId.map((item) => item.ITEM_M_S_PRICE_ID)

            // for (let id of itemMSPriceId) {
            //   const dataTempForMaterialPrice = {
            //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
            //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
            //     ITEM_M_S_PRICE_ID: id,
            //     CREATE_BY: dataItem.CREATE_BY
            //   }
            //   sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
            // }
          } else if (dataItem[conditionFormName[i - 1]] === '4') {
            let itemMSPriceIds: any[] = await StandardPriceService.getItemMSPriceBySctFId(dataItem)

            itemMSPriceIds = itemMSPriceIds.filter((item) => itemIds.includes(item.ITEM_ID))

            itemMSPriceIds = itemMSPriceIds.map((item) => item.ITEM_M_S_PRICE_ID)

            // for (let id of itemMSPriceIds) {
            //   const dataTempForMaterialPrice = {
            //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
            //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
            //     ITEM_M_S_PRICE_ID: id,
            //     SCT_ID: dataItem.MATERIAL_PRICE.SCT_ID,
            //     CREATE_BY: dataItem.CREATE_BY
            //   }
            //   sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
            // }
          }
        }

        //! YR_GR, TIME_FROM_MFG, YR_ACCUMULATION_MATERIAL_FROM_ENGINEER SKIP FOR NOW
      }

      sqlList.push(await StandardCostForProductSQL.deleteSctFProgressWorking(dataItem))

      const UUID_SCT_F_PROGRESS_WORKING_ID = uuidv7()
      dataItem.SCT_F_STATUS_PROGRESS_ID = 1
      dataItem.SCT_F_STATUS_WORKING_ID = 2
      sqlList.push(await StandardCostForProductSQL.generateSctFProgressWorkingNo(dataItem))
      sqlList.push(await StandardCostForProductSQL.insertSctFProgressWorking(dataItem, UUID_SCT_F_PROGRESS_WORKING_ID))
    }

    sqlList.push(await StandardCostForProductSQL.updateUpdateByUpdateDateBySctId(dataItem))

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  deleteSctForm: async (dataItem: any) => {
    let sqlList = []

    sqlList.push(await StandardCostForProductSQL.deleteSctForm(dataItem))

    //insert status cancelled
    const UUID_SCT_F_PROGRESS_WORKING_ID = uuidv7()
    dataItem.UUID_SCT_F_ID = dataItem.SCT_F_ID
    dataItem.CREATE_BY = dataItem.UPDATE_BY
    dataItem.SCT_F_STATUS_PROGRESS_ID = 0
    dataItem.SCT_F_STATUS_WORKING_ID = 1
    sqlList.push(await StandardCostForProductSQL.generateSctFProgressWorkingNo(dataItem))
    sqlList.push(await StandardCostForProductSQL.insertSctFProgressWorking(dataItem, UUID_SCT_F_PROGRESS_WORKING_ID))

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  // ** CreateMultiple Test create by Thanaritz
  createSctFormMultipleForTest: async (dataItem: any) => {
    let sqlList = []

    let cntInsert = 0
    let sctIds = []

    const UUID_SCT_F_ID = uuidv7()
    const UUID_SCT_F_M_ID = uuidv7()
    for (const data of dataItem.LIST_MULTIPLE_SCT_DATA) {
      const UUID_SCT_ID = uuidv7()
      sctIds.push({
        SCT_ID: UUID_SCT_ID,
        PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
      })

      if (!data.IS_DRAFT) {
        if (data?.BOM_ID) {
          data.PRODUCT_TYPE = {}

          // ** Define Get Bom Data [Flow Process , Material In Process]
          let sqlBom = await BomSQL.searchBomDetailsByBomId(data)
          const result = (await MySQLExecute.search(sqlBom)) as RowDataPacket[]

          let item: any = {}
          let process: any[] = []
          let productMain = {}
          let bomName = ''
          let flowName = ''
          let bomCode = ''
          let flowCode = ''
          let productType: any[] = []

          if (result.length > 0) {
            process = result.map((res) => {
              const id = (Math.random() + 1).toString(36).substring(7)

              item[id] = {
                ITEM: {
                  ...res,
                },
                ITEM_CATEGORY: {
                  ITEM_CATEGORY_ID: res.ITEM_CATEGORY_ID,
                  ITEM_CATEGORY_NAME: res.ITEM_CATEGORY_NAME,
                  ITEM_CATEGORY_ALPHABET: res.ITEM_CATEGORY_ALPHABET,
                },
                PROCESS: {
                  value: res.PROCESS_ID,
                  label: res.PROCESS_NAME,
                },
                USAGE_QUANTITY: res?.USAGE_QUANTITY ? `${res.USAGE_QUANTITY}` : '',
              }

              if (!res?.ITEM_ID) {
                delete item[id]
              }

              return {
                FLOW_PROCESS_NO: res.FLOW_PROCESS_NO,
                PROCESS_ID: res.PROCESS_ID,
                PROCESS_NAME: res.PROCESS_NAME,
              }
            })

            productType = result.map((res) => {
              return {
                PRODUCT_TYPE_ID: res.PRODUCT_TYPE_ID,
                PRODUCT_TYPE_CODE: res.PRODUCT_TYPE_CODE,
                PRODUCT_TYPE_NAME: res.PRODUCT_TYPE_NAME,
                IS_OLD: true,
              }
            })

            productMain = {
              PRODUCT_MAIN_ID: result[0].PRODUCT_MAIN_ID,
              PRODUCT_MAIN_NAME: result[0].PRODUCT_MAIN_NAME,
              PRODUCT_MAIN_ALPHABET: result[0].PRODUCT_MAIN_ALPHABET,
            }

            bomName = result[0].BOM_NAME
            bomCode = result[0].BOM_CODE

            flowName = result[0].FLOW_NAME
            flowCode = result[0].FLOW_CODE

            process = process.filter((v, i, a) => a.findIndex((t) => t.FLOW_PROCESS_NO == v.FLOW_PROCESS_NO) == i)

            productType = productType.filter((v, i, a) => a.findIndex((t) => t.PRODUCT_TYPE_ID == v.PRODUCT_TYPE_ID) == i)

            process = process.filter((v) => v.PROCESS_ID !== null)

            productType = productType.filter((v) => v.PRODUCT_TYPE_ID !== null)
          }

          data.MATERIAL_IN_PROCESS = {
            ITEM: item,
            PROCESS: process,
            productMain: productMain,
            bomName: bomName,
            flowName: flowName,
            bomCode: bomCode,
            flowCode: flowCode,
            productType: productType,
          }

          // ** Define DataItem Variable
          data.PRODUCT_TYPE.PRODUCT_TYPE_ID = data.PRODUCT_TYPE_ID
          data.PRODUCT_TYPE.PRODUCT_TYPE_CODE = data.PRODUCT_TYPE_CODE
          data.PRODUCT_TYPE.PRODUCT_MAIN_ALPHABET = data.PRODUCT_MAIN_ALPHABET
          data.PRODUCT_TYPE.PRODUCT_SPECIFICATION_TYPE_ALPHABET = data.PRODUCT_SPECIFICATION_TYPE_ALPHABET
          data.SCT_F_M_CREATE_TYPE_ALPHABET = 'M'

          if (cntInsert == 0) {
            sqlList.push(await StandardCostForProductSQL.generateSctCodeMultiple(data)) // !!  1
          }
          sqlList.push(await StandardCostForProductSQL.generateSctCode(data)) // !! 2

          let startDate = new Date(data?.START_DATE)
          startDate.setHours(startDate.getHours() + 7)
          startDate.setUTCHours(0, 0, 0, 0)

          let endDate = new Date(data?.END_DATE)
          endDate.setHours(endDate.getHours() + 7)
          endDate.setUTCHours(0, 0, 0, 0)

          data.START_DATE = startDate.toISOString().split('T')[0]
          data.END_DATE = endDate.toISOString().split('T')[0]

          sqlList.push(await StandardCostForProductSQL.insertSct(data, UUID_SCT_ID)) // !! 2

          if (cntInsert == 0) {
            sqlList.push(await StandardCostForProductSQL.insertSctFMultiple(data, UUID_SCT_F_ID)) //  !! 1
          }
          const UUID_SCT_F_REASON_HISTORY_ID = uuidv7()
          data.UUID_SCT_F_ID = UUID_SCT_F_ID
          if (cntInsert == 0) {
            sqlList.push(await StandardCostForProductSQL.insertSctFReasonHistory(data, UUID_SCT_F_REASON_HISTORY_ID)) // !! 1
          }

          if (cntInsert == 0) {
            if (data?.SCT_TAG_SETTING) {
              const UUID_SCT_F_TAG_HISTORY_ID = uuidv7()
              sqlList.push(await StandardCostForProductSQL.insertSctFTagHistory(data, UUID_SCT_F_TAG_HISTORY_ID)) // !! 1
            }
          }

          const UUID_SCT_SCT_F_ID = uuidv7()
          data.UUID_SCT_ID = UUID_SCT_ID
          data.UUID_SCT_F_ID = UUID_SCT_F_ID

          sqlList.push(await StandardCostForProductSQL.insertSctSctF(data, UUID_SCT_SCT_F_ID)) // !! 2

          // ** Multiple Create

          if (cntInsert == 0) {
            sqlList.push(await StandardCostForProductSQL.insertSctFM(data, UUID_SCT_F_M_ID)) // !! 1
          }

          const SCT_F_M_PRODUCT_TYPE_ID = uuidv7()
          data.UUID_SCT_F_M_ID = UUID_SCT_F_M_ID
          sqlList.push(await StandardCostForProductSQL.insertSctFMProductType(data, SCT_F_M_PRODUCT_TYPE_ID)) // !! 2

          const conditionFormName = [
            'COST_CONDITION_RESOURCE_OPTION_ID',
            'MATERIAL_PRICE_RESOURCE_OPTION_ID',
            'YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID',
            'TIME_FROM_MFG_RESOURCE_OPTION_ID',
            'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID',
          ]

          for (let i = 1; i <= conditionFormName.length; i++) {
            const UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()
            const UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()

            const dataTemp = {
              UUID_SCT_F_ID: UUID_SCT_F_ID,
              UUID_SCT_ID: UUID_SCT_ID,
              SCT_F_COMPONENT_TYPE_ID: i,
              SCT_F_RESOURCE_OPTION_ID: data[conditionFormName[i - 1]],
              RESOURCE_OPTION_DESCRIPTION:
                data[conditionFormName[i - 1]] == 2 && conditionName[i - 1] !== 'COST_CONDITION'
                  ? JSON.stringify(dataItem[conditionName[i - 1]])
                  : data[conditionFormName[i - 1]] == 4
                    ? JSON.stringify(data[conditionName[i - 1]])
                    : '',
              CREATE_BY: data.CREATE_BY,
            }

            if (cntInsert == 0) {
              sqlList.push(await StandardCostForProductSQL.insertSctFComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))
            }

            //sqlList.push(await StandardCostForProductSQL.insertSctComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))
          }

          // !!! pls change INUSE to Web APP
          data.SCT_ID = UUID_SCT_ID
          data.INUSE = 1

          // Sct Reason
          const UUID_SCT_REASON_HISTORY_ID = uuidv7()
          data.SCT_REASON_HISTORY_ID = UUID_SCT_REASON_HISTORY_ID

          data.SCT_REASON_SETTING_ID = data.SCT_REASON_SETTING?.SCT_REASON_SETTING_ID
          sqlList.push(await SctReasonHistorySQL.insert(data))

          // Sct Tag
          if (data?.SCT_TAG_SETTING?.SCT_TAG_SETTING_ID) {
            const UUID_SCT_TAG_HISTORY_ID = uuidv7()
            data.SCT_TAG_HISTORY_ID = UUID_SCT_TAG_HISTORY_ID

            data.SCT_TAG_SETTING_ID = data.SCT_TAG_SETTING?.SCT_TAG_SETTING_ID
            sqlList.push(await SctTagHistorySQL.insert(data))
          }

          if (cntInsert == 0) {
            const UUID_SCT_F_PROGRESS_WORKING_ID = uuidv7()
            data.SCT_F_STATUS_PROGRESS_ID = 1
            data.SCT_F_STATUS_WORKING_ID = 1
            sqlList.push(await StandardCostForProductSQL.generateSctFProgressWorkingNo(data))
            sqlList.push(await StandardCostForProductSQL.insertSctFProgressWorking(data, UUID_SCT_F_PROGRESS_WORKING_ID))
          }

          const UUID_SCT_PROGRESS_WORKING_ID = uuidv7()
          data.SCT_STATUS_PROGRESS_ID = 2
          data.SCT_STATUS_WORKING_ID = 1
          sqlList.push(await StandardCostForProductSQL.generateSctProgressWorkingNo(data))
          //sqlList.push(await StandardCostForProductSQL.insertSctProgressWorking(data, UUID_SCT_PROGRESS_WORKING_ID))
        } else if (data?.SCT_ID_SELECTION) {
          data.PRODUCT_TYPE = {}

          // ** Define Get Bom Data [Flow Process , Material In Process]
          let sqlBomId = await BomSQL.searchBomIdFromSctId(data)
          const bomId = (await MySQLExecute.search(sqlBomId)) as RowDataPacket[]
          data.BOM_ID = bomId[0].BOM_ID

          let sqlBom = await BomSQL.searchBomDetailsByBomId(data)
          const result = (await MySQLExecute.search(sqlBom)) as RowDataPacket[]

          let item: any = {}
          let process: any[] = []
          let productMain = {}
          let bomName = ''
          let flowName = ''
          let bomCode = ''
          let flowCode = ''
          let productType: any[] = []

          if (result.length > 0) {
            process = result.map((res) => {
              const id = (Math.random() + 1).toString(36).substring(7)

              item[id] = {
                ITEM: {
                  ...res,
                },
                ITEM_CATEGORY: {
                  ITEM_CATEGORY_ID: res.ITEM_CATEGORY_ID,
                  ITEM_CATEGORY_NAME: res.ITEM_CATEGORY_NAME,
                  ITEM_CATEGORY_ALPHABET: res.ITEM_CATEGORY_ALPHABET,
                },
                PROCESS: {
                  value: res.PROCESS_ID,
                  label: res.PROCESS_NAME,
                },
                USAGE_QUANTITY: res?.USAGE_QUANTITY ? `${res.USAGE_QUANTITY}` : '',
              }

              if (!res?.ITEM_ID) {
                delete item[id]
              }

              return {
                FLOW_PROCESS_NO: res.FLOW_PROCESS_NO,
                PROCESS_ID: res.PROCESS_ID,
                PROCESS_NAME: res.PROCESS_NAME,
              }
            })

            productType = result.map((res) => {
              return {
                PRODUCT_TYPE_ID: res.PRODUCT_TYPE_ID,
                PRODUCT_TYPE_CODE: res.PRODUCT_TYPE_CODE,
                PRODUCT_TYPE_NAME: res.PRODUCT_TYPE_NAME,
                IS_OLD: true,
              }
            })

            productMain = {
              PRODUCT_MAIN_ID: result[0].PRODUCT_MAIN_ID,
              PRODUCT_MAIN_NAME: result[0].PRODUCT_MAIN_NAME,
              PRODUCT_MAIN_ALPHABET: result[0].PRODUCT_MAIN_ALPHABET,
            }

            bomName = result[0].BOM_NAME
            bomCode = result[0].BOM_CODE

            flowName = result[0].FLOW_NAME
            flowCode = result[0].FLOW_CODE

            process = process.filter((v, i, a) => a.findIndex((t) => t.FLOW_PROCESS_NO == v.FLOW_PROCESS_NO) == i)

            productType = productType.filter((v, i, a) => a.findIndex((t) => t.PRODUCT_TYPE_ID == v.PRODUCT_TYPE_ID) == i)

            process = process.filter((v) => v.PROCESS_ID !== null)

            productType = productType.filter((v) => v.PRODUCT_TYPE_ID !== null)
          }

          data.MATERIAL_IN_PROCESS = {
            ITEM: item,
            PROCESS: process,
            productMain: productMain,
            bomName: bomName,
            flowName: flowName,
            bomCode: bomCode,
            flowCode: flowCode,
            productType: productType,
          }

          // ** Define DataItem Variable
          data.PRODUCT_TYPE.PRODUCT_TYPE_ID = data.PRODUCT_TYPE_ID
          data.PRODUCT_TYPE.PRODUCT_TYPE_CODE = data.PRODUCT_TYPE_CODE
          data.PRODUCT_TYPE.PRODUCT_MAIN_ALPHABET = data.PRODUCT_MAIN_ALPHABET
          data.PRODUCT_TYPE.PRODUCT_SPECIFICATION_TYPE_ALPHABET = data.PRODUCT_SPECIFICATION_TYPE_ALPHABET
          data.SCT_F_M_CREATE_TYPE_ALPHABET = 'M'

          if (cntInsert == 0) {
            sqlList.push(await StandardCostForProductSQL.generateSctCodeMultiple(data)) // !!  1
          }
          sqlList.push(await StandardCostForProductSQL.generateSctCode(data)) // !! 2

          let startDate = new Date(data?.START_DATE)
          startDate.setHours(startDate.getHours() + 7)
          startDate.setUTCHours(0, 0, 0, 0)

          let endDate = new Date(data?.END_DATE)
          endDate.setHours(endDate.getHours() + 7)
          endDate.setUTCHours(0, 0, 0, 0)

          data.START_DATE = startDate.toISOString().split('T')[0]
          data.END_DATE = endDate.toISOString().split('T')[0]
          data.CREATE_FROM = data?.CREATE_FROM

          sqlList.push(await StandardCostForProductSQL.insertSct(data, UUID_SCT_ID)) // !! 2

          if (cntInsert == 0) {
            sqlList.push(await StandardCostForProductSQL.insertSctFMultiple(data, UUID_SCT_F_ID)) //  !! 1
          }
          const UUID_SCT_F_REASON_HISTORY_ID = uuidv7()
          data.UUID_SCT_F_ID = UUID_SCT_F_ID
          if (cntInsert == 0) {
            sqlList.push(await StandardCostForProductSQL.insertSctFReasonHistory(data, UUID_SCT_F_REASON_HISTORY_ID)) // !! 1
          }

          if (cntInsert == 0) {
            if (data?.SCT_TAG_SETTING) {
              const UUID_SCT_F_TAG_HISTORY_ID = uuidv7()
              sqlList.push(await StandardCostForProductSQL.insertSctFTagHistory(data, UUID_SCT_F_TAG_HISTORY_ID)) // !! 1
            }
          }

          data.SCT_ID = UUID_SCT_ID
          data.INUSE = 1
          data.CREATE_BY = data.CREATE_BY
          data.UPDATE_BY = data.CREATE_BY

          // Sct Reason
          const UUID_SCT_REASON_HISTORY_ID = uuidv7()
          data.SCT_REASON_HISTORY_ID = UUID_SCT_REASON_HISTORY_ID

          data.SCT_REASON_SETTING_ID = data.SCT_REASON_SETTING?.SCT_REASON_SETTING_ID
          sqlList.push(await SctReasonHistorySQL.insert(data))

          // Sct Tag
          if (data?.SCT_TAG_SETTING?.SCT_TAG_SETTING_ID) {
            const UUID_SCT_TAG_HISTORY_ID = uuidv7()
            data.SCT_TAG_HISTORY_ID = UUID_SCT_TAG_HISTORY_ID

            data.SCT_TAG_SETTING_ID = data.SCT_TAG_SETTING?.SCT_TAG_SETTING_ID
            sqlList.push(await SctTagHistorySQL.insert(data))
          }

          const UUID_SCT_SCT_F_ID = uuidv7()
          data.UUID_SCT_ID = UUID_SCT_ID
          data.UUID_SCT_F_ID = UUID_SCT_F_ID

          sqlList.push(await StandardCostForProductSQL.insertSctSctF(data, UUID_SCT_SCT_F_ID)) // !! 2

          // ** Multiple Create

          if (cntInsert == 0) {
            sqlList.push(await StandardCostForProductSQL.insertSctFM(data, UUID_SCT_F_M_ID)) // !! 1
          }

          const SCT_F_M_PRODUCT_TYPE_ID = uuidv7()
          data.UUID_SCT_F_M_ID = UUID_SCT_F_M_ID
          sqlList.push(await StandardCostForProductSQL.insertSctFMProductType(data, SCT_F_M_PRODUCT_TYPE_ID)) // !! 2

          //* Clone ( Data Condition + Data Manual (if exists) )
          //*  SCT_STATUS_PROGRESS_ID_SELECTION === 2,3
          if (data.SCT_STATUS_PROGRESS_ID_SELECTION === 2 || data.SCT_STATUS_PROGRESS_ID_SELECTION === 3) {
            let sqlSctResourceOption = await StandardCostForProductSQL.searchSctResourceOptionBySctId(data)
            const resultSctResourceOption = (await MySQLExecute.search(sqlSctResourceOption)) as RowDataPacket[]

            for (const res of resultSctResourceOption) {
              const UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()
              const UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()

              const dataTemp = {
                UUID_SCT_F_ID: UUID_SCT_F_ID,
                UUID_SCT_ID: UUID_SCT_ID,
                SCT_F_COMPONENT_TYPE_ID: res.SCT_COMPONENT_TYPE_ID,
                SCT_F_RESOURCE_OPTION_ID: res.SCT_RESOURCE_OPTION_ID,
                // RESOURCE_OPTION_DESCRIPTION:
                //   dataItem[conditionFormName[i - 1]] == 2 && conditionName[i - 1] !== 'COST_CONDITION'
                //     ? JSON.stringify(dataItem[conditionName[i - 1]])
                //     : dataItem[conditionFormName[i - 1]] == 4
                //     ? JSON.stringify(dataItem[conditionName[i - 1]])
                //     : '',
                CREATE_BY: dataItem.CREATE_BY,
              }

              sqlList.push(await StandardCostForProductSQL.insertSctFComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))
              //sqlList.push(await StandardCostForProductSQL.insertSctComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))
            }

            const UUID_SCT_DETAIL_FOR_ADJUST_ID = uuidv7()
            let sqlInsertDataManualBySctId = await StandardCostForProductSQL.insertSctDataManualBySctId(data, UUID_SCT_ID, UUID_SCT_DETAIL_FOR_ADJUST_ID)

            sqlList.push(sqlInsertDataManualBySctId)
          }

          //* Copy ( Data Stamp )
          //*  SCT_STATUS_PROGRESS_ID_SELECTION === 4,5,6,7,1
          if (
            data.SCT_STATUS_PROGRESS_ID_SELECTION === 4 ||
            data.SCT_STATUS_PROGRESS_ID_SELECTION === 5 ||
            data.SCT_STATUS_PROGRESS_ID_SELECTION === 6 ||
            data.SCT_STATUS_PROGRESS_ID_SELECTION === 7 ||
            data.SCT_STATUS_PROGRESS_ID_SELECTION === 1
          ) {
            //* Resource Option ID = 1 => RealTime
            //* Resource Option ID = 2 => From Sct

            for (let i = 1; i <= conditionFormName.length; i++) {
              const UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()
              const UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()
              const UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_SCT_ID = uuidv7()

              const dataTemp = {
                UUID_SCT_F_ID: UUID_SCT_F_ID,
                UUID_SCT_ID: UUID_SCT_ID,
                SCT_F_COMPONENT_TYPE_ID: i,
                SCT_F_RESOURCE_OPTION_ID: data[conditionFormName[i - 1]],
                RESOURCE_OPTION_DESCRIPTION:
                  data[conditionFormName[i - 1]] == 2 && conditionName[i - 1] !== 'COST_CONDITION'
                    ? JSON.stringify(dataItem[conditionName[i - 1]])
                    : data[conditionFormName[i - 1]] == 4
                      ? JSON.stringify(data[conditionName[i - 1]])
                      : '',
                CREATE_BY: data.CREATE_BY,
                SCT_ID_SELECTION: data.SCT_ID_SELECTION,
                UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
              }

              sqlList.push(await StandardCostForProductSQL.insertSctFComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))
              //sqlList.push(await StandardCostForProductSQL.insertSctComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))

              sqlList.push(await SctComponentTypeResourceOptionSelectionSct.insert(dataTemp, UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_SCT_ID))
            }

            // if (data.COST_CONDITION_RESOURCE_OPTION_ID === '2') {
            //   let sqlCostCondition = await StandardCostForProductSQL.searchCostConditionBySctId(data)
            // }
            // if (data.YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID === '2') {
            //   let sqlYRGrFromEngineer = await StandardCostForProductSQL.searchYRGrFromEngineerBySctId(data)
            // }
            // if (data.MATERIAL_PRICE_RESOURCE_OPTION_ID === '2') {
            //   let sqlMaterialPrice = await StandardCostForProductSQL.searchMaterialPriceBySctId(data)
            // }
            // if (data.TIME_FROM_MFG_RESOURCE_OPTION_ID === '2') {
            //   let sqlTimeFromMfg = await StandardCostForProductSQL.searchTimeFromMfgBySctId(data)
            // }
            // if (data.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID === '2') {
            //   let sqlYRAccumulationMaterialFromEngineer = await StandardCostForProductSQL.searchYRAccumulationMaterialFromEngineerBySctId(data)
            // }
          }

          const UUID_SCT_PROGRESS_WORKING_ID = uuidv7()
          data.SCT_STATUS_PROGRESS_ID = 2
          data.SCT_STATUS_WORKING_ID = 1
          sqlList.push(await StandardCostForProductSQL.generateSctProgressWorkingNo(data))
          //sqlList.push(await StandardCostForProductSQL.insertSctProgressWorking(data, UUID_SCT_PROGRESS_WORKING_ID))
        }

        cntInsert = cntInsert + 1
      }
    }

    await MySQLExecute.executeList(sqlList)

    let sctBudgetChecker = []
    let isHasCreateSctBudget = false
    for (const data of dataItem.LIST_MULTIPLE_SCT_DATA) {
      if (data?.SCT_TAG_SETTING?.SCT_TAG_SETTING_ID === 1) {
        //* get sct on the same fiscal year, product type, sct pattern and "tag budget"
        let sqlGetSctBudget = await StandardCostForProductSQL.searchSctBudgetWithCondition(data)
        const resultGetSctBudget = (await MySQLExecute.search(sqlGetSctBudget)) as RowDataPacket[]

        if (resultGetSctBudget.length > 0) {
          sctBudgetChecker.push(data.PRODUCT_TYPE_ID)
        }
        isHasCreateSctBudget = true
      }
    }

    return {
      Status: true,
      ResultOnDb: [
        {
          isHasCreateSctBudget,
          LATEST_SCT_ID: sctIds,
        },
      ],
      TotalCountOnDb: 0,
      MethodOnDb: 'Create Multiple Standard Cost For Product',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI
  },
  changeSctProgress: async (dataItem: any) => {
    let sqlList = []

    if (typeof dataItem.SCT_ID === 'object') {
      for (let i = 0; i < dataItem.SCT_ID.length; i++) {
        let dataTemp = {
          ...dataItem,
          SCT_ID: dataItem.SCT_ID[i],
        }

        dataTemp['SCT_ID'] = dataItem.SCT_ID[i]
        dataTemp['UUID_SCT_ID'] = dataTemp.SCT_ID
        dataTemp['SCT_STATUS_WORKING_ID'] = 2
        dataTemp['CREATE_BY'] = dataTemp.UPDATE_BY

        sqlList.push(await StandardCostForProductSQL.deleteSctProgressWorking(dataTemp))
        sqlList.push(
          await StandardCostForProductSQL.generateSctProgressWorkingNo({
            ...dataTemp,
            UUID_SCT_ID: dataItem.SCT_ID[i],
          })
        )
        sqlList.push(
          await StandardCostForProductSQL.insertSctProgressWorking({
            CREATE_BY: dataTemp.UPDATE_BY,
            SCT_ID: dataItem.SCT_ID[i],
            SCT_PROGRESS_WORKING_ID: uuidv7(),
            SCT_STATUS_PROGRESS_ID: dataTemp.SCT_STATUS_PROGRESS_ID,
            SCT_STATUS_WORKING_ID: dataTemp.SCT_STATUS_WORKING_ID,
            UPDATE_BY: dataTemp.UPDATE_BY,
          })
        )

        // Change to Status : Preparing
        if (dataItem.SCT_STATUS_PROGRESS_ID == 2) {
          // Preparing
          // Delete By Sct on Table
          // - SCT_FLOW_PROCESS_SEQUENCE
          // - SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER
          // - SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG
          // - SCT_PROCESSING_COST_BY_ENGINEER_TOTAL
          // - SCT_PROCESSING_COST_BY_MFG_TOTAL
          // - SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE
          // - SCT_TOTAL_COST
          // - ITEM_M_O_PRICE
          // - ITEM_M_S_PRICE
          // - ITEM_M_S_PRICE_SCT

          sqlList.push(
            await SctFlowProcessSequenceSQL.deleteBySctId({
              SCT_ID: dataItem.SCT_ID[i],
              UPDATE_BY: dataItem.UPDATE_BY,
              IS_FROM_SCT_COPY: 0,
            })
          )
          sqlList.push(
            await SctFlowProcessProcessingCostByEngineerSQL.deleteBySctId({
              SCT_ID: dataItem.SCT_ID[i],
              UPDATE_BY: dataItem.UPDATE_BY,
              IS_FROM_SCT_COPY: 0,
            })
          )
          sqlList.push(
            await SctFlowProcessProcessingCostByMfgSQL.deleteBySctId({
              SCT_ID: dataItem.SCT_ID[i],
              UPDATE_BY: dataItem.UPDATE_BY,
              IS_FROM_SCT_COPY: 0,
            })
          )
          sqlList.push(
            await SctProcessingCostByEngineerTotalSQL.deleteBySctId({
              SCT_ID: dataItem.SCT_ID[i],
              UPDATE_BY: dataItem.UPDATE_BY,
              IS_FROM_SCT_COPY: 0,
            })
          )
          sqlList.push(
            await SctProcessingCostByMfgTotalSQL.deleteBySctId({
              SCT_ID: dataItem.SCT_ID[i],
              UPDATE_BY: dataItem.UPDATE_BY,
              IS_FROM_SCT_COPY: 0,
            })
          )
          sqlList.push(
            await SctBomFlowProcessItemUsagePriceSQL.deleteBySctId({
              SCT_ID: dataItem.SCT_ID[i],
              UPDATE_BY: dataItem.UPDATE_BY,
              IS_FROM_SCT_COPY: 0,
            })
          )
          sqlList.push(
            await SctTotalCostSQL.deleteBySctId({
              SCT_ID: dataItem.SCT_ID[i],
              UPDATE_BY: dataItem.UPDATE_BY,
              IS_FROM_SCT_COPY: 0,
            })
          )
        }

        // Change to Status : Cancelled
        if (dataItem.SCT_STATUS_PROGRESS_ID == 1) {
          //
          // const sctDetailSql = await StandardCostForProductSQL.getSctDataDetail({ SCT_ID: dataTemp.SCT_ID })

          // const sctDetail = (await MySQLExecute.search(sctDetailSql)) as RowDataPacket[]

          // if (sctDetail?.[0]?.SCT_TAG_SETTING_ID === 2 || sctDetail?.[0]?.SCT_TAG_SETTING_ID === 3) {
          //   throw new Error('ไม่สามารถลบได้ เนื่องจากเป็น Standard Cost ที่มี Tag Mes หรือ Tag Price')
          // }

          sqlList.push(await StandardCostForProductSQL.deleteWithCancelReason(dataTemp))
          //sqlList.push(await SctTagHistorySQL.deleteSctBudgetWhenSctCancelled(dataTemp))
        }
      }
    } else {
      throw new Error('Not found SCT ID')
    }

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  deleteSctData: async (dataItem: any) => {
    let sqlList = []

    dataItem['UUID_SCT_ID'] = dataItem.SCT_ID
    dataItem['SCT_STATUS_PROGRESS_ID'] = 1
    dataItem['SCT_STATUS_WORKING_ID'] = 2
    dataItem['CREATE_BY'] = dataItem.UPDATE_BY

    sqlList.push(await StandardCostForProductSQL.deleteSctData(dataItem))
    sqlList.push(await StandardCostForProductSQL.deleteSctProgressWorking(dataItem))
    sqlList.push(await StandardCostForProductSQL.generateSctProgressWorkingNo(dataItem))
    // sqlList.push(await StandardCostForProductSQL.insertSctProgressWorking(dataItem, uuidv7()))
    sqlList.push(await SctTagHistorySQL.deleteSctBudgetWhenSctCancelled(dataItem))

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  getTotalYR: async () => {
    const sql = await StandardCostForProductSQL.getTotalYR()
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getParentSctIdBySctId: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getParentSctIdBySctId(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getReCalButton: async (dataItem: { SCT_ID: string }) => {
    let sql

    // if (dataItem.SCT_TAG_SETTING_ID === '1' || dataItem.SCT_TAG_SETTING_ID === 1) {
    //   sql = await StandardCostForProductSQL.getMaterialPriceDataBudgetForReCalButton(dataItem)
    // } else {
    sql = await StandardCostForProductSQL.getReCalButton(dataItem)
    //}

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  searchParentSct: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.searchParentSct(dataItem)

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  updateSctTagBudget: async (dataItem: any) => {
    let sqlList = []

    const latestSctIds = dataItem.SCT_DATA

    if (dataItem.IS_CHANGE) {
      for (const data of latestSctIds) {
        const dataTemp = {
          UPDATE_BY: dataItem.UPDATE_BY,
          SCT_ID: data.SCT_ID,
          PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
        }

        sqlList.push(await SctTagHistorySQL.deleteSctBudgetByProductTypeId(dataTemp))
      }
    } else {
      for (const data of latestSctIds) {
        const dataTemp = {
          UPDATE_BY: dataItem.UPDATE_BY,
          SCT_ID: data.SCT_ID,
          PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
        }

        sqlList.push(await SctTagHistorySQL.deleteBySctId(dataTemp))
      }
    }

    await MySQLExecute.executeList(sqlList)

    return {
      Status: true,
      ResultOnDb: [],
      TotalCountOnDb: 0,
      MethodOnDb: 'Update Sct Tag Budget',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI
  },
  getSctByLikeProductTypeCodeAndCondition: async (dataItem: any) => {
    let sql = ''

    /**
     * Budget : 1
     * Price : 2
     * Mes : 3
     */

    switch (dataItem.CONDITION) {
      case 'MES':
        sql = await StandardCostForProductSQL.getSctByLikeProductTypeIdAndMesTag(dataItem)
        break

      case 'BUDGET':
        sql = await StandardCostForProductSQL.getSctByLikeProductTypeIdAndBudgetTag(dataItem)
        break

      case 'PRICE':
        sql = await StandardCostForProductSQL.getSctByLikeProductTypeIdAndPriceTag(dataItem)
        break

      case 'SCT_LATEST_REVISION':
        sql = await StandardCostForProductSQL.getSctByLikeProductTypeCodeAndLatestRevision(dataItem)
        break

      default:
        break
    }

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  updateUpdateByUpdateDate: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.updateUpdateByUpdateDate(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}

// export async function getParentProductTypeBySctRevisionCode(dataItem: { SCT_REVISION_CODE: string }) {
//   const listSctRevisionCode = []
//   const sql = await StandardCostForProductSQL.getParentProductTypeBySctRevisionCode(dataItem)
//   const sctChild = (await MySQLExecute.search(sql)) as RowDataPacket[]
//   listSctRevisionCode.concat(sctChild)

//   for (let i = 0; i < sctChild.length; i++) {
//     await getParentProductTypeBySctRevisionCode({
//       SCT_REVISION_CODE: sctChild[i].SCT_REVISION_CODE,
//     })
//   }

//   return listSctRevisionCode
// }

// type SctItem = RowDataPacket

// export async function getParentProductTypeBySctRevisionCode(dataItem: { SCT_REVISION_CODE: string[] }): Promise<SctItem[]> {
//   const listSctRevisionCode: SctItem[] = []

//   // console.log(dataItem.SCT_REVISION_CODE)

//   const sql = await StandardCostForProductSQL.getParentProductTypeBySctRevisionCode(dataItem)
//   const sctChild = (await MySQLExecute.search(sql)) as SctItem[]

//   listSctRevisionCode.push(...sctChild.filter((item) => item.SCT_REVISION_CODE !== null))

//   for (let i = 0; i < sctChild.length; i++) {
//     if (sctChild[i].SCT_REVISION_CODE === null) {
//       continue
//     }

//     const parentList = await getParentProductTypeBySctRevisionCode({
//       SCT_REVISION_CODE: sctChild[i].SCT_REVISION_CODE,
//     })

//     listSctRevisionCode.push(...parentList)
//   }

//   console.log(listSctRevisionCode.map((item) => item.SCT_REVISION_CODE))

//   return listSctRevisionCode
// }

// type Input = {
//   SCT_REVISION_CODE: string[]
// }

// type SctItem = {
//   SCT_REVISION_CODE: string | null
//   // field อื่น ๆ ตามจริง
// }

// export async function getParentProductTypeBySctRevisionCode(dataItem: Input, visited = new Set<string>()): Promise<SctItem[]> {
//   const result: SctItem[] = []

//   for (const code of dataItem.SCT_REVISION_CODE) {
//     if (!code || visited.has(code)) continue

//     visited.add(code)

//     const sql = await StandardCostForProductSQL.getParentProductTypeBySctRevisionCode({
//       SCT_REVISION_CODE: code,
//     })

//     const children = (await MySQLExecute.search(sql)) as SctItem[]

//     for (const item of children) {
//       if (!item.SCT_REVISION_CODE) continue
//       if (visited.has(item.SCT_REVISION_CODE)) continue

//       result.push(item)
//       const parents = await getParentProductTypeBySctRevisionCode({ SCT_REVISION_CODE: [item.SCT_REVISION_CODE] }, visited)

//       result.push(...parents)
//     }
//   }

//   return result
// }

type SearchFilterId =
  | 'SCT_REVISION_CODE'
  | 'FISCAL_YEAR'
  | 'SCT_PATTERN_ID'
  | 'ITEM_CATEGORY_ID'
  | 'PRODUCT_CATEGORY_ID'
  | 'PRODUCT_MAIN_ID'
  | 'PRODUCT_SUB_ID'
  | 'PRODUCT_TYPE_ID'
  | 'CUSTOMER_INVOICE_ID'
  | 'SCT_REASON_SETTING_ID'
  | 'SCT_TAG_SETTING_ID'
  | 'SCT_STATUS_PROGRESS_ID'
  | 'includingCancelled'
  | 'alreadyHaveSellingPrice'

type SearchFilterItem = {
  id: SearchFilterId
  value: any
}

type GetSctRevisionCodeCondition = {
  SearchFilters: SearchFilterItem[]
}

export async function getSctRevisionCodeByCondition(dataItem: GetSctRevisionCodeCondition) {
  //const sctRevisionCode = dataItem.SearchFilters.find((f) => f.id === 'SCT_REVISION_CODE')?.value as string[] | undefined

  const sctRevisionCode = await StandardCostForProductService.search(dataItem, {
    sctRevisionCode_Fns: 'IN',
  })

  const result = await getParentProductTypeBySctRevisionCode(sctRevisionCode as Input[])

  return result
}
type Input = {
  SCT_REVISION_CODE: string
}

type SctItem = {
  SCT_REVISION_CODE: string
}

async function getParentProductTypeBySctRevisionCode(dataItems: Input[], visited = new Set<string>()): Promise<SctItem[]> {
  const result: SctItem[] = []

  for (const code of dataItems) {
    if (!code.SCT_REVISION_CODE) continue
    if (visited.has(code.SCT_REVISION_CODE)) continue

    // ✅ FIX 1
    visited.add(code.SCT_REVISION_CODE)

    const sql = await StandardCostForProductSQL.getParentProductTypeBySctRevisionCode(code)

    const parents = (await MySQLExecute.search(sql)) as SctItem[]

    for (const parent of parents) {
      if (!parent.SCT_REVISION_CODE) continue
      if (visited.has(parent.SCT_REVISION_CODE)) continue

      result.push(parent)

      // ✅ FIX 2
      const upperParents = await getParentProductTypeBySctRevisionCode([parent], visited)

      result.push(...upperParents)
    }
  }

  // รวม input เดิม
  result.push(...dataItems)

  const unique = new Map(result.filter((i) => i?.SCT_REVISION_CODE).map((i) => [i.SCT_REVISION_CODE!, i]))

  return [...unique.values()]
}
