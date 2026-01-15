export const ItemProductDetailSQL = {
  getByItemId: async (dataItem: any) => {
    let sql = `             SELECT
                                          tb_1.PRODUCT_TYPE_ID
                                        , tb_3.PRODUCT_SUB_ID
                                        , tb_4.PRODUCT_MAIN_ID
                                        , tb_5.PRODUCT_CATEGORY_ID
                                        , tb_2.PRODUCT_TYPE_NAME
                                        , tb_2.PRODUCT_TYPE_CODE_FOR_SCT AS PRODUCT_TYPE_CODE
                                        , tb_3.PRODUCT_SUB_NAME
                                        , tb_4.PRODUCT_MAIN_NAME
                                        , tb_4.PRODUCT_MAIN_ALPHABET
                                        , tb_5.PRODUCT_CATEGORY_NAME
                                        , tb_1.ITEM_ID
                                        , tb_6.ITEM_CATEGORY_ID
                                        , tb_3.PRODUCT_SUB_ALPHABET
                                        , tb_7.ITEM_CATEGORY_ALPHABET
                                        , tb_7.ITEM_CATEGORY_NAME

                            FROM
                                      ITEM_PRODUCT_DETAIL tb_1
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
                                            ON tb_2.PRODUCT_TYPE_ID = tb_6.PRODUCT_TYPE_ID
                                            AND tb_6.INUSE = 1
                                            INNER JOIN
                                      ITEM_CATEGORY tb_7
                                                ON tb_6.ITEM_CATEGORY_ID = tb_7.ITEM_CATEGORY_ID
                            WHERE
                                          tb_1.ITEM_ID = 'dataItem.ITEM_ID'
                                      AND tb_1.INUSE = 1
                  `

    sql = sql.replaceAll('dataItem.ITEM_ID', dataItem['ITEM_ID'])

    return sql
  },
  createItemProductDetailByProductType: async (dataItem: any) => {
    let sql = `
                      INSERT INTO ITEM_PRODUCT_DETAIL
                      (
                            ITEM_PRODUCT_DETAIL_ID
                          , ITEM_ID
                          , PRODUCT_TYPE_ID
                          , WORK_ORDER_ID
                          , PART_NO_ID
                          , SPECIFICATION_ID
                          , CUSTOMER_ORDER_FROM_ID
                          , CREATE_BY
                          , UPDATE_DATE
                          , UPDATE_BY
                      )
                      SELECT
                             1 + coalesce((SELECT max(ITEM_PRODUCT_DETAIL_ID) FROM ITEM_PRODUCT_DETAIL), 0)
                          ,  @itemId
                          ,  @productTypeId
                          , dataItem.WORK_ORDER_ID
                          , dataItem.PART_NO_ID
                          , dataItem.SPECIFICATION_ID
                          , dataItem.CUSTOMER_ORDER_FROM_ID
                          , 'dataItem.CREATE_BY'
                          , CURRENT_TIMESTAMP()
                          , 'dataItem.CREATE_BY'
                      ;
                                  `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    sql = sql.replaceAll('dataItem.WORK_ORDER_ID', dataItem['WORK_ORDER_ID'] != '' ? "'" + dataItem['WORK_ORDER_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PART_NO_ID', dataItem['PART_NO_ID'] != '' ? "'" + dataItem['PART_NO_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.SPECIFICATION_ID', dataItem['SPECIFICATION_ID'] != '' ? "'" + dataItem['SPECIFICATION_ID'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'] != '' ? "'" + dataItem['CUSTOMER_ORDER_FROM_ID'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  createItemProductDetail: async (dataItem: any) => {
    let sql = `  
                    INSERT INTO ITEM_PRODUCT_DETAIL
                    (
                          ITEM_PRODUCT_DETAIL_ID
                        , ITEM_ID
                        , PRODUCT_TYPE_ID
                        , WORK_ORDER_ID
                        , PART_NO_ID
                        , SPECIFICATION_ID
                        , CUSTOMER_ORDER_FROM_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                    )                   
                    SELECT
                           1 + coalesce((SELECT max(ITEM_PRODUCT_DETAIL_ID) FROM ITEM_PRODUCT_DETAIL), 0)
                        ,  @itemId
                        , 'dataItem.PRODUCT_TYPE_ID'
                        , dataItem.WORK_ORDER_ID
                        , dataItem.PART_NO_ID
                        , dataItem.SPECIFICATION_ID
                        , dataItem.CUSTOMER_ORDER_FROM_ID                                            
                        , 'dataItem.CREATE_BY'
                        , CURRENT_TIMESTAMP()
                        , 'dataItem.CREATE_BY'
                    ;                               
                                `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])

    sql = sql.replaceAll('dataItem.WORK_ORDER_ID', dataItem['WORK_ORDER_ID'] != '' ? "'" + dataItem['WORK_ORDER_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PART_NO_ID', dataItem['PART_NO_ID'] != '' ? "'" + dataItem['PART_NO_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.SPECIFICATION_ID', dataItem['SPECIFICATION_ID'] != '' ? "'" + dataItem['SPECIFICATION_ID'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'] != '' ? "'" + dataItem['CUSTOMER_ORDER_FROM_ID'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
}
