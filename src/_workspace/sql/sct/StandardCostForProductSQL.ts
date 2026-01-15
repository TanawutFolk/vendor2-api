import { RowDataPacket } from 'mysql2'
import { v4 as uuidv4 } from 'uuid'

export const StandardCostForProductSQL = {
  getSctFComponentTypeResourceOption: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_F_COMPONENT_TYPE_ID
                        , tb_1.SCT_F_RESOURCE_OPTION_ID
                        , tb_2.DIRECT_COST_CONDITION_ID
                        , tb_3.INDIRECT_COST_CONDITION_ID
                        , tb_4.OTHER_COST_CONDITION_ID
                        , tb_5.SPECIAL_COST_CONDITION_ID
                        , tb_6.FISCAL_YEAR AS DIRECT_COST_CONDITION_FISCAL_YEAR
                        , tb_6.VERSION AS DIRECT_COST_CONDITION_VERSION
                        , tb_7.FISCAL_YEAR AS INDIRECT_COST_CONDITION_FISCAL_YEAR
                        , tb_7.VERSION AS INDIRECT_COST_CONDITION_VERSION
                        , tb_8.FISCAL_YEAR AS OTHER_COST_CONDITION_FISCAL_YEAR
                        , tb_8.VERSION AS OTHER_COST_CONDITION_VERSION
                        , tb_9.FISCAL_YEAR AS SPECIAL_COST_CONDITION_FISCAL_YEAR
                        , tb_9.VERSION AS SPECIAL_COST_CONDITION_VERSION
                        , tb_2.DESCRIPTION AS COST_CONDITION_SCT_ID
                FROM
                        dataItem.STANDARD_COST_DB.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_1
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_DIRECT_COST_CONDITION tb_2
                                ON
                                tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_2.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_2.INUSE = 1
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_INDIRECT_COST_CONDITION tb_3
                                ON
                                tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_3.INUSE = 1
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_OTHER_COST_CONDITION tb_4
                                ON
                                tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_4.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_4.INUSE = 1
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_SPECIAL_COST_CONDITION tb_5
                                ON
                                tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_5.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_5.INUSE = 1
                                LEFT JOIN
                        DIRECT_COST_CONDITION tb_6
                                ON
                                tb_2.DIRECT_COST_CONDITION_ID = tb_6.DIRECT_COST_CONDITION_ID
                                LEFT JOIN
                        INDIRECT_COST_CONDITION tb_7
                                ON
                                tb_3.INDIRECT_COST_CONDITION_ID = tb_7.INDIRECT_COST_CONDITION_ID
                                LEFT JOIN
                        OTHER_COST_CONDITION tb_8
                                ON
                                tb_4.OTHER_COST_CONDITION_ID = tb_8.OTHER_COST_CONDITION_ID
                                LEFT JOIN
                        SPECIAL_COST_CONDITION tb_9
                                ON
                                tb_5.SPECIAL_COST_CONDITION_ID = tb_9.SPECIAL_COST_CONDITION_ID

                WHERE
                                tb_1.SCT_F_ID = 'dataItem.SCT_F_ID'
                        AND tb_1.INUSE = 1

                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])

    return sql
  },
  getSctFormDetail: async (dataItem: any) => {
    let sql = `
        SELECT
                  tb_1.SCT_F_ID
                , tb_1.SCT_F_CODE
                , tb_3.BOM_CODE
                , tb_3.BOM_NAME
                , tb_3.BOM_CODE AS BOM_CODE_ACTUAL
                , tb_3.BOM_NAME AS BOM_NAME_ACTUAL
                , tb_2.ESTIMATE_PERIOD_START_DATE AS START_DATE
                , tb_2.ESTIMATE_PERIOD_END_DATE AS END_DATE
                , tb_3.BOM_ID
                , tb_2.NOTE
                , tb_4.SCT_F_CREATE_TYPE_ALPHABET
                , tb_4.SCT_F_CREATE_TYPE_ID
                , tb_2.FISCAL_YEAR
                , tb_5.SCT_PATTERN_ID
                , tb_5.SCT_PATTERN_NAME
                , tb_6.PRODUCT_TYPE_ID
                , tb_6.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                , tb_6.PRODUCT_TYPE_NAME
                , tb_6.PRODUCT_SUB_ID
                , tb_8.PRODUCT_MAIN_ID
                , tb_8.PRODUCT_MAIN_ALPHABET
                , tb_8.PRODUCT_MAIN_NAME
                , tb_9.BOM_ID AS PRODUCT_TYPE_BOM_ID
                , tb_11.ITEM_CATEGORY_ID
                , tb_11.ITEM_CATEGORY_NAME
                , tb_14.PRODUCT_SPECIFICATION_TYPE_NAME
                , tb_14.PRODUCT_SPECIFICATION_TYPE_ALPHABET
                , tb_7.PRODUCT_SUB_ID
                , tb_7.PRODUCT_SUB_NAME
                , tb_7.PRODUCT_SUB_ALPHABET
                , tb_15.PRODUCT_CATEGORY_ID
                , tb_15.PRODUCT_CATEGORY_CODE
                , tb_15.PRODUCT_CATEGORY_NAME
                , tb_15.PRODUCT_CATEGORY_ALPHABET
                , tb_16.PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE_ID
                , tb_17.ACCOUNT_DEPARTMENT_CODE_ID
                , tb_17.ACCOUNT_DEPARTMENT_NAME
                , tb_17.ACCOUNT_DEPARTMENT_CODE
                , tb_19.SCT_TAG_SETTING_ID
                , tb_19.SCT_TAG_SETTING_NAME
                , tb_21.SCT_REASON_SETTING_ID
                , tb_21.SCT_REASON_SETTING_NAME
        FROM
                dataItem.STANDARD_COST_DB.SCT_F tb_1
                        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_S tb_2
                        ON
                        tb_1.SCT_F_ID = tb_2.SCT_F_ID
                        JOIN
                BOM tb_3
                        ON
                        tb_2.BOM_ID = tb_3.BOM_ID
                        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_CREATE_TYPE tb_4
                        ON
                        tb_1.SCT_F_CREATE_TYPE_ID = tb_4.SCT_F_CREATE_TYPE_ID
                        JOIN
                dataItem.STANDARD_COST_DB.SCT_PATTERN tb_5
                        ON
                        tb_2.SCT_PATTERN_ID = tb_5.SCT_PATTERN_ID
                        JOIN
                PRODUCT_TYPE tb_6
                        ON
                        tb_2.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID
                        JOIN
                PRODUCT_SUB tb_7
                        ON
                        tb_6.PRODUCT_SUB_ID = tb_7.PRODUCT_SUB_ID
                        JOIN
                PRODUCT_MAIN tb_8
                        ON
                        tb_7.PRODUCT_MAIN_ID = tb_8.PRODUCT_MAIN_ID
                        JOIN
                PRODUCT_TYPE_BOM tb_9
                        ON
                        tb_6.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                        JOIN
                PRODUCT_TYPE_ITEM_CATEGORY tb_10
                        ON
                        tb_6.PRODUCT_TYPE_ID = tb_10.PRODUCT_TYPE_ID
                        JOIN
                ITEM_CATEGORY tb_11
                        ON
                        tb_10.ITEM_CATEGORY_ID = tb_11.ITEM_CATEGORY_ID
                        JOIN
                PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_12
                        ON
                        tb_6.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID
                        JOIN
                PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_13
                        ON
                        tb_12.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_13.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                JOIN
               PRODUCT_SPECIFICATION_TYPE tb_14
                        ON
                        tb_13.PRODUCT_SPECIFICATION_TYPE_ID = tb_14.PRODUCT_SPECIFICATION_TYPE_ID
                        JOIN
                PRODUCT_CATEGORY tb_15
                        ON
                        tb_8.PRODUCT_CATEGORY_ID = tb_15.PRODUCT_CATEGORY_ID
                        JOIN
                PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_16
                        ON
                        tb_8.PRODUCT_MAIN_ID = tb_16.PRODUCT_MAIN_ID
                        JOIN
                ACCOUNT_DEPARTMENT_CODE tb_17
                        ON
                        tb_16.ACCOUNT_DEPARTMENT_CODE_ID = tb_17.ACCOUNT_DEPARTMENT_CODE_ID
                        LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_F_TAG_HISTORY tb_18
                        ON
                        tb_1.SCT_F_ID = tb_18.SCT_F_ID AND tb_18.INUSE = 1
                        LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_19
                        ON
                        tb_18.SCT_TAG_SETTING_ID = tb_19.SCT_TAG_SETTING_ID
                        LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_F_REASON_HISTORY tb_20
                        ON
                        tb_1.SCT_F_ID = tb_20.SCT_F_ID AND tb_20.INUSE = 1
                        LEFT JOIN
                dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_21
                        ON
                        tb_20.SCT_REASON_SETTING_ID = tb_21.SCT_REASON_SETTING_ID
        WHERE
                tb_1.SCT_F_ID = 'dataItem.SCT_F_ID'
        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])

    return sql
  },
  getSctHeader: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                        , tb_2.PRODUCT_TYPE_ID
                        , tb_2.PRODUCT_TYPE_NAME
                        , tb_2.PRODUCT_TYPE_CODE_FOR_SCT
                        , tb_3.PRODUCT_SUB_ID
                        , tb_3.PRODUCT_SUB_NAME
                        , tb_3.PRODUCT_SUB_CODE
                        , tb_3.PRODUCT_SUB_ALPHABET
                        , tb_4.PRODUCT_MAIN_ID
                        , tb_4.PRODUCT_MAIN_NAME
                        , tb_4.PRODUCT_MAIN_ALPHABET
                        , tb_4.PRODUCT_MAIN_CODE
                        , tb_5.PRODUCT_CATEGORY_ID
                        , tb_5.PRODUCT_CATEGORY_NAME
                        , tb_5.PRODUCT_CATEGORY_CODE
                        , tb_5.PRODUCT_CATEGORY_ALPHABET
                        , tb_7.ITEM_CATEGORY_ID
                        , tb_7.ITEM_CATEGORY_NAME
                        , tb_7.ITEM_CATEGORY_ALPHABET
                        , tb_10.PRODUCT_SPECIFICATION_TYPE_NAME
                        , tb_10.PRODUCT_SPECIFICATION_TYPE_ALPHABET
                        , tb_1.NOTE
                        , tb_1.FISCAL_YEAR
                        , tb_11.SCT_PATTERN_ID
                        , tb_11.SCT_PATTERN_NAME
                        , tb_13.SCT_REASON_SETTING_NAME
                        , tb_13.SCT_REASON_SETTING_ID
                        , tb_15.SCT_TAG_SETTING_NAME
                        , tb_15.SCT_TAG_SETTING_ID
                        , tb_1.SCT_REVISION_CODE
                       -- , tb_1.ESTIMATE_PERIOD_START_DATE
                       -- , tb_1.ESTIMATE_PERIOD_END_DATE
                        , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%m-%d') AS ESTIMATE_PERIOD_START_DATE
                        , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%m-%d') AS ESTIMATE_PERIOD_END_DATE
                        , tb_17.BOM_CODE AS BOM_CODE_ACTUAL
                        , tb_17.BOM_NAME AS BOM_NAME_ACTUAL
                        , tb_17.BOM_ID
                        , tb_18.BOM_CODE
                        , tb_18.BOM_NAME
                        , tb_18.BOM_ID
                        , tb_19.SCT_COMPARE_NO
                        , tb_19.SCT_ID_FOR_COMPARE
                        , tb_19.IS_DEFAULT_EXPORT_COMPARE
                        , tb_20.SCT_ID AS SCT_ID_FOR_COMPARE
                        , tb_20.SCT_REVISION_CODE AS SCT_REVISION_CODE_FOR_COMPARE
                        , tb_21.BOM_CODE AS BOM_CODE_FOR_COMPARE
                        , tb_21.BOM_NAME AS BOM_NAME_FOR_COMPARE
                        , tb_23.CUSTOMER_INVOICE_TO_ALPHABET
                        , tb_23.CUSTOMER_INVOICE_TO_NAME
                        , tb_25.SCT_STATUS_PROGRESS_ID
                        , tb_25.SCT_STATUS_PROGRESS_NAME
                FROM
                        dataItem.STANDARD_COST_DB.SCT tb_1
                                LEFT JOIN
                        PRODUCT_TYPE tb_2
                                ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                LEFT JOIN
                        PRODUCT_SUB tb_3
                                ON tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                                LEFT JOIN
                        PRODUCT_MAIN tb_4
                                ON tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                                LEFT JOIN
                        PRODUCT_CATEGORY tb_5
                                ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                                LEFT JOIN
                        PRODUCT_TYPE_ITEM_CATEGORY tb_6
                                ON tb_2.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID
                                AND tb_6.INUSE = 1
                                LEFT JOIN
                        ITEM_CATEGORY tb_7
                                ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
                                LEFT JOIN
                        PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_8
                                ON tb_2.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID
                                AND tb_8.INUSE = 1
                                LEFT JOIN
                        PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_9
                                ON tb_8.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                LEFT JOIN
                        PRODUCT_SPECIFICATION_TYPE tb_10
                                ON tb_9.PRODUCT_SPECIFICATION_TYPE_ID = tb_10.PRODUCT_SPECIFICATION_TYPE_ID
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_PATTERN tb_11
                                ON tb_1.SCT_PATTERN_ID = tb_11.SCT_PATTERN_ID
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_12
                                ON tb_1.SCT_ID = tb_12.SCT_ID
                                AND tb_12.INUSE = 1
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_13
                                ON tb_12.SCT_REASON_SETTING_ID = tb_13.SCT_REASON_SETTING_ID
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_14
                                ON tb_1.SCT_ID = tb_14.SCT_ID
                                AND tb_14.INUSE = 1
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_15
                                ON tb_14.SCT_TAG_SETTING_ID = tb_15.SCT_TAG_SETTING_ID
                                LEFT JOIN
                        PRODUCT_TYPE_BOM tb_16
                                ON tb_2.PRODUCT_TYPE_ID = tb_16.PRODUCT_TYPE_ID
                                AND tb_16.INUSE = 1
                                LEFT JOIN
                        BOM tb_17
                                ON tb_16.BOM_ID = tb_17.BOM_ID
                                LEFT JOIN
                        BOM tb_18
                                ON tb_1.BOM_ID = tb_18.BOM_ID
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_COMPARE tb_19
                                ON tb_1.SCT_ID = tb_19.SCT_ID
                                AND tb_19.INUSE = 1
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT tb_20
                                ON tb_19.SCT_ID_FOR_COMPARE = tb_20.SCT_ID
                                LEFT JOIN
                        BOM tb_21
                                ON tb_20.BOM_ID = tb_21.BOM_ID
                                LEFT JOIN
                        PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_22
                                ON tb_22.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                AND tb_22.INUSE = 1
                                LEFT JOIN
                        CUSTOMER_INVOICE_TO tb_23
                                ON tb_23.CUSTOMER_INVOICE_TO_ID = tb_22.CUSTOMER_INVOICE_TO_ID
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_24
                                ON tb_1.SCT_ID = tb_24.SCT_ID
                                AND tb_24.INUSE = 1
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_25
                                ON tb_24.SCT_STATUS_PROGRESS_ID = tb_25.SCT_STATUS_PROGRESS_ID
                WHERE
                        tb_1.SCT_ID = 'dataItem.SCT_ID'
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    // console.log(sql)
    return sql
  },
  getSctHeaderCompare: async (dataItem: any) => {
    let sql = `
                    SELECT
                              tb_1.SCT_ID
                            , tb_2.PRODUCT_TYPE_ID AS COMPARE_PRODUCT_TYPE_ID
                            , tb_2.PRODUCT_TYPE_NAME AS COMPARE_PRODUCT_TYPE_NAME
                            , tb_2.PRODUCT_TYPE_CODE_FOR_SCT AS  COMPARE_PRODUCT_TYPE_CODE_FOR_SCT
                            , tb_3.PRODUCT_SUB_ID AS COMPARE_PRODUCT_SUB_ID
                            , tb_3.PRODUCT_SUB_NAME AS COMPARE_PRODUCT_SUB_NAME
                            , tb_3.PRODUCT_SUB_CODE AS COMPARE_PRODUCT_SUB_CODE
                            , tb_3.PRODUCT_SUB_ALPHABET AS COMPARE_PRODUCT_SUB_ALPHABET
                            , tb_4.PRODUCT_MAIN_ID AS COMPARE_PRODUCT_MAIN_ID
                            , tb_4.PRODUCT_MAIN_NAME AS COMPARE_PRODUCT_MAIN_NAME
                            , tb_4.PRODUCT_MAIN_ALPHABET AS COMPARE_PRODUCT_MAIN_ALPHABET
                            , tb_4.PRODUCT_MAIN_CODE AS COMPARE_PRODUCT_MAIN_CODE
                            , tb_5.PRODUCT_CATEGORY_ID AS COMPARE_PRODUCT_CATEGORY_ID
                            , tb_5.PRODUCT_CATEGORY_NAME AS COMPARE_PRODUCT_CATEGORY_NAME
                            , tb_5.PRODUCT_CATEGORY_CODE AS COMPARE_PRODUCT_CATEGORY_CODE
                            , tb_5.PRODUCT_CATEGORY_ALPHABET AS COMPARE_PRODUCT_CATEGORY_ALPHABET
                            , tb_7.ITEM_CATEGORY_ID AS COMPARE_ITEM_CATEGORY_ID
                            , tb_7.ITEM_CATEGORY_NAME AS COMPARE_ITEM_CATEGORY_NAME
                            , tb_7.ITEM_CATEGORY_ALPHABET AS COMPARE_ITEM_CATEGORY_ALPHABET
                            , tb_10.PRODUCT_SPECIFICATION_TYPE_NAME AS COMPARE_PRODUCT_SPECIFICATION_TYPE_NAME
                            , tb_10.PRODUCT_SPECIFICATION_TYPE_ALPHABET AS COMPARE_PRODUCT_SPECIFICATION_TYPE_ALPHABET
                            , tb_1.NOTE AS COMPARE_NOTE
                            , tb_1.FISCAL_YEAR AS COMPARE_FISCAL_YEAR
                            , tb_11.SCT_PATTERN_ID AS COMPARE_SCT_PATTERN_ID
                            , tb_11.SCT_PATTERN_NAME AS COMPARE_SCT_PATTERN_NAME
                            , tb_13.SCT_REASON_SETTING_NAME AS COMPARE_SCT_REASON_SETTING_NAME
                            , tb_13.SCT_REASON_SETTING_ID AS COMPARE_SCT_REASON_SETTING_ID
                            , tb_15.SCT_TAG_SETTING_NAME AS COMPARE_SCT_TAG_SETTING_NAME
                            , tb_15.SCT_TAG_SETTING_ID AS COMPARE_SCT_TAG_SETTING_ID
                            , tb_1.SCT_REVISION_CODE AS COMPARE_SCT_REVISION_CODE
                           -- , tb_1.ESTIMATE_PERIOD_START_DATE AS COMPARE_ESTIMATE_PERIOD_START_DATE
                           -- , tb_1.ESTIMATE_PERIOD_END_DATE AS COMPARE_ESTIMATE_PERIOD_END_DATE

                            , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%Y-%m-%d') AS COMPARE_ESTIMATE_PERIOD_START_DATE
                            , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%Y-%m-%d') AS COMPARE_ESTIMATE_PERIOD_END_DATE

                            , tb_17.BOM_CODE AS BOM_CODE_ACTUAL
                            , tb_17.BOM_NAME AS BOM_NAME_ACTUAL
                            , tb_17.BOM_ID AS COMPARE_BOM_ID
                            , tb_18.BOM_CODE AS COMPARE_BOM_CODE
                            , tb_18.BOM_NAME AS COMPARE_BOM_NAME
                            , tb_18.BOM_ID
                            , tb_19.SCT_COMPARE_NO
                            , tb_19.SCT_ID_FOR_COMPARE
                            , tb_19.IS_DEFAULT_EXPORT_COMPARE
                            , tb_20.SCT_ID AS SCT_ID_FOR_COMPARE
                            , tb_20.SCT_REVISION_CODE AS SCT_REVISION_CODE_FOR_COMPARE
                            , tb_21.BOM_CODE AS BOM_CODE_FOR_COMPARE
                            , tb_21.BOM_NAME AS BOM_NAME_FOR_COMPARE
                            , tb_23.CUSTOMER_INVOICE_TO_ALPHABET  AS COMPARE_CUSTOMER_INVOICE_TO_ALPHABET
                            , tb_23.CUSTOMER_INVOICE_TO_NAME AS COMPARE_CUSTOMER_INVOICE_TO_NAME

                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                                    LEFT JOIN
                            PRODUCT_TYPE tb_2
                                    ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                    LEFT JOIN
                            PRODUCT_SUB tb_3
                                    ON tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                                    LEFT JOIN
                            PRODUCT_MAIN tb_4
                                    ON tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                                    LEFT JOIN
                            PRODUCT_CATEGORY tb_5
                                    ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                                    LEFT JOIN
                            PRODUCT_TYPE_ITEM_CATEGORY tb_6
                                    ON tb_2.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID
                                    AND tb_6.INUSE = 1
                                    LEFT JOIN
                            ITEM_CATEGORY tb_7
                                    ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
                                    LEFT JOIN
                            PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_8
                                    ON tb_2.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID
                                    AND tb_8.INUSE = 1
                                    LEFT JOIN
                            PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_9
                                    ON tb_8.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                    LEFT JOIN
                            PRODUCT_SPECIFICATION_TYPE tb_10
                                    ON tb_9.PRODUCT_SPECIFICATION_TYPE_ID = tb_10.PRODUCT_SPECIFICATION_TYPE_ID
                                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_PATTERN tb_11
                                    ON tb_1.SCT_PATTERN_ID = tb_11.SCT_PATTERN_ID
                                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_12
                                    ON tb_1.SCT_ID = tb_12.SCT_ID
                                    AND tb_12.INUSE = 1
                                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_13
                                    ON tb_12.SCT_REASON_SETTING_ID = tb_13.SCT_REASON_SETTING_ID
                                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_14
                                    ON tb_1.SCT_ID = tb_14.SCT_ID
                                    AND tb_14.INUSE = 1
                                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_15
                                    ON tb_14.SCT_TAG_SETTING_ID = tb_15.SCT_TAG_SETTING_ID
                                    LEFT JOIN
                            PRODUCT_TYPE_BOM tb_16
                                    ON tb_2.PRODUCT_TYPE_ID = tb_16.PRODUCT_TYPE_ID
                                    AND tb_16.INUSE = 1
                                    LEFT JOIN
                            BOM tb_17
                                    ON tb_16.BOM_ID = tb_17.BOM_ID
                                    LEFT JOIN
                            BOM tb_18
                                    ON tb_1.BOM_ID = tb_18.BOM_ID
                                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_COMPARE tb_19
                                    ON tb_1.SCT_ID = tb_19.SCT_ID
                                    AND tb_19.INUSE = 1
                                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT tb_20
                                    ON tb_19.SCT_ID_FOR_COMPARE = tb_20.SCT_ID
                                    LEFT JOIN
                            BOM tb_21
                                    ON tb_20.BOM_ID = tb_21.BOM_ID
                                    LEFT JOIN
                            PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_22
                                    ON tb_22.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                    AND tb_22.INUSE = 1
                                    LEFT JOIN
                            CUSTOMER_INVOICE_TO tb_23
                                    ON tb_23.CUSTOMER_INVOICE_TO_ID = tb_22.CUSTOMER_INVOICE_TO_ID
                    WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_COMPARE_ID'])
    // console.log(sql)
    return sql
  },
  getSellingPrice: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                        , tb_2.SELLING_PRICE_BY_FORMULA
                        , tb_2.ADJUST_PRICE
                        , tb_2.REMARK_FOR_ADJUST_PRICE
                        , tb_2.SELLING_PRICE
                        , tb_2.NOTE AS NOTE_PRICE
                        , tb_2.SELLING_EXPENSE_FOR_SELLING_PRICE
                        , tb_2.GA_FOR_SELLING_PRICE
                        , tb_2.MARGIN_FOR_SELLING_PRICE
                        , tb_2.CIT_FOR_SELLING_PRICE
                        , tb_2.ESTIMATE_PERIOD_START_DATE
                        , tb_2.TOTAL_YIELD_RATE
                        , tb_2.TOTAL_CLEAR_TIME
                FROM
                        dataItem.STANDARD_COST_DB.SCT tb_1
                                JOIN
                        dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
                                ON
                        tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                WHERE
                        tb_1.SCT_ID = 'dataItem.SCT_ID'

                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getSellingPriceCompare: async (dataItem: any) => {
    let sql = `
                    SELECT
                              tb_1.SCT_ID AS COMPARE_SCT_ID
                            , tb_2.SELLING_PRICE_BY_FORMULA AS COMPARE_SELLING_PRICE_BY_FORMULA
                            , tb_2.ADJUST_PRICE AS COMPARE_ADJUST_PRICE
                            , tb_2.REMARK_FOR_ADJUST_PRICE AS COMPARE_REMARK_FOR_ADJUST_PRICE
                            , tb_2.SELLING_PRICE AS COMPARE_SELLING_PRICE
                            , tb_2.NOTE AS COMPARE_NOTE_PRICE
                            , tb_2.SELLING_EXPENSE_FOR_SELLING_PRICE AS COMPARE_SELLING_EXPENSE_FOR_SELLING_PRICE
                            , tb_2.GA_FOR_SELLING_PRICE AS COMPARE_GA_FOR_SELLING_PRICE
                            , tb_2.MARGIN_FOR_SELLING_PRICE AS COMPARE_MARGIN_FOR_SELLING_PRICE
                            , tb_2.CIT_FOR_SELLING_PRICE AS COMPARE_CIT_FOR_SELLING_PRICE
                            , tb_2.ESTIMATE_PERIOD_START_DATE AS COMPARE_ESTIMATE_PERIOD_START_DATE
                            , tb_2.TOTAL_YIELD_RATE AS COMPARE_TOTAL_YIELD_RATE
                            , tb_2.TOTAL_CLEAR_TIME AS COMPARE_TOTAL_CLEAR_TIME
                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                                    JOIN
                            dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
                                    ON
                            tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                    WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'

                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_COMPARE_ID'])

    return sql
  },
  getTotalFlowProcess: async (dataItem: any) => {
    let sql = `
                    SELECT
                              tb_1.SCT_ID
                            , tb_2.BOM_CODE
                            , tb_3.FLOW_CODE
                            , tb_3.TOTAL_COUNT_PROCESS
                            , tb_4.TOTAL_YIELD_RATE
                            , tb_4.TOTAL_GO_STRAIGHT_RATE
                            , tb_5.TOTAL_ESSENTIAL_TIME
                            , tb_6.TOTAL_CLEAR_TIME
                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                                    JOIN
                            BOM tb_2
                                    ON
                            tb_1.BOM_ID = tb_2.BOM_ID
                                    JOIN
                            FLOW tb_3
                                    ON
                            tb_2.FLOW_ID = tb_3.FLOW_ID
                                    JOIN
                            dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_ENGINEER_TOTAL tb_4
                                    ON
                            tb_1.SCT_ID = tb_4.SCT_ID AND tb_4.INUSE = 1
                                    JOIN
                            dataItem.STANDARD_COST_DB.SCT_PROCESSING_COST_BY_MFG_TOTAL tb_5
                                    ON
                            tb_1.SCT_ID = tb_5.SCT_ID AND tb_5.INUSE = 1
                                    JOIN
                            dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_6
                                    ON
                            tb_1.SCT_ID = tb_6.SCT_ID AND tb_6.INUSE = 1
                    WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'

                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },

  getFlowProcess: async (dataItem: any) => {
    let sql = `
                    SELECT
                              tb_1.SCT_ID
                            , tb_4.FLOW_PROCESS_ID
                            , tb_4.NO AS PROCESS_NO
                            , tb_7.OLD_SYSTEM_PROCESS_SEQUENCE_CODE
                            , tb_7.OLD_SYSTEM_COLLECTION_POINT
                            , tb_8.PROCESS_NAME
                            , tb_8.PROCESS_CODE
                            , tb_8.PROCESS_ID
                            , tb_5.YIELD_RATE / 100 AS  YIELD_RATE
                            , tb_5.YIELD_ACCUMULATION / 100 AS  YIELD_ACCUMULATION
                            , tb_5.GO_STRAIGHT_RATE / 100 AS  GO_STRAIGHT_RATE
                            , tb_6.CLEAR_TIME
                            , tb_6.ESSENTIAL_TIME
                            , tb_6.PROCESS_STANDARD_TIME
                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                                    JOIN
                            BOM tb_2
                                    ON
                            tb_1.BOM_ID = tb_2.BOM_ID
                                    JOIN
                            FLOW tb_3
                                    ON
                            tb_2.FLOW_ID = tb_3.FLOW_ID
                                    JOIN
                            FLOW_PROCESS tb_4
                                    ON
                            tb_3.FLOW_ID = tb_4.FLOW_ID AND tb_4.INUSE = 1
                                    JOIN
                            dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER tb_5
                                    ON
                            tb_1.SCT_ID = tb_5.SCT_ID AND tb_4.FLOW_PROCESS_ID = tb_5.FLOW_PROCESS_ID AND tb_5.INUSE = 1
                                    JOIN
                            dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG tb_6
                                    ON
                            tb_1.SCT_ID = tb_6.SCT_ID AND tb_4.FLOW_PROCESS_ID = tb_6.FLOW_PROCESS_ID AND tb_6.INUSE = 1
                                    JOIN
                            dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_SEQUENCE tb_7
                                    ON
                            tb_1.SCT_ID = tb_7.SCT_ID AND tb_4.FLOW_PROCESS_ID = tb_7.FLOW_PROCESS_ID AND tb_7.INUSE = 1
                                    JOIN
                            PROCESS tb_8
                                    ON
                            tb_4.PROCESS_ID = tb_8.PROCESS_ID
                    WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'

                            ORDER BY
                                tb_4.NO
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getTotalMaterial: async (dataItem: any) => {
    let sql = `
                        SELECT
                                  tb_1.SCT_ID
                                , tb_2.TOTAL_PRICE_OF_RAW_MATERIAL
                                , tb_2.TOTAL_PRICE_OF_CONSUMABLE
                                , tb_2.TOTAL_PRICE_OF_SUB_ASSY
                                , tb_2.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
                                , tb_2.TOTAL_PRICE_OF_PACKING
                                , tb_2.TOTAL_PRICE_OF_ALL_OF_ITEMS
                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                    JOIN
                                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
                                    ON
                                tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                        WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'

                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getMaterial: async (dataItem: any) => {
    let sql = `
                    SELECT
                              tb_1.SCT_ID
                            , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                            , tb_3.ITEM_ID
                            , tb_3.ITEM_INTERNAL_CODE
                            , tb_3.ITEM_INTERNAL_FULL_NAME
                            , tb_3.ITEM_INTERNAL_SHORT_NAME
                            , tb_3.ITEM_CODE_FOR_SUPPORT_MES
                            , tb_5.ITEM_CATEGORY_NAME
                            , tb_5.ITEM_CATEGORY_ID
                            , tb_2.USAGE_QUANTITY
                            , tb_6.SYMBOL AS USAGE_UNIT
                            , tb_7.NO AS PROCESS_NO
                            , tb_8.PROCESS_NAME
                            , tb_8.PROCESS_ID
                            , tb_11.PURCHASE_PRICE
                            , tb_12.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY
                            , tb_3.PURCHASE_UNIT_RATIO
                            , tb_13.SYMBOL AS PURCHASE_UNIT
                            , IF(tb_14.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE IS NULL
                            , tb_9.PRICE
                            , tb_14.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE) AS USAGE_PRICE
                            , tb_3.USAGE_UNIT_RATIO
                            , 'THB' AS USAGE_PRICE_CURRENCY
                            , tb_9.YIELD_ACCUMULATION / 100 AS YIELD_ACCUMULATION
                            , tb_9.AMOUNT
                            , tb_15.OLD_SYSTEM_PROCESS_SEQUENCE_CODE
                            , tb_2.NO AS ITEM_NO
                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                                LEFT JOIN
                            BOM_FLOW_PROCESS_ITEM_USAGE tb_2
                                ON
                            tb_1.BOM_ID = tb_2.BOM_ID AND tb_2.INUSE = 1
                                LEFT JOIN
                            ITEM_MANUFACTURING tb_3
                                ON
                            tb_2.ITEM_ID = tb_3.ITEM_ID
                                LEFT JOIN
                            BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_4
                                ON
                            tb_2.BOM_ID = tb_4.BOM_ID AND tb_2.FLOW_PROCESS_ID = tb_4.FLOW_PROCESS_ID
                            AND tb_2.ITEM_ID = tb_4.ITEM_ID AND tb_4.INUSE = 1
                                LEFT JOIN
                            ITEM_CATEGORY tb_5
                                ON
                            tb_4.ITEM_CATEGORY_ID = tb_5.ITEM_CATEGORY_ID
                                LEFT JOIN
                            UNIT_OF_MEASUREMENT tb_6
                                ON
                            tb_3.USAGE_UNIT_ID = tb_6.UNIT_OF_MEASUREMENT_ID
                                LEFT JOIN
                            FLOW_PROCESS tb_7
                                ON
                            tb_2.FLOW_PROCESS_ID = tb_7.FLOW_PROCESS_ID AND tb_7.INUSE = 1
                                LEFT JOIN
                            PROCESS tb_8
                                ON
                            tb_7.PROCESS_ID = tb_8.PROCESS_ID
                                LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_9
                                ON
                            tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_9.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                            AND tb_9.SCT_ID = tb_1.SCT_ID  AND  tb_9.INUSE = 1
                                LEFT JOIN
                            ITEM_M_S_PRICE tb_10
                                ON
                            tb_9.ITEM_M_S_PRICE_ID = tb_10.ITEM_M_S_PRICE_ID
                                LEFT JOIN
                            ITEM_M_O_PRICE tb_11
                                ON
                            tb_10.ITEM_M_O_PRICE_ID = tb_11.ITEM_M_O_PRICE_ID
                                LEFT JOIN
                            CURRENCY tb_12
                                ON
                            tb_11.PURCHASE_PRICE_CURRENCY_ID = tb_12.CURRENCY_ID
                                LEFT JOIN
                            UNIT_OF_MEASUREMENT tb_13
                                ON
                            tb_3.PURCHASE_UNIT_ID = tb_13.UNIT_OF_MEASUREMENT_ID
                                LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST tb_14
                                ON
                            tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_14.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_14.INUSE = 1
                                 LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_SEQUENCE tb_15 ON

                                 ( tb_15.SCT_ID = tb_1.SCT_ID AND tb_15.FLOW_PROCESS_ID = tb_7.FLOW_PROCESS_ID AND tb_15.INUSE = 1 )
                    WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'

                             ORDER BY tb_7.NO , tb_3.ITEM_CODE_FOR_SUPPORT_MES

                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    // console.log(sql)
    return sql
  },
  getMaterialCompare: async (dataItem: any) => {
    let sql = `
                        SELECT
                                  tb_1.SCT_ID AS COMPARE_SCT_ID
                                , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID AS COMPARE_BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                , tb_3.ITEM_ID AS COMPARE_ITEM_ID
                                , tb_3.ITEM_INTERNAL_CODE AS COMPARE_ITEM_INTERNAL_CODE
                                , tb_3.ITEM_INTERNAL_FULL_NAME AS COMPARE_ITEM_INTERNAL_FULL_NAME
                                , tb_3.ITEM_INTERNAL_SHORT_NAME AS COMPARE_ITEM_INTERNAL_SHORT_NAME
                                , tb_3.ITEM_CODE_FOR_SUPPORT_MES AS COMPARE_ITEM_CODE_FOR_SUPPORT_MES
                                , tb_5.ITEM_CATEGORY_NAME AS COMPARE_ITEM_CATEGORY_NAME
                                , tb_5.ITEM_CATEGORY_ID AS COMPARE_ITEM_CATEGORY_ID
                                , tb_2.USAGE_QUANTITY AS COMPARE_USAGE_QUANTITY
                                , tb_6.SYMBOL AS COMPARE_USAGE_UNIT
                                , tb_7.NO AS PROCESS_NO
                                , tb_8.PROCESS_NAME AS COMPARE_PROCESS_NAME
                                , tb_8.PROCESS_ID AS COMPARE_PROCESS_ID
                                , tb_11.PURCHASE_PRICE AS COMPARE_PURCHASE_PRICE
                                , tb_12.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY
                                , tb_3.PURCHASE_UNIT_RATIO AS COMPARE_PURCHASE_UNIT_RATIO
                                , tb_13.SYMBOL AS PURCHASE_UNIT
                                , IF(tb_14.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE IS NULL
                                , tb_9.PRICE
                                , tb_14.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE) AS COMPARE_USAGE_PRICE
                                , tb_3.USAGE_UNIT_RATIO
                                , 'THB' AS USAGE_PRICE_CURRENCY
                                , tb_9.YIELD_ACCUMULATION / 100 AS COMPARE_YIELD_ACCUMULATION
                                , tb_9.AMOUNT AS COMPARE_AMOUNT
                                , tb_15.OLD_SYSTEM_PROCESS_SEQUENCE_CODE AS COMPARE_OLD_SYSTEM_PROCESS_SEQUENCE_CODE
                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                    LEFT JOIN
                                BOM_FLOW_PROCESS_ITEM_USAGE tb_2
                                    ON
                                tb_1.BOM_ID = tb_2.BOM_ID AND tb_2.INUSE = 1
                                    LEFT JOIN
                                ITEM_MANUFACTURING tb_3
                                    ON
                                tb_2.ITEM_ID = tb_3.ITEM_ID
                                    LEFT JOIN
                                BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_4
                                    ON
                                tb_2.BOM_ID = tb_4.BOM_ID AND tb_2.FLOW_PROCESS_ID = tb_4.FLOW_PROCESS_ID
                                AND tb_2.ITEM_ID = tb_4.ITEM_ID AND tb_4.INUSE = 1
                                    LEFT JOIN
                                ITEM_CATEGORY tb_5
                                    ON
                                tb_4.ITEM_CATEGORY_ID = tb_5.ITEM_CATEGORY_ID
                                    LEFT JOIN
                                UNIT_OF_MEASUREMENT tb_6
                                    ON
                                tb_3.USAGE_UNIT_ID = tb_6.UNIT_OF_MEASUREMENT_ID
                                    LEFT JOIN
                                FLOW_PROCESS tb_7
                                    ON
                                tb_2.FLOW_PROCESS_ID = tb_7.FLOW_PROCESS_ID AND tb_7.INUSE = 1
                                    LEFT JOIN
                                PROCESS tb_8
                                    ON
                                tb_7.PROCESS_ID = tb_8.PROCESS_ID
                                    LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_9
                                    ON
                                tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_9.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                AND tb_9.SCT_ID = tb_1.SCT_ID
                                AND tb_9.INUSE = 1
                                    LEFT JOIN
                                ITEM_M_S_PRICE tb_10
                                    ON
                                tb_9.ITEM_M_S_PRICE_ID = tb_10.ITEM_M_S_PRICE_ID
                                    LEFT JOIN
                                ITEM_M_O_PRICE tb_11
                                    ON
                                tb_10.ITEM_M_O_PRICE_ID = tb_11.ITEM_M_O_PRICE_ID
                                    LEFT JOIN
                                CURRENCY tb_12
                                    ON
                                tb_11.PURCHASE_PRICE_CURRENCY_ID = tb_12.CURRENCY_ID
                                    LEFT JOIN
                                UNIT_OF_MEASUREMENT tb_13
                                    ON
                                tb_3.PURCHASE_UNIT_ID = tb_13.UNIT_OF_MEASUREMENT_ID
                                    LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST tb_14
                                    ON
                                tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_14.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                                     LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_SEQUENCE tb_15 ON

                                     ( tb_15.SCT_ID = tb_1.SCT_ID AND tb_15.FLOW_PROCESS_ID = tb_7.FLOW_PROCESS_ID AND tb_15.INUSE = 1 )
                        WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'

                                 ORDER BY tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID

                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_COMPARE_ID'])
    //  console.log(sql)
    return sql
  },
  getIndirectCostPriceTabsData: async (dataItem: any) => {
    let sql = `
                        SELECT
                                  tb_1.SCT_ID
                                , tb_2.DIRECT_UNIT_PROCESS_COST
                                , tb_2.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                                , IF(tb_3.TOTAL_INDIRECT_COST IS NULL, tb_2.INDIRECT_COST_SALE_AVE, tb_3.TOTAL_INDIRECT_COST) AS TOTAL_INDIRECT_COST
                                , tb_2.IMPORTED_FEE
                                , tb_2.SELLING_EXPENSE
                                , tb_2.GA
                                , tb_2.MARGIN
                                , tb_3.CIT
                                , tb_3.VAT
                                , tb_2.TOTAL_PROCESSING_TIME
                                , tb_2.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                                , tb_2.DIRECT_PROCESS_COST
                                , tb_2.TOTAL_DIRECT_COST
                                , tb_2.TOTAL
                                , tb_2.TOTAL_PRICE_OF_RAW_MATERIAL
                                , tb_2.TOTAL_PRICE_OF_CONSUMABLE
                                , tb_2.TOTAL_PRICE_OF_PACKING
                                , tb_2.TOTAL_PRICE_OF_SUB_ASSY
                                , tb_2.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
                                , tb_2.TOTAL_PRICE_OF_ALL_OF_ITEMS
                                , tb_2.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS
                                , tb_2.CONSUMABLE_PACKING
                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                    LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
                                    ON
                                tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                                    LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_3
                                    ON
                                tb_1.SCT_ID = tb_3.SCT_ID
                        WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getIndirectCostPriceTabsDataCompare: async (dataItem: any) => {
    let sql = `
                        SELECT
                                  tb_1.SCT_ID AS COMPARE_SCT_ID
                                , tb_2.DIRECT_UNIT_PROCESS_COST AS COMPARE_DIRECT_UNIT_PROCESS_COST
                                , tb_2.INDIRECT_RATE_OF_DIRECT_PROCESS_COST AS COMPARE_INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                                , tb_2.INDIRECT_COST_SALE_AVE AS COMPARE_INDIRECT_COST_SALE_AVE
                                , IF(tb_3.TOTAL_INDIRECT_COST IS NULL, tb_2.INDIRECT_COST_SALE_AVE
                                , tb_3.TOTAL_INDIRECT_COST) AS COMPARE_TOTAL_INDIRECT_COST
                                , tb_2.IMPORTED_COST AS COMPARE_IMPORTED_COST
                                , tb_2.IMPORTED_FEE AS COMPARE_IMPORTED_FEE
                                , tb_2.SELLING_EXPENSE AS COMPARE_SELLING_EXPENSE
                                , tb_2.GA AS COMPARE_GA
                                , tb_2.MARGIN AS COMPARE_MARGIN
                                , tb_3.CIT AS COMPARE_CIT
                                , tb_3.VAT AS COMPARE_VAT
                                , tb_2.TOTAL_PROCESSING_TIME AS COMPARE_TOTAL_PROCESSING_TIME
                                , tb_2.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                                 AS COMPARE_TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                                , tb_2.DIRECT_PROCESS_COST AS COMPARE_DIRECT_PROCESS_COST
                                , tb_2.TOTAL_DIRECT_COST AS COMPARE_TOTAL_DIRECT_COST
                                , tb_2.TOTAL AS COMPARE_TOTAL
                                , tb_2.TOTAL_PRICE_OF_RAW_MATERIAL AS COMPARE_TOTAL_PRICE_OF_RAW_MATERIAL
                                , tb_2.TOTAL_PRICE_OF_CONSUMABLE AS COMPARE_TOTAL_PRICE_OF_CONSUMABLE
                                , tb_2.TOTAL_PRICE_OF_PACKING AS COMPARE_TOTAL_PRICE_OF_PACKING
                                , tb_2.TOTAL_PRICE_OF_SUB_ASSY AS COMPARE_TOTAL_PRICE_OF_SUB_ASSY
                                , tb_2.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS AS COMPARE_TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
                                , tb_2.TOTAL_PRICE_OF_ALL_OF_ITEMS AS COMPARE_TOTAL_PRICE_OF_ALL_OF_ITEMS
                                , tb_2.TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST
                                 AS COMPARE_TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST
                                , tb_2.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS AS COMPARE_RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS
                                , tb_2.CONSUMABLE_PACKING AS COMPARE_CONSUMABLE_PACKING
                                , tb_2.MATERIALS_COST AS COMPARE_MATERIALS_COST
                                , tb_5.SCT_STATUS_PROGRESS_NAME AS COMPARE_SCT_STATUS_PROGRESS_NAME
                                , tb_2.ASSEMBLY_GROUP_FOR_SUPPORT_MES AS COMPARE_ASSEMBLY_GROUP_FOR_SUPPORT_MES
                                , tb_2.RM_INCLUDE_IMPORTED_COST AS COMPARE_RM_INCLUDE_IMPORTED_COST
                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                    LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
                                    ON
                                tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                                    LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_3
                                    ON
                                tb_1.SCT_ID = tb_3.SCT_ID
                                                       INNER JOIN
                                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_4
                                    ON
                                        tb_4.SCT_ID = tb_1.SCT_ID AND tb_4.INUSE = 1

                                    INNER JOIN
                                        dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_5
                                    ON
                                        tb_5.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
                        WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_COMPARE_ID'])
    // console.log(sql)
    return sql
  },

  getIndirectCostPriceTabsDataForExport: async (dataItem: any) => {
    let sql = `
                        SELECT
                                  tb_1.SCT_ID
                                , tb_2.DIRECT_UNIT_PROCESS_COST
                                , tb_2.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                                , tb_2.INDIRECT_COST_SALE_AVE
                                , tb_2.INDIRECT_COST_SALE_AVE AS TOTAL_INDIRECT_COST
                                , tb_2.IMPORTED_COST
                                , tb_2.IMPORTED_FEE
                                , tb_2.SELLING_EXPENSE
                                , tb_2.GA
                                , tb_2.MARGIN
                                , tb_2.CIT
                                , tb_2.VAT
                                , tb_2.TOTAL_PROCESSING_TIME
                                , tb_2.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                                , tb_2.DIRECT_PROCESS_COST
                                , tb_2.TOTAL_DIRECT_COST
                                , tb_2.TOTAL
                                , tb_2.TOTAL_PRICE_OF_RAW_MATERIAL
                                , tb_2.TOTAL_PRICE_OF_CONSUMABLE
                                , tb_2.TOTAL_PRICE_OF_PACKING
                                , tb_2.TOTAL_PRICE_OF_SUB_ASSY
                                , tb_2.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
                                , tb_2.TOTAL_PRICE_OF_ALL_OF_ITEMS
                                , tb_2.TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST
                                , tb_2.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS
                                , tb_2.CONSUMABLE_PACKING
                                , tb_2.MATERIALS_COST
                                , tb_5.SCT_STATUS_PROGRESS_NAME
                                , tb_2.ASSEMBLY_GROUP_FOR_SUPPORT_MES
                                , tb_2.RM_INCLUDE_IMPORTED_COST
                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                    LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2

                                    ON

                                tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1

                                INNER JOIN

                                   dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_4

                                    ON
                                        tb_4.SCT_ID = tb_1.SCT_ID AND tb_4.INUSE = 1

                                   INNER JOIN
                                            dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_5
                                        ON
                                            tb_5.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
                        WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    // console.log(sql)
    return sql
  },
  getIndirectCostPriceTabsDataCompareForExport: async (dataItem: any) => {
    let sql = `
                            SELECT
                                      tb_1.SCT_ID AS COMPARE_SCT_ID
                                    , tb_2.DIRECT_UNIT_PROCESS_COST AS COMPARE_DIRECT_UNIT_PROCESS_COST
                                    , tb_2.INDIRECT_RATE_OF_DIRECT_PROCESS_COST AS COMPARE_INDIRECT_RATE_OF_DIRECT_PROCESS_COST
                                    , tb_2.INDIRECT_COST_SALE_AVE AS COMPARE_INDIRECT_COST_SALE_AVE
                                    , tb_2.INDIRECT_COST_SALE_AVE AS COMPARE_TOTAL_INDIRECT_COST
                                    , tb_2.IMPORTED_COST AS COMPARE_IMPORTED_COST
                                    , tb_2.IMPORTED_FEE AS COMPARE_IMPORTED_FEE
                                    , tb_2.SELLING_EXPENSE AS COMPARE_SELLING_EXPENSE
                                    , tb_2.GA AS COMPARE_GA
                                    , tb_2.MARGIN AS COMPARE_MARGIN
                                    , tb_2.CIT AS COMPARE_CIT
                                    , tb_2.VAT AS COMPARE_VAT
                                    , tb_2.TOTAL_PROCESSING_TIME AS COMPARE_TOTAL_PROCESSING_TIME
                                    , tb_2.TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                                     AS COMPARE_TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE
                                    , tb_2.DIRECT_PROCESS_COST AS COMPARE_DIRECT_PROCESS_COST
                                    , tb_2.TOTAL_DIRECT_COST AS COMPARE_TOTAL_DIRECT_COST
                                    , tb_2.TOTAL AS COMPARE_TOTAL
                                    , tb_2.TOTAL_PRICE_OF_RAW_MATERIAL AS COMPARE_TOTAL_PRICE_OF_RAW_MATERIAL
                                    , tb_2.TOTAL_PRICE_OF_CONSUMABLE AS COMPARE_TOTAL_PRICE_OF_CONSUMABLE
                                    , tb_2.TOTAL_PRICE_OF_PACKING AS COMPARE_TOTAL_PRICE_OF_PACKING
                                    , tb_2.TOTAL_PRICE_OF_SUB_ASSY AS COMPARE_TOTAL_PRICE_OF_SUB_ASSY
                                    , tb_2.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS AS COMPARE_TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
                                    , tb_2.TOTAL_PRICE_OF_ALL_OF_ITEMS AS COMPARE_TOTAL_PRICE_OF_ALL_OF_ITEMS
                                    , tb_2.TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST
                                     AS COMPARE_TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST
                                    , tb_2.RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS AS COMPARE_RAW_MATERIAL_SUB_ASSY_SEMI_FINISHED_GOODS
                                    , tb_2.CONSUMABLE_PACKING AS COMPARE_CONSUMABLE_PACKING
                                    , tb_2.MATERIALS_COST AS COMPARE_MATERIALS_COST
                                    , tb_5.SCT_STATUS_PROGRESS_NAME AS COMPARE_SCT_STATUS_PROGRESS_NAME
                                    , tb_2.ASSEMBLY_GROUP_FOR_SUPPORT_MES AS COMPARE_ASSEMBLY_GROUP_FOR_SUPPORT_MES
                                    , tb_2.RM_INCLUDE_IMPORTED_COST AS COMPARE_RM_INCLUDE_IMPORTED_COST
                            FROM
                                    dataItem.STANDARD_COST_DB.SCT tb_1
                                        LEFT JOIN
                                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
                                        ON
                                    tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1

                                        INNER JOIN

                                            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_4
                                        ON
                                            tb_4.SCT_ID = tb_1.SCT_ID AND tb_4.INUSE = 1

                                        INNER JOIN
                                            dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_5
                                        ON
                                            tb_5.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
                            WHERE
                                    tb_1.SCT_ID = 'dataItem.SCT_ID'
                            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_COMPARE_ID'])
    // console.log(sql)
    return sql
  },
  getSctComponentTypeResourceOption: async (dataItem: any) => {
    let sql = `
                        SELECT
                                  tb_1.SCT_ID
                                , tb_2.SCT_COMPONENT_TYPE_ID
                                , tb_2.SCT_RESOURCE_OPTION_ID
                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                    LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_2
                                    ON
                                tb_1.SCT_ID = tb_2.SCT_ID
                        WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getSctCompareData: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                        , tb_2.TOTAL_YIELD_RATE
                        , tb_2.TOTAL_GO_STRAIGHT_RATE
                        , tb_2.TOTAL_CLEAR_TIME
                        , tb_2.TOTAL_PRICE_OF_RAW_MATERIAL
                        , tb_2.TOTAL_PRICE_OF_SUB_ASSY
                        , tb_2.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
                        , tb_2.TOTAL_PRICE_OF_CONSUMABLE
                        , tb_2.TOTAL_PRICE_OF_PACKING
                        , tb_2.TOTAL_PRICE_OF_ALL_OF_ITEMS
                        , tb_2.TOTAL_PRICE_OF_RAW_MATERIAL
                FROM
                        dataItem.STANDARD_COST_DB.SCT tb_1
                                JOIN
                        dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
                                ON
                        tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                WHERE
                        tb_1.SCT_ID = 'dataItem.SCT_ID'

                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getSctCompareFlowProcess: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                        , tb_2.PROCESS_ID
                        , tb_1.YIELD_RATE
                        , tb_1.YIELD_ACCUMULATION
                        , tb_1.GO_STRAIGHT_RATE
                        , tb_3.CLEAR_TIME
                        , tb_3.ESSENTIAL_TIME
                        , tb_3.PROCESS_STANDARD_TIME
                FROM
                        dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER tb_1
                                JOIN
                        FLOW_PROCESS tb_2
                                ON
                        tb_1.FLOW_PROCESS_ID = tb_2.FLOW_PROCESS_ID AND tb_2.INUSE = 1
                                JOIN
                                dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG tb_3
                                ON
                        tb_1.SCT_ID = tb_3.SCT_ID AND tb_1.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID AND tb_3.INUSE = 1
                WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'
                        AND tb_1.INUSE = 1

                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getSctCompareMaterial: async (dataItem: any) => {
    let sql = `
        SELECT
                  tb_1.SCT_ID
                , tb_2.PROCESS_ID
                , tb_1.YIELD_ACCUMULATION
        FROM
                dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER tb_1
                        JOIN
                FLOW_PROCESS tb_2
                        ON
                tb_1.FLOW_PROCESS_ID = tb_2.FLOW_PROCESS_ID AND tb_2.INUSE = 1
        WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID'
                AND tb_1.INUSE = 1

        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getItemPriceAdjustment: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                        , tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                        , tb_1.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE
                FROM
                        dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST tb_1
                WHERE
                        tb_1.SCT_ID = 'dataItem.SCT_ID'
                        AND tb_1.INUSE = 1

                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getCostConditionDataLatest: async (dataItem: any) => {
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

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  getCostConditionDataByCostConditionId: async (dataItem: any) => {
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
                    DIRECT_COST_CONDITION_ID = 'dataItem.DIRECT_COST_CONDITION_ID';

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
                    INDIRECT_COST_CONDITION_ID = 'dataItem.INDIRECT_COST_CONDITION_ID';

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
                    OTHER_COST_CONDITION_ID = 'dataItem.OTHER_COST_CONDITION_ID';

            SELECT
                      SPECIAL_COST_CONDITION_ID
                    , ADJUST_PRICE
                    , FISCAL_YEAR
                    , VERSION
            FROM
                    SPECIAL_COST_CONDITION
            WHERE
                    SPECIAL_COST_CONDITION_ID = 'dataItem.SPECIAL_COST_CONDITION_ID';
                    `

    sql = sql.replaceAll('dataItem.DIRECT_COST_CONDITION_ID', dataItem['DIRECT_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.INDIRECT_COST_CONDITION_ID', dataItem['INDIRECT_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.OTHER_COST_CONDITION_ID', dataItem['OTHER_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.SPECIAL_COST_CONDITION_ID', dataItem['SPECIAL_COST_CONDITION_ID'])

    return sql
  },
  getCostConditionDataBySctId: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_2.DIRECT_UNIT_PROCESS_COST
                    , tb_2.INDIRECT_RATE_OF_DIRECT_PROCESS_COST
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
            JOIN
                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
            ON
                    tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID_SELECTION'
                    AND tb_1.INUSE = 1;

            SELECT
                    tb_2.INDIRECT_COST_SALE_AVE AS TOTAL_INDIRECT_COST
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
            JOIN
                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
            ON
                    tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID_SELECTION'
                    AND tb_1.INUSE = 1;

            SELECT
                      tb_2.GA
                    , tb_2.MARGIN
                    , tb_2.SELLING_EXPENSE
                    , tb_2.VAT
                    , tb_2.CIT
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
            JOIN
                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
            ON
                    tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID_SELECTION'
                    AND tb_1.INUSE = 1;

            SELECT
                    tb_2.ADJUST_PRICE
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
            JOIN
                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_2
            ON
                    tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID_SELECTION'
                    AND tb_1.INUSE = 1;
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    console.log(dataItem)
    sql = sql.replaceAll('dataItem.SCT_ID_SELECTION', dataItem['SCT_ID_SELECTION'])
    return sql
  },
  getYrGrDataLatest: async (dataItem: any) => {
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
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
  getYrGrDataBySctId: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_3.PROCESS_ID
                    , tb_2.YIELD_RATE AS YIELD_RATE_FOR_SCT
                    , tb_2.YIELD_ACCUMULATION AS YIELD_ACCUMULATION_FOR_SCT
                    , tb_2.GO_STRAIGHT_RATE AS GO_STRAIGHT_RATE_FOR_SCT
                    , tb_4.OLD_SYSTEM_COLLECTION_POINT AS COLLECTION_POINT_FOR_SCT
                    , tb_3.FLOW_ID
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
            JOIN
                    dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_ENGINEER tb_2
            ON
                    tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
            JOIN
                    FLOW_PROCESS tb_3
            ON
                    tb_2.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID AND tb_3.INUSE = 1
            JOIN
                    dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_SEQUENCE tb_4
            ON
                    tb_1.SCT_ID = tb_4.SCT_ID AND tb_2.FLOW_PROCESS_ID = tb_4.FLOW_PROCESS_ID AND tb_4.INUSE = 1
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID_SELECTION'
                    AND tb_1.INUSE = 1;

            SELECT
                      TOTAL_YIELD_RATE AS TOTAL_YIELD_RATE_FOR_SCT
                    , TOTAL_GO_STRAIGHT_RATE AS TOTAL_GO_STRAIGHT_RATE_FOR_SCT
            FROM
                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST
            WHERE
                        SCT_ID = 'dataItem.SCT_ID_SELECTION'
                    AND INUSE = 1;
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID_SELECTION', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  getYrGrDataByRevision: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_1.PROCESS_ID
                    , tb_1.YIELD_RATE_FOR_SCT
                    , tb_1.YIELD_ACCUMULATION_FOR_SCT
                    , tb_1.GO_STRAIGHT_RATE_FOR_SCT
                    , tb_1.COLLECTION_POINT_FOR_SCT
                    , tb_1.FLOW_ID
            FROM
                    YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_1
            JOIN
                    YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT tb_2
            ON
                    tb_1.FISCAL_YEAR = tb_2.FISCAL_YEAR AND tb_1.REVISION_NO = tb_2.REVISION_NO AND tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
            WHERE
                        tb_2.YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID = 'dataItem.RESOURCE_OPTION_DESCRIPTION'
                    AND tb_1.INUSE = 1;

            SELECT
                      tb_1.TOTAL_YIELD_RATE_FOR_SCT
                    , tb_1.TOTAL_GO_STRAIGHT_RATE_FOR_SCT
            FROM
                    YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT tb_1
            WHERE
                        tb_1.YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID = 'dataItem.RESOURCE_OPTION_DESCRIPTION'
                    AND tb_1.INUSE = 1;
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.RESOURCE_OPTION_DESCRIPTION', dataItem['RESOURCE_OPTION_DESCRIPTION'])

    console.log(dataItem, sql)

    return sql
  },
  getDataMasterSelection: async (dataItem: any) => {
    let sql = `
            SELECT
                    RESOURCE_OPTION_DESCRIPTION
            FROM
                    dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
            WHERE
                        SCT_COMPONENT_TYPE_ID = 'dataItem.SCT_COMPONENT_TYPE_ID'
                    AND SCT_ID = 'dataItem.SCT_ID'
                    AND SCT_RESOURCE_OPTION_ID = 'dataItem.RESOURCE_OPTION_ID'
                    AND INUSE = 1
        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_COMPONENT_TYPE_ID', dataItem['SCT_COMPONENT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.RESOURCE_OPTION_ID', dataItem['RESOURCE_OPTION_ID'])

    console.log(dataItem, sql)

    return sql
  },
  getTimeDataLatest: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_3.PROCESS_ID
                    , tb_3.CLEAR_TIME_FOR_SCT
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

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB ?? '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])

    return sql
  },
  getTimeDataBySctId: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_3.PROCESS_ID
                    , tb_2.CLEAR_TIME AS CLEAR_TIME_FOR_SCT
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
            JOIN
                    dataItem.STANDARD_COST_DB.SCT_FLOW_PROCESS_PROCESSING_COST_BY_MFG tb_2
            ON
                    tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
            JOIN
                    FLOW_PROCESS tb_3
            ON
                    tb_2.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID AND tb_3.INUSE = 1
            WHERE
                        tb_1.SCT_ID = 'dataItem.SCT_ID_SELECTION'
                    AND tb_1.INUSE = 1;

            SELECT
                        TOTAL_CLEAR_TIME AS TOTAL_CLEAR_TIME_FOR_SCT
            FROM
                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST
            WHERE
                        SCT_ID = 'dataItem.SCT_ID_SELECTION'
                    AND INUSE = 1;
                        `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB ?? '')
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID_SELECTION', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  getTimeDataByRevision: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_1.PROCESS_ID
                    , tb_1.CLEAR_TIME AS CLEAR_TIME_FOR_SCT
            FROM
                    dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS tb_1
            JOIN
                    dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL tb_2
            ON
                    tb_1.FISCAL_YEAR = tb_2.FISCAL_YEAR AND tb_1.REVISION_NO = tb_2.REVISION_NO AND tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
            WHERE
                        tb_2.CLEAR_TIME_FOR_SCT_TOTAL_ID = 'dataItem.RESOURCE_OPTION_DESCRIPTION'
                    AND tb_2.INUSE = 1;

            SELECT
                    tb_1.TOTAL_CLEAR_TIME_FOR_SCT
            FROM
                    dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_TOTAL tb_1
            WHERE
                        tb_1.CLEAR_TIME_FOR_SCT_TOTAL_ID = 'dataItem.RESOURCE_OPTION_DESCRIPTION'
                    AND tb_1.INUSE = 1;
                        `

    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB ?? '')

    sql = sql.replaceAll('dataItem.RESOURCE_OPTION_DESCRIPTION', dataItem['RESOURCE_OPTION_DESCRIPTION'])

    return sql
  },
  getMaterialPriceDataLatestRMPackingConsume: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_1.SCT_ID
                    , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
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
                                            item_m_o_price tb_3_1
                                                    INNER JOIN
                                            item_m_s_price tb_4_1
                                                    ON tb_3_1.ITEM_M_O_PRICE_ID = tb_4_1.ITEM_M_O_PRICE_ID
                                                    AND tb_4_1.inuse = 1
                                                    AND tb_3_1.INUSE = 1
                                                    AND tb_3_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                            INNER JOIN
                                    (
                                            SELECT
                                                      tbs_1.ITEM_ID
                                                    , MAX(tbs_2.VERSION) AS max_revision
                                            FROM
                                                    item_m_o_price tbs_1
                                                            INNER join
                                                    item_m_s_price tbs_2
                                                            ON tbs_1.item_m_o_price_id = tbs_2.item_m_o_price_id
                                                            AND tbs_1.inuse = 1
                                                            AND tbs_2.inuse = 1
                                                            AND tbs_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                            GROUP BY tbs_1.ITEM_ID
                                    ) tb_5_1
                                            ON tb_3_1.ITEM_ID = tb_5_1.ITEM_ID
                                            AND tb_4_1.VERSION = tb_5_1.max_revision
                                            ) AS tb_3
                            ON    tb_2.ITEM_ID = tb_3.ITEM_ID
                            INNER JOIN
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

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },

  getMaterialPriceDataBySctId: async (dataItem: any) => {
    let sql = `
                SELECT
                          tb_1.SCT_ID
                        , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                        , tb_3.PURCHASE_PRICE
                        , tb_3.PURCHASE_PRICE_CURRENCY_ID
                        , tb_4.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY
                        , tb_3.PURCHASE_PRICE_UNIT_ID
                        , tb_5.SYMBOL AS PURCHASE_UNIT
                        , tb_1.PRICE AS ITEM_M_S_PRICE_VALUE
                        , tb_6.ITEM_M_S_PRICE_ID
                        , tb_8.SYMBOL AS USAGE_UNIT
                        , tb_7.PURCHASE_UNIT_RATIO
                        , tb_7.USAGE_UNIT_RATIO
                        , tb_7.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_7.ITEM_ID
                        , tb_7.ITEM_INTERNAL_SHORT_NAME
                        , tb_9.ITEM_CATEGORY_ID
                        , tb_10.IMPORT_FEE_RATE
                FROM
                        dataItem.STANDARD_COST_DB.sct_bom_flow_process_item_usage_price tb_1
                                JOIN
                        BOM_FLOW_PROCESS_ITEM_USAGE tb_2
                                ON
                        tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_2.INUSE = 1
                                JOIN
                        ITEM_M_O_PRICE tb_3
                                ON
                        tb_2.ITEM_ID = tb_3.ITEM_ID AND tb_3.INUSE = 1
                                JOIN
                        CURRENCY tb_4
                                ON
                        tb_3.PURCHASE_PRICE_CURRENCY_ID = tb_4.CURRENCY_ID AND tb_4.INUSE = 1
                                JOIN
                        UNIT_OF_MEASUREMENT tb_5
                                ON
                        tb_3.PURCHASE_PRICE_UNIT_ID = tb_5.UNIT_OF_MEASUREMENT_ID AND tb_5.INUSE = 1
                                JOIN
                        ITEM_M_S_PRICE tb_6
                                ON
                        tb_3.ITEM_M_O_PRICE_ID = tb_6.ITEM_M_O_PRICE_ID AND tb_6.INUSE = 1 AND tb_1.ITEM_M_S_PRICE_ID = tb_6.ITEM_M_S_PRICE_ID
                                JOIN
                        ITEM_MANUFACTURING tb_7
                                ON
                        tb_2.ITEM_ID = tb_7.ITEM_ID AND tb_7.INUSE = 1
                                JOIN
                        UNIT_OF_MEASUREMENT tb_8
                                ON
                        tb_7.USAGE_UNIT_ID = tb_8.UNIT_OF_MEASUREMENT_ID AND tb_8.INUSE = 1
                                JOIN
                        ITEM tb_9
                                ON
                        tb_7.ITEM_ID = tb_9.ITEM_ID AND tb_9.INUSE = 1
                                LEFT JOIN
                        IMPORT_FEE tb_10
                                ON
                        tb_6.IMPORT_FEE_ID = tb_10.IMPORT_FEE_ID AND tb_10.INUSE = 1
                WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID_SELECTION'
                            AND tb_1.INUSE = 1

                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID_SELECTION', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  getYrAccumulationMaterialDataLatest: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_1.ITEM_ID
                    , tb_1.YIELD_ACCUMULATION_OF_ITEM_FOR_SCT AS YIELD_ACCUMULATION_FOR_SCT
            FROM
                    YIELD_ACCUMULATION_OF_ITEM_FOR_SCT tb_1
            WHERE
                        tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                    AND tb_1.REVISION_NO = (
                            SELECT
                                    MAX(tb_11.REVISION_NO)
                            FROM
                                    YIELD_ACCUMULATION_OF_ITEM_FOR_SCT tb_11
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
  getYrAccumulationMaterialDataBySctId: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_2.ITEM_ID
                    , IFNULL(tb_1.YIELD_ACCUMULATION, tb_1.YIELD_ACCUMULATION_DEFAULT) AS YIELD_ACCUMULATION_FOR_SCT
            FROM
                    dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_1
            JOIN
                    BOM_FLOW_PROCESS_ITEM_USAGE tb_2
            ON
                    tb_1.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_2.INUSE = 1
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID_SELECTION'
                    AND tb_1.INUSE = 1
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID_SELECTION', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  getSctDataDetail: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_1.SCT_ID
                    , tb_1.NOTE
                    , tb_1.FISCAL_YEAR
                    , tb_1.SCT_REVISION_CODE
                    , tb_1.ESTIMATE_PERIOD_START_DATE
                    , tb_1.ESTIMATE_PERIOD_END_DATE
                    , tb_5.PRODUCT_CATEGORY_ID
                    , tb_5.PRODUCT_CATEGORY_NAME
                    , tb_5.PRODUCT_CATEGORY_ALPHABET
                    , tb_4.PRODUCT_MAIN_ID
                    , tb_4.PRODUCT_MAIN_NAME
                    , tb_4.PRODUCT_MAIN_ALPHABET
                    , tb_3.PRODUCT_SUB_ID
                    , tb_3.PRODUCT_SUB_NAME
                    , tb_3.PRODUCT_SUB_ALPHABET
                    , tb_2.PRODUCT_TYPE_ID
                    , tb_2.PRODUCT_TYPE_CODE_FOR_SCT AS "PRODUCT_TYPE_CODE"
                    , tb_2.PRODUCT_TYPE_NAME
                    , tb_7.ITEM_CATEGORY_ID
                    , tb_7.ITEM_CATEGORY_NAME
                    , tb_7.ITEM_CATEGORY_ALPHABET
                    , tb_10.PRODUCT_SPECIFICATION_TYPE_ID
                    , tb_10.PRODUCT_SPECIFICATION_TYPE_NAME
                    , tb_10.PRODUCT_SPECIFICATION_TYPE_ALPHABET
                    , tb_11.SCT_PATTERN_ID
                    , tb_11.SCT_PATTERN_NAME
                    , tb_14.SCT_REASON_SETTING_ID
                    , tb_14.SCT_REASON_SETTING_NAME
                    , tb_16.SCT_TAG_SETTING_ID
                    , tb_16.SCT_TAG_SETTING_NAME
                    , tb_18.BOM_ID AS BOM_ID_ACTUAL
                    , tb_18.BOM_CODE AS BOM_CODE_ACTUAL
                    , tb_18.BOM_NAME AS BOM_NAME_ACTUAL
                    , tb_19.BOM_ID
                    , tb_19.BOM_CODE
                    , tb_19.BOM_NAME
                    , tb_25.FLOW_ID
                    , tb_25.FLOW_CODE
                    , tb_25.FLOW_NAME
                    , tb_25.TOTAL_COUNT_PROCESS
                    , tb_27.SCT_STATUS_PROGRESS_ID
                    , tb_28.SCT_STATUS_PROGRESS_NO
                    , tb_28.SCT_STATUS_PROGRESS_NAME
                    , tb_27.SCT_STATUS_WORKING_ID
                    , tb_29.ADJUST_PRICE
                    , tb_29.REMARK_FOR_ADJUST_PRICE
                    , tb_29.NOTE AS NOTE_PRICE
                    , tb_30.IMPORT_FEE_RATE
                    , tb_32.SCT_CREATE_FROM_SETTING_ID
                    , tb_33.SCT_CREATE_FROM_NAME
                    , tb_32.CREATE_FROM_SCT_ID
                    , tb_34.SCT_REVISION_CODE AS CREATE_FROM_SCT_REVISION_CODE
                    , tb_32.CREATE_FROM_SCT_FISCAL_YEAR
                    , tb_32.CREATE_FROM_SCT_PATTERN_ID
                    , tb_36.SCT_PATTERN_NAME AS CREATE_FROM_SCT_PATTERN_NAME
                    , tb_32.CREATE_FROM_SCT_STATUS_PROGRESS_ID
                    , tb_35.SCT_STATUS_PROGRESS_NAME AS CREATE_FROM_SCT_STATUS_PROGRESS_NAME
                    , tb_37.SELLING_PRICE AS CREATE_FROM_SELLING_PRICE
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
                            INNER JOIN
                    PRODUCT_TYPE tb_2
                            ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                            INNER JOIN
                    PRODUCT_SUB tb_3
                            ON tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                            INNER JOIN
                    PRODUCT_MAIN tb_4
                            ON tb_3.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
                            INNER JOIN
                    PRODUCT_CATEGORY tb_5
                            ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID
                            INNER JOIN
                    PRODUCT_TYPE_ITEM_CATEGORY tb_6
                            ON tb_2.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID AND tb_6.INUSE = 1
                            INNER JOIN
                    ITEM_CATEGORY tb_7
                            ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
                            INNER JOIN
                    PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_8
                            ON tb_2.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID AND tb_8.INUSE = 1
                            INNER JOIN
                    PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_9
                            ON tb_8.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                            INNER JOIN
                    PRODUCT_SPECIFICATION_TYPE tb_10
                            ON tb_9.PRODUCT_SPECIFICATION_TYPE_ID = tb_10.PRODUCT_SPECIFICATION_TYPE_ID
                            INNER JOIN
                    dataItem.STANDARD_COST_DB.SCT_PATTERN tb_11
                            ON tb_1.SCT_PATTERN_ID = tb_11.SCT_PATTERN_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_13
                            ON tb_1.SCT_ID = tb_13.SCT_ID AND tb_13.INUSE = 1
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_14
                            ON tb_13.SCT_REASON_SETTING_ID = tb_14.SCT_REASON_SETTING_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_15
                            ON tb_1.SCT_ID = tb_15.SCT_ID AND tb_15.INUSE = 1
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_16
                            ON tb_15.SCT_TAG_SETTING_ID = tb_16.SCT_TAG_SETTING_ID
                            LEFT JOIN
                    PRODUCT_TYPE_BOM tb_17
                            ON tb_2.PRODUCT_TYPE_ID = tb_17.PRODUCT_TYPE_ID AND tb_17.INUSE = 1
                            LEFT JOIN
                    BOM tb_18
                            ON tb_17.BOM_ID = tb_18.BOM_ID
                            LEFT JOIN
                    BOM tb_19
                            ON tb_1.BOM_ID = tb_19.BOM_ID
                            LEFT JOIN
                    FLOW tb_25
                            ON tb_19.FLOW_ID = tb_25.FLOW_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_27
                            ON tb_1.SCT_ID = tb_27.SCT_ID AND tb_27.INUSE = 1
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_28
                            ON tb_27.SCT_STATUS_PROGRESS_ID = tb_28.SCT_STATUS_PROGRESS_ID AND tb_28.INUSE = 1
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_29
                            ON tb_1.SCT_ID = tb_29.SCT_ID AND tb_29.INUSE = 1
                            LEFT JOIN
                    IMPORT_FEE tb_30
                            ON tb_1.FISCAL_YEAR = tb_30.FISCAL_YEAR
                            LEFT JOIN
                    PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_31
                            ON tb_1.PRODUCT_TYPE_ID = tb_31.PRODUCT_TYPE_ID AND tb_31.INUSE = 1
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_CREATE_FROM_HISTORY tb_32
                            ON tb_1.SCT_ID = tb_32.SCT_ID
                            AND tb_32.INUSE = 1
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_CREATE_FROM_SETTING tb_33
                            ON tb_32.SCT_CREATE_FROM_SETTING_ID = tb_33.SCT_CREATE_FROM_SETTING_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT tb_34
                            ON tb_32.CREATE_FROM_SCT_ID = tb_34.SCT_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_35
                            ON tb_32.CREATE_FROM_SCT_STATUS_PROGRESS_ID = tb_35.SCT_STATUS_PROGRESS_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_PATTERN tb_36
                            ON tb_32.CREATE_FROM_SCT_PATTERN_ID = tb_36.SCT_PATTERN_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_37
                            ON tb_34.SCT_ID = tb_37.SCT_ID
                            AND tb_37.INUSE = 1
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID'
            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getSctDetailForAdjust: async (dataItem: any) => {
    let sql = `
            SELECT
                      TOTAL_INDIRECT_COST
                    , CIT
                    , VAT
                    , GA
                    , MARGIN
                    , SELLING_EXPENSE
                    , ADJUST_PRICE
                    , SCT_DETAIL_FOR_ADJUST_ID
            FROM
                    dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST
            WHERE
                        SCT_ID = 'dataItem.SCT_ID'
                    AND INUSE = 1
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getSctDataOptionSelection: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_1.SCT_ID
                    , tb_3.SCT_COMPONENT_TYPE_ID
                    , tb_3.SCT_RESOURCE_OPTION_ID
                    , tb_3.RESOURCE_OPTION_DESCRIPTION
                    , tb_8.DIRECT_COST_CONDITION_ID
                    , tb_8.FISCAL_YEAR AS DIRECT_COST_CONDITION_FISCAL_YEAR
                    , tb_8.VERSION AS DIRECT_COST_CONDITION_VERSION
                    , tb_9.INDIRECT_COST_CONDITION_ID
                    , tb_9.FISCAL_YEAR AS INDIRECT_COST_CONDITION_FISCAL_YEAR
                    , tb_9.VERSION AS INDIRECT_COST_CONDITION_VERSION
                    , tb_10.OTHER_COST_CONDITION_ID
                    , tb_10.FISCAL_YEAR AS OTHER_COST_CONDITION_FISCAL_YEAR
                    , tb_10.VERSION AS OTHER_COST_CONDITION_VERSION
                    , tb_11.SPECIAL_COST_CONDITION_ID
                    , tb_11.FISCAL_YEAR AS SPECIAL_COST_CONDITION_FISCAL_YEAR
                    , tb_11.VERSION AS SPECIAL_COST_CONDITION_VERSION
                    , tb_12.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID
                    , tb_12.FISCAL_YEAR AS YR_GR_FISCAL_YEAR
                    , tb_12.REVISION_NO AS YR_GR_REVISION_NO


            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_3
                            ON
                    tb_1.SCT_ID = tb_3.SCT_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_DIRECT_COST_CONDITION tb_4
                            ON
                    tb_3.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_4.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_INDIRECT_COST_CONDITION tb_5
                            ON
                    tb_3.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_5.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_OTHER_COST_CONDITION tb_6
                            ON
                    tb_3.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_6.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_SPECIAL_COST_CONDITION tb_7
                            ON
                    tb_3.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_7.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                            LEFT JOIN
                    DIRECT_COST_CONDITION tb_8
                            ON
                    tb_4.DIRECT_COST_CONDITION_ID = tb_8.DIRECT_COST_CONDITION_ID
                            LEFT JOIN
                    INDIRECT_COST_CONDITION tb_9
                            ON
                    tb_5.INDIRECT_COST_CONDITION_ID = tb_9.INDIRECT_COST_CONDITION_ID
                            LEFT JOIN
                    OTHER_COST_CONDITION tb_10
                            ON
                    tb_6.OTHER_COST_CONDITION_ID = tb_10.OTHER_COST_CONDITION_ID
                            LEFT JOIN
                    SPECIAL_COST_CONDITION tb_11
                            ON
                    tb_7.SPECIAL_COST_CONDITION_ID = tb_11.SPECIAL_COST_CONDITION_ID
                            LEFT JOIN
                    YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_12
                            ON
                    tb_3.RESOURCE_OPTION_DESCRIPTION = tb_12.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID

            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID'
                    AND tb_3.INUSE = 1
            `

    //     let sql = `
    //         SELECT
    //                   tb_1.SCT_ID
    //                 , tb_3.SCT_COMPONENT_TYPE_ID
    //                 , tb_3.SCT_RESOURCE_OPTION_ID
    //                 , tb_3.RESOURCE_OPTION_DESCRIPTION
    //                 , tb_8.DIRECT_COST_CONDITION_ID
    //                 , tb_8.FISCAL_YEAR AS DIRECT_COST_CONDITION_FISCAL_YEAR
    //                 , tb_8.VERSION AS DIRECT_COST_CONDITION_VERSION
    //                 , tb_9.INDIRECT_COST_CONDITION_ID
    //                 , tb_9.FISCAL_YEAR AS INDIRECT_COST_CONDITION_FISCAL_YEAR
    //                 , tb_9.VERSION AS INDIRECT_COST_CONDITION_VERSION
    //                 , tb_10.OTHER_COST_CONDITION_ID
    //                 , tb_10.FISCAL_YEAR AS OTHER_COST_CONDITION_FISCAL_YEAR
    //                 , tb_10.VERSION AS OTHER_COST_CONDITION_VERSION
    //                 , tb_11.SPECIAL_COST_CONDITION_ID
    //                 , tb_11.FISCAL_YEAR AS SPECIAL_COST_CONDITION_FISCAL_YEAR
    //                 , tb_11.VERSION AS SPECIAL_COST_CONDITION_VERSION
    //                 , tb_12.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID
    //                 , tb_12.FISCAL_YEAR AS YR_GR_FISCAL_YEAR
    //                 , tb_12.REVISION_NO AS YR_GR_REVISION_NO
    //                 , tb_13.CLEAR_TIME_FOR_SCT_PROCESS_ID
    //                 , tb_13.FISCAL_YEAR AS CLEAR_TIME_FISCAL_YEAR
    //                 , tb_13.REVISION_NO AS CLEAR_TIME_REVISION_NO
    //         FROM
    //                 dataItem.STANDARD_COST_DB.SCT tb_1
    //                         LEFT JOIN
    //                 dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_3
    //                         ON
    //                 tb_1.SCT_ID = tb_3.SCT_ID
    //                         LEFT JOIN
    //                 dataItem.STANDARD_COST_DB.SCT_DIRECT_COST_CONDITION tb_4
    //                         ON
    //                 tb_3.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_4.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
    //                         LEFT JOIN
    //                 dataItem.STANDARD_COST_DB.SCT_INDIRECT_COST_CONDITION tb_5
    //                         ON
    //                 tb_3.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_5.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
    //                         LEFT JOIN
    //                 dataItem.STANDARD_COST_DB.SCT_OTHER_COST_CONDITION tb_6
    //                         ON
    //                 tb_3.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_6.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
    //                         LEFT JOIN
    //                 dataItem.STANDARD_COST_DB.SCT_SPECIAL_COST_CONDITION tb_7
    //                         ON
    //                 tb_3.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_7.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
    //                         LEFT JOIN
    //                 DIRECT_COST_CONDITION tb_8
    //                         ON
    //                 tb_4.DIRECT_COST_CONDITION_ID = tb_8.DIRECT_COST_CONDITION_ID
    //                         LEFT JOIN
    //                 INDIRECT_COST_CONDITION tb_9
    //                         ON
    //                 tb_5.INDIRECT_COST_CONDITION_ID = tb_9.INDIRECT_COST_CONDITION_ID
    //                         LEFT JOIN
    //                 OTHER_COST_CONDITION tb_10
    //                         ON
    //                 tb_6.OTHER_COST_CONDITION_ID = tb_10.OTHER_COST_CONDITION_ID
    //                         LEFT JOIN
    //                 SPECIAL_COST_CONDITION tb_11
    //                         ON
    //                 tb_7.SPECIAL_COST_CONDITION_ID = tb_11.SPECIAL_COST_CONDITION_ID
    //                         LEFT JOIN
    //                 YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_12
    //                         ON
    //                 tb_3.RESOURCE_OPTION_DESCRIPTION = tb_12.YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID
    //                         LEFT JOIN
    //                 dataItem.CYCLE_TIME_DB.CLEAR_TIME_FOR_SCT_PROCESS tb_13
    //                         ON
    //                 tb_3.RESOURCE_OPTION_DESCRIPTION = tb_13.CLEAR_TIME_FOR_SCT_PROCESS_ID
    //         WHERE
    //                 tb_1.SCT_ID = 'dataItem.SCT_ID'
    //                 AND tb_3.INUSE = 1
    //         `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.CYCLE_TIME_DB', process.env.CYCLE_TIME_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  // !!!! from "Pajjaphon" please check
  getSctDataOptionSelection_: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_1.SCT_ID
                    , tb_2.SCT_F_ID
                    , tb_3.SCT_F_COMPONENT_TYPE_ID
                    , tb_3.SCT_F_RESOURCE_OPTION_ID
                    , tb_3.RESOURCE_OPTION_DESCRIPTION
                    , tb_8.DIRECT_COST_CONDITION_ID
                    , tb_8.FISCAL_YEAR AS DIRECT_COST_CONDITION_FISCAL_YEAR
                    , tb_8.VERSION AS DIRECT_COST_CONDITION_VERSION
                    , tb_9.INDIRECT_COST_CONDITION_ID
                    , tb_9.FISCAL_YEAR AS INDIRECT_COST_CONDITION_FISCAL_YEAR
                    , tb_9.VERSION AS INDIRECT_COST_CONDITION_VERSION
                    , tb_10.OTHER_COST_CONDITION_ID
                    , tb_10.FISCAL_YEAR AS OTHER_COST_CONDITION_FISCAL_YEAR
                    , tb_10.VERSION AS OTHER_COST_CONDITION_VERSION
                    , tb_11.SPECIAL_COST_CONDITION_ID
                    , tb_11.FISCAL_YEAR AS SPECIAL_COST_CONDITION_FISCAL_YEAR
                    , tb_11.VERSION AS SPECIAL_COST_CONDITION_VERSION
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
                            JOIN
                    dataItem.STANDARD_COST_DB.SCT_SCT_F tb_2
                            ON
                    tb_1.SCT_ID = tb_2.SCT_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_3
                            ON
                    tb_2.SCT_F_ID = tb_3.SCT_F_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_F_DIRECT_COST_CONDITION tb_4
                            ON
                    tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_4.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_F_INDIRECT_COST_CONDITION tb_5
                            ON
                    tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_5.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_F_OTHER_COST_CONDITION tb_6
                            ON
                    tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_6.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                            LEFT JOIN
                    dataItem.STANDARD_COST_DB.SCT_F_SPECIAL_COST_CONDITION tb_7
                            ON
                    tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_7.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                            LEFT JOIN
                    DIRECT_COST_CONDITION tb_8
                            ON
                    tb_4.DIRECT_COST_CONDITION_ID = tb_8.DIRECT_COST_CONDITION_ID
                            LEFT JOIN
                    INDIRECT_COST_CONDITION tb_9
                            ON
                    tb_5.INDIRECT_COST_CONDITION_ID = tb_9.INDIRECT_COST_CONDITION_ID
                            LEFT JOIN
                    OTHER_COST_CONDITION tb_10
                            ON
                    tb_6.OTHER_COST_CONDITION_ID = tb_10.OTHER_COST_CONDITION_ID
                            LEFT JOIN
                    SPECIAL_COST_CONDITION tb_11
                            ON
                    tb_7.SPECIAL_COST_CONDITION_ID = tb_11.SPECIAL_COST_CONDITION_ID
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID'
            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getSctDataFlowProcess: async (dataItem: any) => {
    let sql = `
            SELECT
                        tb_1.SCT_ID
                      , tb_4.NO AS PROCESS_NO
                      , tb_5.PROCESS_NAME
                      , tb_5.PROCESS_ID
                      , tb_5.PROCESS_CODE
                      , tb_4.FLOW_PROCESS_ID
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
                            JOIN
                    BOM tb_2
                            ON
                    tb_1.BOM_ID = tb_2.BOM_ID
                            JOIN
                    FLOW tb_3
                            ON
                    tb_2.FLOW_ID = tb_3.FLOW_ID
                            JOIN
                    FLOW_PROCESS tb_4
                            ON
                    tb_3.FLOW_ID = tb_4.FLOW_ID AND tb_4.INUSE = 1
                            JOIN
                    PROCESS tb_5
                            ON
                    tb_4.PROCESS_ID = tb_5.PROCESS_ID AND tb_5.INUSE = 1
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID'
            ORDER BY
                    tb_4.NO
            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getSctDataMaterial: async (dataItem: any) => {
    let sql = `
            SELECT
                      tb_1.SCT_ID
                    , tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID
                    , tb_3.ITEM_INTERNAL_SHORT_NAME
                    , tb_3.ITEM_CODE_FOR_SUPPORT_MES
                    , tb_3.ITEM_ID
                    , tb_8.ITEM_CATEGORY_ID
                    , tb_9.ITEM_CATEGORY_NAME
                    , tb_2.USAGE_QUANTITY
                    , tb_6.NO AS PROCESS_NO
                    , tb_7.PROCESS_NAME
                    , tb_7.PROCESS_ID
            FROM
                    dataItem.STANDARD_COST_DB.SCT tb_1
                            JOIN
                    BOM_FLOW_PROCESS_ITEM_USAGE tb_2
                            ON
                    tb_1.BOM_ID = tb_2.BOM_ID AND tb_2.INUSE = 1
                            JOIN
                    ITEM_MANUFACTURING tb_3
                            ON
                    tb_2.ITEM_ID = tb_3.ITEM_ID AND tb_3.INUSE = 1
                            JOIN
                    ITEM tb_4
                            ON
                    tb_3.ITEM_ID = tb_4.ITEM_ID
                            JOIN
                    ITEM_CATEGORY tb_5
                            ON
                    tb_4.ITEM_CATEGORY_ID = tb_5.ITEM_CATEGORY_ID
                            JOIN
                    FLOW_PROCESS tb_6
                            ON
                    tb_2.FLOW_PROCESS_ID = tb_6.FLOW_PROCESS_ID
                            JOIN
                    PROCESS tb_7
                            ON
                    tb_6.PROCESS_ID = tb_7.PROCESS_ID
                            JOIN
                    BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_8
                            ON
                    tb_2.ITEM_ID = tb_8.ITEM_ID AND tb_8.INUSE = 1 AND tb_2.BOM_ID = tb_8.BOM_ID AND tb_2.FLOW_PROCESS_ID = tb_8.FLOW_PROCESS_ID AND tb_2.NO = tb_8.NO
                            JOIN
                    ITEM_CATEGORY tb_9
                            ON
                    tb_8.ITEM_CATEGORY_ID = tb_9.ITEM_CATEGORY_ID
            WHERE
                    tb_1.SCT_ID = 'dataItem.SCT_ID'
            ORDER BY
                    tb_2.FLOW_PROCESS_ID, tb_2.NO
            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  searchCostConditionIdByProductTypeIdAndSctLatest: async (dataItem: any) => {
    let sql = `
        SELECT
                  tb_4.DIRECT_COST_CONDITION_ID
                , tb_5.INDIRECT_COST_CONDITION_ID
                , tb_6.OTHER_COST_CONDITION_ID
                , tb_7.SPECIAL_COST_CONDITION_ID
        FROM
                dataItem.STANDARD_COST_DB.SCT_F_S tb_1
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING tb_2
        ON
                tb_1.SCT_F_ID = tb_2.SCT_F_ID
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_3
        ON
                tb_1.SCT_F_ID = tb_3.SCT_F_ID AND tb_3.INUSE = 1
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_DIRECT_COST_CONDITION tb_4
        ON
                tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_4.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_4.INUSE = 1
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_INDIRECT_COST_CONDITION tb_5
        ON
                tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_5.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_5.INUSE = 1
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_OTHER_COST_CONDITION tb_6
        ON
                tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_6.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_6.INUSE = 1
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_SPECIAL_COST_CONDITION tb_7
        ON
                tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_7.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_7.INUSE = 1
        WHERE
                    tb_2.SCT_F_STATUS_WORKING_ID = 1
                AND tb_2.SCT_F_STATUS_PROGRESS_ID = 7
                AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                AND tb_3.SCT_F_COMPONENT_TYPE_ID = 1
        ORDER BY
                tb_3.UPDATE_DATE DESC
        LIMIT
                1
                `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE'].PRODUCT_TYPE_ID)

    return sql
  },
  searchCostConditionBySctFId: async (dataItem: any) => {
    let sql = `
        SELECT
                  tb_2.DIRECT_COST_CONDITION_ID
                , tb_3.INDIRECT_COST_CONDITION_ID
                , tb_4.OTHER_COST_CONDITION_ID
                , tb_5.SPECIAL_COST_CONDITION_ID
        FROM
                dataItem.STANDARD_COST_DB.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_1
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_DIRECT_COST_CONDITION tb_2
        ON
                tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_2.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_2.INUSE = 1
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_INDIRECT_COST_CONDITION tb_3
        ON
                tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_3.INUSE = 1
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_OTHER_COST_CONDITION tb_4
        ON
                tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_4.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_4.INUSE = 1
        JOIN
                dataItem.STANDARD_COST_DB.SCT_F_SPECIAL_COST_CONDITION tb_5
        ON
                tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_5.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_5.INUSE = 1
        WHERE
                    tb_1.SCT_F_ID = 'dataItem.SCT_F_ID'
                AND tb_1.INUSE = 1
                AND tb_1.SCT_F_COMPONENT_TYPE_ID = 1
                `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['COST_CONDITION'].SCT_F_ID)

    return sql
  },
  searchStandardFormProductType: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `
                SELECT
                        COUNT(*) AS TOTAL_COUNT
                FROM
                        dataItem.STANDARD_COST_DB.SCT_F_S tb_1
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F tb_2
                ON
                        tb_1.SCT_F_ID = tb_2.SCT_F_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_CREATE_TYPE tb_3
                ON
                        tb_2.SCT_F_CREATE_TYPE_ID = tb_3.SCT_F_CREATE_TYPE_ID
                JOIN
                        PRODUCT_TYPE tb_4
                ON
                        tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                JOIN
                        PRODUCT_TYPE_BOM tb_5
                ON
                        tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                JOIN
                        BOM tb_6
                ON
                        tb_5.BOM_ID = tb_6.BOM_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING tb_7
                ON
                        tb_1.SCT_F_ID = tb_7.SCT_F_ID
                JOIN
                        PRODUCT_SUB tb_8
                ON
                        tb_4.PRODUCT_SUB_ID = tb_8.PRODUCT_SUB_ID
                JOIN
                        PRODUCT_MAIN tb_9
                ON
                        tb_8.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID
                JOIN
                        PRODUCT_CATEGORY tb_10
                ON
                        tb_9.PRODUCT_CATEGORY_ID = tb_10.PRODUCT_CATEGORY_ID
                JOIN
                        FLOW tb_11
                ON
                        tb_6.FLOW_ID = tb_11.FLOW_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_PATTERN tb_12
                ON
                        tb_1.SCT_PATTERN_ID = tb_12.SCT_PATTERN_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_REASON_HISTORY tb_13
                ON
                        tb_1.SCT_F_ID = tb_13.SCT_F_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_14
                ON
                        tb_13.SCT_REASON_SETTING_ID = tb_14.SCT_REASON_SETTING_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_TAG_HISTORY tb_15
                ON
                        tb_1.SCT_F_ID = tb_15.SCT_F_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_16
                ON
                        tb_15.SCT_TAG_SETTING_ID = tb_16.SCT_TAG_SETTING_ID
                WHERE
                            tb_7.SCT_F_STATUS_WORKING_ID = 2
                        AND tb_7.INUSE = 1
                        dataItem.sqlWhere
                        sqlWhereColumnFilter
                `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sqlList.push(sql)

    sql = `
                SELECT
                          tb_3.SCT_F_CREATE_TYPE_NAME
                        , tb_2.SCT_F_CODE
                        , tb_4.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                        , tb_4.PRODUCT_TYPE_NAME
                        , tb_6.BOM_CODE
                        , tb_6.BOM_NAME
                        , tb_2.SCT_F_ID
                        , tb_8.PRODUCT_SUB_NAME
                        , tb_9.PRODUCT_MAIN_NAME
                        , tb_10.PRODUCT_CATEGORY_NAME
                        , tb_11.FLOW_NAME
                        , tb_1.FISCAL_YEAR
                        , tb_12.SCT_PATTERN_NAME
                        , tb_14.SCT_REASON_SETTING_NAME
                        , tb_16.SCT_TAG_SETTING_NAME
                        , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                        , tb_1.UPDATE_BY
                FROM
                        dataItem.STANDARD_COST_DB.SCT_F_S tb_1
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F tb_2
                ON
                        tb_1.SCT_F_ID = tb_2.SCT_F_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_CREATE_TYPE tb_3
                ON
                        tb_2.SCT_F_CREATE_TYPE_ID = tb_3.SCT_F_CREATE_TYPE_ID
                JOIN
                        PRODUCT_TYPE tb_4
                ON
                        tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                JOIN
                        PRODUCT_TYPE_BOM tb_5
                ON
                        tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                JOIN
                        BOM tb_6
                ON
                        tb_5.BOM_ID = tb_6.BOM_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING tb_7
                ON
                        tb_1.SCT_F_ID = tb_7.SCT_F_ID
                JOIN
                        PRODUCT_SUB tb_8
                ON
                        tb_4.PRODUCT_SUB_ID = tb_8.PRODUCT_SUB_ID
                JOIN
                        PRODUCT_MAIN tb_9
                ON
                        tb_8.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID
                JOIN
                        PRODUCT_CATEGORY tb_10
                ON
                        tb_9.PRODUCT_CATEGORY_ID = tb_10.PRODUCT_CATEGORY_ID
                JOIN
                        FLOW tb_11
                ON
                        tb_6.FLOW_ID = tb_11.FLOW_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_PATTERN tb_12
                ON
                        tb_1.SCT_PATTERN_ID = tb_12.SCT_PATTERN_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_REASON_HISTORY tb_13
                ON
                        tb_1.SCT_F_ID = tb_13.SCT_F_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_14
                ON
                        tb_13.SCT_REASON_SETTING_ID = tb_14.SCT_REASON_SETTING_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_TAG_HISTORY tb_15
                ON
                        tb_1.SCT_F_ID = tb_15.SCT_F_ID
                JOIN
                        dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_16
                ON
                        tb_15.SCT_TAG_SETTING_ID = tb_16.SCT_TAG_SETTING_ID
                WHERE
                            tb_7.SCT_F_STATUS_WORKING_ID = 2
                        AND tb_7.INUSE = 1
                        dataItem.sqlWhere
                        sqlWhereColumnFilter
                ORDER BY
                        dataItem.Order
                LIMIT
                        dataItem.Start
                      , dataItem.Limit
                `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    //     console.log(sql)

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  searchProductType: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `
                    SELECT
                            COUNT(*) AS TOTAL_COUNT
                    FROM
                            PRODUCT_TYPE tb_1
                    LEFT JOIN
                            SCT tb_2
                    ON
                            tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                    LEFT JOIN
                            SCT_BOM tb_3
                    ON
                            tb_2.SCT_ID = tb_3.SCT_ID
                    LEFT JOIN
                            BOM tb_4
                    ON
                            tb_3.BOM_ID = tb_4.BOM_ID
                    LEFT JOIN
                            PRODUCT_TYPE_PROGRESS_WORKING tb_5
                    ON
                            tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                    WHERE
                                tb_5.PRODUCT_TYPE_STATUS_WORKING_ID = 1
                            AND tb_2.SCT_ID IS NULL
                            dataItem.sqlWhere
                            sqlWhereColumnFilter
                    `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sqlList.push(sql)

    sql = `
                    SELECT
                            tb_1.PRODUCT_TYPE_ID
                          , tb_1.PRODUCT_TYPE_NAME
                          , tb_1.PRODUCT_TYPE_CODE
                          , tb_4.BOM_CODE
                          , tb_4.BOM_NAME
                          , tb_2.SCT_REVISION_CODE
                    FROM
                            PRODUCT_TYPE tb_1
                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT tb_2
                    ON
                            tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                    LEFT JOIN
                            dataItem.STANDARD_COST_DB.SCT_BOM tb_3
                    ON
                            tb_2.SCT_ID = tb_3.SCT_ID
                    LEFT JOIN
                            BOM tb_4
                    ON
                            tb_3.BOM_ID = tb_4.BOM_ID
                    LEFT JOIN
                            PRODUCT_TYPE_PROGRESS_WORKING tb_5
                    ON
                            tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                    WHERE
                                tb_5.PRODUCT_TYPE_STATUS_WORKING_ID = 1
                            AND tb_2.SCT_ID IS NULL
                            dataItem.sqlWhere
                            sqlWhereColumnFilter
                    ORDER BY
                            dataItem.Order
                    LIMIT
                            dataItem.Start
                          , dataItem.Limit
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)

    sqlList.push(sql)
    sqlList = sqlList.join(';')

    return sqlList
  },
  generateSctCode: async (dataItem: any) => {
    let sql = `
        SET @sctCode = (
                SELECT
                        CONCAT('dataItem.SCT_F_CREATE_TYPE_ALPHABET', 'dataItem.PRODUCT_TYPE_CODE',
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

    sql = sql.replaceAll('dataItem.SCT_F_CREATE_TYPE_ALPHABET', dataItem['SCT_F_CREATE_TYPE_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE'].PRODUCT_TYPE_CODE)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_TYPE'].PRODUCT_MAIN_ALPHABET)
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_TYPE_ALPHABET', dataItem['PRODUCT_TYPE'].PRODUCT_SPECIFICATION_TYPE_ALPHABET)
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].value)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_NO', dataItem['SCT_PATTERN_NO'].label)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_NO'].value)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE'].PRODUCT_TYPE_ID)

    return sql
  },
  generateSctFCode: async (dataItem: any) => {
    let sql = `
        SET @sctFCode = (
                SELECT
                        CONCAT('dataItem.SCT_F_CREATE_TYPE_ALPHABET', 'dataItem.PRODUCT_TYPE_CODE',
                         '-', 'dataItem.PRODUCT_MAIN_ALPHABET', '-', 'dataItem.PRODUCT_SPECIFICATION_TYPE_ALPHABET',
                          '-', SUBSTRING('dataItem.FISCAL_YEAR',3,4), '-', 'dataItem.SCT_PATTERN_NO', '-', (
                                SELECT
                                        LPAD(IFNULL(COUNT(*), 0) + 1, 2, '0')
                                FROM
                                        dataItem.STANDARD_COST_DB.SCT_F_S
                                WHERE
                                            PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                        AND FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                        AND SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                        ))

        );
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_CREATE_TYPE_ALPHABET', dataItem['SCT_F_CREATE_TYPE_ALPHABET'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE'].PRODUCT_TYPE_CODE)
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ALPHABET', dataItem['PRODUCT_TYPE'].PRODUCT_MAIN_ALPHABET)
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_TYPE_ALPHABET', dataItem['PRODUCT_TYPE'].PRODUCT_SPECIFICATION_TYPE_ALPHABET)
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].value)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_NO', dataItem['SCT_PATTERN_NO'].label)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_NO'].value)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE'].PRODUCT_TYPE_ID)

    return sql
  },

  generateSctFProgressWorkingNo: async (dataItem: any) => {
    let sql = `
                    SET @sctFProgressWorkingNo = (
                            SELECT
                                    IFNULL(COUNT(*), 0) + 1
                            FROM
                                    dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING
                            WHERE
                                    SCT_F_ID = 'dataItem.SCT_F_ID'
                    );
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['UUID_SCT_F_ID'])

    return sql
  },

  insertSct: async (dataItem: any, uuid: any) => {
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
                , CREATE_DATE
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.UUID_SCT_ID'
                , 'dataItem.SCT_FORMULA_VERSION_ID'
                , ${dataItem['SCT_F_CODE'] ? `'${dataItem['SCT_F_CODE']}'` : '@sctCode'}
                , 'dataItem.FISCAL_YEAR'
                , 'dataItem.SCT_PATTERN_ID'
                , 'dataItem.PRODUCT_TYPE_ID'
                , 'dataItem.BOM_ID'
                , dataItem.START_DATE
                , dataItem.END_DATE
                , 'dataItem.NOTE'
                , ''
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 1
        );
                `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_ID', uuid)
    sql = sql.replaceAll('dataItem.SCT_FORMULA_VERSION_ID', dataItem['SCT_FORMULA_VERSION_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR']?.value)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_NO']?.value)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE']?.PRODUCT_TYPE_ID)
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.START_DATE', dataItem['START_DATE'] ? `'${dataItem['START_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.END_DATE', dataItem['END_DATE'] ? `'${dataItem['END_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctF: async (dataItem: any, uuid: any) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.SCT_F
        (
                  SCT_F_ID
                , SCT_F_CODE
                , SCT_F_CREATE_TYPE_ID
                , DESCRIPTION
                , CREATE_BY
                , CREATE_DATE
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.UUID_SCT_F_ID'
                , @sctFCode
                , 'dataItem.SCT_F_CREATE_TYPE_ID'
                , ''
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 1
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', uuid)
    sql = sql.replaceAll('dataItem.SCT_F_CREATE_TYPE_ID', dataItem['SCT_F_CREATE_TYPE_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctFMultiple: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_F
            (
                      SCT_F_ID
                    , SCT_F_CODE
                    , SCT_F_CREATE_TYPE_ID
                    , DESCRIPTION
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
            )
            VALUES
            (
                      'dataItem.UUID_SCT_F_ID'
                    , @sctCodeMultiple
                    , 'dataItem.SCT_F_CREATE_TYPE_ID'
                    , ''
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
            )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', uuid)
    sql = sql.replaceAll('dataItem.SCT_F_CREATE_TYPE_ID', dataItem['SCT_F_CREATE_TYPE_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctFTagHistory: async (dataItem: any, uuid: any) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_TAG_HISTORY
        (
                  SCT_F_TAG_HISTORY_ID
                , SCT_F_ID
                , SCT_TAG_SETTING_ID
                , DESCRIPTION
                , CREATE_BY
                , CREATE_DATE
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.UUID_SCT_F_TAG_HISTORY_ID'
                , 'dataItem.UUID_SCT_F_ID'
                , 'dataItem.SCT_TAG_SETTING_ID'
                , ''
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 1
        )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_F_TAG_HISTORY_ID', uuid)
    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', dataItem['UUID_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.SCT_TAG_SETTING_ID', dataItem['SCT_TAG_SETTING'].SCT_TAG_SETTING_ID)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },

  insertSctFReasonHistory: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_REASON_HISTORY
            (
                      SCT_F_REASON_HISTORY_ID
                    , SCT_F_ID
                    , SCT_REASON_SETTING_ID
                    , DESCRIPTION
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
            )
            VALUES
            (
                      'dataItem.UUID_SCT_F_REASON_HISTORY_ID'
                    , 'dataItem.UUID_SCT_F_ID'
                    , 'dataItem.SCT_REASON_SETTING_ID'
                    , ''
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
            )
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_F_REASON_HISTORY_ID', uuid)
    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', dataItem['UUID_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.SCT_REASON_SETTING_ID', dataItem['SCT_REASON_SETTING'].SCT_REASON_SETTING_ID)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  deleteSctFTagHistory: async (dataItem: any) => {
    let sql = `
        UPDATE
                dataItem.STANDARD_COST_DB.SCT_F_TAG_HISTORY
        SET
                  INUSE = 0
                , UPDATE_BY = 'dataItem.UPDATE_BY'
                , UPDATE_DATE = CURRENT_TIMESTAMP()
        WHERE
                SCT_F_ID = 'dataItem.UUID_SCT_F_ID'
            `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', dataItem['UUID_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteSctFReasonHistory: async (dataItem: any) => {
    let sql = `
                UPDATE
                        SCT_F_REASON_HISTORY
                SET
                          INUSE = 0
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                WHERE
                        SCT_F_ID = 'dataItem.UUID_SCT_F_ID'
                `
    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', dataItem['UUID_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  insertSctSctF: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_SCT_F
            (
                      SCT_SCT_F_ID
                    , SCT_ID
                    , SCT_F_ID
                    , DESCRIPTION
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
            )
            VALUES
            (
                      'dataItem.UUID_SCT_SCT_F_ID'
                    , 'dataItem.UUID_SCT_ID'
                    , 'dataItem.UUID_SCT_F_ID'
                    , ''
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
            )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_SCT_F_ID', uuid)
    sql = sql.replaceAll('dataItem.UUID_SCT_ID', dataItem['UUID_SCT_ID'])
    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', dataItem['UUID_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctFS: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_S
            (
                      SCT_F_S_ID
                    , SCT_F_ID
                    , FISCAL_YEAR
                    , SCT_PATTERN_ID
                    , PRODUCT_TYPE_ID
                    , BOM_ID
                    , ESTIMATE_PERIOD_START_DATE
                    , ESTIMATE_PERIOD_END_DATE
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
                      'dataItem.UUID_SCT_F_S_ID'
                    , 'dataItem.UUID_SCT_F_ID'
                    , 'dataItem.FISCAL_YEAR'
                    , 'dataItem.SCT_PATTERN_ID'
                    , 'dataItem.PRODUCT_TYPE_ID'
                    , 'dataItem.BOM_ID'
                    , dataItem.START_DATE
                    , dataItem.END_DATE
                    , 'dataItem.NOTE'
                    , ''
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
            )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_F_S_ID', uuid)
    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', dataItem['UUID_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].value)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_NO'].value)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE'].PRODUCT_TYPE_ID)
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.START_DATE', dataItem['START_DATE'] ? `'${dataItem['START_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.END_DATE', dataItem['END_DATE'] ? `'${dataItem['END_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctFComponentTypeResourceOptionSelect: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
            (
                      SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                    , SCT_F_ID
                    , SCT_F_COMPONENT_TYPE_ID
                    , SCT_F_RESOURCE_OPTION_ID
                    , RESOURCE_OPTION_DESCRIPTION
                    , DESCRIPTION
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
            )
            VALUES
            (
                      'dataItem.UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                    , 'dataItem.UUID_SCT_F_ID'
                    , 'dataItem.SCT_F_COMPONENT_TYPE_ID'
                    , 'dataItem.SCT_F_RESOURCE_OPTION_ID'
                    , 'dataItem.RESOURCE_OPTION_DESCRIPTION'
                    , ''
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1

            )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', uuid)
    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', dataItem['UUID_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_COMPONENT_TYPE_ID', dataItem['SCT_F_COMPONENT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_RESOURCE_OPTION_ID', dataItem['SCT_F_RESOURCE_OPTION_ID'])
    sql = sql.replaceAll('dataItem.RESOURCE_OPTION_DESCRIPTION', dataItem['RESOURCE_OPTION_DESCRIPTION'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctComponentTypeResourceOptionSelect: async (dataItem: {
    SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID: string
    SCT_ID: string
    SCT_COMPONENT_TYPE_ID: number
    SCT_RESOURCE_OPTION_ID: number
    IS_FROM_SCT_COPY: number
    CREATE_BY: string
    UPDATE_BY: string
  }) => {
    let sql = `
                INSERT INTO dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
                (
                          SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                        , SCT_ID
                        , SCT_COMPONENT_TYPE_ID
                        , SCT_RESOURCE_OPTION_ID
                        , CREATE_BY
                        , UPDATE_BY
                        , UPDATE_DATE
                        , INUSE
                        , IS_FROM_SCT_COPY
                )
                VALUES
                (
                          'dataItem.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                        , 'dataItem.SCT_ID'
                        , 'dataItem.SCT_COMPONENT_TYPE_ID'
                        , 'dataItem.SCT_RESOURCE_OPTION_ID'
                        , 'dataItem.CREATE_BY'
                        , 'dataItem.UPDATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 1
                        , 'dataItem.IS_FROM_SCT_COPY'

                )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem['SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_COMPONENT_TYPE_ID', dataItem['SCT_COMPONENT_TYPE_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_RESOURCE_OPTION_ID', dataItem['SCT_RESOURCE_OPTION_ID'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  insertSctFProgressWorking: async (dataItem: any, uuid: any) => {
    let sql = `
            INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING
            (
                      SCT_F_PROGRESS_WORKING_ID
                    , SCT_F_ID
                    , SCT_F_PROGRESS_WORKING_NO
                    , SCT_F_STATUS_PROGRESS_ID
                    , SCT_F_STATUS_WORKING_ID
                    , DESCRIPTION
                    , CREATE_BY
                    , CREATE_DATE
                    , UPDATE_BY
                    , UPDATE_DATE
                    , INUSE
            )
            VALUES
            (
                      'dataItem.UUID_SCT_F_PROGRESS_WORKING_ID'
                    , 'dataItem.UUID_SCT_F_ID'
                    , @sctFProgressWorkingNo
                    , 'dataItem.SCT_F_STATUS_PROGRESS_ID'
                    , 'dataItem.SCT_F_STATUS_WORKING_ID'
                    , ''
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 'dataItem.CREATE_BY'
                    , CURRENT_TIMESTAMP()
                    , 1
            )
                    `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_F_PROGRESS_WORKING_ID', uuid)
    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', dataItem['UUID_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_STATUS_PROGRESS_ID', dataItem['SCT_F_STATUS_PROGRESS_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_STATUS_WORKING_ID', dataItem['SCT_F_STATUS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  generateSctProgressWorkingNo: async (dataItem: { SCT_ID: string }) => {
    let sql = `
                        SET @sctProgressWorkingNo = (
                                SELECT
                                        IFNULL(COUNT(*), 0) + 1
                                FROM
                                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING
                                WHERE
                                        SCT_ID = 'dataItem.SCT_ID'
                        );
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  insertSctProgressWorking: async (dataItem: {
    SCT_PROGRESS_WORKING_ID: string
    SCT_ID: string
    SCT_STATUS_PROGRESS_ID: number
    SCT_STATUS_WORKING_ID: number
    CREATE_BY: string
    UPDATE_BY: string
  }) => {
    let sql = `
                INSERT INTO dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING
                (
                          SCT_PROGRESS_WORKING_ID
                        , SCT_ID
                        , SCT_PROGRESS_WORKING_NO
                        , SCT_STATUS_PROGRESS_ID
                        , SCT_STATUS_WORKING_ID
                        , CREATE_BY
                        , UPDATE_BY
                        , UPDATE_DATE
                        , INUSE
                )
                VALUES
                (
                          'dataItem.SCT_PROGRESS_WORKING_ID'
                        , 'dataItem.SCT_ID'
                        ,  @sctProgressWorkingNo
                        , 'dataItem.SCT_STATUS_PROGRESS_ID'
                        , 'dataItem.SCT_STATUS_WORKING_ID'
                        , 'dataItem.CREATE_BY'
                        , 'dataItem.UPDATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 1
                )
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_PROGRESS_WORKING_ID', dataItem['SCT_PROGRESS_WORKING_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.SCT_STATUS_PROGRESS_ID', dataItem['SCT_STATUS_PROGRESS_ID'].toString())
    sql = sql.replaceAll('dataItem.SCT_STATUS_WORKING_ID', dataItem['SCT_STATUS_WORKING_ID'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteSctProgressWorking: async (dataItem: { SCT_ID: string; UPDATE_BY: string }) => {
    let sql = `
                        UPDATE
                                dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING
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
  insertSctFDirectCostCondition: async (dataItem: any) => {
    let sql = `
              INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_DIRECT_COST_CONDITION
              (
                        SCT_F_DIRECT_COST_CONDITION_ID
                      , SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                      , DIRECT_COST_CONDITION_ID
                      , DESCRIPTION
                      , CREATE_BY
                      , CREATE_DATE
                      , UPDATE_BY
                      , UPDATE_DATE
                      , INUSE
              )
              VALUES
              (
                        'dataItem.SCT_F_DIRECT_COST_CONDITION_ID'
                      , 'dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                      , 'dataItem.DIRECT_COST_CONDITION_ID'
                      , 'dataItem.SCT_ID'
                      , 'dataItem.CREATE_BY'
                      , CURRENT_TIMESTAMP()
                      , 'dataItem.CREATE_BY'
                      , CURRENT_TIMESTAMP()
                      , 1

              )
                      `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_DIRECT_COST_CONDITION_ID', dataItem['SCT_F_DIRECT_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem['SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'])
    sql = sql.replaceAll('dataItem.DIRECT_COST_CONDITION_ID', dataItem['DIRECT_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctFIndirectCostCondition: async (dataItem: any) => {
    let sql = `
                  INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_INDIRECT_COST_CONDITION
                  (
                            SCT_F_INDIRECT_COST_CONDITION_ID
                          , SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                          , INDIRECT_COST_CONDITION_ID
                          , DESCRIPTION
                          , CREATE_BY
                          , CREATE_DATE
                          , UPDATE_BY
                          , UPDATE_DATE
                          , INUSE
                  )
                  VALUES
                  (
                            'dataItem.SCT_F_INDIRECT_COST_CONDITION_ID'
                          , 'dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                          , 'dataItem.INDIRECT_COST_CONDITION_ID'
                          , 'dataItem.SCT_ID'
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 1

                  )
                          `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_INDIRECT_COST_CONDITION_ID', dataItem['SCT_F_INDIRECT_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem['SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'])
    sql = sql.replaceAll('dataItem.INDIRECT_COST_CONDITION_ID', dataItem['INDIRECT_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctFOtherCostCondition: async (dataItem: any) => {
    let sql = `
                        INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_OTHER_COST_CONDITION
                        (
                                  SCT_F_OTHER_COST_CONDITION_ID
                                , SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                                , OTHER_COST_CONDITION_ID
                                , DESCRIPTION
                                , CREATE_BY
                                , CREATE_DATE
                                , UPDATE_BY
                                , UPDATE_DATE
                                , INUSE
                        )
                        VALUES
                        (
                                  'dataItem.SCT_F_OTHER_COST_CONDITION_ID'
                                , 'dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                                , 'dataItem.OTHER_COST_CONDITION_ID'
                                , 'dataItem.SCT_ID'
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 1

                        )
                                `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_F_OTHER_COST_CONDITION_ID', dataItem['SCT_F_OTHER_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem['SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'])
    sql = sql.replaceAll('dataItem.OTHER_COST_CONDITION_ID', dataItem['OTHER_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctFSpecialCostCondition: async (dataItem: any) => {
    let sql = `
                        INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_SPECIAL_COST_CONDITION
                        (
                                  SCT_F_SPECIAL_COST_CONDITION_ID
                                , SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                                , SPECIAL_COST_CONDITION_ID
                                , DESCRIPTION
                                , CREATE_BY
                                , CREATE_DATE
                                , UPDATE_BY
                                , UPDATE_DATE
                                , INUSE
                        )
                        VALUES
                        (
                                  'dataItem.SCT_F_SPECIAL_COST_CONDITION_ID'
                                , 'dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                                , 'dataItem.SPECIAL_COST_CONDITION_ID'
                                , 'dataItem.SCT_ID'
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 1

                        )
                                `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_F_SPECIAL_COST_CONDITION_ID', dataItem['SCT_F_SPECIAL_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem['SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'])
    sql = sql.replaceAll('dataItem.SPECIAL_COST_CONDITION_ID', dataItem['SPECIAL_COST_CONDITION_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctFMaterialPrice: async (dataItem: any) => {
    let sql = `
        INSERT INTO SCT_F_MATERIAL_PRICE
        (
                  SCT_F_MATERIAL_PRICE_ID
                , SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                , ITEM_M_S_PRICE_ID
                , DESCRIPTION
                , CREATE_BY
                , CREATE_DATE
                , UPDATE_BY
                , UPDATE_DATE
                , INUSE
        )
        VALUES
        (
                  'dataItem.SCT_F_MATERIAL_PRICE_ID'
                , 'dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'
                , 'dataItem.ITEM_M_S_PRICE_ID'
                , 'dataItem.SCT_ID'
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , 1
        )
                                `

    sql = sql.replaceAll('dataItem.SCT_F_MATERIAL_PRICE_ID', dataItem['SCT_F_MATERIAL_PRICE_ID'])
    sql = sql.replaceAll('dataItem.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID', dataItem['SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID'])
    sql = sql.replaceAll('dataItem.ITEM_M_S_PRICE_ID', dataItem['ITEM_M_S_PRICE_ID'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  updateSctFS: async (dataItem: any) => {
    let sql = `
        UPDATE
                dataItem.STANDARD_COST_DB.SCT_F_S
        SET
                  BOM_ID = 'dataItem.BOM_ID'
                , ESTIMATE_PERIOD_START_DATE = dataItem.START_DATE
                , ESTIMATE_PERIOD_END_DATE = dataItem.END_DATE
                , NOTE = 'dataItem.NOTE'
                , UPDATE_BY = 'dataItem.UPDATE_BY'
                , UPDATE_DATE = CURRENT_TIMESTAMP()
        WHERE
                SCT_F_ID = 'dataItem.SCT_F_ID'
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'])
    sql = sql.replaceAll('dataItem.START_DATE', dataItem['START_DATE'] ? `'${dataItem['START_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.END_DATE', dataItem['END_DATE'] ? `'${dataItem['END_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] ?? '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  updateUpdateByUpdateDateBySctId: async (dataItem: any) => {
    let sql = `
            UPDATE
                    dataItem.STANDARD_COST_DB.SCT
            SET
                      UPDATE_BY = 'dataItem.UPDATE_BY'
                    , UPDATE_DATE = CURRENT_TIMESTAMP()
            WHERE
                    SCT_ID = 'dataItem.SCT_ID'
                            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteSctFComponentTypeResourceOptionSelect: async (dataItem: any) => {
    let sql = `
        UPDATE
                dataItem.STANDARD_COST_DB.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_1
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_DIRECT_COST_CONDITION tb_2
                ON
                        tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_2.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_INDIRECT_COST_CONDITION tb_3
                ON
                        tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_3.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_OTHER_COST_CONDITION tb_4
                ON
                        tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_4.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_SPECIAL_COST_CONDITION tb_5
                ON
                        tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_5.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_MATERIAL_PRICE tb_6
                ON
                        tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_6.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
        SET
                  tb_1.INUSE = '0'
                , tb_1.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_1.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_2.INUSE = '0'
                , tb_2.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_2.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_3.INUSE = '0'
                , tb_3.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_3.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_4.INUSE = '0'
                , tb_4.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_4.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_5.INUSE = '0'
                , tb_5.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_5.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_6.INUSE = '0'
                , tb_6.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_6.UPDATE_DATE = CURRENT_TIMESTAMP()
        WHERE
                tb_1.SCT_F_ID = 'dataItem.SCT_F_ID'
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteSctFProgressWorking: async (dataItem: any) => {
    let sql = `
                UPDATE
                        dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING
                SET
                          INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                WHERE
                        SCT_F_ID = 'dataItem.SCT_F_ID'
                                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteSctForm: async (dataItem: any) => {
    let sql = `
        UPDATE
                        dataItem.STANDARD_COST_DB.SCT_F tb_1
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_S tb_2
                ON
                        tb_1.SCT_F_ID = tb_2.SCT_F_ID
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_3
                ON
                        tb_2.SCT_F_ID = tb_3.SCT_F_ID
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_PROGRESS_WORKING tb_4
                ON
                        tb_2.SCT_F_ID = tb_4.SCT_F_ID
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_TAG_HISTORY tb_5
                ON
                        tb_2.SCT_F_ID = tb_5.SCT_F_ID
                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_F_REASON_HISTORY tb_6
                ON
                        tb_2.SCT_F_ID = tb_6.SCT_F_ID
        SET
                  tb_1.INUSE = '0'
                , tb_1.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_1.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_2.INUSE = '0'
                , tb_2.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_2.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_3.INUSE = '0'
                , tb_3.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_3.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_4.INUSE = '0'
                , tb_4.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_4.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_5.INUSE = '0'
                , tb_5.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_5.UPDATE_DATE = CURRENT_TIMESTAMP()
                , tb_6.INUSE = '0'
                , tb_6.UPDATE_BY = 'dataItem.UPDATE_BY'
                , tb_6.UPDATE_DATE = CURRENT_TIMESTAMP()
        WHERE
                tb_1.SCT_F_ID = 'dataItem.SCT_F_ID'
                        `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_ID', dataItem['SCT_F_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  generateSctCodeMultiple: async (dataItem: any) => {
    let sql = `
            SET @sctCodeMultiple = (
                    SELECT
                            CONCAT('dataItem.SCT_F_M_CREATE_TYPE_ALPHABET', DATE_FORMAT(CURDATE() ,"%y"),DATE_FORMAT(CURDATE() ,"%m") , '-' , (

                                    SELECT
                                            LPAD(IFNULL(COUNT(*), 0) + 1, 3, '0')
                                    FROM
                                            dataItem.STANDARD_COST_DB.SCT_F_M
                                    WHERE

                                             FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                            AND SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                            ) , '-' ,SUBSTRING('dataItem.FISCAL_YEAR',3,4), '-', 'dataItem.SCT_PATTERN_NO')

            );
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_M_CREATE_TYPE_ALPHABET', dataItem['SCT_F_M_CREATE_TYPE_ALPHABET'])

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].value)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_NO', dataItem['SCT_PATTERN_NO'].label)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_NO'].value)

    return sql
  },
  insertSctFM: async (dataItem: any, uuid: any) => {
    let sql = `
                INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_M
                (
                          SCT_F_M_ID
                        , SCT_F_ID
                        , FISCAL_YEAR
                        , SCT_PATTERN_ID
                        , ESTIMATE_PERIOD_START_DATE
                        , ESTIMATE_PERIOD_END_DATE
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
                          'dataItem.UUID_SCT_F_S_ID'
                        , 'dataItem.UUID_SCT_F_ID'
                        , 'dataItem.FISCAL_YEAR'
                        , 'dataItem.SCT_PATTERN_ID'
                        , dataItem.START_DATE
                        , dataItem.END_DATE
                        , 'dataItem.NOTE'
                        , ''
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 1
                )
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_F_S_ID', uuid)
    sql = sql.replaceAll('dataItem.UUID_SCT_F_ID', dataItem['UUID_SCT_F_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].value)
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_NO'].value)
    sql = sql.replaceAll('dataItem.START_DATE', dataItem['START_DATE'] ? `'${dataItem['START_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.END_DATE', dataItem['END_DATE'] ? `'${dataItem['END_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'] ?? '')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  insertSctFMProductType: async (dataItem: any, uuid: any) => {
    let sql = `
                    INSERT INTO dataItem.STANDARD_COST_DB.SCT_F_M_PRODUCT_TYPE
                    (
                              SCT_F_M_PRODUCT_TYPE_ID
                            , SCT_F_M_ID
                            , PRODUCT_TYPE_ID
                            , SCT_F_M_RESOURCE_FROM_ID
                            , DESCRIPTION
                            , CREATE_BY
                            , CREATE_DATE
                            , UPDATE_BY
                            , UPDATE_DATE
                            , INUSE
                    )
                    VALUES
                    (
                              'dataItem.SCT_F_M_PRODUCT_TYPE_ID'
                            , 'dataItem.UUID_SCT_F_M_ID'
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , 'dataItem.SCT_F_M_RESOURCE_FROM_ID'
                            , ''
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 1
                    )
                            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_F_M_PRODUCT_TYPE_ID', uuid)
    sql = sql.replaceAll('dataItem.UUID_SCT_F_M_ID', dataItem['UUID_SCT_F_M_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE']?.PRODUCT_TYPE_ID)
    sql = sql.replaceAll('dataItem.SCT_F_M_RESOURCE_FROM_ID', dataItem['SCT_F_M_RESOURCE_FROM_ID'])
    sql = sql.replaceAll('dataItem.START_DATE', dataItem['START_DATE'] ? `'${dataItem['START_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.END_DATE', dataItem['END_DATE'] ? `'${dataItem['END_DATE']}'` : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    return sql
  },
  search: async (dataItem: any) => {
    let sql = `         WITH base AS (
                                        SELECT
                                          tb_1.SCT_ID
                                        , tb_1.SCT_REVISION_CODE
                                        , tb_1.IS_REFRESH_DATA_MASTER
                                        , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%d-%b-%Y') AS ESTIMATE_PERIOD_START_DATE
                                        , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%d-%b-%Y')   AS ESTIMATE_PERIOD_END_DATE
                                        , tb_1.CREATE_BY
                                        , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s')       AS CREATE_DATE
                                        , tb_1.UPDATE_BY
                                        , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')       AS UPDATE_DATE
                                        , tb_2.UPDATE_BY                                           AS STATUS_UPDATE_BY
                                        , DATE_FORMAT(tb_2.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')       AS STATUS_UPDATE_DATE
                                        , tb_1.CANCEL_REASON
                                        , tb_1.NOTE
                                        , tb_1.DESCRIPTION
                                        , tb_1.INUSE
                                        , tb_3.SCT_STATUS_PROGRESS_ID
                                        , tb_3.SCT_STATUS_PROGRESS_NO
                                        , tb_3.SCT_STATUS_PROGRESS_NAME
                                        , tb_4.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                                        , tb_4.PRODUCT_TYPE_NAME
                                        , tb_5.PRODUCT_SUB_ID
                                        , tb_5.PRODUCT_SUB_NAME
                                        , tb_6.PRODUCT_MAIN_NAME
                                        , tb_6.PRODUCT_MAIN_ID
                                        , tb_7.PRODUCT_CATEGORY_ID
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
                                        , tb_15.ITEM_CATEGORY_NAME
                                        , tb_15.ITEM_CATEGORY_ID
                                        , tb_17.SCT_REASON_SETTING_NAME
                                        , tb_17.SCT_REASON_SETTING_ID
                                        , tb_19.SCT_TAG_SETTING_NAME
                                        , tb_19.SCT_TAG_SETTING_ID
                                        , tb_21.CUSTOMER_INVOICE_TO_NAME
                                        , tb_21.CUSTOMER_INVOICE_TO_ID
                                        , tb_21.CUSTOMER_INVOICE_TO_ALPHABET
                                        , IF(tb_2.SCT_STATUS_PROGRESS_ID = 2, NULL, tb_22.SELLING_PRICE) AS SELLING_PRICE
                                        , tb_22.ADJUST_PRICE
                                        , tb_22.ASSEMBLY_GROUP_FOR_SUPPORT_MES
                                        , IF(tb_22.SELLING_PRICE IS NULL OR tb_2.SCT_STATUS_PROGRESS_ID = 2,
                                          '', DATE_FORMAT(tb_22.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')) AS RE_CAL_UPDATE_DATE
                                        , tb_22.UPDATE_DATE AS RE_CAL_UPDATE_DATE_NO_FORMAT
                                        , IF(tb_22.SELLING_PRICE IS NULL OR tb_2.SCT_STATUS_PROGRESS_ID = 2,
                                          '', tb_22.UPDATE_BY) AS RE_CAL_UPDATE_BY
                                        , IF(tb_23.TOTAL_INDIRECT_COST IS NULL, '', 'Manual') AS INDIRECT_COST_MODE
                                        , tb_24.SCT_STATUS_WORKING_ID
                                        , IF(tb_23.TOTAL_INDIRECT_COST IS NULL, tb_22.INDIRECT_COST_SALE_AVE, tb_23.TOTAL_INDIRECT_COST)
                                          AS TOTAL_INDIRECT_COST
                                        , tb_1.PRODUCT_TYPE_ID

                                        dataItem.sqlSelect

                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                        INNER JOIN
                                dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                        ON tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                                        INNER JOIN
                                dataItem.STANDARD_COST_DB.sct_status_progress tb_3
                                        ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                                        INNER JOIN
                                dataItem.STANDARD_COST_DB.SCT_PATTERN tb_8
                                        ON tb_1.SCT_PATTERN_ID = tb_8.SCT_PATTERN_ID
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_16
                                        ON tb_1.SCT_ID = tb_16.SCT_ID AND tb_16.INUSE = 1
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_17
                                        ON tb_16.SCT_REASON_SETTING_ID = tb_17.SCT_REASON_SETTING_ID
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_18
                                        ON tb_1.SCT_ID = tb_18.SCT_ID AND tb_18.INUSE = 1
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_19
                                        ON tb_18.SCT_TAG_SETTING_ID = tb_19.SCT_TAG_SETTING_ID
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_22
                                        ON tb_1.SCT_ID = tb_22.SCT_ID AND tb_22.INUSE = 1
                                        LEFT JOIN
                                product_type tb_4
                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                        LEFT JOIN
                                product_sub tb_5
                                        ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
                                        LEFT JOIN
                                product_main tb_6
                                        ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
                                        LEFT JOIN
                                product_category tb_7
                                        ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
                                        LEFT JOIN
                                product_type_product_specification_document_setting tb_9
                                        ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID AND tb_9.INUSE = 1
                                        LEFT JOIN
                                product_specification_document_setting tb_10
                                        ON tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_10.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                        AND tb_10.INUSE = 1
                                        LEFT JOIN
                                PRODUCT_SPECIFICATION_TYPE tb_11
                                        ON tb_10.PRODUCT_SPECIFICATION_TYPE_ID = tb_11.PRODUCT_SPECIFICATION_TYPE_ID
                                        LEFT JOIN
                                BOM tb_12
                                        ON tb_1.BOM_ID = tb_12.BOM_ID
                                        LEFT JOIN
                                FLOW tb_13
                                        ON tb_12.FLOW_ID = tb_13.FLOW_ID
                                        LEFT JOIN
                                PRODUCT_TYPE_ITEM_CATEGORY tb_14
                                        ON tb_1.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID AND tb_14.INUSE = 1
                                        LEFT JOIN
                                ITEM_CATEGORY tb_15
                                        ON tb_14.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
                                        LEFT JOIN
                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_20
                                        ON tb_1.PRODUCT_TYPE_ID = tb_20.PRODUCT_TYPE_ID AND tb_20.INUSE = 1
                                        LEFT JOIN
                                CUSTOMER_INVOICE_TO tb_21
                                        ON tb_20.CUSTOMER_INVOICE_TO_ID = tb_21.CUSTOMER_INVOICE_TO_ID
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_23
                                        ON tb_1.SCT_ID = tb_23.SCT_ID AND tb_23.INUSE = 1
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_STATUS_WORKING tb_24
                                        ON tb_2.SCT_STATUS_WORKING_ID = tb_24.SCT_STATUS_WORKING_ID

                                dataItem.sqlJoin

                        ),
                        filtered AS (
                                SELECT
                                        *
                                FROM
                                        base

                                        dataItem.sqlWhere

                                        dataItem.sqlHaving
                        ),
                        ranked AS (
                                SELECT
                                          f.*
                                        , ROW_NUMBER() OVER (
                                                PARTITION BY
                                                          f.PRODUCT_TYPE_ID
                                                        , f.FISCAL_YEAR
                                                        , f.SCT_PATTERN_ID
                                                ORDER BY
                                                        SCT_REVISION_CODE DESC
                                                ) AS rn
                                FROM
                                        filtered f
                        ),
                        final_set AS (
                                SELECT
                                        *
                                FROM
                                        ranked
                                WHERE
                                        ('dataItem.sctLatestRevisionOption' <> 'Latest'
                                                OR
                                          rn = 1
                                        )
                        )
                                SELECT
                                  SCT_ID
                                , SCT_REVISION_CODE
                                , IS_REFRESH_DATA_MASTER
                                , ESTIMATE_PERIOD_START_DATE
                                , ESTIMATE_PERIOD_END_DATE
                                , CREATE_BY
                                , CREATE_DATE
                                , UPDATE_BY
                                , UPDATE_DATE
                                , STATUS_UPDATE_BY
                                , STATUS_UPDATE_DATE
                                , CANCEL_REASON
                                , NOTE
                                , DESCRIPTION
                                , INUSE
                                , SCT_STATUS_PROGRESS_ID
                                , SCT_STATUS_PROGRESS_NO
                                , SCT_STATUS_PROGRESS_NAME
                                , PRODUCT_TYPE_CODE
                                , PRODUCT_TYPE_NAME
                                , PRODUCT_SUB_NAME
                                , PRODUCT_MAIN_NAME
                                , PRODUCT_CATEGORY_NAME
                                , FISCAL_YEAR
                                , PRODUCT_SPECIFICATION_TYPE_NAME
                                , BOM_CODE
                                , BOM_NAME
                                , FLOW_CODE
                                , FLOW_NAME
                                , SCT_PATTERN_ID
                                , SCT_PATTERN_NAME
                                , ITEM_CATEGORY_NAME
                                , ITEM_CATEGORY_ID
                                , SCT_REASON_SETTING_NAME
                                , SCT_REASON_SETTING_ID
                                , SCT_TAG_SETTING_NAME
                                , SCT_TAG_SETTING_ID
                                , CUSTOMER_INVOICE_TO_NAME
                                , CUSTOMER_INVOICE_TO_ID
                                , CUSTOMER_INVOICE_TO_ALPHABET
                                , SELLING_PRICE
                                , ADJUST_PRICE
                                , ASSEMBLY_GROUP_FOR_SUPPORT_MES
                                , RE_CAL_UPDATE_DATE
                                , RE_CAL_UPDATE_BY
                                , INDIRECT_COST_MODE
                                , SCT_STATUS_WORKING_ID
                                , TOTAL_INDIRECT_COST
                                , COUNT(*) OVER() AS total_count
                        FROM final_set

                        ORDER BY
                                dataItem.Order

                        dataItem.sqlLimit
  `

    sql = sql.replaceAll('dataItem.sctLatestRevisionOption', dataItem.SearchFilters?.find((f: any) => f.id === 'sctLatestRevisionOption')?.value ?? '')

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)
    sql = sql.replaceAll('dataItem.sqlLimit', dataItem?.sqlLimit ?? '')
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem?.sqlJoin ?? '')
    sql = sql.replaceAll('dataItem.sqlSelect', dataItem?.sqlSelect ?? '')

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    return sql
  },
  getAllWithWhereCondition_old_version: async (dataItem: any) => {
    let sql = `         WITH base AS (
                                        SELECT
                                          tb_1.SCT_ID
                                        , tb_1.SCT_REVISION_CODE
                                        , tb_1.IS_REFRESH_DATA_MASTER
                                        , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%d-%b-%Y') AS ESTIMATE_PERIOD_START_DATE
                                        , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%d-%b-%Y')   AS ESTIMATE_PERIOD_END_DATE
                                        , tb_1.CREATE_BY
                                        , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s')       AS CREATE_DATE
                                        , tb_1.UPDATE_BY
                                        , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')       AS UPDATE_DATE
                                        , tb_2.UPDATE_BY                                           AS STATUS_UPDATE_BY
                                        , DATE_FORMAT(tb_2.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')       AS STATUS_UPDATE_DATE
                                        , tb_1.CANCEL_REASON
                                        , tb_1.NOTE
                                        , tb_1.DESCRIPTION
                                        , tb_1.INUSE
                                        , tb_3.SCT_STATUS_PROGRESS_ID
                                        , tb_3.SCT_STATUS_PROGRESS_NO
                                        , tb_3.SCT_STATUS_PROGRESS_NAME
                                        , tb_4.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                                        , tb_4.PRODUCT_TYPE_NAME
                                        , tb_5.PRODUCT_SUB_ID
                                        , tb_5.PRODUCT_SUB_NAME
                                        , tb_6.PRODUCT_MAIN_NAME
                                        , tb_6.PRODUCT_MAIN_ID
                                        , tb_7.PRODUCT_CATEGORY_ID
                                        , tb_7.PRODUCT_CATEGORY_NAME
                                        , tb_1.FISCAL_YEAR
                                        , tb_11.PRODUCT_SPECIFICATION_TYPE_NAME
                                        , tb_12.BOM_CODE
                                        , tb_12.BOM_NAME
                                        , tb_13.FLOW_CODE
                                        , tb_13.FLOW_NAME
                                        , tb_8.SCT_PATTERN_ID
                                        , tb_8.SCT_PATTERN_NAME
                                        , tb_15.ITEM_CATEGORY_NAME
                                        , tb_15.ITEM_CATEGORY_ID
                                        , tb_17.SCT_REASON_SETTING_NAME
                                        , tb_17.SCT_REASON_SETTING_ID
                                        , tb_19.SCT_TAG_SETTING_NAME
                                        , tb_19.SCT_TAG_SETTING_ID
                                        , tb_21.CUSTOMER_INVOICE_TO_NAME
                                        , tb_21.CUSTOMER_INVOICE_TO_ID
                                        , tb_21.CUSTOMER_INVOICE_TO_ALPHABET
                                        , IF(tb_2.SCT_STATUS_PROGRESS_ID = 2, NULL, tb_22.SELLING_PRICE) AS SELLING_PRICE
                                        , tb_22.ADJUST_PRICE
                                        , tb_22.ASSEMBLY_GROUP_FOR_SUPPORT_MES

                                        , IF(tb_22.SELLING_PRICE IS NULL OR tb_2.SCT_STATUS_PROGRESS_ID = 2,
                                                '', DATE_FORMAT(tb_22.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')) AS RE_CAL_UPDATE_DATE

                                        , tb_22.UPDATE_DATE AS RE_CAL_UPDATE_DATE_NO_FORMAT

                                        , IF(tb_22.SELLING_PRICE IS NULL OR tb_2.SCT_STATUS_PROGRESS_ID = 2,
                                                '', tb_22.UPDATE_BY) AS RE_CAL_UPDATE_BY

                                        , IF(tb_23.TOTAL_INDIRECT_COST IS NULL, '', 'Manual') AS INDIRECT_COST_MODE
                                        , tb_24.SCT_STATUS_WORKING_ID
                                        , IF(tb_23.TOTAL_INDIRECT_COST IS NULL, tb_22.INDIRECT_COST_SALE_AVE, tb_23.TOTAL_INDIRECT_COST)
                                                                                                        AS TOTAL_INDIRECT_COST
                                        , tb_1.PRODUCT_TYPE_ID
  FROM
      dataItem.STANDARD_COST_DB.SCT tb_1
      INNER JOIN dataItem.STANDARD_COST_DB.sct_progress_working tb_2
        ON tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
      INNER JOIN dataItem.STANDARD_COST_DB.sct_status_progress tb_3
        ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
      INNER JOIN dataItem.STANDARD_COST_DB.SCT_PATTERN tb_8
        ON tb_1.SCT_PATTERN_ID = tb_8.SCT_PATTERN_ID
      LEFT JOIN dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_16
        ON tb_1.SCT_ID = tb_16.SCT_ID AND tb_16.INUSE = 1
      LEFT JOIN dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_17
        ON tb_16.SCT_REASON_SETTING_ID = tb_17.SCT_REASON_SETTING_ID
      LEFT JOIN dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_18
        ON tb_1.SCT_ID = tb_18.SCT_ID AND tb_18.INUSE = 1
      LEFT JOIN dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_19
        ON tb_18.SCT_TAG_SETTING_ID = tb_19.SCT_TAG_SETTING_ID
      LEFT JOIN dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_22
        ON tb_1.SCT_ID = tb_22.SCT_ID AND tb_22.INUSE = 1
      LEFT JOIN product_type tb_4
        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
      LEFT JOIN product_sub tb_5
        ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
      LEFT JOIN product_main tb_6
        ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
      LEFT JOIN product_category tb_7
        ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
      LEFT JOIN product_type_product_specification_document_setting tb_9
        ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID AND tb_9.INUSE = 1
      LEFT JOIN product_specification_document_setting tb_10
        ON tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_10.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
       AND tb_10.INUSE = 1
      LEFT JOIN PRODUCT_SPECIFICATION_TYPE tb_11
        ON tb_10.PRODUCT_SPECIFICATION_TYPE_ID = tb_11.PRODUCT_SPECIFICATION_TYPE_ID
      LEFT JOIN BOM tb_12
        ON tb_1.BOM_ID = tb_12.BOM_ID
      LEFT JOIN FLOW tb_13
        ON tb_12.FLOW_ID = tb_13.FLOW_ID
      LEFT JOIN PRODUCT_TYPE_ITEM_CATEGORY tb_14
        ON tb_1.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID AND tb_14.INUSE = 1
      LEFT JOIN ITEM_CATEGORY tb_15
        ON tb_14.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
      LEFT JOIN PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_20
        ON tb_1.PRODUCT_TYPE_ID = tb_20.PRODUCT_TYPE_ID AND tb_20.INUSE = 1
      LEFT JOIN CUSTOMER_INVOICE_TO tb_21
        ON tb_20.CUSTOMER_INVOICE_TO_ID = tb_21.CUSTOMER_INVOICE_TO_ID
      LEFT JOIN dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_23
        ON tb_1.SCT_ID = tb_23.SCT_ID AND tb_23.INUSE = 1
      LEFT JOIN  dataItem.STANDARD_COST_DB.SCT_STATUS_WORKING tb_24
        ON tb_2.SCT_STATUS_WORKING_ID = tb_24.SCT_STATUS_WORKING_ID
),
filtered AS (
  SELECT *
  FROM base

                              dataItem.sqlWhere

                              dataItem.sqlHaving

),
ranked AS (
  SELECT
      f.*
    , ROW_NUMBER() OVER (
        PARTITION BY f.PRODUCT_TYPE_ID, f.FISCAL_YEAR, f.SCT_PATTERN_ID
       ORDER BY SCT_REVISION_CODE DESC
      ) AS rn
  FROM filtered f
),
final_set AS (
  SELECT *
  FROM ranked
  WHERE ('dataItem.sctLatestRevisionOption' <> 'Latest' OR rn = 1)
)
SELECT
    SCT_ID
  , SCT_STATUS_PROGRESS_ID
  , SCT_REVISION_CODE
FROM final_set;
  `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.sctLatestRevisionOption', dataItem.SearchFilters?.find((f: any) => f.id === 'sctLatestRevisionOption')?.value ?? '')

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    return sql
  },
  search_: async (dataItem: any) => {
    let sql = `         SELECT
                                  COUNT(*) AS TOTAL_COUNT
                                                FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                            INNER JOIN
                                dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                            ON tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE =1
                                            INNER JOIN
                                dataItem.STANDARD_COST_DB.sct_status_progress tb_3
                                            ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                                            INNER JOIN
                                dataItem.STANDARD_COST_DB.SCT_PATTERN tb_8
                                            ON tb_1.SCT_PATTERN_ID = tb_8.SCT_PATTERN_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_16
                                            ON tb_1.SCT_ID = tb_16.SCT_ID
                                            AND tb_16.INUSE = 1
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_17
                                            ON tb_16.SCT_REASON_SETTING_ID = tb_17.SCT_REASON_SETTING_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_18
                                            ON tb_1.SCT_ID = tb_18.SCT_ID
                                            AND tb_18.INUSE = 1
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_19
                                            ON tb_18.SCT_TAG_SETTING_ID = tb_19.SCT_TAG_SETTING_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_22
                                           ON tb_1.SCT_ID = tb_22.SCT_ID
                                           AND tb_22.INUSE = 1
                                           LEFT JOIN
                                product_type tb_4
                                            ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                            LEFT JOIN
                                product_sub tb_5
                                            ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
                                            LEFT JOIN
                                product_main tb_6
                                            ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
                                            LEFT JOIN
                                product_category tb_7
                                            ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
                                            LEFT JOIN
                                product_type_product_specification_document_setting tb_9
                                            ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                            AND tb_9.INUSE = 1
                                           LEFT JOIN
                                product_specification_document_setting tb_10
                                            ON tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_10.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                            AND tb_10.INUSE = 1
                                            LEFT JOIN
                                PRODUCT_SPECIFICATION_TYPE tb_11
                                            ON tb_10.PRODUCT_SPECIFICATION_TYPE_ID = tb_11.PRODUCT_SPECIFICATION_TYPE_ID
                                            LEFT JOIN
                                BOM tb_12
                                            ON tb_1.BOM_ID = tb_12.BOM_ID
                                            LEFT JOIN
                                FLOW tb_13
                                            ON tb_12.FLOW_ID = tb_13.FLOW_ID
                                           LEFT JOIN
                                PRODUCT_TYPE_ITEM_CATEGORY tb_14
                                            ON tb_1.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID
                                            AND tb_14.INUSE = 1
                                            LEFT JOIN
                                ITEM_CATEGORY tb_15
                                            ON tb_14.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
                                            LEFT JOIN
                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_20
                                            ON tb_1.PRODUCT_TYPE_ID = tb_20.PRODUCT_TYPE_ID
                                            AND tb_20.INUSE = 1
                                            LEFT JOIN
                                CUSTOMER_INVOICE_TO tb_21
                                                ON tb_20.CUSTOMER_INVOICE_TO_ID = tb_21.CUSTOMER_INVOICE_TO_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_23
                                                ON tb_1.SCT_ID = tb_23.SCT_ID
                                            AND tb_23.INUSE  = 1

                            dataItem.sqlWhere;

                            SELECT
                                      tb_1.SCT_ID
                                    , tb_1.SCT_REVISION_CODE
                                    , tb_1.IS_REFRESH_DATA_MASTER
                                    , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_START_DATE, '%d-%b-%Y') AS ESTIMATE_PERIOD_START_DATE
                                    , DATE_FORMAT(tb_1.ESTIMATE_PERIOD_END_DATE, '%d-%b-%Y') AS ESTIMATE_PERIOD_END_DATE
                                    , tb_1.CREATE_BY
                                    , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s') AS CREATE_DATE
                                    , tb_1.UPDATE_BY
                                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                    , tb_2.UPDATE_BY as STATUS_UPDATE_BY
                                    , DATE_FORMAT(tb_2.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS STATUS_UPDATE_DATE
                                    , tb_1.CANCEL_REASON
                                    , tb_1.NOTE
                                    , tb_1.DESCRIPTION
                                    , tb_1.INUSE
                                    , tb_3.SCT_STATUS_PROGRESS_ID
                                    , tb_3.SCT_STATUS_PROGRESS_NO
                                    , tb_3.SCT_STATUS_PROGRESS_NAME
                                    , tb_4.PRODUCT_TYPE_CODE_FOR_SCT AS "PRODUCT_TYPE_CODE"
                                    , tb_4.PRODUCT_TYPE_NAME
                                    , tb_5.PRODUCT_SUB_NAME
                                    , tb_6.PRODUCT_MAIN_NAME
                                    , tb_7.PRODUCT_CATEGORY_NAME
                                    , tb_1.FISCAL_YEAR
                                    , tb_11.PRODUCT_SPECIFICATION_TYPE_NAME
                                    , tb_12.BOM_CODE
                                    , tb_12.BOM_NAME
                                    , tb_13.FLOW_CODE
                                    , tb_13.FLOW_NAME
                                    , tb_8.SCT_PATTERN_ID
                                    , tb_8.SCT_PATTERN_NAME
                                    , tb_15.ITEM_CATEGORY_NAME
                                    , tb_15.ITEM_CATEGORY_ID
                                    , tb_17.SCT_REASON_SETTING_NAME
                                    , tb_17.SCT_REASON_SETTING_ID
                                    , tb_19.SCT_TAG_SETTING_NAME
                                    , tb_19.SCT_TAG_SETTING_ID
                                    , tb_21.CUSTOMER_INVOICE_TO_NAME
                                    , tb_21.CUSTOMER_INVOICE_TO_ID
                                    , tb_21.CUSTOMER_INVOICE_TO_ALPHABET
                                    , IF(tb_2.SCT_STATUS_PROGRESS_ID = 2, NULL, tb_22.SELLING_PRICE) AS SELLING_PRICE
                                    , tb_22.ADJUST_PRICE
                                    , tb_22.ASSEMBLY_GROUP_FOR_SUPPORT_MES

, IF(tb_22.SELLING_PRICE IS NULL OR tb_2.SCT_STATUS_PROGRESS_ID = 2, '', DATE_FORMAT(tb_22.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')) AS RE_CAL_UPDATE_DATE
, IF(tb_22.SELLING_PRICE IS NULL OR tb_2.SCT_STATUS_PROGRESS_ID = 2 , '', tb_22.UPDATE_BY) AS RE_CAL_UPDATE_BY

                                    , IF(tb_23.TOTAL_INDIRECT_COST IS NULL, '', 'Manual') AS INDIRECT_COST_MODE
                                    , tb_24.SCT_STATUS_WORKING_ID
                                    , IF(tb_23.TOTAL_INDIRECT_COST IS NULL, tb_22.INDIRECT_COST_SALE_AVE, tb_23.TOTAL_INDIRECT_COST) AS TOTAL_INDIRECT_COST
                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                            INNER JOIN
                                dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                            ON tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE =1
                                            INNER JOIN
                                dataItem.STANDARD_COST_DB.sct_status_progress tb_3
                                            ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                                            INNER JOIN
                                dataItem.STANDARD_COST_DB.SCT_PATTERN tb_8
                                            ON tb_1.SCT_PATTERN_ID = tb_8.SCT_PATTERN_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_16
                                            ON tb_1.SCT_ID = tb_16.SCT_ID
                                            AND tb_16.INUSE = 1
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_17
                                            ON tb_16.SCT_REASON_SETTING_ID = tb_17.SCT_REASON_SETTING_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_18
                                            ON tb_1.SCT_ID = tb_18.SCT_ID
                                            AND tb_18.INUSE = 1
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_19
                                            ON tb_18.SCT_TAG_SETTING_ID = tb_19.SCT_TAG_SETTING_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_22
                                           ON tb_1.SCT_ID = tb_22.SCT_ID
                                           AND tb_22.INUSE = 1
                                           LEFT JOIN
                                product_type tb_4
                                            ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                            LEFT JOIN
                                product_sub tb_5
                                            ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
                                            LEFT JOIN
                                product_main tb_6
                                            ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
                                            LEFT JOIN
                                product_category tb_7
                                            ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
                                            LEFT JOIN
                                product_type_product_specification_document_setting tb_9
                                            ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                            AND tb_9.INUSE = 1
                                           LEFT JOIN
                                product_specification_document_setting tb_10
                                            ON tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_10.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                            AND tb_10.INUSE = 1
                                            LEFT JOIN
                                PRODUCT_SPECIFICATION_TYPE tb_11
                                            ON tb_10.PRODUCT_SPECIFICATION_TYPE_ID = tb_11.PRODUCT_SPECIFICATION_TYPE_ID
                                            LEFT JOIN
                                BOM tb_12
                                            ON tb_1.BOM_ID = tb_12.BOM_ID
                                            LEFT JOIN
                                FLOW tb_13
                                            ON tb_12.FLOW_ID = tb_13.FLOW_ID
                                           LEFT JOIN
                                PRODUCT_TYPE_ITEM_CATEGORY tb_14
                                            ON tb_1.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID
                                            AND tb_14.INUSE = 1
                                            LEFT JOIN
                                ITEM_CATEGORY tb_15
                                            ON tb_14.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
                                            LEFT JOIN
                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_20
                                            ON tb_1.PRODUCT_TYPE_ID = tb_20.PRODUCT_TYPE_ID
                                            AND tb_20.INUSE = 1
                                            LEFT JOIN
                                CUSTOMER_INVOICE_TO tb_21
                                            ON tb_20.CUSTOMER_INVOICE_TO_ID = tb_21.CUSTOMER_INVOICE_TO_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_23
                                                ON tb_1.SCT_ID = tb_23.SCT_ID
                                            AND tb_23.INUSE  = 1
                                            JOIN
                                dataItem.STANDARD_COST_DB.SCT_STATUS_WORKING tb_24
                                            ON tb_2.SCT_STATUS_WORKING_ID = tb_24.SCT_STATUS_WORKING_ID


                              dataItem.sqlWhere

                              dataItem.sqlHaving

                              ORDER BY
                                      dataItem.Order

                              LIMIT
                                        dataItem.Start
                                      , dataItem.Limit;

                            SELECT
                                      tb_1.SCT_ID
                                    , tb_3.SCT_STATUS_PROGRESS_ID
                                                FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                            INNER JOIN
                                dataItem.STANDARD_COST_DB.sct_progress_working tb_2
                                            ON tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE =1
                                            INNER JOIN
                                dataItem.STANDARD_COST_DB.sct_status_progress tb_3
                                            ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                                            INNER JOIN
                                dataItem.STANDARD_COST_DB.SCT_PATTERN tb_8
                                            ON tb_1.SCT_PATTERN_ID = tb_8.SCT_PATTERN_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_16
                                            ON tb_1.SCT_ID = tb_16.SCT_ID
                                            AND tb_16.INUSE = 1
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_17
                                            ON tb_16.SCT_REASON_SETTING_ID = tb_17.SCT_REASON_SETTING_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_18
                                            ON tb_1.SCT_ID = tb_18.SCT_ID
                                            AND tb_18.INUSE = 1
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_19
                                            ON tb_18.SCT_TAG_SETTING_ID = tb_19.SCT_TAG_SETTING_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_22
                                           ON tb_1.SCT_ID = tb_22.SCT_ID
                                           AND tb_22.INUSE = 1
                                           LEFT JOIN
                                product_type tb_4
                                            ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                            LEFT JOIN
                                product_sub tb_5
                                            ON tb_4.PRODUCT_SUB_ID = tb_5.PRODUCT_SUB_ID
                                            LEFT JOIN
                                product_main tb_6
                                            ON tb_5.PRODUCT_MAIN_ID = tb_6.PRODUCT_MAIN_ID
                                            LEFT JOIN
                                product_category tb_7
                                            ON tb_6.PRODUCT_CATEGORY_ID = tb_7.PRODUCT_CATEGORY_ID
                                            LEFT JOIN
                                product_type_product_specification_document_setting tb_9
                                            ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                            AND tb_9.INUSE = 1
                                           LEFT JOIN
                                product_specification_document_setting tb_10
                                            ON tb_9.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_10.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                            AND tb_10.INUSE = 1
                                            LEFT JOIN
                                PRODUCT_SPECIFICATION_TYPE tb_11
                                            ON tb_10.PRODUCT_SPECIFICATION_TYPE_ID = tb_11.PRODUCT_SPECIFICATION_TYPE_ID
                                            LEFT JOIN
                                BOM tb_12
                                            ON tb_1.BOM_ID = tb_12.BOM_ID
                                            LEFT JOIN
                                FLOW tb_13
                                            ON tb_12.FLOW_ID = tb_13.FLOW_ID
                                           LEFT JOIN
                                PRODUCT_TYPE_ITEM_CATEGORY tb_14
                                            ON tb_1.PRODUCT_TYPE_ID = tb_14.PRODUCT_TYPE_ID
                                            AND tb_14.INUSE = 1
                                            LEFT JOIN
                                ITEM_CATEGORY tb_15
                                            ON tb_14.ITEM_CATEGORY_ID = tb_15.ITEM_CATEGORY_ID
                                            LEFT JOIN
                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_20
                                            ON tb_1.PRODUCT_TYPE_ID = tb_20.PRODUCT_TYPE_ID
                                            AND tb_20.INUSE = 1
                                            LEFT JOIN
                                CUSTOMER_INVOICE_TO tb_21
                                                ON tb_20.CUSTOMER_INVOICE_TO_ID = tb_21.CUSTOMER_INVOICE_TO_ID
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_23
                                                ON tb_1.SCT_ID = tb_23.SCT_ID
                                            AND tb_23.INUSE  = 1

                            dataItem.sqlWhere;
                                      `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)

    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    console.log('sql', sql)

    return sql
  },
  getSctIdByProductTypeId: async (dataItem: any) => {
    let sql = `
        SELECT
                SCT_ID
        FROM
                dataItem.STANDARD_COST_DB.SCT
        WHERE
                PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
        ORDER BY
                UPDATE_DATE DESC
        LIMIT
                1
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
  getYieldRateExportDataByProductTypeId: async (dataItem: any, sqlWhere: any) => {
    let sql = `
                                SELECT  tb_1.PRODUCT_CATEGORY_NAME
                                , tb_1.PRODUCT_CATEGORY_ID
                                , tb_2.PRODUCT_MAIN_NAME
                                , tb_2.PRODUCT_MAIN_ID
                                , tb_3.PRODUCT_SUB_NAME
                                , tb_3.PRODUCT_SUB_ID
                                , tb_4.PRODUCT_TYPE_CODE
                                , tb_4.PRODUCT_TYPE_NAME
                                , tb_4.PRODUCT_TYPE_ID
                                , tb_4.PRODUCT_TYPE_CODE_FOR_SCT
                                , tb_6.FLOW_ID
                                , tb_6.FLOW_CODE
                                , tb_6.FLOW_NAME
                                , tb_7.FLOW_PROCESS_ID
                                , tb_7.NO AS FLOW_PROCESS_NO
                                , tb_8.PROCESS_ID
                                , tb_8.PROCESS_CODE
                                , tb_8.PROCESS_NAME
                                , tb_9.COLLECTION_POINT_FOR_SCT
                                , tb_9.REVISION_NO


                                FROM PRODUCT_CATEGORY tb_1
                                JOIN PRODUCT_MAIN tb_2  ON tb_2.PRODUCT_CATEGORY_ID = tb_1.PRODUCT_CATEGORY_ID
                                JOIN PRODUCT_SUB tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
                                JOIN PRODUCT_TYPE tb_4 ON tb_4.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                                JOIN PRODUCT_TYPE_FLOW tb_5 ON tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_5.INUSE = 1
                                JOIN FLOW tb_6 ON tb_6.FLOW_ID = tb_5.FLOW_ID AND tb_6.INUSE = 1
                                JOIN FLOW_PROCESS tb_7 ON tb_7.FLOW_ID = tb_6.FLOW_ID AND tb_7.INUSE = 1
                                JOIN PROCESS tb_8 ON tb_8.PROCESS_ID = tb_7.PROCESS_ID
                                LEFT JOIN YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT tb_9 ON
                                tb_9.PROCESS_ID = tb_8.PROCESS_ID
                                AND tb_9.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_9.INUSE = 1
                                dataItem.sqlWhere
                                WHERE tb_4.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                ORDER BY tb_7.NO ASC
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    //  console.log(sql)
    return sql
  },
  searchCopyDataFromSctIdSelection: async (dataItem: any, table: any) => {
    let sql = `
        SELECT
                dataItem.COLUMNS
        FROM
                dataItem.STANDARD_COST_DB.dataItem.TABLE
        WHERE
                    SCT_ID = 'dataItem.SCT_ID_SELECTION'
                AND INUSE = 1
        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.TABLE', table.tableName)
    sql = sql.replaceAll('dataItem.COLUMNS', table.columnsNameForSearch.join(','))
    sql = sql.replaceAll('dataItem.SCT_ID_SELECTION', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  insertCopyDataFromSctIdSelection: async (dataItem: any, table: any, uuid: string, dataRows: RowDataPacket) => {
    let sql = `
        INSERT INTO dataItem.STANDARD_COST_DB.dataItem.TABLE
                (
                          dataItem.COLUMNS
                        , SCT_ID
                        , DESCRIPTION
                        , CREATE_BY
                        , CREATE_DATE
                        , UPDATE_BY
                        , UPDATE_DATE
                        , INUSE
                )
        VALUES
                (
                          '${uuidv4()}'
                        , 'dataItem.VALUES'
                        , 'dataItem.SCT_ID'
                        , ''
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 1
                )
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.TABLE', table.tableName)
    sql = sql.replaceAll('dataItem.COLUMNS', table.columnsNameForInsert.join(','))
    sql = sql.replaceAll('dataItem.VALUES', Object.values(dataRows).join("','"))
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.SCT_ID', uuid)
    sql = sql.replaceAll("''", 'NULL')

    return sql
  },
  deleteSctData: async (dataItem: any) => {
    let sql = `
        UPDATE
                dataItem.STANDARD_COST_DB.SCT
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
    //     console.log(sql)
    return sql
  },
  getTotalYR: async () => {
    let sql = `
                        SELECT
                                *
                        FROM
                                (
                                          SELECT
                                                        D.PRODUCT_TYPE_CODE_FOR_SCT
                                                        , A.SCT_REVISION_CODE
                                                        , B.TOTAL_YIELD_RATE
                                                        , A.FISCAL_YEAR
                                        FROM
                                                        dataItem.STANDARD_COST_DB.sct A
                                                                INNER JOIN
                                                        dataItem.STANDARD_COST_DB.sct_processing_cost_by_engineer_total B
                                                                ON A.SCT_ID = B.SCT_ID
                                                                INNER JOIN
                                                        dataItem.STANDARD_COST_DB.sct_progress_working C
                                                                ON A.SCT_ID = C.SCT_ID
                                                                INNER JOIN
                                                        product_type D
                                                                ON A.PRODUCT_TYPE_ID =  D.PRODUCT_TYPE_ID
                                        WHERE
                                                        A.INUSE = 1
                                                        AND B.INUSE = 1
                                                        AND C.INUSE = 1
                                                        AND C.SCT_STATUS_PROGRESS_ID = 7
                                        ORDER BY
                                                        D.PRODUCT_TYPE_CODE_FOR_SCT,FISCAL_YEAR DESC
                                ) a
                                        GROUP BY
                                                        PRODUCT_TYPE_CODE_FOR_SCT
                `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    return sql
  },
  updateIsMasterDataChangedByMaterialPrice: async (dataItem: any) => {
    let sql = `
        UPDATE
                        dataItem.STANDARD_COST_DB.SCT tb_1
                                JOIN
                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_2
                                ON
                                tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1 AND tb_2.SCT_STATUS_PROGRESS_ID = 3
                                JOIN
                        dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_3
                                ON
                                tb_1.SCT_ID = tb_3.SCT_ID AND tb_3.INUSE = 1 AND tb_3.SCT_COMPONENT_TYPE_ID = 2
                                JOIN
                        BOM_FLOW_PROCESS_ITEM_USAGE tb_4
                                ON
                                tb_1.BOM_ID = tb_4.BOM_ID AND tb_4.INUSE = 1 AND tb_4.ITEM_ID = 'dataItem.ITEM_ID'
        SET
                tb_1.IS_REFRESH_DATA_MASTER = 1
        WHERE
                    tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
                AND tb_3.SCT_RESOURCE_OPTION_ID = 1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },
  updateIsMasterDataChangedByCostCondition: async (dataItem: any) => {
    let sql = `
            UPDATE
                    dataItem.STANDARD_COST_DB.SCT tb_1
                    JOIN
                        PRODUCT_TYPE tb_2
                    ON
                        tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                    JOIN
                        PRODUCT_SUB tb_3
                    ON
                        tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
                    JOIN
                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_4
                    ON
                        tb_1.SCT_ID = tb_4.SCT_ID AND tb_4.INUSE = 1 AND tb_4.SCT_STATUS_PROGRESS_ID = 3
                    JOIN
                        dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_5
                    ON
                        tb_1.SCT_ID = tb_5.SCT_ID AND tb_5.INUSE = 1 AND tb_5.SCT_COMPONENT_TYPE_ID = 1
            SET
                    tb_1.IS_REFRESH_DATA_MASTER = 1
            WHERE
                        tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    AND tb_3.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                    AND tb_5.SCT_RESOURCE_OPTION_ID = 1

        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  getParentSctIdBySctId: async (dataItem: any) => {
    let sql = `

                   SELECT
                                tb_4.SCT_ID
                   FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                        JOIN
                                ITEM_PRODUCT_DETAIL tb_2
                                        ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                        AND tb_2.INUSE = 1
                                        JOIN
                                BOM_FLOW_PROCESS_ITEM_USAGE tb_3
                                        ON tb_2.ITEM_ID = tb_3.ITEM_ID AND tb_3.INUSE = 1
                                        JOIN
                                dataItem.STANDARD_COST_DB.SCT tb_4
                                        ON tb_3.BOM_ID = tb_4.BOM_ID AND tb_4.INUSE = 1
                                        AND tb_1.FISCAL_YEAR = tb_4.FISCAL_YEAR
                                        AND tb_1.SCT_PATTERN_ID  = tb_4.SCT_PATTERN_ID
                                        AND tb_4.SCT_ID <> 'dataItem.SCT_ID'
                                        JOIN
                                dataItem.STANDARD_COST_DB.sct_progress_working tb_5
                                        ON tb_4.SCT_ID = tb_5.SCT_ID
                                        AND tb_5.INUSE = 1
                                        AND tb_5.SCT_STATUS_PROGRESS_ID IN (2,3)
                     WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'`

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getReCalButton: async (dataItem: { SCT_ID: string }) => {
    let sql = `
                        SELECT
                                  tb_2.ITEM_ID
                                , tb_5.CREATE_DATE
                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                        JOIN
                                BOM_FLOW_PROCESS_ITEM_USAGE tb_2
                                        ON tb_1.BOM_ID = tb_2.BOM_ID
                                        AND tb_2.INUSE = 1
                                        JOIN
                        BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_3
                                        ON tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_3.BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY_ID
                                        AND tb_3.ITEM_CATEGORY_ID IN (2, 3)
                                        JOIN
                        ITEM_PRODUCT_DETAIL tb_4
                                        ON tb_2.ITEM_ID = tb_4.ITEM_ID
                                        JOIN
                        dataItem.STANDARD_COST_DB.SCT tb_5
                                        ON tb_4.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                        AND tb_1.FISCAL_YEAR = tb_5.FISCAL_YEAR
                                        AND tb_1.SCT_PATTERN_ID = tb_5.SCT_PATTERN_ID
                                        AND tb_5.INUSE = 1
                                        AND tb_1.SCT_ID <> 'dataItem.SCT_ID'
                                        JOIN
                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_6
                                        ON tb_5.SCT_ID = tb_6.SCT_ID
                                        AND tb_6.INUSE = 1
                                        AND tb_6.SCT_STATUS_PROGRESS_ID IN (2, 3)
                        WHERE
                                        tb_1.SCT_ID = 'dataItem.SCT_ID'
        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getMaterialPriceDataBudgetForReCalButton: async (dataItem: any) => {
    let sql = `
                    SELECT
                               tb_2.ITEM_ID
                            , tb_5.SCT_ID
                            , tb_6.SCT_STATUS_PROGRESS_ID
                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                                    JOIN
                            BOM_FLOW_PROCESS_ITEM_USAGE tb_2
                                    ON
                            tb_1.BOM_ID = tb_2.BOM_ID AND tb_2.INUSE = 1
                                            JOIN
                            BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_3
                                            ON
                            tb_1.BOM_ID = tb_3.BOM_ID AND tb_3.INUSE = 1 AND tb_3.ITEM_CATEGORY_ID IN (1,2,3)
                            AND tb_2.ITEM_ID = tb_3.ITEM_ID AND tb_2.FLOW_PROCESS_ID = tb_3.FLOW_PROCESS_ID
                                                        JOIN
                                        ITEM_PRODUCT_DETAIL tb_4
                                                        ON
                                        tb_2.ITEM_ID = tb_4.ITEM_ID AND tb_4.INUSE = 1
                                                        JOIN
                                        dataItem.STANDARD_COST_DB.SCT tb_5
                                                        ON
                                        tb_5.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID AND tb_5.INUSE = 1
                                        AND tb_1.FISCAL_YEAR = tb_5.FISCAL_YEAR AND tb_1.SCT_PATTERN_ID = tb_5.SCT_PATTERN_ID
                                                        JOIN
                                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_6
                                                        ON
                                        tb_5.SCT_ID = tb_6.SCT_ID AND tb_6.INUSE = 1
                                                        JOIN
                                        dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_7
                                                        ON
                                        tb_7.SCT_ID = tb_5.SCT_ID AND tb_7.INUSE = 1 AND tb_7.SCT_TAG_SETTING_ID = 1


                    WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  searchParentSct: async (dataItem: any) => {
    let sql = `
                        SELECT
                                tb_4.SCT_ID
                        FROM
                                dataItem.STANDARD_COST_DB.SCT tb_1
                                       INNER JOIN
                                ITEM_PRODUCT_DETAIL tb_2
                                        ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID AND tb_2.INUSE = 1
                                        INNER JOIN
                                BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_3
                                        ON tb_2.ITEM_ID = tb_3.ITEM_ID AND tb_3.INUSE = 1
                                        INNER JOIN
                                dataItem.STANDARD_COST_DB.SCT tb_4
                                        ON tb_3.BOM_ID = tb_4.BOM_ID AND tb_1.FISCAL_YEAR = tb_4.FISCAL_YEAR
                                        AND tb_1.SCT_PATTERN_ID = tb_4.SCT_PATTERN_ID AND tb_4.INUSE = 1
                                        INNER JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_5
                                        ON tb_1.SCT_ID = tb_5.SCT_ID AND tb_5.INUSE = 1
                                        INNER JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_6
                                        ON tb_4.SCT_ID = tb_6.SCT_ID AND tb_6.INUSE = 1
                                        AND tb_5.SCT_REASON_SETTING_ID = tb_6.SCT_REASON_SETTING_ID
                        WHERE
                                tb_1.SCT_ID = 'dataItem.SCT_ID'
        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

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
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  insertSctDataManualBySctId: async (dataItem: any, UUID_SCT_ID: any, UUID_SCT_DETAIL_FOR_ADJUST_ID: any) => {
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
                                    , DESCRIPTION
                                    , CREATE_BY
                                    , CREATE_DATE
                                    , UPDATE_BY
                                    , UPDATE_DATE
                                    , INUSE
                            )
                            (
                                    SELECT
                                              'dataItem.UUID_SCT_DETAIL_FOR_ADJUST_ID'
                                            , 'dataItem.UUID_SCT_ID'
                                            , TOTAL_INDIRECT_COST
                                            , CIT
                                            , VAT
                                            , GA
                                            , MARGIN
                                            , SELLING_EXPENSE
                                            , ADJUST_PRICE
                                            , ''
                                            , 'dataItem.CREATE_BY'
                                            , CURRENT_TIMESTAMP()
                                            , 'dataItem.CREATE_BY'
                                            , CURRENT_TIMESTAMP()
                                            , 1
                                    FROM
                                            dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST
                                    WHERE
                                            SCT_ID = 'dataItem.SCT_ID'
                            )
                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.UUID_SCT_DETAIL_FOR_ADJUST_ID', UUID_SCT_DETAIL_FOR_ADJUST_ID)
    sql = sql.replaceAll('dataItem.UUID_SCT_ID', UUID_SCT_ID)
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem.CREATE_BY)

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem.SCT_ID_SELECTION)

    return sql
  },
  searchCostConditionBySctId: async (dataItem: any) => {
    let sql = `
            SELECT

                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  searchYRGrFromEngineerBySctId: async (dataItem: any) => {
    let sql = `

                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  searchMaterialPriceBySctId: async (dataItem: any) => {
    let sql = `

                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  searchTimeFromMfgBySctId: async (dataItem: any) => {
    let sql = `

                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  searchYRAccumulationMaterialFromEngineerBySctId: async (dataItem: any) => {
    let sql = `

                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID_SELECTION'])

    return sql
  },
  searchSctBudgetWithCondition: async (dataItem: any) => {
    let sql = `
                    SELECT
                            tb_1.SCT_ID
                    FROM
                            dataItem.STANDARD_COST_DB.SCT tb_1
                    JOIN
                            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_2
                                    ON
                            tb_1.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1
                    WHERE
                                tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_NO'
                            AND tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                            AND tb_2.SCT_TAG_SETTING_ID = '1'
                            AND tb_1.INUSE = 1

                    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR']?.value ?? '')
    sql = sql.replaceAll('dataItem.SCT_PATTERN_NO', dataItem['SCT_PATTERN_NO']?.value ?? '')
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
  deleteSctComponentTypeResourceOptionSelect: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `
                    UPDATE
                            dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT
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
  getSctSelection: async (dataItem: any) => {
    let sql = `
            SELECT
                    tb_2.SCT_ID_SELECTION
            FROM
                    dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_1
            JOIN
                    dataItem.STANDARD_COST_DB.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECTION_SCT tb_2
            ON
                    tb_1.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_2.SCT_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID AND tb_2.INUSE = 1
            WHERE
                        tb_1.SCT_ID = 'dataItem.SCT_ID'
                    AND tb_1.INUSE = 1
            GROUP BY
                    tb_2.SCT_ID_SELECTION


        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  getMaterialPriceDataLatestFGSemiFGSubAssy: async (dataItem: any) => {
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
                                ITEM_ID,
                                MAX(ITEM_M_O_PRICE_VERSION_NO) AS MAX_VERSION
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
                        , tb_3.PURCHASE_PRICE
                        , tb_3.PURCHASE_PRICE_CURRENCY_ID
                        , tb_4.CURRENCY_SYMBOL AS PURCHASE_PRICE_CURRENCY
                        , tb_3.PURCHASE_PRICE_UNIT_ID
                        , tb_5.SYMBOL AS PURCHASE_UNIT
                        , IFNULL(tb_13.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE, tb_6.ITEM_M_S_PRICE_VALUE) AS ITEM_M_S_PRICE_VALUE
                        , tb_6.ITEM_M_S_PRICE_ID
                        , tb_8.SYMBOL AS USAGE_UNIT
                        , tb_7.PURCHASE_UNIT_RATIO
                        , tb_7.USAGE_UNIT_RATIO
                        , tb_7.ITEM_CODE_FOR_SUPPORT_MES
                        , tb_7.ITEM_ID
                        , tb_7.ITEM_INTERNAL_SHORT_NAME
                        , tb_11.ITEM_CATEGORY_ID
                        , tb_10.IMPORT_FEE_RATE
                        , tb_12.SCT_ID AS SCT_ID_MATERIAL
                        , tb_14.SCT_STATUS_PROGRESS_ID AS SCT_STATUS_PROGRESS_ID_MATERIAL
                        , tb_15.SCT_REVISION_CODE AS SCT_REVISION_CODE_MATERIAL
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
                        tb_3.ITEM_ID = lv.ITEM_ID AND tb_3.ITEM_M_O_PRICE_VERSION_NO = lv.MAX_VERSION
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
                                JOIN
                        ITEM_M_S_PRICE_SCT tb_12
                                ON
                        tb_6.ITEM_M_S_PRICE_ID = tb_12.ITEM_M_S_PRICE_ID
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST tb_13
                                ON
                        tb_13.SCT_ID = tb_1.SCT_ID AND tb_13.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_2.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_13.INUSE = 1
                                LEFT JOIN
                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_14
                                ON
                        tb_12.SCT_ID = tb_14.SCT_ID AND tb_14.INUSE = 1
                                JOIN
                        dataItem.STANDARD_COST_DB.SCT tb_15
                                ON
                        tb_12.SCT_ID = tb_15.SCT_ID AND tb_15.INUSE = 1
                WHERE
                            tb_1.SCT_ID = 'dataItem.SCT_ID'
                        AND tb_6.FISCAL_YEAR = @sctFiscalYear
                        AND tb_9.ITEM_CATEGORY_ID IN (1, 2, 3)
                        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])

    return sql
  },
  updateStandardCostForProductByCostCondition: async (dataItem: any) => {
    let sql = `
            UPDATE
                    dataItem.STANDARD_COST_DB.SCT tb_1
            JOIN
                    PRODUCT_TYPE tb_2
            ON
                    tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
            JOIN
                    PRODUCT_SUB tb_3
            ON
                    tb_2.PRODUCT_SUB_ID = tb_3.PRODUCT_SUB_ID
            SET
                    tb_1.IS_REFRESH_DATA_MASTER = 1
            WHERE
                        tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    AND tb_1.INUSE = 1
                    AND tb_3.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                    AND tb_1.IS_REFRESH_DATA_MASTER = 0

        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
  updateStandardCostForProductByExchangeRateOrImportFee: async (fiscalYear: string) => {
    let sql = `
            UPDATE
                    dataItem.STANDARD_COST_DB.SCT tb_1
            SET
                    tb_1.IS_REFRESH_DATA_MASTER = 1
            WHERE
                        tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                    AND tb_1.INUSE = 1
                    AND tb_1.IS_REFRESH_DATA_MASTER = 0
        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', fiscalYear)

    return sql
  },
  deleteIsRefreshDataMaster: async (dataItem: any) => {
    let sql = `
            UPDATE dataItem.STANDARD_COST_DB.SCT
            SET
                      IS_REFRESH_DATA_MASTER = 0
                    , UPDATE_BY = 'dataItem.UPDATE_BY'
                    , UPDATE_DATE = CURRENT_TIMESTAMP()
            WHERE
                    SCT_ID = 'dataItem.SCT_ID'
        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB || '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  deleteWithCancelReason: async (dataItem: any) => {
    let sql = `
        UPDATE
                dataItem.STANDARD_COST_DB.SCT
        SET
                  INUSE = 0
                , UPDATE_BY = 'dataItem.UPDATE_BY'
                , UPDATE_DATE = CURRENT_TIMESTAMP()
                , CANCEL_REASON = 'dataItem.CANCEL_REASON'
        WHERE
                SCT_ID = 'dataItem.SCT_ID'
        `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.CANCEL_REASON', dataItem['CANCEL_REASON'])
    //     console.log(sql)
    return sql
  },
  getSctByLikeProductTypeIdAndMesTag: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
            , tb_3.SCT_STATUS_PROGRESS_ID
            , tb_4.SCT_STATUS_PROGRESS_NAME
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
        JOIN
            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_2
                ON
            tb_1.SCT_ID = tb_2.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_3
                ON
            tb_1.SCT_ID = tb_3.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_4
                ON
            tb_3.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
        WHERE
                tb_2.SCT_TAG_SETTING_ID = 3
            AND tb_1.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
        ORDER BY
            tb_1.UPDATE_DATE DESC
        LIMIT
            1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  getSctByLikeProductTypeIdAndBudgetTag: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
            , tb_3.SCT_STATUS_PROGRESS_ID
            , tb_4.SCT_STATUS_PROGRESS_NAME
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
        JOIN
            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_2
                ON
            tb_1.SCT_ID = tb_2.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_3
                ON
            tb_1.SCT_ID = tb_3.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_4
                ON
            tb_3.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
        WHERE
                tb_2.SCT_TAG_SETTING_ID = 1
            AND tb_1.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
        ORDER BY
            tb_1.UPDATE_DATE DESC
        LIMIT
            1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  getSctByLikeProductTypeIdAndPriceTag: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
            , tb_3.SCT_STATUS_PROGRESS_ID
            , tb_4.SCT_STATUS_PROGRESS_NAME
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
        JOIN
            dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_2
                ON
            tb_1.SCT_ID = tb_2.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_3
                ON
            tb_1.SCT_ID = tb_3.SCT_ID
        JOIN
            dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_4
                ON
            tb_3.SCT_STATUS_PROGRESS_ID = tb_4.SCT_STATUS_PROGRESS_ID
        WHERE
                tb_2.SCT_TAG_SETTING_ID = 2
            AND tb_1.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
        ORDER BY
            tb_1.UPDATE_DATE DESC
        LIMIT
            1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB!)

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  getSctByLikeProductTypeIdAndLatestRevision: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
        FROM
            dataItem.STANDARD_COST_DB.SCT tb_1
        JOIN
            dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_2
                ON
            tb_1.SCT_ID = tb_2.SCT_ID
        WHERE
                tb_1.PRODUCT_TYPE_ID = dataItem.PRODUCT_TYPE_ID
            AND tb_2.SCT_STATUS_PROGRESS_ID >= 7
            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
        ORDER BY
            tb_1.CREATE_DATE DESC
        LIMIT
            1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  getSctByLikeProductTypeCodeAndLatestRevision: async (dataItem: any) => {
    let sql = `
        SELECT
              tb_1.SCT_ID
            , tb_1.SCT_REVISION_CODE
            , tb_3.SCT_STATUS_PROGRESS_ID
            , tb_3.SCT_STATUS_PROGRESS_NAME
            , tb_1.BOM_ID
            , tb_5.BOM_NAME
            , tb_5.BOM_CODE
        FROM
                        dataItem.STANDARD_COST_DB.SCT tb_1
                                JOIN
                        dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_2
                                ON tb_1.SCT_ID = tb_2.SCT_ID
                                AND tb_2.INUSE = 1
                                JOIN
                        dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_3
                                ON tb_2.SCT_STATUS_PROGRESS_ID = tb_3.SCT_STATUS_PROGRESS_ID
                                JOIN
                        product_type tb_4
                                ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                JOIN
                        BOM tb_5
                                ON tb_1.BOM_ID = tb_5.BOM_ID
        WHERE
                tb_4.PRODUCT_TYPE_CODE_FOR_SCT = 'dataItem.PRODUCT_TYPE_CODE'
            AND tb_2.SCT_STATUS_PROGRESS_ID <> 1
            AND tb_1.SCT_PATTERN_ID = 'dataItem.SCT_PATTERN_ID'
            AND tb_1.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
        ORDER BY
            tb_1.SCT_REVISION_CODE DESC
        LIMIT
            1
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.SCT_PATTERN_ID', dataItem['SCT_PATTERN_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'])

    return sql
  },
  insertSctMasterDataHistory: async (dataItem: {
    SCT_MASTER_DATA_SETTING_ID: number
    SCT_ID: string
    FISCAL_YEAR: number
    VERSION_NO: number
    CREATE_BY: string
    UPDATE_BY: string
    IS_FROM_SCT_COPY: number
  }) => {
    let sql = `
        INSERT INTO
                        dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_HISTORY
                        (
                                  SCT_MASTER_DATA_SETTING_ID
                                , SCT_ID
                                , FISCAL_YEAR
                                , VERSION_NO
                                , CREATE_BY
                                , UPDATE_BY
                                , UPDATE_DATE
                                , INUSE
                                , IS_FROM_SCT_COPY
                        ) VALUES (
                          'dataItem.SCT_MASTER_DATA_SETTING_ID'
                        , 'dataItem.SCT_ID'
                        , 'dataItem.FISCAL_YEAR'
                        , 'dataItem.VERSION_NO'
                        , 'dataItem.CREATE_BY'
                        , 'dataItem.UPDATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 1
                        , 'dataItem.IS_FROM_SCT_COPY'
                        )
    `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.VERSION_NO', dataItem['VERSION_NO'].toString())
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.SCT_MASTER_DATA_SETTING_ID', dataItem['SCT_MASTER_DATA_SETTING_ID'].toString())
    sql = sql.replaceAll('dataItem.IS_FROM_SCT_COPY', dataItem['IS_FROM_SCT_COPY'].toString())

    return sql
  },
  deleteSctMasterDataHistory: async (dataItem: { SCT_ID: string; UPDATE_BY: string; IS_FROM_SCT_COPY: number }) => {
    let sql = `
                    UPDATE
                            dataItem.STANDARD_COST_DB.SCT_MASTER_DATA_HISTORY
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
  updateUpdateByUpdateDate: async (dataItem: { SCT_ID: string; UPDATE_BY: string }) => {
    let sql = `
                    UPDATE
                            dataItem.STANDARD_COST_DB.SCT
                    SET
                              UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                                SCT_ID = 'dataItem.SCT_ID' `
    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_ID', dataItem['SCT_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getParentProductTypeBySctRevisionCode: async (dataItem: { SCT_REVISION_CODE: string }) => {
    let sql = `
                                SELECT
                                          tb_5.SCT_ID
                                        , tb_5.SCT_REVISION_CODE
                                        , tb_5.IS_REFRESH_DATA_MASTER
                                        , DATE_FORMAT(tb_5.ESTIMATE_PERIOD_START_DATE, '%d-%b-%Y') AS ESTIMATE_PERIOD_START_DATE
                                        , DATE_FORMAT(tb_5.ESTIMATE_PERIOD_END_DATE, '%d-%b-%Y')   AS ESTIMATE_PERIOD_END_DATE
                                        , tb_5.CREATE_BY
                                        , DATE_FORMAT(tb_5.CREATE_DATE, '%d-%b-%Y %H:%i:%s')       AS CREATE_DATE
                                        , tb_5.UPDATE_BY
                                        , DATE_FORMAT(tb_5.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')       AS UPDATE_DATE
                                        , tb_12.UPDATE_BY                                           AS STATUS_UPDATE_BY
                                        , DATE_FORMAT(tb_12.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')       AS STATUS_UPDATE_DATE
                                        , tb_5.CANCEL_REASON
                                        , tb_5.NOTE
                                        , tb_5.DESCRIPTION
                                        , tb_5.INUSE
                                        , tb_13.SCT_STATUS_PROGRESS_ID
                                        , tb_13.SCT_STATUS_PROGRESS_NO
                                        , tb_13.SCT_STATUS_PROGRESS_NAME

                                        , tb_5.PRODUCT_TYPE_ID
                                        , tb_6.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                                        , tb_6.PRODUCT_TYPE_NAME
                                        , tb_7.PRODUCT_SUB_ID
                                        , tb_7.PRODUCT_SUB_NAME
                                        , tb_8.PRODUCT_MAIN_NAME
                                        , tb_8.PRODUCT_MAIN_ID
                                        , tb_9.PRODUCT_CATEGORY_ID
                                        , tb_9.PRODUCT_CATEGORY_NAME
                                        , tb_5.FISCAL_YEAR
                                        , tb_10.BOM_CODE
                                        , tb_10.BOM_NAME
                                        , tb_11.FLOW_CODE
                                        , tb_11.FLOW_NAME
                                        , tb_17.ITEM_CATEGORY_NAME
                                        , tb_17.ITEM_CATEGORY_ID
                                        , tb_19.CUSTOMER_INVOICE_TO_NAME
                                        , tb_19.CUSTOMER_INVOICE_TO_ID
                                        , tb_19.CUSTOMER_INVOICE_TO_ALPHABET
                                        , tb_22.PRODUCT_SPECIFICATION_TYPE_NAME
                                        , tb_23.SCT_PATTERN_ID
                                        , tb_23.SCT_PATTERN_NAME

                                        , tb_25.SCT_REASON_SETTING_NAME
                                        , tb_25.SCT_REASON_SETTING_ID
                                        , tb_27.SCT_TAG_SETTING_NAME
                                        , tb_27.SCT_TAG_SETTING_ID

                                        , IF(tb_12.SCT_STATUS_PROGRESS_ID = 2, NULL, tb_14.SELLING_PRICE) AS SELLING_PRICE
                                        , tb_14.ADJUST_PRICE
                                        , tb_14.ASSEMBLY_GROUP_FOR_SUPPORT_MES
                                        , IF(tb_14.SELLING_PRICE IS NULL OR tb_12.SCT_STATUS_PROGRESS_ID = 2,
                                          '', DATE_FORMAT(tb_14.UPDATE_DATE, '%d-%b-%Y %H:%i:%s')) AS RE_CAL_UPDATE_DATE
                                        , tb_14.UPDATE_DATE AS RE_CAL_UPDATE_DATE_NO_FORMAT
                                        , IF(tb_14.SELLING_PRICE IS NULL OR tb_12.SCT_STATUS_PROGRESS_ID = 2,
                                          '', tb_14.UPDATE_BY) AS RE_CAL_UPDATE_BY
                                        , IF(tb_15.TOTAL_INDIRECT_COST IS NULL, '', 'Manual') AS INDIRECT_COST_MODE
                                        , tb_12.SCT_STATUS_WORKING_ID
                                        , IF(tb_15.TOTAL_INDIRECT_COST IS NULL, tb_14.INDIRECT_COST_SALE_AVE, tb_15.TOTAL_INDIRECT_COST)
                                          AS TOTAL_INDIRECT_COST

                            FROM
                                    dataItem.STANDARD_COST_DB.SCT tb_1
                                           JOIN
                                          ITEM_M_S_PRICE_SCT tb_2
                                           ON tb_1.SCT_ID = tb_2.SCT_ID
                                           JOIN
                                           dataItem.STANDARD_COST_DB.sct_bom_flow_process_item_usage_price tb_3
                                            ON tb_2.ITEM_M_S_PRICE_ID = tb_3.ITEM_M_S_PRICE_ID
                                            AND tb_3.INUSE = 1
                                            LEFT JOIN
                                    dataItem.STANDARD_COST_DB.SCT tb_5
                                            ON tb_3.SCT_ID = tb_5.SCT_ID
                                            LEFT JOIN
                                    PRODUCT_TYPE tb_6
                                            ON tb_5.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID
                                            LEFT JOIN
                                    PRODUCT_SUB tb_7
                                            ON tb_6.PRODUCT_SUB_ID = tb_7.PRODUCT_SUB_ID
                                            LEFT JOIN
                                    PRODUCT_MAIN tb_8
                                            ON tb_7.PRODUCT_MAIN_ID = tb_8.PRODUCT_MAIN_ID
                                            LEFT JOIN
                                    PRODUCT_CATEGORY tb_9
                                            ON tb_8.PRODUCT_CATEGORY_ID = tb_9.PRODUCT_CATEGORY_ID
                                            LEFT JOIN
                                    BOM tb_10
                                            ON tb_5.BOM_ID = tb_10.BOM_ID
                                            LEFT JOIN
                                    FLOW tb_11
                                            ON tb_10.FLOW_ID = tb_11.FLOW_ID
                                            LEFT JOIN
                                    dataItem.STANDARD_COST_DB.SCT_PROGRESS_WORKING tb_12
                                            ON tb_5.SCT_ID = tb_12.SCT_ID
                                            AND tb_12.INUSE = 1
                                            LEFT JOIN
                                    dataItem.STANDARD_COST_DB.SCT_STATUS_PROGRESS tb_13
                                            ON tb_12.SCT_STATUS_PROGRESS_ID = tb_13.SCT_STATUS_PROGRESS_ID
                                            LEFT JOIN
                                    dataItem.STANDARD_COST_DB.SCT_TOTAL_COST tb_14
                                            ON tb_5.SCT_ID = tb_14.SCT_ID
                                            AND tb_14.INUSE = 1
                                            LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_DETAIL_FOR_ADJUST tb_15
                                        ON tb_5.SCT_ID = tb_15.SCT_ID
                                        AND tb_15.INUSE = 1
                                        LEFT JOIN
                                PRODUCT_TYPE_ITEM_CATEGORY tb_16
                                        ON tb_5.PRODUCT_TYPE_ID = tb_16.PRODUCT_TYPE_ID
                                        AND tb_16.INUSE = 1
                                        LEFT JOIN
                                ITEM_CATEGORY tb_17
                                        ON tb_16.ITEM_CATEGORY_ID = tb_17.ITEM_CATEGORY_ID
                                        LEFT JOIN
                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_18
                                        ON tb_5.PRODUCT_TYPE_ID = tb_18.PRODUCT_TYPE_ID
                                        AND tb_18.INUSE = 1
                                        LEFT JOIN
                                CUSTOMER_INVOICE_TO tb_19
                                        ON tb_18.CUSTOMER_INVOICE_TO_ID = tb_19.CUSTOMER_INVOICE_TO_ID
                                        LEFT JOIN
                                PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_20
                                        ON tb_5.PRODUCT_TYPE_ID = tb_20.PRODUCT_TYPE_ID
                                        AND tb_20.INUSE = 1
                                        LEFT JOIN
                                PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_21
                                        ON tb_20.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_21.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                        AND tb_21.INUSE = 1
                                        LEFT JOIN
                                PRODUCT_SPECIFICATION_TYPE tb_22
                                        ON tb_21.PRODUCT_SPECIFICATION_TYPE_ID = tb_22.PRODUCT_SPECIFICATION_TYPE_ID
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_PATTERN tb_23
                                        ON tb_5.SCT_PATTERN_ID = tb_23.SCT_PATTERN_ID
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_HISTORY tb_24
                                        ON tb_5.SCT_ID = tb_24.SCT_ID
                                        AND tb_24.INUSE = 1
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_REASON_SETTING tb_25
                                        ON tb_24.SCT_REASON_SETTING_ID = tb_25.SCT_REASON_SETTING_ID
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_HISTORY tb_26
                                        ON tb_5.SCT_ID = tb_26.SCT_ID
                                        AND tb_26.INUSE = 1
                                        LEFT JOIN
                                dataItem.STANDARD_COST_DB.SCT_TAG_SETTING tb_27
                                        ON tb_26.SCT_TAG_SETTING_ID = tb_27.SCT_TAG_SETTING_ID

                                    WHERE
                                            tb_1.SCT_REVISION_CODE = 'dataItem.SCT_REVISION_CODE'
            `

    sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process.env.STANDARD_COST_DB ?? '')

    sql = sql.replaceAll('dataItem.SCT_REVISION_CODE', dataItem['SCT_REVISION_CODE'])

    return sql
  },
}
