import { MySQLExecute } from '@businessData/dbExecute'
import { StandardPriceSQL } from '@src/_workspace/sql/manufacturing-item/StandardPriceSQL'
import { ManufacturingItemPriceSQL } from '@src/_workspace/sql/pc-admin/ManufacturingItemPriceSQL'
import { ResponseI } from '@src/types/ResponseI'
import { RowDataPacket } from 'mysql2'
import { v7 as uuidv7 } from 'uuid'
import { ExchangeRateService } from '../cost-condition/cost-conditionNew/ExchangeRateService'
import { ImportFeeService } from '../cost-condition/cost-conditionNew/ImportFeeService'
import { VendorService } from '../item-master/vendor/VendorService'
import { StandardPriceService } from '../manufacturing-item/StandardPriceService'
import { StandardCostForProductSQL } from '@src/_workspace/sql/sct/StandardCostForProductSQL'

export const ManufacturingItemPriceService = {
  create: async (dataItem: any) => {
    let resultData
    let sqlList = []
    const fiscalYear = dataItem.FISCAL_YEAR
    // const sctPatternId = 2
    const sql = await ManufacturingItemPriceSQL.checkFiscalYearAndSctPattern(dataItem)
    resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    if (resultData?.length === 0) {
      const getLatestExchangeRate = (await ExchangeRateService.getLatestExchangeRate({
        FISCAL_YEAR: fiscalYear,
      })) as RowDataPacket[]
      const getLatestImportFee = (await ImportFeeService.getLatestImportFee({
        FISCAL_YEAR: fiscalYear,
      })) as RowDataPacket[]
      if (getLatestExchangeRate.length === 0 || getLatestImportFee.length === 0) {
        return {
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'No found data Import Fee or Exchange Rate by Fiscal Year',
          Message: 'ไม่พบข้อมูล Import Fee หรือ Exchange Rate ปีที่เลือก กรุณาตรวจสอบข้อมูลให้ถูกต้อง',
        } as ResponseI
      }
      const getLatestItemMOPrice = (await StandardPriceService.searchLatestItemMOPrice({
        FISCAL_YEAR: (Number(fiscalYear) - 1).toString(),
      })) as RowDataPacket[]
      for (let i = 0; i < getLatestItemMOPrice.length; i++) {
        const data = getLatestItemMOPrice[i]
        const UUID_V7 = uuidv7()
        // sqlList.push(
        //   await StandardPriceSQL.createItemMOPriceVersion({
        //     ITEM_ID: data.ITEM_ID,
        //     FISCAL_YEAR: fiscalYear,
        //   })
        // )
        let dataTemp: any = {
          ITEM_M_O_PRICE_ID: UUID_V7,
          ITEM_ID: data.ITEM_ID,
          PURCHASE_PRICE: data.PURCHASE_PRICE,
          SCT_PATTERN_ID: 1,
          PURCHASE_PRICE_CURRENCY_ID: data.PURCHASE_PRICE_CURRENCY_ID,
          PURCHASE_PRICE_UNIT_ID: data.PURCHASE_PRICE_UNIT_ID,
          CREATE_BY: dataItem.CREATE_BY,
          FISCAL_YEAR: fiscalYear,
        }
        sqlList.push(await StandardPriceSQL.createNewItemMOPrice(dataTemp))
        const itemImportTypeId = (await VendorService.getItemImportTypeByItemId({
          ITEM_ID: data.ITEM_ID,
        })) as RowDataPacket[]
        // const itemDetail = (await ItemService.getItemDetailByItemId({
        //   ITEM_ID: data.ITEM_ID,
        // })) as RowDataPacket[]
        // console.log('detail : ', data.ITEM_ID)
        const UUID_V7_2 = uuidv7()
        const exchangeRate = getLatestExchangeRate.find((item) => item.CURRENCY_ID === data.PURCHASE_PRICE_CURRENCY_ID) as RowDataPacket
        let usagePrice = data.PURCHASE_PRICE * (1 / exchangeRate.EXCHANGE_RATE_VALUE)
        let standardPrice = usagePrice
        if (itemImportTypeId[0]?.ITEM_IMPORT_TYPE_ID === 2) {
          standardPrice = usagePrice + usagePrice * (getLatestImportFee[0].IMPORT_FEE_RATE / 100)
        }
        sqlList.push(await StandardPriceSQL.createVersion(dataTemp))
        dataTemp = {
          ITEM_M_S_PRICE_ID: UUID_V7_2,
          ITEM_M_O_PRICE_ID: UUID_V7,
          EXCHANGE_RATE_ID: exchangeRate.EXCHANGE_RATE_ID,
          IMPORT_FEE_ID: itemImportTypeId[0]?.ITEM_IMPORT_TYPE_ID === 2 ? getLatestImportFee[0].IMPORT_FEE_ID : null,
          ITEM_M_S_PRICE_VALUE: standardPrice,
          ITEM_M_U_PRICE_VALUE: usagePrice,
          CREATE_BY: dataItem.CREATE_BY,
          FISCAL_YEAR: fiscalYear,
          ITEM_ID: data.ITEM_ID,
          SCT_PATTERN_ID: 1,
        }
        sqlList.push(
          await StandardPriceSQL.createItemMStandardPriceVersion({
            ITEM_ID: data.ITEM_ID,
          })
        )
        sqlList.push(await StandardPriceSQL.createNewItemMStandardPrice(dataTemp))

        sqlList.push(
          await StandardCostForProductSQL.updateIsMasterDataChangedByMaterialPrice({
            ITEM_ID: data.ITEM_ID,
            FISCAL_YEAR: fiscalYear,
            SCT_PATTERN_ID: 1,
          })
        )
      }
      const resultData = await MySQLExecute.executeList(sqlList)
      return {
        Status: true,
        ResultOnDb: resultData,
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Manufacturing Item Price',
        Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      } as ResponseI
    } else {
      return {
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Manufacturing Item Price',
        Message: 'ข้อมูลที่ต้องการบันทึก มีอยู่แล้ว Data already exists',
      } as ResponseI
    }
  },
}
