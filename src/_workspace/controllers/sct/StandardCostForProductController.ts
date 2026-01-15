import type { RowDataPacket } from 'mysql2'
import { StandardCostForProductModel } from '@src/_workspace/models/sct/StandardCostForProductModel'
import { getSqlWhereByColumnFilters } from '@src/helpers/getSqlWhereByFilterColumn'
import getSqlWhere_elysia from '@src/helpers/getSqlWhere_elysia'
import { ResponseI } from '@src/types/ResponseI'
import { deleteDataSuccess } from '@src/utils/MessageReturn'
import { Request, Response } from 'express'

export const conditionFormName = [
  'COST_CONDITION_RESOURCE_OPTION_ID',
  'MATERIAL_PRICE_RESOURCE_OPTION_ID',
  'YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID',
  'TIME_FROM_MFG_RESOURCE_OPTION_ID',
  'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID',
]

export const StandardCostForProductController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await StandardCostForProductModel.search(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'Search ProductCategory',
      TotalCountOnDb: result?.[0]?.['total_count'] ?? 0,
    } as ResponseI)
  },
  getAllWithWhereCondition_old_version: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    // กำหนด tableIds
    const tableIds = [
      // Header
      { table: '', id: 'SCT_REVISION_CODE', Fns: 'LIKE' },
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

      // { table: '', id: 'inuseForSearch', Fns: '=' },

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
    ]

    getSqlWhere_elysia(dataItem, tableIds)

    // if (dataItem.SearchFilters.find((item: any) => item.id == 'sctLatestRevisionOption')?.value === 'Latest') {
    //   dataItem.Order += ' AND SCT_REVISION_CODE DESC'
    // }

    // dataItem.sqlWhere = dataItem.Order.replaceAll('sctLatestRevisionOption', 'SCT_REVISION_CODE')

    dataItem.sqlWhere = dataItem.sqlWhere.replace(/WHERE\s+AND/g, 'WHERE ')
    dataItem.sqlWhere = dataItem.sqlWhere.replace(/AND\s+AND/g, 'AND')

    // dataItem.sqlWhere = dataItem.sqlWhere.replace('SCT_STATUS_PROGRESS_NAME IN', 'SCT_STATUS_PROGRESS_ID IN')
    // dataItem.sqlWhere = dataItem.sqlWhere.replace('PRODUCT_TYPE_CODE LIKE', 'PRODUCT_TYPE_CODE_FOR_SCT LIKE')

    // dataItem.sqlWhere = dataItem.sqlWhere.replace('STATUS_UPDATE_BY LIKE', 'UPDATE_BY LIKE')
    // dataItem.sqlWhere = dataItem.sqlWhere.replace('STATUS_UPDATE_DATE LIKE', 'UPDATE_DATE LIKE')

    // console.log(dataItem.SearchFilters.find((item: any) => item.id === 'alreadyHaveSellingPrice'))

    if (
      dataItem.SearchFilters.find((item: any) => item.id == 'alreadyHaveSellingPrice') !== '' &&
      dataItem.SearchFilters.find((item: any) => item.id == 'alreadyHaveSellingPrice') !== undefined
    ) {
      if (dataItem.SearchFilters.find((item: any) => item.id == 'alreadyHaveSellingPrice').value === 0) {
        dataItem.sqlWhere += ' AND SELLING_PRICE IS NULL'
      } else if (dataItem.SearchFilters.find((item: any) => item.id == 'alreadyHaveSellingPrice').value === 1) {
        dataItem.sqlWhere += ' AND SELLING_PRICE IS NOT NULL'
      }
    }

    // if (
    //   dataItem.SearchFilters.find((item: any) => item.id == 'includingCancelled')?.value === false ||
    //   dataItem.SearchFilters.find((item: any) => item.id == 'includingCancelled')?.value === ''
    // ) {
    //   dataItem.sqlWhere += ' AND SCT_STATUS_PROGRESS_ID <> 1'
    // }

    // dataItem.sqlWhere = dataItem.sqlWhere.replace(/WHERE\s+AND/g, 'WHERE ')
    // dataItem.sqlWhere = dataItem.sqlWhere.replace(/AND\s+AND/g, 'AND')

    if (
      dataItem.SearchFilters.find((item: any) => item.id == 'includingCancelled')?.value === false ||
      dataItem.SearchFilters.find((item: any) => item.id == 'includingCancelled')?.value === ''
    ) {
      if (!/where\s+/i.test(dataItem.sqlWhere)) {
        dataItem.sqlWhere += ' WHERE SCT_STATUS_PROGRESS_ID <> 1'
      } else {
        dataItem.sqlWhere += ' AND SCT_STATUS_PROGRESS_ID <> 1'
      }
    }

    // ค้นหาข้อมูล
    const result = await StandardCostForProductModel.getAllWithWhereCondition_old_version(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result,
      MethodOnDb: 'Search ProductCategory',
      TotalCountOnDb: result?.length ?? 0,
    } as ResponseI)
  },
  getSctFormDetail: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = (await StandardCostForProductModel.getSctFormDetail(dataItem)) as RowDataPacket[]

    const sctDataSelection = (await StandardCostForProductModel.getSctFComponentTypeResourceOption(dataItem)) as RowDataPacket[]

    const conditionFormValue = ['COST_CONDITION', 'MATERIAL_PRICE', 'YR_GR_FROM_ENGINEER', 'TIME_FROM_MFG', 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER']

    let sctOptionValue: any = {}
    for (let i = 0; i < sctDataSelection.length; i++) {
      const item = sctDataSelection[i]
      sctOptionValue[conditionFormName[item.SCT_F_COMPONENT_TYPE_ID - 1]] = item.SCT_F_RESOURCE_OPTION_ID.toString()

      if (item.SCT_F_COMPONENT_TYPE_ID === 1) {
        if (item.SCT_F_RESOURCE_OPTION_ID === 1) {
          sctOptionValue[conditionFormValue[item.SCT_F_COMPONENT_TYPE_ID - 1]] = item.SCT_F_RESOURCE_OPTION_NAME
        } else if (item.SCT_F_RESOURCE_OPTION_ID === 2) {
          sctOptionValue[conditionFormValue[item.SCT_F_COMPONENT_TYPE_ID - 1]] = {
            DIRECT_COST_CONDITION: {
              DIRECT_COST_CONDITION_ID: item.DIRECT_COST_CONDITION_ID,
              FISCAL_YEAR: item.DIRECT_COST_CONDITION_FISCAL_YEAR,
              VERSION: item.DIRECT_COST_CONDITION_VERSION,
            },
            INDIRECT_COST_CONDITION: {
              INDIRECT_COST_CONDITION_ID: item.INDIRECT_COST_CONDITION_ID,
              FISCAL_YEAR: item.INDIRECT_COST_CONDITION_FISCAL_YEAR,
              VERSION: item.INDIRECT_COST_CONDITION_VERSION,
            },
            OTHER_COST_CONDITION: {
              OTHER_COST_CONDITION_ID: item.OTHER_COST_CONDITION_ID,
              FISCAL_YEAR: item.OTHER_COST_CONDITION_FISCAL_YEAR,
              VERSION: item.OTHER_COST_CONDITION_VERSION,
            },
            SPECIAL_COST_CONDITION: {
              SPECIAL_COST_CONDITION_ID: item.SPECIAL_COST_CONDITION_ID,
              FISCAL_YEAR: item.SPECIAL_COST_CONDITION_FISCAL_YEAR,
              VERSION: item.SPECIAL_COST_CONDITION_VERSION,
            },
          }
        }
      } else if (item.SCT_F_COMPONENT_TYPE_ID === 2) {
        if (item.SCT_F_RESOURCE_OPTION_ID === 1) {
          sctOptionValue[conditionFormValue[item.SCT_F_COMPONENT_TYPE_ID - 1]] = item.SCT_F_RESOURCE_OPTION_NAME
        } else if (item.SCT_F_RESOURCE_OPTION_ID === 2) {
          sctOptionValue[conditionFormValue[item.SCT_F_COMPONENT_TYPE_ID - 1]] = {
            FISCAL_YEAR: item.MATERIAL_PRICE_FISCAL_YEAR,
          }
        }
      }
    }

    let sctSettingValue: any = {}

    if (result[0]?.SCT_TAG_SETTING_ID) {
      sctSettingValue.SCT_TAG_SETTING = {
        SCT_TAG_SETTING_ID: result[0].SCT_TAG_SETTING_ID,
        SCT_TAG_SETTING_NAME: result[0].SCT_TAG_SETTING_NAME,
      }
    }

    if (result[0]?.SCT_REASON_SETTING_ID) {
      sctSettingValue.SCT_REASON_SETTING = {
        SCT_REASON_SETTING_ID: result[0].SCT_REASON_SETTING_ID,
        SCT_REASON_SETTING_NAME: result[0].SCT_REASON_SETTING_NAME,
      }
    }

    const resultFormatting = {
      ...result[0],
      ...sctOptionValue,
      ...sctSettingValue,
      FISCAL_YEAR: {
        value: Number(result[0].FISCAL_YEAR),
        label: Number(result[0].FISCAL_YEAR),
      },
      PRODUCT_CATEGORY: {
        PRODUCT_CATEGORY_ID: result[0].PRODUCT_CATEGORY_ID,
        PRODUCT_CATEGORY_NAME: result[0].PRODUCT_CATEGORY_NAME,
        PRODUCT_CATEGORY_ALPHABET: result[0].PRODUCT_CATEGORY_ALPHABET,
      },
      PRODUCT_MAIN: {
        ACCOUNT_DEPARTMENT_CODE: result[0].ACCOUNT_DEPARTMENT_CODE,
        ACCOUNT_DEPARTMENT_CODE_ID: result[0].ACCOUNT_DEPARTMENT_CODE_ID,
        ACCOUNT_DEPARTMENT_NAME: result[0].ACCOUNT_DEPARTMENT_NAME,
        PRODUCT_CATEGORY_ALPHABET: result[0].PRODUCT_CATEGORY_ALPHABET,
        PRODUCT_CATEGORY_ID: result[0].PRODUCT_CATEGORY_ID,
        PRODUCT_CATEGORY_NAME: result[0].PRODUCT_CATEGORY_NAME,
        PRODUCT_CATEGORY_CODE: result[0].PRODUCT_CATEGORY_CODE,
        PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID: result[0].PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID,
        PRODUCT_MAIN_ID: result[0].PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: result[0].PRODUCT_MAIN_NAME,
        PRODUCT_MAIN_ALPHABET: result[0].PRODUCT_MAIN_ALPHABET,
      },
      PRODUCT_SUB: {
        PRODUCT_SUB_ID: result[0].PRODUCT_SUB_ID,
        PRODUCT_SUB_NAME: result[0].PRODUCT_SUB_NAME,
        PRODUCT_SUB_ALPHABET: result[0].PRODUCT_SUB_ALPHABET,
      },
      PRODUCT_TYPE: {
        BOM_ID: result[0].PRODUCT_TYPE_BOM_ID,
        ITEM_CATEGORY_ID: result[0].ITEM_CATEGORY_ID,
        ITEM_CATEGORY_NAME: result[0].ITEM_CATEGORY_NAME,
        PRODUCT_MAIN_ALPHABET: result[0].PRODUCT_MAIN_ALPHABET,
        PRODUCT_MAIN_ID: result[0].PRODUCT_MAIN_ID,
        PRODUCT_SPECIFICATION_TYPE_ALPHABET: result[0].PRODUCT_SPECIFICATION_TYPE_ALPHABET,
        PRODUCT_SPECIFICATION_TYPE_NAME: result[0].PRODUCT_SPECIFICATION_TYPE_NAME,
        PRODUCT_SUB_ID: result[0].PRODUCT_SUB_ID,
        PRODUCT_TYPE_CODE: result[0].PRODUCT_TYPE_CODE,
        PRODUCT_TYPE_ID: result[0].PRODUCT_TYPE_ID,
        PRODUCT_TYPE_NAME: result[0].PRODUCT_TYPE_NAME,
      },
      SCT_PATTERN_NO: {
        value: result[0].SCT_PATTERN_ID,
        label: result[0].SCT_PATTERN_NAME,
      },
    }

    res.json({
      Status: true,
      ResultOnDb: resultFormatting,
      TotalCountOnDb: 1,
      MethodOnDb: 'Get Sct Form Details',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getCompletedSctAllData: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const dataHeader = (await StandardCostForProductModel.getSctHeader(dataItem)) as RowDataPacket[]
    const sellingPrice = (await StandardCostForProductModel.getSellingPrice(dataItem)) as RowDataPacket[]
    const totalFlowProcess = (await StandardCostForProductModel.getTotalFlowProcess(dataItem)) as RowDataPacket[]
    const flowProcess = (await StandardCostForProductModel.getFlowProcess(dataItem)) as RowDataPacket[]
    const totalMaterial = (await StandardCostForProductModel.getTotalMaterial(dataItem)) as RowDataPacket[]
    const material = (await StandardCostForProductModel.getMaterial(dataItem)) as RowDataPacket[]
    const indirectCostPriceTabsData = (await StandardCostForProductModel.getIndirectCostPriceTabsData(dataItem)) as RowDataPacket[]
    const sctDataSelection = (await StandardCostForProductModel.getSctComponentTypeResourceOption(dataItem)) as RowDataPacket[]

    // const result = {
    //   data: data[0],
    //   flowProcess,
    //   material
    // }

    res.json({
      Status: true,
      ResultOnDb: [
        {
          dataHeader: dataHeader[0],
          dataHeader_2: dataHeader?.[1],
          sellingPrice: sellingPrice[0],
          totalFlowProcess: totalFlowProcess[0],
          flowProcess,
          totalMaterial: totalMaterial[0],
          material: material.map((item: any, index) => {
            return {
              ...item,
              ITEM_NO: index + 1,
            }
          }),
          indirectCostPriceTabsData: indirectCostPriceTabsData[0],
          sctDataSelection,
        },
      ],
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  // getCostConditionData: async (req: Request, res: Response) => {
  //   let dataItem

  //   if (!req.body || Object.entries(req.body).length === 0) {
  //     dataItem = req.query
  //   } else {
  //     dataItem = req.body
  //   }

  //   const result = (await StandardCostForProductModel.getCostConditionData(dataItem)) as RowDataPacket[]

  //   res.json({
  //     Status: true,
  //     ResultOnDb: result,
  //     TotalCountOnDb: result.length,
  //     MethodOnDb: 'Search Sct Data',
  //     Message: 'Search Data Success',
  //   } as ResponseI)
  // },
  getYrGrData: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = (await StandardCostForProductModel.getYrGrData(dataItem)) as RowDataPacket[]

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getTimeData: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = (await StandardCostForProductModel.getTimeData(dataItem)) as RowDataPacket[]

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getMaterialPriceData: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result: any = await StandardCostForProductModel.getMaterialPriceData(dataItem)

    if (dataItem.RESOURCE_OPTION_ID === 1 || dataItem.RESOURCE_OPTION_ID === '1') {
      result = [...result[0], ...result[1][1]]
    } else {
      result = [...result[0]]
    }

    // result = result.flat()

    let priceAdjustment = (await StandardCostForProductModel.getItemPriceAdjustment(dataItem)) as RowDataPacket[]

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < priceAdjustment.length; j++) {
        if (result[i].BOM_FLOW_PROCESS_ITEM_USAGE_ID === priceAdjustment[j].BOM_FLOW_PROCESS_ITEM_USAGE_ID) {
          result[i].ITEM_M_S_PRICE_VALUE = priceAdjustment[j].SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE
        }
      }
    }

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getYrAccumulationMaterialData: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = (await StandardCostForProductModel.getYrAccumulationMaterialData(dataItem)) as RowDataPacket[]

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getSctDataOptionSelection: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.getSctDataOptionSelection(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getSctDataFlowProcess: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.getSctDataFlowProcess(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getSctDataMaterial: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.getSctDataMaterial(dataItem)
    for (let i = 0; i < result.length; i++) {
      result[i]['ITEM_NO'] = i + 1
    }

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getSctDataDetail: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.getSctDataDetail(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 1,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getSctCompareData: async (req: Request, res: Response) => {
    // let dataItem

    // if (!req.body || Object.entries(req.body).length === 0) {
    //   dataItem = req.query
    // } else {
    //   dataItem = req.body
    // }
    // const result = await StandardCostForProductModel.getSctCompareData(dataItem)

    res.json({
      Status: true,
      // ResultOnDb: result,
      TotalCountOnDb: 1,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getSctDetailForAdjust: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.getSctDetailForAdjust(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 1,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchProductType: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'PRODUCT_TYPE_CODE' },
      { table: 'tb_1', id: 'PRODUCT_TYPE_NAME' },
      { table: 'tb_4', id: 'BOM_CODE' },
      { table: 'tb_4', id: 'BOM_NAME' },
      { table: 'tb_2', id: 'SCT_REVISION_CODE' },
    ]

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''
    if (typeof dataItem.Order === 'string') {
      try {
        dataItem.Order = JSON.parse(dataItem.Order) // แปลง string → array
      } catch (error) {
        console.error('Error parsing Order:', error)
        dataItem.Order = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
      }
    }

    if (dataItem['Order'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await StandardCostForProductModel.searchProductType(dataItem)
    for (let i = 0; i < result[1].length; i++) {
      result[1][i]['No'] = i + 1
    }

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Product Type',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchStandardFormProductType: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const tableIds = [
      { table: 'tb_3', id: 'SCT_F_CREATE_TYPE_NAME' },
      { table: 'tb_2', id: 'SCT_F_CODE' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_CODE', alias: 'PRODUCT_TYPE_CODE_FOR_SCT' },
      { table: 'tb_4', id: 'PRODUCT_TYPE_NAME' },
      { table: 'tb_6', id: 'BOM_CODE' },
      { table: 'tb_6', id: 'BOM_NAME' },
      { table: 'tb_10', id: 'PRODUCT_CATEGORY_NAME' },
      { table: 'tb_9', id: 'PRODUCT_MAIN_NAME' },
      { table: 'tb_8', id: 'PRODUCT_SUB_NAME' },
      { table: 'tb_1', id: 'FISCAL_YEAR' },
      { table: 'tb_11', id: 'FLOW_NAME' },
      { table: 'tb_12', id: 'SCT_PATTERN_NAME' },
      { table: 'tb_14', id: 'SCT_REASON_SETTING_NAME' },
      { table: 'tb_16', id: 'SCT_TAG_SETTING_NAME' },
      { table: 'tb_1', id: 'UPDATE_DATE' },
      { table: 'tb_1', id: 'UPDATE_BY' },
    ]

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''
    if (typeof dataItem.Order === 'string') {
      try {
        dataItem.Order = JSON.parse(dataItem.Order) // แปลง string → array
      } catch (error) {
        console.error('Error parsing Order:', error)
        dataItem.Order = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
      }
    }
    if (dataItem['Order'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await StandardCostForProductModel.searchStandardFormProductType(dataItem)
    for (let i = 0; i < result[1].length; i++) {
      result[1][i]['No'] = i + 1
    }

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Sct For Product',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.create(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Create Sct Form',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },
  createSctData: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.createSctData(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Create Sct Data',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },
  updateSctData: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await StandardCostForProductModel.updateSctData(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Update Sct Data',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.update(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Update Sct Form',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },
  deleteSctForm: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await StandardCostForProductModel.deleteSctForm(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Delete Sct Form',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },

  // createSctFormMultiple: async ({ body }) => {
  //   const result = await StandardCostForProductModel.createSctFormMultiple(body)

  //   // console.log(result)

  //   return {
  //     Status: true,
  //     ResultOnDb: result,
  //     TotalCountOnDb: 0,
  //     MethodOnDb: 'Create Sct Form Multiple',
  //     Message: 'บันทึกข้อมูลสำเร็จ Successfully saved'
  //   } as ResponseI
  // },

  createSctFormMultipleForTest: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.createSctFormMultiple(dataItem)

    res.status(200).json(result)
  },
  changeSctProgress: async (req: Request, res: Response) => {
    type DataItem = {
      SCT_ID: string[]
      SCT_STATUS_PROGRESS_ID: number
      UPDATE_BY: string
      CANCEL_REASON: string
      listStatusSctProgress: { SCT_STATUS_PROGRESS_ID: number }[]
    }

    let dataItem: DataItem

    if (Object.entries(req.body).length === 0) {
      const queryData = req.query.data as string
      dataItem = JSON.parse(queryData) as DataItem
    } else {
      dataItem = req.body as DataItem
    }

    // Back to Preparing , Prepared
    if (dataItem.SCT_STATUS_PROGRESS_ID == 2 || dataItem.SCT_STATUS_PROGRESS_ID == 3) {
      // 4 Completed
      // 6 Waiting Approve
      // 7 Can use
      // 1 Cancelled
      if (dataItem.listStatusSctProgress.some((statusSctProgress) => [4, 6, 7, 1].includes(statusSctProgress.SCT_STATUS_PROGRESS_ID))) {
        return res.status(200).json({
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Change Sct Progress',
          Message: 'ไม่สามารถเปลี่ยนสถานะได้ เนื่องจาก พบ SCT ที่อยู่ในสถานะ Stamped Data แล้ว',
        })
      }
    }

    //if (dataItem.SCT_STATUS_PROGRESS_ID === 2 || dataItem.SCT_STATUS_PROGRESS_ID === 1) {
    if (false) {
      // Change Status to "Preparing"

      let topSct: { SCT_ID: string }[] = []

      if (dataItem?.SCT_ID && dataItem?.SCT_ID.length > 0) {
        topSct = dataItem.SCT_ID.map((sctId) => {
          return {
            SCT_ID: sctId,
          }
        })
      }

      for (let i = 0; i < topSct.length; i++) {
        const data = topSct[i]

        const parentSct = (await StandardCostForProductModel.searchParentSct(data)) as { SCT_ID: string }[]

        if (parentSct.length > 0) {
          topSct.shift()

          topSct = [...topSct, ...parentSct]
          i--
        }
      }

      //topSct.push({ SCT_ID: dataItem.SCT_ID })

      dataItem.SCT_ID = topSct.map((sct: any) => sct.SCT_ID)

      console.log(dataItem.SCT_ID)

      await StandardCostForProductModel.changeSctProgress(dataItem)
    } else {
      await StandardCostForProductModel.changeSctProgress(dataItem)
    }

    return res.status(200).json({
      Status: true,
      ResultOnDb: [],
      TotalCountOnDb: 0,
      MethodOnDb: 'Change Sct Progress',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },

  deleteSctData: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await StandardCostForProductModel.deleteSctData(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Delete Sct Data',
      Message: deleteDataSuccess,
    } as ResponseI)
  },

  getTotalYR: async (req: Request, res: Response) => {
    const result = await StandardCostForProductModel.getTotalYR()

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Delete Sct Data',
      Message: deleteDataSuccess,
    } as ResponseI)
  },

  getSctReCalButton: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req?.body ?? {}).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let isTopSct = true
    let isHasSellingPrice = typeof dataItem.SELLING_PRICE === 'number' ? true : false
    let isSomeSctSubPreparing = await searchSctChildren(dataItem)
    let isRegenerate = dataItem?.IS_REFRESH_DATA_MASTER && dataItem.IS_REFRESH_DATA_MASTER === 'false' ? false : true
    let sctReasonSettingId = dataItem.SCT_REASON_SETTING_ID ?? 0
    let sctTagSettingId = dataItem.SCT_TAG_SETTING_ID ?? 0

    //* 3 - Prepared
    let sctStatusProgressId = dataItem.SCT_STATUS_PROGRESS_ID ?? 0

    // console.log(isSomeSctSubPreparing, 'isSomeSctSubPreparing')

    // Check is Top Sct
    let parent = (await StandardCostForProductModel.getParentSctIdBySctId(dataItem)) as RowDataPacket[]
    // console.log('parent', parent)

    if (parent.length > 0) {
      isTopSct = false
    }

    let isHasButton = false
    let isDisable = false
    let isGenerateButton = false

    let sctCase: string = ''

    let detailMessages = []

    if (!isTopSct) {
      detailMessages.push('This is not a top standard cost.')
    }
    if (isSomeSctSubPreparing) {
      detailMessages.push('This standard cost has sub-standard costs that are still in "Preparing".')
    }
    if (sctStatusProgressId != 3) {
      detailMessages.push('This standard cost is not "Prepared".')
    }
    if (isHasSellingPrice) {
      detailMessages.push('Standard Cost has already been calculated. (Standard Cost ถูกคำนวณแล้ว)')
    }

    if (isTopSct && true && true && true && sctStatusProgressId == 3 && !isSomeSctSubPreparing && !isHasSellingPrice) {
      sctCase = 'A'
    } else if (!isTopSct && true && true && true && sctStatusProgressId == 3 && !isSomeSctSubPreparing && isHasSellingPrice) {
      sctCase = 'H'
    } else if (isTopSct && true && true && true && sctStatusProgressId == 2 && true && !isHasSellingPrice) {
      sctCase = 'C'
    } else if (isTopSct && true && true && true && sctStatusProgressId == 3 && isSomeSctSubPreparing && isHasSellingPrice) {
      sctCase = 'D'
    } else if (isTopSct && true && true && true && sctStatusProgressId != 3 && sctStatusProgressId != 2 && true && true) {
      sctCase = 'E'
    } else if (isTopSct && true && true && true && sctStatusProgressId == 3 && isSomeSctSubPreparing && !isHasSellingPrice) {
      sctCase = 'F'
    } else if (isTopSct && true && true && true && sctStatusProgressId == 3 && !isSomeSctSubPreparing && isHasSellingPrice && isRegenerate) {
      sctCase = 'G'
    } else if (!isTopSct && true && true && true && true && true && true) {
      sctCase = 'B'
    } else if (isTopSct && true && true && true && sctStatusProgressId == 3 && !isSomeSctSubPreparing && isHasSellingPrice && !isRegenerate) {
      sctCase = 'I'
    } else if (isTopSct && true && true && true && sctStatusProgressId == 3 && !isSomeSctSubPreparing && isHasSellingPrice) {
      sctCase = 'J'
    } else if (isTopSct && true && sctReasonSettingId == 1 && !sctTagSettingId && true && true && true) {
      sctCase = 'K'
    }

    switch (sctCase) {
      case 'A':
        isHasButton = true
        isDisable = false
        isGenerateButton = true
        break
      case 'B':
        isHasButton = false
        isDisable = true
        isGenerateButton = true
        break
      case 'C':
        isHasButton = true
        isDisable = true
        isGenerateButton = true
        break
      case 'D':
        isHasButton = true
        isDisable = true
        isGenerateButton = true
        break
      case 'E':
        isHasButton = false
        isDisable = true
        isGenerateButton = true
        break
      case 'F':
        isHasButton = true
        isDisable = true
        isGenerateButton = true
        break
      case 'G':
        isHasButton = true
        isDisable = false
        isGenerateButton = false
        break
      case 'H':
        isHasButton = false
        isDisable = false
        isGenerateButton = false
        break
      case 'I':
        isHasButton = true
        isDisable = true
        isGenerateButton = false
        break
      case 'J':
        isHasButton = false
        isDisable = true
        isGenerateButton = false
        break
      case 'K':
        isHasButton = false
        isDisable = true
        isGenerateButton = false
        break

      default:
        break
    }

    res.json({
      Status: true,
      ResultOnDb: [
        {
          SCT_ID: dataItem.SCT_ID,
          IS_GENERATE_BUTTON: isGenerateButton,
          IS_DISABLE: isDisable,
          IS_HAS_BUTTON: isHasButton,
          DETAIL_MESSAGES: detailMessages,
        },
      ],
      TotalCountOnDb: 0,
      MethodOnDb: 'Get Sct Re-cal Button',
      Message: '',
    } as ResponseI)
  },
  updateSctTagBudget: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await StandardCostForProductModel.updateSctTagBudget(dataItem)

    res.json(result)
  },
  createSctFormMultiple: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await StandardCostForProductModel.createSctFormMultiple(dataItem)

    res.status(200).json(result)
  },
}

async function searchSctChildren(dataItem: { SCT_ID: string }) {
  let sctChild

  // if (dataItem.SCT_TAG_SETTING_ID === '1') {
  //   sctChild = (await StandardCostForProductModel.getReCalButton(dataItem)) as RowDataPacket[]
  // } else {
  sctChild = (await StandardCostForProductModel.getReCalButton(dataItem)) as RowDataPacket[]
  //}

  if (sctChild.some((item) => item.SCT_STATUS_PROGRESS_ID == 2)) {
    return true
  }

  // update code with recursive until no more child
  // or has some child with SCT_STATUS_PROGRESS_ID <= 2 return true and stop recursive

  for (let i = 0; i < sctChild.length; i++) {
    await searchSctChildren({
      SCT_ID: sctChild[i].SCT_ID,
    })
  }

  return false
}
