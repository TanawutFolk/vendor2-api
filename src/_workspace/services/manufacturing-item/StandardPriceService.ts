import { MySQLExecute } from '@businessData/dbExecute'

import { StandardPriceSQL } from '@src/_workspace/sql/manufacturing-item/StandardPriceSQL'
import { RowDataPacket } from 'mysql2'
import { v7 as uuidv7 } from 'uuid'
import { ExchangeRateService } from '../cost-condition/cost-conditionNew/ExchangeRateService'
import { ImportFeeService } from '../cost-condition/cost-conditionNew/ImportFeeService'
import { ItemService } from '../item-master/item/ItemService'

export const StandardPriceService = {
  getItemMSPriceByProductTypeIdAndSctLatest: async (dataItem: any) => {
    const sql = await StandardPriceSQL.getItemMSPriceByProductTypeIdAndSctLatest(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getItemMSPriceBySctFId: async (dataItem: any) => {
    const sql = await StandardPriceSQL.getItemMSPriceBySctFId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getAllOriginalPrice: async () => {
    const sql = await StandardPriceSQL.getAllOriginalPrice()
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getAllStandardPrice: async () => {
    const sql = await StandardPriceSQL.getAllStandardPrice()
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  getStandardPriceByItemId: async (dataItem: any, fiscalYear: any) => {
    const sql = await StandardPriceSQL.getStandardPriceByItemId(dataItem, fiscalYear)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  searchAll: async (dataItem: any) => {
    let sqlWhere = ''

    if (dataItem.ITEM_CODE_FOR_SUPPORT_MES) {
      sqlWhere += " AND tb_3.ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'"
    }
    if (dataItem.SCT_PATTERN_ID) {
      sqlWhere += " AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'"
    }
    if (dataItem.VENDOR_ID) {
      sqlWhere += " AND tb_8.VENDOR_ID = 'dataItem.VENDOR_ID'"
    }
    if (dataItem.ITEM_IMPORT_TYPE_ID) {
      sqlWhere += " AND tb_9.ITEM_IMPORT_TYPE_ID = 'dataItem.ITEM_IMPORT_TYPE_ID'"
    }
    if (dataItem.ITEM_INTERNAL_FULL_NAME) {
      sqlWhere += " AND tb_3.ITEM_INTERNAL_FULL_NAME LIKE '%dataItem.ITEM_INTERNAL_FULL_NAME%'"
    }
    if (dataItem.ITEM_INTERNAL_SHORT_NAME) {
      sqlWhere += " AND tb_3.ITEM_INTERNAL_SHORT_NAME LIKE '%dataItem.ITEM_INTERNAL_SHORT_NAME%'"
    }
    if (dataItem.includingCancelled == false) {
      sqlWhere += ' AND tb_1.INUSE = 1'
    }
    if (dataItem.manufacturingOption === 'Latest') {
      sqlWhere += ' AND tb_1.IS_CURRENT = 1'
    }
    if (dataItem.INUSE) {
      sqlWhere += " AND tb_1.INUSE = 'dataItem.INUSE' "
    }
    const sql = await StandardPriceSQL.searchAll(dataItem, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  search: async (query: any) => {
    let sqlWhere = ''

    if (query.ITEM_CODE_FOR_SUPPORT_MES) {
      sqlWhere += " AND tb_3.ITEM_CODE_FOR_SUPPORT_MES = 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'"
    }
    if (query.SCT_PATTERN_ID) {
      sqlWhere += " AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'"
    }
    if (query.FISCAL_YEAR) {
      sqlWhere += " AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'"
    }
    if (query.VENDOR_ID) {
      sqlWhere += " AND tb_8.VENDOR_ID = 'dataItem.VENDOR_ID'"
    }
    if (query.ITEM_IMPORT_TYPE_ID) {
      sqlWhere += " AND tb_9.ITEM_IMPORT_TYPE_ID = 'dataItem.ITEM_IMPORT_TYPE_ID'"
    }
    if (query.ITEM_INTERNAL_FULL_NAME) {
      sqlWhere += " AND tb_3.ITEM_INTERNAL_FULL_NAME LIKE '%dataItem.ITEM_INTERNAL_FULL_NAME%'"
    }
    if (query.ITEM_INTERNAL_SHORT_NAME) {
      sqlWhere += " AND tb_3.ITEM_INTERNAL_SHORT_NAME LIKE '%dataItem.ITEM_INTERNAL_SHORT_NAME%'"
    }
    if (query.includingCancelled == false) {
      sqlWhere += ' AND tb_1.INUSE = 1'
    }
    if (query.manufacturingOption === 'Latest') {
      sqlWhere += ' AND tb_1.IS_CURRENT = 1'
    }
    if (query.INUSE) {
      sqlWhere += " AND tb_1.INUSE = 'dataItem.INUSE' "
    }
    const sql = await StandardPriceSQL.search(query, sqlWhere)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  createItemMOPriceVersion: async (query: any) => {
    const sql = await StandardPriceSQL.createItemMOPriceVersion(query)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  // create_: async (dataItem: any) => {
  //   let sqlList = []

  //   const fiscalYear = dataItem.FISCAL_YEAR

  //   const getLatestExchangeRate = await ExchangeRateService.getLatestExchangeRate({
  //     FISCAL_YEAR: fiscalYear,
  //   })

  //   const getLatestImportFee = await ImportFeeService.getLatestImportFee({
  //     FISCAL_YEAR: fiscalYear,
  //   })

  //   const getAllInuseOriginalPrice = await StandardPriceService.getAllOriginalPrice()
  //   const getAllInuseStandardPrice = await StandardPriceService.getAllStandardPrice()

  //   for (let i = 0; i < dataItem.DATA.length; i++) {
  //     const data = dataItem.DATA[i]

  //     const oldData = getAllInuseOriginalPrice.find((item) => {
  //       return (
  //         item.ITEM_ID === data.ITEM_ID &&
  //         item.PURCHASE_PRICE === data.PURCHASE_PRICE &&
  //         item.PURCHASE_PRICE_CURRENCY_ID === data.PURCHASE_PRICE_CURRENCY_ID &&
  //         item.PURCHASE_PRICE_UNIT_ID === data.PURCHASE_PRICE_UNIT_ID
  //       )
  //     })

  //     //* if has not old data insert all new row
  //     // if (!oldData) {
  //     if (true) {
  //       // sqlList.push(
  //       //   await StandardPriceSQL.deleteOldDataByItemId({
  //       //     ITEM_ID: data.ITEM_ID
  //       //   })
  //       // )

  //       const UUID_V7 = uuidv7()

  //       sqlList.push(
  //         await StandardPriceSQL.createItemMOPriceVersion({
  //           ITEM_ID: data.ITEM_ID,
  //         })
  //       )

  //       let dataTemp: any = {
  //         ITEM_M_O_PRICE_ID: UUID_V7,
  //         ITEM_ID: data.ITEM_ID,
  //         PURCHASE_PRICE: data.PURCHASE_PRICE,
  //         PURCHASE_PRICE_CURRENCY_ID: data.PURCHASE_PRICE_CURRENCY_ID,
  //         PURCHASE_PRICE_UNIT_ID: data.PURCHASE_PRICE_UNIT_ID,
  //         CREATE_BY: dataItem.CREATE_BY,
  //         FISCAL_YEAR: dataItem.FISCAL_YEAR,
  //         SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
  //       }

  //       sqlList.push(await StandardPriceSQL.createNewItemMOPrice(dataTemp))

  //       const itemImportTypeId = await VendorService.getItemImportTypeByItemId({
  //         ITEM_ID: data.ITEM_ID,
  //       })

  //       const itemDetail = await ItemService.getItemDetailByItemId({
  //         ITEM_ID: data.ITEM_ID,
  //       })

  //       const UUID_V7_2 = uuidv7()
  //       const exchangeRate = getLatestExchangeRate.find((item) => item.CURRENCY_ID === data.PURCHASE_PRICE_CURRENCY_ID)

  //       if (!exchangeRate) {
  //         throw new Error('Exchange Rate Not Found')
  //       }

  //       let standardPrice = data.PURCHASE_PRICE * (1 / exchangeRate.EXCHANGE_RATE_VALUE) * (itemDetail[0].PURCHASE_UNIT_RATIO / itemDetail[0].USAGE_UNIT_RATIO)

  //       if (itemImportTypeId[0]?.ITEM_IMPORT_TYPE_ID === 2) {
  //         standardPrice = standardPrice + standardPrice * (getLatestImportFee[0].IMPORT_FEE_RATE / 100)
  //       }

  //       sqlList.push(await StandardPriceSQL.createVersion(dataTemp))

  //       dataTemp = {
  //         ITEM_M_S_PRICE_ID: UUID_V7_2,
  //         ITEM_M_O_PRICE_ID: UUID_V7,
  //         EXCHANGE_RATE_ID: exchangeRate.EXCHANGE_RATE_ID,
  //         IMPORT_FEE_ID: itemImportTypeId[0]?.ITEM_IMPORT_TYPE_ID === 2 ? getLatestImportFee[0].IMPORT_FEE_ID : null,
  //         ITEM_M_S_PRICE_VALUE: standardPrice,
  //         CREATE_BY: dataItem.CREATE_BY,
  //         FISCAL_YEAR: dataItem.FISCAL_YEAR,
  //         ITEM_ID: data.ITEM_ID,
  //         SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
  //       }

  //       sqlList.push(
  //         await StandardPriceSQL.createItemMStandardPriceVersion({
  //           ITEM_ID: data.ITEM_ID,
  //         })
  //       )

  //       sqlList.push(await StandardPriceSQL.createNewItemMStandardPrice(dataTemp))
  //     } else {
  //       //* if has old data no insert on item_m_o_price
  //       //* Get the item_m_o_price_id from old data
  //       //* Check the exchange rate id and import fee id of old data with latest data
  //       //* if something change insert new row on ITEM_M_S_PRICE with new version
  //       const itemMOPriceId = oldData?.ITEM_M_O_PRICE_ID

  //       const oldStandardPriceData = getAllInuseStandardPrice.find((item) => {
  //         return item.ITEM_M_O_PRICE_ID === itemMOPriceId
  //       })

  //       const exchangeRate = getLatestExchangeRate.find((item) => item.EXCHANGE_RATE_ID === oldStandardPriceData?.EXCHANGE_RATE_ID)

  //       const importFee = getLatestImportFee.find((item) => item.IMPORT_FEE_ID === oldStandardPriceData?.IMPORT_FEE_ID)

  //       if (!exchangeRate || !importFee) {
  //         const UUID_V7_3 = uuidv7()
  //         const exchangeRate = getLatestExchangeRate.find((item) => item.CURRENCY_ID === data.PURCHASE_PRICE_CURRENCY_ID)

  //         const itemDetail = await ItemService.getItemDetailByItemId({
  //           ITEM_ID: data.ITEM_ID,
  //         })

  //         const itemImportTypeId = await VendorService.getItemImportTypeByItemId({
  //           ITEM_ID: data.ITEM_ID,
  //         })

  //         let standardPrice = data.PURCHASE_PRICE * (1 / exchangeRate?.EXCHANGE_RATE_VALUE) * (itemDetail[0].PURCHASE_UNIT_RATIO / itemDetail[0].USAGE_UNIT_RATIO)

  //         if (itemImportTypeId[0]?.ITEM_IMPORT_TYPE_ID === 2) {
  //           standardPrice = standardPrice + standardPrice * (getLatestImportFee[0].IMPORT_FEE_RATE / 100)
  //         }

  //         const dataTemp = {
  //           ITEM_M_S_PRICE_ID: UUID_V7_3,
  //           ITEM_M_O_PRICE_ID: itemMOPriceId,
  //           EXCHANGE_RATE_ID: exchangeRate?.EXCHANGE_RATE_ID,
  //           IMPORT_FEE_ID: itemImportTypeId[0]?.ITEM_IMPORT_TYPE_ID === 2 ? getLatestImportFee[0].IMPORT_FEE_ID : null,
  //           ITEM_M_S_PRICE_VALUE: standardPrice,
  //           CREATE_BY: dataItem.CREATE_BY,
  //           FISCAL_YEAR: dataItem.FISCAL_YEAR,
  //           ITEM_ID: data.ITEM_ID,
  //         }

  //         // sqlList.push(await StandardPriceSQL.createVersion(dataTemp))

  //         sqlList.push(
  //           await StandardPriceSQL.deleteOldDataByItemId({
  //             ITEM_ID: data.ITEM_ID,
  //           })
  //         )

  //         sqlList.push(
  //           await StandardPriceSQL.createItemMStandardPriceVersion({
  //             ITEM_ID: data.ITEM_ID,
  //           })
  //         )

  //         sqlList.push(await StandardPriceSQL.createNewItemMStandardPrice(dataTemp))
  //       } else {
  //         continue
  //       }
  //     }

  //     sqlList.push(
  //       await StandardCostForProductSQL.updateIsMasterDataChangedByMaterialPrice({
  //         ITEM_ID: data.ITEM_ID,
  //         FISCAL_YEAR: dataItem.FISCAL_YEAR,
  //         SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
  //       })
  //     )

  //     if (dataItem.IS_EXCEL) {
  //       sqlList.push(
  //         await StandardPriceSQL.deleteOldExcelVersionByItemId({
  //           ITEM_ID: data.ITEM_ID,
  //         })
  //       )
  //       sqlList.push(
  //         await StandardPriceSQL.createExcelVersion({
  //           ITEM_ID: data.ITEM_ID,
  //         })
  //       )

  //       const UUID_V7_3 = uuidv7()

  //       sqlList.push(
  //         await StandardPriceSQL.insertExcelVersion({
  //           ITEM_ID: data.ITEM_ID,
  //           CREATE_BY: dataItem.CREATE_BY,
  //           ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID: UUID_V7_3,
  //         })
  //       )
  //     }

  //     if (dataItem.IS_MANUAL) {
  //       sqlList.push(
  //         await StandardPriceSQL.deleteOldManualVersionByItemId({
  //           ITEM_ID: data.ITEM_ID,
  //         })
  //       )
  //       sqlList.push(
  //         await StandardPriceSQL.createManualVersion({
  //           ITEM_ID: data.ITEM_ID,
  //         })
  //       )

  //       const UUID_V7_4 = uuidv7()

  //       sqlList.push(
  //         await StandardPriceSQL.insertManualVersion({
  //           ITEM_ID: data.ITEM_ID,
  //           CREATE_BY: dataItem.CREATE_BY,
  //           ITEM_M_O_PRICE_IMPORT_TYPE_HISTORY_ID: UUID_V7_4,
  //         })
  //       )
  //     }
  //   }

  //   // return []

  //   const resultData = await MySQLExecute.executeList(sqlList)

  //   return resultData
  // },
  create: async (dataItem: any) => {
    let sqlList = []

    // 1. get latest exchange rate
    const getLatestExchangeRate = await ExchangeRateService.getLatestExchangeRate({
      FISCAL_YEAR: dataItem.FISCAL_YEAR,
    })

    if (getLatestExchangeRate?.length === 0) {
      throw new Error('Exchange Rate Not Found')
    }

    // 2. get latest import fee
    const getLatestImportFee = await ImportFeeService.getLatestImportFee({
      FISCAL_YEAR: dataItem.FISCAL_YEAR,
    })

    if (getLatestImportFee?.length === 0) {
      throw new Error('Import Fee Not Found')
    }

    const { FISCAL_YEAR, SCT_PATTERN_ID, CREATE_BY, ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID } = dataItem

    for (let i = 0; i < dataItem.DATA.length; i++) {
      const { ITEM_ID, ITEM_CODE_FOR_SUPPORT_MES, PURCHASE_PRICE, PURCHASE_PRICE_CURRENCY_ID, PURCHASE_PRICE_UNIT_ID } = dataItem.DATA[i]

      const ITEM_M_O_PRICE_ID = uuidv7()

      //#region Item M O Price
      sqlList.push(
        await StandardPriceSQL.ItemMOPrice_updateIsCurrentByFiscalYearAndItemCode({
          FISCAL_YEAR,
          ITEM_CODE_FOR_SUPPORT_MES,
          SCT_PATTERN_ID,
        })
      )

      sqlList.push(
        await StandardPriceSQL.createItemMOPriceVersion({
          FISCAL_YEAR,
          ITEM_CODE_FOR_SUPPORT_MES,
          SCT_PATTERN_ID,
        })
      )

      sqlList.push(
        await StandardPriceSQL.createNewItemMOPrice({
          ITEM_M_O_PRICE_ID,
          ITEM_ID,
          PURCHASE_PRICE,
          PURCHASE_PRICE_CURRENCY_ID,
          PURCHASE_PRICE_UNIT_ID,
          CREATE_BY,
          FISCAL_YEAR,
          SCT_PATTERN_ID,
          ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID,
        })
      )
      //#endregion Item M O Price

      //#region Item M S Price
      sqlList.push(
        await StandardPriceSQL.ItemMSPrice_updateIsCurrentByFiscalYearAndItemCode({
          FISCAL_YEAR,
          ITEM_CODE_FOR_SUPPORT_MES,
          SCT_PATTERN_ID,
        })
      )

      const itemDetail = (await ItemService.getItemDetailByItemId({
        ITEM_ID,
      })) as {
        PURCHASE_UNIT_RATIO: number
        USAGE_UNIT_RATIO: number
        ITEM_IMPORT_TYPE_ID: number
        IS_CURRENT: number
      }[]

      if (itemDetail.some((item) => item.IS_CURRENT === 0 || item.IS_CURRENT === null)) {
        throw new Error('Item is not current version or not found , Please check or Export file again')
      }

      const exchangeRate = getLatestExchangeRate.find((item) => item.CURRENCY_ID === PURCHASE_PRICE_CURRENCY_ID)
      if (!exchangeRate) {
        throw new Error('Exchange Rate Not Found')
      }

      let standardPrice = PURCHASE_PRICE * (1 / exchangeRate.EXCHANGE_RATE_VALUE) * (itemDetail[0].PURCHASE_UNIT_RATIO / itemDetail[0].USAGE_UNIT_RATIO)

      if (itemDetail[0]?.ITEM_IMPORT_TYPE_ID === 2) {
        standardPrice = standardPrice + standardPrice * (getLatestImportFee[0].IMPORT_FEE_RATE / 100)
      }

      sqlList.push(
        await StandardPriceSQL.createVersion({
          FISCAL_YEAR: FISCAL_YEAR,
          SCT_PATTERN_ID: SCT_PATTERN_ID,
          ITEM_CODE_FOR_SUPPORT_MES,
        })
      )

      sqlList.push(
        await StandardPriceSQL.createNewItemMStandardPrice({
          ITEM_M_S_PRICE_ID: uuidv7(),
          ITEM_M_O_PRICE_ID,
          EXCHANGE_RATE_ID: exchangeRate.EXCHANGE_RATE_ID,
          IMPORT_FEE_ID: itemDetail[0]?.ITEM_IMPORT_TYPE_ID === 2 ? getLatestImportFee[0].IMPORT_FEE_ID : null,
          ITEM_M_S_PRICE_VALUE: standardPrice,
          CREATE_BY: dataItem.CREATE_BY,
          FISCAL_YEAR: dataItem.FISCAL_YEAR,
          ITEM_ID,
          SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
          ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: dataItem.ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID,
        })
      )
      //#region Item M S Price
    }

    const resultData = await MySQLExecute.executeList(sqlList)

    return resultData
  },
  searchLatestItemMOPrice: async (dataItem: any) => {
    const sql = await StandardPriceSQL.searchLatestItemMOPrice(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },
  searchAllLatestItemMSPriceByFiscalYear: async (dataItem: any) => {
    const sql = await StandardPriceSQL.searchAllLatestItemMSPriceByFiscalYear(dataItem)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },
  delete: async (dataItem: any) => {
    const sql = await StandardPriceSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
