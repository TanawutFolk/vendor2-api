import { SctBomFlowProcessItemUsagePriceSQL } from '@src/_workspace/sql/sct/sct-for-product/SctBomFlowProcessItemUsagePriceSQL'
import { SctCompareSQL } from '@src/_workspace/sql/sct/sct-for-product/SctCompareSQL'
import { SctSQL } from '@src/_workspace/sql/sct/sct-for-product/SctSQL'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { ResponseI } from '@src/types/ResponseI'

import { RowDataPacket } from 'mysql2'

// const conditionName = ['COST_CONDITION', 'MATERIAL_PRICE', 'YR_GR_FROM_ENGINEER', 'TIME_FROM_MFG', 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER']

export const SctService = {
  // createSctFormMultiple: async (dataItem: any) => {
  //   let sqlList = []

  //   let cntInsert = 0

  //   const UUID_SCT_F_ID = uuidv7()
  //   const UUID_SCT_F_M_ID = uuidv7()

  //   for (const data of dataItem.LIST_MULTIPLE_SCT_DATA) {
  //     if (!data.IS_DRAFT) {
  //       data.PRODUCT_TYPE = {}

  //       let sqlBom
  //       // ** Get Bom Data from Sct Id Selection
  //       if (data?.SCT_ID_SELECTION) {
  //         sqlBom = await BomSQL.searchBomDetailsBySctId(data)
  //       } else {
  //         // ** Define Get Bom Data [Flow Process , Material In Process]
  //         sqlBom = await BomSQL.searchBomDetailsByBomId(data)
  //       }

  //       const result = (await MySQLExecute.search(sqlBom)) as RowDataPacket[]
  //       if (result && result.length > 0) {
  //         data.BOM_ID = result[0].BOM_ID
  //       }

  //       let item: any = {}
  //       let process: any = []
  //       let productMain = {}
  //       let bomName = ''
  //       let flowName = ''
  //       let bomCode = ''
  //       let flowCode = ''
  //       let productType: any = []

  //       if (result.length > 0) {
  //         process = result.map((res) => {
  //           const id = (Math.random() + 1).toString(36).substring(7)

  //           item[id] = {
  //             ITEM: {
  //               ...res,
  //             },
  //             ITEM_CATEGORY: {
  //               ITEM_CATEGORY_ID: res.ITEM_CATEGORY_ID,
  //               ITEM_CATEGORY_NAME: res.ITEM_CATEGORY_NAME,
  //               ITEM_CATEGORY_ALPHABET: res.ITEM_CATEGORY_ALPHABET,
  //             },
  //             PROCESS: {
  //               value: res.PROCESS_ID,
  //               label: res.PROCESS_NAME,
  //             },
  //             USAGE_QUANTITY: res?.USAGE_QUANTITY ? `${res.USAGE_QUANTITY}` : '',
  //           }

  //           if (!res?.ITEM_ID) {
  //             delete item[id]
  //           }

  //           return {
  //             FLOW_PROCESS_NO: res.FLOW_PROCESS_NO,
  //             PROCESS_ID: res.PROCESS_ID,
  //             PROCESS_NAME: res.PROCESS_NAME,
  //           }
  //         })

  //         productType = result.map((res) => {
  //           return {
  //             PRODUCT_TYPE_ID: res.PRODUCT_TYPE_ID,
  //             PRODUCT_TYPE_CODE: res.PRODUCT_TYPE_CODE,
  //             PRODUCT_TYPE_NAME: res.PRODUCT_TYPE_NAME,
  //             IS_OLD: true,
  //           }
  //         })

  //         productMain = {
  //           PRODUCT_MAIN_ID: result[0].PRODUCT_MAIN_ID,
  //           PRODUCT_MAIN_NAME: result[0].PRODUCT_MAIN_NAME,
  //           PRODUCT_MAIN_ALPHABET: result[0].PRODUCT_MAIN_ALPHABET,
  //         }

  //         bomName = result[0].BOM_NAME
  //         bomCode = result[0].BOM_CODE

  //         flowName = result[0].FLOW_NAME
  //         flowCode = result[0].FLOW_CODE

  //         process = process.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.FLOW_PROCESS_NO == v.FLOW_PROCESS_NO) == i)

  //         productType = productType.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.PRODUCT_TYPE_ID == v.PRODUCT_TYPE_ID) == i)

  //         process = process.filter((v: any) => v.PROCESS_ID !== null)

  //         productType = productType.filter((v: any) => v.PRODUCT_TYPE_ID !== null)
  //       }

  //       data.MATERIAL_IN_PROCESS = {
  //         ITEM: item,
  //         PROCESS: process,
  //         productMain: productMain,
  //         bomName: bomName,
  //         flowName: flowName,
  //         bomCode: bomCode,
  //         flowCode: flowCode,
  //         productType: productType,
  //       }

  //       // ** Define DataItem Variable
  //       data.PRODUCT_TYPE.PRODUCT_TYPE_ID = data.PRODUCT_TYPE_ID
  //       data.PRODUCT_TYPE.PRODUCT_TYPE_CODE = data.PRODUCT_TYPE_CODE
  //       data.PRODUCT_TYPE.PRODUCT_MAIN_ALPHABET = data.PRODUCT_MAIN_ALPHABET
  //       data.PRODUCT_TYPE.PRODUCT_SPECIFICATION_TYPE_ALPHABET = data.PRODUCT_SPECIFICATION_TYPE_ALPHABET
  //       data.SCT_F_M_CREATE_TYPE_ALPHABET = 'M'

  //       if (cntInsert == 0) {
  //         sqlList.push(await StandardCostForProductSQL.generateSctCodeMultiple(data)) // !!  1
  //       }
  //       sqlList.push(await StandardCostForProductSQL.generateSctCode(data)) // !! 2

  //       let startDate = new Date(data?.START_DATE)
  //       startDate.setHours(startDate.getHours() + 7)
  //       startDate.setUTCHours(0, 0, 0, 0)

  //       let endDate = new Date(data?.END_DATE)
  //       endDate.setHours(endDate.getHours() + 7)
  //       endDate.setUTCHours(0, 0, 0, 0)

  //       data.START_DATE = startDate.toISOString().split('T')[0]
  //       data.END_DATE = endDate.toISOString().split('T')[0]

  //       const UUID_SCT_ID = uuidv7()
  //       sqlList.push(await StandardCostForProductSQL.insertSct(data, UUID_SCT_ID)) // !! 2

  //       //* Copy Data from SCT_ID_SELECTION
  //       if (data?.SCT_ID_SELECTION) {
  //         const copyTables = [
  //           {
  //             tableName: 'SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE',
  //             columnsNameForSearch: ['BOM_FLOW_PROCESS_ITEM_USAGE_ID', 'ITEM_M_S_PRICE_ID', 'PRICE', 'YIELD_ACCUMULATION', 'AMOUNT'],
  //             columnsNameForInsert: ['SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID', 'BOM_FLOW_PROCESS_ITEM_USAGE_ID', 'ITEM_M_S_PRICE_ID', 'PRICE', 'YIELD_ACCUMULATION', 'AMOUNT'],
  //           },
  //           {
  //             tableName: 'SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER',
  //             columnsNameForSearch: ['FLOW_PROCESS_ID', 'YIELD_RATE', 'YIELD_ACCUMULATION', 'GO_STRAIGHT_RATE', 'NOTE'],
  //             columnsNameForInsert: ['SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID', 'FLOW_PROCESS_ID', 'YIELD_RATE', 'YIELD_ACCUMULATION', 'GO_STRAIGHT_RATE', 'NOTE'],
  //           },
  //           {
  //             tableName: 'SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG',
  //             columnsNameForSearch: ['FLOW_PROCESS_ID', 'CLEAR_TIME', 'ESSENTIAL_TIME', 'PROCESS_STANDARD_TIME', 'NOTE'],
  //             columnsNameForInsert: ['SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID', 'FLOW_PROCESS_ID', 'CLEAR_TIME', 'ESSENTIAL_TIME', 'PROCESS_STANDARD_TIME', 'NOTE'],
  //           },
  //           {
  //             tableName: 'SCT_FLOW_PROCESS_SEQUENCE',
  //             columnsNameForSearch: ['FLOW_PROCESS_ID', 'SCT_PROCESS_SEQUENCE_CODE', 'OLD_SYSTEM_PROCESS_SEQUENCE_CODE', 'OLD_SYSTEM_COLLECTION_POINT'],
  //             columnsNameForInsert: [
  //               'SCT_FLOW_PROCESS_SEQUENCE_ID',

  //               'FLOW_PROCESS_ID',
  //               'SCT_PROCESS_SEQUENCE_CODE',
  //               'OLD_SYSTEM_PROCESS_SEQUENCE_CODE',
  //               'OLD_SYSTEM_COLLECTION_POINT',
  //             ],
  //           },
  //           {
  //             tableName: 'SCT_PROCESSING_COST_BY_ENGINEER_TOTAL',
  //             columnsNameForSearch: ['TOTAL_YIELD_RATE', 'TOTAL_GO_STRAIGHT_RATE'],
  //             columnsNameForInsert: ['SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID', 'TOTAL_YIELD_RATE', 'TOTAL_GO_STRAIGHT_RATE'],
  //           },
  //           {
  //             tableName: 'SCT_PROCESSING_COST_BY_MFG_TOTAL',
  //             columnsNameForSearch: ['TOTAL_CLEAR_TIME', 'TOTAL_ESSENTIAL_TIME'],
  //             columnsNameForInsert: ['SCT_PROCESSING_COST_BY_MFG_TOTAL_ID', 'TOTAL_CLEAR_TIME', 'TOTAL_ESSENTIAL_TIME'],
  //           },
  //           {
  //             tableName: 'SCT_TOTAL_COST',
  //             columnsNameForSearch: [
  //               'DIRECT_UNIT_PROCESS_COST',
  //               'INDIRECT_RATE_OF_DIRECT_PROCESS_COST',
  //               'TOTAL_PROCESSING_TIME',
  //               'TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE',
  //               'TOTAL_DIRECT_COST',
  //               'DIRECT_PROCESS_COST',
  //               'IMPORTED_FEE',
  //               'IMPORTED_COST',
  //               'TOTAL',
  //               'TOTAL_PRICE_OF_RAW_MATERIAL',
  //               'TOTAL_PRICE_OF_SUB_ASSY',
  //               'TOTAL_PRICE_OF_SEMI_FINISHED_GOODS',
  //               'TOTAL_PRICE_OF_CONSUMABLE',
  //               'TOTAL_PRICE_OF_PACKING',
  //               'TOTAL_PRICE_OF_ALL_OF_ITEMS',
  //               'RM_INCLUDE_IMPORTED_COST',
  //               'CONSUMABLE_PACKING',
  //               'MATERIALS_COST',
  //               'INDIRECT_COST_SALE_AVE',
  //               'SELLING_EXPENSE',
  //               'GA',
  //               'MARGIN',
  //               'ESTIMATE_PERIOD_START_DATE',
  //               'TOTAL_YIELD_RATE',
  //               'TOTAL_CLEAR_TIME',
  //               'ADJUST_PRICE',
  //               'REMARK_FOR_ADJUST_PRICE',
  //               'NOTE',
  //               'SELLING_EXPENSE_FOR_SELLING_PRICE',
  //               'GA_FOR_SELLING_PRICE',
  //               'MARGIN_FOR_SELLING_PRICE',
  //               'IS_ADJUST_IMPORTED_COST',
  //               'IMPORTED_COST_DEFAULT',
  //               'TOTAL_GO_STRAIGHT_RATE',
  //               'CIT_FOR_SELLING_PRICE',
  //               'RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS',
  //               'ASSEMBLY_GROUP_FOR_SUPPORT_MES',
  //               'VAT_FOR_SELLING_PRICE',
  //               'CIT',
  //               'VAT',
  //               'TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST',
  //               'ESTIMATE_PERIOD_END_DATE',
  //               'TOTAL_ESSENTIAL_TIME',
  //               'SELLING_PRICE_BY_FORMULA',
  //               'SELLING_PRICE',
  //             ],
  //             columnsNameForInsert: [
  //               'SCT_TOTAL_COST_ID',

  //               'DIRECT_UNIT_PROCESS_COST',
  //               'INDIRECT_RATE_OF_DIRECT_PROCESS_COST',
  //               'TOTAL_PROCESSING_TIME',
  //               'TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE',
  //               'TOTAL_DIRECT_COST',
  //               'DIRECT_PROCESS_COST',
  //               'IMPORTED_FEE',
  //               'IMPORTED_COST',
  //               'TOTAL',
  //               'TOTAL_PRICE_OF_RAW_MATERIAL',
  //               'TOTAL_PRICE_OF_SUB_ASSY',
  //               'TOTAL_PRICE_OF_SEMI_FINISHED_GOODS',
  //               'TOTAL_PRICE_OF_CONSUMABLE',
  //               'TOTAL_PRICE_OF_PACKING',
  //               'TOTAL_PRICE_OF_ALL_OF_ITEMS',
  //               'RM_INCLUDE_IMPORTED_COST',
  //               'CONSUMABLE_PACKING',
  //               'MATERIALS_COST',
  //               'INDIRECT_COST_SALE_AVE',
  //               'SELLING_EXPENSE',
  //               'GA',
  //               'MARGIN',
  //               'ESTIMATE_PERIOD_START_DATE',
  //               'TOTAL_YIELD_RATE',
  //               'TOTAL_CLEAR_TIME',
  //               'ADJUST_PRICE',
  //               'REMARK_FOR_ADJUST_PRICE',
  //               'NOTE',
  //               'SELLING_EXPENSE_FOR_SELLING_PRICE',
  //               'GA_FOR_SELLING_PRICE',
  //               'MARGIN_FOR_SELLING_PRICE',
  //               'IS_ADJUST_IMPORTED_COST',
  //               'IMPORTED_COST_DEFAULT',
  //               'TOTAL_GO_STRAIGHT_RATE',
  //               'CIT_FOR_SELLING_PRICE',
  //               'RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS',
  //               'ASSEMBLY_GROUP_FOR_SUPPORT_MES',
  //               'VAT_FOR_SELLING_PRICE',
  //               'CIT',
  //               'VAT',
  //               'TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST',
  //               'ESTIMATE_PERIOD_END_DATE',
  //               'TOTAL_ESSENTIAL_TIME',
  //               'SELLING_PRICE_BY_FORMULA',
  //               'SELLING_PRICE',
  //             ],
  //           },
  //           {
  //             tableName: 'SCT_DETAIL_FOR_ADJUST',
  //             columnsNameForSearch: ['TOTAL_INDIRECT_COST', 'CIT', 'VAT'],
  //             columnsNameForInsert: ['SCT_DETAIL_FOR_ADJUST_ID', 'TOTAL_INDIRECT_COST', 'CIT', 'VAT'],
  //           },
  //         ]

  //         for (let tableData of copyTables) {
  //           const sqlTemp = await StandardCostForProductSQL.searchCopyDataFromSctIdSelection(data, tableData)
  //           const resultTemp = (await MySQLExecute.search(sqlTemp)) as RowDataPacket[]

  //           for (let dataTemp of resultTemp) {
  //             if (dataTemp?.ESTIMATE_PERIOD_START_DATE) {
  //               dataTemp.ESTIMATE_PERIOD_START_DATE = dayjs(dataTemp.ESTIMATE_PERIOD_START_DATE).format('YYYY-MM-DD')
  //             }
  //             if (dataTemp?.ESTIMATE_PERIOD_END_DATE) {
  //               dataTemp.ESTIMATE_PERIOD_END_DATE = dayjs(dataTemp.ESTIMATE_PERIOD_END_DATE).format('YYYY-MM-DD')
  //             }

  //             sqlList.push(await StandardCostForProductSQL.insertCopyDataFromSctIdSelection(data, tableData, UUID_SCT_ID, dataTemp))
  //           }
  //         }
  //       }

  //       if (cntInsert == 0) {
  //         sqlList.push(await StandardCostForProductSQL.insertSctFMultiple(data, UUID_SCT_F_ID)) //  !! 1
  //       }
  //       const UUID_SCT_F_REASON_HISTORY_ID = uuidv7()
  //       data.UUID_SCT_F_ID = UUID_SCT_F_ID
  //       if (cntInsert == 0) {
  //         sqlList.push(await StandardCostForProductSQL.insertSctFReasonHistory(data, UUID_SCT_F_REASON_HISTORY_ID)) // !! 1
  //       }

  //       if (cntInsert == 0) {
  //         if (data?.SCT_TAG_SETTING) {
  //           const UUID_SCT_F_TAG_HISTORY_ID = uuidv7()
  //           sqlList.push(await StandardCostForProductSQL.insertSctFTagHistory(data, UUID_SCT_F_TAG_HISTORY_ID)) // !! 1
  //         }
  //       }

  //       const UUID_SCT_SCT_F_ID = uuidv7()
  //       data.UUID_SCT_ID = UUID_SCT_ID
  //       data.UUID_SCT_F_ID = UUID_SCT_F_ID

  //       sqlList.push(await StandardCostForProductSQL.insertSctSctF(data, UUID_SCT_SCT_F_ID)) // !! 2

  //       // ** Multiple Create

  //       if (cntInsert == 0) {
  //         sqlList.push(await StandardCostForProductSQL.insertSctFM(data, UUID_SCT_F_M_ID)) // !! 1
  //       }

  //       const SCT_F_M_PRODUCT_TYPE_ID = uuidv7()
  //       data.UUID_SCT_F_M_ID = UUID_SCT_F_M_ID
  //       sqlList.push(await StandardCostForProductSQL.insertSctFMProductType(data, SCT_F_M_PRODUCT_TYPE_ID)) // !! 2

  //       const conditionFormName = [
  //         'COST_CONDITION_RESOURCE_OPTION_ID',
  //         'MATERIAL_PRICE_RESOURCE_OPTION_ID',
  //         'YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID',
  //         'TIME_FROM_MFG_RESOURCE_OPTION_ID',
  //         'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID',
  //       ]

  //       for (let i = 1; i <= conditionFormName.length; i++) {
  //         const UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()
  //         const UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = uuidv7()
  //         const UUID_SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_ID = uuidv7()
  //         const UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_SCT_ID = uuidv7()

  //         const dataTemp = {
  //           UUID_SCT_F_ID: UUID_SCT_F_ID,
  //           UUID_SCT_ID: UUID_SCT_ID,
  //           UUID_SCT_F_M_ID: UUID_SCT_F_M_ID,
  //           SCT_F_COMPONENT_TYPE_ID: i,
  //           UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //           SCT_F_RESOURCE_OPTION_ID: data[conditionFormName[i - 1]],
  //           RESOURCE_OPTION_DESCRIPTION:
  //             data[conditionFormName[i - 1]] == 2 && conditionName[i - 1] !== 'COST_CONDITION'
  //               ? JSON.stringify(dataItem[conditionName[i - 1]])
  //               : data[conditionFormName[i - 1]] == 4
  //                 ? JSON.stringify(data[conditionName[i - 1]])
  //                 : '',
  //           CREATE_BY: data.CREATE_BY,
  //           SCT_ID_SELECTION: data.SCT_ID_SELECTION,
  //         }

  //         if (cntInsert == 0) {
  //           sqlList.push(await StandardCostForProductSQL.insertSctFComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))
  //         }

  //         sqlList.push(await SctFMComponentTypeResourceOptionSelectSQL.insert(dataTemp, UUID_SCT_F_M_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_ID))

  //         sqlList.push(await StandardCostForProductSQL.insertSctComponentTypeResourceOptionSelect(dataTemp, UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID))

  //         sqlList.push(await SctComponentTypeResourceOptionSelectionSct.insert(dataTemp, UUID_SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_SCT_ID))

  //         //* Insert sct data (for preparing) if RESOURCE_OPTION_ID = 2, 4
  //         //* if RESOURCE_OPTION_ID = 1, 3 => will insert after sct status is prepared

  //         //* Cost Condition
  //         // if (conditionFormName[i - 1] == 'COST_CONDITION_RESOURCE_OPTION_ID') {
  //         //   if (data[conditionFormName[i - 1]] == '2') {
  //         //     const costCondition = {
  //         //       DIRECT_COST_CONDITION_ID: data.COST_CONDITION.DIRECT_COST_CONDITION.DIRECT_COST_CONDITION_ID,
  //         //       INDIRECT_COST_CONDITION_ID: data.COST_CONDITION.INDIRECT_COST_CONDITION.INDIRECT_COST_CONDITION_ID,
  //         //       OTHER_COST_CONDITION_ID: data.COST_CONDITION.OTHER_COST_CONDITION.OTHER_COST_CONDITION_ID,
  //         //       SPECIAL_COST_CONDITION_ID: data.COST_CONDITION.SPECIAL_COST_CONDITION.SPECIAL_COST_CONDITION_ID,
  //         //     }
  //         //     const dataTempForDirectCostCondition = {
  //         //       SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
  //         //       SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //       DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
  //         //       CREATE_BY: data.CREATE_BY,
  //         //     }
  //         //     if (cntInsert == 0) {
  //         //       sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))
  //         //     }
  //         //     const dataTempForIndirectCostCondition = {
  //         //       SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
  //         //       SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //       INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
  //         //       CREATE_BY: data.CREATE_BY,
  //         //     }
  //         //     if (cntInsert == 0) {
  //         //       sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))
  //         //     }
  //         //     const dataTempForOtherCostCondition = {
  //         //       SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
  //         //       SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //       OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
  //         //       CREATE_BY: data.CREATE_BY,
  //         //     }
  //         //     if (cntInsert == 0) {
  //         //       sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))
  //         //     }
  //         //     const dataTempForSpecialCostCondition = {
  //         //       SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
  //         //       SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //       SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
  //         //       CREATE_BY: data.CREATE_BY,
  //         //     }
  //         //     if (cntInsert == 0) {
  //         //       sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
  //         //     }
  //         //   } else if (data[conditionFormName[i - 1]] == '4') {
  //         //     const costCondition: any = await StandardCostForProductService.searchCostConditionBySctFId(data)[0]
  //         //     const dataTempForDirectCostCondition = {
  //         //       SCT_F_DIRECT_COST_CONDITION_ID: uuidv7(),
  //         //       SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //       DIRECT_COST_CONDITION_ID: costCondition.DIRECT_COST_CONDITION_ID,
  //         //       SCT_ID: data.COST_CONDITION.SCT_ID,
  //         //       CREATE_BY: data.CREATE_BY,
  //         //     }
  //         //     if (cntInsert == 0) {
  //         //       sqlList.push(await StandardCostForProductSQL.insertSctFDirectCostCondition(dataTempForDirectCostCondition))
  //         //     }
  //         //     const dataTempForIndirectCostCondition = {
  //         //       SCT_F_INDIRECT_COST_CONDITION_ID: uuidv7(),
  //         //       SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //       INDIRECT_COST_CONDITION_ID: costCondition.INDIRECT_COST_CONDITION_ID,
  //         //       SCT_ID: data.COST_CONDITION.SCT_ID,
  //         //       CREATE_BY: data.CREATE_BY,
  //         //     }
  //         //     if (cntInsert == 0) {
  //         //       sqlList.push(await StandardCostForProductSQL.insertSctFIndirectCostCondition(dataTempForIndirectCostCondition))
  //         //     }
  //         //     const dataTempForOtherCostCondition = {
  //         //       SCT_F_OTHER_COST_CONDITION_ID: uuidv7(),
  //         //       SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //       OTHER_COST_CONDITION_ID: costCondition.OTHER_COST_CONDITION_ID,
  //         //       SCT_ID: data.COST_CONDITION.SCT_ID,
  //         //       CREATE_BY: data.CREATE_BY,
  //         //     }
  //         //     if (cntInsert == 0) {
  //         //       sqlList.push(await StandardCostForProductSQL.insertSctFOtherCostCondition(dataTempForOtherCostCondition))
  //         //     }
  //         //     const dataTempForSpecialCostCondition = {
  //         //       SCT_F_SPECIAL_COST_CONDITION_ID: uuidv7(),
  //         //       SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //       SPECIAL_COST_CONDITION_ID: costCondition.SPECIAL_COST_CONDITION_ID,
  //         //       SCT_ID: data.COST_CONDITION.SCT_ID,
  //         //       CREATE_BY: data.CREATE_BY,
  //         //     }
  //         //     if (cntInsert == 0) {
  //         //       sqlList.push(await StandardCostForProductSQL.insertSctFSpecialCostCondition(dataTempForSpecialCostCondition))
  //         //     }
  //         //   }
  //         // } else if (conditionFormName[i - 1] == 'MATERIAL_PRICE_RESOURCE_OPTION_ID') {
  //         //   const materialInProcess: any[] = Object.values(data.MATERIAL_IN_PROCESS)

  //         //   const itemIds = materialInProcess.map((item) => item?.ITEM?.ITEM_ID)

  //         //   // if (data[conditionFormName[i - 1]] == '2') {
  //         //   //   let itemMSPriceId: any[] = await ItemManufacturingStandardPriceService.getStandardPriceByItemId(itemIds, data.MATERIAL_PRICE.FISCAL_YEAR)
  //         //   //   itemMSPriceId = itemMSPriceId.map((item) => item.ITEM_M_S_PRICE_ID)
  //         //   //   // for (let id of itemMSPriceId) {
  //         //   //   //   const dataTempForMaterialPrice = {
  //         //   //   //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
  //         //   //   //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //   //   //     ITEM_M_S_PRICE_ID: id,
  //         //   //   //     CREATE_BY: data.CREATE_BY
  //         //   //   //   }
  //         //   //   //   if (cntInsert == 0) {
  //         //   //   //     sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
  //         //   //   //   }
  //         //   //   // }
  //         //   // } else if (dataItem[conditionFormName[i - 1]] == '4') {
  //         //   //   let itemMSPriceIds: any[] = await ItemManufacturingStandardPriceService.getItemMSPriceBySctFId(data)
  //         //   //   itemMSPriceIds = itemMSPriceIds.filter((item) => itemIds.includes(item.ITEM_ID))
  //         //   //   itemMSPriceIds = itemMSPriceIds.map((item) => item.ITEM_M_S_PRICE_ID)
  //         //   //   // for (let id of itemMSPriceIds) {
  //         //   //   //   const dataTempForMaterialPrice = {
  //         //   //   //     SCT_F_MATERIAL_PRICE_ID: uuidv7(),
  //         //   //   //     SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID,
  //         //   //   //     ITEM_M_S_PRICE_ID: id,
  //         //   //   //     SCT_ID: data.MATERIAL_PRICE.SCT_ID,
  //         //   //   //     CREATE_BY: data.CREATE_BY
  //         //   //   //   }
  //         //   //   //   if (cntInsert == 0) {
  //         //   //   //     sqlList.push(await StandardCostForProductSQL.insertSctFMaterialPrice(dataTempForMaterialPrice))
  //         //   //   //   }
  //         //   //   // }
  //         //   // }
  //         // }

  //         //! YR_GR, TIME_FROM_MFG, YR_ACCUMULATION_MATERIAL_FROM_ENGINEER SKIP FOR NOW
  //       }

  //       // !!! pls change INUSE to Web APP
  //       data.SCT_ID = UUID_SCT_ID
  //       data.INUSE = 1

  //       // Sct Reason
  //       const UUID_SCT_REASON_HISTORY_ID = uuidv7()
  //       data.SCT_REASON_HISTORY_ID = UUID_SCT_REASON_HISTORY_ID

  //       data.SCT_REASON_SETTING_ID = data.SCT_REASON_SETTING?.SCT_REASON_SETTING_ID
  //       sqlList.push(await SctReasonHistorySQL.insert(data))

  //       // Sct Tag
  //       if (data?.SCT_TAG_SETTING) {
  //         const UUID_SCT_TAG_HISTORY_ID = uuidv7()
  //         data.SCT_TAG_HISTORY_ID = UUID_SCT_TAG_HISTORY_ID

  //         data.SCT_TAG_SETTING_ID = data.SCT_TAG_SETTING?.SCT_TAG_SETTING_ID
  //         sqlList.push(await SctTagHistorySQL.insert(data))
  //       }

  //       if (cntInsert == 0) {
  //         const UUID_SCT_F_PROGRESS_WORKING_ID = uuidv7()
  //         data.SCT_F_STATUS_PROGRESS_ID = 1
  //         data.SCT_F_STATUS_WORKING_ID = 1
  //         sqlList.push(await StandardCostForProductSQL.generateSctFProgressWorkingNo(data))
  //         sqlList.push(await StandardCostForProductSQL.insertSctFProgressWorking(data, UUID_SCT_F_PROGRESS_WORKING_ID))
  //       }

  //       const UUID_SCT_PROGRESS_WORKING_ID = uuidv7()
  //       data.SCT_STATUS_PROGRESS_ID = 2
  //       data.SCT_STATUS_WORKING_ID = 2
  //       sqlList.push(await StandardCostForProductSQL.generateSctProgressWorkingNo(data))
  //       sqlList.push(await StandardCostForProductSQL.insertSctProgressWorking(data, UUID_SCT_PROGRESS_WORKING_ID))
  //     }
  //     cntInsert = cntInsert + 1
  //   }

  //   await MySQLExecute.executeList(sqlList)

  //   return {
  //     Status: true,
  //     ResultOnDb: [],
  //     TotalCountOnDb: 0,
  //     MethodOnDb: 'Create Multiple Standard Cost For Product',
  //     Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
  //   } as ResponseI

  //   // let sql = await SctSQL.getBySctId(dataItem)

  //   // const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
  //   // return resultData
  // },
  searchAllSctData: async (dataItem: any) => {
    let sql = ''
    let sqlList = []
    let sctResultData: any = {}

    //* Sct Detail
    sql = await SctSQL.searchSctDetailBySctId(dataItem)
    const sctDetail = (await MySQLExecute.search(sql)) as RowDataPacket[]
    sctResultData = {
      SCT_DETAIL: sctDetail,
    }

    dataItem = {
      SCT_ID: dataItem.SCT_ID,
      IS_COMPARE: dataItem?.IS_COMPARE ?? false,
      FISCAL_YEAR: sctDetail[0].FISCAL_YEAR,
      PRODUCT_MAIN_ID: sctDetail[0].PRODUCT_MAIN_ID,
      PRODUCT_TYPE_ID: sctDetail[0].PRODUCT_TYPE_ID,
      SCT_REASON_SETTING_ID: sctDetail[0].SCT_REASON_SETTING_ID,
      SCT_TAG_SETTING_ID: sctDetail[0].SCT_TAG_SETTING_ID,
      BOM_ID: sctDetail[0].BOM_ID,
    }

    let resourceOptionValue: any = {}

    //* Get Sct Resource Option
    sql = await SctSQL.searchSctResourceOptionBySctId(dataItem)
    const resourceOptionResult = (await MySQLExecute.search(sql)) as RowDataPacket[]

    for (let resourceOption of resourceOptionResult) {
      switch (resourceOption.SCT_COMPONENT_TYPE_ID) {
        case 1: //* Cost Condition
          resourceOptionValue.costConditionResourceOptionId = resourceOption.SCT_RESOURCE_OPTION_ID
          if (resourceOption.SCT_RESOURCE_OPTION_ID === 1 && !dataItem.IS_COMPARE) {
            sql = await SctSQL.searchSctCostConditionByRealtime(dataItem)
            const costCondition = (await MySQLExecute.search(sql)) as RowDataPacket[]
            sctResultData = {
              ...sctResultData,
              COST_CONDITION: costCondition,
            }
          } else if (resourceOption.SCT_RESOURCE_OPTION_ID === 2 || dataItem.IS_COMPARE) {
            sql = await SctSQL.searchSctCostConditionBySctId(dataItem)
            const costCondition = (await MySQLExecute.search(sql)) as RowDataPacket[]
            sctResultData = {
              ...sctResultData,
              COST_CONDITION: costCondition,
            }
          }
          break
        case 2: //* Material Price
          resourceOptionValue.materialPriceResourceOptionId = resourceOption.SCT_RESOURCE_OPTION_ID
          if (resourceOption.SCT_RESOURCE_OPTION_ID === 1 && !dataItem.IS_COMPARE) {
            sqlList.push(await SctSQL.searchSctMaterialPriceByRealtimeAndRMPackingConsume(dataItem))
            sqlList.push(await SctSQL.searchSctMaterialPriceByRealtimeAndFGSemiFGSubAssy(dataItem))

            let materialPrice = (await MySQLExecute.searchList(sqlList)) as any
            materialPrice = [...materialPrice[0], ...materialPrice[1][1]]

            sql = await SctBomFlowProcessItemUsagePriceSQL.getItemPriceAdjustment(dataItem)
            let priceAdjustment = (await MySQLExecute.search(sql)) as RowDataPacket[]

            for (let i = 0; i < materialPrice.length; i++) {
              for (let j = 0; j < priceAdjustment.length; j++) {
                if (materialPrice[i].BOM_FLOW_PROCESS_ITEM_USAGE_ID === priceAdjustment[j].BOM_FLOW_PROCESS_ITEM_USAGE_ID) {
                  materialPrice[i].ITEM_M_S_PRICE_VALUE = priceAdjustment[j].SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE
                }
              }
            }
            sctResultData = {
              ...sctResultData,
              MATERIAL_PRICE: materialPrice,
            }
          } else if (resourceOption.SCT_RESOURCE_OPTION_ID === 2 || dataItem.IS_COMPARE) {
            sql = await SctSQL.searchSctMaterialPriceBySctId(dataItem)
            const materialPrice = (await MySQLExecute.search(sql)) as RowDataPacket[]
            sctResultData = {
              ...sctResultData,
              MATERIAL_PRICE: materialPrice,
            }
          }
          break
        case 3: //* YR_GR
          resourceOptionValue.yrGRFromEngineerResourceOptionId = resourceOption.SCT_RESOURCE_OPTION_ID
          if (resourceOption.SCT_RESOURCE_OPTION_ID === 1 && !dataItem.IS_COMPARE) {
            sql = await SctSQL.searchSctYRGRByRealtime(dataItem)
            const yrgr = (await MySQLExecute.search(sql)) as RowDataPacket[]
            sctResultData = {
              ...sctResultData,
              YR_GR_FROM_ENGINEER: yrgr,
            }
          } else if (resourceOption.SCT_RESOURCE_OPTION_ID === 2 || dataItem.IS_COMPARE) {
            sql = await SctSQL.searchSctYRGRBySctId(dataItem)
            const yrgr = (await MySQLExecute.search(sql)) as RowDataPacket[]

            sctResultData = {
              ...sctResultData,
              YR_GR_FROM_ENGINEER: yrgr,
            }
          }
          break
        case 4: //* Time From MFG
          resourceOptionValue.timeFromMFGResourceOptionId = resourceOption.SCT_RESOURCE_OPTION_ID
          if (resourceOption.SCT_RESOURCE_OPTION_ID === 1 && !dataItem.IS_COMPARE) {
            sql = await SctSQL.searchSctTimeFromMFGByRealtime(dataItem)
            const timeFromMFG = (await MySQLExecute.search(sql)) as RowDataPacket[]
            sctResultData = {
              ...sctResultData,
              TIME_FROM_MFG: timeFromMFG,
            }
          } else if (resourceOption.SCT_RESOURCE_OPTION_ID === 2 || dataItem.IS_COMPARE) {
            sql = await SctSQL.searchSctTimeFromMFGBySctId(dataItem)
            const timeFromMFG = (await MySQLExecute.search(sql)) as RowDataPacket[]
            sctResultData = {
              ...sctResultData,
              TIME_FROM_MFG: timeFromMFG,
            }
          }
          break
        case 5: //* YR Accumulation Material From Engineer
          resourceOptionValue.yrAccumulationMaterialFromEngineerResourceOptionId = resourceOption.SCT_RESOURCE_OPTION_ID
          if (resourceOption.SCT_RESOURCE_OPTION_ID === 1 && !dataItem.IS_COMPARE) {
            sql = await SctSQL.searchSctYRAccumulationMaterialFromEngineerByRealtime(dataItem)
            const yrAccumulationMaterialFromEngineer = (await MySQLExecute.search(sql)) as RowDataPacket[]
            sctResultData = {
              ...sctResultData,
              YR_ACCUMULATION_MATERIAL_FROM_ENGINEER: yrAccumulationMaterialFromEngineer,
            }
          } else if (resourceOption.SCT_RESOURCE_OPTION_ID === 2 || dataItem.IS_COMPARE) {
            sql = await SctSQL.searchSctYRAccumulationMaterialFromEngineerBySctId(dataItem)
            const yrAccumulationMaterialFromEngineer = (await MySQLExecute.search(sql)) as RowDataPacket[]
            sctResultData = {
              ...sctResultData,
              YR_ACCUMULATION_MATERIAL_FROM_ENGINEER: yrAccumulationMaterialFromEngineer,
            }
          }
          break
      }
    }

    const getSctCompareSql = await SctCompareSQL.getSctCompare(dataItem)
    const sctCompare = (await MySQLExecute.search(getSctCompareSql)) as RowDataPacket[]

    let sctResultSummary = {
      PRODUCT_CATEGORY: {
        PRODUCT_CATEGORY_ID: sctDetail[0].PRODUCT_CATEGORY_ID,
        PRODUCT_CATEGORY_NAME: sctDetail[0].PRODUCT_CATEGORY_NAME,
        PRODUCT_CATEGORY_ALPHABET: sctDetail[0].PRODUCT_CATEGORY_ALPHABET,
      },
      PRODUCT_MAIN: {
        PRODUCT_MAIN_ID: sctDetail[0].PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: sctDetail[0].PRODUCT_MAIN_NAME,
        PRODUCT_MAIN_ALPHABET: sctDetail[0].PRODUCT_MAIN_ALPHABET,
      },
      PRODUCT_SUB: {
        PRODUCT_SUB_ID: sctDetail[0].PRODUCT_SUB_ID,
        PRODUCT_SUB_NAME: sctDetail[0].PRODUCT_SUB_NAME,
        PRODUCT_SUB_ALPHABET: sctDetail[0].PRODUCT_SUB_ALPHABET,
      },
      PRODUCT_TYPE: {
        PRODUCT_TYPE_ID: sctDetail[0].PRODUCT_TYPE_ID,
        PRODUCT_TYPE_CODE: sctDetail[0].PRODUCT_TYPE_CODE,
        PRODUCT_TYPE_NAME: sctDetail[0].PRODUCT_TYPE_NAME,
      },
      SCT_ID: sctDetail[0].SCT_ID,
      SCT_REVISION_CODE: sctDetail[0].SCT_REVISION_CODE,
      SCT_STATUS_PROGRESS_ID: sctDetail[0].SCT_STATUS_PROGRESS_ID,
      START_DATE: sctDetail[0].START_DATE,
      END_DATE: sctDetail[0].END_DATE,
      FISCAL_YEAR: {
        label: sctDetail[0].FISCAL_YEAR,
        value: sctDetail[0].FISCAL_YEAR,
      },
      NOTE: sctDetail[0].NOTE,
      BOM_ID: sctDetail[0].BOM_ID,
      BOM_CODE: sctDetail[0].BOM_CODE,
      BOM_NAME: sctDetail[0].BOM_NAME,
      BOM_CODE_ACTUAL: sctDetail[0].BOM_CODE_ACTUAL,
      BOM_NAME_ACTUAL: sctDetail[0].BOM_NAME_ACTUAL,
      FLOW_CODE: sctDetail[0].FLOW_CODE,
      ITEM_CATEGORY: sctDetail[0].ITEM_CATEGORY_NAME,
      PRODUCT_SPECIFICATION_TYPE: sctDetail[0].PRODUCT_SPECIFICATION_TYPE,
      ADJUST_PRICE: sctDetail[0]?.ADJUST_PRICE ?? '',
      REMARK_FOR_ADJUST_PRICE: sctDetail[0]?.REMARK_FOR_ADJUST_PRICE ?? '',
      NOTE_PRICE: sctDetail[0]?.NOTE_PRICE ?? '',
      SCT_PATTERN_NO: {
        value: sctDetail[0].SCT_PATTERN_ID,
        label: sctDetail[0].SCT_PATTERN_NAME,
      },
      SCT_TAG_SETTING: {
        SCT_TAG_SETTING_ID: sctDetail[0].SCT_TAG_SETTING_ID,
        SCT_TAG_SETTING_NAME: sctDetail[0].SCT_TAG_SETTING_NAME,
      },
      SCT_REASON_SETTING: {
        SCT_REASON_SETTING_ID: sctDetail[0].SCT_REASON_SETTING_ID,
        SCT_REASON_SETTING_NAME: sctDetail[0].SCT_REASON_SETTING_NAME,
      },
      COST_CONDITION_RESOURCE_OPTION_ID: resourceOptionValue?.costConditionResourceOptionId,
      DIRECT_COST_CONDITION: {
        ...sctResultData.COST_CONDITION?.[0]?.[0],
        // DIRECT_COST_CONDITION_ID: '',
        // DIRECT_UNIT_PROCESS_COST: '',
        // INDIRECT_RATE_OF_DIRECT_PROCESS_COST: '',
        // VERSION: '',
      },
      INDIRECT_COST_CONDITION: {
        ...sctResultData.COST_CONDITION?.[1]?.[0],
        // INDIRECT_COST_CONDITION_ID: '',
        // DEPRECIATION: '',
        // FISCAL_YEAR: '',
        // IS_MANUAL_TOTAL_INDIRECT_COST: '',
        // LABOR: '',
        // OTHER_EXPENSE: '',
        // TOTAL_INDIRECT_COST: '',
        // VERSION: '',
      },
      OTHER_COST_CONDITION: {
        ...sctResultData.COST_CONDITION?.[2]?.[0],
        // OTHER_COST_CONDITION_ID: '',
        // CIT: '',
        // FISCAL_YEAR: '',
        // GA: '',
        // IS_MANUAL_CIT: '',
        // IS_MANUAL_VAT: '',
        // MARGIN: '',
        // SELLING_EXPENSE: '',
        // VAT: '',
        // VAT_MANUAL: '',
        // VERSION: '',
      },
      SPECIAL_COST_CONDITION: {
        ...sctResultData.COST_CONDITION?.[3]?.[0],
        // ADJUST_PRICE: '',
        // FISCAL_YEAR: '',
        // SPECIAL_COST_CONDITION_ID: '',
        // VERSION: '',
      },
      TOTAL_COUNT_PROCESS: sctResultData?.MATERIAL_PRICE?.[0]?.TOTAL_COUNT_PROCESS ?? 0,
      SCT_FLOW_PROCESS: sctResultData?.TIME_FROM_MFG?.[0],
      TIME_FROM_MFG_RESOURCE_OPTION_ID: resourceOptionValue?.timeFromMFGResourceOptionId,
      CLEAR_TIME: sctResultData?.TIME_FROM_MFG?.[0],
      CLEAR_TIME_TOTAL: {
        TOTAL_CLEAR_TIME_FOR_SCT: sctResultData?.TIME_FROM_MFG?.[1][0]?.TOTAL_CLEAR_TIME_FOR_SCT,
      },
      TOTAL_ESSENTIAL_TIME: sctResultData?.TIME_FROM_MFG?.[1][0]?.TOTAL_ESSENTIAL_TIME,
      SCT_MATERIAL: sctResultData?.MATERIAL_PRICE ?? [],
      MATERIAL_PRICE_RESOURCE_OPTION_ID: resourceOptionValue?.materialPriceResourceOptionId,
      MATERIAL_PRICE_DATA: sctResultData?.MATERIAL_PRICE ?? [],
      MATERIAL_AMOUNT: sctResultData?.MATERIAL_PRICE ?? [],
      YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID: resourceOptionValue?.yrGRFromEngineerResourceOptionId,
      YR_GR: sctResultData?.YR_GR_FROM_ENGINEER?.[0],
      YR_GR_TOTAL: {
        ...sctResultData?.YR_GR_FROM_ENGINEER?.[1][0],
        // TOTAL_GO_STRAIGHT_RATE_FOR_SCT: '',
        // TOTAL_YIELD_RATE_FOR_SCT: '',
      },
      YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID: resourceOptionValue?.yrAccumulationMaterialFromEngineerResourceOptionId,
      YIELD_MATERIAL_DATA: sctResultData?.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER ?? [],
      SCT_COMPARE: sctCompare ?? [],
      SCT_TOTAL_COST: {
        SELLING_EXPENSE_FOR_SELLING_PRICE: sctDetail[0].SELLING_EXPENSE_FOR_SELLING_PRICE,
        GA_FOR_SELLING_PRICE: sctDetail[0].GA_FOR_SELLING_PRICE,
        MARGIN_FOR_SELLING_PRICE: sctDetail[0].MARGIN_FOR_SELLING_PRICE,
        CIT_FOR_SELLING_PRICE: sctDetail[0].CIT_FOR_SELLING_PRICE,
        SELLING_PRICE_BY_FORMULA: sctDetail[0].SELLING_PRICE_BY_FORMULA,
        SELLING_PRICE: sctDetail[0].SELLING_PRICE,
        TOTAL_ESSENTIAL_TIME: sctDetail[0].TOTAL_ESSENTIAL_TIME,
        TOTAL_PRICE_OF_RAW_MATERIAL: sctDetail[0].TOTAL_PRICE_OF_RAW_MATERIAL,
        TOTAL_PRICE_OF_SUB_ASSY: sctDetail[0].TOTAL_PRICE_OF_SUB_ASSY,
        TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: sctDetail[0].TOTAL_PRICE_OF_SEMI_FINISHED_GOODS,
        TOTAL_PRICE_OF_CONSUMABLE: sctDetail[0].TOTAL_PRICE_OF_CONSUMABLE,
        TOTAL_PRICE_OF_PACKING: sctDetail[0].TOTAL_PRICE_OF_PACKING,
        TOTAL_PRICE_OF_ALL_OF_ITEMS: sctDetail[0].TOTAL_PRICE_OF_ALL_OF_ITEMS,
      },
    }

    return {
      Status: true,
      ResultOnDb: sctResultSummary,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Sct Data',
      Message: '',
    } as ResponseI
  },
  getMaterialPriceData: async (dataItem: any) => {
    let sqlList = []

    if (dataItem.RESOURCE_OPTION_ID === 1 || dataItem.RESOURCE_OPTION_ID === '1' || dataItem.RESOURCE_OPTION_ID === 2 || dataItem.RESOURCE_OPTION_ID === '2') {
      sqlList.push(await StandardCostForProductSQL.getMaterialPriceDataLatestRMPackingConsume(dataItem))
      sqlList.push(await StandardCostForProductSQL.getMaterialPriceDataLatestFGSemiFGSubAssy(dataItem))
    }

    if (dataItem.RESOURCE_OPTION_ID === 3 || dataItem.RESOURCE_OPTION_ID === '3') {
      const stmt = await StandardCostForProductSQL.getSctIdByProductTypeId(dataItem)
      const sqlId: any = await MySQLExecute.search(stmt)
      dataItem.SCT_ID = sqlId[0].SCT_ID
    }

    if (dataItem.RESOURCE_OPTION_ID === 3 || dataItem.RESOURCE_OPTION_ID === '3' || dataItem.RESOURCE_OPTION_ID === 4 || dataItem.RESOURCE_OPTION_ID === '4') {
      sqlList.push(await StandardCostForProductSQL.getMaterialPriceDataBySctId(dataItem))
    }

    const resultData = await MySQLExecute.searchList(sqlList)
    return resultData
  },
  getItemPriceAdjustment: async (dataItem: any) => {
    const sql = await StandardCostForProductSQL.getItemPriceAdjustment(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
}
