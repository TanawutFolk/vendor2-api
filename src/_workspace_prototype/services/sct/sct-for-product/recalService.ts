// import { v4 as uuidv4 } from 'uuid'

// import { SctFlowProcessSequenceSQL } from '@src/_workspace/sql/sct/sct-for-product/SctFlowProcessSequenceSQL'
// import { MySQLExecute } from '@src/businessData/dbExecute'
// import { ResponseI } from '@src/types/ResponseI'
// import { _SctForProductService } from './_sct-for-product/_SctForProductService'
// import { ItemManufacturingStandardPriceSctSQL } from '@src/_workspace/sql/item/ItemManufacturingStandardPriceSctSQL'
// import { ItemManufacturingStandardPriceSQL } from '@src/_workspace/sql/item/ItemManufacturingStandardPriceSQL'
// import { ItemManufacturingOriginalPriceSQL } from '@src/_workspace/sql/item/ItemManufacturingOriginalPriceSQL'
// import { SctTotalCostSQL } from '@src/_workspace/sql/sct/sct-for-product/SctTotalCostSQL'
// import { SctBomFlowProcessItemUsagePriceSQL } from '@src/_workspace/sql/sct/sct-for-product/SctBomFlowProcessItemUsagePriceSQL'
// import { SctProcessingCostByMfgTotalSQL } from '@src/_workspace/sql/sct/sct-for-product/SctProcessingCostByMfgTotalSQL'
// import { SctProcessingCostByEngineerTotalSQL } from '@src/_workspace/sql/sct/sct-for-product/SctProcessingCostByEngineerTotalSQL'
// import { SctFlowProcessProcessingCostByMfgSQL } from '@src/_workspace/sql/sct/sct-for-product/SctFlowProcessProcessingCostByMfgSQL'
// import { SctFlowProcessProcessingCostByEngineerSQL } from '@src/_workspace/sql/sct/sct-for-product/SctFlowProcessProcessingCostByEngineerSQL'
// import { SctTotalCostService } from './SctTotalCostService'
// import { SctDetailForAdjustService } from './SctDetailForAdjustService'
// import { ClearTimeForSctTotalService } from '../../_cycle-time-system/ClearTimeForSctTotalService'
// import { ClearTimeForSctProcessService } from '../../_cycle-time-system/ClearTimeForSctProcessService'
// import { YieldRateGoStraightRateTotalForSctService } from '../../yield-rate-go-straight-rate/YieldRateGoStraightRateTotalForSctService'
// import { YieldRateGoStraightRateProcessForSctService } from '../../yield-rate-go-straight-rate/YieldRateGoStraightRateProcessForSctService'
// import { _CostConditionService } from '../../cost-condition/_CostConditionService'
// import { BomSQL } from '@src/_workspace/sql/bom/BomSQL'
// import { ItemProductDetailSQL } from '@src/_workspace/sql/item/ItemProductDetailSQL'
// import { SctSQL } from '@src/_workspace/sql/sct/sct-for-product/SctSQL'
// import { SctComponentTypeResourceOptionSelect } from '@src/_workspace/sql/sct/sct-for-product/SctComponentTypeResourceOptionSelect'
// import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
// import { isValidNumber } from '@src/utils/CheckValue'
// import { FlowProcessService } from '../../flow-process/FlowProcessService'

// type ResourceOption_Type =
//   | {
//       SCT_ID: string
//       SCT_RESOURCE_OPTION_ID: number
//       SCT_COMPONENT_TYPE_ID: number
//     }
//   | undefined
//   | never[]

// type BomSubAssySemiFg_Type = {
//   BOM_ID: number
//   FLOW_ID: number
//   BOM_CODE: string
//   SCT_ID: string
//   SCT_REVISION_CODE: string
//   FISCAL_YEAR: number
//   SCT_PATTERN_ID: number
//   SCT_REASON_SETTING_ID: number

//   SCT_STATUS_PROGRESS_ID: number

//   SCT_TAG_SETTING_ID: number

//   PRODUCT_TYPE_ID: number
//   PRODUCT_SUB_ID: number
//   PRODUCT_MAIN_ID: number
//   PRODUCT_CATEGORY_ID: number

//   PRODUCT_TYPE_CODE: string
//   PRODUCT_TYPE_NAME: string
//   PRODUCT_SUB_NAME: string
//   PRODUCT_MAIN_NAME: string
//   PRODUCT_MAIN_ALPHABET: string
//   PRODUCT_CATEGORY_NAME: string
//   ITEM_CATEGORY_ID: number

//   PRODUCT_SUB_ALPHABET: string
//   ITEM_CATEGORY_ALPHABET: string

//   ITEM_ID: number

//   CREATE_BY: string
//   UPDATE_BY: string

//   ITEM_CATEGORY_NAME: string

//   ESTIMATE_PERIOD_START_DATE: string
//   ESTIMATE_PERIOD_END_DATE: string

//   PARENT: any[]

//   COST_CONDITION_OPTION: ResourceOption_Type
//   YR_GR_OPTION: ResourceOption_Type
//   TIME_OPTION: ResourceOption_Type
//   MATERIAL_DATA_OPTION: ResourceOption_Type
//   MATERIAL_YIELD_OPTION: ResourceOption_Type
// }

// const getBomDetailByBomId = async (dataItem: BomSubAssySemiFg_Type, listBomSubAssySemiFg: BomSubAssySemiFg_Type[]) => {
//   const sql = await BomSQL.getBomDetailByBomId({ BOM_ID: dataItem.BOM_ID })
//   const resultData = (await MySQLExecute.search(sql)) as {
//     BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
//     BOM_ID: number
//     PROCESS_NAME: string
//     NO: number
//     ITEM_ID: number
//     ITEM_INTERNAL_CODE: string
//     ITEM_INTERNAL_FULL_NAME: string
//     ITEM_CODE_FOR_SUPPORT_MES: string
//     IMAGE_PATH: string
//     USAGE_QUANTITY: number
//     USAGE_UNIT_ID: number
//     USAGE_UNIT_SYMBOL: string
//     ITEM_CATEGORY_ID: number
//     ITEM_CATEGORY_NAME: string
//     PURCHASE_MODULE_ID: number
//     ITEM_PRICE_USAGE_UNIT_ID: number
//     ITEM_PRICE_USAGE_UNIT_NAME: string
//     ITEM_PRICE_USAGE_UNIT_SYMBOL: string
//     FLOW_PROCESS_NO: number
//     ITEM_CATEGORY_ID_FOR_BOM: number
//     ITEM_CATEGORY_NAME_FOR_BOM: number
//   }[]

//   if (resultData.length === 0) {
//     return
//   }

//   // Filter items with ITEM_CATEGORY_ID_FOR_BOM as 2 or 3
//   const filteredBom = resultData.filter((item) => item.ITEM_CATEGORY_ID_FOR_BOM === 2 || item.ITEM_CATEGORY_ID_FOR_BOM === 3)

//   // Recursively call getBomDetailByBomId for each filtered item\
//   for (const item of filteredBom) {
//     const ItemProductDetail_sql = await ItemProductDetailSQL.getByItemId(item)
//     const ItemProductDetail_data = (await MySQLExecute.search(ItemProductDetail_sql)) as {
//       PRODUCT_TYPE_ID: string
//       PRODUCT_SUB_ID: string
//       PRODUCT_MAIN_ID: string
//       PRODUCT_CATEGORY_ID: string
//       PRODUCT_TYPE_NAME: string
//       PRODUCT_TYPE_CODE: string
//       PRODUCT_SUB_NAME: string
//       PRODUCT_MAIN_NAME: string
//       PRODUCT_MAIN_ALPHABET: string
//       PRODUCT_CATEGORY_NAME: string
//       ITEM_ID: string
//       ITEM_CATEGORY_ID: string
//       PRODUCT_SUB_ALPHABET: string
//       ITEM_CATEGORY_ALPHABET: string
//       ITEM_CATEGORY_NAME: string
//     }[]

//     // console.log(ItemProductDetail_data?.[0]?.ITEM_ID)

//     if (ItemProductDetail_data.length === 0) {
//       continue
//     }

//     if (!!ItemProductDetail_data?.[0].ITEM_ID === false) {
//       // throw new Error('ITEM_ID not found : ' + item.ITEM_CODE_FOR_SUPPORT_MES + ItemProductDetail_sql)

//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPrice',
//         // Message: `ITEM_ID not found : ${item.ITEM_CODE_FOR_SUPPORT_MES} ${ItemProductDetail_sql}`,
//         Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER01)',
//       }
//     }

//     const sct_sql = await SctSQL.getByProductTypeIdAndSctTagSettingId({
//       PRODUCT_TYPE_ID: Number(ItemProductDetail_data[0].PRODUCT_TYPE_ID),
//       //SCT_REASON_SETTING_ID: 1, // Budget
//       //SCT_TAG_SETTING_ID: 1, // Budget
//       //SCT_STATUS_PROGRESS_ID: dataItem.SCT_STATUS_PROGRESS_ID, // Prepared
//       FISCAL_YEAR: dataItem.FISCAL_YEAR,
//       SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
//     })

//     const sct_data = (await MySQLExecute.search(sct_sql)) as {
//       SCT_ID: string
//       SCT_REVISION_CODE: string
//       BOM_ID: string
//       FISCAL_YEAR: number
//       SCT_PATTERN_ID: number
//       ESTIMATE_PERIOD_START_DATE: string
//       ESTIMATE_PERIOD_END_DATE: string
//       PRODUCT_TYPE_ID: string
//       FLOW_ID: string
//       BOM_CODE: string
//       SCT_STATUS_PROGRESS_ID: number
//     }[]

//     if (sct_data.length === 0) {
//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPrice',
//         Message: `No SCT data : Tag Budget not found ${dataItem.PRODUCT_TYPE_CODE} => ${ItemProductDetail_data?.[0].PRODUCT_TYPE_CODE}`,
//       }
//     }

//     if (sct_data.length > 1) {
//       // throw new Error('SCT data : Tag Budget มีมากกว่า 1 รายการ ' + dataItem.PRODUCT_TYPE_CODE + '=>' + ItemProductDetail_data?.[0].PRODUCT_TYPE_CODE)

//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPrice',
//         Message: `SCT data : Tag Budget มีมากกว่า 1 รายการ ${dataItem.PRODUCT_TYPE_CODE} => ${ItemProductDetail_data?.[0].PRODUCT_TYPE_CODE}`,
//       }
//     }

//     const simplifiedBom = sct_data.map(
//       (item) =>
//         ({
//           SCT_STATUS_PROGRESS_ID: item.SCT_STATUS_PROGRESS_ID,

//           SCT_ID: item.SCT_ID,
//           FISCAL_YEAR: item.FISCAL_YEAR,
//           SCT_PATTERN_ID: item.SCT_PATTERN_ID,
//           SCT_REVISION_CODE: item.SCT_REVISION_CODE,
//           BOM_ID: item.BOM_ID,
//           FLOW_ID: item.FLOW_ID,
//           PARENT: [dataItem],

//           SCT_REASON_SETTING_ID: 1,
//           SCT_TAG_SETTING_ID: 1,

//           PRODUCT_TYPE_ID: ItemProductDetail_data[0].PRODUCT_TYPE_ID,
//           PRODUCT_SUB_ID: ItemProductDetail_data[0].PRODUCT_SUB_ID,
//           PRODUCT_MAIN_ID: ItemProductDetail_data[0].PRODUCT_MAIN_ID,
//           PRODUCT_CATEGORY_ID: ItemProductDetail_data[0].PRODUCT_CATEGORY_ID,

//           PRODUCT_TYPE_CODE: ItemProductDetail_data[0].PRODUCT_TYPE_CODE,
//           PRODUCT_TYPE_NAME: ItemProductDetail_data[0].PRODUCT_TYPE_NAME,
//           PRODUCT_SUB_NAME: ItemProductDetail_data[0].PRODUCT_SUB_NAME,
//           PRODUCT_MAIN_NAME: ItemProductDetail_data[0].PRODUCT_MAIN_NAME,
//           PRODUCT_MAIN_ALPHABET: ItemProductDetail_data[0].PRODUCT_MAIN_ALPHABET,
//           PRODUCT_CATEGORY_NAME: ItemProductDetail_data[0].PRODUCT_CATEGORY_NAME,

//           ITEM_CATEGORY_ID: ItemProductDetail_data[0].ITEM_CATEGORY_ID,
//           ITEM_CATEGORY_ALPHABET: ItemProductDetail_data[0].ITEM_CATEGORY_ALPHABET,
//           PRODUCT_SUB_ALPHABET: ItemProductDetail_data[0].PRODUCT_SUB_ALPHABET,

//           ITEM_ID: ItemProductDetail_data[0].ITEM_ID,
//           ITEM_CATEGORY_NAME: ItemProductDetail_data[0].ITEM_CATEGORY_NAME,
//           BOM_CODE: item.BOM_CODE,
//           CREATE_BY: dataItem.CREATE_BY,
//           UPDATE_BY: dataItem.UPDATE_BY,

//           ESTIMATE_PERIOD_END_DATE: item.ESTIMATE_PERIOD_END_DATE,
//           ESTIMATE_PERIOD_START_DATE: item.ESTIMATE_PERIOD_START_DATE,
//         }) as BomSubAssySemiFg_Type
//     )

//     // const existingItem = listBomSubAssySemiFg.find((bomSubAssySemiFg) => bomSubAssySemiFg.SCT_ID === item.SCT_ID)
//     // if (existingItem) {
//     //   existingItem.PARENT.push(dataItem)
//     // } else {
//     //   listBomSubAssySemiFg.push(...simplifiedBom)
//     // }

//     listBomSubAssySemiFg.push(...simplifiedBom)

//     const result: any = await getBomDetailByBomId(
//       {
//         BOM_ID: sct_data[0].BOM_ID,
//         FLOW_ID: sct_data[0].FLOW_ID,
//         SCT_ID: sct_data[0].SCT_ID,
//         FISCAL_YEAR: sct_data[0].FISCAL_YEAR,
//         SCT_PATTERN_ID: sct_data[0].SCT_PATTERN_ID,
//         SCT_REVISION_CODE: sct_data[0].SCT_REVISION_CODE,

//         //PRODUCT_TYPE_ID: ItemProductDetail_data[0].PRODUCT_TYPE_ID,
//         PRODUCT_TYPE_ID: ItemProductDetail_data[0].PRODUCT_TYPE_ID,
//         PRODUCT_SUB_ID: ItemProductDetail_data[0].PRODUCT_SUB_ID,
//         PRODUCT_MAIN_ID: ItemProductDetail_data[0].PRODUCT_MAIN_ID,
//         PRODUCT_CATEGORY_ID: ItemProductDetail_data[0].PRODUCT_CATEGORY_ID,

//         SCT_STATUS_PROGRESS_ID: sct_data[0].SCT_STATUS_PROGRESS_ID,

//         ITEM_CATEGORY_ID: ItemProductDetail_data[0].ITEM_CATEGORY_ID,
//         SCT_REASON_SETTING_ID: 1, // Budget
//         SCT_TAG_SETTING_ID: 1, // Budget
//         PRODUCT_TYPE_CODE: ItemProductDetail_data[0].PRODUCT_TYPE_CODE,
//         PRODUCT_TYPE_NAME: ItemProductDetail_data[0].PRODUCT_TYPE_NAME,
//         PRODUCT_SUB_NAME: ItemProductDetail_data[0].PRODUCT_SUB_NAME,
//         PRODUCT_MAIN_NAME: ItemProductDetail_data[0].PRODUCT_MAIN_NAME,
//         PRODUCT_CATEGORY_NAME: ItemProductDetail_data[0].PRODUCT_CATEGORY_NAME,
//         BOM_CODE: sct_data[0].BOM_CODE,
//         CREATE_BY: dataItem.CREATE_BY,
//         UPDATE_BY: dataItem.UPDATE_BY,
//         PARENT: [],
//         PRODUCT_MAIN_ALPHABET: ItemProductDetail_data[0].PRODUCT_MAIN_ALPHABET,
//         ITEM_CATEGORY_ALPHABET: ItemProductDetail_data[0].ITEM_CATEGORY_ALPHABET,
//         PRODUCT_SUB_ALPHABET: ItemProductDetail_data[0].PRODUCT_SUB_ALPHABET,
//         ITEM_ID: ItemProductDetail_data[0].ITEM_ID,
//         ITEM_CATEGORY_NAME: ItemProductDetail_data[0].ITEM_CATEGORY_NAME,

//         ESTIMATE_PERIOD_END_DATE: sct_data[0].ESTIMATE_PERIOD_END_DATE,
//         ESTIMATE_PERIOD_START_DATE: sct_data[0].ESTIMATE_PERIOD_START_DATE,

//         COST_CONDITION_OPTION: [],
//         YR_GR_OPTION: [],
//         TIME_OPTION: [],
//         MATERIAL_DATA_OPTION: [],
//         MATERIAL_YIELD_OPTION: [],
//       },
//       listBomSubAssySemiFg
//     )

//     if (result?.Status === false) {
//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellPriceByFgStructure',
//         // Message: result?.Message || 'Error fetching BOM details',
//         Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER02)',
//       }
//     }
//   }

//   // !!!! Check recursion depth to prevent infinite loop
//   if (listBomSubAssySemiFg.length > 100) {
//     // throw new Error('Recursion depth exceeded > 100')

//     return {
//       Status: false,
//       ResultOnDb: [],
//       TotalCountOnDb: 0,
//       MethodOnDb: 'calculateSellingPrice',
//       Message: 'Recursion depth exceeded > 100',
//     }
//   }
// }

// // Example usage within SctService
// export const reCalService = {
//   calculateSellingPriceBySctIdAndBudget: async (dataItem: any): Promise<ResponseI> => {
//     if (dataItem.length === 0) {
//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPriceTagBudget',
//         Message: 'No Sct Selected',
//       }
//     }

//     for (let i = 0; i < dataItem.length; i++) {
//       const element = dataItem[i]

//       const result = await calculateSellPriceByFgStructure({ SCT_REVISION_CODE: element.SCT_REVISION_CODE, CREATE_BY: element.CREATE_BY, UPDATE_BY: element.UPDATE_BY })

//       if (result?.Status === false) {
//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagBudget',
//           Message: 'การคำนวณราคามีปัญหา (RECALER03)',
//         }
//       }
//     }

//     return {
//       Status: true,
//       ResultOnDb: dataItem,
//       TotalCountOnDb: dataItem.length,
//       MethodOnDb: 'calculateSellingPriceTagBudget',
//       Message: 'Success',
//     }
//   },
//   calculateSellingPriceBySctIdAndPrice: async (dataItem: any): Promise<ResponseI> => {
//     if (dataItem.length === 0) {
//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPriceTagPrice',
//         Message: 'No Sct Selected',
//       }
//     }

//     let SELLING_PRICE = 0

//     let sqlList = []

//     for (let i = 0; i < dataItem.length; i++) {
//       const sct = dataItem[i]

//       const { FISCAL_YEAR, ITEM_CATEGORY_NAME, PRODUCT_MAIN_ID, PRODUCT_MAIN_NAME } = sct

//       const sctResourceOptionSql = await SctComponentTypeResourceOptionSelect.getBySctId(sct)
//       const sctResourceOptionData = (await MySQLExecute.search(sctResourceOptionSql)) as {
//         SCT_COMPONENT_TYPE_ID: number
//         SCT_ID: string
//         SCT_RESOURCE_OPTION_ID: number
//       }[]

//       sct.COST_CONDITION_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 1)
//       sct.YR_GR_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 2)
//       sct.TIME_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 3)
//       sct.MATERIAL_DATA_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 4)
//       sct.MATERIAL_YIELD_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 5)

//       let sctSelectionSql = await StandardCostForProductSQL.getSctSelection(sct)
//       let sctSelection: any = await MySQLExecute.search(sctSelectionSql)

//       sctSelection = sctSelection[0]

//       let costCondition_Data: any
//       let yieldRateGoStraightRateProcessForSct_Data: any
//       let yieldRateGoStraightRateTotalForSct_Data: any
//       let clearTimeForSctProcess_Data: any
//       let clearTimeForSctTotal_Data: any

//       if (sct?.COST_CONDITION_OPTION?.SCT_RESOURCE_OPTION_ID === 2) {
//         let sql = await StandardCostForProductSQL.getCostConditionDataBySctId(sctSelection)

//         costCondition_Data = await MySQLExecute.search(sql)
//       } else {
//         costCondition_Data = await _CostConditionService.getAllByProductMainIdAndFiscalYear_MasterDataLatest({
//           FISCAL_YEAR,
//           ITEM_CATEGORY_NAME,
//           PRODUCT_MAIN_ID,
//           PRODUCT_MAIN_NAME,
//         })
//       }
//       // console.log(sct?.YR_GR_OPTION?.SCT_RESOURCE_OPTION_ID, 'sct?.YR_GR_OPTION?.SCT_RESOURCE_OPTION_ID')
//       // console.log(sct)

//       if (sct?.YR_GR_OPTION?.SCT_RESOURCE_OPTION_ID === 2) {
//         let sql = await StandardCostForProductSQL.getYrGrDataBySctId(sctSelection)

//         const resultData: any = await MySQLExecute.search(sql)

//         yieldRateGoStraightRateProcessForSct_Data = resultData[0]
//         yieldRateGoStraightRateTotalForSct_Data = resultData[1]
//       } else {
//         yieldRateGoStraightRateProcessForSct_Data =
//           (await YieldRateGoStraightRateProcessForSctService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
//             PROCESS_ID: number
//             YIELD_RATE_FOR_SCT: number
//             YIELD_ACCUMULATION_FOR_SCT: number
//             GO_STRAIGHT_RATE_FOR_SCT: number
//             COLLECTION_POINT_FOR_SCT: number
//             FLOW_ID: number
//           }[]
//         // console.log(yieldRateGoStraightRateProcessForSct_Data, 'yieldRateGoStraightRateProcessForSct_Data')

//         yieldRateGoStraightRateTotalForSct_Data =
//           (await YieldRateGoStraightRateTotalForSctService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
//             TOTAL_YIELD_RATE_FOR_SCT: number
//             TOTAL_GO_STRAIGHT_RATE_FOR_SCT: number
//           }[]
//       }

//       if (sct?.TIME_OPTION?.SCT_RESOURCE_OPTION_ID === 2) {
//         // getTimeData from SCT
//         let sql = await StandardCostForProductSQL.getTimeDataBySctId(sctSelection)

//         const resultData: any = await MySQLExecute.search(sql)

//         clearTimeForSctProcess_Data = resultData[0]
//         clearTimeForSctTotal_Data = resultData[1]
//       } else {
//         // getTimeData
//         clearTimeForSctProcess_Data = (await ClearTimeForSctProcessService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
//           PROCESS_ID: number
//           FLOW_ID: number
//           CLEAR_TIME_FOR_SCT: number
//         }[]

//         clearTimeForSctTotal_Data = (await ClearTimeForSctTotalService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
//           TOTAL_CLEAR_TIME_FOR_SCT: number
//         }[]
//       }

//       sqlList.push(await SctFlowProcessSequenceSQL.deleteBySctId(sct))

//       const FlowProcess_Data = (await FlowProcessService.getByFlowId(sct)) as {
//         NO: number
//         FLOW_PROCESS_ID: number
//         PROCESS_ID: number
//         PROCESS_NAME: string
//         PROCESS_CODE: string
//         FLOW_ID: number
//       }[]

//       for (const flowProcess of FlowProcess_Data) {
//         const { FLOW_PROCESS_ID, PROCESS_CODE, PROCESS_ID } = flowProcess

//         const COLLECTION_POINT_FOR_SCT = yieldRateGoStraightRateProcessForSct_Data.find((item: any) => item.PROCESS_ID == PROCESS_ID)?.COLLECTION_POINT_FOR_SCT

//         if (COLLECTION_POINT_FOR_SCT === undefined) {
//           // throw new Error('OLD_SYSTEM_COLLECTION_POINT not found' + sct.PRODUCT_TYPE_CODE)

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             Message: 'การคำนวณราคามีปัญหา ไม่พบข้อมูล YR และ GSR (RECALER04)',
//           }
//         }

//         const sctProcessSequenceCode = `${sct.PRODUCT_TYPE_CODE}-${sct.PRODUCT_MAIN_ALPHABET}-P${PROCESS_CODE.slice(-4)}`

//         sqlList.push(
//           await SctFlowProcessSequenceSQL.insert({
//             SCT_ID: sct.SCT_ID,
//             FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
//             SCT_PROCESS_SEQUENCE_CODE: sctProcessSequenceCode,
//             CREATE_BY: sct.CREATE_BY,
//             UPDATE_BY: sct.UPDATE_BY,
//             INUSE: 1,
//             OLD_SYSTEM_COLLECTION_POINT: COLLECTION_POINT_FOR_SCT,
//             OLD_SYSTEM_PROCESS_SEQUENCE_CODE: sctProcessSequenceCode,
//             SCT_FLOW_PROCESS_SEQUENCE_ID: uuidv4(),
//             IS_FROM_SCT_COPY: 0,
//           })
//         )
//       }

//       sqlList.push(await SctFlowProcessProcessingCostByEngineerSQL.deleteBySctId(sct))

//       for (const flowProcess of FlowProcess_Data) {
//         const { FLOW_PROCESS_ID, PROCESS_ID } = flowProcess

//         const YIELD_RATE = yieldRateGoStraightRateProcessForSct_Data.find((item: any) => item.PROCESS_ID === PROCESS_ID)?.YIELD_RATE_FOR_SCT
//         const YIELD_ACCUMULATION = yieldRateGoStraightRateProcessForSct_Data?.find((item: any) => item?.PROCESS_ID == PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
//         const GO_STRAIGHT_RATE = yieldRateGoStraightRateProcessForSct_Data?.find((item: any) => item?.PROCESS_ID == PROCESS_ID)?.GO_STRAIGHT_RATE_FOR_SCT

//         if (YIELD_RATE === undefined || YIELD_ACCUMULATION === undefined || GO_STRAIGHT_RATE === undefined) {
//           // throw new Error('YIELD_RATE or YIELD_ACCUMULATION or GO_STRAIGHT_RATE not found')\

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             Message: 'YIELD_RATE or YIELD_ACCUMULATION or GO_STRAIGHT_RATE not found',
//           }
//         }

//         const SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID = uuidv4()
//         sqlList.push(
//           await SctFlowProcessProcessingCostByEngineerSQL.insert({
//             SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID,
//             SCT_ID: sct.SCT_ID,
//             FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
//             YIELD_RATE: YIELD_RATE,
//             YIELD_ACCUMULATION: YIELD_ACCUMULATION,
//             GO_STRAIGHT_RATE: GO_STRAIGHT_RATE,
//             NOTE: '',
//             CREATE_BY: sct.CREATE_BY,
//             UPDATE_BY: sct.UPDATE_BY,
//             IS_FROM_SCT_COPY: 0,
//           })
//         )
//       }

//       sqlList.push(await SctFlowProcessProcessingCostByMfgSQL.deleteBySctId(sct))

//       const INDIRECT_RATE_OF_DIRECT_PROCESS_COST = Number(costCondition_Data[0][0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST) / 100

//       let TOTAL_ESSENTIAL_TIME: number = 0

//       for (const flowProcess of FlowProcess_Data) {
//         const { FLOW_PROCESS_ID, PROCESS_ID, FLOW_ID } = flowProcess

//         const YIELD_ACCUMULATION_FOR_SCT = Number(
//           yieldRateGoStraightRateProcessForSct_Data.find((item: any) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID == PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
//         )
//         const GO_STRAIGHT_RATE = Number(
//           yieldRateGoStraightRateProcessForSct_Data?.find((item: any) => item.FLOW_ID == FLOW_ID && item?.PROCESS_ID == PROCESS_ID)?.GO_STRAIGHT_RATE_FOR_SCT
//         )

//         const CLEAR_TIME = Number(clearTimeForSctProcess_Data.find((item: any) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID == PROCESS_ID)?.CLEAR_TIME_FOR_SCT)

//         console.log('CLEAR_TIME : ', CLEAR_TIME)

//         if (isValidNumber(CLEAR_TIME) === false || isValidNumber(YIELD_ACCUMULATION_FOR_SCT) === false || isValidNumber(GO_STRAIGHT_RATE) === false) {
//           // throw new Error('CLEAR_TIME or YIELD_RATE or GO_STRAIGHT_RATE not found')

//           console.log(clearTimeForSctProcess_Data)
//           console.log(FLOW_ID, PROCESS_ID)

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             Message: 'ไม่พบข้อมูล CLEAR_TIME or YIELD_RATE or GO_STRAIGHT_RATE',
//           }
//         }

//         const ESSENTIAL_TIME = (CLEAR_TIME / YIELD_ACCUMULATION_FOR_SCT / GO_STRAIGHT_RATE) * 100 * 100

//         console.log(ESSENTIAL_TIME, CLEAR_TIME, YIELD_ACCUMULATION_FOR_SCT, GO_STRAIGHT_RATE)

//         const PROCESS_STANDARD_TIME =
//           (CLEAR_TIME / YIELD_ACCUMULATION_FOR_SCT / GO_STRAIGHT_RATE) *
//           100 *
//           100 *
//           (1 + (isNaN(INDIRECT_RATE_OF_DIRECT_PROCESS_COST) ? 0 : Number(INDIRECT_RATE_OF_DIRECT_PROCESS_COST)))

//         sqlList.push(
//           await SctFlowProcessProcessingCostByMfgSQL.insert({
//             SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID: uuidv4(),
//             SCT_ID: sct.SCT_ID,
//             FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
//             CLEAR_TIME: CLEAR_TIME,
//             ESSENTIAL_TIME,
//             PROCESS_STANDARD_TIME,
//             NOTE: '',
//             CREATE_BY: sct.CREATE_BY,
//             UPDATE_BY: sct.UPDATE_BY,
//             IS_FROM_SCT_COPY: 0,
//           })
//         )

//         TOTAL_ESSENTIAL_TIME += ESSENTIAL_TIME
//         console.log(TOTAL_ESSENTIAL_TIME, ESSENTIAL_TIME)
//       }

//       sqlList.push(await SctProcessingCostByEngineerTotalSQL.deleteBySctId(sct))

//       sqlList.push(
//         await SctProcessingCostByEngineerTotalSQL.insert({
//           SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID: uuidv4(),
//           SCT_ID: sct.SCT_ID,
//           TOTAL_YIELD_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_YIELD_RATE_FOR_SCT,
//           TOTAL_GO_STRAIGHT_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
//           CREATE_BY: sct.CREATE_BY,
//           UPDATE_BY: sct.UPDATE_BY,
//           INUSE: 1,
//           IS_FROM_SCT_COPY: 0,
//         })
//       )

//       sqlList.push(await SctProcessingCostByMfgTotalSQL.deleteBySctId(sct))

//       const TOTAL_CLEAR_TIME_FOR_SCT = clearTimeForSctTotal_Data?.[0]?.TOTAL_CLEAR_TIME_FOR_SCT

//       if (TOTAL_CLEAR_TIME_FOR_SCT === undefined) {
//         // throw new Error('TOTAL_CLEAR_TIME_FOR_SCT or TOTAL_ESSENTIAL_TIME_FOR_SCT not found')

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           Message: 'TOTAL_CLEAR_TIME_FOR_SCT or TOTAL_ESSENTIAL_TIME_FOR_SCT not found',
//         }
//       }

//       sqlList.push(
//         await SctProcessingCostByMfgTotalSQL.insert({
//           SCT_PROCESSING_COST_BY_MFG_TOTAL_ID: uuidv4(),
//           SCT_ID: sct.SCT_ID,
//           TOTAL_CLEAR_TIME: TOTAL_CLEAR_TIME_FOR_SCT,
//           TOTAL_ESSENTIAL_TIME,
//           CREATE_BY: sct.CREATE_BY,
//           UPDATE_BY: sct.UPDATE_BY,
//           INUSE: 1,
//           IS_FROM_SCT_COPY: 0,
//         })
//       )

//       sqlList.push(await SctBomFlowProcessItemUsagePriceSQL.deleteBySctId(sct))

//       let MaterialPrice_Data: {
//         BOM_ID: string
//         PURCHASE_PRICE: number
//         BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
//         ITEM_M_S_PRICE_VALUE: number
//         PURCHASE_PRICE_CURRENCY_ID: string
//         PURCHASE_PRICE_CURRENCY: string
//         PURCHASE_PRICE_UNIT_ID: string
//         PURCHASE_UNIT: string
//         ITEM_M_S_PRICE_ID: string
//         ITEM_ID: string
//         IMPORT_FEE_RATE: number
//         YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
//         FLOW_PROCESS_ID: number
//         FLOW_ID: number
//         USAGE_QUANTITY: number
//         PROCESS_ID: number
//         ITEM_CATEGORY_ID_FROM_BOM: string
//         PRODUCT_TYPE_ID_FROM_ITEM: string
//         ITEM_CODE_FOR_SUPPORT_MES: string
//       }[]

//       const { BOM_ID, PRODUCT_TYPE_ID, SCT_PATTERN_ID } = sct

//       if (typeof BOM_ID === 'undefined' || typeof FISCAL_YEAR === 'undefined' || typeof PRODUCT_TYPE_ID === 'undefined' || typeof SCT_PATTERN_ID === 'undefined') {
//         // throw new Error('BOM_ID or FISCAL_YEAR or PRODUCT_TYPE_ID or SCT_PATTERN_ID not found')

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           Message: 'BOM_ID or FISCAL_YEAR or PRODUCT_TYPE_ID or SCT_PATTERN_ID not found',
//         }
//       }

//       if (sct?.MATERIAL_DATA_OPTION?.SCT_RESOURCE_OPTION_ID === 2) {
//         let sql = await StandardCostForProductSQL.getMaterialPriceDataBySctId(sctSelection)

//         MaterialPrice_Data = (await MySQLExecute.search(sql)) as {
//           BOM_ID: string
//           PURCHASE_PRICE: number
//           BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
//           ITEM_M_S_PRICE_VALUE: number
//           PURCHASE_PRICE_CURRENCY_ID: string
//           PURCHASE_PRICE_CURRENCY: string
//           PURCHASE_PRICE_UNIT_ID: string
//           PURCHASE_UNIT: string
//           ITEM_M_S_PRICE_ID: string
//           ITEM_ID: string
//           IMPORT_FEE_RATE: number
//           YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
//           FLOW_PROCESS_ID: number
//           FLOW_ID: number
//           USAGE_QUANTITY: number
//           PROCESS_ID: number
//           ITEM_CATEGORY_ID_FROM_BOM: string
//           PRODUCT_TYPE_ID_FROM_ITEM: string
//           ITEM_CODE_FOR_SUPPORT_MES: string
//         }[]
//       } else {
//         MaterialPrice_Data = (await _SctForProductService.getSctBomItemItemPriceByBomIdAndFiscalYear_MasterDataLatest({
//           BOM_ID,
//           FISCAL_YEAR: Number(sct.FISCAL_YEAR),
//           SCT_PATTERN_ID: Number(sct.SCT_PATTERN_ID),
//           PRODUCT_TYPE_ID,
//         })) as {
//           BOM_ID: string
//           PURCHASE_PRICE: number
//           BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
//           ITEM_M_S_PRICE_VALUE: number
//           PURCHASE_PRICE_CURRENCY_ID: string
//           PURCHASE_PRICE_CURRENCY: string
//           PURCHASE_PRICE_UNIT_ID: string
//           PURCHASE_UNIT: string
//           ITEM_M_S_PRICE_ID: string
//           ITEM_ID: string
//           IMPORT_FEE_RATE: number
//           YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
//           FLOW_PROCESS_ID: number
//           FLOW_ID: number
//           USAGE_QUANTITY: number
//           PROCESS_ID: number
//           ITEM_CATEGORY_ID_FROM_BOM: string
//           PRODUCT_TYPE_ID_FROM_ITEM: string
//           ITEM_CODE_FOR_SUPPORT_MES: string
//           AMOUNT: number
//           PRICE: number
//         }[]
//       }

//       const MaterialPriceAdjust_Data = (await _SctForProductService.getSctBomFlowProcessPriceAdjustBySct({
//         SCT_ID: sct.SCT_ID,
//       })) as {
//         BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
//         SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE: number
//         SCT_STATUS_PROGRESS_ID: number
//         MATERIAL_SCT_ID: string
//       }[]

//       //* some SCT_STATUS_PROGRESS_ID === 1 return error
//       const isHasCancelled = MaterialPriceAdjust_Data.some((item) => item.SCT_STATUS_PROGRESS_ID === 1)

//       console.log(MaterialPriceAdjust_Data)

//       if (isHasCancelled) {
//         // throw new Error('SCT_STATUS_PROGRESS_ID === 1')

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           Message: 'Some Standard Cost of SCT Sub has been cancelled',
//         }
//       }

//       //* Adjust Price Value
//       MaterialPrice_Data = MaterialPrice_Data.map((item) => {
//         const adjustPrice = MaterialPriceAdjust_Data.find((adjust) => adjust.BOM_FLOW_PROCESS_ITEM_USAGE_ID === item.BOM_FLOW_PROCESS_ITEM_USAGE_ID)
//         if (adjustPrice) {
//           item.ITEM_M_S_PRICE_VALUE = adjustPrice.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE
//         }
//         return item
//       })

//       const sctDetailForAdjustment_Data = (await SctDetailForAdjustService.getBySctId(sct)) as {
//         SCT_DETAIL_FOR_ADJUST_ID: string
//         SCT_ID: string
//         TOTAL_INDIRECT_COST: number
//         CIT: number
//         VAT: number
//         DESCRIPTION: string
//         CREATE_BY: string
//         CREATE_DATE: Date
//         UPDATE_BY: string
//         UPDATE_DATE: Date
//         INUSE: number
//       }[]

//       const sctTotalCost_Data = (await SctTotalCostService.getBySctId(sct)) as {
//         SCT_ID: string
//         ADJUST_PRICE: number
//         REMARK_FOR_ADJUST_PRICE: string
//         NOTE: string
//         CIT_FOR_SELLING_PRICE: number
//         VAT_FOR_SELLING_PRICE: number
//         ESTIMATE_PERIOD_START_DATE: string
//         ESTIMATE_PERIOD_END_DATE: string
//       }[]

//       let TOTAL_PRICE_OF_ALL_OF_ITEMS: number = 0
//       let TOTAL_PRICE_OF_CONSUMABLE: number = 0
//       let TOTAL_PRICE_OF_PACKING: number = 0
//       let TOTAL_PRICE_OF_RAW_MATERIAL: number = 0
//       let TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: number = 0
//       let TOTAL_PRICE_OF_SUB_ASSY: number = 0

//       for (const materialPrice of MaterialPrice_Data) {
//         const { FLOW_ID, PROCESS_ID } = materialPrice

//         let yieldAccumulation: number
//         let IS_ADJUST_YIELD_ACCUMULATION: number

//         IS_ADJUST_YIELD_ACCUMULATION = 0

//         if (!materialPrice.ITEM_CATEGORY_ID_FROM_BOM) {
//           // throw new Error('ITEM_CATEGORY_ID_FROM_BOM not found')

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             // Message: 'ITEM_CATEGORY_ID_FROM_BOM not found',
//             Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER05)',
//           }
//         }

//         if (!materialPrice.ITEM_CODE_FOR_SUPPORT_MES) {
//           // throw new Error('ITEM_CODE_FOR_SUPPORT_MES not found')

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             Message: 'ITEM_CODE_FOR_SUPPORT_MES not found',
//           }
//         }

//         if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('CONSU')) {
//           // TODO - Start with CONSU
//           yieldAccumulation = 100
//         } else if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('C') && materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '5') {
//           // TODO -  Start with  C & Consumable
//           yieldAccumulation = 100
//         } else if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('R') && materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '5') {
//           // TODO -  Start with  R & Consumable
//           yieldAccumulation = 100
//         } else if (!!materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT === true) {
//           // TODO -  Adjust Yield Accumulation from Engineer
//           IS_ADJUST_YIELD_ACCUMULATION = 1
//           yieldAccumulation = Number(materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT)
//         } else {
//           // TODO - from Process
//           yieldAccumulation = Number(
//             yieldRateGoStraightRateProcessForSct_Data.find((item: any) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
//           )
//         }

//         if (isNaN(yieldAccumulation)) {
//           // throw new Error('Yield accumulation is not a number' + FLOW_ID + '_' + PROCESS_ID + JSON.stringify(yieldRateGoStraightRateProcessForSct_Data))

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             Message: `Yield accumulation is not a number ${FLOW_ID}_${PROCESS_ID} ${JSON.stringify(yieldRateGoStraightRateProcessForSct_Data)}`,
//           }
//         }

//         // 2 Semi-Finished Goods
//         // 3 Sub-Assy
//         let ITEM_M_S_PRICE_ID
//         let AMOUNT = 0
//         let PRICE = 0

//         if (materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '2' || materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '3') {
//           // const sctPrice = listSctPrice.find((bomSubAssySemiFg) => bomSubAssySemiFg.PRODUCT_TYPE_ID === materialPrice.PRODUCT_TYPE_ID_FROM_ITEM)
//           // ITEM_M_S_PRICE_ID = sctPrice?.ITEM_M_S_PRICE_ID

//           // AMOUNT = (Number(materialPrice.USAGE_QUANTITY) * Number(sctPrice?.SELLING_PRICE)) / (yieldAccumulation / 100)
//           // PRICE = Number(sctPrice?.SELLING_PRICE)

//           // if (!ITEM_M_S_PRICE_ID) {
//           //   throw new Error('ITEM_M_S_PRICE_ID not found' + JSON.stringify(listSctPrice) + materialPrice.PRODUCT_TYPE_ID_FROM_ITEM)
//           // }

//           ITEM_M_S_PRICE_ID = materialPrice?.ITEM_M_S_PRICE_ID

//           AMOUNT = (Number(materialPrice.USAGE_QUANTITY) * Number(materialPrice?.ITEM_M_S_PRICE_VALUE)) / (yieldAccumulation / 100)
//           PRICE = Number(materialPrice?.ITEM_M_S_PRICE_VALUE)

//           if (!ITEM_M_S_PRICE_ID) {
//             // throw new Error('ITEM_M_S_PRICE_ID not found' + JSON.stringify(materialPrice) + materialPrice.PRODUCT_TYPE_ID_FROM_ITEM)

//             return {
//               Status: false,
//               ResultOnDb: [],
//               TotalCountOnDb: 0,
//               MethodOnDb: 'calculateSellingPriceTagPrice',
//               // Message: `ITEM_M_S_PRICE_ID not found ${JSON.stringify(materialPrice)} ${materialPrice.PRODUCT_TYPE_ID_FROM_ITEM}`,
//               Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER06)',
//             }
//           }
//         } else {
//           if (!materialPrice?.ITEM_M_S_PRICE_ID) {
//             // throw new Error('ITEM_M_S_PRICE_ID not found ' + materialPrice.ITEM_CODE_FOR_SUPPORT_MES)

//             return {
//               Status: false,
//               ResultOnDb: [],
//               TotalCountOnDb: 0,
//               MethodOnDb: 'calculateSellingPriceTagPrice',
//               // Message: `ITEM_M_S_PRICE_ID not found ${materialPrice.ITEM_CODE_FOR_SUPPORT_MES}`,
//               Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER07)',
//             }
//           }

//           ITEM_M_S_PRICE_ID = materialPrice.ITEM_M_S_PRICE_ID

//           if (isNaN(Number(materialPrice.USAGE_QUANTITY))) {
//             // throw new Error('USAGE_QUANTITY is not a number' + JSON.stringify(materialPrice))

//             return {
//               Status: false,
//               ResultOnDb: [],
//               TotalCountOnDb: 0,
//               MethodOnDb: 'calculateSellingPriceTagPrice',
//               Message: `USAGE_QUANTITY is not a number ${JSON.stringify(materialPrice)}`,
//             }
//           }

//           AMOUNT = (Number(materialPrice.USAGE_QUANTITY) * Number(materialPrice.ITEM_M_S_PRICE_VALUE)) / (yieldAccumulation / 100)
//           PRICE = Number(materialPrice.ITEM_M_S_PRICE_VALUE)
//         }

//         sqlList.push(
//           await SctBomFlowProcessItemUsagePriceSQL.insert({
//             SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID: uuidv4(),
//             SCT_ID: sct.SCT_ID,
//             ITEM_M_S_PRICE_ID,
//             CREATE_BY: sct.CREATE_BY,
//             UPDATE_BY: sct.UPDATE_BY,
//             INUSE: 1,
//             AMOUNT,
//             BOM_FLOW_PROCESS_ITEM_USAGE_ID: materialPrice.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
//             IS_ADJUST_YIELD_ACCUMULATION,
//             PRICE,
//             YIELD_ACCUMULATION: yieldAccumulation,
//             YIELD_ACCUMULATION_DEFAULT: Number(
//               yieldRateGoStraightRateProcessForSct_Data.find((item: any) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
//             ),
//             ADJUST_YIELD_ACCUMULATION_VERSION_NO: 1,
//             IS_FROM_SCT_COPY: 0,
//           })
//         )

//         // Sum total Item Price

//         // 1	Finished Goods
//         // 2	Semi-Finished Goods
//         // 3	Sub-Assy
//         // 4	Raw Material
//         // 5	Consumable
//         // 6	Packing
//         // 7	Spare Parts

//         TOTAL_PRICE_OF_ALL_OF_ITEMS += AMOUNT
//         TOTAL_PRICE_OF_CONSUMABLE += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '5' ? AMOUNT : 0
//         TOTAL_PRICE_OF_PACKING += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '6' ? AMOUNT : 0
//         TOTAL_PRICE_OF_RAW_MATERIAL += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '4' ? AMOUNT : 0
//         TOTAL_PRICE_OF_SEMI_FINISHED_GOODS += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '2' ? AMOUNT : 0
//         TOTAL_PRICE_OF_SUB_ASSY += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '3' ? AMOUNT : 0
//       }

//       sqlList.push(await SctTotalCostSQL.deleteBySctId(sct))

//       const IMPORTED_FEE = costCondition_Data[4][0].IMPORT_FEE_RATE

//       const SCT_TOTAL_COST_ID = uuidv4()
//       const SCT_ID = sct.SCT_ID

//       // Direct Cost
//       const TOTAL_YIELD_RATE = yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_YIELD_RATE_FOR_SCT || 0
//       const TOTAL_CLEAR_TIME = clearTimeForSctTotal_Data?.[0].TOTAL_CLEAR_TIME_FOR_SCT

//       const TOTAL_GO_STRAIGHT_RATE = yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_GO_STRAIGHT_RATE_FOR_SCT || 0

//       // Indirect Cost
//       const DIRECT_UNIT_PROCESS_COST: number = Number(costCondition_Data[0][0].DIRECT_UNIT_PROCESS_COST)

//       const INDIRECT_COST_SALE_AVE = sctDetailForAdjustment_Data?.[0]?.TOTAL_INDIRECT_COST ?? costCondition_Data?.[1]?.[0]?.TOTAL_INDIRECT_COST // can adjust

//       const SELLING_EXPENSE = costCondition_Data?.[2][0].SELLING_EXPENSE / 100
//       const GA = costCondition_Data?.[2][0].GA / 100
//       const MARGIN = costCondition_Data?.[2][0].MARGIN / 100

//       const TOTAL_PROCESSING_TIME: number = TOTAL_ESSENTIAL_TIME / 60 // Please check
//       const TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: number =
//         TOTAL_PROCESSING_TIME * (1 + (isNaN(Number(INDIRECT_RATE_OF_DIRECT_PROCESS_COST)) ? 0 : INDIRECT_RATE_OF_DIRECT_PROCESS_COST))

//       console.log(`TOTAL_ESSENTIAL_TIME: ${TOTAL_ESSENTIAL_TIME}`)
//       console.log(`TOTAL_PROCESSING_TIME: ${TOTAL_PROCESSING_TIME}`)
//       console.log(`INDIRECT_RATE_OF_DIRECT_PROCESS_COST: ${INDIRECT_RATE_OF_DIRECT_PROCESS_COST}`)

//       const DIRECT_PROCESS_COST: number = TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE * (isNaN(DIRECT_UNIT_PROCESS_COST) ? 1 : DIRECT_UNIT_PROCESS_COST)

//       console.log(`TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: ${TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE}`)
//       console.log(`DIRECT_UNIT_PROCESS_COST: ${DIRECT_UNIT_PROCESS_COST}`)

//       const TOTAL_DIRECT_COST: number = TOTAL_PRICE_OF_ALL_OF_ITEMS + DIRECT_PROCESS_COST

//       const IMPORTED_COST_DEFAULT = 0 // skip
//       const IS_ADJUST_IMPORTED_COST = 0 // skip
//       const IMPORTED_COST = 0 // skip

//       const RM_INCLUDE_IMPORTED_COST = Number(TOTAL_PRICE_OF_RAW_MATERIAL) + Number(TOTAL_PRICE_OF_SUB_ASSY) + Number(TOTAL_PRICE_OF_SEMI_FINISHED_GOODS) + Number(IMPORTED_COST)

//       const CONSUMABLE_PACKING = Number(TOTAL_PRICE_OF_CONSUMABLE) + Number(TOTAL_PRICE_OF_PACKING)

//       const MATERIALS_COST = Number(RM_INCLUDE_IMPORTED_COST) + CONSUMABLE_PACKING

//       console.log(`RM_INCLUDE_IMPORTED_COST: ${RM_INCLUDE_IMPORTED_COST}`)
//       console.log(`CONSUMABLE_PACKING: ${CONSUMABLE_PACKING}`)
//       console.log(`TOTAL_PRICE_OF_RAW_MATERIAL: ${TOTAL_PRICE_OF_RAW_MATERIAL}`)
//       console.log(`MATERIALS_COST: ${MATERIALS_COST}`)
//       console.log(`DIRECT_PROCESS_COST: ${DIRECT_PROCESS_COST}`)

//       const TOTAL = Number(MATERIALS_COST) + Number(DIRECT_PROCESS_COST)
//       const GA_FOR_SELLING_PRICE = (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE)) * (Number(GA) || 0)
//       const SELLING_EXPENSE_FOR_SELLING_PRICE = (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE)) * (Number(SELLING_EXPENSE) || 0)

//       // Selling Price
//       const MARGIN_FOR_SELLING_PRICE =
//         (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE) + (Number(SELLING_EXPENSE_FOR_SELLING_PRICE) || 0) + (Number(GA_FOR_SELLING_PRICE) || 0)) * (Number(MARGIN) || 0)

//       const VAT = costCondition_Data?.[2][0].VAT
//       const VAT_FOR_SELLING_PRICE = sctDetailForAdjustment_Data?.[0]?.VAT ?? 0

//       const CIT: number = sctDetailForAdjustment_Data?.[0]?.CIT ?? 0 // can adjust
//       //const CIT: number = Number(costCondition_Data?.[2][0].CIT) / 100
//       const CIT_FOR_SELLING_PRICE: number = Number(CIT / 100) * MARGIN_FOR_SELLING_PRICE

//       // console.log(CIT, CIT_FOR_SELLING_PRICE)

//       const ADJUST_PRICE = sctTotalCost_Data?.[0]?.ADJUST_PRICE ?? 0

//       const ESTIMATE_PERIOD_START_DATE = sct.ESTIMATE_PERIOD_START_DATE || ''
//       const ESTIMATE_PERIOD_END_DATE = sct.ESTIMATE_PERIOD_END_DATE || ''

//       const NOTE = sctTotalCost_Data?.[0]?.NOTE || ''
//       const REMARK_FOR_ADJUST_PRICE = sctTotalCost_Data?.[0]?.REMARK_FOR_ADJUST_PRICE || ''

//       const SELLING_PRICE_BY_FORMULA =
//         Number(TOTAL) +
//         (Number(INDIRECT_COST_SALE_AVE) || 0) +
//         (Number(SELLING_EXPENSE_FOR_SELLING_PRICE) || 0) +
//         (Number(GA_FOR_SELLING_PRICE) || 0) +
//         (Number(MARGIN_FOR_SELLING_PRICE) || 0) +
//         (Number(CIT_FOR_SELLING_PRICE) || 0) +
//         (Number(VAT_FOR_SELLING_PRICE) || 0)

//       SELLING_PRICE = Math.round(SELLING_PRICE_BY_FORMULA + Number(ADJUST_PRICE))

//       // console.log('TOTAL : ', TOTAL)
//       // console.log('INDIRECT_COST_SALE_AVE : ', INDIRECT_COST_SALE_AVE)
//       // console.log('SELLING_EXPENSE_FOR_SELLING_PRICE : ', SELLING_EXPENSE_FOR_SELLING_PRICE)
//       // console.log('GA_FOR_SELLING_PRICE : ', GA_FOR_SELLING_PRICE)
//       // console.log('MARGIN_FOR_SELLING_PRICE : ', MARGIN_FOR_SELLING_PRICE)
//       // console.log('CIT_FOR_SELLING_PRICE : ', CIT_FOR_SELLING_PRICE)
//       // console.log('VAT_FOR_SELLING_PRICE : ', VAT_FOR_SELLING_PRICE)
//       // console.log('ADJUST_PRICE : ', ADJUST_PRICE)
//       // console.log('SELLING_PRICE_BY_FORMULA : ', SELLING_PRICE_BY_FORMULA)
//       // console.log('SELLING_PRICE : ', SELLING_PRICE)

//       if (!SELLING_PRICE) {
//         // throw new Error('SELLING_PRICE not found ' + sctTotalCost_Data?.[0])

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           Message: `SELLING_PRICE not found ${sctTotalCost_Data?.[0]}`,
//         }
//       }
//       const TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST = TOTAL_PRICE_OF_ALL_OF_ITEMS + IMPORTED_COST

//       const RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS = Number(TOTAL_PRICE_OF_RAW_MATERIAL) + Number(TOTAL_PRICE_OF_SUB_ASSY) + Number(TOTAL_PRICE_OF_SEMI_FINISHED_GOODS)

//       const ASSEMBLY_GROUP_FOR_SUPPORT_MES = `${sct.PRODUCT_MAIN_ALPHABET}${sct.PRODUCT_SUB_ALPHABET}${sct.ITEM_CATEGORY_ALPHABET}1`

//       sqlList.push(
//         await SctTotalCostSQL.insert({
//           SCT_TOTAL_COST_ID,
//           SCT_ID,
//           TOTAL_YIELD_RATE,
//           TOTAL_CLEAR_TIME,
//           TOTAL_ESSENTIAL_TIME,
//           TOTAL_GO_STRAIGHT_RATE,
//           DIRECT_UNIT_PROCESS_COST,
//           INDIRECT_RATE_OF_DIRECT_PROCESS_COST: INDIRECT_RATE_OF_DIRECT_PROCESS_COST * 100,
//           INDIRECT_COST_SALE_AVE,
//           IMPORTED_FEE,
//           SELLING_EXPENSE: SELLING_EXPENSE * 100,
//           GA: GA * 100,
//           MARGIN: MARGIN * 100,
//           VAT,
//           VAT_FOR_SELLING_PRICE,
//           CIT,
//           CIT_FOR_SELLING_PRICE,
//           TOTAL_PROCESSING_TIME,
//           TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE,
//           DIRECT_PROCESS_COST,
//           MARGIN_FOR_SELLING_PRICE,
//           TOTAL_DIRECT_COST,
//           CREATE_BY: sct.CREATE_BY,
//           UPDATE_BY: sct.UPDATE_BY,
//           INUSE: 1,
//           ADJUST_PRICE,
//           ESTIMATE_PERIOD_START_DATE,
//           ESTIMATE_PERIOD_END_DATE,
//           //NOTE,
//           REMARK_FOR_ADJUST_PRICE,
//           SELLING_PRICE,
//           SELLING_PRICE_BY_FORMULA,
//           TOTAL,
//           TOTAL_PRICE_OF_ALL_OF_ITEMS,
//           TOTAL_PRICE_OF_CONSUMABLE,
//           TOTAL_PRICE_OF_PACKING,
//           TOTAL_PRICE_OF_RAW_MATERIAL,
//           TOTAL_PRICE_OF_SEMI_FINISHED_GOODS,
//           TOTAL_PRICE_OF_SUB_ASSY,
//           SELLING_EXPENSE_FOR_SELLING_PRICE,
//           CONSUMABLE_PACKING,
//           GA_FOR_SELLING_PRICE,
//           IMPORTED_COST,
//           IMPORTED_COST_DEFAULT,
//           IS_ADJUST_IMPORTED_COST,
//           MATERIALS_COST,
//           RM_INCLUDE_IMPORTED_COST,
//           TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST,
//           RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS,
//           ASSEMBLY_GROUP_FOR_SUPPORT_MES,
//           IS_FROM_SCT_COPY: 0,
//         })
//       )

//       const ITEM_M_O_PRICE_ID = uuidv4()

//       if (!sct?.ITEM_ID) {
//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           // Message: 'ITEM_ID not found for Product Type Code: ' + sct?.PRODUCT_TYPE_CODE,
//           Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER08)',
//         }
//       }

//       sqlList.push(
//         await ItemManufacturingOriginalPriceSQL.create({
//           CREATE_BY: sct.CREATE_BY,
//           ITEM_ID: sct.ITEM_ID,
//           ITEM_M_O_PRICE_ID: ITEM_M_O_PRICE_ID,
//           PURCHASE_PRICE: SELLING_PRICE,
//           PURCHASE_PRICE_CURRENCY_ID: '7', // THB
//           PURCHASE_PRICE_UNIT_ID: '1', // Piece
//           FISCAL_YEAR: sct.FISCAL_YEAR,
//           IS_CURRENT: 1,
//           ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID: 3,
//         })
//       )

//       const ITEM_M_S_PRICE_ID = uuidv4()

//       sqlList.push(
//         await ItemManufacturingStandardPriceSQL.create({
//           CREATE_BY: sct.CREATE_BY,
//           ITEM_ID: sct.ITEM_ID,
//           ITEM_M_S_PRICE_ID,
//           EXCHANGE_RATE_ID: '7', // THB,
//           FISCAL_YEAR: sct.FISCAL_YEAR,
//           IMPORT_FEE_ID: '',
//           ITEM_M_O_PRICE_ID: ITEM_M_O_PRICE_ID,
//           ITEM_M_S_PRICE_VALUE: SELLING_PRICE,
//           PURCHASE_UNIT_RATIO: 1,
//           PURCHASE_UNIT_ID: '1', // Piece
//           USAGE_UNIT_RATIO: 1,
//           USAGE_UNIT_ID: '1', // Piece
//           IS_CURRENT: 1,
//           SCT_PATTERN_ID: sct.SCT_PATTERN_ID,
//           ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: 3,
//         })
//       )

//       sqlList.push(
//         await ItemManufacturingStandardPriceSctSQL.create({
//           ITEM_M_S_PRICE_SCT_ID: uuidv4(),
//           ITEM_M_S_PRICE_ID: ITEM_M_S_PRICE_ID,
//           SCT_ID: sct.SCT_ID,
//           CREATE_BY: sct.CREATE_BY,
//         })
//       )

//       sqlList.push(
//         await StandardCostForProductSQL.deleteIsRefreshDataMaster({
//           SCT_ID: sct.SCT_ID,
//           UPDATE_BY: sct.UPDATE_BY,
//         })
//       )
//     }

//     await MySQLExecute.executeList(sqlList)

//     return {
//       Status: true,
//       ResultOnDb: dataItem,
//       TotalCountOnDb: dataItem.length,
//       MethodOnDb: 'calculateSellingPriceTagPrice',
//       Message: 'Success',
//     }
//   },
//   getBySctIdReal: async (dataItem: any) => {
//     let sql = await SctSQL.getBySctIdReal(dataItem)

//     let resultData = await MySQLExecute.search(sql)
//     return resultData
//   },
// }

// export async function calculateSellPriceByFgStructure(dataItem: {
//   SCT_REVISION_CODE: string
//   CREATE_BY: string
//   UPDATE_BY: string
//   //SCT_STATUS_PROGRESS_ID: number
// }): Promise<ResponseI> {
//   const listBomSubAssySemiFg: BomSubAssySemiFg_Type[] = []

//   const sqlSct = await SctSQL.getBySctId(dataItem)

//   const resultDataSct = (await MySQLExecute.search(sqlSct)) as {
//     SCT_ID: string
//     SCT_REVISION_CODE: string
//     CREATE_BY: string
//     CREATE_DATE: string
//     UPDATE_BY: string
//     UPDATE_DATE: string
//     INUSE: number
//     SCT_STATUS_PROGRESS_ID: number
//     SCT_STATUS_PROGRESS_NO: number
//     SCT_STATUS_PROGRESS_NAME: string
//     PRODUCT_TYPE_ID: string
//     PRODUCT_SUB_ID: string
//     PRODUCT_MAIN_ID: string
//     PRODUCT_CATEGORY_ID: string
//     PRODUCT_TYPE_CODE: string
//     PRODUCT_TYPE_NAME: string
//     PRODUCT_SUB_NAME: string
//     PRODUCT_MAIN_NAME: string
//     PRODUCT_MAIN_ALPHABET: string
//     PRODUCT_CATEGORY_NAME: string
//     FISCAL_YEAR: number
//     PRODUCT_SPECIFICATION_TYPE_NAME: string
//     BOM_ID: string
//     BOM_CODE: string
//     BOM_NAME: string
//     FLOW_ID: string
//     FLOW_CODE: string
//     FLOW_NAME: string
//     SCT_PATTERN_ID: number
//     SCT_PATTERN_NAME: string
//     ESTIMATE_PERIOD_START_DATE: string
//     ESTIMATE_PERIOD_END_DATE: string
//     ITEM_CATEGORY_ID: string
//     ITEM_CATEGORY_NAME: string
//     SCT_REASON_SETTING_ID: string
//     SCT_REASON_SETTING_NAME: string
//     SCT_TAG_SETTING_ID: string
//     SCT_TAG_SETTING_NAME: string
//     ITEM_ID: string
//     ITEM_CATEGORY_ALPHABET: string
//     PRODUCT_SUB_ALPHABET: string
//   }[]

//   if (resultDataSct.length === 0) {
//     return {
//       Status: false,
//       ResultOnDb: [],
//       TotalCountOnDb: 0,
//       MethodOnDb: 'calculateSellPriceByFgStructure : getBySctId',
//       Message: 'No SCT data found',
//     }
//   }

//   if (!resultDataSct[0].ITEM_CATEGORY_ID) {
//     return {
//       Status: false,
//       ResultOnDb: [],
//       TotalCountOnDb: 0,
//       MethodOnDb: 'calculateSellPriceByFgStructure : getBySctId',
//       // Message: 'ITEM_CATEGORY_ID not found',
//       Message: 'การคำนวณราคามีปัญหา (RECALER09)',
//     }
//   }

//   // SCT tag => Budget only
//   if (resultDataSct[0].SCT_TAG_SETTING_ID == '1') {
//     const result: any = await getBomDetailByBomId(
//       {
//         BOM_ID: resultDataSct[0].BOM_ID,
//         FLOW_ID: resultDataSct[0].FLOW_ID,
//         BOM_CODE: resultDataSct[0].BOM_CODE,
//         SCT_ID: resultDataSct[0].SCT_ID,
//         FISCAL_YEAR: resultDataSct[0].FISCAL_YEAR,
//         SCT_PATTERN_ID: resultDataSct[0].SCT_PATTERN_ID,
//         SCT_REVISION_CODE: resultDataSct[0].SCT_REVISION_CODE,
//         SCT_REASON_SETTING_ID: 1,
//         SCT_TAG_SETTING_ID: 1,
//         ITEM_ID: resultDataSct[0].ITEM_ID,

//         SCT_STATUS_PROGRESS_ID: resultDataSct[0].SCT_STATUS_PROGRESS_ID,

//         PRODUCT_TYPE_ID: resultDataSct[0].PRODUCT_TYPE_ID,
//         PRODUCT_SUB_ID: resultDataSct[0].PRODUCT_SUB_ID,
//         PRODUCT_MAIN_ID: resultDataSct[0].PRODUCT_MAIN_ID,
//         PRODUCT_CATEGORY_ID: resultDataSct[0].PRODUCT_CATEGORY_ID,

//         PRODUCT_TYPE_CODE: resultDataSct[0].PRODUCT_TYPE_CODE,
//         PRODUCT_TYPE_NAME: resultDataSct[0].PRODUCT_TYPE_NAME,
//         PRODUCT_SUB_NAME: resultDataSct[0].PRODUCT_SUB_NAME,
//         PRODUCT_MAIN_NAME: resultDataSct[0].PRODUCT_MAIN_NAME,
//         PRODUCT_MAIN_ALPHABET: resultDataSct[0].PRODUCT_MAIN_ALPHABET,

//         ITEM_CATEGORY_ALPHABET: resultDataSct[0].ITEM_CATEGORY_ALPHABET,
//         PRODUCT_SUB_ALPHABET: resultDataSct[0].PRODUCT_SUB_ALPHABET,

//         PRODUCT_CATEGORY_NAME: resultDataSct[0].PRODUCT_CATEGORY_NAME,
//         CREATE_BY: dataItem.CREATE_BY,
//         PARENT: [],
//         UPDATE_BY: dataItem.UPDATE_BY,
//         ITEM_CATEGORY_ID: resultDataSct[0].ITEM_CATEGORY_ID,
//         ITEM_CATEGORY_NAME: resultDataSct[0].ITEM_CATEGORY_NAME,

//         ESTIMATE_PERIOD_END_DATE: resultDataSct[0].ESTIMATE_PERIOD_END_DATE,
//         ESTIMATE_PERIOD_START_DATE: resultDataSct[0].ESTIMATE_PERIOD_START_DATE,

//         COST_CONDITION_OPTION: [],
//         YR_GR_OPTION: [],
//         TIME_OPTION: [],
//         MATERIAL_DATA_OPTION: [],
//         MATERIAL_YIELD_OPTION: [],
//       },
//       listBomSubAssySemiFg
//     )

//     if (result?.Status === false) {
//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellPriceByFgStructure',
//         // Message: result?.Message || 'Error fetching BOM details',
//         Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER10)',
//       }
//     }

//     listBomSubAssySemiFg.unshift({
//       BOM_ID: resultDataSct[0].BOM_ID,
//       FLOW_ID: resultDataSct[0].FLOW_ID,
//       BOM_CODE: resultDataSct[0].BOM_CODE,
//       SCT_ID: resultDataSct[0].SCT_ID,
//       SCT_REVISION_CODE: resultDataSct[0].SCT_REVISION_CODE,
//       FISCAL_YEAR: resultDataSct[0].FISCAL_YEAR,
//       SCT_PATTERN_ID: resultDataSct[0].SCT_PATTERN_ID,
//       SCT_REASON_SETTING_ID: 1,
//       SCT_TAG_SETTING_ID: 1,

//       SCT_STATUS_PROGRESS_ID: resultDataSct[0].SCT_STATUS_PROGRESS_ID,

//       PRODUCT_TYPE_ID: resultDataSct[0].PRODUCT_TYPE_ID,
//       PRODUCT_SUB_ID: resultDataSct[0].PRODUCT_SUB_ID,
//       PRODUCT_MAIN_ID: resultDataSct[0].PRODUCT_MAIN_ID,
//       PRODUCT_CATEGORY_ID: resultDataSct[0].PRODUCT_CATEGORY_ID,

//       ITEM_CATEGORY_ALPHABET: resultDataSct[0].ITEM_CATEGORY_ALPHABET,
//       PRODUCT_SUB_ALPHABET: resultDataSct[0].PRODUCT_SUB_ALPHABET,

//       PRODUCT_TYPE_CODE: resultDataSct[0].PRODUCT_TYPE_CODE,
//       PRODUCT_TYPE_NAME: resultDataSct[0].PRODUCT_TYPE_NAME,
//       PRODUCT_SUB_NAME: resultDataSct[0].PRODUCT_SUB_NAME,
//       PRODUCT_MAIN_NAME: resultDataSct[0].PRODUCT_MAIN_NAME,
//       PRODUCT_MAIN_ALPHABET: resultDataSct[0].PRODUCT_MAIN_ALPHABET,
//       PRODUCT_CATEGORY_NAME: resultDataSct[0].PRODUCT_CATEGORY_NAME,
//       ITEM_ID: resultDataSct[0].ITEM_ID,

//       ITEM_CATEGORY_ID: resultDataSct[0].ITEM_CATEGORY_ID,
//       ITEM_CATEGORY_NAME: resultDataSct[0].ITEM_CATEGORY_NAME,
//       CREATE_BY: dataItem.CREATE_BY,
//       UPDATE_BY: dataItem.UPDATE_BY,

//       ESTIMATE_PERIOD_END_DATE: resultDataSct[0].ESTIMATE_PERIOD_END_DATE,
//       ESTIMATE_PERIOD_START_DATE: resultDataSct[0].ESTIMATE_PERIOD_START_DATE,

//       PARENT: [],

//       COST_CONDITION_OPTION: [],
//       YR_GR_OPTION: [],
//       TIME_OPTION: [],
//       MATERIAL_DATA_OPTION: [],
//       MATERIAL_YIELD_OPTION: [],
//     })

//     const listSctLevel = calculateLevels(listBomSubAssySemiFg)
//     const listSql: string[] = []
//     const listSctPrice: { SCT_ID: string; PRODUCT_TYPE_ID: string; SELLING_PRICE: number; ITEM_M_S_PRICE_ID: string }[] = []

//     await processByLevel(listSctLevel, listBomSubAssySemiFg, listSql, listSctPrice)

//     // console.log(listSctLevel)

//     await MySQLExecute.executeList(listSql)

//     return {
//       Status: true,
//       ResultOnDb: listSctPrice,
//       TotalCountOnDb: listBomSubAssySemiFg.length,
//       MethodOnDb: `${dataItem.SCT_REVISION_CODE} ☕`,
//       Message: 'Success',
//     }
//   } else {
//     // throw new Error('Tag Budget only')

//     return {
//       Status: false,
//       ResultOnDb: [],
//       TotalCountOnDb: 0,
//       MethodOnDb: 'calculateSellPriceByFgStructure',
//       Message: 'Tag Budget only',
//     }
//   }
// }

// function calculateLevels(nodes: any[]): Record<string, number> {
//   const levels: Record<string, number> = {}
//   const unresolved = new Set(nodes.map((node) => node.SCT_ID))

//   while (unresolved.size > 0) {
//     for (const node of nodes) {
//       //if (!unresolved.has(node.SCT_ID)) continue

//       const parentIds = node.PARENT.map((p: any) => p.SCT_ID)
//       if (parentIds.every((parentId: any) => levels[parentId] !== undefined)) {
//         const newLevel = Math.max(0, ...parentIds.map((parentId: any) => levels[parentId])) + 1

//         if (typeof levels[node.SCT_ID] === 'undefined' || levels[node.SCT_ID] < newLevel) {
//           levels[node.SCT_ID] = newLevel
//           //console.log(node.PRODUCT_TYPE_CODE, newLevel, levels[node.SCT_ID])
//         }

//         unresolved.delete(node.SCT_ID)
//       }
//     }
//   }

//   return levels
// }

// // ฟังก์ชันจำลองงานแต่ละตัว
// const processTask = async (
//   key: string,
//   level: number,
//   listBomSubAssySemiFg: BomSubAssySemiFg_Type[],
//   listSql: string[],
//   listSctPrice: { SCT_ID: string; PRODUCT_TYPE_ID: string; SELLING_PRICE: number; ITEM_M_S_PRICE_ID: string }[]
// ) => {
//   const sct = listBomSubAssySemiFg?.find((bomSubAssySemiFg) => bomSubAssySemiFg.SCT_ID === key)

//   if (typeof sct === 'undefined') {
//     // throw new Error('SCT not found')

//     return {
//       Status: false,
//       ResultOnDb: [],
//       TotalCountOnDb: 0,
//       MethodOnDb: 'processTask',
//       Message: 'SCT not found',
//     }
//   }

//   if (typeof sct.ITEM_ID === 'undefined') {
//     // throw new Error('ITEM_ID not found : ' + sct.PRODUCT_TYPE_CODE)

//     return {
//       Status: false,
//       ResultOnDb: [],
//       TotalCountOnDb: 0,
//       MethodOnDb: 'processTask',
//       // Message: `ITEM_ID not found : ${sct.PRODUCT_TYPE_CODE}`,
//       Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER11)',
//     }
//   }

//   let ITEM_M_S_PRICE_ID = ''
//   let SELLING_PRICE = 0

//   if (sct.SCT_STATUS_PROGRESS_ID === 2 || sct.SCT_STATUS_PROGRESS_ID === 3) {
//     console.log('New Re-Cal : ', sct.PRODUCT_TYPE_CODE)

//     // Preparing , Prepared
//     // console.log('Preparing , Prepared ', sct.SCT_ID, sct.PRODUCT_TYPE_CODE, sct.SCT_STATUS_PROGRESS_ID)
//     const { FISCAL_YEAR, ITEM_CATEGORY_NAME, PRODUCT_MAIN_ID, PRODUCT_MAIN_NAME } = sct

//     const sctResourceOptionSql = await SctComponentTypeResourceOptionSelect.getBySctId(sct)
//     const sctResourceOptionData = (await MySQLExecute.search(sctResourceOptionSql)) as {
//       SCT_COMPONENT_TYPE_ID: number
//       SCT_ID: string
//       SCT_RESOURCE_OPTION_ID: number
//     }[]

//     sct.COST_CONDITION_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 1)
//     sct.YR_GR_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 2)
//     sct.TIME_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 3)
//     sct.MATERIAL_DATA_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 4)
//     sct.MATERIAL_YIELD_OPTION = sctResourceOptionData.find((item) => item.SCT_COMPONENT_TYPE_ID === 5)

//     let sctSelectionSql = await StandardCostForProductSQL.getSctSelection(sct)
//     let sctSelection: any = await MySQLExecute.search(sctSelectionSql)

//     sctSelection = sctSelection[0]

//     let costCondition_Data: any
//     let yieldRateGoStraightRateProcessForSct_Data: {
//       PROCESS_ID: number
//       YIELD_RATE_FOR_SCT: number
//       YIELD_ACCUMULATION_FOR_SCT: number
//       GO_STRAIGHT_RATE_FOR_SCT: number
//       COLLECTION_POINT_FOR_SCT: number
//       FLOW_ID: number
//     }[]
//     let yieldRateGoStraightRateTotalForSct_Data
//     let clearTimeForSctProcess_Data: {
//       PROCESS_ID: number
//       FLOW_ID: number
//       CLEAR_TIME_FOR_SCT: number
//     }[]
//     let clearTimeForSctTotal_Data

//     // TODO : get data from DB
//     if (sct?.COST_CONDITION_OPTION?.SCT_RESOURCE_OPTION_ID === 2) {
//       let sql = await StandardCostForProductSQL.getCostConditionDataBySctId(sctSelection)

//       costCondition_Data = await MySQLExecute.search(sql)
//     } else {
//       costCondition_Data = await _CostConditionService.getAllByProductMainIdAndFiscalYear_MasterDataLatest({
//         FISCAL_YEAR,
//         ITEM_CATEGORY_NAME,
//         PRODUCT_MAIN_ID,
//         PRODUCT_MAIN_NAME,
//       })
//     }

//     if (sct?.YR_GR_OPTION?.SCT_RESOURCE_OPTION_ID === 2) {
//       let sql = await StandardCostForProductSQL.getYrGrDataBySctId(sctSelection)

//       const resultData: any = await MySQLExecute.search(sql)

//       yieldRateGoStraightRateProcessForSct_Data = resultData[0]
//       yieldRateGoStraightRateTotalForSct_Data = resultData[1]
//     } else {
//       yieldRateGoStraightRateProcessForSct_Data =
//         (await YieldRateGoStraightRateProcessForSctService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
//           PROCESS_ID: number
//           YIELD_RATE_FOR_SCT: number
//           YIELD_ACCUMULATION_FOR_SCT: number
//           GO_STRAIGHT_RATE_FOR_SCT: number
//           COLLECTION_POINT_FOR_SCT: number
//           FLOW_ID: number
//         }[]

//       yieldRateGoStraightRateTotalForSct_Data =
//         (await YieldRateGoStraightRateTotalForSctService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
//           TOTAL_YIELD_RATE_FOR_SCT: number
//           TOTAL_GO_STRAIGHT_RATE_FOR_SCT: number
//         }[]
//     }

//     if (sct?.TIME_OPTION?.SCT_RESOURCE_OPTION_ID === 2) {
//       // getTimeData from SCT
//       let sql = await StandardCostForProductSQL.getTimeDataBySctId(sctSelection)

//       const resultData: any = await MySQLExecute.search(sql)

//       clearTimeForSctProcess_Data = resultData[0]
//       clearTimeForSctTotal_Data = resultData[1]
//     } else {
//       // getTimeData
//       clearTimeForSctProcess_Data = (await ClearTimeForSctProcessService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
//         PROCESS_ID: number
//         FLOW_ID: number
//         CLEAR_TIME_FOR_SCT: number
//       }[]

//       clearTimeForSctTotal_Data = (await ClearTimeForSctTotalService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
//         TOTAL_CLEAR_TIME_FOR_SCT: number
//       }[]
//     }

//     // getMaterialPriceData
//     let MaterialPrice_Data: {
//       BOM_ID: string
//       PURCHASE_PRICE: number
//       BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
//       ITEM_M_S_PRICE_VALUE: number
//       PURCHASE_PRICE_CURRENCY_ID: string
//       PURCHASE_PRICE_CURRENCY: string
//       PURCHASE_PRICE_UNIT_ID: string
//       PURCHASE_UNIT: string
//       ITEM_M_S_PRICE_ID: string
//       ITEM_ID: string
//       IMPORT_FEE_RATE: number
//       YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
//       FLOW_PROCESS_ID: number
//       FLOW_ID: number
//       USAGE_QUANTITY: number
//       PROCESS_ID: number
//       ITEM_CATEGORY_ID_FROM_BOM: string
//       PRODUCT_TYPE_ID_FROM_ITEM: string
//       ITEM_CODE_FOR_SUPPORT_MES: string
//     }[]
//     // "PRODUCT_TYPE_ID": 264,

//     if (sct?.MATERIAL_DATA_OPTION?.SCT_RESOURCE_OPTION_ID === 2) {
//       // getMaterialPriceData from SCT
//       let sql = await StandardCostForProductSQL.getMaterialPriceDataBySctId(sctSelection)

//       MaterialPrice_Data = (await MySQLExecute.search(sql)) as {
//         BOM_ID: string
//         PURCHASE_PRICE: number
//         BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
//         ITEM_M_S_PRICE_VALUE: number
//         PURCHASE_PRICE_CURRENCY_ID: string
//         PURCHASE_PRICE_CURRENCY: string
//         PURCHASE_PRICE_UNIT_ID: string
//         PURCHASE_UNIT: string
//         ITEM_M_S_PRICE_ID: string
//         ITEM_ID: string
//         IMPORT_FEE_RATE: number
//         YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
//         FLOW_PROCESS_ID: number
//         FLOW_ID: number
//         USAGE_QUANTITY: number
//         PROCESS_ID: number
//         ITEM_CATEGORY_ID_FROM_BOM: string
//         PRODUCT_TYPE_ID_FROM_ITEM: string
//         ITEM_CODE_FOR_SUPPORT_MES: string
//       }[]
//     } else {
//       if (sct?.SCT_PATTERN_ID === 1) {
//         // P2

//         const { BOM_ID, FISCAL_YEAR, PRODUCT_TYPE_ID } = sct

//         // if (PRODUCT_TYPE_ID == '1143') {
//         //   console.log('PRODUCT_TYPE_ID', PRODUCT_TYPE_ID, 'BOM_ID', BOM_ID, 'FISCAL_YEAR', Number(sct.FISCAL_YEAR) - 1)
//         // }
//         if (typeof BOM_ID === 'undefined' || typeof FISCAL_YEAR === 'undefined' || typeof PRODUCT_TYPE_ID === 'undefined') {
//           // throw new Error('BOM_ID or FISCAL_YEAR or PRODUCT_TYPE_ID not found')

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             // Message: 'BOM_ID or FISCAL_YEAR or PRODUCT_TYPE_ID not found',
//             Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER12)',
//           }
//         }

//         MaterialPrice_Data = (await _SctForProductService.getSctBomItemItemPriceByBomIdAndFiscalYear_MasterDataLatest({
//           BOM_ID,
//           FISCAL_YEAR: Number(sct.FISCAL_YEAR),
//           SCT_PATTERN_ID: Number(sct.SCT_PATTERN_ID),
//           PRODUCT_TYPE_ID,
//         })) as {
//           BOM_ID: string
//           PURCHASE_PRICE: number
//           BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
//           ITEM_M_S_PRICE_VALUE: number
//           PURCHASE_PRICE_CURRENCY_ID: string
//           PURCHASE_PRICE_CURRENCY: string
//           PURCHASE_PRICE_UNIT_ID: string
//           PURCHASE_UNIT: string
//           ITEM_M_S_PRICE_ID: string
//           ITEM_ID: string
//           IMPORT_FEE_RATE: number
//           YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
//           FLOW_PROCESS_ID: number
//           FLOW_ID: number
//           USAGE_QUANTITY: number
//           PROCESS_ID: number
//           ITEM_CATEGORY_ID_FROM_BOM: string
//           PRODUCT_TYPE_ID_FROM_ITEM: string
//           ITEM_CODE_FOR_SUPPORT_MES: string
//         }[]
//       } else if (sct?.SCT_PATTERN_ID === 2) {
//         // P3

//         const { BOM_ID, FISCAL_YEAR, PRODUCT_TYPE_ID } = sct

//         if (typeof BOM_ID === 'undefined' || typeof FISCAL_YEAR === 'undefined' || typeof PRODUCT_TYPE_ID === 'undefined') {
//           // throw new Error('BOM_ID or FISCAL_YEAR or PRODUCT_TYPE_ID not found')

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             // Message: 'BOM_ID or FISCAL_YEAR or PRODUCT_TYPE_ID not found',
//             Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER13)',
//           }
//         }

//         MaterialPrice_Data = (await _SctForProductService.getSctBomItemItemPriceByBomIdAndFiscalYear_MasterDataLatest({
//           BOM_ID,
//           FISCAL_YEAR: Number(sct.FISCAL_YEAR),
//           SCT_PATTERN_ID: Number(sct.SCT_PATTERN_ID),
//           PRODUCT_TYPE_ID,
//         })) as {
//           BOM_ID: string
//           PURCHASE_PRICE: number
//           BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
//           ITEM_M_S_PRICE_VALUE: number
//           PURCHASE_PRICE_CURRENCY_ID: string
//           PURCHASE_PRICE_CURRENCY: string
//           PURCHASE_PRICE_UNIT_ID: string
//           PURCHASE_UNIT: string
//           ITEM_M_S_PRICE_ID: string
//           ITEM_ID: string
//           IMPORT_FEE_RATE: number
//           YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
//           FLOW_PROCESS_ID: number
//           FLOW_ID: number
//           USAGE_QUANTITY: number
//           PROCESS_ID: number
//           ITEM_CATEGORY_ID_FROM_BOM: string
//           PRODUCT_TYPE_ID_FROM_ITEM: string
//           ITEM_CODE_FOR_SUPPORT_MES: string
//         }[]
//       } else {
//         // throw new Error('SCT_PATTERN_ID not found')

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           // Message: 'SCT_PATTERN_ID not found',
//           Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER14)',
//         }
//       }
//     }

//     // getYrAccumulationMaterialData
//     // ?? include to getMaterialPriceData

//     // getSctDetailForAdjustment
//     const sctDetailForAdjustment_Data = (await SctDetailForAdjustService.getBySctId(sct)) as {
//       SCT_DETAIL_FOR_ADJUST_ID: string
//       SCT_ID: string
//       TOTAL_INDIRECT_COST: number
//       CIT: number
//       VAT: number
//       DESCRIPTION: string
//       CREATE_BY: string
//       CREATE_DATE: Date
//       UPDATE_BY: string
//       UPDATE_DATE: Date
//       INUSE: number
//     }[]

//     // getSctTotalCost
//     const sctTotalCost_Data = (await SctTotalCostService.getBySctId(sct)) as {
//       SCT_ID: string
//       ADJUST_PRICE: number
//       REMARK_FOR_ADJUST_PRICE: string
//       NOTE: string
//       CIT_FOR_SELLING_PRICE: number
//       VAT_FOR_SELLING_PRICE: number
//       ESTIMATE_PERIOD_START_DATE: string
//       ESTIMATE_PERIOD_END_DATE: string
//     }[]

//     // console.log(
//     //   costCondition_Data,
//     //   yieldRateGoStraightRateProcessForSct_Data,
//     //   yieldRateGoStraightRateTotalForSct_Data,
//     //   clearTimeForSctProcess_Data,
//     //   clearTimeForSctTotal_Data,
//     //   MaterialPrice_Data,
//     //   sctDetailForAdjustment_Data
//     // )

//     // TODO : insert data to DB
//     const sqlList = []

//     let TOTAL_PRICE_OF_ALL_OF_ITEMS: number = 0
//     let TOTAL_PRICE_OF_CONSUMABLE: number = 0
//     let TOTAL_PRICE_OF_PACKING: number = 0
//     let TOTAL_PRICE_OF_RAW_MATERIAL: number = 0
//     let TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: number = 0
//     let TOTAL_PRICE_OF_SUB_ASSY: number = 0

//     let TOTAL_ESSENTIAL_TIME: number = 0

//     const INDIRECT_RATE_OF_DIRECT_PROCESS_COST = Number(costCondition_Data[0][0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST) / 100

//     // get flow process
//     const FlowProcess_Data = (await FlowProcessService.getByFlowId(sct)) as {
//       NO: number
//       FLOW_PROCESS_ID: number
//       PROCESS_ID: number
//       PROCESS_NAME: string
//       PROCESS_CODE: string
//       FLOW_ID: number
//     }[]

//     // ?? insert : sct_flow_process_sequence
//     // delete : sct_flow_process_sequence
//     sqlList.push(
//       await SctFlowProcessSequenceSQL.deleteBySctId({
//         SCT_ID: sct.SCT_ID,
//         UPDATE_BY: sct.UPDATE_BY,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )

//     // insert : sct_flow_process_sequence
//     for (const flowProcess of FlowProcess_Data) {
//       const { FLOW_PROCESS_ID, PROCESS_CODE, PROCESS_ID } = flowProcess

//       const COLLECTION_POINT_FOR_SCT = yieldRateGoStraightRateProcessForSct_Data.find((item) => item.PROCESS_ID == PROCESS_ID)?.COLLECTION_POINT_FOR_SCT

//       if (COLLECTION_POINT_FOR_SCT === undefined) {
//         // throw new Error('OLD_SYSTEM_COLLECTION_POINT not found' + sct.PRODUCT_TYPE_CODE)

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           Message: `OLD_SYSTEM_COLLECTION_POINT not found ${sct.PRODUCT_TYPE_CODE}`,
//         }
//       }

//       // generate sct_process_sequence_code
//       const sctProcessSequenceCode = `${sct.PRODUCT_TYPE_CODE}-${sct.PRODUCT_MAIN_ALPHABET}-P${PROCESS_CODE.slice(-4)}`

//       sqlList.push(
//         await SctFlowProcessSequenceSQL.insert({
//           SCT_ID: sct.SCT_ID,
//           FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
//           SCT_PROCESS_SEQUENCE_CODE: sctProcessSequenceCode,
//           CREATE_BY: sct.CREATE_BY,
//           UPDATE_BY: sct.UPDATE_BY,
//           INUSE: 1,
//           OLD_SYSTEM_COLLECTION_POINT: 1,
//           OLD_SYSTEM_PROCESS_SEQUENCE_CODE: sctProcessSequenceCode,
//           SCT_FLOW_PROCESS_SEQUENCE_ID: uuidv4(),
//           IS_FROM_SCT_COPY: 0,
//         })
//       )
//     }

//     // insert : sct_flow_process_processing_cost_by_engineer
//     sqlList.push(
//       await SctFlowProcessProcessingCostByEngineerSQL.deleteBySctId({
//         SCT_ID: sct.SCT_ID,
//         UPDATE_BY: sct.UPDATE_BY,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )

//     for (const flowProcess of FlowProcess_Data) {
//       const { FLOW_PROCESS_ID, PROCESS_ID } = flowProcess

//       const YIELD_RATE = yieldRateGoStraightRateProcessForSct_Data.find((item) => item.PROCESS_ID === PROCESS_ID)?.YIELD_RATE_FOR_SCT
//       const YIELD_ACCUMULATION = yieldRateGoStraightRateProcessForSct_Data?.find((item) => item?.PROCESS_ID == PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
//       const GO_STRAIGHT_RATE = yieldRateGoStraightRateProcessForSct_Data?.find((item) => item?.PROCESS_ID == PROCESS_ID)?.GO_STRAIGHT_RATE_FOR_SCT

//       if (YIELD_RATE === undefined || YIELD_ACCUMULATION === undefined || GO_STRAIGHT_RATE === undefined) {
//         // throw new Error('YIELD_RATE or YIELD_ACCUMULATION or GO_STRAIGHT_RATE not found')

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           Message: 'YIELD_RATE or YIELD_ACCUMULATION or GO_STRAIGHT_RATE not found',
//         }
//       }
//       const SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID = uuidv4()
//       sqlList.push(
//         await SctFlowProcessProcessingCostByEngineerSQL.insert({
//           SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID,
//           SCT_ID: sct.SCT_ID,
//           FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
//           YIELD_RATE: YIELD_RATE,
//           YIELD_ACCUMULATION: YIELD_ACCUMULATION,
//           GO_STRAIGHT_RATE: GO_STRAIGHT_RATE,
//           NOTE: '',
//           CREATE_BY: sct.CREATE_BY,
//           UPDATE_BY: sct.UPDATE_BY,

//           IS_FROM_SCT_COPY: 0,
//         })
//       )
//     }

//     // insert : sct_flow_process_processing_cost_by_mfg
//     sqlList.push(
//       await SctFlowProcessProcessingCostByMfgSQL.deleteBySctId({
//         SCT_ID: sct.SCT_ID,
//         UPDATE_BY: sct.UPDATE_BY,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )
//     for (const flowProcess of FlowProcess_Data) {
//       const { FLOW_PROCESS_ID, PROCESS_ID, FLOW_ID } = flowProcess

//       // from Engineer
//       const YIELD_ACCUMULATION_FOR_SCT = Number(
//         yieldRateGoStraightRateProcessForSct_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
//       )
//       const GO_STRAIGHT_RATE = Number(
//         yieldRateGoStraightRateProcessForSct_Data?.find((item) => item.FLOW_ID == FLOW_ID && item?.PROCESS_ID == PROCESS_ID)?.GO_STRAIGHT_RATE_FOR_SCT
//       )

//       // from MFG
//       const CLEAR_TIME = Number(clearTimeForSctProcess_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.CLEAR_TIME_FOR_SCT)

//       if (CLEAR_TIME === undefined || YIELD_ACCUMULATION_FOR_SCT === undefined || GO_STRAIGHT_RATE === undefined) {
//         // throw new Error('CLEAR_TIME or YIELD_RATE or GO_STRAIGHT_RATE not found')

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           Message: 'CLEAR_TIME or YIELD_RATE or GO_STRAIGHT_RATE not found',
//         }
//       }

//       const ESSENTIAL_TIME = (CLEAR_TIME / YIELD_ACCUMULATION_FOR_SCT / GO_STRAIGHT_RATE) * 100 * 100

//       const PROCESS_STANDARD_TIME =
//         (CLEAR_TIME / YIELD_ACCUMULATION_FOR_SCT / GO_STRAIGHT_RATE) *
//         100 *
//         100 *
//         (1 + (isNaN(INDIRECT_RATE_OF_DIRECT_PROCESS_COST) ? 0 : Number(INDIRECT_RATE_OF_DIRECT_PROCESS_COST)))

//       sqlList.push(
//         await SctFlowProcessProcessingCostByMfgSQL.insert({
//           SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID: uuidv4(),
//           SCT_ID: sct.SCT_ID,
//           FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
//           CLEAR_TIME: CLEAR_TIME,
//           ESSENTIAL_TIME,
//           PROCESS_STANDARD_TIME,
//           NOTE: '',
//           CREATE_BY: sct.CREATE_BY,
//           UPDATE_BY: sct.UPDATE_BY,

//           IS_FROM_SCT_COPY: 0,
//         })
//       )

//       TOTAL_ESSENTIAL_TIME += ESSENTIAL_TIME
//     }
//     // insert : sct_processing_cost_by_engineer_total
//     sqlList.push(
//       await SctProcessingCostByEngineerTotalSQL.deleteBySctId({
//         SCT_ID: sct.SCT_ID,
//         UPDATE_BY: sct.UPDATE_BY,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )
//     sqlList.push(
//       await SctProcessingCostByEngineerTotalSQL.insert({
//         SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID: uuidv4(),
//         SCT_ID: sct.SCT_ID,
//         TOTAL_YIELD_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_YIELD_RATE_FOR_SCT,
//         TOTAL_GO_STRAIGHT_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
//         CREATE_BY: sct.CREATE_BY,
//         UPDATE_BY: sct.UPDATE_BY,
//         INUSE: 1,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )
//     // insert : sct_processing_cost_by_mfg_total
//     sqlList.push(
//       await SctProcessingCostByMfgTotalSQL.deleteBySctId({
//         SCT_ID: sct.SCT_ID,
//         UPDATE_BY: sct.UPDATE_BY,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )

//     const TOTAL_CLEAR_TIME_FOR_SCT = clearTimeForSctTotal_Data?.[0]?.TOTAL_CLEAR_TIME_FOR_SCT
//     // const TOTAL_ESSENTIAL_TIME_FOR_SCT = clearTimeForSctTotal_Data?.[0].TOTAL_ESSENTIAL_TIME_FOR_SCT

//     if (!TOTAL_CLEAR_TIME_FOR_SCT) {
//       // throw new Error('TOTAL_CLEAR_TIME_FOR_SCT or TOTAL_ESSENTIAL_TIME_FOR_SCT not found')

//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPriceTagPrice',
//         Message: 'TOTAL_CLEAR_TIME_FOR_SCT or TOTAL_ESSENTIAL_TIME_FOR_SCT not found',
//       }
//     }

//     sqlList.push(
//       await SctProcessingCostByMfgTotalSQL.insert({
//         SCT_PROCESSING_COST_BY_MFG_TOTAL_ID: uuidv4(),
//         SCT_ID: sct.SCT_ID,
//         TOTAL_CLEAR_TIME: TOTAL_CLEAR_TIME_FOR_SCT,
//         TOTAL_ESSENTIAL_TIME,
//         CREATE_BY: sct.CREATE_BY,
//         UPDATE_BY: sct.UPDATE_BY,
//         INUSE: 1,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )

//     // insert : sct_bom_flow_process_item_usage_price
//     sqlList.push(
//       await SctBomFlowProcessItemUsagePriceSQL.deleteBySctId({
//         SCT_ID: sct.SCT_ID,
//         UPDATE_BY: sct.UPDATE_BY,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )

//     for (const materialPrice of MaterialPrice_Data) {
//       const { FLOW_ID, PROCESS_ID } = materialPrice

//       let yieldAccumulation: number
//       let IS_ADJUST_YIELD_ACCUMULATION: number

//       IS_ADJUST_YIELD_ACCUMULATION = 0

//       if (!materialPrice.ITEM_CATEGORY_ID_FROM_BOM) {
//         // throw new Error('ITEM_CATEGORY_ID_FROM_BOM not found')

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           // Message: 'ITEM_CATEGORY_ID_FROM_BOM not found',
//           Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER15)',
//         }
//       }

//       if (!materialPrice.ITEM_CODE_FOR_SUPPORT_MES) {
//         // throw new Error('ITEM_CODE_FOR_SUPPORT_MES not found')

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           Message: 'ITEM_CODE_FOR_SUPPORT_MES not found',
//         }
//       }

//       if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('CONSU')) {
//         // TODO - Start with CONSU
//         yieldAccumulation = 100
//       } else if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('C') && materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '5') {
//         // TODO -  Start with  C & Consumable
//         yieldAccumulation = 100
//       } else if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('R') && materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '5') {
//         // TODO -  Start with  R & Consumable
//         yieldAccumulation = 100
//       } else if (!!materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT === true) {
//         // TODO -  Adjust Yield Accumulation from Engineer
//         IS_ADJUST_YIELD_ACCUMULATION = 1
//         yieldAccumulation = Number(materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT)
//       } else {
//         // TODO - from Process
//         yieldAccumulation = Number(yieldRateGoStraightRateProcessForSct_Data.find((item) => item.FLOW_ID == FLOW_ID
//  && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT)
//       }

//       if (isNaN(yieldAccumulation)) {
//         // throw new Error('Yield accumulation is not a number' + FLOW_ID + '_' + PROCESS_ID + JSON.stringify(yieldRateGoStraightRateProcessForSct_Data))

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           Message: 'Yield accumulation is not a number',
//         }
//       }

//       // 2 Semi-Finished Goods
//       // 3 Sub-Assy
//       let ITEM_M_S_PRICE_ID
//       let AMOUNT = 0
//       let PRICE = 0

//       if (materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '2' || materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '3') {
//         // console.log(bomSubAssySemiFg.PRODUCT_TYPE_ID)

//         const sctPrice = listSctPrice.find((bomSubAssySemiFg) => bomSubAssySemiFg.PRODUCT_TYPE_ID === materialPrice.PRODUCT_TYPE_ID_FROM_ITEM)

//         ITEM_M_S_PRICE_ID = sctPrice?.ITEM_M_S_PRICE_ID

//         AMOUNT = (Number(materialPrice.USAGE_QUANTITY) * Number(sctPrice?.SELLING_PRICE)) / (yieldAccumulation / 100)
//         PRICE = Number(sctPrice?.SELLING_PRICE)

//         if (!ITEM_M_S_PRICE_ID) {
//           // throw new Error('ITEM_M_S_PRICE_ID not found' + JSON.stringify(listSctPrice) + materialPrice.PRODUCT_TYPE_ID_FROM_ITEM)

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             // Message: 'ITEM_M_S_PRICE_ID not found',
//             Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER16)',
//           }
//         }
//       } else {
//         if (!materialPrice?.ITEM_M_S_PRICE_ID) {
//           // throw new Error('ITEM_M_S_PRICE_ID not found ' + materialPrice.ITEM_CODE_FOR_SUPPORT_MES)

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             // Message: 'ITEM_M_S_PRICE_ID not found',
//             Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER17)',
//           }
//         }

//         ITEM_M_S_PRICE_ID = materialPrice.ITEM_M_S_PRICE_ID

//         if (isNaN(Number(materialPrice.USAGE_QUANTITY))) {
//           // throw new Error('USAGE_QUANTITY is not a number' + JSON.stringify(materialPrice))

//           return {
//             Status: false,
//             ResultOnDb: [],
//             TotalCountOnDb: 0,
//             MethodOnDb: 'calculateSellingPriceTagPrice',
//             Message: 'USAGE_QUANTITY is not a number',
//           }
//         }

//         AMOUNT = (Number(materialPrice.USAGE_QUANTITY) * Number(materialPrice.ITEM_M_S_PRICE_VALUE)) / (yieldAccumulation / 100)
//         PRICE = Number(materialPrice.ITEM_M_S_PRICE_VALUE)
//       }

//       sqlList.push(
//         await SctBomFlowProcessItemUsagePriceSQL.insert({
//           SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID: uuidv4(),
//           SCT_ID: sct.SCT_ID,
//           ITEM_M_S_PRICE_ID,
//           CREATE_BY: sct.CREATE_BY,
//           UPDATE_BY: sct.UPDATE_BY,
//           INUSE: 1,
//           AMOUNT,
//           BOM_FLOW_PROCESS_ITEM_USAGE_ID: materialPrice.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
//           IS_ADJUST_YIELD_ACCUMULATION,
//           PRICE,
//           YIELD_ACCUMULATION: yieldAccumulation,
//           YIELD_ACCUMULATION_DEFAULT: Number(
//             yieldRateGoStraightRateProcessForSct_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
//           ),
//           ADJUST_YIELD_ACCUMULATION_VERSION_NO: 1,
//           IS_FROM_SCT_COPY: 0,
//         })
//       )

//       // Sum total Item Price

//       // 1	Finished Goods
//       // 2	Semi-Finished Goods
//       // 3	Sub-Assy
//       // 4	Raw Material
//       // 5	Consumable
//       // 6	Packing
//       // 7	Spare Parts

//       TOTAL_PRICE_OF_ALL_OF_ITEMS += AMOUNT
//       TOTAL_PRICE_OF_CONSUMABLE += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '5' ? AMOUNT : 0
//       TOTAL_PRICE_OF_PACKING += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '6' ? AMOUNT : 0
//       TOTAL_PRICE_OF_RAW_MATERIAL += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '4' ? AMOUNT : 0
//       TOTAL_PRICE_OF_SEMI_FINISHED_GOODS += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '2' ? AMOUNT : 0
//       TOTAL_PRICE_OF_SUB_ASSY += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '3' ? AMOUNT : 0
//     }

//     // update ???? :sct_progress_working

//     // update : sct_total_cost
//     sqlList.push(
//       await SctTotalCostSQL.deleteBySctId({
//         SCT_ID: sct.SCT_ID,
//         UPDATE_BY: sct.UPDATE_BY,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )

//     const IMPORTED_FEE = costCondition_Data[4][0].IMPORT_FEE_RATE

//     const SCT_TOTAL_COST_ID = uuidv4()
//     const SCT_ID = sct.SCT_ID

//     // Direct Cost

//     const TOTAL_YIELD_RATE = yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_YIELD_RATE_FOR_SCT || 0
//     const TOTAL_CLEAR_TIME = clearTimeForSctTotal_Data?.[0].TOTAL_CLEAR_TIME_FOR_SCT

//     const TOTAL_GO_STRAIGHT_RATE = yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_GO_STRAIGHT_RATE_FOR_SCT || 0

//     // Indirect Cost
//     const DIRECT_UNIT_PROCESS_COST: number = Number(costCondition_Data[0][0].DIRECT_UNIT_PROCESS_COST)

//     const INDIRECT_COST_SALE_AVE = sctDetailForAdjustment_Data?.[0]?.TOTAL_INDIRECT_COST ?? costCondition_Data?.[1]?.[0]?.TOTAL_INDIRECT_COST // can adjust

//     // const SELLING_EXPENSE = costCondition_Data?.[2][0].SELLING_EXPENSE / 100
//     // const GA = costCondition_Data?.[2][0].GA / 100
//     // const MARGIN = costCondition_Data?.[2][0].MARGIN / 100

//     const SELLING_EXPENSE = costCondition_Data?.[2][0].SELLING_EXPENSE / 100
//     const GA = costCondition_Data?.[2][0].GA / 100
//     const MARGIN = costCondition_Data?.[2][0].MARGIN / 100

//     const TOTAL_PROCESSING_TIME: number = TOTAL_ESSENTIAL_TIME / 60 // Please check
//     const TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: number =
//       TOTAL_PROCESSING_TIME * (1 + (isNaN(Number(INDIRECT_RATE_OF_DIRECT_PROCESS_COST)) ? 0 : INDIRECT_RATE_OF_DIRECT_PROCESS_COST))

//     const DIRECT_PROCESS_COST: number = TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE * (isNaN(DIRECT_UNIT_PROCESS_COST) ? 1 : DIRECT_UNIT_PROCESS_COST)
//     const TOTAL_DIRECT_COST: number = TOTAL_PRICE_OF_ALL_OF_ITEMS + DIRECT_PROCESS_COST

//     const IMPORTED_COST_DEFAULT = 0 // skip
//     const IS_ADJUST_IMPORTED_COST = 0 // skip
//     const IMPORTED_COST = 0 // skip

//     const RM_INCLUDE_IMPORTED_COST = Number(TOTAL_PRICE_OF_RAW_MATERIAL) + Number(TOTAL_PRICE_OF_SUB_ASSY) + Number(TOTAL_PRICE_OF_SEMI_FINISHED_GOODS) + Number(IMPORTED_COST)

//     const CONSUMABLE_PACKING = Number(TOTAL_PRICE_OF_CONSUMABLE) + Number(TOTAL_PRICE_OF_PACKING)

//     const MATERIALS_COST = Number(RM_INCLUDE_IMPORTED_COST) + CONSUMABLE_PACKING

//     const TOTAL = Number(MATERIALS_COST) + Number(DIRECT_PROCESS_COST)
//     const GA_FOR_SELLING_PRICE = (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE)) * (Number(GA) || 0)
//     const SELLING_EXPENSE_FOR_SELLING_PRICE = (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE)) * (Number(SELLING_EXPENSE) || 0)

//     // Selling Price
//     const MARGIN_FOR_SELLING_PRICE =
//       (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE) + (Number(SELLING_EXPENSE_FOR_SELLING_PRICE) || 0) + (Number(GA_FOR_SELLING_PRICE) || 0)) * (Number(MARGIN) || 0)

//     const VAT = costCondition_Data?.[2][0].VAT
//     const VAT_FOR_SELLING_PRICE = sctDetailForAdjustment_Data?.[0]?.VAT ?? 0

//     const CIT: number = sctDetailForAdjustment_Data?.[0]?.CIT ?? 0 // can adjust
//     //const CIT: number = Number(costCondition_Data?.[2][0].CIT) / 100
//     const CIT_FOR_SELLING_PRICE: number = Number(CIT / 100) * MARGIN_FOR_SELLING_PRICE

//     // console.log(CIT, CIT_FOR_SELLING_PRICE)

//     const ADJUST_PRICE = sctTotalCost_Data?.[0]?.ADJUST_PRICE ?? 0

//     const ESTIMATE_PERIOD_START_DATE = sct.ESTIMATE_PERIOD_START_DATE || ''
//     const ESTIMATE_PERIOD_END_DATE = sct.ESTIMATE_PERIOD_END_DATE || ''

//     const NOTE = sctTotalCost_Data?.[0]?.NOTE || ''
//     const REMARK_FOR_ADJUST_PRICE = sctTotalCost_Data?.[0]?.REMARK_FOR_ADJUST_PRICE || ''

//     const SELLING_PRICE_BY_FORMULA =
//       Number(TOTAL) +
//       (Number(INDIRECT_COST_SALE_AVE) || 0) +
//       (Number(SELLING_EXPENSE_FOR_SELLING_PRICE) || 0) +
//       (Number(GA_FOR_SELLING_PRICE) || 0) +
//       (Number(MARGIN_FOR_SELLING_PRICE) || 0) +
//       (Number(CIT_FOR_SELLING_PRICE) || 0) +
//       (Number(VAT_FOR_SELLING_PRICE) || 0)

//     SELLING_PRICE = Math.round(SELLING_PRICE_BY_FORMULA + Number(ADJUST_PRICE))

//     if (!SELLING_PRICE) {
//       // throw new Error('SELLING_PRICE not found ' + sctTotalCost_Data?.[0])

//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPriceTagPrice',
//         Message: 'SELLING_PRICE not found',
//       }
//     }
//     const TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST = TOTAL_PRICE_OF_ALL_OF_ITEMS + IMPORTED_COST

//     const RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS = Number(TOTAL_PRICE_OF_RAW_MATERIAL) + Number(TOTAL_PRICE_OF_SUB_ASSY) + Number(TOTAL_PRICE_OF_SEMI_FINISHED_GOODS)

//     const ASSEMBLY_GROUP_FOR_SUPPORT_MES = `${sct.PRODUCT_MAIN_ALPHABET}${sct.PRODUCT_SUB_ALPHABET}${sct.ITEM_CATEGORY_ALPHABET}1`

//     sqlList.push(
//       await SctTotalCostSQL.insert({
//         SCT_TOTAL_COST_ID,
//         SCT_ID,
//         TOTAL_YIELD_RATE,
//         TOTAL_CLEAR_TIME,
//         TOTAL_ESSENTIAL_TIME,
//         TOTAL_GO_STRAIGHT_RATE,
//         DIRECT_UNIT_PROCESS_COST,
//         INDIRECT_RATE_OF_DIRECT_PROCESS_COST: INDIRECT_RATE_OF_DIRECT_PROCESS_COST * 100,
//         INDIRECT_COST_SALE_AVE,
//         IMPORTED_FEE,
//         SELLING_EXPENSE: SELLING_EXPENSE * 100,
//         GA: GA * 100,
//         MARGIN: MARGIN * 100,
//         VAT,
//         VAT_FOR_SELLING_PRICE,
//         CIT,
//         CIT_FOR_SELLING_PRICE,
//         TOTAL_PROCESSING_TIME,
//         TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE,
//         DIRECT_PROCESS_COST,
//         MARGIN_FOR_SELLING_PRICE,
//         TOTAL_DIRECT_COST,
//         CREATE_BY: sct.CREATE_BY,
//         UPDATE_BY: sct.UPDATE_BY,
//         INUSE: 1,
//         ADJUST_PRICE,
//         ESTIMATE_PERIOD_START_DATE,
//         ESTIMATE_PERIOD_END_DATE,
//         //NOTE,
//         REMARK_FOR_ADJUST_PRICE,
//         SELLING_PRICE,
//         SELLING_PRICE_BY_FORMULA,
//         TOTAL,
//         TOTAL_PRICE_OF_ALL_OF_ITEMS,
//         TOTAL_PRICE_OF_CONSUMABLE,
//         TOTAL_PRICE_OF_PACKING,
//         TOTAL_PRICE_OF_RAW_MATERIAL,
//         TOTAL_PRICE_OF_SEMI_FINISHED_GOODS,
//         TOTAL_PRICE_OF_SUB_ASSY,
//         SELLING_EXPENSE_FOR_SELLING_PRICE,
//         CONSUMABLE_PACKING,
//         GA_FOR_SELLING_PRICE,
//         IMPORTED_COST,
//         IMPORTED_COST_DEFAULT,
//         IS_ADJUST_IMPORTED_COST,
//         MATERIALS_COST,
//         RM_INCLUDE_IMPORTED_COST,
//         TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST,
//         RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS,
//         ASSEMBLY_GROUP_FOR_SUPPORT_MES,
//         IS_FROM_SCT_COPY: 0,
//       })
//     )

//     const ITEM_M_O_PRICE_ID = uuidv4()
//     ITEM_M_S_PRICE_ID = uuidv4()

//     if (sct.ITEM_CATEGORY_ID != '1') {
//       //

//       if (!!sct.ITEM_ID === false) {
//         // throw new Error('ITEM_ID not found in Menu : Item Master - ' + sct.PRODUCT_TYPE_CODE)

//         return {
//           Status: false,
//           ResultOnDb: [],
//           TotalCountOnDb: 0,
//           MethodOnDb: 'calculateSellingPriceTagPrice',
//           // Message: 'ITEM_ID not found',
//           Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER18)',
//         }
//       }
//       // FG
//       sqlList.push(
//         await ItemManufacturingOriginalPriceSQL.create({
//           CREATE_BY: sct.CREATE_BY,
//           ITEM_ID: sct.ITEM_ID,
//           ITEM_M_O_PRICE_ID: ITEM_M_O_PRICE_ID,
//           PURCHASE_PRICE: SELLING_PRICE,
//           PURCHASE_PRICE_CURRENCY_ID: '7', // THB
//           PURCHASE_PRICE_UNIT_ID: '1', // Piece
//           FISCAL_YEAR: sct.FISCAL_YEAR,
//           IS_CURRENT: 1,
//           ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID: 3,
//         })
//       )

//       sqlList.push(
//         await ItemManufacturingStandardPriceSQL.create({
//           CREATE_BY: sct.CREATE_BY,
//           ITEM_ID: sct.ITEM_ID,
//           ITEM_M_S_PRICE_ID,
//           EXCHANGE_RATE_ID: '7', // THB,
//           FISCAL_YEAR: sct.FISCAL_YEAR,
//           IMPORT_FEE_ID: '',
//           ITEM_M_O_PRICE_ID: ITEM_M_O_PRICE_ID,
//           ITEM_M_S_PRICE_VALUE: SELLING_PRICE,
//           PURCHASE_UNIT_RATIO: 1,
//           PURCHASE_UNIT_ID: '1', // Piece
//           USAGE_UNIT_RATIO: 1,
//           USAGE_UNIT_ID: '1', // Piece
//           IS_CURRENT: 1,
//           SCT_PATTERN_ID: sct.SCT_PATTERN_ID,
//           ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: 3,
//         })
//       )

//       sqlList.push(
//         await ItemManufacturingStandardPriceSctSQL.create({
//           ITEM_M_S_PRICE_ID: ITEM_M_S_PRICE_ID,
//           ITEM_M_S_PRICE_SCT_ID: uuidv4(),
//           SCT_ID: sct.SCT_ID,
//           CREATE_BY: sct.CREATE_BY,
//         })
//       )

//       sqlList.push(
//         await StandardCostForProductSQL.deleteIsRefreshDataMaster({
//           SCT_ID: sct.SCT_ID,
//           UPDATE_BY: sct.CREATE_BY,
//         })
//       )
//     }

//     listSql.push(...sqlList)
//   } else {
//     //Completed , Checking , Waiting Approve , Can use
//     console.log('Data Stamp : ', sct.PRODUCT_TYPE_CODE)

//     const result_getLastSellingBySctId = await _SctForProductService.getLastSellingBySctId({
//       SCT_ID: sct.SCT_ID,
//     })

//     if (result_getLastSellingBySctId.length != 1) {
//       // throw new Error('SCT + Selling Price มีมากกว่า 1 รายการ' + sct.SCT_REVISION_CODE)

//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPriceTagPrice',
//         Message: 'SCT + Selling Price มีมากกว่า 1 รายการ',
//       }
//     }

//     if (!!result_getLastSellingBySctId[0].ITEM_M_S_PRICE_ID === false) {
//       // throw new Error('ITEM_M_S_PRICE_ID not found' + sct.SCT_REVISION_CODE)

//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPriceTagPrice',
//         // Message: 'ITEM_M_S_PRICE_ID not found',
//         Message: 'การคำนวณราคามีปัญหา โปรดติดต่อ Programmer (RECALER19)',
//       }
//     }

//     if (!!result_getLastSellingBySctId[0].ITEM_M_S_PRICE_VALUE === false) {
//       // throw new Error('SELLING_PRICE not found' + sct.SCT_REVISION_CODE)

//       return {
//         Status: false,
//         ResultOnDb: [],
//         TotalCountOnDb: 0,
//         MethodOnDb: 'calculateSellingPriceTagPrice',
//         Message: 'SELLING_PRICE not found',
//       }
//     }

//     ITEM_M_S_PRICE_ID = result_getLastSellingBySctId[0].ITEM_M_S_PRICE_ID
//     SELLING_PRICE = result_getLastSellingBySctId[0].ITEM_M_S_PRICE_VALUE
//   }

//   listSctPrice.push({
//     SCT_ID: sct.SCT_ID,
//     PRODUCT_TYPE_ID: sct.PRODUCT_TYPE_ID,
//     ITEM_M_S_PRICE_ID,
//     SELLING_PRICE,
//   })
// }

// // ฟังก์ชันจัดกลุ่มตาม Level
// const groupDataByLevel = (data: Record<string, number>): Record<number, string[]> => {
//   return Object.entries(data).reduce(
//     (acc, [key, level]) => {
//       if (!acc[level]) acc[level] = []
//       acc[level].push(key)
//       return acc
//     },
//     {} as Record<number, string[]>
//   )
// }

// const processByLevel = async (
//   data: Record<string, number>,
//   listBomSubAssySemiFg: BomSubAssySemiFg_Type[],
//   listSql: string[],
//   listSctPrice: { SCT_ID: string; PRODUCT_TYPE_ID: string; SELLING_PRICE: number; ITEM_M_S_PRICE_ID: string }[]
// ): Promise<void> => {
//   const groupedData = groupDataByLevel(data)

//   const levels = Object.keys(groupedData)
//     .map(Number)
//     .sort((a, b) => b - a)

//   for (const level of levels) {
//     //console.log(`Processing Level ${level}`)
//     const tasks = groupedData[level].map(async (key) => {
//       const result = await processTask(key, level, listBomSubAssySemiFg, listSql, listSctPrice)

//       if (result && !result.Status) {
//         console.error(`Error processing key ${key}: ${result.Message}`)
//       }

//       return result
//     })
//     await Promise.all(tasks)
//     //console.log(`Completed Level ${level}`)
//   }
// }
