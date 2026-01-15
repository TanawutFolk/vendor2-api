export const ProductItemSQL = {
  createByProductTypeId_VariableWithoutProductItemCode: async (dataItem: any) => {
    let sql = `
                      INSERT INTO PRODUCT_ITEM
                        (
                            PRODUCT_ITEM_ID
                          , PRODUCT_TYPE_ID
                          , PRODUCT_ITEM_NAME
                          , CREATE_BY
                          , UPDATE_DATE
                          , UPDATE_BY
                          , INUSE
                        )
                          SELECT
                                (1 + coalesce((SELECT max(PRODUCT_ITEM_ID) FROM PRODUCT_ITEM), 0))
                              , @productTypeId
                              , 'dataItem.PRODUCT_ITEM_NAME'
                              , 'dataItem.CREATE_BY'
                              , CURRENT_TIMESTAMP()
                              , 'dataItem.UPDATE_BY'
                              , 'dataItem.INUSE'
                        `
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createByProductTypeId_Variable', sql)
    return sql
  },

  createByProductTypeId_DuplicateProductType: async (dataItem: any) => {
    let sql = `
                      INSERT INTO PRODUCT_ITEM
                        (
                            PRODUCT_ITEM_ID
                          , PRODUCT_TYPE_ID
                          , PRODUCT_ITEM_CODE
                          , PRODUCT_ITEM_NAME
                          , CREATE_BY
                          , UPDATE_DATE
                          , UPDATE_BY
                          , INUSE
                        )
                          SELECT
                                (1 + coalesce((SELECT max(PRODUCT_ITEM_ID) FROM PRODUCT_ITEM), 0))
                              , @productTypeId
                              , CONCAT('dataItem.PRODUCT_TYPE_CODE', 'dataItem.productItemCodeSuffixManual')
                              , 'dataItem.PRODUCT_ITEM_NAME'
                              , 'dataItem.CREATE_BY'
                              , CURRENT_TIMESTAMP()
                              , 'dataItem.UPDATE_BY'
                              , 'dataItem.INUSE'
                        `

    sql = sql.replaceAll('dataItem.productItemCodeSuffixManual', dataItem['productItemCodeSuffixManual'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createByProductTypeId_DuplicateProductType', sql)
    return sql
  },
  createByProductTypeId_Variable: async (dataItem: any) => {
    let sql = `
                      INSERT INTO PRODUCT_ITEM
                        (
                            PRODUCT_ITEM_ID
                          , PRODUCT_TYPE_ID
                          , PRODUCT_ITEM_CODE
                          , PRODUCT_ITEM_NAME
                          , CREATE_BY
                          , UPDATE_DATE
                          , UPDATE_BY
                          , INUSE
                        )
                          SELECT
                                (1 + coalesce((SELECT max(PRODUCT_ITEM_ID) FROM PRODUCT_ITEM), 0))
                              , @productTypeId
                              , CONCAT(@productTypeCode, 'dataItem.productItemCodeSuffixManual')
                              , 'dataItem.PRODUCT_ITEM_NAME'
                              , 'dataItem.CREATE_BY'
                              , CURRENT_TIMESTAMP()
                              , 'dataItem.UPDATE_BY'
                              , 'dataItem.INUSE'
                        `

    sql = sql.replaceAll('dataItem.productItemCodeSuffixManual', dataItem['productItemCodeSuffixManual'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createByProductTypeId_Variable', sql)
    return sql
  },
  createProductItemForNewType: async (dataItem: any) => {
    let sql = `
                      INSERT INTO PRODUCT_ITEM
                        (
                            PRODUCT_ITEM_ID
                          , PRODUCT_TYPE_ID
                          , PRODUCT_ITEM_CODE
                          , PRODUCT_ITEM_NAME
                          , CREATE_BY
                          , UPDATE_DATE
                          , UPDATE_BY
                        )
                          SELECT
                                @productItemId
                              , @productTypeId
                              , IF(@productTypeCodeForItem = '' OR 'dataItem.PRODUCT_ITEM_CODE' = '', '', CONCAT(@productTypeCodeForItem, 'dataItem.PRODUCT_ITEM_CODE'))
                              , 'dataItem.PRODUCT_ITEM_NAME'
                              , 'dataItem.CREATE_BY'
                              , CURRENT_TIMESTAMP()
                              , 'dataItem.CREATE_BY'
                        `

    // sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_CODE', dataItem['PRODUCT_ITEM_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductItem', sql)
    return sql
  },
  createProductItemWithoutProductItem: async (dataItem: any) => {
    let sql = `
                      INSERT INTO PRODUCT_ITEM
                        (
                            PRODUCT_ITEM_ID
                          , PRODUCT_TYPE_ID
                          , PRODUCT_ITEM_NAME
                          , CREATE_BY
                          , UPDATE_DATE
                          , UPDATE_BY
                        )
                          SELECT
                                @productItemId
                              ,'dataItem.PRODUCT_TYPE_ID'
                              , 'dataItem.PRODUCT_ITEM_NAME'
                              , 'dataItem.CREATE_BY'
                              , CURRENT_TIMESTAMP()
                              , 'dataItem.CREATE_BY'
                        `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductItem', sql)
    return sql
  },
  createProductItem: async (dataItem: any) => {
    let sql = `
                      INSERT INTO PRODUCT_ITEM
                        (
                            PRODUCT_ITEM_ID
                          , PRODUCT_TYPE_ID
                          , PRODUCT_ITEM_CODE
                          , PRODUCT_ITEM_NAME
                          , CREATE_BY
                          , UPDATE_DATE
                          , UPDATE_BY
                        )
                          SELECT
                                @productItemId
                              ,'dataItem.PRODUCT_TYPE_ID'
                              , IF(@productTypeCodeForItem = '' OR 'dataItem.PRODUCT_ITEM_CODE' = '', '', CONCAT(@productTypeCodeForItem, 'dataItem.PRODUCT_ITEM_CODE'))
                              , 'dataItem.PRODUCT_ITEM_NAME'
                              , 'dataItem.CREATE_BY'
                              , CURRENT_TIMESTAMP()
                              , 'dataItem.CREATE_BY'
                        `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_CODE', dataItem['PRODUCT_ITEM_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductItem', sql)
    return sql
  },
  create: async (dataItem: any) => {
    let sql = `
                      INSERT INTO PRODUCT_ITEM
                        (
                            PRODUCT_ITEM_ID
                          , PRODUCT_TYPE_ID
                          , PRODUCT_ITEM_CODE
                          , PRODUCT_ITEM_NAME
                          , CREATE_BY
                          , UPDATE_DATE
                          , UPDATE_BY
                          , INUSE
                        )
                          SELECT
                                (1 + coalesce((SELECT max(PRODUCT_ITEM_ID) FROM PRODUCT_ITEM), 0))
                              , dataItem.PRODUCT_TYPE_ID
                              , CONCAT(dataItem.PRODUCT_TYPE_CODE, 'dataItem.productItemCodeSuffixManual')
                              , 'dataItem.PRODUCT_ITEM_NAME'
                              , 'dataItem.CREATE_BY'
                              , CURRENT_TIMESTAMP()
                              , 'dataItem.UPDATE_BY'
                              , 'dataItem.INUSE'
                        `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_CODE', dataItem['PRODUCT_TYPE_CODE'])

    sql = sql.replaceAll('dataItem.productItemCodeSuffixManual', dataItem['productItemCodeSuffixManual'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('createProductItem', sql)
    return sql
  },
  createProductItemId: async () => {
    let sql = `  SET @productItemId =(1 + coalesce((SELECT max(PRODUCT_ITEM_ID)
            FROM PRODUCT_ITEM), 0)) ; `
    // console.log('createProductItemId', sql)
    return sql
  },
  createProductTypeCodeForItemNewType: async () => {
    let sql = `
        SET @productTypeCodeForItem = (SELECT PRODUCT_TYPE_CODE FROM PRODUCT_TYPE
      WHERE PRODUCT_TYPE_ID = @productTypeId
    );
        `
    // sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    // console.log('createProductTypeCodeForItemNewType', sql)
    return sql
  },
  createProductTypeCodeForItem: async (dataItem: any) => {
    let sql = `
        SET @productTypeCodeForItem = (SELECT PRODUCT_TYPE_CODE FROM PRODUCT_TYPE
      WHERE PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
    );
        `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    //console.log('createProductTypeCodeForItem', sql)
    return sql
  },
  // createProductTypeCodeForItem: async dataItem => {
  //   let sql = `
  //       SET @productTypeCodeForItem = (SELECT PRODUCT_TYPE_CODE FROM PRODUCT_TYPE
  //     WHERE PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
  //   );
  //       `
  //   sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
  //   //console.log('createProductTypeCodeForItem', sql)
  //   return sql
  // },
  updateProductItemWithoutProductItem: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_ITEM
                          SET
                                 PRODUCT_ITEM_NAME = 'dataItem.PRODUCT_ITEM_NAME'
                                , PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                PRODUCT_ITEM_ID = 'dataItem.PRODUCT_ITEM_ID'
  `
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_ID', dataItem['PRODUCT_ITEM_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductItem', sql)
    return sql
  },
  updateProductItem: async (dataItem: any) => {
    let sql = `UPDATE PRODUCT_ITEM
              SET PRODUCT_ITEM_CODE = IF(@productTypeCodeForItem = '' OR 'dataItem.PRODUCT_ITEM_CODE' = '', '', CONCAT(@productTypeCodeForItem, 'dataItem.PRODUCT_ITEM_CODE'))
              , PRODUCT_ITEM_NAME = 'dataItem.PRODUCT_ITEM_NAME'
              , PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
              , UPDATE_BY = 'dataItem.UPDATE_BY'
              , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
              PRODUCT_ITEM_ID = 'dataItem.PRODUCT_ITEM_ID'
  `
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_ID', dataItem['PRODUCT_ITEM_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_CODE', dataItem['PRODUCT_ITEM_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_ITEM_NAME', dataItem['PRODUCT_ITEM_NAME'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductItem', sql)
    return sql
  },
  CheckProductItem_condition: async (dataItem: any) => {
    let sql = `
          SELECT
                tb_1.PRODUCT_ITEM_CODE

          FROM
                  PRODUCT_ITEM tb_1
          INNER JOIN
                  PRODUCT_TYPE_ITEM_CATEGORY tb_2
          ON  tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
              AND tb_1.INUSE = 1
              AND tb_2.INUSE = 1
          INNER JOIN
                  PRODUCT_TYPE_DETAIL tb_3
          ON  tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
              AND tb_3.INUSE = 1
          INNER JOIN
              PRODUCT_TYPE_BOI tb_4
          ON  tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
              AND tb_4.INUSE = 1
          INNER JOIN
              PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_5
          ON  tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID AND tb_5.INUSE = 1
          INNER JOIN
              PRODUCT_TYPE_BOI tb_6
          ON  tb_1.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID AND tb_6.INUSE = 1
          INNER JOIN
              PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_7
          ON  tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
              AND tb_7.INUSE = 1
          INNER JOIN
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_8
          ON tb_7.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_8.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_7.INUSE =1
          INNER JOIN
              PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_9
                                                on
                                                       tb_8.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID and tb_9.INUSE =1
                                INNER JOIN
                                                PRODUCT_TYPE tb_10
                                                on
                                                       tb_1.PRODUCT_TYPE_ID = tb_10.PRODUCT_TYPE_ID and tb_10.INUSE =1
                  WHERE
                      tb_1.PRODUCT_TYPE_CODE = IF(@productTypeCodeForItem = '' OR 'dataItem.PRODUCT_ITEM_CODE' = '', ''
                      , CONCAT(@productTypeCodeForItem, 'dataItem.PRODUCT_ITEM_CODE'))
                `
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'] != '' ? "'" + dataItem['ITEM_CATEGORY_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'] != '' ? "'" + dataItem['ACCOUNT_DEPARTMENT_CODE_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE', dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'] != '' ? "'" + dataItem['CUSTOMER_INVOICE_TO_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'] != '' ? "'" + dataItem['IS_BOI'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] != '' ? "'" + dataItem['INUSE'] + "'" : 'NULL')
    // console.log('getByProductItem_condition', sql)

    return sql
  },
  getByProductItem_condition: async (dataItem: any) => {
    let sql = `
                               SELECT
                                                  tb_1.PRODUCT_ITEM_ID
                                                , tb_1.PRODUCT_ITEM_NAME
                                                , tb_1.PRODUCT_ITEM_CODE
                                                , tb_7.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                                , tb_10.PRODUCT_TYPE_ID
                                                , tb_10.PRODUCT_TYPE_NAME
                                                , tb_10.PRODUCT_TYPE_CODE
                                FROM
                                                PRODUCT_ITEM tb_1
                                INNER JOIN
                                                PRODUCT_TYPE_ITEM_CATEGORY tb_2
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_2.PRODUCT_TYPE_ID
                                                        AND tb_1.INUSE = 1
                                                        AND tb_2.INUSE = 1
                                INNER JOIN
                                                PRODUCT_TYPE_DETAIL tb_3
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_3.PRODUCT_TYPE_ID
                                                        AND tb_3.INUSE = 1
                                INNER JOIN
                                                PRODUCT_TYPE_BOI tb_4
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_4.PRODUCT_TYPE_ID
                                                        AND tb_4.INUSE = 1
                                INNER JOIN
                                                PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_5
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID AND tb_5.INUSE = 1
                                INNER JOIN
                                                PRODUCT_TYPE_BOI tb_6
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID AND tb_6.INUSE = 1
                                INNER JOIN
                                                PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_7
                                                        ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
                                                        AND tb_7.INUSE = 1
                                INNER JOIN
                                                PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_8
                                                	    ON tb_7.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_8.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID and tb_7.INUSE =1
                                INNER JOIN
                                                PRODUCT_MAIN_ACCOUNT_DEPARTMENT_CODE tb_9
                                                on
                                                       tb_8.PRODUCT_MAIN_ID = tb_9.PRODUCT_MAIN_ID and tb_9.INUSE =1
                                INNER JOIN
                                                PRODUCT_TYPE tb_10
                                                on
                                                       tb_1.PRODUCT_TYPE_ID = tb_10.PRODUCT_TYPE_ID and tb_10.INUSE =1
                                WHERE
                                                   tb_2.ITEM_CATEGORY_ID = dataItem.ITEM_CATEGORY_ID
                                                AND tb_9.ACCOUNT_DEPARTMENT_CODE_ID = dataItem.ACCOUNT_DEPARTMENT_CODE_ID
                                                AND tb_3.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE = 'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'
                                                AND tb_3.FFT_PART_NUMBER = 'dataItem.FFT_PART_NUMBER'
                                                AND tb_6.IS_BOI = dataItem.IS_BOI
                                                AND tb_5.CUSTOMER_INVOICE_TO_ID = dataItem.CUSTOMER_INVOICE_TO_ID
                `
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'] != '' ? "'" + dataItem['ITEM_CATEGORY_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'] != '' ? "'" + dataItem['ACCOUNT_DEPARTMENT_CODE_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE', dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.CUSTOMER_INVOICE_TO_ID', dataItem['CUSTOMER_INVOICE_TO_ID'] != '' ? "'" + dataItem['CUSTOMER_INVOICE_TO_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.IS_BOI', dataItem['IS_BOI'] != '' ? "'" + dataItem['IS_BOI'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] != '' ? "'" + dataItem['INUSE'] + "'" : 'NULL')
    // console.log('getByProductItem_condition', sql)

    return sql
  },
}
