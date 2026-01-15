export const ProductTypeProductSpecSQL = {
  createByProductTypeId_VariableAndProductSpecificationDocumentId_Variable: async (dataItem: any) => {
    let sql = `    INSERT INTO PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING
                    (
                          PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                        , PRODUCT_TYPE_ID
                        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                        , INUSE
                    )
                        SELECT
                              1 + coalesce((SELECT max(PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID) FROM PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING), 0)
                            ,  @productTypeId
                            ,  @productSpecificationDocumentSettingId
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.UPDATE_BY'
                            ,  1
                  `

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  createByProductTypeId_Variable: async (dataItem: any) => {
    let sql = `    INSERT INTO PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING
                    (
                          PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                        , PRODUCT_TYPE_ID
                        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                        , INUSE
                    )
                        SELECT
                              1 + coalesce((SELECT max(PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID) FROM PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING), 0)
                            ,  @productTypeId
                            ,  'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.UPDATE_BY'
                            ,  1
                  `
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  createByProductTypeId_VariableAndProductSpecificationDocumentId_ForProductType: async (dataItem: any) => {
    let sql = `    INSERT INTO PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING
                    (
                          PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                        , PRODUCT_TYPE_ID
                        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                        , INUSE
                    )
                        SELECT
                              1 + coalesce((SELECT max(PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID) FROM PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING), 0)
                            ,  @productTypeId
                            , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'
                            , 'dataItem.CREATE_BY'
                            ,  CURRENT_TIMESTAMP()
                            , 'dataItem.UPDATE_BY'
                            ,  1
                  `

    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
}
