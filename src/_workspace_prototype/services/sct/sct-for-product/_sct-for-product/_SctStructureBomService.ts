// Mysql2 Imports
import { RowDataPacket } from 'mysql2'

// Business Data Imports
import { MySQLExecute } from '@businessData/dbExecute'

// Types Imports
import { ResponseI } from '@src/types/ResponseI'

// SQL Imports
import { BomSQL } from '@src/_workspace/sql/bom/BomSQL'
import { ItemProductDetailSQL } from '@src/_workspace/sql/item/ItemProductDetailSQL'

import { SctSQL } from '@src/_workspace/sql/sct/sct-for-product/SctSQL'

import { ProductTypeBomSQL } from '@src/_workspace/sql/product-group/product-type/ProductTypeBomSQL'

type BomSubAssySemiFg_Type = {
  BOM_ID: string
  FLOW_ID: string
  BOM_CODE: string
  SCT_ID: string
  SCT_REVISION_CODE: string
  FISCAL_YEAR: number
  SCT_PATTERN_ID: number
  SCT_REASON_SETTING_ID: number

  SCT_STATUS_PROGRESS_ID: number

  SCT_TAG_SETTING_ID: number

  PRODUCT_TYPE_ID: string
  PRODUCT_SUB_ID: string
  PRODUCT_MAIN_ID: string
  PRODUCT_CATEGORY_ID: string

  PRODUCT_TYPE_CODE: string
  PRODUCT_TYPE_NAME: string
  PRODUCT_SUB_NAME: string
  PRODUCT_MAIN_NAME: string
  PRODUCT_MAIN_ALPHABET: string
  PRODUCT_CATEGORY_NAME: string
  ITEM_CATEGORY_ID: string

  PRODUCT_SUB_ALPHABET: string
  ITEM_CATEGORY_ALPHABET: string

  ITEM_ID: string

  CREATE_BY: string
  UPDATE_BY: string

  ITEM_CATEGORY_NAME: string

  PARENT: any[]
}

const getBomDetailByBomId = async (dataItem: BomSubAssySemiFg_Type, listBomSubAssySemiFg: BomSubAssySemiFg_Type[]): Promise<void> => {
  const sql = await BomSQL.getBomDetailByBomId({ BOM_ID: dataItem.BOM_ID })
  const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

  if (resultData.length === 0) {
    return
  }

  // Filter items with ITEM_CATEGORY_ID_FOR_BOM as 2 or 3
  const filteredBom = resultData.filter((item) => item.ITEM_CATEGORY_ID_FOR_BOM === 2 || item.ITEM_CATEGORY_ID_FOR_BOM === 3)

  // Recursively call getBomDetailByBomId for each filtered item
  for (const item of filteredBom) {
    const ItemProductDetail_sql = await ItemProductDetailSQL.getByItemId(item)
    const ItemProductDetail_data = (await MySQLExecute.search(ItemProductDetail_sql)) as {
      PRODUCT_TYPE_ID: string
      PRODUCT_SUB_ID: string
      PRODUCT_MAIN_ID: string
      PRODUCT_CATEGORY_ID: string
      PRODUCT_TYPE_NAME: string
      PRODUCT_TYPE_CODE: string
      PRODUCT_SUB_NAME: string
      PRODUCT_MAIN_NAME: string
      PRODUCT_MAIN_ALPHABET: string
      PRODUCT_CATEGORY_NAME: string
      ITEM_ID: string
      ITEM_CATEGORY_ID: string
      PRODUCT_SUB_ALPHABET: string
      ITEM_CATEGORY_ALPHABET: string
      ITEM_CATEGORY_NAME: string
    }[]
    if (ItemProductDetail_data.length === 0) {
      continue
    }

    const sct_sql = await ProductTypeBomSQL.getSctByProductTypeId({
      PRODUCT_TYPE_ID: ItemProductDetail_data[0].PRODUCT_TYPE_ID,
      SCT_REASON_SETTING_ID: 1, // Budget
      SCT_TAG_SETTING_ID: 1, // Budget
      SCT_STATUS_PROGRESS_ID: 3, // Prepared
      FISCAL_YEAR: dataItem.FISCAL_YEAR,
      SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
    })

    const sct_data = (await MySQLExecute.search(sct_sql)) as {
      FLOW_ID: string
      BOM_ID: string
      BOM_CODE: string

      // Subquery
      SCT_ID: string | null
      SCT_REVISION_CODE: string | null
      FISCAL_YEAR: number | null
      SCT_PATTERN_ID: number | null
      ESTIMATE_PERIOD_START_DATE: string | null
      ESTIMATE_PERIOD_END_DATE: string | null
      PRODUCT_TYPE_ID: string | null
    }[]

    //console.log(sct_sql, sct_data)

    if (sct_data.length === 0) {
      console.log(sct_sql)
      console.log(ItemProductDetail_sql)

      throw new Error('No BOM data : ' + dataItem.PRODUCT_TYPE_CODE + '=>' + ItemProductDetail_data?.[0].PRODUCT_TYPE_CODE)

      //console.log('No SCT data : Prepared found')
      //return
    }

    if (sct_data.length > 1) {
      throw new Error('SCT data : Prepared มีมากกว่า 1 รายการ')
    }

    const simplifiedBom = sct_data.map(
      (item) =>
        ({
          SCT_ID: item.SCT_ID,
          FISCAL_YEAR: item.FISCAL_YEAR,
          SCT_PATTERN_ID: item.SCT_PATTERN_ID,
          SCT_REVISION_CODE: item.SCT_REVISION_CODE,
          BOM_ID: item.BOM_ID,
          FLOW_ID: item.FLOW_ID,
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
          BOM_CODE: item.BOM_CODE,
          CREATE_BY: dataItem.CREATE_BY,
          UPDATE_BY: dataItem.UPDATE_BY,
        }) as BomSubAssySemiFg_Type
    )

    const existingItem = listBomSubAssySemiFg.find((bomSubAssySemiFg) => bomSubAssySemiFg.SCT_ID === item.SCT_ID)
    if (existingItem) {
      existingItem.PARENT.push(dataItem)
    } else {
      listBomSubAssySemiFg.push(...simplifiedBom)
    }

    await getBomDetailByBomId(
      {
        BOM_ID: sct_data[0].BOM_ID,
        FLOW_ID: sct_data[0].FLOW_ID,
        SCT_ID: sct_data[0].SCT_ID ?? '',
        FISCAL_YEAR: sct_data[0].FISCAL_YEAR ?? dataItem.FISCAL_YEAR,
        SCT_PATTERN_ID: sct_data[0].SCT_PATTERN_ID ?? dataItem.SCT_PATTERN_ID,
        SCT_REVISION_CODE: sct_data[0].SCT_REVISION_CODE ?? '',

        PRODUCT_TYPE_ID: ItemProductDetail_data[0].PRODUCT_TYPE_ID,

        PRODUCT_SUB_ID: ItemProductDetail_data[0].PRODUCT_SUB_ID,
        PRODUCT_MAIN_ID: ItemProductDetail_data[0].PRODUCT_MAIN_ID,
        PRODUCT_CATEGORY_ID: ItemProductDetail_data[0].PRODUCT_CATEGORY_ID,

        SCT_STATUS_PROGRESS_ID: dataItem.SCT_STATUS_PROGRESS_ID,

        ITEM_CATEGORY_ID: ItemProductDetail_data[0].ITEM_CATEGORY_ID,
        SCT_REASON_SETTING_ID: 1, // Budget
        SCT_TAG_SETTING_ID: 1, // Budget
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
export const _SctStructureBomService = {
  checkBomLevelNotHaveSct: async (dataItem: any): Promise<ResponseI> => {
    const { ITEM_CATEGORY_ID, SCT_STATUS_PROGRESS_ID, SCT_PATTERN_ID, FISCAL_YEAR, SCT_TAG_SETTING_ID, CREATE_BY, UPDATE_BY } = dataItem

    if (!SCT_STATUS_PROGRESS_ID || !SCT_PATTERN_ID || !FISCAL_YEAR || !SCT_TAG_SETTING_ID || !CREATE_BY || !UPDATE_BY) {
      return {
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'calculateSellPriceAllFg : getAllSctFgBySctProgressId',
        Message: 'ITEM_CATEGORY_ID or SCT_STATUS_PROGRESS_ID or SCT_PATTERN_ID or FISCAL_YEAR not found or SCT_TAG_SETTING_ID or CREATE_BY or UPDATE_BY',
      }
    }

    // const resultData = (await MySQLExecute.search(await SctSQL.getSctWithoutSellingPrice())) as {
    //   SCT_ID: string
    //   SCT_REVISION_CODE: string
    // }[]

    const resultData = (await MySQLExecute.search(
      await SctSQL.calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId({
        ITEM_CATEGORY_ID,
        SCT_STATUS_PROGRESS_ID,
        SCT_PATTERN_ID,
        FISCAL_YEAR,
        SCT_TAG_SETTING_ID,
      })
    )) as {
      SCT_ID: string
      SCT_REVISION_CODE: string
    }[]

    // const listSql = []
    // for (let i = 0; i < resultData.length; i++) {
    //   const element = resultData[i]
    //   console.log(`${i + 1} Start : ${element.SCT_REVISION_CODE}`)
    //   const result = await checkBomByFgStructure({ SCT_REVISION_CODE: element.SCT_REVISION_CODE, CREATE_BY, UPDATE_BY, SCT_STATUS_PROGRESS_ID })
    //   console.log(`${i + 1} Finished : ${result.MethodOnDb}`)
    // }

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

export async function checkBomByFgStructure(dataItem: { SCT_REVISION_CODE: string; CREATE_BY: string; UPDATE_BY: string; SCT_STATUS_PROGRESS_ID: number }): Promise<ResponseI> {
  const listBomSubAssySemiFg: BomSubAssySemiFg_Type[] = []

  const sqlSct = await SctSQL.getBySctId(dataItem)

  const resultDataSct = (await MySQLExecute.search(sqlSct)) as {
    SCT_ID: string
    SCT_REVISION_CODE: string
    CREATE_BY: string
    CREATE_DATE: string
    UPDATE_BY: string
    UPDATE_DATE: string
    INUSE: number
    SCT_STATUS_PROGRESS_ID: string
    SCT_STATUS_PROGRESS_NO: string
    SCT_STATUS_PROGRESS_NAME: string
    PRODUCT_TYPE_ID: string
    PRODUCT_SUB_ID: string
    PRODUCT_MAIN_ID: string
    PRODUCT_CATEGORY_ID: string
    PRODUCT_TYPE_CODE: string
    PRODUCT_TYPE_NAME: string
    PRODUCT_SUB_NAME: string
    PRODUCT_MAIN_NAME: string
    PRODUCT_MAIN_ALPHABET: string
    PRODUCT_CATEGORY_NAME: string
    FISCAL_YEAR: number
    PRODUCT_SPECIFICATION_TYPE_NAME: string
    BOM_ID: string
    BOM_CODE: string
    BOM_NAME: string
    FLOW_ID: string
    FLOW_CODE: string
    FLOW_NAME: string
    SCT_PATTERN_ID: number
    SCT_PATTERN_NAME: string
    ESTIMATE_PERIOD_START_DATE: string
    ESTIMATE_PERIOD_END_DATE: string
    ITEM_CATEGORY_ID: string
    ITEM_CATEGORY_NAME: string
    SCT_REASON_SETTING_ID: string
    SCT_REASON_SETTING_NAME: string
    SCT_TAG_SETTING_ID: string
    SCT_TAG_SETTING_NAME: string
    ITEM_ID: string
    ITEM_CATEGORY_ALPHABET: string
    PRODUCT_SUB_ALPHABET: string
  }[]

  if (resultDataSct.length === 0) {
    return {
      Status: false,
      ResultOnDb: [],
      TotalCountOnDb: 0,
      MethodOnDb: 'calculateSellPriceByFgStructure : getBySctId',
      Message: 'No SCT data found',
    }
  }

  if (!resultDataSct[0].ITEM_CATEGORY_ID) {
    return {
      Status: false,
      ResultOnDb: [],
      TotalCountOnDb: 0,
      MethodOnDb: 'calculateSellPriceByFgStructure : getBySctId',
      Message: 'ITEM_CATEGORY_ID not found',
    }
  }

  // if (resultDataSct[0].ITEM_CATEGORY_ID == '1') {
  if (resultDataSct[0].SCT_REASON_SETTING_ID == '1' && resultDataSct[0].SCT_TAG_SETTING_ID == '1') {
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

        SCT_STATUS_PROGRESS_ID: dataItem.SCT_STATUS_PROGRESS_ID,

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

      SCT_STATUS_PROGRESS_ID: dataItem.SCT_STATUS_PROGRESS_ID,

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

      PARENT: [],
    })
    // if (listBomSubAssySemiFg.length === 0) {
    //   throw new Error('No BOM data found')
    // }

    const listSctLevel = calculateLevels(listBomSubAssySemiFg)

    // console.error(Object.values(listSctLevel).find((product) => product.productTypeId === null))

    //const listSctLevel = calculateLevels3(listBomSubAssySemiFg)
    //console.log(listSctLevel)

    // const listSql: string[] = []
    // const listSctPrice: { SCT_ID: string; PRODUCT_TYPE_ID: string; SELLING_PRICE: number; ITEM_M_S_PRICE_ID: string }[] = []

    await processByLevel(listSctLevel, listBomSubAssySemiFg)

    //console.log(listSql)

    //await MySQLExecute.executeList(listSql)

    //console.log(resultDataSct[0]?.SCT_ID, ' ', resultDataSct[0]?.SCT_REVISION_CODE + ' => Finished')

    //return listSql
    return {
      Status: true,
      // ResultOnDb: listBomSubAssySemiFg.map((dataItem) => {
      //   return {
      //     PRODUCT_TYPE_CODE: dataItem.PRODUCT_TYPE_CODE,
      //     SCT_ID: dataItem.SCT_ID,
      //     PARENT: dataItem.PARENT.map((parent) => {
      //       return { PRODUCT_TYPE_CODE: parent.PRODUCT_TYPE_CODE, SCT_ID: parent.SCT_ID }
      //     }),
      //   }
      // }),
      //ResultOnDb: listBomSubAssySemiFg,
      //ResultOnDb: resultDataSct[0]?.SCT_REVISION_CODE,
      ResultOnDb: [],

      TotalCountOnDb: listBomSubAssySemiFg.length,
      MethodOnDb: `${dataItem.SCT_REVISION_CODE} 🐱`,
      Message: 'Success',
    }
  } else {
    throw new Error('Reason & Tag Budget only')
  }
  // } else {
  //   throw new Error('FG only')
  // }
}

function calculateLevels(nodes: BomSubAssySemiFg_Type[]): Record<
  string,
  {
    level: number
    productTypeId: number
    productTypeCode: string
  }
> {
  const levels: Record<
    string,
    {
      level: number
      productTypeId: number
      productTypeCode: string
    }
  > = {}
  const unresolved = new Set(nodes.map((node) => node.SCT_ID))

  while (unresolved.size > 0) {
    for (const node of nodes) {
      //if (!unresolved.has(node.SCT_ID)) continue

      const parentIds = node.PARENT.map((p: any) => p.SCT_ID)
      if (parentIds.every((parentId: any) => levels[parentId] !== undefined)) {
        const newLevel = Math.max(0, ...parentIds.map((parentId: any) => levels[parentId].level)) + 1

        if (typeof levels[node.SCT_ID] === 'undefined' || levels[node.SCT_ID].level < newLevel) {
          levels[node.SCT_ID] = { level: newLevel, productTypeId: Number(node.PRODUCT_TYPE_ID), productTypeCode: node.PRODUCT_TYPE_CODE }
          //console.log(node.PRODUCT_TYPE_CODE, newLevel, levels[node.SCT_ID])
        }

        unresolved.delete(node.SCT_ID)
      }
    }
  }

  return levels
}

// ฟังก์ชันจำลองงานแต่ละตัว
const processTask = async (
  key: {
    level: number
    productTypeId: number
    key: string
  },
  level: number,
  listBomSubAssySemiFg: BomSubAssySemiFg_Type[]
  // listSql: string[],
  // listSctPrice: { SCT_ID: string; PRODUCT_TYPE_ID: string; SELLING_PRICE: number; ITEM_M_S_PRICE_ID: string }[]
): Promise<void> => {
  //console.log(`Start processing: Key=${key}, Level=${level}`)
  //await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000)) // จำลองเวลา

  //console.log(listBomSubAssySemiFg)

  const sct = listBomSubAssySemiFg?.find((bomSubAssySemiFg) => Number(bomSubAssySemiFg.PRODUCT_TYPE_ID) === key.productTypeId)
  //console.log(sct)

  if (typeof sct === 'undefined') {
    //console.log(listBomSubAssySemiFg)

    throw new Error('SCT not found')
  }

  if (sct?.SCT_ID) {
    console.log(key.level, sct.PRODUCT_TYPE_CODE)
  }
  // console.log(bom)

  // const { FISCAL_YEAR, ITEM_CATEGORY_NAME, PRODUCT_MAIN_ID, PRODUCT_MAIN_NAME } = sct

  // if (!ITEM_CATEGORY_NAME || !PRODUCT_MAIN_ID || !PRODUCT_MAIN_NAME) {
  //   throw new Error('FISCAL_YEAR or ITEM_CATEGORY_NAME or PRODUCT_MAIN_ID or PRODUCT_MAIN_NAME not found')
  // }

  // console.log(FISCAL_YEAR)

  // // TODO : get data from DB
  // // getCostConditionData
  // const costCondition_Data = await _CostConditionService.getAllByProductMainIdAndFiscalYear_MasterDataLatest({
  //   FISCAL_YEAR,
  //   ITEM_CATEGORY_NAME,
  //   PRODUCT_MAIN_ID,
  //   PRODUCT_MAIN_NAME,
  // })

  // // getYrGrData
  // const yieldRateGoStraightRateProcessForSct_Data =
  //   (await YieldRateGoStraightRateProcessForSctService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
  //     PROCESS_ID: number
  //     YIELD_RATE_FOR_SCT: number
  //     YIELD_ACCUMULATION_FOR_SCT: number
  //     GO_STRAIGHT_RATE_FOR_SCT: number
  //     COLLECTION_POINT_FOR_SCT: number
  //     FLOW_ID: number
  //   }[]
  // const yieldRateGoStraightRateTotalForSct_Data =
  //   (await YieldRateGoStraightRateTotalForSctService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
  //     TOTAL_YIELD_RATE_FOR_SCT: number
  //     TOTAL_GO_STRAIGHT_RATE_FOR_SCT: number
  //   }[]

  // // getTimeData
  // const clearTimeForSctProcess_Data = (await ClearTimeForSctProcessService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
  //   PROCESS_ID: number
  //   FLOW_ID: number
  //   CLEAR_TIME_FOR_SCT: number
  // }[]

  // const clearTimeForSctTotal_Data = (await ClearTimeForSctTotalService.getByProductTypeIdAndFiscalYearAndSctReasonSettingIdAndSctTagSettingId_MasterDataLatest(sct)) as {
  //   TOTAL_CLEAR_TIME_FOR_SCT: number
  // }[]

  // // getMaterialPriceData
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
  //   ITEM_CATEGORY_ID_FROM_BOM: string
  //   PRODUCT_TYPE_ID_FROM_ITEM: string
  //   ITEM_CODE_FOR_SUPPORT_MES: string
  // }[]
  // // "PRODUCT_TYPE_ID": 264,
  // if (sct?.SCT_PATTERN_ID === 1) {
  //   // P2

  //   const { BOM_ID, FISCAL_YEAR, PRODUCT_TYPE_ID } = sct

  //   // if (PRODUCT_TYPE_ID == '1143') {
  //   //   console.log('PRODUCT_TYPE_ID', PRODUCT_TYPE_ID, 'BOM_ID', BOM_ID, 'FISCAL_YEAR', Number(sct.FISCAL_YEAR) - 1)
  //   // }
  //   if (typeof BOM_ID === 'undefined' || typeof FISCAL_YEAR === 'undefined' || typeof PRODUCT_TYPE_ID === 'undefined') {
  //     throw new Error('BOM_ID or FISCAL_YEAR or PRODUCT_TYPE_ID not found')
  //   }

  //   MaterialPrice_Data = (await _SctForProductService.getSctBomItemItemPriceByBomIdAndFiscalYear_MasterDataLatest({
  //     BOM_ID,
  //     FISCAL_YEAR: Number(sct.FISCAL_YEAR) - 1, // P2
  //     PRODUCT_TYPE_ID,
  //   })) as {
  //     BOM_ID: string
  //     PURCHASE_PRICE: number
  //     BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
  //     ITEM_M_S_PRICE_VALUE: number
  //     PURCHASE_PRICE_CURRENCY_ID: string
  //     PURCHASE_PRICE_CURRENCY: string
  //     PURCHASE_PRICE_UNIT_ID: string
  //     PURCHASE_UNIT: string
  //     ITEM_M_S_PRICE_ID: string
  //     ITEM_ID: string
  //     IMPORT_FEE_RATE: number
  //     YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
  //     FLOW_PROCESS_ID: number
  //     FLOW_ID: number
  //     USAGE_QUANTITY: number
  //     PROCESS_ID: number
  //     ITEM_CATEGORY_ID_FROM_BOM: string
  //     PRODUCT_TYPE_ID_FROM_ITEM: string
  //     ITEM_CODE_FOR_SUPPORT_MES: string
  //   }[]
  // } else if (sct?.SCT_PATTERN_ID === 2) {
  //   // P3

  //   const { BOM_ID, FISCAL_YEAR, PRODUCT_TYPE_ID } = sct

  //   if (typeof BOM_ID === 'undefined' || typeof FISCAL_YEAR === 'undefined' || typeof PRODUCT_TYPE_ID === 'undefined') {
  //     throw new Error('BOM_ID or FISCAL_YEAR or PRODUCT_TYPE_ID not found')
  //   }

  //   MaterialPrice_Data = (await _SctForProductService.getSctBomItemItemPriceByBomIdAndFiscalYear_MasterDataLatest({
  //     BOM_ID,
  //     FISCAL_YEAR,
  //     PRODUCT_TYPE_ID,
  //   })) as {
  //     BOM_ID: string
  //     PURCHASE_PRICE: number
  //     BOM_FLOW_PROCESS_ITEM_USAGE_ID: string
  //     ITEM_M_S_PRICE_VALUE: number
  //     PURCHASE_PRICE_CURRENCY_ID: string
  //     PURCHASE_PRICE_CURRENCY: string
  //     PURCHASE_PRICE_UNIT_ID: string
  //     PURCHASE_UNIT: string
  //     ITEM_M_S_PRICE_ID: string
  //     ITEM_ID: string
  //     IMPORT_FEE_RATE: number
  //     YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: number
  //     FLOW_PROCESS_ID: number
  //     FLOW_ID: number
  //     USAGE_QUANTITY: number
  //     PROCESS_ID: number
  //     ITEM_CATEGORY_ID_FROM_BOM: string
  //     PRODUCT_TYPE_ID_FROM_ITEM: string
  //     ITEM_CODE_FOR_SUPPORT_MES: string
  //   }[]
  // } else {
  //   throw new Error('SCT_PATTERN_ID not found')
  // }

  // // getYrAccumulationMaterialData
  // // ?? include to getMaterialPriceData

  // // getSctDetailForAdjustment
  // const sctDetailForAdjustment_Data = (await SctDetailForAdjustService.getBySctId(sct)) as {
  //   SCT_DETAIL_FOR_ADJUST_ID: string
  //   SCT_ID: string
  //   TOTAL_INDIRECT_COST: number
  //   CIT: number
  //   VAT: number
  //   DESCRIPTION: string
  //   CREATE_BY: string
  //   CREATE_DATE: Date
  //   UPDATE_BY: string
  //   UPDATE_DATE: Date
  //   INUSE: number
  // }[]

  // // getSctTotalCost
  // const sctTotalCost_Data = (await SctTotalCostService.getBySctId(sct)) as {
  //   SCT_ID: string
  //   ADJUST_PRICE: number
  //   REMARK_FOR_ADJUST_PRICE: string
  //   NOTE: string
  //   CIT_FOR_SELLING_PRICE: number
  //   VAT_FOR_SELLING_PRICE: number
  //   ESTIMATE_PERIOD_START_DATE: string
  //   ESTIMATE_PERIOD_END_DATE: string
  // }[]

  // // console.log(
  // //   costCondition_Data,
  // //   yieldRateGoStraightRateProcessForSct_Data,
  // //   yieldRateGoStraightRateTotalForSct_Data,
  // //   clearTimeForSctProcess_Data,
  // //   clearTimeForSctTotal_Data,
  // //   MaterialPrice_Data,
  // //   sctDetailForAdjustment_Data
  // // )

  // // TODO : insert data to DB
  // const sqlList = []

  // let TOTAL_PRICE_OF_ALL_OF_ITEMS: number = 0
  // let TOTAL_PRICE_OF_CONSUMABLE: number = 0
  // let TOTAL_PRICE_OF_PACKING: number = 0
  // let TOTAL_PRICE_OF_RAW_MATERIAL: number = 0
  // let TOTAL_PRICE_OF_SEMI_FINISHED_GOODS: number = 0
  // let TOTAL_PRICE_OF_SUB_ASSY: number = 0

  // let TOTAL_ESSENTIAL_TIME: number = 0

  // const INDIRECT_RATE_OF_DIRECT_PROCESS_COST = Number(costCondition_Data[0][0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST) / 100

  // // get flow process
  // const FlowProcess_Data = (await FlowProcessService.getByFlowId(sct)) as {
  //   NO: number
  //   FLOW_PROCESS_ID: number
  //   PROCESS_ID: number
  //   PROCESS_NAME: string
  //   PROCESS_CODE: string
  //   FLOW_ID: number
  // }[]

  // // ?? insert : sct_flow_process_sequence
  // // delete : sct_flow_process_sequence
  // sqlList.push(await SctFlowProcessSequenceSQL.deleteBySctId(sct))

  // // insert : sct_flow_process_sequence
  // for (const flowProcess of FlowProcess_Data) {
  //   const { FLOW_PROCESS_ID, PROCESS_CODE, PROCESS_ID } = flowProcess

  //   const COLLECTION_POINT_FOR_SCT = yieldRateGoStraightRateProcessForSct_Data.find((item) => item.PROCESS_ID == PROCESS_ID)?.COLLECTION_POINT_FOR_SCT

  //   if (COLLECTION_POINT_FOR_SCT === undefined) {
  //     throw new Error('OLD_SYSTEM_COLLECTION_POINT not found')
  //   }

  //   // generate sct_process_sequence_code
  //   const sctProcessSequenceCode = `${sct.PRODUCT_TYPE_CODE}-${sct.PRODUCT_MAIN_ALPHABET}-P${PROCESS_CODE.slice(-4)}`

  //   sqlList.push(
  //     await SctFlowProcessSequenceSQL.insert({
  //       SCT_ID: sct.SCT_ID,
  //       FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
  //       SCT_PROCESS_SEQUENCE_CODE: sctProcessSequenceCode,
  //       CREATE_BY: sct.CREATE_BY,
  //       UPDATE_BY: sct.UPDATE_BY,
  //       INUSE: 1,
  //       OLD_SYSTEM_COLLECTION_POINT: COLLECTION_POINT_FOR_SCT,
  //       OLD_SYSTEM_PROCESS_SEQUENCE_CODE: sctProcessSequenceCode,
  //       SCT_FLOW_PROCESS_SEQUENCE_ID: uuidv7(),
  //     })
  //   )
  // }

  // // insert : sct_flow_process_processing_cost_by_engineer
  // sqlList.push(await SctFlowProcessProcessingCostByEngineerSQL.deleteBySctId(sct))

  // for (const flowProcess of FlowProcess_Data) {
  //   const { FLOW_PROCESS_ID, PROCESS_ID } = flowProcess

  //   const YIELD_RATE = yieldRateGoStraightRateProcessForSct_Data.find((item) => item.PROCESS_ID === PROCESS_ID)?.YIELD_RATE_FOR_SCT
  //   const YIELD_ACCUMULATION = yieldRateGoStraightRateProcessForSct_Data?.find((item) => item?.PROCESS_ID == PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
  //   const GO_STRAIGHT_RATE = yieldRateGoStraightRateProcessForSct_Data?.find((item) => item?.PROCESS_ID == PROCESS_ID)?.GO_STRAIGHT_RATE_FOR_SCT

  //   if (YIELD_RATE === undefined || YIELD_ACCUMULATION === undefined || GO_STRAIGHT_RATE === undefined) {
  //     throw new Error('YIELD_RATE or YIELD_ACCUMULATION or GO_STRAIGHT_RATE not found')
  //   }
  //   const SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID = uuidv7()
  //   sqlList.push(
  //     await SctFlowProcessProcessingCostByEngineerSQL.insert({
  //       SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER_ID,
  //       SCT_ID: sct.SCT_ID,
  //       FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
  //       YIELD_RATE: YIELD_RATE,
  //       YIELD_ACCUMULATION: YIELD_ACCUMULATION,
  //       GO_STRAIGHT_RATE: GO_STRAIGHT_RATE,
  //       NOTE: '',
  //       CREATE_BY: sct.CREATE_BY,
  //       UPDATE_BY: sct.UPDATE_BY,
  //       INUSE: 1,
  //     })
  //   )
  // }

  // // insert : sct_flow_process_processing_cost_by_mfg
  // sqlList.push(await SctFlowProcessProcessingCostByMfgSQL.deleteBySctId(sct))
  // for (const flowProcess of FlowProcess_Data) {
  //   const { FLOW_PROCESS_ID, PROCESS_ID, FLOW_ID } = flowProcess

  //   // from Engineer
  //   const YIELD_ACCUMULATION_FOR_SCT = Number(
  //     yieldRateGoStraightRateProcessForSct_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
  //   )
  //   const GO_STRAIGHT_RATE = Number(yieldRateGoStraightRateProcessForSct_Data?.find((item) => item.FLOW_ID == FLOW_ID
  //  && item?.PROCESS_ID == PROCESS_ID)?.GO_STRAIGHT_RATE_FOR_SCT)

  //   // from MFG
  //   const CLEAR_TIME = Number(clearTimeForSctProcess_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.CLEAR_TIME_FOR_SCT)

  //   if (CLEAR_TIME === undefined || YIELD_ACCUMULATION_FOR_SCT === undefined || GO_STRAIGHT_RATE === undefined) {
  //     throw new Error('CLEAR_TIME or YIELD_RATE or GO_STRAIGHT_RATE not found')
  //   }

  //   const ESSENTIAL_TIME = (CLEAR_TIME / YIELD_ACCUMULATION_FOR_SCT / GO_STRAIGHT_RATE) * 100 * 100

  //   const PROCESS_STANDARD_TIME =
  //     (CLEAR_TIME / YIELD_ACCUMULATION_FOR_SCT / GO_STRAIGHT_RATE) *
  //     100 *
  //     100 *
  //     (1 + (isNaN(INDIRECT_RATE_OF_DIRECT_PROCESS_COST) ? 0 : Number(INDIRECT_RATE_OF_DIRECT_PROCESS_COST)))

  //   sqlList.push(
  //     await SctFlowProcessProcessingCostByMfgSQL.insert({
  //       SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG_ID: uuidv7(),
  //       SCT_ID: sct.SCT_ID,
  //       FLOW_PROCESS_ID: FLOW_PROCESS_ID.toString(),
  //       CLEAR_TIME: CLEAR_TIME,
  //       ESSENTIAL_TIME,
  //       PROCESS_STANDARD_TIME,
  //       NOTE: '',
  //       CREATE_BY: sct.CREATE_BY,
  //       UPDATE_BY: sct.UPDATE_BY,
  //       INUSE: '1',
  //     })
  //   )

  //   TOTAL_ESSENTIAL_TIME += ESSENTIAL_TIME
  // }
  // // insert : sct_processing_cost_by_engineer_total
  // sqlList.push(await SctProcessingCostByEngineerTotalSQL.deleteBySctId(sct))
  // sqlList.push(
  //   await SctProcessingCostByEngineerTotalSQL.insert({
  //     SCT_PROCESSING_COST_BY_ENGINEER_TOTAL_ID: uuidv7(),
  //     SCT_ID: sct.SCT_ID,
  //     TOTAL_YIELD_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_YIELD_RATE_FOR_SCT,
  //     TOTAL_GO_STRAIGHT_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_GO_STRAIGHT_RATE_FOR_SCT,
  //     CREATE_BY: sct.CREATE_BY,
  //     UPDATE_BY: sct.UPDATE_BY,
  //     INUSE: 1,
  //   })
  // )
  // // insert : sct_processing_cost_by_mfg_total
  // sqlList.push(await SctProcessingCostByMfgTotalSQL.deleteBySctId(sct))

  // const TOTAL_CLEAR_TIME_FOR_SCT = clearTimeForSctTotal_Data?.[0].TOTAL_CLEAR_TIME_FOR_SCT
  // // const TOTAL_ESSENTIAL_TIME_FOR_SCT = clearTimeForSctTotal_Data?.[0].TOTAL_ESSENTIAL_TIME_FOR_SCT

  // if (TOTAL_CLEAR_TIME_FOR_SCT === undefined) {
  //   throw new Error('TOTAL_CLEAR_TIME_FOR_SCT or TOTAL_ESSENTIAL_TIME_FOR_SCT not found')
  // }

  // sqlList.push(
  //   await SctProcessingCostByMfgTotalSQL.insert({
  //     SCT_PROCESSING_COST_BY_MFG_TOTAL_ID: uuidv7(),
  //     SCT_ID: sct.SCT_ID,
  //     TOTAL_CLEAR_TIME: TOTAL_CLEAR_TIME_FOR_SCT,
  //     TOTAL_ESSENTIAL_TIME,
  //     CREATE_BY: sct.CREATE_BY,
  //     UPDATE_BY: sct.UPDATE_BY,
  //     INUSE: 1,
  //   })
  // )

  // // insert : sct_bom_flow_process_item_usage_price
  // sqlList.push(await SctBomFlowProcessItemUsagePriceSQL.deleteBySctId(sct))
  // for (const materialPrice of MaterialPrice_Data) {
  //   const { FLOW_ID, PROCESS_ID } = materialPrice

  //   // console.log(materialPrice)

  //   let yieldAccumulation: number
  //   let IS_ADJUST_YIELD_ACCUMULATION: number

  //   if (!!materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT === true) {
  //     // Adjust Yield Accumulation
  //     IS_ADJUST_YIELD_ACCUMULATION = 1
  //     yieldAccumulation = Number(materialPrice.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT)
  //   } else {
  //     IS_ADJUST_YIELD_ACCUMULATION = 0

  //     if (materialPrice.ITEM_CODE_FOR_SUPPORT_MES.startsWith('CONSU')) {
  //       yieldAccumulation = 100
  //     } else {
  //       yieldAccumulation = Number(yieldRateGoStraightRateProcessForSct_Data.find((item) => item.FLOW_ID == FLOW_ID
  // && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT)
  //     }
  //   }

  //   if (isNaN(yieldAccumulation)) {
  //     throw new Error('Yield accumulation is not a number' + FLOW_ID + '_' + PROCESS_ID + JSON.stringify(yieldRateGoStraightRateProcessForSct_Data))
  //   }

  //   //const AMOUNT = Number(materialPrice.ITEM_M_S_PRICE_VALUE) * (1 + (1 - yieldAccumulation / 100)) * Number(materialPrice.USAGE_QUANTITY)

  //   // 2 Semi-Finished Goods
  //   // 3 Sub-Assy
  //   let ITEM_M_S_PRICE_ID
  //   let AMOUNT = 0
  //   let PRICE = 0

  //   if (materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '2' || materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '3') {
  //     const sctPrice = listSctPrice.find((bomSubAssySemiFg) => bomSubAssySemiFg.PRODUCT_TYPE_ID === materialPrice.PRODUCT_TYPE_ID_FROM_ITEM)
  //     ITEM_M_S_PRICE_ID = sctPrice?.ITEM_M_S_PRICE_ID

  //     //AMOUNT = Number(sctPrice?.SELLING_PRICE) * (1 + (1 - yieldAccumulation / 100)) * Number(materialPrice.USAGE_QUANTITY)
  //     AMOUNT = (Number(materialPrice.USAGE_QUANTITY) * Number(sctPrice?.SELLING_PRICE)) / (yieldAccumulation / 100)
  //     PRICE = Number(sctPrice?.SELLING_PRICE)
  //     //console.log('AMOUNT', AMOUNT, 'USAGE_QUANTITY', materialPrice.USAGE_QUANTITY)

  //     if (!ITEM_M_S_PRICE_ID) {
  //       //console.log('ITEM_M_S_PRICE_ID not found')

  //       //return
  //       throw new Error('ITEM_M_S_PRICE_ID not found' + JSON.stringify(listSctPrice) + materialPrice.PRODUCT_TYPE_ID_FROM_ITEM)
  //     }
  //   } else {
  //     if (!materialPrice?.ITEM_M_S_PRICE_ID) {
  //       throw new Error('ITEM_M_S_PRICE_ID not found')
  //     }

  //     ITEM_M_S_PRICE_ID = materialPrice.ITEM_M_S_PRICE_ID

  //     if (isNaN(Number(materialPrice.USAGE_QUANTITY))) {
  //       throw new Error('USAGE_QUANTITY is not a number' + JSON.stringify(materialPrice))
  //     }

  //     AMOUNT = (Number(materialPrice.USAGE_QUANTITY) * Number(materialPrice.ITEM_M_S_PRICE_VALUE)) / (yieldAccumulation / 100)
  //     //AMOUNT = Number(materialPrice.ITEM_M_S_PRICE_VALUE) * (1 + (1 - yieldAccumulation / 100)) * Number(materialPrice.USAGE_QUANTITY)
  //     PRICE = Number(materialPrice.ITEM_M_S_PRICE_VALUE)
  //   }
  //   // if (sct.SCT_ID == 'cabdd790-62fa-e790-2224-6a19c7eec070') {
  //   //   console.log(ITEM_M_S_PRICE_ID, materialPrice.BOM_FLOW_PROCESS_ITEM_USAGE_ID, materialPrice.BOM_ID, materialPrice.ITEM_ID)
  //   // }
  //   sqlList.push(
  //     await SctBomFlowProcessItemUsagePriceSQL.insert({
  //       SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ID: uuidv7(),
  //       SCT_ID: sct.SCT_ID,
  //       ITEM_M_S_PRICE_ID,
  //       CREATE_BY: sct.CREATE_BY,
  //       UPDATE_BY: sct.UPDATE_BY,
  //       INUSE: 1,
  //       AMOUNT,
  //       BOM_FLOW_PROCESS_ITEM_USAGE_ID: materialPrice.BOM_FLOW_PROCESS_ITEM_USAGE_ID,
  //       IS_ADJUST_YIELD_ACCUMULATION,
  //       PRICE,
  //       YIELD_ACCUMULATION: yieldAccumulation,
  //       YIELD_ACCUMULATION_DEFAULT: Number(
  //         yieldRateGoStraightRateProcessForSct_Data.find((item) => item.FLOW_ID == FLOW_ID && item.PROCESS_ID === PROCESS_ID)?.YIELD_ACCUMULATION_FOR_SCT
  //       ),
  //     })
  //   )

  //   // Sum total Item Price

  //   // 1	Finished Goods
  //   // 2	Semi-Finished Goods
  //   // 3	Sub-Assy
  //   // 4	Raw Material
  //   // 5	Consumable
  //   // 6	Packing
  //   // 7	Spare Parts

  //   TOTAL_PRICE_OF_ALL_OF_ITEMS += AMOUNT
  //   TOTAL_PRICE_OF_CONSUMABLE += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '5' ? AMOUNT : 0
  //   TOTAL_PRICE_OF_PACKING += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '6' ? AMOUNT : 0
  //   TOTAL_PRICE_OF_RAW_MATERIAL += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '4' ? AMOUNT : 0
  //   TOTAL_PRICE_OF_SEMI_FINISHED_GOODS += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '2' ? AMOUNT : 0
  //   TOTAL_PRICE_OF_SUB_ASSY += materialPrice.ITEM_CATEGORY_ID_FROM_BOM == '3' ? AMOUNT : 0
  // }

  // // update ???? :sct_progress_working

  // // update : sct_total_cost
  // sqlList.push(await SctTotalCostSQL.deleteBySctId(sct))

  // const IMPORTED_FEE = costCondition_Data[4][0].IMPORT_FEE_RATE

  // const SCT_TOTAL_COST_ID = uuidv7()
  // const SCT_ID = sct.SCT_ID

  // // Direct Cost

  // const TOTAL_YIELD_RATE = yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_YIELD_RATE_FOR_SCT || 0
  // const TOTAL_CLEAR_TIME = clearTimeForSctTotal_Data?.[0].TOTAL_CLEAR_TIME_FOR_SCT

  // const TOTAL_GO_STRAIGHT_RATE = yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_GO_STRAIGHT_RATE_FOR_SCT || 0

  // // Indirect Cost
  // const DIRECT_UNIT_PROCESS_COST: number = Number(costCondition_Data[0][0].DIRECT_UNIT_PROCESS_COST)

  // const INDIRECT_COST_SALE_AVE = sctDetailForAdjustment_Data?.[0]?.TOTAL_INDIRECT_COST ?? costCondition_Data?.[1]?.[0]?.TOTAL_INDIRECT_COST // can adjust

  // // const SELLING_EXPENSE = costCondition_Data?.[2][0].SELLING_EXPENSE / 100
  // // const GA = costCondition_Data?.[2][0].GA / 100
  // // const MARGIN = costCondition_Data?.[2][0].MARGIN / 100

  // const SELLING_EXPENSE = costCondition_Data?.[2][0].SELLING_EXPENSE / 100
  // const GA = costCondition_Data?.[2][0].GA / 100
  // const MARGIN = costCondition_Data?.[2][0].MARGIN / 100

  // const TOTAL_PROCESSING_TIME: number = TOTAL_ESSENTIAL_TIME / 60 // Please check
  // const TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE: number =
  //   TOTAL_PROCESSING_TIME * (1 + (isNaN(Number(INDIRECT_RATE_OF_DIRECT_PROCESS_COST)) ? 0 : INDIRECT_RATE_OF_DIRECT_PROCESS_COST))

  // const DIRECT_PROCESS_COST: number = TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE * (isNaN(DIRECT_UNIT_PROCESS_COST) ? 1 : DIRECT_UNIT_PROCESS_COST)
  // const TOTAL_DIRECT_COST: number = TOTAL_PRICE_OF_ALL_OF_ITEMS + DIRECT_PROCESS_COST

  // const IMPORTED_COST_DEFAULT = 0 // skip
  // const IS_ADJUST_IMPORTED_COST = 0 // skip
  // const IMPORTED_COST = 0 // skip

  // const RM_INCLUDE_IMPORTED_COST = Number(TOTAL_PRICE_OF_RAW_MATERIAL) + Number(TOTAL_PRICE_OF_SUB_ASSY) + Number(TOTAL_PRICE_OF_SEMI_FINISHED_GOODS) + Number(IMPORTED_COST)

  // const CONSUMABLE_PACKING = Number(TOTAL_PRICE_OF_CONSUMABLE) + Number(TOTAL_PRICE_OF_PACKING)

  // const MATERIALS_COST = Number(RM_INCLUDE_IMPORTED_COST) + CONSUMABLE_PACKING

  // const TOTAL = Number(MATERIALS_COST) + Number(DIRECT_PROCESS_COST)
  // const GA_FOR_SELLING_PRICE = (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE)) * (Number(GA) || 0)
  // const SELLING_EXPENSE_FOR_SELLING_PRICE = (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE)) * (Number(SELLING_EXPENSE) || 0)

  // // Selling Price
  // const MARGIN_FOR_SELLING_PRICE =
  //   (Number(TOTAL) + Number(INDIRECT_COST_SALE_AVE) + (Number(SELLING_EXPENSE_FOR_SELLING_PRICE) || 0) + (Number(GA_FOR_SELLING_PRICE) || 0)) * (Number(MARGIN) || 0)

  // const VAT = costCondition_Data?.[2][0].VAT
  // const VAT_FOR_SELLING_PRICE = sctDetailForAdjustment_Data?.[0]?.VAT || 0
  // const CIT: number = Number(costCondition_Data?.[2][0].CIT) / 100
  // const CIT_FOR_SELLING_PRICE: number = CIT * MARGIN_FOR_SELLING_PRICE

  // const ADJUST_PRICE = Number(sctTotalCost_Data?.[0]?.ADJUST_PRICE) ?? 0

  // const ESTIMATE_PERIOD_START_DATE = sctTotalCost_Data?.[0]?.ESTIMATE_PERIOD_START_DATE || ''
  // const ESTIMATE_PERIOD_END_DATE = sctTotalCost_Data?.[0]?.ESTIMATE_PERIOD_END_DATE || ''

  // const NOTE = sctTotalCost_Data?.[0]?.NOTE || ''
  // const REMARK_FOR_ADJUST_PRICE = sctTotalCost_Data?.[0]?.REMARK_FOR_ADJUST_PRICE || ''

  // const SELLING_PRICE_BY_FORMULA =
  //   Number(TOTAL) +
  //   (Number(INDIRECT_COST_SALE_AVE) || 0) +
  //   (Number(SELLING_EXPENSE_FOR_SELLING_PRICE) || 0) +
  //   (Number(GA_FOR_SELLING_PRICE) || 0) +
  //   (Number(MARGIN_FOR_SELLING_PRICE) || 0) +
  //   (Number(CIT_FOR_SELLING_PRICE) || 0) +
  //   (Number(VAT_FOR_SELLING_PRICE) || 0)

  // const SELLING_PRICE = Math.round(SELLING_PRICE_BY_FORMULA + ADJUST_PRICE)

  // const TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST = TOTAL_PRICE_OF_ALL_OF_ITEMS + IMPORTED_COST

  // const RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS = Number(TOTAL_PRICE_OF_RAW_MATERIAL) + Number(TOTAL_PRICE_OF_SUB_ASSY) + Number(TOTAL_PRICE_OF_SEMI_FINISHED_GOODS)

  // const ASSEMBLY_GROUP_FOR_SUPPORT_MES = `${sct.PRODUCT_MAIN_ALPHABET}${sct.PRODUCT_SUB_ALPHABET}${sct.ITEM_CATEGORY_ALPHABET}1`

  // sqlList.push(
  //   await SctTotalCostSQL.insert({
  //     SCT_TOTAL_COST_ID,
  //     SCT_ID,
  //     TOTAL_YIELD_RATE,
  //     TOTAL_CLEAR_TIME,
  //     TOTAL_ESSENTIAL_TIME,
  //     TOTAL_GO_STRAIGHT_RATE,
  //     DIRECT_UNIT_PROCESS_COST,
  //     INDIRECT_RATE_OF_DIRECT_PROCESS_COST: INDIRECT_RATE_OF_DIRECT_PROCESS_COST * 100,
  //     INDIRECT_COST_SALE_AVE,
  //     IMPORTED_FEE,
  //     SELLING_EXPENSE: SELLING_EXPENSE * 100,
  //     GA: GA * 100,
  //     MARGIN: MARGIN * 100,
  //     VAT,
  //     VAT_FOR_SELLING_PRICE,
  //     CIT: CIT * 100,
  //     CIT_FOR_SELLING_PRICE,
  //     TOTAL_PROCESSING_TIME,
  //     TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE,
  //     DIRECT_PROCESS_COST,
  //     MARGIN_FOR_SELLING_PRICE,
  //     TOTAL_DIRECT_COST,
  //     CREATE_BY: sct.CREATE_BY,
  //     UPDATE_BY: sct.UPDATE_BY,
  //     INUSE: 1,
  //     ADJUST_PRICE,
  //     ESTIMATE_PERIOD_START_DATE,
  //     ESTIMATE_PERIOD_END_DATE,
  //     NOTE,
  //     REMARK_FOR_ADJUST_PRICE,
  //     SELLING_PRICE,
  //     SELLING_PRICE_BY_FORMULA,
  //     TOTAL,
  //     TOTAL_PRICE_OF_ALL_OF_ITEMS,
  //     TOTAL_PRICE_OF_CONSUMABLE,
  //     TOTAL_PRICE_OF_PACKING,
  //     TOTAL_PRICE_OF_RAW_MATERIAL,
  //     TOTAL_PRICE_OF_SEMI_FINISHED_GOODS,
  //     TOTAL_PRICE_OF_SUB_ASSY,
  //     SELLING_EXPENSE_FOR_SELLING_PRICE,
  //     CONSUMABLE_PACKING,
  //     GA_FOR_SELLING_PRICE,
  //     IMPORTED_COST,
  //     IMPORTED_COST_DEFAULT,
  //     IS_ADJUST_IMPORTED_COST,
  //     MATERIALS_COST,
  //     RM_INCLUDE_IMPORTED_COST,
  //     TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST,
  //     RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS,
  //     ASSEMBLY_GROUP_FOR_SUPPORT_MES,
  //   })
  // )

  // const ITEM_M_O_PRICE_ID = uuidv7()
  // const ITEM_M_S_PRICE_ID = uuidv7()

  // //sqlList.push(await ItemManufacturingStandardPriceSctSQL.deleteBySctId(sct))

  // if (sct.ITEM_CATEGORY_ID != '1') {
  //   //

  //   // FG
  //   //sqlList.push(await ItemManufacturingOriginalPriceSQL.deleteBySctId(sct))
  //   sqlList.push(
  //     await ItemManufacturingOriginalPriceSQL.create({
  //       CREATE_BY: sct.CREATE_BY,
  //       ITEM_ID: sct.ITEM_ID,
  //       ITEM_M_O_PRICE_ID: ITEM_M_O_PRICE_ID,
  //       PURCHASE_PRICE: SELLING_PRICE,
  //       PURCHASE_PRICE_CURRENCY_ID: '7', // THB
  //       PURCHASE_PRICE_UNIT_ID: '1', // Piece
  //       FISCAL_YEAR: sct.FISCAL_YEAR,
  //     })
  //   )

  //   //sqlList.push(await ItemManufacturingStandardPriceSQL.deleteBySctId(sct))
  //   sqlList.push(
  //     await ItemManufacturingStandardPriceSQL.create({
  //       CREATE_BY: sct.CREATE_BY,
  //       ITEM_ID: sct.ITEM_ID,
  //       ITEM_M_S_PRICE_ID,
  //       EXCHANGE_RATE_ID: '7', // THB,
  //       FISCAL_YEAR: sct.FISCAL_YEAR,
  //       IMPORT_FEE_ID: '',
  //       ITEM_M_O_PRICE_ID: ITEM_M_O_PRICE_ID,
  //       ITEM_M_S_PRICE_VALUE: SELLING_PRICE,
  //       PURCHASE_UNIT_RATIO: 1,
  //       PURCHASE_UNIT_ID: '1', // Piece
  //       USAGE_UNIT_RATIO: 1,
  //       USAGE_UNIT_ID: '1', // Piece
  //     })
  //   )

  //   //sqlList.push(await ItemManufacturingStandardPriceSctSQL.deleteBySctId(sct))

  //   sqlList.push(
  //     await ItemManufacturingStandardPriceSctSQL.create({
  //       ITEM_M_S_PRICE_ID: ITEM_M_S_PRICE_ID,
  //       ITEM_M_S_PRICE_SCT_ID: uuidv7(),
  //       SCT_ID: sct.SCT_ID,
  //       CREATE_BY: sct.CREATE_BY,
  //     })
  //   )
  // }

  // //   // Header
  // //   SCT_TOTAL_COST_ID: uuidv7(),
  // //   SCT_ID: sct.SCT_ID,

  // //   // Direct Cost
  // //   TOTAL_YIELD_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_YIELD.toString(),
  // //   TOTAL_CLEAR_TIME: clearTimeForSctTotal_Data?.[0].TOTAL_CLEAR_TIME.toString(),
  // //   TOTAL_ESSENTIAL_TIME: clearTimeForSctTotal_Data?.[0].TOTAL_ESSENTIAL_TIME.toString(),
  // //   TOTAL_GO_STRAIGHT_RATE: yieldRateGoStraightRateTotalForSct_Data?.[0].TOTAL_GO_STRAIGHT_RATE.toString(),

  // //   // Indirect Cost
  // //   DIRECT_UNIT_PROCESS_COST: costCondition_Data[0][0].DIRECT_UNIT_PROCESS_COST,
  // //   INDIRECT_RATE_OF_DIRECT_PROCESS_COST: costCondition_Data[0][0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
  // //   INDIRECT_COST_SALE_AVE: sctDetailForAdjustment_Data?.[0]?.TOTAL_INDIRECT_COST || costCondition_Data[0][0].TOTAL_INDIRECT_COST, // can adjust
  // //   IMPORTED_FEE,
  // //   SELLING_EXPENSE: costCondition_Data?.[2][0].SELLING_EXPENSE,
  // //   GA: costCondition_Data?.[2][0].GA,
  // //   MARGIN: costCondition_Data?.[2][0].MARGIN,

  // //   VAT: costCondition_Data?.[2][0].VAT,
  // //   VAT_FOR_SELLING_PRICE: sctDetailForAdjustment_Data?.[0]?.VAT || '',
  // //   CIT: costCondition_Data?.[2][0].CIT,
  // //   CIT_FOR_SELLING_PRICE: costCondition_Data?.[2][0].CIT_FOR_SELLING_PRICE,

  // //   TOTAL_PROCESSING_TIME: clearTimeForSctTotal_Data?.[0].TOTAL_PROCESSING_TIME,
  // //   TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE:
  // //     Number(clearTimeForSctTotal_Data?.[0].TOTAL_PROCESSING_TIME) * (1 + Number(costCondition_Data[0][0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST)),

  // //   DIRECT_PROCESS_COST : costCondition_Data[0][0].DIRECT_UNIT_PROCESS_COST * clearTimeForSctTotal_Data?.[0].TOTAL_PROCESSING_TIME,
  // //   // Selling Price
  // //   MARGIN_FOR_SELLING_PRICE: sctDetailForAdjustment_Data?.[0]?.MARGIN || '',

  // //   CREATE_BY: sct.CREATE_BY,
  // //   UPDATE_BY: sct.UPDATE_BY,
  // //   INUSE: 1,
  // // })
  // //)

  // // update item_m_s_price_sct

  // listSql.push(...sqlList)

  // listSctPrice.push({
  //   SCT_ID: sct.SCT_ID,
  //   PRODUCT_TYPE_ID: sct.PRODUCT_TYPE_ID,
  //   ITEM_M_S_PRICE_ID: ITEM_M_S_PRICE_ID,
  //   SELLING_PRICE: SELLING_PRICE,
  //   // SELLING_PRICE: SELLING_PRICE,
  //   // ITEM_M_S_PRICE_ID: sct.ITEM_ID,
  // })
  //console.log(`Finished processing: Key=${key}, Level=${level}`)
}

// Function to group data by level
const groupDataByLevel = (
  data: Record<
    string,
    {
      level: number
      productTypeId: number
      key?: string
    }
  >
): Record<
  number,
  {
    level: number
    productTypeId: number
    key: string
  }[]
> => {
  return Object.entries(data).reduce(
    (acc, [key, level]) => {
      if (!acc[level.level]) acc[level.level] = []
      acc[level.level].push({ key, ...level })
      return acc
    },
    {} as Record<
      number,
      {
        level: number
        productTypeId: number
        key: string
      }[]
    >
  )
}

const processByLevel = async (
  data: Record<
    string,
    {
      level: number
      productTypeId: number
    }
  >,
  listBomSubAssySemiFg: BomSubAssySemiFg_Type[]
  // listSql: string[],
  // listSctPrice: { SCT_ID: string; PRODUCT_TYPE_ID: string; SELLING_PRICE: number; ITEM_M_S_PRICE_ID: string }[]
): Promise<void> => {
  const groupedData = groupDataByLevel(data)

  const levels = Object.keys(groupedData)
    .map(Number)
    .sort((a, b) => b - a)

  for (const level of levels) {
    //console.log(`Processing Level ${level}`)
    const tasks = groupedData[level].map((key) => processTask(key, level, listBomSubAssySemiFg))
    await Promise.all(tasks)
    //console.log(`Completed Level ${level}`)
  }
}
