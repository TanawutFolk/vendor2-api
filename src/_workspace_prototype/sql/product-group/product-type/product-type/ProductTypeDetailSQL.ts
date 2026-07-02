export const ProductTypeDetailSQL = {
  updateProductTypeDetailWhenNotRepair: async (dataItem: any) => {
    let sql = `

                      UPDATE     PRODUCT_TYPE_DETAIL
                                SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                      , PC_NAME = 'dataItem.PC_NAME'
                                      , FFT_PART_NUMBER = null
                                      , IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE = 'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'
                                      , SUFFIX_FOR_PART_NUMBER = 'dataItem.SUFFIX_FOR_PART_NUMBER'
                                      , UPDATE_BY = 'dataItem.UPDATE_BY'
                                      , UPDATE_DATE = CURRENT_TIMESTAMP()
                              WHERE
                                      PRODUCT_TYPE_DETAIL_ID = 'dataItem.PRODUCT_TYPE_DETAIL_ID'
                          `
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE', dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_DETAIL_ID', dataItem['PRODUCT_TYPE_DETAIL_ID'])
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    //     //console.log('PRODUCT_PART_NUMBER', dataItem.PRODUCT_PART_NUMBER)
    // console.log('updateProductTypeDetailWhenNotRepair', sql)
    return sql
  },

  updateProductTypeDetail: async (dataItem: any) => {
    let sql = `        UPDATE     PRODUCT_TYPE_DETAIL
                            SET     PRODUCT_TYPE_ID = 'dataItem.PRODUCT_TYPE_ID'
                                  , PC_NAME = 'dataItem.PC_NAME'
                                  , FFT_PART_NUMBER = 'dataItem.FFT_PART_NUMBER'
                                  , IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE = 'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'
                                  , IS_PRODUCT_FOR_REPAIR = 'dataItem.IS_PRODUCT_FOR_REPAIR'
                                  , SUFFIX_FOR_PART_NUMBER = 'dataItem.SUFFIX_FOR_PART_NUMBER'
                                  , UPDATE_BY = 'dataItem.UPDATE_BY'
                                  , UPDATE_DATE = CURRENT_TIMESTAMP()
                          WHERE
                                  PRODUCT_TYPE_DETAIL_ID = 'dataItem.PRODUCT_TYPE_DETAIL_ID'
    `
    //     sql = sql.replaceAll(
    //       'dataItem.suffixForFftPartNumber',
    //       dataItem['IS_PRODUCT_FOR_REPAIR'] === '0' ? '' : '(' + dataItem.SUFFIX_FOR_PART_NUMBER + ')'
    //     )
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_DETAIL_ID', dataItem['PRODUCT_TYPE_DETAIL_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE', dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_FOR_REPAIR', dataItem['IS_PRODUCT_FOR_REPAIR'])

    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductTypeDetail', sql)
    return sql
  },

  createProductTypeDetailId: async () => {
    let sql = `  SET @productTypeDetailId =(1 + coalesce((SELECT max(PRODUCT_TYPE_DETAIL_ID)
          FROM PRODUCT_TYPE_DETAIL), 0)) ; `
    // console.log('createProductTypeDetailId', sql)
    return sql
  },
  createProductTypeDetailWhenNotRepairForNewType: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_DETAIL
                      (
                          PRODUCT_TYPE_DETAIL_ID
                        , PRODUCT_TYPE_ID
                        , PC_NAME
                        , IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                        , SUFFIX_FOR_PART_NUMBER
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeDetailId
                            , @productTypeId
                            , 'dataItem.PC_NAME'
                            , dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                            , 'dataItem.SUFFIX_FOR_PART_NUMBER'
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE', dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    //     //console.log('PRODUCT_PART_NUMBER', dataItem.PRODUCT_PART_NUMBER)
    // console.log('createProductTypeDetailWhenNotRepairForNewType', sql)
    return sql
  },
  createProductTypeDetailWhenNotRepair: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_DETAIL
                      (
                          PRODUCT_TYPE_DETAIL_ID
                        , PRODUCT_TYPE_ID
                        , PC_NAME
                        , IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                        , SUFFIX_FOR_PART_NUMBER
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeDetailId
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , 'dataItem.PC_NAME'
                            , dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                            , 'dataItem.SUFFIX_FOR_PART_NUMBER'
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll(
      'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE',
      dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] != '' ? "'" + dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] + "'" : 'NULL'
    )
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    //     //console.log('PRODUCT_PART_NUMBER', dataItem.PRODUCT_PART_NUMBER)
    // console.log('createProductTypeDetailWhenNotRepair', sql)
    return sql
  },

  createProductTypeDetailForNewType: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_DETAIL
                      (
                          PRODUCT_TYPE_DETAIL_ID
                        , PRODUCT_TYPE_ID
                        , PC_NAME
                        , FFT_PART_NUMBER
                        , IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                        , IS_PRODUCT_FOR_REPAIR
                        , SUFFIX_FOR_PART_NUMBER
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeDetailId
                            , @productTypeId
                            , 'dataItem.PC_NAME'
                            , 'dataItem.FFT_PART_NUMBER'
                            , dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                            , dataItem.IS_PRODUCT_FOR_REPAIR
                            , 'dataItem.SUFFIX_FOR_PART_NUMBER'
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll(
      'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE',
      dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] != '' ? "'" + dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'] + "'" : 'NULL'
    )
    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_FOR_REPAIR', dataItem['IS_PRODUCT_FOR_REPAIR'] != '' ? "'" + dataItem['IS_PRODUCT_FOR_REPAIR'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    //     //console.log('PRODUCT_PART_NUMBER', dataItem.PRODUCT_PART_NUMBER)
    // console.log('createProductTypeDetailForNewType', sql)
    return sql
  },
  createProductTypeDetail: async (dataItem: any) => {
    let sql = `
                    INSERT INTO PRODUCT_TYPE_DETAIL
                      (
                          PRODUCT_TYPE_DETAIL_ID
                        , PRODUCT_TYPE_ID
                        , PC_NAME
                        , FFT_PART_NUMBER
                        , IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE
                        , IS_PRODUCT_FOR_REPAIR
                        , SUFFIX_FOR_PART_NUMBER
                        , CREATE_BY
                        , UPDATE_DATE
                        , UPDATE_BY
                      )
                        SELECT
                              @productTypeDetailId
                            , 'dataItem.PRODUCT_TYPE_ID'
                            , 'dataItem.PC_NAME'
                            , 'dataItem.FFT_PART_NUMBER'
                            , 'dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'
                            , 'dataItem.IS_PRODUCT_FOR_REPAIR'
                            , 'dataItem.SUFFIX_FOR_PART_NUMBER'
                            , 'dataItem.CREATE_BY'
                            , CURRENT_TIMESTAMP()
                            , 'dataItem.CREATE_BY'
                      `
    //     sql = sql.replaceAll(
    //       'dataItem.pcNameCode',
    //       dataItem['ITEM_CATEGORY_ALPHABET'] === null ? '' : '_' + dataItem.PC_NAME
    //     )
    //     sql = sql.replaceAll(
    //       'dataItem.suffixForFftPartNumber',
    //       dataItem['IS_PRODUCT_FOR_REPAIR'] === '0' ? '' : '(' + dataItem.SUFFIX_FOR_PART_NUMBER + ')'
    //     )
    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['PRODUCT_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PC_NAME', dataItem['PC_NAME'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE', dataItem['IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE'])
    sql = sql.replaceAll('dataItem.FFT_PART_NUMBER', dataItem['FFT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.IS_PRODUCT_FOR_REPAIR', dataItem['IS_PRODUCT_FOR_REPAIR'])
    sql = sql.replaceAll('dataItem.SUFFIX_FOR_PART_NUMBER', dataItem['SUFFIX_FOR_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    // console.log('createProductTypeDetail', sql)
    return sql
  },
}
