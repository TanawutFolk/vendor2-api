import { MySQLExecute } from '@businessData/dbExecute'
import { ExchangeRateSQL } from '@src/_workspace/sql/cost-condition/cost-conditionNew/ExchangeRateSQL'
import { RowDataPacket } from 'mysql2'
import { ImportFeeService } from './ImportFeeService'
import { StandardPriceService } from '../../manufacturing-item/StandardPriceService'

import { v7 as uuidv7 } from 'uuid'
import { StandardPriceSQL } from '@src/_workspace/sql/manufacturing-item/StandardPriceSQL'

export const ExchangeRateService = {
  getLatestExchangeRate: async (dataItem: any) => {
    const sql = await ExchangeRateSQL.getLatestExchangeRate(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getCurrency: async (query: any) => {
    const sql = await ExchangeRateSQL.getCurrency(query)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  search: async (query: any) => {
    const sql = await ExchangeRateSQL.search(query)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  create: async (dataItem: {
    FISCAL_YEAR: number
    CREATE_BY: string
    CURRENCY_DATA: { CURRENCY_ID: number; CURRENCY_IMAGE: string; CURRENCY_NAME: string; CURRENCY_SYMBOL: string; CURRENCY_VALUE: string; THB_IMAGE: string }[]
  }) => {
    const sqlList = []

    const { FISCAL_YEAR, CREATE_BY } = dataItem

    sqlList.push(
      await ExchangeRateSQL.updateIsCurrentByFiscalYear({
        FISCAL_YEAR,
      })
    )

    sqlList.push(
      await ExchangeRateSQL.createVersion({
        FISCAL_YEAR,
      })
    )

    for (let i = 0; i < dataItem.CURRENCY_DATA.length; i++) {
      sqlList.push(await ExchangeRateSQL.create(dataItem.CURRENCY_DATA[i], dataItem))
    }

    // add THB
    sqlList.push(
      await ExchangeRateSQL.create(
        {
          CURRENCY_ID: 7,
          CURRENCY_VALUE: 1,
        },
        {
          FISCAL_YEAR,
          CREATE_BY,
        }
      )
    )

    // await MySQLExecute.executeList(sqlList)

    // const getLatestExchangeRate = (await ExchangeRateService.getLatestExchangeRate({
    //   FISCAL_YEAR: dataItem.FISCAL_YEAR,
    // })) as RowDataPacket[]

    const getLatestImportFee = (await ImportFeeService.getLatestImportFee({
      FISCAL_YEAR,
    })) as { IMPORT_FEE_RATE: number }[]

    if (getLatestImportFee.length === 0) {
      const resultData = await MySQLExecute.executeList(sqlList)
      return resultData
    }

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

      const exchangeRate = dataItem.CURRENCY_DATA.find((item) => item.CURRENCY_ID === itemMSPrice.CURRENCY_ID)

      if (!exchangeRate) {
        throw new Error('Exchange Rate Not Found')
      }

      let standardPrice = itemMSPrice.PURCHASE_PRICE * (1 / Number(exchangeRate.CURRENCY_VALUE)) * (itemMSPrice.PURCHASE_UNIT_RATIO / itemMSPrice.USAGE_UNIT_RATIO)

      if (itemMSPrice.ITEM_IMPORT_TYPE_ID === 2) {
        standardPrice = standardPrice + standardPrice * (getLatestImportFee[0].IMPORT_FEE_RATE / 100)
      }

      sqlList.push(
        await StandardPriceSQL.createVersion({
          FISCAL_YEAR: FISCAL_YEAR,
          SCT_PATTERN_ID: itemMSPrice.SCT_PATTERN_ID,
          ITEM_CODE_FOR_SUPPORT_MES: itemMSPrice.ITEM_CODE_FOR_SUPPORT_MES,
        })
      )

      sqlList.push(
        await StandardPriceSQL.createNewItemMStandardPriceByExchangeRateIdBySetVariableNewExchangeRateId({
          ITEM_M_S_PRICE_ID: uuidv7(),
          ITEM_M_O_PRICE_ID: itemMSPrice.ITEM_M_O_PRICE_ID,
          IMPORT_FEE_ID: itemMSPrice.IMPORT_FEE_ID,
          ITEM_M_S_PRICE_VALUE: standardPrice,
          CREATE_BY,
          FISCAL_YEAR,
          ITEM_ID: itemMSPrice.ITEM_ID,
          SCT_PATTERN_ID: itemMSPrice.SCT_PATTERN_ID,
          ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: 3,

          CURRENCY_ID: exchangeRate.CURRENCY_ID,
          PURCHASE_UNIT_RATIO: itemMSPrice.PURCHASE_UNIT_RATIO,
          PURCHASE_UNIT_ID: itemMSPrice.PURCHASE_UNIT_ID,
          USAGE_UNIT_RATIO: itemMSPrice.USAGE_UNIT_RATIO,
          USAGE_UNIT_ID: itemMSPrice.USAGE_UNIT_ID,
        })
      )
    }

    // sqlList.push(await StandardCostForProductSQL.updateStandardCostForProductByExchangeRateOrImportFee(dataItem.FISCAL_YEAR))

    const resultData = await MySQLExecute.executeList(sqlList)
    return resultData
  },
  getCurrencyAll: async () => {
    const sql = await ExchangeRateSQL.getCurrencyAll()
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
