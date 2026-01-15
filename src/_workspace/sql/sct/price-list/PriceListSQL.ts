export const PriceListExportSQL = {
  exportToFile: async (dataItem: any) => {
    let sql = `  SELECT DISTINCT
                tb_5.PRODUCT_TYPE_CODE_FOR_SCT AS 'SCT Code',
                tb_1.SCT_REVISION_CODE AS 'SCT Revision Code',
                tb_3.SCT_STATUS_PROGRESS_NAME AS 'SCT Status',
                IF(tb_9.SELLING_PRICE IS NULL, '', DATE_FORMAT(tb_9.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')) AS 'Re-Cal Update Date',
                tb_1.FISCAL_YEAR  AS 'Fiscal Year',
                tb_11.SCT_PATTERN_NAME AS 'SCT Pattern' ,
                tb_13.SCT_REASON_SETTING_NAME AS 'SCT Reason' ,
                tb_15.SCT_TAG_SETTING_NAME AS 'SCT Tag' ,
                tb_16.BOM_CODE AS 'BOM Code' ,
                tb_16.BOM_NAME AS 'BOM Name' ,
                tb_17.FLOW_CODE AS 'Flow Code' ,
                tb_17.FLOW_NAME AS 'Flow Name' ,
                tb_10.ITEM_CATEGORY_NAME AS 'Item Category',
                tb_8.PRODUCT_CATEGORY_NAME AS 'Product Category',
                tb_7.PRODUCT_MAIN_NAME AS 'Product Main',
                tb_6.PRODUCT_SUB_NAME AS 'Product Sub',
                tb_5.PRODUCT_TYPE_NAME AS 'Product Type',
                tb_22.CUSTOMER_INVOICE_TO_ALPHABET AS 'Customer Invoice To Alphabet' ,
                tb_9.DIRECT_UNIT_PROCESS_COST AS 'Direct unit Process Cost (/h)',
                tb_9.INDIRECT_RATE_OF_DIRECT_PROCESS_COST * 0.01 AS 'Indirect rate of Direct process cost',
                tb_9.IMPORTED_FEE AS 'Import Fee rate (%)',
                tb_9.SELLING_EXPENSE AS 'Selling Expense rate (%)',
                tb_9.GA AS 'GA rate (%)',
                tb_9.MARGIN AS 'Margin rate (%)',
                tb_9.CIT * 0.01 AS 'CIT (%)' ,
                tb_9.VAT * 0.01 AS 'VAT (%)' ,
                tb_9.RM_INCLUDE_IMPORTED_COST AS 'RM+(imported fee)',
                tb_9.CONSUMABLE_PACKING AS 'Consume + Packing',
                tb_9.MATERIALS_COST AS 'Materials Cost' ,
                tb_9.DIRECT_PROCESS_COST AS 'Process Cost',
                tb_9.TOTAL_DIRECT_COST AS 'Total' ,
                tb_9.INDIRECT_COST_SALE_AVE AS 'Indirect Cost (Baht)',
                IF(tb_20.TOTAL_INDIRECT_COST IS NULL, '', 'Manual') AS 'Indirect Cost Mode' ,
                tb_9.SELLING_EXPENSE_FOR_SELLING_PRICE AS 'Selling Expense (Baht)',
                tb_9.GA_FOR_SELLING_PRICE AS 'GA (Baht)',
                tb_9.MARGIN_FOR_SELLING_PRICE AS 'Margin (Baht)',
                tb_9.CIT_FOR_SELLING_PRICE AS 'CIT (Baht)',
                tb_9.VAT_FOR_SELLING_PRICE AS 'VAT (Baht)',
                tb_9.SELLING_PRICE_BY_FORMULA AS 'Selling Price by formula(Baht)',
                tb_9.ADJUST_PRICE AS 'Adjust Price (Baht)',
                tb_9.SELLING_PRICE AS 'Selling Price (Baht)',
                tb_18.TOTAL_YIELD_RATE AS 'Total Yield Rate (%)',
                tb_18.TOTAL_GO_STRAIGHT_RATE AS 'Total Go Straight Rate (%)',
                tb_19.TOTAL_CLEAR_TIME AS 'Total Clear Time (MM)' ,
                tb_19.TOTAL_ESSENTIAL_TIME AS 'Total Essential Time (MM)' ,
                tb_9.ASSEMBLY_GROUP_FOR_SUPPORT_MES AS 'Assembly Group' ,
                DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE ,'%d-%b-%Y') AS 'Start Date',
                DATE_FORMAT(tb_9.ESTIMATE_PERIOD_END_DATE ,'%d-%b-%Y') AS 'End Date',
                tb_1.NOTE AS 'Note'

                FROM
                dataItem.STANDARD_COST_DB.SCT tb_1
                JOIN dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_2 ON (tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1)
                JOIN dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_3 ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                JOIN PRODUCT_TYPE_ITEM_CATEGORY tb_4 ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                JOIN PRODUCT_TYPE tb_5 ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                JOIN PRODUCT_SUB tb_6 ON tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID
                JOIN PRODUCT_MAIN tb_7 ON tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID
                JOIN PRODUCT_CATEGORY tb_8 ON tb_7.PRODUCT_CATEGORY_ID = tb_8.PRODUCT_CATEGORY_ID
                JOIN dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_9 ON (tb_1.SCT_ID = tb_9.SCT_ID AND tb_9.INUSE = 1)
                JOIN ITEM_CATEGORY tb_10 ON tb_4.ITEM_CATEGORY_ID = tb_10.ITEM_CATEGORY_ID
                JOIN dataItem.STANDARD_COST_DB.SCT_PATTERN tb_11 ON tb_1.SCT_PATTERN_ID = tb_11.SCT_PATTERN_ID
                JOIN dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_12 ON tb_1.SCT_ID = tb_12.SCT_ID AND tb_12.INUSE = 1
                JOIN dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_13 ON tb_12.SCT_REASON_SETTING_ID = tb_13.SCT_REASON_SETTING_ID
                JOIN BOM tb_16 ON tb_1.BOM_ID = tb_16.BOM_ID
                JOIN FLOW tb_17 ON tb_16.FLOW_ID = tb_17.FLOW_ID
                JOIN dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_ENGINEER_TOTAL tb_18 ON tb_1.SCT_ID = tb_18.SCT_ID AND tb_18.INUSE = 1
                JOIN dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_MFG_TOTAL tb_19 ON tb_1.SCT_ID = tb_19.SCT_ID AND tb_19.INUSE = 1
                LEFT JOIN dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_14 ON tb_1.SCT_ID = tb_14.SCT_ID AND tb_14.INUSE = 1
                LEFT JOIN dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_15 ON tb_14.SCT_TAG_SETTING_ID = tb_15.SCT_TAG_SETTING_ID
                LEFT JOIN dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_20 ON tb_1.SCT_ID = tb_20.SCT_ID AND tb_20.INUSE  = 1
                LEFT JOIN PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_21 ON tb_1.PRODUCT_TYPE_ID = tb_21.PRODUCT_TYPE_ID AND tb_21.INUSE = 1
                LEFT JOIN CUSTOMER_INVOICE_TO tb_22 ON tb_22.CUSTOMER_INVOICE_TO_ID = tb_21.CUSTOMER_INVOICE_TO_ID AND tb_21.INUSE = 1
                WHERE

                tb_1.SCT_ID = 'dataItem.SCT_ID'

                ORDER BY
                tb_5.PRODUCT_TYPE_CODE_FOR_SCT ASC

                   `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process?.env?.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  exportHeaderFile: async (dataItem: any) => {
    let sql = ` SELECT DISTINCT
                tb_5.PRODUCT_TYPE_CODE_FOR_SCT AS 'SCT Code',
                tb_1.SCT_REVISION_CODE AS 'SCT Revision Code',
                tb_3.SCT_STATUS_PROGRESS_NAME AS 'SCT Status',
                IF(tb_9.SELLING_PRICE IS NULL, '', DATE_FORMAT(tb_9.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')) AS 'Re-Cal Update Date',
                tb_1.FISCAL_YEAR  AS 'Fiscal Year',
                tb_11.SCT_PATTERN_NAME AS 'SCT Pattern' ,
                tb_13.SCT_REASON_SETTING_NAME AS 'SCT Reason' ,
                tb_15.SCT_TAG_SETTING_NAME AS 'SCT Tag' ,
                tb_16.BOM_CODE AS 'BOM Code' ,
                tb_16.BOM_NAME AS 'BOM Name' ,
                tb_17.FLOW_CODE AS 'Flow Code' ,
                tb_17.FLOW_NAME AS 'Flow Name' ,
                tb_10.ITEM_CATEGORY_NAME AS 'Item Category',
                tb_8.PRODUCT_CATEGORY_NAME AS 'Product Category',
                tb_7.PRODUCT_MAIN_NAME AS 'Product Main',
                tb_6.PRODUCT_SUB_NAME AS 'Product Sub',
                tb_5.PRODUCT_TYPE_NAME AS 'Product Type',
                tb_22.CUSTOMER_INVOICE_TO_ALPHABET AS 'Customer Invoice To Alphabet' ,
                tb_9.DIRECT_UNIT_PROCESS_COST AS 'Direct unit Process Cost (/h)',
                tb_9.INDIRECT_RATE_OF_DIRECT_PROCESS_COST * 0.01 AS 'Indirect rate of Direct process cost',
                tb_9.IMPORTED_FEE AS 'Import Fee rate (%)',
                tb_9.SELLING_EXPENSE AS 'Selling Expense rate (%)',
                tb_9.GA AS 'GA rate (%)',
                tb_9.MARGIN AS 'Margin rate (%)',
                tb_9.CIT * 0.01 AS 'CIT (%)' ,
                tb_9.VAT * 0.01 AS 'VAT (%)' ,
                tb_9.RM_INCLUDE_IMPORTED_COST AS 'RM+(imported fee)',
                tb_9.CONSUMABLE_PACKING AS 'Consume + Packing',
                tb_9.DIRECT_PROCESS_COST AS 'Process Cost',
                tb_9.INDIRECT_COST_SALE_AVE AS 'Indirect Cost (Baht)',
                IF(tb_20.TOTAL_INDIRECT_COST IS NULL, '', 'Manual') AS 'Indirect Cost Mode' ,
                tb_9.SELLING_EXPENSE_FOR_SELLING_PRICE AS 'Selling Expense (Baht)',
                tb_9.GA_FOR_SELLING_PRICE AS 'GA (Baht)',
                tb_9.MARGIN_FOR_SELLING_PRICE AS 'Margin (Baht)',
                tb_9.CIT_FOR_SELLING_PRICE AS 'CIT (Baht)',
                tb_9.VAT_FOR_SELLING_PRICE AS 'VAT (Baht)',
                tb_9.SELLING_PRICE_BY_FORMULA AS 'Selling Price by formula(Baht)',
                tb_9.ADJUST_PRICE AS 'Adjust Price (Baht)',
                tb_9.SELLING_PRICE AS 'Selling Price (Baht)',
                tb_18.TOTAL_YIELD_RATE AS 'Total Yield Rate (%)',
                tb_18.TOTAL_GO_STRAIGHT_RATE AS 'Total Go Straight Rate (%)',
                tb_19.TOTAL_CLEAR_TIME AS 'Total Clear Time (MM)' ,
                tb_19.TOTAL_ESSENTIAL_TIME AS 'Total Essential Time (MM)' ,
                tb_9.ASSEMBLY_GROUP_FOR_SUPPORT_MES AS 'Assembly Group' ,
                DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE ,'%d-%b-%Y %h:%m:%s') AS 'Start Date',
                DATE_FORMAT(tb_9.ESTIMATE_PERIOD_END_DATE ,'%d-%b-%Y %h:%m:%s') AS 'End Date'

                FROM
                STANDARD_COST.SCT tb_1
                JOIN STANDARD_COST.SCT_PROGRESS_WORKING tb_2 ON (tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1)
                JOIN STANDARD_COST.SCT_STATUS_PROGRESS tb_3 ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                JOIN PRODUCT_TYPE_ITEM_CATEGORY tb_4 ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                JOIN PRODUCT_TYPE tb_5 ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                JOIN PRODUCT_SUB tb_6 ON tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID
                JOIN PRODUCT_MAIN tb_7 ON tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID
                JOIN PRODUCT_CATEGORY tb_8 ON tb_7.PRODUCT_CATEGORY_ID = tb_8.PRODUCT_CATEGORY_ID
                JOIN dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_9 ON (tb_1.SCT_ID = tb_9.SCT_ID AND tb_9.INUSE = 1)
                JOIN ITEM_CATEGORY tb_10 ON tb_4.ITEM_CATEGORY_ID = tb_10.ITEM_CATEGORY_ID
                JOIN dataItem.STANDARD_COST_DB.SCT_PATTERN tb_11 ON tb_1.SCT_PATTERN_ID = tb_11.SCT_PATTERN_ID
                JOIN dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_12 ON tb_1.SCT_ID = tb_12.SCT_ID AND tb_12.INUSE = 1
                JOIN dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_13 ON tb_12.SCT_REASON_SETTING_ID = tb_13.SCT_REASON_SETTING_ID
                LEFT JOIN dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_14 ON tb_1.SCT_ID = tb_14.SCT_ID AND tb_14.INUSE = 1
                LEFT JOIN dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_15 ON tb_14.SCT_TAG_SETTING_ID = tb_15.SCT_TAG_SETTING_ID
                JOIN BOM tb_16 ON tb_1.BOM_ID = tb_16.BOM_ID
                JOIN FLOW tb_17 ON tb_16.FLOW_ID = tb_17.FLOW_ID
                JOIN dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_ENGINEER_TOTAL tb_18 ON tb_1.SCT_ID = tb_18.SCT_ID AND tb_18.INUSE = 1
                JOIN dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_MFG_TOTAL tb_19 ON tb_1.SCT_ID = tb_19.SCT_ID AND tb_19.INUSE = 1
                LEFT JOIN dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_20 ON tb_1.SCT_ID = tb_20.SCT_ID AND tb_20.INUSE  = 1
                LEFT JOIN PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_21 ON tb_1.PRODUCT_TYPE_ID = tb_21.PRODUCT_TYPE_ID AND tb_20.INUSE = 1
                LEFT JOIN CUSTOMER_INVOICE_TO tb_22 ON tb_22.CUSTOMER_INVOICE_TO_ID = tb_21.CUSTOMER_INVOICE_TO_ID AND tb_21.INUSE = 1
                WHERE

                tb_1.SCT_ID = 'dataItem.SCT_ID'

                ORDER BY

                tb_5.PRODUCT_TYPE_CODE_FOR_SCT ASC

                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
}
