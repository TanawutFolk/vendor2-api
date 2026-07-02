import { MySQLExecute } from '@businessData/dbExecute'
import { StandardCostSQL } from '@src/_workspace/sql/sct/StandardCostSQL'
import { RowDataPacket } from 'mysql2'

export const StandardCostService = {
  getByLikeSctPatternName: async (dataItem: any) => {
    let sql = await StandardCostSQL.getByLikeSctPatternName(dataItem)

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getSctByLikeProductTypeIdAndCondition: async (dataItem: any) => {
    let sql = ''

    /**
     * Budget : 1
     * Price : 2
     * Mes : 3
     */

    switch (dataItem.CONDITION) {
      case 'MES':
        sql = await StandardCostSQL.getSctByLikeProductTypeIdAndMesTag(dataItem)
        break

      case 'BUDGET':
        sql = await StandardCostSQL.getSctByLikeProductTypeIdAndBudgetTag(dataItem)
        break

      case 'PRICE':
        sql = await StandardCostSQL.getSctByLikeProductTypeIdAndPriceTag(dataItem)
        break

      case 'SCT_LATEST_REVISION':
        sql = await StandardCostSQL.getSctByLikeProductTypeIdAndLatestRevision(dataItem)
        break

      default:
        break
    }

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeSctTagSettingNameAndInuse: async (dataItem: any) => {
    let sql = await StandardCostSQL.getByLikeSctTagSettingNameAndInuse(dataItem)

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeSctReasonSettingNameAndInuse: async (dataItem: any) => {
    let sql = await StandardCostSQL.getByLikeSctReasonSettingNameAndInuse(dataItem)

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  searchSctCodeForSelection: async (dataItem: any) => {
    let sqlWhere = ''

    if (dataItem?.FISCAL_YEAR) {
      sqlWhere += `AND tb_1.FISCAL_YEAR = '${dataItem.FISCAL_YEAR}'`
    }

    if (dataItem?.PRODUCT_CATEGORY_ID) {
      sqlWhere += `AND tb_8.PRODUCT_CATEGORY_ID = '${dataItem.PRODUCT_CATEGORY_ID}'`
    }

    if (dataItem?.PRODUCT_MAIN_ID) {
      sqlWhere += `AND tb_7.PRODUCT_MAIN_ID = '${dataItem.PRODUCT_MAIN_ID}'`
    }

    if (dataItem?.PRODUCT_SUB_ID) {
      sqlWhere += `AND tb_6.PRODUCT_SUB_ID = '${dataItem.PRODUCT_SUB_ID}'`
    }

    if (dataItem?.PRODUCT_TYPE_ID) {
      sqlWhere += `AND tb_5.PRODUCT_TYPE_ID = '${dataItem.PRODUCT_TYPE_ID}'`
    }

    if (dataItem?.SCT_PATTERN_ID) {
      sqlWhere += `AND tb_1.SCT_PATTERN_ID = '${dataItem.SCT_PATTERN_ID}'`
    }

    if (dataItem?.BOM_ID) {
      sqlWhere += `AND tb_1.BOM_ID = '${dataItem.BOM_ID}'`
    }

    if (sqlWhere !== '') {
      sqlWhere = sqlWhere.substring(4)
    }

    const sql = await StandardCostSQL.searchSctCodeForSelection(dataItem, sqlWhere)

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
  searchProductSubBySctNo: async (dataItem: any) => {
    let sctNo = dataItem.SCT_NO.split(',')
    sctNo = sctNo.map((item: any) => item.trim())

    let sqlList = []

    for (let i = 0; i < sctNo.length; i++) {
      const sql = await StandardCostSQL.searchProductSubBySctNo(sctNo[i])

      sqlList.push(sql)
    }

    const resultData = await MySQLExecute.searchList(sqlList, 'PRODUCTION')
    return resultData
  },
  searchMaterialPackingAndRawMatBySctNo: async (dataItem: any) => {
    let sctNo = dataItem.SCT_NO.split(',')
    sctNo = sctNo.map((item: any) => item.trim())

    let sqlList = []

    for (let i = 0; i < sctNo.length; i++) {
      const sql = await StandardCostSQL.searchMaterialPackingAndRawMatBySctNo(sctNo[i])

      sqlList.push(sql)
    }

    const resultData = await MySQLExecute.searchList(sqlList, 'PRODUCTION')
    return resultData
  },
  searchSctCodeForSelectionMaterialPrice: async (dataItem: any) => {
    let sql = await StandardCostSQL.searchSctCodeForSelectionMaterialPrice(dataItem)

    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  get: async (dataItem: any) => {
    let sqlWhere = ''

    if (dataItem?.SCT_REVISION_CODE) {
      sqlWhere += `AND tb_1.SCT_REVISION_CODE = '${dataItem.SCT_REVISION_CODE}'`
    }

    if (dataItem?.FISCAL_YEAR) {
      sqlWhere += `AND tb_1.FISCAL_YEAR = '${dataItem.FISCAL_YEAR}'`
    }

    if (dataItem?.PRODUCT_CATEGORY_ID) {
      sqlWhere += `AND tb_8.PRODUCT_CATEGORY_ID = '${dataItem.PRODUCT_CATEGORY_ID}'`
    }

    if (dataItem?.PRODUCT_MAIN_ID) {
      sqlWhere += `AND tb_7.PRODUCT_MAIN_ID = '${dataItem.PRODUCT_MAIN_ID}'`
    }

    if (dataItem?.PRODUCT_SUB_ID) {
      sqlWhere += `AND tb_6.PRODUCT_SUB_ID = '${dataItem.PRODUCT_SUB_ID}'`
    }

    if (dataItem?.PRODUCT_TYPE_ID) {
      sqlWhere += `AND tb_5.PRODUCT_TYPE_ID = '${dataItem.PRODUCT_TYPE_ID}'`
    }

    if (dataItem?.SCT_PATTERN_ID) {
      sqlWhere += `AND tb_1.SCT_PATTERN_ID = '${dataItem.SCT_PATTERN_ID}'`
    }

    if (dataItem?.BOM_ID) {
      sqlWhere += `AND tb_1.BOM_ID = '${dataItem.BOM_ID}'`
    }

    if (sqlWhere !== '') {
      sqlWhere = sqlWhere.substring(4)
    }

    const sql = await StandardCostSQL.get({
      SCT_REVISION_CODE: dataItem.SCT_REVISION_CODE,
      FISCAL_YEAR: dataItem.FISCAL_YEAR,
      SCT_PATTERN_ID: dataItem.SCT_PATTERN_ID,
      BOM_ID: dataItem.BOM_ID,
      PRODUCT_TYPE_ID: dataItem.PRODUCT_TYPE_ID,
      PRODUCT_CATEGORY_ID: dataItem.PRODUCT_CATEGORY_ID,
      PRODUCT_MAIN_ID: dataItem.PRODUCT_MAIN_ID,
      PRODUCT_SUB_ID: dataItem.PRODUCT_SUB_ID,
      sqlWhere: sqlWhere,
      Limit: 10,
      Order: ' tb_1.SCT_REVISION_CODE',
      Start: 0,
    })

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
