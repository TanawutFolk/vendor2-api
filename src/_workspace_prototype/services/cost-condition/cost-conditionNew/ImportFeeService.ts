import { MySQLExecute } from '@businessData/dbExecute'
import { ImportFeeSQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/ImportFeeSQL'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'
import { ExchangeRateService } from './ExchangeRateService'
import { StandardPriceService } from '../../manufacturing-item/StandardPriceService'
import { StandardPriceSQL } from '@src/_workspace/sql/manufacturing-item/StandardPriceSQL'
import { VendorService } from '../../item-master/vendor/VendorService'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'

export const ImportFeeService = {
  getLatestImportFee: async (dataItem: any) => {
    const sql = await ImportFeeSQL.getLatestImportFee(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  search: async (dataItem: any) => {
    const sql = await ImportFeeSQL.search(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  create: async (dataItem: {
    FISCAL_YEAR: number
    CREATE_BY: string
    IMPORT_FEE_RATE_DATA: {
      IMPORT_FEE_RATE: string
      ITEM_IMPORT_TYPE_ID: number
      ITEM_IMPORT_TYPE_NAME: string
    }[]
  }) => {
    let sqlList = []
    const { FISCAL_YEAR, CREATE_BY, IMPORT_FEE_RATE_DATA } = dataItem

    sqlList.push(
      await ImportFeeSQL.updateIsCurrentByFiscalYear({
        FISCAL_YEAR,
      })
    )

    sqlList.push(
      await ImportFeeSQL.createVersion({
        FISCAL_YEAR,
      })
    )

    for (let i = 0; i < IMPORT_FEE_RATE_DATA.length; i++) {
      sqlList.push(
        await ImportFeeSQL.create({
          CREATE_BY,
          FISCAL_YEAR,
          IMPORT_FEE_RATE: IMPORT_FEE_RATE_DATA[i].IMPORT_FEE_RATE,
          ITEM_IMPORT_TYPE_ID: IMPORT_FEE_RATE_DATA[i].ITEM_IMPORT_TYPE_ID,
        })
      )
    }

    // await MySQLExecute.executeList(sqlList)
    // sqlList = []

    const getLatestExchangeRate = (await ExchangeRateService.getLatestExchangeRate({
      FISCAL_YEAR: dataItem.FISCAL_YEAR,
    })) as {
      CURRENCY_ID: number
      CURRENCY_SYMBOL: string
      CURRENCY_NAME: string
      EXCHANGE_RATE_ID: number
      EXCHANGE_RATE_VALUE: number
      FISCAL_YEAR: number
      VERSION: number
    }[]

    if (getLatestExchangeRate.length === 0) {
      const resultData = await MySQLExecute.executeList(sqlList)
      return resultData
    }

    //new_import_fee_id

    const listItemMSPrice = (await StandardPriceService.searchAllLatestItemMSPriceByFiscalYear({
      FISCAL_YEAR,
    })) as {
      ITEM_M_S_PRICE_ID: string
      ITEM_M_O_PRICE_ID: string
      EXCHANGE_RATE_ID: number
      IMPORT_FEE_ID: number
      ITEM_M_S_PRICE_VALUE: number
      ITEM_M_S_PRICE_VERSION_NO: number
      FISCAL_YEAR: number
      VERSION: number
      PURCHASE_UNIT_RATIO: number
      PURCHASE_UNIT_ID: number
      USAGE_UNIT_RATIO: number
      USAGE_UNIT_ID: number
      SCT_PATTERN_ID: number
      IS_CURRENT: number
      ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: number

      CURRENCY_ID: number
      ITEM_CODE_FOR_SUPPORT_MES: string
      PURCHASE_PRICE: number
      ITEM_ID: number
      ITEM_IMPORT_TYPE_ID: number
    }[]

    for (let i = 0; i < listItemMSPrice.length; i++) {
      const itemMSPrice = listItemMSPrice[i]
      //#region Item M S Price
      sqlList.push(
        await StandardPriceSQL.ItemMSPrice_updateIsCurrentByFiscalYearAndItemCode({
          FISCAL_YEAR,
          ITEM_CODE_FOR_SUPPORT_MES: itemMSPrice.ITEM_CODE_FOR_SUPPORT_MES,
          SCT_PATTERN_ID: itemMSPrice.SCT_PATTERN_ID,
        })
      )

      const exchangeRate = getLatestExchangeRate.find((item) => item.CURRENCY_ID === itemMSPrice.CURRENCY_ID)

      if (!exchangeRate) {
        throw new Error('Exchange Rate Not Found')
      }

      let standardPrice = itemMSPrice.PURCHASE_PRICE * (1 / Number(exchangeRate.EXCHANGE_RATE_VALUE)) * (itemMSPrice.PURCHASE_UNIT_RATIO / itemMSPrice.USAGE_UNIT_RATIO)

      if (itemMSPrice.ITEM_IMPORT_TYPE_ID === 2) {
        standardPrice = standardPrice + standardPrice * (Number(IMPORT_FEE_RATE_DATA[0].IMPORT_FEE_RATE) / 100)
      }

      sqlList.push(
        await StandardPriceSQL.createVersion({
          FISCAL_YEAR: FISCAL_YEAR,
          SCT_PATTERN_ID: itemMSPrice.SCT_PATTERN_ID,
          ITEM_CODE_FOR_SUPPORT_MES: itemMSPrice.ITEM_CODE_FOR_SUPPORT_MES,
        })
      )

      sqlList.push(
        await StandardPriceSQL.createNewItemMStandardPriceByExchangeRateIdBySetVariableNewImportFeeId({
          ITEM_M_S_PRICE_ID: uuidv7(),
          ITEM_M_O_PRICE_ID: itemMSPrice.ITEM_M_O_PRICE_ID,
          IMPORT_FEE_ID: itemMSPrice.IMPORT_FEE_ID,
          ITEM_M_S_PRICE_VALUE: standardPrice,
          CREATE_BY,
          FISCAL_YEAR,
          ITEM_ID: itemMSPrice.ITEM_ID,
          SCT_PATTERN_ID: itemMSPrice.SCT_PATTERN_ID,
          ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: 4,
          EXCHANGE_RATE_ID: exchangeRate.EXCHANGE_RATE_ID,
          PURCHASE_UNIT_RATIO: itemMSPrice.PURCHASE_UNIT_RATIO,
          PURCHASE_UNIT_ID: itemMSPrice.PURCHASE_UNIT_ID,
          USAGE_UNIT_RATIO: itemMSPrice.USAGE_UNIT_RATIO,
          USAGE_UNIT_ID: itemMSPrice.USAGE_UNIT_ID,
        })
      )
    }

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  getByFiscalYear_MasterDataLatest: async (dataItem: any) => {
    const sql = await ImportFeeSQL.getByFiscalYear_MasterDataLatest(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
