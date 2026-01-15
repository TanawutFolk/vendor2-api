export const SctSQL = {
  insertBySctCode_Variable: async (dataItem: any) => {
    let sql = `
              INSERT INTO dataItem.STANDARD_COST_DB.SCT
              (
                        SCT_ID
                      , SCT_FORMULA_VERSION_ID
                      , SCT_REVISION_CODE
                      , FISCAL_YEAR
                      , SCT_PATTERN_ID
                      , PRODUCT_TYPE_ID
                      , BOM_ID
                      , ESTIMATE_PERIOD_START_DATE
                      , ESTIMATE_PERIOD_END_DATE
                      , NOTE
                      , CREATE_BY
                      , UPDATE_BY
                      , UPDATE_DATE
                      , INUSE
              )
              VALUES
              (
                        'dataItem.SCT_ID'
                      , 'dataItem.SCT_FORMULA_VERSION_ID'
                      ,  @sctCode
                      , 'dataItem.FISCAL_YEAR'
                      , 'dataItem.SCT_PATTERN_ID'
                      , 'dataItem.PRODUCT_TYPE_ID'
                      , 'dataItem.BOM_ID'
                      ,  dataItem.START_DATE
                      ,  dataItem.END_DATE
                      , 'dataItem.NOTE'
                      , 'dataItem.CREATE_BY'
                      , 'dataItem.UPDATE_BY'
                      ,  CURRENT_TIMESTAMP()
                      , 'dataItem.INUSE'
              );
                      `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.SCT_FORMULA_VERSION_ID', dataItem['SCT_FORMULA_VERSION_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.START_DATE', dataItem['START_DATE'] ? `'${dataItem['START_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.END_DATE', dataItem['END_DATE'] ? `'${dataItem['END_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  updateUpdateByAndUpdateDateBySctId: async (dataItem: any) => {
    let sql = `         UPDATE
                                  dataItem.STANDARD_COST_DB.SCT
                        SET
                                  UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                SCT_ID = 'dataItem.SCT_ID'`

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  updateEstimatePeriodBySctId: async (dataItem: any) => {
    let sql = `         UPDATE
                                  dataItem.STANDARD_COST_DB.SCT
                        SET
                                  ESTIMATE_PERIOD_START_DATE = 'dataItem.ESTIMATE_PERIOD_START_DATE'
                                , ESTIMATE_PERIOD_END_DATE = 'dataItem.ESTIMATE_PERIOD_END_DATE'
                                , INUSE = 'dataItem.INUSE'
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                SCT_ID = 'dataItem.SCT_ID'`

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_START_DATE', dataItem['ESTIMATE_PERIOD_START_DATE'])
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_END_DATE', dataItem['ESTIMATE_PERIOD_END_DATE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  updateNoteBySctId: async (dataItem: any) => {
    let sql = `         UPDATE
                                  dataItem.STANDARD_COST_DB.SCT
                        SET
                                  NOTE = 'dataItem.NOTE'
                                , INUSE = 'dataItem.INUSE'
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                SCT_ID = 'dataItem.SCT_ID'`

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getByProductTypeIdAndFiscalYearAndSctPatternIdAndSctTagSettingId: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                FROM
                          dataItem.STANDARD_COST_DB.SCT tb_1
                                  INNER JOIN
                          dataItem.STANDARD_COST_DB.SCT_TAG_SETTING_HISTORY tb_2
                                  ON tb_1.SCT_ID = tb_2.SCT_ID
                                  AND tb_2.INUSE = 1
                                  INNER JOIN
                          PRODUCT_TYPE tb_3
                                  ON tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
                WHERE
                              tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                          AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                          AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                          AND tb_2.SCT_TAG_SETTING_ID = 'dataItem.SCT_TAG_SETTING_ID'
                          AND tb_1.INUSE = 1
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])

    return sql
  },
  getByProductTypeIdAndSctTagSettingId: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                FROM
                          dataItem.STANDARD_COST_DB.SCT tb_1
                                  INNER JOIN
                          dataItem.STANDARD_COST_DB.SCT_TAG_SETTING_HISTORY tb_2
                                  ON tb_1.SCT_ID = tb_2.SCT_ID
                                  AND tb_2.INUSE = 1
                WHERE
                              tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                          AND tb_2.SCT_TAG_SETTING_ID = 'dataItem.SCT_TAG_SETTING_ID'
                          AND tb_1.INUSE = 1
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])

    return sql
  },
  insertSctCompare: async (dataItem: {
    SCT_COMPARE_ID: string
    SCT_COMPARE_NO: number
    SCT_ID: string
    SCT_ID_FOR_COMPARE: string
    IS_DEFAULT_EXPORT_COMPARE: number
    CREATE_BY: string
    UPDATE_BY: string
  }) => {
    let sql = `
              INSERT INTO dataItem.STANDARD_COST_DB.SCT_COMPARE
                  (
                            SCT_COMPARE_ID
                          , SCT_COMPARE_NO
                          , SCT_ID
                          , SCT_ID_FOR_COMPARE
                          , IS_DEFAULT_EXPORT_COMPARE
                          , CREATE_BY
                          , CREATE_DATE
                          , UPDATE_BY
                          , UPDATE_DATE
                          , INUSE
                  )
              VALUES
                  (
                            'dataItem.SCT_COMPARE_ID'
                          , 'dataItem.SCT_COMPARE_NO'
                          , 'dataItem.SCT_ID'
                          , 'dataItem.SCT_ID_FOR_COMPARE'
                          , 'dataItem.IS_DEFAULT_EXPORT_COMPARE'
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 'dataItem.UPDATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 1
                  );

              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_COMPARE_ID', dataItem['SCT_COMPARE_ID'])
    sql = sql.replaceAll('dataItem.SCT_COMPARE_NO', dataItem['SCT_COMPARE_NO'].toString())

    sql = sql.replaceAll('dataItem.SCT_ID_FOR_COMPARE', dataItem['SCT_ID_FOR_COMPARE'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.IS_DEFAULT_EXPORT_COMPARE', dataItem['IS_DEFAULT_EXPORT_COMPARE'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteSctCompareBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string }) => {
    let sql = `
              UPDATE
                        dataItem.STANDARD_COST_DB.SCT_COMPARE
              SET
                        INUSE = 0
                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                      , UPDATE_DATE = CURRENT_TIMESTAMP()
              WHERE
                            SCT_ID = 'dataItem.SCT_ID'
                        AND INUSE = 1
              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  insertSctBomFlowProcessItemUsagePriceAdjust: async (dataItem: any) => {
    let sql = `
              INSERT INTO dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST
                  (
                            SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID
                          , SCT_ID
                          , BOM_FLOW_PROCESS_ITEM_USAGE_ID
                          , SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE
                          , MATERIAL_SCT_ID
                          , DESCRIPTION
                          , CREATE_BY
                          , CREATE_DATE
                          , UPDATE_BY
                          , UPDATE_DATE
                          , INUSE
                  )
              VALUES
                  (
                            'dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID'
                          , 'dataItem.SCT_ID'
                          , 'dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID'
                          , 'dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE'
                          , 'dataItem.MATERIAL_SCT_ID'
                          , ''
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 1
                  );

              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID', dataItem['SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.BOM_FLOW_PROCESS_ITEM_USAGE_ID', dataItem['BOM_FLOW_PROCESS_ITEM_USAGE_ID'])
    sql = sql.replaceAll('dataItem.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE', dataItem['SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE'])
    sql = sql.replaceAll('dataItem.MATERIAL_SCT_ID', dataItem['MATERIAL_SCT_ID'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  deleteSctBomFlowProcessItemUsagePriceAdjustBySctId: async (dataItem: any) => {
    let sql = `
              UPDATE
                        dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST
              SET
                        INUSE = 0
                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                      , UPDATE_DATE = CURRENT_TIMESTAMP()
              WHERE
                        SCT_ID = 'dataItem.SCT_ID'
              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  insertSctDetailForAdjust: async (dataItem: {
    SCT_DETAIL_FOR_ADJUST_ID: string
    SCT_ID: string
    TOTAL_INDIRECT_COST: number | ''
    CIT: number | ''
    VAT: number | ''
    GA: number | ''
    MARGIN: number | ''
    SELLING_EXPENSE: number | ''
    ADJUST_PRICE: number | ''
    IS_FROM_SCT_COPY: number
    TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID: number | ''
    CIT_SCT_RESOURCE_OPTION_ID: number | ''
    VAT_SCT_RESOURCE_OPTION_ID: number | ''
    GA_SCT_RESOURCE_OPTION_ID: number | ''
    MARGIN_SCT_RESOURCE_OPTION_ID: number | ''
    SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID: number | ''
    ADJUST_PRICE_SCT_RESOURCE_OPTION_ID: number | ''
    CREATE_BY: string
    UPDATE_BY: string
  }) => {
    let sql = `
              INSERT INTO dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST
                  (
                            SCT_DETAIL_FOR_ADJUST_ID
                          , SCT_ID
                          , TOTAL_INDIRECT_COST
                          , CIT
                          , VAT
                          , GA
                          , MARGIN
                          , SELLING_EXPENSE
                          , ADJUST_PRICE

                          , IS_FROM_SCT_COPY

                          , TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID
                          , CIT_SCT_RESOURCE_OPTION_ID
                          , VAT_SCT_RESOURCE_OPTION_ID
                          , GA_SCT_RESOURCE_OPTION_ID
                          , MARGIN_SCT_RESOURCE_OPTION_ID
                          , SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID
                          , ADJUST_PRICE_SCT_RESOURCE_OPTION_ID

                          , CREATE_BY
                          , UPDATE_BY
                          , UPDATE_DATE
                          , INUSE
                  )
              VALUES
                  (
                            'dataItem.SCT_DETAIL_FOR_ADJUST_ID'
                          , 'dataItem.SCT_ID'
                          , dataItem.TOTAL_INDIRECT_COST
                          , dataItem.CIT
                          , dataItem.VAT
                          , dataItem.GA
                          , dataItem.MARGIN
                          , dataItem.SELLING_EXPENSE
                          , dataItem.ADJUST_PRICE

                          , 'dataItem.IS_FROM_SCT_COPY'
                          , dataItem.TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID
                          , dataItem.CIT_SCT_RESOURCE_OPTION_ID
                          , dataItem.VAT_SCT_RESOURCE_OPTION_ID
                          , dataItem.GA_SCT_RESOURCE_OPTION_ID
                          , dataItem.MARGIN_SCT_RESOURCE_OPTION_ID
                          , dataItem.SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID
                          , dataItem.ADJUST_PRICE_SCT_RESOURCE_OPTION_ID

                          , 'dataItem.CREATE_BY'
                          , 'dataItem.UPDATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 1
                  );
              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.SCT_DETAIL_FOR_ADJUST_ID', dataItem['SCT_DETAIL_FOR_ADJUST_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())
    sql = sql.replaceAll(
      'dataItem.TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID',
      dataItem['TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID'] === '' ? 'NULL' : dataItem['TOTAL_INDIRECT_COST_SCT_RESOURCE_OPTION_ID'].toString()
    )
    sql = sql.replaceAll('dataItem.CIT_SCT_RESOURCE_OPTION_ID', dataItem['CIT_SCT_RESOURCE_OPTION_ID'] === '' ? 'NULL' : dataItem['CIT_SCT_RESOURCE_OPTION_ID'].toString())
    sql = sql.replaceAll('dataItem.VAT_SCT_RESOURCE_OPTION_ID', dataItem['VAT_SCT_RESOURCE_OPTION_ID'] === '' ? 'NULL' : dataItem['VAT_SCT_RESOURCE_OPTION_ID'].toString())
    sql = sql.replaceAll('dataItem.GA_SCT_RESOURCE_OPTION_ID', dataItem['GA_SCT_RESOURCE_OPTION_ID'] === '' ? 'NULL' : dataItem['GA_SCT_RESOURCE_OPTION_ID'].toString())
    sql = sql.replaceAll('dataItem.MARGIN_SCT_RESOURCE_OPTION_ID', dataItem['MARGIN_SCT_RESOURCE_OPTION_ID'] === '' ? 'NULL' : dataItem['MARGIN_SCT_RESOURCE_OPTION_ID'].toString())
    sql = sql.replaceAll(
      'dataItem.SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID',
      dataItem['SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID'] === '' ? 'NULL' : dataItem['SELLING_EXPENSE_SCT_RESOURCE_OPTION_ID'].toString()
    )
    sql = sql.replaceAll(
      'dataItem.ADJUST_PRICE_SCT_RESOURCE_OPTION_ID',
      dataItem['ADJUST_PRICE_SCT_RESOURCE_OPTION_ID'] === '' ? 'NULL' : dataItem['ADJUST_PRICE_SCT_RESOURCE_OPTION_ID'].toString()
    )

    sql = sql.replaceAll('dataItem.TOTAL_INDIRECT_COST', dataItem['TOTAL_INDIRECT_COST'] === '' ? 'NULL' : dataItem['TOTAL_INDIRECT_COST'].toString())
    sql = sql.replaceAll('dataItem.CIT', dataItem['CIT'] === '' ? 'NULL' : dataItem['CIT'].toString())
    sql = sql.replaceAll('dataItem.VAT', dataItem['VAT'] === '' ? 'NULL' : dataItem['VAT'].toString())
    sql = sql.replaceAll('dataItem.GA', dataItem['GA'] === '' ? 'NULL' : dataItem['GA'].toString())
    sql = sql.replaceAll('dataItem.MARGIN', dataItem['MARGIN'] === '' ? 'NULL' : dataItem['MARGIN'].toString())
    sql = sql.replaceAll('dataItem.SELLING_EXPENSE', dataItem['SELLING_EXPENSE'] === '' ? 'NULL' : dataItem['SELLING_EXPENSE'].toString())
    sql = sql.replaceAll('dataItem.ADJUST_PRICE', dataItem['ADJUST_PRICE'] === '' ? 'NULL' : dataItem['ADJUST_PRICE'].toString())

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteSctDetailForAdjustBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `
              UPDATE
                        dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST
              SET
                        INUSE = 0
                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                      , UPDATE_DATE = CURRENT_TIMESTAMP()
              WHERE
                            SCT_ID = 'dataItem.SCT_ID'
                        AND IS_FROM_SCT_COPY = 'dataItem.IS_FROM_SCT_COPY'
                        AND INUSE = 1
              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  insertAdjustPriceSctTotalCost: async (dataItem: any, uuid: any) => {
    let sql = `
              INSERT INTO dataItem.STANDARD_COST_DB.SCT_TOTAL_COST
                  (
                            SCT_TOTAL_COST_ID
                          , SCT_ID
                          , ADJUST_PRICE
                          , REMARK_FOR_ADJUST_PRICE
                          , NOTE
                          , DESCRIPTION
                          , CREATE_BY
                          , CREATE_DATE
                          , UPDATE_BY
                          , UPDATE_DATE
                          , INUSE
                  )
              VALUES
                  (
                            'dataItem.UUID_SCT_TOTAL_COST_ID'
                          , 'dataItem.SCT_ID'
                          , 'dataItem.ADJUST_PRICE'
                          , dataItem.REMARK_FOR_ADJUST_PRICE
                          , 'dataItem.NOTE_PRICE'
                          , ''
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 1
                  );

              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.UUID_SCT_TOTAL_COST_ID', uuid)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.ADJUST_PRICE', dataItem['ADJUST_PRICE'])
    sql = sql.replaceAll('dataItem.REMARK_FOR_ADJUST_PRICE', dataItem?.['REMARK_FOR_ADJUST_PRICE'] ? `'${dataItem['REMARK_FOR_ADJUST_PRICE']}'` : "''")
    sql = sql.replaceAll('dataItem.NOTE_PRICE', dataItem['NOTE_PRICE'])

    return sql
  },
  deleteAdjustPriceSctTotalCostBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `
              UPDATE
                        dataItem.STANDARD_COST_DB.SCT_TOTAL_COST
              SET
                        INUSE = 0
                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                      , UPDATE_DATE = CURRENT_TIMESTAMP()
              WHERE
                            SCT_ID = 'dataItem.SCT_ID'
                        AND INUSE = 1
                        AND IS_FROM_SCT_COPY = 'dataItem.IS_FROM_SCT_COPY'
              `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  generateSctTotalCostId: async () => {
    let sql = `
            SET @sctTotalCostId = (SELECT IFNULL(MAX(SCT_TOTAL_COST_ID), 0) + 1 FROM dataItem.STANDARD_COST_DB.SCT_TOTAL_COST);
    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    // console.log(sql)
    return sql
  },
  updateEstimatePeriodAndNoteBySctId: async (dataItem: {
    SCT_ID: string
    ESTIMATE_PERIOD_START_DATE: string
    ESTIMATE_PERIOD_END_DATE: string
    NOTE: string
    UPDATE_BY: string
  }) => {
    let sql = `         UPDATE
                                  dataItem.STANDARD_COST_DB.SCT
                        SET
                                  ESTIMATE_PERIOD_START_DATE = 'dataItem.ESTIMATE_PERIOD_START_DATE'
                                , ESTIMATE_PERIOD_END_DATE = 'dataItem.ESTIMATE_PERIOD_END_DATE'
                                , NOTE = 'dataItem.NOTE'
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                SCT_ID = 'dataItem.SCT_ID'`

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_START_DATE', dataItem['ESTIMATE_PERIOD_START_DATE'])
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_END_DATE', dataItem['ESTIMATE_PERIOD_END_DATE'])
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
}
