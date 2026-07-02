import { SctPivotingSQL } from '@src/_workspace/sql/sct-pivoting/SctPivotingSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

const escapeSqlValue = (value: unknown) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .trim()

export const SctPivotingService = {
  search: async (dataItem: any) => {
    let sqlWhere = ''
    const tab = SctPivotingSQL.normalizeTab(dataItem.TAB)

    const ITEM_CATEGORY_NAME = escapeSqlValue(dataItem.ITEM_CATEGORY_NAME)
    const PRODUCT_CATEGORY_NAME = escapeSqlValue(dataItem.PRODUCT_CATEGORY_NAME)
    const PRODUCT_MAIN_NAME = escapeSqlValue(dataItem.PRODUCT_MAIN_NAME)
    const PRODUCT_SUB_NAME = escapeSqlValue(dataItem.PRODUCT_SUB_NAME)
    const PRODUCT_TYPE_CODE = escapeSqlValue(dataItem.PRODUCT_TYPE_CODE)
    const PRODUCT_TYPE_NAME = escapeSqlValue(dataItem.PRODUCT_TYPE_NAME)
    const CUSTOMER_INVOICE_TO_NAME = escapeSqlValue(dataItem.CUSTOMER_INVOICE_TO_NAME)
    const CUSTOMER_INVOICE_TO_ALPHABET = escapeSqlValue(dataItem.CUSTOMER_INVOICE_TO_ALPHABET)
    const BOM_CODE = escapeSqlValue(dataItem.BOM_CODE)
    const BOM_NAME = escapeSqlValue(dataItem.BOM_NAME)

    const FISCAL_YEAR = escapeSqlValue(dataItem.FISCAL_YEAR)
    const SCT_PATTERN_NAME = escapeSqlValue(dataItem.SCT_PATTERN_NAME)
    const SCT_REASON_SETTING_NAME = escapeSqlValue(dataItem.SCT_REASON_SETTING_NAME)
    const SCT_STATUS_PROGRESS_NAME = escapeSqlValue(dataItem.SCT_STATUS_PROGRESS_NAME)
    const INCLUDING_CANCELLED = dataItem.INCLUDING_CANCELLED
    const SCT_REVISION_CODE = escapeSqlValue(dataItem.SCT_REVISION_CODE)
    const ALL_LATEST_REVISION = escapeSqlValue(dataItem.ALL_LATEST_REVISION)
    const NOTE = escapeSqlValue(dataItem.NOTE)
    const ITEM_CODE = escapeSqlValue(dataItem.ITEM_CODE)
    const FLOW_CODE = escapeSqlValue(dataItem.FLOW_CODE)
    const CREATED_DATE_FROM = escapeSqlValue(dataItem.CREATED_DATE_FROM)
    const CREATED_DATE_TO = escapeSqlValue(dataItem.CREATED_DATE_TO)
    const CALCULATION_DATE_FROM = escapeSqlValue(dataItem.CALCULATION_DATE_FROM)
    const CALCULATION_DATE_TO = escapeSqlValue(dataItem.CALCULATION_DATE_TO)

    if (FISCAL_YEAR) {
      sqlWhere += ` AND FISCAL_YEAR = '${FISCAL_YEAR}'`
    }

    if (ALL_LATEST_REVISION === 'Latest') {
      sqlWhere += ` AND CAST(RIGHT(SCT_REVISION_CODE, 2) AS UNSIGNED) = (
        SELECT MAX(CAST(RIGHT(s2.SCT_REVISION_CODE, 2) AS UNSIGNED))
        FROM standard_cost.sct s2
        WHERE SUBSTRING(s2.SCT_REVISION_CODE, 1, LENGTH(s2.SCT_REVISION_CODE) - 3) = SUBSTRING(SCT_PIVOT.SCT_REVISION_CODE, 1, LENGTH(SCT_PIVOT.SCT_REVISION_CODE) - 3)
      )`
    }

    if (SCT_PATTERN_NAME) {
      sqlWhere += ` AND SCT_PATTERN_NAME = '${SCT_PATTERN_NAME}'`
    }

    if (SCT_REASON_SETTING_NAME && tab === 'SELLING_PRICE') {
      sqlWhere += ` AND SCT_REASON = '${SCT_REASON_SETTING_NAME}'`
    }

    if (SCT_STATUS_PROGRESS_NAME) {
      sqlWhere += ` AND SCT_STATUS_PROGRESS_NAME = '${SCT_STATUS_PROGRESS_NAME}'`
    }

    if (!INCLUDING_CANCELLED) {
      sqlWhere += " AND SCT_STATUS_PROGRESS_NAME != 'Cancelled'"
    }

    if (SCT_REVISION_CODE) {
      const revCodes = SCT_REVISION_CODE.split(',')
        .map((c) => `'${c.trim()}'`)
        .filter((c) => c !== "''")
        .join(',')
      if (revCodes) {
        sqlWhere += ` AND SCT_REVISION_CODE IN (${revCodes})`
      }
    }

    if (NOTE) {
      sqlWhere += ` AND NOTE LIKE '%${NOTE}%'`
    }

    if (ITEM_CATEGORY_NAME) {
      sqlWhere += ` AND ITEM_CATEGORY_NAME = '${ITEM_CATEGORY_NAME}'`
    }

    if (PRODUCT_CATEGORY_NAME) {
      sqlWhere += ` AND PRODUCT_CATEGORY_NAME = '${PRODUCT_CATEGORY_NAME}'`
    }

    if (PRODUCT_MAIN_NAME) {
      sqlWhere += ` AND PRODUCT_MAIN_NAME = '${PRODUCT_MAIN_NAME}'`
    }

    if (PRODUCT_SUB_NAME) {
      sqlWhere += ` AND PRODUCT_SUB_NAME = '${PRODUCT_SUB_NAME}'`
    }

    if (PRODUCT_TYPE_CODE) {
      sqlWhere += ` AND PRODUCT_TYPE_CODE = '${PRODUCT_TYPE_CODE}'`
    }

    if (PRODUCT_TYPE_NAME) {
      sqlWhere += ` AND PRODUCT_TYPE_NAME = '${PRODUCT_TYPE_NAME}'`
    }

    if (CUSTOMER_INVOICE_TO_ALPHABET && tab === 'BOM') {
      sqlWhere += ` AND CUSTOMER_INVOICE_TO_ALPHABET LIKE '%${CUSTOMER_INVOICE_TO_ALPHABET}%'`
    }

    if (tab !== 'BOM') {
      if (CUSTOMER_INVOICE_TO_NAME && CUSTOMER_INVOICE_TO_ALPHABET) {
        sqlWhere += ` AND (CUSTOMER_INVOICE_TO_NAME LIKE '%${CUSTOMER_INVOICE_TO_NAME}%' OR CUSTOMER_INVOICE_TO_ALPHABET LIKE '%${CUSTOMER_INVOICE_TO_ALPHABET}%')`
      } else if (CUSTOMER_INVOICE_TO_NAME) {
        sqlWhere += ` AND CUSTOMER_INVOICE_TO_NAME LIKE '%${CUSTOMER_INVOICE_TO_NAME}%'`
      } else if (CUSTOMER_INVOICE_TO_ALPHABET) {
        sqlWhere += ` AND CUSTOMER_INVOICE_TO_ALPHABET LIKE '%${CUSTOMER_INVOICE_TO_ALPHABET}%'`
      }
    }

    if (ITEM_CODE && tab === 'BOM') {
      const itemCodes = ITEM_CODE.split(',')
        .map((c) => `'${c.trim()}'`)
        .filter((c) => c !== "''")
        .join(',')
      if (itemCodes) {
        sqlWhere += ` AND ITEM_CODE IN (${itemCodes})`
      }
    }

    if (FLOW_CODE) {
      sqlWhere += ` AND FLOW_CODE = '${FLOW_CODE}'`
    }

    if (BOM_CODE) {
      sqlWhere += ` AND BOM_CODE LIKE '%${BOM_CODE}%'`
    }

    if (BOM_NAME) {
      sqlWhere += ` AND BOM_NAME LIKE '%${BOM_NAME}%'`
    }

    if (CREATED_DATE_FROM) {
      sqlWhere += ` AND DATE(CREATE_DATE) >= '${new Date(CREATED_DATE_FROM).toISOString().split('T')[0]}'`
    }

    if (CREATED_DATE_TO) {
      sqlWhere += ` AND DATE(CREATE_DATE) <= '${new Date(CREATED_DATE_TO).toISOString().split('T')[0]}'`
    }

    if (CALCULATION_DATE_FROM && tab === 'SELLING_PRICE') {
      sqlWhere += ` AND DATE(UPDATE_DATE) >= '${new Date(CALCULATION_DATE_FROM).toISOString().split('T')[0]}'`
    }

    if (CALCULATION_DATE_TO && tab === 'SELLING_PRICE') {
      sqlWhere += ` AND DATE(UPDATE_DATE) <= '${new Date(CALCULATION_DATE_TO).toISOString().split('T')[0]}'`
    }

    const sql = await SctPivotingSQL.search(tab, sqlWhere)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return resultData
  },
}
