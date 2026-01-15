export const ProductTypeBomNewSQL = {
  updateProductTypeBom: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_TYPE_BOM
                            SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                  , BOM_ID = dataItem.BOM_ID
                                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                                  , UPDATE_DATE = CURRENT_TIMESTAMP()
                          WHERE
                                  PRODUCT_TYPE_BOM_ID = 'dataItem.PRODUCT_TYPE_BOM_ID'
    `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_BOM_ID', dataItem['PRODUCT_TYPE_BOM_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'] != '' ? "'" + dataItem['BOM_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductTypeBom', sql)
    return sql
  },

  createProductTypeBomId: async () => {
    let sql = `  SET @productTypeBomId =(1 + coalesce((SELECT max(PRODUCT_TYPE_BOM_ID)
          FROM PRODUCT_TYPE_BOM), 0)) ; `
    //     //console.log('CreateId', sql)
    return sql
  },
  createProductTypeBomForNewType: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_BOM
                      (
                          PRODUCT_TYPE_BOM_ID
                        , PRODUCT_TYPE_ID
                        , BOM_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeBomId
                            , @productTypeId
                            , dataItem.BOM_ID
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `

    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'] != '' ? "'" + dataItem['BOM_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeBomForNewType' + sql)
    return sql
  },
  createProductTypeBom: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_BOM
                      (
                          PRODUCT_TYPE_BOM_ID
                        , PRODUCT_TYPE_ID
                        , BOM_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeBomId
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , dataItem.BOM_ID
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.BOM_ID', dataItem['BOM_ID'] != '' ? "'" + dataItem['BOM_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeBom' + sql)

    return sql
  },
  getBomByLikeProductTypeId: async (dataItem: any) => {
    let sql = `
              SELECT
                        tb_1.PRODUCT_TYPE_BOM_ID
                      , tb_1.PRODUCT_TYPE_ID
                      , tb_3.PRODUCT_TYPE_NAME
                      , tb_3.PRODUCT_TYPE_CODE
                      , tb_2.BOM_ID
                      , tb_2.BOM_NAME
                      , tb_2.BOM_CODE

              FROM
                      PRODUCT_TYPE_BOM tb_1
              INNER JOIN
                      BOM tb_2 ON tb_1.BOM_ID  = tb_2.BOM_ID
              INNER JOIN
                      PRODUCT_TYPE tb_3 ON tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
              WHERE
                      tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
              AND tb_2.PRODUCT_TYPE_STATUS_WORKING_ID = '1'
                          AND tb_1.INUSE = 1

                            `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
  exportToFile: async (dataItem: any) => {
    let sql = `
                SELECT
               tb_1.PRODUCT_TYPE_CODE_FOR_SCT AS 'Main'
              , tb_1.PRODUCT_TYPE_CODE_FOR_SCT AS 'SCT Code'
              , tb_11.BOM_CODE AS 'BOM Code'
              , tb_11.BOM_NAME AS 'BOM Name'
              , tb_12.FLOW_CODE AS 'Flow Code'
              , tb_12.FLOW_NAME AS 'Flow Name'
              , tb_6.ITEM_CATEGORY_NAME AS 'Item Category'
              , tb_4.PRODUCT_CATEGORY_NAME AS 'Product Category'
              , tb_3.PRODUCT_MAIN_NAME AS 'Product Main'
              , tb_2.PRODUCT_SUB_NAME AS 'Product Sub'
              , tb_1.PRODUCT_TYPE_NAME AS 'Product Type'
              , tb_14.CUSTOMER_INVOICE_TO_ALPHABET AS 'Customer Invoice To Alphabet'
              , tb_9.PRODUCT_SPECIFICATION_TYPE_NAME AS 'Product Specification Type Name'
              , DATE_FORMAT(tb_1.UPDATE_DATE ,'%d-%b-%Y') AS 'Modified Date'
              , tb_1.UPDATE_BY AS 'Modified By'


               FROM PRODUCT_TYPE tb_1
                JOIN PRODUCT_SUB tb_2 ON tb_1.PRODUCT_SUB_ID = tb_2.PRODUCT_SUB_ID
                JOIN PRODUCT_MAIN tb_3 ON tb_3.PRODUCT_MAIN_ID = tb_2.PRODUCT_MAIN_ID
                JOIN PRODUCT_CATEGORY tb_4 ON tb_4.PRODUCT_CATEGORY_ID = tb_3.PRODUCT_CATEGORY_ID
                JOIN PRODUCT_TYPE_ITEM_CATEGORY tb_5 ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                JOIN ITEM_CATEGORY tb_6 ON tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID
                JOIN PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_7 ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
                JOIN PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_8 ON tb_8.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_7.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                JOIN PRODUCT_SPECIFICATION_TYPE tb_9  ON  tb_9.PRODUCT_SPECIFICATION_TYPE_ID = tb_8.PRODUCT_SPECIFICATION_TYPE_ID
                LEFT JOIN PRODUCT_TYPE_BOM tb_10 ON tb_10.PRODUCT_TYPE_ID  = tb_1.PRODUCT_TYPE_ID
                LEFT JOIN BOM tb_11 ON tb_11.BOM_ID = tb_10.BOM_ID
                LEFT JOIN FLOW tb_12 ON tb_12.FLOW_ID = tb_11.FLOW_ID
                LEFT JOIN PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_13 ON tb_1.PRODUCT_TYPE_ID = tb_13.PRODUCT_TYPE_ID AND tb_13.INUSE = 1
                LEFT JOIN CUSTOMER_INVOICE_TO tb_14 ON tb_13.CUSTOMER_INVOICE_TO_ID = tb_14.CUSTOMER_INVOICE_TO_ID AND tb_14.INUSE = 1

                WHERE

                tb_1.PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'

                ORDER BY
                tb_1.PRODUCT_TYPE_CODE_FOR_SCT ASC

                   `
    // sql = sql.replaceAll('dataItem.STANDARD_COST_DB', process?.env?.STANDARD_COST_DB || '')
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    return sql
  },
  searchProductTypeBOMAllPage: async (dataItem: any) => {
    let sqlList = []

    let sql = `    SELECT COUNT(*) AS TOTAL_COUNT
           FROM  (
                    SELECT
                            dataItem.selectInuseForSearch
                    FROM
                            dataItem.sqlJoin
                            dataItem.sqlWhere
                            dataItem.sqlHaving

                    )  AS TB_COUNT;
                                    `

    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log(sql)
    sqlList.push(sql)

    sql = `
                                SELECT
                                      tb_4.PRODUCT_CATEGORY_ID
                                    , tb_4.PRODUCT_CATEGORY_NAME
                                    , tb_3.PRODUCT_MAIN_ID
                                    , tb_3.PRODUCT_MAIN_NAME
                                    , tb_2.PRODUCT_SUB_ID
                                    , tb_2.PRODUCT_SUB_NAME
                                    , tb_1.PRODUCT_TYPE_ID
                                    , tb_1.PRODUCT_TYPE_CODE
                                    , tb_1.PRODUCT_TYPE_CODE_FOR_SCT
                                    , tb_1.PRODUCT_TYPE_NAME
                                    , tb_5.ITEM_CATEGORY_ID
                                    , tb_6.ITEM_CATEGORY_NAME
                                    , tb_1.UPDATE_BY
                                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                    , dataItem.selectInuseForSearch
                                    , tb_11.BOM_ID
                                    , tb_11.BOM_CODE
                                    , tb_11.BOM_NAME
                                    , tb_13.FLOW_CODE
                                    , tb_13.FLOW_ID
                                    , tb_12.ACCOUNT_DEPARTMENT_CODE_ID
                                    , tb_12.ACCOUNT_DEPARTMENT_CODE
                                    , tb_12.ACCOUNT_DEPARTMENT_NAME
                                    , tb_14.CUSTOMER_INVOICE_TO_ID
                                    , tb_14.CUSTOMER_INVOICE_TO_ALPHABET
                                    , tb_14.CUSTOMER_INVOICE_TO_NAME
                                    , tb_17.PRODUCT_SPECIFICATION_TYPE_NAME
                                   

                                FROM
                                    dataItem.sqlJoin
                                    dataItem.sqlWhere
                                    dataItem.sqlHaving

                                    ORDER BY
                                        dataItem.Order

                                    `

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_NAME', dataItem['PRODUCT_TYPE_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE_FOR_SCT', dataItem['PRODUCT_TYPE_CODE_FOR_SCT'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    sql = sql.replaceAll('dataItem.PRODUCT_CATEGORY_ID', dataItem['PRODUCT_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SUB_ID', dataItem['PRODUCT_SUB_ID'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])

    sqlList.push(sql)

    return sqlList
  },
}
