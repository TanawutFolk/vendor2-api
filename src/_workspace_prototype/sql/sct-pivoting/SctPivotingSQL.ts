export type SctPivotTab = 'SELLING_PRICE' | 'BOM' | 'PROCESS'

const sellingPriceQuery = `
  SELECT
      tb_5.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE,
      tb_1.FISCAL_YEAR AS FISCAL_YEAR,
      tb_3.SCT_PATTERN_NAME AS SCT_PATTERN_NAME,
      tb_1.SCT_REVISION_CODE AS SCT_REVISION_CODE,
      tb_1.ESTIMATE_PERIOD_START_DATE AS ESTIMATE_PERIOD_START_DATE,
      tb_1.ESTIMATE_PERIOD_END_DATE AS ESTIMATE_PERIOD_END_DATE,
      tb_4.SCT_STATUS_PROGRESS_NAME AS SCT_STATUS_PROGRESS_NAME,
      tb_11.ADJUST_PRICE AS ADJUST_PRICE,
      tb_11.SELLING_PRICE AS SELLING_PRICE,
      tb_1.NOTE AS NOTE,
      IF(tb_11.SELLING_PRICE IS NULL, NULL, tb_11.UPDATE_DATE) AS \`RE-CAL UPDATE_DATE\`,
      IF(tb_11.SELLING_PRICE IS NULL, NULL, tb_11.UPDATE_BY) AS \`RE-CAL UPDATE_BY\`,
      tb_1.UPDATE_DATE AS UPDATE_DATE,
      tb_1.UPDATE_BY AS UPDATE_BY,
      tb_15.BOM_CODE AS BOM_CODE,
      tb_15.BOM_NAME AS BOM_NAME,
      tb_16.FLOW_CODE AS FLOW_CODE,
      tb_16.FLOW_NAME AS FLOW_NAME,
      tb_7.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_NAME,
      tb_10.PRODUCT_CATEGORY_NAME AS PRODUCT_CATEGORY_NAME,
      tb_9.PRODUCT_MAIN_NAME AS PRODUCT_MAIN_NAME,
      tb_8.PRODUCT_SUB_NAME AS PRODUCT_SUB_NAME,
      tb_5.PRODUCT_TYPE_NAME AS PRODUCT_TYPE_NAME,
      tb_13.CUSTOMER_INVOICE_TO_ALPHABET AS CUSTOMER_INVOICE_TO_ALPHABET,
      tb_13.CUSTOMER_INVOICE_TO_NAME AS CUSTOMER_INVOICE_TO_NAME,
      tb_11.DIRECT_UNIT_PROCESS_COST AS DIRECT_UNIT_PROCESS_COST,
      (tb_11.INDIRECT_RATE_OF_DIRECT_PROCESS_COST / 100) AS INDIRECT_RATE_OF_DIRECT_PROCESS_COST,
      (tb_11.IMPORTED_FEE / 100) AS IMPORTED_FEE_RATE,
      (tb_11.SELLING_EXPENSE / 100) AS SELLING_EXPENSE_RATE,
      (tb_11.GA / 100) AS GA_RATE,
      (tb_11.MARGIN / 100) AS MARGIN_RATE,
      (tb_11.CIT / 100) AS CIT_RATE,
      (tb_11.VAT / 100) AS VAT_RATE,
      tb_11.TOTAL_PRICE_OF_RAW_MATERIAL AS RAW_MATERIAL_COST,
      tb_11.TOTAL_PRICE_OF_SUB_ASSY AS \`SUB-ASSY_COST\`,
      tb_11.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS AS \`SEMI-FG_COST\`,
      tb_11.TOTAL_PRICE_OF_CONSUMABLE AS CONSUMABLE_COST,
      tb_11.TOTAL_PRICE_OF_PACKING AS PACKING_COST,
      IF(
        tb_11.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS IS NULL,
        tb_11.TOTAL_PRICE_OF_RAW_MATERIAL + tb_11.TOTAL_PRICE_OF_SUB_ASSY + tb_11.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS,
        tb_11.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS
      ) AS \`SUBTTL_RM_SUB-ASSY_SEMI-FG_COST\`,
      tb_11.CONSUMABLE_PACKING AS SUBTTL_CONSUMABLE_PACKING_COST,
      tb_11.MATERIALS_COST AS TOTAL_MATERIAL_COST,
      tb_11.DIRECT_PROCESS_COST AS TOTAL_DIRECT_PROCESS_COST,
      tb_11.TOTAL_DIRECT_COST AS TOTAL_DIRECT_COST,
      tb_11.INDIRECT_COST_SALE_AVE AS INDIRECT_COST_SALE_AVE,
      tb_23.LABOR AS INDIRECT_COST_LABOR,
      tb_23.DEPRECIATION AS INDIRECT_COST_DEPRECIATION,
      tb_23.OTHER_EXPENSE AS INDIRECT_COST_OTHER_EXPENSE,
      IF(tb_14.TOTAL_INDIRECT_COST IS NULL, NULL, 'manual') AS \`INDIRECT COST Mode\`,
      tb_11.SELLING_EXPENSE_FOR_SELLING_PRICE AS SELLING_EXPENSE_FOR_SELLING_PRICE,
      tb_11.GA_FOR_SELLING_PRICE AS GA_FOR_SELLING_PRICE,
      tb_11.MARGIN_FOR_SELLING_PRICE AS MARGIN_FOR_SELLING_PRICE,
      tb_11.CIT_FOR_SELLING_PRICE AS CIT_FOR_SELLING_PRICE,
      tb_11.VAT_FOR_SELLING_PRICE AS VAT_FOR_SELLING_PRICE,
      tb_11.SELLING_PRICE_BY_FORMULA AS SELLING_PRICE_BY_FORMULA,
      tb_1.DESCRIPTION AS DESCRIPTION,
      tb_1.CREATE_DATE AS CREATE_DATE,
      tb_1.CREATE_BY AS CREATE_BY,
      tb_11.ASSEMBLY_GROUP_FOR_SUPPORT_MES AS ASSEMBLY_GROUP,
      tb_18.SCT_REASON_SETTING_NAME AS SCT_REASON,
      tb_20.SCT_TAG_SETTING_NAME AS SCT_TAG,
      (
        SELECT s2.SCT_REVISION_CODE
        FROM standard_cost.sct_compare sc
        JOIN standard_cost.sct s2 ON sc.SCT_ID_FOR_COMPARE = s2.SCT_ID
        WHERE sc.SCT_ID = tb_1.SCT_ID
          AND sc.INUSE = 1
        ORDER BY sc.CREATE_DATE
        LIMIT 0, 1
      ) AS SCT_COMPARE_1,
      (
        SELECT s2.SCT_REVISION_CODE
        FROM standard_cost.sct_compare sc
        JOIN standard_cost.sct s2 ON sc.SCT_ID_FOR_COMPARE = s2.SCT_ID
        WHERE sc.SCT_ID = tb_1.SCT_ID
          AND sc.INUSE = 1
        ORDER BY sc.CREATE_DATE
        LIMIT 1, 1
      ) AS SCT_COMPARE_2
  FROM standard_cost.sct tb_1
  JOIN standard_cost.sct_progress_working tb_2
      ON tb_1.SCT_ID = tb_2.SCT_ID
      AND tb_2.INUSE = 1
  JOIN standard_cost.sct_pattern tb_3
      ON tb_1.SCT_PATTERN_ID = tb_3.SCT_PATTERN_ID
  JOIN standard_cost.sct_status_progress tb_4
      ON tb_2.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
  JOIN mes.product_type tb_5
      ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
  JOIN mes.product_type_item_category tb_6
      ON tb_5.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID
      AND tb_6.INUSE = 1
  JOIN mes.item_category tb_7
      ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
  JOIN mes.product_sub tb_8
      ON tb_5.PRODUCT_SUB_ID = tb_8.PRODUCT_SUB_ID
  JOIN mes.product_main tb_9
      ON tb_8.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID
  JOIN mes.product_category tb_10
      ON tb_9.PRODUCT_CATEGORY_ID = tb_10.PRODUCT_CATEGORY_ID
  JOIN standard_cost.sct_total_cost tb_11
      ON tb_1.SCT_ID = tb_11.SCT_ID
      AND tb_11.INUSE = 1
  JOIN mes.product_type_customer_invoice_to tb_12
      ON tb_5.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID
      AND tb_12.INUSE = 1
  JOIN mes.customer_invoice_to tb_13
      ON tb_12.CUSTOMER_INVOICE_TO_ID = tb_13.CUSTOMER_INVOICE_TO_ID
  LEFT JOIN standard_cost.sct_detail_for_adjust tb_14
      ON tb_1.SCT_ID = tb_14.SCT_ID
      AND tb_14.INUSE = 1
  LEFT JOIN mes.bom tb_15
      ON tb_1.BOM_ID = tb_15.BOM_ID
  LEFT JOIN mes.flow tb_16
      ON tb_15.FLOW_ID = tb_16.FLOW_ID
  LEFT JOIN standard_cost.sct_reason_history tb_17
      ON tb_1.SCT_ID = tb_17.SCT_ID
      AND tb_17.INUSE = 1
  LEFT JOIN standard_cost.sct_reason_setting tb_18
      ON tb_17.SCT_REASON_SETTING_ID = tb_18.SCT_REASON_SETTING_ID
  LEFT JOIN standard_cost.sct_tag_history tb_19
      ON tb_1.SCT_ID = tb_19.SCT_ID
      AND tb_19.INUSE = 1
  LEFT JOIN standard_cost.sct_tag_setting tb_20
      ON tb_19.SCT_TAG_SETTING_ID = tb_20.SCT_TAG_SETTING_ID
  LEFT JOIN standard_cost.sct_indirect_cost_condition tb_22
      ON tb_1.SCT_ID = tb_22.SCT_ID
      AND tb_22.INUSE = 1
  LEFT JOIN mes.indirect_cost_condition tb_23
      ON tb_22.INDIRECT_COST_CONDITION_ID = tb_23.INDIRECT_COST_CONDITION_ID
  WHERE tb_11.SELLING_PRICE IS NOT NULL
`

const bomQuery = `
  SELECT *
  FROM mes.view_sct_bom_with_cron
`

const processQuery = `
  SELECT
      tb_5.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE,
      tb_1.SCT_REVISION_CODE AS SCT_REVISION_CODE,
      tb_1.FISCAL_YEAR AS FISCAL_YEAR,
      tb_3.SCT_PATTERN_NAME AS SCT_PATTERN_NAME,
      tb_4.SCT_STATUS_PROGRESS_NAME AS SCT_STATUS_PROGRESS_NAME,
      tb_7.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_NAME,
      tb_15.BOM_CODE AS BOM_CODE,
      tb_15.BOM_NAME AS BOM_NAME,
      tb_16.FLOW_CODE AS FLOW_CODE,
      tb_16.FLOW_NAME AS FLOW_NAME,
      tb_10.PRODUCT_CATEGORY_NAME AS PRODUCT_CATEGORY_NAME,
      tb_9.PRODUCT_MAIN_NAME AS PRODUCT_MAIN_NAME,
      tb_8.PRODUCT_SUB_NAME AS PRODUCT_SUB_NAME,
      tb_5.PRODUCT_TYPE_NAME AS PRODUCT_TYPE_NAME,
      tb_13.CUSTOMER_INVOICE_TO_ALPHABET AS CUSTOMER_INVOICE_TO_ALPHABET,
      tb_13.CUSTOMER_INVOICE_TO_NAME AS CUSTOMER_INVOICE_TO_NAME,
      tb_18.NO AS PROCESS_NO,
      tb_19.PROCESS_CODE AS PROCESS_CODE,
      tb_19.PROCESS_NAME AS PROCESS_NAME,
      tb_17.OLD_SYSTEM_PROCESS_SEQUENCE_CODE AS PROCESS_SEQUENCE_CODE,
      (tb_20.YIELD_RATE / 100) AS YIELD_RATE,
      (tb_20.YIELD_ACCUMULATION / 100) AS YIELD_ACCUMULATION,
      tb_21.CLEAR_TIME AS CLEAR_TIME,
      (tb_20.GO_STRAIGHT_RATE / 100) AS GO_STRAIGHT_RATE,
      tb_21.ESSENTIAL_TIME AS ESSENTIAL_TIME,
      tb_21.PROCESS_STANDARD_TIME AS PROCESS_STANDARD_TIME,
      tb_17.OLD_SYSTEM_COLLECTION_POINT AS COLLECTION_POINT,
      tb_1.DESCRIPTION AS DESCRIPTION,
      tb_1.NOTE AS NOTE,
      tb_1.CREATE_BY AS CREATE_BY,
      tb_1.CREATE_DATE AS CREATE_DATE,
      tb_2.UPDATE_BY AS UPDATE_BY,
      tb_2.UPDATE_DATE AS UPDATE_DATE
  FROM standard_cost.sct tb_1
  JOIN standard_cost.sct_progress_working tb_2
      ON tb_1.SCT_ID = tb_2.SCT_ID
      AND tb_2.INUSE = 1
  JOIN standard_cost.sct_pattern tb_3
      ON tb_1.SCT_PATTERN_ID = tb_3.SCT_PATTERN_ID
  JOIN standard_cost.sct_status_progress tb_4
      ON tb_2.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
  JOIN mes.product_type tb_5
      ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
  JOIN mes.product_type_item_category tb_6
      ON tb_5.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID
      AND tb_6.INUSE = 1
  JOIN mes.item_category tb_7
      ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
  JOIN mes.product_sub tb_8
      ON tb_5.PRODUCT_SUB_ID = tb_8.PRODUCT_SUB_ID
  JOIN mes.product_main tb_9
      ON tb_8.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID
  JOIN mes.product_category tb_10
      ON tb_9.PRODUCT_CATEGORY_ID = tb_10.PRODUCT_CATEGORY_ID
  LEFT JOIN mes.product_type_customer_invoice_to tb_12
      ON tb_5.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID
      AND tb_12.INUSE = 1
  LEFT JOIN mes.customer_invoice_to tb_13
      ON tb_12.CUSTOMER_INVOICE_TO_ID = tb_13.CUSTOMER_INVOICE_TO_ID
  LEFT JOIN standard_cost.sct_total_cost tb_14
      ON tb_1.SCT_ID = tb_14.SCT_ID
      AND tb_14.INUSE = 1
  LEFT JOIN mes.bom tb_15
      ON tb_1.BOM_ID = tb_15.BOM_ID
  LEFT JOIN mes.flow tb_16
      ON tb_15.FLOW_ID = tb_16.FLOW_ID
  LEFT JOIN standard_cost.sct_flow_process_sequence tb_17
      ON tb_1.SCT_ID = tb_17.SCT_ID
      AND tb_17.INUSE = 1
  LEFT JOIN mes.flow_process tb_18
      ON tb_17.FLOW_PROCESS_ID = tb_18.FLOW_PROCESS_ID
      AND tb_18.INUSE = 1
  LEFT JOIN mes.process tb_19
      ON tb_18.PROCESS_ID = tb_19.PROCESS_ID
  LEFT JOIN standard_cost.sct_flow_process_processing_cost_by_engineer tb_20
      ON tb_17.SCT_ID = tb_20.SCT_ID
      AND tb_17.FLOW_PROCESS_ID = tb_20.FLOW_PROCESS_ID
      AND tb_20.INUSE = 1
  LEFT JOIN standard_cost.sct_flow_process_processing_cost_by_mfg tb_21
      ON tb_17.SCT_ID = tb_21.SCT_ID
      AND tb_17.FLOW_PROCESS_ID = tb_21.FLOW_PROCESS_ID
      AND tb_21.INUSE = 1
`

const tabConfig: Record<SctPivotTab, { baseQuery: string; orderBy: string }> = {
  SELLING_PRICE: {
    baseQuery: sellingPriceQuery,
    orderBy: `
      PRODUCT_CATEGORY_NAME,
      PRODUCT_MAIN_NAME,
      PRODUCT_SUB_NAME,
      PRODUCT_TYPE_CODE,
      FISCAL_YEAR,
      SCT_PATTERN_NAME
    `,
  },
  BOM: {
    baseQuery: bomQuery,
    orderBy: `
      PRODUCT_CATEGORY_NAME,
      PRODUCT_MAIN_NAME,
      PRODUCT_SUB_NAME,
      PRODUCT_TYPE_CODE,
      SCT_REVISION_CODE,
      PROCESS_ORDER,
      ITEM_CODE
    `,
  },
  PROCESS: {
    baseQuery: processQuery,
    orderBy: `
      PRODUCT_CATEGORY_NAME,
      PRODUCT_MAIN_NAME,
      PRODUCT_SUB_NAME,
      PRODUCT_TYPE_CODE,
      FISCAL_YEAR,
      SCT_PATTERN_NAME,
      SCT_REVISION_CODE,
      PROCESS_NO
    `,
  },
}

export const SctPivotingSQL = {
  normalizeTab: (tab: unknown): SctPivotTab => {
    if (tab === 'BOM' || tab === 'PROCESS' || tab === 'SELLING_PRICE') return tab

    return 'SELLING_PRICE'
  },

  search: async (tab: SctPivotTab, sqlWhere: string) => {
    const config = tabConfig[tab]

    return `
      SELECT *
      FROM (
        ${config.baseQuery}
      ) SCT_PIVOT
      WHERE 1 = 1
        ${sqlWhere}
      ORDER BY
        ${config.orderBy}
    `
  },
}
