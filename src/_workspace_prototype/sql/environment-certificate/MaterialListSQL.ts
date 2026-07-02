export const MaterialListSQL = {
  search: async (dataItem: any, sqlWhere: any) => {
    let sqlList: any = []

    let sql = `
          SELECT
              COUNT(*) AS TOTAL_COUNT
          FROM
            PRODUCT_TYPE tb_1
          LEFT JOIN
            SCT tb_2
            ON (tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID AND tb_2.INUSE = 1)
          LEFT JOIN
            SCT_PROGRESS_WORKING tb_3
            ON (tb_2.SCT_ID = tb_3.SCT_ID AND tb_3.INUSE = 1)
          LEFT JOIN
            PRODUCT_SUB tb_4
            ON tb_1.PRODUCT_SUB_ID = tb_4.PRODUCT_SUB_ID
          LEFT JOIN
            PRODUCT_MAIN tb_5
            ON tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
          LEFT JOIN
            PRODUCT_CATEGORY tb_6
            ON tb_5.PRODUCT_CATEGORY_ID = tb_6.PRODUCT_CATEGORY_ID
          LEFT JOIN
            PRODUCT_TYPE_ITEM_CATEGORY tb_7
            ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
          LEFT JOIN
            ITEM_CATEGORY tb_8
            ON tb_7.ITEM_CATEGORY_ID = tb_8.ITEM_CATEGORY_ID
          LEFT JOIN
            SCT_BOM tb_9
            ON (tb_2.SCT_ID = tb_9.SCT_ID)
          LEFT JOIN
            BOM_FLOW_PROCESS_ITEM_USAGE tb_10
            ON (tb_9.BOM_ID = tb_10.BOM_ID AND tb_10.INUSE = 1)
          LEFT JOIN
            CUSTOMER_INVOICE_TO tb_11
            ON tb_2.CUSTOMER_INVOICE_TO_ID = tb_11.CUSTOMER_INVOICE_TO_ID
          LEFT JOIN
            ITEM_MANUFACTURING tb_12
            ON (tb_10.ITEM_ID = tb_12.ITEM_ID)
          LEFT JOIN
            SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_13
            ON (tb_10.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_13.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_2.SCT_ID = tb_13.SCT_ID AND tb_13.INUSE = 1)
          LEFT JOIN
            ITEM_PRICE_SCT tb_14
            ON (tb_13.ITEM_PRICE_ID = tb_14.ITEM_PRICE_ID AND tb_14.INUSE = 1)
          LEFT JOIN
            SCT tb_15
            ON (tb_14.SCT_ID = tb_15.SCT_ID)
          LEFT JOIN
            PRODUCT_TYPE tb_16
            ON tb_15.PRODUCT_TYPE_ID = tb_16.PRODUCT_TYPE_ID
          LEFT JOIN
            BOM tb_17
            ON (tb_9.BOM_ID = tb_17.BOM_ID AND tb_17.INUSE = 1)
          LEFT JOIN
            ITEM_MADE_BY tb_18
            ON (tb_12.ITEM_ID = tb_18.ITEM_ID AND tb_18.INUSE = 1)
          LEFT JOIN
            MADE_BY tb_19
            ON tb_18.MADE_BY_ID = tb_19.MADE_BY_ID
          LEFT JOIN
            BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_20
            ON (tb_10.BOM_ID = tb_20.BOM_ID AND tb_10.FLOW_PROCESS_ID = tb_20.FLOW_PROCESS_ID AND tb_10.ITEM_ID = tb_20.ITEM_ID AND tb_20.INUSE = 1)
          LEFT JOIN
            ITEM_CATEGORY tb_21
            ON tb_20.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID
          LEFT JOIN
            VENDOR tb_22
            ON (tb_12.VENDOR_ID = tb_22.VENDOR_ID)
          LEFT JOIN
            MAKER tb_23
            ON (tb_12.MAKER_ID = tb_23.MAKER_ID)
          LEFT JOIN
            ITEM tb_24
            ON (tb_10.ITEM_ID = tb_24.ITEM_ID)
          LEFT JOIN
            ITEM_CATEGORY tb_25
            ON tb_24.ITEM_CATEGORY_ID = tb_25.ITEM_CATEGORY_ID

          WHERE
                tb_3.SCT_STATUS_PROGRESS_ID = 7
            AND tb_1.INUSE = 1

            dataItem.sqlWhere
            sqlWhereColumnFilter

`

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sql = `
        SELECT
            tb_14.SCT_ID AS SCT_ID_SUB
          , tb_5.PRODUCT_MAIN_ID AS PRODUCT_MAIN_ID_MAIN
          , tb_8.ITEM_CATEGORY_NAME
          , tb_6.PRODUCT_CATEGORY_NAME
          , tb_5.PRODUCT_MAIN_NAME
          , tb_4.PRODUCT_SUB_NAME
          , tb_2.SCT_CODE_FOR_SUPPORT_MES AS PRODUCT_TYPE_CODE
          , tb_1.PRODUCT_TYPE_NAME
          , tb_11.CUSTOMER_INVOICE_TO_NAME
          , tb_2.SCT_CODE_FOR_SUPPORT_MES AS PRODUCT_TYPE_CODE_SUB
          , tb_1.PRODUCT_TYPE_NAME AS PRODUCT_TYPE_NAME_SUB
          , tb_17.BOM_CODE
          , tb_12.ITEM_CODE_FOR_SUPPORT_MES AS M_CODE_MES
          , tb_21.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_FROM_BOM
          , tb_12.ITEM_EXTERNAL_FULL_NAME AS MATERIAL_EXTERNAL_FULL_NAME
          , tb_12.ITEM_EXTERNAL_SHORT_NAME AS MATERIAL_EXTERNAL_SHORT_NAME
          , '' AS PURCHASE_SPECIFICATION_NO
          , '' AS DRAWING_NO
          , tb_19.MADE_BY_NAME AS MADE_BY
          , tb_22.VENDOR_NAME
          , tb_23.MAKER_NAME
          , tb_25.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_FROM_ITEM_MASTER
          , IF(1 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ), 'NEED', 'NO NEED') AS RoSH10
          , IF(2 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ), 'NEED', 'NO NEED') AS REACH
          , IF(3 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ), 'NEED', 'NO NEED') AS Green_NTT
          , IF(4 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ) AND tb_19.MADE_BY_ID = 11111111111111111, 'NEED', 'NO NEED') AS ChemSHERPA
          , IF(5 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ) AND tb_19.MADE_BY_ID = 1, 'NEED', 'NO NEED') AS Conflict_Minerals
          , IF(6 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ) AND tb_21.ITEM_CATEGORY_ID = 6, 'NEED', 'NO NEED') AS Packaging_Waste

        FROM
          PRODUCT_TYPE tb_1
        LEFT JOIN
          SCT tb_2
          ON (tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID AND tb_2.INUSE = 1)
        LEFT JOIN
          SCT_PROGRESS_WORKING tb_3
          ON (tb_2.SCT_ID = tb_3.SCT_ID AND tb_3.INUSE = 1)
        LEFT JOIN
          PRODUCT_SUB tb_4
          ON tb_1.PRODUCT_SUB_ID = tb_4.PRODUCT_SUB_ID
        LEFT JOIN
          PRODUCT_MAIN tb_5
          ON tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
        LEFT JOIN
          PRODUCT_CATEGORY tb_6
          ON tb_5.PRODUCT_CATEGORY_ID = tb_6.PRODUCT_CATEGORY_ID
        LEFT JOIN
          PRODUCT_TYPE_ITEM_CATEGORY tb_7
          ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
        LEFT JOIN
          ITEM_CATEGORY tb_8
          ON tb_7.ITEM_CATEGORY_ID = tb_8.ITEM_CATEGORY_ID
        LEFT JOIN
          SCT_BOM tb_9
          ON (tb_2.SCT_ID = tb_9.SCT_ID)
        LEFT JOIN
          BOM_FLOW_PROCESS_ITEM_USAGE tb_10
          ON (tb_9.BOM_ID = tb_10.BOM_ID AND tb_10.INUSE = 1)
        LEFT JOIN
          CUSTOMER_INVOICE_TO tb_11
          ON tb_2.CUSTOMER_INVOICE_TO_ID = tb_11.CUSTOMER_INVOICE_TO_ID
        LEFT JOIN
          ITEM_MANUFACTURING tb_12
          ON (tb_10.ITEM_ID = tb_12.ITEM_ID)
        LEFT JOIN
          SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_13
          ON (tb_10.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_13.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_2.SCT_ID = tb_13.SCT_ID AND tb_13.INUSE = 1)
        LEFT JOIN
          ITEM_PRICE_SCT tb_14
          ON (tb_13.ITEM_PRICE_ID = tb_14.ITEM_PRICE_ID AND tb_14.INUSE = 1)
        LEFT JOIN
          SCT tb_15
          ON (tb_14.SCT_ID = tb_15.SCT_ID)
        LEFT JOIN
          PRODUCT_TYPE tb_16
          ON tb_15.PRODUCT_TYPE_ID = tb_16.PRODUCT_TYPE_ID
        LEFT JOIN
          BOM tb_17
          ON (tb_9.BOM_ID = tb_17.BOM_ID AND tb_17.INUSE = 1)
        LEFT JOIN
          ITEM_MADE_BY tb_18
          ON (tb_12.ITEM_ID = tb_18.ITEM_ID AND tb_18.INUSE = 1 AND tb_18.MADE_BY_ID = 1)
        LEFT JOIN
          MADE_BY tb_19
          ON tb_18.MADE_BY_ID = tb_19.MADE_BY_ID
        LEFT JOIN
          BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_20
          ON (tb_10.BOM_ID = tb_20.BOM_ID AND tb_10.FLOW_PROCESS_ID = tb_20.FLOW_PROCESS_ID AND tb_10.ITEM_ID = tb_20.ITEM_ID AND tb_20.INUSE = 1)
        LEFT JOIN
          ITEM_CATEGORY tb_21
          ON tb_20.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID
        LEFT JOIN
          VENDOR tb_22
          ON (tb_12.VENDOR_ID = tb_22.VENDOR_ID)
        LEFT JOIN
          MAKER tb_23
          ON (tb_12.MAKER_ID = tb_23.MAKER_ID)
        LEFT JOIN
          ITEM tb_24
          ON (tb_10.ITEM_ID = tb_24.ITEM_ID)
        LEFT JOIN
          ITEM_CATEGORY tb_25
          ON tb_24.ITEM_CATEGORY_ID = tb_25.ITEM_CATEGORY_ID
        WHERE
              tb_3.SCT_STATUS_PROGRESS_ID = 7
          AND tb_1.INUSE = 1

          dataItem.sqlWhere
          sqlWhereColumnFilter

        ORDER BY
          tb_2.SCT_ID, tb_10.BOM_FLOW_PROCESS_ITEM_USAGE_ID dataItem.Order

        LIMIT
            dataItem.Start
          , dataItem.Limit

    `

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    sqlList.push(sql)

    sqlList = sqlList.join(';')

    return sqlList
  },
  getItemDetailForExport: async (dataItem: any, sqlWhere: any, sqlGroupBy: any) => {
    let sql = `
        SELECT
            tb_14.SCT_ID AS SCT_ID_SUB
          , tb_5.PRODUCT_MAIN_ID AS PRODUCT_MAIN_ID_MAIN
          , tb_6.PRODUCT_CATEGORY_NAME AS PRODUCT_CATEGORY
          , tb_5.PRODUCT_MAIN_NAME AS PRODUCT_MAIN
          , tb_4.PRODUCT_SUB_NAME AS PRODUCT_SUB
          , tb_2.SCT_CODE_FOR_SUPPORT_MES AS STANDARD_COST_CODE
          , tb_1.PRODUCT_TYPE_NAME
          , tb_11.CUSTOMER_INVOICE_TO_NAME
          , tb_2.SCT_CODE_FOR_SUPPORT_MES AS STANDARD_COST_CODE_SUB
          , tb_1.PRODUCT_TYPE_NAME AS PRODUCT_TYPE_NAME_SUB
          , tb_17.BOM_CODE
          , tb_12.ITEM_CODE_FOR_SUPPORT_MES AS M_CODE_MES
          , tb_21.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_FROM_BOM
          , tb_12.ITEM_EXTERNAL_FULL_NAME AS MATERIAL_EXTERNAL_FULL_NAME
          , tb_12.ITEM_EXTERNAL_SHORT_NAME AS MATERIAL_EXTERNAL_SHORT_NAME
          , '' AS PURCHASE_SPECIFICATION_NO
          , '' AS DRAWING_NO
          , tb_19.MADE_BY_NAME AS MADE_BY
          , tb_22.VENDOR_NAME
          , tb_23.MAKER_NAME
          , tb_25.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_FROM_ITEM_MASTER
          , IF(1 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ), 'NEED', 'NO NEED') AS RoSH10
          , IF(2 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ), 'NEED', 'NO NEED') AS REACH
          , IF(3 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ), 'NEED', 'NO NEED') AS Green_NTT
          , IF(4 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ) AND tb_19.MADE_BY_ID = 11111111111111111, 'NEED', 'NO NEED') AS ChemSHERPA
          , IF(5 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ) AND tb_19.MADE_BY_ID = 1, 'NEED', 'NO NEED') AS Conflict_Minerals
          , IF(6 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
            ) AND tb_21.ITEM_CATEGORY_ID = 6, 'NEED', 'NO NEED') AS Packaging_Waste

        FROM
          PRODUCT_TYPE tb_1
        LEFT JOIN
          SCT tb_2
          ON (tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID AND tb_2.INUSE = 1)
        LEFT JOIN
          SCT_PROGRESS_WORKING tb_3
          ON (tb_2.SCT_ID = tb_3.SCT_ID AND tb_3.INUSE = 1)
        LEFT JOIN
          PRODUCT_SUB tb_4
          ON tb_1.PRODUCT_SUB_ID = tb_4.PRODUCT_SUB_ID
        LEFT JOIN
          PRODUCT_MAIN tb_5
          ON tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
        LEFT JOIN
          PRODUCT_CATEGORY tb_6
          ON tb_5.PRODUCT_CATEGORY_ID = tb_6.PRODUCT_CATEGORY_ID
        LEFT JOIN
          PRODUCT_TYPE_ITEM_CATEGORY tb_7
          ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
        LEFT JOIN
          ITEM_CATEGORY tb_8
          ON tb_7.ITEM_CATEGORY_ID = tb_8.ITEM_CATEGORY_ID
        LEFT JOIN
          SCT_BOM tb_9
          ON (tb_2.SCT_ID = tb_9.SCT_ID)
        LEFT JOIN
          BOM_FLOW_PROCESS_ITEM_USAGE tb_10
          ON (tb_9.BOM_ID = tb_10.BOM_ID AND tb_10.INUSE = 1)
        LEFT JOIN
          CUSTOMER_INVOICE_TO tb_11
          ON tb_2.CUSTOMER_INVOICE_TO_ID = tb_11.CUSTOMER_INVOICE_TO_ID
        LEFT JOIN
          ITEM_MANUFACTURING tb_12
          ON (tb_10.ITEM_ID = tb_12.ITEM_ID)
        LEFT JOIN
          SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_13
          ON (tb_10.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_13.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_2.SCT_ID = tb_13.SCT_ID AND tb_13.INUSE = 1)
        LEFT JOIN
          ITEM_PRICE_SCT tb_14
          ON (tb_13.ITEM_PRICE_ID = tb_14.ITEM_PRICE_ID AND tb_14.INUSE = 1)
        LEFT JOIN
          SCT tb_15
          ON (tb_14.SCT_ID = tb_15.SCT_ID)
        LEFT JOIN
          PRODUCT_TYPE tb_16
          ON tb_15.PRODUCT_TYPE_ID = tb_16.PRODUCT_TYPE_ID
        LEFT JOIN
          BOM tb_17
          ON (tb_9.BOM_ID = tb_17.BOM_ID AND tb_17.INUSE = 1)
        LEFT JOIN
          ITEM_MADE_BY tb_18
          ON (tb_12.ITEM_ID = tb_18.ITEM_ID AND tb_18.INUSE = 1 AND tb_18.MADE_BY_ID = 1)
        LEFT JOIN
          MADE_BY tb_19
          ON tb_18.MADE_BY_ID = tb_19.MADE_BY_ID
        LEFT JOIN
          BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_20
          ON (tb_10.BOM_ID = tb_20.BOM_ID AND tb_10.FLOW_PROCESS_ID = tb_20.FLOW_PROCESS_ID AND tb_10.ITEM_ID = tb_20.ITEM_ID AND tb_20.INUSE = 1)
        LEFT JOIN
          ITEM_CATEGORY tb_21
          ON tb_20.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID
        LEFT JOIN
          VENDOR tb_22
          ON (tb_12.VENDOR_ID = tb_22.VENDOR_ID)
        LEFT JOIN
          MAKER tb_23
          ON (tb_12.MAKER_ID = tb_23.MAKER_ID)
        LEFT JOIN
          ITEM tb_24
          ON (tb_10.ITEM_ID = tb_24.ITEM_ID)
        LEFT JOIN
          ITEM_CATEGORY tb_25
          ON tb_24.ITEM_CATEGORY_ID = tb_25.ITEM_CATEGORY_ID
        WHERE
              tb_3.SCT_STATUS_PROGRESS_ID = 7
          AND tb_1.INUSE = 1

          dataItem.sqlWhere
          sqlWhereColumnFilter

        dataItem.sqlGroupBy

        ORDER BY
          tb_2.SCT_ID, tb_10.BOM_FLOW_PROCESS_ITEM_USAGE_ID

    `

    sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    sql = sql.replaceAll('dataItem.sqlGroupBy', sqlGroupBy)
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    return sql
  },
  getItemDetailForExportByAllMCode: async () => {
    let sql = `
      SELECT
            tb_14.SCT_ID AS SCT_ID_SUB
          , tb_5.PRODUCT_MAIN_ID AS PRODUCT_MAIN_ID_MAIN
          , tb_6.PRODUCT_CATEGORY_NAME AS PRODUCT_CATEGORY
          , tb_5.PRODUCT_MAIN_NAME AS PRODUCT_MAIN
          , tb_4.PRODUCT_SUB_NAME AS PRODUCT_SUB
          , tb_2.SCT_CODE_FOR_SUPPORT_MES AS STANDARD_COST_CODE
          , tb_444.PRODUCT_TYPE_NAME
          , tb_11.CUSTOMER_INVOICE_TO_NAME
          , tb_2.SCT_CODE_FOR_SUPPORT_MES AS STANDARD_COST_CODE_SUB
          , tb_444.PRODUCT_TYPE_NAME AS PRODUCT_TYPE_NAME_SUB
          , tb_17.BOM_CODE
          , tb_12.ITEM_CODE_FOR_SUPPORT_MES AS M_CODE_MES
          , tb_21.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_FROM_BOM
          , tb_12.ITEM_EXTERNAL_FULL_NAME AS MATERIAL_EXTERNAL_FULL_NAME
          , tb_12.ITEM_EXTERNAL_SHORT_NAME AS MATERIAL_EXTERNAL_SHORT_NAME
          , '' AS PURCHASE_SPECIFICATION_NO
          , '' AS DRAWING_NO
          , tb_19.MADE_BY_NAME AS MADE_BY
          , tb_22.VENDOR_NAME
          , tb_23.MAKER_NAME
          , tb_25.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_FROM_ITEM_MASTER
          , IF(1 IN (
          SELECT
            ENVIRONMENT_CERTIFICATE_ID
          FROM
            PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
          WHERE
            tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
          ), 'NEED', 'NO NEED') AS RoSH10
          , IF(2 IN (
          SELECT
            ENVIRONMENT_CERTIFICATE_ID
          FROM
            PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
          WHERE
            tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
          ), 'NEED', 'NO NEED') AS REACH
          , IF(3 IN (
          SELECT
            ENVIRONMENT_CERTIFICATE_ID
          FROM
            PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
          WHERE
            tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
          ), 'NEED', 'NO NEED') AS Green_NTT
          , IF(4 IN (
          SELECT
            ENVIRONMENT_CERTIFICATE_ID
          FROM
            PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
          WHERE
            tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
          ) AND tb_19.MADE_BY_ID = 11111111111111111, 'NEED', 'NO NEED') AS ChemSHERPA
          , IF(5 IN (
          SELECT
            ENVIRONMENT_CERTIFICATE_ID
          FROM
            PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
          WHERE
            tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
          ) AND tb_19.MADE_BY_ID = 1, 'NEED', 'NO NEED') AS Conflict_Minerals
          , IF(6 IN (
          SELECT
            ENVIRONMENT_CERTIFICATE_ID
          FROM
            PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
          WHERE
            tt.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
          ) AND tb_21.ITEM_CATEGORY_ID = 6, 'NEED', 'NO NEED') AS Packaging_Waste

      FROM
          ITEM_MANUFACTURING tb_111
        LEFT JOIN
          ITEM_PRICE tb_222
          ON (tb_111.ITEM_ID = tb_222.ITEM_ID AND tb_222.INUSE = 1)
        LEFT JOIN
          ITEM_PRICE_SCT tb_333
          ON (tb_222.ITEM_PRICE_ID = tb_333.ITEM_PRICE_ID AND tb_333.INUSE = 1)
        LEFT JOIN
          SCT tb_2
          ON (tb_333.SCT_ID = tb_2.SCT_ID AND tb_2.INUSE = 1)
        LEFT JOIN
          PRODUCT_TYPE tb_444
          ON tb_2.PRODUCT_TYPE_ID = tb_444.PRODUCT_TYPE_ID
        LEFT JOIN
          SCT_PROGRESS_WORKING tb_3
          ON (tb_2.SCT_ID = tb_3.SCT_ID AND tb_3.INUSE = 1)
        LEFT JOIN
          PRODUCT_SUB tb_4
          ON tb_444.PRODUCT_SUB_ID = tb_4.PRODUCT_SUB_ID
        LEFT JOIN
          PRODUCT_MAIN tb_5
          ON tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
        LEFT JOIN
          PRODUCT_CATEGORY tb_6
          ON tb_5.PRODUCT_CATEGORY_ID = tb_6.PRODUCT_CATEGORY_ID
        LEFT JOIN
          PRODUCT_TYPE_ITEM_CATEGORY tb_7
          ON (tb_444.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID AND tb_7.INUSE = 1)
        LEFT JOIN
          ITEM_CATEGORY tb_8
          ON tb_7.ITEM_CATEGORY_ID = tb_8.ITEM_CATEGORY_ID
        LEFT JOIN
          SCT_BOM tb_9
          ON (tb_2.SCT_ID = tb_9.SCT_ID AND tb_9.INUSE = 1)
        LEFT JOIN
          BOM_FLOW_PROCESS_ITEM_USAGE tb_10
          ON (tb_9.BOM_ID = tb_10.BOM_ID AND tb_10.INUSE = 1)
        LEFT JOIN
          CUSTOMER_INVOICE_TO tb_11
          ON tb_2.CUSTOMER_INVOICE_TO_ID = tb_11.CUSTOMER_INVOICE_TO_ID
        LEFT JOIN
          ITEM_MANUFACTURING tb_12
          ON (tb_10.ITEM_ID = tb_12.ITEM_ID)
        LEFT JOIN
          SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_13
          ON (tb_10.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_13.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_2.SCT_ID = tb_13.SCT_ID AND tb_13.INUSE = 1)
        LEFT JOIN
          ITEM_PRICE_SCT tb_14
          ON (tb_13.ITEM_PRICE_ID = tb_14.ITEM_PRICE_ID AND tb_14.INUSE = 1)
        LEFT JOIN
          SCT tb_15
          ON (tb_14.SCT_ID = tb_15.SCT_ID AND tb_15.INUSE = 1)
        LEFT JOIN
          PRODUCT_TYPE tb_16
          ON tb_15.PRODUCT_TYPE_ID = tb_16.PRODUCT_TYPE_ID
        LEFT JOIN
          BOM tb_17
          ON (tb_9.BOM_ID = tb_17.BOM_ID AND tb_17.INUSE = 1)
        LEFT JOIN
          ITEM_MADE_BY tb_18
          ON (tb_12.ITEM_ID = tb_18.ITEM_ID AND tb_18.INUSE = 1 AND tb_18.MADE_BY_ID = 1)
        LEFT JOIN
          MADE_BY tb_19
          ON tb_18.MADE_BY_ID = tb_19.MADE_BY_ID
          LEFT JOIN
          BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_20
          ON (tb_10.BOM_ID = tb_20.BOM_ID AND tb_10.FLOW_PROCESS_ID = tb_20.FLOW_PROCESS_ID AND tb_10.ITEM_ID = tb_20.ITEM_ID AND tb_20.INUSE = 1)
        LEFT JOIN
          ITEM_CATEGORY tb_21
          ON tb_20.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID
        LEFT JOIN
          VENDOR tb_22
          ON (tb_12.VENDOR_ID = tb_22.VENDOR_ID)
        LEFT JOIN
          MAKER tb_23
          ON (tb_12.MAKER_ID = tb_23.MAKER_ID)
        LEFT JOIN
          ITEM tb_24
          ON (tb_10.ITEM_ID = tb_24.ITEM_ID)
        LEFT JOIN
          ITEM_CATEGORY tb_25
          ON tb_24.ITEM_CATEGORY_ID = tb_25.ITEM_CATEGORY_ID
      WHERE
          tb_3.SCT_STATUS_PROGRESS_ID = 7
        AND tb_111.INUSE = 1

      ORDER BY
        tb_2.SCT_ID, tb_10.BOM_FLOW_PROCESS_ITEM_USAGE_ID

    `

    // sql = sql.replaceAll('dataItem.sqlWhere', sqlWhere)
    // sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

    return sql
  },
  getItemDetailByItemIdForExport: async (dataItem: any) => {
    let sql = `
        SELECT
            tb_14.SCT_ID AS SCT_ID_SUB
          , tb_1.UPDATE_DATE
          , dataItem.PRODUCT_MAIN_ID_MAIN AS PRODUCT_MAIN_ID_MAIN
          , tb_1.SCT_CODE_FOR_SUPPORT_MES AS STANDARD_COST_CODE_SUB
          , tb_2.PRODUCT_TYPE_NAME AS PRODUCT_TYPE_NAME_SUB
          , tb_17.BOM_CODE
          , tb_12.ITEM_CODE_FOR_SUPPORT_MES AS M_CODE_MES
          , tb_21.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_FROM_BOM
          , tb_12.ITEM_EXTERNAL_FULL_NAME AS MATERIAL_EXTERNAL_FULL_NAME
          , tb_12.ITEM_EXTERNAL_SHORT_NAME AS MATERIAL_EXTERNAL_SHORT_NAME
          , '' AS PURCHASE_SPECIFICATION_NO
          , '' AS DRAWING_NO
          , tb_19.MADE_BY_NAME AS MADE_BY
          , tb_22.VENDOR_NAME
          , tb_23.MAKER_NAME
          , tb_25.ITEM_CATEGORY_NAME AS ITEM_CATEGORY_FROM_ITEM_MASTER
          , IF(1 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID_MAIN
            ), 'NEED', 'NO NEED') AS RoSH10
          , IF(2 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID_MAIN
            ), 'NEED', 'NO NEED') AS REACH
          , IF(3 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID_MAIN
            ), 'NEED', 'NO NEED') AS Green_NTT
          , IF(4 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID_MAIN
            ) AND tb_19.MADE_BY_ID = 11111111111111111, 'NEED', 'NO NEED') AS ChemSHERPA
          , IF(5 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID_MAIN
            ) AND tb_19.MADE_BY_ID = 1, 'NEED', 'NO NEED') AS Conflict_Minerals
          , IF(6 IN (
            SELECT
              ENVIRONMENT_CERTIFICATE_ID
            FROM
              PRODUCT_MAIN_ENVIRONMENT_CERTIFICATE tt
            WHERE
              tt.PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID_MAIN
            ) AND tb_21.ITEM_CATEGORY_ID = 6, 'NEED', 'NO NEED') AS Packaging_Waste

        FROM
          SCT tb_1
        LEFT JOIN
          PRODUCT_TYPE tb_2
          ON (tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID AND tb_1.INUSE = 1)
        LEFT JOIN
          SCT_PROGRESS_WORKING tb_3
          ON (tb_1.SCT_ID = tb_3.SCT_ID AND tb_3.INUSE = 1)
        LEFT JOIN
          PRODUCT_SUB tb_4
          ON tb_2.PRODUCT_SUB_ID = tb_4.PRODUCT_SUB_ID
        LEFT JOIN
          PRODUCT_MAIN tb_5
          ON tb_4.PRODUCT_MAIN_ID = tb_5.PRODUCT_MAIN_ID
        LEFT JOIN
          PRODUCT_CATEGORY tb_6
          ON tb_5.PRODUCT_CATEGORY_ID = tb_6.PRODUCT_CATEGORY_ID
        LEFT JOIN
          PRODUCT_TYPE_ITEM_CATEGORY tb_7
          ON tb_2.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
        LEFT JOIN
          ITEM_CATEGORY tb_8
          ON tb_7.ITEM_CATEGORY_ID = tb_8.ITEM_CATEGORY_ID
        LEFT JOIN
          SCT_BOM tb_9
          ON (tb_1.SCT_ID = tb_9.SCT_ID)
        LEFT JOIN
          BOM_FLOW_PROCESS_ITEM_USAGE tb_10
          ON (tb_9.BOM_ID = tb_10.BOM_ID AND tb_10.INUSE = 1)
        LEFT JOIN
          CUSTOMER_INVOICE_TO tb_11
          ON tb_1.CUSTOMER_INVOICE_TO_ID = tb_11.CUSTOMER_INVOICE_TO_ID
        LEFT JOIN
          ITEM_MANUFACTURING tb_12
          ON (tb_10.ITEM_ID = tb_12.ITEM_ID)
        LEFT JOIN
          SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE tb_13
          ON (tb_10.BOM_FLOW_PROCESS_ITEM_USAGE_ID = tb_13.BOM_FLOW_PROCESS_ITEM_USAGE_ID AND tb_1.SCT_ID = tb_13.SCT_ID AND tb_13.INUSE = 1)
        LEFT JOIN
          ITEM_PRICE_SCT tb_14
          ON (tb_13.ITEM_PRICE_ID = tb_14.ITEM_PRICE_ID AND tb_14.INUSE = 1)
        LEFT JOIN
          SCT tb_15
          ON (tb_14.SCT_ID = tb_15.SCT_ID)
        LEFT JOIN
          PRODUCT_TYPE tb_16
          ON tb_15.PRODUCT_TYPE_ID = tb_16.PRODUCT_TYPE_ID
        LEFT JOIN
          BOM tb_17
          ON (tb_9.BOM_ID = tb_17.BOM_ID AND tb_17.INUSE = 1)
        LEFT JOIN
          ITEM_MADE_BY tb_18
          ON (tb_12.ITEM_ID = tb_18.ITEM_ID AND tb_18.INUSE = 1)
        LEFT JOIN
          MADE_BY tb_19
          ON tb_18.MADE_BY_ID = tb_19.MADE_BY_ID
        LEFT JOIN
          BOM_FLOW_PROCESS_ITEM_CHANGE_ITEM_CATEGORY tb_20
          ON (tb_10.BOM_ID = tb_20.BOM_ID AND tb_10.FLOW_PROCESS_ID = tb_20.FLOW_PROCESS_ID AND tb_10.ITEM_ID = tb_20.ITEM_ID AND tb_20.INUSE = 1)
        LEFT JOIN
          ITEM_CATEGORY tb_21
          ON tb_20.ITEM_CATEGORY_ID = tb_21.ITEM_CATEGORY_ID
        LEFT JOIN
          VENDOR tb_22
          ON (tb_12.VENDOR_ID = tb_22.VENDOR_ID)
        LEFT JOIN
          MAKER tb_23
          ON (tb_12.MAKER_ID = tb_23.MAKER_ID)
        LEFT JOIN
          ITEM tb_24
          ON (tb_10.ITEM_ID = tb_24.ITEM_ID)
        LEFT JOIN
          ITEM_CATEGORY tb_25
          ON tb_24.ITEM_CATEGORY_ID = tb_25.ITEM_CATEGORY_ID
        WHERE
              tb_2.INUSE = 1
          AND tb_1.SCT_ID = dataItem.SCT_ID_SUB

          ORDER BY
            tb_10.BOM_FLOW_PROCESS_ITEM_USAGE_ID
    `

    sql = sql.replaceAll('dataItem.SCT_ID_SUB', dataItem['SCT_ID_SUB'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID_MAIN', dataItem['PRODUCT_MAIN_ID_MAIN'])

    return sql
  },
}
