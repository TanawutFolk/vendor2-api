export const _CostConditionSQL = {
  getAllByProductMainIdAndFiscalYear_MasterDataLatest: async (dataItem: { FISCAL_YEAR: number; PRODUCT_MAIN_ID: number }) => {
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
                                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                                AND INUSE = 1
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
                                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                                AND INUSE = 1
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
                                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                                AND INUSE = 1
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
                                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                                AND INUSE = 1
                                )
                                AND INUSE = 1
                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID';

                        SELECT
                                  IMPORT_FEE_ID
                                , IMPORT_FEE_RATE
                                , FISCAL_YEAR
                                , VERSION
                        FROM
                                IMPORT_FEE
                        WHERE
                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND VERSION = (
                                        SELECT
                                                MAX(VERSION)
                                        FROM
                                                IMPORT_FEE
                                        WHERE
                                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                                AND INUSE = 1
                                )
                                AND INUSE = 1;
            `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'].toString())

    return sql
  },
  getAllByProductMainIdAndFiscalYear_MasterDataVersion_isFromSctCopy: async (dataItem: { FISCAL_YEAR: number; PRODUCT_MAIN_ID: string }) => {
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
                                FISCAL_YEAR = (
                                        SELECT
                                                VERSION_NO
                                        FROM
                                                SCT_MASTER_DATA_HISTORY
                                        WHERE
                                                    SCT_ID = 'dataItem.SCT_ID'
                                                AND SCT_MASTER_DATA_SETTING_ID = 'dataItem.SCT_MASTER_DATA_SETTING_ID'
                                                AND IS_FROM_SCT_COPY = 1
                                                AND INUSE = 1
                                )
                                AND VERSION = (
                                        SELECT
                                                VERSION_NO
                                        FROM
                                                SCT_MASTER_DATA_HISTORY
                                        WHERE
                                                    SCT_ID = 'dataItem.SCT_ID'
                                                AND SCT_MASTER_DATA_SETTING_ID = 'dataItem.SCT_MASTER_DATA_SETTING_ID'
                                                AND IS_FROM_SCT_COPY = 1
                                                AND INUSE = 1
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
                                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                                AND INUSE = 1
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
                                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                                AND INUSE = 1
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
                                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                                                AND INUSE = 1
                                )
                                AND INUSE = 1
                                AND PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID';

                        SELECT
                                  IMPORT_FEE_ID
                                , IMPORT_FEE_RATE
                                , FISCAL_YEAR
                                , VERSION
                        FROM
                                IMPORT_FEE
                        WHERE
                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                AND VERSION = (
                                        SELECT
                                                MAX(VERSION)
                                        FROM
                                                IMPORT_FEE
                                        WHERE
                                                    FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                                                AND INUSE = 1
                                )
                                AND INUSE = 1;
            `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', dataItem['FISCAL_YEAR'].toString())
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    return sql
  },
}
