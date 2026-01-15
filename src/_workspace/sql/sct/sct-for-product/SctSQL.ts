export const SctSQL = {
  insert: async (dataItem: {
    SCT_ID: string
    SCT_FORMULA_VERSION_ID: number
    SCT_REVISION_CODE: string
    FISCAL_YEAR: number
    SCT_PATTERN_ID: number
    PRODUCT_TYPE_ID: number
    BOM_ID: string
    ESTIMATE_PERIOD_START_DATE: string
    ESTIMATE_PERIOD_END_DATE: string
    NOTE: string
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
    DESCRIPTION: string
  }) => {
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
                      , DESCRIPTION
                      , CREATE_BY
                      , UPDATE_BY
                      , UPDATE_DATE
                      , INUSE
              )
              VALUES
              (
                        'dataItem.SCT_ID'
                      , 'dataItem.SCT_FORMULA_VERSION_ID'
                      , 'dataItem.SCT_REVISION_CODE'
                      , 'dataItem.FISCAL_YEAR'
                      , 'dataItem.SCT_PATTERN_ID'
                      , 'dataItem.PRODUCT_TYPE_ID'
                      , 'dataItem.BOM_ID'
                      ,  dataItem.ESTIMATE_PERIOD_START_DATE
                      ,  dataItem.ESTIMATE_PERIOD_END_DATE
                      , 'dataItem.NOTE'
                      , 'dataItem.DESCRIPTION'
                      , 'dataItem.CREATE_BY'
                      , 'dataItem.UPDATE_BY'
                      ,  CURRENT_TIMESTAMP()
                      , 'dataItem.INUSE'
              );
                      `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.SCT_FORMULA_VERSION_ID', dataItem['SCT_FORMULA_VERSION_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_REVISION_CODE', dataItem['SCT_REVISION_CODE'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_START_DATE', dataItem['ESTIMATE_PERIOD_START_DATE'] ? `'${dataItem['ESTIMATE_PERIOD_START_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_END_DATE', dataItem['ESTIMATE_PERIOD_END_DATE'] ? `'${dataItem['ESTIMATE_PERIOD_END_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())

    return sql
  },
  getBySctId: async (dataItem: { SCT_REVISION_CODE: string }) => {
    let sql = `
                        SELECT
                                  tb_1.SCT_ID
                                , tb_1.SCT_REVISION_CODE
                                , tb_1.CREATE_BY
                                , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s') AS CREATE_DATE
                                , tb_1.UPDATE_BY
                                , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                , tb_1.INUSE
                                , tb_3.SCT_STATUS_PROGRESS_ID
                                , tb_3.SCT_STATUS_PROGRESS_NO
                                , tb_3.SCT_STATUS_PROGRESS_NAME

                                , tb_4.PRODUCT_TYPE_ID
                                , tb_5.PRODUCT_SUB_ID
                                , tb_6.PRODUCT_MAIN_ID
                                , tb_7.PRODUCT_CATEGORY_ID

                                , tb_4.PRODUCT_TYPE_CODE_FOR_SCT AS "PRODUCT_TYPE_CODE"
                                , tb_4.PRODUCT_TYPE_NAME
                                , tb_5.PRODUCT_SUB_NAME
                                , tb_5.PRODUCT_SUB_ALPHABET
                                , tb_6.PRODUCT_MAIN_NAME
                                , tb_6.PRODUCT_MAIN_ALPHABET
                                , tb_7.PRODUCT_CATEGORY_NAME
                                , tb_1.FISCAL_YEAR
                                , tb_11.PRODUCT_SPECIFICATION_TYPE_NAME
                                , tb_12.BOM_ID
                                , tb_12.BOM_CODE
                                , tb_12.BOM_NAME
                                , tb_13.FLOW_ID
                                , tb_13.FLOW_CODE
                                , tb_13.FLOW_NAME
                                , tb_8.SCT_PATTERN_ID
                                , tb_8.SCT_PATTERN_NAME
                                , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_START_DATE
                                , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_END_DATE
                                , tb_15.ITEM_CATEGORY_ID
                                , tb_15.ITEM_CATEGORY_NAME
                                , tb_15.ITEM_CATEGORY_ALPHABET
                                , tb_17.SCT_REASON_SETTING_ID
                                , tb_17.SCT_REASON_SETTING_NAME
                                , tb_19.SCT_TAG_SETTING_ID
                                , tb_19.SCT_TAG_SETTING_NAME
                                , tb_20.ITEM_ID
                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                                        INNER JOIN
                            dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                        ON tb_1.SCT_ID = tb_2.SCT_ID
                                        AND tb_1.SCT_REVISION_CODE = 'dataItem.SCT_REVISION_CODE'
                                        AND tb_2.INUSE =1
                                        INNER JOIN
                            dataItem.STANDARD_COST_DB.sct_status_progress tb_3
                                        ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                                        INNER JOIN
                            product_type tb_4
                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                        INNER JOIN
                            product_sub tb_5
                                        ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
                                        INNER JOIN
                            product_main tb_6
                                        ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
                                        INNER JOIN
                            product_category tb_7
                                        ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
                                        INNER JOIN
                            dataItem.STANDARD_COST_DB.SCT_PATTERN tb_8
                                        ON tb_1.SCT_PATTERN_ID = tb_8.SCT_PATTERN_ID
                                        INNER JOIN
                            product_type_product_specification_document_setting tb_9
                                        ON tb_4.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                        AND tb_9.INUSE = 1
                                        INNER JOIN
                            product_specification_document_setting tb_10
                                        ON tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_10.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                        AND tb_10.INUSE = 1
                                        INNER JOIN
                            PRODUCT_SPECIFICATION_TYPE tb_11
                                        ON tb_10.PRODUCT_SPECIFICATION_TYPE_ID = tb_11.PRODUCT_SPECIFICATION_TYPE_ID
                                        AND tb_11.INUSE = 1
                                        INNER JOIN
                            BOM tb_12
                                        ON tb_1.BOM_ID = tb_12.BOM_ID
                                        INNER JOIN
                            FLOW tb_13
                                        ON tb_12.FLOW_ID = tb_13.FLOW_ID
                                        INNER JOIN
                            PRODUCT_TYPE_ITEM_CATEGORY tb_14
                                        ON tb_4.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID
                                        AND tb_14.INUSE = 1
                                        INNER JOIN
                            ITEM_CATEGORY tb_15
                                        ON tb_14.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_16
                                        ON tb_1.SCT_ID = tb_16.SCT_ID
                                        AND tb_16.INUSE = 1
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_17
                                        ON tb_16.SCT_REASON_SETTING_ID = tb_17.SCT_REASON_SETTING_ID
                                        AND tb_17.INUSE = 1
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_18
                                        ON tb_1.SCT_ID = tb_18.SCT_ID
                                        AND tb_18.INUSE = 1
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_19
                                        ON tb_18.SCT_TAG_SETTING_ID = tb_19.SCT_TAG_SETTING_ID
                                        AND tb_19.INUSE = 1
                                        LEFT JOIN
                            ITEM_PRODUCT_DETAIL tb_20
                                        ON tb_1.PRODUCT_TYPE_ID = tb_20.PRODUCT_TYPE_ID
                                        AND tb_20.INUSE = 1
                                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_REVISION_CODE', dataItem.SCT_REVISION_CODE)

    return sql
  },

  getByProductTypeIdAndSctReasonSettingIdAndSctTagSettingIdAndSctStatusProgressId: async (dataItem: any) => {
    let sql = `
                  SELECT
                            tb_1.SCT_ID
                          , tb_1.SCT_REVISION_CODE
                          , tb_1.BOM_ID
                          , tb_1.FISCAL_YEAR
                          , tb_1.SCT_PATTERN_ID
                          , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_START_DATE
                          , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_END_DATE
                          , tb_1.PRODUCT_TYPE_ID
                          , tb_5.FLOW_ID
                          , tb_5.BOM_CODE
                  FROM
                          dataItem.STANDARD_COST_DB.SCT tb_1
                                      INNER JOIN
                          dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                          ON tb_1.SCT_ID = tb_2.SCT_ID
                                      AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                      AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                      AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                                      AND tb_2.INUSE = 1
                                      AND tb_2.SCT_STATUS_PROGRESS_ID = 'dataItem.SCT_STATUS_PROGRESS_ID'
                                      INNER JOIN
                          dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_3
                                          ON tb_1.SCT_ID = tb_3.SCT_ID
                                      AND tb_3.INUSE = 1
                                      AND tb_3.SCT_REASON_SETTING_ID = 'dataItem.SCT_REASON_SETTING_ID'
                                      INNER JOIN
                          dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_4
                                          ON tb_1.SCT_ID = tb_4.SCT_ID
                                      AND tb_4.SCT_TAG_SETTING_ID = 'dataItem.SCT_TAG_SETTING_ID'
                                      AND tb_4.INUSE = 1
                                      INNER JOIN
                          BOM tb_5
                                      ON tb_1.BOM_ID = tb_5.BOM_ID

                                      `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem.FISCAL_YEAR)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem.PRODUCT_TYPE_ID)
    sql = sql.replaceAll('dataItem.SCT_STATUS_PROGRESS_ID', dataItem.SCT_STATUS_PROGRESS_ID)
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem.SCT_REASON_SETTING_ID)
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem.SCT_TAG_SETTING_ID)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem.SCT_PATTERN_ID)

    return sql
  },
  calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId: async (dataItem: {
    SCT_STATUS_PROGRESS_ID: Number
    ITEM_CATEGORY_ID: Number
    FISCAL_YEAR: Number
    SCT_PATTERN_ID: Number
    SCT_TAG_SETTING_ID: Number
  }) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                        , tb_1.SCT_REVISION_CODE
                FROM
                        dataItem.STANDARD_COST_DB.SCT tb_1
                                INNER JOIN
                        PRODUCT_TYPE_ITEM_CATEGORY tb_2
                                    ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                                AND tb_2.ITEM_CATEGORY_ID = 'dataItem.ITEM_CATEGORY_ID'
                                AND tb_2.INUSE = 1
                                AND tb_1.INUSE = 1
                                INNER JOIN
                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_3
                                    ON tb_1.SCT_ID = tb_3.SCT_ID
                                AND tb_3.INUSE = 1
                                AND tb_3.SCT_STATUS_PROGRESS_ID = 'dataItem.SCT_STATUS_PROGRESS_ID'
                                INNER JOIN
                        dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_4
                                    ON tb_1.SCT_ID = tb_4.SCT_ID
                                AND tb_4.INUSE = 1
                                AND tb_4.SCT_TAG_SETTING_ID = 'dataItem.SCT_TAG_SETTING_ID'
                                INNER JOIN
                        PRODUCT_TYPE tb_5
                                    ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                AND tb_5.INUSE = 1
                                INNER JOIN
                        PRODUCT_SUB tb_6
                                    ON tb_5.PRODUCT_SUB_ID = tb_6.PRODUCT_SUB_ID
                                AND tb_6.INUSE = 1
                                INNER JOIN
                        PRODUCT_MAIN tb_7
                                    ON tb_6.PRODUCT_MAIN_ID = tb_7.PRODUCT_MAIN_ID
                                AND tb_7.INUSE = 1
                                INNER JOIN
                        PRODUCT_CATEGORY tb_8
                                    ON tb_7.PRODUCT_CATEGORY_ID = tb_8.PRODUCT_CATEGORY_ID
                                AND tb_8.INUSE = 1
         `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_STATUS_PROGRESS_ID', dataItem['SCT_STATUS_PROGRESS_ID'].toString())
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'].toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'].toString())

    return sql
  },
  getSctWithoutSellingPrice: async () => {
    let sql = `
                SELECT tb_1.SCT_ID , tb_2.SELLING_PRICE , tb_1.SCT_REVISION_CODE
              FROM

              dataItem.STANDARD_COST_DB.sct tb_1
              inner JOIN
              dataItem.STANDARD_COST_DB.sct_total_cost tb_2 ON  tb_1.SCT_ID = tb_2.SCT_ID
              WHERE tb_1.FISCAL_YEAR = 2025
              AND tb_2.SELLING_PRICE IS null
              AND tb_1.INUSE = 1 AND tb_2.INUSE = 1
              GROUP BY tb_1.SCT_ID

         `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    return sql
  },
  searchSctDetailBySctId: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
            , tb_1.FISCAL_YEAR
            , tb_1.ESTIMATE_PERIOD_START_DATE AS START_DATE
            , tb_1.ESTIMATE_PERIOD_END_DATE AS END_DATE
            , tb_1.NOTE
            , tb_2.SCT_PATTERN_ID
            , tb_2.SCT_PATTERN_NAME
            , tb_3.PRODUCT_TYPE_ID
            , tb_3.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
            , tb_3.PRODUCT_TYPE_NAME
            , tb_4.PRODUCT_SUB_ID
            , tb_4.PRODUCT_SUB_NAME
            , tb_4.PRODUCT_SUB_ALPHABET
            , tb_5.PRODUCT_MAIN_ID
            , tb_5.PRODUCT_MAIN_NAME
            , tb_5.PRODUCT_MAIN_ALPHABET
            , tb_6.PRODUCT_CATEGORY_ID
            , tb_6.PRODUCT_CATEGORY_NAME
            , tb_6.PRODUCT_CATEGORY_ALPHABET
            , tb_7.SCT_STATUS_PROGRESS_ID
            , tb_9.SCT_REASON_SETTING_ID
            , tb_9.SCT_REASON_SETTING_NAME
            , tb_11.SCT_TAG_SETTING_ID
            , tb_11.SCT_TAG_SETTING_NAME
            , tb_12.BOM_ID
            , tb_12.BOM_CODE
            , tb_12.BOM_NAME
            , tb_14.BOM_CODE AS BOM_CODE_ACTUAL
            , tb_14.BOM_NAME AS BOM_NAME_ACTUAL
            , tb_15.FLOW_CODE
            , tb_17.ITEM_CATEGORY_NAME
            , tb_20.PRODUCT_SPECIFICATION_TYPE_NAME AS PRODUCT_SPECIFICATION_TYPE
            , tb_21.ADJUST_PRICE
            , tb_21.REMARK_FOR_ADJUST_PRICE
            , tb_21.NOTE AS NOTE_PRICE
            , tb_21.SELLING_EXPENSE_FOR_SELLING_PRICE
            , tb_21.GA_FOR_SELLING_PRICE
            , tb_21.MARGIN_FOR_SELLING_PRICE
            , tb_21.CIT_FOR_SELLING_PRICE
            , tb_21.SELLING_PRICE_BY_FORMULA
            , tb_21.SELLING_PRICE
            , tb_21.TOTAL_ESSENTIAL_TIME
            , tb_21.TOTAL_PRICE_OF_RAW_MATERIAL
            , tb_21.TOTAL_PRICE_OF_SUB_ASSY
            , tb_21.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
            , tb_21.TOTAL_PRICE_OF_CONSUMABLE
            , tb_21.TOTAL_PRICE_OF_PACKING
            , tb_21.TOTAL_PRICE_OF_ALL_OF_ITEMS
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
              JOIN
            dataItem.STANDARD_COST_DB.SCT_PATTERN tb_2
              ON
            tb_1.SCT_PATTERN_ID = tb_2.SCT_PATTERN_ID AND tb_2.INUSE = 1
              JOIN
            PRODUCT_TYPE tb_3
              ON
            tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID AND tb_3.INUSE = 1
              JOIN
            PRODUCT_SUB tb_4
              ON
            tb_3.PRODUCT_SUB_ID = tb_4.PRODUCT_SUB_ID AND tb_4.INUSE = 1
              JOIN
            PRODUCT_MAIN tb_5
              ON
            tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID AND tb_5.INUSE = 1
              JOIN
            PRODUCT_CATEGORY tb_6
              ON
            tb_5.PRODUCT_CATEGORY_ID = tb_6.PRODUCT_CATEGORY_ID AND tb_6.INUSE = 1
              JOIN
            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_7
              ON
            tb_1.SCT_ID = tb_7.SCT_ID AND tb_7.INUSE = 1
              LEFT JOIN
            dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_8
              ON
            tb_1.SCT_ID = tb_8.SCT_ID AND tb_8.INUSE = 1
              LEFT JOIN
            dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_9
              ON
            tb_8.SCT_REASON_SETTING_ID = tb_9.SCT_REASON_SETTING_ID AND tb_9.INUSE = 1
              LEFT JOIN
            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_10
              ON
            tb_1.SCT_ID = tb_10.SCT_ID AND tb_10.INUSE = 1
              LEFT JOIN
            dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_11
              ON
            tb_10.SCT_TAG_SETTING_ID = tb_11.SCT_TAG_SETTING_ID AND tb_11.INUSE = 1
              JOIN
            BOM tb_12
              ON
            tb_1.BOM_ID = tb_12.BOM_ID AND tb_12.INUSE = 1
              JOIN
            PRODUCT_TYPE_BOM tb_13
              ON
            tb_1.PRODUCT_TYPE_ID = tb_13.PRODUCT_TYPE_ID AND tb_13.INUSE = 1
              JOIN
            BOM tb_14
              ON
            tb_13.BOM_ID = tb_14.BOM_ID AND tb_14.INUSE = 1
              JOIN
            FLOW tb_15
              ON
            tb_12.FLOW_ID = tb_15.FLOW_ID AND tb_15.INUSE = 1
              JOIN
            PRODUCT_TYPE_ITEM_CATEGORY tb_16
              ON
            tb_1.PRODUCT_TYPE_ID = tb_16.PRODUCT_TYPE_ID AND tb_16.INUSE = 1
              JOIN
            ITEM_CATEGORY tb_17
              ON
            tb_16.ITEM_CATEGORY_ID = tb_17.ITEM_CATEGORY_ID AND tb_17.INUSE = 1
              JOIN
            PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_18
              ON
            tb_1.PRODUCT_TYPE_ID = tb_18.PRODUCT_TYPE_ID AND tb_18.INUSE = 1
              JOIN
            PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_19
              ON
            tb_18.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_19.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID AND tb_19.INUSE = 1
              JOIN
            PRODUCT_SPECIFICATION_TYPE tb_20
              ON
            tb_19.PRODUCT_SPECIFICATION_TYPE_ID = tb_20.PRODUCT_SPECIFICATION_TYPE_ID AND tb_20.INUSE = 1
              LEFT JOIN
            dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_21
              ON
            tb_1.SCT_ID = tb_21.SCT_ID AND tb_21.INUSE = 1
        WHERE
            tb_1.SCT_ID = 'dataItem.SCT_ID'
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  searchSctResourceOptionBySctId: async (dataItem: any) => {
    let sql = `
        SELECT
              SCT_COMPONENT_TYPE_ID
            , SCT_RESOURCE_OPTION_ID
        FROM
          dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
        WHERE
              SCT_ID = 'dataItem.SCT_ID'
          AND INUSE = 1
        ORDER BY
              SCT_COMPONENT_TYPE_ID
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  searchSctCostConditionByRealtime: async (dataItem: any) => {
    let sql = `
        SELECT
              DIRECT_COST_CONDITION_ID
            , DIRECT_UNIT_PROCESS_COST
            , INDIRECT_RATE_OF_DIRECT_PROCESS_COST
            , FISCAL_YEAR
            , VERSION
        FROM
            DIRECT_COST_CONDITION
        WHERE
                FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND VERSION = (
                            SELECT
                                MAX(VERSION)
                            FROM
                                DIRECT_COST_CONDITION
                            WHERE
                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND INUSE = 1
                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                          )
            AND INUSE = 1
            AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID';

        SELECT
              INDIRECT_COST_CONDITION_ID
            , LABOR
            , DEPRECIATION
            , OTHER_EXPENSE
            , TOTAL_INDIRECT_COST
            , FISCAL_YEAR
            , VERSION
        FROM
            INDIRECT_COST_CONDITION
        WHERE
                FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND VERSION = (
                            SELECT
                                MAX(VERSION)
                            FROM
                                INDIRECT_COST_CONDITION
                            WHERE
                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND INUSE = 1
                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                          )
            AND INUSE = 1
            AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID';

        SELECT
              OTHER_COST_CONDITION_ID
            , GA
            , MARGIN
            , SELLING_EXPENSE
            , VAT
            , CIT
            , FISCAL_YEAR
            , VERSION
        FROM
            OTHER_COST_CONDITION
        WHERE
                FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND VERSION = (
                            SELECT
                                MAX(VERSION)
                            FROM
                                OTHER_COST_CONDITION
                            WHERE
                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND INUSE = 1
                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                          )
            AND INUSE = 1
            AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID';

        SELECT
              SPECIAL_COST_CONDITION_ID
            , ADJUST_PRICE
            , FISCAL_YEAR
            , VERSION
        FROM
            SPECIAL_COST_CONDITION
        WHERE
                FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND VERSION = (
                            SELECT
                                MAX(VERSION)
                            FROM
                                SPECIAL_COST_CONDITION
                            WHERE
                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND INUSE = 1
                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                          )
            AND INUSE = 1
            AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID';
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem.FISCAL_YEAR)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem.PRODUCT_MAIN_ID)

    return sql
  },
  searchSctCostConditionBySctId: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_2.DIRECT_UNIT_PROCESS_COST
            , tb_2.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
              JOIN
            dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
              ON
            tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;


        SELECT
              tb_1.SCT_ID
            , IF(tb_3.TOTAL_INDIRECT_COST IS NOT NULL, tb_3.TOTAL_INDIRECT_COST, tb_2.INDIRECT_COST_SALE_AVE) AS TOTAL_INDIRECT_COST
            , IF(tb_3.TOTAL_INDIRECT_COST IS NOT NULL, 1, 0) AS IS_MANUAL_TOTAL_INDIRECT_COST
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
              JOIN
            dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
              ON
            tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
              LEFT JOIN
            dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_3
              ON
            tb_1.SCT_ID = tb_3.SCT_ID AND tb_3.INUSE = 1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;


        SELECT
              tb_1.SCT_ID
            , IF(tb_3.CIT IS NOT NULL, tb_3.CIT, tb_2.CIT) AS CIT
            , IF(tb_3.CIT IS NOT NULL, 1, 0) AS IS_MANUAL_CIT
            , IF(tb_3.VAT IS NOT NULL, tb_3.VAT, tb_2.VAT) AS VAT
            , IF(tb_3.VAT IS NOT NULL, tb_3.VAT, NULL) AS VAT_MANUAL
            , IF(tb_3.VAT IS NOT NULL, 1, 0) AS IS_MANUAL_VAT
            , tb_2.GA
            , tb_2.MARGIN
            , tb_2.SELLING_EXPENSE
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
              JOIN
            dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
              ON
            tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
              LEFT JOIN
            dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_3
              ON
            tb_1.SCT_ID = tb_3.SCT_ID AND tb_3.INUSE = 1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;


        SELECT
              tb_1.SCT_ID
            , tb_2.ADJUST_PRICE
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
              JOIN
            dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
              ON
            tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  searchSctMaterialPriceByRealtimeAndRMPackingConsume: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
            , tb_2.USAGE_QUANTITY
            , tb_3.PURCHASE_PRICE
            , tb_3.PURCHASE_PRICE_CURRENCY_ID
            , tb_4.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY
            , tb_3.PURCHASE_PRICE_UNIT_ID
            , tb_5.SYMBOL AS PURCHASE_UNIT
            , tb_3.ITEM_M_S_PRICE_VALUE
            , tb_3.ITEM_M_S_PRICE_ID
            , tb_8.SYMBOL AS USAGE_UNIT
            , tb_7.PURCHASE_UNIT_RATIO
            , tb_7.USAGE_UNIT_RATIO
            , tb_7.ITEM_CODE_FOR_SUPPORT_MES
            , tb_7.ITEM_ID
            , tb_7.ITEM_INTERNAL_SHORT_NAME
            , tb_11.ITEM_CATEGORY_ID
            , tb_10.IMPORT_FEE_RATE
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
              JOIN
            BOM_FLOW_PROCESS_ITEM_USAGE tb_2
              ON
            tb_1.BOM_ID = tb_2.BOM_ID AND tb_2.INUSE = 1
              LEFT JOIN
            (
              SELECT
                    tb_3_1.ITEM_ID
                  , tb_3_1.PURCHASE_PRICE
                  , tb_3_1.PURCHASE_PRICE_CURRENCY_ID
                  , tb_3_1.PURCHASE_PRICE_UNIT_ID
                  , tb_4_1.IMPORT_FEE_ID
                  , tb_4_1.ITEM_M_S_PRICE_VALUE
                  , tb_4_1.ITEM_M_S_PRICE_ID
              FROM
                  ITEM_M_O_PRICE tb_3_1
                    JOIN
                  ITEM_M_S_PRICE tb_4_1
                    ON
                  tb_3_1.ITEM_M_O_PRICE_ID = tb_4_1.ITEM_M_O_PRICE_ID AND tb_4_1.INUSE = 1 AND tb_3_1.INUSE = 1 AND tb_3_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    JOIN
                  (
                    SELECT
                          tbs_1.ITEM_ID
                        , MAX(tbs_2.VERSION) AS max_revision
                    FROM
                        ITEM_M_O_PRICE tbs_1
                          JOIN
                        ITEM_M_S_PRICE tbs_2
                          ON
                        tbs_1.ITEM_M_O_PRICE_ID = tbs_2.ITEM_M_O_PRICE_ID AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1 AND tbs_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    GROUP BY
                        tbs_1.ITEM_ID
                  ) AS tb_5_1
                          ON
                        tb_3_1.ITEM_ID = tb_5_1.ITEM_ID AND tb_4_1.VERSION = tb_5_1.max_revision
            ) AS tb_3
              ON
            tb_2.ITEM_ID = tb_3.ITEM_ID
              JOIN
            CURRENCY tb_4
              ON
            tb_3.PURCHASE_PRICE_CURRENCY_ID = tb_4.CURRENCY_ID
              JOIN
            UNIT_OF_MEASUREMENT tb_5
              ON
            tb_3.PURCHASE_PRICE_UNIT_ID = tb_5.UNIT_OF_MEASUREMENT_ID
              JOIN
            ITEM_MANUFACTURING tb_7
              ON
            tb_2.ITEM_ID = tb_7.ITEM_ID
              JOIN
            UNIT_OF_MEASUREMENT tb_8
              ON
            tb_7.USAGE_UNIT_ID = tb_8.UNIT_OF_MEASUREMENT_ID
              JOIN
            ITEM tb_9
              ON
            tb_7.ITEM_ID = tb_9.ITEM_ID
              LEFT JOIN
            IMPORT_FEE tb_10
              ON
            tb_3.IMPORT_FEE_ID = tb_10.IMPORT_FEE_ID
              JOIN
            BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_11
              ON
            tb_2.ITEM_ID = tb_11.ITEM_ID AND tb_11.INUSE = 1
            AND tb_2.BOM_ID = tb_11.BOM_ID
            AND tb_2.FLOW_PROCESS_ID = tb_11.FLOW_PROCESS_ID
            AND tb_2.NO = tb_11.NO
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_9.ITEM_CATEGORY_ID NOT IN (1, 2, 3)
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  searchSctMaterialPriceByRealtimeAndFGSemiFGSubAssy: async (dataItem: any) => {
    let sql = `
        SET @sctFiscalYear = (
          SELECT
              FISCAL_YEAR
          FROM
              dataItem.STANDARD_COST_DB.SCT
          WHERE
              SCT_ID = 'dataItem.SCT_ID'
        );

        WITH LatestVersions AS (
          SELECT
                ITEM_ID
              , MAX(ITEM_M_O_PRICE_VERSION_NO) AS max_revision
          FROM
              ITEM_M_O_PRICE
          WHERE
                  INUSE = 1
              AND FISCAL_YEAR = @sctFiscalYear
          GROUP BY
              ITEM_ID
        )

        SELECT
              tb_1.SCT_ID
            , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
            , tb_2.USAGE_QUANTITY
            , tb_3.PURCHASE_PRICE
            , tb_3.PURCHASE_PRICE_CURRENCY_ID
            , tb_4.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY
            , tb_3.PURCHASE_PRICE_UNIT_ID
            , tb_5.SYMBOL AS PURCHASE_UNIT
            , tb_6.ITEM_M_S_PRICE_VALUE
            , tb_6.ITEM_M_S_PRICE_ID
            , tb_8.SYMBOL AS USAGE_UNIT
            , tb_7.PURCHASE_UNIT_RATIO
            , tb_7.USAGE_UNIT_RATIO
            , tb_7.ITEM_CODE_FOR_SUPPORT_MES
            , tb_7.ITEM_ID
            , tb_7.ITEM_INTERNAL_SHORT_NAME
            , tb_11.ITEM_CATEGORY_ID
            , tb_10.IMPORT_FEE_RATE
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
              JOIN
            BOM_FLOW_PROCESS_ITEM_USAGE tb_2
              ON
            tb_1.BOM_ID = tb_2.BOM_ID AND tb_2.INUSE = 1
              JOIN
            ITEM_M_O_PRICE tb_3
              ON
            tb_2.ITEM_ID = tb_3.ITEM_ID AND tb_3.INUSE = 1
            JOIN LatestVersions lv
              ON
            tb_3.ITEM_ID = lv.ITEM_ID AND tb_3.ITEM_M_O_PRICE_VERSION_NO = lv.max_revision
              JOIN
            CURRENCY tb_4
              ON
            tb_3.PURCHASE_PRICE_CURRENCY_ID = tb_4.CURRENCY_ID
              JOIN
            UNIT_OF_MEASUREMENT tb_5
              ON
            tb_3.PURCHASE_PRICE_UNIT_ID = tb_5.UNIT_OF_MEASUREMENT_ID
              JOIN
            ITEM_M_S_PRICE tb_6
              ON
            tb_3.ITEM_M_O_PRICE_ID = tb_6.ITEM_M_O_PRICE_ID
              JOIN
            ITEM_MANUFACTURING tb_7
              ON
            tb_2.ITEM_ID = tb_7.ITEM_ID
              JOIN
            UNIT_OF_MEASUREMENT tb_8
              ON
            tb_7.USAGE_UNIT_ID = tb_8.UNIT_OF_MEASUREMENT_ID
              JOIN
            ITEM tb_9
              ON
            tb_7.ITEM_ID = tb_9.ITEM_ID
              LEFT JOIN
            IMPORT_FEE tb_10
              ON
            tb_6.IMPORT_FEE_ID = tb_10.IMPORT_FEE_ID
              JOIN
            BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_11
              ON
            tb_2.ITEM_ID = tb_11.ITEM_ID AND tb_11.INUSE = 1 AND tb_2.BOM_ID = tb_11.BOM_ID AND tb_2.FLOW_PROCESS_ID = tb_11.FLOW_PROCESS_ID AND tb_2.NO = tb_11.NO
    WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_6.FISCAL_YEAR = @sctFiscalYear
            AND tb_9.ITEM_CATEGORY_ID IN (1, 2, 3)
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  searchSctMaterialPriceBySctId: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID
            , tb_1.ITEM_M_S_PRICE_ID
            , tb_2.ITEM_M_S_PRICE_VALUE
            , tb_3.ITEM_ID
            , tb_3.PURCHASE_PRICE
            , tb_4.ITEM_CODE_FOR_SUPPORT_MES
            , tb_4.ITEM_INTERNAL_SHORT_NAME
            , tb_9.ITEM_CATEGORY_ID
            , tb_6.IMPORT_FEE_RATE
            , tb_7.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY
            , tb_7.CURRENCY_ID AS PURCHASE_PRICE_CURRENCY_ID
            , tb_3.PURCHASE_PRICE_UNIT_ID
            , tb_4.PURCHASE_UNIT_RATIO
            , tb_4.USAGE_UNIT_RATIO
            , tb_8.SYMBOL AS USAGE_UNIT
            , tb_5.NO AS ITEM_NO
            , tb_1.AMOUNT
            , tb_10.ITEM_CATEGORY_NAME
            , tb_5.USAGE_QUANTITY
            , tb_11.NO AS PROCESS_NO
            , tb_12.PROCESS_NAME
            , tb_12.PROCESS_ID
            , tb_13.TOTAL_COUNT_PROCESS
            , tb_14.SYMBOL AS PURCHASE_UNIT
        FROM
            dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_1
              JOIN
            ITEM_M_S_PRICE tb_2
              ON
            tb_1.ITEM_M_S_PRICE_ID = tb_2.ITEM_M_S_PRICE_ID AND tb_2.INUSE = 1
              JOIN
            ITEM_M_O_PRICE tb_3
              ON
            tb_2.ITEM_M_O_PRICE_ID = tb_3.ITEM_M_O_PRICE_ID AND tb_3.INUSE = 1
              JOIN
            ITEM_MANUFACTURING tb_4
              ON
            tb_3.ITEM_ID = tb_4.ITEM_ID AND tb_4.INUSE = 1
              JOIN
            BOM_FLOW_PROCESS_ITEM_USAGE tb_5
              ON
            tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_5.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_5.INUSE = 1
              LEFT JOIN
            IMPORT_FEE tb_6
              ON
            tb_2.IMPORT_FEE_ID = tb_6.IMPORT_FEE_ID AND tb_6.INUSE = 1
              JOIN
            CURRENCY tb_7
              ON
            tb_3.PURCHASE_PRICE_CURRENCY_ID = tb_7.CURRENCY_ID AND tb_7.INUSE = 1
              JOIN
            UNIT_OF_MEASUREMENT tb_8
              ON
            tb_4.USAGE_UNIT_ID = tb_8.UNIT_OF_MEASUREMENT_ID AND tb_8.INUSE = 1
              JOIN
            BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_9
              ON
            tb_5.ITEM_ID = tb_9.ITEM_ID AND tb_9.INUSE = 1 AND tb_5.BOM_ID = tb_9.BOM_ID AND tb_5.FLOW_PROCESS_ID = tb_9.FLOW_PROCESS_ID AND tb_5.NO = tb_9.NO
              JOIN
            ITEM_CATEGORY tb_10
              ON
            tb_9.ITEM_CATEGORY_ID = tb_10.ITEM_CATEGORY_ID AND tb_10.INUSE = 1
              JOIN
            FLOW_PROCESS tb_11
              ON
            tb_9.FLOW_PROCESS_ID = tb_11.FLOW_PROCESS_ID AND tb_11.INUSE = 1
              JOIN
            PROCESS tb_12
              ON
            tb_11.PROCESS_ID = tb_12.PROCESS_ID AND tb_12.INUSE = 1
              JOIN
            FLOW tb_13
              ON
            tb_11.FLOW_ID = tb_13.FLOW_ID AND tb_13.INUSE = 1
              JOIN
            UNIT_OF_MEASUREMENT tb_14
              ON
            tb_4.PURCHASE_UNIT_ID = tb_14.UNIT_OF_MEASUREMENT_ID AND tb_14.INUSE = 1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  searchSctYRGRByRealtime: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_3.PROCESS_ID
            , tb_3.YIELD_RATE_FOR_SCT
            , tb_3.YIELD_ACCUMULATION_FOR_SCT
            , tb_3.GO_STRAIGHT_RATE_FOR_SCT
            , tb_3.COLLECTION_POINT_FOR_SCT
        FROM
            BOM tb_1
              JOIN
            FLOW_PROCESS tb_2
              ON
            tb_1.FLOW_ID = tb_2.FLOW_ID AND tb_2.INUSE = 1
              JOIN
            YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_3
              ON
            tb_2.PROCESS_ID = tb_3.PROCESS_ID AND tb_3.INUSE = 1
        WHERE
                tb_1.BOM_ID = 'dataItem.BOM_ID'
            AND tb_3.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND tb_3.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
            AND tb_3.REVISION_NO = (
                SELECT
                    MAX(tb_11.REVISION_NO)
                FROM
                    YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_11
                WHERE
                        tb_11.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    AND tb_11.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                    AND tb_11.INUSE = 1
            );

        SELECT
              TOTAL_YIELD_RATE_FOR_SCT
            , TOTAL_GO_STRAIGHT_RATE_FOR_SCT
        FROM
            YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT
        WHERE
                FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
            AND REVISION_NO = (
                    SELECT
                        MAX(REVISION_NO)
                    FROM
                        YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT
                    WHERE
                            FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                        AND PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                        AND INUSE = 1
            );
            `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
  searchSctYRGRBySctId: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.YIELD_RATE AS YIELD_RATE_FOR_SCT
            , tb_1.YIELD_ACCUMULATION AS YIELD_ACCUMULATION_FOR_SCT
            , tb_1.GO_STRAIGHT_RATE AS GO_STRAIGHT_RATE_FOR_SCT
            , tb_1.FLOW_PROCESS_ID
            , tb_3.PROCESS_ID
            , tb_2.OLD_SYSTEM_COLLECTION_POINT AS COLLECTION_POINT_FOR_SCT
        FROM
            dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER tb_1
              LEFT JOIN
            dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_SEQUENCE tb_2
              ON
            tb_1.SCT_ID = tb_2.SCT_ID AND tb_1.FLOW_PROCESS_ID = tb_2.FLOW_PROCESS_ID AND tb_2.INUSE = 1
              LEFT JOIN
            FLOW_PROCESS tb_3
              ON
            tb_2.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID AND tb_3.INUSE = 1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;

        SELECT
              tb_1.SCT_ID
            , tb_1.TOTAL_YIELD_RATE AS TOTAL_YIELD_RATE_FOR_SCT
            , tb_1.TOTAL_GO_STRAIGHT_RATE AS TOTAL_GO_STRAIGHT_RATE_FOR_SCT
        FROM
            dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  searchSctTimeFromMFGByRealtime: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_3.PROCESS_ID
            , tb_3.CLEAR_TIME_FOR_SCT
            , tb_2.FLOW_PROCESS_ID
            , tb_2.NO AS PROCESS_NO
            , tb_4.PROCESS_NAME
            , tb_4.PROCESS_CODE
        FROM
            BOM tb_1
              JOIN
            FLOW_PROCESS tb_2
              ON
            tb_1.FLOW_ID = tb_2.FLOW_ID AND tb_2.INUSE = 1
              JOIN
            dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS tb_3
              ON
            tb_2.PROCESS_ID = tb_3.PROCESS_ID AND tb_3.INUSE = 1
              JOIN
            PROCESS tb_4
              ON
            tb_2.PROCESS_ID = tb_4.PROCESS_ID AND tb_4.INUSE = 1
        WHERE
                tb_1.BOM_ID = 'dataItem.BOM_ID'
            AND tb_3.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND tb_3.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
            AND tb_3.REVISION_NO = (
                SELECT
                    MAX(tb_11.REVISION_NO)
                FROM
                    dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS tb_11
                WHERE
                        tb_11.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    AND tb_11.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                    AND tb_11.INUSE = 1
            );

        SELECT
            TOTAL_CLEAR_TIME_FOR_SCT
        FROM
            dataItem.CYCLE_TIME_DB.clear_time_for_sct_total
        WHERE
                FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
            AND REVISION_NO = (
                SELECT
                    MAX(REVISION_NO)
                FROM
                    dataItem.CYCLE_TIME_DB.clear_time_for_sct_total
                WHERE
                        FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    AND PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                    AND INUSE = 1
            );
                `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
  searchSctTimeFromMFGBySctId: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.CLEAR_TIME AS CLEAR_TIME_FOR_SCT
            , tb_1.ESSENTIAL_TIME
            , tb_1.PROCESS_STANDARD_TIME
            , tb_1.FLOW_PROCESS_ID
            , tb_2.PROCESS_ID
            , tb_3.PROCESS_NAME
            , tb_3.PROCESS_CODE
            , tb_2.NO AS PROCESS_NO
        FROM
            dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG tb_1
              JOIN
            FLOW_PROCESS tb_2
              ON
            tb_1.FLOW_PROCESS_ID = tb_2.FLOW_PROCESS_ID AND tb_2.INUSE = 1
              JOIN
            PROCESS tb_3
              ON
            tb_2.PROCESS_ID = tb_3.PROCESS_ID AND tb_3.INUSE = 1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;

        SELECT
              tb_1.SCT_ID
            , tb_1.TOTAL_CLEAR_TIME AS TOTAL_CLEAR_TIME_FOR_SCT
            , tb_1.TOTAL_ESSENTIAL_TIME
        FROM
            dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  searchSctYRAccumulationMaterialFromEngineerByRealtime: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.ITEM_ID
            , tb_1.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT AS YIELD_ACCUMULATION_FOR_SCT
        FROM
            yield_accumulation_of_item_for_sct tb_1
        WHERE
                tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
            AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
            AND tb_1.REVISION_NO = (
                SELECT
                    MAX(tb_11.REVISION_NO)
                FROM
                    yield_accumulation_of_item_for_sct tb_11
                WHERE
                        tb_11.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    AND tb_11.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                    AND tb_11.INUSE = 1
            );
            `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
  searchSctYRAccumulationMaterialFromEngineerBySctId: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.YIELD_ACCUMULATION AS YIELD_ACCUMULATION_FOR_SCT
            , tb_3.ITEM_ID

        FROM
            dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_1
              JOIN
            ITEM_M_S_PRICE tb_2
              ON
            tb_1.ITEM_M_S_PRICE_ID = tb_2.ITEM_M_S_PRICE_ID AND tb_2.INUSE = 1
              JOIN
            ITEM_M_O_PRICE tb_3
              ON
            tb_2.ITEM_M_O_PRICE_ID = tb_3.ITEM_M_O_PRICE_ID AND tb_3.INUSE = 1
        WHERE
                tb_1.SCT_ID = 'dataItem.SCT_ID'
            AND tb_1.INUSE = 1;
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  getByProductTypeIdAndSctTagSettingId: async (dataItem: { FISCAL_YEAR: number; PRODUCT_TYPE_ID: number; SCT_PATTERN_ID: number }) => {
    let sql = `
                  SELECT
                            tb_1.SCT_ID
                          , tb_1.SCT_REVISION_CODE
                          , tb_1.BOM_ID
                          , tb_1.FISCAL_YEAR
                          , tb_1.SCT_PATTERN_ID
                          , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_START_DATE
                          , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_END_DATE
                          , tb_1.PRODUCT_TYPE_ID
                          , tb_5.FLOW_ID
                          , tb_5.BOM_CODE
                          , tb_2.SCT_STATUS_PROGRESS_ID
                  FROM
                          dataItem.STANDARD_COST_DB.SCT tb_1
                                      INNER JOIN
                          dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                          ON tb_1.SCT_ID = tb_2.SCT_ID
                                      AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                      AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                      AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                                      AND tb_2.INUSE = 1
                                      AND tb_2.SCT_STATUS_PROGRESS_ID IN (4,5,6,7)
                                      INNER JOIN
                          BOM tb_5
                                      ON tb_1.BOM_ID = tb_5.BOM_ID

                          ORDER BY tb_1.SCT_REVISION_CODE DESC
                                      `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem.FISCAL_YEAR.toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem.PRODUCT_TYPE_ID.toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem.SCT_PATTERN_ID.toString())

    return sql
  },
  getBySctIdReal: async (dataItem: { SCT_ID: string }) => {
    let sql = `
                        SELECT
                                  tb_1.SCT_ID
                                , tb_1.SCT_REVISION_CODE
                                , tb_1.CREATE_BY
                                , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s') AS CREATE_DATE
                                , tb_1.UPDATE_BY
                                , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                , tb_1.INUSE
                                , tb_3.SCT_STATUS_PROGRESS_ID
                                , tb_3.SCT_STATUS_PROGRESS_NO
                                , tb_3.SCT_STATUS_PROGRESS_NAME

                                , tb_4.PRODUCT_TYPE_ID
                                , tb_5.PRODUCT_SUB_ID
                                , tb_6.PRODUCT_MAIN_ID
                                , tb_7.PRODUCT_CATEGORY_ID

                                , tb_4.PRODUCT_TYPE_CODE_FOR_SCT AS "PRODUCT_TYPE_CODE"
                                , tb_4.PRODUCT_TYPE_NAME
                                , tb_5.PRODUCT_SUB_NAME
                                , tb_5.PRODUCT_SUB_ALPHABET
                                , tb_6.PRODUCT_MAIN_NAME
                                , tb_6.PRODUCT_MAIN_ALPHABET
                                , tb_7.PRODUCT_CATEGORY_NAME
                                , tb_1.FISCAL_YEAR
                                , tb_11.PRODUCT_SPECIFICATION_TYPE_NAME
                                , tb_12.BOM_ID
                                , tb_12.BOM_CODE
                                , tb_12.BOM_NAME
                                , tb_13.FLOW_ID
                                , tb_13.FLOW_CODE
                                , tb_13.FLOW_NAME
                                , tb_8.SCT_PATTERN_ID
                                , tb_8.SCT_PATTERN_NAME
                                , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_START_DATE
                                , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_END_DATE
                                , tb_15.ITEM_CATEGORY_ID
                                , tb_15.ITEM_CATEGORY_NAME
                                , tb_15.ITEM_CATEGORY_ALPHABET
                                , tb_17.SCT_REASON_SETTING_ID
                                , tb_17.SCT_REASON_SETTING_NAME
                                , tb_19.SCT_TAG_SETTING_ID
                                , tb_19.SCT_TAG_SETTING_NAME
                                , tb_20.ITEM_ID
                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                                        INNER JOIN
                            dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                        ON tb_1.SCT_ID = tb_2.SCT_ID
                                        AND tb_1.SCT_ID = 'dataItem.SCT_ID'
                                        AND tb_2.INUSE =1
                                        INNER JOIN
                            dataItem.STANDARD_COST_DB.sct_status_progress tb_3
                                        ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                                        INNER JOIN
                            product_type tb_4
                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                        INNER JOIN
                            product_sub tb_5
                                        ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
                                        INNER JOIN
                            product_main tb_6
                                        ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
                                        INNER JOIN
                            product_category tb_7
                                        ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
                                        INNER JOIN
                            dataItem.STANDARD_COST_DB.SCT_PATTERN tb_8
                                        ON tb_1.SCT_PATTERN_ID = tb_8.SCT_PATTERN_ID
                                        INNER JOIN
                            product_type_product_specification_document_setting tb_9
                                        ON tb_4.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                        AND tb_9.INUSE = 1
                                        INNER JOIN
                            product_specification_document_setting tb_10
                                        ON tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_10.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                        AND tb_10.INUSE = 1
                                        INNER JOIN
                            PRODUCT_SPECIFICATION_TYPE tb_11
                                        ON tb_10.PRODUCT_SPECIFICATION_TYPE_ID = tb_11.PRODUCT_SPECIFICATION_TYPE_ID
                                        AND tb_11.INUSE = 1
                                        INNER JOIN
                            BOM tb_12
                                        ON tb_1.BOM_ID = tb_12.BOM_ID
                                        INNER JOIN
                            FLOW tb_13
                                        ON tb_12.FLOW_ID = tb_13.FLOW_ID
                                        INNER JOIN
                            PRODUCT_TYPE_ITEM_CATEGORY tb_14
                                        ON tb_4.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID
                                        AND tb_14.INUSE = 1
                                        INNER JOIN
                            ITEM_CATEGORY tb_15
                                        ON tb_14.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_16
                                        ON tb_1.SCT_ID = tb_16.SCT_ID
                                        AND tb_16.INUSE = 1
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_17
                                        ON tb_16.SCT_REASON_SETTING_ID = tb_17.SCT_REASON_SETTING_ID
                                        AND tb_17.INUSE = 1
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_18
                                        ON tb_1.SCT_ID = tb_18.SCT_ID
                                        AND tb_18.INUSE = 1
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_19
                                        ON tb_18.SCT_TAG_SETTING_ID = tb_19.SCT_TAG_SETTING_ID
                                        AND tb_19.INUSE = 1
                                        LEFT JOIN
                            ITEM_PRODUCT_DETAIL tb_20
                                        ON tb_1.PRODUCT_TYPE_ID = tb_20.PRODUCT_TYPE_ID
                                        AND tb_20.INUSE = 1
                                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  generateSctRevisionCode: async (dataItem: {
    PRODUCT_TYPE_ID: number
    PRODUCT_TYPE_CODE: string
    PRODUCT_MAIN_ALPHABET: string
    PRODUCT_SPECIFICATION_TYPE_ALPHABET: string
    FISCAL_YEAR: number
    SCT_PATTERN_NO: string
    SCT_PATTERN_ID: number
  }) => {
    let sql = `
        SET @sctRevisionCode = (
                SELECT
                        CONCAT('S', 'dataItem.PRODUCT_TYPE_CODE',
                        '-', 'dataItem.PRODUCT_MAIN_ALPHABET', '-', 'dataItem.PRODUCT_SPECIFICATION_TYPE_ALPHABET',
                         '-', SUBSTRING('dataItem.FISCAL_YEAR',3,4), '-', 'dataItem.SCT_PATTERN_NO', '-', (
                                SELECT
                                        LPAD(IFNULL(COUNT(*), 0) + 1, 2, '0')
                                FROM
                                        dataItem.STANDARD_COST_DB.SCT
                                WHERE
                                            PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                        AND FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                        AND SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                        ))

        );
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_MAIN_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_TYPE_ALPHABET', dataItem['PRODUCT_SPECIFICATION_TYPE_ALPHABET'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_NO', dataItem['SCT_PATTERN_NO'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())

    return sql
  },
  insertBySctRevisionCode_variable: async (dataItem: {
    SCT_ID: string
    SCT_FORMULA_VERSION_ID: number
    FISCAL_YEAR: number
    SCT_PATTERN_ID: number
    PRODUCT_TYPE_ID: number
    BOM_ID: string
    ESTIMATE_PERIOD_START_DATE: string
    ESTIMATE_PERIOD_END_DATE: string
    NOTE: string
    CREATE_BY: string
    UPDATE_BY: string
    INUSE: number
    DESCRIPTION?: string
  }) => {
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
                      ,  @sctRevisionCode
                      , 'dataItem.FISCAL_YEAR'
                      , 'dataItem.SCT_PATTERN_ID'
                      , 'dataItem.PRODUCT_TYPE_ID'
                      , 'dataItem.BOM_ID'
                      ,  dataItem.ESTIMATE_PERIOD_START_DATE
                      ,  dataItem.ESTIMATE_PERIOD_END_DATE
                      , 'dataItem.NOTE'
                      , 'dataItem.CREATE_BY'
                      , 'dataItem.UPDATE_BY'
                      ,  CURRENT_TIMESTAMP()
                      , 'dataItem.INUSE'
              );
                      `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    sql = sql.replaceAll('dataItem.SCT_FORMULA_VERSION_ID', dataItem['SCT_FORMULA_VERSION_ID'].toString())
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_START_DATE', dataItem['ESTIMATE_PERIOD_START_DATE'] ? `'${dataItem['ESTIMATE_PERIOD_START_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.ESTIMATE_PERIOD_END_DATE', dataItem['ESTIMATE_PERIOD_END_DATE'] ? `'${dataItem['ESTIMATE_PERIOD_END_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'].toString())

    return sql
  },
  getBySctRevisionCode: async (dataItem: { SCT_ID: string }) => {
    let sql = `
                        SELECT
                                  tb_1.SCT_ID
                                , tb_1.SCT_REVISION_CODE
                                , tb_1.CREATE_BY
                                , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s') AS CREATE_DATE
                                , tb_1.UPDATE_BY
                                , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                , tb_1.INUSE
                                , tb_3.SCT_STATUS_PROGRESS_ID
                                , tb_3.SCT_STATUS_PROGRESS_NO
                                , tb_3.SCT_STATUS_PROGRESS_NAME

                                , tb_4.PRODUCT_TYPE_ID
                                , tb_5.PRODUCT_SUB_ID
                                , tb_6.PRODUCT_MAIN_ID
                                , tb_7.PRODUCT_CATEGORY_ID

                                , tb_4.PRODUCT_TYPE_CODE_FOR_SCT AS "PRODUCT_TYPE_CODE"
                                , tb_4.PRODUCT_TYPE_NAME
                                , tb_5.PRODUCT_SUB_NAME
                                , tb_5.PRODUCT_SUB_ALPHABET
                                , tb_6.PRODUCT_MAIN_NAME
                                , tb_6.PRODUCT_MAIN_ALPHABET
                                , tb_7.PRODUCT_CATEGORY_NAME
                                , tb_1.FISCAL_YEAR
                                , tb_11.PRODUCT_SPECIFICATION_TYPE_NAME
                                , tb_12.BOM_ID
                                , tb_12.BOM_CODE
                                , tb_12.BOM_NAME
                                , tb_13.FLOW_ID
                                , tb_13.FLOW_CODE
                                , tb_13.FLOW_NAME
                                , tb_8.SCT_PATTERN_ID
                                , tb_8.SCT_PATTERN_NAME
                                , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_START_DATE
                                , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_END_DATE
                                , tb_15.ITEM_CATEGORY_ID
                                , tb_15.ITEM_CATEGORY_NAME
                                , tb_15.ITEM_CATEGORY_ALPHABET
                                , tb_17.SCT_REASON_SETTING_ID
                                , tb_17.SCT_REASON_SETTING_NAME
                                , tb_19.SCT_TAG_SETTING_ID
                                , tb_19.SCT_TAG_SETTING_NAME
                                , tb_20.ITEM_ID
                                , NULL AS SCT_ID_SELECTION
                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                                        INNER JOIN
                            dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                        ON tb_1.SCT_ID = tb_2.SCT_ID
                                        AND tb_1.SCT_ID = 'dataItem.SCT_ID'
                                        AND tb_2.INUSE =1
                                        INNER JOIN
                            dataItem.STANDARD_COST_DB.sct_status_progress tb_3
                                        ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                                        INNER JOIN
                            product_type tb_4
                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                        INNER JOIN
                            product_sub tb_5
                                        ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
                                        INNER JOIN
                            product_main tb_6
                                        ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
                                        INNER JOIN
                            product_category tb_7
                                        ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
                                        INNER JOIN
                            dataItem.STANDARD_COST_DB.SCT_PATTERN tb_8
                                        ON tb_1.SCT_PATTERN_ID = tb_8.SCT_PATTERN_ID
                                        INNER JOIN
                            product_type_product_specification_document_setting tb_9
                                        ON tb_4.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                        AND tb_9.INUSE = 1
                                        INNER JOIN
                            product_specification_document_setting tb_10
                                        ON tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_10.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                        AND tb_10.INUSE = 1
                                        INNER JOIN
                            PRODUCT_SPECIFICATION_TYPE tb_11
                                        ON tb_10.PRODUCT_SPECIFICATION_TYPE_ID = tb_11.PRODUCT_SPECIFICATION_TYPE_ID
                                        AND tb_11.INUSE = 1
                                        INNER JOIN
                            BOM tb_12
                                        ON tb_1.BOM_ID = tb_12.BOM_ID
                                        INNER JOIN
                            FLOW tb_13
                                        ON tb_12.FLOW_ID = tb_13.FLOW_ID
                                        INNER JOIN
                            PRODUCT_TYPE_ITEM_CATEGORY tb_14
                                        ON tb_4.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID
                                        AND tb_14.INUSE = 1
                                        INNER JOIN
                            ITEM_CATEGORY tb_15
                                        ON tb_14.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_16
                                        ON tb_1.SCT_ID = tb_16.SCT_ID
                                        AND tb_16.INUSE = 1
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_17
                                        ON tb_16.SCT_REASON_SETTING_ID = tb_17.SCT_REASON_SETTING_ID
                                        AND tb_17.INUSE = 1
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_18
                                        ON tb_1.SCT_ID = tb_18.SCT_ID
                                        AND tb_18.INUSE = 1
                                        LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_19
                                        ON tb_18.SCT_TAG_SETTING_ID = tb_19.SCT_TAG_SETTING_ID
                                        AND tb_19.INUSE = 1
                                        LEFT JOIN
                            ITEM_PRODUCT_DETAIL tb_20
                                        ON tb_1.PRODUCT_TYPE_ID = tb_20.PRODUCT_TYPE_ID
                                        AND tb_20.INUSE = 1

                             `

    //                                          LEFT JOIN
    // dataItem.STANDARD_COST_DB.sct_component_type_resource_option_select tb_21
    //             ON tb_1.SCT_ID = tb_21.SCT_ID
    //             AND tb_21.INUSE = 1
    //             LEFT JOIN
    // dataItem.STANDARD_COST_DB.sct_component_type_resource_option_selection_sct tb_22
    //             ON tb_21.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_22.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
    //             AND tb_22.INUSE = 1

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID)

    return sql
  },
  getByProductTypeIdAndFiscalYearAndSctPatternIdAnd_In_SctStatusProgressId: async (dataItem: {
    FISCAL_YEAR: number
    PRODUCT_TYPE_ID: number
    SCT_PATTERN_ID: number
    SCT_STATUS_PROGRESS_ID: string // (2,3)
  }) => {
    let sql = `
                  SELECT
                            tb_1.SCT_ID
                          , tb_1.SCT_REVISION_CODE
                          , tb_1.BOM_ID
                          , tb_1.FISCAL_YEAR
                          , tb_1.SCT_PATTERN_ID
                          , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_START_DATE
                          , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%m-%d') as ESTIMATE_PERIOD_END_DATE
                          , tb_1.PRODUCT_TYPE_ID
                          , tb_5.FLOW_ID
                          , tb_5.BOM_CODE
                          , tb_2.SCT_STATUS_PROGRESS_ID
                          , tb_6.CREATE_FROM_SCT_ID
                  FROM
                          dataItem.STANDARD_COST_DB.SCT tb_1
                                      INNER JOIN
                          dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                          ON tb_1.SCT_ID = tb_2.SCT_ID
                                      AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                      AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                      AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                                      AND tb_2.INUSE = 1
                                      AND tb_2.SCT_STATUS_PROGRESS_ID IN (dataItem.SCT_STATUS_PROGRESS_ID)
                                      INNER JOIN
                          BOM tb_5
                                      ON tb_1.BOM_ID = tb_5.BOM_ID
                                      LEFT JOIN
                          dataItem.STANDARD_COST_DB.SCT_CREATE_FROM_HISTORY tb_6
                                      ON tb_1.SCT_ID = tb_6.SCT_ID
                                      AND tb_6.INUSE = 1


                          ORDER BY tb_1.SCT_REVISION_CODE DESC

                                      `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem.FISCAL_YEAR.toString())
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem.PRODUCT_TYPE_ID.toString())
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem.SCT_PATTERN_ID.toString())
    sql = sql.replaceAll('dataItem.SCT_STATUS_PROGRESS_ID', dataItem.SCT_STATUS_PROGRESS_ID.toString())

    return sql
  },
}
