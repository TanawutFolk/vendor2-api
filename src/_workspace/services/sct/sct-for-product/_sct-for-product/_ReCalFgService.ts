// Mysql2 Imports

// Business Data Imports
import { MySQLExecute } from '@businessData/dbExecute'

// Types Imports
import { ResponseI } from '@src/types/ResponseI'

// SQL Imports
import { _CostConditionService } from '@src/_workspace/services/cost-condition/_CostConditionService'
import { BomSQL } from '@src/_workspace/sql/bom/BomSQL'
import { ItemProductDetailSQL } from '@src/_workspace/sql/item/ItemProductDetailSQL'

import { ClearTimeForSctProcessService } from '@services/_cycle-time-system/ClearTimeForSctProcessService'
import { ClearTimeForSctTotalService } from '@services/_cycle-time-system/ClearTimeForSctTotalService'
import { FlowProcessService } from '@services/flow-process/FlowProcessService'
import { YieldRateGoStraightRateProcessForSctService } from '@services/yield-rate-go-straight-rate/YieldRateGoStraightRateProcessForSctService'
import { YieldRateGoStraightRateTotalForSctService } from '@services/yield-rate-go-straight-rate/YieldRateGoStraightRateTotalForSctService'
import { SctDetailForAdjustService } from '@services/sct/sct-for-product/SctDetailForAdjustService'
import { SctFlowProcessSequenceSQL } from '@src/_workspace/sql/sct/sct-for-product/SctFlowProcessSequenceSQL'
import { SctSQL } from '@src/_workspace/sql/sct/sct-for-product/SctSQL'

import { ItemManufacturingOriginalPriceSQL } from '@src/_workspace/sql/item/ItemManufacturingOriginalPriceSQL'
import { ItemManufacturingStandardPriceSctSQL } from '@src/_workspace/sql/item/ItemManufacturingStandardPriceSctSQL'
import { ItemManufacturingStandardPriceSQL } from '@src/_workspace/sql/item/ItemManufacturingStandardPriceSQL'
import { SctBomFlowProcessItemUsagePriceSQL } from '@src/_workspace/sql/sct/sct-for-product/SctBomFlowProcessItemUsagePriceSQL'
import { SctFlowProcessProcessingCostByEngineerSQL } from '@src/_workspace/sql/sct/sct-for-product/SctFlowProcessProcessingCostByEngineerSQL'
import { SctFlowProcessProcessingCostByMfgSQL } from '@src/_workspace/sql/sct/sct-for-product/SctFlowProcessProcessingCostByMfgSQL'
import { SctProcessingCostByEngineerTotalSQL } from '@src/_workspace/sql/sct/sct-for-product/SctProcessingCostByEngineerTotalSQL'
import { SctProcessingCostByMfgTotalSQL } from '@src/_workspace/sql/sct/sct-for-product/SctProcessingCostByMfgTotalSQL'
import { SctTotalCostSQL } from '@src/_workspace/sql/sct/sct-for-product/SctTotalCostSQL'
import { v4 as uuidv4 } from 'uuid'
import { _SctForProductService } from '@services/sct/sct-for-product/_sct-for-product/_SctForProductService'
import { StandardPriceSQL } from '@src/_workspace/sql/manufacturing-item/StandardPriceSQL'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'
import { ExchangeRateService } from '@src/_workspace/services/cost-condition/cost-conditionNew/ExchangeRateService'
import { SctMasterDataHistorySQL } from '@src/_workspace/sql/sct/sct-for-product/SctMasterDataHistorySQL'

type BomSubAssySemiFg_Type = {
  BOM_ID: number
  FLOW_ID: number
  BOM_CODE: string
  SCT_ID: string
  SCT_REVISION_CODE: string
  FISCAL_YEAR: number
  SCT_PATTERN_ID: number
  SCT_REASON_SETTING_ID: number

  SCT_STATUS_PROGRESS_ID: number

  SCT_TAG_SETTING_ID: number

  PRODUCT_TYPE_ID: number
  PRODUCT_SUB_ID: number
  PRODUCT_MAIN_ID: number
  PRODUCT_CATEGORY_ID: number

  PRODUCT_TYPE_CODE: string
  PRODUCT_TYPE_NAME: string
  PRODUCT_SUB_NAME: string
  PRODUCT_MAIN_NAME: string
  PRODUCT_MAIN_ALPHABET: string
  PRODUCT_CATEGORY_NAME: string
  ITEM_CATEGORY_ID: number

  PRODUCT_SUB_ALPHABET: string
  ITEM_CATEGORY_ALPHABET: string

  ITEM_ID: number

  CREATE_BY: string
  UPDATE_BY: string

  ITEM_CATEGORY_NAME: string

  ESTIMATE_PERIOD_START_DATE: string
  ESTIMATE_PERIOD_END_DATE: string

  PARENT: any[]

  SCT_ID_SELECTION: string | null
}

const getBomDetailByBomId = async (dataItem: BomSubAssySemiFg_Type, listBomSubAssySemiFg: BomSubAssySemiFg_Type[]): Promise<void> => {
  const sql = await BomSQL.getBomDetailByBomId({ BOM_ID: dataItem.BOM_ID })
  const resultData = (await MySQLExecute.search(sql)) as {
    BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
    BOM_ID: number
    PROCESS_NAME: string
    NO: number
    ITEM_ID: number
    ITEM_INTERNAL_CODE: string
    ITEM_INTERNAL_FULL_NAME: string
    ITEM_CODE_FOR_SUPPORT_MES: string
    IMAGE_PATH: string
    USAGE_QUANTITY: number
    USAGE_UNIT_ID: number
    USAGE_UNIT_SYMBOL: string
    ITEM_CATEGORY_ID: number
    ITEM_CATEGORY_NAME: string
    PURCHASE_MODULE_ID: number
    ITEM_PRICE_USAGE_UNIT_ID: number
    ITEM_PRICE_USAGE_UNIT_NAME: string
    ITEM_PRICE_USAGE_UNIT_SYMBOL: string
    FLOW_PROCESS_NO: number
    ITEM_CATEGORY_ID_FOR_BOM: number
    ITEM_CATEGORY_NAME_FOR_BOM: number
  }[]

  if (resultData.length === 0) {
    return
  }

  // Filter items with ITEM_CATEGORY_ID_FOR_BOM as 2 or 3
  const filteredBom = resultData.filter((item) => item.ITEM_CATEGORY_ID_FOR_BOM === 2 || item.ITEM_CATEGORY_ID_FOR_BOM === 3)

  // Recursively call getBomDetailByBomId for each filtered item
  for (const item of filteredBom) {
    const ItemProductDetail_sql = await ItemProductDetailSQL.getByItemId(item)
    const ItemProductDetail_data = (await MySQLExecute.search(ItemProductDetail_sql)) as {
      PRODUCT_TYPE_ID: number
      PRODUCT_SUB_ID: number
      PRODUCT_MAIN_ID: number
      PRODUCT_CATEGORY_ID: number
      PRODUCT_TYPE_NAME: string
      PRODUCT_TYPE_CODE: string
      PRODUCT_SUB_NAME: string
      PRODUCT_MAIN_NAME: string
      PRODUCT_MAIN_ALPHABET: string
      PRODUCT_CATEGORY_NAME: string
      ITEM_ID: number
      ITEM_CATEGORY_ID: number
      PRODUCT_SUB_ALPHABET: string
      ITEM_CATEGORY_ALPHABET: string
      ITEM_CATEGORY_NAME: string
    }[]
    if (ItemProductDetail_data.length === 0) {
      continue
    }

    if (!!ItemProductDetail_data?.[0].ITEM_ID === false) {
      throw new Error('ITEM_ID not found : ' + item.ITEM_CODE_FOR_SUPPORT_MES + ItemProductDetail_sql)
    }

    // const sctCopyData = (await MySQLExecute.search(await SctSQL.getSctCopyBySctId({ SCT_ID: dataItem.SCT_ID }))) as {
    //   SCT_ID_SELECTION: string
    //   PRODUCT_TYPE_ID: string
    //   SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: string
    // }[]

    //let sct_sql = ''

    // 1) find Reason & Area (SCT_STATUS_PROGRESS_ID = 2,3)
    // sct_sql = await SctSQL.getByProductTypeIdAndFiscalYearAndSctPatternIdAnd_In_SctStatusProgressId({
    //   PRODUCT_TYPE_ID: Number(ItemProductDetail_data[0].PRODUCT_TYPE_ID),
    //   FISCAL_YEAR: dataItem.FISCAL_YEAR,
    //   SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
    //   SCT_STATUS_PROGRESS_ID: '(2,3)',
    // })

    // if (sctCopyData.length === 0) {
    //   sct_sql = await SctSQL.getByProductTypeIdAndSctTagSettingId({
    //     PRODUCT_TYPE_ID: Number(ItemProductDetail_data[0].PRODUCT_TYPE_ID),
    //     FISCAL_YEAR: dataItem.FISCAL_YEAR,
    //     SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
    //   })
    // } else {
    //   sct_sql = await SctSQL.getBySctId({
    //     SCT_ID: sctCopyData[0].SCT_ID_SELECTION,
    //   })
    // }

    // console.log(sct_sql)
    let sct_data: {
      SCT_ID: string
      SCT_REVISION_CODE: string
      BOM_ID: number
      FISCAL_YEAR: number
      SCT_PATTERN_ID: number
      ESTIMATE_PERIOD_START_DATE: string
      ESTIMATE_PERIOD_END_DATE: string
      PRODUCT_TYPE_ID: number
      FLOW_ID: number
      BOM_CODE: string
      SCT_STATUS_PROGRESS_ID: number
    }[] = []

    sct_data = (await MySQLExecute.search(
      await SctSQL.getByProductTypeIdAndFiscalYearAndSctPatternIdAnd_In_SctStatusProgressId({
        PRODUCT_TYPE_ID: Number(ItemProductDetail_data[0].PRODUCT_TYPE_ID),
        FISCAL_YEAR: dataItem.FISCAL_YEAR,
        SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
        SCT_STATUS_PROGRESS_ID: '2,3',
      })
    )) as {
      SCT_ID: string
      SCT_REVISION_CODE: string
      BOM_ID: number
      FISCAL_YEAR: number
      SCT_PATTERN_ID: number
      ESTIMATE_PERIOD_START_DATE: string
      ESTIMATE_PERIOD_END_DATE: string
      PRODUCT_TYPE_ID: number
      FLOW_ID: number
      BOM_CODE: string
      SCT_STATUS_PROGRESS_ID: number
      CREATE_FROM_SCT_ID: number
    }[]
    //console.log(sct_sql, sct_data)

    if (sct_data.length === 0) {
      // const listSctComponentTypeResourceOptionSelect = (await MySQLExecute.search(await SctComponentTypeResourceOptionSelect.getBySctId({ SCT_ID: dataItem.SCT_ID }))) as {
      //   SCT_ID: string
      //   SCT_RESOURCE_OPTION_ID: number
      //   SCT_COMPONENT_TYPE_ID: number
      // }[]
      // const sctResourceOptionId = listSctComponentTypeResourceOptionSelect.find((item) => item.SCT_COMPONENT_TYPE_ID === 7)?.SCT_RESOURCE_OPTION_ID
      // if (sctResourceOptionId === 4) {
      //   sct_data = (await MySQLExecute.search(await SctBomFlowProcessItemUsagePriceSQL.getBySctId({ SCT_ID: dataItem.SCT_ID, IS_FROM_SCT_COPY: 1 }))) as {
      //     SCT_ID_FROM_SCT_COPY: string
      //   }
      //   sct_data = (await MySQLExecute.search(
      //     await SctSQL.getByProductTypeIdAndFiscalYearAndSctPatternIdAnd_In_SctStatusProgressId({
      //       PRODUCT_TYPE_ID: Number(ItemProductDetail_data[0].PRODUCT_TYPE_ID),
      //       FISCAL_YEAR: dataItem.FISCAL_YEAR,
      //       SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
      //       SCT_STATUS_PROGRESS_ID: '(2,3)',
      //     })
      //   )) as {
      //     SCT_ID: string
      //     SCT_REVISION_CODE: string
      //     BOM_ID: string
      //     FISCAL_YEAR: number
      //     SCT_PATTERN_ID: number
      //     ESTIMATE_PERIOD_START_DATE: string
      //     ESTIMATE_PERIOD_END_DATE: string
      //     PRODUCT_TYPE_ID: string
      //     FLOW_ID: string
      //     BOM_CODE: string
      //     SCT_STATUS_PROGRESS_ID: number
      //   }[]
      // }

      sct_data = (await MySQLExecute.search(
        await SctSQL.getByProductTypeIdAndSctTagSettingId({
          PRODUCT_TYPE_ID: ItemProductDetail_data[0].PRODUCT_TYPE_ID,
          FISCAL_YEAR: dataItem.FISCAL_YEAR,
          SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
        })
      )) as {
        SCT_ID: string
        SCT_REVISION_CODE: string
        BOM_ID: number
        FISCAL_YEAR: number
        SCT_PATTERN_ID: number
        ESTIMATE_PERIOD_START_DATE: string
        ESTIMATE_PERIOD_END_DATE: string
        PRODUCT_TYPE_ID: number
        FLOW_ID: number
        BOM_CODE: string
        SCT_STATUS_PROGRESS_ID: number
        CREATE_FROM_SCT_ID: string
      }[]

      if (sct_data.length === 0) {
        throw new Error('No SCT data : Tag Season not found ' + dataItem.PRODUCT_TYPE_CODE + '=>' + ItemProductDetail_data?.[0].PRODUCT_TYPE_CODE)
      }

      if (sct_data.length > 1) {
        sct_data = sct_data.slice(0, 1)
        // console.log(sct_data)
        //throw new Error('SCT data : Preparing & Prepared มีมากกว่า 1 รายการ ' + dataItem.PRODUCT_TYPE_CODE + '=>' + ItemProductDetail_data?.[0].PRODUCT_TYPE_CODE)
      }
    } else {
      if (sct_data.length > 1) {
        // sct_data = sct_data.slice(0, 1)
        // console.log(sct_data)
        throw new Error('SCT data : Preparing & Prepared มีมากกว่า 1 รายการ ' + dataItem.PRODUCT_TYPE_CODE + '=>' + ItemProductDetail_data?.[0].PRODUCT_TYPE_CODE)
      }

      if (sct_data[0].SCT_STATUS_PROGRESS_ID !== 3) {
        throw new Error('SCT data : SCT_STATUS_PROGRESS_ID <> Prepared' + dataItem.PRODUCT_TYPE_CODE + '=>' + ItemProductDetail_data?.[0].PRODUCT_TYPE_CODE)
      }
    }

    const simplifiedBom = sct_data.map(
      ({ SCT_ID, SCT_REVISION_CODE, BOM_ID, FISCAL_YEAR, SCT_PATTERN_ID, ESTIMATE_PERIOD_START_DATE, ESTIMATE_PERIOD_END_DATE, FLOW_ID, BOM_CODE, SCT_STATUS_PROGRESS_ID }) =>
        ({
          SCT_STATUS_PROGRESS_ID,

          SCT_ID,
          FISCAL_YEAR,
          SCT_PATTERN_ID,
          SCT_REVISION_CODE,
          BOM_ID,
          FLOW_ID,
          PARENT: [dataItem],

          SCT_REASON_SETTING_ID: 1,
          SCT_TAG_SETTING_ID: 1,

          PRODUCT_TYPE_ID: ItemProductDetail_data[0].PRODUCT_TYPE_ID,
          PRODUCT_SUB_ID: ItemProductDetail_data[0].PRODUCT_SUB_ID,
          PRODUCT_MAIN_ID: ItemProductDetail_data[0].PRODUCT_MAIN_ID,
          PRODUCT_CATEGORY_ID: ItemProductDetail_data[0].PRODUCT_CATEGORY_ID,

          PRODUCT_TYPE_CODE: ItemProductDetail_data[0].PRODUCT_TYPE_CODE,
          PRODUCT_TYPE_NAME: ItemProductDetail_data[0].PRODUCT_TYPE_NAME,
          PRODUCT_SUB_NAME: ItemProductDetail_data[0].PRODUCT_SUB_NAME,
          PRODUCT_MAIN_NAME: ItemProductDetail_data[0].PRODUCT_MAIN_NAME,
          PRODUCT_MAIN_ALPHABET: ItemProductDetail_data[0].PRODUCT_MAIN_ALPHABET,
          PRODUCT_CATEGORY_NAME: ItemProductDetail_data[0].PRODUCT_CATEGORY_NAME,

          ITEM_CATEGORY_ID: ItemProductDetail_data[0].ITEM_CATEGORY_ID,
          ITEM_CATEGORY_ALPHABET: ItemProductDetail_data[0].ITEM_CATEGORY_ALPHABET,
          PRODUCT_SUB_ALPHABET: ItemProductDetail_data[0].PRODUCT_SUB_ALPHABET,

          ITEM_ID: ItemProductDetail_data[0].ITEM_ID,
          ITEM_CATEGORY_NAME: ItemProductDetail_data[0].ITEM_CATEGORY_NAME,
          BOM_CODE,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.UPDATE_BY,

          ESTIMATE_PERIOD_END_DATE,
          ESTIMATE_PERIOD_START_DATE,

          SCT_ID_SELECTION: null,
        }) as BomSubAssySemiFg_Type
    )

    // const existingItem = listBomSubAssySemiFg.find((bomSubAssySemiFg) => bomSubAssySemiFg.SCT_ID === item.SCT_ID)
    // if (existingItem) {
    //   existingItem.PARENT.push(dataItem)
    // } else {
    //   listBomSubAssySemiFg.push(...simplifiedBom)
    // }

    //console.log(...simplifiedBom)

    listBomSubAssySemiFg.push(...simplifiedBom)

    await getBomDetailByBomId(
      {
        BOM_ID: sct_data[0].BOM_ID,
        FLOW_ID: sct_data[0].FLOW_ID,
        SCT_ID: sct_data[0].SCT_ID,
        FISCAL_YEAR: sct_data[0].FISCAL_YEAR,
        SCT_PATTERN_ID: sct_data[0].SCT_PATTERN_ID,
        SCT_REVISION_CODE: sct_data[0].SCT_REVISION_CODE,

        //PRODUCT_TYPE_ID: ItemProductDetail_data[0].PRODUCT_TYPE_ID,
        PRODUCT_TYPE_ID: ItemProductDetail_data[0].PRODUCT_TYPE_ID,
        PRODUCT_SUB_ID: ItemProductDetail_data[0].PRODUCT_SUB_ID,
        PRODUCT_MAIN_ID: ItemProductDetail_data[0].PRODUCT_MAIN_ID,
        PRODUCT_CATEGORY_ID: ItemProductDetail_data[0].PRODUCT_CATEGORY_ID,

        SCT_STATUS_PROGRESS_ID: sct_data[0].SCT_STATUS_PROGRESS_ID,

        ITEM_CATEGORY_ID: ItemProductDetail_data[0].ITEM_CATEGORY_ID,
        SCT_REASON_SETTING_ID: 1,
        SCT_TAG_SETTING_ID: 1,
        PRODUCT_TYPE_CODE: ItemProductDetail_data[0].PRODUCT_TYPE_CODE,
        PRODUCT_TYPE_NAME: ItemProductDetail_data[0].PRODUCT_TYPE_NAME,
        PRODUCT_SUB_NAME: ItemProductDetail_data[0].PRODUCT_SUB_NAME,
        PRODUCT_MAIN_NAME: ItemProductDetail_data[0].PRODUCT_MAIN_NAME,
        PRODUCT_CATEGORY_NAME: ItemProductDetail_data[0].PRODUCT_CATEGORY_NAME,
        BOM_CODE: sct_data[0].BOM_CODE,
        CREATE_BY: dataItem.CREATE_BY,
        UPDATE_BY: dataItem.UPDATE_BY,
        PARENT: [],
        PRODUCT_MAIN_ALPHABET: ItemProductDetail_data[0].PRODUCT_MAIN_ALPHABET,
        ITEM_CATEGORY_ALPHABET: ItemProductDetail_data[0].ITEM_CATEGORY_ALPHABET,
        PRODUCT_SUB_ALPHABET: ItemProductDetail_data[0].PRODUCT_SUB_ALPHABET,
        ITEM_ID: ItemProductDetail_data[0].ITEM_ID,
        ITEM_CATEGORY_NAME: ItemProductDetail_data[0].ITEM_CATEGORY_NAME,

        ESTIMATE_PERIOD_END_DATE: sct_data[0].ESTIMATE_PERIOD_END_DATE,
        ESTIMATE_PERIOD_START_DATE: sct_data[0].ESTIMATE_PERIOD_START_DATE,
        SCT_ID_SELECTION: null,
      },
      listBomSubAssySemiFg
    )
  }
  // !!!! Check recursion depth to prevent infinite loop
  if (listBomSubAssySemiFg.length > 100) {
    throw new Error('Recursion depth exceeded > 100')
  }
}

// Example usage within SctService
export const _ReCalFgService = {
  calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId: async (
    dataItem: {
      SCT_ID: string
      // SCT_REVISION_CODE: string
      CREATE_BY: string
      UPDATE_BY: string
    }[]
  ): Promise<ResponseI> => {
    // const { ITEM_CATEGORY_ID, SCT_STATUS_PROGRESS_ID, SCT_PATTERN_ID, FISCAL_YEAR, SCT_TAG_SETTING_ID, CREATE_BY, UPDATE_BY } = dataItem

    // if (!ITEM_CATEGORY_ID || !SCT_STATUS_PROGRESS_ID || !SCT_PATTERN_ID || !FISCAL_YEAR || !SCT_TAG_SETTING_ID || !CREATE_BY || !UPDATE_BY) {
    //   return {
    //     Status: false,
    //     ResultOnDb: [],
    //     TotalCountOnDb: 0,
    //     MethodOnDb: 'calculateSellPriceAllFg : getAllSctFgBySctProgressId',
    //     Message: 'ITEM_CATEGORY_ID or SCT_STATUS_PROGRESS_ID or SCT_PATTERN_ID or FISCAL_YEAR not found or SCT_TAG_SETTING_ID or CREATE_BY or UPDATE_BY',
    //   }
    // }

    // const resultData = (await MySQLExecute.search(
    //   await SctSQL.calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId({
    //     ITEM_CATEGORY_ID,
    //     SCT_STATUS_PROGRESS_ID,
    //     SCT_PATTERN_ID,
    //     FISCAL_YEAR,
    //     SCT_TAG_SETTING_ID,
    //   })
    // )) as {
    //   SCT_ID: string
    //   SCT_REVISION_CODE: string
    // }[]

    // console.log(resultData)

    //const listSql = []
    for (let i = 0; i < dataItem.length; i++) {
      const { SCT_ID, CREATE_BY, UPDATE_BY } = dataItem[i]
      console.log(`${i + 1} Start : ${SCT_ID}`)
      const result = await calculateSellPriceByFgStructure({ SCT_ID, CREATE_BY, UPDATE_BY })
      console.log(`${i + 1} Finished : ${result.MethodOnDb}`)
    }

    // await Promise.all(
    //   resultData.map((element) =>
    //     calculateSellPriceByFgStructure({
    //       SCT_REVISION_CODE: element.SCT_REVISION_CODE,
    //       CREATE_BY,
    //       UPDATE_BY,
    //     })
    //   )
    // )

    // console.log(listSql.length)

    //await MySQLExecute.executeList(listSql)
    // resultData.forEach(async (element) => {
    //   calculateSellPriceByFgStructure({ SCT_REVISION_CODE: element.SCT_REVISION_CODE, CREATE_BY, UPDATE_BY })
    //   console.log()
    // })

    return {
      Status: true,
      ResultOnDb: [],
      TotalCountOnDb: 0,
      MethodOnDb: 'calculateSellPriceAllFg : getAllSctFgBySctProgressId',
      Message: 'Success',
    }
  },

  calculateSellPriceByNotHaveFGAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId: async (dataItem: any): Promise<ResponseI> => {
    const { SCT_STATUS_PROGRESS_ID, SCT_PATTERN_ID, FISCAL_YEAR, SCT_REASON_SETTING_ID, CREATE_BY, UPDATE_BY } = dataItem

    if (!SCT_STATUS_PROGRESS_ID || !SCT_PATTERN_ID || !FISCAL_YEAR || !SCT_REASON_SETTING_ID || !CREATE_BY || !UPDATE_BY) {
      return {
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'calculateSellPriceAllFg : getAllSctFgBySctProgressId',
        Message: 'ITEM_CATEGORY_ID or SCT_STATUS_PROGRESS_ID or SCT_PATTERN_ID or FISCAL_YEAR not found or SCT_REASON_SETTING_ID or CREATE_BY or UPDATE_BY',
      }
    }

    const resultData = (await MySQLExecute.search(await SctSQL.getSctWithoutSellingPrice())) as {
      SCT_ID: string
      SCT_REVISION_CODE: string
    }[]

    // const listSql = []
    for (let i = 0; i < resultData.length; i++) {
      const element = resultData[i]
      console.log(`${i + 1} Start : ${element.SCT_REVISION_CODE}`)
      const result = await calculateSellPriceByFgStructure({ SCT_ID: element.SCT_ID, CREATE_BY, UPDATE_BY })
      console.log(`${i + 1} Finished : ${result.MethodOnDb}`)
    }

    // await Promise.all(
    //   resultData.map((element) =>
    //     calculateSellPriceByFgStructure({
    //       SCT_REVISION_CODE: element.SCT_REVISION_CODE,
    //       CREATE_BY,
    //       UPDATE_BY,
    //     })
    //   )
    // )

    // console.log(listSql.length)

    //await MySQLExecute.executeList(listSql)
    // resultData.forEach(async (element) => {
    //   calculateSellPriceByFgStructure({ SCT_REVISION_CODE: element.SCT_REVISION_CODE, CREATE_BY, UPDATE_BY })
    //   console.log()
    // })

    return {
      Status: true,
      ResultOnDb: resultData,
      TotalCountOnDb: resultData.length,
      MethodOnDb: 'calculateSellPriceAllFg : getAllSctFgBySctProgressId',
      Message: 'Success',
    }
  },
}

export async function calculateSellPriceByFgStructure(dataItem: {
  SCT_ID: string
  CREATE_BY: string
  UPDATE_BY: string
  //SCT_STATUS_PROGRESS_ID: number
}): Promise<ResponseI> {
  const listBomSubAssySemiFg: BomSubAssySemiFg_Type[] = []

  const sqlSct = await SctSQL.getBySctRevisionCode(dataItem)

  const resultDataSct = (await MySQLExecute.search(sqlSct)) as {
    SCT_ID: string
    SCT_REVISION_CODE: string
    CREATE_BY: string
    CREATE_DATE: string
    UPDATE_BY: string
    UPDATE_DATE: string
    INUSE: number
    SCT_STATUS_PROGRESS_ID: number
    SCT_STATUS_PROGRESS_NO: number
    SCT_STATUS_PROGRESS_NAME: string
    PRODUCT_TYPE_ID: number
    PRODUCT_SUB_ID: number
    PRODUCT_MAIN_ID: number
    PRODUCT_CATEGORY_ID: number
    PRODUCT_TYPE_CODE: string
    PRODUCT_TYPE_NAME: string
    PRODUCT_SUB_NAME: string
    PRODUCT_MAIN_NAME: string
    PRODUCT_MAIN_ALPHABET: string
    PRODUCT_CATEGORY_NAME: string
    FISCAL_YEAR: number
    PRODUCT_SPECIFICATION_TYPE_NAME: string
    BOM_ID: number
    BOM_CODE: string
    BOM_NAME: string
    FLOW_ID: number
    FLOW_CODE: string
    FLOW_NAME: string
    SCT_PATTERN_ID: number
    SCT_PATTERN_NAME: string
    ESTIMATE_PERIOD_START_DATE: string
    ESTIMATE_PERIOD_END_DATE: string
    ITEM_CATEGORY_ID: number
    ITEM_CATEGORY_NAME: string
    SCT_REASON_SETTING_ID: number
    SCT_REASON_SETTING_NAME: string
    SCT_TAG_SETTING_ID: number
    SCT_TAG_SETTING_NAME: string
    ITEM_ID: number
    ITEM_CATEGORY_ALPHABET: string
    PRODUCT_SUB_ALPHABET: string
    SCT_ID_SELECTION: string
  }[]

  if (resultDataSct.length === 0) {
    throw new Error('No SCT data found')
    // return {
    //   Status: false,
    //   ResultOnDb: [],
    //   TotalCountOnDb: 0,
    //   MethodOnDb: 'calculateSellPriceByFgStructure : getBySctId',
    //   Message: 'No SCT data found',
    // }
  }

  if (resultDataSct.length > 1) {
    throw new Error('resultDataSct > 1')
    // return {
    //   Status: false,
    //   ResultOnDb: [],
    //   TotalCountOnDb: 0,
    //   MethodOnDb: 'calculateSellPriceByFgStructure : getBySctId',
    //   Message: 'resultDataSct > 1',
    // }
  }

  if (!resultDataSct[0].ITEM_CATEGORY_ID) {
    throw new Error('ITEM_CATEGORY_ID not found')
    // return {
    //   Status: false,
    //   ResultOnDb: [],
    //   TotalCountOnDb: 0,
    //   MethodOnDb: 'calculateSellPriceByFgStructure : getBySctId',
    //   Message: 'ITEM_CATEGORY_ID not found',
    // }
  }

  // SCT tag => Budget only
  //if (resultDataSct[0].SCT_TAG_SETTING_ID == '1') {
  await getBomDetailByBomId(
    {
      BOM_ID: resultDataSct[0].BOM_ID,
      FLOW_ID: resultDataSct[0].FLOW_ID,
      BOM_CODE: resultDataSct[0].BOM_CODE,
      SCT_ID: resultDataSct[0].SCT_ID,
      FISCAL_YEAR: resultDataSct[0].FISCAL_YEAR,
      SCT_PATTERN_ID: resultDataSct[0].SCT_PATTERN_ID,
      SCT_REVISION_CODE: resultDataSct[0].SCT_REVISION_CODE,
      SCT_REASON_SETTING_ID: 1,
      SCT_TAG_SETTING_ID: 1,
      ITEM_ID: resultDataSct[0].ITEM_ID,

      SCT_STATUS_PROGRESS_ID: resultDataSct[0].SCT_STATUS_PROGRESS_ID,

      PRODUCT_TYPE_ID: resultDataSct[0].PRODUCT_TYPE_ID,
      PRODUCT_SUB_ID: resultDataSct[0].PRODUCT_SUB_ID,
      PRODUCT_MAIN_ID: resultDataSct[0].PRODUCT_MAIN_ID,
      PRODUCT_CATEGORY_ID: resultDataSct[0].PRODUCT_CATEGORY_ID,

      PRODUCT_TYPE_CODE: resultDataSct[0].PRODUCT_TYPE_CODE,
      PRODUCT_TYPE_NAME: resultDataSct[0].PRODUCT_TYPE_NAME,
      PRODUCT_SUB_NAME: resultDataSct[0].PRODUCT_SUB_NAME,
      PRODUCT_MAIN_NAME: resultDataSct[0].PRODUCT_MAIN_NAME,
      PRODUCT_MAIN_ALPHABET: resultDataSct[0].PRODUCT_MAIN_ALPHABET,

      ITEM_CATEGORY_ALPHABET: resultDataSct[0].ITEM_CATEGORY_ALPHABET,
      PRODUCT_SUB_ALPHABET: resultDataSct[0].PRODUCT_SUB_ALPHABET,

      PRODUCT_CATEGORY_NAME: resultDataSct[0].PRODUCT_CATEGORY_NAME,
      CREATE_BY: dataItem.CREATE_BY,
      PARENT: [],
      UPDATE_BY: dataItem.UPDATE_BY,
      ITEM_CATEGORY_ID: resultDataSct[0].ITEM_CATEGORY_ID,
      ITEM_CATEGORY_NAME: resultDataSct[0].ITEM_CATEGORY_NAME,

      ESTIMATE_PERIOD_END_DATE: resultDataSct[0].ESTIMATE_PERIOD_END_DATE,
      ESTIMATE_PERIOD_START_DATE: resultDataSct[0].ESTIMATE_PERIOD_START_DATE,

      SCT_ID_SELECTION: resultDataSct[0].SCT_ID_SELECTION,
    },
    listBomSubAssySemiFg
  )

  listBomSubAssySemiFg.unshift({
    BOM_ID: resultDataSct[0].BOM_ID,
    FLOW_ID: resultDataSct[0].FLOW_ID,
    BOM_CODE: resultDataSct[0].BOM_CODE,
    SCT_ID: resultDataSct[0].SCT_ID,
    SCT_REVISION_CODE: resultDataSct[0].SCT_REVISION_CODE,
    FISCAL_YEAR: resultDataSct[0].FISCAL_YEAR,
    SCT_PATTERN_ID: resultDataSct[0].SCT_PATTERN_ID,
    SCT_REASON_SETTING_ID: 1,
    SCT_TAG_SETTING_ID: 1,

    SCT_STATUS_PROGRESS_ID: resultDataSct[0].SCT_STATUS_PROGRESS_ID,

    PRODUCT_TYPE_ID: resultDataSct[0].PRODUCT_TYPE_ID,
    PRODUCT_SUB_ID: resultDataSct[0].PRODUCT_SUB_ID,
    PRODUCT_MAIN_ID: resultDataSct[0].PRODUCT_MAIN_ID,
    PRODUCT_CATEGORY_ID: resultDataSct[0].PRODUCT_CATEGORY_ID,

    ITEM_CATEGORY_ALPHABET: resultDataSct[0].ITEM_CATEGORY_ALPHABET,
    PRODUCT_SUB_ALPHABET: resultDataSct[0].PRODUCT_SUB_ALPHABET,

    PRODUCT_TYPE_CODE: resultDataSct[0].PRODUCT_TYPE_CODE,
    PRODUCT_TYPE_NAME: resultDataSct[0].PRODUCT_TYPE_NAME,
    PRODUCT_SUB_NAME: resultDataSct[0].PRODUCT_SUB_NAME,
    PRODUCT_MAIN_NAME: resultDataSct[0].PRODUCT_MAIN_NAME,
    PRODUCT_MAIN_ALPHABET: resultDataSct[0].PRODUCT_MAIN_ALPHABET,
    PRODUCT_CATEGORY_NAME: resultDataSct[0].PRODUCT_CATEGORY_NAME,
    ITEM_ID: resultDataSct[0].ITEM_ID,

    ITEM_CATEGORY_ID: resultDataSct[0].ITEM_CATEGORY_ID,
    ITEM_CATEGORY_NAME: resultDataSct[0].ITEM_CATEGORY_NAME,
    CREATE_BY: dataItem.CREATE_BY,
    UPDATE_BY: dataItem.UPDATE_BY,

    ESTIMATE_PERIOD_END_DATE: resultDataSct[0].ESTIMATE_PERIOD_END_DATE,
    ESTIMATE_PERIOD_START_DATE: resultDataSct[0].ESTIMATE_PERIOD_START_DATE,

    PARENT: [],

    SCT_ID_SELECTION: resultDataSct[0].SCT_ID_SELECTION,
  })

  const listSctLevel = calculateLevels(listBomSubAssySemiFg)
  const listSql: string[] = []
  const listSctPrice: { SCT_ID: string; PRODUCT_TYPE_ID: number; SELLING_PRICE: number; ITEM_M_S_PRICE_ID: string }[] = []

  await processByLevel(listSctLevel, listBomSubAssySemiFg, listSql, listSctPrice)

  await MySQLExecute.executeList(listSql)

  return {
    Status: true,
    ResultOnDb: listSctPrice,
    TotalCountOnDb: listBomSubAssySemiFg.length,
    MethodOnDb: `${dataItem.SCT_ID} ☕`,
    Message: 'Success',
  }
  // } else {
  //   throw new Error('Tag Budget only')
  // }
}

function calculateLevels(nodes: any[]): Record<string, number> {
  const levels: Record<string, number> = {}
  const unresolved = new Set(nodes.map((node) => node.SCT_ID))

  while (unresolved.size > 0) {
    for (const node of nodes) {
      //if (!unresolved.has(node.SCT_ID)) continue

      const parentIds = node.PARENT.map((p: any) => p.SCT_ID)
      if (parentIds.every((parentId: any) => levels[parentId] !== undefined)) {
        const newLevel = Math.max(0, ...parentIds.map((parentId: any) => levels[parentId])) + 1

        if (typeof levels[node.SCT_ID] === 'undefined' || levels[node.SCT_ID] < newLevel) {
          levels[node.SCT_ID] = newLevel
          //console.log(node.PRODUCT_TYPE_CODE, newLevel, levels[node.SCT_ID])
        }

        unresolved.delete(node.SCT_ID)
      }
    }
  }

  return levels
}

const processTask = async (
  key: string,
  level: number,
  listBomSubAssySemiFg: BomSubAssySemiFg_Type[],
  listSql: string[],
  listSctPrice: { SCT_ID: string; PRODUCT_TYPE_ID: number; SELLING_PRICE: number; ITEM_M_S_PRICE_ID: string }[]
): Promise<void> => {
  const sct = listBomSubAssySemiFg?.find((bomSubAssySemiFg) => bomSubAssySemiFg.SCT_ID === key)

  if (typeof sct === 'undefined') {
    throw new Error('SCT not found')
  }

  if (typeof sct.ITEM_ID === 'undefined') {
    throw new Error('ITEM_ID not found : ' + sct.PRODUCT_TYPE_CODE)
  }

  let ITEM_M_S_PRICE_ID = ''
  let SELLING_PRICE = 0

  if (sct.SCT_STATUS_PROGRESS_ID === 2 || sct.SCT_STATUS_PROGRESS_ID === 3) {
    console.log('New Re-Cal : ', sct.PRODUCT_TYPE_CODE)

    // Preparing , Prepared
    // console.log('Preparing , Prepared ', sct.SCT_ID, sct.PRODUCT_TYPE_CODE, sct.SCT_STATUS_PROGRESS_ID)
    const { FISCAL_YEAR, ITEM_CATEGORY_NAME, PRODUCT_MAIN_NAME, PRODUCT_MAIN_ID, ITEM_CATEGORY_ID } = sct

    // TODO : get data from DB
    const costCondition_Data = await _CostConditionService.getAllByProductMainIdAndFiscalYear_MasterDataLatest({
      FISCAL_YEAR,
      ITEM_CATEGORY_NAME,
      PRODUCT_MAIN_ID,
      PRODUCT_MAIN_NAME,
      ITEM_CATEGORY_ID,
    })

    // getYrGrData
    const yieldRateGoStraightRateProcessForSct_Data =
      (await YieldRateGoStraightRateProcessForSctService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
        PROCESS_ID: number
        YIELD_RATE_FOR_SCT: number
        YIELD_ACCUMULATION_FOR_SCT: number
        GO_STRAIGHT_RATE_FOR_SCT: number
        COLLECTION_POINT_FOR_SCT: number
        FLOW_ID: number
        REVISION_NO: number
      }[]

    const yieldRateGoStraightRateTotalForSct_Data =
      (await YieldRateGoStraightRateTotalForSctService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
        TOTAL_YIELD_RATE_FOR_SCT: number
        TOTAL_GO_STRAIGHT_RATE_FOR_SCT: number
        REVISION_NO: number
      }[]

    // getTimeData
    const clearTimeForSctProcess_Data = (await ClearTimeForSctProcessService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
      PROCESS_ID: number
      FLOW_ID: number
      CLEAR_TIME_FOR_SCT: number
      REVISION_NO: number
    }[]

    const clearTimeForSctTotal_Data = (await ClearTimeForSctTotalService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
      TOTAL_CLEAR_TIME_FOR_SCT: number
      REVISION_NO: number
    }[]

    // getMaterialPriceData
    // let MaterialPrice_Data: {
    //   BOM_ID: string
    //   PURCHASE_PRICE: number
    //   BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
    //   ITEM_M_S_PRICE_VALUE: number
    //   PURCHASE_PRICE_CURRENCY_ID: string
    //   PURCHASE_PRICE_CURRENCY: string
    //   PURCHASE_PRICE_UNIT_ID: string
    //   PURCHASE_UNIT: string
    //   ITEM_M_S_PRICE_ID: string
    //   ITEM_ID: string
    //   IMPORT_FEE_RATE: number
    //   YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
    //   FLOW_PROCESS_ID: number
    //   FLOW_ID: number
    //   USAGE_QUANTITY: number
    //   PROCESS_ID: number
    //   ITEM_CATEGORY_ID_FROM_BOM: number
    //   PRODUCT_TYPE_ID_FROM_ITEM: number
    //   ITEM_CODE_FOR_SUPPORT_MES: string
    //   YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_REVISION_NO: number
    //   ITEM_IS_CURRENT: number
    // }[]
    // "PRODUCT_TYPE_ID": 264,
    //if (sct?.SCT_PATTERN_ID === 1) {
    // P2

    const { BOM_ID, PRODUCT_TYPE_ID, SCT_PATTERN_ID } = sct

    // if (PRODUCT_TYPE_ID == '1143') {
    //   console.log('PRODUCT_TYPE_ID', PRODUCT_TYPE_ID, 'BOM_ID', BOM_ID, 'FISCAL_YEAR', Number(sct.FISCAL_YEAR) - 1)
    // }
    if (typeof BOM_ID === 'undefined' || typeof FISCAL_YEAR === 'undefined' || typeof PRODUCT_TYPE_ID === 'undefined') {
      throw new Error('BOM_ID or FISCAL_YEAR or PRODUCT_TYPE_ID not found')
    }

    const MaterialPrice_Data = (await _SctForProductService.getSctBomItemItemPriceByBomIdAndFiscalYear_MasterDataLatest({
      BOM_ID,
      FISCAL_YEAR,
      PRODUCT_TYPE_ID,
      SCT_PATTERN_ID,
    })) as {
      BOM_ID: string
      PURCHASE_PRICE: number
      BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
      ITEM_M_S_PRICE_VALUE: number
      PURCHASE_PRICE_CURRENCY_ID: string
      PURCHASE_PRICE_CURRENCY: string
      PURCHASE_PRICE_UNIT_ID: string
      PURCHASE_UNIT: string
      ITEM_M_S_PRICE_ID: string
      ITEM_ID: string
      IMPORT_FEE_RATE: number
      YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
      FLOW_PROCESS_ID: number
      FLOW_ID: number
      USAGE_QUANTITY: number
      PROCESS_ID: number
      ITEM_CATEGORY_ID_FROM_BOM: number
      PRODUCT_TYPE_ID_FROM_ITEM: number
      ITEM_CODE_FOR_SUPPORT_MES: string
      YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_REVISION_NO: number
      ITEM_IS_CURRENT: number
    }[]

    //#region 1) Check item is current or not
    if (MaterialPrice_Data.some((item) => item.ITEM_IS_CURRENT === 0)) {
      throw new Error('Item is not current')
    }
    //#endregion 1) Check item is current or not

    //#region 2) Check duplicate - BOM_FLOW_PROCESS_ITEM_USAGE_ID
    const seen = new Set<string | number>()

    const hasDuplicate = MaterialPrice_Data.some((item) => {
      const key = item.BOM_FLOW_PROCESS_ITEM_USAGE_ID

      if (seen.has(key)) {
        return true
      }

      seen.add(key)
      return false
    })

    if (hasDuplicate) {
      throw new Error('Duplicate BOM_FLOW_PROCESS_ITEM_USAGE_ID')
    }
    //#endregion 2) Check duplicate - BOM_FLOW_PROCESS_ITEM_USAGE_ID

    // getSctDetailForAdjustment
    const sctDetailForAdjustment_Data = (
      await SctDetailForAdjustService.getBySctId({
        SCT_ID: sct.SCT_ID,
      })
    ).filter((item) => item.IS_FROM_SCT_COPY === 0) as {
      TOTAL_INDIRECT_COST: number
      CIT: number
      VAT: number
      GA: number
      MARGIN: number
      SELLING_EXPENSE: number
      ADJUST_PRICE: number
      REMARK_FOR_ADJUST_PRICE: string
      IS_FROM_SCT_COPY: number
      TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID: number
      CIT_SCT_RESOURCE_OPTION_ID: number
      VAT_SCT_RESOURCE_OPTION_ID: number
      GA_SCT_RESOURCE_OPTION_ID: number
      MARGIN_SCT_RESOURCE_OPTION_ID: number
      SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID: number
      ADJUST_PRICE_SCT_RESOURCE_OPTION_ID: number
    }[]

    // TODO : insert data to DB
    const sqlList = []

    let TOTAL_PRICE_OF_ALL_OF_ITEMS: number = 0
    let TOTAL_PRICE_OF_CONSUMABLE: number = 0
    let TOTAL_PRICE_OF_PACKING: number = 0
    let TOTAL_PRICE_OF_RAW_MATERIAL: number = 0
    let TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: number = 0
    let TOTAL_PRICE_OF_SUB_ASSY: number = 0

    let TOTAL_ESSENTIAL_TIME: number = 0

    const INDIRECT_RATE_OF_DIRECT_PROCESS_COST = Number(costCondition_Data[0][0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST) / 100

    // get flow process
    const FlowProcess_Data = (await FlowProcessService.getByFlowId(sct)) as {
      NO: number
      FLOW_PROCESS_ID: number
      PROCESS_ID: number
      PROCESS_NAME: string
      PROCESS_CODE: string
      FLOW_ID: number
    }[]

    // ?? insert : sct_flow_process_sequence
    // delete : sct_flow_process_sequence
    sqlList.push(
      await SctFlowProcessSequenceSQL.deleteBySctId({
        SCT_ID: sct.SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
        IS_FROM_SCT_COPY: 0,
      })
    )

    // insert : sct_flow_process_sequence
    for (const flowProcess of FlowProcess_Data) {
      const { FLOW_PROCESS_ID, PROCESS_CODE, PROCESS_ID } = flowProcess

      const COLLECTION_POINT_FOR_SCT = yieldRateGoStraightRateProcessForSct_Data.find((item) => item.PROCESS_ID == PROCESS_ID)?.COLLECTION_POINT_FOR_SCT

      if (COLLECTION_POINT_FOR_SCT === undefined) {
        throw new Error('OLD_SYSTEM_COLLECTION_POINT not found' + sct.PRODUCT_TYPE_CODE)
      }

      // generate sct_process_sequence_code
      const sctProcessSequenceCode = `${sct.PRODUCT_TYPE_CODE}-${sct.PRODUCT_MAIN_ALPHABET}-P${PROCESS_CODE.slice(-4)}`

      sqlList.push(
        await SctFlowProcessSequenceSQL.insert({
          SCT_ID: sct.SCT_ID,
          FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
          SCT_PROCESS_SEQUENCE_CODE: sctProcessSequenceCode,
          CREATE_BY: sct.CREATE_BY,
          UPDATE_BY: sct.UPDATE_BY,
          INUSE: 1,
          OLD_SYSTEM_COLLECTION_POINT: COLLECTION_POINT_FOR_SCT,
          OLD_SYSTEM_PROCESS_SEQUENCE_CODE: sctProcessSequenceCode,
          SCT_FLOW_PROCESS_SEQUENCE_ID: uuidv4(),
          IS_FROM_SCT_COPY: 0,
        })
      )
    }

    // insert : sct_flow_process_processing_cost_by_engineer
    sqlList.push(
      await SctFlowProcessProcessingCostByEngineerSQL.deleteBySctId({
        SCT_ID: sct.SCT_ID,
        IS_FROM_SCT_COPY: 0,
        UPDATE_BY: sct.UPDATE_BY,
      })
    )

    for (const flowProcess of FlowProcess_Data) {
      const { FLOW_PROCESS_ID, PROCESS_ID } = flowProcess

      const YIELD_RATE = yieldRateGoStraightRateProcessForSct_Data.find((item) => item.PROCESS_ID === PROCESS_ID)?.YIELD_RATE_FOR_SCT
      const YIELD_ACCUMULATION = yieldRateGoStraightRateProcessForSct_Data?.find((item) => item?.PROCESS_ID == PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
      const GO_STRAIGHT_RATE = yieldRateGoStraightRateProcessForSct_Data?.find((item) => item?.PROCESS_ID == PROCESS_ID)?.GO_STRAIGHT_RATE_FOR_SCT

      if (YIELD_RATE === undefined || YIELD_ACCUMULATION === undefined || GO_STRAIGHT_RATE === undefined) {
        throw new Error('YIELD_RATE or YIELD_ACCUMULATION or GO_STRAIGHT_RATE not found')
      }
      const SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID = uuidv4()
      sqlList.push(
        await SctFlowProcessProcessingCostByEngineerSQL.insert({
          SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID,
          SCT_ID: sct.SCT_ID,
          FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
          YIELD_RATE: YIELD_RATE,
          YIELD_ACCUMULATION: YIELD_ACCUMULATION,
          GO_STRAIGHT_RATE: GO_STRAIGHT_RATE,
          NOTE: '',
          CREATE_BY: sct.CREATE_BY,
          UPDATE_BY: sct.UPDATE_BY,
          IS_FROM_SCT_COPY: 0,
        })
      )
    }

    // insert : sct_flow_process_processing_cost_by_mfg
    sqlList.push(
      await SctFlowProcessProcessingCostByMfgSQL.deleteBySctId({
        SCT_ID: sct.SCT_ID,
        IS_FROM_SCT_COPY: 0,
        UPDATE_BY: sct.UPDATE_BY,
      })
    )
    for (const flowProcess of FlowProcess_Data) {
      const { FLOW_PROCESS_ID, PROCESS_ID, FLOW_ID } = flowProcess

      // from Engineer
      const YIELD_ACCUMULATION_FOR_SCT = Number(
        yieldRateGoStraightRateProcessForSct_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
      )
      const GO_STRAIGHT_RATE = Number(
        yieldRateGoStraightRateProcessForSct_Data?.find((item) => item.FLOW_ID == FLOW_ID && item?.PROCESS_ID == PROCESS_ID)?.GO_STRAIGHT_RATE_FOR_SCT
      )

      // from MFG
      const CLEAR_TIME = Number(clearTimeForSctProcess_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.CLEAR_TIME_FOR_SCT)

      if (isNaN(CLEAR_TIME) || CLEAR_TIME === undefined || YIELD_ACCUMULATION_FOR_SCT === undefined || GO_STRAIGHT_RATE === undefined) {
        throw new Error('CLEAR_TIME or YIELD_RATE or GO_STRAIGHT_RATE not found' + '-' + FLOW_ID + '-' + PROCESS_ID)
      }

      const ESSENTIAL_TIME = (CLEAR_TIME / YIELD_ACCUMULATION_FOR_SCT / GO_STRAIGHT_RATE) * 100 * 100

      const PROCESS_STANDARD_TIME =
        (CLEAR_TIME / YIELD_ACCUMULATION_FOR_SCT / GO_STRAIGHT_RATE) *
        100 *
        100 *
        (1 + (isNaN(INDIRECT_RATE_OF_DIRECT_PROCESS_COST) ? 0 : Number(INDIRECT_RATE_OF_DIRECT_PROCESS_COST)))

      sqlList.push(
        await SctFlowProcessProcessingCostByMfgSQL.insert({
          SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID: uuidv4(),
          SCT_ID: sct.SCT_ID,
          FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
          CLEAR_TIME: CLEAR_TIME,
          ESSENTIAL_TIME,
          PROCESS_STANDARD_TIME,
          NOTE: '',
          CREATE_BY: sct.CREATE_BY,
          UPDATE_BY: sct.UPDATE_BY,
          IS_FROM_SCT_COPY: 0,
        })
      )

      TOTAL_ESSENTIAL_TIME += ESSENTIAL_TIME
    }
    // insert : sct_processing_cost_by_engineer_total
    sqlList.push(
      await SctProcessingCostByEngineerTotalSQL.deleteBySctId({
        SCT_ID: sct.SCT_ID,
        IS_FROM_SCT_COPY: 0,
        UPDATE_BY: sct.UPDATE_BY,
      })
    )
    sqlList.push(
      await SctProcessingCostByEngineerTotalSQL.insert({
        SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID: uuidv4(),
        SCT_ID: sct.SCT_ID,
        TOTAL_YIELD_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_YIELD_RATE_FOR_SCT,
        TOTAL_GO_STRAIGHT_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
        CREATE_BY: sct.CREATE_BY,
        UPDATE_BY: sct.UPDATE_BY,
        INUSE: 1,
        IS_FROM_SCT_COPY: 0,
      })
    )
    // insert : sct_processing_cost_by_mfg_total
    sqlList.push(await SctProcessingCostByMfgTotalSQL.deleteBySctId({ SCT_ID: sct.SCT_ID, IS_FROM_SCT_COPY: 0, UPDATE_BY: sct.UPDATE_BY }))

    const TOTAL_CLEAR_TIME_FOR_SCT = clearTimeForSctTotal_Data?.[0].TOTAL_CLEAR_TIME_FOR_SCT
    // const TOTAL_ESSENTIAL_TIME_FOR_SCT = clearTimeForSctTotal_Data?.[0].TOTAL_ESSENTIAL_TIME_FOR_SCT

    if (TOTAL_CLEAR_TIME_FOR_SCT === undefined) {
      throw new Error('TOTAL_CLEAR_TIME_FOR_SCT or TOTAL_ESSENTIAL_TIME_FOR_SCT not found')
    }

    sqlList.push(
      await SctProcessingCostByMfgTotalSQL.insert({
        SCT_PROCESSING_COST_BY_MFG_TOTAL_ID: uuidv4(),
        SCT_ID: sct.SCT_ID,
        TOTAL_CLEAR_TIME: TOTAL_CLEAR_TIME_FOR_SCT,
        TOTAL_ESSENTIAL_TIME,
        CREATE_BY: sct.CREATE_BY,
        UPDATE_BY: sct.UPDATE_BY,
        INUSE: 1,
        IS_FROM_SCT_COPY: 0,
      })
    )

    // insert : sct_bom_flow_process_item_usage_price
    sqlList.push(
      await SctBomFlowProcessItemUsagePriceSQL.deleteBySctId({
        SCT_ID: sct.SCT_ID,
        IS_FROM_SCT_COPY: 0,
        UPDATE_BY: sct.UPDATE_BY,
      })
    )
    for (const materialPrice of MaterialPrice_Data) {
      const { FLOW_ID, PROCESS_ID } = materialPrice

      let yieldAccumulation: number
      let IS_ADJUST_YIELD_ACCUMULATION: number

      IS_ADJUST_YIELD_ACCUMULATION = 0

      if (!materialPrice.ITEM_CATEGORY_ID_FROM_BOM) {
        throw new Error('ITEM_CATEGORY_ID_FROM_BOM not found')
      }

      if (!materialPrice.ITEM_CODE_FOR_SUPPORT_MES) {
        throw new Error('ITEM_CODE_FOR_SUPPORT_MES not found')
      }

      // if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('CONSU')) {
      //   // TODO - Start with CONSU
      //   yieldAccumulation = 100
      // } else if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('C') && materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '5') {
      //   // TODO -  Start with  C & Consumable
      //   yieldAccumulation = 100
      // } else if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('R') && materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '5') {
      //   // TODO -  Start with  R & Consumable
      //   yieldAccumulation = 100
      // } else if (!!materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT === true) {
      //   // TODO -  Adjust Yield Accumulation from Engineer
      //   IS_ADJUST_YIELD_ACCUMULATION = 1
      //   yieldAccumulation = Number(materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT)
      // } else {
      //   // TODO - from Process
      //   yieldAccumulation = Number(yieldRateGoStraightRateProcessForSct_Data.find((item)
      //  => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT)
      // }

      // if (isNaN(yieldAccumulation)) {
      //   throw new Error('Yield accumulation is not a number' + FLOW_ID + '_' + PROCESS_ID + JSON.stringify(yieldRateGoStraightRateProcessForSct_Data))
      // }

      if (materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 5) {
        yieldAccumulation = 100
      } else if (
        materialPrice.ITEM_CODE_FOR_SUPPORT_MES.toUpperCase().startsWith('C') &&
        (materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 4 || materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 6)
      ) {
        yieldAccumulation = 100
      } else if (materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT) {
        // TODO -  Adjust Yield Accumulation from Engineer
        IS_ADJUST_YIELD_ACCUMULATION = 1
        yieldAccumulation = Number(materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT)
      } else {
        // TODO - from Process
        yieldAccumulation = Number(yieldRateGoStraightRateProcessForSct_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT)
      }

      if (isNaN(yieldAccumulation)) {
        throw new Error('Yield accumulation is not a number' + FLOW_ID + '_' + PROCESS_ID + JSON.stringify(yieldRateGoStraightRateProcessForSct_Data))
      }

      // 2 Semi-Finished Goods
      // 3 Sub-Assy
      let ITEM_M_S_PRICE_ID
      let AMOUNT = 0
      let PRICE = 0

      if (materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 2 || materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 3) {
        const sctPrice = listSctPrice.find((bomSubAssySemiFg) => bomSubAssySemiFg.PRODUCT_TYPE_ID === materialPrice.PRODUCT_TYPE_ID_FROM_ITEM)
        ITEM_M_S_PRICE_ID = sctPrice?.ITEM_M_S_PRICE_ID

        AMOUNT = (Number(materialPrice.USAGE_QUANTITY) * Number(sctPrice?.SELLING_PRICE)) / (yieldAccumulation / 100)
        PRICE = Number(sctPrice?.SELLING_PRICE)

        if (!ITEM_M_S_PRICE_ID) {
          throw new Error('ITEM_M_S_PRICE_ID not found' + JSON.stringify(listSctPrice) + materialPrice.ITEM_CODE_FOR_SUPPORT_MES + materialPrice.PRODUCT_TYPE_ID_FROM_ITEM)
        }
      } else {
        if (!materialPrice?.ITEM_M_S_PRICE_ID) {
          throw new Error('ITEM_M_S_PRICE_ID not found ' + materialPrice.ITEM_CODE_FOR_SUPPORT_MES)
        }

        ITEM_M_S_PRICE_ID = materialPrice.ITEM_M_S_PRICE_ID

        if (isNaN(Number(materialPrice.USAGE_QUANTITY))) {
          throw new Error('USAGE_QUANTITY is not a number' + JSON.stringify(materialPrice))
        }

        AMOUNT = (Number(materialPrice.USAGE_QUANTITY) * Number(materialPrice.ITEM_M_S_PRICE_VALUE)) / (yieldAccumulation / 100)
        PRICE = Number(materialPrice.ITEM_M_S_PRICE_VALUE)
      }

      sqlList.push(
        await SctBomFlowProcessItemUsagePriceSQL.insert({
          SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID: uuidv4(),
          SCT_ID: sct.SCT_ID,
          ITEM_M_S_PRICE_ID,
          CREATE_BY: sct.CREATE_BY,
          UPDATE_BY: sct.UPDATE_BY,
          INUSE: 1,
          AMOUNT,
          BOM_FLOW_PROCESS_ITEM_USAGE_ID: materialPrice.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
          IS_ADJUST_YIELD_ACCUMULATION,
          PRICE,
          YIELD_ACCUMULATION: yieldAccumulation,
          YIELD_ACCUMULATION_DEFAULT: Number(
            yieldRateGoStraightRateProcessForSct_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
          ),
          ADJUST_YIELD_ACCUMULATION_VERSION_NO: materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT_REVISION_NO,
          IS_FROM_SCT_COPY: 0,
        })
      )

      // Sum total Item Price

      // 1	Finished Goods
      // 2	Semi-Finished Goods
      // 3	Sub-Assy
      // 4	Raw Material
      // 5	Consumable
      // 6	Packing
      // 7	Spare Parts

      TOTAL_PRICE_OF_ALL_OF_ITEMS += AMOUNT
      TOTAL_PRICE_OF_CONSUMABLE += materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 5 ? AMOUNT : 0
      TOTAL_PRICE_OF_PACKING += materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 6 ? AMOUNT : 0
      TOTAL_PRICE_OF_RAW_MATERIAL += materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 4 ? AMOUNT : 0
      TOTAL_PRICE_OF_SEMI_FINISHED_GOODS += materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 2 ? AMOUNT : 0
      TOTAL_PRICE_OF_SUB_ASSY += materialPrice.ITEM_CATEGORY_ID_FROM_BOM === 3 ? AMOUNT : 0
    }

    // update ???? :sct_progress_working

    // update : sct_total_cost
    sqlList.push(
      await SctTotalCostSQL.deleteBySctId({
        SCT_ID: sct.SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
        IS_FROM_SCT_COPY: 0,
      })
    )

    const IMPORTED_FEE = costCondition_Data[4][0].IMPORT_FEE_RATE

    const SCT_TOTAL_COST_ID = uuidv4()
    const SCT_ID = sct.SCT_ID

    // Direct Cost

    const TOTAL_YIELD_RATE = yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_YIELD_RATE_FOR_SCT || 0
    const TOTAL_CLEAR_TIME = clearTimeForSctTotal_Data?.[0].TOTAL_CLEAR_TIME_FOR_SCT

    const TOTAL_GO_STRAIGHT_RATE = yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_GO_STRAIGHT_RATE_FOR_SCT || 0

    // Indirect Cost
    const DIRECT_UNIT_PROCESS_COST: number = Number(costCondition_Data[0][0].DIRECT_UNIT_PROCESS_COST)

    let INDIRECT_COST_SALE_AVE
    if (typeof sctDetailForAdjustment_Data?.[0]?.TOTAL_INDIRECT_COST === 'number') {
      INDIRECT_COST_SALE_AVE = sctDetailForAdjustment_Data?.[0]?.TOTAL_INDIRECT_COST
    } else {
      INDIRECT_COST_SALE_AVE = costCondition_Data?.[1][0].TOTAL_INDIRECT_COST
    }

    // const SELLING_EXPENSE = costCondition_Data?.[2][0].SELLING_EXPENSE / 100
    // const GA = costCondition_Data?.[2][0].GA / 100
    // const MARGIN = costCondition_Data?.[2][0].MARGIN / 100

    let SELLING_EXPENSE
    if (typeof sctDetailForAdjustment_Data?.[0]?.SELLING_EXPENSE === 'number') {
      SELLING_EXPENSE = sctDetailForAdjustment_Data?.[0]?.SELLING_EXPENSE / 100
    } else {
      SELLING_EXPENSE = costCondition_Data?.[2][0].SELLING_EXPENSE / 100
    }

    let GA
    if (typeof sctDetailForAdjustment_Data?.[0]?.GA === 'number') {
      GA = sctDetailForAdjustment_Data?.[0]?.GA / 100
    } else {
      GA = costCondition_Data?.[2][0].GA / 100
    }

    let MARGIN
    if (typeof sctDetailForAdjustment_Data?.[0]?.MARGIN === 'number') {
      MARGIN = sctDetailForAdjustment_Data?.[0]?.MARGIN / 100
    } else {
      MARGIN = costCondition_Data?.[2][0].MARGIN / 100
    }
    const TOTAL_PROCESSING_TIME: number = TOTAL_ESSENTIAL_TIME / 60 // Please check
    const TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: number =
      TOTAL_PROCESSING_TIME * (1 + (isNaN(Number(INDIRECT_RATE_OF_DIRECT_PROCESS_COST)) ? 0 : INDIRECT_RATE_OF_DIRECT_PROCESS_COST))

    const DIRECT_PROCESS_COST: number = TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE * (isNaN(DIRECT_UNIT_PROCESS_COST) ? 1 : DIRECT_UNIT_PROCESS_COST)
    const TOTAL_DIRECT_COST: number = TOTAL_PRICE_OF_ALL_OF_ITEMS + DIRECT_PROCESS_COST

    const IMPORTED_COST_DEFAULT = 0 // skip
    const IS_ADJUST_IMPORTED_COST = 0 // skip
    const IMPORTED_COST = 0 // skip

    const RM_INCLUDE_IMPORTED_COST = Number(TOTAL_PRICE_OF_RAW_MATERIAL) + Number(TOTAL_PRICE_OF_SUB_ASSY) + Number(TOTAL_PRICE_OF_SEMI_FINISHED_GOODS) + Number(IMPORTED_COST)

    const CONSUMABLE_PACKING = Number(TOTAL_PRICE_OF_CONSUMABLE) + Number(TOTAL_PRICE_OF_PACKING)

    const MATERIALS_COST = Number(RM_INCLUDE_IMPORTED_COST) + CONSUMABLE_PACKING

    const TOTAL = Number(MATERIALS_COST) + Number(DIRECT_PROCESS_COST)
    const GA_FOR_SELLING_PRICE = (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE)) * (Number(GA) || 0)
    const SELLING_EXPENSE_FOR_SELLING_PRICE = (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE)) * (Number(SELLING_EXPENSE) || 0)

    // Selling Price
    const MARGIN_FOR_SELLING_PRICE =
      (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE) + (Number(SELLING_EXPENSE_FOR_SELLING_PRICE) || 0) + (Number(GA_FOR_SELLING_PRICE) || 0)) * (Number(MARGIN) || 0)

    //const VAT = sctDetailForAdjustment_Data?.[0]?.VAT ?? costCondition_Data?.[2][0].VAT

    let VAT
    if (typeof sctDetailForAdjustment_Data?.[0]?.VAT === 'number') {
      VAT = sctDetailForAdjustment_Data?.[0]?.VAT
    } else {
      VAT = costCondition_Data?.[2][0].VAT
    }

    const VAT_FOR_SELLING_PRICE = sctDetailForAdjustment_Data?.[0]?.VAT ?? 0

    let CIT
    if (typeof sctDetailForAdjustment_Data?.[0]?.CIT === 'number') {
      CIT = sctDetailForAdjustment_Data?.[0]?.CIT / 100
    } else {
      CIT = costCondition_Data?.[2][0].CIT / 100
    }

    //const CIT: number = Number(costCondition_Data?.[2][0].CIT) / 100
    const CIT_FOR_SELLING_PRICE: number = Number(CIT) * MARGIN_FOR_SELLING_PRICE

    // console.log(CIT, CIT_FOR_SELLING_PRICE)

    // const ADJUST_PRICE = sctDetailForAdjustment_Data?.[0]?.ADJUST_PRICE ?? costCondition_Data?.[3][0].ADJUST_PRICE ?? 0

    let ADJUST_PRICE
    if (typeof sctDetailForAdjustment_Data?.[0]?.ADJUST_PRICE === 'number') {
      ADJUST_PRICE = sctDetailForAdjustment_Data?.[0]?.ADJUST_PRICE
    } else {
      ADJUST_PRICE = costCondition_Data[3] && costCondition_Data[3][0] ? costCondition_Data[3][0].ADJUST_PRICE : 0
    }

    const ESTIMATE_PERIOD_START_DATE = sct.ESTIMATE_PERIOD_START_DATE || ''
    const ESTIMATE_PERIOD_END_DATE = sct.ESTIMATE_PERIOD_END_DATE || ''

    const REMARK_FOR_ADJUST_PRICE = sctDetailForAdjustment_Data?.[0]?.REMARK_FOR_ADJUST_PRICE ?? ''

    const SELLING_PRICE_BY_FORMULA =
      Number(TOTAL) +
      (Number(INDIRECT_COST_SALE_AVE) || 0) +
      (Number(SELLING_EXPENSE_FOR_SELLING_PRICE) || 0) +
      (Number(GA_FOR_SELLING_PRICE) || 0) +
      (Number(MARGIN_FOR_SELLING_PRICE) || 0) +
      (Number(CIT_FOR_SELLING_PRICE) || 0) +
      (Number(VAT_FOR_SELLING_PRICE) || 0)

    SELLING_PRICE = Math.round(SELLING_PRICE_BY_FORMULA + Number(ADJUST_PRICE))

    const TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST = TOTAL_PRICE_OF_ALL_OF_ITEMS + IMPORTED_COST

    const RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS = Number(TOTAL_PRICE_OF_RAW_MATERIAL) + Number(TOTAL_PRICE_OF_SUB_ASSY) + Number(TOTAL_PRICE_OF_SEMI_FINISHED_GOODS)

    const ASSEMBLY_GROUP_FOR_SUPPORT_MES = `${sct.PRODUCT_MAIN_ALPHABET}${sct.PRODUCT_SUB_ALPHABET}${sct.ITEM_CATEGORY_ALPHABET}1`

    sqlList.push(
      await StandardCostForProductSQL.updateUpdateByUpdateDate({
        SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
      })
    )

    sqlList.push(
      await SctTotalCostSQL.deleteBySctId({
        SCT_ID,
        IS_FROM_SCT_COPY: 0,
        UPDATE_BY: sct.UPDATE_BY,
      })
    )

    // SctMasterDataHistory

    sqlList.push(
      await SctMasterDataHistorySQL.deleteBySctIdAndIsFromSctCopy({
        IS_FROM_SCT_COPY: 0,
        SCT_ID: sct.SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
      })
    )

    // 1. Direct Cost Condition
    sqlList.push(
      await SctMasterDataHistorySQL.insert({
        CREATE_BY: sct.CREATE_BY,
        FISCAL_YEAR: sct.FISCAL_YEAR,
        INUSE: 1,
        IS_FROM_SCT_COPY: 0,
        SCT_ID: sct.SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
        VERSION_NO: costCondition_Data[0][0].VERSION,
        SCT_MASTER_DATA_SETTING_ID: 1,
      })
    )

    // 2. Indirect Cost Condition
    sqlList.push(
      await SctMasterDataHistorySQL.insert({
        CREATE_BY: sct.CREATE_BY,
        FISCAL_YEAR: sct.FISCAL_YEAR,
        INUSE: 1,
        IS_FROM_SCT_COPY: 0,
        SCT_ID: sct.SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
        VERSION_NO: costCondition_Data[1][0].VERSION,
        SCT_MASTER_DATA_SETTING_ID: 2,
      })
    )

    // 3. Other Cost Condition
    sqlList.push(
      await SctMasterDataHistorySQL.insert({
        CREATE_BY: sct.CREATE_BY,
        FISCAL_YEAR: sct.FISCAL_YEAR,
        INUSE: 1,
        IS_FROM_SCT_COPY: 0,
        SCT_ID: sct.SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
        VERSION_NO: costCondition_Data[2][0].VERSION,
        SCT_MASTER_DATA_SETTING_ID: 3,
      })
    )

    // 4. Special Cost Condition
    sqlList.push(
      await SctMasterDataHistorySQL.insert({
        CREATE_BY: sct.CREATE_BY,
        FISCAL_YEAR: sct.FISCAL_YEAR,
        INUSE: 1,
        IS_FROM_SCT_COPY: 0,
        SCT_ID: sct.SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
        VERSION_NO: costCondition_Data[3][0].VERSION,
        SCT_MASTER_DATA_SETTING_ID: 4,
      })
    )

    // 5. Yield Rate & Go Straight Rate
    sqlList.push(
      await SctMasterDataHistorySQL.insert({
        CREATE_BY: sct.CREATE_BY,
        FISCAL_YEAR: sct.FISCAL_YEAR,
        INUSE: 1,
        IS_FROM_SCT_COPY: 0,
        SCT_ID: sct.SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
        VERSION_NO: yieldRateGoStraightRateTotalForSct_Data[0].REVISION_NO,
        SCT_MASTER_DATA_SETTING_ID: 5,
      })
    )

    // 6. Clear Time
    sqlList.push(
      await SctMasterDataHistorySQL.insert({
        CREATE_BY: sct.CREATE_BY,
        FISCAL_YEAR: sct.FISCAL_YEAR,
        INUSE: 1,
        IS_FROM_SCT_COPY: 0,
        SCT_ID: sct.SCT_ID,
        UPDATE_BY: sct.UPDATE_BY,
        VERSION_NO: clearTimeForSctTotal_Data[0].REVISION_NO,
        SCT_MASTER_DATA_SETTING_ID: 6,
      })
    )

    sqlList.push(
      await SctTotalCostSQL.insert({
        SCT_TOTAL_COST_ID,
        SCT_ID,
        TOTAL_YIELD_RATE,
        TOTAL_CLEAR_TIME,
        TOTAL_ESSENTIAL_TIME,
        TOTAL_GO_STRAIGHT_RATE,
        DIRECT_UNIT_PROCESS_COST,
        INDIRECT_RATE_OF_DIRECT_PROCESS_COST: INDIRECT_RATE_OF_DIRECT_PROCESS_COST * 100,
        INDIRECT_COST_SALE_AVE,
        IMPORTED_FEE,
        SELLING_EXPENSE: SELLING_EXPENSE * 100,
        GA: GA * 100,
        MARGIN: MARGIN * 100,
        VAT,
        VAT_FOR_SELLING_PRICE,
        CIT: CIT * 100,
        CIT_FOR_SELLING_PRICE,
        TOTAL_PROCESSING_TIME,
        TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE,
        DIRECT_PROCESS_COST,
        MARGIN_FOR_SELLING_PRICE,
        TOTAL_DIRECT_COST,
        CREATE_BY: sct.CREATE_BY,
        UPDATE_BY: sct.UPDATE_BY,
        INUSE: 1,
        ADJUST_PRICE,
        ESTIMATE_PERIOD_START_DATE,
        ESTIMATE_PERIOD_END_DATE,

        REMARK_FOR_ADJUST_PRICE,
        SELLING_PRICE,
        SELLING_PRICE_BY_FORMULA,
        TOTAL,
        TOTAL_PRICE_OF_ALL_OF_ITEMS,
        TOTAL_PRICE_OF_CONSUMABLE,
        TOTAL_PRICE_OF_PACKING,
        TOTAL_PRICE_OF_RAW_MATERIAL,
        TOTAL_PRICE_OF_SEMI_FINISHED_GOODS,
        TOTAL_PRICE_OF_SUB_ASSY,
        SELLING_EXPENSE_FOR_SELLING_PRICE,
        CONSUMABLE_PACKING,
        GA_FOR_SELLING_PRICE,
        IMPORTED_COST,
        IMPORTED_COST_DEFAULT,
        IS_ADJUST_IMPORTED_COST,
        MATERIALS_COST,
        RM_INCLUDE_IMPORTED_COST,
        TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST,
        RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS,
        ASSEMBLY_GROUP_FOR_SUPPORT_MES,
        IS_FROM_SCT_COPY: 0,
      })
    )

    const ITEM_M_O_PRICE_ID = uuidv4()
    ITEM_M_S_PRICE_ID = uuidv4()

    if (sct.ITEM_CATEGORY_ID != 1) {
      //

      if (!!sct.ITEM_ID === false) {
        throw new Error('ITEM_ID not found in Menu : Item Master - ' + sct.PRODUCT_TYPE_CODE)
      }
      // FG
      sqlList.push(
        await StandardPriceSQL.ItemMOPrice_updateIsCurrentByFiscalYearAndItemCode({
          FISCAL_YEAR: sct.FISCAL_YEAR,
          ITEM_CODE_FOR_SUPPORT_MES: sct.PRODUCT_TYPE_CODE,
          SCT_PATTERN_ID: sct.SCT_PATTERN_ID,
        })
      )

      sqlList.push(
        await ItemManufacturingOriginalPriceSQL.create({
          CREATE_BY: sct.CREATE_BY,
          ITEM_ID: sct.ITEM_ID,
          ITEM_M_O_PRICE_ID: ITEM_M_O_PRICE_ID,
          PURCHASE_PRICE: SELLING_PRICE,
          PURCHASE_PRICE_CURRENCY_ID: '7', // THB
          PURCHASE_PRICE_UNIT_ID: '1', // Piece
          FISCAL_YEAR: sct.FISCAL_YEAR,
          SCT_PATTERN_ID: sct.SCT_PATTERN_ID,
          ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID: 3, // by Standard Cost Calculation
          IS_CURRENT: 1,
        })
      )

      sqlList.push(
        await StandardPriceSQL.ItemMSPrice_updateIsCurrentByFiscalYearAndItemCode({
          FISCAL_YEAR: sct.FISCAL_YEAR,
          ITEM_CODE_FOR_SUPPORT_MES: sct.PRODUCT_TYPE_CODE,
          SCT_PATTERN_ID: sct.SCT_PATTERN_ID,
        })
      )

      const EXCHANGE_RATE_ID = await ExchangeRateService.getLatestExchangeRate({
        FISCAL_YEAR: sct.FISCAL_YEAR,
      })
        .then((res) => {
          return res.filter((res) => res.CURRENCY_SYMBOL === 'THB')[0].EXCHANGE_RATE_ID
        })
        .catch((err) => {
          throw new Error(err)
        })

      sqlList.push(
        await ItemManufacturingStandardPriceSQL.create({
          CREATE_BY: sct.CREATE_BY,
          ITEM_ID: sct.ITEM_ID,
          ITEM_M_S_PRICE_ID,
          EXCHANGE_RATE_ID, // THB,
          FISCAL_YEAR: sct.FISCAL_YEAR,
          IMPORT_FEE_ID: '',
          ITEM_M_O_PRICE_ID: ITEM_M_O_PRICE_ID,
          ITEM_M_S_PRICE_VALUE: SELLING_PRICE,
          PURCHASE_UNIT_RATIO: 1,
          PURCHASE_UNIT_ID: '1', // Piece
          USAGE_UNIT_RATIO: 1,
          USAGE_UNIT_ID: '1', // Piece
          ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: 5, // by Standard Cost Calculation
          SCT_PATTERN_ID: sct.SCT_PATTERN_ID,
          IS_CURRENT: 1,
        })
      )

      sqlList.push(
        await ItemManufacturingStandardPriceSctSQL.create({
          ITEM_M_S_PRICE_ID: ITEM_M_S_PRICE_ID,
          ITEM_M_S_PRICE_SCT_ID: uuidv4(),
          SCT_ID: sct.SCT_ID,
          CREATE_BY: sct.CREATE_BY,
        })
      )
    }

    listSql.push(...sqlList)
  } else {
    //Completed , Checking , Waiting Approve , Can use
    console.log('Data Stamp : ', sct.PRODUCT_TYPE_CODE)

    const result_getLastSellingBySctId = await _SctForProductService.getLastSellingBySctId({
      SCT_ID: sct.SCT_ID,
    })

    const latest = result_getLastSellingBySctId.reduce((prev, curr) => (new Date(prev.CREATE_DATE) > new Date(curr.CREATE_DATE) ? prev : curr))

    if (!latest) {
      throw new Error('SCT + Selling Price มีมากกว่า 1 รายการ' + sct.SCT_REVISION_CODE)
    }

    if (!latest.ITEM_M_S_PRICE_ID) {
      throw new Error('ITEM_M_S_PRICE_ID not found' + sct.SCT_REVISION_CODE)
    }

    if (!latest.ITEM_M_S_PRICE_VALUE) {
      throw new Error('SELLING_PRICE not found' + sct.SCT_REVISION_CODE)
    }

    ITEM_M_S_PRICE_ID = latest.ITEM_M_S_PRICE_ID
    SELLING_PRICE = latest.ITEM_M_S_PRICE_VALUE
  }

  listSctPrice.push({
    SCT_ID: sct.SCT_ID,
    PRODUCT_TYPE_ID: sct.PRODUCT_TYPE_ID,
    ITEM_M_S_PRICE_ID,
    SELLING_PRICE,
  })
}

// ฟังก์ชันจัดกลุ่มตาม Level
const groupDataByLevel = (data: Record<string, number>): Record<number, string[]> => {
  return Object.entries(data).reduce(
    (acc, [key, level]) => {
      if (!acc[level]) acc[level] = []
      acc[level].push(key)
      return acc
    },
    {} as Record<number, string[]>
  )
}

const processByLevel = async (
  data: Record<string, number>,
  listBomSubAssySemiFg: BomSubAssySemiFg_Type[],
  listSql: string[],
  listSctPrice: { SCT_ID: string; PRODUCT_TYPE_ID: number; SELLING_PRICE: number; ITEM_M_S_PRICE_ID: string }[]
): Promise<void> => {
  const groupedData = groupDataByLevel(data)

  const levels = Object.keys(groupedData)
    .map(Number)
    .sort((a, b) => b - a)

  for (const level of levels) {
    //console.log(`Processing Level ${level}`)
    const tasks = groupedData[level].map((key) => processTask(key, level, listBomSubAssySemiFg, listSql, listSctPrice))
    await Promise.all(tasks)
    //console.log(`Completed Level ${level}`)
  }
}
