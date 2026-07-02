export const ProductTypeItemCategorySQL = {
  updateProductTypeItemCategory: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_TYPE_ITEM_CATEGORY
                            SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                  , ITEM_CATEGORY_ID = dataItem.ITEM_CATEGORY_ID
                                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                                  , UPDATE_DATE = CURRENT_TIMESTAMP()
                          WHERE
                                  PRODUCT_TYPE_ITEM_CATEGORY_ID = 'dataItem.PRODUCT_TYPE_ITEM_CATEGORY_ID'
    `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ITEM_CATEGORY_ID', dataItem['PRODUCT_TYPE_ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'] != '' ? "'" + dataItem['ITEM_CATEGORY_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductTypeItemCategory', sql)
    return sql
  },

  createProductTypeItemCategoryId: async () => {
    let sql = `  SET @productTypeItemCategoryId =(1 + coalesce((SELECT max(PRODUCT_TYPE_ITEM_CATEGORY_ID)
              FROM PRODUCT_TYPE_ITEM_CATEGORY), 0)) ; `
    //console.log('productTypeItemCategoryId', sql)
    return sql
  },
  createProductTypeItemCategoryForNewType: async (dataItem: any) => {
    let sql = `
                        INSERT INTO PRODUCT_TYPE_ITEM_CATEGORY
                          (
                              PRODUCT_TYPE_ITEM_CATEGORY_ID
                            , PRODUCT_TYPE_ID
                            , ITEM_CATEGORY_ID
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                          )
                            SELECT
                                  @productTypeItemCategoryId
                                , @productTypeId
                                , dataItem.ITEM_CATEGORY_ID
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                          `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'] != '' ? "'" + dataItem['ITEM_CATEGORY_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeItemCategoryForNewType', sql)
    return sql
  },
  createProductTypeItemCategory: async (dataItem: any) => {
    let sql = `
                        INSERT INTO PRODUCT_TYPE_ITEM_CATEGORY
                          (
                              PRODUCT_TYPE_ITEM_CATEGORY_ID
                            , PRODUCT_TYPE_ID
                            , ITEM_CATEGORY_ID
                            , CREATE_BY
                            , UPDATE_DATE
                            , UPDATE_BY
                          )
                            SELECT
                                  @productTypeItemCategoryId
                                , 'dataItem.PRODUCT_TYPE_ID'
                                , dataItem.ITEM_CATEGORY_ID
                                , 'dataItem.CREATE_BY'
                                , CURRENT_TIMESTAMP()
                                , 'dataItem.CREATE_BY'
                          `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'] != '' ? "'" + dataItem['ITEM_CATEGORY_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // console.log('createProductTypeItemCategory', sql)
    return sql
  },
}
